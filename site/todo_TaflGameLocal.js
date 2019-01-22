function TaflGameLocal(canvas, /*playerColor,*/ variant /*, opponentType*/){
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
	var board = new TaflBoard(variant);

	var width = canvas.width;
	var height = canvas.height;
	var size = variant.length;

	renderer.draw(board);

	var selectedPiece = null;
	//playerColor = playerColor || B;

	//local game handler
	canvas.onclick = function(event){
		let x = event.pageX - offset(canvas).left;
		let y = event.pageY - offset(canvas).top;

		var tileX = Math.floor(x / Math.floor(width/size));
		var tileY = Math.floor(y / Math.floor(height/size));

		let state = board.getAnnotatedBoard(selectedPiece);

		//if(selectedPiece){//TODO get this info from the baord? reexamine separation of concerns
		//	selectedPiece = null;
		//}

		console.log(state);
		console.log(selectedPiece);
		console.log((state[tileX][tileY] & VALID_MOVE));

		let pieceColor;// = (state[tileX][tileY] & WHITE_MASK) > 0 ? W : B;//TODO need actual ternary logic, this allows B to overlap with E
		console.log("pieceColor: "+pieceColor);
		console.log("currentPlayer: "+board.getCurrentPlayer());
		if( (state[tileX][tileY] & WHITE_MASK) > 0){
			pieceColor = W;
		}else if( (state[tileX][tileY] & BLACK_MASK) > 0){
			pieceColor = B;
		}else{
			pieceColor = E;
		}

		//if( (board.getCurrentPlayer() & (state[tileX][tileY] & PIECE_MASK) ) > 0){
		if( board.getCurrentPlayer() === pieceColor){
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
