function MinimaxAI(maxDepth, type){
	console.log("AI type: "+type);
	const W = 0x01;//white (defenders)
	const B = 0x02;//black (attackers)

	const MAX_DEPTH = maxDepth;
	const TYPE = type;
	const OTHER_TYPE = TYPE === W ? B : W


	this.getMove = function(game) {
		return minimaxInit(game);
	}

	function minimaxInit(game){
		console.log("TYPE: "+TYPE);
		console.log(game);
		let isMaximizing = game.getCurrentPlayer() === TYPE;
		let bestScore = isMaximizing ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
		let moves = game.getMoves(TYPE); 
		let bestMove = moves[0];
		for(var i=0; i < moves.length; i++){
			console.log(moves[i]);
			//return moves[i];
			var score = minimax(game.simulateMove(moves[i]), 1, MAX_DEPTH, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
			if(isMaximizing){
				if(score > bestScore){
					bestScore = score;
					bestMove = moves[i];	
				}
			}else{
				if(score < bestScore){
					bestScore = score;
					bestMove = moves[i];
				}
			}
		}
		console.log("score: "+bestScore);
		return bestMove;
	}

	function minimax(game, depth, maxDepth, alpha, beta){
		if(game.isGameOver() == game.getCurrentPlayer() || depth === maxDepth){
			return evaluate(game, game.getCurrentPlayer(), depth);//TODO maybe use last player
		}

		var isMaximizing = game.getCurrentPlayer() === TYPE;
		var bestScore = isMaximizing ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
		//var bestMove = 0;
		var moves = game.getMoves(isMaximizing ? TYPE : OTHER_TYPE);
		for(var i=0; i < moves.length; i++){
			var score = minimax(game.simulateMove(moves[i]), depth+1, maxDepth, alpha, beta);
			if(isMaximizing){
				bestScore = Math.max(score, bestScore);
				alpha = Math.max(alpha, bestScore);
				if(beta <= alpha){
					//console.log("alpha break");
					break;
				}
			}else{
				bestScore = Math.min(score, bestScore);
				beta = Math.min(beta, bestScore);
				if(beta <= alpha){
					//console.log("beta break");
					break;
				}
			}
		}
		return bestScore;
	}

	//TODO determine sign based on our type from the constructor, we're always positive they're negative
	function evaluate(game, player, depth){
		let result = game.isGameOver();
		let opponent = game.getLastMovePlayer();
		if(result === player){
			console.log("WIN STATE:");
			console.log(game.getBoard());
			
			return 1000 * (MAX_DEPTH - depth); //increase incentive for winning asap not in 7 turns
		}
		else if(result === opponent){
			console.log("LOSS STATE:");
			return -1000 * (MAX_DEPTH - depth);
		}

		if(player === W){
			return evalWhite(game, player, depth);
		}
		else{
			return evalBlack(game, player, depth);
		}
	}

	function evalWhite(game, player, depth){
		//TODO heuristics:
		//king is on edge +
		//king is in danger --- (check if next move by black can win game)
		//king/player sets up capture +	?
		//player blocks opponent from stopping escape + ?
		//is up in pieces ++ (general advantage)
		//has non king piece on edge +

		let score = 0;
		let lm = game.getLastMove();
		if(lm.captures.length > 0){
			console.log("CAPTURE ON WHITE MOVE "+lm.captures.length);
			score += 100 * lm.captures.length * (MAX_DEPTH - depth);
		}

		let state = game.getBoard();
		let kp = game.findKing();	//king's position: {x,y}
		//TODO this is somewhat rule dependent, I'm checking Cleveland rules (2 attacker capture on king)
		//TODO also completely ignores the class of attacks that slide across instead of towards the king
		//determine if king is in imminent danger
			//return negative number for this
		
		/*if(state[kp.x+1] && state[kp.x+1][kp.y] === B){
			//check below column to see if black piece is in position to kill on next move
			let i = kp.x-1;
			let underAttack = false;
			while(state[i] && !underAttack){
				underAttack = (state[i][kp.y] === B);
				i--;
			}
			score += underAttack ? -100 : 0;
			
			//now check side swipe(s) above/below
			let j = kp.y+1;
			underAttack = false;
			while(state[kp.x-1] && !underAttack){
				underAttack = (state[kp.x][j] === B);
				j++;
			}
			score += underAttack ? -100 : 0;

			j = kp.y-1;
			underAttack = false;
			while(state[kp.x-1] && !underAttack){
				underAttack = (state[kp.x][j] === B);
				j--;
			}
			score += underAttack ? -100 : 0;
		}
		else if(state[kp.x-1] && state[kp.x-1][kp.y] === B){
			let i = kp.x+1;
			let underAttack = false;
			while(state[i] && !underAttack){
				underAttack = (state[i][kp.y] === B);
				i++;
			}
			score += underAttack ? -100 : 0;

			//now check side swipe(s) above/below
			let j = kp.y+1;
			underAttack = false;
			while(state[kp.x+1] && !underAttack){
				underAttack = (state[kp.x][j] === B);
				j++;
			}
			score += underAttack ? -100 : 0;

			j = kp.y-1;
			underAttack = false;
			while(state[kp.x+1] && !underAttack){
				underAttack = (state[kp.x][j] === B);
				j--;
			}
			score += underAttack ? -100 : 0;
		}
		else if(state[kp.x][kp.y+1] === B){
			let j = kp.y-1;
			let underAttack = false;
			while(state[kp.x][j] && !underAttack){
				underAttack = (state[kp.x][j] === B);
				j--;
			}
			score += underAttack ? -100 : 0;

			let i = kp.x+1;
			underAttack = false;
			while(state[i] && !underAttack){
				underAttack = (state[i][kp.y-1] === B);
				i++;
			}

			i = kp.x-1;
			underAttack = false;
			while(state[i] && !underAttack){
				underAttack = (state[i][kp.y-1] === B);
				i--;
			}
			
		}
		else if(state[kp.x][kp.y-1] === B){
			let j = kp.y+1;
			let underAttack = false;
			while(state[kp.x][j] && !underAttack){
				underAttack = (state[kp.x][j] === B);
				j++;
			}
			score += underAttack ? -100 : 0;
	
			let i = kp.x+1;
			underAttack = false;
			while(state[i] && !underAttack){
				underAttack = (state[i][kp.y+1] === B);
				i++;
			}

			i = kp.x-1;
			underAttack = false;
			while(state[i] && !underAttack){
				underAttack = (state[i][kp.y+1] === B);
				i--;
			}
		}*/

		//determine if king has imminent win, or access to 1 or more edges
			//return multiplier		

		//find king
		//if he has access to the edge or corners its good
		

		return score + getRandomInt(0,10);
	}

	
	/*function isBlackTop(state, x, y){
		return state[x+1] && state[x+1][y] === B;	
	}

	function isBlackRight(state, x, y){
		return state[x][y+1] && state
	}

	function isBlackLeft(state, x, y){

	}

	function isBlackBelow(state, x, y){

	}*/

	function evalBlack(game, player, depth){
		//TODO heuristics:
		//endangers king ++
		//endangers piece +
		//is up in pieces + (gneral advantage, meaningless until late game, since black always starts with 2x pieces)
		let score = 0;
		let lm = game.getLastMove();
		if(lm.captures.length > 0){
			console.log("CAPTURE ON BLACK MOVE "+lm.captures.length);
			score += 100 * lm.captures.length * (MAX_DEPTH - depth);
		}
		return score + getRandomInt(0,10);
	}

	function getRandomInt(min, max) {
	  	min = Math.ceil(min);
	  	max = Math.floor(max);
	  	return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
	}
}
