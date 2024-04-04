import { Server, Socket } from "socket.io";
import fs from 'node:fs'
import { spawn } from 'node:child_process'
import { DefaultEventsMap } from "socket.io/dist/typed-events";

export const ioFunction = (io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
    io.on('connection', (socket) => {
        socket.on('initiate', (msz) => {
            let data = JSON.parse(msz)
            if (data.file && data.file.length) {
                fs.lstat(data.file, (err, state) => {
                    if (err || !state.isFile()) {
                        socket.disconnect();
                        return;
                    }
                    handleFileExec(data.file, socket);
                })
            }
            else {
                socket.disconnect();
            }
        })
    })
}

const handleFileExec = (file: string, socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
    let process = spawn(file);
    socket.emit('ignore','');
    process.on('error', (err) => {
        console.log(err)
        socket.disconnect();
    })
    process.on('exit', () => {
        socket.disconnect();
    })

    process.stderr.on('data', (chunk) => {
        socket.disconnect();
    })
    process.stdout.on('data', (chunk) => {
        console.log(chunk.toString())
        socket.emit('data', chunk.toString());
    })
    socket.on('input', (cmd) => {
        process.stdin.write(cmd + '\n');
        socket.emit('ignore', '');
    })
}