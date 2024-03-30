import React, { useRef, useState } from "react";
import { Button } from "./ui/button";
import {
    Loader2,
    Play, Trash2
} from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "./ui/tooltip";

type colors = "red" | "yellow" | "ice" | "green" | "normal";
type TerminalType = {
    type: "Intput" | "Output",
    head: String,
    headColor: colors,
    body: String,
    bodyColor: colors,
};


const Terminal = ({ setRunCodeStatus, isLoading }: {
    setRunCodeStatus: React.Dispatch<React.SetStateAction<boolean>>,
    isLoading: boolean
}) => {
    const cursurRef = useRef<HTMLElement>(null);
    const inputRef = useRef<HTMLSpanElement>(null);
    const baseTerminal: TerminalType = {
        head: 'Welcome Principle!!',
        headColor: 'green',
        type: 'Output',
        body: '',
        bodyColor: 'normal'
    }
    const [terminalData, setTerminalData] = useState<TerminalType[]>([baseTerminal]);

    const clearInput = () => {
        setTerminalData([baseTerminal]);
    }
    const [offInput, setOffInput] = useState<boolean>(false);

    const handleInputFocus = () => {
        if (cursurRef.current && !offInput) cursurRef.current.classList.add('animate-blink');
    }
    const handleInputBlur = () => {
        if (cursurRef.current) cursurRef.current.classList.remove('animate-blink');
    }
    const handleInputClick = () => {
        if (inputRef.current) inputRef.current.focus();
    }
    const handleKeyEvent = (e: React.KeyboardEvent<HTMLElement>) => {
        let element = e.target as HTMLElement;
        setCaretPosition(element);
        if (e.key == 'Enter') {
            e.preventDefault();
            let cmd = inputRef.current?.innerHTML;
            if (cmd)
                processCmd(cmd);
            (inputRef.current as HTMLElement).innerHTML = '';
        }
    }

    return (
        <div className="relative w-full h-full">
            <p className=" border-b-2 border-l-2 border-gray-500 flex items-center justify-center sticky top-0 w-full text-xl text-center h-[50px]">
                Terminal
            </p>
            <div className="overflow-auto">
                <div className="">
                    {
                        terminalData.map(val => {
                            return createLine(val);
                        })
                    }
                    <p className="whitespace-normal text-left"></p>
                </div>
                <p className="whitespace-normal select-none w-full text-left" onClick={handleInputClick}>
                    {'>'} <span className="outline-none caret-transparent" ref={inputRef} onKeyDown={handleKeyEvent} spellCheck={false} contentEditable={!offInput} onFocus={handleInputFocus} onBlur={handleInputBlur}></span>
                    <span className={offInput ? 'cursor-not-allowed' : 'cursor-default'} ref={cursurRef}>__</span>
                </p>
            </div>
            <div className="border-t-2 pl-2 border-gray-500 pr-4 pb-[5px] h-[50px] w-full flex justify-end items-center gap-2 absolute bottom-0">
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

    function processCmd(cmd: string) {
        let line: TerminalType = {
            type: "Intput",
            head: "",
            body: cmd,
            headColor: 'normal',
            bodyColor: 'normal'
        }
        setTerminalData((value) => [...value, line]);
    }
}
export default Terminal;

const terminalColorResolver = (color: colors, ...args: string[]): string => {
    let chooseColor = (color: colors) => {
        switch (color) {
            case 'red':
                return { light: 'text-red-500', dark: 'text-red-500' }
            case 'green':
                return { light: 'text-green-500', dark: 'text-green-500' }
            case 'ice':
                return { light: 'text-blue-400', dark: 'text-blue-400' }
            case 'yellow':
                return { light: 'text-yellow-500', dark: 'text-yellow-300' }
            case 'normal':
                return { light: 'text-black-500', dark: 'text-white' }
            default:
                return { light: 'text-black-500', dark: 'text-white' }
        }
    }
    let rval = `${chooseColor(color).light} dark:${chooseColor(color).dark}`;
    args.forEach(arg => rval += ` ${arg}`);
    return rval;
}

function createLine(val: TerminalType): JSX.Element {
    return (
        <p>
            <span className="mr-2 text-gray-500">{val.type === 'Intput' ? '<<' : '>>'}</span>
            <span className={terminalColorResolver(val.headColor)}>{val.head}</span>
            <span className={terminalColorResolver(val.bodyColor)}>{val.body}</span>
        </p>
    )
}


function setCaretPosition(element: HTMLElement) {
    try {

        if (element && typeof window.getSelection !== "undefined") {
            const selection = window.getSelection();
            const range = document.createRange();
            let contentLength = element.innerHTML.length;
            range.setStart(element.childNodes[0], contentLength);
            range.collapse(true);
            if (selection) {
                selection.removeAllRanges();
                selection.addRange(range);
            }
        }
    } catch (err) {
        console.log("Kuch nhi huaa");
    }
}
