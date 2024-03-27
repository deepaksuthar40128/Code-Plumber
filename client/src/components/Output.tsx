import {
    ChevronDown,
    ChevronUp,
    Trash2
} from "lucide-react";
import { Button } from "./ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "./ui/tooltip";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { updateEditorConfig } from "@/redux/slices/editorConfigSlice";



const Output = ({ error, executionTime, output, setOutput }:
    {
        error: string,
        executionTime: number,
        output: string,
        setOutput: React.Dispatch<React.SetStateAction<string>>
    }) => {
    const formatedOutput = formatOutput(output);
    const dispatch = useDispatch();
    const editorConfig = useSelector((state: RootState) => state.editorSlice)

    return (
        <div className="relative w-full h-full">
            <p className="border-y-2 border-gray-500 flex items-center justify-center top-0 w-full text-xl text-center h-[50px]">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button size="icon" variant="secondary" onClick={() => { dispatch(updateEditorConfig({ type: 'style', value: { type: 'inputOpen', value: !editorConfig.style.inputOpen } })) }} className="absolute left-2">
                                {
                                    editorConfig.style.inputOpen ?
                                        <ChevronDown />
                                        :
                                        <ChevronUp />
                                }
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent className=" bg-gray-50 text-gray-800 dark:bg-gray-600 dark:text-white">
                            {editorConfig.style.inputOpen ?
                                <p>Open Input</p>
                                :
                                <p>Expend Output</p>
                            }
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <span>Output</span>
            </p>
            <div style={{ outline: 'none', border: 'none' }} className="whitespace-pre-wrap p-2 overflow-auto max-h-[calc(100%-100px)] w-full h-full">
                {error.length ? <p className="text-red-500">{error}</p> : ''}
                {
                    formatedOutput.map((val, ind) => {
                        if (ind == 0) {
                            return <p>{val}</p>
                        }
                        else return <p className="text-red-500">{val}</p>
                    })
                }
            </div>
            <div className="relative border-t-2 border-gray-500 pr-4 h-[50px] w-full flex justify-end items-center">
                <p className="absolute pl-4 left-0">Execution Time: {executionTime} ms</p>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button onClick={() => setOutput('')} variant={"destructive"} size="icon"><Trash2 size={18} /></Button>
                        </TooltipTrigger>
                        <TooltipContent className=" bg-gray-50 text-gray-800 dark:bg-gray-600 dark:text-white">
                            <p>Clear Output</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

            </div>
        </div>
    )
}
export default Output;


const formatOutput = (output: string): string[] => {
    let outputArr = output.split('STD-Error');
    return outputArr;
}