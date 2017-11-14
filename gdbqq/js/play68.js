function play68_submitScore(score) {
	updateShareScore(score);
	Play68.shareFriend();
	//setTimeout( function() { Play68.shareFriend(); }, 1000 )
}
function updateShare(score) {
	var descContent = "滚蛋吧球球";
	if(score > 0)
		shareTitle = '我玩了' + score +'分，你能玩到100分吗？';
	else
		shareTitle = "#滚蛋吧球球#你能玩到100分吗？";
	appid = '';
	Play68.setShareInfo(shareTitle,descContent);
	// document.title = shareTitle;
}
