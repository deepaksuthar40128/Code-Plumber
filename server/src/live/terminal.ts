import fs from 'node:fs'
import { spawn } from 'node:child_process' 
import { rpcSocket } from ".."; 
import process from 'node:process'

type incomingData = {
    type: "Socket",
    event: "initiate",
    data: string,
    socketId: string
}


type processDBType = {
    [key: string]: any
}


const processDB: processDBType = {}
const outputs: { [key: string]: string } = {};
const cppLiveContainerID = process.env.cppLiveContainerID || '';

export const handleSocket = (data: incomingData) => {
    if (data.event === 'initiate') {
        let rdata = JSON.parse(data.data)
        if (rdata.file && rdata.file.length) {
            fs.lstat(rdata.file, (err, state) => {
                if (err || !state.isFile()) {
                    disconnectServer(data.socketId, "File Error");
                    return;
                }
                handleFileExec(data);
            })
        }
        else {
            disconnectServer(data.socketId, "Invalid File path");
        }
    }
    else if (data.event === 'input') {
        processDB[data.socketId].stdin.write(data.data);
        emitMessage(data.socketId, '', 'ignore');
        outputs[data.socketId] = '';
    }
    else if (data.event === 'disconnect') {
        processDB[data.socketId].kill();
        delete processDB[data.socketId];
        delete outputs[data.socketId];
    }
}


function socketSend(msz: string) {
    msz += '$end$'
    rpcSocket.write(msz);
}


function disconnectServer(socketId: string, msz: string) {
    socketSend(JSON.stringify({ type: "Socket", event: 'disconnect', socketId: socketId, data: msz }))
}

function emitMessage(socketId: string, msz: string, event: string) {
    socketSend(JSON.stringify({ type: "Socket", event, socketId, data: msz }))
}

const handleFileExec = (data: incomingData) => {
    let rdata = JSON.parse(data.data)
    let fileName = (rdata.file as string).split('/').pop(); 
    const process = spawn('docker', [
        'exec', '-i', 
        cppLiveContainerID,
        'sh', '-c', 'runEnv/'+fileName
      ]); 
    processDB[data.socketId] = process;
    outputs[data.socketId] = '';
    emitMessage(data.socketId, '', 'ignore');
    process.on('error', (err) => {
        console.log(err)
        disconnectServer(data.socketId, "Error during spawing process!!");
        fs.rmSync(rdata.file);
    })
    process.on('exit', () => {
        fs.rmSync(rdata.file);
        setTimeout(() => {
            disconnectServer(data.socketId, "Execution Completed!");
        }, 1000);
    })

    process.stderr.on('data', (chunk) => {
        disconnectServer(data.socketId, chunk.toString());
    })
    process.stdout.on('data', (chunk) => {
        if (chunk.toString().length > 5000 || outputs[data.socketId].length > 5000) {
            emitMessage(data.socketId, '\n\n\nBuffer Overflow\n', 'data');
            process.kill();
        } else {
            outputs[data.socketId] += chunk.toString();
            emitMessage(data.socketId, outputs[data.socketId], 'data');
        }
    })
}