"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeHash = exports.client = void 0;
const node_net_1 = __importDefault(require("node:net"));
const node_crypto_1 = require("node:crypto");
const server = node_net_1.default.createServer(socket => {
    exports.client = socket;
    console.log('Client connected');
    socket.on('data', data => {
        console.log('socket data: ' + data.toString());
    });
    socket.on('end', () => {
        console.log("Client Disconnected");
    });
    socket.on('error', err => {
        console.error('Socket error:', err.message);
    });
});
server.listen(4330, () => {
    console.log('Server started on port 4330');
});
const computeHash = (payload) => {
    const secret = process.env.SECRET;
    const hash = (0, node_crypto_1.createHmac)('sha256', secret)
        .update(payload)
        .digest('hex');
    return hash;
};
exports.computeHash = computeHash;
