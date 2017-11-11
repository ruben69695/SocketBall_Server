var express = require('express');
var app = express(); 
var server = require('http').Server(app);
var io = require('socket.io')(server);


server.listen(8080, function () {
    console.log('Servidor corriendo en http://*:8080');
});

io.sockets.on('connection', function (socket) {
    console.log("Un cliente con IP %s has connected to the socket", socket.client.conn.remoteAddress);
    socket.emit('helloClient', "{ text: 'Hello Client!' }");

    socket.on('helloServer', function (data) {
        if (data != null) {
            var d = JSON.parse(data);
            if (d != "") {
                console.log("Received from client: %s", d.text);
            }
        }
    });

    socket.on('disconnect', function () {
        console.log("Cliente con IP %s se ha desconectado del socket", socket.conn.remoteAddress);
    });

});



