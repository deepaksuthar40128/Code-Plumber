import express, { Request, Response } from "express"
import { Services } from "../controllers/rpc";

const app = express();

export const Responses: { [key: string]: Response } = {}

const IDGenrator = () => {
    let reqId = `${Math.floor(1000000 + 1000000 * Math.random())}${Date.now()}`;
    return reqId;
}

app.post('/run', (req: Request, res: Response) => {
    const data = req.body;
    let reqId = IDGenrator();
    Services.map(service => {
        if (service.type === "Go1") {
            console.log("Writing to go service")
            service.Socket.write(JSON.stringify({
                type: "Run",
                id: reqId,
                data
            }))
            Responses[reqId] = res;
        }
    })
})

app.post('/compile', (req: Request, res: Response) => {
    const data = req.body;
    let reqId = IDGenrator();
    Services.map(service => {
        if (service.type === "Node") {
            service.Socket.write(JSON.stringify({
                type: "Compile",
                id: reqId,
                data
            }))
            Responses[reqId] = res;
        }
    })
})


app.post('/upload', (req: Request, res: Response) => {
    const data = req.body;
    let reqId = IDGenrator();
    Services.map(service => {
        if (service.type === "Go2") {
            service.Socket.write(JSON.stringify({
                type: "Upload",
                id: reqId,
                data
            }))
            Responses[reqId] = res;
        }
    })
})


app.get('/fetch/:id', (req: Request, res: Response) => {
    let reqId = IDGenrator();
    Services.map(service => {
        if (service.type === "Go2") {
            service.Socket.write(JSON.stringify({
                type: "Fetch",
                id: reqId,
                data: {
                    codeId: req.params.id
                }
            }))
            Responses[reqId] = res;
        }
    })
})

app.get('/list-services',(req:Request,res:Response)=>{
    let services:string[];
    services = Services.map(s=>s.type)
    res.send(services)
})

export default app;