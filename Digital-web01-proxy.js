var https = require('https'),
    http  = require('http'),
    //http2  = require('http'),
    util  = require('util'),
    path  = require('path'),
    fs    = require('fs'),
    fixturesDir = path.join(__dirname, 'test', 'fixtures'),
    httpProxy = require('./lib/http-proxy');
//forward to web01's https proxy in the browser
 http.createServer(function (req, res) {
  //get rid of port number
  var index =req.headers.host.indexOf(":");
  var hostnameOnly = req.headers.host.substr(0,index);
  console.log('Digital-web01-8892 hostname : ' +req.headers.host); 
  console.log('Digital-web01-8892 url part: '+ req.url);
  res.writeHead(301, { 'Content-Type': 'text/plain' , 
                       'Location'    : 'https://'+hostnameOnly+req.url});
  												//198.135.15.93 for dev, 198.135.15.19 for test
     res.end('Redirecting to Web01\n');
  }).listen(8892);

 http.createServer(function (req, res) {
  //get rid of port number
  var index =req.headers.host.indexOf(":");
  var hostnameOnly = req.headers.host.substr(0,index);
  console.log('Digital-web01-80 hostname : ' +req.headers.host); 
  console.log('Digital-web01-80 url part: '+ req.url);
  //router
  var soa_bool = hostnameOnly.match(/soa/i);
  if (soa_bool){
    res.writeHead(301, { 'Content-Type': 'text/plain' , 
                       'Location'    : 'https://'+hostnameOnly+':3001'+req.url});
                          //198.135.15.93 for dev, 198.135.15.19 for test
     res.end('Redirecting to Soa\n');
  }
  else{//default
    res.writeHead(301, { 'Content-Type': 'text/plain' , 
                       'Location'    : 'https://'+hostnameOnly+req.url});
                          //198.135.15.93 for dev, 198.135.15.19 for test
     res.end('Redirecting to Web01\n');
   }

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