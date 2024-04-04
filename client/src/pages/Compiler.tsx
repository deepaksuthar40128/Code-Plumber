import CodeEditor from "@/components/CodeEditor";
import HelperHeader from "@/components/HelperHeader";
import Input from "@/components/Input";
import Output from "@/components/Output";
import RenderCode from "@/components/RenderCode";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import formatCppCode from "@/languages/cpp/cppFormater";
import { useCompileCodeMutation, useRunCodeMutation } from "@/redux/slices/api";
import { updateCodeValue, updateTheme } from "@/redux/slices/compilerSlice";
import { RootState } from "@/redux/store";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { io } from 'socket.io-client';

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Theme, useTheme } from "@/components/theme-provider";
import { updateEditorConfig } from "@/redux/slices/editorConfigSlice";
import Terminal from "@/components/terminal";


export interface terminalOutput {
  type: "error" | "success" | "warn" | "normal",
  message: string
  format: "Input" | "Output"
}

const URL = 'http://localhost:4320'
export const socket = io(URL, {
  autoConnect: false
});



export default function Compiler() {
  const currentLanguage = useSelector((state: RootState) => state.compilerSlice.currentLanguage);
  const code = useSelector((state: RootState) => state.compilerSlice.code[currentLanguage]);
  const editorConfig = useSelector((state: RootState) => state.editorSlice)
  const editorTheme = useSelector((state: RootState) => state.compilerSlice.theme);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [terminalOutput, setTerminalOutput] = useState<terminalOutput>();
  const [error, setErrorMessage] = useState('');
  const [runCode, { isLoading }] = useRunCodeMutation();
  const [compileCode, loader] = useCompileCodeMutation();
  const isCompileLoading = loader.isLoading;
  const [executionTime, setExecutionTime] = useState(0);
  const [runCodeStatus, setRunCodeStatus] = useState(false);
  const dispatch = useDispatch();
  const { theme, setTheme } = useTheme();
  const [compiledFilePath, setCompiledFilePath] = useState<string>('');


  // UI
  const handleFontChange = (value: string) => {
    dispatch(updateTheme(['fontSize', value]))
  }
  const handleAutoComplete = (value: boolean) => {
    dispatch(updateEditorConfig({ type: 'autoComplete', value }));
  }
  const handleTerminalChange = (value: boolean) => {
    dispatch(updateEditorConfig({ type: 'terminal', value }));
  }
  const handleExpendEditor = (value: boolean) => {
    dispatch(updateEditorConfig({ type: 'style', value: { type: 'expendEditor', value } }));
  }
  const handleOutputOpen = (value: boolean) => {
    dispatch(updateEditorConfig({ type: 'style', value: { type: 'outputOpen', value } }));
  }



  // Run Code
  const handleRun = async () => {
    try {
      if (editorConfig.style.expendEditor) handleExpendEditor(false);
      if (editorConfig.style.outputOpen) handleOutputOpen(false);
      setErrorMessage('');
      setOutput('Running...');
      let res = await runCode({ language: currentLanguage, code, input }).unwrap();
      setOutput('');
      if (res.success) {
        if (res.error) {
          setErrorMessage(res.message);
        }
        if (res.data) {
          setOutput(res.data);
        }
        setExecutionTime(res.time)
      }
      else {
        toast.error(res.message);
      }
    } catch (err) {
      setOutput('');
      toast.error('Fetch Failed! Check your Connection!');
    }
    finally {
      setRunCodeStatus(false);
    }
  }

  const handleCompile = async () => {
    try {
      if (editorConfig.style.expendEditor) handleExpendEditor(false);
      socket.disconnect();
      setTerminalOutput({
        type: 'normal',
        message: `Running Main.${currentLanguage}...`,
        format: "Input"
      });
      let res = await compileCode({ language: currentLanguage, code }).unwrap();
      if (res.success) {
        if (res.error) {
          setTerminalOutput({
            type: 'error',
            message: res.message,
            format: "Output"
          });
          return;
        }
        setCompiledFilePath(res.file)
        setTerminalOutput({
          type: 'success',
          message: `compilation complete\n Attaching Terminal in progress...`,
          format: "Output"
        });
        setTimeout(() => {
          socket.connect();
        }, 2000);
        //handleTerminal
      }
      else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error('Fetch Failed! Check your Connection!');
    }
    finally {
      setRunCodeStatus(false);
    }
  }

  const selectRunner = () => {
    if (editorConfig.terminal) {
      handleCompile();
    } else {
      localStorage.setItem(`currentInput-${currentLanguage}`, input);
      handleRun();
    }
  }

  useEffect(() => {
    if (runCodeStatus) {
      selectRunner();
    }
  }, [runCodeStatus])


  //socket
  useEffect(() => {
    const handleConnect = () => {
      setTerminalOutput({
        type: 'success',
        message: 'Terminal Attached!',
        format: "Output"
      });
      socket.emit("initiate", JSON.stringify({ file: compiledFilePath }))
    }
    socket.on('connect', handleConnect); 
    return () => {
      socket.off('connect', handleConnect) 
    }
  }, [compiledFilePath])




  // Format Code
  const formateCode = () => {
    if (['cpp', 'c', 'javascript', 'java'].includes(currentLanguage)) {
      let formattedCode = formatCppCode(code);
      if (code != formattedCode) {
        dispatch(updateCodeValue(formattedCode));
        localStorage.setItem(`currentCode-${currentLanguage}`, formattedCode);
      }
    } else {
      toast.error(`No Formatter currently avalible for ${currentLanguage} Language.`);
    }
  }


  //Keyboard Listeners
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'j' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleExpendEditor(!(editorConfig.style.expendEditor));
    }
    if (e.key === 'b' && (e.ctrlKey || e.metaKey) && !editorConfig.style.inputOpen) {
      e.preventDefault();
      handleOutputOpen(!(editorConfig.style.outputOpen))
    }
    if (e.key === 'F' && e.shiftKey && e.altKey) {
      e.preventDefault();
      formateCode();
    }
    if (e.key === 'R' && e.shiftKey && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      setRunCodeStatus(true);
    }
  };
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [code, editorConfig.style.outputOpen, editorConfig.style.expendEditor, !editorConfig.style.inputOpen]);



  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel className="h-[calc(100dvh-60px)] sm:min-w-[350px]" defaultSize={70}>
        <HelperHeader />
        <ContextMenu>
          <ContextMenuTrigger>
            <CodeEditor autoCompletion={editorConfig.autoComplete} />
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
            <ContextMenuItem inset onClick={() => handleExpendEditor(!editorConfig.style.expendEditor)}>
              {
                editorConfig.style.expendEditor
                  ?
                  'Collaps Editor'
                  :
                  'Expend Editor'
              }
              <ContextMenuShortcut>⌘J</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuSub>
              <ContextMenuSubTrigger inset>Font Size</ContextMenuSubTrigger>
              <ContextMenuSubContent className="w-48">
                <ContextMenuRadioGroup onValueChange={(value) => handleFontChange(value)} value={editorTheme.fontSize}>
                  <ContextMenuLabel inset>Avalible Font Size</ContextMenuLabel>
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
            <ContextMenuCheckboxItem checked={editorConfig.autoComplete} onCheckedChange={handleAutoComplete}>
              Auto Complition
            </ContextMenuCheckboxItem>
            <ContextMenuCheckboxItem checked={editorConfig.terminal} onCheckedChange={handleTerminalChange}>
              Terminal
            </ContextMenuCheckboxItem>
            <ContextMenuSeparator />
            <ContextMenuRadioGroup onValueChange={(value) => setTheme(value as Theme)} value={theme}>
              <ContextMenuLabel inset>Popular Themes</ContextMenuLabel>
              {
                ['Tomorrow-Night-Blue', 'Dark', 'Light', 'Kimbie Red'].includes(theme) ? '' :
                  <ContextMenuRadioItem value={theme}>
                    {theme.replace('-', ' ')}
                  </ContextMenuRadioItem>
              }
              <ContextMenuRadioItem value="Tomorrow-Night-Blue">
                Tomorrow Night Blue
              </ContextMenuRadioItem>
              <ContextMenuRadioItem value="Dark">
                Dark
              </ContextMenuRadioItem>
              <ContextMenuRadioItem value="Light">
                Light
              </ContextMenuRadioItem>
              <ContextMenuRadioItem value="Kimbie Red">
                Kimbie Red
              </ContextMenuRadioItem>
            </ContextMenuRadioGroup>
          </ContextMenuContent>
        </ContextMenu>
      </ResizablePanel>
      <ResizableHandle className="w-1 brightness-105 z-50" withHandle={!editorConfig.style.expendEditor} />
      {
        (['html', 'css', 'javascript'].includes(currentLanguage)) ?
          <ResizablePanel className={`h-[calc(100dvh-60px)] ${editorConfig.style.expendEditor ? 'hidden' : ''} min-w-[350px]`} defaultSize={30} >
            <RenderCode />
          </ResizablePanel>
          :
          editorConfig.terminal ?
            <ResizablePanel className={` bg-gray-200 dark:bg-gray-800 h-[calc(100dvh-60px)] ${editorConfig.style.expendEditor ? 'hidden' : ''} min-w-[350px]`} defaultSize={30} >
              <Terminal setRunCodeStatus={setRunCodeStatus} output={terminalOutput} isLoading={isCompileLoading} />
            </ResizablePanel>
            :
            <ResizablePanel className={` bg-gray-200 dark:bg-gray-800 ${editorConfig.style.expendEditor ? 'hidden' : ''} min-w-72`} defaultSize={30}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel className={`min-h-40 ${editorConfig.style.inputOpen ? 'hidden' : ''}`} defaultSize={50}>
                  <Input setRunCodeStatus={setRunCodeStatus} isLoading={isLoading} setInput={setInput} />
                </ResizablePanel>
                <ResizableHandle className="w-1" withHandle />
                <ResizablePanel className={`min-h-40 ${editorConfig.style.outputOpen ? 'hidden' : ''}`} defaultSize={50}>
                  <Output error={error} executionTime={executionTime} output={output} setOutput={setOutput} />
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
      }
    </ResizablePanelGroup>
  );
}
