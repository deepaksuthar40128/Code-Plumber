import { parentPort } from 'worker_threads';
import { CompileResult, compileCode } from '../controllers/compilerController';
import { RequestData } from '../routes/compilerRouter';
parentPort?.on('message', async (data: RequestData) => {
    let res: CompileResult = await compileCode(data);
    parentPort?.postMessage(res);
})