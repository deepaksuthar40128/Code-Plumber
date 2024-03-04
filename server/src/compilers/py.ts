import { spawn } from 'child_process';

const pyCompiler = (input: string, file: string) => {
    return new Promise((resolve, reject) => {
        try {
            const pythonProcess = spawn('python3', [file]);
            pythonProcess.on('error', (err) => {
                resolve({
                    success: true,
                    error: true,
                    message: err.message,
                    time: 0
                });
            })
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
                if (outputData.length < 5000)
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
        } catch (err) {
            resolve({
                success: true,
                error: true,
                message: 'Server Error!',
                time: 0
            });
        }
    });
}
export default pyCompiler;