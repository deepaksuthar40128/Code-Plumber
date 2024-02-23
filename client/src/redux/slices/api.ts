import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"; 

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:4000",
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
