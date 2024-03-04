import { exec, spawn } from "child_process";
import path from 'path'
const cCompiler = (input: string, file: string) => {
    return new Promise((resolve, reject) => {
        try {
            const executableFileName = path.resolve(path.resolve() + '/runEnv/exe/a.out');
            exec(`gcc -o ${executableFileName} ${file} `, (error, stdout, stderr) => {
                if (error || stderr) {
                    resolve({
                        success: true,
                        error: true,
                        message: "Compilation error",
                        data: error?.message,
                        time: 0
                    });
                }
                const childProcess = spawn(`${executableFileName}`, { stdio: 'pipe' });
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
                if (input.length) {
                    childProcess.stdin.write(input);
                    childProcess.stdin.end();
                }
                childProcess.stdout.on('data', (data) => {
                    if (outputData.length < 5000)
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
                }
                );
            });
        } catch (err) {
            resolve({
                success: true,
                error: true,
                message: 'Server Error!',
                time: 0
            });
        }
    })
}

export default cCompiler;