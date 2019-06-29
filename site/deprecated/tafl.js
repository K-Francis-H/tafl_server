document.addEventListener("DOMContentLoaded", function(){

	var canvas = document.getElementById("canvas");
	var taflBoard;

	var params = document.URL.split("?")[1];
	if(params){
		var pairs = params.split("&");
		var gameInfo = {};
		for(var i=0; i < pairs.length; i++){
			var kvPair = pairs[i].split("=");
			var key = kvPair[0];
			var value = kvPair[1];
			gameInfo[key] = value;
		}
		if(!gameInfo || !gameInfo.gameId || !gameInfo.playerId){
			//TODO exit loudly
			console.log("bad data: "+gameInfo);
		}
		//otherwise getstatus and begin
		//also make shareable link

		getStatus(gameInfo.gameId, gameInfo.playerId, function(state){

			if(state.token){
				gameInfo.token = state.token;
			}
			gameInfo.move = state.move;
			gameInfo.color = state.color;

			taflBoard = new TaflBoard(canvas, state.state, gameInfo);
			taflBoard.draw();
			taflBoard.loop();
			//create and display join link 
			if(gameInfo.j != 1){//they were shared, dont show a link
				var shareLink = document.getElementById("shareable-join-link");
				shareLink.style.display="block";
				shareLink.value = window.location.host+"/join/"+gameInfo.gameId;
				var label = document.getElementById("share-label");
				label.style.display="block";
				var copyButton = document.getElementById("copy-button");
				copyButton.style.display="block";
				copyButton.onclick = function(){
					shareLink.select();
					document.execCommand("copy");
				}
			}

			//set page title
			document.getElementById("variant").textContent = upperFirstLetter(state.variant); 
		});
	}else{
		//TODO exit loudly
		console.log("no data");
	}

	
});

const W = 0x01;//white
const B = 0x02;//black
const K = 0x04;//white king


//flags
const SELECTED = 8;
const VALID_MOVE = 16;
const LAST_MOVE = 32;
const FLAG_MASK = SELECTED | VALID_MOVE | LAST_MOVE;

const BLACK_MASK = B;
const WHITE_MASK = W | K;
const PIECE_MASK = BLACK_MASK | WHITE_MASK;

//useful albeit clearly biased, and sometimes bullshitting src:
//https://boardgamegeek.com/thread/348662/approach-tafling-nirvana

//source https://en.wikipedia.org/wiki/Tafl_games
//attacker 1st
const BRANDUBH = 
[[0,0,0,B,0,0,0],
 [0,0,0,B,0,0,0],
 [0,0,0,W,0,0,0],
 [B,B,W,K,W,B,B],
 [0,0,0,W,0,0,0],
 [0,0,0,B,0,0,0],
 [0,0,0,B,0,0,0]];

//source https://www.boardgamegeek.com/article/2700987
//TODO mentions special rule, attackers and defenders cannot passover king's hall
//attacker 1st
const GWDDBWYLL =
[[0,0,B,0,B,0,0],
 [0,0,0,0,0,0,0],
 [B,0,0,W,0,0,B],
 [0,0,W,K,W,0,0],
 [B,0,0,W,0,0,B],
 [0,0,0,0,0,0,0],
 [0,0,B,0,B,0,0]];

//sources: https://www.boardgamegeek.com/article/2701290#2701290
//https://en.wikipedia.org/wiki/Fidchell
//TODO mentions special rule, attackers and defenders cannot passover king's hall
//win by getting king to edge, not corner
//attacker 1st
const FIDCHELL =
[[B,0,B,B,B,0,B],
 [0,0,0,W,0,0,0],
 [B,0,0,W,0,0,B],
 [B,W,W,K,W,W,B],
 [B,0,0,W,0,0,B],
 [0,0,0,W,0,0,0],
 [B,0,B,B,B,0,B]];

//source https://en.wikipedia.org/wiki/Tafl_games
//https://www.boardgamegeek.com/thread/346545/how-tafl-and-why-youd-want
//2nd source claims well known rules, each piece moves one space
//defender makes 1st move
const ARD_RI = 
[[0,0,B,B,B,0,0],
 [0,0,0,B,0,0,0],
 [B,0,W,W,W,0,B],
 [B,B,W,K,W,B,B],
 [B,0,W,W,W,0,B],
 [0,0,0,B,0,0,0],
 [0,0,B,B,B,0,0]];

