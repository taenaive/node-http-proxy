//place this to where it is not soa box
var https = require('https'),
    http  = require('http'),
    util  = require('util'),
    path  = require('path'),
    fs    = require('fs'),
    fixturesDir = path.join(__dirname, 'test', 'fixtures'),
    httpProxy = require('./lib/http-proxy');

http.createServer(function (req, res) {
  //get rid of port number
  var index =req.headers.host.indexOf(":");
  var hostnameOnly = req.headers.host.substr(0,index);
  res.writeHead(301, { 'Content-Type': 'text/plain' , 
                       'Location'    : 'https://'+hostnameOnly+':3001'+req.url}); //...18 for Test
  
     res.end('Redirecting to SOA\n');
  }).listen(8001);
//
// Create the HTTPS proxy server listening on port 8002 to SOA server()
//
httpProxy.createServer({
  target: {
    host: '192.168.0.6',
    port: 8001
  },
  ssl: {
    cert : fs.readFileSync(path.join(__dirname, './fakecerts/ca2/', 'server2.crt')),
     key  : fs.readFileSync(path.join(__dirname, './fakecerts', 'server.key')),
     ca   : fs.readFileSync(path.join(__dirname, './fakecerts/ca2/', 'ca2.crt')),
     passphrase: 'tae123456'
  }
}).listen(3001);

util.puts('http proxy server ' + 'started '+ 'on port ' + '3001' + 'with forward proxy(8001)');
