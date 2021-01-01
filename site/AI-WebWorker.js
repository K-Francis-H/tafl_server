onmessage = function(event){
	//TODO get board, aitype, color, depth etc

	const move = minmax(board, color, depth);
	postMessage(move);
}

function minmax(board, color, aitype, depth){
	//init

	//goto depth

	//get move
}
