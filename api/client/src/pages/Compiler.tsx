import React, { Suspense, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { io } from "socket.io-client";
import { updateCodeValue, updateTheme } from "@/redux/slices/compilerSlice";
import { updateEditorConfig } from "@/redux/slices/editorConfigSlice";
import { RootState } from "@/redux/store";
import { useCompileCodeMutation, useRunCodeMutation } from "@/redux/slices/api";
import { Theme, useTheme } from "@/components/theme-provider";

// Lazily loaded components
const CodeEditor = React.lazy(() => import("@/components/CodeEditor"));
const HelperHeader = React.lazy(() => import("@/components/HelperHeader"));
const Input = React.lazy(() => import("@/components/Input"));
const Output = React.lazy(() => import("@/components/Output"));
const RenderCode = React.lazy(() => import("@/components/RenderCode"));
const Terminal = React.lazy(() => import("@/components/terminal"));

const ResizableHandle = React.lazy(() =>
  import("@/components/ui/resizable").then((module) => ({
    default: module.ResizableHandle,
  }))
);
const ResizablePanel = React.lazy(() =>
  import("@/components/ui/resizable").then((module) => ({
    default: module.ResizablePanel,
  }))
);
const ResizablePanelGroup = React.lazy(() =>
  import("@/components/ui/resizable").then((module) => ({
    default: module.ResizablePanelGroup,
  }))
);

import formatCppCode from "@/languages/cpp/cppFormater";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  ContextMenuShortcut,
  ContextMenuSubContent,
  ContextMenuSeparator,
  ContextMenuRadioItem,
  ContextMenuCheckboxItem,
} from "@/components/ui/context-menu";
import Loader from "@/components/Loader/Loader";
import ErrorBoundary from "@/components/Error/Boundary";
import { Route, Routes } from "react-router-dom";
const FetchCode = React.lazy(() => import("@/components/FetchCode"));

export const socket = io("/", { autoConnect: false });

export interface terminalOutput {
  type: "error" | "success" | "warn" | "normal";
  message: string;
  format: "Input" | "Output";
}

