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
import { useRunCodeMutation } from "@/redux/slices/api";
import { updateCodeValue, updateTheme } from "@/redux/slices/compilerSlice";
import { RootState } from "@/redux/store";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

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




export default function Compiler() {
  const currentLanguage = useSelector((state: RootState) => state.compilerSlice.currentLanguage);
  const code = useSelector((state: RootState) => state.compilerSlice.code[currentLanguage]);
  const editorTheme = useSelector((state: RootState) => state.compilerSlice.theme);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setErrorMessage] = useState('');
  const [runCode, { isLoading }] = useRunCodeMutation();
  const [executionTime, setExecutionTime] = useState(0);
  const [expendEditor, setExpendEditor] = useState(false);
  const [inputOpen, setInputOpen] = useState(false);
  const [outputOpen, setOutputOpen] = useState(false);
  const [autoCompletion, setAutoCompletion] = useState(true);
  const [runCodeStatus, setRunCodeStatus] = useState(false);
  const dispatch = useDispatch();
  const { theme, setTheme } = useTheme();




  // Run Code
  const handleRun = async () => {
    try {
      if (expendEditor) setExpendEditor(value => !value);
      setErrorMessage('');
      setOutput('Running...');
      let res = await runCode({ language: currentLanguage, code, input }).unwrap();
      if (res.success) {
        if (res.error) {
          setErrorMessage(res.message);
          setOutput('');
        }
        if (res.data) {
          let data = res.data;
          setOutput(data);
          setExecutionTime(res.time)
        }
      }
      else {
        setOutput('');
        alert(res.message)
      }
    } catch (err) {
      setOutput('');
      toast.error('Fetch Failed! Check your Connection!');
    }
    finally {
      setRunCodeStatus(false);
    }
  }

  useEffect(() => {
    if (runCodeStatus) {
      localStorage.setItem(`currentInput-${currentLanguage}`, input);
      handleRun();
    }
  }, [runCodeStatus])





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
      setExpendEditor((expendEditor) => !expendEditor);
    }
    if (e.key === 'b' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      setOutputOpen((outputOpen) => !outputOpen);
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
  }, [code]);




  // UI
  const handleFontChange = (value: string) => {
    dispatch(updateTheme(['fontSize', value]))
  }

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel className="h-[calc(100dvh-60px)] sm:min-w-[350px]" defaultSize={70}>
        <HelperHeader data={{ expendEditor, setExpendEditor, autoCompletion, setAutoCompletion }} />
        <ContextMenu>
          <ContextMenuTrigger>
            <CodeEditor autoCompletion={autoCompletion} />
          </ContextMenuTrigger>
          <ContextMenuContent className="w-64">
            <ContextMenuItem inset onClick={() => setRunCodeStatus(true)}>
              Run
              <ContextMenuShortcut>⌘⇧R</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem inset onClick={() => location.reload()}>
              Reload
              <ContextMenuShortcut>⌘R</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem inset onClick={formateCode}>
              Format Code
              <ContextMenuShortcut>Alt⇧F</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem inset onClick={() => setExpendEditor((value) => !value)}>
              {
                expendEditor
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
            {
              autoCompletion ?
                <ContextMenuCheckboxItem checked onClick={() => setAutoCompletion((val) => !val)}>
                  Auto Complition
                </ContextMenuCheckboxItem>
                :
                <ContextMenuCheckboxItem onClick={() => setAutoCompletion((val) => !val)}>
                  Auto Complition
                </ContextMenuCheckboxItem>

            }
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
      <ResizableHandle />
      {
        (['html', 'css', 'javascript'].includes(currentLanguage)) ?
          <ResizablePanel className={`h-[calc(100dvh-60px)] w-dvw sm:w-auto ${expendEditor ? 'hidden' : ''} min-w-[350px]`} defaultSize={30} >
            <RenderCode />
          </ResizablePanel>
          :
          <ResizablePanel className={` bg-gray-200 dark:bg-gray-800 w-dvw sm:w-auto ${expendEditor ? 'hidden' : ''} min-w-72`} defaultSize={30}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel className={inputOpen ? 'hidden' : ''} defaultSize={50}>
                <Input controlls={{ outputOpen, setOutputOpen }} setRunCodeStatus={setRunCodeStatus} isLoading={isLoading} setInput={setInput} />
              </ResizablePanel>
              <ResizableHandle />
              <ResizablePanel className={outputOpen ? 'hidden' : ''} defaultSize={50}>
                <Output controlls={{ inputOpen, setInputOpen }} error={error} executionTime={executionTime} output={output} setOutput={setOutput} />
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
      }
    </ResizablePanelGroup>
  );
}
