function EaldfaederRules(){

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
	
	this.getMoves = function(taflBoard, player){
		if(player != W && player != B){
			throw "Parameter 'player' must be one of 1 (defenders) or 2 (attackers)";
		}

		let mask = player === W ? WHITE_MASK : BLACK_MASK;
		let newMoves = [];
		for(var i=0; i < state.length; i++){
			for(var j=0; j < state[i].length; j++){
				if( (state[i][j] & mask) > 0){
					newMoves = newMoves.concat(getMovesForPieceAtPosition(taflBoard.getBoard(), i,j));
				}
			}
		}
		return newMoves;
	};

	this.checkCaptures = function(state, move){

	};

	function checkCaptures(state, move){
		//TODO use in the (done)makeMove, simulateMove, and (done)undo functions (move needs to store capture metadata in an array)
		let color = (state[move.ex][move.ey] & PIECE_MASK) === B ? B : WHITE_MASK;
		//to make sure its not an empty square somehow
		if( (state[move.ex][move.ey] & PIECE_MASK) === 0){
			return;
		}

		//TODO no need to check if king is captured via 3 or 4 surrounds
		if(isAttackingKing(state,move)){
			//find king
			//if on edge and surrounded on 3 sides -> captured
			//if adjacent to kings hall and surrounded on 3 sided -> captured
			//if surrounded on four sides -> captured
			checkKingCaptures(state, move);
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

		//TODO add scenario for edge capture of king 
	}

	function isAttackingKing(state, move){
		let color = (state[move.ex][move.ey] & PIECE_MASK) === B ? B : WHITE_MASK;
		if(color !== B){
			return false; //its a defender
		}

		return (state[move.ex+1][move.ey] && state[move.ex+1][move.ey] & K > 0) ||
		       (state[move.ex-1][move.ey] && state[move.ex-1][move.ey] & K > 0) ||
		       (state[move.ex][move.ey+1] && state[move.ex][move.ey+1] & K > 0) ||
		       (state[move.ex][move.ey-1] && state[move.ex][move.ey-1] & K > 0);
	}

	function checkKingCaptures(state, move){
		//find king
		let kp = {}; //kings position

		if(state[move.ex+1][move.ey] && state[move.ex+1][move.ey] & K > 0){
			kp = {x:move.ex+1, y:move.ey};
		}
		else if(state[move.ex-1][move.ey] && state[move.ex-1][move.ey] & K > 0){
			kp = {x:move.ex-1, y:move.ey};
		}
		else if(state[move.ex][move.ey+1] && state[move.ex][move.ey+1] & K > 0){
			kp = {x:move.ex, y:move.ey+1};
		}
		else if(state[move.ex][move.ey-1] && state[move.ex][move.ey-1] & K > 0){
			kp = {x:move.ex, y:move.ey-1};
		}

		//if king was not found
		if(!kp){
			return;
		}

		//now check if king has been captured

		//edges
		if(kp.x === 0){
			if(state[kp.x+1][kp.y] === B && state[kp.x][kp.y+1] === B && state[kp.x][kp.y-1]){
				move.captures.push({x : kp.x, y : kp.y, player : K});
				state[kp.x][kp.y] = 0;
			}
		}
		else if(kp.x === state.length){
			if(state[kp.x-1][kp.y] === B && state[kp.x][kp.y+1] === B && state[kp.x][kp.y-1]){
				move.captures.push({x : kp.x, y : kp.y, player : K});
				state[kp.x][kp.y] = 0;
			}
		}
		else if(kp.y === 0){
			if(state[kp.x][kp.y+1] === B && state[kp.x-1][kp.y] === B && state[kp.x+1][kp.y]){
				move.captures.push({x : kp.x, y : kp.y, player : K});
				state[kp.x][kp.y] = 0;
			}
		}
		else if(kp.y === state[kp.x].length){
			if(state[kp.x][kp.y-1] === B && state[kp.x-1][kp.y] === B && state[kp.x+1][kp.y]){
				move.captures.push({x : kp.x, y : kp.y, player : K});
				state[kp.x][kp.y] = 0;
			}
		}

		let isAttacked = function(state, x, y){
			return state[x][y] === B || isKingsHall(x,y);
		}	

		//four sides (include empty kings hall as attacker in checks)
		if( isAttacked(state, x+1, y) && 
		    isAttacked(state, x-1, y) &&
		    isAttacked(state, x, y+1) &&
		    isAttacked(state, x, y-1) ){
			move.captures.push({x: kp.x, y: kp.y, player: K});
			state[kp.x][kp.y] = 0;
		}
	}

	this.isGameOver = function(state, move){

	};

	function getMovesForPieceAtPosition(state, i, j){
		var isKing = state[i][j] & K > 0;
		
		//king can return to his hall unlike Cleveland rules
	
		//king must be captured on all four sides or 3 if adjacent to kings hall

		let limitFunc = function(x,y){
			//king may reenter the kings hall, others cannot enter special cells
			return ( isK && isKingsHall(x,y) ) || !isSpecialCell(x,y) 
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

	function isKing(state, i,j){
		return (state[i][j] & K) > 0;
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

}
