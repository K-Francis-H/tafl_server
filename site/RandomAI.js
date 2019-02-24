function RandomAI(type){

	var self = this;
	const TYPE = type;

	this.getMove = function(game){
		var moves = game.getMoves(game.getCurrentPlayer());
		return moves[getRandomInt(0,moves.length)];
	};

	function getRandomInt(min, max) {
	  	min = Math.ceil(min);
	  	max = Math.floor(max);
	  	return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
	}
}
