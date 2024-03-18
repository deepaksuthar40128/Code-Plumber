const { exec } = require("node:child_process");
const net = require("node:net"); 
const retryTime = 10;//sec
const secret = process.env.SECRET;
let sudoPass = process.env.SUDOPASS;  

const action = (data) => {
  data = data.toString();
  console.log(data);
  if (data === "Rebuild")
    exec(
      `echo ${sudoPass} | sudo -S ./run.sh ${secret}`,
      (err, stdout, stderr) => {
        if (err) console.log(err);
        if (stderr) console.log(stderr);
        console.log(stdout);
      }
    );
};

let startingPort = 4331;
const makeClient = () => {
  let localPort = startingPort++;
  return () => {
    const client = () => { 
      connection = net.connect(
        {
          host: "127.0.0.1",
          port: localPort,
        },
        _handleConn
      );
      connection.on("data", (data) => {
        action(data);
      }); 
      connection.on("close", _handleClose); 
      connection.on("error", _handleError);

      function _handleConn() {
        console.log("Connected to server on port " + localPort);
      }
      
      function _handleClose() {
        setTimeout(() => {
          console.log("Retrying connection on port " + localPort);
          client();
        }, retryTime*1000);
      }

      function _handleError() { 
        console.log("Connection Failed on port " + localPort);
      }
    };
    client();
  };
};

let client1 = makeClient();
let client2 = makeClient();
let client3 = makeClient();
let client4 = makeClient();

client1();
client2();
client3();
client4();
