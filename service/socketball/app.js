var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
const _PORT = 3000;


server.listen(_PORT, function () {
    console.log('Socket running on http://*:%s', _PORT);
});

io.sockets.on('connection', function (socket) {
    console.log("A client with IP %s has connected to the socket", socket.conn.remoteAddress);
   //socket.emit('helloClient', "{ text: 'Hello Client!' }");

    /*
    socket.on('helloServer', function (data) {
        if (data != null) {
            var d = JSON.parse(data);
            if (d != "") {
                console.log("Received from client: %s", d.text);
            }
        }
    }); */

    socket.on('disconnect', function () {
        console.log("The client with IP %s has disconnected from the server", socket.conn.remoteAddress);
    });

});