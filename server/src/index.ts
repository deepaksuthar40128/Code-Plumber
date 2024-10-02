import net from "node:net";
import { Maneger } from "./routes/compilerRouter";
import { handleSocket } from "./live/terminal";

// const serverOptions = {
//   host: "127.0.0.1",
//   port: 4555
// };
const serverOptions = {
  host: "nginx",
  port: 4555
};
export let rpcSocket:net.Socket;
function connectToServer() {
  const rpcServer = net.connect(serverOptions, ()=>{
    console.log("Connected to services on 4555");
    rpcSocket = rpcServer;
    rpcServer.write(JSON.stringify({ type: "Startup", service: "Node" }) + '$end$');
  });

  rpcServer.on('close', () => {
    console.log("Service disconnected from 4555. Retrying in 10 seconds...");
    setTimeout(connectToServer, 10000);   
  });

  rpcServer.on('data', async (msz) => {
    let data = JSON.parse(msz.toString());
    if (data.type === 'Compile') {
      let res = await Maneger(data.data);
      rpcServer.write(JSON.stringify({ type: 'result', id: data.id, data: res }) + '$end$');
    }
    else if (data.type === 'Socket') {
      handleSocket(data);
    }
  });
 
  rpcServer.on('error', (err) => {
    console.log(`Connection error: ${err.message}. Retrying in 10 seconds...`);
    rpcServer.destroy();    
  });
}

connectToServer();
