import { spawn } from "child_process";
import { RunResult } from "../controllers/compilerController";

const javaCompiler = (input: string, file: string): Promise<RunResult> => {
  return new Promise((resolve, reject) => {
    try {
      const javaProcess = spawn("java", [file]);
      javaProcess.on("error", (err) => {
        resolve({
          success: true,
          error: true,
          message: err.message,
          time: 0,
          data: "Compilation Error",
          statusCode: 200,
        });
      });
      let time = Date.now();
      let outputData = "";
      setTimeout(() => {
        javaProcess.kill();
        resolve({
          success: true,
          error: true,
          message: "Execution Time Out",
          data: outputData.toString(),
          time: 3000,
          statusCode: 200,
        });
      }, 3000);
      if (input.length) javaProcess.stdin.write(input);
      javaProcess.stdin.end();

      javaProcess.stdout.on("data", (data) => {
        if (outputData.length < 5000) outputData += data;
      });

      let isError: boolean = false;
      javaProcess.on("close", () => {
        resolve({
          success: true,
          error: isError,
          message: "Compilation Error",
          data: outputData.toString(),
          time: Date.now() - time,
          statusCode: 200,
        });
      });

      javaProcess.stderr.on("data", (data) => {
        isError = true;
        outputData += data;
      });
    } catch (err) {
      resolve({
        success: true,
        error: true,
        message: "Server Error!",
        data: "Server Error!",
        time: 0,
        statusCode: 200,
      });
    }
  });
};

export default javaCompiler;
