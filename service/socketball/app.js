'use strict';

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var Client = require("./classes/client.js");
const _PORT = 3000;

var clientList = [];
var socketList = [];
var wall = 1;

server.listen(_PORT, function () {
    console.log('Socket running on http://*:%s', _PORT);
});

io.sockets.on('connection', function (socket) {

    var thisCliente;

    console.log("A client with IP %s has connected to the socket", socket.conn.remoteAddress);

    if (clientList.indexOf(thisCliente) == -1) {

        var infoPartida = {
            "wall": wall,
            "pcs": clientList
        }

        socket.emit('gameInfo', infoPartida);
    }

    socket.on('selectPosition', function (json) {
        var data = JSON.parse(json);

        // Listas coinciden
        if (JSON.stringify(data.pcs) == JSON.stringify(clientList))
        {
            // Guardamos cliente en la posicón deseada en la lista
            clientList.splice(data.pos, 0, data.cliente);

            // Guardamos el socket en la posición deseada en la lista de sockets
            socketList.splice(data.pos, 0, socket);

            thisCliente = data.cliente;

            // Avisamos a los vecinos de que tienen un nuevo vecino, solo cuando haya mas de 1 jugador en la partida
            if (clientList.length > 1) 
            {
                // No eres último o wall es 0
                if (clientList.length - 1 != data.pos || wall == 0)
                {
                    // Avisamos al vecino derecho de que somos su izquierdo
                    var nuevoVecinoIzquierdo = {
                        "pos": "I",
                        "cliente": thisCliente
                    }

                    // Comprobamos si el usuario actual es el ultimo y wall 0 para enviar la notificacion al primero de la lista, si no, notificamos al siguiente de nuestra posición actual
                    if (clientList.length - 1 == data.pos && wall == 0)         
                        socketList[0].emit('neighborChange', JSON.stringify(nuevoVecinoIzquierdo));
                    else
                        socketList[parseInt(data.pos) + 1].emit('neighborChange', JSON.stringify(nuevoVecinoIzquierdo));
                }

                // Si no eres el primero o walles es 0
                if (data.pos != 0 || wall == 0)
                {
                    // Avisamos al vecino izquierdo que somos su derecho
                    var nuevoVecinoDerecho = {
                        "pos": "D",
                        "cliente": thisCliente
                    }

                    // Comprobamos si el usuario actual es el primero y wall 0 para enviar la notificacion al ultimo de la lista, si no, notificamos al anterior de nuestra posición actual
                    if (data.pos == 0 && wall == 0)
                        socketList[clientList.length - 1].emit('neighborChange', JSON.stringify(nuevoVecinoDerecho));
                    else
                        socketList[parseInt(data.pos) + 1].emit('neighborChange', JSON.stringify(nuevoVecinoDerecho));
                }
            }

            // Enviamos mensajes al cliente de que todo es correcto.
            socket.emit('positionConfirmed', "");
        }
        else
        {
            var reInfoPartida = {
                "wall": wall,
                "pcs": clientList
            }

            socket.emit('gameInfo', reInfoPartida);
        }
    });
    socket.on('disconnect', function () {
        console.log("The client with IP %s has disconnected from the server", socket.conn.remoteAddress);

        if (clientList.length > 1)
        {
            var i = clientList.indexOf(thisCliente);

            // si no es ni el primero ni el ultimo
            if (i != clientList.length - 1 && i != 0) {
                //avisamos que de los nuevos vecinos
                var rigthNeighbor = {
                    "pos": "D",
                    "cliente": clientList[i + 1]
                };

                socketList[i - 1].emit('neighborChange', rigthNeighbor);

                var leftNeighbor = {
                    "pos": "I",
                    "cliente": clientList[i - 1]
                };

                socketList[i + 1].emit('neighborChange', leftNeighbor);

                clientList.splice(i, 1);
                socketList.splice(i, 1);
            } else {
                //si es el primero
                if (i == 0) {
                    if (wall == 0) {
                        //es el primero y no hay wall
                        //avisamos que de los nuevos vecinos
                        var rigthNeighbor = {
                            "pos": "D",
                            "cliente": clientList[i + 1]
                        };

                        socketList[clientList.length - 1].emit('neighborChange', rigthNeighbor);

                        var leftNeighbor = {
                            "pos": "I",
                            "cliente": clientList[clientList.length - 1]
                        };

                        socketList[i + 1].emit('neighborChange', leftNeighbor);

                        clientList.splice(i, 1);
                        socketList.splice(i, 1);
                    } else {
                        //es el primero y si hay wall
                        var leftNeighbor = {
                            "pos": "I",
                            "cliente": null
                        };

                        socketList[i + 1].emit('neighborChange', leftNeighbor);

                        clientList.splice(i, 1);
                        socketList.splice(i, 1);
                    }
                } else {
                    //es el ultimo
                    if (wall == 0) {
                        //es el ultimo y no hay wall
                        var rigthNeighbor = {
                            "pos": "D",
                            "cliente": clientList[0]
                        };

                        socketList[i - 1].emit('neighborChange', rigthNeighbor);

                        var leftNeighbor = {
                            "pos": "I",
                            "cliente": clientList[i - 1]
                        };

                        socketList[0].emit('neighborChange', leftNeighbor);

                        clientList.splice(i, 1);
                        socketList.splice(i, 1);
                    } else {
                        //es el ultimo y si hay wall
                        var rigthNeighbor = {
                            "pos": "D",
                            "cliente": null
                        };

                        socketList[i - 1].emit('neighborChange', rigthNeighbor);

                        clientList.splice(i, 1);
                        socketList.splice(i, 1);
                    }
                }
            }
        }
        else
        {
            clientList = [];
            socketList = [];
        }
    });

});