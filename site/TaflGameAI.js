function TaflGameAI(canvas, /*playerColor,*/ variant /*, opponentType*/, player, rules){
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

	var renderer = new TaflRenderer(canvas);
	var board = new TaflBoard(variant, null, rules);

	var width = canvas.width;
	var height = canvas.height;
	var size = variant.length;

	renderer.draw(board);

	var selectedPiece = null;
	playerColor = player === "black" ? B : W ;
	aiColor = playerColor === W ? B : W;

	ai = new MinimaxAI(1, aiColor);

	var loop = setInterval(function(){
		console.log("running move check: "+board.getCurrentPlayer()+" "+ aiColor);
		if(board.getCurrentPlayer() === aiColor  && board.isGameOver() === 0){
			board.makeMove(ai.getMove(board));
			renderer.draw(board);
		}
	}, 1000);

	//local game handler
	//TODO add indicators for the current player, win state
	canvas.onclick = function(event){
		if(board.getCurrentPlayer() !== playerColor){
			
			return;
		}

		let winner = board.isGameOver();
		if(winner){
			console.log(winner+" wins");
			return;
		}

		let x = event.pageX - offset(canvas).left;
		let y = event.pageY - offset(canvas).top;

		var tileX = Math.floor(x / Math.floor(width/size));
		var tileY = Math.floor(y / Math.floor(height/size));

		let state = board.getAnnotatedBoard(selectedPiece);

		let pieceColor;

		if( (state[tileX][tileY] & WHITE_MASK) > 0){
			pieceColor = W;
		}else if( (state[tileX][tileY] & BLACK_MASK) > 0){
			pieceColor = B;
		}else{
			pieceColor = E;
		}

		console.log("tx: "+tileX+" ty: "+tileY);
		console.log(selectedPiece);
		console.log(selectedPiece && tileX === selectedPiece.x && tileY === selectedPiece.y);

		if(selectedPiece && tileX === selectedPiece.x && tileY === selectedPiece.y){
			selectedPiece = null;
		}else if( board.getCurrentPlayer() === pieceColor){
			selectedPiece = {x : tileX, y: tileY};
		}else if(selectedPiece && (state[tileX][tileY] & VALID_MOVE) > 0){
			board.makeMove({
				sx : selectedPiece.x,
				sy : selectedPiece.y,
				ex : tileX,
				ey : tileY,
				player : board.getCurrentPlayer()
			});
			selectedPiece = null;
			//TODO logic for determining if the game is over/won
		}else{
			selectedPiece = null;
		}

		
		//otherwise ignore
		renderer.draw(board, selectedPiece);
	}

	function offset(el){
		//if(!el) el = this;
		
		var x = el.offsetLeft;
		var y = el.offsetTop;
		
		while(el = el.offsetParent){
			x += el.offsetLeft;
			y += el.offsetTop;
		}
		return { left: x, top : y};
	}
}
/*
TaflGame.AI = "AI";
TaflGame.Network = "Network";
TaflGame.Local = "Local";
*/
