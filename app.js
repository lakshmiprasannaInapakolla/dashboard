
/**
 * Module dependencies.
 */

var express = require('express');
var browserify = require('browserify');
var path = require('path');
var fs = require('fs');
var httpProxy = require('http-proxy');
// var bootware = require('bootware');

// proxy server
httpProxy.createServer(function (req, res, proxy) {
  var _port = 3004;

  if(req.method === 'POST' || req.method === 'PUT') {
    _port = 2403;
  }
  
  proxy.proxyRequest(req, res, {
    host: 'localhost',
    port: _port
  })
})
.listen(3000);

var app = module.exports = express.createServer();
var cp = require('child_process');
var exec = cp.exec;
var spawn = cp.spawn;
var key;

// Generate auth key

exec('dpd key --json', function (err, data) {
  if(err) return console.log(err);
  
  key = data;
})

// Start testing server

var server = spawn('dpd', ['listen', '-p', '2403']);

server.stdout.on('data', function (data) {
  console.log(data.toString());
})

// Configuration

app.configure(function(){
  
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.cookieParser());
  app.use(function(req,res,next) {
    res.cookie('DPDAppUrl', 'http://localhost:2403');
    res.cookie('DPDAuthKey', key);
    next();
  })
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(browserify({entry: path.resolve('./browser-js/entry.js'), mount: '/__dashboard/js/app.js', debug: true, watch: true}));
  app.use('/__dashboard', express.static(__dirname + '/public'));
  app.use('/bootstrap', express.static(__dirname + '/bootstrap'));

  app.set('view options', { layout: false });

  require('./db-routes');
  app.use(app.router);

  var proxy = new httpProxy.RoutingProxy();
  app.use(function(req, res, next) {

    http.request({
      host: 'localhost',
      port: 2403,
      method: req.method,
      path: req.path
    }, function(res) {

    }).end();
    
    proxy.proxyRequest(req, res, {
      host: 'localhost',
      port: 2403
    })
  });

});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

app.helpers({
  template: require('./util/template-html')
});

// Routes

app.get('/', function(req, res) {
  res.redirect('/__dashboard/');
});

app.get('/__dashboard/', function(req, res) {
  // res.redirect('/dashboard');
  res.render('index');
});

// app.get('/dashboard/*', function(req, res) {
//   var resource = '/' + req.params[0];
//   res.render('model-editor', {
//     title: resource + ' - My App Dashboard',
//     appName: 'My App',
//     resourceName: resource,
//     resourceType: 'Collection'
//   });
// });



app.listen(3004);
console.log("Testing dpd dashboard server listening on port %d in %s mode", app.address().port, app.settings.env);

