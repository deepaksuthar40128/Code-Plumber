import { Server, Socket } from "socket.io"; 
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { Services } from "./rpc";

let sockets: { [key: string]: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> } = {};
export const ioFunction = (io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
    io.on('connection', (socket) => {
        sockets[socket.id] = socket;
        socket.on('initiate', (msz) => {
            putData(msz, 'initiate', socket);
        })
        socket.on('input', (cmd) => {
            putData(cmd + '\n', 'input', socket);
        })
        socket.on('disconnect', () => {
            putData('', 'input', socket);
        })
    })
}

function putData(data: string, event: string, socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
    if(event=='initiate'){
        let allotedService = Services.getService('Node');
        if(allotedService){
            Services.addSocketService(socket.id,allotedService);
            allotedService.Socket.write(JSON.stringify({
                type: "Socket",
                event,
                socketId: socket.id,
                data
            }))
        }
        else
            socket.disconnect();
    }
    else if(event=='disconnect'){
        let allotedService =  Services.getPreAllocatedService(socket.id);
        if(allotedService){
            allotedService.Socket.write(JSON.stringify({
                type: "Socket",
                event,
                socketId: socket.id,
                data
            }))
            Services.unallocateService(socket.id);
        }
        else 
            socket.disconnect();
    }
    else{
        let allotedService =  Services.getPreAllocatedService(socket.id);
        if(allotedService){
            allotedService.Socket.write(JSON.stringify({
                type: "Socket",
                event,
                socketId: socket.id,
                data
            }))
        }
        else 
            socket.disconnect();
    }
}

export function handleSocketEvents(rawData: string) {
    let data = JSON.parse(rawData); 
    if (data.event === 'disconnect') {
        Services.unallocateService(data.socketId);
        sockets[data.socketId].disconnect();
    }
    else if (data.event === 'ignore' || data.event === 'data') {
        sockets[data.socketId].emit('data',data.data);
    }
}