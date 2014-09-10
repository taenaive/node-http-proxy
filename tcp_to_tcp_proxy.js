var net = require('net');

// parse "80" and "localhost:80" or even "42mEANINg-life.com:80"
var addrRegex = /^(([a-zA-Z\-\.0-9]+):)?(\d+)$/;

var addr = {
    from: addrRegex.exec(process.argv[2]),
    to: addrRegex.exec(process.argv[3])
};

if (!addr.from || !addr.to) {
    console.log('Usage: <from> <to>');
    return;
}

net.createServer(function(from) {
    var to = net.createConnection({
        host: addr.to[2],
        port: addr.to[3]
    });
    from.pipe(to);
    to.pipe(from);
}).listen(addr.from[3], addr.from[2]);

//example
//To forward from localhost:9001 => localhost:80
//$ sudo node proxy.js 9001 80
//To forward UCM localhost:4444 => 192.168.0.3:80
//$ sudo node proxy.js localhost:4444 192.168.0.3:4444