//source https://en.wikipedia.org/wiki/Tafl_games
const TABLUT = 
[[0,0,0,B,B,B,0,0,0],
 [0,0,0,0,B,0,0,0,0],
 [0,0,0,0,W,0,0,0,0],
 [B,0,0,0,W,0,0,0,B],
 [B,B,W,W,K,W,W,B,B],
 [B,0,0,0,W,0,0,0,B],
 [0,0,0,0,W,0,0,0,0],
 [0,0,0,0,B,0,0,0,0],
 [0,0,0,B,B,B,0,0,0]];

//source https://en.wikipedia.org/wiki/Tafl_games
const TAWLBWRDD = 
[[0,0,0,0,B,B,B,0,0,0,0],
 [0,0,0,0,B,0,B,0,0,0,0],
 [0,0,0,0,0,B,0,0,0,0,0],
 [0,0,0,0,0,W,0,0,0,0,0],
 [B,B,0,0,W,W,W,0,0,B,B],
 [B,0,B,W,W,K,W,W,B,0,B],
 [B,B,0,0,W,W,W,0,0,B,B],
 [0,0,0,0,0,W,0,0,0,0,0],
 [0,0,0,0,0,B,0,0,0,0,0],
 [0,0,0,0,B,0,B,0,0,0,0],
 [0,0,0,0,B,B,B,0,0,0,0]];

//source https://en.wikipedia.org/wiki/Tafl_games
const HNEFATAFL = 
[[0,0,0,B,B,B,B,B,0,0,0],
 [0,0,0,0,0,B,0,0,0,0,0],
 [0,0,0,0,0,0,0,0,0,0,0],
 [B,0,0,0,0,W,0,0,0,0,B],
 [B,0,0,0,W,W,W,0,0,0,B],
 [B,B,0,W,W,K,W,W,0,B,B],
 [B,0,0,0,W,W,W,0,0,0,B],
 [B,0,0,0,0,W,0,0,0,0,B],
 [0,0,0,0,0,0,0,0,0,0,0],
 [0,0,0,0,0,B,0,0,0,0,0],
 [0,0,0,B,B,B,B,B,0,0,0]];

const LARGE_HNEFATAFL = 
[[0,0,0,0,B,B,B,B,B,0,0,0,0],
 [0,0,0,0,0,0,B,0,0,0,0,0,0],
 [0,0,0,0,0,0,0,0,0,0,0,0,0],
 [0,0,0,0,0,0,W,0,0,0,0,0,0],
 [B,0,0,0,0,0,W,0,0,0,0,0,B],
 [B,0,0,0,0,0,W,0,0,0,0,0,B],
 [B,B,0,W,W,W,K,W,W,W,0,B,B],
 [B,0,0,0,0,0,W,0,0,0,0,0,B],
 [B,0,0,0,0,0,W,0,0,0,0,0,B],
 [0,0,0,0,0,0,W,0,0,0,0,0,0],
 [0,0,0,0,0,0,0,0,0,0,0,0,0],
 [0,0,0,0,0,0,B,0,0,0,0,0,0],
 [0,0,0,0,B,B,B,B,B,0,0,0,0]];

