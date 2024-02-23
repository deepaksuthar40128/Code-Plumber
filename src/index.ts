import express from "express";
import cors from "cors"; 
import { compilerRouter } from "./routes/compilerRouter"; 
import cookieParser from "cookie-parser";
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true, origin: "http://localhost:5173" })); 

app.use("/compiler", compilerRouter); 
 
app.listen(4000, () => {
  console.log("http://localhost:4000");
});
