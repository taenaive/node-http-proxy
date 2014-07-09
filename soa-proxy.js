var https = require('https'),
    http  = require('http'),
    util  = require('util'),
    path  = require('path'),
    fs    = require('fs'),
    fixturesDir = path.join(__dirname, 'test', 'fixtures'),
    httpProxy = require('./lib/http-proxy');
//    httpProxyToSoa = require('./lib/http-proxy');
//
// Setup proxy server with forwarding (http 8001 to https 8002)
//
// httpProxy.createServer({
//   forward: {
//     port: 8001,
//     host: '192.168.0.6'
//   }
// }).listen(8001);

http.createServer(function (req, res) {
  res.writeHead(301, { 'Content-Type': 'text/plain' , 
                       'Location'    : 'https://'+'192.168.0.6'+req.url});
  
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
}).listen(443);

util.puts('http proxy server ' + 'started '+ 'on port ' + '8001 ' + 'with forward proxy');