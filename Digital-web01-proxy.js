var https = require('https'),
    http  = require('http'),
    http2  = require('http'),
    util  = require('util'),
    path  = require('path'),
    fs    = require('fs'),
    fixturesDir = path.join(__dirname, 'test', 'fixtures'),
    httpProxy = require('./lib/http-proxy');
//forward to web01's https proxy in the browser
 http.createServer(function (req, res) {
  res.writeHead(301, { 'Content-Type': 'text/plain' , 
                       'Location'    : 'https://'+'198.135.14.61'+req.url});
  												//198.135.15.93 for dev, 198.135.15.19 for test
     res.end('Redirecting to Web01\n');
  }).listen(8892);

 http2.createServer(function (req, res) {
  res.writeHead(301, { 'Content-Type': 'text/plain' , 
                       'Location'    : 'https://'+'198.135.14.61'+req.url});
                          //198.135.15.93 for dev, 198.135.15.19 for test
     res.end('Redirecting to Web01\n');
  }).listen(80);
//
// proxy HTTPS to Web01 internal ip
//
httpProxy.createServer({
  target: {
    host: '192.168.0.3',
    port: 8892
  },
  changeOrigin: false,
  ssl: {
    cert : fs.readFileSync(path.join(__dirname, './fakecerts/ca2/', 'server2.crt')),
     key  : fs.readFileSync(path.join(__dirname, './fakecerts', 'server.key')),
     ca   : fs.readFileSync(path.join(__dirname, './fakecerts/ca2/', 'ca2.crt')),
     passphrase: 'tae123456'
  }
}).listen(443);

util.puts('http proxy server ' + 'started '+ 'on port ' + '80,8892 ->443 ');