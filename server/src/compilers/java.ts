import { spawn } from 'child_process';

const javaCompiler = (input: string, file: string) => {
    return new Promise((resolve, reject) => {
        const javaProcess = spawn('java', [file]);
        let time = Date.now();
        let outputData = '';
        setTimeout(() => {
            javaProcess.kill();
            resolve({
                success: true,
                error: true,
                message: 'Execution Time Out',
                data: outputData.toString(), time: 3000
            });
        }, 3000);

        javaProcess.stdin.write(input);
        javaProcess.stdin.end();

        javaProcess.stdout.on('data', (data) => {
            outputData += data;
        });

        let isError: boolean = false;
        javaProcess.on('close', () => {
            resolve({
                success: true,
                error: isError,
                message: 'Compilation Error',
                data: outputData.toString(),
                time: Date.now() - time
            });
        });

        javaProcess.stderr.on('data', (data) => {
            isError = true;
            outputData += data;
        });
    });
}

export default javaCompiler;