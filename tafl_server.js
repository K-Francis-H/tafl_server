//import packages
const fs = require("fs");
const uuid = require("node-uuid");
const http = require("http");
const https = require("https");
const express = require("express");
const url = require("url");
const cmd = require("child_process");
const bodyParser = require("body-parser");

//google sheets api stuff
const readline = require("readline");
const {google} = require("googleapis");
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]; //read/write see https://developers.google.com/sheets/api/guides/authorizing for more details
const TOKEN_PATH = "token.json";
const SHEET_ID = "1t-eJadbg9oY-wA2W4eepPSs94BHkPsFr7t_BmwHg_Lo";
const PAGE_ID = "Sheet1";
const RANGE = PAGE_ID+"!A1:J";
fs.readFile("credentials.json", function(err, content){
	if(err){console.log("NO DB SUPPORT!");}
	else{
		authorize(JSON.parse(content), function(oAuth2Client){
			global.oAuth2Client = oAuth2Client; //globalize the auth client
		});
	}
});

function recordGame(game){
	var values = [
		[
			//game_id
			//defender_d
			//attacker_id
			//defender_name
			//attacker_name
			//FEN
			//winner
			//variant
			//date
			//time
		]
	];

	var body = {
		values : values
	};
	gapi.client.sheets.spreadsheets.values.append({
		spreadsheetId: SHEET_ID,
		range: RANGE,
		valueInputOption: "RAW",
		resource : body
	}).then(function(response){
		var result = response.result;
		console.log(result.updates.updatedCells+" cells appended");
	});
}

function authorize(credentials, callback){
	const {client_secret, client_id, redirect_uris} = credentials.installed;
	const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
	fs.readFile(TOKEN_PATH, function(err, token){
		if(err) return getNewToken(oAuth2Client, callback);
		oAuth2Client.setCredentials(JSON.parse(token));
		callback(oAuth2Client);
	});
}

function getNewToken(oAuth2Client, callback){
	const authUrl = oAuth2Client.generateAuthUrl({
		access_type: "offline",
		scope: SCOPES
	});
	console.log("Authorize this app by visiting this url: ", authUrl);
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	rl.question("Enter the code from that page here: ", function(code){
		rl.close();
		oAuth2Client.getToken(code, function(err, token){
			if(err){return console.log("Error while trying to retrieve access token: ", err);}
			oAuth2Client.setCredentials(token);
			fs.writeFile(TOKEN_PATH, JSON.stringify(token), function(err){
				if(err){return console.log(err);}
				console.log("Token stored to: ", TOKEN_PATH);
			});
			callback(oAuth2Client);
		});
	});
}

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
