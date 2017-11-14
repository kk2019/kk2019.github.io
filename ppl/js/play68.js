window.onload = function (){
	updateShare(0);
	}
function play68_init() {
	updateShare(0);
}

function play68_submitScore(score) {
	updateShareScore(score);
	setTimeout( function() { Play68.shareFriend(); }, 400 )
}

function updateShare(bestScore) {
	var descContent = "泡泡龙，小伙伴的最爱！";
   if(myGameLevel > 0) {
		shareTitle = "我在玩#泡泡龙#闯过了" + bestScore + "关，哈哈...，你能超过我吗？";
	}
	else{
		shareTitle = "泡泡龙超级经典的一款游戏小游戏，一起来玩吧！";
	}
	appid = '';
	Play68.setShareInfo(shareTitle,descContent);
}

function updateShareScore(bestScore) {
	updateShare(bestScore);
}