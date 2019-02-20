document.addEventListener("DOMContentLoaded", function(){
	
	//setup show/hide for rules, play button
	var variants = document.getElementsByClassName("variation-selector");
	for(var i=0; i < variants.length; i++){
		(function(i){
			var variantDisplay = variants[i];
			variantDisplay.onclick = function(){
				hideAllSummaries();
				//now show clicked summary
				variantDisplay.getElementsByClassName("summary")[0].style.display="block";
			}
		})(i);
	}


	//get summaries
	var summaries = document.getElementsByClassName("summary");

	//setup listeners for buttons
	var playButtons = document.getElementsByClassName("play-button");
	for(var i=0; i < playButtons.length; i++){
		(function(i){
			var button = playButtons[i];
			button.onclick = function(){
				setUpGame(button.id);
			}
		})(i);
	}

	function setUpGame(buttonId){
		var opponentSelect = document.getElementsByName("opponent");
		var opponent;// = opponentSelect[0].checked ? opponentSelect[0].value : opponentSelect[1].value;
		if(opponentSelect[0].checked){
			opponent = opponentSelect[0].value;
		}else if(opponentSelect[1].checked){
			opponent = opponentSelect[1].value;
		}else if(opponentSelect[2].checked){
			opponent = opponentSelect[2].value;
		}else if(opponentSelect[3].checked){
			opponent = opponentSelect[3].value;
		}else{
			console.log("No selected opponent!!!");
			return;
		}
		

		//check if color is selected
		var colorSel = document.getElementsByName("color");
		var color;
		if(colorSel[0].checked){
			color = colorSel[0].value;
		}
		else if(colorSel[1].checked){
			color = colorSel[1].value;
		}
		else if(colorSel[2].checked){//random
			var index = Math.floor(Math.random() * (2));//choose 0 or 1 (black or white)
			color = colorSel[index].value;
		}
		else if(opponent !== "edit"){
			console.log("No selected color. Aborting game creation...");
			//TODO alert user
			return;
		}

		//get game variant
		var variant;
		switch(buttonId){
			case "brandubh-button": 	variant="brandubh"; break;
			case "gwddbwyll-button": 	variant="gwddbwyll"; break;
			case "fidchell-button": 	variant="fidchell"; break;
			case "ard-ri-button":		variant="ard_ri"; break;
			case "tablut-button":		variant="tablut"; break;
			case "tawlbwrdd-button":	variant="tawlbwrdd"; break;
			case "hnefatafl-button":	variant="hnefatafl"; break;
			case "large-hnefatafl-button":	variant="large_hnefatafl"; break;
			case "alea-evangelii-button":	variant="alea_evangelii"; break;
			default:
				console.log("Unknown variant: "+buttonId+". Aborting game creation...");
				return;
		}

		//if we got this far we have a color and a variant
		//ask server to create game
		if(opponent === "ai"){
			createLocalAIGame(color, variant);
		}else if(opponent === "local"){
			createLocalGame(variant);
		}else if(opponent === "edit"){
			createBoardEditSession(variant);
		}else{
			createGame(color, variant);
		}

	}

	function hideAllSummaries(){
		for(var i=0; i < summaries.length; i++){
			summaries[i].style.display = "none";
		}
	}

	function createGame(color, variant){
		var ajax = new XMLHttpRequest();
		ajax.open("POST", "/create-game", true);
		ajax.setRequestHeader("Content-type", "application/json");
		ajax.onreadystatechange = function(){
			if(ajax.readyState === 4 && ajax.status === 200){
				var json = JSON.parse(ajax.responseText);
				var gameId = json.gameId;
				var playerId = json.playerId;
				console.log(ajax.responseText);
				//window.open("/game/"+gameId+"/"+playerId, "_self");
				window.open("/network-game.html?gameId="+gameId+"&playerId="+playerId, "_self");
			}
		};
		ajax.send(JSON.stringify({
			color:color,
			variant:variant//,
			/*TODO add: username:username*/
		}));
	}

	function createLocalAIGame(color, variant){
		window.open("/ai-game.html?playerColor="+color+"&variant="+variant);
	}

	function createLocalGame(variant){
		window.open("/local-game.html?variant="+variant);
	}

	function createBoardEditSession(variant){
		window.open("/tafl-board-editor.html?variant="+variant);
	}

});
