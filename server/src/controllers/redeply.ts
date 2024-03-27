import net from 'node:net';
import {createHmac} from 'node:crypto';
export let client:net.Socket;
const server = net.createServer(socket => { 
    client = socket;
    console.log('Client connected'); 
 
    socket.on('data', data => {
        console.log(data.toString());
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



export const computeHash = (payload:string):string=>{
    const secret = process.env.SECRET as string | "";
    const hash = createHmac('sha256', secret)
                .update(payload)
                .digest('hex');
    return hash;
}