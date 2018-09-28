//TODO functions but ist awfully slow and naively implemented
//still needs heuristics too

//TODO need to track Kings movement...
function AI(color, searchDepth){

	const EMPTY_SPACE = 0x00;
	const KING = 0x04;
	const DEFENDERS = 0x01 | 0x04;
	const ATTACKERS = 0x02;
	const ourColor = color === "white" ? DEFENDERS : ATTACKERS;
	const theirColor = ourColor === DEFENDERS ? ATTACKERS : DEFENDERS;
	console.log(ourColor);
	console.log(theirColor);

	this.getMove = function(gameState){
		//run minimax, return a value that the game understands (start sqaure, end sqaure)
		//console.log(gameState);
		//return minimax2(gameState, null, 0, ourColor, Number.MIN_SAFE_INTEGER , Number.MAX_SAFE_INTEGER).move; //TODO invalid moves coming through...
		//TODO figure out a b pruning
		//minimax(gameState, null, 0, ourColor);

		return minimaxInit(gameState, ourColor);
	};

	//TODO need to clear pieces that are captured
	//TODO dont include moves that are just transpositions of other available moves
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
						if(evalFunc(gameState, k, j, isKing)){
							moves.push(new StateChange(
								gameState,								
								new Move([i,j], [k,j], isKing),
								color));
						}else if(!isCorner(gameState, k, j) && gameState[k][j] === EMPTY_SPACE){
							continue;
						}else{
							break;
						}
					}
					//look down
					for(var k=i+1; k < gameState.length; k++){
						//console.log("kdown:"+ gameState[k][j]+" "+EMPTY_SPACE+" "+ (gameState[k][j] == EMPTY_SPACE) );
						if(evalFunc(gameState, k, j, isKing)){
							moves.push(new StateChange(
								gameState,								
								new Move([i,j], [k,j], isKing),
								color));
						}else if(!isCorner(gameState, k, j) && gameState[k][j] === EMPTY_SPACE){
							continue;
						}else{
							break;
						}
					}
					//look left
					for(var k=j-1; k >= 0; k--){
						//console.log("kleft: "+i+" "+k+" "+ gameState[i][k]+" "+EMPTY_SPACE+" "+ (gameState[i][k] == EMPTY_SPACE) );
						if(evalFunc(gameState, i, k, isKing)){
							moves.push(new StateChange(
								gameState,
								new Move([i,j], [i,k], isKing),
								color));
						}else if(!isCorner(gameState, i, k) && gameState[k][j] === EMPTY_SPACE){
							continue;
						}else{
							break;
						}
					}
					//look right
					for(var k=j+1; k < gameState[i].length; k++){
						//console.log("kright:"+ gameState[i][k]+" "+EMPTY_SPACE+" "+ (gameState[i][k] == EMPTY_SPACE) );
						if(evalFunc(gameState, i, k, isKing)){
							moves.push(new StateChange(
								gameState,
								new Move([i,j], [i,k], isKing),
								color));
						}else if(!isCorner(gameState, i, k) && gameState[k][j] === EMPTY_SPACE){
							continue;
						}else{
							break;
						}
					}
					//TODO debug
					//return moves;
				}
			}
		}
		//console.log(moves);
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

	function scoreState(stateChange){
		if(stateChange.isWin()){
			//console.log("is win for: "+stateChange.getColor());
			//console.log(stateChange.getStartState());
			//console.log(stateChange.getMove());
			//return Number.MAX_SAFE_INTEGER;
		}else{
			//console.log("NOT WINNING MOVE");
			//console.log(stateChange.getMove());
		}

		var sum = 0;
		if(stateChange.isCapture()){
			console.log("isCapture()!");
			console.log(stateChange.getMove());
			console.log(stateChange.getStartState());
			sum += 10000;
		}
		if(stateChange.isEscape()){
			console.log("isEscape()!");
			sum += 1000;
		}
		sum += getRandomInt(0,1000);

		return sum;
	}

	function minimaxInit(gameState, color){
		var moves = getMoves(gameState, color);
		var bestScore = Number.MIN_SAFE_INTEGER;
		var bestIndex = 0;
		var changeColor = color === ourColor ? theirColor : ourColor;
		var alpha = Number.MIN_SAFE_INTEGER;
		var beta = Number.MAX_SAFE_INTEGER;
		console.log(moves);
		for(var i=0; i < moves.length; i++){
			var score = minimax2(moves[i], 1, changeColor, alpha, beta);
			if(score > bestScore){
				bestScore = score;
				bestIndex = i;
			}
		}
		console.log("--NEW MOVE---");
		console.log(bestIndex);
		console.log(bestScore);
		console.log(moves[bestIndex].getMove());
		console.log(moves[bestIndex].getStartState());
		console.log(moves[bestIndex].getEndState());
		console.log(moves[bestIndex].isCapture());
		console.log(scoreState(moves[bestIndex]));
		return moves[bestIndex].getMove();
	}

	function minimax2(stateChange, level, color, alpha, beta){
		if(level === searchDepth || stateChange.isGameOver()){
			return scoreState(stateChange);
		}

		//console.log(stateChange);
		var changeColor = color === ourColor ? theirColor : ourColor;
		var moves = getMoves(stateChange.getEndState(), color);
		var bestScore = color === ourColor ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
		
		for(var i=0; i < moves.length; i++){
			var stateScore = minimax2(
				moves[i],
				level + 1,
				changeColor);

			if(color === ourColor){
				if(stateScore > bestScore){
					bestScore = stateScore;
				}
			}else{
				//stateScore = -stateScore;
				if(stateScore < bestScore){
					bestScore = stateScore;
				}
			}
		}
		return bestScore;
	}

	function getRandomInt(min, max) {
	    return Math.floor(Math.random() * (max - min + 1)) + min;
	}
}
