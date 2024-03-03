import { exec, spawn } from "child_process";
import path from 'path'
const cppCompiler = (input: string, file: string) => {
    return new Promise((resolve, reject) => {
        const executableFileName = path.resolve(path.resolve() + '/runEnv/exe/a.exe');
        exec(`g++ -o ${executableFileName} ${file} `, (error, stdout, stderr) => {
            if (error) {
                resolve({
                    success: true,
                    error: true,
                    message: "Compilation error",
                    data: error?.message,
                    time: 0
                });
            }
            if (stderr) {
                resolve({
                    success: true,
                    error: true,
                    message: "Runtime error",
                    data: error?.message,
                    time: 0
                });
            }

            //execute .exe file 
            const childProcess = spawn(`${executableFileName}`);
            let time = Date.now();
            let outputData = '';
            setTimeout(() => {
                childProcess.kill();
                resolve({
                    success: true,
                    error: true,
                    message: 'Execution Time Out',
                    data: outputData.toString(),
                    time: 1000
                });
            }, 1000);

            childProcess.stdin.end(input);
            childProcess.stdout.on('data', (data) => {
                outputData += data;
            });
            childProcess.stdout.on('close', () => {
                resolve({
                    success: true,
                    error: false,
                    data: outputData.toString(),
                    time: Date.now() - time
                });
            })

            childProcess.stderr.on('data', (data) => {
                resolve({
                    success: true,
                    error: true,
                    message: "Execution error",
                    data: data.toString(),
                    time: 0
                });
            });
        });
    })
}

export default cppCompiler;