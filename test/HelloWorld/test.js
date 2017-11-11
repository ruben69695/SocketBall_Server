//ogs test
socket.on('parser_error#21', function(d) {
    console.log("ogs test" + d);
    socket.emit('parser_error#21_response', test_data.ogstestchars);
});

socket.on('d100000chars', function() {
    console.log('d100000chars');
    socket.emit('d100000chars', test_data.d100000chars);
});

socket.on('json10000chars', function() {
    console.log('json10000chars');
    socket.emit('json10000chars', { data: test_data.json10000chars });
});

socket.on('json10000000chars', function() {
    console.log('json10000000chars');
    socket.emit('json10000000chars', {
        data: test_data.d10000000chars,
        data2: test_data.d100000chars,
        data3: test_data.d100000chars,
        data4: { data5: test_data.d100000chars }
    });
});

socket.on('latin', function(wsinput) {
    console.log('issue24 socket.on latin');
    socket.emit('latin', { 'error': 'Nombre de usuario co contraseña incorrecta.' });
});

socket.on('nolatin', function(wsinput) {
    console.log('issue24 socket.on no latin');
    socket.emit('nolatin', { 'error': 'Nombre de usuario o contraseña incorrecta.' });
});

// ack test
socket.on('ack', function() {
    socket.emit('ack', 'hello there', function(a, b) {
        console.log("emit ack2 b=" + JSON.stringify(b));
        if (a === 5 && b.b === true) {
            socket.emit('got it');
        }
    });
});

socket.on('getDate', function() {
    socket.emit('takeDate', new Date());
});

socket.on('getDateObj', function() {
    socket.emit('takeDateObj', { date: new Date() });
});


socket.on('getUtf8', function() {
    socket.emit('takeUtf8', 'てすと');
    socket.emit('takeUtf8', 'Я Б Г Д Ж Й');
    socket.emit('takeUtf8', 'Ä ä Ü ü ß');
    socket.emit('takeUtf8', '李O四');
    socket.emit('takeUtf8', 'utf8 — string');
});

// binary test
socket.on('doge', function() {
    var buf = new Buffer('asdfasdf', 'utf8');
    socket.emit('doge', buf);
});

// expect receiving binary to be buffer
socket.on('buffa', function(a) {
    if (Buffer.isBuffer(a)) {
        socket.emit('buffack');
    }
});


// expect receiving binary with mixed JSON
socket.on('jsonbuff', function(a) {
    expect(a.hello).to.eql('lol');
    expect(Buffer.isBuffer(a.message)).to.be(true);
    expect(a.goodbye).to.eql('gotcha');
    socket.emit('jsonbuff-ack');
});

// expect receiving buffers in order
var receivedAbuff1 = false;
socket.on('abuff1', function(a) {
    expect(Buffer.isBuffer(a)).to.be(true);
    receivedAbuff1 = true;
});
socket.on('abuff2', function(a) {
    expect(receivedAbuff1).to.be(true);
    socket.emit('abuff2-ack');
});

// emit buffer to base64 receiving browsers
socket.on('getbin', function() {
    var buf = new Buffer('asdfasdf', 'utf8');
    socket.emit('takebin', buf);
});

// simple test
socket.on('test', function(d) {
    var s1 = "test " + d;
    console.log(s1);
    fs.appendFileSync(test_txt, s1);
    socket.emit('hi', 'more data');
});