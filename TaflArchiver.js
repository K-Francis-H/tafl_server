const uuid = require('node-uuid');
const mysql      = require('mysql');
const fs = require("fs");

const options = JSON.parse(fs.readFileSync("./db_creds.json"));
const pool = mysql.createPool(options);

const updateProgressQuery = "UPDATE `game` SET `notation`=?, `status`=? WHERE `id`=?";
const updateCompleteQuery = "UPDATE `game` SET `notation`=?, `status`=?, `result`=?, `end_date`=? WHERE `id`=?"; 

module.exports = {
	
	addPlayer : function(name, isHuman){
		pool.query('INSERT INTO `player`(`id`, `name`, `is_human`, `created`) VALUES (?,?,?,?)', [uuid.v4(), name, isHuman, new Date().getTime()], logError);
	},

	startGame : function(gameId, defender, attacker, variant, ruleset){
		pool.query('INSERT INTO `game` (`id`, `defender_id`, `attacker_id`, `variant`, `ruleset`, `status`, `start_date`) VALUES('+genReplaceString(7)+')', [gameId, defender, attacker, variant, ruleset, "in progress", currentDateMySQL()], logError);
	},

	updateGame : function(gameId, notation, status, result){
		if(status != "in progress"){
			pool.query(updateCompleteQuery, [notation, status, result, currentDateMySQL(), gameId], logError);
		}else{
			pool.query(updateProgressQuery, [notation, status, gameId], logError);

			//TODO update player stats
		} 	//probably call a stored procedure in MySQL to do it
	}
}

function logError(res,err){
	if(res){
		console.log(res);
	}else{
		console.log(err);
	}
}

function genReplaceString(n){
	let str = "";
	for(let i=0; i < n; i++){
		str += "?";
		str += i < n-1 ? "," : "";
	}
	return str;
}

function currentDateMySQL(){
	const now = new Date();
	//+1 on month cause JS does 0-11, MySQL 1-12, MySQL can tolerate 0 
	return now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate();
}
