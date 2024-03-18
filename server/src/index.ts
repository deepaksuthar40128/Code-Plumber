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



//Test github webhook 
import SmeeClient from 'smee-client'
import { client, computeHash } from "./controllers/redeply";
if(!process.env.PRODUCTION){
  const smee = new SmeeClient({
    source: 'https://smee.io/F7bGwtNjNp8kNkjg',
    target: 'http://localhost:4320/update-build-image',
    logger: console
  })
  smee.start();
}

app.post('/update-build-image',(req:Request,res:Response)=>{
  try{
    if(req.body?.hook?.events?.includes('push')){ 
      const headers = req.headers; 
      const hash = (headers['x-hub-signature-256'] as string).split('=').pop(); 
      const password = computeHash(JSON.stringify(req.body)); 
      if(client && hash===password)
        client.write('Rebuild');
      else console.log("No listener for redeploy event!");
      res.json({success:true,msz:"Action"});
    }else{
      res.json({success:true,msz:"ignore"});
    }
  }catch(err){
    console.log("Error During Redeploying..."+err); 
  }
})


app.use("/compiler", compilerRouter);

app.use('/', (req: Request, res: Response) => {
  res.sendFile(path.resolve(__dirname + '/../../client/dist/index.html'));
});

app.listen(4320, () => {
  console.log("http://localhost:4320");
});
