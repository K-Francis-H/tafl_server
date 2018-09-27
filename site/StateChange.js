function StateChange(startState, move, color){

	const EMPTY_SPACE = 0x00;
	const KING = 0x04;
	const DEFENDERS = 0x01 | 0x04;
	const ATTACKERS = 0x02;
	const ourColor = color;
	const theirColor = ourColor === DEFENDERS ? ATTACKERS : DEFENDERS;

	var endState = stateFromMove(startState, move, color);
	var isCapture = isCapture(startState, move, color);
	var isTerminalStateVar = isTerminalState(startState, move);

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

	this.getColor = function(){
		return color;
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
					sum += 10;
					break;
				}
			}
		}

		if(move.sx+1 < copyState.length && (copyState[move.sx+1][move.sy] & theirColor) > 0){
			for(var i=move.sx-2; i >= 0; i--){
				if( (copyState[i][move.sy] & theirColor) > 0){
					sum += 10;
					break;
				}
			}
		}

		if(move.sy-1 >= 0 && (copyState[move.sx][move.sy-1] & theirColor) > 0){
			for(var i=move.sy-2; i >= 0; i--){
				if( (copyState[move.sx][i] & theirColor) > 0){
					sum += 10;
					break;
				}
			}
		}

		if(move.sy+1 < copyState.length && (copyState[move.sx][move.sy+1] & theirColor) > 0){
			for(var i=move.sy+2; i < copyState.length; i++){
				if( (copyState[move.sx][i] & theirColor) > 0){
					sum += 10;
					break;
				}
			}
		}

		return sum;
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
