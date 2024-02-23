import { spawn } from 'child_process';

const pyCompiler = (input: string, file: string) => {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', [file]);
        let time = Date.now();
        let outputData = '';
        setTimeout(() => {
            pythonProcess.kill();
            resolve({
                success: true,
                error: true,
                message: 'Execution Time Out',
                data: outputData.toString(), time: 2000
            });
        }, 2000);

        pythonProcess.stdin.write(input);
        pythonProcess.stdin.end();

        pythonProcess.stdout.on('data', (data) => {
            outputData += data;
        });
        pythonProcess.on('close', () => {
            resolve({
                success: true,
                error: false,
                data: outputData.toString(),
                time: Date.now() - time
            });
        });

        pythonProcess.stderr.on('data', (data) => {
            outputData += Buffer.from("STD-Error\n")
            outputData += data;
        });
    });
}

export default pyCompiler;