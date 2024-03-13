import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const genrateBaseURL = (): string => {
  let data = localStorage.getItem('compile-machine');
  if (data) {
    if (data === 'local') {
      return 'http://localhost:4320'
    }
    else return '';
  } else {
    return '';
  }
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
      })
  }),
});

export const {
  useRunCodeMutation
} = api;
