const uuid = require("node-uuid");

var unmatchedPlayers = {}; //dict of gametype to unmatched players

//a database would do this so much better...

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
	
}
