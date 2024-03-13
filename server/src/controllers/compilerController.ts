import fs from 'fs';
import path from 'path'
import cppCompiler from "../compilers/cpp";
import pyCompiler from "../compilers/py";
import javaCompiler from "../compilers/java";
import cCompiler from "../compilers/c";
import { RunData } from "../routes/compilerRouter";

export type RunResult = {
  success: boolean,
  error: boolean,
  message: string,
  time: number,
  data: string,
  statusCode: number,
}

const extensionMapper = (language: string): string => {
  switch (language) {
    case "c":
      return ".c"
    case "cpp":
      return ".cpp"
    case "python":
      return '.py'
    case "java":
      return '.java'
    default:
      return ".txt"
  }
}

export const runCode = (data: RunData): Promise<RunResult> => {
  return new Promise((resolve, reject) => {
    try {
      const { cleanedInput, code, language } = data;
      const codeFileName = path.resolve(path.resolve() + '/runEnv/code/Main' + extensionMapper(language));
      let wsCode = fs.createWriteStream(codeFileName);

      wsCode.write(code);
      wsCode.end();

      wsCode.on('close', async () => {
        let result: RunResult;
        if (language === 'cpp') {
          result = await cppCompiler(cleanedInput, codeFileName);
        }
        else if (language === 'c') {
          result = await cCompiler(cleanedInput, codeFileName);
        }
        else if (language === 'python') {
          result = await pyCompiler(cleanedInput, codeFileName);
        }
        else if (language === 'java') {
          result = await javaCompiler(cleanedInput, codeFileName);
        }
        else {
          result = {
            success: true,
            error: true,
            message: "Unsupported Language",
            data: "Unsupported Language",
            time: 0,
            statusCode: 200
          };
        }
        resolve(result);
      });

      wsCode.on('error', (err) => {
        reject({
          success: false,
          data: "Server Error",
          message: "Error saving code",
          error: true,
          time: 0,
          statusCode: 500
        });
      });
    } catch (error) {
      reject({
        success: false,
        data: "Server Error",
        message: "Error saving code",
        error: true,
        time: 0,
        statusCode: 500
      });
    }
  });
};
