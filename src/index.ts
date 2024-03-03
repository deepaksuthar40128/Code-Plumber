import express from "express";
import cors from "cors"; 
import { compilerRouter } from "./routes/compilerRouter"; 
import cookieParser from "cookie-parser";
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  credentials: true,
  origin: ["http://localhost:5173","https://code-plumber.vercel.app"],
})); 

app.use("/compiler", compilerRouter); 
 
app.listen(4320, () => {
  console.log("http://localhost:4320");
});
