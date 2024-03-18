import express from "express"; 
import { Worker, isMainThread } from 'node:worker_threads'
import { RunResult } from "../controllers/compilerController";

export interface RunData {
    cleanedInput: string,
    language: string,
    code: string,
    input: string
}

export const compilerRouter = express.Router();
compilerRouter.post("/run", (req, res) => {
    const { language, code, input }: RunData = req.body;
    const cleanedInput = input.replace(/^\s+/gm, '').replace(/\s+/g, ' ');
    if (!code || !code.length || !language.length) {
        return res.status(200).json({ success: false, message: "Code cannot be blank!" });
    }
    if (isMainThread) { 
        const worker = new Worker(__dirname+'/../workers/worker.js');
        worker.postMessage({ cleanedInput, code, language });
        worker.on('message', (output: RunResult) => {
            worker.terminate();
            return res.status(output.statusCode).json(output);
        })
    }
});
