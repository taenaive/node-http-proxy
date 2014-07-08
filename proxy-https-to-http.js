/*
  proxy-https-to-http.js: Basic example of proxying over HTTPS to a target HTTP server

  Copyright (c) Nodejitsu 2013

  Permission is hereby granted, free of charge, to any person obtaining
  a copy of this software and associated documentation files (the
  "Software"), to deal in the Software without restriction, including
  without limitation the rights to use, copy, modify, merge, publish,
  distribute, sublicense, and/or sell copies of the Software, and to
  permit persons to whom the Software is furnished to do so, subject to
  the following conditions:

  The above copyright notice and this permission notice shall be
  included in all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
  LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
  OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
  WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

var https = require('https'),
    http  = require('http'),
    util  = require('util'),
    path  = require('path'),
    fs    = require('fs'),
    //colors = require('colors'), //deprecated
    httpProxy = require('./lib/http-proxy'),
    fixturesDir = path.join(__dirname, 'test', 'fixtures');

    
//
// Create the target HTTP server 
//
http.createServer(function (req, res) {
  res.writeHead(301, { 'Content-Type': 'text/plain' , 
                       'Location'    : 'https://'+req.headers.host+req.url});
  
     res.end('Redirecting to SSL\n');
  }).listen(80);

//
// Create the HTTPS proxy server listening on port 8000
//
httpProxy.createServer({
  target: {
    host: '192.168.0.3',
    port: 8892
  },
  ssl: {
    key: fs.readFileSync(path.join(fixturesDir, 'agent2-key.pem'), 'utf8'),
    cert: fs.readFileSync(path.join(fixturesDir, 'agent2-cert.pem'), 'utf8')
  }
}).listen(8000);

util.puts('https proxy server'+ ' started ' + 'on port ' + '443');
// //
// // Setup proxy server with forwarding (http 8001 to https 8002)
// //
// httpProxy.createServer({
//   forward: {
//     port: 8002,
//     host: '127.0.0.1'
//   }
// }).listen(8001);

// //
// // Create the HTTPS proxy server listening on port 8002 to SOA server()
// //
// httpProxy.createServer({
//   target: {
//     host: '192.168.0.6',
//     port: 8001
//   },
//   ssl: {
//     key: fs.readFileSync(path.join(fixturesDir, 'agent2-key.pem'), 'utf8'),
//     cert: fs.readFileSync(path.join(fixturesDir, 'agent2-cert.pem'), 'utf8')
//   }
// }).listen(8002);
