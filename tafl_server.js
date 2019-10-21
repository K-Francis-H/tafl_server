//import packages
const fs = require("fs");
const uuid = require("node-uuid");
const http = require("http");
const https = require("https");
const express = require("express");
const url = require("url");
const cmd = require("child_process");
const bodyParser = require("body-parser");

const game = require("./Game.js");
const TaflBoard = require("./site/TaflBoard.js");

const HTTP_PORT = 9001;//0x64AF1;//
const HTTPS_PORT = 9002;//0x54AF1;

const TEXT_OPT = {encoding: "utf8"};
const FILE_OPT = {root: "site"};

var app = express();
app.disable("x-powered-by");
app.enable("trust proxy");
app.use(bodyParser.json());

var httpServer = http.createServer(app);

//heroku environment logic
var port = process.env.PORT;
if(port == null || port == ""){
	port = HTTP_PORT;
}
httpServer.listen(port);

global.GAME = {
	TAFL : "tafl"
	//TODO add more eventually
};

//TODO setup security
//get a .tk domain to host this

app.use(function(req, res, next){
	console.log(req.url);
	next();
});

function requireHTTPS(req, res, next){
	if(!req.secure){
		res.redirect("https://" + req.get("host") + req.url);
	}	
	next();
}
app.get("/", function(req,res){
	res.sendFile("tafl.html", FILE_OPT);
});
app.get("*.html$|*.css$|*.js$|/images/*|/fonts/*$", function(req, res){
	//oh fuck
	res.sendFile(url.parse(req.url).pathname.substring(1), FILE_OPT);
});

app.post("/create-game", function(req, res){
	res.send(game.create(req.body));
});

app.get("/join/:gameId", function(req, res){
	var gameId = req.params.gameId;
	var playerInfo = game.join(req.params.gameId);//TODO gonna need this to return player info
	var rules = playerInfo.rules;
	var playerId = playerInfo.playerId;
		//return the game html file, and it will parse the url
	res.redirect("/network-game.html?gameId="+encodeURIComponent(gameId)+"&playerId="+encodeURIComponent(playerId)+"&j=1"+"&rules="+encodeURIComponent(rules));
});

app.get("/game/:gameId/:playerId", function(req, res){
	var status = game.getStatus(req.params.gameId, req.params.playerId);
	res.send(JSON.stringify(status));
	//open html file then the client will look up shit
	//res.sendFile("tafl-game.html", FILE_OPT);
});

app.post("/move/:gameId/:playerId", function(req, res){
	var success = game.move(req.params.gameId, req.params.playerId, req.body.token, req.body.move);
	if(success){
		res.sendStatus(200);
	}else{
		res.sendStatus(400);
	}
	if(game.isGameOver(req.params.gameId)){
		setTimeout(function(){
			game.destroy(req.params.gameId);
			console.log("game: "+req.params.gameId+" destroyed.");
		}, 60000);
	}
}); 

/*app.get("/ping/:playerId", function(req, res){
	//TODO use this to receive updates:
		//chat
		//join game
		//etc
});

app.post("/matchmake/:gameType", function(req, res){
	var gameType = req.params.gameType;
	//TODO send to MatchmakingHandler

});

app.post("/matchmake/:playerId", function(req, res){
	var playerId = req.params.playerId;
	//TODO asks MatchmakingHandler for an update on game status for playerId
	//this is polled only if a gameId is not returned by /mathcmake (because no available players to match with)
});

app.post("/move/:gameId/:playerId", function(req, res){
	var gameId = req.params.gameId;
	var playerId = req.params.playerId;
	//TODO send to game state manager that manages N games
});

app.post("/chat/:gameId/:playerId", function(req, res){
	var gameId = req.params.gameId;
	var playerId = req.params.playerId;
	//TODO send to other player (we have to keep ips in the 
	//just do with a client poll and return chats from queue
});

app.post("/spectate", function(req, res){
	//TODO return a list of active games (and current state)
});

app.post("/spectate/:gameId", function(req, res){
	var gameId = req.params.gameId;
	//TODO add as a spectator to the game, they receive state, cannot chat or move
});*/
