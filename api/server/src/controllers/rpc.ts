import net from "node:net"
import { Responses } from "../routes/route";
import { handleSocketEvents } from "./socket";
import { Store } from "./serviceStore";
export type Service = {
    type: "Go1" | "Node" | "Go2",
    serviceId:string,
    Socket: net.Socket
};
let go1max = +(process.env.GO1 as string) || 1;
let go2max = +(process.env.GO2 as string) || 1;
let Nodemax = +(process.env.NODE1  as string) || 1;
let maxService = {
    "Go1": go1max as number,
    "Go2":go2max as number,
    "Node":Nodemax as number
}
export const Services = new Store(['Go1','Go2','Node'],maxService);
const server = net.createServer(socket => {
    socket.on('close', () => {
        Services.removeClosedServices();
    }) 
    let output = '';
    socket.on('data', (msz) => {
        let s = msz.toString();
        output += s;
        while (output.includes('$end$')) { 
            let nout = output.split('$end$');
            handleSocketData(nout[0], socket);
            nout.shift();
            output = nout.join('$end$');
        }
    })
})
 

function handleSocketData(rawData: string, socket: net.Socket) {
    let data = JSON.parse(rawData); 
    if (data) {
        if (data.type === 'Startup') {
            console.log("New client connected: ",data.service);
            let Service = {
                type: data.service,
                Socket: socket,
                serviceId:randomIdGen()
            };
            Services.addService(Service);
        }
        else if (data.type === 'result') {
            if (typeof (data.data) === 'string') data.data = JSON.parse(data.data)
            Responses[data.id].status(data.data.statusCode).json(data.data);
            delete Responses[data.id];
        }
        else if (data.type === 'Socket') {
            handleSocketEvents(JSON.stringify(data));
        }
        else if(data.type === 'Uploaded'){
            if (typeof (data.data) === 'string') data.data = JSON.parse(data.data)
            Responses[data.id].status(200).json(data.data);
            delete Responses[data.id];
        }
        else if(data.type === 'Fetch'){
            if (typeof (data.data) === 'string') data.data = JSON.parse(data.data)
            Responses[data.id].status(200).json(data.data);
            delete Responses[data.id];
        }
    }
}


const PORT = process.env.tcpPort || 4556

server.listen(PORT, () => {
    console.log("Servecies started at "+PORT);
})


function randomIdGen():string{
    return `${Date.now()}-${(Math.floor(Math.random()*1000000+1000000))}`;
}