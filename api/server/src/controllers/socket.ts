import { Server, Socket } from "socket.io";
import fs from 'node:fs'
import { spawn } from 'node:child_process'
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
    Services.map(service => {
        if (service.type === "Node") {
            service.Socket.write(JSON.stringify({
                type: "Socket",
                event,
                socketId: socket.id,
                data
            }))
        }
    })
}

export function handleSocketEvents(rawData: string) {
    let data = JSON.parse(rawData); 
    if (data.event === 'disconnect') {
        sockets[data.socketId].disconnect();
    }
    else if (data.event === 'ignore') {
        sockets[data.socketId].emit('data',data.data);
    }
    else if (data.event === 'data') {
        
        sockets[data.socketId].emit('data',data.data);
    }
}