export default function Compiler() {
  const currentLanguage = useSelector(
    (state: RootState) => state.compilerSlice.currentLanguage
  );
  const code = useSelector(
    (state: RootState) => state.compilerSlice.code[currentLanguage]
  );
  const editorConfig = useSelector((state: RootState) => state.editorSlice);
  const editorTheme = useSelector(
    (state: RootState) => state.compilerSlice.theme
  );
  const currentSession = useSelector(
    (state: RootState) => state.compilerSlice.session
  );
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [terminalOutput, setTerminalOutput] = useState<terminalOutput>();
  const [error, setErrorMessage] = useState("");
  const [runCode, { isLoading }] = useRunCodeMutation();
  const [compileCode, loader] = useCompileCodeMutation();
  const isCompileLoading = loader.isLoading;
  const [executionTime, setExecutionTime] = useState(0);
  const [runCodeStatus, setRunCodeStatus] = useState(false);
  const dispatch = useDispatch();
  const { theme, setTheme } = useTheme();
  const [compiledFilePath, setCompiledFilePath] = useState<string>("");

  const handleFontChange = (value: string) => {
    dispatch(updateTheme(["fontSize", value]));
  };
  const handleAutoComplete = (value: boolean) => {
    dispatch(
      updateEditorConfig({
        type: "autoComplete",
        session: currentSession,
        value,
      })
    );
  };
  const handleTerminalChange = (value: boolean) => {
    dispatch(
      updateEditorConfig({ type: "terminal", session: currentSession, value })
    );
  };
  const handleExpendEditor = (value: boolean) => {
    dispatch(
      updateEditorConfig({
        type: "style",
        session: currentSession,
        value: { type: "expendEditor", value },
      })
    );
  };
  const handleOutputOpen = (value: boolean) => {
    dispatch(
      updateEditorConfig({
        type: "style",
        session: currentSession,
        value: { type: "outputOpen", value },
      })
    );
  };

  //Handle Run code
  const handleRun = async () => {
    try {
      if (editorConfig.style.expendEditor) handleExpendEditor(false);
      if (editorConfig.style.outputOpen) handleOutputOpen(false);
      setErrorMessage("");
      setOutput("Running...");
      let res = await runCode({
        language: currentLanguage,
        code,
        input,
      }).unwrap();
      setOutput("");
      if (res.success) {
        if (res.error) {
          setErrorMessage(res.message);
        }
        if (res.data) {
          setOutput(res.data);
        }
        setExecutionTime(res.time);
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      setOutput("");
      toast.error("Fetch Failed! Check your Connection!");
    } finally {
      setRunCodeStatus(false);
    }
  };

  //handle compilation for live terminal run
  const handleCompile = async () => {
    try {
      if (editorConfig.style.expendEditor) handleExpendEditor(false);
      socket.disconnect();
      setTerminalOutput({
        type: "normal",
        message: `Running Main.${currentLanguage}...`,
        format: "Input",
      });
      let res = await compileCode({ language: currentLanguage, code }).unwrap();
      if (res.success) {
        if (res.error) {
          setTerminalOutput({
            type: "error",
            message: res.message,
            format: "Output",
          });
          return;
        }
        setCompiledFilePath(res.file);
        setTerminalOutput({
          type: "success",
          message: `Compilation complete\n Attaching Terminal in progress...`,
          format: "Output",
        });
        setTimeout(() => {
          socket.connect();
        }, 2000);
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Fetch Failed! Check your Connection!");
    } finally {
      setRunCodeStatus(false);
    }
  };

  const selectRunner = () => {
    if (editorConfig.terminal) {
      handleCompile();
    } else {
      localStorage.setItem(
        `currentInput-${currentLanguage}-${currentSession}`,
        input
      );
      handleRun();
    }
  };

  useEffect(() => {
    if (runCodeStatus) {
      selectRunner();
    }
  }, [runCodeStatus]);

  useEffect(() => {
    const handleConnect = () => {
      setTerminalOutput({
        type: "success",
        message: "Terminal Attached!",
        format: "Output",
      });
      socket.emit("initiate", JSON.stringify({ file: compiledFilePath }));
    };
    socket.on("connect", handleConnect);
    return () => {
      socket.off("connect", handleConnect);
    };
  }, [compiledFilePath]);

  const formateCode = () =>{ 
    if (["cpp", "c", "javascript", "java"].includes(currentLanguage)) {
      let formattedCode = formatCppCode(code);
      if (code !== formattedCode) {
        dispatch(updateCodeValue(formattedCode));
        localStorage.setItem(
          `currentCode-${currentLanguage}-${currentSession}`,
          formattedCode
        );
      }
    } else {
      toast.error(
        `No Formatter currently available for ${currentLanguage} Language.`
      );
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "j" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleExpendEditor(!editorConfig.style.expendEditor);
    }
    if (
      e.key === "b" &&
      (e.ctrlKey || e.metaKey) &&
      !editorConfig.style.inputOpen
    ) {
      e.preventDefault();
      handleOutputOpen(!editorConfig.style.outputOpen);
    }
    if (e.key === "F" && e.shiftKey && e.altKey) {
      e.preventDefault();
      formateCode();
    }
    if (e.key === "R" && e.shiftKey && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      setRunCodeStatus(true);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    socket.disconnect();
    if (editorConfig.terminal) {
      toast.warning(
        "Please don't use the terminal if you are not dealing with interactive problems. This will save your and our resources. Thank you. Team Code-Plumber"
      );
    }
  }, [editorConfig.terminal]);

  return (
    <>
      <ErrorBoundary>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/receive" element={<FetchCode />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          className="h-[calc(100dvh-60px)] sm:min-w-[350px]"
          defaultSize={70}
        >
          <Suspense fallback={<Loader />}>
            <ErrorBoundary>
              <HelperHeader />
            </ErrorBoundary>
          </Suspense>
          <ContextMenu>
            <ContextMenuTrigger>
              <Suspense fallback={<Loader />}>
                <ErrorBoundary>
                  <CodeEditor autoCompletion={editorConfig.autoComplete} />
                </ErrorBoundary>
              </Suspense>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-64">
              <ContextMenuItem inset onClick={() => setRunCodeStatus(true)}>
                Run
                <ContextMenuShortcut>⌘⇧R</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem inset onClick={formateCode}>
                Format Code
                <ContextMenuShortcut>Alt⇧F</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem
                inset
                onClick={() =>
                  handleExpendEditor(!editorConfig.style.expendEditor)
                }
              >
                {editorConfig.style.expendEditor
                  ? "Collapse Editor"
                  : "Expand Editor"}
                <ContextMenuShortcut>⌘J</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuSub>
                <ContextMenuSubTrigger inset>Font Size</ContextMenuSubTrigger>
                <ContextMenuSubContent className="w-48">
                  <ContextMenuRadioGroup
                    onValueChange={(value) => handleFontChange(value)}
                    value={editorTheme.fontSize}
                  >
                    <ContextMenuLabel inset>
                      Available Font Sizes
                    </ContextMenuLabel>
                    <ContextMenuSeparator />
                    <ContextMenuRadioItem value="xs" className="text-xs">
                      Small
                    </ContextMenuRadioItem>
                    <ContextMenuRadioItem value="sm" className="text-sm">
                      Normal
                    </ContextMenuRadioItem>
                    <ContextMenuRadioItem value="xl" className="text-xl">
                      Large
                    </ContextMenuRadioItem>
                    <ContextMenuRadioItem value="2xl" className="text-2xl">
                      Extra Large
                    </ContextMenuRadioItem>
                  </ContextMenuRadioGroup>
                </ContextMenuSubContent>
              </ContextMenuSub>
              <ContextMenuSeparator />
              <ContextMenuCheckboxItem
                checked={editorConfig.autoComplete}
                onCheckedChange={handleAutoComplete}
              >
                Auto Completion
              </ContextMenuCheckboxItem>
              <ContextMenuCheckboxItem
                checked={editorConfig.terminal}
                onCheckedChange={handleTerminalChange}
              >
                Terminal
              </ContextMenuCheckboxItem>
              <ContextMenuSeparator />
              <ContextMenuRadioGroup
                onValueChange={(value) => setTheme(value as Theme)}
                value={theme}
              >
                <ContextMenuLabel inset>Popular Themes</ContextMenuLabel>
                {![
                  "Tomorrow-Night-Blue",
                  "Dark",
                  "Light",
                  "Kimbie Red",
                ].includes(theme) && (
                  <ContextMenuRadioItem value={theme}>
                    {theme.replace("-", " ")}
                  </ContextMenuRadioItem>
                )}
                <ContextMenuRadioItem value="Tomorrow-Night-Blue">
                  Tomorrow Night Blue
                </ContextMenuRadioItem>
                <ContextMenuRadioItem value="Dark">Dark</ContextMenuRadioItem>
                <ContextMenuRadioItem value="Light">Light</ContextMenuRadioItem>
                <ContextMenuRadioItem value="Kimbie Red">
                  Kimbie Red
                </ContextMenuRadioItem>
              </ContextMenuRadioGroup>
            </ContextMenuContent>
          </ContextMenu>
        </ResizablePanel>
        <ResizableHandle
          className="w-1 brightness-105 z-10"
          withHandle={!editorConfig.style.expendEditor}
        />
        {["html", "css", "javascript"].includes(currentLanguage) ? (
          <ResizablePanel
            className={`h-[calc(100dvh-60px)] ${
              editorConfig.style.expendEditor ? "hidden" : ""
            } min-w-[350px]`}
            defaultSize={30}
          >
            <Suspense fallback={<Loader />}>
              <ErrorBoundary>
                <RenderCode />
              </ErrorBoundary>
            </Suspense>
          </ResizablePanel>
        ) : editorConfig.terminal ? (
          <ResizablePanel
            className={` bg-gray-200 dark:bg-gray-800 h-[calc(100dvh-60px)] ${
              editorConfig.style.expendEditor ? "hidden" : ""
            } min-w-[350px]`}
            defaultSize={30}
          >
            <Suspense fallback={<Loader />}>
              <ErrorBoundary>
                <Terminal
                  setRunCodeStatus={setRunCodeStatus}
                  output={terminalOutput}
                  isLoading={isCompileLoading}
                />
              </ErrorBoundary>
            </Suspense>
          </ResizablePanel>
        ) : (
          <ResizablePanel
            className={` bg-gray-200 dark:bg-gray-800 ${
              editorConfig.style.expendEditor ? "hidden" : ""
            } min-w-72`}
            defaultSize={30}
          >
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel
                className={`min-h-40 ${
                  editorConfig.style.inputOpen ? "hidden" : ""
                }`}
                defaultSize={50}
              >
                <Suspense fallback={<Loader />}>
                  <ErrorBoundary>
                    <Input
                      setRunCodeStatus={setRunCodeStatus}
                      isLoading={isLoading}
                      setInput={setInput}
                    />
                  </ErrorBoundary>
                </Suspense>
              </ResizablePanel>
              <ResizableHandle className="w-1" withHandle />
              <ResizablePanel
                className={`min-h-40 ${
                  editorConfig.style.outputOpen ? "hidden" : ""
                }`}
                defaultSize={50}
              >
                <ErrorBoundary>
                  <Output
                    error={error}
                    executionTime={executionTime}
                    output={output}
                    setOutput={setOutput}
                  />
                </ErrorBoundary>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        )}
      </ResizablePanelGroup>
    </>
  );
}
