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
			return evaluate(game, game.getCurrentPlayer());//TODO maybe use last player
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

	function evaluate(game, player){
		if(game.isGameOver() == player){
			console.log("WIN STATE:");
			console.log(game.getBoard());
			
			return 1000;
		}
		return evalWhite(game, player);
	}

	function evalWhite(game, player){
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
			score += 100 * lm.captures.length;
		}
		return score + getRandomInt(0,10);
	}

	function evalBlack(game, player){
		//TODO heuristics:
		//endangers king ++
		//endangers piece +
		//is up in pieces + (gneral advantage, meaningless until late game, since black always starts with 2x pieces)
		let score = 0;
		let lm = game.getLastMove();
		if(lm.captures.length > 0){
			console.log("CAPTURE ON BLACK MOVE "+lm.captures.length);
			score += 100 * lm.captures.length;
		}
		return score + getRandomInt(0,10);
	}

	function getRandomInt(min, max) {
	  	min = Math.ceil(min);
	  	max = Math.floor(max);
	  	return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
	}
}
