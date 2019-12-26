function TaflNotator(initialBoard, variant, rules, notationId){
	const LETTERS = "ABCDEFGHIJKLMNOPQRS"; //up to 19 for Alea Evangelii

	moveStringsCyningstan = [];
	moveStringsOpenTafl = [];

	var notDiv = document.getElementById(notationId);

	this.addMove = function(move){
		var moveString = genCyningstanString(move);
		notDiv.innerHTML += "<li>"+moveString+"</li>";
		moveStringsCyningstan.push(moveString);
	};

	this.undo = function(move){
		moveStringsCyningstan.pop();
		var str = "";
		for(let i=0; i < moveStringsCyningstan.length; i++){
			str += "<li>"+moveStringsCyningstan[i]+"</li>";
		}
		notDiv.innerHTML = str;
	};

	this.parseMove = function(move){
		return genCyningstanString(move);
	};

	this.lastMove = function(move){
		return moveStringsCyningstan[moveStringsCyningstan.length-1];
	};

	this.getMoveNotationsCyningstan = function(){
		return moveStringsCyningstan.join("\n");
	};

	function genCyningstanString(move){
		//+1 to 1 index the board not 0 index
		var start = LETTERS[move.sx]+(move.sy+1);
		var end = LETTERS[move.ex]+(move.ey+1);
		var retVal = start+"-"+end;
		var captures = [];
		if(move.captures && move.captures.length > 0){
			for(let i=0; i < move.captures.length; i++){
				let cap = move.captures[i];
				captures.push(LETTERS[cap.x]+(cap.y+1));
			}
			retVal += "x"+captures.join("/");
		}
		return retVal;
	}

	function getPositionNotation(board){
		//TODO
	}
}
