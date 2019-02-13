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

	move : function(gameId, playerId, token, move){
		if(games[gameId]){
			return games[gameId].setMoveAlt(playerId, token, move);
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

	var board = new TaflBoard(INITIAL_STATE[variant]);

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

	this.setMoveAlt = function(playerId, token, move){
		if(moveToken.id === token){
			//check if its a valid state
				//there must be a difference between this and previous state
					//difference must be by a piece of the color that holds the token
					//difference must be within the rules (orthogonal, not occupying special spaces, etc)
			//states.push(JSON.parse(JSON.stringify(state)));
			board.makeMove(move);
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
				state : board.getAnnotatedBoard(),//states[states.length-1],
				color : player.color
			};
		}else{
			//dont give them the token, its not their turn
			return {
				variant : getPrettyName(variant),
				move : moveToken.color,
				state : board.getAnnotatedBoard(),//states[states.length-1],
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

function TaflBoard(variant, player, rules){
	const E = 0x00;//empty
	const W = 0x01;//white (defenders)
	const B = 0x02;//black (attackers)
	const K = 0x04;//white king


	//flags
	const SELECTED = 8;
	const VALID_MOVE = 16;
	const LAST_MOVE = 32;
	const FLAG_MASK = SELECTED | VALID_MOVE | LAST_MOVE;

	const BLACK_MASK = B;
	const WHITE_MASK = W | K;
	const PIECE_MASK = BLACK_MASK | WHITE_MASK;

	//var states = [];
	//states.push(variant);

	var state = variant;
	var moves = [];
	var size = variant.length;

	var moveCount = 0;
	var currentPlayer = player || B; //black traditionally goes first, but this may be a simulated move

	//var selectedPiece = null;

	this.getMoves = function(player){
		if(player != W && player != B){
			throw "Parameter 'player' must be one of 1 (defenders) or 2 (attackers)";
		}

		let mask = player === W ? WHITE_MASK : BLACK_MASK;
		let newMoves = [];
		for(var i=0; i < state.length; i++){
			for(var j=0; j < state[i].length; j++){
				if(state[i][j] & mask > 0){
					moves.concat(getMovesForPieceAtPosition(i,j));
				}
			}
		}
		return moves;
	};

	//this.getMovesForSelectedPiece = function(i,j){
	//	return getMovesForPieceAtPosition(i,j);
	//};

	/*this.setSelectedPiece(selPiece){
		selectedPiece = selPiece;
	};

	this.getSelectedPiece(selPiece){
		return selectedPiece;
	};*/

	this.getAnnotatedBoard = function(selectedPiece){
		let annoState = JSON.parse(JSON.stringify(state));
		let lm = lastMove();
		if(lm){//apply last state annotations
			annoState[lm.sx][lm.sy] |= LAST_MOVE;
			annoState[lm.ex][lm.ey] |= LAST_MOVE;
		}
		if(selectedPiece){//apply selected piece and show available moves
			annoState[selectedPiece.x][selectedPiece.y] |= SELECTED;
			let availableMoves = getMovesForPieceAtPosition(selectedPiece.x,selectedPiece.y);
			//console.log(availableMoves);
			for(let i=0; i < availableMoves.length; i++){
				let move = availableMoves[i];
				annoState[move.ex][move.ey] |= VALID_MOVE;
			} 
		}
		//console.log(annoState);
		return annoState;
	}

	function Move(sx, sy, ex, ey, player){
		//this.start = {x:sx,y:sy};
		//this.end = {x:ex,y:ey};
		this.sx = sx;
		this.sy = sy;
		this.ex = ex;
		this.ey = ey;
		this.player = player; //TODO may be inferrable from board state
	};

	function getMovesForPieceAtPosition(i, j, player){ //think its inferrable

		let isK = isKing(i,j);
		let limitFunc = function(x,y){
			//king may only leave the kings hall, never enter, all others cannot ever be in any special square
			return isK || !isSpecialCell(x,y);//(isK && !isKingsHall(x,y)) || !isSpecialCell(x,y); 
		};

		player = isK ? W : state[i][j] & PIECE_MASK;

		let pieceMoves = [];
		for(let k=i+1; k < state.length; k++){

			if((state[k][j] & PIECE_MASK) === 0 && limitFunc(k,j)){
				pieceMoves.push(new Move(i,j,k,j,player));
			}
			else if((state[k][j] & PIECE_MASK) === 0 && isKingsHall(k,j)){
				continue; //may pass over if it was empty
			}
			else{
				break; //impeded by another piece
			}
		}
		for(let k=i-1; k >=0; k--){

			if((state[k][j] & PIECE_MASK) === 0 && limitFunc(k,j)){
				pieceMoves.push(new Move(i,j,k,j,player));
			}
			else if((state[k][j] & PIECE_MASK) === 0 && isKingsHall(k,j)){
				continue; //may pass over if it was empty
			}
			else{
				break; //impeded by another piece
			}
		}
		for(let k=j+1; k < state.length; k++){

			if((state[i][k] & PIECE_MASK) === 0 && limitFunc(i,k)){
				pieceMoves.push(new Move(i,j,i,k,player));
			}
			else if((state[i][k] & PIECE_MASK) === 0 && isKingsHall(i,k)){
				continue; //may pass over if it was empty
			}
			else{
				break; //impeded by another piece
			}
		}
		for(let k=j-1; k >=0; k--){

			if((state[i][k] & PIECE_MASK) === 0 && limitFunc(i,k)){
				pieceMoves.push(new Move(i,j,i,k,player));
			}
			else if((state[i][k] & PIECE_MASK) === 0 && isKingsHall(i,k)){
				continue; //may pass over if it was empty
			}
			else{
				break; //impeded by another piece
			}
		}  
		return pieceMoves;
	}


	//to see what a move does without changing the underlying game state
	this.simulateMove = function(move){
		let clone = JSON.parse(JSON.stringify(state));
		let simulatedState = new TaflBoard(clone, move.player, rules);//TODO or maybe use the currentPlayer value
		simulatedState.makeMove(move);
		return simulatedState;
	};

	//to actually perform a move and effect the state stack
	this.makeMove = function(move){
		//TODO check if move is valid
		console.log("making move: ");
		console.log(move);

		if(isGameOver()){
			return;
		}

		//then apply
		//applyMove(state, move);
		//moves.push(move);
		state[move.ex][move.ey] = state[move.sx][move.sy];
		state[move.sx][move.sy] = E;
		checkCaptures(move);
		moves.push(move);
		console.log("after");
		console.log(move);
		currentPlayer = currentPlayer === B ? W : B;
	};

	this.undo = function(){
		//TODO
		//state unapply(lastMove);
		//moves.pop();
		//TODO have to be able to handle whos requesting 
			//current player -> have to undo opponents move and current move before that (whole turn)
			//next player -> only remove the last move and return control to the next player

		let move = moves.pop();
		if(move){
			state[move.sx][move.sy] = state[move.ex][move.ey];
			state[move.ex][move.ey] = E;
		}
		if(move.captures){
			let 
			for(let i=0; i < move.captures.length; i++){
				state[move.captures[i].x][move.captures[i].y] = move.captures[i].player;
			}
		}
	};

	//used for TaflBoardEditor.js to facilitate moving pieces arbitrarily
	this.removePiece = function(x, y){
		if(x < state.length && x >= 0 && y <= state[0].length && y >= 0){
			state[x][y] = 0;
		}
	};
	//^
	this.placePiece = function(type, x, y){
		if(x < state.length && x >= 0 && y <= state[0].length && y >= 0){
			state[x][y] = type;
		}
	}

	this.getCurrentPlayer = function(){
		return currentPlayer;
	};

	this.getLastMovePlayer = function(){
		return currentPlayer === W ? B : W;
	};

	this.getLastMove = function(){
		return lastMove();
	};

	//returns W if defenders one, B if attackers one, -1 (still truthy) if a stalemate, and 0 (cuz its falsy) if the game has not finished
	this.isGameOver = function(){
		return isGameOver();
	};

	this.getBoard = function(){
		return state; //TODO may need to return an actual reference to this object
	}

	//utils

	function lastMove(){
		return moves[moves.length-1];
	}

	function isCorner(i, j){
		return i === 0 && j === 0 
		|| i === size-1 && j === 0
		|| i === size-1 && j === size-1
		|| i === 0 && j === size-1;
	}

	function isKingsHall(i, j){
		return i === Math.floor(size/2) && j === Math.floor(size/2);
	}

	function isSpecialCell(x, y){
		return isKingsHall(x, y) || isCorner(x, y);
	}

	function isKing(i,j){
		return (state[i][j] & K) > 0;
	}

	//should be called AFTER performing the move on the game state
	//TODO need to check captures against center to see if it is occupied by king. if so white pieces are uncapturable against it
	function checkCaptures(move){
		//TODO use in the (done)makeMove, simulateMove, and (done)undo functions (move needs to store capture metadata in an array)
		let color = (state[move.ex][move.ey] & PIECE_MASK) === B ? B : WHITE_MASK;
		//to make sure its not an empty square somehow
		if( (state[move.ex][move.ey] & PIECE_MASK) === 0){
			return;
		}

		//function checkKingsHall

		//if position exists and it is occupied by an ally or it a corner or it is an unoccupired kings hall then capture
		//if(position.x+2 < size && 

		move.captures = [];

		let position = {x : move.ex, y : move.ey};
		//TODO seems to also capture empty spaces, not a huge deal since undo wont affect the board state in this scenario but still
		//if capture help position exists AND (adjacent position is empty AND capture help position is empty AND KINGS_HALL OR CORNER OR allied piece
		if(position.x+2 < size && (state[position.x+1][position.y] & color) === 0 && ( ( (state[position.x+2][position.y] & PIECE_MASK) === 0 && isKingsHall(position.x+2,position.y) || isCorner(position.x+2,position.y) ) || (state[position.x+2][position.y] & color) > 0) ){
			console.log("x+");
			move.captures.push({x : position.x+1, y : position.y, player : state[position.x+1][position.y]});
			state[position.x+1][position.y] = 0;
		}
		if(position.x-2 >= 0 && (state[position.x-1][position.y] & color) === 0 && ( ( (state[position.x-2][position.y] & PIECE_MASK) === 0 && isKingsHall(position.x-2,position.y) || isCorner(position.x-2,position.y) ) || (state[position.x-2][position.y] & color) > 0) ){
			console.log("x-");
			move.captures.push({x : position.x-1, y : position.y, player : state[position.x-1][position.y]});
			state[position.x-1][position.y] = 0;
		}
		if(position.y+2 < size && (state[position.x][position.y+1] & color) === 0 && ( ( (state[position.x][position.y+2] & PIECE_MASK) === 0 && isKingsHall(position.x,position.y+2) || isCorner(position.x,position.y+2) ) || (state[position.x][position.y+2] & color) > 0) ){
			console.log("y+");
			move.captures.push({x : position.x, y : position.y+1, player : state[position.x][position.y+1]});
			state[position.x][position.y+1] = 0;
		}
		if(position.y-2 >= 0 && (state[position.x][position.y-1] & color) === 0 && ( ( (state[position.x][position.y-2] & PIECE_MASK) === 0 && isKingsHall(position.x,position.y-2) || isCorner(position.x,position.y-2) ) || (state[position.x][position.y-2] & color) > 0) ){
			console.log("y-");
			move.captures.push({x : position.x, y : position.y-1, player : state[position.x][position.y-1]});
			state[position.x][position.y-1] = 0;
		} 
	}

	function isGameOver(){
		//TODO check if stale

		//check if king is on corner
		let end = state.length-1;
		if( (state[0][0] & PIECE_MASK) === K 
		||  (state[0][end] & PIECE_MASK) === K
		||  (state[end][0] & PIECE_MASK) === K
		||  (state[end][end] & PIECE_MASK) === K){
			return W;
		}

		//check if king is gone -> attackers win
		for(let i=0; i < state.length; i++){
			for(let j=0; j < state.length; j++){
				if(state[i][j] === K){
					return E; //king stil in play, no winner
				}
			}
		}
		//TODO what if white has no moves?

		//black wins, king is gone
		return B;
	}
}

