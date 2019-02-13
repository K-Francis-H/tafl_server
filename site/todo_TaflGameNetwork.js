function TaflGameNetwork(canvas, /*playerColor,*/  /*, opponentType*/ gameId, playerId, uiUpdateCallback){
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
	var board;// = new TaflBoard(variant);

	var width = canvas.width;
	var height = canvas.height;
	var size;// = variant.length;

	//renderer.draw(board);

	var selectedPiece = null;
	var gameInfo = {
		playerId : playerId,
		gameId : gameId
		//move : <retrieved in getStatus()>
		//token : <ditto> //token for moving
		//color : <ditto>
	};
	//playerColor = playerColor || B;

	console.log("pid: "+playerId);

	

	//setup polling... TODO works but last move only works for white????
	let loop = setInterval(function(){
		getStatus(gameId, playerId, function(status){
			if(status.token){
				gameInfo.moveToken = status.token;
			}
			gameInfo.move = status.move;
			gameInfo.color = status.color;

			console.log(status);
			board = new TaflBoard(status.state, status.move === "black" ? B : W);
			size = status.state.length;
			renderer.draw(board, selectedPiece);

			//console.log("is ui updater: "+uiUpdateCallback);
			if(uiUpdateCallback){
				uiUpdateCallback({
					variant : status.variant,
					playerColor : status.color,
					moveColor : status.move
					//TODO isGameOver
					//winColor
					//stalemate
				});
			}
		});
	}, 1000);

	//local game handler
	//TODO add indicators for the current player, win state
	canvas.onclick = function(event){
		console.log(board.getCurrentPlayer());
		console.log(gameInfo.move);
		console.log(gameInfo);
		console.log((gameInfo.color != gameInfo.move));
		console.log(!gameInfo.moveToken);
		if(gameInfo.color != gameInfo.move || !gameInfo.moveToken){
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

		if(selectedPiece && tileX === selectedPiece.x && tileY === selectedPiece.y){//if reselecting selected piece
			selectedPiece = null; //unselect
		}else if( board.getCurrentPlayer() === pieceColor){ //if selecting a piece of the current player (you)
			selectedPiece = {x : tileX, y: tileY}; //select it
		}else if(selectedPiece && (state[tileX][tileY] & VALID_MOVE) > 0){ //if selecting an empty space after selecting a piece
			//make that move
			board.makeMove({
				sx : selectedPiece.x,
				sy : selectedPiece.y,
				ex : tileX,
				ey : tileY,
				player : board.getCurrentPlayer()
			});
			selectedPiece = null;

			//TODO add logic here for setting the move on the server
			setMove(gameInfo.gameId, gameInfo.playerId, gameInfo.moveToken, board.getLastMove(), setMoveCallback);

		}else{//your selecting an empty space that you cannot move to
			selectedPiece = null; //deselect your piece
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

	//used to talk to server for game status, opponents moves
	function getStatus(gameId, playerId, callback){
		var ajax = new XMLHttpRequest();
		ajax.open("GET", "/game/"+gameId+"/"+playerId, true);
		ajax.onreadystatechange = function(){
			if(ajax.readyState === 4 && ajax.status === 200){
				callback(JSON.parse(ajax.responseText));
			}
		};
		ajax.send();
	}

	//tells the server the moves we make
	//change the server to make a move stack and generate current state
	function setMove(gameId, playerId, token, move, callback){
		console.log("pid2 : "+playerId);
		var ajax = new XMLHttpRequest();
		ajax.open("POST", "/move/"+gameId+"/"+playerId, true);
		ajax.setRequestHeader("Content-type", "application/json");
		ajax.onreadystatechange = function(){
			if(ajax.readyState === 4){
				if(ajax.status === 200){
					callback(true);
					gameInfo.moveToken = null; //destroy our token cause its now invalid
				}else{
					callback(false);
				}
			}
		};
		ajax.send(JSON.stringify({
			token : token,
			move : move
		}));
	}

	function setMoveCallback(isValid){
		if(isValid){
			//make move locally?
		}else{
			//complain
		}
	}
}
/*
TaflGame.AI = "AI";
TaflGame.Network = "Network";
TaflGame.Local = "Local";
*/
