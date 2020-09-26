//currently assumes game is Brandubh
function HeatseekerAI(type, variant){
	//TODO use variant to load correct variant
	console.log("heatseeker AI: "+type);

	const E = 0x00;//empty
	const W = 0x01;//white (defenders)
	const B = 0x02;//black (attackers)
	const K = 0x04;//white king
	const DEFENDERS = W | K;

	const TYPE = type;
	const OTHER_TYPE = TYPE === W ? B : W

	this.getMove = function(game){
		//return heatseek(game);
		//return heatseekDefender(game);
		//return game.getMoves(TYPE)[0];
		if(TYPE === B){
			return heatseek(game);
		}else{
			return heatseekDefender(game);
		}
	}

	function heatseek(game){
		

		//compute dynamic heatmap

		//init map to the static map by cloning it via JSON->stringify->parse
		let dynamap = JSON.parse(JSON.stringify(TABLUT_ATTACKER_HMAP));//BRANDUBH_ATTACKER_HMAP));
		//let pre = JSON.parse(JSON.stringify(TABLUT_ATTACKER_HMAP));//BRANDUBH_ATTACKER_HMAP));
		//console.log(pre);
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
					}else if(state[i-1] !== undefined){
						dynamap[i-1][j] += 2;	//can attack
					}

					if(state[i+1] !== undefined && state[i+1][j] === B){
						dynamap[i-1][j] += 15;
						if(dynamap[i+2]){ dynamap[i+2][j] += 3;}
					}else if(state[i+1] !== undefined){
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
					//TODO prefer moves that block edge, escape access or minimax to find out that not blocking is a next turn win for white
					let edgeAccess = findEdgeAccess(state, i, j);

					let edgeMod = edgeAccess.left ? 10 : 0;//up score if moving there blocks an open edge/corner
					for(let x=i-1; x >= 0; x--){
						let diff = Math.abs(i-x);
						dynamap[x][j] += 15 - diff + edgeMod;
					}
					edgeMod = edgeAccess.right ? 10 : 0;
					for(let x=i+1; x < state.length; x++){
						let diff = Math.abs(i-x);
						dynamap[x][j] += 15 - diff + edgeMod;
					}
					edgeMod = edgeAccess.up ? 10 : 0;
					for(let y=j-1; y >= 0; y--){
						let diff = Math.abs(j-y);
						dynamap[i][y] += 15 - diff + edgeMod;
					}
					edgeMod = edgeAccess.down ? 10 : 0;
					for(let y=j+1; y < state[i].length; y++){
						let diff = Math.abs(j-y);
						dynamap[i][y] += 15 - diff + edgeMod;
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

	function heatseekDefender(game){
		//heuristics for white

		
		//maybe king, defenders should use different maps, defenders try to get to exterior and dont help generally
		let state = game.getBoard();
		let dynamap = JSON.parse(JSON.stringify(TABLUT_DEF_HMAP));

		console.log(JSON.stringify(dynamap));
		for(let i=0; i < state.length; i++){
			for(let j=0; j < state[0].length; j++){
				if(state[i][j] === B){
					//capture heuristics

					//these may be identical
					if(state[i-1] !== undefined && state[i-1][j] === W){
						if(dynamap[i+1]){dynamap[i+1][j] += 15;}	//can capture from above
						if(dynamap[i-2]){ dynamap[i-2][j] +=  3;}	//can reinforce ally from below
					}else if(state[i-1] !== undefined){
						dynamap[i-1][j] += 2;	//can attack
					}

					if(state[i+1] !== undefined && state[i+1][j] === W){
						dynamap[i-1][j] += 15;
						if(dynamap[i+2]){ dynamap[i+2][j] += 3;}
					}else if(state[i+1] !== undefined){
						dynamap[i+1][j] += 2;	//can attack
					}

					if(state[i][j-1] === W){
						dynamap[i][j+1] += 15;
						dynamap[i][j-2] += 3;
					}else{
						dynamap[i][j-1] += 2;
					}

					if(state[i][j+1] === W){
						dynamap[i][j-1] += 15;
						dynamap[i][j+2] += 3;
					}else{
						dynamap[i][j+1] += 2;
					}

					//TODO determine attacks and avoid if self endangering
				}
				else if(state[i][j] === K){
					//defensive moves, need to keep king from doing these
					//avoid blocking king edge access

					//add +2 to all moves to encourage king movement over captures
					//go in all 4 directions and add points

					//if edge access highly encourage so long as its safe, discourage moving next to attackers

					//discourage moves that border attackers

					//encourage edge access
					let edgeAccess = findEdgeAccess(state, i, j);
					if(edgeAccess.left){
						dynamap[0][j] += 50;
					}
					if(edgeAccess.right){
						dynamap[state.length-1][0] += 50;
					}
					if(edgeAccess.up){
						dynamap[i][0] += 50;
					}
					if(edgeAccess.down){
						dynamap[i][state[i].length-1] += 50;
					}
					/*for(let x=i-1; x >= 0 && edgeAccess.left; x--){
						
					}
					for(let x=i+1; x < state.length && edgeAccess.right; x++){

			
					}
					for(let y=j-1; y >=0 && edgeAccess.up; y--){
						
					}
					for(let y=j+1; y < state[i].length && edgeAccess.down; y++){

					}*/ 
				}
				//escape heuristics?

				//edge access is huge
			}
		}

		let moves = game.getMoves(TYPE);
		let bestMoves = [];
		bestMoves.push(moves[0]);
		let bestScore = dynamap[moves[0].ex][moves[0].ey];
		for(let i=0; i < moves.length; i++){
			let move = moves[i];
			let kingMod = state[move.sx][move.ey] === K ? 5 : 0; //encourage king movement
			let score = dynamap[move.ex][move.ey] + kingMod;
			if( score > bestScore){
				bestScore = score;
				bestMoves = [];
				bestMoves.push(move);
			}else if(score === bestScore){
				bestMoves.push(move);
			} 
		}

		console.log(JSON.stringify(dynamap));

		//randomly select move from list of tied best moves
		return bestMoves[getRandomInt(0, bestMoves.length)];
	}

	//returns an object with true false values for each direction:
	//{ up: <boolean>, down: <boolean>, left: <boolean>, right: <boolean>}
	function findEdgeAccess(state, kingX, kingY){
		let retVal = {
			up : true,   // [0-j)
			down : true, // (j-length)
			left : true, // [0-i)
			right : true // (i-length)
		};
		let i = kingX;
		let j = kingY;

		for(let x=i-1; x >= 0; x--){//left
			if(state[x][j] !== E){
				retVal.left = false;
				break;	
			}
		}
		for(let x=i+1; x < state.length; x++){//right
			if(state[x][j] !== E){
				retVal.right = false;
				break;
			}
		}
		for(let y=j-1; y >= 0; y--){//up
			if(state[i][y] !== E){
				retVal.up = false;
				break;
			}
		}
		for(let y=j+1; y < state[i].length; y++){
			if(state[i][y] !== E){
				retVal.down = false;
				break;
			}
		}

		return retVal;
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

//TODO defender map or just use king map, defenders wont see win moves. give king a bonus to encourage movement

TABLUT_ATTACKER_HMAP = 
[[0,0,1,0,0,0,1,0,0],
 [0,5,0,0,0,0,0,5,0],
 [1,0,0,0,0,0,0,0,1],
 [0,0,0,0,0,0,0,0,0],
 [0,0,0,0,0,0,0,0,0],
 [0,0,0,0,0,0,0,0,0],
 [1,0,0,0,0,0,0,0,1],
 [0,5,0,0,0,0,0,5,0],
 [0,0,1,0,0,0,1,0,0]];

TABLUT_KING_HMAP = 
[[100,1,10,10,10,10,10,1,100],
 [1,10,0,0,0,0,0,10,1],
 [10,0,0,0,0,0,0,0,10],
 [10,0,0,0,0,0,0,0,10],
 [10,0,0,0,0,0,0,0,10],
 [10,0,0,0,0,0,0,0,10],
 [10,0,0,0,0,0,0,0,10],
 [1,10,0,0,0,0,0,10,1],
 [100,1,10,10,10,10,10,1,100]];

TABLUT_DEF_HMAP = 
[[100,0,1,0,0,0,1,0,100],
 [0,5,0,0,0,0,0,5,0],
 [1,0,0,0,0,0,0,0,1],
 [0,0,0,0,0,0,0,0,0],
 [0,0,0,0,0,0,0,0,0],
 [0,0,0,0,0,0,0,0,0],
 [1,0,0,0,0,0,0,0,1],
 [0,5,0,0,0,0,0,5,0],
 [100,0,1,0,0,0,1,0,100]];
