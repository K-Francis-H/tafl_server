const uuid = require("node-uuid");

//board ids
const W = 0x01;//white
const B = 0x02;//black
const K = 0x04;//white king

//flags
const SELECTED = 8;
const VALID_MOVE = 16;
const LAST_MOVE = 32;
const FLAG_MASK = SELECTED | VALID_MOVE | LAST_MOVE;

const BLACK_MASK = B;
const WHITE_MASK = W | K;
const PIECE_MASK = BLACK_MASK | WHITE_MASK;

//useful albeit clearly biased, and sometimes bullshitting src:
//https://boardgamegeek.com/thread/348662/approach-tafling-nirvana

//source https://en.wikipedia.org/wiki/Tafl_games
//attacker 1st
const INITIAL_STATE = {
	"brandubh": 
	[[0,0,0,B,0,0,0],
	 [0,0,0,B,0,0,0],
	 [0,0,0,W,0,0,0],
	 [B,B,W,K,W,B,B],
	 [0,0,0,W,0,0,0],
	 [0,0,0,B,0,0,0],
	 [0,0,0,B,0,0,0]],

	//source https://www.boardgamegeek.com/article/2700987
	//TODO mentions special rule, attackers and defenders cannot passover king's hall
	//attacker 1st
	"gwddbwyll":
	[[0,0,B,0,B,0,0],
	 [0,0,0,0,0,0,0],
	 [B,0,0,W,0,0,B],
	 [0,0,W,K,W,0,0],
	 [B,0,0,W,0,0,B],
	 [0,0,0,0,0,0,0],
	 [0,0,B,0,B,0,0]],

	//sources: https://www.boardgamegeek.com/article/2701290#2701290
	//https://en.wikipedia.org/wiki/Fidchell
	//TODO mentions special rule, attackers and defenders cannot passover king's hall
	//win by getting king to edge, not corner
	//attacker 1st
	"fidchell" :
	[[B,0,B,B,B,0,B],
	 [0,0,0,W,0,0,0],
	 [B,0,0,W,0,0,B],
	 [B,W,W,K,W,W,B],
	 [B,0,0,W,0,0,B],
	 [0,0,0,W,0,0,0],
	 [B,0,B,B,B,0,B]],

	//source https://en.wikipedia.org/wiki/Tafl_games
	//https://www.boardgamegeek.com/thread/346545/how-tafl-and-why-youd-want
	//2nd source claims well known rules, each piece moves one space
	//defender makes 1st move
	"ard_ri": 
	[[0,0,B,B,B,0,0],
	 [0,0,0,B,0,0,0],
	 [B,0,W,W,W,0,B],
	 [B,B,W,K,W,B,B],
	 [B,0,W,W,W,0,B],
	 [0,0,0,B,0,0,0],
	 [0,0,B,B,B,0,0]],

	//source https://en.wikipedia.org/wiki/Tafl_games
	"tablut":
	[[0,0,0,B,B,B,0,0,0],
	 [0,0,0,0,B,0,0,0,0],
	 [0,0,0,0,W,0,0,0,0],
	 [B,0,0,0,W,0,0,0,B],
	 [B,B,W,W,K,W,W,B,B],
	 [B,0,0,0,W,0,0,0,B],
	 [0,0,0,0,W,0,0,0,0],
	 [0,0,0,0,B,0,0,0,0],
	 [0,0,0,B,B,B,0,0,0]],

	//source https://en.wikipedia.org/wiki/Tafl_games
	"tawlbwrdd":
	[[0,0,0,0,B,B,B,0,0,0,0],
	 [0,0,0,0,B,0,B,0,0,0,0],
	 [0,0,0,0,0,B,0,0,0,0,0],
	 [0,0,0,0,0,W,0,0,0,0,0],
	 [B,B,0,0,W,W,W,0,0,B,B],
	 [B,0,B,W,W,K,W,W,B,0,B],
	 [B,B,0,0,W,W,W,0,0,B,B],
	 [0,0,0,0,0,W,0,0,0,0,0],
	 [0,0,0,0,0,B,0,0,0,0,0],
	 [0,0,0,0,B,0,B,0,0,0,0],
	 [0,0,0,0,B,B,B,0,0,0,0]],

	//source https://en.wikipedia.org/wiki/Tafl_games
	"hnefatafl":
	[[0,0,0,B,B,B,B,B,0,0,0],
	 [0,0,0,0,0,B,0,0,0,0,0],
	 [0,0,0,0,0,0,0,0,0,0,0],
	 [B,0,0,0,0,W,0,0,0,0,B],
	 [B,0,0,0,W,W,W,0,0,0,B],
	 [B,B,0,W,W,K,W,W,0,B,B],
	 [B,0,0,0,W,W,W,0,0,0,B],
	 [B,0,0,0,0,W,0,0,0,0,B],
	 [0,0,0,0,0,0,0,0,0,0,0],
	 [0,0,0,0,0,B,0,0,0,0,0],
	 [0,0,0,B,B,B,B,B,0,0,0]],

	"large_hnefatafl": 
	[[0,0,0,0,B,B,B,B,B,0,0,0,0],
	 [0,0,0,0,0,0,B,0,0,0,0,0,0],
	 [0,0,0,0,0,0,0,0,0,0,0,0,0],
	 [0,0,0,0,0,0,W,0,0,0,0,0,0],
	 [B,0,0,0,0,0,W,0,0,0,0,0,B],
	 [B,0,0,0,0,0,W,0,0,0,0,0,B],
	 [B,B,0,W,W,W,K,W,W,W,0,B,B],
	 [B,0,0,0,0,0,W,0,0,0,0,0,B],
	 [B,0,0,0,0,0,W,0,0,0,0,0,B],
	 [0,0,0,0,0,0,W,0,0,0,0,0,0],
	 [0,0,0,0,0,0,0,0,0,0,0,0,0],
	 [0,0,0,0,0,0,B,0,0,0,0,0,0],
	 [0,0,0,0,B,B,B,B,B,0,0,0,0]],

	//source https://en.wikipedia.org/wiki/Tafl_games
	"alea_evangelii":
	[[0,0,B,0,0,B,0,0,0,0,0,0,0,B,0,0,B,0,0],
	 [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	 [B,0,0,0,0,B,0,0,0,0,0,0,0,B,0,0,0,0,B],
	 [0,0,0,0,0,0,0,B,0,B,0,B,0,0,0,0,0,0,0],
	 [0,0,0,0,0,0,B,0,W,0,W,0,B,0,0,0,0,0,0],
	 [B,0,B,0,0,B,0,0,0,0,0,0,0,B,0,0,B,0,B],
	 [0,0,0,0,B,0,0,0,0,W,0,0,0,0,B,0,0,0,0],
	 [0,0,0,B,0,0,0,0,W,0,W,0,0,0,0,B,0,0,0],
	 [0,0,0,0,W,0,0,W,0,W,0,W,0,0,W,0,0,0,0],
	 [0,0,0,B,0,0,W,0,W,K,W,0,W,0,0,B,0,0,0],
	 [0,0,0,0,W,0,0,W,0,W,0,W,0,0,W,0,0,0,0],
	 [0,0,0,B,0,0,0,0,W,0,W,0,0,0,0,B,0,0,0],
	 [0,0,0,0,B,0,0,0,0,W,0,0,0,0,B,0,0,0,0],
	 [B,0,B,0,0,B,0,0,0,0,0,0,0,B,0,0,B,0,B],
	 [0,0,0,0,0,0,B,0,W,0,W,0,B,0,0,0,0,0,0],
	 [0,0,0,0,0,0,0,B,0,B,0,B,0,0,0,0,0,0,0],
	 [B,0,0,0,0,B,0,0,0,0,0,0,0,B,0,0,0,0,B],
	 [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
	 [0,0,B,0,0,B,0,0,0,0,0,0,0,B,0,0,B,0,0]]
};

var games = [];
module.exports = {
	
	create : function(gameInfo){
		var color = gameInfo.color;
		var variant = gameInfo.variant;

		if(!isValidColor(color)){
			//TODO freakout
		}
		if(!isValidGameVariant(variant)){
			//TODO freakout
		}

		var game = new Game(color, variant);
		games[game.getId()] = game;

		return {
			gameId : game.getId(),
			playerId : game.getCreatorId(),
		};
	},

	join : function(gameId){
		if(games[gameId] && !games[gameId].isGameFull()){
			return games[gameId].playerTwoJoin();
		}else{
			//freakout
		}
	},

	destroy : function(gameId){
		delete games[gameId];
	},

	move : function(gameId, playerId, token, state){
		if(games[gameId]){
			return games[gameId].setMove(playerId, token, state);
		}else{
			//TODO freakout
			console.log("unknown game: "+gameId);
			return false;
		}
	},

	getStatus : function(gameId, playerId){
		if(games[gameId]){
			return games[gameId].getStatus(playerId);
		}else{	
			//TODO freakout
		}
	},

	isGameOver : function(gameId){
		return games[gameId].isWinState();
	}

}

function Game(creatorColor, variant){
	var gameId = uuid.v4();

	var players = [];

	var playerOne = {
		color : creatorColor,
		id : uuid.v4()
	};
	players[playerOne.id] = playerOne;

	var playerTwo = false;//awaiting join

	var moveToken = {
		color : "black",
		id : uuid.v4()
	};

	var state = INITIAL_STATE[variant];
	var size = state.length;
	
	var states = [];
	states.push(JSON.parse(JSON.stringify(state)));

	this.getId = function(){
		return gameId;
	};

	this.getCreatorId = function(){
		return playerOne.id;
	};

	this.isGameFull = function(){
		return playerOne && playerTwo;
	}

	this.playerTwoJoin = function(){
		playerTwo = {
			color : creatorColor === "white" ? "black" : "white",
			id : uuid.v4()
		};
		players[playerTwo.id] = playerTwo;
		return playerTwo.id;
	}

	this.setMove = function(playerId, token, state){
		//TODO check if valid
		//if good update state and send true else return false
		//also check move token is valid so the move has not been spoofed

		//then lastly update the move token color and set a new id
		if(moveToken.id === token){
			//check if its a valid state
				//there must be a difference between this and previous state
					//difference must be by a piece of the color that holds the token
					//difference must be within the rules (orthogonal, not occupying special spaces, etc)
			states.push(JSON.parse(JSON.stringify(state)));
			updateMoveToken();
			return true;
		}else{
			return false;
		}
	}

	this.getStatus = function(playerId){
		var player = players[playerId];
		if(player.color === moveToken.color){
			return {
				variant : getPrettyName(variant),
				move : moveToken.color,
				token : moveToken.id,
				state : states[states.length-1],
				color : player.color
			};
		}else{
			//dont give them the token, its not their turn
			return {
				variant : getPrettyName(variant),
				move : moveToken.color,
				state : states[states.length-1],
				color : player.color
			};
		}
		//TODO if game has completed wait until both players are notified then destroy this game
	}

	function updateMoveToken(){
		//toggle color
		moveToken.color = moveToken.color === "white" ? "black" : "white";
		moveToken.id = uuid.v4(); 
	}
	
	function getPrettyName(variant){
		switch(variant){
			case "brandubh": 	return "Brandubh";
			case "gwddbwyll":	return "Gwddbwyll";
			case "fidchell":	return "Fidchell";
			case "ard_ri":		return "Ard Ri";
			case "tablut":		return "Tablut";
			case "tawlbwrdd":	return "Tawlbwrdd";
			case "hnefatafl":	return "Hnefatafl";
			case "large_hnefatafl":	return "Large Hnefatafl";
			case "alea_evangelii":	return "Alea Evangelii";
		}
	}

	this.isWinState = function(){
		var lastState = states[states.length -1];
		var foundKing = false;
		for(var i=0; i < size; i++){
			for(var j=0; j < size; j++){
				if(!foundKing){
					foundKing = (lastState[i][j] & K) > 0;
				}
				if( (lastState[i][j] & K) > 0 && isCorner(i, j)){
					return true;
				}
			}
		}
		return !foundKing; //king is still in game, but not in corner
	}

	function isCorner(i, j){
		return i === 0 && j === 0 
		|| i === size-1 && j === 0
		|| i === size-1 && j === size-1
		|| i === 0 && j === size-1
	}
}

function isValidColor(color){
	return color && color.search(/^[black|white]$/i);
}

function isValidGameVariant(variant){
	return variant && variant.search(/^[brandubh|gwddbwyll|fidchell|ard_ri|tablut|tawlbbwrdd|hnefatafl|large+hnefatafl|alea_evangelii]$/i);
}




