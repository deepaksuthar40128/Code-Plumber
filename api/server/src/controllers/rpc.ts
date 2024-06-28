import net from "node:net"
import { Responses } from "../routes/route";
import { handleSocketEvents } from "./socket";
type Service = {
    type: "Go1" | "Node" | "Go2",
    Socket: net.Socket
};
export const Services: Service[] = [];
const server = net.createServer(socket => {
    socket.on('close', () => {
        let ind = Services.findIndex(s=>{
            return s.Socket.closed;
        })
        if(ind!=-1){
            Services.splice(ind,1);
        }
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


server.listen(4555, () => {
    console.log("Servecies started at 4555");
})