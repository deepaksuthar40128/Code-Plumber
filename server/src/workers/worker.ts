import { parentPort } from 'worker_threads';
import { RunResult, runCode } from '../controllers/compilerController';
import { RunData } from '../routes/compilerRouter';
parentPort?.on('message', async (data: RunData) => {
    let res: RunResult = await runCode(data);
    parentPort?.postMessage(res);
})