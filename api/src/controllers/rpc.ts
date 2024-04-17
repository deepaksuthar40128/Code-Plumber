import net from "node:net"
import { Responses } from "../routes/route";
import { handleSocketEvents } from "./socket";
type Service = {
    type: "Go" | "Node",
    Socket: net.Socket
};
export const Services: Service[] = [];
const server = net.createServer(socket => {
    socket.on('close', () => {
        console.log("Client Disconnected!!");
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
            Services.push({
                type: data.service,
                Socket: socket
            })
        }
        else if (data.type === 'result') {
            if (typeof (data.data) === 'string') data.data = JSON.parse(data.data)
            Responses[data.id].status(data.data.statusCode).json(data.data);
            delete Responses[data.id];
        }
        else if (data.type === 'Socket') {
            handleSocketEvents(JSON.stringify(data));
        }
    }
}


server.listen(4555, () => {
    console.log("Servecies started at 4555");
})