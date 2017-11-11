var express = require('express');
var app = express();
var expect = require('expect.js');
var path = require('path');
var utf8 = require('utf8');
var util = require('util');
var fs = require('fs');
const _VIEWS = "views";
const _RESOURCES = "resources";
const _PORT = 3000;

var http = require('http').createServer(app);
var io = require('socket.io')(http, { pingInterval: 500 });
var test_data = path.join(__dirname, _RESOURCES, 'test_data.json');
var index_file = path.join(__dirname, _VIEWS, 'index.html');
var test_txt = path.join(__dirname, _RESOURCES, 'test.txt');



http.listen(_PORT, function () {
    console.log('socket.io server listening on port', _PORT);
});

app.get('/', function(req, res) {
    //var indexFile = path.join(__dirname, _VIEWS, 'index.html');
    console.log("Web request from client -> " + req.hostname);
    res.sendFile(index_file);
});

io.on('connection', function(socket) {
    console.log("Client connected: " + socket.client.hostname);
    socket.emit('hi', { text: 'Awww babes, it works...' });

    // simple test
    socket.on('hi', function(d) {
        console.log("hi " + d);
        socket.emit('hi', { text: "hi bitch" });
    });

    socket.on('helloWorld', function(d) {
        console.log("One client a hello world");
        socket.emit('HelloWorld!');
    });
    
    io.of('/foo').on('connection', function () {
        // register namespace
    });

    io.of('/timeout_socket').on('connection', function () {
        // register namespace
    });

    io.of('/valid').on('connection', function () {
        // register namespace
    });

    io.of('/asd').on('connection', function () {
        // register namespace        
    });

});