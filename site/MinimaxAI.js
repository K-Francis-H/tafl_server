function MinimaxAI(maxDepth, type){
	const W = 0x01;//white (defenders)
	const B = 0x02;//black (attackers)

	const MAX_DEPTH = maxDepth;
	const TYPE = type;
	const OTHER_TYPE = TYPE === W ? B : W

	this.getMove = function(game) {
		return minimaxInit(game);
	}

	function minimaxInit(game){
		let isMaximizing = game.getCurrentPlayer() === TYPE;
		let bestScore = isMaximizing ? Number.MIN_SAFE_INTEGER : Number.MAX_SAFE_INTEGER;
		let bestMove = 0;
		let moves = game.getMoves(TYPE); 
		for(var i=0; i < moves.length; i++){
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
		return bestMove;
	}

	function minimax(game, depth, maxDepth, alpha, beta){
		if(game.isGameOver() || depth === maxDepth){
			return evaluate(game, game.getLastMovePlayer());//TODO maybe use last player
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
					console.log("alpha break");
					break;
				}
			}else{
				bestScore = Math.min(score, bestScore);
				beta = Math.min(beta, bestScore);
				if(beta <= alpha){
					console.log("beta break");
					break;
				}
			}
		}
		return bestScore;
	}

	function evaluate(game, player){
		//TODO
		return getRandomInt(0,10);
	}

	function getRandomInt(min, max) {
	  	min = Math.ceil(min);
	  	max = Math.floor(max);
	  	return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
	}
}
