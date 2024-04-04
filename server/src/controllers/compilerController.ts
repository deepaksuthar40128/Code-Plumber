import fs from 'fs';
import path from 'path'
import cppCompiler from "../compilers/cpp";
import { RequestData } from "../routes/compilerRouter";

export type CompileResult = {
  success: boolean,
  error: boolean,
  message: string,
  file:string,
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

export const compileCode = (data: RequestData): Promise<CompileResult> => {
  return new Promise((resolve, reject) => {
    try {
      const { code, language } = data;
      const codeFileName = path.resolve(path.resolve() + '/runEnv/code/' + fileNameGenrator() + extensionMapper(language));
      let wsCode = fs.createWriteStream(codeFileName);

      wsCode.write(code);
      wsCode.end();

      wsCode.on('close', async () => {
        let result: CompileResult;
        if (language === 'cpp' || language == 'c') {
          result = await cppCompiler(codeFileName);
        }
        else {
          result = {
            success: true,
            error: true,
            file:'',
            message: "Unsupported Language or Interpetated Language",
            statusCode: 200
          };
        }
        resolve(result);
      });

      wsCode.on('error', (err) => {
        reject({
          success: false,
          error: true,
          file:'',
          message: "Error saving code",
          statusCode: 500
        });
      });
    } catch (error) {
      reject({
        success: false,
        error: true, 
        message: "Error saving code",
        file:'',
        statusCode: 500
      });
    }
  });
};


export const fileNameGenrator = () => {
  return Math.floor(12345678 + Math.random() * 10000000) + Date.now() + "-Main";
}