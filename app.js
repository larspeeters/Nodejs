
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var jade = require("jade");
var mongoose = require('mongoose');
var user = require('./routes/user');
var app = express();
var http = require('http');

var path = require('path');
var mysql =  require('mysql');



// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var io = require('socket.io').listen(server);

// development only
var connection =  mysql.createConnection({
  	host : 'localhost',
  	user : 'root',
  	password: 'A123456)'
});

if ('development' == app.get('env')) {
  app.use(express.errorHandler());

}

app.get('/', function(req, res){
  res.render('index.jade');
});

io.sockets.on('connection', function(socket){
	socket.on('send message', function(msg){
		io.sockets.emit('new message', msg);
		//socket.broadcast.emit('new message', msg); //Sends msg to everyone except sender	
	});
});


