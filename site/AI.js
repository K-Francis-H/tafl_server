//TODO functions but ist awfully slow and naively implemented
//still needs heuristics too
function AI(color, searchDepth){

	const EMPTY_SPACE = 0x00;
	const KING = 0x04;
	const DEFENDERS = 0x01 | 0x04;
	const ATTACKERS = 0x02;
	const ourColor = color === "white" ? DEFENDERS : ATTACKERS;
	const theirColor = ourColor === DEFENDERS ? ATTACKERS : DEFENDERS;

	this.getMove = function(gameState){
		//run minimax, return a value that the game understands (start sqaure, end sqaure)
		//console.log(gameState);
		return stateFromMove(gameState, minimax(gameState, null, 0, ourColor).move, ourColor);
		//minimax(gameState, null, 0, ourColor);
	};

	//TODO need to clear pieces that are captured

	//must also check whether this is the king moving or 
	function getMoves(gameState, color){
		moves = [];
		//console.log(gameState);
		//get list of available moves based on current state
		for(var i=0; i < gameState.length; i++){
			for(var j=0; j < gameState[i].length; j++){
				//console.log(gameState[i][j]+" "+color+" "+( (gameState[i][j] & color) > 0));
				if( (gameState[i][j] & color) > 0){
					//console.log("piece at: "+i+" "+j);
					var isKing = (gameState[i][j] & KING) > 0;//TODO use this
					var evalFunc = function(gameState, x, y, isKing){
						if(!isKing){
							return (gameState[x][y] === EMPTY_SPACE) && !isSpecialCell(gameState.length, x, y);
						}else{
							return (gameState[x][y] === EMPTY_SPACE);
						}
					} 
					//check for cardinal directions and push them to move array
					//look up
					for(var k=i-1; k >= 0; k--){
						//console.log("kup: "+"k"+k+" j"+j+" "+ gameState[k][j]+" "+EMPTY_SPACE+" "+ (gameState[k][j] == EMPTY_SPACE) );
						if(evalFunc(gameState, k, j)){
							moves.push(new Move([i,j], [k,j]));
						}else{
							break;
						}
					}
					//look down
					for(var k=i+1; k < gameState.length; k++){
						//console.log("kdown:"+ gameState[k][j]+" "+EMPTY_SPACE+" "+ (gameState[k][j] == EMPTY_SPACE) );
						if(evalFunc(gameState, k, j)){
							moves.push(new Move([i,j], [k,j]));
						}else{
							break;
						}
					}
					//look left
					for(var k=j-1; k >= 0; k--){
						//console.log("kleft: "+i+" "+k+" "+ gameState[i][k]+" "+EMPTY_SPACE+" "+ (gameState[i][k] == EMPTY_SPACE) );
						if(evalFunc(gameState, i, k)){
							moves.push(new Move([i,j], [i,k]));
						}else{
							break;
						}
					}
					//look right
					for(var k=j+1; k < gameState[i].length; k++){
						//console.log("kright:"+ gameState[i][k]+" "+EMPTY_SPACE+" "+ (gameState[i][k] == EMPTY_SPACE) );
						if(evalFunc(gameState, i, k)){
							moves.push(new Move([i,j], [i,k]));
						}else{
							break;
						}
					}
					//TODO debug
					//return moves;
				}
			}
		}
		return moves;
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

	function stateFromMove(gameState, move, color){
		//TODO remove pieces if captured
		copyState = JSON.parse(JSON.stringify(gameState));
		copyState[move.sx][move.sy] = EMPTY_SPACE;
		copyState[move.ex][move.ey] = color;
		//console.log(copyState);
		return copyState;
	}

	function scoreState(gameState, move, color){
		//eval game state with heuristics
		//console.log("scoring state");
		//just random for now see if we can get it to work
		var score = getRandomInt(0,100);
		console.log("score: "+score);
		return { score : getRandomInt(0,100),
			 move  : move };
	}

	//TODO need to pick the top level best move seems to be sending the bottom level move
	function minimax(gameState, move, level, color){
		//console.log("level: "+level);
		//console.log("color: "+color);
		//console.log(gameState);
		if(level == searchDepth || isTerminalState(gameState, move)){
			return scoreState(gameState, move, color); 
		}

		var bestScore = {
			score : 0,
			move : move
		};
		bestScore.score = color == ourColor ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;	//set worst case scores
		var changeColor = color == ourColor ? theirColor : ourColor; 				//get the next levels color
		var moves = getMoves(gameState, color);
		console.log(moves.length);
		for(var i=0; i < moves.length; i++){
			console.log("move: "+i);
			var stateScore = minimax(
				stateFromMove(gameState, moves[i], color),
				moves[i],
				level + 1,
				changeColor
			);
			console.log(stateScore);

			if(color == ourColor){
				if(stateScore.score > bestScore.score){
					bestScore = stateScore;
				}
			}else{
				if(stateScore.score < bestScore.score){
					bestScore = stateScore;
				}
			}
		}
		return bestScore;
	}

	function Move(startCoords, endCoords){
		this.sx = startCoords[0];
		this.sy = startCoords[1];
		this.ex = endCoords[0];
		this.ey = endCoords[1];
	}

	function isTerminalState(gameState, move){
		//check if the king is in a corner
		var boardSize = gameState.length-1;
		if(gameState[0][0] === KING
		|| gameState[0][boardSize] === KING
		|| gameState[boardSize][0] === KING
		|| gameState[boardSize][boardSize] === KING){
			return true;
		}

		//find the king
		for(var i=0; i < gameState.length; i++){
			for(var j=0; j < gameState[i].length; j++){
				if(gameState[i][j] === KING){
					//check four directions, is he surrounded ?
					var count = 0;
					if(i > 0 && gameState[i-1][j] === ATTACKERS){count++;}
					if(i < gameState.length-1 && gameState[i+1][j] === ATTACKERS){count++;}
					if(j > 0 && gameState[i][j-1] === ATTACKERS){count++;}
					if(j < gameState[i].length-1 && gameState[i][j+1] === ATTACKERS){count++;}

					//if the king moved between attackers, the game is not over so check last move was NOT made by the king
					//null check on move in case top level... asuuming this wont not work
					return count >= 2 && move != null && gameState[move.sx][move.sy] !== KING;
				}
			}
		}
	}

	function getRandomInt(min, max) {
	    return Math.floor(Math.random() * (max - min + 1)) + min;
	}
}
