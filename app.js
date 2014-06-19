
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
var nicknames = [];

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

app.get('/player1', function(req, res){
  res.render('player1.jade');
});

io.sockets.on('connection', function(socket){
	socket.on('new player', function(data, callback){
		console.log(data);
		if(nicknames.indexOf(data) != -1){
			callback(false); //Username already in array
		}else{
			socket.nickname = data;
			nicknames.push(socket.nickname);
			io.sockets.emit('player', nicknames);			
		}
	});
	socket.on('send message', function(msg){
		io.sockets.emit('new message', msg);
		//socket.broadcast.emit('new message', msg); //Sends msg to everyone except sender	
	});
	
	socket.on('disconnect', function(data){
		if(!socket.nickname) return; //if the user disconnects at login
		nicknames.splice(nicknames.indexOf(socket.nickname), 1);
		io.sockets.emit('dc', socket.nickname);		
	});
});


