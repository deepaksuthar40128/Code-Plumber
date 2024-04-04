import express from "express"; 
import { Worker, isMainThread } from 'node:worker_threads'
import { CompileResult } from "../controllers/compilerController";

export interface RequestData { 
    language: string,
    code: string
}

export const compilerRouter = express.Router();
compilerRouter.post("/compile", (req, res) => {
    const { language, code }: RequestData = req.body; 
    if (!code || !code.length || !language.length) {
        return res.status(200).json({ success: false, message: "Code cannot be blank!" });
    }
    if (isMainThread) { 
        const worker = new Worker(__dirname+'/../workers/worker.js');
        worker.postMessage({ code, language });
        worker.on('message', (output: CompileResult) => {
            worker.terminate();
            return res.status(output.statusCode).json(output);
        })
    }
});
