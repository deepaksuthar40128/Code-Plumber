import Templets from "@/utils/Templates";
import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit/react";

const languages = ['html', 'c', 'css', 'javascript', 'cpp', 'python', 'java'];
export interface CompilerSliceStateType {
  code: { [key: string]: string }
  currentLanguage: "html" | "c" | "css" | "javascript" | "cpp" | "python" | "java";
  theme: { [key: string]: string }
  session: string
}

const initialState: CompilerSliceStateType = {
  code: {},
  currentLanguage: "cpp",
  theme: {
    fontSize: 'xl'
  },
  session: ''
};

const compilerSlice = createSlice({
  name: "compilerSlice",
  initialState,
  reducers: {
    updateCurrentLanguage: (state, action: PayloadAction<CompilerSliceStateType["currentLanguage"]>) => {
      state.currentLanguage = action.payload;
      localStorage.setItem('lastLanguage-' + state.session, state.currentLanguage);
    },
    updateCodeValue: (state, action: PayloadAction<string>) => {
      state.code[state.currentLanguage] = action.payload;
    },
    updateTheme: (state, action: PayloadAction<string[]>) => {
      state.theme[action.payload[0]] = action.payload[1];
      let localThemeSettigs = localStorage.getItem('theme-' + state.session);
      if (localThemeSettigs) {
        let parsedLocalThemeSettings = JSON.parse(localThemeSettigs);
        parsedLocalThemeSettings.fontSize = state.theme.fontSize;
        localStorage.setItem('theme-' + state.session, JSON.stringify(parsedLocalThemeSettings));
      } else {
        localStorage.setItem('theme-' + state.session, JSON.stringify(state.theme));
      }
    }
  },
});

(() => {
  let session = localStorage.getItem('last-session');
  if (session) {
    initialState.session = session;
    let localThemeSettigs = localStorage.getItem('theme-' + session);
    if (localThemeSettigs) {
      let parsedLocalThemeSettings = JSON.parse(localThemeSettigs);
      initialState.theme.fontSize = parsedLocalThemeSettings.fontSize ? parsedLocalThemeSettings.fontSize : 'xs';
    }
    initialState.currentLanguage = (localStorage.getItem('lastLanguage-' + session) as CompilerSliceStateType["currentLanguage"]) || "cpp";
    languages.forEach(lang => {
      let data = localStorage.getItem(`currentCode-${lang}-${session}`);
      if (data) {
        initialState.code[lang] = data;
      } else {
        initialState.code[lang] = Templets(lang);
      }
    })
  } else {
    initialState.session = Date.now().toString();
    let sessions = localStorage.getItem('sessions');
    if (sessions) {
      let paredSessions: string[] = JSON.parse(sessions);
      localStorage.setItem('sessions', JSON.stringify([initialState.session, ...paredSessions]));
    }
    else
      localStorage.setItem('sessions', JSON.stringify([initialState.session]));
    localStorage.setItem('last-session', initialState.session);
    languages.forEach(lang => {
      initialState.code[lang] = Templets(lang);
    })
  }
})()

export default compilerSlice.reducer;
export const { updateCurrentLanguage, updateCodeValue, updateTheme } = compilerSlice.actions;
