module.exports = function(initialBoard, variant, rules){
	const LETTERS = "ABCDEFGHIJKLMNOPQRS"; //up to 19 for Alea Evangelii

	moveStringsCyningstan = [];
	moveStringsOpenTafl = [];

	//var notDiv = document.getElementById(notationId);

	this.addMove = function(move, isGameOver){
		var moveString = genCyningstanString(move, isGameOver);
		//notDiv.innerHTML += "<li>"+moveString+"</li>";
		moveStringsCyningstan.push(moveString);
	};

	this.parseMove = function(move){
		return genCyningstanString(move);
	};

	this.undo = function(move){
		moveStringsCyningstan.pop(); //just throw out last move
	};

	this.lastMove = function(move){
		return moveStringsCyningstan[moveStringsCyningstan.length-1];
	};

	this.getNotation = function(){
		return moveStringsCyningstan;
	}

	function genCyningstanString(move, isGameOver){
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
		
		if(isGameOver){
			retVal+="++";
		}

		return retVal;
	}

	function getPositionNotation(board){
		//TODO
	}
}
