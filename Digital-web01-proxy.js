var https = require('https'),
    http  = require('http'),
    util  = require('util'),
    path  = require('path'),
    fs    = require('fs'),
    fixturesDir = path.join(__dirname, 'test', 'fixtures'),
    httpProxy = require('./lib/http-proxy');
 
 //forward to web01's https proxy in the browser
 var server1 =http.createServer(function (req, res) {
  //get rid of port number
  var index =req.headers.host.indexOf(":");
  var hostnameOnly = req.headers.host.substr(0,index);
  // console.log('Digital-web01-8892 hostname : ' +req.headers.host +"  "+hostnameOnly); 
  // console.log('Digital-web01-8892 url part: '+ req.url);
  res.writeHead(301, { 'Content-Type': 'text/plain' , 
                       'Location'    : 'https://'+hostnameOnly+req.url});
  												//198.135.15.93 for dev, 198.135.15.19 for test
     res.end('Redirecting to Web01\n');
  }).listen(8892);
 // web01 , SOA
 var server2 = http.createServer(function (req, res) {
   if(req.headers.host == null){ res.end('Something went wrong.Host not found.'); return;}
  var soa_bool = req.headers.host.match(/soa/i);
   if (soa_bool){
    res.writeHead(301, { 'Content-Type': 'text/plain' , 
                       'Location'    : 'https://'+req.headers.host+':3001'+req.url});
                          //198.135.15.93 for dev, 198.135.15.19 for test
     res.end('Redirecting to Soa\n');
  }
  else{//default
    res.writeHead(301, { 'Content-Type': 'text/plain' , 
                       'Location'    : 'https://'+req.headers.host+req.url});
                          //198.135.15.93 for dev, 198.135.15.19 for test
     res.end('Redirecting to Web01\n');
   }

  }).listen(80);
  //SOA
  var server3 =http.createServer(function (req, res) {
  //get rid of port number
  var index =req.headers.host.indexOf(":");
  var hostnameOnly = req.headers.host.substr(0,index);
  res.writeHead(301, { 'Content-Type': 'text/plain' , 
                       'Location'    : 'https://'+hostnameOnly+':3001'+req.url}); //...18 for Test
  
     res.end('Redirecting to SOA\n');
  }).listen(8001);

   //forward to web01's https proxy in the browser
  var soa_http_server16200 =http.createServer(function (req, res) {
  //get rid of port number
  var index =req.headers.host.indexOf(":");
  var hostnameOnly = req.headers.host.substr(0,index);
  res.writeHead(301, { 'Content-Type': 'text/plain' , 
                       'Location'    : 'https://'+hostnameOnly+':3002'+req.url});
                          //198.135.15.93 for dev, 198.135.15.19 for test
     res.end('Redirecting to Web01\n');
  }).listen(16200);

  server1.on('error', function (e) {
  console.log('crash on port 8892');
  // Handle your error here
  console.log(e);
  });
  server2.on('error', function (e) {
    console.log('crash on port 80');
  // Handle your error here
  console.log(e);
  });
  server3.on('error', function (e) {
    console.log('crash on port 80');
  // Handle your error here
  console.log(e);
  });
  soa_http_server16200.on('error', function (e) {
    console.log('crash on port 16200');
  // Handle your error here
  console.log(e);
  });
//
// proxy HTTPS to Web01 internal ip
//
var web01Proxy =httpProxy.createServer({
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
//
// Create the HTTPS proxy server listening on port 8002 to SOA server()
//
var soaProxy =httpProxy.createServer({
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

var web01Proxy16200 =httpProxy.createServer({
  target: {
    host: '192.168.0.3',
    port: 16200
  },
  ssl: {
    cert : fs.readFileSync(path.join(__dirname, './fakecerts/ca2/', 'server2.crt')),
     key  : fs.readFileSync(path.join(__dirname, './fakecerts', 'server.key')),
     ca   : fs.readFileSync(path.join(__dirname, './fakecerts/ca2/', 'ca2.crt')),
     passphrase: 'tae123456'
  }
}).listen(3002);

// Listen for the `error` event on `proxy`.
web01Proxy.on('error', function (err, req, res) {
  console.log("Proxy failed to connect to the Target URL=https://" + req.headers.host);
  res.writeHead(500, {
    'Content-Type': 'text/plain'
  });
  res.end('Web01 went wrong. :-( \n' + "Proxy failed to connect to the Target URL=https://" + req.headers.host);
});
soaProxy.on('error', function (err, req, res) {
  console.log("Proxy failed to connect to the Target URL=https://" + req.headers.host);
  res.writeHead(500, {
    'Content-Type': 'text/plain'
  });
  res.end('SOA went wrong. :-( \n' + "Proxy failed to connect to the Target URL=https://" + req.headers.host);
});
web01Proxy16200.on('error', function (err, req, res) {
  console.log("Proxy failed to connect to the Target URL=https://" + req.headers.host);
  res.writeHead(500, {
    'Content-Type': 'text/plain'
  });
  res.end('SOA 16200 went wrong. :-( \n' + "Proxy failed to connect to the Target URL=https://" + req.headers.host);
});

util.puts('http proxy server ' + 'started '+ 'on port ' + '80,8892 ->443 ');