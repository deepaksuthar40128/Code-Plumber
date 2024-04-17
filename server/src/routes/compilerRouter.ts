import { Worker, isMainThread } from 'node:worker_threads'
import { CompileResult } from "../controllers/compilerController";

export interface RequestData {
    language: string,
    code: string
}
export const Maneger = (data: RequestData) => {
    return new Promise((resolve, reject) => {
        const { language, code }: RequestData = data;
        if (!code || !code.length || !language.length) {
            resolve({ statusCode: 200, success: false, message: "Code cannot be blank!" });
        }
        if (isMainThread) {
            const worker = new Worker(__dirname + '/../workers/worker.js');
            worker.postMessage({ code, language });
            worker.on('message', (output: CompileResult) => {
                worker.terminate();
                resolve(output);
            })
        }
    })
};
