import express, { Request, Response } from "express";
import cors from "cors";
import { compilerRouter } from "./routes/compilerRouter";
import cookieParser from "cookie-parser";
import path from 'node:path'
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.resolve(__dirname + '/../../client/dist/')));
app.use(cors({
  credentials: true,
  origin: ["http://localhost:5173", "https://code-plumber.vercel.app"],
}));


app.use("/compiler", compilerRouter);
app.use('/', (req: Request, res: Response) => {
  res.sendFile(path.resolve(__dirname + '/../../client/dist/index.html'));
});

app.listen(4320, () => {
  console.log("http://localhost:4320");
});
