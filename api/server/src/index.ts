import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from 'node:path'
import http from 'node:http'
import routes from './routes/route'
const app = express();
import { Server } from 'socket.io'
import { ioFunction } from "./controllers/socket";
const server = http.createServer(app)
const origins = ["http://localhost:5173", "https://code-plumber.vercel.app"];
// import { rateLimit } from 'express-rate-limit'
const io = new Server(server, {
    cors: {
        origin: origins
    }
})
ioFunction(io);


// const limiter = rateLimit({
//     windowMs: 60 * 1000,
//     limit: 12,
//     standardHeaders: 'draft-7',
//     legacyHeaders: false,
//     skip: (req) => {
//         if (req.url.match(/\.(js|css|jpg|png|svg|ico|woff|woff2|ttf)$/)) return true;
//         return false;
//     }
// })

// app.use(limiter)


app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.resolve(__dirname + '/../../client/dist/')));
app.use(cors({
    credentials: true,
    origin: origins
}));



// Test github webhook 
import SmeeClient from 'smee-client'
import { client, computeHash } from "./controllers/redeply";
if (!process.env.PRODUCTION) {
    const smee = new SmeeClient({
        source: 'https://smee.io/F7bGwtNjNp8kNkjg',
        target: 'http://localhost:4320/update-build-image',
        logger: console
    })
    smee.start();
}

app.post('/update-build-image', (req: Request, res: Response) => {
    try {
        if (req.body?.hook?.events?.includes('push')) {
            const headers = req.headers;
            const hash = (headers['x-hub-signature-256'] as string).split('=').pop();
            const password = computeHash(JSON.stringify(req.body));
            if (client && hash === password)
                client.write('Rebuild');
            else console.log("No listener for redeploy event!");
            res.json({ success: true, msz: "Action" });
        } else {
            res.json({ success: true, msz: "ignore" });
        }
    } catch (err) {
        console.log("Error During Redeploying..." + err);
    }
})
app.use('/compiler', routes);

app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.resolve(path.resolve() + '/../client/dist/index.html'))
})




server.listen(4320, () => {
    console.log("http://localhost:4320");
});
