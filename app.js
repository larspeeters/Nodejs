
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
app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
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

app.get('/', routes.index);
app.get('/v', function(req, res){
  res.render('video.jade', { title: 'jade\'s snake | Player 1' });
});
app.get('/player1', function(req, res){
  res.render('player1.jade', { title: 'jade\'s snake | Player 1' });
});
app.get('/player2', function(req, res){
  res.render('player2.jade', { title: 'jade\'s snake | Player 2' });
});
app.get('/player3', function(req, res){
  res.render('player3.jade', { title: 'jade\'s snake | Player 3' });
});
app.get('/player4', function(req, res){
  res.render('player4.jade', { title: 'jade\'s snake | Player 4' });
});

io.sockets.on('connection', function(socket){
	socket.on('new player', function(data, callback){
		if(nicknames.indexOf(data) != -1){
			callback(false); //Username already in array
		}else{
			callback(true);
			socket.nickname = data;
			nicknames.push(socket.nickname);
			io.sockets.emit('player', nicknames);			
		}
	});	
	socket.on('disconnect', function(data){
		if(!socket.nickname) return; //if the user disconnects at login
		nicknames.splice(nicknames.indexOf(socket.nickname), 1);
		io.sockets.emit('dc', socket.nickname);		
	});
	socket.on('move', function(data){
		io.sockets.emit('moved', {X: data['X'], Y: data['Y']});			
	});
});


