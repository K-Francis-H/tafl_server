function TaflBoardEditor(canvas, variant){
	const E = 0x00;//empty
	const W = 0x01;//white (defenders)
	const B = 0x02;//black (attackers)
	const K = 0x04;//white king

	var renderer = new TaflRenderer(canvas);
	var board = new TaflBoard(variant);

	var width = canvas.width;
	var height = canvas.height;
	var size = variant.length;

	renderer.draw(board);

	this.exportFEN = function(){
		//TODO write a spec for this based on
	};

	var selectedPiece = 0;
	canvas.addEventListener("mousedown", function(event){
		console.log("drag start");
		let x = event.pageX - offset(canvas).left;
		let y = event.pageY - offset(canvas).top;

		var tileX = Math.floor(x / Math.floor(width/size));
		var tileY = Math.floor(y / Math.floor(height/size));

		let state = board.getBoard();
		//annotate board selection

		//attach draggable image
		//let img = getDraggableImage(state, tileX, tileY);
		//img.src = "http://kryogenix.org/images/hackergotchi-simpler.png";
		//console.log(img);
		//event.dataTransfer.setDragImage(img, 0, 0);
		selectedPiece = state[tileX][tileY];
		board.removePiece(tileX, tileY);

		renderer.draw(board);
	});

	canvas.addEventListener("mousemove", function(event){
		let x = event.pageX - offset(canvas).left;
		let y = event.pageY - offset(canvas).top;

		let w = width/size;
		let h = height/size

		renderer.draw(board);
		if(selectedPiece === K){
			renderer.drawPieceAtPosition(K,x-w/2,y-h/2,w,h);	
		}else if(selectedPiece === W){
			renderer.drawPieceAtPosition(W,x-w/2,y-h/2,w,h);
		}else if(selectedPiece === B){
			renderer.drawPieceAtPosition(B,x-w/2,y-h/2,w,h);
		}
	});

	canvas.addEventListener("mouseup", function(event){
		let x = event.pageX - offset(canvas).left;
		let y = event.pageY - offset(canvas).top;

		var tileX = Math.floor(x / Math.floor(width/size));
		var tileY = Math.floor(y / Math.floor(height/size));

		//TODO modify board state with current drop
		board.placePiece(selectedPiece, tileX, tileY);

		selectedPiece = E;

		renderer.draw(board);
	});

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

	function getDraggableImage(state, tileX, tileY){
		let imgSrc = "";
		if(state[tileX][tileY] === K){
			imgSrc = "images/king.png";
		}else if(state[tileX][tileY] === W){
			imgSrc = "images/white_pawn.png";
		}else if(state[tileX][tileY] === B){
			imgSrc = "images/black_pawn.png";
		}else{
			return null; //or throw exception
		}
		let img = document.createElement("IMG");
		img.src = imgSrc;
		img.width = Math.floor(width/size);
		img.height = Math.floor(height/size);
		return img;
	}
}
