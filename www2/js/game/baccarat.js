gbx.define("game/baccarat/helper/game_mgr", ["gbx/cclass", "gbx/net/messagecommand", "gbx/net/errorcode", "gbx/net/errorcode_des", "gbx/net/connector", "comm/helper/conf_mgr", "comm/helper/playerdata_mgr", "comm/ui/net_error", "comm/data/player/player_data", "comm/helper/room_mgr", "conf/locallization", "conf/ui_locallization", "gbx/net/net_tool"], function (Class, CMD, ERROR_CODE, ERROR_CODE_DES, server, confMgr, playerDataMgr, NetError, PlayerData, roomMgr, Localization, uiLocallization, netTool) {
	var definition = confMgr.read("baccarat/dat/definition.json");
	var GameMgr = Class.extend({
		init: function () {
			this._super();
			this._currRoomData = null;
			this._baccaratRoomType = confMgr.definition.BaccaratRoomType.Dragon;
			this._gameState = definition.GAME_STATE.GAME_END;
			this._players = {};
			this._dealerId = null;
			this._waitDealerList = [];
			this._roundBetInfo = {};
			this._lastPutChipTime = Date.now();
			this._lastMyRoundChipsInfo = [];
			this._roundChipsInfo = {};
			this._farmerMaxSeatIdx = -1;
			this._bankerMaxSeatIdx = -1;
			this._startTime = Date.now();
			this._timeLeftMax = 0;
			this._isFlyCard = false;
			this.subscribe("game_baccarat.command.exit", this, this.eventGameEnd);
			this.subscribe("game_baccarat.command.player_bet_area", this, this.eventPlayerBet);
			this.subscribe("game_baccarat.command.player_repeat_bet", this, this.eventPlayerRepeatBet);
			this.subscribe("game_baccarat.command.up_to_dealer", this, this.eventUpToDealer);
			this.subscribe("game_baccarat.command.cancel_up_dealer", this, this.eventCancelUpToDealer);
			this.subscribe("game_baccarat.command.down_from_dealer", this, this.eventDownFromDealer);
			this.subscribe("game_baccarat.command.send_chat", this, this.eventChat);
			this.subscribe("game_baccarat.command.require_showed_seat", this, this.eventInSeat);
			this.subscribe("game_baccarat.command.cancelBet", this, this.eventCancelBet);
			this.subscribe("game_baccarat.command.flyCard", this, this.eventFlyCard);
			this.subscribe("game_baccarat.command.confirmBet", this, this.eventConfirmBet);
		},
		getMaxSeatIdx: function () {
			return [this._farmerMaxSeatIdx, this._bankerMaxSeatIdx];
		},
		_resetMyBet: function (isNewRound, playerId) {
			if (isNewRound || playerDataMgr.isMyself(playerId)) {
				this._roundBetInfo[playerId] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
				var myRoundChipsInfo = this._roundChipsInfo[playerId];
				if (myRoundChipsInfo != undefined) this._lastMyRoundChipsInfo = myRoundChipsInfo;
			}
			if (!isNewRound) delete this._roundChipsInfo[playerId];
		},
		_integrateAllAreaChips: function (playerId) {
			var roundBetInfo = this._roundBetInfo[playerId];
			if (roundBetInfo == undefined) return;
			var allAreaElements = this._roundChipsInfo[playerId];
			for (var area = definition.CHIP_AREA.BANKER; area <= definition.CHIP_AREA.FARMERPAIR; area++) {
				var areaBetInfo = roundBetInfo[area - 1];
				if (areaBetInfo == 0) continue;
				var areaElements = allAreaElements[area - 1];
				if (this._baccaratRoomType != confMgr.definition.BaccaratRoomType.Dragon) {
					areaElements = this._integrateAreaChips(playerId, area, areaBetInfo);
					allAreaElements[area - 1] = areaElements;
				}
				for (var i = 0; i < areaElements.length; i++) {
					var element = areaElements[i];
					this.publish("game_baccarat.play.fly_bet", this._getSeatIdx(playerId), area, playerId, element.money, false, i);
				}
			}
		},
		_integrateAreaChips: function (playerId, area, areaBetInfo) {
			var areaElements = [];
			var chipTypeNum = confMgr.setting.betPrice.length;
			for (var i = chipTypeNum - 1; i >= 0; i--) {
				var betPrice = confMgr.setting.betPrice[i];
				var num = parseInt(areaBetInfo / betPrice);
				if (num != 0) {
					for (var j = 0; j < num; j++) {
						var chipInfo = {
							area: area,
							money: betPrice,
							playerId: playerId
						};
						areaElements.push(chipInfo);
					}
				}
				var leftBet = areaBetInfo % betPrice;
				if (leftBet <= 0) break;
				areaBetInfo = leftBet;
			}
			return areaElements;
		},
		setRoomData: function (proto) {
			this._gameState = proto.state;
			var data = roomMgr.getChoose();
			roomMgr.lastRoomId = data.roomId;
			this._baccaratRoomType = data.baccaratRoomType;
			gbx.log("setRoomData gameState " + this._gameState);
			for (var i in proto.players) {
				var playerProto = proto.players[i];
				var playerInfoProto = playerProto.playerInfo;
				var playerId = playerInfoProto.playerId;
				var playerObj = netTool.createObjFromProto(playerInfoProto);
				playerObj.seatIdx = playerProto.seatIdx;
				playerObj.roomCoin = playerProto.carryOnGold;
				this._players[playerId] = playerObj;
				if (playerDataMgr.isMyself(playerId)) {
					playerObj.seatIdx = proto.playerSeatIdx;
					playerDataMgr.setMyCarryGold(playerProto.carryOnGold);
					playerDataMgr.setSeatIdx(playerObj.seatIdx);
				}
				if (playerObj.seatIdx !== -1) {
					this.publish("game_baccarat.play.set_player_in_seat", playerObj.seatIdx, playerObj.nickName, playerObj.playerIcon, 0, playerDataMgr.isMyself(playerId), proto.leftSendCardTime);
				}
				if (this._gameState < definition.GAME_STATE.GAME_RESULT) {
					this.onUserBet(playerId, playerProto.chipInfo, true);
					this._integrateAllAreaChips(playerId);
				}
				if (playerObj.seatIdx !== -1) {
					var carryOnGold = 0;
					if (playerDataMgr.isMyself(playerId)) carryOnGold = playerDataMgr.getMyCarryGold();
					else carryOnGold = playerObj.roomCoin;
					this.publish("game_baccarat.play.update_player_gold", playerObj.seatIdx, carryOnGold);
				}
			}
			this._setPlayerList();
			this.onSetDealerList(proto.waitBankers);
			if (proto.bankerId !== "") this.onSetGameDealer(proto.bankerId, proto.bankerScore, proto.bankerRounds, this._players[proto.bankerId].roomCoin);
			else this.onSetGameDealer(null, 0, 0, 0);
			this.publish("global.playerdata.update.itembag");
			this.publish("game_baccarat.play.update_card_count", proto.leftCardNum);
			this.publish("game_baccarat.play.start_bet", proto.leftSendCardTime, playerDataMgr.isDealer(), true);
			this._timeLeftMax = proto.leftSendCardTime;
			this._startTime = Date.now();
			if (this._baccaratRoomType == confMgr.definition.BaccaratRoomType.Dragon) {
				if (this._gameState < definition.GAME_STATE.GAME_RESULT) {
					if (proto.bankerCards.length > 0 || proto.farmerCards.length > 0) this.onSendCard(this._gameState, proto.bankerCards, proto.farmerCards, false);
				}
			} else if (this._baccaratRoomType == confMgr.definition.BaccaratRoomType.JingMi || this._baccaratRoomType == confMgr.definition.BaccaratRoomType.Vip) {
				var myLookSide = definition.LOOKCARD_SIDE.NONE;
				this._farmerMaxSeatIdx = -1;
				this._bankerMaxSeatIdx = -1;
				if (proto.farmerBetMax) {
					var farmer = this._players[proto.farmerBetMax];
					this._farmerMaxSeatIdx = farmer.seatIdx;
					if (playerDataMgr.isMyself(proto.farmerBetMax)) myLookSide = definition.LOOKCARD_SIDE.FARMER;
				}
				if (proto.bankerBetMax) {
					var banker = this._players[proto.bankerBetMax];
					this._bankerMaxSeatIdx = banker.seatIdx;
					if (playerDataMgr.isMyself(proto.bankerBetMax)) myLookSide = definition.LOOKCARD_SIDE.BANKER;
				}
				this.publish("game_baccarat.play.getBetMaxPlayer", this._farmerMaxSeatIdx, this._bankerMaxSeatIdx, false);
				if (proto.bankerCards.length > 0 && proto.farmerCards.length > 0) {
					this.publish("game_baccarat.play.send_card", proto.bankerCards, proto.farmerCards, proto.sendCardSteps, proto.sendCardLeftTime, proto.step2Send2, this._farmerMaxSeatIdx, this._bankerMaxSeatIdx, myLookSide, false, proto.lookCardDir, proto.lookStep, proto.lookRadian);
				}
				this.publish("game_baccarat.seat.checkShowChair");
			}
			this._isFlyCard = proto.isFlyCard;
			if (this._gameState == definition.GAME_STATE.USER_PUT) {
				if (this._isFlyCard) this.publish("game_baccarat.play.checkFlyCard", true);
				else this.publish("game_baccarat.play.checkFlyCard", Object.getOwnPropertyNames(this._roundChipsInfo).length > 0);
			} else {
				this.publish("game_baccarat.play.checkFlyCard", true);
			}
			if (proto.isConfirmBet) this.publish("game_baccarat.play.lockBet");
			if (this._gameState > 4) {
				this.publish("game_baccarat.play.card_timeout", 5);
				this.publish("game_baccarat.play.card_timeout", 6);
				this.publish("game_baccarat.play.card_timeout", 7);
			}
		},
		_getSeatIdx: function (playerId) {
			if (playerId in this._players) {
				var playerObj = this._players[playerId];
				return playerObj.seatIdx;
			}
			return -1;
		},
		_setPlayerList: function () {
			var resultList = [];
			var array = [];
			if (this._baccaratRoomType == confMgr.definition.BaccaratRoomType.Dragon) array = confMgr.setting.seatPos;
			else if (this._baccaratRoomType == confMgr.definition.BaccaratRoomType.JingMi || this._baccaratRoomType == confMgr.definition.BaccaratRoomType.Vip) array = confMgr.setting.seatPos_jinMi;
			for (var key in this._players) {
				if (this._players[key].seatIdx >= 0 && this._players[key].seatIdx < array.length) continue;
				resultList.push(this._players[key]);
			}
			this.publish("game_baccarat.play.set_player_list", resultList);
			this.publish("game_baccarat.play.setRoomPlayersCount", this._players.length);
		},
		_isWaitingUpToDealer: function () {
			for (var key in this._waitDealerList) {
				var info = this._waitDealerList[key];
				if (playerDataMgr.isMyself(info.playerId)) return true;
			}
			return false;
		},
		_setMeDealer: function (isDealer) {
			playerDataMgr.setMeDealer(isDealer);
			if (isDealer) {
				this.publish("game_baccarat.command.set_dealer_button", "down");
			} else {
				var isWaiting = this._isWaitingUpToDealer();
				if (isWaiting) this.publish("game_baccarat.command.set_dealer_button", "cancel");
				else this.publish("game_baccarat.command.set_dealer_button", "up");
			}
		},
		_playerBet: function (chipInfo) {
			var sendData = gtea.protobuf.encode("RequestUserBet", {
				BetMoney: parseInt(chipInfo[0].money) * 100,
				BetId: chipInfo[0].area - 1
			}, 150, 1);
			server.sendToRoom(CMD.BaccaratBet, sendData);
			this._lastPutChipTime = Date.now();
		},
		_showResult: function (state, winState, bankerPair, farmerPair) {
			this._gameState = state;
			if (!playerDataMgr.isDealer() && Date.now() - this._lastPutChipTime > 3e5) {
				this._showFailMessage(Localization.kickNotice);
				this.eventGameEnd();
				return;
			}
			if (winState == definition.WIN_STATE.WIN_UNKNOW) return;
			var pairs = 0;
			if (bankerPair) {
				pairs |= 1;
				this.publish("game_baccarat.play.add_win_area", definition.CHIP_AREA.BANKERPAIR);
			}
			if (farmerPair) {
				pairs |= 2;
				this.publish("game_baccarat.play.add_win_area", definition.CHIP_AREA.FARMERPAIR);
			}
			if (bankerPair && farmerPair) {
				pairs |= 3;
			}
			var fails = [];
			var wins = [];
			if (bankerPair) wins.push(definition.CHIP_AREA.BANKERPAIR);
			else fails.push(definition.CHIP_AREA.BANKERPAIR);
			if (farmerPair) wins.push(definition.CHIP_AREA.FARMERPAIR);
			else fails.push(definition.CHIP_AREA.FARMERPAIR);
			wins.push(winState);

			if (myGlobalData.isLHD) {
				if (myGlobalData.currPokeData.bankerData.isSingle) {
					this.publish("game_baccarat.play.add_win_area", definition.CHIP_AREA.BANKERSINGLE);
				} else {
					this.publish("game_baccarat.play.add_win_area", definition.CHIP_AREA.BANKERDOUBLE);
				}
				if (myGlobalData.currPokeData.bankerData.isRed) {
					this.publish("game_baccarat.play.add_win_area", definition.CHIP_AREA.BANKERRED);
				} else {
					this.publish("game_baccarat.play.add_win_area", definition.CHIP_AREA.BANKERBLACK);
				}
				if (myGlobalData.currPokeData.farmerData.isSingle) {
					this.publish("game_baccarat.play.add_win_area", definition.CHIP_AREA.FARMERSINGLE);
				} else {
					this.publish("game_baccarat.play.add_win_area", definition.CHIP_AREA.FARMERDOUBLE);
				}
				if (myGlobalData.currPokeData.farmerData.isRed) {
					this.publish("game_baccarat.play.add_win_area", definition.CHIP_AREA.FARMERRED);
				} else {
					this.publish("game_baccarat.play.add_win_area", definition.CHIP_AREA.FARMERBLACK);
				}
			}

			if (winState != definition.CHIP_AREA.DEUCE) {
				for (var area = definition.CHIP_AREA.BANKER; area <= definition.CHIP_AREA.DEUCE; area++) {
					if (area != winState) fails.push(area);
				}
			}
			var dealerToAreaChipInfo = {};

			function isWinArea(area) {
				for (var i in wins) {
					var winArea = wins[i];
					if (winArea == area) return true;
				}
				return false;
			}

			function pushInfo(data, element) {
				var key = element.chair + "_" + element.area + "_" + element.playerId;
				if (data.hasOwnProperty(key) == false) data[key] = [];
				data[key].push(element.money);
			}
			for (var playerId in this._roundChipsInfo) {
				var allAreaElements = this._roundChipsInfo[playerId];
				var seatIdx = this._getSeatIdx(playerId);
				for (var tArea in allAreaElements) {
					var areaElements = allAreaElements[tArea];
					for (var i = 0; i < areaElements.length; i++) {
						var element = areaElements[i];
						element.chair = seatIdx;
						if (isWinArea(tArea)) pushInfo(dealerToAreaChipInfo, element);
					}
				}
			}
			this.publish("game_baccarat.play.add_game_round", fails, dealerToAreaChipInfo);
			this.publish("game_baccarat.play.add_win_area", winState);
			this.publish("game_baccarat.play.add_history", winState, pairs, this._bankerMaxSeatIdx, this._farmerMaxSeatIdx);
		},
		_settleMoney: function (winState, turns, score, gold, playerMoney) {
			var changedList = [];
			var addGold = 0;
			for (var i = 0; i < playerMoney.length; i++) {
				var playerId = playerMoney[i].playerId;
				if (playerId in this._players) {
					var playerObj = this._players[playerId];
					playerObj.roomCoin = playerMoney[i].carryOnGold;
					playerMoney[i].seatIdx = playerObj.seatIdx;
					if (playerDataMgr.isMyself(playerId)) {
						if (winState === definition.WIN_STATE.WIN_DEUCE) {
							changedList.push(playerMoney[i]);
						} else {
							if (playerMoney[i].carryOnGold !== playerDataMgr.getMyCarryGold()) changedList.push(playerMoney[i]);
						}
						addGold = playerMoney[i].carryOnGold - playerDataMgr.getMyCarryGold();
						playerDataMgr.setMyCarryGold(playerMoney[i].carryOnGold);
						playerDataMgr.setMyGold(playerMoney[i].gold);
					} else {
						changedList.push(playerMoney[i]);
					}
				}
			}
			this.publish("game_baccarat.play.update_dealer_info", turns, score, gold);
			this.publish("game_baccarat.play.update_players_info", changedList, addGold);
		},
		_showFailMessage: function (message) {
			this.publish("game_baccarat.command.show_fail_message", message);
		},
		sendSystemChat: function (msg) {
			this.onChat(definition.CHAT_TYPE.SYSTEM, "", msg);
		},
		_inSeatCheck: function (notifyError) {
			if (playerDataMgr.isDealer()) return false;
			if (this._baccaratRoomType != confMgr.definition.BaccaratRoomType.Dragon) {
				var playerId = playerDataMgr.getMyUID();
				var mySeatIdx = this._getSeatIdx(playerId);
				if (mySeatIdx != -1) return;
			}
			var data = roomMgr.getChoose();
			var seatMinMoney = data.seatMinMoney;
			if (playerDataMgr.getMyCarryGold() < seatMinMoney) {
				if (notifyError) {
					var str = uiLocallization.seat_gold_limit;
					str = str.replace("A", seatMinMoney);
					this._showFailMessage(str);
				}
				return false;
			}
			return true;
		},
		end: function () {
			this._players = null;
			this._waitDealerList = null;
			this._roundBetInfo = null;
			this._lastPutChipTime = null;
			this._lastMyRoundChipsInfo = null;
			this._roundChipsInfo = null;
			this._farmerMaxSeatIdx = -1;
			this._bankerMaxSeatIdx = -1;
			this._super();
		},
		eventPlayerBet: function (area, chips, failCall) {
			var data = roomMgr.getChoose();
			var limitFarmerBanker = data.bankerFarmerBetMin;
			var limitFarmerBankerPair_and_duece = data.otherBetMin;
			var myRoundBetInfo = this._roundBetInfo[playerDataMgr.getMyUID()];
			var curChips = 0;
			if (area == definition.CHIP_AREA.BANKER || area == definition.CHIP_AREA.FARMER) {
				if (myRoundBetInfo != undefined) curChips = myRoundBetInfo[area - 1];
				if (chips + curChips < limitFarmerBanker) {
					this._showFailMessage(uiLocallization.farmerbankerArea + uiLocallization.LimitColor + limitFarmerBanker);
					return;
				}
			} else if (area == definition.CHIP_AREA.DEUCE) {
				if (myRoundBetInfo != undefined) curChips = myRoundBetInfo[area - 1];
				if (chips + curChips < limitFarmerBankerPair_and_duece) {
					this._showFailMessage(uiLocallization.dueceArea + uiLocallization.LimitColor + limitFarmerBankerPair_and_duece);
					return;
				}
			} else {
				if (myRoundBetInfo != undefined) curChips = myRoundBetInfo[area - 1];
				if (chips + curChips < limitFarmerBankerPair_and_duece) {
					this._showFailMessage(uiLocallization.farmerbankerPairArea + uiLocallization.LimitColor + limitFarmerBankerPair_and_duece);
					return;
				}
			}
			if (myRoundBetInfo != undefined && area == definition.CHIP_AREA.BANKER && myRoundBetInfo[definition.CHIP_AREA.FARMER - 1] > 0) {
				if (myGlobalData.isLHD) {
					this._showFailMessage(uiLocallization.DragonAndTigerMutex);
				} else {
					this._showFailMessage(uiLocallization.BankerAndFarmerMutex);
				}
				return;
			}
			if (myRoundBetInfo != undefined && area == definition.CHIP_AREA.FARMER && myRoundBetInfo[definition.CHIP_AREA.BANKER - 1] > 0) {
				if (myGlobalData.isLHD) {
					this._showFailMessage(uiLocallization.DragonAndTigerMutex);
				} else {
					this._showFailMessage(uiLocallization.BankerAndFarmerMutex);
				}
				return;
			}
			if (myRoundBetInfo != undefined) {
				if (myGlobalData.isLHD) {

					if (area == definition.CHIP_AREA.BANKERRED && myRoundBetInfo[definition.CHIP_AREA.BANKERBLACK - 1] > 0) {
						this._showFailMessage(uiLocallization.TigerRandBMutex);
						return;
					}
					if (area == definition.CHIP_AREA.BANKERBLACK && myRoundBetInfo[definition.CHIP_AREA.BANKERRED - 1] > 0) {
						this._showFailMessage(uiLocallization.TigerRandBMutex);
						return;
					}
					if (area == definition.CHIP_AREA.BANKERDOUBLE && myRoundBetInfo[definition.CHIP_AREA.BANKERSINGLE - 1] > 0) {
						this._showFailMessage(uiLocallization.TigerSandDMutex);
						return;
					}
					if (area == definition.CHIP_AREA.BANKERSINGLE && myRoundBetInfo[definition.CHIP_AREA.BANKERDOUBLE - 1] > 0) {
						this._showFailMessage(uiLocallization.TigerSandDMutex);
						return;
					}

					if (area == definition.CHIP_AREA.FARMERRED && myRoundBetInfo[definition.CHIP_AREA.FARMERBLACK - 1] > 0) {
						this._showFailMessage(uiLocallization.DragonRandBMutex);
						return;
					}
					if (area == definition.CHIP_AREA.FARMERBLACK && myRoundBetInfo[definition.CHIP_AREA.FARMERRED - 1] > 0) {
						this._showFailMessage(uiLocallization.DragonRandBMutex);
						return;
					}
					if (area == definition.CHIP_AREA.FARMERDOUBLE && myRoundBetInfo[definition.CHIP_AREA.FARMERSINGLE - 1] > 0) {
						this._showFailMessage(uiLocallization.DragonSandDMutex);
						return;
					}
					if (area == definition.CHIP_AREA.FARMERSINGLE && myRoundBetInfo[definition.CHIP_AREA.FARMERDOUBLE - 1] > 0) {
						this._showFailMessage(uiLocallization.DragonSandDMutex);
						return;
					}
				} else {
					if (area == definition.CHIP_AREA.BANKER - 1 && myRoundBetInfo[definition.CHIP_AREA.FARMER - 1] > 0) {
						this._showFailMessage(uiLocallization.BankerAndFarmerMutex);
						return;
					}
					if (area == definition.CHIP_AREA.FARMER - 1 && myRoundBetInfo[definition.CHIP_AREA.BANKER - 1] > 0) {
						this._showFailMessage(uiLocallization.BankerAndFarmerMutex);
						return;
					}
				}
			}
			if (playerDataMgr.getMyCarryGold() >= chips) {
				var chipInfo = [{
					area: area,
					money: chips
				}];
				this._playerBet(chipInfo);
			} else {
				this._showFailMessage(Localization.lackMoney);
				if (failCall) failCall.call();
			}
		},
		eventPlayerRepeatBet: function (rate) {
			var tMoney = 0;
			var chipInfo = [];
			for (var i = 0; i < this._lastMyRoundChipsInfo.length; i++) {
				var chipInfo = this._lastMyRoundChipsInfo[i];
				for (var j = 0; j < rate; j++) {
					tMoney += chipInfo.money;
					chipInfo.push({
						area: chipInfo.area,
						money: chipInfo.money
					});
				}
			}
			var myRoundBetInfo = this._roundBetInfo[playerDataMgr.getMyUID()];
			if (myRoundBetInfo != undefined) {
				var tolal = myRoundBetInfo[5];
				if (myGlobalData.isLHD) {
					tolal = myRoundBetInfo[11];
				}
				if (playerDataMgr.getMyCarryGold() - tolal >= tMoney) this._playerBet(chipInfo);
				else this._showFailMessage(Localization.lackMoney);
			}
		},
		eventUpToDealer: function () {
			var data = roomMgr.getChoose();
			if (data.upToBanker == 0) return;
			if (data.bankerMinMoney > playerDataMgr.getMyCarryGold()) {
				this._showFailMessage(ERROR_CODE_DES[ERROR_CODE.LackMoney] + "," + uiLocallization.up_banker_need + " " + data.bankerMinMoney);
				return;
			}
			var sendData = gtea.protobuf.encode("BaccaratApplyBanker", {
				isUp: true
			});
			server.sendToRoom(CMD.BaccaratApplyBanker, sendData);
		},
		eventCancelUpToDealer: function () {
			var data = roomMgr.getChoose();
			if (data.upToBanker == 0) return;
			var sendData = gtea.protobuf.encode("BaccaratApplyBanker", {
				isUp: false
			});
			server.sendToRoom(CMD.BaccaratApplyBanker, sendData);
		},
		eventDownFromDealer: function () {
			var data = roomMgr.getChoose();
			if (data.upToBanker == 0) return;
			var sendData = gtea.protobuf.encode("BaccaratApplyBanker", {
				isUp: false
			});
			server.sendToRoom(CMD.BaccaratApplyBanker, sendData);
		},
		eventInSeat: function (seatIdx) {
			if (!this._inSeatCheck(true)) return;
			var sendData = gtea.protobuf.encode("RequestUserSit", {
				SeatId: seatIdx + 1
			}, 150, 5);
			server.sendToRoom(CMD.SyncPlayerJoinRoom, sendData);
		},
		eventChat: function (type, content) {
			var playerId = playerDataMgr.getMyUID();
			var sendData = gtea.protobuf.encode("BaccaratChat", {
				playerId: playerId,
				type: type,
				content: content
			});
			server.sendToRoom(CMD.BaccaratChat, sendData);
		},
		eventGameEnd: function () {
			var playerId = playerDataMgr.getMyUID();
			var sendData = gtea.protobuf.encode(null, null, 151, 1);
			gtea.net.ProtobufConverter.getInstance().setCallback(CMD.QuitRoom, 151, 1, null);
			server.requestToGame(CMD.QuitRoom, sendData, this, function (errorcode, retData) {
				//if (errorcode == ERROR_CODE.OK) {
				//	var msgData = gtea.protobuf.decode("QuitRoomResp", retData);
				//	if (msgData.result == ERROR_CODE.OK) {
				var myRoundBetInfo = this._roundBetInfo[playerId];
				if (myRoundBetInfo != undefined) {
					var tolal = myRoundBetInfo[5];
					if (myGlobalData.isLHD) {
						tolal = myRoundBetInfo[11];
					}
					playerDataMgr.updateMyCarryGold(tolal);
				}
				//roomMgr.getAllRoomData(this, function() {
				this.publish("global.app.back_action");
				//})
				//	} else {
				//		this._showFailMessage("gameEnd error " + msgData.result)
				//	}
				//}
			});
		},
		eventConfirmBet: function () {
			var sendData = gtea.protobuf.encode(null, {}, 150, 2);
			server.sendToRoom(CMD.BaccaratConfirmBet, sendData);
			this.publish("game_baccarat.play.lockBet");
		},
		eventCancelBet: function () {
			var sendData = gtea.protobuf.encode(null, {}, 150, 3);
			server.sendToRoom(CMD.BaccaratRemoveBet, sendData);
		},
		eventFlyCard: function () {
			if (this._gameState != definition.GAME_STATE.USER_PUT) return;
			var playerId = playerDataMgr.getMyUID();
			var seatIdx = this._getSeatIdx(playerId);
			if (seatIdx < 0) {
				this._showFailMessage(Localization.noSeatCantFlyCard);
				return;
			}
			var sendData = gtea.protobuf.encode(null, {}, 150, 11);
			server.sendToRoom(CMD.BaccaratFlyCardJM, sendData);
		},
		onPlayerSeatChanged: function (msgData) {
			var playerObj = this._players[msgData.playerId];
			playerObj.seatIdx = msgData.seatIdx;
			var passed = Math.floor((Date.now() - this._startTime) / 1e3);
			var leftTime = this._timeLeftMax - passed > 0 ? this._timeLeftMax - passed : 0;
			if (playerDataMgr.isMyself(msgData.playerId)) {
				playerDataMgr.setSeatIdx(playerObj.seatIdx);
				this.publish("game_baccarat.play.set_player_in_seat", playerObj.seatIdx, playerObj.nickName, playerObj.playerIcon, playerDataMgr.getMyCarryGold(), true, leftTime);
			} else {
				this.publish("game_baccarat.play.set_player_in_seat", playerObj.seatIdx, playerObj.nickName, playerObj.playerIcon, playerObj.roomCoin, false, leftTime);
			}
			this._setPlayerList();
			if (msgData.clearSeatIdx !== -1) this.publish("game_baccarat.play.set_player_out_seat", msgData.clearSeatIdx);
			if (this._baccaratRoomType != confMgr.definition.BaccaratRoomType.Dragon) {
				if (playerDataMgr.isMyself(msgData.playerId)) this.publish("game_baccarat.seat.checkShowChair");
			}
		},
		onNewRound: function (state, time) {
			this._gameState = state;
			this._resetMyBet(true, null);
			this._roundBetInfo = {};
			this._roundChipsInfo = {};
			this._farmerMaxSeatIdx = -1;
			this._bankerMaxSeatIdx = -1;
			this._timeLeftMax = time;
			this._startTime = Date.now();
			this._isFlyCard = false;
			this.publish("game_baccarat.play.clear_table");
			this.publish("game_baccarat.play.start_bet", time, playerDataMgr.isDealer(), false);
			if (playerDataMgr.isDealer()) {
				this._lastPutChipTime = Date.now();
			} else {
				if (Date.now() - this._lastPutChipTime > 3e5) {
					this._showFailMessage(Localization.kickNotice);
					this.eventGameEnd();
					return;
				}
			}
		},
		onGetUserMax: function (farmerPlayerId, bankerPlayerId) {
			this._farmerMaxSeatIdx = -1;
			this._bankerMaxSeatIdx = -1;
			if (farmerPlayerId) {
				var farmer = this._players[farmerPlayerId];
				if (farmer) {
					this._farmerMaxSeatIdx = farmer.seatIdx;
				}
			}
			if (bankerPlayerId) {
				var banker = this._players[bankerPlayerId];
				if (banker) {
					this._bankerMaxSeatIdx = banker.seatIdx;
				}
			}
			this.publish("game_baccarat.play.getBetMaxPlayer", this._farmerMaxSeatIdx, this._bankerMaxSeatIdx, true);
		},
		onUserBet: function (playerId, chipInfoProto, isInit) {
			for (var i = 0; i < chipInfoProto.length; i++) {
				var oneChipInfoProto = chipInfoProto[i];
				var chipInfo = netTool.createObjFromProto(oneChipInfoProto);
				chipInfo.playerId = playerId;
				var area = chipInfo.area;
				var chip = chipInfo.money;
				var roundBetInfo = this._roundBetInfo[playerId];
				if (roundBetInfo == undefined) {
					roundBetInfo = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
					this._roundBetInfo[playerId] = roundBetInfo;
				}
				roundBetInfo[area - 1] = isNaN(roundBetInfo[area - 1]) ? 0 : roundBetInfo[area - 1];
				//返回下注值为总值,不是间次值,此处要处理一下
				chip = chip - roundBetInfo[area - 1];

				roundBetInfo[area - 1] += chip;
				if (myGlobalData.isLHD) {
					roundBetInfo[11] += chip;
				} else {
					roundBetInfo[5] += chip;
				}

				var allAreaElements = this._roundChipsInfo[playerId];
				if (allAreaElements == undefined) {
					allAreaElements = {};
					this._roundChipsInfo[playerId] = allAreaElements;
				}
				var areaElements = allAreaElements[area - 1];
				if (areaElements == undefined) {
					areaElements = [];
					allAreaElements[area - 1] = areaElements;
				}
				areaElements.push(chipInfo);
				var chipIdx = areaElements.length - 1;
				if (!isInit) {
					if (this._baccaratRoomType == confMgr.definition.BaccaratRoomType.Dragon) {
						this.publish("game_baccarat.play.fly_bet", this._getSeatIdx(playerId), area, playerId, chip, true);
					} else {
						var integratedAreaElements = this._integrateAreaChips(playerId, area, chip);
						allAreaElements[area] = integratedAreaElements;
						if (areaElements.length != integratedAreaElements.length) this.publish("game_baccarat.play.fly_bet", this._getSeatIdx(playerId), area, playerId, chip, true, chipIdx, integratedAreaElements);
						else this.publish("game_baccarat.play.fly_bet", this._getSeatIdx(playerId), area, playerId, chip, true, chipIdx, null);
					}
				}
				if (playerDataMgr.isMyself(playerId)) {
					playerDataMgr.updateMyCarryGold(-chip);
					this.publish("game_baccarat.play.update_area_my_chip", area, roundBetInfo[area - 1]);
					if (!isInit) {
						this.publish("global.playerdata.update.itembag");
						var seatIdx = this._getSeatIdx(playerId);
						if (seatIdx != -1) this.publish("game_baccarat.play.update_player_gold", seatIdx, playerDataMgr.getMyCarryGold());
					}
				} else {
					var playerObj = this._players[playerId];
					if (playerObj) playerObj.roomCoin -= chip;
					if (!isInit) {
						if (playerObj != null && playerObj.seatIdx != -1) this.publish("game_baccarat.play.update_player_gold", playerObj.seatIdx, playerObj.roomCoin);
					}
				}
			}
			if (!isInit) this.publish("game_baccarat.play.checkFlyCard", true);
		},
		onRemoveBet: function (playerId, carryOnGold) {
			this._resetMyBet(false, playerId);
			if (playerDataMgr.isMyself(playerId)) {
				playerDataMgr.setMyCarryGold(carryOnGold);
				this.publish("game_baccarat.play.clear_area_my_chip");
				this.publish("global.playerdata.update.itembag");
			} else {
				var playerObj = this._players[playerId];
				playerObj.roomCoin = carryOnGold;
			}
			var seatIdx = this._getSeatIdx(playerId);
			this.publish("game_baccarat.play.removeBet", seatIdx, playerId);
			if (seatIdx != -1) this.publish("game_baccarat.play.update_player_gold", seatIdx, carryOnGold);
			if (this._isFlyCard) this.publish("game_baccarat.play.checkFlyCard", true);
			else this.publish("game_baccarat.play.checkFlyCard", Object.getOwnPropertyNames(this._roundChipsInfo).length > 0);
		},
		onSendCard: function (state, bankersCard, farmersCard, doAnimation) {
			this._gameState = state;
			//通过发牌来判断庄对闲对
			myGlobalData.currPokeData = {
				bankerPair: bankersCard[0] >> 8 == bankersCard[1] >> 8,
				farmerPair: farmersCard[0] >> 8 == farmersCard[1] >> 8
			};
			if (myGlobalData.isLHD) {
				var bankerCard1Value = bankersCard[0] >> 8;
				var bankerCard1Color = bankersCard[0] & 255;
				var farmerCard1Value = farmersCard[0] >> 8;
				var farmerCard1Color = farmersCard[0] & 255;
				myGlobalData.currPokeData.bankerData = { isSingle: bankerCard1Value % 2 == 1, isRed: bankerCard1Color == 2 || bankerCard1Color == 3 };
				myGlobalData.currPokeData.farmerData = { isSingle: farmerCard1Value % 2 == 1, isRed: farmerCard1Color == 2 || farmerCard1Color == 3 };
			}

			this.publish("game_baccarat.play.send_card", bankersCard, farmersCard, doAnimation);
			this.publish("game_baccarat.play.checkFlyCard", true);
		},
		onSendCardJM: function (retData) {
			this._gameState = retData.state;
			this._farmerMaxSeatIdx = -1;
			this._bankerMaxSeatIdx = -1;
			var myLookSide = definition.LOOKCARD_SIDE.NONE;
			if (retData.farmerBetMax) {
				var farmer = this._players[retData.farmerBetMax];
				if (farmer) {
					this._farmerMaxSeatIdx = farmer.seatIdx;
				}
				if (playerDataMgr.isMyself(retData.farmerBetMax)) myLookSide = definition.LOOKCARD_SIDE.FARMER;
			}
			if (retData.bankerBetMax) {
				var banker = this._players[retData.bankerBetMax];
				if (banker) {
					this._bankerMaxSeatIdx = banker.seatIdx;
				}
				if (playerDataMgr.isMyself(retData.bankerBetMax)) myLookSide = definition.LOOKCARD_SIDE.BANKER;
			}
			if (myGlobalData.isLHD) {
				myGlobalData.currPokeData = {};
				var bankerCard1Value = retData.bankerCard[0] >> 8;
				var bankerCard1Color = retData.bankerCard[0] & 255;
				var farmerCard1Value = retData.farmerCard[0] >> 8;
				var farmerCard1Color = retData.farmerCard[0] & 255;
				myGlobalData.currPokeData.bankerData = { isSingle: bankerCard1Value % 2 == 1, isRed: bankerCard1Color == 2 || bankerCard1Color == 3 };
				myGlobalData.currPokeData.farmerData = { isSingle: farmerCard1Value % 2 == 1, isRed: farmerCard1Color == 2 || farmerCard1Color == 3 };
				this.publish("game_baccarat.play.send_card", retData.farmerCard, retData.bankerCard, retData.sendCardSteps, retData.leftTime, retData.step2Send2, this._farmerMaxSeatIdx, this._bankerMaxSeatIdx, myLookSide, true);
			} else this.publish("game_baccarat.play.send_card", retData.bankerCard, retData.farmerCard, retData.sendCardSteps, retData.leftTime, retData.step2Send2, this._farmerMaxSeatIdx, this._bankerMaxSeatIdx, myLookSide, true);
		},
		onSyncCardFlipProcess: function (retData) {
			//var isMyself = playerDataMgr.isMyself(retData.playerId);
			var isMyself = myGlobalData.isMySide;
			this.publish("game_baccarat.play.update_card_progress", retData.step, retData.radian, retData.cardIndex, retData.lookCardDir, isMyself);
		},
		onSyncLookCardEndJM: function (retData) {
			this.publish("game_baccarat.play.card_timeout", retData.sendCardStep);
		},
		onSyncLookCardDir: function (retData) {
			this.publish("game_baccarat.play.update_card_direction", retData.sendCardStep, retData.cardIndex, retData.dir);
		},
		onSyncMiLookSound: function (retData) {
			this.publish("game_baccarat.play.playSound", retData.sound);
		},
		onRoundResult: function (state, winState, bankerPair, farmerPair, turns, score, gold, playerMoney) {
			this._showResult(state, winState, bankerPair, farmerPair);
			this._settleMoney(winState, turns, score, gold, playerMoney);
			this._roundBetInfo = {};
		},
		onSetGameDealer: function (dealerId, score, turns, gold) {
			if (dealerId != null) {
				this._dealerId = dealerId;
				var playerObj = this._players[dealerId];
				if (playerDataMgr.isMyself(dealerId)) this._setMeDealer(true);
				else this._setMeDealer(false);
				this.publish("game_baccarat.play.up_player_dealer", playerObj.nickName, playerObj.playerIcon, playerObj.roomCoin);
				if (playerDataMgr.isDealer()) this.publish("game_baccarat.command.set_dealer_button", "down");
				else this.publish("game_baccarat.command.set_dealer_button", "up");
			} else {
				this._dealerId = null;
				this._setMeDealer(false);
				this.publish("game_baccarat.play.up_com_dealer");
			}
			this.publish("game_baccarat.play.update_dealer_info", turns, score, gold);
		},
		onSetDealerList: function (waitList) {
			var infoList = [];
			var isWaiting = false;
			for (var i = 0; i < waitList.length; i++) {
				var playerObj = this._players[waitList[i]];
				var oneInfo = {};
				oneInfo.playerId = playerObj.playerId;
				oneInfo.playerIcon = playerObj.playerIcon;
				oneInfo.roomCoin = playerObj.roomCoin;
				oneInfo.nickName = playerObj.nickName;
				infoList.push(oneInfo);
				if (playerDataMgr.isMyself(playerObj.playerId)) isWaiting = true;
			}
			if (isWaiting) this.publish("game_baccarat.command.set_dealer_button", "cancel");
			else if (playerDataMgr.isDealer()) this.publish("game_baccarat.command.set_dealer_button", "down");
			else this.publish("game_baccarat.command.set_dealer_button", "up");
			this._waitDealerList = infoList;
			this.publish("game_baccarat.play.set_dealer_list", this._waitDealerList);
		},
		onDealerNotice: function (notice) {
			if (notice === 1) this._showFailMessage(Localization.dealerDown);
		},
		onChat: function (type, playerId, msg) {
			if (type === definition.CHAT_TYPE.SYSTEM) {
				this.publish("game_baccarat.play.chat_incomming", definition.CHAT_TYPE.SYSTEM, "系统", msg);
			} else {
				var playerObj = this._players[playerId];
				if (playerObj) {
					this.publish("game_baccarat.play.chat_incomming", type, playerObj.nickName, msg, playerObj.seatIdx);
					if (type === definition.CHAT_TYPE.EMOJI) {
						if (playerId === this._dealerId) this.publish("game_baccarat.play.player_send_emoji", "dealer", msg);
						else this.publish("game_baccarat.play.player_send_emoji", playerObj.seatIdx, msg);
					}
				}
			}
		},
		onShuffleStart: function (msgData) {
			this.publish("game_baccarat.play.shuffleCardStart", msgData.playerId, msgData.playerName, msgData.leftTime);
		},
		onSyncShuffleEnd: function (msgData) {
			this.publish("game_baccarat.play.update_card_count", msgData.allNum);
			this.publish("game_baccarat.play.shuffleCardEnd", msgData.par, msgData.cardValue, msgData.cardNum);
		},
		onSyncConfirmBet: function (msgData) {
			if (msgData.shouldFlyCard) {
				this.publish("game_baccarat.play.flycardAnimation");
			} else {
				this.publish("game_baccarat.play.lockBet");
			}
		},
		onSyncOtherConfirmBet: function (playerId) {
			var playerObj = this._players[playerId];
			this.publish("game_baccarat.seat.stopMaskClip", playerObj.seatIdx, false);
		},
		onSyncFlyCardJM: function (playerId) {
			this._isFlyCard = true;
			this.publish("game_baccarat.play.checkFlyCard", true);
		},
		onPlayerJoinRoom: function (msgData) {
			var playerObj = netTool.createObjFromProto(msgData.playerInfo);
			playerObj.seatIdx = msgData.seatIdx;
			playerObj.roomCoin = msgData.carryOnGold;
			msgData.clearSeatIdx = msgData.seatIdx == this._players[playerObj.playerId].seatIdx ? -1 : this._players[playerObj.playerId].seatIdx;
			this._players[playerObj.playerId] = playerObj;
			this._setPlayerList();
			var data = roomMgr.getChoose();
			if (data == undefined) return;
			data.playerNum = this._players.length;
			msgData.playerId = msgData.playerInfo.playerId;
			this.onPlayerSeatChanged(msgData);
		},
		onPlayerQuitRoom: function (playerId) {
			if (playerId in this._players) {
				var playerObj = this._players[playerId];
				if (playerObj.seatIdx != -1) this.publish("game_baccarat.play.set_player_out_seat", playerObj.seatIdx);
				if (this._dealerId != null && this._dealerId === playerId) {
					this._dealerId = null;
					this.publish("game_baccarat.play.down_player_dealer");
					this.publish("game_baccarat.play.up_com_dealer");
				}
				for (var index = 0; index < this._waitDealerList.length; index++) {
					var waitInfo = this._waitDealerList[index];
					if (waitInfo.playerId === playerId) {
						this._waitDealerList.splice(index, 1);
						this.publish("game_baccarat.play.set_dealer_list", this._waitDealerList);
						break;
					}
				}
				delete this._players[playerId];
				this._setPlayerList();
			}
			var data = roomMgr.getChoose();
			if (data == undefined) return;
			data.playerNum = this._players.length;
		}
	});
	return GameMgr;
});
gbx.define("game/baccarat/net/msg_receiver", ["gbx/net/messagecommand", "gbx/net/errorcode", "comm/helper/conf_mgr", "comm/helper/room_mgr", "comm/ui/top_message", "conf/ui_locallization", "gbx/hubs"], function (CMD, ERROR_CODE, confMgr, roomMgr, topMessage, uiLocallization, hubs) {
	var baccaratMsgReceiver = {
		_gameMgr: null,
		setGameMgr: function (gameMgr) {
			this._gameMgr = gameMgr;
		},
		_checkGameMgr: function (command) {
			if (this._gameMgr == null) {
				gbx.log("receive message has not gameMgr:" + command);
				return false;
			}
			return true;
		},
		onSendCard: function (command, data) {
			if (!this._checkGameMgr(command)) return;
			//var msgData = gtea.protobuf.decode("BaccaratSyncSendCard", data);
			var msgData = {};
			msgData.state = 4;
			msgData.bankerCard = data.BankerCards;
			msgData.farmerCard = data.PlayerCards;

			this._gameMgr.onSendCard(msgData.state, msgData.bankerCard, msgData.farmerCard, true);
		},
		onSendCardJM: function (command, data) {
			if (!this._checkGameMgr(command)) return;
			//var msgData = gtea.protobuf.decode("BaccaratSyncSendCardJM", data);
			var msgData = {};
			msgData.state = 4;
			msgData.leftTime = myGlobalData.currRoomData.RubCardIime; //剩余时间
			msgData.bankerCard = data.BankerCard; //庄家牌
			msgData.farmerCard = data.PlayerCard; //闲家牌
			msgData.bankerBetMax = myGlobalData.bankerBetMaxUserID; //庄家下注最多的玩家id
			msgData.farmerBetMax = myGlobalData.farmerBetMaxUserID; //闲家下注最多的玩家id
			msgData.sendCardSteps = [4, 5, 6, 7]; //阶段列表
			msgData.step2Send2 = true; //第二阶段庄闲同时发牌

			this._gameMgr.onSendCardJM(msgData);
		},
		onUpdateCardFlipProcess: function (command, data) {
			if (!this._checkGameMgr(command)) return;
			//var msgData = gtea.protobuf.decode("BaccaratSyncLookCardJM", data);
			var msgData = {};
			if (data.Index == -11) {
				this.onSyncChangeDirJM(command, data);
			} else {
				msgData.cardIndex = data.My; //牌index
				msgData.step = data.Type; //咪牌进度
				msgData.lookCardDir = data.Index; //咪牌方向
				msgData.playerId = undefined;
				msgData.radian = data.Mx / 100000000; //角度
				this._gameMgr.onSyncCardFlipProcess(msgData);
			}
		},
		onSyncOpenCardJM: function (command, data) {
			if (!this._checkGameMgr(command)) return;
			//var msgData = gtea.protobuf.decode("BaccaratSyncLookCardJM", data);
			hubs.publish("game_baccarat.play.card_timeout", 4);
		},
		onSyncOpenCardEXTJM: function (command, data) {
			if (!this._checkGameMgr(command)) return;
			//var msgData = gtea.protobuf.decode("BaccaratSyncLookCardJM", data);
			hubs.publish("game_baccarat.play.card_timeout", 5);
			hubs.publish("game_baccarat.play.card_timeout", 6);
			hubs.publish("game_baccarat.play.card_timeout", 7);
		},
		onSyncOpenCardOpenJM: function (command, data) {
			if (!this._checkGameMgr(command)) return;
			//var msgData = gtea.protobuf.decode("BaccaratSyncLookCardJM", data);
			hubs.publish("game_baccarat.play.card_timeout", 5);
			hubs.publish("game_baccarat.play.card_timeout", 6);
			hubs.publish("game_baccarat.play.card_timeout", 7);
		},
		onSyncLookCardEndJM: function (command, data) {
			if (!this._checkGameMgr(command)) return;
			var msgData = gtea.protobuf.decode("BaccaratSyncLookCardEndJM", data);
			this._gameMgr.onSyncLookCardEndJM(msgData);
		},
		onSyncChangeDirJM: function (command, data) {
			if (!this._checkGameMgr(command)) return;
			//var msgData = gtea.protobuf.decode("BaccaratSyncChangeDirJM", data);
			var msgData = {
				cardIndex: data.My,
				dir: data.Type
			};
			this._gameMgr.onSyncLookCardDir(msgData);
		},
		onSyncMiLookSound: function (command, data) {
			if (!this._checkGameMgr(command)) return;
			//var msgData = gtea.protobuf.decode("BaccaratSyncLookSoundJM", data);
			var msgData = { sound: data.ItemId + "" };
			this._gameMgr.onSyncMiLookSound(msgData);
		},
		onUserBet: function (command, data) {
			if (!this._checkGameMgr(command)) return;
			//var msgData = gtea.protobuf.decode("BaccaratSyncOnBet", data);
			var msgData = {};
			msgData.playerId = data.UserId;
			msgData.chipInfo = [{
				area: data.BetId + 1,
				money: parseInt(data.BetMoney) / 100
			}];
			if (data.UserId in this._gameMgr._players) {
				this._gameMgr._players[data.UserId].seatIdx = data.SeatId;
			}
			this._gameMgr.onUserBet(msgData.playerId, msgData.chipInfo, false);

			msgData.bankerBetMax = myGlobalData.bankerBetMaxUserID;
			msgData.farmerBetMax = myGlobalData.farmerBetMaxUserID;

			this._gameMgr.onGetUserMax(msgData.farmerBetMax, msgData.bankerBetMax);
		},
		onRemoveBet: function (command, data) {
			if (!this._checkGameMgr(command)) return;
			//var msgData = gtea.protobuf.decode("BaccaratSyncOnRemoveBet", data);
			var msgData = {};
			msgData.playerId = data.UserId; //撤销下注玩家id
			msgData.carryOnGold = parseInt(data.Money) / 100;
			msgData.bankerBetMax = myGlobalData.bankerBetMaxUserID; //庄家下注最多的玩家id
			msgData.farmerBetMax = myGlobalData.farmerBetMaxUserID; //闲家下注最多的玩家id
			this._gameMgr.onRemoveBet(msgData.playerId, msgData.carryOnGold);
			this._gameMgr.onGetUserMax(msgData.farmerBetMax, msgData.bankerBetMax);
		},
		onMark: function (command, data) {
			if (this._gameMgr == null) return;
			if (data.BetId == 0) {
				for (var playerID in this._gameMgr._players) {
					if (this._gameMgr._players[playerID].seatIdx == data.SeatId) {
						myGlobalData.bankerBetMaxUserID = parseInt(playerID);
						break;
					}
				}
			} else if (data.BetId == 1) {
				for (var playerID in this._gameMgr._players) {
					if (this._gameMgr._players[playerID].seatIdx == data.SeatId) {
						myGlobalData.farmerBetMaxUserID = parseInt(playerID);
						break;
					}
				}
			}
		},
		onSitDown: function (command, data) {
			var players = data.PlayerInfos;
			var pData = {};
			pData.playerId = players.UserID;
			pData.nickName = players.NickName;
			pData.sex = players.Gender;
			pData.roomCoin = 0;
			pData.level = players.Level;
			pData.vipLevel = players.VipLevel;
			pData.playerIcon = players.FaceID;
			pData.isRobot = true;
			pData.seatIdx = players.ChairID > 4 ? -1 : players.ChairID;
			this._gameMgr._players[pData.playerId] = pData;
		},
		onNewRound: function (command, data) {
			if (!this._checkGameMgr(command)) return;
			myGlobalData.bankerBetMaxUserID = undefined;
			myGlobalData.farmerBetMaxUserID = undefined;
			//var msgData = gtea.protobuf.decode("BaccaratSyncUserPut", data);
			var msgData = {};
			msgData.state = myGlobalData.currRoomData.state; //游戏状态
			msgData.leftSendCardTime = myGlobalData.currRoomData.BetTime; //发牌时间,新局要用全时间 
			msgData.leftCardNum = data.LeftCount; //剩余牌数
			this._gameMgr.onNewRound(msgData.state, msgData.leftSendCardTime);
		},
		onRoundResult: function (command, data) {
			if (!this._checkGameMgr(command)) return;
			//var msgData = gtea.protobuf.decode("BaccaratSyncGameResult", data);
			var msgData = {};

			msgData.state = 12; //游戏状态,结束状态
			if (myGlobalData.currPokeData != undefined) {
				msgData.bankerPair = myGlobalData.currPokeData.bankerPair; //庄对
				msgData.farmerPair = myGlobalData.currPokeData.farmerPair; //闲对
			}
			msgData.winType = data.WinnerType + 1;  //庄，闲，和
			msgData.bankerMoney = 5; //庄家钱
			msgData.bankerScore = 6; //庄家成绩
			msgData.bankerRounds = 7; //连庄次数

			msgData.playerMoney = []; //有金钱变动的玩家剩余钱金额 
			for (var i = 0; i < data.UserId.length; i++) {
				var playerData = {};
				playerData.playerId = data.UserId[i];
				playerData.carryOnGold = parseInt(data.TotalMoney[i]) / 100;
				//playerData.gold=parseInt(data.TotalMoney[i])/100
				msgData.playerMoney[i] = playerData;
			}

			this._gameMgr.onRoundResult(msgData.state, msgData.winType, msgData.bankerPair, msgData.farmerPair, msgData.bankerRounds, msgData.bankerScore, msgData.bankerMoney, msgData.playerMoney);
		},
		onShowedSeatChanged: function (command, data) {
			if (!this._checkGameMgr(command)) return;
			var msgData = gtea.protobuf.decode("BaccaratSyncOnSeat", data);
			this._gameMgr.onPlayerSeatChanged(msgData);
		},
		onDealerChanged: function (command, data) {
			if (!this._checkGameMgr(command)) return;
			var msgData = gtea.protobuf.decode("BaccaratSyncOnBanker", data);
			this._gameMgr.onSetGameDealer(msgData.newBankerId, msgData.bankerScore, msgData.bankerRounds, msgData.bankerMoney);
		},
		onDealerListChanged: function (command, data) {
			if (!this._checkGameMgr(command)) return;
			var msgData = gtea.protobuf.decode("BaccaratSyncBankerListChange", data);
			this._gameMgr.onSetDealerList(msgData.waitPlayerIdList);
		},
		onDealerNotice: function (command, data) {
			if (!this._checkGameMgr(command)) return;
			var msgData = gtea.protobuf.decode("BaccaratSyncBakerNotice", data);
			this._gameMgr.onDealerNotice(msgData.notice);
		},
		onPlayerJoinRoom: function (command, data) {
			if (!this._checkGameMgr(command)) return;
			if (data.ErrorCode == ERROR_CODE.OK) {
				var baccaratPlayer = {};

				baccaratPlayer.playerInfo = {};
				baccaratPlayer.playerInfo.playerId = data.UesrId;
				baccaratPlayer.playerInfo.nickName = data.UserName;
				baccaratPlayer.playerInfo.sex = 1;
				baccaratPlayer.playerInfo.roomCoin = 0;
				baccaratPlayer.playerInfo.level = 0;
				baccaratPlayer.playerInfo.vipLevel = 0;
				baccaratPlayer.playerInfo.playerIcon = this._gameMgr._players[data.UesrId].playerIcon;
				baccaratPlayer.playerInfo.isRobot = true;
				//新老椅子编号不对
				baccaratPlayer.seatIdx = data.SeatId - 1;
				baccaratPlayer.carryOnGold = parseInt(data.Money) / 100;
				//好像无用
				baccaratPlayer.areaBetAmount = [111, 222, 333, 444, 555, 666, 777];
				baccaratPlayer.chipInfo = [//庄
					{ area: 1, money: 11 },
					//闲
					{ area: 2, money: 22 },
					//和
					{ area: 3, money: 33 },
					//庄对
					{ area: 4, money: 44 },
					//闲对
					{ area: 5, money: 55 }
				];
				this._gameMgr.onPlayerJoinRoom(baccaratPlayer);
			}
		},
		onPlayerQuitRoom: function (command, data) {
			if (!this._checkGameMgr(command)) return;
			//var msgData = gtea.protobuf.decode("SyncPlayerQuit", data);
			this._gameMgr.onPlayerQuitRoom(data.UserID);
		},
		onChat: function (command, data) {
			if (!this._checkGameMgr(command)) return;
			var msgData = gtea.protobuf.decode("BaccaratSyncOnChat", data);
			this._gameMgr.onChat(msgData.type, msgData.playerId, msgData.content);
		},
		onShuffleStart: function (command, data) {
			if (!this._checkGameMgr(command)) return;
			var msgData = gtea.protobuf.decode("BaccaratSyncShuffleStart", data);
			this._gameMgr.onShuffleStart(msgData);
		},
		onSyncShuffleEnd: function (command, data) {
			if (!this._checkGameMgr(command)) return;
			var msgData = gtea.protobuf.decode("BaccaratSyncShuffleEnd", data);
			this._gameMgr.onSyncShuffleEnd(msgData);
		},
		onSyncConfirmBet: function (command, data) {
			if (!this._checkGameMgr(command)) return;
			var msgData = gtea.protobuf.decode("BaccaratSyncConfirmBet", data);
			this._gameMgr.onSyncConfirmBet(msgData);
		},
		onSyncOtherConfirmBet: function (command, data) {
			if (!this._checkGameMgr(command)) return;
			var msgData = gtea.protobuf.decode("BaccaratSyncOtherConfirmBet", data);
			this._gameMgr.onSyncOtherConfirmBet(msgData.playerId);
		},
		onSyncFlyCardJM: function (command, data) {
			if (!this._checkGameMgr(command)) return;
			//var msgData = gtea.protobuf.decode("BaccaratSyncFlyCardJM", data);
			var msgData = { playerId: data.UserId };
			this._gameMgr.onSyncFlyCardJM(msgData.playerId);
		},
		vipRoomEnd: function (command, data) {
			if (!this._checkGameMgr(command)) return;
			topMessage.post(uiLocallization.vip_room_end);
			Laya.timer.once(3e3, this, function () {
				hubs.publish("game_baccarat.command.exit");
			});
		}
	};
	return baccaratMsgReceiver;
});
gbx.define("game/baccarat/parts/baccarat_room_params", ["gbx/cclass", "comm/helper/conf_mgr"], function (Class, confMgr) {
	var RoomParam = Class.extend({
		init: function () {
			this._super();
		},
		getJMChipsPos: function () {
			var baseBankerPoints = [{
				x: 88,
				y: 600,
				r: 0
			}, {
				x: 123,
				y: 720,
				r: 0
			}, {
				x: 280,
				y: 765,
				r: 0
			}, {
				x: 505,
				y: 728,
				r: 0
			}, {
				x: 543,
				y: 600,
				r: 0
			}];
			var baseFarmerPoints = [{
				x: 32,
				y: 600,
				r: 0
			}, {
				x: 77,
				y: 770,
				r: 0
			}, {
				x: 280,
				y: 828,
				r: 0
			}, {
				x: 548,
				y: 785,
				r: 0
			}, {
				x: 604,
				y: 600,
				r: 0
			}];
			var baseDuecePoints = [{
				x: 246,
				y: 713,
				r: 0
			}, {
				x: 284,
				y: 713,
				r: 0
			}, {
				x: 320,
				y: 713,
				r: 0
			}, {
				x: 355,
				y: 713,
				r: 0
			}, {
				x: 392,
				y: 713,
				r: 0
			}];
			var baseBankerPairPoints = [{
				x: 441,
				y: 705,
				r: 0
			}, {
				x: 475,
				y: 681,
				r: 0
			}, {
				x: 492,
				y: 642,
				r: 0
			}, {
				x: 494,
				y: 597,
				r: 0
			}, {
				x: 494,
				y: 558,
				r: 0
			}];
			var baseFarmerPairPoints = [{
				x: 196,
				y: 706,
				r: 0
			}, {
				x: 165,
				y: 683,
				r: 0
			}, {
				x: 146,
				y: 641,
				r: 0
			}, {
				x: 143,
				y: 596,
				r: 0
			}, {
				x: 143,
				y: 558,
				r: 0
			}];
			return [baseBankerPoints, baseFarmerPoints, baseDuecePoints, baseBankerPairPoints, baseFarmerPairPoints];
		},
		getJMChipsWinPos: function () {
			var baseBankerPoints = [{
				x: 88,
				y: 565,
				r: 0
			}, {
				x: 150,
				y: 741,
				r: 0
			}, {
				x: 320,
				y: 765,
				r: 0
			}, {
				x: 477,
				y: 748,
				r: 0
			}, {
				x: 543,
				y: 565,
				r: 0
			}];
			var baseFarmerPoints = [{
				x: 32,
				y: 565,
				r: 0
			}, {
				x: 114,
				y: 799,
				r: 0
			}, {
				x: 320,
				y: 828,
				r: 0
			}, {
				x: 505,
				y: 808,
				r: 0
			}, {
				x: 604,
				y: 565,
				r: 0
			}];
			var baseDuecePoints = [{
				x: 246,
				y: 681,
				r: 0
			}, {
				x: 284,
				y: 681,
				r: 0
			}, {
				x: 320,
				y: 681,
				r: 0
			}, {
				x: 355,
				y: 681,
				r: 0
			}, {
				x: 392,
				y: 681,
				r: 0
			}];
			var baseBankerPairPoints = [{
				x: 426,
				y: 677,
				r: 0
			}, {
				x: 445,
				y: 657,
				r: 0
			}, {
				x: 462,
				y: 630,
				r: 0
			}, {
				x: 460,
				y: 593,
				r: 0
			}, {
				x: 460,
				y: 556,
				r: 0
			}];
			var baseFarmerPairPoints = [{
				x: 214,
				y: 677,
				r: 0
			}, {
				x: 191,
				y: 657,
				r: 0
			}, {
				x: 181,
				y: 630,
				r: 0
			}, {
				x: 180,
				y: 593,
				r: 0
			}, {
				x: 180,
				y: 556,
				r: 0
			}];
			return [baseBankerPoints, baseFarmerPoints, baseDuecePoints, baseBankerPairPoints, baseFarmerPairPoints];
		},
		getBetOnPos: function () {
			var bankerArray = [185, 790, 134, 769, 92, 731, 70, 682, 68, 540, 117, 538, 117, 655, 136, 699, 162, 725, 203, 741, 299, 741, 358, 743, 435, 742, 480, 723, 507, 692, 522, 654, 522, 538, 569, 538, 566, 684, 546, 725, 512, 764, 464, 788, 360, 791, 289, 791];
			var farmerArray = [170, 849, 117, 835, 69, 801, 32, 758, 11, 688, 11, 539, 57, 540, 58, 678, 81, 738, 126, 780, 172, 800, 465, 799, 502, 787, 538, 761, 566, 724, 582, 675, 581, 541, 625, 541, 627, 682, 614, 733, 584, 789, 547, 822, 482, 851];
			var dueceArray = [428, 730, 362, 730, 280, 731, 213, 729, 231, 695, 276, 677, 318, 667, 363, 677, 409, 695];
			var bankerPairArray = [513, 540, 512, 625, 508, 659, 492, 692, 464, 716, 433, 731, 414, 696, 425, 624, 441, 578, 481, 539];
			var farmerPairArray = [203, 729, 167, 715, 140, 686, 127, 640, 126, 582, 127, 539, 160, 540, 205, 573, 223, 612, 223, 695];
			return [bankerArray, farmerArray, dueceArray, bankerPairArray, farmerPairArray];
		}
	});
	return new RoomParam;
});
gbx.define("game/baccarat/parts/bet_panel", ["gbx/render/display/sprite", "comm/base/command_ui", "comm/ui/sound_button", "comm/helper/conf_mgr", "comm/helper/room_mgr", "comm/helper/playerdata_mgr", "comm/ui/ui_utils", "conf/ui_locallization"], function (Sprite, BaseUI, Button, confMgr, roomMgr, playerDataMgr, uiUtils, uiLocallization) {
	var baseX = 98;
	var deltaX = 97;
	var baseY = 55;
	var baseScale = 1.3;
	var betPricePos = [{
		x: baseX,
		y: baseY
	}, {
		x: baseX + deltaX,
		y: baseY
	}, {
		x: baseX + deltaX * 2,
		y: baseY
	}, {
		x: baseX + deltaX * 3,
		y: baseY
	}, {
		x: baseX + deltaX * 4,
		y: baseY
	}];
	var BetPanel = BaseUI.extend({
		init: function () {
			this._super();
			this._selectingBetIdx = 0;
			this._enabled = false;
			var shadow = new Sprite;
			shadow.setImage("assets/baccarat/tex/chip_shadow.png");
			shadow.pos(0, 0);
			this.addChild(shadow);
			var wWidth = shadow.width;
			this.chipArray = playerDataMgr.getChipArray();
			var betMin = roomMgr.getChoose().bankerFarmerBetMin;
			var chipPriceList = confMgr.setting.betPrice;
			var betPriceToIconList = confMgr.setting.betPriceToIcon;
			var priceList = [];
			for (var i = 0; i < chipPriceList.length; i++) {
				if (priceList.length < this.chipArray.length) {
					if (chipPriceList[i] >= betMin) priceList.push(chipPriceList[i]);
				}
			}
			for (var i = chipPriceList.length - 1; i >= 0; i--) {
				if (priceList.length < this.chipArray.length) {
					if (chipPriceList[i] < betMin) priceList.unshift(chipPriceList[i]);
				}
			}
			this._array = [1, 1, 1, 1, 1];
			for (var i = 0; i < this.chipArray.length; i++) {
				this.chipArray[i].price = priceList[i];
				this.chipArray[i].index = betPriceToIconList[priceList[i]];
				var chipBtn = new Button;
				chipBtn.setSkinImage("assets/baccarat/tex/chips/chip" + (this.chipArray[i].index + 1) + ".png");
				chipBtn.stateNum = 1;
				chipBtn.pivotToCenter();
				chipBtn.labelColors = "#ffffff";
				chipBtn.labelStroke = 2;
				chipBtn.labelStrokeColor = "#000000";
				chipBtn.pos(betPricePos[i].x, betPricePos[i].y);
				chipBtn.scale(baseScale);
				chipBtn.setClickHandler(this, this._selectedBetChange, i);
				if (this._array[i] == 0) chipBtn.gray = true;
				chipBtn.name = "chip_" + i;
				this.addChild(chipBtn);
			}
			var selectedBet = new Sprite;
			selectedBet.setImage("assets/baccarat/tex/mark_choosechip.png");
			selectedBet.pivotToCenter();
			selectedBet.pos(betPricePos[0].x, betPricePos[0].y);
			selectedBet.name = "selected_halo";
			selectedBet.visible = false;
			this.addChild(selectedBet);
			var cancelBtn = this.CreateSimpleButton("assets/main/public/button_10.png", 2, "cancelBtn");
			cancelBtn.pos(-30, 100);
			cancelBtn.setClickHandler(this, this.cancelBet);
			this.addChild(cancelBtn);
			var s = this.createSprite(cancelBtn, "assets/main/public/cancelBtnG.png");
			s.pos(60, 12);
			var sureBtn = this.CreateSimpleButton("assets/main/public/button_11.png", 1, "sureBtn");
			var sureWidth = sureBtn.width;
			sureBtn.pos(wWidth + 30 - sureWidth, 100);
			sureBtn.setClickHandler(this, this.confirmBet);
			this.addChild(sureBtn);
			s = this.createSprite(sureBtn, "assets/main/public/sureBtnG.png");
			s.pos(sureWidth - 60 - 72, 12);
			this.check();
			this.setChooseLimit(this.chipArray);
			this.subscribe("game_baccarat.betsetting.setChooseLimit", this, this.setChooseLimit);
		},
		createSprite: function (node, path) {
			var sp = new Sprite;
			node.addChild(sp);
			sp.setImage(path);
			sp.pos(50, 15);
			return sp;
		},
		CreateSimpleButton: function (path, stateNum, btnName) {
			var btn = new Button;
			btn.setSkinImage(path);
			btn.stateNum = stateNum;
			btn.pos(0, 0);
			btn.name = btnName;
			return btn;
		},
		get selectingBetIdx() {
			return this._selectingBetIdx;
		},
		get enabled() {
			return this._enabled;
		},
		set enabled(v) {
			this._enabled = v;
			this.getChildByName("selected_halo").visible = v;
			if (!v) {
				this.getChildByName("chip_0").gray = !v;
				this.getChildByName("chip_1").gray = !v;
				this.getChildByName("chip_2").gray = !v;
				this.getChildByName("chip_3").gray = !v;
				this.getChildByName("chip_4").gray = !v;
				this.getChildByName("cancelBtn").gray = !v;
				this.getChildByName("sureBtn").gray = !v;
			} else {
				this.check();
				if (this._array[0] == 1) this.getChildByName("chip_0").gray = !v;
				if (this._array[1] == 1) this.getChildByName("chip_1").gray = !v;
				if (this._array[2] == 1) this.getChildByName("chip_2").gray = !v;
				if (this._array[3] == 1) this.getChildByName("chip_3").gray = !v;
				if (this._array[4] == 1) this.getChildByName("chip_4").gray = !v;
				var oldSelectState = false;
				if (this._selectingBetIdx < this._array.length) {
					if (this._array[this._selectingBetIdx] == 1) {
						oldSelectState = true;
						this._selectPos(this._selectingBetIdx);
					}
				}
				var mark = 0;
				for (var index = 0; index < this._array.length; index++) {
					if (this._array[index] == 1) {
						if (!oldSelectState) this._selectPos(index);
						mark = 1;
						break;
					}
				}
				if (mark == 0) {
					this.getChildByName("selected_halo").visible = !v;
					this._selectingBetIdx = -1;
				}
				this.getChildByName("cancelBtn").gray = !v;
				this.getChildByName("sureBtn").gray = !v;
			}
		},
		check: function () {
			for (var i = 0; i < this.chipArray.length; i++) {
				if (playerDataMgr.getMyCarryGold() >= this.chipArray[i].price) {
					this._array[i] = 1;
				} else {
					this._array[i] = 0;
				}
			}
		},
		_selectedBetChange: function (btn, idx) {
			if (!this._enabled) {
				return;
			}
			if (this._array[idx] == 0) return;
			if (idx != this._selectingBetIdx) {
				this._selectingBetIdx = idx;
				this.getChildByName("selected_halo").pos(betPricePos[idx].x, betPricePos[idx].y);
				var soundName = this.chipArray[this._selectingBetIdx].price;
				uiUtils.playSound(soundName, 1);
			}
		},
		_selectPos: function (idx) {
			this._selectingBetIdx = idx;
			this.getChildByName("selected_halo").pos(betPricePos[idx].x, betPricePos[idx].y);
		},
		_doubleBetDown: function () {
			if (!this._enabled) {
				return;
			}
			this.runCommand("double_putchip");
		},
		_repeatBetDown: function () {
			if (!this._enabled) {
				return;
			}
			this.runCommand("repeat_putchip");
		},
		confirmBet: function () {
			if (!this._enabled) return;
			this.publish("game_baccarat.command.confirmBet");
		},
		cancelBet: function (btn) {
			if (!this._enabled) return;
			this.publish("game_baccarat.command.cancelBet");
		},
		setChooseLimit: function (data) {
			this.chipArray = data;
			this.check();
			if (this._enabled) {
				for (var index = 0; index < 5; index++) {
					this.getChildByName("chip_" + index).gray = false;
				}
			}
			for (var index = 0; index < 5; index++) {
				this.getChildByName("chip_" + index).setSkinImage("assets/baccarat/tex/chips/chip" + (this.chipArray[index].index + 1) + ".png");
				if (this._array[index] == 1) { } else {
					this.getChildByName("chip_" + index).gray = true;
				}
			}
			this._selectPos(0);
		}
	});
	return BetPanel;
});
gbx.define("game/baccarat/parts/card", ["comm/base/poker_card"], function (PokerCard) {
	var Card = PokerCard.extend({
		set cardValue(value) {
			if (value == undefined || value == this._value) {
				return;
			}
			var color = value & 255,
				point = value >> 8;
			if (color == 3) {
				color = 4;
			} else if (color == 4) {
				color = 3;
			}
			if (point == 14 || point == 15) {
				point = 1;
			}
			this._setCardValue(value, point, color);
		},
		get cardValue() {
			return this._value;
		}
	});
	Card.getPoint = function (value) {
		return value >> 8;
	};
	return Card;
});
gbx.define("game/baccarat/parts/card_mi", ["game/baccarat/parts/card", "gbx/render/display/sprite", "gbx/render/tween"], function (Card, Sprite, Tween) {
	var cWidth = 213;
	var cHalfWidth = 106.5;
	var cHeight = 296;
	var cHalfHeight = 148;
	var wMask = 2e3;
	var CardMI = Card.extend({
		init: function () {
			this._super();
			this._dir = "v";
			this._dirLock = false;
			this._complete = false;
			this._isToPlayer = false;
			this._mouseDownPos = null;
			this._lastProgress = 0;
			this._fixedProgress = 0;
			this._backSp.alpha = 0;
			this._faceSp.alpha = 0;
			var mask = new Sprite;
			mask.size(wMask, wMask);
			mask.pivot(wMask / 2, wMask);
			mask.pos(-cHalfWidth, cHalfHeight);
			mask.name = "mask";
			mask.graphics.drawRect(0, 0, wMask, wMask, "#000000");
			var maskContainer = new Sprite;
			maskContainer.size(cWidth, cHeight);
			maskContainer.pos(cHalfWidth, cHalfHeight);
			maskContainer.pivotToCenter();
			maskContainer.mask = mask;
			maskContainer.name = "container";
			this.addChild(maskContainer);
			var back = new Sprite;
			back.setImage("assets/main/card/cardback.png");
			back.pivotToCenter();
			back.pos(cHalfWidth, cHalfHeight);
			back.name = "back";
			maskContainer.addChild(back);
			var face = new Sprite;
			face.setImage("assets/main/card/cardback.png");
			face.pos(0, 0);
			face.name = "face";
			maskContainer.addChild(face);
			var faceHide = new Sprite;
			faceHide.setImage("assets/main/card/faceHide.png");
			faceHide.pos(0, 0);
			face.addChild(faceHide);
		},
		set cardValue(value) {
			this.reset();
			if (value == undefined || value == this._value) {
				return;
			}
			var color = value & 255,
				point = value >> 8;
			if (color == 3) {
				color = 4;
			} else if (color == 4) {
				color = 3;
			}
			if (point == 14 || point == 15) {
				point = 1;
			}
			this._setCardValue(value, point, color);
			this._setMiFace(point, color);
		},
		_setMiFace: function (point, color) {
			var imgSrc = "assets/main/card/" + point + "_" + color + ".png";
			this.getChildByName("container", "face").setImage(imgSrc);
		},
		setDirection: function (direction, rotate) {
			this._dir = direction;
			var face = this.getChildByName("container", "face");
			var mask = this.getChildByName("container").mask;
			if (direction === "h") {
				if (rotate) this.rotation = 90;
				face.pos(cWidth, cHeight);
				face.pivot(0, cHeight);
				face.rotation = 0;
				mask.graphics.clear();
				mask.pos(cHalfWidth, cHalfHeight);
				mask.rotation = 0;
				mask.size(wMask, wMask);
				mask.pivot(wMask, wMask / 2);
				mask.graphics.drawRect(0, 0, wMask, wMask, "#000000");
			} else if (direction === "v") {
				if (rotate) this.rotation = 0;
				face.pos(0, cHeight);
				face.pivot(0, 0);
				face.rotation = 0;
				mask.graphics.clear();
				mask.pos(-cHalfWidth, cHalfHeight);
				mask.rotation = 0;
				mask.size(wMask, wMask);
				mask.pivot(wMask / 2, wMask);
				mask.graphics.drawRect(0, 0, wMask, wMask, "#000000");
			}
		},
		setDirectionEx: function (direction) {
			if (this._dir === direction) return;
			this.setDirection(direction, true);
		},
		setLock: function (v) {
			this._dirLock = v;
		},
		getLock: function () {
			return this._dirLock;
		},
		setMouseDownPos: function (v) {
			this._mouseDownPos = v;
			if (v != null) this._fixedProgress = this._lastProgress;
		},
		getMouseDownPos: function () {
			return this._mouseDownPos;
		},
		isComplete: function () {
			return this._complete;
		},
		setToPlayer: function (v) {
			this._isToPlayer = v;
		},
		isToPlayer: function () {
			return this._isToPlayer;
		},
		flipProcess: function (progress, radian) {
			if (this._complete) return null;
			progress += this._fixedProgress;
			var angle = 180 / Math.PI * radian;
			var face = this.getChildByName("container", "face");
			var mask = this.getChildByName("container").mask;
			face.visible = true;
			mask.rotation = angle;
			face.rotation = angle * 2;
			if (this._dir === "h") {
				mask.x = cHalfWidth - progress;
				var dy = progress + Math.cos(radian * 2) * progress;
				var dx = Math.sin(radian * 2) * progress;
				face.x = cWidth - dy;
				face.y = cHeight - dx;
				if (dy > cWidth * 1.2) this.finishMiFun(false);
				if (dx > cHeight * 1.2) this.finishMiFun(false);
			} else {
				mask.y = cHalfHeight - progress;
				var dy = progress + Math.cos(radian * 2) * progress;
				var dx = Math.sin(radian * 2) * progress;
				face.x = 0 + dx;
				face.y = cHeight - dy;
				if (dy > cHeight * 1.2) this.finishMiFun(false);
				if (dx > cWidth * 1.2) this.finishMiFun(false);
			}
			this._lastProgress = progress;
			return [progress, radian];
		},
		realMove: function (deltaX, deltaY) {
			if (deltaY >= 0) deltaY = 0;
			var PI2 = Math.PI * .5;
			var PIA = Math.PI / 3;
			var radian = 0;
			if (deltaX > 0) {
				radian = Math.atan(-deltaY / deltaX);
				radian = PI2 - radian;
			}
			radian = radian > PIA ? PIA : radian;
			var delta = Math.sqrt(deltaY * deltaY + deltaX * deltaX);
			var progress = Math.ceil(delta * .4);
			return this.flipProcess(progress, radian);
		},
		finishMiFun: function (isTimeOut) {
			this._complete = true;
			this._backSp.alpha = 1;
			this._faceSp.alpha = 1;
			this.getChildByName("container").visible = false;
			if (this._isToPlayer) {
				this.flipToFace();
				if (!isTimeOut) this.publish("game_baccarat.player.lookOneCardEnd", this.name);
			} else {
				if (isTimeOut) {
					this.flipToFace1();
				} else {
					this.flipToFace1(this, function () {
						this.publish("game_baccarat.player.lookOneCardEnd", this.name);
					});
				}
			}
			return false;
		},
		flipToFace: function (context, endCallback) {
			this._backSp.visible = false;
			this._faceSp.visible = true;
		},
		flipToFace1: function (context, endCallback) {
			this._backSp.visible = true;
			this._faceSp.visible = false;
			this.horizonFlip(1, 200, context, endCallback);
		},
		flyToWithTimeMI: function (x, y, scaleFrom, scaleTo, rotationFrom, rotationTo, time) {
			this.setScale(scaleFrom);
			this._scale = scaleTo;
			if (rotationFrom != null && rotationTo != null) {
				this.rotation = rotationFrom;
				this.tweenTo({
					x: x,
					y: y,
					scaleX: scaleTo,
					scaleY: scaleTo,
					rotation: rotationTo
				}, time, Tween.TimingFunction.sineOut, null, null);
			} else {
				this.tweenTo({
					x: x,
					y: y,
					scaleX: scaleTo,
					scaleY: scaleTo
				}, time, Tween.TimingFunction.sineOut, null, null);
			}
		},
		reset: function () {
			this.getChildByName("container").visible = true;
			this.getChildByName("container", "face").visible = false;
			this._backSp.alpha = 0;
			this._faceSp.alpha = 0;
			this._dirLock = false;
			this._complete = false;
			this._isToPlayer = false;
			this._mouseDownPos = null;
			this._lastProgress = 0;
			this._fixedProgress = 0;
		},
		hideContainer: function () {
			this.getChildByName("container").visible = false;
			this._backSp.alpha = 1;
			this._faceSp.alpha = 1;
		}
	});
	return CardMI;
});
gbx.define("game/baccarat/parts/card_place", ["gbx/render/display/sprite", "gbx/render/display/text", "game/baccarat/parts/card", "comm/helper/sound_mgr", "comm/helper/room_mgr", "comm/helper/conf_mgr", "comm/ui/ui_utils"], function (Sprite, Text, Card, soundMgr, roomMgr, confMgr, uiUtils) {
	var cardPosY = 48;
	var baseScale = .3;
	var startPos = [224, -16];
	var endPos = [-208, 0];
	var tarPosX = [42, 108, 186];
	var deltaY3 = 14;
	var smallPointX = {
		x: 160,
		y: 8
	};
	var CardPlace = Sprite.extend({
		init: function (param) {
			this._super();
			this.cardData;
			for (var i = 1; i < 4; i++) {
				var card = new Card;
				card.pivotToCenter();
				card.pos(30 * (i - 1), cardPosY);
				card.setScale(baseScale);
				card.name = "card" + i;
				card.visible = false;
				this.addChild(card);
			}
			var pointBg = uiUtils.createSprite("assets/baccarat/tex/pointBG.png", "point");
			var text = uiUtils.createSimpleText("0", "text");
			text.pos(-2, 12);
			text.fontSize = 24;
			text.color = "#000000";
			text.width = 50;
			text.align = "center";
			text.bold = true;
			pointBg.scale(.7);
			pointBg.addChild(text);
			pointBg.pivotToCenter();
			pointBg.visible = false;
			this.addChild(pointBg);
			pointBg.pos(-smallPointX.x, smallPointX.y);
			if (param.indexOf("bank") != -1) pointBg.pos(smallPointX.x, smallPointX.y);
		},
		_simpGetPoint: function () {
			var cardValue = 0;
			for (var i = 0; i < arguments.length; i++) cardValue += Math.min(10, Card.getPoint(arguments[i]));
			return cardValue % 10;
		},
		sendCard: function (cardNum, doAnimation, car1, car2, car3) {
			this.setCardData(car1, car2, car3);
			var card1 = this.getChildByName("card1"),
				card2 = this.getChildByName("card2"),
				card3 = this.getChildByName("card3");
			var point = this.getChildByName("point");
			var dir = -1;
			if (this.name.indexOf("bank") != -1) dir = -dir;
			card1.cardValue = car1;
			card1.pivotToCenter();
			card2.cardValue = car2;
			card2.pivotToCenter();
			var who = "";
			if (this.name.indexOf("bank") != -1) who = "banker";
			else who = "farmer";
			var fixIndex = 0;
			if (who == "farmer") fixIndex = 1;
			if (myGlobalData.isLHD) {
				who += "LHD";
			}
			if (doAnimation) {
				card1.showBack();
				card1.pos(startPos[0], startPos[1]);
				card1.visible = true;
				this.parent.minusElapseCardCount();
				var baseDelay = 900;
				uiUtils.playSound(who, 1);
				soundMgr.playSE("assets/baccarat/se/sendcard.mp3");
				var pointValue = this._simpGetPoint(car1);
				card1.flyToAndScaleWithTime(tarPosX[(0 + fixIndex) % 2] * dir, cardPosY, 0, baseScale, 300, this, function () {
					card1.flipToFace();
					point.visible = true;
					point.getChildByName("text").text = pointValue;
				});
				if (!myGlobalData.isLHD) {
					this.timerOnce(baseDelay * 2, this, function () {
						card2.showBack();
						card2.pos(startPos[0], startPos[1]);
						card2.visible = true;
						this.parent.minusElapseCardCount();
						uiUtils.playSound(who, 1);
						soundMgr.playSE("assets/baccarat/se/sendcard.mp3");
						pointValue = this._simpGetPoint(car1, car2);
						card2.flyToAndScaleWithTime(tarPosX[(1 + fixIndex) % 2] * dir, cardPosY, 0, baseScale, 300, this, function () {
							card2.flipToFace();
							point.visible = true;
							point.getChildByName("text").text = pointValue;
						});
					});
				}
				var card3DelayTime = baseDelay * 4;
				if (this.name.indexOf("bank") != -1) {
					if (cardNum == 5) card3DelayTime = baseDelay * 3;
				}
				var definition = confMgr.read("baccarat/dat/definition.json");
				this.timerOnce(card3DelayTime, this, function () {
					if (car3) {
						var data = roomMgr.getChoose();
						if (data == undefined) return;
						var soundName = "";
						if (this.name.indexOf("bank") != -1) {
							soundName = "zhui_jia_banker";
						} else {
							soundName = "zhui_jia_farmer";
						}
						uiUtils.playSound(soundName, 1);
					}
				});
				this.timerOnce(card3DelayTime, this, function () {
					if (car3) {
						card3.cardValue = car3;
						card3.pivotToCenter();
						card3.pos(startPos[0], startPos[1]);
						card3.showBack();
						card3.visible = true;
						card3.rotation = 90;
						this.parent.minusElapseCardCount();
						pointValue = this._simpGetPoint(car1, car2, car3);
						soundMgr.playSE("assets/baccarat/se/sendcard.mp3");
						card3.flyToAndScaleWithTime(tarPosX[2] * dir, cardPosY + deltaY3, 0, baseScale, 300, this, function () {
							card3.flipToFace();
							point.visible = true;
							point.getChildByName("text").text = pointValue;
						});
					}
				});
			} else {
				this.parent.minusElapseCardCount();
				card1.visible = true;
				card1.pos(tarPosX[(0 + fixIndex) % 2] * dir, cardPosY);
				card1.showFace();
				this.parent.minusElapseCardCount();
				card2.visible = true;
				card2.pos(tarPosX[(1 + fixIndex) % 2] * dir, cardPosY);
				card2.showFace();
				var pointValue = this._simpGetPoint(car1, car2);
				if (car3) {
					this.parent.minusElapseCardCount();
					card3.cardValue = car3;
					card3.pivotToCenter();
					card3.pos(tarPosX[2] * dir, cardPosY + deltaY3);
					card3.visible = true;
					card3.rotation = 90;
					card3.showFace();
					pointValue = this._simpGetPoint(car1, car2, car3);
				}
				point.visible = true;
				point.getChildByName("text").text = pointValue;
			}
		},
		setCardData: function (car1, car2, car3) {
			this.cardData = [];
			this.cardData.push(car1);
			this.cardData.push(car2);
			if (car3) this.cardData.push(car3);
		},
		getCardData: function () {
			return this.cardData;
		},
		getValue: function () {
			if (this.cardData.length == 2) return this._simpGetPoint(this.cardData[0], this.cardData[1]);
			else if (this.cardData.length == 3) return this._simpGetPoint(this.cardData[0], this.cardData[1], this.cardData[2]);
			return 0;
		},
		clear: function () {
			this.getChildByName("card1").visible = false;
			this.getChildByName("card2").visible = false;
			this.getChildByName("card3").visible = false;
			this.getChildByName("point").visible = false;
		},
		recycleCard: function () {
			var card1 = this.getChildByName("card1"),
				card2 = this.getChildByName("card2"),
				card3 = this.getChildByName("card3");
			this.getChildByName("point").visible = false;
			if (card1.visible) card1.flyToAndScaleWithTime(0, cardPosY, baseScale, baseScale, 600, this, function () {
				this.timerOnce(500, this, function () {
					card1.flyToAndScaleWithTime(endPos[0], endPos[1], baseScale, 0, 400, this);
				});
			});
			if (card2.visible) card2.flyToAndScaleWithTime(0, cardPosY, baseScale, baseScale, 600, this, function () {
				this.timerOnce(500, this, function () {
					card2.flyToAndScaleWithTime(endPos[0], endPos[1], baseScale, 0, 400, this);
				});
			});
			if (card3.visible) {
				card3.rotation = 0;
				card3.flyToAndScaleWithTime(0, cardPosY, baseScale, baseScale, 600, this, function () {
					this.timerOnce(500, this, function () {
						card3.flyToAndScaleWithTime(endPos[0], endPos[1], baseScale, 0, 400, this);
					});
				});
			}
		}
	});
	return CardPlace;
});
gbx.define("game/baccarat/parts/card_place_mi", ["conf/system", "gbx/net/messagecommand", "gbx/net/errorcode", "gbx/net/errorcode_des", "gbx/net/connector", "comm/base/game_ui", "gbx/render/display/sprite", "gbx/render/display/text", "gbx/render/ui/button", "comm/ui/sound_button", "game/baccarat/parts/card", "game/baccarat/parts/card_mi", "comm/helper/sound_mgr", "comm/helper/conf_mgr", "conf/ui_locallization", "comm/ui/ui_utils"], function (sys, CMD, ERROR_CODE, ERROR_CODE_DES, server, BaseUI, Sprite, Text, BaseButton, Button, Card, CardMi, soundMgr, confMgr, uiLocallization, uiUtils) {
	var cardPosY = 48;
	var startPos = [224, -16];
	var endPos = [-208, 0];
	var tarPosX = [42, 108, 75];
	var tarPosY = [14, 14, 92];
	var baseSeatPos = [{
		x: -149,
		y: 125
	}, {
		x: -149,
		y: 270
	}, {
		x: 0,
		y: 410
	}, {
		x: 149,
		y: 270
	}, {
		x: 149,
		y: 125
	}];
	var seatPos = [];
	var lookCardDis = 160;
	var lookCardDisSmall = 48;
	var baseScale = .3;
	var bigScale = 1;
	var smallScale = .32;
	var smallPointX = {
		x: 160,
		y: -20
	};
	var skipX = 72;
	var CardPlace = BaseUI.extend({
		init: function () {
			this._super();
			this._playEnd = true;
			this._centerCardFarmer = [];
			this._centerCardBanker = [];
			this._focusedCard = null;
			this._farmerPointArray = [];
			this._bankerPointArray = [];
			this._farmerSeatIdx = -1;
			this._bankerSeatIdx = -1;
			this._lookCardArr = null;
			this._lookCardSide = confMgr.definition.LOOKCARD_SIDE.NONE;
			this._leftLookCardTime = 0;
			this._lastLookCardTime = null;
			this._lookCardEndName = {};
			this._sendCardSteps = null;
			this._lookCardSideNum = 0;
			this._step2Send2 = false;
			var Names = ["farmer_", "banker_"];
			for (var i = 0; i < 2; i++) {
				var pointBg = uiUtils.createSprite("assets/baccarat/tex/pointBG.png", Names[i] + "point");
				var text = uiUtils.createSimpleText("0", "text");
				text.pos(-2, 12);
				text.fontSize = 24;
				text.color = "#000000";
				text.width = 50;
				text.align = "center";
				text.bold = true;
				pointBg.addChild(text);
				pointBg.pivotToCenter();
				pointBg.visible = false;
				pointBg.scale(.7);
				this.addChild(pointBg);
				smallPointX.x = smallPointX.x * -1;
				pointBg.pos(smallPointX.x, smallPointX.y);
			}
			seatPos = [];
			for (var i = 0; i < baseSeatPos.length; i++) seatPos.push(baseSeatPos[i]);
			var btn = new BaseButton;
			btn.pos(-sys.halfWidth, -130);
			btn.size(sys.width, sys.height);
			btn.on(this.EVENT.MOUSE_DOWN, this, this.onMouseDown);
			btn.on(this.EVENT.MOUSE_MOVE, this, this.onMouseMove);
			btn.on(this.EVENT.MOUSE_UP, this, this.onMouseUp);
			btn.visible = false;
			btn.name = "boundryArea";
			this.addChild(btn);
			for (var i = 1; i < 7; i++) {
				var card_mi = new CardMi;
				card_mi.pivotToCenter();
				card_mi.pos(0, 10);
				card_mi.scale(baseScale);
				card_mi.zOrder = 1;
				card_mi.name = "card_center_" + i;
				if (i < 4) this._centerCardFarmer.push(card_mi);
				else this._centerCardBanker.push(card_mi);
				card_mi.visible = false;
				this.addChild(card_mi);
			}
			var btnX = [baseSeatPos[2].x - lookCardDis, baseSeatPos[2].x + lookCardDis, baseSeatPos[2].x];
			var btnY = baseSeatPos[2].y;
			for (var i = 1; i <= 3; i++) {
				var btn = uiUtils.createButton("assets/baccarat/tex/mi_circle.png", 1, "spin_btn_" + i);
				btn.alpha = .9;
				btn.zOrder = 2;
				btn.pos(btnX[i - 1], btnY);
				btn.pivotToCenter();
				btn.visible = false;
				btn.setClickHandler(this, this.onClickSpin, i);
				this.addChild(btn);
				var sp = new Sprite;
				sp.setImage("assets/baccarat/tex/mi_bian.png");
				sp.name = "under_bian_horizonl_" + i;
				sp.alpha = .9;
				sp.zOrder = 2;
				sp.pos(btnX[i - 1], btnY + 85);
				sp.pivotToCenter();
				sp.visible = false;
				this.addChild(sp);
				sp = new Sprite;
				sp.setImage("assets/baccarat/tex/mi_bian2.png");
				sp.name = "under_bian_verticle_" + i;
				sp.alpha = .9;
				sp.zOrder = 2;
				sp.pos(btnX[i - 1], btnY + 126);
				sp.pivotToCenter();
				sp.visible = false;
				this.addChild(sp);
			}
			var flipBtn = uiUtils.createButton("assets/baccarat/tex/flip_btn_farmer.png", 2, "flipBtn");
			var flipBtn_text = uiUtils.createSimpleText("0", "text");
			flipBtn_text.width = 50;
			flipBtn_text.pos(18, 40);
			flipBtn_text.fontSize = 25;
			var filter = new laya.filters.GlowFilter("#222222", 1, 1, 1);
			flipBtn_text.filters = [filter];
			flipBtn_text.align = "center";
			flipBtn.addChild(flipBtn_text);
			flipBtn.pos(70, 175);
			flipBtn.visible = false;
			flipBtn.zOrder = 3;
			flipBtn.setClickHandler(this, this.onClickFlipBtn);
			this.addChild(flipBtn);
			var topFlipBtn = uiUtils.createButton("assets/baccarat/tex/skip_btn_banker.png", 2, "topFlipBtn");
			topFlipBtn.name = "topFlipBtn";
			topFlipBtn.pivotToCenter();
			topFlipBtn.zOrder = 2;
			topFlipBtn.visible = false;
			topFlipBtn.pos(-skipX, 90);
			topFlipBtn.setClickHandler(this, this.onClickTopFlipBtn);
			this.addChild(topFlipBtn);
			this.subscribe("game_baccarat.play.update_card_progress", this, this.eventUpdateCardProgress);
			this.subscribe("game_baccarat.play.update_card_direction", this, this.eventUpdateCardDirection);
			this.subscribe("game_baccarat.play.card_timeout", this, this.eventCardTimeOut);
			this.subscribe("game_baccarat.player.lookOneCardEnd", this, this.eventLookOneCardEnd);
			this.timerLoop(1e3, this, function () {
				var label = this.getChildByName("flipBtn", "text");
				this._leftLookCardTime -= 1;
				this._leftLookCardTime = this._leftLookCardTime < 0 ? 0 : this._leftLookCardTime;
				var nCount = this._leftLookCardTime;
				if (nCount >= 10) label.text = nCount;
				else label.text = "0" + nCount;
			});
		},
		_getCardIndexByCardName: function (name) {
			switch (name) {
				case "card_center_1":
					return 0;
				case "card_center_2":
					return 2;
				case "card_center_3":
					return 4;
				case "card_center_4":
					return 1;
				case "card_center_5":
					return 3;
				case "card_center_6":
					return 5;
				default:
					return 0;
			}
		},
		_getCardByCardIndex: function (cardIndex) {
			switch (cardIndex) {
				case 0:
					return this._centerCardFarmer[0];
				case 1:
					return this._centerCardBanker[0];
				case 2:
					return this._centerCardFarmer[1];
				case 3:
					return this._centerCardBanker[1];
				case 4:
					return this._centerCardFarmer[2];
				case 5:
					return this._centerCardBanker[2];
				default:
					return null;
			}
		},
		_getButtonIndexByCardName: function (cardName) {
			switch (cardName) {
				case "card_center_1":
				case "card_center_4":
					return 1;
				case "card_center_2":
				case "card_center_5":
					return 2;
				case "card_center_3":
				case "card_center_6":
					return 3;
				default:
					return 0;
			}
		},
		_simpGetPoint: function () {
			var cardValue = 0;
			if (myGlobalData.isLHD) {
				cardValue = Card.getPoint(arguments[0]);
				if (cardValue == 14) cardValue = 1;
				return cardValue;
			}
			for (var i = 0; i < arguments.length; i++) cardValue += Math.min(10, Card.getPoint(arguments[i]));
			return cardValue % 10;
		},
		reorderSeats: function (seatArr) {
			var newSeatPos = [];
			for (var i = 0; i < baseSeatPos.length; i++) newSeatPos.push(null);
			for (var i = 0; i < seatArr.length; i++) {
				var seatIdx = seatArr[i];
				newSeatPos[seatIdx] = baseSeatPos[i];
			}
			seatPos = newSeatPos;
		},
		set BoundArea(v) {
			this.getChildByName("boundryArea").visible = v;
		},
		get BoundArea() {
			return this.getChildByName("boundryArea");
		},
		getFarmerPointArr: function () {
			return this._farmerPointArray;
		},
		getBankerPointArr: function () {
			return this._bankerPointArray;
		},
		getFarmerValue: function () {
			if (this._farmerPointArray.length == 1) return this._simpGetPoint(this._farmerPointArray[0]);
			if (this._farmerPointArray.length == 2) return this._simpGetPoint(this._farmerPointArray[0], this._farmerPointArray[1]);
			if (this._farmerPointArray.length == 3) return this._simpGetPoint(this._farmerPointArray[0], this._farmerPointArray[1], this._farmerPointArray[2]);
		},
		getBankerValue: function () {
			if (this._bankerPointArray.length == 1) return this._simpGetPoint(this._bankerPointArray[0]);
			if (this._bankerPointArray.length == 2) return this._simpGetPoint(this._bankerPointArray[0], this._bankerPointArray[1]);
			if (this._bankerPointArray.length == 3) return this._simpGetPoint(this._bankerPointArray[0], this._bankerPointArray[1], this._bankerPointArray[2]);
		},
		sendCardProcess: function (step, radian, cardIndex) {
			var sendData = gtea.protobuf.encode("RequestFlipAction", {
				Index: this._sendCardSteps[0],
				Type: step,
				Mx: parseInt(radian * 100000000),
				My: cardIndex
			}, 150, 8);
			server.sendToRoom(CMD.BaccaratSyncLookCardJM, sendData);
		},
		sendCardDirection: function (cardIndex, direction) {
			var sendData = gtea.protobuf.encode("RequestFlipAction", {
				Index: -11,
				Type: direction,
				Mx: 0,
				My: cardIndex
			}, 150, 8);
			server.sendToRoom(CMD.BaccaratSyncChangeDirJM, sendData);
		},
		sendOpenCard: function () {
			var sendData = gtea.protobuf.encode("RequestFlipCard", {
				Type: 0
			}, 150, 7);
			server.sendToRoom(CMD.BaccaratOpenCardJM, sendData);
		},
		sendOpenCardWithStep: function (step) {
			var sendData = gtea.protobuf.encode("RequestOpenCard", {
				CardIndex: 0
			}, 150, 10);
			server.sendToRoom(CMD.BaccaratOpenCardOpenJM, sendData);
		},
		eventUpdateCardProgress: function (step, radian, cardIndex, lookCardDir, isMyself) {
			var card = this._getCardByCardIndex(cardIndex);
			if (!isMyself) card.flipProcess(step, radian);
			if (this._lookCardSide != confMgr.definition.LOOKCARD_SIDE.NONE) this._disableButtonByCardName(card.name);
		},
		eventUpdateCardDirection: function (step, cardIndex, lookCardDir) {
			var card = this._getCardByCardIndex(cardIndex);
			if (lookCardDir == 0) card.setDirection("v", true);
			else card.setDirection("h", true);
			if (this._lookCardSide != confMgr.definition.LOOKCARD_SIDE.NONE) {
				var index = this._getButtonIndexByCardName(card.name);
				if (index != 0) {
					if (this._lookCardSide == confMgr.definition.LOOKCARD_SIDE.FARMER) {
						if (cardIndex == 1 || cardIndex == 3 || cardIndex == 5) return;
					}
					if (this._lookCardSide == confMgr.definition.LOOKCARD_SIDE.BANKER) {
						if (cardIndex == 0 || cardIndex == 2 || cardIndex == 4) return;
					}
					if (lookCardDir == 0) this.enableVertSetting(index);
					else this.enableHoriSetting(index);
				}
			}
		},
		eventCardTimeOut: function (step) {
			if (this._sendCardSteps == null) return;
			if (step == this._sendCardSteps[0]) {
				this.disableFaceButtons(1, 2, 3);
				this.disableSpinBtns(1, 2, 3);
				this.disableFlipBtn();
				this.disableTopFlipBtn();
				this.BoundArea = false;
				this._focusedCard = null;
				this.publish("game_baccarat.play.setSoundPanel", false);
				this.publish("game_baccarat.seat.stopMaskClip", -1, true);
			} else {
				this.disableTopFlipBtn();
			}
			var farmer_point = this.getChildByName("farmer_point");
			var banker_point = this.getChildByName("banker_point");
			switch (step) {
				case confMgr.definition.BaccaratSendCardStepJM.FarmerFirst:
					var isBanker = false;
					var card1 = this._centerCardFarmer[0];
					var card2 = this._centerCardFarmer[1];
					if (this._farmerSeatIdx == -1 && this._bankerSeatIdx != -1) {
						isBanker = true;
						card1 = this._centerCardBanker[0];
						card2 = this._centerCardBanker[1];
					}
					if (!card1.isComplete()) card1.finishMiFun(true);
					if (!card2.isComplete()) card2.finishMiFun(true);
					if (card1.isToPlayer()) {
						card1.setDirectionEx("v");
						card2.setDirectionEx("v");
						this.timerOnce(400, this, function () {
							this.backToCenter(isBanker, false);
						});
					}
					this.timerOnce(400, this, function () {
						if (isBanker) {
							this.publish("game_baccarat.play.flip_top_card_jm", true, false, this._bankerPointArray);
							banker_point.visible = true;
							banker_point.getChildByName("text").text = this._simpGetPoint(this._bankerPointArray[0], this._bankerPointArray[1]);
						} else {
							this.publish("game_baccarat.play.flip_top_card_jm", false, false, this._farmerPointArray);
							farmer_point.visible = true;
							farmer_point.getChildByName("text").text = this._simpGetPoint(this._farmerPointArray[0], this._farmerPointArray[1]);
						}
						this.parent.minusElapseCardCount();
						this.parent.minusElapseCardCount();
					});
					break;
				case confMgr.definition.BaccaratSendCardStepJM.BankerFirst:
					var isBanker = true;
					var card1 = this._centerCardBanker[0];
					var card2 = this._centerCardBanker[1];
					if (this._farmerSeatIdx == -1 && this._bankerSeatIdx != -1) {
						isBanker = false;
						card1 = this._centerCardFarmer[0];
						card2 = this._centerCardFarmer[1];
					}
					if (!card1.isComplete()) card1.finishMiFun(true);
					if (!card2.isComplete()) card2.finishMiFun(true);
					if (card1.isToPlayer()) {
						card1.setDirectionEx("v");
						card2.setDirectionEx("v");
						this.timerOnce(400, this, function () {
							this.backToCenter(isBanker, false);
						});
					}
					this.timerOnce(400, this, function () {
						if (isBanker) {
							this.publish("game_baccarat.play.flip_top_card_jm", true, false, this._bankerPointArray);
							banker_point.visible = true;
							banker_point.getChildByName("text").text = this._simpGetPoint(this._bankerPointArray[0], this._bankerPointArray[1]);
						} else {
							this.publish("game_baccarat.play.flip_top_card_jm", false, false, this._farmerPointArray);
							farmer_point.visible = true;
							farmer_point.getChildByName("text").text = this._simpGetPoint(this._farmerPointArray[0], this._farmerPointArray[1]);
						}
						this.parent.minusElapseCardCount();
						this.parent.minusElapseCardCount();
					});
					break;
				case confMgr.definition.BaccaratSendCardStepJM.FarmerSecond:
					if (!this._centerCardFarmer[2].isComplete()) this._centerCardFarmer[2].finishMiFun(true);
					if (this._centerCardFarmer[2].isToPlayer()) {
						this.timerOnce(400, this, function () {
							this.backToCenter(false, true);
						});
					}
					this.timerOnce(400, this, function () {
						this.publish("game_baccarat.play.flip_top_card_jm", false, true, this._farmerPointArray);
						this.parent.minusElapseCardCount();
						farmer_point.visible = true;
						farmer_point.getChildByName("text").text = this._simpGetPoint(this._farmerPointArray[0], this._farmerPointArray[1], this._farmerPointArray[2]);
					});
					break;
				case confMgr.definition.BaccaratSendCardStepJM.BankerSecond:
					if (!this._centerCardBanker[2].isComplete()) this._centerCardBanker[2].finishMiFun(true);
					if (this._centerCardBanker[2].isToPlayer()) {
						this.timerOnce(400, this, function () {
							this.backToCenter(true, true);
						});
					}
					this.timerOnce(400, this, function () {
						this.publish("game_baccarat.play.flip_top_card_jm", true, true, this._bankerPointArray);
						this.parent.minusElapseCardCount();
						banker_point.visible = true;
						banker_point.getChildByName("text").text = this._simpGetPoint(this._bankerPointArray[0], this._bankerPointArray[1], this._bankerPointArray[2]);
					});
					break;
				case confMgr.definition.BaccaratSendCardStepJM.Finish:
					break;
			}
		},
		eventLookOneCardEnd: function (cardName) {
			this._lookCardEndName[cardName] = 1;
			switch (cardName) {
				case "card_center_1":
					if (this._lookCardSide != confMgr.definition.LOOKCARD_SIDE.FARMER) break;
					if ("card_center_2" in this._lookCardEndName) this.sendOpenCard();
					break;
				case "card_center_2":
					if (this._lookCardSide != confMgr.definition.LOOKCARD_SIDE.FARMER) break;
					if ("card_center_1" in this._lookCardEndName) this.sendOpenCard();
					break;
				case "card_center_3":
					if (this._lookCardSide != confMgr.definition.LOOKCARD_SIDE.FARMER) break;
					this.sendOpenCard();
					break;
				case "card_center_4":
					if (this._lookCardSide != confMgr.definition.LOOKCARD_SIDE.BANKER) break;
					if ("card_center_5" in this._lookCardEndName) this.sendOpenCard();
					break;
				case "card_center_5":
					if (this._lookCardSide != confMgr.definition.LOOKCARD_SIDE.BANKER) break;
					if ("card_center_4" in this._lookCardEndName) this.sendOpenCard();
					break;
				case "card_center_6":
					if (this._lookCardSide != confMgr.definition.LOOKCARD_SIDE.BANKER) break;
					this.sendOpenCard();
					break;
				default:
					break;
			}
		},
		_getFocusedCard: function () {
			function _checkPos() {
				if (Laya.stage.mouseX < sys.halfWidth) return 0;
				else return 1;
			}
			switch (this._sendCardSteps[0]) {
				case confMgr.definition.BaccaratSendCardStepJM.FarmerFirst:
					var ret = _checkPos();
					return this._centerCardFarmer[ret];
				case confMgr.definition.BaccaratSendCardStepJM.FarmerSecond:
					return this._centerCardFarmer[2];
				case confMgr.definition.BaccaratSendCardStepJM.BankerFirst:
					var ret = _checkPos();
					return this._centerCardBanker[ret];
				case confMgr.definition.BaccaratSendCardStepJM.BankerSecond:
					return this._centerCardBanker[2];
				default:
					return null;
			}
		},
		_chooseFocusedCard: function () {
			function _checkPos() {
				if (Laya.stage.mouseX < sys.halfWidth) return 0;
				else return 1;
			}
			switch (this._sendCardSteps[0]) {
				case confMgr.definition.BaccaratSendCardStepJM.FarmerFirst:
				case confMgr.definition.BaccaratSendCardStepJM.BankerFirst:
					var ret = _checkPos();
					this._focusedCard = this._lookCardArr[ret];
					break;
				case confMgr.definition.BaccaratSendCardStepJM.FarmerSecond:
				case confMgr.definition.BaccaratSendCardStepJM.BankerSecond:
					this._focusedCard = this._lookCardArr[2];
					break;
				default:
					this._focusedCard = null;
					break;
			}
			return this._focusedCard;
		},
		_getMousePos: function () {
			var pos = {};
			pos.x = Laya.stage.mouseX;
			pos.y = Laya.stage.mouseY;
			return pos;
		},
		onMouseDown: function (event) {
			var card = this._chooseFocusedCard();
			if (card) {
				card.setLock(true);
				card.setMouseDownPos(this._getMousePos());
				if (this._lookCardSide != confMgr.definition.LOOKCARD_SIDE.NONE) this._disableButtonByCardName(card.name);
			}
		},
		onMouseMove: function (event) {
			var card = this._focusedCard;
			if (card) {
				var mouseDownPos = card.getMouseDownPos();
				var curPos = this._getMousePos();
				if (mouseDownPos == null) {
					mouseDownPos = curPos;
					card.setMouseDownPos(curPos);
				}
				var deltaY = curPos.y - mouseDownPos.y;
				var deltaX = curPos.x - mouseDownPos.x;
				var canSend = false;
				var curTime = (new Date).getTime();
				if (this._lastLookCardTime == null) {
					canSend = true;
				} else {
					var deltaTime = curTime - this._lastLookCardTime;
					if (deltaTime > 150) canSend = true;
				}
				var result = card.realMove(deltaX, deltaY);
				if (canSend && result != null) {
					this.sendCardProcess(result[0], result[1], this._getCardIndexByCardName(card.name));
					this._lastLookCardTime = curTime;
				}
			}
		},
		onMouseUp: function (event) {
			if (this._focusedCard != null) {
				this._focusedCard.setMouseDownPos(null);
				this._focusedCard = null;
			}
		},
		enableHoriSetting: function () {
			for (var i = 0; i < arguments.length; i++) {
				this.getChildByName("under_bian_horizonl_" + arguments[i]).visible = true;
				this.getChildByName("under_bian_verticle_" + arguments[i]).visible = false;
			}
		},
		enableVertSetting: function () {
			for (var i = 0; i < arguments.length; i++) {
				this.getChildByName("under_bian_horizonl_" + arguments[i]).visible = false;
				this.getChildByName("under_bian_verticle_" + arguments[i]).visible = true;
			}
		},
		disableFaceButtons: function () {
			for (var i = 0; i < arguments.length; i++) {
				this.getChildByName("under_bian_horizonl_" + arguments[i]).visible = false;
				this.getChildByName("under_bian_verticle_" + arguments[i]).visible = false;
			}
		},
		enableSpinBtns: function () {
			for (var i = 0; i < arguments.length; i++) this.getChildByName("spin_btn_" + arguments[i]).visible = true;
		},
		disableSpinBtns: function () {
			for (var i = 0; i < arguments.length; i++) this.getChildByName("spin_btn_" + arguments[i]).visible = false;
		},
		onClickSpin: function (btn, index) {
			var card = this._lookCardArr[index - 1];
			if (card.getLock()) return;
			if (card.rotation == 0) this.sendCardDirection(this._getCardIndexByCardName(card.name), 90);
			else this.sendCardDirection(this._getCardIndexByCardName(card.name), 0);
		},
		enableFlipBtn: function (time) {
			var flipBtn = this.getChildByName("flipBtn");
			this.BoundArea = time > 0;
			if (this._lookCardSide != confMgr.definition.LOOKCARD_SIDE.NONE) {
				flipBtn.visible = true;
				if (this._lookCardSide == confMgr.definition.LOOKCARD_SIDE.FARMER) flipBtn.setSkinImage("assets/baccarat/tex/flip_btn_farmer.png");
				else if (this._lookCardSide == confMgr.definition.LOOKCARD_SIDE.BANKER) flipBtn.setSkinImage("assets/baccarat/tex/flip_btn_banker.png");
				var label = this.getChildByName("flipBtn", "text");
				if (time == 0) flipBtn.visible = false;
				if (time >= 10) label.text = time;
				else label.text = "0" + time;
				this._leftLookCardTime = time;
			}
		},
		disableFlipBtn: function () {
			this.getChildByName("flipBtn").visible = false;
			this._leftLookCardTime = 0;
		},
		onClickFlipBtn: function (btn) {
			this.sendOpenCard();
		},
		enableTopFlipBtn: function (isFarmer) {
			var btn = this.getChildByName("topFlipBtn");
			btn.visible = true;
			if (isFarmer) {
				btn.x = -skipX;
				btn.setSkinImage("assets/baccarat/tex/skip_btn_farmer.png");
			} else {
				btn.x = skipX;
				btn.setSkinImage("assets/baccarat/tex/skip_btn_banker.png");
			}
		},
		disableTopFlipBtn: function () {
			this.getChildByName("topFlipBtn").visible = false;
		},
		onClickTopFlipBtn: function (btn) {
			if (this._sendCardSteps != null) {
				this.sendOpenCardWithStep(this._sendCardSteps[1]);
			}
		},
		_disableButtonByCardName: function (cardName) {
			var index = this._getButtonIndexByCardName(cardName);
			if (index != 0) {
				this.disableSpinBtns(index);
				this.disableFaceButtons(index);
			}
		},
		_setLookCard: function (myLookSide) {
			this._lookCardArr = null;
			this._lookCardSide = myLookSide;
			if (myLookSide == confMgr.definition.LOOKCARD_SIDE.FARMER) this._lookCardArr = this._centerCardFarmer;
			else if (myLookSide == confMgr.definition.LOOKCARD_SIDE.BANKER) this._lookCardArr = this._centerCardBanker;
		},
		_setCenterCardDirAndProgress: function (card, direction, step, radian) {
			if (direction == 0) card.setDirection("v", true);
			else card.setDirection("h", true);
			card.setToPlayer(true);
			card.setScale(bigScale);
			card.flipProcess(step, radian);
		},
		_moveCenterCard: function (card, isToPlayer, fromPos, toPos, fromScale, toScale, fromRotation, toRotation, time) {
			card.visible = true;
			card.setToPlayer(isToPlayer);
			var tarX = toPos[0];
			var tarY = toPos[1];
			var curX = card.x;
			var curY = card.y;
			var delta = Math.pow(tarX - curX, 2) + Math.pow(tarY - curY, 2);
			if (delta < .01) time = 0;
			if (time == 0) {
				card.pos(toPos[0], toPos[1]);
				card.setScale(toScale);
				if (toRotation != null) card.rotation = toRotation;
			} else {
				if (fromPos != null) card.pos(fromPos[0], fromPos[1]);
				card.flyToWithTimeMI(toPos[0], toPos[1], fromScale, toScale, fromRotation, toRotation, time);
			}
		},
		_initSendCardCenterWithAnimation: function () {
			for (var i = 0; i < 3; i++) {
				var dir = "v";
				if (i == 2) {
					if (this._farmerPointArray.length <= 2) continue;
					dir = "h";
				}
				var card = this._centerCardFarmer[i];
				card.cardValue = this._farmerPointArray[i];
				card.reset();
				card.setScale(baseScale);
				card.setDirection(dir, true);
				card.showBack();
				card.visible = false;
			}
			for (var i = 0; i < 3; i++) {
				var dir = "v";
				if (i == 2) {
					if (this._bankerPointArray.length <= 2) continue;
					dir = "h";
				}
				var card = this._centerCardBanker[i];
				card.cardValue = this._bankerPointArray[i];
				card.reset();
				card.setScale(baseScale);
				card.setDirection(dir, true);
				card.showBack();
				card.visible = false;
			}
		},
		_sendCardCenterWithAnimation: function (farmerArray, bankerArray, step, farmerSeatIdx, bankerSeatIdx, leftTime) {
			switch (step) {
				case confMgr.definition.BaccaratSendCardStepJM.FarmerFirst:
					this.publish("game_baccarat.play.set_top_card_jm", false, 0, farmerArray);
					this.publish("game_baccarat.play.set_top_card_jm", true, 0, bankerArray);
					this._initSendCardCenterWithAnimation();
					soundMgr.playSE("assets/baccarat/se/sendcard.mp3");
					this._moveCenterCard(this._centerCardFarmer[0], false, startPos, [tarPosX[1] * -1, tarPosY[1]], 0, baseScale, null, null, 200);
					if (!myGlobalData.isLHD) {
						this.timerOnce(800, this, function () {
							soundMgr.playSE("assets/baccarat/se/sendcard.mp3");
							this._moveCenterCard(this._centerCardFarmer[1], false, startPos, [tarPosX[0] * -1, tarPosY[0]], 0, baseScale, null, null, 200);
						});
					}
					this.timerOnce(400, this, function () {
						soundMgr.playSE("assets/baccarat/se/sendcard.mp3");
						this._moveCenterCard(this._centerCardBanker[0], false, startPos, [tarPosX[0], tarPosY[0]], 0, baseScale, null, null, 200);
					});
					if (!myGlobalData.isLHD) {
						this.timerOnce(1200, this, function () {
							soundMgr.playSE("assets/baccarat/se/sendcard.mp3");
							this._moveCenterCard(this._centerCardBanker[1], false, startPos, [tarPosX[1], tarPosY[1]], 0, baseScale, null, null, 200);
						});
					}
					var card1 = null;
					var card2 = null;
					var seatIdx = -1;
					var isMe = false;
					myGlobalData.isMySide = false;
					if (farmerSeatIdx != -1) {
						card1 = this._centerCardFarmer[0];
						card2 = this._centerCardFarmer[1];
						seatIdx = farmerSeatIdx;
						if (this._lookCardSide == confMgr.definition.LOOKCARD_SIDE.FARMER) {
							isMe = true;
							myGlobalData.isMySide = true;
						}
					} else if (bankerSeatIdx != -1) {
						card1 = this._centerCardBanker[0];
						card2 = this._centerCardBanker[1];
						seatIdx = bankerSeatIdx;
						if (this._lookCardSide == confMgr.definition.LOOKCARD_SIDE.BANKER) {
							isMe = true;
							myGlobalData.isMySide = true;
						}
					}
					if (seatIdx != -1) {
						this.timerOnce(1200, this, function () {
							card1.setDirection("h", false);
							card2.setDirection("h", false);
							var pos = seatPos[seatIdx];
							if (isMe) {
								this._moveCenterCard(card1, true, null, [pos.x - lookCardDis, pos.y], baseScale, bigScale, 0, 90, 400);
								if (!myGlobalData.isLHD) {
									this._moveCenterCard(card2, true, null, [pos.x + lookCardDis, pos.y], baseScale, bigScale, 0, 90, 400);
								}
							} else {
								this._moveCenterCard(card1, true, null, [pos.x - lookCardDisSmall, pos.y], baseScale, smallScale, 0, 90, 400);
								if (!myGlobalData.isLHD) {
									this._moveCenterCard(card2, true, null, [pos.x + lookCardDisSmall, pos.y], baseScale, smallScale, 0, 90, 400);
								}
							}
						});
						if (isMe) {
							this.timerOnce(1600, this, function () {
								if (myGlobalData.isLHD) {
									this.enableSpinBtns(1);
									this.enableHoriSetting(1);
								} else {
									this.enableSpinBtns(1, 2);
									this.enableHoriSetting(1, 2);
								}
								this.enableFlipBtn(leftTime - 2);
								if (this._lookCardSideNum == 1) {
									if (this._lookCardSide == confMgr.definition.LOOKCARD_SIDE.FARMER) this.enableTopFlipBtn(false);
									else this.enableTopFlipBtn(true);
								}
							});
						} else {
							this.timerOnce(1600, this, function () {
								this.publish("game_baccarat.play.setSoundPanel", true, step);
								this.publish("game_baccarat.seat.startMaskClip", seatIdx, leftTime - 2);
							});
						}
					}
					break;
				case confMgr.definition.BaccaratSendCardStepJM.BankerFirst:
					if (farmerSeatIdx != -1 && bankerSeatIdx != -1) {
						this.publish("game_baccarat.play.set_top_card_jm", false, 1, farmerArray);
						this.publish("game_baccarat.play.set_top_card_jm", true, 0, bankerArray);
						this._centerCardBanker[0].setDirection("h", false);
						this._centerCardBanker[1].setDirection("h", false);
						var pos = seatPos[bankerSeatIdx];
						if (this._lookCardSide == confMgr.definition.LOOKCARD_SIDE.BANKER) {
							this._moveCenterCard(this._centerCardBanker[0], true, null, [pos.x - lookCardDis, pos.y], baseScale, bigScale, 0, 90, 400);
							this._moveCenterCard(this._centerCardBanker[1], true, null, [pos.x + lookCardDis, pos.y], baseScale, bigScale, 0, 90, 400);
						} else {
							this._moveCenterCard(this._centerCardBanker[0], true, null, [pos.x - lookCardDisSmall, pos.y], baseScale, smallScale, 0, 90, 400);
							this._moveCenterCard(this._centerCardBanker[1], true, null, [pos.x + lookCardDisSmall, pos.y], baseScale, smallScale, 0, 90, 400);
						}
						if (this._lookCardSide == confMgr.definition.LOOKCARD_SIDE.BANKER) {
							this.timerOnce(400, this, function () {
								this.enableSpinBtns(1, 2);
								this.enableHoriSetting(1, 2);
								this.enableFlipBtn(leftTime - 1);
							});
						} else {
							this.timerOnce(400, this, function () {
								this.publish("game_baccarat.play.setSoundPanel", true, step);
								this.publish("game_baccarat.seat.startMaskClip", bankerSeatIdx, leftTime - 1);
							});
						}
					}
					break;
				case confMgr.definition.BaccaratSendCardStepJM.FarmerSecond:
					if (this._sendCardSteps[1] == confMgr.definition.BaccaratSendCardStepJM.Finish) {
						this.publish("game_baccarat.play.set_top_card_jm", false, 2, farmerArray);
						this.publish("game_baccarat.play.set_top_card_jm", true, 3, bankerArray);
					} else {
						if (this._step2Send2) {
							this.publish("game_baccarat.play.set_top_card_jm", false, 2, farmerArray);
							this.publish("game_baccarat.play.set_top_card_jm", true, 2, bankerArray);
							this._moveCenterCard(this._centerCardBanker[2], false, startPos, [tarPosX[2], tarPosY[2]], 0, baseScale, null, null, 400);
							if (this._lookCardSide == confMgr.definition.LOOKCARD_SIDE.FARMER) this.timerOnce(400, this, this.enableTopFlipBtn, [false]);
						} else {
							this.publish("game_baccarat.play.set_top_card_jm", false, 2, farmerArray);
							this.publish("game_baccarat.play.set_top_card_jm", true, 1, bankerArray);
						}
					}
					soundMgr.playSE("assets/baccarat/se/sendcard.mp3");
					uiUtils.playSound("farmer_need_more", 1);
					this._centerCardFarmer[2].setDirection("h", false);
					if (farmerSeatIdx == -1) {
						this._moveCenterCard(this._centerCardFarmer[2], false, startPos, [tarPosX[2] * -1, tarPosY[2]], 0, baseScale, null, null, 200);
					} else {
						var pos = seatPos[farmerSeatIdx];
						if (this._lookCardSide == confMgr.definition.LOOKCARD_SIDE.FARMER) this._moveCenterCard(this._centerCardFarmer[2], true, startPos, [pos.x, pos.y], baseScale, bigScale, null, null, 400);
						else this._moveCenterCard(this._centerCardFarmer[2], true, startPos, [pos.x, pos.y], baseScale, smallScale, null, null, 400);
						if (this._lookCardSide == confMgr.definition.LOOKCARD_SIDE.FARMER) {
							this.timerOnce(400, this, function () {
								this.enableSpinBtns(3);
								this.enableHoriSetting(3);
								this.enableFlipBtn(leftTime - 1);
							});
						} else {
							this.timerOnce(400, this, function () {
								this.publish("game_baccarat.play.setSoundPanel", true, step);
								this.publish("game_baccarat.seat.startMaskClip", farmerSeatIdx, leftTime - 1);
							});
						}
					}
					break;
				case confMgr.definition.BaccaratSendCardStepJM.BankerSecond:
					if (this._sendCardSteps[1] == confMgr.definition.BaccaratSendCardStepJM.Finish) {
						this.publish("game_baccarat.play.set_top_card_jm", false, 3, farmerArray);
						this.publish("game_baccarat.play.set_top_card_jm", true, 2, bankerArray);
					} else {
						if (this._step2Send2) {
							this.publish("game_baccarat.play.set_top_card_jm", false, 2, farmerArray);
							this.publish("game_baccarat.play.set_top_card_jm", true, 2, bankerArray);
							this._moveCenterCard(this._centerCardFarmer[2], false, startPos, [tarPosX[2] * -1, tarPosY[2]], 0, baseScale, null, null, 400);
							if (this._lookCardSide == confMgr.definition.LOOKCARD_SIDE.BANKER) this.timerOnce(400, this, this.enableTopFlipBtn, [true]);
						} else {
							this.publish("game_baccarat.play.set_top_card_jm", false, 1, farmerArray);
							this.publish("game_baccarat.play.set_top_card_jm", true, 2, bankerArray);
						}
					}
					soundMgr.playSE("assets/baccarat/se/sendcard.mp3");
					uiUtils.playSound("banker_need_more", 1);
					this._centerCardBanker[2].setDirection("h", false);
					if (bankerSeatIdx == -1) {
						this._moveCenterCard(this._centerCardBanker[2], false, startPos, [tarPosX[2], tarPosY[2]], 0, baseScale, null, null, 200);
					} else {
						var pos = seatPos[bankerSeatIdx];
						if (this._lookCardSide == confMgr.definition.LOOKCARD_SIDE.BANKER) this._moveCenterCard(this._centerCardBanker[2], true, startPos, [pos.x, pos.y], baseScale, bigScale, null, null, 400);
						else this._moveCenterCard(this._centerCardBanker[2], true, startPos, [pos.x, pos.y], baseScale, smallScale, null, null, 400);
						if (this._lookCardSide == confMgr.definition.LOOKCARD_SIDE.BANKER) {
							this.timerOnce(400, this, function () {
								this.enableSpinBtns(3);
								this.enableHoriSetting(3);
								this.enableFlipBtn(leftTime - 1);
							});
						} else {
							this.timerOnce(400, this, function () {
								this.publish("game_baccarat.play.setSoundPanel", true, step);
								this.publish("game_baccarat.seat.startMaskClip", bankerSeatIdx, leftTime - 1);
							});
						}
					}
					break;
				case confMgr.definition.BaccaratSendCardStepJM.Finish:
					this._leftLookCardTime = 0;
					break;
			}
		},
		_initSendCardCenter: function (sideName, stage, showThird) {
			function _setOneCard(card, value, x, y, showFace, dir, visible) {
				card.cardValue = value;
				card.reset();
				card.setScale(baseScale);
				if (showFace) {
					card.showFace();
					card.hideContainer();
				} else {
					card.showBack();
				}
				card.pos(x, y);
				card.setDirection(dir, true);
				card.visible = visible;
			}
			var cardArray = this._centerCardFarmer;
			var pointArray = this._farmerPointArray;
			var dir = -1;
			if (sideName === "banker") {
				cardArray = this._centerCardBanker;
				pointArray = this._bankerPointArray;
				dir = 1;
			}
			cardArray[0].cardValue = pointArray[0];
			cardArray[1].cardValue = pointArray[1];
			if (pointArray.length == 3) cardArray[2].cardValue = pointArray[2];
			var fixIndex = 0;
			if (sideName === "farmer") {
				fixIndex = 1;
			}
			if (stage == 0) {
				_setOneCard(cardArray[0], pointArray[0], tarPosX[(0 + fixIndex) % 2] * dir, tarPosY[(0 + fixIndex) % 2], false, "v", true);
				_setOneCard(cardArray[1], pointArray[1], tarPosX[(1 + fixIndex) % 2] * dir, tarPosY[(1 + fixIndex) % 2], false, "v", true);
				if (pointArray.length >= 3) _setOneCard(cardArray[2], pointArray[2], tarPosX[2] * dir, tarPosY[2], false, "h", false);
			} else if (stage == 1) {
				_setOneCard(cardArray[0], pointArray[0], tarPosX[(0 + fixIndex) % 2] * dir, tarPosY[(0 + fixIndex) % 2], true, "v", true);
				_setOneCard(cardArray[1], pointArray[1], tarPosX[(1 + fixIndex) % 2] * dir, tarPosY[(1 + fixIndex) % 2], true, "v", true);
				if (pointArray.length >= 3) _setOneCard(cardArray[2], pointArray[2], tarPosX[2] * dir, tarPosY[2], false, "h", false);
			} else if (stage == 2) {
				_setOneCard(cardArray[0], pointArray[0], tarPosX[(0 + fixIndex) % 2] * dir, tarPosY[(0 + fixIndex) % 2], true, "v", true);
				_setOneCard(cardArray[1], pointArray[1], tarPosX[(1 + fixIndex) % 2] * dir, tarPosY[(1 + fixIndex) % 2], true, "v", true);
				if (pointArray.length >= 3) _setOneCard(cardArray[2], pointArray[2], tarPosX[2] * dir, tarPosY[2], false, "h", showThird);
			} else if (stage == 3) {
				_setOneCard(cardArray[0], pointArray[0], tarPosX[(0 + fixIndex) % 2] * dir, tarPosY[(0 + fixIndex) % 2], true, "v", true);
				_setOneCard(cardArray[1], pointArray[1], tarPosX[(1 + fixIndex) % 2] * dir, tarPosY[(1 + fixIndex) % 2], true, "v", true);
				if (pointArray.length >= 3) _setOneCard(cardArray[2], pointArray[2], tarPosX[2] * dir, tarPosY[2], true, "h", showThird);
			}
			var farmer_point = this.getChildByName("farmer_point");
			var banker_point = this.getChildByName("banker_point");
			if (sideName == "banker") {
				banker_point.visible = true;
				switch (stage) {
					case 0:
						banker_point.visible = false;
						break;
					case 1:
					case 2:
						banker_point.getChildByName("text").text = this._simpGetPoint(pointArray[0], pointArray[1]);
						break;
					case 3:
						banker_point.getChildByName("text").text = this._simpGetPoint(pointArray[0], pointArray[1]);
						if (pointArray.length >= 3) banker_point.getChildByName("text").text = this._simpGetPoint(pointArray[0], pointArray[1], pointArray[1]);
						break;
				}
			} else {
				farmer_point.visible = true;
				switch (stage) {
					case 0:
						farmer_point.visible = false;
						break;
					case 1:
					case 2:
						farmer_point.getChildByName("text").text = this._simpGetPoint(pointArray[0], pointArray[1]);
						break;
					case 3:
						farmer_point.getChildByName("text").text = this._simpGetPoint(pointArray[0], pointArray[1]);
						if (pointArray.length >= 3) farmer_point.getChildByName("text").text = this._simpGetPoint(pointArray[0], pointArray[1], pointArray[1]);
						break;
				}
			}
		},
		_sendCardCenterStep1: function (farmerArray, bankerArray, stepIdx, farmerSeatIdx, bankerSeatIdx, leftTime, myLookSide, lookCardDir, lookStep, lookRadian, runNextStep) {
			if (runNextStep && leftTime <= 0) {
				stepIdx++;
				this._sendCardCenterStep1(farmerArray, bankerArray, stepIdx, farmerSeatIdx, bankerSeatIdx, leftTime, myLookSide, lookCardDir, lookStep, lookRadian, false);
				return;
			}
			var showThird = runNextStep;
			var step = this._sendCardSteps[stepIdx];
			var showTopFlipBtn = false;
			switch (step) {
				case confMgr.definition.BaccaratSendCardStepJM.FarmerFirst:
					if (this._sendCardSteps[stepIdx + 1] != confMgr.definition.BaccaratSendCardStepJM.BankerFirst) {
						if (farmerSeatIdx != -1) {
							this.publish("game_baccarat.play.set_top_card_jm", false, 0, farmerArray);
							this.publish("game_baccarat.play.set_top_card_jm", true, 1, bankerArray);
							this._initSendCardCenter("farmer", 0, true);
							this._initSendCardCenter("banker", 1, true);
						} else {
							this.publish("game_baccarat.play.set_top_card_jm", false, 1, farmerArray);
							this.publish("game_baccarat.play.set_top_card_jm", true, 0, bankerArray);
							this._initSendCardCenter("farmer", 1, true);
							this._initSendCardCenter("banker", 0, true);
						}
					} else {
						this.publish("game_baccarat.play.set_top_card_jm", false, 0, farmerArray);
						this.publish("game_baccarat.play.set_top_card_jm", true, 0, bankerArray);
						this._initSendCardCenter("farmer", 0, true);
						this._initSendCardCenter("banker", 0, true);
						if (this._lookCardSideNum == 1) showTopFlipBtn = true;
					}
					break;
				case confMgr.definition.BaccaratSendCardStepJM.BankerFirst:
					if (farmerSeatIdx != -1 && bankerSeatIdx != -1) {
						this.publish("game_baccarat.play.set_top_card_jm", false, 1, farmerArray);
						this.publish("game_baccarat.play.set_top_card_jm", true, 0, bankerArray);
						this._initSendCardCenter("farmer", 1, true);
						this._initSendCardCenter("banker", 0, true);
					} else {
						if (farmerSeatIdx != -1) {
							this.publish("game_baccarat.play.set_top_card_jm", false, 1, farmerArray);
							this.publish("game_baccarat.play.set_top_card_jm", true, 0, bankerArray);
							this._initSendCardCenter("farmer", 1, true);
							this._initSendCardCenter("banker", 0, true);
						} else if (bankerSeatIdx != -1) {
							this.publish("game_baccarat.play.set_top_card_jm", false, 0, farmerArray);
							this.publish("game_baccarat.play.set_top_card_jm", true, 1, bankerArray);
							this._initSendCardCenter("farmer", 0, true);
							this._initSendCardCenter("banker", 1, true);
						} else {
							this.publish("game_baccarat.play.set_top_card_jm", false, 1, farmerArray);
							this.publish("game_baccarat.play.set_top_card_jm", true, 0, bankerArray);
							this._initSendCardCenter("farmer", 1, true);
							this._initSendCardCenter("banker", 0, true);
						}
					}
					break;
				case confMgr.definition.BaccaratSendCardStepJM.FarmerSecond:
					if (this._sendCardSteps[stepIdx + 1] == confMgr.definition.BaccaratSendCardStepJM.Finish) {
						this.publish("game_baccarat.play.set_top_card_jm", false, 2, farmerArray);
						this.publish("game_baccarat.play.set_top_card_jm", true, 3, bankerArray);
						this._initSendCardCenter("farmer", 2, showThird);
						this._initSendCardCenter("banker", 3, true);
					} else {
						if (this._step2Send2) {
							this.publish("game_baccarat.play.set_top_card_jm", false, 2, farmerArray);
							this.publish("game_baccarat.play.set_top_card_jm", true, 2, bankerArray);
							this._initSendCardCenter("farmer", 2, showThird);
							this._initSendCardCenter("banker", 2, showThird);
							showTopFlipBtn = true;
						} else {
							this.publish("game_baccarat.play.set_top_card_jm", false, 2, farmerArray);
							this.publish("game_baccarat.play.set_top_card_jm", true, 1, bankerArray);
							this._initSendCardCenter("farmer", 2, showThird);
							this._initSendCardCenter("banker", 1, true);
						}
					}
					break;
				case confMgr.definition.BaccaratSendCardStepJM.BankerSecond:
					if (this._sendCardSteps[stepIdx + 1] == confMgr.definition.BaccaratSendCardStepJM.Finish) {
						this.publish("game_baccarat.play.set_top_card_jm", false, 3, farmerArray);
						this.publish("game_baccarat.play.set_top_card_jm", true, 2, bankerArray);
						this._initSendCardCenter("farmer", 3, true);
						this._initSendCardCenter("banker", 2, showThird);
					} else {
						if (this._step2Send2) {
							this.publish("game_baccarat.play.set_top_card_jm", false, 2, farmerArray);
							this.publish("game_baccarat.play.set_top_card_jm", true, 2, bankerArray);
							this._initSendCardCenter("farmer", 2, showThird);
							this._initSendCardCenter("banker", 2, showThird);
							showTopFlipBtn = true;
						} else {
							this.publish("game_baccarat.play.set_top_card_jm", false, 1, farmerArray);
							this.publish("game_baccarat.play.set_top_card_jm", true, 2, bankerArray);
							this._initSendCardCenter("farmer", 1, true);
							this._initSendCardCenter("banker", 2, showThird);
						}
					}
					break;
				case confMgr.definition.BaccaratSendCardStepJM.Finish:
					this.publish("game_baccarat.play.set_top_card_jm", false, 3, farmerArray);
					this.publish("game_baccarat.play.set_top_card_jm", true, 3, bankerArray);
					this._initSendCardCenter("farmer", 3, true);
					this._initSendCardCenter("banker", 3, true);
					this._leftLookCardTime = 0;
					break;
				default:
					return;
			}
			if (runNextStep) this._sendCardCenterStep2(farmerArray, bankerArray, step, farmerSeatIdx, bankerSeatIdx, leftTime, myLookSide, lookCardDir, lookStep, lookRadian, showTopFlipBtn);
		},
		_sendCardCenterStep2: function (farmerArray, bankerArray, step, farmerSeatIdx, bankerSeatIdx, leftTime, myLookSide, lookCardDir, lookStep, lookRadian, showTopFlipBtn) {
			switch (step) {
				case confMgr.definition.BaccaratSendCardStepJM.FarmerFirst:
					var card1 = null;
					var card2 = null;
					var seatIdx = -1;
					var isMe = false;
					if (farmerSeatIdx != -1) {
						card1 = this._centerCardFarmer[0];
						card2 = this._centerCardFarmer[1];
						seatIdx = farmerSeatIdx;
						if (this._lookCardSide == confMgr.definition.LOOKCARD_SIDE.FARMER) isMe = true;
					} else if (bankerSeatIdx != -1) {
						card1 = this._centerCardBanker[0];
						card2 = this._centerCardBanker[1];
						seatIdx = bankerSeatIdx;
						if (this._lookCardSide == confMgr.definition.LOOKCARD_SIDE.BANKER) isMe = true;
					}
					if (seatIdx != -1) {
						var index0 = this._getCardIndexByCardName(card1.name);
						var index1 = this._getCardIndexByCardName(card2.name);
						this._setCenterCardDirAndProgress(card1, lookCardDir[index0], lookStep[index0], lookRadian[index0]);
						this._setCenterCardDirAndProgress(card2, lookCardDir[index1], lookStep[index1], lookRadian[index1]);
						var pos = seatPos[seatIdx];
						if (isMe) {
							this._moveCenterCard(card1, true, startPos, [pos.x - lookCardDis, pos.y], baseScale, bigScale, null, null, 0);
							this._moveCenterCard(card2, true, startPos, [pos.x + lookCardDis, pos.y], baseScale, bigScale, null, null, 0);
							this.enableFlipBtn(leftTime);
							if (showTopFlipBtn) {
								if (this._lookCardSide == confMgr.definition.LOOKCARD_SIDE.FARMER) this.enableTopFlipBtn(false);
								else this.enableTopFlipBtn(true);
							}
						} else {
							this._moveCenterCard(card1, true, null, [pos.x - lookCardDisSmall, pos.y], baseScale, smallScale, null, null, 0);
							this._moveCenterCard(card2, true, null, [pos.x + lookCardDisSmall, pos.y], baseScale, smallScale, null, null, 0);
							this.publish("game_baccarat.play.setSoundPanel", true, step);
							this.publish("game_baccarat.seat.startMaskClip", seatIdx, leftTime);
						}
					}
					break;
				case confMgr.definition.BaccaratSendCardStepJM.BankerFirst:
					if (farmerSeatIdx != -1 && bankerSeatIdx != -1) {
						var index0 = this._getCardIndexByCardName(this._centerCardBanker[0].name);
						var index1 = this._getCardIndexByCardName(this._centerCardBanker[1].name);
						this._setCenterCardDirAndProgress(this._centerCardBanker[0], lookCardDir[index0], lookStep[index0], lookRadian[index0]);
						this._setCenterCardDirAndProgress(this._centerCardBanker[1], lookCardDir[index1], lookStep[index1], lookRadian[index1]);
						var pos = seatPos[bankerSeatIdx];
						if (this._lookCardSide == confMgr.definition.LOOKCARD_SIDE.BANKER) {
							this._moveCenterCard(this._centerCardBanker[0], true, null, [pos.x - lookCardDis, pos.y], baseScale, bigScale, null, null, 0);
							this._moveCenterCard(this._centerCardBanker[1], true, null, [pos.x + lookCardDis, pos.y], baseScale, bigScale, null, null, 0);
							this.enableFlipBtn(leftTime);
						} else {
							this._moveCenterCard(this._centerCardBanker[0], true, null, [pos.x - lookCardDisSmall, pos.y], baseScale, smallScale, null, null, 0);
							this._moveCenterCard(this._centerCardBanker[1], true, null, [pos.x + lookCardDisSmall, pos.y], baseScale, smallScale, null, null, 0);
							this.publish("game_baccarat.play.setSoundPanel", true, step);
							this.publish("game_baccarat.seat.startMaskClip", bankerSeatIdx, leftTime);
						}
					}
					break;
				case confMgr.definition.BaccaratSendCardStepJM.FarmerSecond:
					if (farmerSeatIdx == -1) {
						this._moveCenterCard(this._centerCardFarmer[2], false, startPos, [tarPosX[2] * -1, tarPosY[2]], 0, baseScale, null, null, 0);
					} else {
						var index0 = this._getCardIndexByCardName(this._centerCardFarmer[2].name);
						this._setCenterCardDirAndProgress(this._centerCardFarmer[2], lookCardDir[index0], lookStep[index0], lookRadian[index0]);
						var pos = seatPos[farmerSeatIdx];
						if (this._lookCardSide == confMgr.definition.LOOKCARD_SIDE.FARMER) {
							this._moveCenterCard(this._centerCardFarmer[2], true, startPos, [pos.x, pos.y], baseScale, bigScale, null, null, 0);
							this.enableFlipBtn(leftTime);
							if (showTopFlipBtn) this.enableTopFlipBtn(false);
						} else {
							this._moveCenterCard(this._centerCardFarmer[2], true, startPos, [pos.x, pos.y], baseScale, smallScale, null, null, 0);
							this.publish("game_baccarat.play.setSoundPanel", true, step);
							this.publish("game_baccarat.seat.startMaskClip", farmerSeatIdx, leftTime);
						}
					}
					break;
				case confMgr.definition.BaccaratSendCardStepJM.BankerSecond:
					if (bankerSeatIdx == -1) {
						this._moveCenterCard(this._centerCardBanker[2], false, startPos, [tarPosX[2], tarPosY[2]], 0, baseScale, null, null, 0);
					} else {
						var index0 = this._getCardIndexByCardName(this._centerCardBanker[2].name);
						this._setCenterCardDirAndProgress(this._centerCardBanker[2], lookCardDir[index0], lookStep[index0], lookRadian[index0]);
						var pos = seatPos[bankerSeatIdx];
						if (this._lookCardSide == confMgr.definition.LOOKCARD_SIDE.BANKER) {
							this._moveCenterCard(this._centerCardBanker[2], true, startPos, [pos.x, pos.y], baseScale, bigScale, null, null, 0);
							this.enableFlipBtn(leftTime);
							if (showTopFlipBtn) this.enableTopFlipBtn(true);
						} else {
							this._moveCenterCard(this._centerCardBanker[2], true, startPos, [pos.x, pos.y], baseScale, smallScale, null, null, 0);
							this.publish("game_baccarat.play.setSoundPanel", true, step);
							this.publish("game_baccarat.seat.startMaskClip", bankerSeatIdx, leftTime);
						}
					}
					break;
				case confMgr.definition.BaccaratSendCardStepJM.Finish:
					break;
				default:
					return;
			}
		},
		sendCardCenter: function (farmerArray, bankerArray, steps, leftTime, step2Send2, farmerSeatIdx, bankerSeatIdx, myLookSide, doAnimation, lookCardDir, lookStep, lookRadian) {
			this._farmerPointArray = farmerArray;
			this._bankerPointArray = bankerArray;
			this._farmerSeatIdx = farmerSeatIdx;
			this._bankerSeatIdx = bankerSeatIdx;
			this._setLookCard(myLookSide);
			this._sendCardSteps = steps;
			this._lookCardSideNum = 0;
			if (farmerSeatIdx != -1) this._lookCardSideNum++;
			if (bankerSeatIdx != -1) this._lookCardSideNum++;
			this._lookCardEndName = {};
			this._step2Send2 = step2Send2;
			if (doAnimation) this._sendCardCenterWithAnimation(farmerArray, bankerArray, steps[0], farmerSeatIdx, bankerSeatIdx, leftTime);
			else this._sendCardCenterStep1(farmerArray, bankerArray, 0, farmerSeatIdx, bankerSeatIdx, leftTime, myLookSide, lookCardDir, lookStep, lookRadian, true);
		},
		backToCenter: function (isBanker, isThird) {
			if (isBanker) {
				if (isThird) {
					this._centerCardBanker[2].setDirection("h", false);
					this._moveCenterCard(this._centerCardBanker[2], false, null, [tarPosX[2], tarPosY[2]], this._centerCardBanker[2].scaleX, baseScale, 0, 90, 400);
				} else {
					for (var i = 0; i < 2; i++) this._moveCenterCard(this._centerCardBanker[i], false, null, [tarPosX[i], tarPosY[i]], this._centerCardBanker[i].scaleX, baseScale, null, null, 400);
				}
			} else {
				if (isThird) {
					this._centerCardFarmer[2].setDirection("h", false);
					this._moveCenterCard(this._centerCardFarmer[2], false, null, [tarPosX[2] * -1, tarPosY[2]], this._centerCardFarmer[2].scaleX, baseScale, 0, 90, 400);
				} else {
					for (var i = 0; i < 2; i++) {
						var index = i;
						index = 1 - i;
						this._moveCenterCard(this._centerCardFarmer[i], false, null, [tarPosX[index] * -1, tarPosY[index]], this._centerCardFarmer[i].scaleX, baseScale, null, null, 400);
					}
				}
			}
		},
		_hideCenterCards: function () {
			for (var i = 0; i < 3; i++) {
				this._centerCardFarmer[i].visible = false;
				this._centerCardBanker[i].visible = false;
			}
		},
		clear: function () {
			this._hideCenterCards();
		},
		recycle: function (card1, card2, card3) {
			if (card1.visible) card1.flyToAndScaleWithTime(0, cardPosY, baseScale, baseScale, 600, this, function () {
				this.timerOnce(500, this, function () {
					card1.flyToAndScaleWithTime(endPos[0], endPos[1], baseScale, 0, 400, this);
				});
			});
			if (card2.visible) card2.flyToAndScaleWithTime(0, cardPosY, baseScale, baseScale, 600, this, function () {
				this.timerOnce(500, this, function () {
					card2.flyToAndScaleWithTime(endPos[0], endPos[1], baseScale, 0, 400, this);
				});
			});
			if (card3.visible) {
				card3.setDirection("v", true);
				card3.flyToAndScaleWithTime(0, cardPosY, baseScale, baseScale, 600, this, function () {
					this.timerOnce(500, this, function () {
						card3.flyToAndScaleWithTime(endPos[0], endPos[1], baseScale, 0, 400, this);
					});
				});
			}
		},
		recycleCard: function () {
			this.recycle.apply(this, this._centerCardFarmer);
			this.recycle.apply(this, this._centerCardBanker);
			this.getChildByName("farmer_point").visible = false;
			this.getChildByName("banker_point").visible = false;
			this._leftLookCardTime = 0;
			this.publish("game_baccarat.play.clear_top_card_jm");
		}
	});
	return CardPlace;
});
gbx.define("game/baccarat/parts/chat_panel", ["gbx/render/display/sprite", "comm/base/command_ui", "comm/ui/sound_button", "comm/helper/conf_mgr", "comm/ui/ui_utils", "conf/ui_locallization"], function (Sprite, BaseUI, Button, confMgr, uiUtils, uiLocallization) {
	var ChatPanel = Sprite.extend({
		init: function () {
			this._super();
			var backgroud = uiUtils.createSprite("assets/main/public/mid_light_bg.png", "");
			this.addChild(backgroud);
			var closeBtn = new Button;
			closeBtn.name = "chat_close";
			closeBtn.pos(-1e3, -1e3);
			closeBtn.width = 3e3;
			closeBtn.height = 3e3;
			closeBtn.setClickHandler(this, this.OnClick);
			this.addChild(closeBtn);
			var btn_serif = uiUtils.createButton("assets/baccarat/tex/chat/tab_light.png", 1, "btn_serif");
			btn_serif.setClickHandler(this, this.OnClick);
			btn_serif.pos(0, -30);
			var word_serif = uiUtils.createSprite("assets/baccarat/tex/chat/serif.png", "");
			word_serif.pos(38, 3);
			btn_serif.addChild(word_serif);
			var btn_emoji = uiUtils.createButton("assets/baccarat/tex/chat/tab_low.png", 1, "btn_emoji");
			btn_emoji.setClickHandler(this, this.OnClick);
			btn_emoji.pos(126, -30);
			var word_emoji = uiUtils.createSprite("assets/baccarat/tex/chat/emoji.png", "");
			word_emoji.pos(39, 3);
			btn_emoji.addChild(word_emoji);
			this.addChild(btn_serif);
			this.addChild(btn_emoji);
			var serifArray = [uiLocallization.chat_1, uiLocallization.chat_2, uiLocallization.chat_3, uiLocallization.chat_4, uiLocallization.chat_5, uiLocallization.chat_6, uiLocallization.chat_7, uiLocallization.chat_8, uiLocallization.chat_9, uiLocallization.chat_10, uiLocallization.chat_11, uiLocallization.chat_12, uiLocallization.chat_13, uiLocallization.chat_14];
			var sendChatSerifList = uiUtils.createNormalList(1, 10, 10, "v", 260, 294, 260, 40);
			sendChatSerifList.array = serifArray;
			sendChatSerifList.setRenderHandler(this, this._renderSerifList);
			sendChatSerifList.name = "serifList";
			this.addChild(sendChatSerifList);
			var emojiArray = ["emotion01.png", "emotion02.png", "emotion03.png", "emotion04.png", "emotion05.png", "emotion06.png", "emotion07.png", "emotion08.png", "emotion09.png", "emotion10.png", "emotion11.png", "emotion12.png", "emotion13.png", "emotion14.png", "emotion15.png", "emotion16.png", "emotion17.png", "emotion18.png", "emotion19.png", "emotion20.png", "emotion21.png", "emotion22.png", "emotion23.png", "emotion24.png", "emotion25.png", "emotion26.png", "emotion27.png", "emotion28.png"];
			var sendChatEmojiList = uiUtils.createNormalList(3, 10, 0, "v", 300, 304, 76, 76);
			sendChatEmojiList.array = emojiArray;
			sendChatEmojiList.repeatX = 3;
			sendChatEmojiList.setRenderHandler(this, this._renderEmojiList);
			sendChatEmojiList.name = "emojiList";
			sendChatEmojiList.visible = false;
			this.addChild(sendChatEmojiList);
		},
		_renderSerifList: function (cell, idx) {
			var data = this.getChildByName("serifList").array;
			if (idx >= data.length) {
				return;
			}
			var serifBtn = cell.getChildByName("serifBtn");
			if (!serifBtn) {
				serifBtn = new Button;
				serifBtn.width = 304;
				serifBtn.height = 40;
				serifBtn.stateNum = 1;
				serifBtn.name = "serifBtn";
				cell.addChild(serifBtn);
				var serif = uiUtils.createSimpleText(data[idx], "serif");
				serif.fontSize = 15;
				serif.color = "#FFF4BD";
				serif.pos(4, 0);
				serifBtn.addChild(serif);
			}
			serifBtn.getChildByName("serif").text = data[idx];
			serifBtn.setClickHandler(this, this.sendChat, confMgr.definition.CHAT_TYPE.SERIF, data[idx]);
		},
		_renderEmojiList: function (cell, idx) {
			var data = this.getChildByName("emojiList").array;
			if (idx >= data.length) {
				return;
			}
			var emojiBtn = cell.getChildByName("emojiBtn");
			if (!emojiBtn) {
				emojiBtn = new Button;
				emojiBtn.pos(7.5, 7.5);
				emojiBtn.size(61, 61);
				emojiBtn.stateNum = 1;
				emojiBtn.name = "emojiBtn";
				cell.addChild(emojiBtn);
			}
			emojiBtn.setSkinImage("assets/main/emoji/" + data[idx]);
			emojiBtn.setClickHandler(this, this.sendChat, confMgr.definition.CHAT_TYPE.EMOJI, data[idx]);
		},
		sendChat: function (btn, type, content) {
			this.publish("game_baccarat.command.send_chat", type, content);
			this.visible = false;
		},
		OnClick: function (btn) {
			if (btn.name == "chat_close") {
				this.visible = false;
			} else if (btn.name === "btn_serif") {
				this.getChildByName("serifList").visible = true;
				this.getChildByName("emojiList").visible = false;
				this.getChildByName("btn_serif").setSkinImage("assets/baccarat/tex/chat/tab_light.png");
				this.getChildByName("btn_emoji").setSkinImage("assets/baccarat/tex/chat/tab_low.png");
			} else if (btn.name === "btn_emoji") {
				this.getChildByName("serifList").visible = false;
				this.getChildByName("emojiList").visible = true;
				this.getChildByName("btn_serif").setSkinImage("assets/baccarat/tex/chat/tab_low.png");
				this.getChildByName("btn_emoji").setSkinImage("assets/baccarat/tex/chat/tab_light.png");
			}
		}
	});
	return ChatPanel;
});
gbx.define("game/baccarat/parts/chip", ["gbx/render/display/sprite", "gbx/render/tween", "comm/helper/conf_mgr"], function (Sprite, Tween, confMgr) {
	var setting = confMgr.read("baccarat/dat/setting.json");
	var Chip = Sprite.extend({
		init: function () {
			this._super();
			this.setImage("assets/baccarat/tex/chips/chip1.png");
			this.pivotToCenter();
			this.area = -1;
			this.seatIdx = -1;
			this.playerId = "";
			this.isFlying = false;
		},
		set type(v) {
			this.isFlying = false;
			var t = v + 1;
			this.setImage("assets/baccarat/tex/chips/chip" + t + ".png");
			this.scale(.5);
		},
		flyTo: function (x, y, context, endCallback, args) {
			this.isFlying = true;
			this.tweenTo({
				x: x,
				y: y
			}, 350, Tween.TimingFunction.linearOut, context, endCallback, args);
		},
		flyEnd: function () {
			this.isFlying = false;
		}
	});
	return Chip;
});
gbx.define("game/baccarat/parts/counter", ["comm/base/command_ui", "gbx/render/display/sprite", "gbx/render/display/text", "comm/helper/sound_mgr", "comm/ui/ui_utils"], function (BaseUI, Sprite, Text, soundMgr, uiUtils) {
	var Counter = BaseUI.extend({
		init: function () {
			this._super();
			this._maxSecond = 0;
			this._startTime = 0;
			this._passedSecond = 0;
			this._leftTime = 0;
			this.playedSound = false;
			var bg = new Sprite;
			bg.setImage("assets/baccarat/tex/clock.png");
			bg.name = "bg";
			bg.visible = true;
			bg.pivotToCenter();
			bg.pos(17, 2);
			this.addChild(bg);
			var text = new Text;
			text.text = "00";
			text.align = "center";
			text.fontSize = 25;
			text.color = "#000000";
			text.strokeColor = "#000000";
			text.width = 117;
			text.pivotToCenter();
			text.pos(0, 2);
			text.name = "text";
			this.addChild(text);
		},
		start: function (second) {
			this._maxSecond = Math.round(second);
			this._passedSecond = 0;
			this.playedSound = false;
			this._startTime = (new Date).getTime();
			this._leftTime = second;
			if (this._maxSecond > 0) {
				if (this._maxSecond < 10) this.getChildByName("text").text = "0" + this._maxSecond;
				else this.getChildByName("text").text = this._maxSecond;
				this.timerLoop(100, this, this._updateTime);
			}
		},
		stop: function () {
			if (this._leftTime <= 0) return;
			this.clearTimer(this, this._updateTime);
			this.getChildByName("text").text = "00";
			this._leftTime = 0;
			this.visible = false;
		},
		_updateTime: function () {
			var delta = (new Date).getTime() - this._startTime;
			delta = Math.floor(delta / 1e3);
			if (delta != this._passedSecond) {
				this._passedSecond = delta;
				var num = this._maxSecond - this._passedSecond;
				var numStr;
				if (num < 10) numStr = "0" + num;
				else numStr = num;
				this._leftTime = num;
				this.getChildByName("text").text = numStr;
				this.getChildByName("text").scale(1.2);
				this.getChildByName("text").tweenTo({
					scaleX: 1,
					scaleY: 1
				}, 100, "sineOut");
				if (this._maxSecond - this._passedSecond <= 3 && this._maxSecond - this._passedSecond >= 0) {
					if (!this.playedSound) {
						uiUtils.playSound("clock", 1);
						this.playedSound = true;
					}
				}
				if (this._maxSecond <= this._passedSecond) {
					this.clearTimer(this, this._updateTime);
					this.getChildByName("text").text = "00";
					this.runCommand("times_up");
					this._leftTime = 0;
				}
			}
		},
		getLeftTime: function () {
			return this._leftTime;
		}
	});
	return Counter;
});
gbx.define("game/baccarat/parts/history_box", ["conf/system", "comm/helper/room_mgr", "gbx/render/display/sprite", "gbx/render/display/text", "gbx/render/ui/list", "game/lobby/parts/way_sheet_body", "comm/helper/conf_mgr", "conf/locallization", "comm/ui/ui_utils", "comm/helper/baccarat_algorithm", "conf/ui_locallization"], function (sys, roomMgr, Sprite, Text, List, WaySheetBody, confMgr, Localization, uiUtils, BaccaratAlgorithm, uiLocallization) {
	var HistoryBox = Sprite.extend({
		init: function () {
			this._super();
			this._algorithm = new BaccaratAlgorithm;
			var luan_2 = uiUtils.createSprite("assets/main/waysheet/ludan_l.png", "");
			luan_2.zOrder = 2;
			this.addChild(luan_2);
			var body = new WaySheetBody("battle", this._algorithm);
			body.name = "waySheetBody";
			body.pos(0, 0);
			body.zOrder = 1;
			this.addChild(body);
			var preY = 270.5;
			var preX = 74;
			var total_banker = uiUtils.createSimpleText("", "total_banker");
			total_banker.color = "#FE0000";
			total_banker.pos(4, preY);
			total_banker.fontSize = 15;
			total_banker.bold = true;
			total_banker.zOrder = 3;
			this.addChild(total_banker);
			var total_farmer = uiUtils.createSimpleText("", "total_farmer");
			total_farmer.color = "#4C60DD";
			total_farmer.pos(preX + 6, preY);
			total_farmer.fontSize = 15;
			total_farmer.bold = true;
			total_farmer.zOrder = 3;
			this.addChild(total_farmer);
			var total_duece = uiUtils.createSimpleText("", "total_duece");
			total_duece.color = "#53E836";
			total_duece.pos(preX * 2 + 8, preY);
			total_duece.fontSize = 15;
			total_duece.bold = true;
			total_duece.zOrder = 3;
			this.addChild(total_duece);
			var total_bankerPair = uiUtils.createSimpleText("", "total_bankerPair");
			total_bankerPair.color = "#FE0000";
			total_bankerPair.pos(preX * 3 + 8, preY);
			total_bankerPair.fontSize = 15;
			total_bankerPair.bold = true;
			total_bankerPair.zOrder = 3;
			this.addChild(total_bankerPair);
			var total_farmerPair = uiUtils.createSimpleText("", "total_farmerPair");
			total_farmerPair.color = "#4C60DD";
			total_farmerPair.pos(preX * 4 + 8, preY);
			total_farmerPair.fontSize = 15;
			total_farmerPair.bold = true;
			total_farmerPair.zOrder = 3;
			this.addChild(total_farmerPair);
			var total_89 = uiUtils.createSimpleText("", "total_89");
			total_89.pos(380, preY);
			total_89.color = "#A27D61";
			total_89.fontSize = 15;
			total_89.bold = true;
			total_89.zOrder = 3;
			this.addChild(total_89);
			var total_countAll = uiUtils.createSimpleText("", "total_countAll");
			total_countAll.pos(506, preY);
			total_countAll.color = "#A27D61";
			total_countAll.fontSize = 15;
			total_countAll.bold = true;
			total_countAll.zOrder = 3;
			this.addChild(total_countAll);
			var preY = 289;
			var label_limit = uiUtils.createSimpleText("", "label_limit");
			label_limit.pos(6, preY);
			label_limit.fontSize = 15;
			label_limit.bold = true;
			label_limit.color = "#ffffff";
			label_limit.zOrder = 3;
			this.addChild(label_limit);
			var label_limitMin = uiUtils.createSimpleText("", "label_limitMin");
			label_limitMin.pos(160, preY);
			label_limitMin.fontSize = 15;
			label_limitMin.bold = true;
			label_limitMin.color = "#CFAC90";
			label_limitMin.zOrder = 3;
			this.addChild(label_limitMin);
			var label_limitMax = uiUtils.createSimpleText("", "label_limitMax");
			label_limitMax.pos(310, preY);
			label_limitMax.fontSize = 15;
			label_limitMax.bold = true;
			label_limitMax.color = "#CFAC90";
			label_limitMax.zOrder = 3;
			this.addChild(label_limitMax);
			var label_roomId = uiUtils.createSimpleText("", "label_roomId");
			label_roomId.pos(160 * 3 + 35, preY);
			label_roomId.fontSize = 15;
			label_roomId.bold = true;
			label_roomId.color = "#ffffff";
			label_roomId.zOrder = 3;
			this.addChild(label_roomId);
			var label_roomIdCopy = uiUtils.createSimpleText("", "label_roomIdCopy");
			label_roomIdCopy.pos(10, preY + 120);
			label_roomIdCopy.fontSize = 25;
			label_roomIdCopy.color = "#CFAC90";
			label_roomIdCopy.zOrder = 3;
			this.addChild(label_roomIdCopy);
			var childX = 3;
			var banker = uiUtils.createSimpleText(uiLocallization.banker, "banker");
			banker.fontSize = 18;
			banker.pos(615, 115);
			banker.color = "red";
			banker.bold = true;
			banker.zOrder = 3;
			this.addChild(banker);
			var bigEye = new Sprite;
			bigEye.setImage("assets/main/waysheet/ludan_redCir1.png");
			bigEye.pos(childX, 26);
			bigEye.name = "bigEye";
			banker.addChild(bigEye);
			var small = new Sprite;
			small.setImage("assets/main/waysheet/ludan_redCir2.png");
			small.pos(childX, 44);
			small.name = "small";
			banker.addChild(small);
			var yueU = new Sprite;
			yueU.setImage("assets/main/waysheet/ludan_redSqu.png");
			yueU.pos(childX, 62);
			yueU.name = "yueU";
			banker.addChild(yueU);
			var farmer = uiUtils.createSimpleText(uiLocallization.farmer, "farmer");
			farmer.fontSize = 18;
			farmer.pos(615, 194);
			farmer.color = "blue";
			farmer.bold = true;
			farmer.zOrder = 3;
			this.addChild(farmer);
			bigEye = new Sprite;
			bigEye.setImage("assets/main/waysheet/ludan_blueCir1.png");
			bigEye.pos(childX, 26);
			bigEye.name = "bigEye";
			farmer.addChild(bigEye);
			small = new Sprite;
			small.setImage("assets/main/waysheet/ludan_blueCir2.png");
			small.pos(childX, 44);
			small.name = "small";
			farmer.addChild(small);
			yueU = new Sprite;
			yueU.setImage("assets/main/waysheet/ludan_blueSqu.png");
			yueU.pos(childX, 62);
			yueU.name = "yueU";
			farmer.addChild(yueU);
			this.getRoomData();
		},
		refreshPlayerNumber: function (number) { },
		setInfo: function (data, isReset) {
			if (isReset) {
				this.getChildByName("total_banker").text = uiLocallization.banker + ": 0";
				this.getChildByName("total_farmer").text = uiLocallization.farmer + ": 0";
				this.getChildByName("total_duece").text = uiLocallization.duece + ": 0";
				this.getChildByName("total_bankerPair").text = uiLocallization.bankerPair + ": 0";
				this.getChildByName("total_farmerPair").text = uiLocallization.farmerPair + ": 0";
				this.getChildByName("total_89").text = uiLocallization.count89 + ": 0";
				this.getChildByName("total_countAll").text = uiLocallization.round_count + ": 0";
				return;
			}
			this.getChildByName("total_banker").text = uiLocallization.banker + ": " + data.banker;
			this.getChildByName("total_farmer").text = uiLocallization.farmer + ": " + data.farmer;
			this.getChildByName("total_duece").text = uiLocallization.duece + ": " + data.deuce;
			this.getChildByName("total_bankerPair").text = uiLocallization.bankerPair + ": " + data.bankerPair;
			this.getChildByName("total_farmerPair").text = uiLocallization.farmerPair + ": " + data.farmerPair;
			this.getChildByName("total_89").text = uiLocallization.count89 + ": " + data.count89;
			this.getChildByName("total_countAll").text = uiLocallization.round_count + ": " + data.countAll;
		},
		setPredict: function (data, isClear) {
			var bankerBigEye = this.getChildByName("banker", "bigEye");
			var farmerBigEye = this.getChildByName("farmer", "bigEye");
			var bankerSmall = this.getChildByName("banker", "small");
			var farmerSmall = this.getChildByName("farmer", "small");
			var bankerYueU = this.getChildByName("banker", "yueU");
			var farmerYueU = this.getChildByName("farmer", "yueU");
			bankerBigEye.visible = false;
			farmerBigEye.visible = false;
			bankerSmall.visible = false;
			farmerSmall.visible = false;
			bankerYueU.visible = false;
			farmerYueU.visible = false;
			if (isClear) return;
			if (data.bigEyeRoad == 1) {
				bankerBigEye.visible = true;
				farmerBigEye.visible = true;
				bankerBigEye.setImage("assets/main/waysheet/ludan_redCir1.png");
				farmerBigEye.setImage("assets/main/waysheet/ludan_blueCir1.png");
			} else if (data.bigEyeRoad == 0) {
				bankerBigEye.visible = true;
				farmerBigEye.visible = true;
				bankerBigEye.setImage("assets/main/waysheet/ludan_blueCir1.png");
				farmerBigEye.setImage("assets/main/waysheet/ludan_redCir1.png");
			}
			if (data.smallRoad == 1) {
				bankerSmall.visible = true;
				farmerSmall.visible = true;
				bankerSmall.setImage("assets/main/waysheet/ludan_redCir2.png");
				farmerSmall.setImage("assets/main/waysheet/ludan_blueCir2.png");
			} else if (data.smallRoad == 0) {
				bankerSmall.visible = true;
				farmerSmall.visible = true;
				bankerSmall.setImage("assets/main/waysheet/ludan_blueCir2.png");
				farmerSmall.setImage("assets/main/waysheet/ludan_redCir2.png");
			}
			if (data.cockroach == 1) {
				bankerYueU.visible = true;
				farmerYueU.visible = true;
				bankerYueU.setImage("assets/main/waysheet/ludan_redSqu.png");
				farmerYueU.setImage("assets/main/waysheet/ludan_blueSqu.png");
			} else if (data.cockroach == 0) {
				bankerYueU.visible = true;
				farmerYueU.visible = true;
				bankerYueU.setImage("assets/main/waysheet/ludan_blueSqu.png");
				farmerYueU.setImage("assets/main/waysheet/ludan_redSqu.png");
			}
		},
		getRoomData: function () {
			var data = roomMgr.getChoose();
			if (data == undefined) return;
			var conf = data.roundResults;
			var array = this._algorithm.addAll(conf);
			this.getChildByName("waySheetBody").setWaySheet(array);
			this.setInfo(array[5]);
			this.setPredict(array[6], false);
			var roomName = "";
			switch (data.baccaratRoomType) {
				case 1:
					roomName = Localization.BaccaratRoomType1;
					break;
				case 2:
					roomName = Localization.BaccaratRoomType2;
					break;
				case 3:
					roomName = Localization.BaccaratRoomType3;
					this.getChildByName("label_roomIdCopy").text = roomName + data.roomId;
					break;
			}
			this.getChildByName("label_roomId").text = roomName + data.roomId;
			this.refreshPlayerNumber();
			this.getChildByName("label_limitMax").text = uiLocallization.battle_limit_max + ": " + data.allDeuceBetMax + "/" + data.allBankerPairBetMax;
			this.getChildByName("label_limitMin").text = uiLocallization.battle_limit_min + ": " + data.otherBetMin;
			this.getChildByName("label_limit").text = uiLocallization.LimitColor + ": " + data.bankerFarmerBetMin + "-" + data.allBankerFarmerBetMax;
		},
		add: function (winSide, pairSide) {
			var oneData = {};
			oneData.winType = winSide - 1;
			if (pairSide == confMgr.definition.PAIR_SIDE.BankerPair) {
				oneData.bankerPair = true;
			}
			if (pairSide == confMgr.definition.PAIR_SIDE.FarmerPair) {
				oneData.farmerPair = true;
			}
			if (pairSide == confMgr.definition.PAIR_SIDE.Both) {
				oneData.bankerPair = true;
				oneData.farmerPair = true;
			}
			var retArray = this._algorithm.add(oneData);
			this.setInfo(retArray[5]);
			this.setPredict(retArray[6], false);
			this.getChildByName("waySheetBody").putOneData(retArray);
		},
		clear: function () {
			this._algorithm.clear();
			this.setPredict(null, true);
			this.setInfo(null, true);
			this.getChildByName("waySheetBody").clear();
		}
	});
	return HistoryBox;
});
gbx.define("game/baccarat/parts/mask_clip", ["comm/base/command_ui", "gbx/render/display/sprite", "comm/helper/conf_mgr"], function (BaseUI, Sprite, confMgr) {
	var MaskClip = BaseUI.extend({
		init: function () {
			this._super();
			this._maxSecond = 0;
			this._startTime = 0;
			this._passedSecond = 0;
			this._leftTime = 0;
			this._angle = 0;
			this._startAngle = -90;
			this._width = 0;
			this._height = 0;
			var mask = new Sprite;
			mask.graphics.drawPath(0, 0, [
				["moveTo", 5, 0],
				["lineTo", 105, 0],
				["arcTo", 110, 0, 110, 5, 5],
				["lineTo", 110, 55],
				["arcTo", 110, 60, 105, 60, 5],
				["lineTo", 5, 60],
				["arcTo", 0, 60, 0, 55, 5],
				["lineTo", 0, 5],
				["arcTo", 0, 0, 5, 0, 5],
				["closePath"]
			], {
					fillStyle: "#00ffff"
				});
			mask.size(100, 50);
			mask.pivot(100 / 2, 50);
			mask.name = "mask";
			var maskContainer = new Sprite;
			maskContainer.size(100, 100);
			maskContainer.pos(50, 50);
			maskContainer.pivotToCenter();
			maskContainer.mask = mask;
			maskContainer.name = "container";
			this.addChild(maskContainer);
			var circle = new Sprite;
			circle.graphics.drawPie(50, 50, 72, -90, -90, "#32ff05");
			circle.name = "circle";
			maskContainer.addChild(circle);
		},
		start: function (second, width, height) {
			this._width = width;
			this._height = height;
			this._startAngle = -90;
			this._angle = 360 / second;
			var x = width + 8;
			var y = height + 8;
			var container = this.getChildByName("container");
			container.size(x, y);
			container.pivotToCenter();
			container.pos(x / 2, y / 2);
			var mask = this.getChildByName("container").mask;
			mask.size(x, y);
			mask.graphics.clear();
			mask.graphics.drawPath(-4, -4, [
				["moveTo", 5, 0],
				["lineTo", x - 5, 0],
				["arcTo", x, 0, x, 5, 5],
				["lineTo", x, y - 5],
				["arcTo", x, y, x - 5, y, 5],
				["lineTo", 5, y],
				["arcTo", 0, y, 0, y - 5, 5],
				["lineTo", 0, 5],
				["arcTo", 0, 0, 5, 0, 5],
				["closePath"]
			], {
					fillStyle: "#00ffff"
				});
			mask.pivot(x / 2, y / 2);
			this._maxSecond = Math.round(second);
			this.resetMask(0);
			this._passedSecond = 0;
			this._startTime = (new Date).getTime();
			this._leftTime = second;
			if (this._maxSecond > 0) {
				this.timerLoop(100, this, this._updateTime);
			}
		},
		resetMask: function (num) {
			var circle = this.getChildByName("container", "circle");
			var x = this._width / 2;
			var y = this._height / 2;
			var angle = this._angle * num;
			var r = Math.sqrt(x * x + y * y) + 8;
			var color = this.getRGBstr(num);
			circle.graphics.clear();
			circle.graphics.drawPie(x, y, r, this._startAngle + angle, 270, color);
		},
		stop: function () {
			if (this._leftTime <= 0) return;
			this.clearTimer(this, this._updateTime);
			this._leftTime = 0;
			this.resetMask(this._maxSecond);
		},
		_updateTime: function () {
			var delta = (new Date).getTime() - this._startTime;
			delta = delta / 1e3;
			this._passedSecond = Math.floor(delta);
			var num = this._maxSecond - this._passedSecond;
			this._leftTime = num;
			if (delta > this._maxSecond) {
				this.clearTimer(this, this._updateTime);
				this._leftTime = 0;
				this.resetMask(this._maxSecond);
			} else {
				this.resetMask(delta);
			}
		},
		getRGBstr: function (num) {
			var str = "";
			var rNum = 0;
			var gNum = 0;
			var bNum = 0;
			var rgbAdd = 500 / this._maxSecond * num;
			if (rgbAdd <= 255) {
				rNum = parseInt(rgbAdd);
				gNum = 255;
			} else {
				rNum = 255;
				gNum = parseInt(255 - (rgbAdd - 255));
			}
			str = "#" + this.getOneRGBstr(rNum) + this.getOneRGBstr(gNum) + this.getOneRGBstr(bNum);
			return str;
		},
		getOneRGBstr: function (num) {
			var ten = 0;
			var one = num;
			if (num >= 16) {
				ten = parseInt(num / 16);
				one = num - ten * 16;
			}
			var RGBstrList = confMgr.setting.RGBstr;
			var str = RGBstrList[ten] + RGBstrList[one];
			return str;
		}
	});
	return MaskClip;
});
gbx.define("game/baccarat/parts/player_list", ["gbx/render/display/sprite", "comm/base/command_ui", "comm/ui/sound_button", "conf/locallization", "comm/ui/ui_utils"], function (Sprite, BaseUI, Button, Localization, uiUtils) {
	var PlayerList = Sprite.extend({
		init: function (param) {
			this._super();
			var bg = uiUtils.createSprite("assets/main/public/mid_light_bg.png");
			bg.pos(0, 0);
			this.addChild(bg);
			var bar_1 = uiUtils.createSprite("assets/baccarat/tex/playerlist/titleBar.png", "");
			bar_1.pos(262, 2);
			bar_1.scaleY = -1;
			bar_1.scaleX = -1;
			this.addChild(bar_1);
			var path = "assets/baccarat/tex/playerlist/player_list_title.png";
			if (param == "dealer_list") {
				path = "assets/baccarat/tex/playerlist/player_list_up_title.png";
			}
			var playerListTitle = new Sprite;
			playerListTitle.setImage(path);
			playerListTitle.pos(80, -36);
			this.addChild(playerListTitle);
			var closeBtn_1 = new Button;
			closeBtn_1.name = "playerList_close";
			closeBtn_1.pos(-1e3, -1e3);
			closeBtn_1.width = 3e3;
			closeBtn_1.height = 3e3;
			closeBtn_1.setClickHandler(this, this.onClose);
			this.addChild(closeBtn_1);
			var playerList = uiUtils.createNormalList(1, 0, 3, "v", 260, 304, 304, 72);
			playerList.setRenderHandler(this, this._renderPlayerList);
			playerList.name = "list";
			this.addChild(playerList);
		},
		_renderPlayerList: function (cell, idx) {
			var data = this.getChildByName("list").array;
			if (idx >= data.length) return;
			cell.removeChildren();
			var cont = cell.getChildByName("cont");
			if (!cont) {
				cont = new Sprite;
				cont.name = "cont";
				cell.addChild(cont);
				var head = new Sprite;
				head.pos(10, 10);
				head.scale(.75);
				head.name = "head";
				cont.addChild(head);
				var name = uiUtils.createSimpleText("", "name");
				name.fontSize = 16;
				name.color = "#EBF6F8";
				name.pos(77, 15);
				cont.addChild(name);
				var money = uiUtils.createSimpleText("", "money");
				money.fontSize = 16;
				money.color = "#E8E969";
				money.pos(77, 37);
				money.stroke = 1;
				money.strokeColors = "#000000";
				cont.addChild(money);
				var split = uiUtils.createSprite("assets/baccarat/tex/playerlist/splitLine.png");
				split.pos(0, 72);
				cont.addChild(split);
				cont.getChildByName("head").setImage("assets/main/head/userhead_" + data[idx].playerIcon + ".png");
				cont.getChildByName("name").text = data[idx].nickName;
				cont.getChildByName("money").text = data[idx].roomCoin;
			}
		},
		onClose: function (btn) {
			this.visible = false;
		},
		setData: function (data) {
			this.getChildByName("list").array = [];
			this.getChildByName("list").array = data;
			this.getChildByName("list").refresh();
		},
		refresh: function () {
			this.getChildByName("list").refresh();
		},
		removePlayer: function (playerId, name) {
			if (this.name.indexOf(name) != -1) {
				var data = this.getChildByName("list").array;
				for (var i = 0; i < data.length; i++) {
					var temp = data[i];
					if (temp.playerId == playerId) {
						data.splice(i, 1);
						return data.length;
						break;
					}
				}
			}
			return 0;
		}
	});
	return PlayerList;
});
gbx.define("game/baccarat/parts/putchip_area", ["gbx/render/display/sprite", "gbx/render/display/text", "comm/helper/conf_mgr"], function (Sprite, Text, confMgr) {
	var areaTypeSize = [{
		width: 233,
		height: 117
	}, {
		width: 156,
		height: 117
	}],
		areaTypeBorder = ["assets/baccarat/tex/xian_fang0001.png", "assets/baccarat/tex/xian_banyuan0001.png", "assets/baccarat/tex/xian_banyuan0002.png"],
		facesPath = ["assets/baccarat/tex/mian_fang0001.png", "assets/baccarat/tex/mian_banyuan0001.png", "assets/baccarat/tex/mian_banyuan0002.png"],
		fixedPos = [null, {
			x: 45,
			y: 22
		}, {
				x: 65,
				y: 22
			}, {
				x: 17,
				y: 22
			}, {
				x: 15,
				y: 22
			}, {
				x: 15,
				y: 22
			}];
	var PutchipArea = Sprite.extend({
		init: function (type, rate, area) {
			this._super();
			this.name = area;
			this.blinkCount = 0;
			this.winCount = 0;
			this._beginTime = 0;
			var border = new Sprite;
			border.name = "border";
			border.alpha = 1;
			if (area > confMgr.definition.CHIP_AREA.FARMER) border.setImage(areaTypeBorder[0]);
			else if (area == confMgr.definition.CHIP_AREA.FARMER) border.setImage(areaTypeBorder[1]);
			else if (area == confMgr.definition.CHIP_AREA.BANKER) border.setImage(areaTypeBorder[2]);
			this.addChild(border);
			var face = new Sprite;
			face.alpha = 1;
			face.name = "face";
			if (area == confMgr.definition.CHIP_AREA.FARMERPAIR) face.setImage(facesPath[0]);
			else if (area == confMgr.definition.CHIP_AREA.BANKERPAIR) face.setImage(facesPath[0]);
			else if (area == confMgr.definition.CHIP_AREA.DEUCE) face.setImage(facesPath[0]);
			else if (area == confMgr.definition.CHIP_AREA.FARMER) face.setImage(facesPath[1]);
			else if (area == confMgr.definition.CHIP_AREA.BANKER) face.setImage(facesPath[2]);
			this.addChild(face);
			var betCount = new Text;
			betCount.text = "0";
			betCount.width = areaTypeSize[0].width;
			betCount.align = "center";
			betCount.color = "#ffffff";
			betCount.fontSize = 24;
			betCount.stroke = 2;
			betCount.alpha = 0;
			betCount.pos(fixedPos[area].x + 50, fixedPos[area].y + 20);
			betCount.name = "total_bet";
			this.addChild(betCount);
			var myBet = new Text;
			myBet.width = 120;
			myBet.text = "0";
			myBet.align = "center";
			myBet.color = "#ffffff";
			myBet.stroke = 1.5;
			myBet.strokeColor = "#000000";
			myBet.fontSize = 17;
			myBet.alpha = 0;
			myBet.pos(fixedPos[area].x, fixedPos[area].y + 70);
			myBet.name = "my_bet";
			this.addChild(myBet);
			if (area <= confMgr.definition.CHIP_AREA.FARMER) this.size(areaTypeSize[0].width, areaTypeSize[0].height);
			else this.size(areaTypeSize[1].width, areaTypeSize[1].height);
		},
		setClickHandler: function (context, handler, betType) {
			this.on(this.EVENT.MOUSE_UP, context, handler, [betType]);
		},
		setMyChips: function (chips) {
			this.getChildByName("my_bet").alpha = 0;
			if (chips > 0) this.getChildByName("my_bet").alpha = 1;
			this.getChildByName("my_bet").text = chips.toString().replace(/(\d)(?=(\d{3})+($|\.))/g, "$1,");
		},
		setTotalChips: function (chips) {
			this.getChildByName("total_bet").text = chips.toString().replace(/(\d)(?=(\d{3})+($|\.))/g, "$1,");
		},
		reset: function () {
			this.getChildByName("total_bet").text = 0;
			this.getChildByName("my_bet").text = 0;
			this.getChildByName("my_bet").alpha = 0;
			this.getChildByName("border").alpha = 0;
			this.getChildByName("face").alpha = 0;
			this.blinkCount = 0;
		},
		blinkBorder: function (stopBlink) {
			var border = this.getChildByName("border");
			var face = this.getChildByName("face");
			face.alpha = 0;
			if (stopBlink) {
				border.alpha = 0;
				return;
			}
			if (this.blinkCount > 2) {
				border.alpha = 0;
				return;
			}
			border.alpha = 0;
			this.timerOnce(200, this, function () {
				border.alpha = 1;
				this.timerOnce(400, this, function () {
					border.alpha = 0;
					this.blinkCount++;
					this.blinkBorder();
				});
			});
		},
		showBorder: function () {
			this.getChildByName("border").alpha = 1;
		},
		enable: function (stopBlink) {
			this.blinkBorder(stopBlink);
		},
		showFace: function () {
			this.getChildByName("face").alpha = 1;
		},
		blinkFace: function () {
			if (this.winCount > 5) {
				this.winCount = 0;
				return;
			}
			var face = this.getChildByName("face");
			this.timerOnce(200, this, function () {
				face.alpha = 1;
				this.timerOnce(800, this, function () {
					face.alpha = 0;
					this.winCount++;
					this.blinkFace();
				});
			});
		},
		blinkBorder1: function () {
			this.getChildByName("border").alpha = 1;
			this.getChildByName("border").tweenTo({
				alpha: 1 - this.getChildByName("border").alpha
			}, 750, "sineInOut", this, function () { });
		},
		disable: function () {
			var border = this.getChildByName("border");
			border.tweenCancel();
			border.alpha = 0;
			var face = this.getChildByName("face");
			face.tweenCancel();
			face.alpha = 0;
			this.blinkCount = 0;
		},
		end: function () {
			this.offAll(this.EVENT.MOUSE_UP);
			this._super();
		}
	});
	return PutchipArea;
});
gbx.define("game/baccarat/parts/putchip_area_mi", ["conf/system", "gbx/render/display/sprite", "gbx/render/display/text", "comm/helper/conf_mgr", "comm/ui/ui_utils"], function (sys, Sprite, Text, confMgr, uiUtils) {
	var areaTypeSize = [{
		width: 619,
		height: 310
	}],
		areaTypeBorder = ["assets/baccarat/tex/mi_border_banker.png", "assets/baccarat/tex/mi_border_farmer.png", "assets/baccarat/tex/mi_border_duece.png", "assets/baccarat/tex/mi_border_banker_pair.png", "assets/baccarat/tex/mi_border_farmer_pair.png"],
		facesPath = ["assets/baccarat/tex/mi_mian_banker.png", "assets/baccarat/tex/mi_mian_farmer.png", "assets/baccarat/tex/mi_mian_duece.png", "assets/baccarat/tex/mi_mian_banker_pair.png", "assets/baccarat/tex/mi_mian_farmer_pair.png"],
		fixedBorderPos = [{
			x: sys.halfWidth,
			y: 121
		}, {
			x: sys.halfWidth,
			y: 153
		}, {
			x: sys.halfWidth,
			y: 170
		}, {
			x: sys.halfWidth + 145,
			y: 92
		}, {
			x: sys.halfWidth - 145,
			y: 92
		}],
		bankerBetPos = [{
			x: 78,
			y: 563
		}, {
			x: 113,
			y: 700
		}, {
			x: 210,
			y: 792
		}, {
			x: 495,
			y: 708
		}, {
			x: 533,
			y: 570
		}],
		farmerBetPos = [{
			x: 22,
			y: 556
		}, {
			x: 67,
			y: 750
		}, {
			x: 184,
			y: 850
		}, {
			x: 538,
			y: 765
		}, {
			x: 594,
			y: 560
		}],
		dueceBetPos = [{
			x: 237,
			y: 750
		}, {
			x: 266,
			y: 750
		}, {
			x: 308,
			y: 750
		}, {
			x: 339,
			y: 750
		}, {
			x: 375,
			y: 750
		}],
		bankerPairBetPos = [{
			x: 404,
			y: 700
		}, {
			x: 433,
			y: 679
		}, {
			x: 449,
			y: 640
		}, {
			x: 450,
			y: 607
		}, {
			x: 449,
			y: 570
		}],
		farmerPairBetPos = [{
			x: 206,
			y: 700
		}, {
			x: 180,
			y: 679
		}, {
			x: 164,
			y: 640
		}, {
			x: 163,
			y: 607
		}, {
			x: 163,
			y: 570
		}];
	var PutchipAreaMi = Sprite.extend({
		init: function () {
			this._super();
			this._borderBlinkCount = [0, 0, 0, 0, 0];
			this._faceBlinkCount = [0, 0, 0, 0, 0];
			this.size(areaTypeSize[0].width, areaTypeSize[0].height);
			this.myBetsLabsDic = [];
			this._beginTime = 0;
			for (var i = 0; i < 5; i++) {
				var border = new Sprite;
				border.setImage(areaTypeBorder[i]);
				border.pivotToCenter();
				border.pos(fixedBorderPos[i].x, fixedBorderPos[i].y);
				border.name = "border_" + (i + 1);
				border.alpha = 1;
				this.addChild(border);
			}
			for (var i = 0; i < 5; i++) {
				var face = new Sprite;
				face.setImage(facesPath[i]);
				face.pivotToCenter();
				face.pos(fixedBorderPos[i].x, fixedBorderPos[i].y);
				face.name = "face_" + (i + 1);
				face.alpha = 1;
				this.addChild(face);
			}
			var ui = this;
			CreateBetList(ui, "my_bet_1_", bankerBetPos);
			CreateBetList(ui, "my_bet_2_", farmerBetPos);
			CreateBetList(ui, "my_bet_3_", dueceBetPos);
			CreateBetList(ui, "my_bet_4_", bankerPairBetPos);
			CreateBetList(ui, "my_bet_5_", farmerPairBetPos);

			function CreateBetList(parent, str, posArray) {
				for (var i = 0; i < posArray.length; i++) {
					var mybet = uiUtils.createSimpleText("", str + (i + 1));
					mybet.pos(posArray[i].x - 40, posArray[i].y - 564);
					mybet.align = "center";
					mybet.color = "#ffffff";
					mybet.width = 100;
					mybet.fontSize = 17;
					mybet.rotation = 0;
					mybet.alpha = 0;
					mybet.stroke = 1.5;
					mybet.strokeColor = "#000000";
					parent.addChild(mybet);
					parent.myBetsLabsDic.push(mybet);
				}
			}
		},
		setClickHandler: function (context, handler, betType) {
			this.on(this.EVENT.MOUSE_UP, context, handler, [betType]);
		},
		disableMyBets: function () {
			for (var i = 0; i < this.myBetsLabsDic.length; i++) {
				this.myBetsLabsDic[i].alpha = 0;
				this.myBetsLabsDic[i].text = "";
			}
		},
		setMyChips: function (area, seatIdx, chips) {
			if (seatIdx == -1) return;
			if (area == -1) {
				this.disableMyBets();
			} else {
				if (this.getChildByName("my_bet_" + area + "_" + (seatIdx + 1)) == null) {
					console.log("座位错误:" + area + "," + seatIdx);
					return;
				}
				this.getChildByName("my_bet_" + area + "_" + (seatIdx + 1)).alpha = 0;
				if (chips > 0) this.getChildByName("my_bet_" + area + "_" + (seatIdx + 1)).alpha = 1;
				this.getChildByName("my_bet_" + area + "_" + (seatIdx + 1)).text = chips.toString().replace(/(\d)(?=(\d{3})+($|\.))/g, "$1,");
			}
		},
		setTotalChips: function (area, seatIdx, chips) { },
		reset: function () {
			for (var i = 0; i < 5; i++) {
				var border = this.getChildByName("border_" + (i + 1));
				border.tweenCancel();
				border.alpha = 0;
			}
			this.disableMyBets();
			for (var i = 0; i < 5; i++) {
				var face = this.getChildByName("face_" + (i + 1));
				face.tweenCancel();
				face.alpha = 0;
			}
			this._faceBlinkCount = [0, 0, 0, 0, 0];
			this._borderBlinkCount = [0, 0, 0, 0, 0];
		},
		blinkBorder: function (i, stopBlink) {
			var border = this.getChildByName("border_" + i);
			var face = this.getChildByName("face_" + i);
			face.alpha = 0;
			if (stopBlink) {
				border.alpha = 0;
				return;
			}
			if (this._borderBlinkCount[i - 1] > 2) {
				border.alpha = 0;
				return;
			}
			border.alpha = 0;
			this.timerOnce(200, this, function () {
				border.alpha = 1;
				this.timerOnce(400, this, function () {
					border.alpha = 0;
					this._borderBlinkCount[i - 1]++;
					this.blinkBorder(i);
				});
			});
		},
		enable: function (stopBlink) {
			this.blinkBorder(1, stopBlink);
			this.blinkBorder(2, stopBlink);
			this.blinkBorder(3, stopBlink);
			this.blinkBorder(4, stopBlink);
			this.blinkBorder(5, stopBlink);
		},
		showFace: function () {
			this.getChildByName("face").alpha = 1;
		},
		blinkFace: function (area) {
			if (this._faceBlinkCount[area - 1] > 5) {
				this._faceBlinkCount[area - 1] = 0;
				return;
			}
			var face = this.getChildByName("face_" + area);
			this.timerOnce(200, this, function (id) {
				face.alpha = 1;
				this.timerOnce(800, this, function () {
					face.alpha = 0;
					this._faceBlinkCount[id - 1]++;
					this.blinkFace(id);
				});
			}, [area]);
		},
		blinkBorder1: function (area) {
			this.getChildByName("border_" + area).alpha = 1;
			this.getChildByName("border_" + area).tweenTo({
				alpha: 1 - this.getChildByName("border_" + area).alpha
			}, 750, "sineInOut", this, function () { });
		},
		disable: function () {
			for (var i = 0; i < 5; i++) {
				var border = this.getChildByName("border_" + (i + 1));
				border.tweenCancel();
				border.alpha = 0;
			}
			for (var i = 0; i < 5; i++) {
				var face = this.getChildByName("face_" + (i + 1));
				face.tweenCancel();
				face.alpha = 0;
			}
			this._faceBlinkCount = [0, 0, 0, 0, 0];
			this._borderBlinkCount = [0, 0, 0, 0, 0];
		},
		end: function () {
			this.offAll(this.EVENT.MOUSE_UP);
			this._super();
		}
	});
	return PutchipAreaMi;
});
gbx.define("game/baccarat/parts/putchip_area_lhd", ["gbx/render/display/sprite", "gbx/render/display/text", "comm/helper/conf_mgr"], function (Sprite, Text, confMgr) {
	var areaTypeSize = [{
		width: 233,
		height: 117
	}, {
		width: 156,
		height: 117
	}],
		areaTypeBorder = ["assets/baccarat/tex/xian_fang0001_lhd.png", "assets/baccarat/tex/xian_banyuan0001_lhd.png", "assets/baccarat/tex/xian_banyuan0002_lhd.png", "assets/baccarat/tex/xian_fang0002_lhd.png"],
		facesPath = ["assets/baccarat/tex/mian_fang0001_lhd.png", "assets/baccarat/tex/mian_banyuan0001_lhd.png", "assets/baccarat/tex/mian_banyuan0002_lhd.png", "assets/baccarat/tex/mian_fang0002_lhd.png"],
		fixedPos = [null, {
			x: 45,
			y: 22
		}, {
				x: 65,
				y: 22
			}, {
				x: 17,
				y: 22
			}, {
				x: 15,
				y: 5
			}, {
				x: 15,
				y: 5
			}, {
				x: 15,
				y: 5
			}, {
				x: 15,
				y: 5
			}, {
				x: 15,
				y: 5
			}, {
				x: 15,
				y: 5
			}, {
				x: 15,
				y: 5
			}, {
				x: 15,
				y: 5
			}];
	var PutchipArea = Sprite.extend({
		init: function (type, rate, area) {
			this._super();
			this.name = area;
			this.blinkCount = 0;
			this.winCount = 0;
			this._beginTime = 0;
			var border = new Sprite;
			border.name = "border";
			border.alpha = 1;
			if (area > confMgr.definition.CHIP_AREA.DEUCE) border.setImage(areaTypeBorder[0]);
			else if (area == confMgr.definition.CHIP_AREA.DEUCE) border.setImage(areaTypeBorder[3]);
			else if (area == confMgr.definition.CHIP_AREA.FARMER) border.setImage(areaTypeBorder[1]);
			else if (area == confMgr.definition.CHIP_AREA.BANKER) border.setImage(areaTypeBorder[2]);
			this.addChild(border);
			var face = new Sprite;
			face.alpha = 1;
			face.name = "face";
			if (area > confMgr.definition.CHIP_AREA.DEUCE) face.setImage(facesPath[0]);
			else if (area == confMgr.definition.CHIP_AREA.DEUCE) face.setImage(facesPath[3]);
			else if (area == confMgr.definition.CHIP_AREA.FARMER) face.setImage(facesPath[1]);
			else if (area == confMgr.definition.CHIP_AREA.BANKER) face.setImage(facesPath[2]);
			this.addChild(face);
			var betCount = new Text;
			betCount.text = "0";
			betCount.width = areaTypeSize[0].width;
			betCount.align = "center";
			betCount.color = "#ffffff";
			betCount.fontSize = 24;
			betCount.stroke = 2;
			betCount.alpha = 0;
			betCount.pos(fixedPos[area].x + 50, fixedPos[area].y + 20);
			betCount.name = "total_bet";
			this.addChild(betCount);
			var myBet = new Text;
			myBet.width = 120;
			myBet.text = "0";
			myBet.align = "center";
			myBet.color = "#ffffff";
			myBet.stroke = 1.5;
			myBet.strokeColor = "#000000";
			myBet.fontSize = 17;
			myBet.alpha = 0;
			myBet.pos(fixedPos[area].x, fixedPos[area].y + 70);
			myBet.name = "my_bet";
			this.addChild(myBet);
			if (area <= confMgr.definition.CHIP_AREA.FARMER) this.size(areaTypeSize[0].width, areaTypeSize[0].height);
			else this.size(areaTypeSize[1].width, areaTypeSize[1].height);
		},
		setClickHandler: function (context, handler, betType) {
			this.on(this.EVENT.MOUSE_UP, context, handler, [betType]);
		},
		setMyChips: function (chips) {
			this.getChildByName("my_bet").alpha = 0;
			if (chips > 0) this.getChildByName("my_bet").alpha = 1;
			this.getChildByName("my_bet").text = chips.toString().replace(/(\d)(?=(\d{3})+($|\.))/g, "$1,");
		},
		setTotalChips: function (chips) {
			this.getChildByName("total_bet").text = chips.toString().replace(/(\d)(?=(\d{3})+($|\.))/g, "$1,");
		},
		reset: function () {
			this.getChildByName("total_bet").text = 0;
			this.getChildByName("my_bet").text = 0;
			this.getChildByName("my_bet").alpha = 0;
			this.getChildByName("border").alpha = 0;
			this.getChildByName("face").alpha = 0;
			this.blinkCount = 0;
		},
		blinkBorder: function (stopBlink) {
			var border = this.getChildByName("border");
			var face = this.getChildByName("face");
			face.alpha = 0;
			if (stopBlink) {
				border.alpha = 0;
				return;
			}
			if (this.blinkCount > 2) {
				border.alpha = 0;
				return;
			}
			border.alpha = 0;
			this.timerOnce(200, this, function () {
				border.alpha = 1;
				this.timerOnce(400, this, function () {
					border.alpha = 0;
					this.blinkCount++;
					this.blinkBorder();
				});
			});
		},
		showBorder: function () {
			this.getChildByName("border").alpha = 1;
		},
		enable: function (stopBlink) {
			this.blinkBorder(stopBlink);
		},
		showFace: function () {
			this.getChildByName("face").alpha = 1;
		},
		blinkFace: function () {
			if (this.winCount > 5) {
				this.winCount = 0;
				return;
			}
			var face = this.getChildByName("face");
			this.timerOnce(200, this, function () {
				face.alpha = 1;
				this.timerOnce(800, this, function () {
					face.alpha = 0;
					this.winCount++;
					this.blinkFace();
				});
			});
		},
		blinkBorder1: function () {
			this.getChildByName("border").alpha = 1;
			this.getChildByName("border").tweenTo({
				alpha: 1 - this.getChildByName("border").alpha
			}, 750, "sineInOut", this, function () { });
		},
		disable: function () {
			var border = this.getChildByName("border");
			border.tweenCancel();
			border.alpha = 0;
			var face = this.getChildByName("face");
			face.tweenCancel();
			face.alpha = 0;
			this.blinkCount = 0;
		},
		end: function () {
			this.offAll(this.EVENT.MOUSE_UP);
			this._super();
		}
	});
	return PutchipArea;
});
gbx.define("game/baccarat/parts/seat", ["comm/ui/sound_button", "gbx/render/display/sprite", "gbx/render/display/text", "comm/ui/ui_utils", "game/baccarat/parts/mask_clip", "comm/helper/playerdata_mgr"], function (Button, Sprite, Text, uiUtils, MaskClip, playerDataMgr) {
	var Seat = Sprite.extend({
		init: function (isDealer, index, isJM) {
			this._super();
			this._inSeat = false;
			this._index = index;
			this._isJM = isJM;
			this._isDealer = isDealer;
			this._isMe = false;
			this._lastChips = 0;
			var outline = new Sprite;
			outline.name = "player_ouline";
			if (isDealer) {
				outline.setImage("assets/baccarat/tex/frame_player.png");
				this.size(139, 155);
			} else {
				outline.setImage("assets/baccarat/tex/player_head_bg.png");
				this.size(90, 90);
			}
			outline.pivotToCenter();
			outline.visible = false;
			this.addChild(outline);
			var back = new Sprite;
			back.name = "player_frame";
			if (isDealer) this.size(139, 155);
			else this.size(90, 90);
			back.pivotToCenter();
			back.visible = false;
			this.addChild(back);
			var maskClip = new MaskClip;
			maskClip.name = "maskClip";
			maskClip.zOrder = 1;
			back.addChild(maskClip);
			var head = new Sprite;
			head.name = "player_head";
			head.setImage("assets/main/head/userhead_0.png");
			head.pivotToCenter();
			if (isDealer) head.pos(0, 0);
			else head.pos(0, 0);
			head.zOrder = 2;
			head.scale(.87);
			back.addChild(head);
			maskClip.pos(-head.width * .87 / 2, -head.height * .87 / 2);
			var name = new Text;
			name.name = "player_name";
			name.text = "";
			name.fontSize = 18;
			name.color = "#ffffff";
			name.width = 80;
			name.align = "center";
			if (isDealer) {
				name.pos(-40, -64);
			} else {
				name.pos(2.5, 64 - 58);
				name.visible = false;
			}
			name.overflow = "hidden";
			back.addChild(name);
			if (!isDealer) {
				var shadow = new Sprite;
				shadow.graphics.drawRect(0, 0, 70, 20, "#000000");
				shadow.alpha = .5;
				shadow.pivotToCenter();
				shadow.pos(-35, 36);
				shadow.zOrder = -1;
				shadow.name = "shadow";
				shadow.visible = false;
				this.addChild(shadow);
			}
			var bet = new Text;
			bet.name = "player_chips";
			bet.text = "";
			bet.fontSize = 14;
			bet.color = "#E2E365";
			bet.width = 85;
			if (isDealer) {
				bet.pos(-20, 40);
				bet.align = "left";
			} else {
				bet.pos(-45, 40);
				bet.align = "center";
			}
			back.addChild(bet);
			var balance = new Text;
			balance.text = "0";
			balance.fontSize = 20;
			balance.color = "#E2E365";
			balance.align = "center";
			balance.width = 85;
			balance.alpha = 0;
			balance.bold = true;
			balance.name = "player_balance";
			back.addChild(balance);
			var seat = new Button;
			seat.setSkinImage("assets/baccarat/tex/button_sit.png");
			seat.stateNum = 2;
			seat.pivotToCenter();
			seat.name = "chair";
			seat.setClickHandler(this, this._onSeatClick);
			this.addChild(seat);
			this.subscribe("game_baccarat.seat.startMaskClip", this, this.eventStartMaskClip);
			this.subscribe("game_baccarat.seat.stopMaskClip", this, this.eventStopMaskClip);
			this.subscribe("game_baccarat.seat.checkShowChair", this, this.eventCheckShowChair);
		},
		eventStartMaskClip: function (seatIdx, time) {
			if (this._index == seatIdx) this.startMaskClip(time);
		},
		eventStopMaskClip: function (seatIdx, force) {
			if (force) this.stopMaskClip();
			else if (this._index == seatIdx) this.stopMaskClip();
		},
		eventCheckShowChair: function () {
			if (this._inSeat) {
				this.getChildByName("chair").visible = false;
				return;
			}
			if (!this._isJM) {
				this.getChildByName("chair").visible = true;
				return;
			}
			if (playerDataMgr.getSeatIdx() != -1) {
				this.getChildByName("chair").visible = false;
			} else {
				this.getChildByName("chair").visible = true;
			}
		},
		startMaskClip: function (time) {
			if (!this._inSeat) return;
			if (time <= 0) return;
			var headImage = this.getChildByName("player_frame", "player_head");
			this.getChildByName("player_frame", "maskClip").start(time, headImage.width * .87, headImage.height * .87);
		},
		stopMaskClip: function () {
			this.getChildByName("player_frame", "maskClip").stop();
		},
		_onSeatClick: function () {
			this.publish("game_baccarat.command.require_showed_seat", this._index);
		},
		showChips: function (chips) {
			this._lastChips = chips;
			var mtx = "";
			if (chips > 1e8) {
				var t = Math.floor(chips / 1e8);
				mtx += t + "亿";
				chips -= t * 1e8;
			}
			if (chips > 1e4) {
				chips = Math.floor(chips / 1e3) / 10 + "万";
			} else chips = uiUtils.getFloatByPower(chips, 1);
			this.getChildByName("player_frame", "player_chips").text = mtx + chips;
		},
		playEmoji: function (pic) {
			var emoji = new Sprite;
			emoji.setImage("assets/main/emoji/" + pic);
			emoji.pivotToCenter();
			emoji.pos(0, 0);
			emoji.zOrder = 10;
			this.getChildByName("player_frame").addChild(emoji);
			emoji.tweenTo({
				scaleX: 1,
				scaleY: 1
			}, 300, "backIn");
			emoji.tweenTo({
				scaleX: 0,
				scaleY: 0
			}, 300, "backOut", emoji, emoji.destroy, null, 3300);
		},
		playerIn: function (name, head, chips, isMe) {
			if (!head) head = 0;
			this._inSeat = true;
			this._isMe = isMe;
			this.getChildByName("player_frame").visible = true;
			if (this._isDealer || isMe) this.getChildByName("player_ouline").visible = true;
			var headImage = this.getChildByName("player_frame", "player_head");
			headImage.setImage("assets/main/head/userhead_" + head + ".png");
			this.getChildByName("player_frame", "player_name").text = name;
			this.showChips(chips);
			if (this._isJM) this.getChildByName("shadow").visible = true;
			this.eventCheckShowChair();
		},
		playerOut: function () {
			this.getChildByName("chair").visible = true;
			this.getChildByName("player_frame").visible = false;
			this.getChildByName("player_ouline").visible = false;
			this.getChildByName("shadow").visible = false;
			this._inSeat = false;
			this._isMe = false;
			this.eventCheckShowChair();
		},
		isInSeat: function () {
			return this._inSeat;
		}
	});
	return Seat;
});
gbx.define("game/baccarat/parts/shuffle_card", ["conf/system", "gbx/net/connector", "gbx/net/messagecommand", "gbx/net/errorcode", "gbx/render/display/sprite", "comm/base/command_ui", "game/baccarat/parts/card", "comm/helper/room_mgr", "comm/helper/playerdata_mgr", "comm/ui/ui_utils", "conf/ui_locallization"], function (sys, server, CMD, ERROR_CODE, Sprite, BaseUI, Card, RoomMgr, playerDataMgr, uiUtils, uiLocallization) {
	var PosY = 150;
	var flyHeight = 20;
	var Halfwidth = 42;
	var leftLimit = 180;
	var CardCount = 10;
	var blackIndex = 8;
	var redStartIdx = 2;
	var initredPosDx = -20;
	var initredPosDy = 30;
	var redPosDx = -2;
	var redPosDy = 2;
	var diePos = {
		x: 180,
		y: 0
	};
	var parentY = 80;
	var WashCard = BaseUI.extend({
		init: function () {
			this._super();
			this._canShufflePlayerId = "";
			this._canclick = true;
			this._batchArray = [];
			this._leftTime = 0;
			this._playerName = null;
			var parent = new Sprite;
			parent.name = "parent";
			parent.visible = false;
			parent.pos(0, parentY);
			this.addChild(parent);
			var playerName = uiUtils.createSimpleText(uiLocallization.shufflePlayer, "playerName");
			playerName.pos(-200, -80);
			playerName.width = 400;
			playerName.fontSize = 20;
			playerName.align = "center";
			parent.addChild(playerName);
			for (var i = 0; i < CardCount; i++) {
				var batchCard = uiUtils.createSprite("assets/baccarat/tex/effect/batch_Card.png");
				batchCard.name = i;
				this._batchArray.push(batchCard);
				batchCard.on(this.EVENT.MOUSE_UP, this, this.onChoose, [batchCard.name]);
				batchCard.zOrder = 3 * i;
				batchCard.pivotToCenter();
				batchCard.pos(-leftLimit + Halfwidth * i, PosY);
				parent.addChild(batchCard);
			}
			var cutCard_red = uiUtils.createSprite("assets/baccarat/tex/effect/cut_Card_red.png", "");
			cutCard_red.name = "cutCard_red";
			cutCard_red.pos(-leftLimit + Halfwidth * redStartIdx + initredPosDx, PosY + initredPosDy);
			cutCard_red.zOrder = 3 * redStartIdx + 1;
			cutCard_red.pivotToCenter();
			parent.addChild(cutCard_red);
			var cutCard_black = uiUtils.createSprite("assets/baccarat/tex/effect/cut_Card_black.png", "");
			cutCard_black.name = "cutCard_black";
			cutCard_black.visible = false;
			cutCard_black.pivotToCenter();
			parent.addChild(cutCard_black);
			this.timerLoop(1e3, this, function () {
				if (this._leftTime - 1 > 0) {
					this._leftTime -= 1;
				} else this._leftTime = 0;
				this.updateTime();
			});
		},
		updateTime: function () {
			var parent = this.getChildByName("parent");
			var myName = parent.getChildByName("playerName");
			var time = "";
			if (this._leftTime > 9) time = this._leftTime;
			else time = "0" + this._leftTime;
			if (this._playerName) {
				var str = uiLocallization.shufflePlayer;
				str = str.replace("A", this._playerName);
				myName.text = str + "  " + time;
			} else myName.text = "";
		},
		onChoose: function (name) {
			if (this._canShufflePlayerId != playerDataMgr.getMyUID()) return;
			var index = parseInt(name);
			var sendMsg = gtea.protobuf.encode("BaccaratShuffleEnd", {
				par: index
			});
			server.sendToRoom(CMD.BaccaratShuffleEnd, sendMsg);
		},
		onSyncShuffle: function (idx, cardValue, cardNum) {
			this._leftTime = 0;
			this._playerName = null;
			this.updateTime();
			var parent = this.getChildByName("parent");
			if (!this._canclick) return;
			this._canclick = false;
			var cutCard_red = this.getChildByName("parent", "cutCard_red");
			var cutCard_black = this.getChildByName("parent", "cutCard_black");
			var index = idx;
			if (index == CardCount - 1) index = CardCount - 2;
			cutCard_red.pos(-leftLimit + Halfwidth * index + initredPosDx, PosY + initredPosDy);
			cutCard_red.zOrder = 3 * index + 1;
			cutCard_red.tweenTo({
				x: -leftLimit + Halfwidth * index + redPosDx,
				y: PosY + redPosDy
			}, 200, "linearOut");
			this.timerOnce(200, this, function () {
				var moveArray = [];
				for (var i = this._batchArray.length - 1; i > index; i--) {
					var temp = this._batchArray[i];
					moveArray.push(temp);
					this._batchArray.splice(i, 1);
				}
				moveArray.reverse();
				for (var i = 0; i < moveArray.length; i++) {
					moveArray[i].tweenTo({
						y: flyHeight
					}, 500, "linearOut");
				}
				cutCard_red.tweenTo({
					y: flyHeight + redPosDy
				}, 500, "linearOut");
				this.timerOnce(200, this, function () {
					for (var i = 0; i < this._batchArray.length; i++) {
						var temp = this._batchArray[i];
						var length = this._batchArray.length;
						var tarX = temp.x + (CardCount - length) * Halfwidth;
						temp.tweenTo({
							x: tarX
						}, 800, "linearOut");
					}
				});
				this.timerOnce(1200, this, function () {
					var length = moveArray.length;
					var dis = (CardCount - length) * Halfwidth + 55;
					for (var i = 0; i < moveArray.length; i++) {
						var tarX = moveArray[i].x - dis;
						moveArray[i].tweenTo({
							x: tarX
						}, 800, "linearOut");
					}
					var tarRx = cutCard_red.x - dis + redPosDx;
					cutCard_red.tweenTo({
						x: tarRx
					}, 800, "linearOut");
				});
				this.timerOnce(2e3, this, function () {
					for (var i = 0; i < this._batchArray.length; i++) {
						var temp = this._batchArray[i];
						temp.zOrder = temp.zOrder + 100;
					}
					for (var i = 0; i < moveArray.length; i++) {
						moveArray[i].tweenTo({
							x: moveArray[i].x + 55,
							y: PosY
						}, 400, "linearOut");
					}
					cutCard_red.tweenTo({
						x: cutCard_red.x + 55,
						y: PosY + redPosDy
					}, 400, "linearOut");
					this.timerOnce(400, this, function () {
						for (var i = 0; i < this._batchArray.length; i++) {
							var temp = this._batchArray[i];
							moveArray.push(temp);
						}
						this._batchArray = moveArray;
						for (var i = 0; i < this._batchArray.length; i++) {
							var temp = this._batchArray[i];
							temp.name = i;
							temp.zOrder = 3 * i;
							temp.on(this.EVENT.MOUSE_UP, this, this.onChoose, [temp.name]);
						}
						cutCard_red.zOrder = -1;
					});
				});
				this.timerOnce(2400, this, function () {
					var posX = -leftLimit + Halfwidth * blackIndex;
					cutCard_black.visible = true;
					cutCard_black.pos(posX - 55, -100);
					cutCard_black.zOrder = 3 * blackIndex + 1;
					cutCard_black.tweenTo({
						x: posX - redPosDx - 5,
						y: PosY + redPosDy
					}, 500, "linearOut");
				});
				this.timerOnce(3200, this, function () {
					var parent = this.getChildByName("parent");
					parent.tweenTo({
						x: diePos.x,
						y: diePos.y,
						rotation: -20,
						scaleX: 0,
						scaleY: 0
					}, 300, "linearOut", this, function () {
						this.reset();
					});
				});
				this.timerOnce(3800, this, function () {
					this.playAnimation(cardValue, cardNum);
				});
			});
		},
		reset: function () {
			var parent = this.getChildByName("parent");
			parent.visible = false;
			parent.rotation = 0;
			parent.scale(1, 1);
			parent.pos(0, parentY);
			var cutCard_red = this.getChildByName("parent", "cutCard_red");
			cutCard_red.pos(-leftLimit + Halfwidth * redStartIdx + initredPosDx, PosY + initredPosDy);
			cutCard_red.zOrder = 3 * redStartIdx + 1;
			var cutCard_black = this.getChildByName("parent", "cutCard_black");
			cutCard_black.visible = false;
			this._canclick = true;
			for (var i = 0; i < this._batchArray.length; i++) {
				var batchCard = this._batchArray[i];
				batchCard.name = i;
				batchCard.on(this.EVENT.MOUSE_UP, this, this.onChoose, [batchCard.name]);
				batchCard.zOrder = 3 * i;
				batchCard.pivotToCenter();
				batchCard.pos(-leftLimit + Halfwidth * i, PosY);
			}
		},
		openShuffle: function (playerId, playerName, time) {
			var parent = this.getChildByName("parent");
			parent.visible = true;
			this._canShufflePlayerId = playerId;
			this._canclick = true;
			this._leftTime = time;
			this._playerName = playerName;
		},
		playAnimation: function (cardValue, cardNum) {
			var baseDelay = 500;
			var sPos = {
				x: 224,
				y: -16
			};
			var dPos = {
				x: -208,
				y: 5
			};
			var cardArray = [];
			for (var i = 0; i <= cardNum; i++) {
				var card = new Card;
				card.cardValue = cardValue;
				card.scale(.32);
				card.pos(sPos.x, sPos.y);
				card.pivotToCenter();
				if (i == 0) card.showFace();
				else card.showBack();
				card.visible = false;
				this.addChild(card);
				cardArray.push(card);
			}
			var posArr = [{
				x: 0,
				y: -50
			}, {
				x: -160,
				y: 50
			}, {
				x: -80,
				y: 50
			}, {
				x: 0,
				y: 50
			}, {
				x: 80,
				y: 50
			}, {
				x: 160,
				y: 50
			}, {
				x: -160,
				y: 190
			}, {
				x: -80,
				y: 190
			}, {
				x: 0,
				y: 190
			}, {
				x: 80,
				y: 190
			}, {
				x: 160,
				y: 190
			}];
			if (cardNum == 1) {
				posArr[1].x = 0;
			} else if (cardNum == 2) {
				posArr[1].x = -40;
				posArr[2].x = 40;
			}
			var deltaDelay = 200;
			for (var i = 0; i <= cardNum; i++) {
				this.timerOnce(baseDelay, cardArray[i], function (pos) {
					this.visible = true;
					this.flyToAndScaleWithTime(pos.x, pos.y, 0, .32, 400);
				}, [posArr[i]]);
				baseDelay += deltaDelay;
			}
			baseDelay += 1e3;
			deltaDelay = 100;
			for (var i = 0; i <= cardNum; i++) {
				this.timerOnce(baseDelay, this, function (index) {
					cardArray[index].flyToAndScaleWithTime(dPos.x, dPos.y, .32, 0, 400, cardArray[index], function () {
						this.removeSelf();
					});
					this.parent.minusElapseCardCount();
				}, [i]);
				baseDelay += deltaDelay;
			}
		}
	});
	return WashCard;
});
gbx.define("game/baccarat/parts/sound_panel", ["gbx/net/messagecommand", "gbx/net/errorcode", "gbx/net/errorcode_des", "gbx/net/connector", "gbx/render/display/sprite", "comm/base/command_ui", "comm/ui/sound_button", "comm/helper/conf_mgr", "comm/helper/room_mgr", "comm/helper/playerdata_mgr", "comm/ui/ui_utils", "conf/ui_locallization"], function (CMD, ERROR_CODE, ERROR_CODE_DES, server, Sprite, BaseUI, Button, confMgr, RoomMgr, playerDataMgr, uiUtils, uiLocallization) {
	var SoundPanel = BaseUI.extend({
		init: function () {
			this._super();
			this._step = -1;
			var soundBtnNames = ["11", "22", "33", "44", "55", "66", "77"];
			for (var i = 0; i < soundBtnNames.length; i++) {
				var button = uiUtils.createButton("assets/baccarat/tex/soundBtn.png", 2, soundBtnNames[i]);
				button.pos(-2 + i * 92, 4);
				button.scale(1.2);
				var text = uiUtils.createSimpleText(uiLocallization[soundBtnNames[i]]);
				text.fontSize = 20;
				text.width = 40;
				text.align = "center";
				text.bold = true;
				text.pos(18, 9);
				button.addChild(text);
				button.setClickHandler(this, this.onClickSoundBtn);
				this.addChild(button);
			}
			this.subscribe("game_baccarat.play.playSound", this, this.eventPlaySound);
		},
		onClickSoundBtn: function (btn) {
			var str = btn.name;
			var sendData = gtea.protobuf.encode("RequestBooing", {
				ItemId: parseInt(str)
			}, 150, 9);
			server.sendToRoom(CMD.BaccaratLookSoundJM, sendData);
		},
		setStep: function (step) {
			this._step = step;
		},
		eventPlaySound: function (str) {
			uiUtils.playSound(str);
		}
	});
	return SoundPanel;
});
gbx.define("game/baccarat/parts/top_card_panel", ["conf/system", "gbx/net/messagecommand", "gbx/net/errorcode", "gbx/net/errorcode_des", "gbx/net/connector", "comm/base/game_ui", "gbx/render/display/sprite", "gbx/render/display/text", "comm/ui/sound_button", "game/baccarat/parts/card", "game/baccarat/parts/card_mi", "comm/helper/sound_mgr", "comm/helper/conf_mgr", "comm/ui/ui_utils"], function (sys, CMD, ERROR_CODE, ERROR_CODE_DES, server, BaseUI, Sprite, Text, Button, Card, CardMi, soundMgr, confMgr, uiUtils) {
	var TopCard = BaseUI.extend({
		init: function () {
			this._super();
			this._topCardFarmer = [];
			this._topCardBanker = [];
			var bg = new Sprite;
			if (myGlobalData.isLHD) {
				bg.setImage("assets/baccarat/tex/top_card_bg_lhd.png");
			} else {
				bg.setImage("assets/baccarat/tex/top_card_bg.png");
			}
			bg.visible = true;
			this.addChild(bg);
			var farmerPoint = uiUtils.createSimpleText(0, "text");
			farmerPoint.name = "farmerPoint";
			farmerPoint.pos(35, 200);
			farmerPoint.color = "#004af7";
			farmerPoint.stroke = 4;
			farmerPoint.fontSize = 40;
			farmerPoint.strokeColor = "#ffffff";
			farmerPoint.zOrder = 2;
			this.addChild(farmerPoint);
			var bankerPoint = uiUtils.createSimpleText(0, "text");
			bankerPoint.name = "bankerPoint";
			bankerPoint.pos(sys.halfWidth + 35, 200);
			bankerPoint.color = "#ff0000";
			bankerPoint.stroke = 4;
			bankerPoint.fontSize = 40;
			bankerPoint.strokeColor = "#ffffff";
			bankerPoint.zOrder = 2;
			this.addChild(bankerPoint);
			var posArr = [{
				x: 97 + 40,
				y: 110
			}, {
				x: 200 + 40,
				y: 110
			}, {
				x: 150 + 40,
				y: 223
			}];
			for (var j = 0; j < 2; j++) {
				for (var i = 0; i < 3; i++) {
					var card = new Card;
					card.setScale(.4);
					if (j == 0) {
						card.pos(posArr[i].x, posArr[i].y);
						this._topCardFarmer.push(card);
					} else {
						card.pos(posArr[i].x + sys.halfWidth, posArr[i].y);
						this._topCardBanker.push(card);
					}
					if (i == 2) card.rotation = 90;
					card.visible = false;
					card.zOrder = 2;
					this.addChild(card);
				}
			}
		},
		_simpGetPoint: function () {
			var cardValue = 0;
			if (myGlobalData.isLHD) {
				cardValue = Card.getPoint(arguments[0]);
				if (cardValue == 14) cardValue = 1;
				return cardValue;
			}
			for (var i = 0; i < arguments.length; i++) cardValue += Math.min(10, Card.getPoint(arguments[i]));
			return cardValue % 10;
		},
		sendCardFarmer: function (cardNum, doAnimation, car1, car2, car3) {
			this.visible = true;
			this._sendCard(false, cardNum, doAnimation, car1, car2, car3);
		},
		sendCardBanker: function (cardNum, doAnimation, car1, car2, car3) {
			this.visible = true;
			this._sendCard(true, cardNum, doAnimation, car1, car2, car3);
		},
		_sendCard: function (isBanker, cardNum, doAnimation, car1, car2, car3) {
			var card1 = null;
			var card2 = null;
			var card3 = null;
			var pointText = null;
			if (isBanker) {
				card1 = this._topCardBanker[0];
				card2 = this._topCardBanker[1];
				card3 = this._topCardBanker[2];
				pointText = this.getChildByName("bankerPoint");
			} else {
				card1 = this._topCardFarmer[0];
				card2 = this._topCardFarmer[1];
				card3 = this._topCardFarmer[2];
				pointText = this.getChildByName("farmerPoint");
			}
			card1.cardValue = car1;
			card2.cardValue = car2;
			if (doAnimation) {
				card1.showBack();
				card1.visible = true;
				var baseDelay = 900;
				this.timerOnce(200, this, function () {
					card1.flipToFace(this, function () {
						pointText.text = this._simpGetPoint(car1);
						pointText.visible = true;
					});
				});
				if (!myGlobalData.isLHD) {
					this.timerOnce(baseDelay * 2, this, function () {
						card2.showBack();
						card2.visible = true;
						this.timerOnce(200, this, function () {
							card2.flipToFace(this, function () {
								pointText.text = this._simpGetPoint(car1, car2);
							});
						});
					});
				}
				if (car3) {
					var card3DelayTime = baseDelay * 4;
					if (isBanker && cardNum == 5) card3DelayTime = baseDelay * 3;
					this.timerOnce(card3DelayTime, this, function () {
						card3.cardValue = car3;
						card3.showBack();
						card3.visible = true;
						this.timerOnce(200, this, function () {
							card3.flipToFace(this, function () {
								pointText.text = this._simpGetPoint(car1, car2, car3);
							});
						});
					});
				}
			} else {
				if (car3) pointText.text = this._simpGetPoint(car1, car2, car3);
				else pointText.text = this._simpGetPoint(car1, car2);
				pointText.visible = true;
				card1.visible = true;
				card1.showFace();
				card2.visible = true;
				card2.showFace();
				if (car3) {
					card3.cardValue = car3;
					card3.visible = true;
					card3.showFace();
				}
			}
		},
		clear: function () {
			var bankerPoint = this.getChildByName("bankerPoint");
			bankerPoint.text = 0;
			var farmerPoint = this.getChildByName("farmerPoint");
			farmerPoint.text = 0;
			for (var i = 0; i < 3; i++) {
				this._topCardFarmer[i].visible = false;
				this._topCardBanker[i].visible = false;
			}
			this.visible = false;
		}
	});
	return TopCard;
});
gbx.define("game/baccarat/parts/top_card_panel_mi", ["conf/system", "gbx/net/messagecommand", "gbx/net/errorcode", "gbx/net/errorcode_des", "gbx/net/connector", "comm/base/game_ui", "gbx/render/display/sprite", "gbx/render/display/text", "comm/ui/sound_button", "game/baccarat/parts/card", "comm/helper/sound_mgr", "comm/helper/conf_mgr", "comm/ui/ui_utils", "game/baccarat/parts/top_card_panel"], function (sys, CMD, ERROR_CODE, ERROR_CODE_DES, server, BaseUI, Sprite, Text, Button, Card, soundMgr, confMgr, uiUtils, TopCardPanel) {
	var TopCard = TopCardPanel.extend({
		init: function () {
			this._super();
			this.subscribe("game_baccarat.play.set_top_card_jm", this, this.eventSetTopCard);
			this.subscribe("game_baccarat.play.flip_top_card_jm", this, this.eventFlipTopCardFace);
			this.subscribe("game_baccarat.play.clear_top_card_jm", this, this.eventClear);
		},
		eventSetTopCard: function (isBanker, stage, pointArr) {
			this.visible = true;
			var cardArray = [];
			var point = null;
			if (isBanker) {
				cardArray = this._topCardBanker;
				point = this.getChildByName("bankerPoint");
			} else {
				cardArray = this._topCardFarmer;
				point = this.getChildByName("farmerPoint");
			}
			cardArray[0].cardValue = pointArr[0];
			cardArray[1].cardValue = pointArr[1];
			if (pointArr.length == 3) cardArray[2].cardValue = pointArr[2];
			cardArray[0].visible = true;
			cardArray[0].showBack();
			if (!myGlobalData.isLHD) {
				cardArray[1].visible = true;
				cardArray[1].showBack();
			}
			if (stage == 0) {
				cardArray[2].visible = false;
			} else if (stage == 1) {
				cardArray[0].showFace();
				if (!myGlobalData.isLHD) {
					cardArray[1].showFace();
				}
				point.visible = true;
				point.text = this._simpGetPoint(pointArr[0], pointArr[1]);
			} else if (stage == 2) {
				cardArray[0].showFace();
				if (!myGlobalData.isLHD) {
					cardArray[1].showFace();
				}
				if (pointArr.length == 3) {
					cardArray[2].visible = true;
					cardArray[2].showBack();
				}
				point.visible = true;
				point.text = this._simpGetPoint(pointArr[0], pointArr[1]);
			} else if (stage == 3) {
				cardArray[0].showFace();
				cardArray[1].showFace();
				point.visible = true;
				point.text = this._simpGetPoint(pointArr[0], pointArr[1]);
				if (pointArr.length == 3) {
					cardArray[2].visible = true;
					cardArray[2].showFace();
					point.text = this._simpGetPoint(pointArr[0], pointArr[1], pointArr[2]);
				}
			}
		},
		eventFlipTopCardFace: function (isBanker, isThird, pointArr) {
			this.visible = true;
			var farmerPoint = this.getChildByName("farmerPoint");
			var bankerPoint = this.getChildByName("bankerPoint");
			if (isBanker) {
				bankerPoint.visible = true;
				if (isThird) {
					this._topCardBanker[2].flipToFace();
					bankerPoint.text = this._simpGetPoint(pointArr[0], pointArr[1], pointArr[2]);
				} else {
					this._topCardBanker[0].flipToFace();
					this._topCardBanker[1].flipToFace();
					bankerPoint.text = this._simpGetPoint(pointArr[0], pointArr[1]);
				}
			} else {
				farmerPoint.visible = true;
				if (isThird) {
					this._topCardFarmer[2].flipToFace();
					farmerPoint.text = this._simpGetPoint(pointArr[0], pointArr[1], pointArr[2]);
				} else {
					this._topCardFarmer[0].flipToFace();
					this._topCardFarmer[1].flipToFace();
					farmerPoint.text = this._simpGetPoint(pointArr[0], pointArr[1]);
				}
			}
		},
		eventClear: function () {
			this.clear();
		}
	});
	return TopCard;
});
gbx.define("game/baccarat/pop/bet_setting", ["gbx/render/display/sprite", "comm/ui/sound_button", "comm/helper/room_mgr", "comm/ui/ui_utils", "comm/helper/playerdata_mgr", "conf/ui_locallization", "comm/ui/top_message", "comm/helper/conf_mgr"], function (Sprite, Button, RoomMgr, uiUtils, playerDataMgr, uiLocallization, topMessage, confMgr) {
	var BetSetting = Sprite.extend({
		init: function () {
			this._super();
			var maskBtn = uiUtils.createMask(this, true);
			maskBtn.pos(-1500, -1500);
			this.addChild(maskBtn);
			this._btns = [];
			var chipPriceList = confMgr.setting.betPrice;
			var betPriceToIconList = confMgr.setting.betPriceToIcon;
			this._chipInfoMap = [{
				price: chipPriceList[0],
				state: true
			}, {
				price: chipPriceList[1],
				state: true
			}, {
				price: chipPriceList[2],
				state: true
			}, {
				price: chipPriceList[3],
				state: true
			}, {
				price: chipPriceList[4],
				state: true
			}, {
				price: chipPriceList[5],
				state: false
			}, {
				price: chipPriceList[6],
				state: false
			}, {
				price: chipPriceList[7],
				state: false
			}, {
				price: chipPriceList[8],
				state: false
			}, {
				price: chipPriceList[9],
				state: false
			}, {
				price: chipPriceList[10],
				state: false
			}, {
				price: chipPriceList[11],
				state: false
			}, {
				price: chipPriceList[12],
				state: false
			}];
			this._chipArray = [{
				price: chipPriceList[0],
				index: betPriceToIconList[chipPriceList[0]]
			}, {
				price: chipPriceList[1],
				index: betPriceToIconList[chipPriceList[1]]
			}, {
				price: chipPriceList[2],
				index: betPriceToIconList[chipPriceList[2]]
			}, {
				price: chipPriceList[3],
				index: betPriceToIconList[chipPriceList[3]]
			}, {
				price: chipPriceList[4],
				index: betPriceToIconList[chipPriceList[4]]
			}];
			var background = uiUtils.createSprite("assets/main/public/background_big.png", "");
			background.pos(0, 0);
			this.addChild(background);
			uiUtils.createBackgroundCrash(this, background);
			var title = uiUtils.createSprite("assets/baccarat/tex/choose_bet_title.png", "");
			title.pos(190, 10);
			this.addChild(title);
			var splitLine = uiUtils.createSprite("assets/main/public/splitLine_1.png", "");
			splitLine.scale(.8);
			splitLine.pos(-30, 355);
			this.addChild(splitLine);
			for (var index = 0; index < this._chipInfoMap.length; index++) {
				var chipIcon = new Button;
				chipIcon.setSkinImage("assets/baccarat/tex/chips/chip" + (index + 1) + ".png");
				chipIcon.stateNum = 1;
				var x = 0;
				var y = 0;
				var row = Math.floor(index / 5);
				var col = index % 5;
				y = row * 98;
				x = col * 100;
				chipIcon.pos(30 + x, 60 + y);
				this.addChild(chipIcon);
				chipIcon.setClickHandler(this, this.OnClick, index);
				var chooseBtn = new Button;
				chooseBtn.setSkinImage("assets/baccarat/tex/choose_box.png");
				chooseBtn.stateNum = 1;
				chooseBtn.pos(60 + x + 20, y + 115);
				chooseBtn.name = "btn" + index;
				this.addChild(chooseBtn);
				chooseBtn.setClickHandler(this, this.OnClick, index);
				this._btns.push(chooseBtn);
				var mark = uiUtils.createSprite("assets/baccarat/tex/choose_mark.png", "mark");
				mark.pos(0, -10);
				mark.name = "mark";
				mark.visible = true;
				mark.visible = this._chipInfoMap[index].state;
				chooseBtn.addChild(mark);
			}
			var surebtn = new Button;
			surebtn.setSkinImage("assets/main/public/button_8.png");
			var word = uiUtils.createSprite("assets/main/public/sureBtnG.png");
			word.pos(52, 12);
			surebtn.addChild(word);
			surebtn.stateNum = 2;
			surebtn.pos(189, 370);
			surebtn.name = "sureBtn";
			surebtn.setClickHandler(this, this.OnClick, surebtn.name);
			this.addChild(surebtn);
		},
		getSelectNum: function () {
			var select = 0;
			for (var index = 0; index < this._chipInfoMap.length; index++) {
				if (this._chipInfoMap[index].state) {
					select++;
				}
			}
			return select;
		},
		check: function () {
			var chipArray = playerDataMgr.getChipArray();
			for (var index = 0; index < this._chipInfoMap.length; index++) {
				var btn = this._btns[index];
				this._chipInfoMap[index].state = false;
				for (var i = 0; i < chipArray.length; i++) {
					if (this._chipInfoMap[index].price == chipArray[i].price) {
						this._chipInfoMap[index].state = true;
					}
				}
				btn.getChildByName("mark").visible = this._chipInfoMap[index].state;
			}
		},
		setSelect: function () {
			for (var index = 0; index < this._chipInfoMap.length; index++) {
				var btn = this._btns[index];
				if (btn) btn.getChildByName("mark").visible = this._chipInfoMap[index].state;
			}
		},
		CompleteSelect: function () {
			var num = 0;
			for (var index = 0; index < this._chipInfoMap.length; index++) {
				if (!this._chipInfoMap[index].state) {
					var selectNum = this.getSelectNum();
					if (selectNum < 5) {
						this._chipInfoMap[index].state = true;
					}
				}
				if (this._chipInfoMap[index].state) {
					this._chipArray[num].price = this._chipInfoMap[index].price;
					this._chipArray[num].index = index;
					num++;
				}
			}
		},
		OnClick: function (btn, tag) {
			if (tag == "sureBtn") {
				this.CompleteSelect();
				playerDataMgr.setChipArray(this._chipArray);
				this.publish("game_baccarat.betsetting.setChooseLimit", this._chipArray);
				this.visible = false;
			} else {
				this.ChoiceChip(tag);
			}
		},
		ChoiceChip: function (index) {
			var selectNum = this.getSelectNum();
			if (selectNum >= 5 && !this._chipInfoMap[index].state) {
				topMessage.post(uiLocallization.select_chips_max);
				return;
			}
			this._chipInfoMap[index].state = !this._chipInfoMap[index].state;
			this.setSelect();
		}
	});
	return BetSetting;
});
gbx.define("game/baccarat/pop/player_score", ["comm/ui/popup", "gbx/render/display/sprite", "gbx/render/display/text", "comm/ui/sound_button"], function (Popup, Sprite, Text, List, Button) {
	var PopPlayerScore = Popup.extend({
		init: function () {
			this._super(0, true);
			var table = [
				[{
					label: "地主",
					color: "#d21414"
				}, {
					label: "地主对",
					color: "#d21414"
				}],
				[{
					label: "农民",
					color: "#375fd3"
				}, {
					label: "农民对",
					color: "#375fd3"
				}],
				[{
					label: "和",
					color: "#45b333"
				}, {
					label: "总计",
					color: "#ffffff"
				}]
			];
			for (var r = 0; r < table.length; r++) {
				for (var c = 0; c < table[r].length; c++) {
					var data = table[r][c];
					var label = new Text;
					label.text = data.label + ":";
					label.color = data.color;
					label.fontSize = 50;
					label.stroke = 3;
					label.strokeColor = "#ffffff";
					label.pos(c * 450 + 30, r * 180 + 30);
					this.content.addChild(label);
					var times = new Text;
					times.text = "0";
					times.color = "#ffffff";
					times.fontSize = 50;
					times.bold = true;
					times.width = 420;
					times.align = "right";
					times.pos(c * 450 + 30, r * 180 + 30);
					times.name = "t_" + (r * 2 + c + 1);
					this.content.addChild(times);
					var icon = new Sprite;
					icon.pos(c * 450 + 30, r * 180 + 100);
					this.content.addChild(icon);
					var value = new Text;
					value.text = "0";
					value.color = "#ffffff";
					value.fontSize = 50;
					value.bold = true;
					value.width = 420;
					value.align = "right";
					value.pos(c * 450 + 30, r * 180 + 90);
					value.name = "v_" + (r * 2 + c + 1);
					this.content.addChild(value);
				}
			}
			this.publish("game_baccarat.request.bet_record", this, this._fillData);
		},
		_fillData: function (data) {
			var totalTimes = 0,
				totalWins = 0,
				map = ["", 1, 4, 2, 5, 3, 6];
			for (var i = 1; i <= 5; i++) {
				this.content.getChildByName("t_" + i).text = data[map[i]].times + " 次";
				this.content.getChildByName("v_" + i).text = data[map[i]].chips.toString().replace(/(\d)(?=(\d{3})+($|\.))/g, "$1,");
				totalTimes += data[i].times;
				totalWins += data[i].chips;
			}
			this.content.getChildByName("t_6").text = totalTimes + " 次";
			this.content.getChildByName("v_6").text = totalWins.toString().replace(/(\d)(?=(\d{3})+($|\.))/g, "$1,");
		}
	});
	return PopPlayerScore;
});
gbx.define("game/baccarat/scene/table", ["gbx/hubs", "gbx/bridge", "gbx/render/stage", "gbx/net/connector", "gbx/net/messagecommand", "gbx/net/errorcode", "game/baccarat/net/msg_receiver", "comm/helper/scene_mgr", "comm/helper/sound_mgr", "comm/helper/conf_mgr", "comm/helper/room_mgr", "comm/helper/playerdata_mgr", "game/baccarat/helper/game_mgr", "game/baccarat/ui/table", "game/baccarat/ui/table_jinmi", "game/baccarat/ui/table_LHD", "game/baccarat/ui/table_jinmi_LHD", "comm/ui/scene_loading"], function (hubs, bridge, stage, server, CMD, ERROR_CODE, msgReceiver, sceneMgr, soundMgr, confMgr, roomMgr, playerDataMgr, GameMgr, TableUI, TableJinMi, TableLHD, TableJinMiLHD, loading) {
	var tableUI = null;
	var gameMgr = null;
	var pauseFlag = false;
	var gameEnd = function () {
		sceneMgr.switchTo("lobby");
	};
	var gamePause = function () {
		if (document.gamePause == undefined) {
			document.gamePauseInGame = true;
			pauseFlag = true;
			return;
		}
		if (document.gamePause) {
			document.gamePauseInGame = true;
			pauseFlag = true;
			return;
		}
		if (!pauseFlag) return;
		pauseFlag = false;
		stage.renderingEnabled = false;
		roomMgr.getRoomDataHeadFromServer(this, function (msgData) {
			if (msgData != null) resetRoom(msgData);
		});
		stage.renderingEnabled = true;
	};
	var resetRoom = function (roomData) {
		removeRoom();
		createRoom(roomData);
	};
	var createRoom = function (roomData) {
		var chooseData = roomMgr.getChoose();
		if (chooseData == null) {
			chooseData = getChooseData(roomData);
		}
		if (chooseData == null) {
			myGlobalData.isLHD = false;
			roomMgr.getAllRoomData(this, function (errorCode) {
				if (errorCode == ERROR_CODE.OK) {
					chooseData = getChooseData(roomData);
					if (chooseData == null) {
						roomMgr.getAllRoomData(this, function (errorCode) {
							if (errorCode == ERROR_CODE.OK) {
								chooseData = getChooseData(roomData);
								if (chooseData == null) {
									roomMgr.getAllRoomData(this, function (errorCode) {
										if (errorCode == ERROR_CODE.OK) {
											chooseData = getChooseData(roomData);
											if (chooseData == null) {
												myGlobalData.isLHD = true;
												roomMgr.getAllRoomData(this, function (errorCode) {
													if (errorCode == ERROR_CODE.OK) {
														chooseData = getChooseData(roomData);
														if (chooseData == null) {
															roomMgr.getAllRoomData(this, function (errorCode) {
																if (errorCode == ERROR_CODE.OK) {
																	chooseData = getChooseData(roomData);
																	if (chooseData == null) {
																	} else {
																		myGlobalData.isLHD = true;
																		roomDataReadly(roomData);
																	}
																} else {

																}
															}, 1009);
														} else {
															myGlobalData.isLHD = true;
															roomDataReadly(roomData);
														}
													} else {

													}
												}, 1008);
											} else {
												roomDataReadly(roomData);
											}
										} else {

										}
									}, 3);
								} else {
									roomDataReadly(roomData);
								}
							} else {

							}
						}, 2);
					} else {
						roomDataReadly(roomData);
					}
				} else {

				}
			}, 1);
		} else {
			roomDataReadly(roomData);
		}
	};
	var getChooseData = function (roomData) {
		for (var i = 0; i < roomMgr.getRoomList().length; i++) {
			if (roomMgr.getRoomList()[i].roomId == roomData.ServerID) {
				var chooseData = roomMgr.getRoomList()[i];
				roomMgr.setChoose(chooseData);
				return chooseData;
			}
		}
	};
	var roomDataReadly = function (roomData) {
		var baccaratRoomData = roomData;
		var chooseData = roomMgr.getChoose();
		switch (chooseData.baccaratRoomType) {
			case confMgr.definition.BaccaratRoomType.Dragon:
				tableUI = new TableUI;
				break;
			case confMgr.definition.BaccaratRoomType.JingMi:
				tableUI = new TableJinMi;
				break;
			case confMgr.definition.BaccaratRoomType.Vip:
				tableUI = new TableJinMi;
				break;
			case confMgr.definition.BaccaratRoomType.LHD1:
				tableUI = new TableLHD;
				break;
			case confMgr.definition.BaccaratRoomType.LHD2:
				tableUI = new TableJinMiLHD;
				break;
		}
		gameMgr = new GameMgr;
		tableUI.setGameMgr(gameMgr);
		tableUI.addToStage();
		myGlobalData.currRoomData = baccaratRoomData;
		gameMgr.setRoomData(baccaratRoomData);
		playerDataMgr.setRoomId(roomData.roomId);
		msgReceiver.setGameMgr(gameMgr);
	};
	var removeRoom = function () {
		msgReceiver.setGameMgr(null);
		if (tableUI != null) tableUI.destroy();
		if (gameMgr != null) gameMgr.end();
		playerDataMgr.setRoomId(null);
	};
	var afterGetRoomData = function (roomData) {
		if (roomData != null) {
			sceneMgr.switchToAfterPrepare();
			createRoom(roomData);
			hubs.subscribe("global.game_status.reset_room", resetRoom);
			hubs.subscribe("global.app.back_action", gameEnd);
			hubs.subscribe("global.game_status.pause", gamePause);
		} else {
			sceneMgr.switchTo("lobby");
		}
	};
	return {
		prepareShow: function () {
			roomMgr.getRoomDataFromServer(null, afterGetRoomData);
		},
		show: function () { },
		end: function () {
			hubs.unsubscribe("global.game_status.reset_room", resetRoom);
			hubs.unsubscribe("global.app.back_action", gameEnd);
			hubs.unsubscribe("global.game_status.pause", gamePause);
			removeRoom();
			soundMgr.playBGM("assets/main/bgm/back.mp3");
		}
	};
});
gbx.define("game/baccarat/ui/super/table_face", ["conf/system", "comm/base/game_ui", "gbx/render/display/sprite", "gbx/render/display/animation", "gbx/render/display/text", "gbx/render/ui/list", "gbx/render/ui/panel", "gbx/render/schema", "comm/ui/sound_button", "comm/ui/custom_tab", "gbx/pool", "game/baccarat/parts/seat", "game/baccarat/parts/putchip_area", "game/baccarat/parts/history_box", "game/baccarat/parts/bet_panel", "game/baccarat/parts/counter", "game/baccarat/parts/chip", "game/baccarat/parts/card_place", "game/baccarat/parts/player_list", "game/baccarat/parts/chat_panel", "game/baccarat/parts/shuffle_card", "comm/helper/conf_mgr", "comm/helper/sound_mgr", "comm/helper/playerdata_mgr", "comm/helper/room_mgr", "comm/ui/top_message", "comm/ui/top_confirm", "comm/ui/bitmap_number", "game/lobby/lobbypop/game_help", "game/baccarat/pop/bet_setting", "game/lobby/lobbypop/bank_setting", "gbx/net/errorcode", "gbx/net/errorcode_des", "comm/ui/ui_utils", "conf/ui_locallization"], function (sys, BaseUI, Sprite, Animation, Text, List, Panel, Schema, Button, CustomTab, Pool, Seat, PutchipArea, HistoryBox, BetPanel, Counter, Chip, CardPlace, PlayerList, ChatPanel, ShuffleCard, confMgr, soundMgr, playerDataMgr, roomMgr, topMessage, topConfirm, BitmapNumber, GameHelp, BetSetting, BankSetting, ERROR_CODE, ERROR_CODE_DES, uiUtils, uiLocallization) {
	var myChipsY = 1116;
	var timeLimit = 20;
	var TableFace = BaseUI.extend({
		init: function () {
			this._super();
			this._gameMgr = null;
			this._canBet = true;
			this._hasBet = false;
			this._canMinusCardCount = false;
			this._chatContent = [];
			var tree = [{
				type: "Text",
				props: {
					text: "0",
					color: "#E2E365",
					fontSize: 16,
					width: 270,
					align: "center",
					pivotToCenter: [],
					zOrder: 7,
					bold: true,
					pos: [sys.halfWidth, 1092],
					name: "playerName"
				}
			}, {
				type: "Text",
				props: {
					text: "0",
					color: "#ffffff",
					fontSize: 15,
					width: 270,
					align: "center",
					pivotToCenter: [],
					zOrder: 7,
					pos: [sys.halfWidth, myChipsY],
					name: "my_chips"
				}
			}, {
				type: "Text",
				props: {
					text: "",
					color: "#E2E365",
					fontSize: 18,
					align: "left",
					pos: [100, 8],
					zOrder: 6,
					name: "addTip"
				}
			}, {
				type: "Text",
				props: {
					text: "",
					color: "#E2E365",
					fontSize: 19,
					width: 130,
					align: "left",
					zOrder: 7,
					bold: true,
					pos: [240, 1112],
					name: "my_chips_tip"
				}
			}, {
				type: "Sprite",
				props: {
					pos: [60, 320],
					name: "dealer_info",
					alpha: .7,
					zOrder: 4,
					visible: false,
					childs: [{
						type: "Text",
						props: {
							text: uiLocallization.series_banker,
							color: "#E6DAC2",
							fontSize: 15,
							pos: [20, 8],
							align: "left",
							name: "dealer_combo"
						}
					}, {
						type: "Text",
						props: {
							text: uiLocallization.banker_score,
							color: "#E6DAC2",
							fontSize: 15,
							align: "left",
							pos: [100, 8],
							name: "dealer_score"
						}
					}]
				}
			}, {
				type: "Sprite",
				props: {
					setImage: ["assets/baccarat/tex/dealer.png"],
					pos: [sys.halfWidth, 447],
					pivotToCenter: [],
					zOrder: 2,
					name: "dealer_com"
				}
			}, {
				type: Seat,
				ctor: [true, -1],
				props: {
					pos: [sys.halfWidth, 417],
					name: "seat_dealer",
					visible: true,
					zOrder: 4,
					childs: []
				}
			}, {
				type: "Sprite",
				props: {
					name: "seats",
					zOrder: 4,
					childs: []
				}
			}, {
				type: "Button",
				props: {
					setSkinImage: ["assets/baccarat/tex/button_player_list.png"],
					stateNum: 2,
					pos: [23, 532],
					zOrder: 4,
					name: "btPlayerList",
					childs: [{
						type: "Text",
						props: {
							color: "#FFD39B",
							fontSize: 15,
							width: 20,
							align: "center",
							text: "0",
							pos: [15, 26],
							name: "text"
						}
					}],
					setClickHandler: [this, this.showAllPlayerList]
				}
			}, {
				type: "Button",
				props: {
					setSkinImage: ["assets/baccarat/tex/button_dealer_list.png"],
					stateNum: 2,
					pos: [21, 480],
					zOrder: 4,
					name: "btDealerList",
					childs: [{
						type: "Text",
						props: {
							color: "#FFD39B",
							fontSize: 15,
							width: 20,
							align: "center",
							text: "0",
							pos: [15, 26],
							name: "text"
						}
					}],
					setClickHandler: [this, this.showAllDealerList]
				}
			}, {
				type: "Text",
				props: {
					text: "0",
					fontSize: 15,
					color: "#cccccc",
					width: 80,
					zOrder: 4,
					align: "center",
					pos: [568, 558],
					name: "card_count",
					childs: [{
						type: "Text",
						props: {
							text: uiLocallization.left_cardNum,
							fontSize: 15,
							color: "#cccccc",
							width: 100,
							zOrder: 4,
							align: "center",
							pos: [-55, 0],
							alpha: 1
						}
					}]
				}
			}, {
				type: HistoryBox,
				props: {
					zOrder: 6,
					name: "history"
				}
			}, {
				type: "Sprite",
				props: {
					zOrder: 7,
					name: "chips_layer"
				}
			}, {
				type: "Sprite",
				props: {
					setImage: ["assets/baccarat/tex/mark_bet.png"],
					pivotToCenter: [],
					pos: [sys.halfWidth, sys.halfHeight],
					zOrder: 10,
					alpha: 0,
					name: "can_put_chip_label"
				}
			}, {
				type: "Sprite",
				props: {
					setImage: ["assets/baccarat/tex/mark_stopbet.png"],
					pivotToCenter: [],
					pos: [sys.halfWidth, sys.halfHeight],
					zOrder: 10,
					alpha: 0,
					name: "stop_put_chip_label"
				}
			}, {
				type: "Sprite",
				props: {
					setImage: ["assets/baccarat/tex/win_1.png"],
					pivotToCenter: [],
					pos: [sys.halfWidth, sys.halfHeight],
					zOrder: 10,
					alpha: 0,
					name: "win_side"
				}
			}, {
				type: BetPanel,
				props: {
					pos: [31, 978],
					zOrder: 6,
					name: "bet_panel"
				},
				exec: [
					["setCommand", "double_putchip", this.doubleBetOn, this],
					["setCommand", "repeat_putchip", this.repeatBetOn, this]
				]
			}, {
				type: "Button",
				props: {
					setSkinImage: ["assets/main/public/button_back_1.png"],
					stateNum: 2,
					pos: [8, 320],
					zOrder: 4,
					scale: [.82],
					name: "backBtn",
					setClickHandler: [this, this.quitGame]
				}
			}, {
				type: "Button",
				props: {
					setSkinImage: ["assets/main/public/button_help_1.png"],
					stateNum: 2,
					pos: [575, 320],
					zOrder: 4,
					scale: [.82],
					name: "helpBtn",
					setClickHandler: [this, this.showHelp]
				}
			}, {
				type: "Button",
				props: {
					setSkinImage: ["assets/baccarat/tex/chip_setting.png"],
					stateNum: 2,
					pos: [565, 976],
					zOrder: 7,
					name: "openBetSet",
					setClickHandler: [this, this.showSetting]
				}
			}, {
				type: "Button",
				props: {
					stateNum: 2,
					pivotToCenter: [],
					pos: [sys.halfWidth, 510],
					setData: ["side", "up"],
					name: "btn_dealer",
					zOrder: 5,
					setClickHandler: [this, this.becomeDealer],
					//隐藏上庄图标
					visible: false
				}
			}, {
				type: PlayerList,
				ctor: ["player_list"],
				props: {
					pos: [0, sys.halfHeight - 70],
					zOrder: 9,
					name: "player_list",
					visible: false
				}
			}, {
				type: PlayerList,
				ctor: ["dealer_list"],
				props: {
					pos: [0, sys.halfHeight - 70],
					zOrder: 9,
					name: "dealer_list",
					visible: false
				}
			}, {
				type: "Button",
				props: {
					setSkinImage: ["assets/main/public/button_chat.png"],
					stateNum: 2,
					pos: [510, 320],
					zOrder: 4,
					scale: [.82],
					name: "chatBtn",
					setClickHandler: [this, this.startSendChat, "serif"],
					visible: false
				}
			}, {
				type: "Sprite",
				props: {
					pos: [420, 455],
					name: "chat",
					zOrder: 6,
					visible: false,
					childs: [{
						type: "Sprite",
						props: {
							setImage: ["assets/baccarat/tex/chat/frame_chat.png"],
							pos: [0, 0],
							scaleY: [.75]
						}
					}, {
						type: Panel,
						props: {
							size: [242, 54],
							pos: [14, 0],
							vScrollBarSkin: "",
							name: "content",
							setData: ["lastY", 0]
						}
					}]
				}
			}, {
				type: ChatPanel,
				props: {
					pos: [390, sys.halfHeight - 80],
					zOrder: 10,
					name: "chat_panel",
					visible: false
				}
			}, {
				type: BetSetting,
				props: {
					pos: [68, 420],
					name: "settingPanel",
					visible: false,
					zOrder: 10
				}
			}, {
				type: GameHelp,
				props: {
					pos: [47, 120],
					name: "gameHelp",
					visible: false,
					zOrder: 10
				}
			}, {
				type: ShuffleCard,
				props: {
					pos: [sys.halfWidth, 515],
					zOrder: 9,
					name: "shuffleCard1"
				}
			}];
			var ui = new Schema(tree);
			ui.appendTo(this);
			this.subscribe("game_baccarat.play.set_player_in_seat", this, this.eventSetPlayerInSeat);
			this.subscribe("game_baccarat.play.set_player_out_seat", this, this.eventSetPlayerOutSeat);
			this.subscribe("game_baccarat.play.start_bet", this, this.eventStartBet);
			this.subscribe("game_baccarat.play.send_card", this, this.eventSendCard);
			this.subscribe("game_baccarat.play.update_players_info", this, this.eventUpdatePlayersInfo);
			this.subscribe("game_baccarat.play.update_player_gold", this, this.eventUpdatePlayerGold);
			this.subscribe("game_baccarat.play.update_card_count", this, this.eventUpdateCardCount);
			this.subscribe("game_baccarat.play.chat_incomming", this, this.eventChat);
			this.subscribe("game_baccarat.play.player_send_emoji", this, this.eventPlayerShowEmoji);
			this.subscribe("global.playerdata.update.itembag", this, this.eventUpdateMyChips);
			this.subscribe("game_baccarat.play.set_player_list", this, this.eventSetPlayerList);
			this.subscribe("game_baccarat.play.setRoomPlayersCount", this, this.eventSetRoomPlayersCount);
			this.subscribe("game_baccarat.play.set_dealer_list", this, this.eventSetDealerList);
			this.subscribe("game_baccarat.play.up_player_dealer", this, this.eventUpPlayerDealer);
			this.subscribe("game_baccarat.play.up_com_dealer", this, this.eventUpComDealer);
			this.subscribe("game_baccarat.play.down_player_dealer", this, this.eventDownPlayerDealer);
			this.subscribe("game_baccarat.command.set_dealer_button", this, this.eventSetDealerButton);
			this.subscribe("game_baccarat.play.update_dealer_info", this, this.eventUpdateDealerInfo);
			this.subscribe("game_baccarat.play.update_area", this, this.eventUpdateAreaChips);
			this.subscribe("game_baccarat.play.removeBet", this, this.eventRemoveBet);
			this.subscribe("game_baccarat.play.lockBet", this, this.eventLockBet);
			this.subscribe("game_baccarat.play.update_area_my_chip", this, this.eventUpdateAreaMyChips);
			this.subscribe("game_baccarat.play.clear_area_my_chip", this, this.eventClearAreaMyChips);
			this.subscribe("game_baccarat.play.fly_bet", this, this.eventFlyBet);
			this.subscribe("game_baccarat.play.add_win_area", this, this.eventSetWinArea);
			this.subscribe("game_baccarat.play.add_history", this, this.eventAddHistory);
			this.subscribe("game_baccarat.play.add_game_round", this, this.eventSetRoundResult);
			this.subscribe("game_baccarat.command.show_fail_message", this, this.eventShowFailText);
			this.subscribe("game_baccarat.play.shuffleCardStart", this, this.eventShuffleCardStart);
			this.subscribe("game_baccarat.play.shuffleCardEnd", this, this.eventShuffleCardEnd);
			this.subscribe("game_baccarat.play.clear_table", this, this.eventClearStage);
			soundMgr.stopBGM();
			this._judgeOpenDealerList();
		},
		setGameMgr: function (gameMgr) {
			this._gameMgr = gameMgr;
		},
		eventSetPlayerInSeat: function (seatIdx, nick, head, gold, isMe) {
			if (seatIdx > -1 && seatIdx < this._seatPos.length) this.getChildByName("seats", "seat_" + seatIdx).playerIn(nick, head, gold, isMe);
		},
		eventSetPlayerOutSeat: function (seatIdx) {
			if (seatIdx > -1 && seatIdx < this._seatPos.length) this.getChildByName("seats", "seat_" + seatIdx).playerOut();
		},
		eventUpdatePlayersInfo: function (changedList, addCarryOnGold) {
			this.timerOnce(5e3, this, function (cChangedList, addGold) {
				if (cChangedList) {
					for (var i = 0; i < cChangedList.length; i++) {
						var playerId = cChangedList[i].playerId;
						var seatIdx = cChangedList[i].seatIdx;
						var carryOnGold = cChangedList[i].carryOnGold;
						if (playerDataMgr.isMyself(playerId)) this.eventUpdateMyChips(seatIdx, addGold);
						seatIdx = seatIdx - 1;
						if (seatIdx > -1) {
							if (this.getChildByName("seats", "seat_" + seatIdx) == null) {
								return;
							}
							this.getChildByName("seats", "seat_" + seatIdx).showChips(carryOnGold);
						} else {
							console.log("seatIdx<0");
						}
					}
				}
			}, [changedList, addCarryOnGold]);
		},
		eventUpdatePlayerGold: function (seatIdx, gold) {
			if (seatIdx > -1 && seatIdx < this._seatPos.length) this.getChildByName("seats", "seat_" + seatIdx).showChips(gold);
		},
		eventUpdateCardCount: function (number) {
			this.getChildByName("card_count").text = number;
		},
		minusElapseCardCount: function () {
			if (this._canMinusCardCount) {
				var cardCount = this.getChildByName("card_count");
				var number = parseInt(cardCount.text);
				cardCount.text = number - 1;
			}
		},
		_isPlayerInSeat: function (seatIdx) {
			if (seatIdx in this._seatPos) return this.getChildByName("seats", "seat_" + seatIdx).isInSeat();
			return false;
		},
		counterTimeUp: function () {
			this._lockBet();
			this.getChildByName("counter").visible = false;
			if (this._hasBet) uiUtils.playSound("stop_bet", 1);
			else uiUtils.playSound("this_round_no_bet", 1);
			var stopPut = this.getChildByName("stop_put_chip_label");
			stopPut.alpha = 1;
			this.timerOnce(1800, this, function () {
				stopPut.tweenTo({
					alpha: 0
				}, 500, "sineOut", this, function () {
					stopPut.alpha = 0;
				});
			});
		},
		doubleBetOn: function () {
			if (!this._canBet) return;
			this.publish("game_baccarat.command.player_repeat_bet", 2);
		},
		repeatBetOn: function () {
			if (!this._canBet) return;
			this.publish("game_baccarat.command.player_repeat_bet", 1);
		},
		eventUpdateAreaChips: function (area, chips) {
			var area = this.getChildByName("pca_" + area);
			area.setTotalChips(chips);
		},
		flyChip: function (chipType, fromSeatIdx, area, playerId, doAnimation, chipIndex, integratedChipsInfo) {
			var chip = this._chipPool.alloc();
			var chipsLayer = this.getChildByName("chips_layer");
			var pos = confMgr.setting.otherSeatPos;
			if (fromSeatIdx in this._seatPos) pos = this._seatPos[fromSeatIdx];
			else if (playerDataMgr.isMyself(playerId)) pos = confMgr.setting.myPos;
			chip.type = chipType;
			chip.area = area;
			chip.seatIdx = fromSeatIdx;
			chip.zOrder = 2;
			chip.pos(pos.x, pos.y);
			chip.playerId = playerId;
			chipsLayer.addChild(chip);
			this.flyChipToArea(chip, area, doAnimation, false, chipIndex, integratedChipsInfo);
		},
		eventRemoveBet: function (toSeatIdx, playerId) {
			this._cancelBet(toSeatIdx, playerId);
			if (playerDataMgr.isMyself(playerId)) this._hasBet = false;
		},
		_cancelBet: function (toSeatIdx, playerId) {
			var baseUI = this;
			var chipList = this._findByPlayerId(playerId);
			var baseDelay = this._calculateFlyDelay(1e3, chipList.length);
			var data = roomMgr.getChoose();
			for (var j = chipList.length - 1; j >= 0; j--) {
				var chip = chipList[j];
				var delay = baseDelay * (chipList.length - j - 1);
				var pos = confMgr.setting.otherSeatPos;
				if (toSeatIdx in this._seatPos) pos = this._seatPos[toSeatIdx];
				else if (playerDataMgr.isMyself(playerId)) pos = confMgr.setting.myPos;
				this.timerOnce(delay, chip, function (cPos) {
					soundMgr.playSE("assets/baccarat/se/chip.mp3");
					this.tweenCancel();
					this.flyTo(cPos.x, cPos.y, this, function () {
						this.removeSelf();
						baseUI._chipPool.free(this);
					});
				}, [pos]);
			}
		},
		eventLockBet: function () {
			this._lockBet();
		},
		eventCheckStartBet: function (time, isInit) {
			this._hasBet = false;
			this.getChildByName("counter").visible = time > 0 ? true : false;
			this.getChildByName("counter").start(time);
			if (isInit) {
				uiUtils.playSound("good_luck", 1);
				if (time > 22) {
					this._lockBet();
					this.timerOnce(500, this, this._showStartBetStep, [false]);
				} else if (time > 0) {
					this._unLockBet(true);
				} else {
					this._lockBet();
				}
			} else {
				this.timerOnce(500, this, function () {
					this._showStartBetStep(false);
				});
			}
		},
		_showStartBetStep: function (stopBlink) {
			var canPut = this.getChildByName("can_put_chip_label");
			canPut.alpha = 1;
			uiUtils.playSound("plz_bet", 1);
			this.timerOnce(1800, this, function () {
				canPut.tweenTo({
					alpha: 0
				}, 500, "sineOut", this, function () {
					canPut.alpha = 0;
					this._unLockBet(stopBlink);
				});
			});
		},
		_findAllChips: function (area, seatIdx) {
			var resultChips = [];
			var chipsLayer = this.getChildByName("chips_layer");
			var allChips = chipsLayer.getAllChildren();
			for (var i = 0; i < allChips.length; i++) {
				var chip = allChips[i];
				if (area > 0) {
					if (area != chip.area) continue;
				}
				if (seatIdx >= -1) {
					if (seatIdx != chip.seatIdx) continue;
				}
				resultChips.push(chip);
			}
			return resultChips;
		},
		_findByPlayerId: function (playerId) {
			var resultChips = [];
			var chipsLayer = this.getChildByName("chips_layer");
			var allChips = chipsLayer.getAllChildren();
			for (var i = 0; i < allChips.length; i++) {
				var chip = allChips[i];
				if (playerId != chip.playerId) continue;
				resultChips.push(chip);
			}
			return resultChips;
		},
		_calculateFlyDelay: function (duration, chipNum) {
			var delay = duration;
			if (chipNum > 0) delay = duration / chipNum;
			if (delay > 20) delay = 20;
			return delay;
		},
		_dealerEatAllBet: function (area) {
			var baseUI = this;
			var chipList = this._findAllChips(area, -2);
			var baseDelay = this._calculateFlyDelay(1e3, chipList.length);
			for (var i = chipList.length - 1; i >= 0; i--) {
				var chip = chipList[i];
				var delay = baseDelay * (chipList.length - i - 1);
				this.timerOnce(delay, chip, function () {
					soundMgr.playSE("assets/baccarat/se/chip.mp3");
					var pos = confMgr.setting.dealerPos;
					this.tweenTo(pos, 650, "linearOut", this, function () {
						this.removeSelf();
						baseUI._chipPool.free(this);
					});
				});
			}
		},
		_dealerVomitToArea: function (area, seatIdx, playerId, chipPriceList) {
			var addChipPriceList = [];
			var addChipCount = confMgr.setting.areaOdds[area];
			for (var i = 1; i < addChipCount; i++) {
				for (var j = 0; j < chipPriceList.length; j++) addChipPriceList.push(chipPriceList[j]);
			}
			var chipsLayer = this.getChildByName("chips_layer");
			var baseDelay = this._calculateFlyDelay(1e3, addChipPriceList.length);
			for (var i = 0; i < addChipPriceList.length; i++) {
				var chipType = confMgr.setting.betPriceToIcon[addChipPriceList[i]];
				if (chipType == undefined) {
					continue;
				}
				var delay = baseDelay * (i + 1);
				this.timerOnce(delay, this, function (cChipType, cArea, cSeatIdx, cPlayerId) {
					var chip = this._chipPool.alloc();
					chip.type = cChipType;
					chip.area = cArea;
					chip.seatIdx = cSeatIdx;
					chip.zOrder = 2;
					chip.playerId = cPlayerId;
					chip.pos(confMgr.setting.dealerPos.x, confMgr.setting.dealerPos.y);
					chipsLayer.addChild(chip);
					this.flyChipToArea(chip, cArea, true, true);
				}, [chipType, area, seatIdx, playerId]);
			}
		},
		_areaVomitToPlayer: function () {
			var baseUI = this;
			var seatIdxList = [];
			for (var i = 0; i < this._seatPos.length; i++) seatIdxList.push(i);
			seatIdxList.push(-1);
			for (var i = 0; i < seatIdxList.length; i++) {
				var chipList = this._findAllChips(confMgr.definition.CHIP_AREA.ALL, seatIdxList[i]);
				var baseDelay = this._calculateFlyDelay(1e3, chipList.length);
				for (var j = chipList.length - 1; j >= 0; j--) {
					var chip = chipList[j];
					var delay = baseDelay * (chipList.length - j - 1);
					var pos = confMgr.setting.otherSeatPos;
					if (this._isPlayerInSeat(chip.seatIdx)) {
						pos = this._seatPos[chip.seatIdx];
					}
					if (playerDataMgr.isMyself(chip.playerId) && chip.seatIdx === -1) pos = confMgr.setting.myPos;
					this.timerOnce(delay, chip, function (cPos) {
						soundMgr.playSE("assets/baccarat/se/chip.mp3");
						this.tweenTo(cPos, 650, "linearOut", this, function () {
							this.removeSelf();
							baseUI._chipPool.free(this);
						});
					}, [pos]);
				}
			}
		},
		roundEndSound: function (farmerLength, bankLength, farmerValue, bankerValue, winSide, pairSide) {
			var deltaTime = 0;
			var deltaLength = 1e3;
			if (myGlobalData.isLHD) {
				uiUtils.playSound("farmerLHD", 1);
				this.timerOnce(400 + deltaTime, this, function () {
					uiUtils.playSound("card_point" + farmerValue, 1);
				});
			} else {
				if (farmerLength === 2 && farmerValue > 7) {
					uiUtils.playSound("farmer_t_" + farmerValue, 1);
					deltaTime += deltaLength;
				} else if (farmerValue >= 0) uiUtils.playSound("farmer_" + farmerValue, 1);
			}
			this.timerOnce(2800 + deltaTime, this, function () {
				if (myGlobalData.isLHD) {
					uiUtils.playSound("bankerLHD", 1);
					this.timerOnce(400 + deltaTime, this, function () {
						uiUtils.playSound("card_point" + bankerValue, 1);
					});
				} else {
					if (bankLength === 2 && bankerValue > 7) {
						uiUtils.playSound("banker_t_" + bankerValue, 1);
						deltaTime += deltaLength;
					} else if (bankerValue >= 0) uiUtils.playSound("banker_" + bankerValue, 1);
				}
			});
			this.timerOnce(4400 + deltaTime, this, function () {
				if (winSide - 1 == confMgr.definition.WIN_STATE.WIN_BANK) {
					if (myGlobalData.isLHD) {
						uiUtils.playSound("banker_win_lhd", 1);
					} else {
						uiUtils.playSound("banker_win", 1);
					}
				} else if (winSide - 1 == confMgr.definition.WIN_STATE.WIN_FARM) {
					if (myGlobalData.isLHD) {
						uiUtils.playSound("farmer_win_lhd", 1);
					} else {
						uiUtils.playSound("farmer_win", 1);
					}
				} else if (winSide - 1 == confMgr.definition.WIN_STATE.WIN_DEUCE) {
					uiUtils.playSound("duece_win", 1);
				}
			});
			if (pairSide == confMgr.definition.PAIR_SIDE.Both) {
				this.timerOnce(3400 + deltaTime, this, function () {
					uiUtils.playSound("farmer_pair", 1);
				});
				this.timerOnce(4400 + deltaTime, this, function () {
					uiUtils.playSound("banker_pair", 1);
				});
			} else {
				this.timerOnce(3400 + deltaTime, this, function () {
					if (pairSide == confMgr.definition.PAIR_SIDE.BankerPair) uiUtils.playSound("banker_pair", 1);
					else if (pairSide == confMgr.definition.PAIR_SIDE.FarmerPair) uiUtils.playSound("farmer_pair", 1);
				});
			}
		},
		eventSetPlayerList: function (array) {
			this.getChildByName("player_list").setData(array);
			this.getChildByName("btPlayerList", "text").text = array.length;
		},
		eventSetRoomPlayersCount: function (count) {
			this.getChildByName("history").refreshPlayerNumber(count);
		},
		eventSetDealerList: function (array) {
			this.getChildByName("dealer_list").setData(array);
			this.getChildByName("btDealerList", "text").text = array.length;
		},
		showAllPlayerList: function () {
			var pop = this.getChildByName("player_list");
			if (pop.visible) {
				pop.visible = false;
				return;
			}
			pop.visible = true;
			pop.refresh();
		},
		showAllDealerList: function () {
			var pop = this.getChildByName("dealer_list");
			if (pop.visible) {
				pop.visible = false;
				return;
			}
			pop.visible = true;
			pop.refresh();
		},
		startSendChat: function (btn, act) {
			var scp = this.getChildByName("chat_panel");
			if (act === "close") {
				scp.visible = false;
			} else {
				if (!scp.visible) scp.visible = true;
			}
		},
		eventPlayerShowEmoji: function (seatIdx, emoji) {
			if (seatIdx > -1) {
				this.getChildByName("seats", "seat_" + seatIdx).playEmoji(emoji);
			} else if (seatIdx === "dealer") {
				this.getChildByName("seat_dealer").playEmoji(emoji);
			}
		},
		eventChat: function (type, sender, content, seatIdx) {
			if (seatIdx && type == confMgr.definition.CHAT_TYPE.EMOJI) {
				if (seatIdx in this._seatPos) return;
			}
			this._chatContent.push([type, sender, content]);
			var root = this.getChildByName("chat");
			if (!root.visible) {
				root.visible = true;
				this.timerOnce(2e3, this, function () {
					root.visible = false;
				});
			}
			var panel = this.getChildByName("chat", "content"),
				leading = 2,
				y = panel.getData("lastY");
			if (this._chatContent.length > 1) {
				this._chatContent.shift();
				var tmp;
				for (var i = 0; i < panel.numChildren; i++) {
					var node = panel.getChildAt(i);
					if (i === 0) {
						tmp = node;
						y = 0;
					} else {
						node.pos(0, y + leading);
						y += node.height + leading;
					}
				}
				tmp.destroy();
			}
			if (type === confMgr.definition.CHAT_TYPE.SERIF) {
				var t = createText(0, y + leading, sender + ": " + content);
				panel.addChild(t);
				y += t.height + leading;
			} else if (type === confMgr.definition.CHAT_TYPE.EMOJI) {
				var e = createEmoji(0, y + leading, sender + ": ", content, 40);
				panel.addChild(e);
				y += 40 + leading;
			} else if (type === confMgr.definition.CHAT_TYPE.SYSTEM) {
				var t = createText(0, y + leading, content, "#ffff00");
				panel.addChild(t);
				y += t.height + leading;
			}
			panel.setData("lastY", y);
			panel.callLater(panel.scrollTo, [0, y]);

			function createText(x, y, text, color, size) {
				var label = new Text;
				label.text = text;
				label.fontSize = size || 14;
				label.color = color || "#ffffff";
				label.pos(x, y);
				label.width = 199;
				label.leading = 2;
				label.wordWrap = true;
				return label;
			}

			function createEmoji(x, y, text, pic, size) {
				var parent = new Sprite;
				var t = createText(0, size - 20, text);
				parent.addChild(t);
				var emoji = new Sprite;
				emoji.setImage("assets/main/emoji/" + pic);
				emoji.scale(size / emoji.height);
				emoji.pos(t.textWidth, 0);
				parent.addChild(emoji);
				parent.size(242, size);
				parent.pos(x, y);
				return parent;
			}
		},
		eventUpdateMyChips: function (seatIdx, addGold) {
			if (addGold > 0) {
				if (seatIdx > -1) {
					var tip = this.getChildByName("addTip");
					tip.text = "+" + addGold;
					tip.alpha = 1;
					tip.pos(this._seatPos[seatIdx].x + 35, this._seatPos[seatIdx].y - 30);
					tip.tweenTo({
						y: this._seatPos[seatIdx].y - 40,
						alpha: 0
					}, 1200, "sineOut");
				}
				var my_chips_tip = this.getChildByName("my_chips_tip");
				my_chips_tip.text = "+" + addGold;
				my_chips_tip.alpha = 1;
				my_chips_tip.pos(sys.halfWidth + 40, myChipsY - 25);
				my_chips_tip.tweenTo({
					y: myChipsY - 50,
					alpha: 0
				}, 1200, "sineOut");
			}
			var gold = uiUtils.getFloatByPower(playerDataMgr.getMyCarryGold(), 2);
			this.getChildByName("my_chips").text = gold;
			this.getChildByName("my_chips").scaleY = 1.2;
			this.getChildByName("my_chips").y = myChipsY - 2;
			this.getChildByName("my_chips").tweenTo({
				scaleY: 1,
				y: myChipsY
			}, 100, "sineOut");
			this.getChildByName("playerName").text = playerDataMgr.getMyNick();
		},
		_judgeOpenDealerList: function () {
			var data = roomMgr.getChoose();
			if (data == undefined) return;
			if (data.upToBanker == 0) {
				this.getChildByName("btDealerList").visible = false;
				this.getChildByName("btn_dealer").visible = false;
			}
			if (data.baccaratRoomType == confMgr.definition.BaccaratRoomType.JingMi) {
				this.getChildByName("btPlayerList").pos(-200, 0);
			}
			if (data.baccaratRoomType == confMgr.definition.BaccaratRoomType.Vip) {
				this.getChildByName("btPlayerList").pos(-200, 0);
			}
		},
		becomeDealer: function (btn) {
			if (btn.getData("side") === "up") this.publish("game_baccarat.command.up_to_dealer");
			else if (btn.getData("side") === "cancel") this.publish("game_baccarat.command.cancel_up_dealer");
			else this.publish("game_baccarat.command.down_from_dealer");
		},
		eventUpPlayerDealer: function (nick, head, gold) {
			this.getChildByName("dealer_com").visible = false;
			var dealerSeat = this.getChildByName("seat_dealer");
			dealerSeat.visible = true;
			dealerSeat.playerIn(nick, head, gold);
			this.getChildByName("dealer_info").visible = true;
		},
		eventUpComDealer: function () {
			this.getChildByName("dealer_com").visible = true;
			this.getChildByName("seat_dealer").visible = false;
			this.getChildByName("dealer_info").visible = false;
		},
		eventDownPlayerDealer: function () {
			this.getChildByName("dealer_info").visible = false;
		},
		eventSetDealerButton: function (side) {
			var btn = this.getChildByName("btn_dealer");
			btn.setData("side", side);
			if (side === "up") {
				btn.setSkinImage("assets/baccarat/tex/button_bedealer.png");
				btn.pivotToCenter();
			} else if (side === "down") {
				btn.setSkinImage("assets/baccarat/tex/button_dealeroff.png");
				btn.pivotToCenter();
			} else if (side === "cancel") {
				btn.setSkinImage("assets/baccarat/tex/button_requestoff.png");
				btn.pivotToCenter();
			}
			//if (playerDataMgr.isDealer()) this._lockBet();
			//else this._unLockBet(true)
		},
		eventUpdateDealerInfo: function (dealerCombo, dealerScore, dealerGold) {
			this.getChildByName("dealer_info", "dealer_combo").text = uiLocallization.series_banker + "  " + dealerCombo;
			this.getChildByName("dealer_info", "dealer_score").text = uiLocallization.banker_score + "  " + dealerScore;
			this.getChildByName("seat_dealer").showChips(dealerGold);
		},
		eventShuffleCardStart: function (playerId, playerName, time) {
			var shuffleRoot = this.getChildByName("shuffleCard1");
			shuffleRoot.openShuffle(playerId, playerName, time);
		},
		eventShuffleCardEnd: function (idx, cardValue, cardNum) {
			this._canMinusCardCount = true;
			var shuffleRoot = this.getChildByName("shuffleCard1");
			shuffleRoot.onSyncShuffle(idx, cardValue, cardNum);
			this.getChildByName("history").clear();
		},
		eventShowFailText: function (txt) {
			topMessage.post(txt);
		},
		showHelp: function () {
			this.getChildByName("gameHelp").visible = true;
		},
		showSetting: function () {
			this.getChildByName("settingPanel").visible = true;
			this.getChildByName("settingPanel").check();
		},
		quitGame: function () {
			if (this._hasBet) {
				topConfirm.ask(uiLocallization.onBetLeave, this, function () {
					this.publish("game_baccarat.command.exit");
					roomMgr.lastRoomId = null;
				}, function () { });
			} else this.publish("game_baccarat.command.exit");
		},
		end: function () {
			this._chipPool.collect();
			this._chipPool = null;
			this._super();
		}
	});
	return TableFace;
});
gbx.define("game/baccarat/ui/table", ["conf/system", "comm/base/game_ui", "gbx/render/display/sprite", "gbx/render/display/animation", "gbx/render/display/text", "gbx/render/ui/list", "gbx/render/ui/panel", "gbx/render/schema", "comm/ui/sound_button", "gbx/pool", "game/baccarat/parts/seat", "game/baccarat/parts/putchip_area", "game/baccarat/parts/counter", "game/baccarat/parts/chip", "game/baccarat/parts/card_place", "game/baccarat/parts/top_card_panel", "comm/helper/conf_mgr", "comm/helper/sound_mgr", "comm/helper/playerdata_mgr", "comm/helper/room_mgr", "comm/ui/top_message", "comm/ui/top_confirm", "comm/ui/bitmap_number", "gbx/net/errorcode", "gbx/net/errorcode_des", "comm/ui/ui_utils", "conf/ui_locallization", "game/baccarat/ui/super/table_face"], function (sys, BaseUI, Sprite, Animation, Text, List, Panel, Schema, Button, Pool, Seat, PutchipArea, Counter, Chip, CardPlace, TopCardPanel, confMgr, soundMgr, playerDataMgr, RoomMgr, topMessage, topConfirm, BitmapNumber, ERROR_CODE, ERROR_CODE_DES, uiUtils, uiLocallization, SuperTable) {
	var TableUI = SuperTable.extend({
		init: function () {
			this._super();
			this._chipPool = new Pool(Chip);
			this._seatPos = confMgr.setting.seatPos;
			var tree = [{
				type: "Sprite",
				props: {
					setImage: ["assets/baccarat/tex/lobby_bg.jpg"],
					pos: [0, 0],
					zOrder: 0
				}
			}, {
				type: PutchipArea,
				ctor: [0, 1, confMgr.definition.CHIP_AREA.FARMER],
				props: {
					pos: [sys.halfWidth - 233, 726],
					zOrder: 4,
					name: "pca_" + confMgr.definition.CHIP_AREA.FARMER,
					setClickHandler: [this, this.betOn, confMgr.definition.CHIP_AREA.FARMER]
				}
			}, {
				type: PutchipArea,
				ctor: [0, .95, confMgr.definition.CHIP_AREA.BANKER],
				props: {
					pos: [sys.halfWidth, 726],
					zOrder: 4,
					name: "pca_" + confMgr.definition.CHIP_AREA.BANKER,
					setClickHandler: [this, this.betOn, confMgr.definition.CHIP_AREA.BANKER]
				}
			}, {
				type: PutchipArea,
				ctor: [2, 8, confMgr.definition.CHIP_AREA.DEUCE],
				props: {
					pos: [sys.halfWidth - 78, 610],
					zOrder: 4,
					name: "pca_" + confMgr.definition.CHIP_AREA.DEUCE,
					setClickHandler: [this, this.betOn, confMgr.definition.CHIP_AREA.DEUCE]
				}
			}, {
				type: PutchipArea,
				ctor: [1, 11, confMgr.definition.CHIP_AREA.FARMERPAIR],
				props: {
					pos: [sys.halfWidth - 156 - 77, 610],
					zOrder: 4,
					name: "pca_" + confMgr.definition.CHIP_AREA.FARMERPAIR,
					setClickHandler: [this, this.betOn, confMgr.definition.CHIP_AREA.FARMERPAIR]
				}
			}, {
				type: PutchipArea,
				ctor: [1, 11, confMgr.definition.CHIP_AREA.BANKERPAIR],
				props: {
					pos: [sys.halfWidth + 78, 610],
					zOrder: 4,
					name: "pca_" + confMgr.definition.CHIP_AREA.BANKERPAIR,
					setClickHandler: [this, this.betOn, confMgr.definition.CHIP_AREA.BANKERPAIR]
				}
			}, {
				type: Counter,
				props: {
					pos: [sys.halfWidth, 576],
					name: "counter",
					zOrder: 4
				},
				exec: [
					["setCommand", "times_up", this.counterTimeUp, this]
				]
			}, {
				type: CardPlace,
				ctor: ["banker"],
				props: {
					pos: [sys.halfWidth, 515],
					zOrder: 6,
					name: "banker_card_place"
				}
			}, {
				type: CardPlace,
				ctor: ["farmer"],
				props: {
					pos: [sys.halfWidth, 515],
					zOrder: 6,
					name: "farmer_card_place"
				}
			}, {
				type: TopCardPanel,
				props: {
					zOrder: 9,
					name: "topCard",
					visible: false
				}
			}];
			var ui = new Schema(tree);
			ui.appendTo(this);
			var seats = this.getChildByName("seats");
			for (var i = 0; i < this._seatPos.length; i++) {
				var tempSeat = new Seat(false, i, false);
				tempSeat.pos(this._seatPos[i].x, this._seatPos[i].y);
				tempSeat.name = "seat_" + i;
				seats.addChild(tempSeat);
			}
		},
		_unLockBet: function (stopBlink) {
			this._canBet = true;
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.BANKER).enable(stopBlink);
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.FARMER).enable(stopBlink);
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.DEUCE).enable(stopBlink);
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.BANKERPAIR).enable(stopBlink);
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.FARMERPAIR).enable(stopBlink);
			this.getChildByName("bet_panel").enabled = true;
		},
		_lockBet: function () {
			if (!this._canBet) return;
			this._canBet = false;
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.BANKER).disable();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.FARMER).disable();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.DEUCE).disable();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.BANKERPAIR).disable();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.FARMERPAIR).disable();
			this.getChildByName("bet_panel").enabled = false;
		},
		eventStartBet: function (time, idDealer, isInit) {
			this.eventCheckStartBet(time, isInit);
		},
		eventSendCard: function (bankerCards, farmerCards, doAnimation) {
			this._lockBet();
			this.getChildByName("counter").stop();
			var bankerPlace = this.getChildByName("banker_card_place"),
				farmerPlace = this.getChildByName("farmer_card_place");
			var topCardPanel = this.getChildByName("topCard");
			var cardNum = bankerCards.length + farmerCards.length;
			bankerCards.splice(0, 0, cardNum, doAnimation);
			farmerCards.splice(0, 0, cardNum, doAnimation);
			if (doAnimation) {
				this._canMinusCardCount = true;
				farmerPlace.sendCard.apply(farmerPlace, farmerCards);
				this.timerOnce(900, bankerPlace, bankerPlace.sendCard, bankerCards);
				topCardPanel.sendCardFarmer.apply(topCardPanel, farmerCards);
				this.timerOnce(900, topCardPanel, topCardPanel.sendCardBanker, bankerCards);
			} else {
				farmerPlace.sendCard.apply(farmerPlace, farmerCards);
				bankerPlace.sendCard.apply(bankerPlace, bankerCards);
				topCardPanel.sendCardFarmer.apply(topCardPanel, farmerCards);
				topCardPanel.sendCardBanker.apply(topCardPanel, bankerCards);
			}
		},
		betOn: function (area) {
			if (!this._canBet) return;
			var betPanel = this.getChildByName("bet_panel");
			if (betPanel.selectingBetIdx < 0) return;
			var chip = betPanel.chipArray[betPanel.selectingBetIdx].price;
			this.publish("game_baccarat.command.player_bet_area", area, chip);
			var betArea = this.getChildByName("pca_" + area);
			betArea.blinkBorder1();
		},
		eventUpdateAreaMyChips: function (area, chips) {
			this._hasBet = true;
			if (this.getChildByName("pca_" + area) == null) {
				return;
			}
			this.getChildByName("pca_" + area).setMyChips(chips);
		},
		eventClearAreaMyChips: function () {
			for (var area = confMgr.definition.CHIP_AREA.BANKER; area <= confMgr.definition.CHIP_AREA.FARMERPAIR; area++) this.getChildByName("pca_" + area).setMyChips(0);
		},
		eventFlyBet: function (seatIdx, area, playerId, chip, doAnimation) {
			var chipType = confMgr.setting.betPriceToIcon[chip];
			this.flyChip(chipType, seatIdx, area, playerId, doAnimation);
		},
		flyChipToArea: function (chip, toAreaType, doAnimation) {
			var targetArea = this.getChildByName("pca_" + toAreaType);
			var chipRadius = 16;
			var fixedX = 0;
			var fixedLengthX = 0;
			switch (toAreaType) {
				case confMgr.definition.CHIP_AREA.FARMER:
					fixedX = 38.5;
					fixedLengthX = 38.5;
					break;
				case confMgr.definition.CHIP_AREA.BANKER:
					fixedX = -38.5;
					fixedLengthX = 38.5;
					break;
			}
			var posX = targetArea.x + fixedX + 2 * (Math.random() - .5) * (targetArea.width / 2 - chipRadius - fixedLengthX) + targetArea.width / 2;
			var posY = targetArea.y + 2 * (Math.random() - .5) * ((targetArea.height - 20) / 2 - chipRadius) + (targetArea.height - 20) / 2;
			if (doAnimation) {
				chip.flyTo(posX, posY);
				soundMgr.playSE("assets/baccarat/se/chip.mp3");
			} else {
				chip.pos(posX, posY);
			}
		},
		eventSetWinArea: function (area) {
			var betArea = this.getChildByName("pca_" + area);
			if (betArea != null) {
				betArea.blinkFace();
			}
		},
		eventAddHistory: function (winSide, pairSide) {
			this.getChildByName("history").add(winSide, pairSide);
			var winWord = this.getChildByName("win_side");
			winWord.setImage("assets/baccarat/tex/win_" + winSide + ".png");
			winWord.alpha = 1;
			this.timerOnce(3e3, this, function () {
				winWord.tweenTo({
					alpha: 0
				}, 500, "sineOut", this, function () {
					winWord.alpha = 0;
				});
			});
			var bankersPlace = this.getChildByName("banker_card_place");
			var farmersPlace = this.getChildByName("farmer_card_place");
			if (bankersPlace.getCardData() == null) {
				return;
			}
			var bankerLength = bankersPlace.getCardData().length;
			var farmerLength = farmersPlace.getCardData().length;
			var farmerValue = farmersPlace.getValue();
			var bankerValue = bankersPlace.getValue();
			this.roundEndSound(farmerLength, bankerLength, farmerValue, bankerValue, winSide, pairSide);
		},
		eventSetRoundResult: function (failAreas, dealerToAreaChipInfo) {
			this._hasBet = false;
			soundMgr.playSE("assets/baccarat/se/pong.mp3");
			for (var index = 0; index < failAreas.length; index++) {
				var area = failAreas[index];
				this._dealerEatAllBet(area);
			}
			for (var key in dealerToAreaChipInfo) {
				var keyArr = key.split("_");
				var seatIdx = parseInt(keyArr[0]);
				var area = parseInt(keyArr[1]);
				var playerId = keyArr[2];
				this.timerOnce(1500, this, this._dealerVomitToArea, [area, seatIdx, playerId, dealerToAreaChipInfo[key]], false);
			}
			this.timerOnce(2500, this, function () {
				var bankersPlace = this.getChildByName("banker_card_place"),
					farmersPlace = this.getChildByName("farmer_card_place");
				bankersPlace.recycleCard();
				farmersPlace.recycleCard();
				var topCardPanel = this.getChildByName("topCard");
				topCardPanel.clear();
			});
			this.timerOnce(4500, this, function () {
				this._areaVomitToPlayer();
			});
		},
		eventClearStage: function () {
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.BANKER).reset();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.FARMER).reset();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.DEUCE).reset();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.BANKERPAIR).reset();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.FARMERPAIR).reset();
			this.getChildByName("banker_card_place").clear();
			this.getChildByName("farmer_card_place").clear();
			this.getChildByName("topCard").clear();
		}
	});
	return TableUI;
});
gbx.define("game/baccarat/ui/table_jinmi", ["conf/system", "comm/base/game_ui", "gbx/render/display/sprite", "gbx/render/display/animation", "gbx/render/display/text", "gbx/render/ui/list", "gbx/render/ui/panel", "gbx/render/schema", "comm/ui/sound_button", "gbx/pool", "game/baccarat/parts/seat", "game/baccarat/parts/putchip_area_mi", "game/baccarat/parts/counter", "game/baccarat/parts/chip", "game/baccarat/parts/card_place_mi", "game/baccarat/parts/sound_panel", "game/baccarat/parts/top_card_panel_mi", "game/baccarat/parts/baccarat_room_params", "comm/helper/conf_mgr", "comm/helper/sound_mgr", "comm/helper/playerdata_mgr", "comm/helper/room_mgr", "comm/ui/bitmap_number", "gbx/net/errorcode", "gbx/net/errorcode_des", "comm/ui/ui_utils", "conf/ui_locallization", "game/baccarat/ui/super/table_face"], function (sys, BaseUI, Sprite, Animation, Text, List, Panel, Schema, Button, Pool, Seat, PutchipAreaMI, Counter, Chip, CardPlaceMI, SoundPanel, TopCardPanelMI, roomParam, confMgr, soundMgr, playerDataMgr, roomMgr, BitmapNumber, ERROR_CODE, ERROR_CODE_DES, uiUtils, uiLocallization, SuperTable) {
	var array = roomParam.getJMChipsPos();
	var winArray = roomParam.getJMChipsWinPos();
	var baseBankerPoints = array[0];
	var bankerPoints = [];
	var baseWinBankerPoints = winArray[0];
	var bankerWinPoints = [];
	var baseFarmerPoints = array[1];
	var farmerPoints = [];
	var baseWinFarmerPoints = winArray[1];
	var farmerWinPoints = [];
	var baseDuecePoints = array[2];
	var duecePoints = [];
	var baseWinDuecePoints = winArray[2];
	var dueceWinPoints = [];
	var baseBankerPairPoints = array[3];
	var bankerPairPoints = [];
	var baseWinBankerPairPoints = winArray[3];
	var bankerPairWinPoints = [];
	var baseFarmerPairPoints = array[4];
	var farmerPairPoints = [];
	var baseWinFarmerPairPoints = winArray[4];
	var farmerPairWinPoints = [];
	var areaDy = 2;
	var farmerGetPos = [sys.halfWidth - 60, 570];
	var bankerGetPos = [sys.halfWidth + 60, 570];
	var TableUI = SuperTable.extend({
		init: function () {
			this._super();
			this._chipPool = new Pool(Chip);
			this._seatPos = [];
			this._bindPos();
			var tree = [{
				type: "Sprite",
				props: {
					setImage: ["assets/baccarat/tex/lobby_bg_1.png"],
					pos: [0, 0],
					zOrder: 0,
					name: "bg_scene"
				}
			}, {
				type: "Sprite",
				props: {
					setImage: ["assets/baccarat/tex/xian_get.png"],
					pos: farmerGetPos,
					pivotToCenter: [],
					zOrder: 6,
					name: "farmer_get"
				}
			}, {
				type: "Sprite",
				props: {
					setImage: ["assets/baccarat/tex/zhuang_get.png"],
					pos: bankerGetPos,
					pivotToCenter: [],
					zOrder: 6,
					name: "banker_get"
				}
			}, {
				type: PutchipAreaMI,
				props: {
					pos: [0, sys.halfHeight - 24],
					zOrder: 3,
					name: "put_area",
					setClickHandler: [this, this.betOn]
				}
			}, {
				type: Counter,
				props: {
					pos: [182, 499],
					name: "counter",
					zOrder: 4
				},
				exec: [
					["setCommand", "times_up", this.counterTimeUp, this]
				]
			}, {
				type: CardPlaceMI,
				props: {
					pos: [sys.halfWidth, 515],
					zOrder: 9,
					name: "card_place"
				}
			}, {
				type: SoundPanel,
				props: {
					pos: [0, 1080],
					zOrder: 6,
					visible: false,
					name: "soundPanel"
				}
			}, {
				type: "Button",
				props: {
					setSkinImage: ["assets/main/public/button_fly_card.png"],
					stateNum: 2,
					pos: [445, 320],
					zOrder: 4,
					scale: [.82],
					name: "flyCardBtn",
					visible: true,
					setClickHandler: [this, this.flyCard]
				}
			}, {
				type: TopCardPanelMI,
				props: {
					zOrder: 9,
					name: "topCard",
					visible: false
				}
			}];
			var ui = new Schema(tree);
			ui.appendTo(this);
			this.getChildByName("card_count").pos(568, 520);
			var seats = this.getChildByName("seats");
			for (var i = 0; i < this._seatPos.length; i++) {
				var tempSeat = new Seat(false, i, true);
				tempSeat.pos(this._seatPos[i].x, this._seatPos[i].y);
				tempSeat.name = "seat_" + i;
				seats.addChild(tempSeat);
			}
			this.subscribe("game_baccarat.play.getBetMaxPlayer", this, this.eventIconMiflyToSeat);
			this.subscribe("game_baccarat.play.setSoundPanel", this, this.eventToggleBetPanel);
			this.subscribe("game_baccarat.play.checkFlyCard", this, this.eventCheckFlyCard);
			this.subscribe("game_baccarat.play.flycardAnimation", this, this.eventPlayFlyCardAnimation);
			this.eventCheckFlyCard(false);
		},
		InPolygon: function (x, y, areaPoints) {
			var p;
			p = {};
			p.x = x;
			p.y = y;
			var nCross = 0;
			var p1x = NaN,
				p1y = NaN,
				p2x = NaN,
				p2y = NaN;
			var len = 0;
			len = areaPoints.length;
			for (var i = 0; i < len; i += 2) {
				p1x = areaPoints[i];
				p1y = areaPoints[i + 1];
				p2x = areaPoints[(i + 2) % len];
				p2y = areaPoints[(i + 3) % len];
				var p1 = areaPoints[i];
				var p2 = areaPoints[(i + 1) % areaPoints.length];
				if (p1y == p2y) continue;
				if (p.y < Math.min(p1y, p2y)) continue;
				if (p.y >= Math.max(p1y, p2y)) continue;
				var x = (p.y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x;
				if (x > p.x) {
					nCross++;
				}
			}
			return nCross % 2 == 1;
		},
		_bindPos: function () {
			bankerPoints = [];
			farmerPoints = [];
			duecePoints = [];
			bankerPairPoints = [];
			farmerPairPoints = [];
			bankerWinPoints = [];
			farmerWinPoints = [];
			dueceWinPoints = [];
			bankerPairWinPoints = [];
			farmerPairWinPoints = [];
			for (var i = 0; i < confMgr.setting.seatPos_jinMi.length; i++) {
				this._seatPos.push(confMgr.setting.seatPos_jinMi[i]);
				bankerPoints.push(baseBankerPoints[i]);
				farmerPoints.push(baseFarmerPoints[i]);
				duecePoints.push(baseDuecePoints[i]);
				bankerPairPoints.push(baseBankerPairPoints[i]);
				farmerPairPoints.push(baseFarmerPairPoints[i]);
				bankerWinPoints.push(baseWinBankerPoints[i]);
				farmerWinPoints.push(baseWinFarmerPoints[i]);
				dueceWinPoints.push(baseWinDuecePoints[i]);
				bankerPairWinPoints.push(baseWinBankerPairPoints[i]);
				farmerPairWinPoints.push(baseWinFarmerPairPoints[i]);
			}
		},
		_reorderSeats: function (mySeatIdx) {
			var seatArr = [];
			var newSeatPos = [];
			for (var i = 0; i < confMgr.setting.seatPos_jinMi.length; i++) {
				if (i != mySeatIdx) seatArr.push(i);
				newSeatPos.push(null);
			}
			seatArr.splice(2, 0, mySeatIdx);
			for (var i = 0; i < seatArr.length; i++) {
				var seatIdx = seatArr[i];
				newSeatPos[seatIdx] = confMgr.setting.seatPos_jinMi[i];
				bankerPoints[seatIdx] = baseBankerPoints[i];
				farmerPoints[seatIdx] = baseFarmerPoints[i];
				duecePoints[seatIdx] = baseDuecePoints[i];
				bankerPairPoints[seatIdx] = baseBankerPairPoints[i];
				farmerPairPoints[seatIdx] = baseFarmerPairPoints[i];
				bankerWinPoints[seatIdx] = baseWinBankerPoints[i];
				farmerWinPoints[seatIdx] = baseWinFarmerPoints[i];
				dueceWinPoints[seatIdx] = baseWinDuecePoints[i];
				bankerPairWinPoints[seatIdx] = baseWinBankerPairPoints[i];
				farmerPairWinPoints[seatIdx] = baseWinFarmerPairPoints[i];
			}
			this._seatPos = newSeatPos;
			var cardPlace = this.getChildByName("card_place");
			cardPlace.reorderSeats(seatArr);
			for (var i = 0; i < this._seatPos.length; i++) this.getChildByName("seats", "seat_" + i).pos(this._seatPos[i].x, this._seatPos[i].y);
		},
		eventSetPlayerInSeat: function (seatIdx, nick, head, gold, isMe, leftTime) {
			if (seatIdx > -1 && seatIdx < this._seatPos.length) {
				var seat = this.getChildByName("seats", "seat_" + seatIdx);
				seat.playerIn(nick, head, gold, isMe);
				if (isMe) this._reorderSeats(seatIdx);
				seat.startMaskClip(leftTime);
			}
		},
		eventIconMiflyToSeat: function (farmerMaxSeatIdx, bankerMaxSeatIdx, doAnimation) {
			var farmerGet = this.getChildByName("farmer_get");
			var pos = farmerGetPos.slice(0);
			if (farmerMaxSeatIdx != -1) {
				var tarSeat = this.getChildByName("seats", "seat_" + farmerMaxSeatIdx);
				pos[0] = tarSeat.x;
				pos[1] = tarSeat.y;
			}
			if (doAnimation) farmerGet.tweenTo({
				x: pos[0],
				y: pos[1]
			}, 200, "sineOut");
			else farmerGet.pos(pos[0], pos[1]);
			var bankerGet = this.getChildByName("banker_get");
			pos = bankerGetPos.slice(0);
			if (bankerMaxSeatIdx != -1) {
				var tarSeat = this.getChildByName("seats", "seat_" + bankerMaxSeatIdx);
				pos[0] = tarSeat.x;
				pos[1] = tarSeat.y;
			}
			if (doAnimation) bankerGet.tweenTo({
				x: pos[0],
				y: pos[1]
			}, 200, "sineOut");
			else bankerGet.pos(pos[0], pos[1]);
		},
		eventStartBet: function (time, idDealer, isInit) {
			this._resetTargetAreaPos();
			this.getChildByName("farmer_get").pos(farmerGetPos[0], farmerGetPos[1]);
			this.getChildByName("farmer_get").setImage("assets/baccarat/tex/xian_get.png");
			this.getChildByName("banker_get").pos(bankerGetPos[0], bankerGetPos[1]);
			this.getChildByName("banker_get").setImage("assets/baccarat/tex/zhuang_get.png");
			this.eventCheckStartBet(time, isInit);
			for (var i = 0; i < this._seatPos.length; i++) this.getChildByName("seats", "seat_" + i).startMaskClip(time);
			var chooseDate = roomMgr.getChoose();
			if (chooseDate.upToBanker == 1 && roomMgr.getIsVip()) this.getChildByName("btn_dealer").visible = time > 0;
		},
		_unLockBet: function (stopBlink) {
			if (playerDataMgr.isDealer()) return;
			this._canBet = true;
			this.getChildByName("put_area").enable(stopBlink);
			this.getChildByName("bet_panel").enabled = true;
			if (!this._hasBet) this.eventCheckFlyCard(false);
			this._toggleBetPanel(true);
		},
		_lockBet: function () {
			if (!this._canBet) return;
			this._canBet = false;
			this.getChildByName("put_area").disable();
			this.getChildByName("bet_panel").enabled = false;
			this.eventCheckFlyCard(true);
		},
		eventToggleBetPanel: function (en, step) {
			this._toggleBetPanel(!en);
			this.getChildByName("soundPanel").setStep(step);
		},
		_toggleBetPanel: function (en) {
			this.getChildByName("bet_panel").visible = en;
			this.getChildByName("soundPanel").visible = !en;
			this.getChildByName("openBetSet").visible = en;
			this.getChildByName("my_chips").visible = en;
			this.getChildByName("playerName").visible = en;
		},
		eventSendCard: function (bankersCard, farmersCard, steps, leftTime, step2Send2, farmerSeatIdx, bankerSeatIdx, myLookSide, doAnimation, lookCardDir, lookStep, lookRadian) {
			this._lockBet();
			this.eventCheckFlyCard(true);
			this.getChildByName("counter").stop();
			var chooseDate = roomMgr.getChoose();
			if (chooseDate.upToBanker == 1 && roomMgr.getIsVip()) this.getChildByName("btn_dealer").visible = false;
			this.publish("game_baccarat.seat.stopMaskClip", -1, true);
			if (doAnimation) {
				if (steps[0] == confMgr.definition.BaccaratSendCardStepJM.FarmerFirst) this._canMinusCardCount = true;
			}
			var cardPlace = this.getChildByName("card_place");
			cardPlace.sendCardCenter(farmersCard, bankersCard, steps, leftTime, step2Send2, farmerSeatIdx, bankerSeatIdx, myLookSide, doAnimation, lookCardDir, lookStep, lookRadian);
		},
		betOn: function () {
			var area = 0;
			var array = roomParam.getBetOnPos();
			this._bankerArray = array[0];
			this._farmerArray = array[1];
			this._dueceArray = array[2];
			this._bankerPairArray = array[3];
			this._farmerPairArray = array[4];
			if (this.InPolygon(Laya.stage.mouseX, Laya.stage.mouseY, this._bankerArray)) area = 1;
			else if (this.InPolygon(Laya.stage.mouseX, Laya.stage.mouseY, this._farmerArray)) area = 2;
			else if (this.InPolygon(Laya.stage.mouseX, Laya.stage.mouseY, this._dueceArray)) area = 3;
			else if (this.InPolygon(Laya.stage.mouseX, Laya.stage.mouseY, this._bankerPairArray)) area = 4;
			else if (this.InPolygon(Laya.stage.mouseX, Laya.stage.mouseY, this._farmerPairArray)) area = 5;
			if (area == 0) return;
			if (!this._canBet || area == 0) return;
			var betPanel = this.getChildByName("bet_panel");
			if (betPanel.selectingBetIdx < 0) return;
			var chip = betPanel.chipArray[betPanel.selectingBetIdx].price;
			this.publish("game_baccarat.command.player_bet_area", area, chip);
			var betArea = this.getChildByName("put_area");
			betArea.blinkBorder1(area);
		},
		eventUpdateAreaMyChips: function (area, chips) {
			this._hasBet = true;
			var put_area = this.getChildByName("put_area");
			put_area.setMyChips(area, 2, chips);
		},
		eventClearAreaMyChips: function () {
			var put_area = this.getChildByName("put_area");
			put_area.setMyChips(-1);
		},
		eventFlyBet: function (seatIdx, area, playerId, chip, doAnimation, chipIndex, integratedChipsInfo) {
			var chipType = confMgr.setting.betPriceToIcon[chip];
			this.flyChip(chipType, seatIdx, area, playerId, doAnimation, chipIndex, integratedChipsInfo);
		},
		flyChipToArea: function (chip, toAreaType, doAnimation, isWin, chipIndex, integratedChipsInfo) {
			var tarPos = this._getTargetAreaPos(toAreaType, chip.seatIdx, isWin, chipIndex);
			chip.zOrder = tarPos.z;
			if (doAnimation) {
				if (integratedChipsInfo != null) chip.flyTo(tarPos.x, tarPos.y, this, this._integrateChips, [chip, toAreaType, chip.seatIdx, integratedChipsInfo]);
				else chip.flyTo(tarPos.x, tarPos.y, chip, chip.flyEnd);
				soundMgr.playSE("assets/baccarat/se/chip.mp3");
			} else {
				chip.pos(tarPos.x, tarPos.y);
			}
		},
		_resetTargetAreaPos: function () {
			for (var i = 0; i < confMgr.setting.seatPos_jinMi.length; i++) {
				bankerPoints[i].r = 0;
				farmerPoints[i].r = 0;
				duecePoints[i].r = 0;
				bankerPairPoints[i].r = 0;
				farmerPairPoints[i].r = 0;
				bankerWinPoints[i].r = 0;
				farmerWinPoints[i].r = 0;
				dueceWinPoints[i].r = 0;
				bankerPairWinPoints[i].r = 0;
				farmerPairWinPoints[i].r = 0;
			}
		},
		_getTargetAreaPos: function (area, seatIdx, isWin, chipIndex) {
			var tempPos;
			if (isWin) {
				switch (area) {
					case confMgr.definition.CHIP_AREA.BANKER:
						tempPos = bankerWinPoints;
						break;
					case confMgr.definition.CHIP_AREA.FARMER:
						tempPos = farmerWinPoints;
						break;
					case confMgr.definition.CHIP_AREA.DEUCE:
						tempPos = dueceWinPoints;
						break;
					case confMgr.definition.CHIP_AREA.BANKERPAIR:
						tempPos = bankerPairWinPoints;
						break;
					case confMgr.definition.CHIP_AREA.FARMERPAIR:
						tempPos = farmerPairWinPoints;
						break;
				}
			} else {
				switch (area) {
					case confMgr.definition.CHIP_AREA.BANKER:
						tempPos = bankerPoints;
						break;
					case confMgr.definition.CHIP_AREA.FARMER:
						tempPos = farmerPoints;
						break;
					case confMgr.definition.CHIP_AREA.DEUCE:
						tempPos = duecePoints;
						break;
					case confMgr.definition.CHIP_AREA.BANKERPAIR:
						tempPos = bankerPairPoints;
						break;
					case confMgr.definition.CHIP_AREA.FARMERPAIR:
						tempPos = farmerPairPoints;
						break;
				}
			}
			var ret = {};
			ret.x = confMgr.setting.otherSeatPos.x;
			ret.y = confMgr.setting.otherSeatPos.y;
			ret.z = 2;
			if (tempPos && seatIdx != -1) {
				var pos = tempPos[seatIdx];
				if (chipIndex != undefined) {
					pos.r = chipIndex;
				} else {
					chipIndex = pos.r;
					pos.r++;
				}
				ret.x = pos.x;
				ret.y = pos.y - chipIndex * areaDy;
				ret.z = 2 + chipIndex;
				return ret;
			}
			return ret;
		},
		_integrateChips: function (curChip, toAreaType, fromSeatIdx, integratedChipsInfo) {
			var oldChips = this._findAllChips(toAreaType, fromSeatIdx);
			for (var i = 0; i < oldChips.length; i++) {
				var chip = oldChips[i];
				if (chip.isFlying) continue;
				chip.removeSelf();
				this._chipPool.free(chip);
			}
			curChip.removeSelf();
			this._chipPool.free(curChip);
			var chipsLayer = this.getChildByName("chips_layer");
			for (var i = 0; i < integratedChipsInfo.length; i++) {
				var oneInfo = integratedChipsInfo[i];
				var tarPos = this._getTargetAreaPos(toAreaType, fromSeatIdx, false, i);
				var chip = this._chipPool.alloc();
				var chipType = confMgr.setting.betPriceToIcon[oneInfo.money];
				chip.type = chipType;
				chip.area = toAreaType;
				chip.seatIdx = fromSeatIdx;
				chip.zOrder = tarPos.z;
				chip.pos(tarPos.x, tarPos.y);
				chip.playerId = oneInfo.playerId;
				chipsLayer.addChild(chip);
			}
		},
		eventSetWinArea: function (area) {
			var betArea = this.getChildByName("put_area");
			betArea.blinkFace(area);
		},
		eventAddHistory: function (winSide, pairSide, bankerMaxSeatIdx, farmerMaxSeatIdx) {
			this.getChildByName("history").add(winSide, pairSide);
			var winWord = this.getChildByName("win_side");
			winWord.setImage("assets/baccarat/tex/win_" + winSide + ".png");
			winWord.alpha = 1;
			this.timerOnce(5e3, this, function () {
				winWord.tweenTo({
					alpha: 0
				}, 500, "sineOut", this, function () {
					winWord.alpha = 0;
				});
			});
			if (bankerMaxSeatIdx != -1) {
				if (winSide == confMgr.definition.WIN_STATE.WIN_BANK) this.getChildByName("banker_get").setImage("assets/baccarat/tex/zhuang_get_win.png");
			}
			if (farmerMaxSeatIdx != -1) {
				if (winSide == confMgr.definition.WIN_STATE.WIN_FARM) this.getChildByName("farmer_get").setImage("assets/baccarat/tex/xian_get_win.png");
			}
			var card_place = this.getChildByName("card_place");
			var farmerLength = card_place.getFarmerPointArr().length;
			var bankerLength = card_place.getBankerPointArr().length;
			var farmerValue = card_place.getFarmerValue();
			var bankerValue = card_place.getBankerValue();
			this.roundEndSound(farmerLength, bankerLength, farmerValue, bankerValue, winSide, pairSide);
		},
		eventSetRoundResult: function (failAreas, dealerToAreaChipInfo) {
			this._hasBet = false;
			soundMgr.playSE("assets/baccarat/se/pong.mp3");
			for (var index = 0; index < failAreas.length; index++) {
				var area = failAreas[index];
				this._dealerEatAllBet(area);
			}
			for (var key in dealerToAreaChipInfo) {
				var keyArr = key.split("_");
				var seatIdx = parseInt(keyArr[0]);
				var area = parseInt(keyArr[1]);
				var playerId = keyArr[2];
				this.timerOnce(1500, this, this._dealerVomitToArea, [area, seatIdx, playerId, dealerToAreaChipInfo[key]], false);
			}
			this.timerOnce(2500, this, function () {
				var cardPlace = this.getChildByName("card_place");
				cardPlace.recycleCard();
			});
			this.timerOnce(4500, this, function () {
				this._areaVomitToPlayer();
			});
		},
		flyCard: function () {
			if (!this._canBet) return;
			this.publish("game_baccarat.command.flyCard");
		},
		eventCheckFlyCard: function (state) {
			this.getChildByName("flyCardBtn").gray = state;
		},
		eventPlayFlyCardAnimation: function () {
			var flyCard = this.getChildByName("flyCardBtn");
			if (flyCard.visible) {
				var delay = 300;
				for (var i = 0; i < 2; i++) {
					this.timerOnce(i * delay, this, function () {
						this.blinkFlyCard();
					});
				}
			}
		},
		blinkFlyCard: function () {
			var flyCard = this.getChildByName("flyCardBtn");
			flyCard.alpha = 1;
			flyCard.tweenTo({
				alpha: 0
			}, 150, "sineOut");
			this.timerOnce(200, this, function () {
				flyCard.tweenTo({
					alpha: 1
				}, 150, "sineOut");
			});
		},
		eventClearStage: function () {
			this.getChildByName("put_area").reset();
			this.getChildByName("card_place").clear();
		}
	});
	return TableUI;
});
gbx.define("game/baccarat/ui/table_LHD", ["conf/system", "comm/base/game_ui", "gbx/render/display/sprite", "gbx/render/display/animation", "gbx/render/display/text", "gbx/render/ui/list", "gbx/render/ui/panel", "gbx/render/schema", "comm/ui/sound_button", "gbx/pool", "game/baccarat/parts/seat", "game/baccarat/parts/putchip_area_lhd", "game/baccarat/parts/counter", "game/baccarat/parts/chip", "game/baccarat/parts/card_place", "game/baccarat/parts/top_card_panel", "comm/helper/conf_mgr", "comm/helper/sound_mgr", "comm/helper/playerdata_mgr", "comm/helper/room_mgr", "comm/ui/top_message", "comm/ui/top_confirm", "comm/ui/bitmap_number", "gbx/net/errorcode", "gbx/net/errorcode_des", "comm/ui/ui_utils", "conf/ui_locallization", "game/baccarat/ui/super/table_face"], function (sys, BaseUI, Sprite, Animation, Text, List, Panel, Schema, Button, Pool, Seat, PutchipArea, Counter, Chip, CardPlace, TopCardPanel, confMgr, soundMgr, playerDataMgr, RoomMgr, topMessage, topConfirm, BitmapNumber, ERROR_CODE, ERROR_CODE_DES, uiUtils, uiLocallization, SuperTable) {
	var TableUI = SuperTable.extend({
		init: function () {
			this._super();
			this._chipPool = new Pool(Chip);
			this._seatPos = confMgr.setting.seatPos_LHD;
			var offSize = { x: 57, y: 56 };
			var tree = [{
				type: "Sprite",
				props: {
					setImage: ["assets/baccarat/tex/bg.jpg"],
					pos: [0, 0],
					zOrder: 0
				}
			}, {
				type: "Sprite",
				props: {
					setImage: ["assets/baccarat/tex/pairbet.png"],
					pos: [30, 570],
					zOrder: 0
				}
			}, {
				type: PutchipArea,
				ctor: [0, 1, confMgr.definition.CHIP_AREA.FARMER],
				props: {
					pos: [sys.halfWidth - 233 - offSize.x, 726 + offSize.y],
					zOrder: 6,
					name: "pca_" + confMgr.definition.CHIP_AREA.FARMER,
					setClickHandler: [this, this.betOn, confMgr.definition.CHIP_AREA.FARMER]
				}
			}, {
				type: PutchipArea,
				ctor: [0, .95, confMgr.definition.CHIP_AREA.BANKER],
				props: {
					pos: [sys.halfWidth + offSize.x + 23, 726 + offSize.y],
					zOrder: 6,
					name: "pca_" + confMgr.definition.CHIP_AREA.BANKER,
					setClickHandler: [this, this.betOn, confMgr.definition.CHIP_AREA.BANKER]
				}
			}, {
				type: PutchipArea,
				ctor: [2, 8, confMgr.definition.CHIP_AREA.DEUCE],
				props: {
					pos: [sys.halfWidth - 81, 783],
					zOrder: 6,
					name: "pca_" + confMgr.definition.CHIP_AREA.DEUCE,
					setClickHandler: [this, this.betOn, confMgr.definition.CHIP_AREA.DEUCE]
				}
			}, {
				type: PutchipArea,
				ctor: [1, 11, confMgr.definition.CHIP_AREA.FARMERSINGLE],
				props: {
					pos: [sys.halfWidth - 144 * 2 - 1, 710],
					zOrder: 5,
					name: "pca_" + confMgr.definition.CHIP_AREA.FARMERSINGLE,
					setClickHandler: [this, this.betOn, confMgr.definition.CHIP_AREA.FARMERSINGLE]
				}
			}, {
				type: PutchipArea,
				ctor: [1, 11, confMgr.definition.CHIP_AREA.FARMERDOUBLE],
				props: {
					pos: [sys.halfWidth - 144, 710],
					zOrder: 5,
					name: "pca_" + confMgr.definition.CHIP_AREA.FARMERDOUBLE,
					setClickHandler: [this, this.betOn, confMgr.definition.CHIP_AREA.FARMERDOUBLE]
				}
			}, {
				type: PutchipArea,
				ctor: [1, 11, confMgr.definition.CHIP_AREA.BANKERDOUBLE],
				props: {
					pos: [sys.halfWidth, 710],
					zOrder: 5,
					name: "pca_" + confMgr.definition.CHIP_AREA.BANKERDOUBLE,
					setClickHandler: [this, this.betOn, confMgr.definition.CHIP_AREA.BANKERDOUBLE]
				}
			}, {
				type: PutchipArea,
				ctor: [1, 11, confMgr.definition.CHIP_AREA.BANKERSINGLE],
				props: {
					pos: [sys.halfWidth + 144 - 1, 710],
					zOrder: 5,
					name: "pca_" + confMgr.definition.CHIP_AREA.BANKERSINGLE,
					setClickHandler: [this, this.betOn, confMgr.definition.CHIP_AREA.BANKERSINGLE]
				}
			}, {
				type: PutchipArea,
				ctor: [1, 11, confMgr.definition.CHIP_AREA.FARMERRED],
				props: {
					pos: [sys.halfWidth - 144 * 2 - 1, 637],
					zOrder: 4,
					name: "pca_" + confMgr.definition.CHIP_AREA.FARMERRED,
					setClickHandler: [this, this.betOn, confMgr.definition.CHIP_AREA.FARMERRED]
				}
			}, {
				type: PutchipArea,
				ctor: [1, 11, confMgr.definition.CHIP_AREA.FARMERBLACK],
				props: {
					pos: [sys.halfWidth - 144, 637],
					zOrder: 4,
					name: "pca_" + confMgr.definition.CHIP_AREA.FARMERBLACK,
					setClickHandler: [this, this.betOn, confMgr.definition.CHIP_AREA.FARMERBLACK]
				}
			}, {
				type: PutchipArea,
				ctor: [1, 11, confMgr.definition.CHIP_AREA.BANKERBLACK],
				props: {
					pos: [sys.halfWidth, 637],
					zOrder: 4,
					name: "pca_" + confMgr.definition.CHIP_AREA.BANKERBLACK,
					setClickHandler: [this, this.betOn, confMgr.definition.CHIP_AREA.BANKERBLACK]
				}
			}, {
				type: PutchipArea,
				ctor: [1, 11, confMgr.definition.CHIP_AREA.BANKERRED],
				props: {
					pos: [sys.halfWidth + 144 - 1, 637],
					zOrder: 4,
					name: "pca_" + confMgr.definition.CHIP_AREA.BANKERRED,
					setClickHandler: [this, this.betOn, confMgr.definition.CHIP_AREA.BANKERRED]
				}
			}, {
				type: Counter,
				props: {
					pos: [sys.halfWidth, 576],
					name: "counter",
					zOrder: 4
				},
				exec: [
					["setCommand", "times_up", this.counterTimeUp, this]
				]
			}, {
				type: CardPlace,
				ctor: ["banker"],
				props: {
					pos: [sys.halfWidth, 515],
					zOrder: 6,
					name: "banker_card_place"
				}
			}, {
				type: CardPlace,
				ctor: ["farmer"],
				props: {
					pos: [sys.halfWidth, 515],
					zOrder: 6,
					name: "farmer_card_place"
				}
			}, {
				type: TopCardPanel,
				props: {
					zOrder: 9,
					name: "topCard",
					visible: false
				}
			}];
			var ui = new Schema(tree);
			ui.appendTo(this);
			var seats = this.getChildByName("seats");
			for (var i = 0; i < this._seatPos.length; i++) {
				var tempSeat = new Seat(false, i, false);
				tempSeat.pos(this._seatPos[i].x, this._seatPos[i].y);
				tempSeat.name = "seat_" + i;
				seats.addChild(tempSeat);
			}
		},
		_unLockBet: function (stopBlink) {
			this._canBet = true;
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.BANKER).enable(stopBlink);
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.FARMER).enable(stopBlink);
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.DEUCE).enable(stopBlink);
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.BANKERDOUBLE).enable(stopBlink);
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.FARMERDOUBLE).enable(stopBlink);
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.BANKERSINGLE).enable(stopBlink);
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.FARMERSINGLE).enable(stopBlink);
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.BANKERRED).enable(stopBlink);
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.BANKERBLACK).enable(stopBlink);
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.FARMERBLACK).enable(stopBlink);
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.FARMERRED).enable(stopBlink);
			this.getChildByName("bet_panel").enabled = true;
		},
		_lockBet: function () {
			if (!this._canBet) return;
			this._canBet = false;
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.BANKER).disable();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.FARMER).disable();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.DEUCE).disable();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.BANKERDOUBLE).disable();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.FARMERDOUBLE).disable();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.BANKERSINGLE).disable();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.FARMERSINGLE).disable();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.BANKERRED).disable();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.BANKERBLACK).disable();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.FARMERBLACK).disable();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.FARMERRED).disable();
			this.getChildByName("bet_panel").enabled = false;
		},
		eventStartBet: function (time, idDealer, isInit) {
			this.eventCheckStartBet(time, isInit);
		},
		eventSendCard: function (bankerCards, farmerCards, doAnimation) {
			this._lockBet();
			this.getChildByName("counter").stop();
			var bankerPlace = this.getChildByName("banker_card_place"),
				farmerPlace = this.getChildByName("farmer_card_place");
			var topCardPanel = this.getChildByName("topCard");
			var cardNum = bankerCards.length + farmerCards.length;
			bankerCards.splice(0, 0, cardNum, doAnimation);
			farmerCards.splice(0, 0, cardNum, doAnimation);
			if (doAnimation) {
				this._canMinusCardCount = true;
				farmerPlace.sendCard.apply(farmerPlace, farmerCards);
				this.timerOnce(900, bankerPlace, bankerPlace.sendCard, bankerCards);
				topCardPanel.sendCardFarmer.apply(topCardPanel, farmerCards);
				this.timerOnce(900, topCardPanel, topCardPanel.sendCardBanker, bankerCards);
			} else {
				farmerPlace.sendCard.apply(farmerPlace, farmerCards);
				bankerPlace.sendCard.apply(bankerPlace, bankerCards);
				topCardPanel.sendCardFarmer.apply(topCardPanel, farmerCards);
				topCardPanel.sendCardBanker.apply(topCardPanel, bankerCards);
			}
		},
		betOn: function (area) {
			if (!this._canBet) return;
			var betPanel = this.getChildByName("bet_panel");
			if (betPanel.selectingBetIdx < 0) return;
			var chip = betPanel.chipArray[betPanel.selectingBetIdx].price;
			this.publish("game_baccarat.command.player_bet_area", area, chip);
			var betArea = this.getChildByName("pca_" + area);
			betArea.blinkBorder1();
		},
		eventUpdateAreaMyChips: function (area, chips) {
			this._hasBet = true;
			if (this.getChildByName("pca_" + area) == null) {
				return;
			}
			this.getChildByName("pca_" + area).setMyChips(chips);
		},
		eventClearAreaMyChips: function () {
			for (var area = confMgr.definition.CHIP_AREA.BANKER; area <= confMgr.definition.CHIP_AREA.FARMERDOUBLE; area++) this.getChildByName("pca_" + area).setMyChips(0);
		},
		eventFlyBet: function (seatIdx, area, playerId, chip, doAnimation) {
			var chipType = confMgr.setting.betPriceToIcon[chip];
			this.flyChip(chipType, seatIdx, area, playerId, doAnimation);
		},
		flyChipToArea: function (chip, toAreaType, doAnimation) {
			var targetArea = this.getChildByName("pca_" + toAreaType);
			var chipRadius = 16;

			var fixedX = 0;
			var fixedLengthX = 0;
			switch (toAreaType) {
				case confMgr.definition.CHIP_AREA.FARMER:
					fixedX = 38.5;
					fixedLengthX = 38.5;
					break;
				case confMgr.definition.CHIP_AREA.BANKER:
					fixedX = -38.5;
					fixedLengthX = 38.5;
					break;
			}
			if (myGlobalData.isLHD) {
				chipRadius *= 2.5;
				fixedX /= 2;
				fixedLengthX /= 2;
			}
			var posX = targetArea.x + fixedX + 2 * (Math.random() - .5) * (targetArea.width / 2 - chipRadius - fixedLengthX) + targetArea.width / 2;
			var posY = targetArea.y + 2 * (Math.random() - .5) * ((targetArea.height - 20) / 2 - chipRadius) + (targetArea.height - 20) / 2;
			if (doAnimation) {
				chip.flyTo(posX, posY);
				soundMgr.playSE("assets/baccarat/se/chip.mp3");
			} else {
				chip.pos(posX, posY);
			}
		},
		eventSetWinArea: function (area) {
			var betArea = this.getChildByName("pca_" + area);
			if (betArea != null) {
				betArea.blinkFace();
			}
		},
		eventAddHistory: function (winSide, pairSide) {
			this.getChildByName("history").add(winSide, pairSide);
			var winWord = this.getChildByName("win_side");
			winWord.setImage("assets/baccarat/tex/win_" + winSide + "_lhd.png");
			winWord.alpha = 1;
			this.timerOnce(3e3, this, function () {
				winWord.tweenTo({
					alpha: 0
				}, 500, "sineOut", this, function () {
					winWord.alpha = 0;
				});
			});
			var bankersPlace = this.getChildByName("banker_card_place");
			var farmersPlace = this.getChildByName("farmer_card_place");
			if (bankersPlace.getCardData() == null) {
				return;
			}
			var bankerLength = bankersPlace.getCardData().length;
			var farmerLength = farmersPlace.getCardData().length;
			var farmerValue = farmersPlace.getValue();
			var bankerValue = bankersPlace.getValue();
			this.roundEndSound(farmerLength, bankerLength, farmerValue, bankerValue, winSide, pairSide);
		},
		eventSetRoundResult: function (failAreas, dealerToAreaChipInfo) {
			this._hasBet = false;
			soundMgr.playSE("assets/baccarat/se/pong.mp3");
			for (var index = 0; index < failAreas.length; index++) {
				var area = failAreas[index];
				this._dealerEatAllBet(area);
			}
			for (var key in dealerToAreaChipInfo) {
				var keyArr = key.split("_");
				var seatIdx = parseInt(keyArr[0]);
				var area = parseInt(keyArr[1]);
				var playerId = keyArr[2];
				this.timerOnce(1500, this, this._dealerVomitToArea, [area, seatIdx, playerId, dealerToAreaChipInfo[key]], false);
			}
			this.timerOnce(2500, this, function () {
				var bankersPlace = this.getChildByName("banker_card_place"),
					farmersPlace = this.getChildByName("farmer_card_place");
				bankersPlace.recycleCard();
				farmersPlace.recycleCard();
				var topCardPanel = this.getChildByName("topCard");
				topCardPanel.clear();
			});
			this.timerOnce(4500, this, function () {
				this._areaVomitToPlayer();
			});
		},
		eventClearStage: function () {
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.BANKER).reset();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.FARMER).reset();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.DEUCE).reset();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.FARMERDOUBLE).reset();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.BANKERDOUBLE).reset();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.BANKERRED).reset();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.BANKERBLACK).reset();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.BANKERSINGLE).reset();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.FARMERBLACK).reset();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.FARMERRED).reset();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.FARMERSINGLE).reset();
			this.getChildByName("banker_card_place").clear();
			this.getChildByName("farmer_card_place").clear();
			this.getChildByName("topCard").clear();
		}
	});
	return TableUI;
});
gbx.define("game/baccarat/ui/table_jinmi_LHD", ["conf/system", "comm/base/game_ui", "gbx/render/display/sprite", "gbx/render/display/animation", "gbx/render/display/text", "gbx/render/ui/list", "gbx/render/ui/panel", "gbx/render/schema", "comm/ui/sound_button", "gbx/pool", "game/baccarat/parts/seat", "game/baccarat/parts/putchip_area_lhd", "game/baccarat/parts/counter", "game/baccarat/parts/chip", "game/baccarat/parts/card_place_mi", "game/baccarat/parts/sound_panel", "game/baccarat/parts/top_card_panel_mi", "game/baccarat/parts/baccarat_room_params", "comm/helper/conf_mgr", "comm/helper/sound_mgr", "comm/helper/playerdata_mgr", "comm/helper/room_mgr", "comm/ui/bitmap_number", "gbx/net/errorcode", "gbx/net/errorcode_des", "comm/ui/ui_utils", "conf/ui_locallization", "game/baccarat/ui/super/table_face"], function (sys, BaseUI, Sprite, Animation, Text, List, Panel, Schema, Button, Pool, Seat, PutchipArea, Counter, Chip, CardPlaceMI, SoundPanel, TopCardPanelMI, roomParam, confMgr, soundMgr, playerDataMgr, roomMgr, BitmapNumber, ERROR_CODE, ERROR_CODE_DES, uiUtils, uiLocallization, SuperTable) {
	var array = roomParam.getJMChipsPos();
	var winArray = roomParam.getJMChipsWinPos();
	var baseBankerPoints = array[0];
	var bankerPoints = [];
	var baseWinBankerPoints = winArray[0];
	var bankerWinPoints = [];
	var baseFarmerPoints = array[1];
	var farmerPoints = [];
	var baseWinFarmerPoints = winArray[1];
	var farmerWinPoints = [];
	var baseDuecePoints = array[2];
	var duecePoints = [];
	var baseWinDuecePoints = winArray[2];
	var dueceWinPoints = [];
	var baseBankerPairPoints = array[3];
	var bankerPairPoints = [];
	var baseWinBankerPairPoints = winArray[3];
	var bankerPairWinPoints = [];
	var baseFarmerPairPoints = array[4];
	var farmerPairPoints = [];
	var baseWinFarmerPairPoints = winArray[4];
	var farmerPairWinPoints = [];
	var areaDy = 2;
	var farmerGetPos = [sys.halfWidth - 150, 570];
	var bankerGetPos = [sys.halfWidth + 150, 570];
	var TableUI = SuperTable.extend({
		init: function () {
			this._super();
			this._chipPool = new Pool(Chip);
			this._seatPos = [];
			this._bindPos();
			var offSize = { x: 57, y: 56 };
			var tree = [{
				type: "Sprite",
				props: {
					setImage: ["assets/baccarat/tex/bg_r.jpg"],
					pos: [0, 0],
					zOrder: 0,
					name: "bg_scene"
				}
			}, {
				type: "Sprite",
				props: {
					setImage: ["assets/baccarat/tex/pairbet.png"],
					pos: [30, 570],
					zOrder: 0
				}
			}, {
				type: "Sprite",
				props: {
					setImage: ["assets/baccarat/tex/xian_get_lhd.png"],
					pos: farmerGetPos,
					pivotToCenter: [],
					zOrder: 6,
					name: "farmer_get"
				}
			}, {
				type: "Sprite",
				props: {
					setImage: ["assets/baccarat/tex/zhuang_get_lhd.png"],
					pos: bankerGetPos,
					pivotToCenter: [],
					zOrder: 6,
					name: "banker_get"
				}
			}, {
				type: PutchipArea,
				ctor: [0, 1, confMgr.definition.CHIP_AREA.FARMER],
				props: {
					pos: [sys.halfWidth - 233 - offSize.x, 726 + offSize.y],
					zOrder: 6,
					name: "pca_" + confMgr.definition.CHIP_AREA.FARMER,
					setClickHandler: [this, this.betOn, confMgr.definition.CHIP_AREA.FARMER]
				}
			}, {
				type: PutchipArea,
				ctor: [0, .95, confMgr.definition.CHIP_AREA.BANKER],
				props: {
					pos: [sys.halfWidth + offSize.x + 23, 726 + offSize.y],
					zOrder: 6,
					name: "pca_" + confMgr.definition.CHIP_AREA.BANKER,
					setClickHandler: [this, this.betOn, confMgr.definition.CHIP_AREA.BANKER]
				}
			}, {
				type: PutchipArea,
				ctor: [2, 8, confMgr.definition.CHIP_AREA.DEUCE],
				props: {
					pos: [sys.halfWidth - 81, 783],
					zOrder: 6,
					name: "pca_" + confMgr.definition.CHIP_AREA.DEUCE,
					setClickHandler: [this, this.betOn, confMgr.definition.CHIP_AREA.DEUCE]
				}
			}, {
				type: PutchipArea,
				ctor: [1, 11, confMgr.definition.CHIP_AREA.FARMERSINGLE],
				props: {
					pos: [sys.halfWidth - 144 * 2 - 1, 710],
					zOrder: 5,
					name: "pca_" + confMgr.definition.CHIP_AREA.FARMERSINGLE,
					setClickHandler: [this, this.betOn, confMgr.definition.CHIP_AREA.FARMERSINGLE]
				}
			}, {
				type: PutchipArea,
				ctor: [1, 11, confMgr.definition.CHIP_AREA.FARMERDOUBLE],
				props: {
					pos: [sys.halfWidth - 144, 710],
					zOrder: 5,
					name: "pca_" + confMgr.definition.CHIP_AREA.FARMERDOUBLE,
					setClickHandler: [this, this.betOn, confMgr.definition.CHIP_AREA.FARMERDOUBLE]
				}
			}, {
				type: PutchipArea,
				ctor: [1, 11, confMgr.definition.CHIP_AREA.BANKERDOUBLE],
				props: {
					pos: [sys.halfWidth, 710],
					zOrder: 5,
					name: "pca_" + confMgr.definition.CHIP_AREA.BANKERDOUBLE,
					setClickHandler: [this, this.betOn, confMgr.definition.CHIP_AREA.BANKERDOUBLE]
				}
			}, {
				type: PutchipArea,
				ctor: [1, 11, confMgr.definition.CHIP_AREA.BANKERSINGLE],
				props: {
					pos: [sys.halfWidth + 144 - 1, 710],
					zOrder: 5,
					name: "pca_" + confMgr.definition.CHIP_AREA.BANKERSINGLE,
					setClickHandler: [this, this.betOn, confMgr.definition.CHIP_AREA.BANKERSINGLE]
				}
			}, {
				type: PutchipArea,
				ctor: [1, 11, confMgr.definition.CHIP_AREA.FARMERRED],
				props: {
					pos: [sys.halfWidth - 144 * 2 - 1, 637],
					zOrder: 4,
					name: "pca_" + confMgr.definition.CHIP_AREA.FARMERRED,
					setClickHandler: [this, this.betOn, confMgr.definition.CHIP_AREA.FARMERRED]
				}
			}, {
				type: PutchipArea,
				ctor: [1, 11, confMgr.definition.CHIP_AREA.FARMERBLACK],
				props: {
					pos: [sys.halfWidth - 144, 637],
					zOrder: 4,
					name: "pca_" + confMgr.definition.CHIP_AREA.FARMERBLACK,
					setClickHandler: [this, this.betOn, confMgr.definition.CHIP_AREA.FARMERBLACK]
				}
			}, {
				type: PutchipArea,
				ctor: [1, 11, confMgr.definition.CHIP_AREA.BANKERBLACK],
				props: {
					pos: [sys.halfWidth, 637],
					zOrder: 4,
					name: "pca_" + confMgr.definition.CHIP_AREA.BANKERBLACK,
					setClickHandler: [this, this.betOn, confMgr.definition.CHIP_AREA.BANKERBLACK]
				}
			}, {
				type: PutchipArea,
				ctor: [1, 11, confMgr.definition.CHIP_AREA.BANKERRED],
				props: {
					pos: [sys.halfWidth + 144 - 1, 637],
					zOrder: 4,
					name: "pca_" + confMgr.definition.CHIP_AREA.BANKERRED,
					setClickHandler: [this, this.betOn, confMgr.definition.CHIP_AREA.BANKERRED]
				}
			}, {
				type: Counter,
				props: {
					pos: [182, 499],
					name: "counter",
					zOrder: 4
				},
				exec: [
					["setCommand", "times_up", this.counterTimeUp, this]
				]
			}, {
				type: CardPlaceMI,
				props: {
					pos: [sys.halfWidth, 515],
					zOrder: 9,
					name: "card_place"
				}
			}, {
				type: SoundPanel,
				props: {
					pos: [0, 1080],
					zOrder: 6,
					visible: false,
					name: "soundPanel"
				}
			}, {
				type: "Button",
				props: {
					setSkinImage: ["assets/main/public/button_fly_card.png"],
					stateNum: 2,
					pos: [445, 320],
					zOrder: 4,
					scale: [.82],
					name: "flyCardBtn",
					visible: true,
					setClickHandler: [this, this.flyCard]
				}
			}, {
				type: TopCardPanelMI,
				props: {
					zOrder: 9,
					name: "topCard",
					visible: false
				}
			}];
			var ui = new Schema(tree);
			ui.appendTo(this);
			this.getChildByName("card_count").pos(568, 520);
			var seats = this.getChildByName("seats");
			for (var i = 0; i < this._seatPos.length; i++) {
				var tempSeat = new Seat(false, i, true);
				tempSeat.pos(this._seatPos[i].x, this._seatPos[i].y);
				tempSeat.name = "seat_" + i;
				seats.addChild(tempSeat);
			}
			this.subscribe("game_baccarat.play.getBetMaxPlayer", this, this.eventIconMiflyToSeat);
			this.subscribe("game_baccarat.play.setSoundPanel", this, this.eventToggleBetPanel);
			this.subscribe("game_baccarat.play.checkFlyCard", this, this.eventCheckFlyCard);
			this.subscribe("game_baccarat.play.flycardAnimation", this, this.eventPlayFlyCardAnimation);
			this.eventCheckFlyCard(false);
		},
		InPolygon: function (x, y, areaPoints) {
			var p;
			p = {};
			p.x = x;
			p.y = y;
			var nCross = 0;
			var p1x = NaN,
				p1y = NaN,
				p2x = NaN,
				p2y = NaN;
			var len = 0;
			len = areaPoints.length;
			for (var i = 0; i < len; i += 2) {
				p1x = areaPoints[i];
				p1y = areaPoints[i + 1];
				p2x = areaPoints[(i + 2) % len];
				p2y = areaPoints[(i + 3) % len];
				var p1 = areaPoints[i];
				var p2 = areaPoints[(i + 1) % areaPoints.length];
				if (p1y == p2y) continue;
				if (p.y < Math.min(p1y, p2y)) continue;
				if (p.y >= Math.max(p1y, p2y)) continue;
				var x = (p.y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x;
				if (x > p.x) {
					nCross++;
				}
			}
			return nCross % 2 == 1;
		},
		_bindPos: function () {
			bankerPoints = [];
			farmerPoints = [];
			duecePoints = [];
			bankerPairPoints = [];
			farmerPairPoints = [];
			bankerWinPoints = [];
			farmerWinPoints = [];
			dueceWinPoints = [];
			bankerPairWinPoints = [];
			farmerPairWinPoints = [];
			for (var i = 0; i < confMgr.setting.seatPos_jinMi.length; i++) {
				this._seatPos.push(confMgr.setting.seatPos_LHD[i]);
				bankerPoints.push(baseBankerPoints[i]);
				farmerPoints.push(baseFarmerPoints[i]);
				duecePoints.push(baseDuecePoints[i]);
				bankerPairPoints.push(baseBankerPairPoints[i]);
				farmerPairPoints.push(baseFarmerPairPoints[i]);
				bankerWinPoints.push(baseWinBankerPoints[i]);
				farmerWinPoints.push(baseWinFarmerPoints[i]);
				dueceWinPoints.push(baseWinDuecePoints[i]);
				bankerPairWinPoints.push(baseWinBankerPairPoints[i]);
				farmerPairWinPoints.push(baseWinFarmerPairPoints[i]);
			}
		},
		_reorderSeats: function (mySeatIdx) {
			var seatArr = [];
			var newSeatPos = [];
			for (var i = 0; i < confMgr.setting.seatPos_jinMi.length; i++) {
				if (i != mySeatIdx) seatArr.push(i);
				newSeatPos.push(null);
			}
			seatArr.splice(2, 0, mySeatIdx);
			for (var i = 0; i < seatArr.length; i++) {
				var seatIdx = seatArr[i];
				newSeatPos[seatIdx] = confMgr.setting.seatPos_LHD[i];
				bankerPoints[seatIdx] = baseBankerPoints[i];
				farmerPoints[seatIdx] = baseFarmerPoints[i];
				duecePoints[seatIdx] = baseDuecePoints[i];
				bankerPairPoints[seatIdx] = baseBankerPairPoints[i];
				farmerPairPoints[seatIdx] = baseFarmerPairPoints[i];
				bankerWinPoints[seatIdx] = baseWinBankerPoints[i];
				farmerWinPoints[seatIdx] = baseWinFarmerPoints[i];
				dueceWinPoints[seatIdx] = baseWinDuecePoints[i];
				bankerPairWinPoints[seatIdx] = baseWinBankerPairPoints[i];
				farmerPairWinPoints[seatIdx] = baseWinFarmerPairPoints[i];
			}
			this._seatPos = newSeatPos;
			var cardPlace = this.getChildByName("card_place");
			cardPlace.reorderSeats(seatArr);
			for (var i = 0; i < this._seatPos.length; i++) this.getChildByName("seats", "seat_" + i).pos(this._seatPos[i].x, this._seatPos[i].y);
		},
		eventSetPlayerInSeat: function (seatIdx, nick, head, gold, isMe, leftTime) {
			if (seatIdx > -1 && seatIdx < this._seatPos.length) {
				var seat = this.getChildByName("seats", "seat_" + seatIdx);
				seat.playerIn(nick, head, gold, isMe);
				if (isMe) this._reorderSeats(seatIdx);
				seat.startMaskClip(leftTime);
			}
		},
		eventIconMiflyToSeat: function (farmerMaxSeatIdx, bankerMaxSeatIdx, doAnimation) {
			var farmerGet = this.getChildByName("farmer_get");
			var pos = farmerGetPos.slice(0);
			if (farmerMaxSeatIdx != -1) {
				var tarSeat = this.getChildByName("seats", "seat_" + farmerMaxSeatIdx);
				pos[0] = tarSeat.x;
				pos[1] = tarSeat.y;
			}
			if (doAnimation) farmerGet.tweenTo({
				x: pos[0],
				y: pos[1]
			}, 200, "sineOut");
			else farmerGet.pos(pos[0], pos[1]);
			var bankerGet = this.getChildByName("banker_get");
			pos = bankerGetPos.slice(0);
			if (bankerMaxSeatIdx != -1) {
				var tarSeat = this.getChildByName("seats", "seat_" + bankerMaxSeatIdx);
				pos[0] = tarSeat.x;
				pos[1] = tarSeat.y;
			}
			if (doAnimation) bankerGet.tweenTo({
				x: pos[0],
				y: pos[1]
			}, 200, "sineOut");
			else bankerGet.pos(pos[0], pos[1]);
		},
		eventStartBet: function (time, idDealer, isInit) {
			this._resetTargetAreaPos();
			this.getChildByName("farmer_get").pos(farmerGetPos[0], farmerGetPos[1]);
			this.getChildByName("farmer_get").setImage("assets/baccarat/tex/xian_get_lhd.png");
			this.getChildByName("banker_get").pos(bankerGetPos[0], bankerGetPos[1]);
			this.getChildByName("banker_get").setImage("assets/baccarat/tex/zhuang_get_lhd.png");
			this.eventCheckStartBet(time, isInit);
			for (var i = 0; i < this._seatPos.length; i++) this.getChildByName("seats", "seat_" + i).startMaskClip(time);
			var chooseDate = roomMgr.getChoose();
			if (chooseDate.upToBanker == 1 && roomMgr.getIsVip()) this.getChildByName("btn_dealer").visible = time > 0;
		},
		_unLockBet: function (stopBlink) {
			if (playerDataMgr.isDealer()) return;
			this._canBet = true;
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.BANKER).enable(stopBlink);
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.FARMER).enable(stopBlink);
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.DEUCE).enable(stopBlink);
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.BANKERDOUBLE).enable(stopBlink);
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.FARMERDOUBLE).enable(stopBlink);
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.BANKERSINGLE).enable(stopBlink);
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.FARMERSINGLE).enable(stopBlink);
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.BANKERRED).enable(stopBlink);
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.BANKERBLACK).enable(stopBlink);
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.FARMERBLACK).enable(stopBlink);
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.FARMERRED).enable(stopBlink);
			this.getChildByName("bet_panel").enabled = true;
			if (!this._hasBet) this.eventCheckFlyCard(false);
			this._toggleBetPanel(true);
		},
		_lockBet: function () {
			if (!this._canBet) return;
			this._canBet = false;
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.BANKER).disable();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.FARMER).disable();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.DEUCE).disable();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.BANKERDOUBLE).disable();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.FARMERDOUBLE).disable();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.BANKERSINGLE).disable();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.FARMERSINGLE).disable();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.BANKERRED).disable();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.BANKERBLACK).disable();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.FARMERBLACK).disable();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.FARMERRED).disable();
			this.getChildByName("bet_panel").enabled = false;
			this.eventCheckFlyCard(true);
		},
		eventToggleBetPanel: function (en, step) {
			this._toggleBetPanel(!en);
			this.getChildByName("soundPanel").setStep(step);
		},
		_toggleBetPanel: function (en) {
			this.getChildByName("bet_panel").visible = en;
			this.getChildByName("soundPanel").visible = !en;
			this.getChildByName("openBetSet").visible = en;
			this.getChildByName("my_chips").visible = en;
			this.getChildByName("playerName").visible = en;
		},
		eventSendCard: function (bankersCard, farmersCard, steps, leftTime, step2Send2, farmerSeatIdx, bankerSeatIdx, myLookSide, doAnimation, lookCardDir, lookStep, lookRadian) {
			this._lockBet();
			this.eventCheckFlyCard(true);
			this.getChildByName("counter").stop();
			var chooseDate = roomMgr.getChoose();
			if (chooseDate.upToBanker == 1 && roomMgr.getIsVip()) this.getChildByName("btn_dealer").visible = false;
			this.publish("game_baccarat.seat.stopMaskClip", -1, true);
			if (doAnimation) {
				if (steps[0] == confMgr.definition.BaccaratSendCardStepJM.FarmerFirst) this._canMinusCardCount = true;
			}
			var cardPlace = this.getChildByName("card_place");
			cardPlace.sendCardCenter(farmersCard, bankersCard, steps, leftTime, step2Send2, farmerSeatIdx, bankerSeatIdx, myLookSide, doAnimation, lookCardDir, lookStep, lookRadian);
		},
		betOn: function (area) {
			//var area = 0;
			//var array = roomParam.getBetOnPos();
			//this._bankerArray = array[0];
			//this._farmerArray = array[1];
			//this._dueceArray = array[2];
			//this._bankerPairArray = array[3];
			//this._farmerPairArray = array[4];
			//if (this.InPolygon(Laya.stage.mouseX, Laya.stage.mouseY, this._bankerArray)) area = 1;
			//else if (this.InPolygon(Laya.stage.mouseX, Laya.stage.mouseY, this._farmerArray)) area = 2;
			//else if (this.InPolygon(Laya.stage.mouseX, Laya.stage.mouseY, this._dueceArray)) area = 3;
			//else if (this.InPolygon(Laya.stage.mouseX, Laya.stage.mouseY, this._bankerPairArray)) area = 4;
			//else if (this.InPolygon(Laya.stage.mouseX, Laya.stage.mouseY, this._farmerPairArray)) area = 5;
			//if (area == 0) return;
			if (!this._canBet || area == 0) return;
			var betPanel = this.getChildByName("bet_panel");
			if (betPanel.selectingBetIdx < 0) return;
			var chip = betPanel.chipArray[betPanel.selectingBetIdx].price;
			this.publish("game_baccarat.command.player_bet_area", area, chip);
			var betArea = this.getChildByName("pca_" + area);
			betArea.blinkBorder1();
		},
		eventUpdateAreaMyChips: function (area, chips) {
			this._hasBet = true;
			var put_area = this.getChildByName("pca_" + area);
			if (put_area != undefined) {
				put_area.setMyChips(area, 2, chips);
				put_area.setMyChips(chips);
			}
		},
		eventClearAreaMyChips: function () {
			for (var area = confMgr.definition.CHIP_AREA.BANKER; area <= confMgr.definition.CHIP_AREA.FARMERDOUBLE; area++) {
				var put_area = this.getChildByName("pca_" + area);
				if (put_area != undefined) {
					put_area.setMyChips(-1);
				}
			}
		},
		eventFlyBet: function (seatIdx, area, playerId, chip, doAnimation, chipIndex, integratedChipsInfo) {
			var chipType = confMgr.setting.betPriceToIcon[chip];
			this.flyChip(chipType, seatIdx, area, playerId, doAnimation, chipIndex, integratedChipsInfo);
		},
		flyChipToArea: function (chip, toAreaType, doAnimation, isWin, chipIndex, integratedChipsInfo) {
			var targetArea = this.getChildByName("pca_" + toAreaType);
			var chipRadius = 16;

			var fixedX = 0;
			var fixedLengthX = 0;
			switch (toAreaType) {
				case confMgr.definition.CHIP_AREA.FARMER:
					fixedX = 38.5;
					fixedLengthX = 38.5;
					break;
				case confMgr.definition.CHIP_AREA.BANKER:
					fixedX = -38.5;
					fixedLengthX = 38.5;
					break;
			}
			if (myGlobalData.isLHD) {
				chipRadius *= 2.5;
				fixedX /= 2;
				fixedLengthX /= 2;
			}
			var tarPos = {};
			tarPos.x = targetArea.x + fixedX + 2 * (Math.random() - .5) * (targetArea.width / 2 - chipRadius - fixedLengthX) + targetArea.width / 2;
			tarPos.y = targetArea.y + 2 * (Math.random() - .5) * ((targetArea.height - 20) / 2 - chipRadius) + (targetArea.height - 20) / 2;
			//chip.zOrder = tarPos.z;
			if (doAnimation) {
				if (integratedChipsInfo != null && !myGlobalData.isLHD) chip.flyTo(tarPos.x, tarPos.y, this, this._integrateChips, [chip, toAreaType, chip.seatIdx, integratedChipsInfo]);
				else chip.flyTo(tarPos.x, tarPos.y, chip, chip.flyEnd);
				soundMgr.playSE("assets/baccarat/se/chip.mp3");
			} else {
				chip.pos(tarPos.x, tarPos.y);
			}
		},
		_resetTargetAreaPos: function () {
			for (var i = 0; i < confMgr.setting.seatPos_jinMi.length; i++) {
				bankerPoints[i].r = 0;
				farmerPoints[i].r = 0;
				duecePoints[i].r = 0;
				bankerPairPoints[i].r = 0;
				farmerPairPoints[i].r = 0;
				bankerWinPoints[i].r = 0;
				farmerWinPoints[i].r = 0;
				dueceWinPoints[i].r = 0;
				bankerPairWinPoints[i].r = 0;
				farmerPairWinPoints[i].r = 0;
			}
		},
		_getTargetAreaPos: function (area, seatIdx, isWin, chipIndex) {
			var tempPos;
			if (isWin) {
				switch (area) {
					case confMgr.definition.CHIP_AREA.BANKER:
						tempPos = bankerWinPoints;
						break;
					case confMgr.definition.CHIP_AREA.FARMER:
						tempPos = farmerWinPoints;
						break;
					case confMgr.definition.CHIP_AREA.DEUCE:
						tempPos = dueceWinPoints;
						break;
					case confMgr.definition.CHIP_AREA.BANKERPAIR:
						tempPos = bankerPairWinPoints;
						break;
					case confMgr.definition.CHIP_AREA.FARMERPAIR:
						tempPos = farmerPairWinPoints;
						break;
				}
			} else {
				switch (area) {
					case confMgr.definition.CHIP_AREA.BANKER:
						tempPos = bankerPoints;
						break;
					case confMgr.definition.CHIP_AREA.FARMER:
						tempPos = farmerPoints;
						break;
					case confMgr.definition.CHIP_AREA.DEUCE:
						tempPos = duecePoints;
						break;
					case confMgr.definition.CHIP_AREA.BANKERPAIR:
						tempPos = bankerPairPoints;
						break;
					case confMgr.definition.CHIP_AREA.FARMERPAIR:
						tempPos = farmerPairPoints;
						break;
				}
			}
			var ret = {};
			ret.x = confMgr.setting.otherSeatPos.x;
			ret.y = confMgr.setting.otherSeatPos.y;
			ret.z = 2;
			if (tempPos && seatIdx != -1) {
				var pos = tempPos[seatIdx];
				if (chipIndex != undefined) {
					pos.r = chipIndex;
				} else {
					chipIndex = pos.r;
					pos.r++;
				}
				ret.x = pos.x;
				ret.y = pos.y - chipIndex * areaDy;
				ret.z = 2 + chipIndex;
				return ret;
			}
			return ret;
		},
		_integrateChips: function (curChip, toAreaType, fromSeatIdx, integratedChipsInfo) {
			var oldChips = this._findAllChips(toAreaType, fromSeatIdx);
			for (var i = 0; i < oldChips.length; i++) {
				var chip = oldChips[i];
				if (chip.isFlying) continue;
				chip.removeSelf();
				this._chipPool.free(chip);
			}
			curChip.removeSelf();
			this._chipPool.free(curChip);
			var chipsLayer = this.getChildByName("chips_layer");
			for (var i = 0; i < integratedChipsInfo.length; i++) {
				var oneInfo = integratedChipsInfo[i];
				var tarPos = this._getTargetAreaPos(toAreaType, fromSeatIdx, false, i);
				var chip = this._chipPool.alloc();
				var chipType = confMgr.setting.betPriceToIcon[oneInfo.money];
				chip.type = chipType;
				chip.area = toAreaType;
				chip.seatIdx = fromSeatIdx;
				chip.zOrder = tarPos.z;
				chip.pos(tarPos.x, tarPos.y);
				chip.playerId = oneInfo.playerId;
				chipsLayer.addChild(chip);
			}
		},
		eventSetWinArea: function (area) {
			var betArea = this.getChildByName("pca_" + area);
			betArea.blinkFace(area);
		},
		eventAddHistory: function (winSide, pairSide, bankerMaxSeatIdx, farmerMaxSeatIdx) {
			this.getChildByName("history").add(winSide, pairSide);
			var winWord = this.getChildByName("win_side");
			winWord.setImage("assets/baccarat/tex/win_" + winSide + "_lhd.png");
			winWord.alpha = 1;
			this.timerOnce(5e3, this, function () {
				winWord.tweenTo({
					alpha: 0
				}, 500, "sineOut", this, function () {
					winWord.alpha = 0;
				});
			});
			if (bankerMaxSeatIdx != -1) {
				if (winSide == confMgr.definition.WIN_STATE.WIN_BANK) this.getChildByName("banker_get").setImage("assets/baccarat/tex/zhuang_get_win_lhd.png");
			}
			if (farmerMaxSeatIdx != -1) {
				if (winSide == confMgr.definition.WIN_STATE.WIN_FARM) this.getChildByName("farmer_get").setImage("assets/baccarat/tex/xian_get_win_lhd.png");
			}
			var card_place = this.getChildByName("card_place");
			var farmerLength = card_place.getFarmerPointArr().length;
			var bankerLength = card_place.getBankerPointArr().length;
			var farmerValue = card_place.getFarmerValue();
			var bankerValue = card_place.getBankerValue();
			this.roundEndSound(farmerLength, bankerLength, farmerValue, bankerValue, winSide, pairSide);
		},
		eventSetRoundResult: function (failAreas, dealerToAreaChipInfo) {
			this._hasBet = false;
			soundMgr.playSE("assets/baccarat/se/pong.mp3");
			for (var index = 0; index < failAreas.length; index++) {
				var area = failAreas[index];
				this._dealerEatAllBet(area);
			}
			for (var key in dealerToAreaChipInfo) {
				var keyArr = key.split("_");
				var seatIdx = parseInt(keyArr[0]);
				var area = parseInt(keyArr[1]);
				var playerId = keyArr[2];
				this.timerOnce(1500, this, this._dealerVomitToArea, [area, seatIdx, playerId, dealerToAreaChipInfo[key]], false);
			}
			this.timerOnce(2500, this, function () {
				var cardPlace = this.getChildByName("card_place");
				cardPlace.recycleCard();
			});
			this.timerOnce(4500, this, function () {
				this._areaVomitToPlayer();
			});
		},
		flyCard: function () {
			if (!this._canBet) return;
			this.publish("game_baccarat.command.flyCard");
		},
		eventCheckFlyCard: function (state) {
			this.getChildByName("flyCardBtn").gray = state;
		},
		eventPlayFlyCardAnimation: function () {
			var flyCard = this.getChildByName("flyCardBtn");
			if (flyCard.visible) {
				var delay = 300;
				for (var i = 0; i < 2; i++) {
					this.timerOnce(i * delay, this, function () {
						this.blinkFlyCard();
					});
				}
			}
		},
		blinkFlyCard: function () {
			var flyCard = this.getChildByName("flyCardBtn");
			flyCard.alpha = 1;
			flyCard.tweenTo({
				alpha: 0
			}, 150, "sineOut");
			this.timerOnce(200, this, function () {
				flyCard.tweenTo({
					alpha: 1
				}, 150, "sineOut");
			});
		},
		eventClearStage: function () {
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.BANKER).reset();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.FARMER).reset();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.DEUCE).reset();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.FARMERDOUBLE).reset();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.BANKERDOUBLE).reset();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.BANKERRED).reset();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.BANKERBLACK).reset();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.BANKERSINGLE).reset();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.FARMERBLACK).reset();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.FARMERRED).reset();
			this.getChildByName("pca_" + confMgr.definition.CHIP_AREA.FARMERSINGLE).reset();
			this.getChildByName("card_place").clear();
		}
	});
	return TableUI;
});