function MonteCarloAI(MAXDEPTH, player){
	var player = player;

	//works but hellishly slow
	//maybe add best first pruning to it

	this.getMove = function(board){
		let moves = board.getMoves(board.getCurrentPlayer());
		let bestScore = Number.MIN_SAFE_INTEGER;
		let bestMove = moves[0];
		for(let i=0; i < moves.length; i++){
			let score = simulateGames(board.simulateMove(moves[i]), MAXDEPTH);
			if(score > bestScore){
				bestScore = score;
				bestMove = moves[i];
			}
		}
		console.log("score: "+bestScore);
		console.log(bestMove);
		return bestMove;
	}

	function simulateGames(startState, numGames){
		let score = 0;
		for(let i=0; i< numGames; i++){
			let newGame = startState;
			let isStale = false;
			let moveCount = 0;
			while(!newGame.isGameOver() && moveCount < 20){
				let moves = newGame.getMoves(newGame.getCurrentPlayer());
				if(moves.length === 0){
					if(game.getCurrentPlayer() === B){
						break;
					}else{
						isStale = true; break;
					}
				}
				newGame = newGame.simulateMove(getRandomIndex(moves));
				moveCount++;
			}

			if(isStale){//stale, obviously
				score--;
			}else if(newGame.isGameOver() !== player){//lose
				score-=2;
			}else if(newGame.isGameOver() === player){//win
				score+=2;
			}else{//neither win nor lose
				score++;
			}
		}
		return score;
	}

	function getRandomIndex(arr){
		return arr[Math.floor(Math.random() * arr.length)];
	}
}
