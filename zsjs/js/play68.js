function play68_init() {
	updateShare(0);
}
function play68_submitScore(score) {
	updateShareScore(score);
	Play68.shareFriend();
	//setTimeout( function() { Play68.shareFriend(); }, 1000 )
}
function updateShare(score) {
	var descContent = "钻石竞赛";
	if(score > 0)
		shareTitle = '我玩了'+score+'分，巅峰就在下一步！';
	else
		shareTitle = "钻石专场，看你如何挑战巅峰！";
	appid = '';
	Play68.setShareInfo(shareTitle,descContent);
	// document.title = shareTitle;
}
function updateShareScore(score) {
	updateShare(score);
}