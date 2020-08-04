//currently assumes game is Brandubh
function HeatseekerAI(type){
	console.log("heatseeker AI: "+type);

	const E = 0x00;//empty
	const W = 0x01;//white (defenders)
	const B = 0x02;//black (attackers)
	const K = 0x04;//white king
	const DEFENDERS = W | K;

	const TYPE = type;
	const OTHER_TYPE = TYPE === W ? B : W

	this.getMove = function(game){
		return heatseek(game);
		//return game.getMoves(TYPE)[0];
	}

	function heatseek(game){
		

		//compute dynamic heatmap

		//init map to the static map by cloning it via JSON->stringify->parse
		let dynamap = JSON.parse(JSON.stringify(BRANDUBH_ATTACKER_HMAP));
		let pre = JSON.parse(JSON.stringify(BRANDUBH_ATTACKER_HMAP));
		console.log(pre);
		let state = game.getBoard();
		for(let i=0; i < state.length; i++){
			//dynamap[i] = [];	//allocate 2nd dimension
			for(let j=0; j < state[0].length; j++){
				//check if current state is enemy
				//this only evals for black ai
				//TODO white AI
				if(state[i][j] === W){
					//check surroundings for captures attacks
					//TODO weight getting exterior position > interior
					//or consider king's position 

					
					if(state[i-1] !== undefined && state[i-1][j] === B){
						dynamap[i+1][j] += 15;	//can capture from above
						if(dynamap[i-2]){ dynamap[i-2][j] +=  3;}	//can reinforce ally from below
					}else{
						dynamap[i-1][j] += 2;	//can attack
					}

					if(state[i+1] !== undefined && state[i+1][j] === B){
						dynamap[i-1][j] += 15;
						if(dynamap[i+2]){ dynamap[i+2][j] += 3;}
					}else{
						dynamap[i+1][j] += 2;	//can attack
					}

					if(state[i][j-1] === B){
						dynamap[i][j+1] += 15;
						dynamap[i][j-2] += 3;
					}else{
						dynamap[i][j-1] += 2;
					}

					if(state[i][j+1] === B){
						dynamap[i][j-1] += 15;
						dynamap[i][j+2] += 3;
					}else{
						dynamap[i][j+1] += 2;
					}
				}
				else if(state[i][j] === K){
					//add value to every square until we reach the edge of the board in all directions

					//capture heuristics (winning move)
					if(state[i-1] !== undefined && (state[i-1][j] === B || game.isSpecialCell(i-1,j) ) ){
						dynamap[i+1] && (dynamap[i+1][j] += 1000);
					}
					if(state[i+1] !== undefined && (state[i+1][j] === B || game.isSpecialCell(i+1,j) ) ){
						dynamap[i-1] && (dynamap[i-1][j] += 1000);
					}
					if(/*state[i][j-1] &&*/ (state[i][j-1] === B || game.isSpecialCell(i,j-1) ) ){
						dynamap[i][j+1] += 1000;
					}
					if(/*state[i][j+1] &&*/ (state[i][j+1] === B || game.isSpecialCell(i,j+1) ) ){
						dynamap[i][j-1] += 1000;
					}
					//contain heuristics
					for(let x=i-1; x >= 0; x--){
						let diff = Math.abs(i-x);
						dynamap[x][j] += 15 - diff;
					}
					for(let x=i+1; x < state.length; x++){
						let diff = Math.abs(i-x);
						dynamap[x][j] += 15 - diff;
					}
					for(let y=j-1; y >= 0; y--){
						let diff = Math.abs(j-y);
						dynamap[i][y] += 15 - diff;
					}
					for(let y=j+1; y < state[i].length; y++){
						let diff = Math.abs(j-y);
						dynamap[i][y] += 15 - diff;
					}
				}
				else if(state[i][j] === B){
					//TODO self preservation moves check
					//escape imminent capture
				}
			}
		}

		//sum heatmaps

		//search moves for highest score
		console.log(dynamap);
		let moves = game.getMoves(TYPE);
		console.log(moves[0]);
		let bestMoves = [];
		bestMoves.push(moves[0]);
		let bestScore = dynamap[moves[0].ex][moves[0].ey];
		for(let i=0; i < moves.length; i++){
			let move = moves[i];
			if(dynamap[move.ex][move.ey] > bestScore){
				bestScore = dynamap[move.ex][move.ey];
				bestMoves = [];
				bestMoves.push(move);
			}else if(dynamap[move.ex][move.ey] === bestScore){
				bestMoves.push(move);
			} 
		}

		//return that move
		//select random from list of bestMoves
		//console.log(bestMove);
		return bestMoves[getRandomInt(0, bestMoves.length)];
	}
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

//TODO static positional heatmaps for all variants


BRANDUBH_ATTACKER_HMAP = 
[[0,0,1,0,1,0,0],
 [0,5,0,0,0,5,0],
 [1,0,0,0,0,0,1],
 [0,0,0,0,0,0,0],
 [1,0,0,0,0,0,1],
 [0,5,0,0,0,5,0],
 [0,0,1,0,1,0,0]];

BRANDUBH_KING_HMAP =
[[100,1 ,10,10,10, 1,100],
 [1  ,10, 0, 0, 0,10,  1],
 [10 , 0, 0, 0, 0, 0, 10],
 [10 , 0, 0, 0, 0, 0, 10],
 [10 , 0, 0, 0, 0, 0, 10],
 [1  ,10, 0, 0, 0,10,  1],
 [100, 1,10,10,10, 1,100]];
