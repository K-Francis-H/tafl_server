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

	//const self = this;

	this.getMoves = function(board, player){
		//console.log("pl: "+player);
		if(player != W && player != B){
			throw "Parameter 'player' must be one of 1 (defenders) or 2 (attackers)";
		}

		let mask = player === W ? WHITE_MASK : BLACK_MASK;
		let newMoves = [];
		let state = board.getBoard();
		for(var i=0; i < state.length; i++){
			for(var j=0; j < state[i].length; j++){
				if( (state[i][j] & mask) > 0){
					newMoves = newMoves.concat(this.getMovesForPieceAtPosition(state, i,j));
				}
			}
		}
		return newMoves;
	};

	function Move(sx, sy, ex, ey, player){
		//this.start = {x:sx,y:sy};
		//this.end = {x:ex,y:ey};
		this.sx = sx;
		this.sy = sy;
		this.ex = ex;
		this.ey = ey;
		this.player = player; //TODO may be inferrable from board state
	};

	this.getMovesForPieceAtPosition = function(state, i, j, player){ //think its inferrable

		let isK = isKing(state, i,j);
		let limitFunc = function(x,y){
			//king may only leave the kings hall, never enter, all others cannot ever be in any special square
			return (isK && !isKingsHall(state, x,y)) || !isSpecialCell(state, x,y); 
		};

		player = isK ? W : state[i][j] & PIECE_MASK;

		let pieceMoves = [];
		for(let k=i+1; k < state.length; k++){

			if((state[k][j] & PIECE_MASK) === 0 && limitFunc(k,j)){
				pieceMoves.push(new Move(i,j,k,j,player));
			}
			else if((state[k][j] & PIECE_MASK) === 0 && isKingsHall(state, k,j)){
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
			else if((state[k][j] & PIECE_MASK) === 0 && isKingsHall(state, k,j)){
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
			else if((state[i][k] & PIECE_MASK) === 0 && isKingsHall(state, i,k)){
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
			else if((state[i][k] & PIECE_MASK) === 0 && isKingsHall(state, i,k)){
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

	function isCorner(state, i, j){
		let size = state.length;
		return i === 0 && j === 0 
		|| i === size-1 && j === 0
		|| i === size-1 && j === size-1
		|| i === 0 && j === size-1;
	}

	function isKingsHall(state, i, j){
		let size = state.length;
		return i === Math.floor(size/2) && j === Math.floor(size/2);
	}

	function isSpecialCell(state, x, y){
		return isKingsHall(state, x, y) || isCorner(state, x, y);
	}

	function isKing(state, i,j){
		//console.log(state);
		//console.log(i);
		//console.log(j);
		return (state[i][j] & K) > 0;
	}

	//create this function for all rules TODO
	this.isForcedWinDefender = function(state){
		let kp = findKing(state);
		if(kp !== null){
			let mvs = this.getMovesForPieceAtPosition(state, kp.x, kp.y, W);
			let cornerCount = 0;
			for(let i=0; i < mvs.length; i++){
				console.log(mvs[i]);
				if(isCorner(state, mvs[i].ex, mvs[i].ey)){
					cornerCount++;
				}
			}
			return cornerCount === 2;
		}
		return false;
	}

	function findKing(state){
		for(let i=0; i < state.length; i++){
			for(let j=0; j < state[0].length; j++){
				console.log("CALLING isKING in findKing()");
				if(isKing(state, i,j)){
					return {x:i,y:j};
				}
			}
		}
		return null;
	}

	//should be called AFTER performing the move on the game state
	//TODO need to check captures against center to see if it is occupied by king. if so white pieces are uncapturable against it
	//TODO use notation and this to auto score games for the AI
	this.checkCaptures = function(state, move){
		let size = state.length;
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

		
		//move.captures = [];
		move.captures = checkKingCorner3SideCapture(state, move);//will be [] if none

		//TODO kingshall 4 and 3 side caps on king

		let position = {x : move.ex, y : move.ey};
		//TODO seems to also capture empty spaces, not a huge deal since undo wont affect the board state in this scenario but still
		//if capture help position exists AND (adjacent position is empty AND capture help position is empty AND KINGS_HALL OR CORNER OR allied piece
		if(position.x+2 < size && (state[position.x+1][position.y] & oppColor) > 0 && ( ( (state[position.x+2][position.y] & PIECE_MASK) === 0 && isKingsHall(state, position.x+2,position.y) || isCorner(state, position.x+2,position.y) ) || (state[position.x+2][position.y] & color) > 0) ){
			console.log("x+");
			move.captures.push({x : position.x+1, y : position.y, player : state[position.x+1][position.y]});
			state[position.x+1][position.y] = 0;
		}
		if(position.x-2 >= 0 && (state[position.x-1][position.y] & oppColor) > 0 && ( ( (state[position.x-2][position.y] & PIECE_MASK) === 0 && isKingsHall(state, position.x-2,position.y) || isCorner(state, position.x-2,position.y) ) || (state[position.x-2][position.y] & color) > 0) ){
			console.log("x-");
			move.captures.push({x : position.x-1, y : position.y, player : state[position.x-1][position.y]});
			state[position.x-1][position.y] = 0;
		}
		if(position.y+2 < size && (state[position.x][position.y+1] & oppColor) > 0 && ( ( (state[position.x][position.y+2] & PIECE_MASK) === 0 && isKingsHall(state, position.x,position.y+2) || isCorner(state, position.x,position.y+2) ) || (state[position.x][position.y+2] & color) > 0) ){
			console.log("y+");
			move.captures.push({x : position.x, y : position.y+1, player : state[position.x][position.y+1]});
			state[position.x][position.y+1] = 0;
		}
		if(position.y-2 >= 0 && (state[position.x][position.y-1] & oppColor) > 0 && ( ( (state[position.x][position.y-2] & PIECE_MASK) === 0 && isKingsHall(state, position.x,position.y-2) || isCorner(state, position.x,position.y-2) ) || (state[position.x][position.y-2] & color) > 0) ){
			console.log("y-");
			move.captures.push({x : position.x, y : position.y-1, player : state[position.x][position.y-1]});
			state[position.x][position.y-1] = 0;
		} 
	}

	//check for special edge capture
	//  A
	// AKC
	//where A is an attacker, K is king, and C is an escape corner, if the top A has just moved its a capture
	function checkKingCorner3SideCapture(state, move){
		//check positions king is vulnerable in
		let secEnd = state.length-2; //second to end
		let end = state.length-1;
		let captures = [];
		

		//king is in top left A
		if( (state[0][1] & K) > 0){
			console.log("king at tl A");
			//king is surrounded by attackers and corner
			console.log(state[1][1]);
			console.log(state[2][0]);
			console.log((state[1][1] & state[2][0] & B));
			if( (state[1][1] & state[2][0] & B) > 0){
				captures.push({x:0, y:1, player:K});
				state[0][1] = 0;
			}
		}

		//king is in top left B
		if( (state[1][0] & K) > 0){
			console.log("king at tl B");
			console.log(state[1][1]);
			console.log(state[0][2]);
			console.log((state[1][1] & state[0][2] & B));
			//king is surrounded by attackers and corner
			if( (state[1][1] & state[0][2] & B) > 0){
				captures.push({x:1, y:0, player:K});
				state[1][0] = 0;
			}
		}

		//king is in top right A
		if( (state[0][secEnd] & K) > 0){
			console.log("king at tr A");
			//king is surrounded by attackers and corner
			if( (state[1][secEnd] & state[0][secEnd-1] & B) > 0){
				captures.push({x:0, y:secEnd, player:K});
				state[0][secEnd] = 0;
			}
		}

		//king is in top right B
		if( (state[1][end] & K) > 0){
			console.log("king at tr B");
			//king is surrounded by attackers and corner
			if( (state[1][secEnd] & state[2][end] & B) > 0){
				captures.push({x:1, y:end, player:K});
				state[1][end] = 0;
			}
		}

		//king is in bottom left A
		if( (state[secEnd][0] & K) > 0){
			console.log("king at bl A");
			//king is surrounded by attackers and corner
			if( (state[secEnd][1] & state[secEnd-1][0] & B) > 0){
				captures.push({x:secEnd, y:0, player:K});
				state[secEnd][0] = 0;
			}
		}
		
		//king is in bottom left B
		if( (state[end][1] & K) > 0){
			console.log("king at bl B");
			//king is surrounded by attackers and corner
			if( (state[secEnd][1] & state[end][2] & B) > 0){
				captures.push({x:end, y:1, player:K});
				state[end][1] = 0;
			}
		}

		//king is in bottom right A
		if( (state[secEnd][end] & K) > 0){
			console.log("king at br A");
			//king is surrounded by attackers and corner
			if( (state[secEnd][secEnd] & state[secEnd-1][end] & B) > 0){
				captures.push({x:end, y:1, player:K});
				state[secEnd][end] = 0;
			}
		}

		//king is in bottom right B
		if( (state[end][secEnd] & K) > 0){
			console.log("king at br B");
			//king is surrounded by attackers and corner
			if( (state[secEnd][secEnd] & state[end][secEnd-1] & B) > 0){
				captures.push({x:end, y:1, player:K});
				state[end][secEnd] = 0;
			}
		}

		return captures;
		/*let isVulnerable =
			//top left 
			(state[0][1] & K) > 0 ||
			(state[1][0] & K) > 0 ||
			//top right
			(state[0][secEnd] & K) > 0 ||
			(state[1][end] & K) > 0 ||
			//bottom left
			(state[secEnd][0] & K) > 0 ||
			(state[end][1] & K) > 0 ||
			//bottom right
			(state[secEnd][end]
			state[end][secEnd]*/
	}

}
