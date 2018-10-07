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
		return this.isGameOver() && (isTerminalStateVar === ourColor);
	}

	this.isEscape = function(){
		return /*escapesDanger(startState, move, color) &&*/ escapesDanger(endState, move, color);
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

	this.controlsRowOrCol = function(){
		return controlsRowOrColumn(startState, move, color);
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

		for(var i=0; i < endState.length; i++){
			for(var j=0; j < endState.length; j++){
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

	//works
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

	function escapesDanger(gameState, move, color){
		//first check if it is CURRENTLY adjacent to at least one enemy/special tile
		var theirColor = color === ATTACKERS ? DEFENDERS : ATTACKERS;
		var size = gameState.length-1;
		
		var inDanger = false;
		//check left
		if(move.ex -1 >= 0 && ( (gameState[move.ex-1][move.ey] & theirColor) > 0 || isSpecialCell(size, move.ex-1, move.ey) ) ){
			inDanger = checkDanger(gameState, move, color, true, 1);
		}
		if(move.ex +1 <= size && ( (gameState[move.ex+1][move.ey] & theirColor) > 0 || isSpecialCell(size, move.ex+1, move.ey) ) ){
			inDanger = checkDanger(gameState, move, color, true, -1);
		}
		if(move.ey -1 >= 0 && ( (gameState[move.ex][move.ey-1] & theirColor) > 0 || isSpecialCell(size, move.ex, move.ey-1) ) ){
			inDanger = checkDanger(gameState, move, color, false, 1);
		}
		if(move.ey +1 <= size && ( (gameState[move.ex][move.ey+1] & theirColor) > 0 || isSpecialCell(size, move.ex, move.ey+1) ) ){
			inDanger = checkDanger(gameState, move, color, false, -1);
		}  

		return inDanger;
	}

	//dangerDiff == offset to open square that can potentially be occupied by enemy
	function checkDanger(gameState, move, color, isX, dangerDiff){
		var size = gameState.length-1;
		var theirColor = color === ATTACKERS ? DEFENDERS : ATTACKERS;
		if(isX){
			//check vertical first since its ambivalent
			var dangerX = move.ex+dangerDiff;
			for(var i=move.ey-1; i >= 0; i--){
				if( (gameState[dangerX][i] & theirColor) > 0){
					return true;
				}else if( gameState[dangerX][i] !== EMPTY_SPACE){
					break;
				}
			}
			for(var i=move.ey+1; i <= size; i++){
				if( (gameState[dangerX][i] & theirColor) > 0){
					return true;
				}else if( gameState[dangerX][i] !== EMPTY_SPACE){
					break;
				}
			}
			//now check the handed side
			if(dangerX < move.ex){
				for(var i=dangerX-1; i >= 0; i--){
					if( (gameState[i][move.ey] & theirColor) > 0){
						return true;
					}else if(gameState[i][move.ey] !== EMPTY_SPACE){
						break;
					}
				}
			}else{
				for(var i=dangerX+1; i <= size; i++){
					if( (gameState[i][move.ey] & theirColor) > 0){
						return true;
					}else if(gameState[i][move.ey] !== EMPTY_SPACE){
						break;
					}
				}
			}
		}else{
			var dangerY = move.ey+dangerDiff;
			//check ambivalent horizontal
			for(var i=move.ex-1; i >= 0; i--){
				if( (gameState[i][dangerY] & theirColor) > 0){
					return true;
				}else if(gameState[i][dangerY] !== EMPTY_SPACE){
					break;
				}
			}
			for(var i=move.ex+1; i <= size; i++){
				if( (gameState[i][dangerY] & theirColor) > 0){
					return true;
				}else if(gameState[i][dangerY] !== EMPTY_SPACE){
					break;
				}
			}

			//now check handedness
			if(dangerY < move.ey){
				for(var i=dangerY-1; i >= 0; i--){
					if( (gameState[move.ex][i] & theirColor) > 0){
						return true;
					}else if(gameState[move.ex][i] !== EMPTY_SPACE){
						break;
					}
				}
			}else{
				for(var i=dangerY+1; i<= size; i++){
					if( (gameState[move.ex][i] & theirColor) > 0){
						return true;
					}else if(gameState[move.ex][i] !== EMPTY_SPACE){
						break;
					}
				}
			}
		}
		return false;
	}

	function isInDanger(gameState, move, color){

		//first check if move is into adjacency with an enemy
		//TODO just call escapesDanger with the endState?

		
	}

	function controlsRowOrColumn(gameState, move, color){
		var clearRow = true;
		var clearCol = true;
		for(var i=0; i < gameState.length-1; i++){
			if(gameState[i][move.ey] !== EMPTY_SPACE){
				clearRow = false;
			}
			if(gameState[move.ex][i] !== EMPTY_SPACE){
				clearCol = false;
			}
		}
		return clearCol || clearRow;
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

	//actually this is now white win state
	function kingIsOnEdge(gameState, move, color){
		
		/*return  move.isKing &&  
			move.ex === 0 && move.ey === 0 ||
			move.ex === 0 && move.ey === gameState.length-1 ||
			move.ex === gameState.length-1 && move.ey === 0 ||
			move.ex === gameState.length-1 && move.ey === gameState.length;*/

		return  move.isKing && (
			move.ex === 0 ||
			move.ex === gameState.length-1 ||
			move.ey === 0 ||
			move.ey === gameState.length-1);
	}

	function kingEscape(gameState, move, color){
		return  move.isKing && 
			move.ex === 0 && move.ey === 0 ||
			move.ex === 0 && move.ey === gameState.length-1 ||
			move.ex === gameState.length-1 && move.ey === 0 ||
			move.ex === gameState.length-1 && move.ey === gameState.length-1;
	}
}
