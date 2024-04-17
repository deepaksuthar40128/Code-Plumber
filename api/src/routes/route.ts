import express, { Request, Response } from "express"
import { Services } from "../controllers/rpc";
import { FormData } from "undici-types";

const app = express();

export const Responses: { [key: string]: Response } = {}

const IDGenrator = () => {
    let reqId = `${Math.floor(1000000 + 1000000 * Math.random())}${Date.now()}`;
    return reqId;
}

app.post('/run', (req: Request, res: Response) => {
    const data = req.body;
    let reqId = IDGenrator();
    console.log(reqId);
    Services.map(service => {
        if (service.type === "Go") {
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

export default app;