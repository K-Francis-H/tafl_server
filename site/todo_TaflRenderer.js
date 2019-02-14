function TaflRenderer(canvas, humanPlayerColor){
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

	const E = 0x00;//empty
	const W = 0x01;//white (defenders)
	const B = 0x02;//black (attackers)
	const K = 0x04;//white king

	//annotation constants
	const RANK = ["0","1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19"];
	const FILE_A = "abcdefghijklmnopqrs";
	const FILE_R = [//runic files
		"\u16A0", //F
		"\u16A2", //U
		"\u16A6", //TH
		"\u16A8", //A
		"\u16B1", //R
		"\u16B2", //K
		"\u16B7", //G
		"\u16B9", //W
		"\u16BA", //H
		"\u16BE", //N
		"\u16C1", //I (short)
		"\u16C3", //J (Y)
		"\u16C7", //I (long)
		"\u16C8", //P
		"\u16C9", //Z
		"\u16CB", //S
		"\u16CF", //T
		"\u16D2", //B
		"\u16D6", //E
		"\u16D7", //M
		"\u16DA", //L
		"\u16DC", //NG
		"\u16DE", //D
		"\u16DF"];//O


	//flags
	const SELECTED = 8;
	const VALID_MOVE = 16;
	const LAST_MOVE = 32;
	const FLAG_MASK = SELECTED | VALID_MOVE | LAST_MOVE;

	const BLACK_MASK = B;
	const WHITE_MASK = W | K;
	const PIECE_MASK = BLACK_MASK | WHITE_MASK;

	var ctx = canvas.getContext("2d");
	var width = canvas.width;
	var height = canvas.height; 
	

	var self = this;

	this.draw = function(taflBoard, /*nullable*/ selectedPiece){
		clear();
	
		//get last move
		//get annotations if piece is selected
		let state = taflBoard.getAnnotatedBoard(selectedPiece);

		let size = state.length;
		let tileSizeX = width/size;
		let tileSizeY = height/size;

		let lastStyle = DARK;
		for(var i=0; i < state.length; i++){
			for(var j=0; j < state[i].length; j++){
				if(isSpecialCell(state, i, j)){
					ctx.fillStyle = YELLOW;
				}else if( (state[i][j] & SELECTED) > 0){
					ctx.fillStyle = lastStyle === BLACK ? SELECTED_DARK : SELECTED_LIGHT;
				}else if( (state[i][j] & LAST_MOVE) > 0){
					ctx.fillStyle = lastStyle === BLACK ? LAST_MOVE_DARK : LAST_MOVE_LIGHT;
				}else{
					ctx.fillStyle = lastStyle;
				}
				ctx.fillRect(i*tileSizeX, j*tileSizeY, tileSizeX, tileSizeY);

				if( (state[i][j] & VALID_MOVE) > 0){
					let style = lastStyle === BLACK ? AVAILABLE_MOVE_DARK : AVAILABLE_MOVE_LIGHT;
					drawAvailableMove(i*tileSizeX, j*tileSizeY, tileSizeX, tileSizeY, style);
				}
				lastStyle = lastStyle === DARK ? LIGHT : DARK;

				//draw annotations now
				//TODO debug annotations
				ctx.fillStyle = "#333";
				ctx.font = "20px Georgia";
				ctx.fillText(FILE_R[i]+RANK[state.length-j],
					     i*tileSizeX+0.45*tileSizeX, 
					     j*(tileSizeY)+tileSizeY/*-0.45*tileSizeY*/);
			}
		}
				


		drawPieces(state);
	};

	

	function clear(){
		ctx.fillStyle = "rgba(255,255,255,0)";//"#FFF";
		ctx.fillRect(0,0,width, height);
	}

	function drawPieces(state){
		let size = state.length;
		let tileSizeX = width/size;
		let tileSizeY = height/size;
		for(var i=0; i < state.length; i++){
			for(var j=0; j < state[i].length; j++){
				if( (state[i][j] & PIECE_MASK) === B){
					drawPawn(i*tileSizeX, j*tileSizeY, tileSizeX, tileSizeY, BLACK);
				}
				else if( (state[i][j] & PIECE_MASK) === W){
					drawPawn(i*tileSizeX, j*tileSizeY, tileSizeX, tileSizeY, WHITE);
				}
				else if( (state[i][j] & PIECE_MASK) === K){
					drawKing(i*tileSizeX, j*tileSizeY, tileSizeX, tileSizeY);
				}
			}
		}
	}

	//for drawing pieces arbitrarily as in the TaflBoardEditor
	this.drawPieceAtPosition = function(type, x, y, width, height){
		if(type === K){
			drawKing(x,y,width,height);
		}else if(type === W){
			drawPawn(x,y,width,height,WHITE);
		}else if(type === B){
			drawPawn(x,y,width,height,BLACK);
		}
	};

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

	function drawAvailableMove(x, y, width, height, style){
		var cx = x + width*0.5;
		var cy = y + height*0.5;
		var radius = width*0.1;
		ctx.fillStyle = style;
		ctx.beginPath();
		ctx.arc(cx, cy, radius, 0, Math.PI*2);
		ctx.fill();
	}

	//TODO maybe externalize this
	/*canvas.onclick = function(event){
		//if its a players turn and they select one of their pieces
		//set selected piece 

		self.draw();
	}*/

	function isCorner(state, i, j){
		let size = state.length;
		return i === 0 && j === 0 
		|| i === size-1 && j === 0
		|| i === size-1 && j === size-1
		|| i === 0 && j === size-1;
	}

	function isKingsHall(state, i, j){
		let size = state.length;
		return i === Math.floor(size/2) && j === Math.floor(size/2);
	}

	function isSpecialCell(state, x, y){
		return isKingsHall(state, x, y) || isCorner(state, x, y);
	}

}
