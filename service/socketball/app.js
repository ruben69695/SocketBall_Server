'use strict';

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var sem = require('semaphore')(1);
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
        enterToSemaphore("selectPosition", json);
    });
    socket.on('disconnect', function () {
        enterToSemaphore("disconnect", "");
    });

    /**
     * Función que controla con un semaforo los accesos a elegir posición y desconectarse
     * @param {Elegir operación} operation 
     * @param {Información a pasarle a la función en formato json u otro formato} json 
     */
    function enterToSemaphore(operation, json) {

        sem.take(1, function() {
            switch (operation) {
                case "selectPosition":
                    console.log("Función select position");
                    selectPosition(json);
                break;
                case "disconnect":
                    console.log("Función disconnect");
                    disconnectClient();
                break;
                default:
                    console.log("Ha entrado en el default");
                    break;
            }
            sem.leave(1);
        });

    }

    /**
     * Función que permite escoger una posición definida en el JSON y avisa a los vecinos de los cambios pertinentes
     * @param {Información en json sobre la partida} json 
     */
    function selectPosition(json) {
        var data = JSON.parse(json);
        var vecinoIzquierdo = { "pos": "I", "cliente": null };
        var vecinoDerecho = { "pos": "D", "cliente": null };
        
        // Listas coinciden
        if (JSON.stringify(data.pcs) == JSON.stringify(clientList))
        {
            // Guardamos cliente en la posic�n deseada en la lista
            clientList.splice(data.pos, 0, data.cliente);

            // Guardamos el socket en la posici�n deseada en la lista de sockets
            socketList.splice(data.pos, 0, socket);

            thisCliente = data.cliente;

            // Avisamos a los vecinos de que tienen un nuevo vecino, solo cuando haya mas de 1 jugador en la partida
            if (clientList.length > 1) 
            {
                // No eres �ltimo o wall es 0
                if (clientList.length - 1 != data.pos || wall == 0)
                {
                    // Avisamos al vecino derecho de que somos su izquierdo
                    var nuevoVecinoIzquierdo = {
                        "pos": "I",
                        "cliente": thisCliente
                    };

                    // Comprobamos si el usuario actual es el ultimo y wall 0 para enviar la notificacion al primero de la lista, si no, notificamos al siguiente de nuestra posici�n actual
                    if (clientList.length - 1 == data.pos && wall == 0)
                    {
                        socketList[0].emit('neighborChange', JSON.stringify(nuevoVecinoIzquierdo));
                        vecinoDerecho.cliente = clientList[0];
                    }         
                    else
                    {
                        socketList[data.pos + 1].emit('neighborChange', JSON.stringify(nuevoVecinoIzquierdo));
                        vecinoDerecho.cliente = clientList[data.pos + 1];
                    }
                }

                // Si no eres el primero o walles es 0
                if (data.pos != 0 || wall == 0)
                {
                    // Avisamos al vecino izquierdo que somos su derecho
                    var nuevoVecinoDerecho = {
                        "pos": "D",
                        "cliente": thisCliente
                    }

                    // Comprobamos si el usuario actual es el primero y wall 0 para enviar la notificacion al ultimo de la lista, si no, notificamos al anterior de nuestra posici�n actual
                    if (data.pos == 0 && wall == 0)
                    {
                        socketList[clientList.length - 1].emit('neighborChange', JSON.stringify(nuevoVecinoDerecho));
                        vecinoIzquierdo.cliente = clientList[clientList.length - 1];
                    }
                    else
                    {
                        socketList[data.pos - 1].emit('neighborChange', JSON.stringify(nuevoVecinoDerecho));
                        vecinoIzquierdo.cliente = clientList[data.pos - 1];
                    }
                }
            }
            else
            {
                wall = data.wall;
            }

            // Enviamos al cliente sus vecinos actuales para que los actualice
            socket.emit('neighborChange', JSON.stringify(vecinoDerecho));
            socket.emit('neighborChange', JSON.stringify(vecinoIzquierdo));                        

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
    }

    /**
     * Función que nos permite desconectarnos del servidor y corregir la array
     */
    function disconnectClient() {
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
            // Vaciamos las arrays de clientes y sockets cuando sale el ultimo cliente
            clientList = [];
            socketList = [];
        }
    }
});