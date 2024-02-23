import { Request, Response } from "express";
import fs from 'fs';
import path from 'path'
import cppCompiler from "../compilers/cpp";
import pyCompiler from "../compilers/py";
import javaCompiler from "../compilers/java";


const randomGen = (): string => {
  let a = Date.now();
  return 'code' + a.toString() + 'edoc';
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

const handleRemoveFile = (fileName: string): void => {

}

export const runCode = async (req: Request, res: Response) => {
  const { language, code, input } = req.body;
  const cleanedInput: string = input.replace(/^\s+/gm, '').replace(/\s+/g, ' ');

  if (!code || !code.length || !language.length) {
    return res.status(200).json({ success: false, message: "Code cannot be blank!" });
  }

  try {
    const codeFileName = path.resolve(path.resolve() + '/runEnv/code/' + randomGen() + extensionMapper(language));
    let wsCode = fs.createWriteStream(codeFileName);
    wsCode.write(code);
    wsCode.end();
    wsCode.on('close', async () => {
      if (language === 'cpp' || language === 'c') {
        let result = await cppCompiler(cleanedInput, codeFileName);
        res.status(200).json(result);
      }
      else if (language === 'python') {
        let result = await pyCompiler(cleanedInput, codeFileName);
        res.status(200).json(result);
      }
      else if (language === 'java') {
        let result = await javaCompiler(cleanedInput, codeFileName);
        res.status(200).json(result);
      }
      else {
        res.status(200).json({
          success: true,
          error: true,
          message: "Unsupported Language",
          time: 0
        });
      }
    });
  } catch (error) {
    return res.status(500).send({ message: "Error saving code", error });
  }
}
