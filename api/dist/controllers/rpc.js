"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Services = void 0;
const node_net_1 = __importDefault(require("node:net"));
const route_1 = require("../routes/route");
const socket_1 = require("./socket");
exports.Services = [];
const server = node_net_1.default.createServer(socket => {
    socket.on('close', () => {
        console.log("Client Disconnected!!");
    });
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
    });
});
function handleSocketData(rawData, socket) {
    let data = JSON.parse(rawData);
    if (data) {
        if (data.type === 'Startup') {
            exports.Services.push({
                type: data.service,
                Socket: socket
            });
        }
        else if (data.type === 'result') {
            if (typeof (data.data) === 'string')
                data.data = JSON.parse(data.data);
            route_1.Responses[data.id].status(data.data.statusCode).json(data.data);
            delete route_1.Responses[data.id];
        }
        else if (data.type === 'Socket') {
            (0, socket_1.handleSocketEvents)(JSON.stringify(data));
        }
    }
}
server.listen(4555, () => {
    console.log("Servecies started at 4555");
});