//source https://en.wikipedia.org/wiki/Tafl_games
const ALEA_EVANGELII = 
[[0,0,B,0,0,B,0,0,0,0,0,0,0,B,0,0,B,0,0],
 [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
 [B,0,0,0,0,B,0,0,0,0,0,0,0,B,0,0,0,0,B],
 [0,0,0,0,0,0,0,B,0,B,0,B,0,0,0,0,0,0,0],
 [0,0,0,0,0,0,B,0,W,0,W,0,B,0,0,0,0,0,0],
 [B,0,B,0,0,B,0,0,0,0,0,0,0,B,0,0,B,0,B],
 [0,0,0,0,B,0,0,0,0,W,0,0,0,0,B,0,0,0,0],
 [0,0,0,B,0,0,0,0,W,0,W,0,0,0,0,B,0,0,0],
 [0,0,0,0,W,0,0,W,0,W,0,W,0,0,W,0,0,0,0],
 [0,0,0,B,0,0,W,0,W,K,W,0,W,0,0,B,0,0,0],
 [0,0,0,0,W,0,0,W,0,W,0,W,0,0,W,0,0,0,0],
 [0,0,0,B,0,0,0,0,W,0,W,0,0,0,0,B,0,0,0],
 [0,0,0,0,B,0,0,0,0,W,0,0,0,0,B,0,0,0,0],
 [B,0,B,0,0,B,0,0,0,0,0,0,0,B,0,0,B,0,B],
 [0,0,0,0,0,0,B,0,W,0,W,0,B,0,0,0,0,0,0],
 [0,0,0,0,0,0,0,B,0,B,0,B,0,0,0,0,0,0,0],
 [B,0,0,0,0,B,0,0,0,0,0,0,0,B,0,0,0,0,B],
 [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
 [0,0,B,0,0,B,0,0,0,0,0,0,0,B,0,0,B,0,0]];

function TaflBoard(canvas, variant, gameInfo){
	console.log(gameInfo);
	var self = this;

	const DARK = "#B58863";//"#000";
	const LIGHT = "#F0D9B5";//"#FFF";
	const YELLOW = "#DAA520";//for kings hall and exits
	const BLACK = "#000";
	const WHITE = "#FFF";

	const SELECTED_DARK = "#646d40";
	const SELECTED_LIGHT = "#819669";
	const AVAILABLE_MOVE_LIGHT = "#adb187";
	const AVAILABLE_MOVE_DARK = "#84794e";
	const LAST_MOVE_DARK = "#aba23a";
	const LAST_MOVE_LIGHT = "#ced26b";

	const size = variant[0].length;

	var ctx = canvas.getContext("2d");
	var width = canvas.width;
	var height = canvas.height;
	var state = JSON.parse(JSON.stringify(variant)); //deep copy, so that game resets properly
	var states = [];
	states.push(state);

	//get game init info
	var playerColor = gameInfo.color;
	var moveColor = gameInfo.move;
	var moveToken;
	if(playerColor === moveColor){
		moveToken = gameInfo.token;
	}
	setMoveInfo(playerColor, moveColor);

	this.draw = function(){
		clear();
		var tileSizeX = width/size;
		var tileSizeY = height/size;
		var lastStyle = DARK; //init to white so that it starts on black
		
		for(var i=0; i < size; i++){
			for(var j=0; j < size; j++){
				
				if(isKingsHall(i,j) || isCorner(i,j)){
					ctx.fillStyle = YELLOW;
				}
				else if( (state[i][j] & SELECTED) > 0){
					ctx.fillStyle = lastStyle === BLACK ? SELECTED_DARK : SELECTED_LIGHT;
				}
				else if( (state[i][j] & LAST_MOVE) > 0){
					ctx.fillStyle = lastStyle === BLACK ? LAST_MOVE_DARK : LAST_MOVE_LIGHT;
				}
				else{
					ctx.fillStyle = lastStyle;
				}
				ctx.fillRect(i*tileSizeX, j*tileSizeY, tileSizeX, tileSizeY);

				if( (state[i][j] & VALID_MOVE) > 0){
					console.log(state[i][j]);
					var style = lastStyle === BLACK ? AVAILABLE_MOVE_DARK : AVAILABLE_MOVE_LIGHT;
					drawAvailableMove(i*tileSizeX, j*tileSizeY, tileSizeX, tileSizeY, style);
				}
				lastStyle = getFillStyle(lastStyle);
			}
		}
		drawPieces(state);
	};

	this.undo = function(){
		//TODO have to actually get other players permission for this feature...
		if(states.length > 1){
			state = states.pop();
			self.draw();
		}
	};

	this.loop = function(){
		if(playerColor !== moveColor){
			setTimeout(function(){
				getStatus(gameInfo.gameId, gameInfo.playerId, handleStatus);
			}, 1500);
		}
	};

	function handleStatus(newState){
		var isSame = isStateEqual(state, newState.state);
		if(isSame === true){
			console.log("looping...");
			self.loop();
		}else if(isSame){//is an object, but different
			//set state
			//states.push(JSON.parse(JSON.stringify(newState.state)));
			state = newState.state;
			//TODO apply connotations
			
			//change move color over
			moveToken = newState.token;
			moveColor = moveColor === "white" ? "black" : "white";

			var winner = isWinState();
			if(!winner){//still contested
				setMoveInfo(playerColor, moveColor);

				//redraw
				self.draw();
				self.loop();
			}
			else{
				self.draw();
				setGameOver(winner);
			}
		}else{
			//TODO very not same...
			console.log("really bad...");
		}
	}

	function isStateEqual(a, b){
		var diffStates = [];

		if(a.length !== b.length){
			return false;
		}
		for(var i=0; i < a.length; i++){
			if(a[i].length !== b[0].length){
				return false;
			}
			for(var j=0; j < a[0].length; j++){
				if(a[i][j] !== b[i][j]){
					diffStates.push({
						x : i,
						y : j,
						a : a[i][j],
						b : b[i][j]
					});
				}
			}
		}
		if(diffStates.length === 0){
			return true;
		}else{
			return diffStates;
		}
	}

	function drawAvailableMove(x, y, width, height, style){
		var cx = x + width*0.5;
		var cy = y + height*0.5;
		var radius = width*0.1;
		ctx.fillStyle = style;
		ctx.beginPath();
		ctx.arc(cx, cy, radius, 0, Math.PI*2);
		ctx.fill();
	}

	function drawPieces(state){
		var tileSizeX = width/size;
		var tileSizeY = height/size;

		for(var i=0; i < size; i++){
			for(var j=0; j < size; j++){
				if( (state[i][j] & PIECE_MASK) === B){
					drawPawn(i*tileSizeX, j*tileSizeY, tileSizeX, tileSizeY, BLACK);
				}
				else if( (state[i][j] & PIECE_MASK) === W){
					drawPawn(i*tileSizeX, j*tileSizeY, tileSizeX, tileSizeY, WHITE);
				}
				else if( (state[i][j] & PIECE_MASK) === K){
					drawKing(i*tileSizeX, j*tileSizeY, tileSizeX, tileSizeY);
				}
				else{
					//console.log("i: "+i+" j: "+j);
				}
			}
		}
	}

	function drawPawn(x, y, width, height, style){
		var cx = x + width*0.5;
		var cy = y + height*0.5;
		var radius = width*0.5 - width*0.2;
		ctx.fillStyle = style;
		ctx.beginPath();
		ctx.arc(cx, cy, radius, 0, Math.PI*2);
		ctx.fill();
	}

	function drawKing(x, y, width, height){
		drawPawn(x, y, width, height, WHITE);

		var cx = x + width*0.5;
		var cy = y + height*0.5;

		ctx.fillStyle = BLACK;
		ctx.lineWidth = 5;
		//ctx.fillRect(cx, y+height*0.3, cx, height*0.7);//vert
		//ctx.fillRect(x+width*0.3, cy, x+width*0.7, cy);//horz

		ctx.beginPath();
		//vert line
		ctx.moveTo(cx, y+height*0.3);
		ctx.lineTo(cx, y+height*0.7);
		//horz line
		ctx.moveTo(x+width*0.3, cy);
		ctx.lineTo(x+width*0.7, cy);
		ctx.stroke();
		
		
	}

	function clear(){
		ctx.fillStyle = "#FFF";
		ctx.fillRect(0,0,width, height);
	}

	function isWinState(){
		//checking that king is in corner or simply not on the board
		var foundKing = false;
		for(var i=0; i < size; i++){
			for(var j=0; j < size; j++){
				if(!foundKing){
					foundKing = (state[i][j] & K) > 0;
				}
				if( (state[i][j] & K) > 0 && isCorner(i, j)){
					return "white";
				}
			}
		}
		if(foundKing){
			return false; //still in game
		}else{
			return "black";
		}
	}

	function isCorner(i, j){
		return i === 0 && j === 0 
		|| i === size-1 && j === 0
		|| i === size-1 && j === size-1
		|| i === 0 && j === size-1
	}

	function isKingsHall(i, j){
		return i === Math.floor(size/2) && j === Math.floor(size/2);
	}

	function isSpecialCell(x, y){
		return isKingsHall(x, y) || isCorner(x, y);
	}

	function getFillStyle(lastStyle){
		return lastStyle === DARK ? LIGHT : DARK;
	}

	function clearBoardAnnotations(state, saveLastMove){
		for(var i=0; i < size; i++){
			for(var j=0; j < size; j++){
				if( (state[i][j] & FLAG_MASK) > 0){
					if(saveLastMove){
						state[i][j] &= (!FLAG_MASK | PIECE_MASK | LAST_MOVE);
					}else{
						state[i][j] &= (!FLAG_MASK | PIECE_MASK);
					}
				}
			}
		}
	}

	function checkCaptures(position){
		console.log(position);
		//figure out position color
		var color;
		if( (state[position.x][position.y] & PIECE_MASK) === B){
			color = B;
		}
		else if( (state[position.x][position.y] & PIECE_MASK) === W || (state[position.x][position.y] & PIECE_MASK) === K){
			color = W | K;
		}
		else{

			return;//not a valid position to check captures
		}
		/*console.log("c: "+color);
		console.log(state[position.x][position.y]);
		console.log(state);
		console.log(position.x-2);
		console.log(state[position.x-2][position.y]);
		console.log((state[position.x-2][position.y] & color));
		console.log((state[position.x-1][position.y] & color));*/

		//now check adjacenct capture zones
		if(position.x+2 < size && ( (state[position.x+2][position.y] & color) > 0 || isSpecialCell(position.x+2, position.y)) && (state[position.x+1][position.y] & color) === 0){
			console.log("x+")
			state[position.x+1][position.y] = 0;
		}
		if(position.x-2 >= 0 && ( (state[position.x-2][position.y] & color) > 0 || isSpecialCell(position.x-2, position.y)) && (state[position.x-1][position.y] & color) === 0){
			console.log("x-");
			state[position.x-1][position.y] = 0;
		}
		if(position.y+2 < size && ( (state[position.x][position.y+2] & color) > 0 || isSpecialCell(position.x, position.y+2)) && (state[position.x][position.y+1] & color) === 0){
			console.log("y+")
			state[position.x][position.y+1] = 0;
		}
		if(position.y-2 >=  0 && ( (state[position.x][position.y-2] & color) > 0 || isSpecialCell(position.x, position.y-2)) && (state[position.x][position.y-1] & color) === 0){
			console.log("y-");
			state[position.x][position.y-1] = 0;
		}

		//TODO above is done, enforce king in hall rule?

		//TODO check win condition
		
	}

	var pieceSelected = false;
	var selectedTile;
	//TODO cleanup
	canvas.onclick = function(event){//update state

		if(playerColor !== moveColor || !moveToken){
			return; //not our turn
		}

		//TODO determine whos move
		var x = event.pageX - offset(canvas).left;
		var y = event.pageY - offset(canvas).top;

		var tileX = Math.floor(x / Math.floor(width/size));
		var tileY = Math.floor(y / Math.floor(height/size));

		//console.log("x: "+tileX);
		//console.log("y: "+tileY);



		if(!pieceSelected && (state[tileX][tileY] & PIECE_MASK) > 0 && isOurPiece(state[tileX][tileY]) ){
			pieceSelected = true;
			selectedTile = {x: tileX, y: tileY};
			state[tileX][tileY] |= SELECTED;
			setAvailableMoves(state, {x: tileX, y: tileY});	
		}
		else if(pieceSelected && selectedTile.x === tileX && selectedTile.y === tileY){
			//unselect
			clearBoardAnnotations(state, true);
			pieceSelected = false;
		}
		else if( (state[tileX][tileY] & PIECE_MASK) > 0 && isOurPiece(state[tileX][tileY]) ){//change selected piece
			clearBoardAnnotations(state, true);
			
			//change selected piece
			//clear annotations
			selectedTile = {x: tileX, y: tileY};
			state[tileX][tileY] |= SELECTED;
			setAvailableMoves(state, {x: tileX, y: tileY});
		}
		else if( (state[tileX][tileY] & VALID_MOVE) > 0){
			//perform move
			//reset board state
			
			//add last state to undo stack
			var lastState = JSON.parse(JSON.stringify(state));
			clearBoardAnnotations(lastState, true);

			
			//update current state
			state[tileX][tileY] = state[selectedTile.x][selectedTile.y];
			state[selectedTile.x][selectedTile.y] =  0;
			clearBoardAnnotations(state);
			setLastMove(state, selectedTile, {x:tileX,y:tileY});
			checkCaptures({x: tileX, y: tileY});
			

			setMove(gameInfo.gameId, gameInfo.playerId, moveToken, state, function(isValid){
				if(isValid){//set move
					states.push(lastState);
					
					pieceSelected = false;
					

					//destroy moveToken
					moveToken = false;
					moveColor = moveColor === "white" ? "black" : "white";

					var winner = isWinState();
					if(!winner){//still contested
						setMoveInfo(playerColor, moveColor);

						//redraw
						self.draw();
						self.loop();
					}
					else{
						setGameOver(winner);
					}
				}else{
					//complain that move is invalid
					//and revert
					state = lastState;
				}
			});

			
		}
		//TODO show last move

		self.draw();
		//drawPieces(state);
	};

	function offset(el){
		if(!el) el = this;
		
		var x = el.offsetLeft;
		var y = el.offsetTop;
		
		while(el = el.offsetParent){
			x += el.offsetLeft;
			y += el.offsetTop;
		}
		return { left: x, top : y};
	}

	function setAvailableMoves(state, position){
		var x = position.x;
		var y = position.y;

		//set logic for king special moves
		var isKing = (state[x][y] & K) > 0;
		var limitFunc = function(x, y){
			return isKing || !isSpecialCell(x, y);
		}

		//vert down
		for(var i = x+1; i < size; i++){
			if( (state[i][y] & PIECE_MASK) === 0 && limitFunc(i, y)){
					state[i][y] |= VALID_MOVE;
			}
			else if( (state[i][y] & PIECE_MASK) === 0 && isKingsHall(i,y)){
				continue; //allows crossing over the kings hall
			}
			else{
				break;
			}
		}
		//vert up
		for(var i=x-1; i >= 0; i--){
			if( (state[i][y] & PIECE_MASK) === 0 && limitFunc(i, y)){
				state[i][y] |= VALID_MOVE;
			}
			else if( (state[i][y] & PIECE_MASK) === 0 && isKingsHall(i,y)){
				continue;
			}
			else{
				break;
			}
		}
		//horz right
		for(var j=y+1; j < size; j++){
			if( (state[x][j] & PIECE_MASK) === 0 && limitFunc(x, j)){
				state[x][j] |= VALID_MOVE;
			}
			else if( (state[x][j] & PIECE_MASK) === 0 && isKingsHall(x,j)){
				continue;
			}
			else{
				break;
			}
		}
		for(var j=y-1; j >= 0; j--){
			if( (state[x][j] & PIECE_MASK) === 0 && limitFunc(x, j)){
				state[x][j] |= VALID_MOVE;
			}
			else if( (state[x][j] & PIECE_MASK) === 0 && isKingsHall(x,j)){
				continue;
			}
			else{
				break;
			}
		} 
	}

	function setLastMove(state, start, end){
		state[start.x][start.y] |= LAST_MOVE;
		state[end.x][end.y] |= LAST_MOVE;
	}

	function isOurPiece(tile){
		if(playerColor === "white"){
			return (tile & WHITE_MASK) > 0;
		}else{
			return (tile & BLACK_MASK) > 0;
		}
	}
}

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

function setMove(gameId, playerId, token, state, callback){
	var ajax = new XMLHttpRequest();
	ajax.open("POST", "/move/"+gameId+"/"+playerId, true);
	ajax.setRequestHeader("Content-type", "application/json");
	ajax.onreadystatechange = function(){
		if(ajax.readyState === 4){
			if(ajax.status === 200){
				callback(true);
			}else{
				callback(false);
			}
		}
	};
	ajax.send(JSON.stringify({
		token : token,
		state : state
	}));
}

function setMoveInfo(color, move){
	document.getElementById("playing-as").textContent = "Playing as "+upperFirstLetter(color);
	document.getElementById("to-play").textContent = upperFirstLetter(move)+" to Play";
}

function setGameOver(winner){
	document.getElementById("to-play").textContent = upperFirstLetter(winner)+" Wins!";
}

function upperFirstLetter(str){
	var first = str[0].toUpperCase();
	return first + str.substr(1);
}
