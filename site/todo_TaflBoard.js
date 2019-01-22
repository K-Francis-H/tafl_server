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

		//then apply
		//applyMove(state, move);
		//moves.push(move);
		state[move.ex][move.ey] = state[move.sx][move.sy];
		state[move.sx][move.sy] = E;
		moves.push(move);
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

	function checkCaptures(move){
		//TODO use in the makeMove, simulateMove, and undo functions (move needs to store capture metadata in an array)
	}
}

const E = 0x00;//empty
const W = 0x01;//white (defenders)
const B = 0x02;//black (attackers)
const K = 0x04;//white king

//useful albeit clearly biased, and sometimes bullshitting src:
//https://boardgamegeek.com/thread/348662/approach-tafling-nirvana

//source https://en.wikipedia.org/wiki/Tafl_games
//attacker 1st
TaflBoard.BRANDUBH = 
[[0,0,0,B,0,0,0],
 [0,0,0,B,0,0,0],
 [0,0,0,W,0,0,0],
 [B,B,W,K,W,B,B],
 [0,0,0,W,0,0,0],
 [0,0,0,B,0,0,0],
 [0,0,0,B,0,0,0]];

//source https://www.boardgamegeek.com/article/2700987
//TODO mentions special rule, attackers and defenders cannot passover king's hall
//attacker 1st
TaflBoard.GWDDBWYLL =
[[0,0,B,0,B,0,0],
 [0,0,0,0,0,0,0],
 [B,0,0,W,0,0,B],
 [0,0,W,K,W,0,0],
 [B,0,0,W,0,0,B],
 [0,0,0,0,0,0,0],
 [0,0,B,0,B,0,0]];

//sources: https://www.boardgamegeek.com/article/2701290#2701290
//https://en.wikipedia.org/wiki/Fidchell
//TODO mentions special rule, attackers and defenders cannot passover king's hall
//win by getting king to edge, not corner
//attacker 1st
TaflBoard.FIDCHELL =
[[B,0,B,B,B,0,B],
 [0,0,0,W,0,0,0],
 [B,0,0,W,0,0,B],
 [B,W,W,K,W,W,B],
 [B,0,0,W,0,0,B],
 [0,0,0,W,0,0,0],
 [B,0,B,B,B,0,B]];

//source https://en.wikipedia.org/wiki/Tafl_games
//https://www.boardgamegeek.com/thread/346545/how-tafl-and-why-youd-want
//2nd source claims well known rules, each piece moves one space
//defender makes 1st move
TaflBoard.ARD_RI = 
[[0,0,B,B,B,0,0],
 [0,0,0,B,0,0,0],
 [B,0,W,W,W,0,B],
 [B,B,W,K,W,B,B],
 [B,0,W,W,W,0,B],
 [0,0,0,B,0,0,0],
 [0,0,B,B,B,0,0]];

//source https://en.wikipedia.org/wiki/Tafl_games
TaflBoard.TABLUT = 
[[0,0,0,B,B,B,0,0,0],
 [0,0,0,0,B,0,0,0,0],
 [0,0,0,0,W,0,0,0,0],
 [B,0,0,0,W,0,0,0,B],
 [B,B,W,W,K,W,W,B,B],
 [B,0,0,0,W,0,0,0,B],
 [0,0,0,0,W,0,0,0,0],
 [0,0,0,0,B,0,0,0,0],
 [0,0,0,B,B,B,0,0,0]];

//source https://en.wikipedia.org/wiki/Tafl_games
TaflBoard.TAWLBWRDD = 
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
 [0,0,0,0,B,B,B,0,0,0,0]];

//source https://en.wikipedia.org/wiki/Tafl_games
TaflBoard.HNEFATAFL = 
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
 [0,0,0,B,B,B,B,B,0,0,0]];

TaflBoard.LARGE_HNEFATAFL = 
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
 [0,0,0,0,B,B,B,B,B,0,0,0,0]];

//source https://en.wikipedia.org/wiki/Tafl_games
TaflBoard.ALEA_EVANGELII = 
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
 [0,0,B,0,0,B,0,0,0,0,0,0,0,B,0,0,B,0,0]];
