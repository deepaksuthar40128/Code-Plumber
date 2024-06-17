"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const node_path_1 = __importDefault(require("node:path"));
const node_http_1 = __importDefault(require("node:http"));
const route_1 = __importDefault(require("./routes/route"));
const app = (0, express_1.default)();
const socket_io_1 = require("socket.io");
const socket_1 = require("./controllers/socket");
const server = node_http_1.default.createServer(app);
const origins = ["http://localhost:5173", "https://code-plumber.vercel.app"];
const io = new socket_io_1.Server(server, {
    cors: {
        origin: origins
    }
});
(0, socket_1.ioFunction)(io);
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.static(node_path_1.default.resolve(__dirname + '/../../client/dist/')));
app.use((0, cors_1.default)({
    credentials: true,
    origin: origins
}));
// Test github webhook 
const smee_client_1 = __importDefault(require("smee-client"));
const redeply_1 = require("./controllers/redeply");
if (!process.env.PRODUCTION) {
    const smee = new smee_client_1.default({
        source: 'https://smee.io/F7bGwtNjNp8kNkjg',
        target: 'http://localhost:4320/update-build-image',
        logger: console
    });
    smee.start();
}
app.post('/update-build-image', (req, res) => {
    try {
        if (req.body?.hook?.events?.includes('push')) {
            const headers = req.headers;
            const hash = headers['x-hub-signature-256'].split('=').pop();
            const password = (0, redeply_1.computeHash)(JSON.stringify(req.body));
            if (redeply_1.client && hash === password)
                redeply_1.client.write('Rebuild');
            else
                console.log("No listener for redeploy event!");
            res.json({ success: true, msz: "Action" });
        }
        else {
            res.json({ success: true, msz: "ignore" });
        }
    }
    catch (err) {
        console.log("Error During Redeploying..." + err);
    }
});
app.use('/compiler', route_1.default);
app.get('*', (req, res) => {
    res.sendFile(node_path_1.default.resolve(node_path_1.default.resolve() + '/../client/dist/index.html'));
});
server.listen(4320, () => {
    console.log("http://localhost:4320");
});
