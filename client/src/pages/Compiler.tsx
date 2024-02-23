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
import { updateCodeValue } from "@/redux/slices/compilerSlice";
import { RootState } from "@/redux/store";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

export default function Compiler() {
  const currentLanguage = useSelector((state: RootState) => state.compilerSlice.currentLanguage);
  const code = useSelector((state: RootState) => state.compilerSlice.code[currentLanguage]);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setErrorMessage] = useState('');
  const [runCode, { isLoading }] = useRunCodeMutation();
  const [executionTime, setExecutionTime] = useState(0);
  const [expendEditor, setExpendEditor] = useState(false);
  const [inputOpen, setInputOpen] = useState(false);
  const [outputOpen, setOutputOpen] = useState(false);
  const [autoCompletion, setAutoCompletion] = useState(true);
  const dispatch = useDispatch();
  const handleRun = async () => {
    try {
      setErrorMessage('');
      setOutput('Running...');
      let res = await runCode({ language: currentLanguage, code, input }).unwrap();
      if (res.success) {
        if (res.error) {
          setErrorMessage(res.message);
        }
        let data = res.data;
        setOutput(data);
        setExecutionTime(res.time)
      }
      else {
        setOutput('');
        alert(res.message)
      }
    } catch (err) {
      setOutput('');
      toast.error('Fetch Failed! Check your Connection!');
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'b' && e.ctrlKey) {
        setExpendEditor((expendEditor) => !expendEditor);
      }
      if (e.key === 'F' && e.shiftKey && e.altKey) {
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
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [code]);


  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel className="h-[calc(100dvh-60px)] min-w-[350px]" defaultSize={70}>
        <HelperHeader data={{ expendEditor, setExpendEditor, autoCompletion, setAutoCompletion }} />
        <CodeEditor autoCompletion={autoCompletion} />
      </ResizablePanel>
      <ResizableHandle />
      {
        (['html', 'css', 'javascript'].includes(currentLanguage)) ?
          <ResizablePanel className={`h-[calc(100dvh-60px)] ${expendEditor ? 'hidden' : ''} min-w-[350px]`} defaultSize={30} >
            <RenderCode />
          </ResizablePanel>
          :
          <ResizablePanel className={` bg-gray-200 dark:bg-gray-800 ${expendEditor ? 'hidden' : ''} min-w-72`} defaultSize={30}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel className={inputOpen ? 'hidden' : ''} defaultSize={50}>
                <Input controlls={{ outputOpen, setOutputOpen }} handleRun={handleRun} input={input} isLoading={isLoading} setInput={setInput} />
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
