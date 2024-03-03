import express from "express";
import {runCode} from "../controllers/compilerController";

export const compilerRouter = express.Router();

compilerRouter.post("/run", runCode);
