import CodeMirror, { EditorState, Extension } from "@uiw/react-codemirror";
import { loadLanguage } from "@uiw/codemirror-extensions-langs";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { updateCodeValue } from "@/redux/slices/compilerSlice";
import { abcdef } from '@uiw/codemirror-theme-abcdef';
import { abyss } from '@uiw/codemirror-theme-abyss';
import { androidstudio } from '@uiw/codemirror-theme-androidstudio';
import { basicLight, basicDark } from '@uiw/codemirror-theme-basic';
import { githubLight, githubDark } from '@uiw/codemirror-theme-github';
import { kimbie } from '@uiw/codemirror-theme-kimbie';
import { tomorrowNightBlue } from '@uiw/codemirror-theme-tomorrow-night-blue';
import { inlineSuggestion } from 'codemirror-extension-inline-suggestion';
import { useTheme } from "./theme-provider";
import cppKeywords from "@/languages/cpp/cpp";

export default function CodeEditor({ autoCompletion }: { autoCompletion: boolean }) {
  const currentLanguage = useSelector(
    (state: RootState) => state.compilerSlice.currentLanguage
  );
  const fullCode = useSelector(
    (state: RootState) => state.compilerSlice.code
  );
  const dispatch = useDispatch();
  const { theme } = useTheme();

  let timerId: NodeJS.Timeout;
  const onChange = (value: string) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      dispatch(updateCodeValue(value));
      localStorage.setItem(`currentCode-${currentLanguage}`, value);
    }, 1000)
  };

  const Suggestion = async (state: EditorState) => {
    if (currentLanguage === 'cpp' && autoCompletion) {//currently avalible in cpp only
      let cursor = state.selection.main.head;
      let text = state.doc.toString();
      text = text.slice(0, cursor);
      text = extractLastWord(text);
      if (text && text != '') {
        let a = autoComplete(text);
        if (!a || a.length < text.length) return '';
        a = a.slice(text.length);
        return a;
      }
    }
    return '';
  };

  const editorTheme = useSelector((state: RootState) => state.compilerSlice.theme);
  return (
    <CodeMirror
      value={fullCode[currentLanguage]}
      height="calc(100vh - 60px - 50px)"
      className={`code-editor text-${editorTheme.fontSize}`}
      extensions={[
        loadLanguage(currentLanguage)!,
        inlineSuggestion({
          fetchFn: Suggestion,
          delay: 100,
        }),]}
      onChange={onChange}
      theme={ThemeMaper[theme as string]}
    />
  );
}

export const ThemeMaper: { [key: string]: Extension } = {
  'Old-House': abcdef,
  'Android-Studio': androidstudio,
  'Electronic': abyss,
  'Basic-Light': basicLight,
  'Basic-Dark': basicDark,
  'Light': githubLight,
  'Dark': githubDark,
  'Kimbie Red': kimbie,
  'Tomorrow-Night-Blue': tomorrowNightBlue
}


function extractLastWord(text: string): string {
  const delimiterPattern = "[<>.{}\():;,/'\"\|!?@#$%^&*+=~`_-]";
  let spa = delimiterPattern.split('');
  for (let i = 0; i < spa?.length; i++) {
    if (text && text.length) {
      text = text.split(spa[i]).pop() as string;
    }
    else return '';
  }
  return text.trim();
}

function autoComplete(input: string): string {
  const matches = cppKeywords.filter(keyword => keyword.startsWith(input));
  matches.sort((a, b) => a.startsWith(input) && b.startsWith(input) ?
    a.localeCompare(input) - b.localeCompare(input) :
    b.length - a.length);
  return matches[0];
}