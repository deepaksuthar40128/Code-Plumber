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
import { ChevronLeft, ChevronRight, ChevronsLeftRight, Download, Send, Settings, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Input } from "./ui/input";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { ThemeMaper } from "./CodeEditor";
import { Theme, useTheme } from "./theme-provider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

export default function HelperHeader({ data }: { data: { expendEditor: boolean, setExpendEditor: React.Dispatch<React.SetStateAction<boolean>>, autoCompletion: boolean, setAutoCompletion: React.Dispatch<React.SetStateAction<boolean>> } }) {
  const [snipitName, setSnipitName] = useState('');
  const [snipitsList, setsnipitsList] = useState({});
  const dispatch = useDispatch();
  const currentLanguage = useSelector(
    (state: RootState) => state.compilerSlice.currentLanguage
  );
  let code = useSelector((state: RootState) => state.compilerSlice.code[currentLanguage]);
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
  useEffect(() => {
    let snipits = localStorage.getItem('snipits');
    if (snipits) {
      setsnipitsList(JSON.parse(snipits));
    }
    let config = localStorage.getItem('editor-config');
    if (config) {
      let parsedConfig = JSON.parse(config) as { [key: string]: string | boolean };
      if (parsedConfig.hasOwnProperty('autoComplete')) {
        data.setAutoCompletion(parsedConfig.autoComplete as boolean);
      }
    }
  }, [])
  const onChange = React.useCallback((value: string) => {
    dispatch(updateCodeValue(value));
    localStorage.setItem(`currentCode-${currentLanguage}`, value);
  }, []);
  const removeSnipit = (snipit: string) => {
    let snipits = localStorage.getItem('snipits');
    if (snipits) {
      let parsedSnipits = JSON.parse(snipits);
      delete parsedSnipits[snipit];
      setsnipitsList(parsedSnipits);
      localStorage.setItem('snipits', JSON.stringify(parsedSnipits));
    }
  }
  const editorTheme = useSelector((state: RootState) => state.compilerSlice.theme);
  const changeFontSize = (value: string) => {
    dispatch(updateTheme(['fontSize', value]))
  }
  const { theme, setTheme } = useTheme();
  const changeTheme = (value: Theme) => {
    setTheme(value as Theme)
  }
  const handleExpendEditor = () => {
    data.setExpendEditor(!data.expendEditor);
  }
  const handleAutoCompletionChange = (checked: boolean) => {
    let config = localStorage.getItem('editor-config');
    let parsedConfig: { [key: string]: string | boolean } = {};
    if (config) {
      parsedConfig = JSON.parse(config) as { [key: string]: string | boolean };
    }
    parsedConfig.autoComplete = checked;
    localStorage.setItem('editor-config', JSON.stringify(parsedConfig));
    data.setAutoCompletion(checked);
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
                <p className="flex items-center justify-between cursor-pointer my-1"><span>Themes <span className="text-gray-500 text-sm">({theme.split('-').join(' ')})</span></span>
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
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="autoSuggestion" className="font-normal">Auto Suggetions</Label>
                <Switch className={!data.autoCompletion ? "dark:bg-gray-600" : ''} checked={data.autoCompletion} onCheckedChange={(checked) => handleAutoCompletionChange(checked)} id="autoSuggestion" />
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
                    <p className="flex items-center justify-between cursor-pointer my-1" key={index}><span onClick={() => onChange(snipit[1] as string)}>{snipit[0]} </span><span className="flex" onClick={() => { removeSnipit(snipit[0]) }}><Trash2 size={15} className="text-red-500 inline" /></span> </p>
                  )
                }) : <p className="text-gray-400 text-center justify-between cursor-pointer my-1"> No Snipits Found!</p>
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
              <p>Download Code</p>
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
              <p>Share Code</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

      </div>
      <div className="__tab_switcher flex justify-center items-center gap-1">
        <small>Current Language: </small>
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
                  data.expendEditor ? <ChevronLeft size={20} /> : <ChevronsLeftRight size={20} />
                }</Button>
              </TooltipTrigger>
              <TooltipContent className=" bg-gray-50 text-gray-800 dark:bg-gray-600 dark:text-white">
                {data.expendEditor ?
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