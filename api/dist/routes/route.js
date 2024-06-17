"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Responses = void 0;
const express_1 = __importDefault(require("express"));
const rpc_1 = require("../controllers/rpc");
const app = (0, express_1.default)();
exports.Responses = {};
const IDGenrator = () => {
    let reqId = `${Math.floor(1000000 + 1000000 * Math.random())}${Date.now()}`;
    return reqId;
};
app.post('/run', (req, res) => {
    const data = req.body;
    let reqId = IDGenrator();
    console.log(reqId);
    rpc_1.Services.map(service => {
        if (service.type === "Go") {
            console.log("Writing to go service");
            service.Socket.write(JSON.stringify({
                type: "Run",
                id: reqId,
                data
            }));
            exports.Responses[reqId] = res;
        }
    });
});
app.post('/compile', (req, res) => {
    const data = req.body;
    let reqId = IDGenrator();
    rpc_1.Services.map(service => {
        if (service.type === "Node") {
            service.Socket.write(JSON.stringify({
                type: "Compile",
                id: reqId,
                data
            }));
            exports.Responses[reqId] = res;
        }
    });
});
exports.default = app;
