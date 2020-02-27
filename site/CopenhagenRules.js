function CopenhagenRules(size){

	const E = 0x00;//empty
	const W = 0x01;//white (defenders)
	const B = 0x02;//black (attackers)
	const K = 0x04;//white king


	//flags
	const SELECTED = 8;
	const VALID_MOVE = 16;
	const LAST_MOVE = 32;
	const FLAG_MASK = SELECTED | VALID_MOVE | LAST_MOVE;

	const BLACK_MASK = B;
	const WHITE_MASK = W | K;
	const PIECE_MASK = BLACK_MASK | WHITE_MASK;
	
	this.getMoves = function(taflBoard, player){
		if(player != W && player != B){
			throw "Parameter 'player' must be one of 1 (defenders) or 2 (attackers)";
		}

		let mask = player === W ? WHITE_MASK : BLACK_MASK;
		let newMoves = [];
		let state = taflBoard.getBoard();
		for(var i=0; i < state.length; i++){
			for(var j=0; j < state[i].length; j++){
				if( (state[i][j] & mask) > 0){
					newMoves = newMoves.concat(this.getMovesForPieceAtPosition(taflBoard.getBoard(), i,j));
				}
			}
		}
		return newMoves;
	};

	this.checkCaptures = function(state, move){

	};

	this.isGameOver = function(state, move){

	};

	this.getMovesForPieceAtPosition = function(state, i, j){
		var isKing = state[i][j] & K > 0;
		
		//king can return to his hall unlike Cleveland rules

		//shieldwall capture is a thing

		//edge fort is a defender win
	
		//king must be captured on all four sides or 3 if adjacent to kings hall

		let limitFunc = function(x,y){
			//king may reenter the kings hall, others cannot enter special cells
			return ( isK && isKingsHall(x,y) ) || !isSpecialCell(x,y) 
		};

		player = isK ? W : state[i][j] & PIECE_MASK;

		let pieceMoves = [];
		for(let k=i+1; k < state.length; k++){

			if((state[k][j] & PIECE_MASK) === 0 && limitFunc(k,j)){
				pieceMoves.push(new Move(i,j,k,j,player));
			}
			else if((state[k][j] & PIECE_MASK) === 0 && isKingsHall(k,j)){
				continue; //may pass over if it was empty
			}
			else{
				break; //impeded by another piece
			}
		}
		for(let k=i-1; k >=0; k--){

			if((state[k][j] & PIECE_MASK) === 0 && limitFunc(k,j)){
				pieceMoves.push(new Move(i,j,k,j,player));
			}
			else if((state[k][j] & PIECE_MASK) === 0 && isKingsHall(k,j)){
				continue; //may pass over if it was empty
			}
			else{
				break; //impeded by another piece
			}
		}
		for(let k=j+1; k < state.length; k++){

			if((state[i][k] & PIECE_MASK) === 0 && limitFunc(i,k)){
				pieceMoves.push(new Move(i,j,i,k,player));
			}
			else if((state[i][k] & PIECE_MASK) === 0 && isKingsHall(i,k)){
				continue; //may pass over if it was empty
			}
			else{
				break; //impeded by another piece
			}
		}
		for(let k=j-1; k >=0; k--){

			if((state[i][k] & PIECE_MASK) === 0 && limitFunc(i,k)){
				pieceMoves.push(new Move(i,j,i,k,player));
			}
			else if((state[i][k] & PIECE_MASK) === 0 && isKingsHall(i,k)){
				continue; //may pass over if it was empty
			}
			else{
				break; //impeded by another piece
			}
		}  
		return pieceMoves;
	}

	function isKing(state, i,j){
		return (state[i][j] & K) > 0;
	}

	function isCorner(i, j){
		return i === 0 && j === 0 
		|| i === size-1 && j === 0
		|| i === size-1 && j === size-1
		|| i === 0 && j === size-1;
	}

	function isKingsHall(i, j){
		return i === Math.floor(size/2) && j === Math.floor(size/2);
	}

	function isSpecialCell(x, y){
		return isKingsHall(x, y) || isCorner(x, y);
	}

	
}
