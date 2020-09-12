const uuid = require("node-uuid");

var unmatchedPlayers = {}; //dict of gametype to unmatched players

//a database would do this so much better...

//let players choose options: preferred side, opponent strength (weaker, stronger, similar), preferred variant, preferred ruleset

module.exports = {
	
	enqueuePlayer : function(req, res){
		var player = new Player(req);
		if(player){
			
			if(unmatchedPlayers[player.getGameType()]){
				unmatchedPlayers[player.getGameType()].push(player);

			}
		}else{
			//TODO respond that the player rerquest was malformed or something
		}
	}

};

function matchmake(gameType){
	//TODO look for similar ELO, then simple availability, preferred side, etc
}
