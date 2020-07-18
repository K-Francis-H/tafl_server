function TaflBoard(variant, player, rules){
	const E = 0x00;//empty
	const W = 0x01;//white (defenders)
	const B = 0x02;//black (attackers)
	const K = 0x04;//white king

	//TODO probably need multiple constructors else I lose move history when I simulate a move

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
		/*console.log(player);
		if(player != W && player != B){
			throw "Parameter 'player' must be one of 1 (defenders) or 2 (attackers)";
		}

		let mask = player === W ? WHITE_MASK : BLACK_MASK;
		let newMoves = [];
		for(var i=0; i < state.length; i++){
			for(var j=0; j < state[i].length; j++){
				if( (state[i][j] & mask) > 0){
					newMoves = newMoves.concat(getMovesForPieceAtPosition(i,j));
				}
			}
		}*/
		return rules.getMoves(this, player);//newMoves;
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
			let availableMoves = rules.getMovesForPieceAtPosition(state, selectedPiece.x,selectedPiece.y);
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

	/*function getMovesForPieceAtPosition(i, j, player){ //think its inferrable

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
	}*/


	//to see what a move does without changing the underlying game state
	this.simulateMove = function(move){
		//console.log(move);
		let clone = JSON.parse(JSON.stringify(state));
		let simulatedState = new TaflBoard(clone, move.player, rules);//TODO or maybe use the currentPlayer value
		simulatedState.makeMove(move);
		return simulatedState;
	};

	//to actually perform a move and effect the state stack
	this.makeMove = function(move){
		//TODO check if move is valid
		//console.log("making move: ");
		//console.log(move);

		if(isGameOver()){
			//return;
		}

		//then apply
		//applyMove(state, move);
		//moves.push(move);
		state[move.ex][move.ey] = state[move.sx][move.sy];
		state[move.sx][move.sy] = E;
		rules.checkCaptures(state, move);
		moves.push(move);
		//console.log("after");
		//console.log(move);
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

	this.isForcedWinDefender = function(){
		//king has access to 2 edges or 2 corners depending on rules
		return rules.isForcedWinDefender(state);
	}

	this.getBoard = function(){
		return state; //TODO may need to return an actual reference to this object
		//return JSON.parse(JSON.stringify(state));
	}

	this.clone = function(){
		return new TaflBoard(JSON.parse(JSON.stringify(state)), currentPlayer);
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

	this.findKing = function(){
		for(let i=0; i < state.length; i++){
			for(let j=0; j < state[0].length; j++){
				if(isKing(i,j)){
					return {x:i,y:j};
				}
			}
		}
		return null;
	}

	this.getPieceCounts = function(){
		let bsum = 0;
		let wsum = 0;
		for(let i=0; i < state.length; i++){
			for(let j=0; j < state[0].length; j++){
				if( (state[i][j] & WHITE_MASK) > 0){
					wsum++;
				}
				else if( (state[i][j] & BLACK_MASK) > 0){
					bsum++;
				}
			}
		}
		return {
			black : bsum,
			white : wsum
		};
	}

	//should be called AFTER performing the move on the game state
	//TODO need to check captures against center to see if it is occupied by king. if so white pieces are uncapturable against it
	//TODO use notation and this to auto score games for the AI
	function checkCaptures(move){
		//TODO use in the (done)makeMove, simulateMove, and (done)undo functions (move needs to store capture metadata in an array)
		let color = (state[move.ex][move.ey] & PIECE_MASK) === B ? B : WHITE_MASK;
		let oppColor = color === B ? WHITE_MASK : B;
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
		if(position.x+2 < size && (state[position.x+1][position.y] & oppColor) > 0 && ( ( (state[position.x+2][position.y] & PIECE_MASK) === 0 && isKingsHall(position.x+2,position.y) || isCorner(position.x+2,position.y) ) || (state[position.x+2][position.y] & color) > 0) ){
			console.log("x+");
			move.captures.push({x : position.x+1, y : position.y, player : state[position.x+1][position.y]});
			state[position.x+1][position.y] = 0;
		}
		if(position.x-2 >= 0 && ((state[position.x-1][position.y] & oppColor) > 0) && ( ( (state[position.x-2][position.y] & PIECE_MASK) === 0 && isKingsHall(position.x-2,position.y) || isCorner(position.x-2,position.y) ) || (state[position.x-2][position.y] & color) > 0) ){
			console.log("x-");
			console.log("opc: "+oppColor);
			move.captures.push({x : position.x-1, y : position.y, player : state[position.x-1][position.y]});
			state[position.x-1][position.y] = 0;
		}
		if(position.y+2 < size && (state[position.x][position.y+1] & oppColor) > 0 && ( ( (state[position.x][position.y+2] & PIECE_MASK) === 0 && isKingsHall(position.x,position.y+2) || isCorner(position.x,position.y+2) ) || (state[position.x][position.y+2] & color) > 0) ){
			console.log("y+");
			move.captures.push({x : position.x, y : position.y+1, player : state[position.x][position.y+1]});
			state[position.x][position.y+1] = 0;
		}
		if(position.y-2 >= 0 && (state[position.x][position.y-1] & oppColor) > 0 && ( ( (state[position.x][position.y-2] & PIECE_MASK) === 0 && isKingsHall(position.x,position.y-2) || isCorner(position.x,position.y-2) ) || (state[position.x][position.y-2] & color) > 0) ){
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

	function king4sideCaptureCheck(k/*kings position*/){
		return (state[k.x+1][k.y] && ((state[k.x+1][k.y] & B) > 0 || isSpecialCell(k.x+1, k.y)))
		&& (state[k.x-1][k.y] && ((state[k.x-1][k.y] & B) > 0 || isSpecialCell(k.x-1, k.y)))
		&& (state[k.x][k.y+1] && ((state[k.x][k.y+1] & B) > 0 || isSpecialCell(k.x, k.y+1)))
		&& (state[k.x][k.y-1] && ((state[k.x][k.y-1] & B) > 0 || isSpecialCell(k.x, k.y-1)));
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

//source http://tafl.cyningstan.com/page/689/ealdfaeder-taefl-rules
TaflBoard.EALDFAEDER = 
[[0,0,0,B,B,B,0,0,0],
 [0,0,0,0,B,0,0,0,0],
 [0,0,0,0,0,0,0,0,0],
 [B,0,0,W,W,W,0,0,B],
 [B,B,0,W,K,W,0,B,B],
 [B,0,0,W,W,W,0,0,B],
 [0,0,0,0,0,0,0,0,0],
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

//source http://tafl.cyningstan.com/page/172/tawlbwrdd
TaflBoard.TAWLBWRDD_ALTERNATE =
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
 [0,0,0,0,B,B,B,0,0,0,0]];

//source http://tafl.cyningstan.com/page/172/tawlbwrdd
TaflBoard.TAWLBWRDD_ALTERNATE_2 =
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
 [0,0,0,B,B,B,B,B,0,0,0]];

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
