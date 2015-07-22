var express = require('express');
var app = express();
var io = require('socket.io').listen(1234),
    logger = require('winston'),
    program = require('commander');


//
// SETUP
//

logger.cli();
logger.default.transports.console.timestamp = true;

program.version('0.1')
    .option('-p, --port [num]', 'Set the server port (default 8080)')
    .option('-H, --disableheartbeats', 'Disable heartbeats')
    .parse(process.argv)

var server = "localhost";
if(program.args.length==1) {
    server = program.args[0];
} else if (program.args.length==0) {
    logger.warn("Defaulting to localhost.");
}

var port = 8080;
if(program.port) {
    logger.info("Setting port to " + program.port);
    port = program.port;
}

app.listen(port);

if(program.disableheartbeats) {
    io.set("heartbeats", false)
}


//
// LISTENERS
//

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});


//
// GLOBALS
//
var connectedUsersCount = 0;
var messagesPerSecond = 0;

io.sockets.on('connection', function(socket) {
  // console.log("connection");
    connectedUsersCount++;
    socket.on('chat', function(data) {
        // logger.info("chat message arrived");
        // console.log(data);
        if (data != null) {
          io.emit('chat', {text:data.text});
          messagesPerSecond++;
        }

    });

    socket.on('disconnect', function(data) {
        // console.log("disconnect");
        connectedUsersCount--;
    });
});

setTimeout(logStatus, 1000);

//
// FUNCTIONS
//

function logStatus() {
    setTimeout(logStatus, 1000);


    logger.info("users: " + connectedUsersCount + "\tmessagesPerSecond: " + messagesPerSecond);
    messagesPerSecond = 0;
}
