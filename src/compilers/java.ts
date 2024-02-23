import { spawn } from 'child_process';

const javaCompiler = (input: string, file: string) => {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('java', [file]);
        let time = Date.now();
        let outputData = '';
        setTimeout(() => {
            pythonProcess.kill();
            resolve({
                success: true,
                error: true,
                message: 'Execution Time Out',
                data: outputData.toString(), time: 3000
            });
        }, 3000);

        pythonProcess.stdin.write(input);
        pythonProcess.stdin.end();

        pythonProcess.stdout.on('data', (data) => {
            outputData += data;
        });

        let isError: boolean = false;
        pythonProcess.on('close', () => {
            resolve({
                success: true,
                error: isError,
                message: 'Compilation Error',
                data: outputData.toString(),
                time: Date.now() - time
            });
        });

        pythonProcess.stderr.on('data', (data) => {
            isError = true;
            outputData += data;
        });
    });
}

export default javaCompiler;