function play68_init() {
	updateShare(0);
}
function play68_submitScore(score) {
	updateShareScore(score);
	Play68.shareFriend();
	//setTimeout( function() { Play68.shareFriend(); }, 1000 )
}
function updateShare(score) {
	var descContent = "打泡泡";
	if( score > 0)
		shareTitle = "我玩了" + score + "分，满满都是套路,玩完我手都抖了…";
	else
		shareTitle = "满满都是套路,玩完我手都抖了…";
	appid = '';
	Play68.setShareInfo(shareTitle,descContent);
	// document.title = shareTitle;
}
function updateShareScore(score) {
	updateShare(score);
}