import React, { useEffect, useRef } from "react";
import { Button } from "./ui/button";
import {
    ChevronDown, 
    ChevronRight,
    ChevronUp,
    Loader2,
    Play, Trash2
} from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "./ui/tooltip";




const Input = ({ controlls, setRunCodeStatus, isLoading, setInput }: {
    controlls: {
        setExpendEditor: React.Dispatch<React.SetStateAction<boolean>>,
        outputOpen: boolean,
        setOutputOpen: React.Dispatch<React.SetStateAction<boolean>>
    },
    setRunCodeStatus: React.Dispatch<React.SetStateAction<boolean>>,
    isLoading: boolean,
    setInput: React.Dispatch<React.SetStateAction<string>>
}) => {
    const inputRef = useRef(null);
    const currentLanguage = useSelector((state: RootState) => state.compilerSlice.currentLanguage);
    useEffect(() => {
        let data = localStorage.getItem(`currentInput-${currentLanguage}`);
        if (data) {
            if (inputRef.current) (inputRef.current as HTMLTextAreaElement).value = data;
            setInput(data);
        }
    }, [])
    const clearInput = () => {
        if (inputRef.current) {
            (inputRef.current as HTMLTextAreaElement).value = '';
            setInput('');
            localStorage.removeItem(`currentInput-${currentLanguage}`);
        }
    }

    return (
        <div className="relative w-full h-full">
            <p className=" border-b-2 border-l-2 border-gray-500 flex items-center justify-center sticky top-0 w-full text-xl text-center h-[50px]">
                <Button className="absolute left-2 sm:hidden" variant="secondary" onClick={() => controlls.setExpendEditor(value => !value)} size="icon"><ChevronRight /></Button>
                Input
            </p>
            <textarea spellCheck="false" ref={inputRef} onKeyUp={(e) => setInput((e.target as HTMLTextAreaElement).value)}
                style={{ outline: 'none', border: 'none' }}
                className="resize-none p-2 bg-transparent scroll-0 overflow-auto max-h-[calc(100%-100px)] w-full h-full">
            </textarea>
            <div className="border-t-2 pl-2 border-gray-500 pr-4 pb-[5px] h-[50px] w-full flex justify-between items-center gap-2">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button size="icon" onClick={() => { controlls.setOutputOpen(!controlls.outputOpen) }} variant="secondary">{
                                controlls.outputOpen ?
                                    <ChevronUp /> :
                                    <ChevronDown />
                            }
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent className=" bg-gray-50 text-gray-800 dark:bg-gray-600 dark:text-white">
                            {controlls.outputOpen ?
                                <p>Open Output</p>
                                :
                                <p>Expend Input</p>
                            }
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <div className="w-max flex gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button onClick={clearInput} size="icon" variant={"destructive"}><Trash2 size={18} /></Button>
                            </TooltipTrigger>
                            <TooltipContent className=" bg-gray-50 text-gray-800 dark:bg-gray-600 dark:text-white">
                                <p>Clear Input</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon" onClick={() => setRunCodeStatus(true)} disabled={isLoading} variant={"success"}>
                                    {isLoading ? <Loader2 className="animate-spin" /> : <Play size={18} />}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className=" bg-gray-50 text-gray-800 dark:bg-gray-600 dark:text-white">
                                <p>Run Input</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                </div>
            </div>
        </div >
    )
}
export default Input;