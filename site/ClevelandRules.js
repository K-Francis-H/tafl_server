function ClevelandRules(){
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
		console.log(player);
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
		}
		return newMoves;
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

	this.getMovesForPieceAtPosition = function(i, j, player){ //think its inferrable

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
	//TODO use notation and this to auto score games for the AI
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

}
