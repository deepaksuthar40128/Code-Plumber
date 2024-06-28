import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { CompilerSliceStateType } from "./compilerSlice";

const genrateBaseURL = (): string => {
  let lastSession = localStorage.getItem('last-session')
  let data = localStorage.getItem('editor-config-' + lastSession);
  if (data) {
    let parsedData = JSON.parse(data);
    if (parsedData.machine === 'local') {
      return 'http://localhost:4320'
    }
  }
  return '';
}


export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: genrateBaseURL(),
    credentials: "include",
  }),
  endpoints: (builder) => ({
    runCode: builder.mutation<
      {
        success: boolean,
        message: string,
        data: string,
        time: number,
        error: string
      }
      , any>({
        query: (runtime) => {
          return {
            url: "/compiler/run",
            method: "POST",
            body: runtime,
          };
        },
      }),
    compileCode: builder.mutation<
      {
        success: boolean,
        message: string,
        error: boolean,
        file: ''
      }
      , any>({
        query: (runtime) => {
          return {
            url: "/compiler/compile",
            method: "POST",
            body: runtime,
          };
        },
      }),
    uploadCode: builder.mutation<
      {
        success: boolean,
        codeId: number,
        error: boolean
      }
      , any>({
        query: (runtime) => {
          return {
            url: "/compiler/upload",
            method: "POST",
            body: runtime
          };
        },
      }),
    fetchCode: builder.query<{ success: boolean, error: boolean, data: { code: string, language: CompilerSliceStateType["currentLanguage"], message: string } }, { codeId: number }>({
      query: (runtime) => {
        console.log(runtime)
        return {
          url: `/compiler/fetch/${runtime.codeId}`,
          method: "GET",
        };
      },
    })
  }),
});

export const {
  useRunCodeMutation,
  useCompileCodeMutation,
  useUploadCodeMutation,
  useLazyFetchCodeQuery
} = api;
