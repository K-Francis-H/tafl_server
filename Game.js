const uuid = require("node-uuid");

//rules
const rules = require("./Rules.js");
const TaflBoard = require("./TaflBoard.js").TaflBoard;
const TaflNotator = require("./TaflNotator.js");
const TaflArchiver = require("./TaflArchiver.js");



//board ids
const E = 0x00;//empty, also used to mean no winner (in progress) in TaflBoard::isGameOver
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

	//source http://tafl.cyningstan.com/page/689/ealdfaeder-taefl-rules
	"ealdfaeder":
	[[0,0,0,B,B,B,0,0,0],
	 [0,0,0,0,B,0,0,0,0],
	 [0,0,0,0,0,0,0,0,0],
	 [B,0,0,W,W,W,0,0,B],
	 [B,B,0,W,K,W,0,B,B],
	 [B,0,0,W,W,W,0,0,B],
	 [0,0,0,0,0,0,0,0,0],
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

	//source http://tafl.cyningstan.com/page/172/tawlbwrdd
	"tawlbwrdd-alt-1":
	[[0,0,0,0,B,B,B,0,0,0,0],
	 [0,0,0,0,B,B,B,0,0,0,0],
	 [0,0,0,0,0,W,0,0,0,0,0],
	 [0,0,0,0,0,W,0,0,0,0,0],
	 [B,B,0,0,0,W,0,0,0,B,B],
	 [B,B,W,W,W,K,W,W,W,B,B],
	 [B,B,0,0,0,W,0,0,0,B,B],
	 [0,0,0,0,0,W,0,0,0,0,0],
	 [0,0,0,0,0,W,0,0,0,0,0],
	 [0,0,0,0,B,B,B,0,0,0,0],
	 [0,0,0,0,B,B,B,0,0,0,0]],

	//source http://tafl.cyningstan.com/page/172/tawlbwrdd
	"tawlbwrdd-alt-2":
	[[0,0,0,B,B,B,B,B,0,0,0],
	 [0,0,0,0,0,B,0,0,0,0,0],
	 [0,0,0,0,0,W,0,0,0,0,0],
	 [B,0,0,0,0,W,0,0,0,0,B],
	 [B,0,0,0,0,W,0,0,0,0,B],
	 [B,B,W,W,W,K,W,W,W,B,B],
	 [B,0,0,0,0,W,0,0,0,0,B],
	 [B,0,0,0,0,W,0,0,0,0,B],
	 [0,0,0,0,0,W,0,0,0,0,0],
	 [0,0,0,0,0,B,0,0,0,0,0],
	 [0,0,0,B,B,B,B,B,0,0,0]],

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
		var rules = resolveRuleSet(gameInfo.rules);
		console.log(gameInfo);

		if(!isValidColor(color)){
			//TODO freakout
		}
		if(!isValidGameVariant(variant)){
			//TODO freakout
		}

		let game = new Game(color, variant, rules, gameInfo.rules);
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
			//TODO freakout
		}
	},

	destroy : function(gameId){
		delete games[gameId];
	},

	move : function(gameId, playerId, token, move){
		if(games[gameId]){
			return games[gameId].setMove(playerId, token, move);
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

function resolveRuleSet(value){
	switch(value){
		case "fetlar":
			return new rules.FetlarRules();
		case "copenhagen":
			return new rules.CopenhagenRules();
		case "ealdfaeder":
			return new rules.EaldfaederRules();
		case "cleveland":
		default:
			return new rules.ClevelandRules();
	}
}

function Game(creatorColor, variant, rules, rulesName){
	var gameId = uuid.v4();
	console.log("NEW GAME: "+gameId);

	var players = [];

	var moves = [];
	var notator = new TaflNotator(INITIAL_STATE[variant], variant, rules);

	var playerOne = {
		color : creatorColor,
		id : uuid.v4()
	};
	players[playerOne.id] = playerOne;

	//awaiting join, but pre-initialized here
	var playerTwo = {
		color : creatorColor === "white" ? "black" : "white",
		id : uuid.v4(),
		hasJoined : false
	};
	players[playerTwo.id] = playerTwo;

	var moveToken = {
		color : "black",
		id : uuid.v4()
	};

	var undoRequestToken = null; //will be one of the playerIds if they have requested an undo

	var state = JSON.parse(JSON.stringify(INITIAL_STATE[variant]));
	var size = state.length;
	
	var states = [];
	states.push(JSON.parse(JSON.stringify(state)));

	var board = new TaflBoard(JSON.parse(JSON.stringify(INITIAL_STATE[variant])), null, rules);

	TaflArchiver.startGame(
		gameId,
		resColor(playerOne, playerOne.id, playerTwo.id),
		resColor(playerOne, playerTwo.id, playerOne.id),
		variant,
		rulesName
	);
		
	this.getId = function(){
		return gameId;
	};

	this.getCreatorId = function(){
		return playerOne.id;
	};

	this.isGameFull = function(){
		return playerOne && playerTwo.hasJoined;
	}

	this.playerTwoJoin = function(){
		playerTwo.hasJoined = true;
		return {
			playerId: playerTwo.id,
			rules : rulesName
		};
	}

	this.setMove = function(playerId, token, move){
		if(moveToken.id === token){
			//check if its a valid state
				//there must be a difference between this and previous state
					//difference must be by a piece of the color that holds the token
					//difference must be within the rules (orthogonal, not occupying special spaces, etc)
			//states.push(JSON.parse(JSON.stringify(state)));
			

			board.makeMove(move);
			updateMoveToken();
			moves.push(move);

			let isGameOver = board.isGameOver(); //memoize
			notator.addMove(move, isGameOver);

			let result = null;
			if( (isGameOver & BLACK_MASK) > 0){
				result = getAttackerId();
			}else if( (isGameOver & WHITE_MASK) > 0){
				result = getDefenderId();
			}//otherwise draw TODO, or still in progress leave null

			TaflArchiver.updateGame(
				gameId,
				notator.getNotationRaw(),//get as new line separated values
				isGameOver === E ? "in progress" : "complete",
				result, //TODO what about draws?
			);

			return true;
		}else{
			return false;
		}
	}

	this.requestUndo = function(requestingPlayerId){
		//TODO need a lock on the next move token. Probably take it as rejection if the opponent continues play, but set a flag
		undoRequestToken = {
			requester : requestingPlayerId,
			token : uuid.v4()
		}
		//then hand this out inthe next game status update
	}
	
	this.acceptUndo = function(){
		//should set a lock so that get status returns an old status pending this operation which is non atomic and may cause a race condition
		undoRequestToken = null;
		board.undo();
		notator.undo();
		//TODO we need to account for the scenario where a player would like the opposite player to undo their (the opposite player's) move,
		//assumed that the original player has seen the result of their opponents move and now wants to return to their previous turn (2 game turns ago)
	}

	this.refuseUndo = function(){
		undoRequestToken = null;
		//do nothing else, the refusing player can make their move
	}

	this.getStatus = function(playerId){

		var player = players[playerId];
		var retVal = {};
		if(player.color === moveToken.color){
			retVal = {
				variant : getPrettyName(variant),
				move : moveToken.color,
				token : moveToken.id,
				state : board.getAnnotatedBoard(),//states[states.length-1],
				color : player.color,
				isGameOver : board.isGameOver(),
				notation : notator.getNotation()
			};
		}else{
			//dont give them the token, its not their turn
			retVal = {
				variant : getPrettyName(variant),
				move : moveToken.color,
				state : board.getAnnotatedBoard(),//states[states.length-1],
				color : player.color,
				isGameOver : board.isGameOver(),
				notation : notator.getNotation()
			};
		}

		if(undoRequestToken && undoRequestToken.requester !== playerId){
			retVal.undoRequestToken = undoRequestToken;
		}

		return retVal;

		//if game has completed wait until both players are notified then destroy this game
		if(board.isGameOver() > 0){
			setTimeout(function(){
				//game was saved and updated throughout play, it is now completed and can be removed from RAM
				//if expired games are looked up they should be retrieved from db if the RAM lookup fails, if both fail
				//then a 404 type screen
				module.exports.destroy(gameId);
			}, 60000);
		}
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

	//determine which side a player is on and return the desired value
	function resColor(player, resDefender, resAttacker){
		if( (player.color & BLACK_MASK) > 0){
			return resAttacker;
		}else{
			return resDefender;
		}
	}

	function getAttackerId(){
		if( (playerOne.color & BLACK_MASK) > 0){
			return playerOne.id;
		}else{
			return playerTwo.id;
		}
	}

	function getDefenderId(){
		if( (playerOne.color & WHITE_MASK) > 0){
			return playerOne.id;
		}else{
			return playerTwo.id;
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

	function getLastMove(){
		return moves[moves.length-1];
	}
}

function isValidColor(color){
	return color && color.search(/^[black|white]$/i);
}

function isValidGameVariant(variant){
	return variant && variant.search(/^[brandubh|gwddbwyll|fidchell|ard_ri|tablut|tawlbbwrdd|hnefatafl|large+hnefatafl|alea_evangelii]$/i);
}


