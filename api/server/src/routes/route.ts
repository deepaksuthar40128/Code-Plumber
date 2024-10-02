import express, { Request, Response } from "express"
import { Services } from "../controllers/rpc";

const app = express();

export const Responses: { [key: string]: Response } = {}

const IDGenrator = () => {
    let reqId = `${Math.floor(1000000 + 1000000 * Math.random())}${Date.now()}`;
    return reqId;
}

app.post('/run', (req: Request, res: Response) => {
    let allotedService = Services.getService("Go1");
    if(allotedService){
        const data = req.body;
        let reqId = IDGenrator();
        allotedService.Socket.write(JSON.stringify({
            type: "Run",
            id: reqId,
            data
        }))
        Responses[reqId] = res;
    }
    else
        res.send({success:false,msz:"No service Avalible"});
})

app.post('/compile', (req: Request, res: Response) => {
    let allotedService = Services.getService("Node");
    if(allotedService){
        const data = req.body;
        let reqId = IDGenrator(); 
        allotedService.Socket.write(JSON.stringify({
            type: "Compile",
            id: reqId,
            data
        }))
        Responses[reqId] = res;
    }
    else
        res.send({success:false,msz:"No service Avalible"});
})


app.post('/upload', (req: Request, res: Response) => {
    let allotedService = Services.getService("Go2");
    if(allotedService){
        const data = req.body;
        let reqId = IDGenrator(); 
        allotedService.Socket.write(JSON.stringify({
            type: "Upload",
            id: reqId,
            data
        }))
        Responses[reqId] = res;
    }
    else
        res.send({success:false,msz:"No service Avalible"});
})


app.get('/fetch/:id', (req: Request, res: Response) => {
    let allotedService = Services.getService("Go2");
    if(allotedService){
        let reqId = IDGenrator(); 
        allotedService.Socket.write(JSON.stringify({
            type: "Fetch",
            id: reqId,
            data: {
                codeId: req.params.id
            }
        }))
        Responses[reqId] = res;
    }
    else
        res.send({success:false,msz:"No service Avalible"});
})

app.get('/list-services',(req:Request,res:Response)=>{
    res.send(Services.serviceList());
})

app.get('/list-active-socket-services',(req:Request,res:Response)=>{
    res.send(Services.activeSocketServices());
})

export default app;