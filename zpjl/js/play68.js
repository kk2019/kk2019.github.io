window.ontouchstart = function(e) { e.preventDefault(); };
function play68_init() {
	updateShare(0);
}
function play68_submitScore(score) {
	updateShareScore(score);
	Play68.shareFriend();
	//setTimeout( function() { Play68.shareFriend(); }, 1000 )
}
function updateShare(score) {
	var descContent = "纸牌接龙";
		shareTitle = "#纸牌接龙#据说能通关的智商最少有120以上！";
	appid = '';
	Play68.setShareInfo(shareTitle,descContent);
	document.title = shareTitle;
}
function updateShareScore(score) {
	updateShare(score);
}