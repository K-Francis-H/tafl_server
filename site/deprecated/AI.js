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
		return minimax_old(gameState, null, 0, ourColor, Number.MIN_SAFE_INTEGER , Number.MAX_SAFE_INTEGER).move; //TODO invalid moves coming through...
		//TODO figure out a b pruning
		//minimax(gameState, null, 0, ourColor);
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
						if(evalFunc(gameState, k, j)){
							moves.push(new Move([i,j], [k,j], isKing));
						}else{
							break;
						}
					}
					//look down
					for(var k=i+1; k < gameState.length; k++){
						//console.log("kdown:"+ gameState[k][j]+" "+EMPTY_SPACE+" "+ (gameState[k][j] == EMPTY_SPACE) );
						if(evalFunc(gameState, k, j)){
							moves.push(new Move([i,j], [k,j], isKing));
						}else{
							break;
						}
					}
					//look left
					for(var k=j-1; k >= 0; k--){
						//console.log("kleft: "+i+" "+k+" "+ gameState[i][k]+" "+EMPTY_SPACE+" "+ (gameState[i][k] == EMPTY_SPACE) );
						if(evalFunc(gameState, i, k)){
							moves.push(new Move([i,j], [i,k], isKing));
						}else{
							break;
						}
					}
					//look right
					for(var k=j+1; k < gameState[i].length; k++){
						//console.log("kright:"+ gameState[i][k]+" "+EMPTY_SPACE+" "+ (gameState[i][k] == EMPTY_SPACE) );
						if(evalFunc(gameState, i, k)){
							moves.push(new Move([i,j], [i,k], isKing));
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
		console.log("g");
		console.log(gameState);
		console.log("c");
		console.log(copyState);
		var position = {
			x : move.ex,
			y : move.ey
		};
		//var state = copyState;
		var size = copyState.length;
		
		//now check captures
		if(position.x+2 < size && ( (copyState[position.x+2][position.y] & color) > 0 || isSpecialCell(size, position.x+2, position.y)) && (copyState[position.x+1][position.y] & theirColor) > 0){
			console.log("x+");
			console.log(move);
			return true;
		}
		if(position.x-2 >= 0 && ( (copyState[position.x-2][position.y] & color) > 0 || isSpecialCell(size, position.x-2, position.y)) && (copyState[position.x-1][position.y] & theirColor) > 0){
			console.log("x-");
			console.log(move);
			return true;
		}
		if(position.y+2 < size && ( (copyState[position.x][position.y+2] & color) > 0 || isSpecialCell(size, position.x, position.y+2)) && (copyState[position.x][position.y+1] & theirColor) > 0){
			console.log("y+");
			console.log(move);
			return true;
		}
		if(position.y-2 >= 0 && ( (copyState[position.x][position.y-2] & color) > 0 || isSpecialCell(size, position.x, position.y-2)) && (copyState[position.x][position.y-1] & theirColor) > 0){
			console.log("y-");
			console.log(move);
			return true;
		}

		return false;
	}

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

	//TODO random is usually between 850 -> 1000 ??????
	function scoreState(gameState, move, color){
		//eval game state with heuristics
		//console.log("scoring state");
		//just random for now see if we can get it to work
		var score = unisexScore(gameState, move, color)
			  + escapeCapture(gameState, move, color);
		//console.log("score: "+score);
		return { score : score + getRandomInt(0,5), //fudge
			 move  : move };

		/*if(color === DEFENDERS){

		}else{//ATTACKERS
			
		}*/
	}

	function unisexScore(gameState, move, color){
		var sum = 0;
		sum += isCapture(gameState, move, color) ? 100 : 0;
		//TODO check adjacency? or escaping a capture 
		return sum;
	}

	

	//TODO need to pick the top level best move seems to be sending the bottom level move
	//figured it out, just track bestIndex, set bestScore.move to moves[bestIndex]
	function minimax_old(gameState, move, level, color){
		//console.log("level: "+level);
		//console.log("color: "+color);
		//console.log(gameState);
		
		if(level === searchDepth || isTerminalState(gameState, move)){
			//actually need to score the last teams move, since this is eval depth
			return scoreState(gameState, move, color === ourColor ? theirColor : ourColor); 
		}

		var bestScore = {
			score : 0,
			move : move,
		};
		bestScore.score = color === ourColor ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;	//set worst case scores
		var bestIndex = 0;
		var scores = [];
		//var minMaxFunc = color === ourColor ? Math.max : Math.min;
		var changeColor = color === ourColor ? theirColor : ourColor; 				//get the next levels color
		var moves = getMoves(gameState, color);
		//console.log(moves.length);
		for(var i=0; i < moves.length; i++){
			//console.log("move: "+i);
			//TODO probs need to compute state from move at some point also else lower depths dont work (it thinks game state is same, makes impossible moves)
			var stateScore =  minimax_old(
				gameState,//stateFromMove(gameState, moves[i], color),
				moves[i],
				level + 1,
				changeColor
			);
			//console.log(stateScore);
			
			scores.push(stateScore);
			if(color == ourColor){
				
				if(stateScore.score > bestScore.score){
					bestScore.score = stateScore.score;
					bestScore.move = stateScore.move; 
					bestIndex = i;
				}
				//if this score is greater than the worst case (for me) move of my opponent, I ignore it and return
				//alpha = Math.max(alpha, stateScore);
				//if(alpha > beta){
					//break;
				//	return bestScore;
				//}
			}else{
				if(stateScore.score < bestScore.score){
					bestScore.score = stateScore.score;
					bestScore.move = stateScore.move; 
					bestIndex = i;
				}
				//if this score is better than the worst case (for my opponent) move I ignore it and return
				//beta = Math.min(beta, stateScore);
				//if(beta > alpha){
					//break;
				//	return bestScore;
				//}
			}
		}
		if(level === 0){
			console.log(moves);
			console.log(scores);
			console.log("move ["+bestIndex+"]");
			console.log(moves[bestIndex]);
			console.log(bestScore);
			bestScore.move = moves[bestIndex];
		}
		return bestScore;
	}

	//TODO a,b pruning is not delivering the correct moves its seems
	//same with old algo maybe a,b just exasperates problem
	//TODO add bestIndex and track it
	function minimax(gameState, move, level, color, alpha, beta){
		if(level == searchDepth || isTerminalState(gameState, move)){
			return scoreState(gameState, move, color); 
		}

		var moves = getMoves(gameState, color);
		var bestIndex = 0;
		var changeColor = color === ourColor ? theirColor : ourColor; 

		if(color === ourColor){
			var bestScore = {
				score : Number.MIN_SAFE_INTEGER,
				move : move
			};
			
			//console.log(moves.length);
			for(var i=0; i < moves.length; i++){
				var score = minimax(
					gameState,//stateFromMove(gameState, moves[i], color),
					moves[i],
					level + 1,
					changeColor,
					alpha,
					beta
				);
				//bestScore = bestScore.score > score.score ? bestScore : score; //Math.max(bestScore.score, score.score);//cause we attach move data making this an object...
				if(score.score > bestScore.score){
					bestScore.score = score.score;
					bestScore.move = score.move;
					bestIndex = i;
				}
				
				//console.log("our move: "+alpha+" "+beta);
				alpha = Math.max(alpha, bestScore.score);
				if(alpha >= beta){
					/*return {
						score : alpha,
						move : score.move
					};*/
					break;
					//return bestScore;
				}
			}
			console.log(bestScore.move);
			if(level === 0){
				console.log(moves);
				//console.log(scores);
				console.log("move ["+bestIndex+"]");
				console.log(moves[bestIndex]);
				console.log(bestScore);
				bestScore.move = moves[bestIndex];
				console.log(bestIndex);
			}
			return bestScore; //if we reach this all options were on the table no pruning
		}else{
			var bestScore = {
				score : Number.MAX_SAFE_INTEGER,
				move : move
			};
			
			//console.log(moves.length);
			for(var i=0; i < moves.length; i++){
				var score = minimax(
					gameState,//stateFromMove(gameState, moves[i], color),
					moves[i],
					level + 1,
					changeColor,
					alpha,
					beta
				);
				bestScore = bestScore.score < score.score ? bestScore : score;
				if(score.score < bestScore.score){
					bestScore.score = score.score;
					bestScore.move = score.move;
					bestIndex = i;
				}
				beta = Math.min(beta, bestScore.score);
				//console.log("their move: "+alpha+" "+beta);
				if(alpha >= beta){
					/*return {
						score : beta,
						move : score.move
					};*/
					break;
					//return bestScore;
				}
			}
			console.log(bestScore.move);
			if(level === 0){
				console.log(moves);
				//console.log(scores);
				console.log("move ["+bestIndex+"]");
				console.log(moves[bestIndex]);
				console.log(bestScore);
				bestScore.move = moves[bestIndex];
				console.log(bestIndex);
			}
			return bestScore;
		}
	}

	//function negamax(gameState, move, level, alpha, beta){
	//	if(isTerminalState(gameState, move) || level === searchDepth){

	//	}
	//}

	function Move(startCoords, endCoords, isKing){
		this.sx = startCoords[0];
		this.sy = startCoords[1];
		this.ex = endCoords[0];
		this.ey = endCoords[1];
		this.isKing = isKing;
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
