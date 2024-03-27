import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit/react";

export interface EditorConfigSliceType {
    terminal: boolean,
    autoComplete: boolean,
    machine: string,
    style: {
        expendEditor: boolean,
        inputOpen: boolean,
        outputOpen: boolean
    }
}

const initialState: EditorConfigSliceType = {
    terminal: false,
    autoComplete: true,
    machine: 'server',
    style: {
        expendEditor: window.innerWidth < 600,
        inputOpen: false,
        outputOpen: false
    }
};

const editorConfigSlice = createSlice({
    name: "editor-config",
    initialState,
    reducers: {
        updateEditorConfig: (state, action: PayloadAction<{ [key: string]: string | boolean | { [key: string]: boolean | string } }>) => {
            switch (action.payload.type) {
                case 'machine':
                    state.machine = action.payload.value as string;
                    break;
                case 'terminal':
                    state.terminal = action.payload.value as boolean;
                    break;
                case 'autoComplete':
                    state.autoComplete = action.payload.value as boolean;
                    break;
                case 'style': 
                    switch ((action.payload.value as {[key:string]:string|boolean}).type) {
                        case 'expendEditor':
                            state.style.expendEditor = (action.payload.value as {[key:string]:string|boolean}).value as boolean
                            break;
                        case 'inputOpen':
                            state.style.inputOpen = (action.payload.value as {[key:string]:string|boolean}).value as boolean
                            break;
                        case 'outputOpen':
                            state.style.outputOpen = (action.payload.value as {[key:string]:string|boolean}).value as boolean
                            break;
                        default:
                            break;
                    }
                    break;
                default:
                    break;
            }
            localStorage.setItem('editor-config', JSON.stringify(state));
        }
    },
});

(() => {
    let localConfig = localStorage.getItem('editor-config');
    if (localConfig) {
        let data: EditorConfigSliceType = JSON.parse(localConfig);
        initialState.machine = data.machine; 
        initialState.autoComplete = data.autoComplete; 
        initialState.terminal = data.terminal; 
        initialState.style.expendEditor = data.style.expendEditor; 
        initialState.style.inputOpen = data.style.inputOpen; 
        initialState.style.outputOpen = data.style.outputOpen; 
    }
})()

export default editorConfigSlice.reducer;
export const { updateEditorConfig } = editorConfigSlice.actions;
