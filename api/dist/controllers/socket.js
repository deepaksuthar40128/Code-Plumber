"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleSocketEvents = exports.ioFunction = void 0;
const rpc_1 = require("./rpc");
let sockets = {};
const ioFunction = (io) => {
    io.on('connection', (socket) => {
        sockets[socket.id] = socket;
        socket.on('initiate', (msz) => {
            putData(msz, 'initiate', socket);
        });
        socket.on('input', (cmd) => {
            putData(cmd + '\n', 'input', socket);
        });
        socket.on('disconnect', () => {
            putData('', 'input', socket);
        });
    });
};
exports.ioFunction = ioFunction;
function putData(data, event, socket) {
    rpc_1.Services.map(service => {
        if (service.type === "Node") {
            service.Socket.write(JSON.stringify({
                type: "Socket",
                event,
                socketId: socket.id,
                data
            }));
        }
    });
}
function handleSocketEvents(rawData) {
    let data = JSON.parse(rawData);
    if (data.event === 'disconnect') {
        sockets[data.socketId].disconnect();
    }
    else if (data.event === 'ignore') {
        sockets[data.socketId].emit('data', data.data);
    }
    else if (data.event === 'data') {
        sockets[data.socketId].emit('data', data.data);
    }
}
exports.handleSocketEvents = handleSocketEvents;
