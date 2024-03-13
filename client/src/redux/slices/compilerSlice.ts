import Templets from "@/utils/Templates";
import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit/react";

const languages = ['html', 'c', 'css', 'javascript', 'cpp', 'python', 'java'];
export interface CompilerSliceStateType {
  code: { [key: string]: string }
  currentLanguage: "html" | "c" | "css" | "javascript" | "cpp" | "python" | "java";
  theme: { [key: string]: string }
}

const initialState: CompilerSliceStateType = {
  code: {},
  currentLanguage: (localStorage.getItem('lastLanguage') as CompilerSliceStateType["currentLanguage"]) || "cpp",
  theme: {
    fontSize: 'xl'
  }
};

const compilerSlice = createSlice({
  name: "compilerSlice",
  initialState,
  reducers: {
    updateCurrentLanguage: (state, action: PayloadAction<CompilerSliceStateType["currentLanguage"]>) => {
      state.currentLanguage = action.payload;
      localStorage.setItem('lastLanguage', state.currentLanguage);
    },
    updateCodeValue: (state, action: PayloadAction<string>) => {
      state.code[state.currentLanguage] = action.payload;
    },
    updateTheme: (state, action: PayloadAction<string[]>) => {
      state.theme[action.payload[0]] = action.payload[1];
      let localThemeSettigs = localStorage.getItem('theme');
      if (localThemeSettigs) {
        let parsedLocalThemeSettings = JSON.parse(localThemeSettigs);
        parsedLocalThemeSettings.fontSize = state.theme.fontSize;
        localStorage.setItem('theme', JSON.stringify(parsedLocalThemeSettings));
      } else {
        localStorage.setItem('theme', JSON.stringify(state.theme));
      }
    }
  },
});

(() => {
  let localThemeSettigs = localStorage.getItem('theme');
  if (localThemeSettigs) {
    let parsedLocalThemeSettings = JSON.parse(localThemeSettigs);
    initialState.theme.fontSize = parsedLocalThemeSettings.fontSize ? parsedLocalThemeSettings.fontSize : 'xs';
  }
  languages.forEach(lang => {
    let data = localStorage.getItem(`currentCode-${lang}`);
    if (data) {
      initialState.code[lang] = data;
    }else{
      initialState.code[lang] = Templets(lang);
    }
  })
})()

export default compilerSlice.reducer;
export const { updateCurrentLanguage, updateCodeValue, updateTheme } = compilerSlice.actions;
