gbx.define("comm/data/player/player_data", ["gbx/class"], function(Class) {
	var PlayerData = Class.extend({
		init: function(playerId) {
			this.uid = playerId;
			this.nick = null;
			this.sex = null;
			this.head = null;
			this.gold = null;
			this.carryOnGold = null;
			this.diamond = null;
			this.level = null;
			this.levelExp = null;
			this.vipLevel = null;
			this.vipExp = null;
			this._chipArray = [];
			this.isDealer = false;
			this.bankCardNumber = null;
			this._vipRoomLimitList = [];
			this._serviceQQInfoList = [];
		},
		get vipRoomLimitList() {
			return this._vipRoomLimitList;
		},
		set vipRoomLimitList(data) {
			this._vipRoomLimitList = data;
		},
		get chipArray() {
			return this._chipArray;
		},
		set chipArray(data) {
			for (var i = 0; i < data.length; i++) {
				var str = JSON.stringify(data[i]);
				localStorage.setItem(i.toString(), str);
				var str1 = localStorage.getItem(i.toString());
				this._chipArray[i] = JSON.parse(str1);
			}
		},
		get serviceQQInfoList() {
			return this._serviceQQInfoList;
		},
		set serviceQQInfoList(data) {
			this._serviceQQInfoList = data;
		},
		setData: function(data) {
			this.uid = data.playerId;
			this.sex = data.sex;
			this.nick = data.nickName;
			this.head = data.playerIcon;
			//this.gold = data.roomCoin;
			this.level = data.level;
			this.vipLevel = data.vipLevel;
		}
	});
	return PlayerData;
});
