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
		if(!gameInfo || !gameInfo.playerColor || !gameInfo.variant){
			//TODO exit loudly
			console.log("bad data: "+gameInfo);
		}
		//otherwise getstatus and begin
		//also make shareable link

		console.log("variant: "+gameInfo.variant);
		console.log(getVariantStart(gameInfo.variant));

		taflBoard = new TaflBoard(canvas, getVariantStart(gameInfo.variant), gameInfo);
		taflBoard.draw();
		taflBoard.loop();
		//TODO taflboard is very tied to multiplayer networking, need to divorce local UI control from it

	}else{
		//TODO exit loudly
		console.log("no data");
	}

	
});

function getVariantStart(variant){
		switch(variant){
			case "brandubh": 	return BRANDUBH;
			case "gwddbwyll":	return GWDDBWYLL;
			case "fidchell":	return FIDCHELL;
			case "ard_ri":		return ARD_RI;
			case "tablut":		return TABLUT;
			case "tawlbwrdd":	return TAWLBWRDD;
			case "hnefatafl":	return HNEFATAFL;
			case "large_hnefatafl":	return LARGE_HNEFATAFL;
			case "alea_evangelii":	return ALEA_EVANGELII;
		}
	}

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
/*const BRANDUBH = 
[[0,0,0,B,0,0,0],
 [0,0,0,B,0,0,0],
 [0,0,0,W,0,0,0],
 [B,B,W,K,W,B,B],
 [0,0,0,W,0,0,0],
 [0,0,0,B,0,0,0],
 [0,0,0,B,0,0,0]];*/

const BRANDUBH = 
[[0,0,0,0,0,0,0],
 [0,0,0,0,0,0,0],
 [0,0,0,0,0,0,0],
 [0,0,0,0,0,0,0],
 [0,0,0,0,0,0,0],
 [0,0,0,0,0,0,0],
 [0,0,0,B,0,K,0]];

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

	var playerColor = gameInfo.playerColor;
	var aiColor = playerColor === "white" ? "black" : "white";
	var moveColor = "black";

	//gonna need to update state n order to advance... beyond 1 search depth
	var ai = new AI(aiColor, 1);//TODO play with search depth to find optimal speed/difficulty
	//if greater than 1 we sometimes get extra pieces???? examine move generator, applier functions
	setMoveInfo(playerColor, moveColor); 

	
	//if(playerColor === "white"){
	//	aiMove();
	//}

	this.loop = function(){
		if(playerColor != moveColor){
			aiMove();
		}
	};

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
					//console.log(state[i][j]);
					var style = lastStyle === BLACK ? AVAILABLE_MOVE_DARK : AVAILABLE_MOVE_LIGHT;
					drawAvailableMove(i*tileSizeX, j*tileSizeY, tileSizeX, tileSizeY, style);
				}
				lastStyle = getFillStyle(lastStyle);
			}
		}
		drawPieces(state);
	};

	function aiMove(){//TODO AI not evaluating captures.....
		//TODO below functin may fuck everything up
		//console.log("pre ai state");
		//console.log(state);
		var move = ai.getMove(static_clearBoardAnnotations(state));
		//console.log(move);
		var stateAI = stateFromMove(state, move, aiColor);
		
		states.push(state);
		state = stateAI;
		clearBoardAnnotations(state);
		setLastMoveAI(state, move);
		checkCaptures({x: move.ex, y: move.ey});
		moveColor = moveColor === "white" ? "black" : "white";
		var winner = isWinState();
		if(winner){
			setGameOver(winner);
		}else{
			setMoveInfo(playerColor, moveColor);
			self.draw();
			moveColor = playerColor;
		}
	}

	//TODO need to use actual evaluation functions this just moves a piece, but does not apply its effects (captures, etc)
	function stateFromMove(gameState, move, color){
		color = color === "white" ? W : B;//TODO does not handle kings at all
		//console.log(move);
		//TODO remove pieces if captured
		copyState = JSON.parse(JSON.stringify(gameState));
		copyState[move.sx][move.sy] = 0x00;
		copyState[move.ex][move.ey] = move.isKing ? K : color;
		//console.log(copyState);
		return copyState;
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

	function static_clearBoardAnnotations(cur_state){
		var state = JSON.parse(JSON.stringify(cur_state));
		for(var i=0; i < size; i++){
			for(var j=0; j < size; j++){
				if( (state[i][j] & FLAG_MASK) > 0){
					state[i][j] &= (!FLAG_MASK | PIECE_MASK);
				}
			}
		}
		return state;
	}

	function checkCaptures(position){
		//console.log(position);
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
			//console.log("x+")
			state[position.x+1][position.y] = 0;
		}
		if(position.x-2 >= 0 && ( (state[position.x-2][position.y] & color) > 0 || isSpecialCell(position.x-2, position.y)) && (state[position.x-1][position.y] & color) === 0){
			//console.log("x-");
			state[position.x-1][position.y] = 0;
		}
		if(position.y+2 < size && ( (state[position.x][position.y+2] & color) > 0 || isSpecialCell(position.x, position.y+2)) && (state[position.x][position.y+1] & color) === 0){
			//console.log("y+")
			state[position.x][position.y+1] = 0;
		}
		if(position.y-2 >=  0 && ( (state[position.x][position.y-2] & color) > 0 || isSpecialCell(position.x, position.y-2)) && (state[position.x][position.y-1] & color) === 0){
			//console.log("y-");
			state[position.x][position.y-1] = 0;
		}

		//TODO above is done, enforce king in hall rule?

		//TODO check win condition
		
	}

	var pieceSelected = false;
	var selectedTile;
	//TODO cleanup
	canvas.onclick = function(event){//update state

		if(playerColor !== moveColor ){
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
			

			/*setMove(gameInfo.gameId, gameInfo.playerId, moveToken, state, function(isValid){
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
			});*/
			states.push(lastState);
			pieceSelected = false;
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
			else if(isKingsHall(i,y)){
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
			else if(isKingsHall(i,y)){
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
			else if(isKingsHall(x,j)){
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
			else if(isKingsHall(x,j)){
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

	function setLastMoveAI(state, move){
		state[move.sx][move.sy] |= LAST_MOVE;
		state[move.ex][move.ey] |= LAST_MOVE;
	}

	function isOurPiece(tile){
		if(playerColor === "white"){
			return (tile & WHITE_MASK) > 0;
		}else{
			return (tile & BLACK_MASK) > 0;
		}
	}
}

//HTML control functions
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
