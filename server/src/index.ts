import net from "node:net"
import { Maneger } from "./routes/compilerRouter";
import { handleSocket } from "./live/terminal";
export const rpcServer = net.connect({
  host: "api-service",
  port: 4555
}, handleConnection)

function handleConnection() {
  rpcServer.write((JSON.stringify({ type: "Startup", service: "Node" }) + '$end$'));
  console.log("connected to servecies on 4555");
}

rpcServer.on('close', () => {
  console.log("service disconnected to 4555")
})


rpcServer.on('data', async (msz) => {
  let data = JSON.parse(msz.toString());
  if (data.type === 'Compile') {
    let res = await Maneger(data.data);
    rpcServer.write((JSON.stringify({ type: 'result', id: data.id, data: res }) + '$end$'));
  }
  else if (data.type === 'Socket') {
    handleSocket(data);
  }
})