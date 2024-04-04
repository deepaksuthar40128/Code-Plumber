import { exec, spawn } from "node:child_process";
import path from "path";
import fs from "node:fs"
import { CompileResult, fileNameGenrator } from "../controllers/compilerController";
const cppCompiler = (file: string): Promise<CompileResult> => {
  return new Promise((resolve, reject) => {
    try {
      const executableFileName = path.resolve(
        path.resolve() + "/runEnv/exe/" + fileNameGenrator() + ".exe"
      );
      (fs.createWriteStream(executableFileName)).close();
      exec(`g++ -o ${executableFileName} ${file} `, (error, stdout, stderr) => {
        fs.rmSync(file);
        if (error) {
          fs.rmSync(executableFileName);
          resolve({
            success: true,
            error: true,
            message: error?.message || "Compilation Error",
            file: '',
            statusCode: 200,
          });
        }
        else if (stderr) {
          fs.rmSync(executableFileName);
          resolve({
            success: true,
            error: true,
            message: stderr || "Runtime Error",
            file: '',
            statusCode: 200,
          });
        }
        else {
          resolve({
            success: true,
            error: false,
            message: "successfully compilation",
            file: executableFileName,
            statusCode: 200,
          })
        }
      });
    } catch (err) {
      resolve({
        success: true,
        error: true,
        message: "Server Error!",
        file: '',
        statusCode: 500,
      });
    }
  });
};

export default cppCompiler;
