import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDispatch, useSelector } from "react-redux";
import {
  CompilerSliceStateType,
  updateCodeValue,
  updateCurrentLanguage,
  updateTheme,
} from "@/redux/slices/compilerSlice";
import { RootState } from "@/redux/store";
import { Button } from "./ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeftRight,
  ClipboardCheck,
  Copy, Download,
  Send, Settings,
  Trash2
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "./ui/popover";
import { Input } from "./ui/input";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "./ui/dropdown-menu";
import { ThemeMaper } from "./CodeEditor";
import { Theme, useTheme } from "./theme-provider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "./ui/tooltip";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { updateEditorConfig } from "@/redux/slices/editorConfigSlice";




export default function HelperHeader() {

  const [snipitName, setSnipitName] = useState('');
  const [snipitsList, setsnipitsList] = useState({});
  const [copied, setCopied] = useState(false);
  const dispatch = useDispatch();
  const currentLanguage = useSelector(
    (state: RootState) => state.compilerSlice.currentLanguage
  );
  let code = useSelector((state: RootState) => state.compilerSlice.code[currentLanguage]);
  const editorTheme = useSelector((state: RootState) => state.compilerSlice.theme);
  const editorConfig = useSelector((state: RootState) => state.editorSlice)
  const { theme, setTheme } = useTheme();





  const handleDownload = () => {
    let codeBlob = new Blob([code]);
    let url = URL.createObjectURL(codeBlob);
    let a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', `${currentLanguage}-Plumber${mapExtension(currentLanguage)}`);
    a.click()
  }

  const handleShare = () => {
    const shareData = {
      title: "Code Plumber",
      text: code
    };
    navigator.share(shareData);
  }

  let copyId: NodeJS.Timeout;
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    clearTimeout(copyId);
    copyId = setTimeout(() => {
      setCopied(false);
    }, 5000)
  }





  //Snipit
  const handleSnipitAdd = () => {
    let snipits = localStorage.getItem('snipits');
    let parsedSnipits: { [key: string]: string } = {};
    if (snipits) {
      parsedSnipits = JSON.parse(snipits);
    }
    parsedSnipits[snipitName || 'default'] = code;
    setsnipitsList(parsedSnipits);
    localStorage.setItem('snipits', JSON.stringify(parsedSnipits));
    toast.success("Snipit Added Successfully");
    setSnipitName('');
  }

  const removeSnipit = (snipit: string) => {
    let snipits = localStorage.getItem('snipits');
    if (snipits) {
      let parsedSnipits = JSON.parse(snipits);
      delete parsedSnipits[snipit];
      setsnipitsList(parsedSnipits);
      localStorage.setItem('snipits', JSON.stringify(parsedSnipits));
    }
  }

  const loadSnipitCode = React.useCallback((value: string) => {
    dispatch(updateCodeValue(value));
    localStorage.setItem(`currentCode-${currentLanguage}`, value);
  }, []);




  //UI Menu
  const changeFontSize = (value: string) => {
    dispatch(updateTheme(['fontSize', value]))
  }
  const changeTheme = (value: Theme) => {
    setTheme(value as Theme)
  }
  const handleExpendEditor = () => {
    dispatch(updateEditorConfig({ type: 'style', value: { type: 'expendEditor', value:!editorConfig.style.expendEditor } }));
  }
  const handleMachineChange = (value: string) => {
    dispatch(updateEditorConfig({ type: 'machine', value }));
    setTimeout(() => {
      location.reload();
    }, 1000);
  }


  //Load intial Configs
  useEffect(() => {
    let snipits = localStorage.getItem('snipits');
    if (snipits) {
      setsnipitsList(JSON.parse(snipits));
    }
  }, [])

  const handleAutoComplete = (value: boolean) => {
    dispatch(updateEditorConfig({ type: 'autoComplete', value }));
  }
  return (
    <div className="__helper_header h-[50px] bg-gray-200 dark:bg-gray-800 border-2 border-b-0 text-gray-800 dark:text-white p-2 flex justify-between items-center">
      <div className="__btn_container flex gap-1">
        <Popover>
          <PopoverTrigger>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    className="flex justify-center items-center gap-1"
                    variant="secondary"
                    size="icon"
                  ><Settings size={18} /></Button>
                </TooltipTrigger>
                <TooltipContent className=" bg-gray-50 text-gray-800 dark:bg-gray-600 dark:text-white">
                  <p>Settings</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </PopoverTrigger>
          <PopoverContent className="bg-gray-100 dark:bg-gray-900">
            <hr />
            <p className="text-gray-500 text text-xs w-max ml-4 -translate-y-[9px] backdrop-blur-xl">Settings</p>
            <div className="mb-4">
              <DropdownMenu>
                <p className="flex items-center justify-between cursor-pointer my-1"><span>Font Size </span>
                  <DropdownMenuTrigger asChild>
                    <span className="flex" ><ChevronRight size={15} className="inline" /></span>
                  </DropdownMenuTrigger>
                </p>
                <DropdownMenuContent className="w-56 bg-gray-100 dark:bg-gray-900">
                  <DropdownMenuLabel>Select Font Size</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup onValueChange={(value) => changeFontSize(value)} value={editorTheme.fontSize}>
                    <DropdownMenuRadioItem value="xs">Small</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="sm">Normal</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="xl">Large</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="2xl">Extra Large</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mb-4">
              <DropdownMenu>
                <p className="flex items-center justify-between cursor-pointer my-1">
                  <span>Themes <span className="text-gray-500 text-sm">({theme.split('-').join(' ')})</span></span>
                  <DropdownMenuTrigger asChild>
                    <span className="flex" ><ChevronRight size={15} className="inline" /></span>
                  </DropdownMenuTrigger>
                </p>
                <DropdownMenuContent className="w-56 bg-gray-100 dark:bg-gray-900">
                  <DropdownMenuLabel>Select Theme</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup onValueChange={(value) => changeTheme(value as Theme)} value={theme}>
                    {
                      Object.entries(ThemeMaper).map(theme => {
                        return (
                          <DropdownMenuRadioItem value={theme[0]}>{theme[0].split('-').join(' ')}</DropdownMenuRadioItem>
                        )
                      })
                    }
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mb-4">
              <DropdownMenu>
                <p className="flex items-center justify-between cursor-pointer my-1"><span>Machine </span>
                  <DropdownMenuTrigger asChild>
                    <span className="flex" ><ChevronRight size={15} className="inline" /></span>
                  </DropdownMenuTrigger>
                </p>
                <DropdownMenuContent className="w-56 bg-gray-100 dark:bg-gray-900">
                  <DropdownMenuLabel>Select Exec Machine</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={editorConfig.machine} onValueChange={handleMachineChange}>
                    <DropdownMenuRadioItem value="server">Server</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="local">Local Machine</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mb-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="autoSuggestion" className="font-normal">Auto Suggetions</Label>
                <Switch className={!editorConfig.autoComplete ? "dark:bg-gray-600" : ''} checked={editorConfig.autoComplete} onCheckedChange={handleAutoComplete} id="autoSuggestion" />
              </div>
            </div>
            <hr className="mt-8" />
            <p className="text-gray-500 text-xs w-max ml-4 -translate-y-[9px] backdrop-blur-xl">Custom Snipits</p>
            <div className="mb-8">
              <p className="mb-2 text-gray-400">Add Current Code as Snipit</p>
              <div className="flex w-full max-w-sm items-center space-x-2">
                <Input onChange={(e) => setSnipitName(e.target.value)} type="text" placeholder="Snipit Name" />
                <Button onClick={handleSnipitAdd} type="submit">ADD</Button>
              </div>
            </div>
            <hr />
            <p className="text-gray-500 text-xs w-max ml-4 -translate-y-[9px] backdrop-blur-xl">Snipits</p>
            <div>
              {Object.entries(snipitsList).length ?
                Object.entries(snipitsList).map((snipit, index) => {
                  return (
                    <p className="flex items-center justify-between cursor-pointer my-1" key={index}>
                      <span onClick={() => loadSnipitCode(snipit[1] as string)}>{snipit[0]} </span>
                      <span className="flex" onClick={() => { removeSnipit(snipit[0]) }}>
                        <Trash2 size={15} className="text-red-500 inline" />
                      </span>
                    </p>
                  )
                }) :
                <p className="text-gray-400 text-center justify-between cursor-pointer my-1"> No Snipits Found!</p>
              }
            </div>
          </PopoverContent>
        </Popover>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="flex justify-center items-center gap-1 dark:text-gray-800 text-white "
                variant="success"
                size="icon"
              ><Download onClick={handleDownload} size={18} /></Button>
            </TooltipTrigger>
            <TooltipContent className=" bg-gray-50 text-gray-800 dark:bg-gray-600 dark:text-white">
              <p>Download</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="flex justify-center items-center gap-1 dark:text-gray-800 text-white"
                variant="success"
                size="icon"
              ><Send onClick={handleShare} size={18} /></Button>
            </TooltipTrigger>
            <TooltipContent className=" bg-gray-50 text-gray-800 dark:bg-gray-600 dark:text-white">
              <p>Share</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="flex justify-center items-center gap-1 dark:text-gray-800 text-white"
                variant="success"
                size="icon"
              >
                {
                  copied ?
                    <ClipboardCheck size={18} />
                    :
                    <Copy onClick={handleCopy} size={18} />
                }
              </Button>
            </TooltipTrigger>
            <TooltipContent className=" bg-gray-50 text-gray-800 dark:bg-gray-600 dark:text-white">
              <p>Copy</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

      </div>
      <div className="__tab_switcher flex justify-center items-center gap-1">
        <small className="hidden sm:block">Current Language: </small>
        {
          (['html', 'css', 'javascript'].includes(currentLanguage)) ?
            < Select
              defaultValue={currentLanguage}
              onValueChange={(value) =>
                dispatch(
                  updateCurrentLanguage(
                    value as CompilerSliceStateType["currentLanguage"]
                  )
                )
              }
            >
              <SelectTrigger className="w-[120px] bg-gray-50 dark:bg-gray-700 outline-none focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="css">CSS</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
              </SelectContent>
            </Select> : <p className="uppercase font-bold">{currentLanguage}</p>
        }
        <div className="ml-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="secondary" onClick={handleExpendEditor}>{
                  editorConfig.style.expendEditor ? <ChevronLeft size={20} /> : <ChevronsLeftRight size={20} />
                }</Button>
              </TooltipTrigger>
              <TooltipContent className=" bg-gray-50 text-gray-800 dark:bg-gray-600 dark:text-white">
                {editorConfig.style.expendEditor ?
                  <p>Open Console</p>
                  :
                  <p>Expend Editor</p>
                }
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>


        </div>
      </div>
    </div >
  );
}


const extensionMapper: string[][] = [['c', '.c'], ['cpp', '.cpp'], ['html', '.html'], ['css', '.css'], ['javascript', '.js'], ['python', '.py'], ['java', '.java']];

const mapExtension = (lang: string): string => {
  for (let i = 0; i < extensionMapper.length; i++) {
    if ((extensionMapper[i][0] as string) === lang) return extensionMapper[i][1];
  }
  return '.txt';
}