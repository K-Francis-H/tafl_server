function StateChange(startState, move, color){

	const EMPTY_SPACE = 0x00;
	const KING = 0x04;
	const DEFENDERS = 0x01 | 0x04;
	const ATTACKERS = 0x02;
	const ourColor = color;
	const theirColor = ourColor === DEFENDERS ? ATTACKERS : DEFENDERS;

	var endState = stateFromMove(startState, move, color);
	var isCapture = isCapture(startState, move, color);
	var isTerminalStateVar = isWin2(endState, move, color);//isTerminalState(startState, move);

	this.isCapture = function(){
		return isCapture;
	};

	this.getStartState = function(){
		return startState;
	};

	this.getMove = function(){
		return move;
	};

	this.getEndState = function(){
		return endState;
	};

	this.isGameOver = function(){
		return isTerminalStateVar !== false;//=== DEFENDERS || isTerminalStateVar === ATTACKERS;
	};

	this.isWin = function(){
		//console.log("checking win for: "+ourColor);
		console.log("is win? "+isTerminalStateVar);
		//console.log(move);
		return isTerminalStateVar === ourColor;
	}

	this.isEscape = function(){
		return escapeCapture(startState, move, color);
	};

	this.getColor = function(){
		return color;
	};

	this.isKingNearEscape = function(){
		return kingIsOnEdge(startState, move, color);
	};
	
	this.isKingEscape = function(){
		return kingEscape(startState, move, color);
	};

	this.isInDanger = function(){

	};

	//TODO this cannot accurately select a win for the DEFENDERS
	//works for attackers
	function isWinState(state){
		//checking that king is in corner or simply not on the board
		var foundKing = false;
		for(var i=0; i < state.length; i++){
			for(var j=0; j < state[i].length; j++){
				if(!foundKing){
					foundKing = (state[i][j] & KING) > 0;
				}
				if( (state[i][j] & KING) > 0 && isCorner(i, j)){
					return DEFENDERS;
				}
			}
		}
		if(foundKing){
			return false; //still in game
		}else{
			return ATTACKERS;
		}
	}

	function isWin2(endState, move, color){
		if(kingEscape(endState, move, color)){
			return DEFENDERS;
		}

		for(var i=0; i < endState.length-1; i++){
			for(var j=0; j < endState.length-1; j++){
				if( (endState[i][j] & KING) > 0){
					return false;
				}
			}
		}
		return ATTACKERS;
	}

	function isTerminalState(gameState, move){
		//check if the king is in a corner
		var boardSize = gameState.length-1;
		if(gameState[0][0] === KING
		|| gameState[0][boardSize] === KING
		|| gameState[boardSize][0] === KING
		|| gameState[boardSize][boardSize] === KING){
			return DEFENDERS;
		}

		//find the king
		for(var i=0; i < gameState.length; i++){
			for(var j=0; j < gameState[i].length; j++){
				if( (gameState[i][j] & KING) > 0){
					//check four directions, is he surrounded ?
					var count = 0;
					if(i > 0 && gameState[i-1][j] === ATTACKERS){count++;}
					if(i < gameState.length-1 && gameState[i+1][j] === ATTACKERS){count++;}
					if(j > 0 && gameState[i][j-1] === ATTACKERS){count++;}
					if(j < gameState[i].length-1 && gameState[i][j+1] === ATTACKERS){count++;}

					//if the king moved between attackers, the game is not over so check last move was NOT made by the king
					//null check on move in case top level... asuuming this wont not work
					if( count >= 2 && move != null && gameState[move.sx][move.sy] !== KING){
						return ATTACKERS;
					}else{
						return false;
					}
				}
			}
		}
		//console.log("could not find king??");
		//console.log(gameState);
		//return false;
	}

	

	function stateFromMove(gameState, move, color){
		//console.log(move);
		//TODO remove pieces if captured
		copyState = JSON.parse(JSON.stringify(gameState));
		copyState[move.sx][move.sy] = EMPTY_SPACE;
		copyState[move.ex][move.ey] = color //TODO not sure if this will break things: move.isKing ? KING : color;
		var theirColor = color === ATTACKERS ? DEFENDERS : ATTACKERS;
		var position = {
			x : move.ex,
			y : move.ey
		};
		//var state = copyState;
		var size = copyState.length;
		
		//now check captures
		if(position.x+2 < size && ( (copyState[position.x+2][position.y] & color) > 0 || isSpecialCell(size, position.x+2, position.y)) && (copyState[position.x+1][position.y] & theirColor) > 0){
			//console.log("x+")
			copyState[position.x+1][position.y] = 0;
		}
		if(position.x-2 >= 0 && ( (copyState[position.x-2][position.y] & color) > 0 || isSpecialCell(size, position.x-2, position.y)) && (copyState[position.x-1][position.y] & theirColor) > 0){
			//console.log("x-");
			copyState[position.x-1][position.y] = 0;
		}
		if(position.y+2 < size && ( (copyState[position.x][position.y+2] & color) > 0 || isSpecialCell(size, position.x, position.y+2)) && (copyState[position.x][position.y+1] & theirColor) > 0){
			//console.log("y+")
			copyState[position.x][position.y+1] = 0;
		}
		if(position.y-2 >= 0 && ( (copyState[position.x][position.y-2] & color) > 0 || isSpecialCell(size, position.x, position.y-2)) && (copyState[position.x][position.y-1] & theirColor) > 0){
			//console.log("y-");
			copyState[position.x][position.y-1] = 0;
		}

		return copyState;
	}

	//not sure this is very accurate... works on level 1 though
	function isCapture(gameState, move, color){
		copyState = JSON.parse(JSON.stringify(gameState));
		copyState[move.sx][move.sy] = EMPTY_SPACE;
		copyState[move.ex][move.ey] = color //TODO not sure if this will break things: move.isKing ? KING : color;
		//console.log(color);
		var theirColor = color === ATTACKERS ? DEFENDERS : ATTACKERS;
		//console.log(theirColor);
		//console.log("g");
		//console.log(gameState);
		//console.log("c");
		//console.log(copyState);
		var position = {
			x : move.ex,
			y : move.ey
		};
		//var state = copyState;
		var size = copyState.length;
		
		//now check captures
		if(position.x+2 < size && ( (copyState[position.x+2][position.y] & color) > 0 || isSpecialCell(size, position.x+2, position.y)) && (copyState[position.x+1][position.y] & theirColor) > 0){
			//console.log("x+");
			//console.log(move);
			return true;
		}
		if(position.x-2 >= 0 && ( (copyState[position.x-2][position.y] & color) > 0 || isSpecialCell(size, position.x-2, position.y)) && (copyState[position.x-1][position.y] & theirColor) > 0){
			//console.log("x-");
			//console.log(move);
			return true;
		}
		if(position.y+2 < size && ( (copyState[position.x][position.y+2] & color) > 0 || isSpecialCell(size, position.x, position.y+2)) && (copyState[position.x][position.y+1] & theirColor) > 0){
			//console.log("y+");
			//console.log(move);
			return true;
		}
		if(position.y-2 >= 0 && ( (copyState[position.x][position.y-2] & color) > 0 || isSpecialCell(size, position.x, position.y-2)) && (copyState[position.x][position.y-1] & theirColor) > 0){
			//console.log("y-");
			//console.log(move);
			return true;
		}

		return false;
	}

	//TODO use/fix
	//probably missing that there are 2 vectors for any capture
	// _ _ O _
	// O X _ O
	// _ _ O _
	function escapeCapture(gameState, move, color){
		copyState = JSON.parse(JSON.stringify(gameState));
		copyState[move.sx][move.sy] = EMPTY_SPACE;
		copyState[move.ex][move.ey] = color //TODO not sure if this will break things: move.isKing ? KING : color;

		//check if the end movement is out of the way of a capture
		var sum = 0;
		//basically check: is there adjacent enemy at start and for each adjacent is there a remote one to finish attack
		if(move.sx-1 >= 0 && (copyState[move.sx-1][move.sy] & theirColor) > 0){
			//adjacent enemy to left
			for(var i=move.sx+2; i < copyState.length; i++){
				if( (copyState[i][move.sy] & theirColor) > 0){
					return true;
				}
			}
		}

		if(move.sx+1 < copyState.length && (copyState[move.sx+1][move.sy] & theirColor) > 0){
			for(var i=move.sx-2; i >= 0; i--){
				if( (copyState[i][move.sy] & theirColor) > 0){
					return true;
				}
			}
		}

		if(move.sy-1 >= 0 && (copyState[move.sx][move.sy-1] & theirColor) > 0){
			for(var i=move.sy-2; i >= 0; i--){
				if( (copyState[move.sx][i] & theirColor) > 0){
					return true;
				}
			}
		}

		if(move.sy+1 < copyState.length && (copyState[move.sx][move.sy+1] & theirColor) > 0){
			for(var i=move.sy+2; i < copyState.length; i++){
				if( (copyState[move.sx][i] & theirColor) > 0){
					return true;
				}
			}
		}

		return false;
	}

	//TODO
	function controlsRowOrColumn(gameState, move, color){
		copyState = JSON.parse(JSON.stringify(gameState));
		copyState[move.sx][move.sy] = EMPTY_SPACE;
		copyState[move.ex][move.ey] = color //TODO not sure if this will break things: move.isKing ? KING : color;
		//console.log(color);
		
		//now check row & columns for emptiness
		/*for(var i=0; i<copyState.size; i++){
			for(){

			}
		}*/
	}

	//actually this is now white win state
	function kingIsOnEdge(gameState, move, color){
		
		/*return  move.isKing &&  
			move.ex === 0 && move.ey === 0 ||
			move.ex === 0 && move.ey === gameState.length-1 ||
			move.ex === gameState.length-1 && move.ey === 0 ||
			move.ex === gameState.length-1 && move.ey === gameState.length;*/
		return  move.isKing &&
			move.ex === 0 ||
			move.ex === gameState.length-1 ||
			move.ey === 0 ||
			move.ey === gameState.length-1;
	}

	function kingEscape(gameState, move, color){
		return  move.isKing && 
			move.ex === 0 && move.ey === 0 ||
			move.ex === 0 && move.ey === gameState.length-1 ||
			move.ex === gameState.length-1 && move.ey === 0 ||
			move.ex === gameState.length-1 && move.ey === gameState.length-1;
	}

	//send endstates pls
	//TODO this does NOT cover vertical moves into horizontal attack just "crunch down" moves
	function kingIsInDanger(gameState, move, color){
		if(!move.isKing){
			return false;
		}

		//find adjacent danger
		var isPotentialDanger = 0x0;
		//left danger
		if( move.ex-1 >= 0 && ( (gameState[move.ex-1][move.ey] & ATTACKERS) > 0) || isSpecialCell(gameState.length-1, move.ex-1, move.ey) ){
			isPotentialDanger |= 0x01;
		}
		if( move.ex+1 < gameState.length && ( (gameState[move.ex+1][move.ey] & ATTACKERS > 0) || isSpecialCell(gameState.length-1, move.ex+1, move.ey) ) ){
			isPotentialDanger |= 0x02;
		}
		if( move.ey-1 >= 0 && ( (gameState[move.ex][move.ey-1] & ATTACKERS > 0) || isSpecialCell(gameState.length-1, move.ex, move.ey-1) ) ){
			isPotentialDanger |= 0x04;
		}
		if( move.ey+1 < gameState.length && ( (gameState[move.ex][move.ey+1] & ATTACKERS > 0) || isSpecialCell(gameState.length-1, move.ex, move.ey+1) ) ){
			isPotentialDanger |= 0x08;
		}

		var isInRealDanger = false;
		if( (isPotentialDanger & 0x01) > 0 && move.ex+1 < gameState.length-2){
			//check right
			for(var i=move.ex+1; i < gameState.length-1; i++){
				if( (gameState[i][move.ey] & ATTACKERS) > 0){
					return true;
				}
			}
			//check down??
		}
		if( (isPotentialDanger & 0x02) > 0 && move.ex-1 > 0){//not >= caus BWB is safe
			for(var i=move.ex-1; i > 0; i--){
				if( (gameState[i][move.ey] & ATTACKERS) > 0){
					return true;
				}
			}
			//check up
		}
		if( (isPotentialDanger & 0x04) > 0 && move.ey+1 < gameState.length-2){
			for(var i=move.ey+1; i > 0; i++){
				if( (gameState[i][move.ey] & ATTACKERS) > 0){
					return true;
				}
			}
			//check right
		}
		if( (isPotentialDanger & 0x08) > 0 && move.ey-1 > 0){
			for(var i=move.ex-1; i > 0; i--){
				if( (gameState[i][move.ey] & ATTACKERS) > 0){
					return true;
				}
			}
			//check left
		}
	}

	function isInDanger(gameState, move, color){

	}

	function isCorner(size, i, j){
		return i === 0 && j === 0 
		|| i === size-1 && j === 0
		|| i === size-1 && j === size-1
		|| i === 0 && j === size-1
	}

	function isKingsHall(size, i, j){
		return i === Math.floor(size/2) && j === Math.floor(size/2);
	}

	function isSpecialCell(size, x, y){
		return isKingsHall(size, x, y) || isCorner(size,x, y);
	}
}
