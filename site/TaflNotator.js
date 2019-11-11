function TaflNotator(initialBoard, variant, rules){
	const LETTERS = "ABCDEFGHIJKLMNOPQRS"; //up to 19 for Alea Evangelii

	moveStringsCyningstan = [];
	moveStringsOpenTafl = [];

	this.addMove = function(move){
		
	};

	function genCyningstanString(move){
		var start = LETTERS[move.sx]+move.sy;
		var end = LETTERS[move.ex]+move.ey;
		var retVal = start+"-"+end;
		var captures = [];
		if(move.captures){
			for(let i=0; i < move.captures.length; i++){
				let cap = move.captures[i];
				captures.push(LETTERS[cap.x]+cap.y);
			}
			retVal += "x"+captures.join("/");
		}
		return retVal;
	}

	function getPositionNotation(board){
		//TODO
	}
}
