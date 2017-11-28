gbx.define("comm/helper/account_mgr", ["gbx/net/connector", "comm/helper/conf_mgr"], function (server, confMgr) {
	var userData;
	var token;
	var randomSalt;
	var staticSalt;
	var gateServerAddress;
	var gameServerId;
	var sensitiveList;
	var guestAccount;
	var guestAccountLen = 6;
	var guestPlatformId = "guest";
	var guestOpen;
	var guestAccountArray = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
	var getRandomString = function (len) {
		var maxPos = guestAccountArray.length;
		var pwd = guestPlatformId;
		for (var i = 0; i < len; i++) {
			pwd += guestAccountArray[Math.floor(Math.random() * maxPos)];
		}
		return pwd;
	};
	var getUserData = function () {
		var t = localStorage["userData"];
		if (t) userData = JSON.parse(t);
		else userData = {
			account: "",
			password: "",
			country: "86",
			checkAccount: true,
			checkPassword: true
		};
	};
	var saveUserDataToStorage = function () {
		localStorage["userData"] = JSON.stringify(userData);
	};
	var saveGuestAccount = function () {
		localStorage["guestAccount"] = guestAccount;
	};
	var getGuestAccount = function () {
		var t = localStorage["guestAccount"];
		if (t) {
			guestAccount = t;
		} else {
			guestAccount = getRandomString(guestAccountLen);
			saveGuestAccount();
		}
		if (userData.account == "") {
			userData = {
				account: guestAccount,
				password: "",
				country: "86",
				checkAccount: true,
				checkPassword: true
			};
		}
	};
	var checkSensitive = function (word) {
		if (sensitiveList === undefined) sensitiveList = confMgr.read("main/dat/user/sensitive.json");
		if (word === "") return false;
		for (var i = 0; i < sensitiveList.length; i++) {
			if (word.indexOf(sensitiveList[i]) > -1) return false;
		}
		return true;
	};
	getUserData();
	getGuestAccount();
	var accountMgr = {
		setGuestState: function (value) {
			guestOpen = value;
		},
		getGuestState: function () {
			return guestOpen;
		},
		getGuestAccount: function () {
			return guestAccount;
		},
		getGuestPlatformId: function () {
			return guestPlatformId;
		},
		getUserData: function () {
			return userData;
		},
		saveUserData: function (txtAccount, txtPassword, cbAccount, cbPassword) {
			if (!cbAccount) cbPassword = false;
			if (cbPassword) cbAccount = true;
			userData.account = txtAccount;
			userData.password = txtPassword;
			userData.checkAccount = cbAccount;
			userData.checkPassword = cbPassword;
			saveUserDataToStorage();
		},
		saveUserDataOnly: function () {
			saveUserDataToStorage();
		},
		checkSensitive: function (word) {
			return checkSensitive(word);
		},
		setToken: function (newToken) {
			token = newToken;
		},
		getToken: function () {
			return token;
		},
		setSalt: function (cRandomSalt, cStaticSalt) {
			randomSalt = cRandomSalt;
			staticSalt = cStaticSalt;
		},
		getHashPassword: function () {
			return hex_md5(hex_md5(userData.password + staticSalt) + randomSalt);
		},
		setGateServerAddress: function (address) {
			gateServerAddress = address;
		},
		getGateServerAddress: function () {
			return gateServerAddress;
		},
		setGameServerId: function (serverId) {
			gameServerId = serverId;
		},
		getGameServerId: function () {
			return gameServerId;
		},
		getUserCountryCode: function () {
			return userData.country;
		}
	};
	return accountMgr;
});
gbx.define("comm/helper/baccarat_algorithm", ["gbx/cclass", "gbx/net/net_tool", "comm/helper/conf_mgr"], function (Class, netTool, confMgr) {
	var rowMax1 = 6;
	var rowMax2 = 6;
	var Algorithm = Class.extend({
		init: function () {
			this._super();
			this.clear();
		},
		clear: function () {
			this._statisticsDta = {
				banker: 0,
				farmer: 0,
				deuce: 0,
				bankerPair: 0,
				farmerPair: 0,
				count89: 0,
				countAll: 0
			};
			this._beadPlateColMax = 0;
			this._beadPlateIndex = 0;
			this._beadPlateShowData = {};
			this._emptyBigRoadColMin = 0;
			this._bigRoadColMax = 0;
			this._preBigRoadElem = null;
			this._bigRoadData = {};
			this._bigRoadShowData = {};
			this._emptyBigEyeRoadColMin = 0;
			this._bigEyeRoadColMax = 0;
			this._preBigEyeRoadElem = null;
			this._bigEyeRoadShowData = {};
			this._emptySmallRoadColMin = 0;
			this._smallRoadColMax = 0;
			this._preSmallRoadElem = null;
			this._smallRoadShowData = {};
			this._emptyCockroachRoadColMin = 0;
			this._cockroachRoadColMax = 0;
			this._preCockroachRoadElem = null;
			this._cockroachRoadShowData = {};
		},
		addAll: function (data) {
			for (var i = 0; i < data.length; i++) {
				this._add(data[i], true);
			}
			var fResult = this._forecast();
			return [this._beadPlateShowData, this._bigRoadShowData, this._bigEyeRoadShowData, this._smallRoadShowData, this._cockroachRoadShowData, this._statisticsDta, fResult];
		},
		add: function (oneData) {
			var result = this._add(oneData, true);
			var fResult = this._forecast();
			result.push(fResult);
			return result;
		},
		getAllColMax: function () {
			var result = {
				bigRoad: this._bigRoadColMax,
				bigEyeRoad: this._bigEyeRoadColMax,
				smallRoad: this._smallRoadColMax,
				yueURoad: this._cockroachRoadColMax,
				plateRoad: this._beadPlateColMax
			};
			return result;
		},
		_forecast: function () {
			var forecast = {
				winType: confMgr.definition.WIN_STATE.WIN_BANK,
				bankerPair: false,
				farmerPair: false
			};
			var forecastResult = this._add(forecast, false);
			var fResult = {
				bigEyeRoad: -1,
				smallRoad: -1,
				cockroach: -1
			};
			if (forecastResult[2] != null) fResult.bigEyeRoad = Number(forecastResult[2].isRed);
			if (forecastResult[3] != null) fResult.smallRoad = Number(forecastResult[3].isRed);
			if (forecastResult[4] != null) fResult.cockroach = Number(forecastResult[4].isRed);
			return fResult;
		},
		_add: function (oneData, isAdd) {
			if (isAdd) {
				if (oneData.winType == confMgr.definition.WIN_STATE.WIN_BANK) this._statisticsDta.banker += 1;
				else if (oneData.winType == confMgr.definition.WIN_STATE.WIN_FARM) this._statisticsDta.farmer += 1;
				else this._statisticsDta.deuce += 1;
				if (oneData.bankerPair) this._statisticsDta.bankerPair += 1;
				if (oneData.farmerPair) this._statisticsDta.farmerPair += 1;
				if (oneData.bankerNum == 8 || oneData.bankerNum == 9 || oneData.farmerNum == 8 || oneData.farmerNum == 9) this._statisticsDta.count89 += 1;
				this._statisticsDta.countAll += 1;
			}
			var baseElem = netTool.createObjFromProto(oneData);
			var curBeadPlateElem = this._addToBeadPlate(baseElem, isAdd);
			var curBigRoadElem = this._addToBigRoad(baseElem, isAdd);
			var curBigEyeRoadElem = this._addToBigEyeRoad(curBigRoadElem, isAdd);
			var curSmallRoadElem = this._addToSmallRoad(curBigRoadElem, isAdd);
			var curCockroachRoadElem = this._addToCockroachRoad(curBigRoadElem, isAdd);
			return [curBeadPlateElem, curBigRoadElem, curBigEyeRoadElem, curSmallRoadElem, curCockroachRoadElem, this._statisticsDta];
		},
		_showData: function (dataAll, rowMax, colMax) {
			for (var row = 0; row < rowMax; row++) {
				var str = "";
				for (var col = 0; col < colMax; col++) {
					var elem = this._getFirstElem(dataAll, row, col);
					if (elem == undefined) str += " elem-" + "-" + "-" + "-" + "-" + "-";
					else str += " elem-" + elem.showRow + "-" + elem.showCol + "-" + elem.isRed;
				}
				gbx.log(str);
			}
		},
		_addElem: function (dataAll, data, row, col) {
			var dataCol = dataAll[col];
			if (dataCol == undefined) {
				dataCol = {};
				dataAll[col] = dataCol;
			}
			var dataRC = dataCol[row];
			if (dataRC == undefined) {
				dataRC = [];
				dataCol[row] = dataRC;
			}
			dataRC.push(data);
		},
		_getElemArr: function (dataAll, row, col) {
			var dataCol = dataAll[col];
			if (dataCol == undefined) return dataCol;
			return dataCol[row];
		},
		_getFirstElem: function (dataAll, row, col) {
			var dataCol = dataAll[col];
			if (dataCol == undefined) return dataCol;
			var dataRC = dataCol[row];
			if (dataRC == undefined) return dataRC;
			return dataRC[0];
		},
		_getBeadPlatePosByIndex: function (index) {
			var row = index % rowMax1;
			var col = Math.floor(index / rowMax1);
			return [row, col];
		},
		_addToBeadPlate: function (baseElem, isAdd) {
			var elem = {};
			elem.baseElem = baseElem;
			var pos = this._getBeadPlatePosByIndex(this._beadPlateIndex);
			elem.showRow = pos[0];
			elem.showCol = pos[1];
			if (isAdd) {
				if (elem.showCol > this._beadPlateColMax) this._beadPlateColMax = elem.showCol;
				this._addElem(this._beadPlateShowData, elem, elem.showRow, elem.showCol);
				this._beadPlateIndex++;
			}
			return elem;
		},
		_checkBigRoadShowPos: function (winType, row, col) {
			if (row >= rowMax1) return false;
			var elemArr = this._getElemArr(this._bigRoadShowData, row, col);
			if (elemArr != undefined) return false;
			return true;
		},
		_addToBigRoad: function (baseElem, isAdd) {
			var elem = {};
			elem.baseElem = baseElem;
			elem.row = 0;
			elem.col = 0;
			var preWinType = baseElem.winType;
			var preRow = -1;
			var preCol = 0;
			var preShowRow = -1;
			var preShowCol = 0;
			var hasPreElem = false;
			if (this._preBigRoadElem != null) {
				hasPreElem = true;
				preWinType = this._preBigRoadElem.baseElem.winType;
				preRow = this._preBigRoadElem.row;
				preCol = this._preBigRoadElem.col;
				preShowRow = this._preBigRoadElem.showRow;
				preShowCol = this._preBigRoadElem.showCol;
			}
			if (baseElem.winType != confMgr.definition.WIN_STATE.WIN_DEUCE) {
				if (hasPreElem) {
					if (baseElem.winType == preWinType) {
						elem.row = preRow + 1;
						elem.col = preCol;
					} else {
						elem.row = 0;
						elem.col = preCol + 1;
					}
				}
				if (isAdd) {
					this._addElem(this._bigRoadData, elem, elem.row, elem.col);
					this._preBigRoadElem = elem;
				}
			}
			var isSame = false;
			var isDeuce = false;
			if (baseElem.winType == confMgr.definition.WIN_STATE.WIN_DEUCE) {
				isSame = true;
				isDeuce = true;
			} else if (baseElem.winType == preWinType) {
				isSame = true;
			}
			if (isSame) {
				if (hasPreElem) {
					if (isDeuce) {
						elem.showRow = preShowRow;
						elem.showCol = preShowCol;
						if (elem.showRow < 0) elem.showRow = 0;
					} else {
						var checkOk = this._checkBigRoadShowPos(baseElem.winType, preShowRow + 1, preShowCol);
						if (checkOk) {
							elem.showRow = preShowRow + 1;
							elem.showCol = preShowCol;
						} else {
							elem.showRow = preShowRow;
							elem.showCol = preShowCol + 1;
						}
					}
				} else {
					elem.showRow = 0;
					elem.showCol = 0;
				}
				if (isAdd) {
					if (elem.showRow == 0 && elem.showCol >= this._emptyBigRoadColMin) this._emptyBigRoadColMin = elem.showCol + 1;
					if (elem.showCol > this._bigRoadColMax) this._bigRoadColMax = elem.showCol;
					this._addElem(this._bigRoadShowData, elem, elem.showRow, elem.showCol);
				}
			} else {
				elem.showRow = 0;
				elem.showCol = this._emptyBigRoadColMin;
				if (isAdd) {
					this._emptyBigRoadColMin++;
					this._addElem(this._bigRoadShowData, elem, elem.showRow, elem.showCol);
				}
			}
			return elem;
		},
		_checkLength: function (col, deltaCol) {
			var col1 = this._bigRoadData[col - 1];
			var col2 = this._bigRoadData[col - 1 - deltaCol];
			if (Object.getOwnPropertyNames(col1).length == Object.getOwnPropertyNames(col2).length) return true;
			return false;
		},
		_checkOther: function (row, col, deltaCol) {
			var elem1 = this._getFirstElem(this._bigRoadData, row, col - deltaCol);
			if (elem1 != undefined) return true;
			var elem2 = this._getFirstElem(this._bigRoadData, row - 1, col - deltaCol);
			if (elem2 == undefined) return true;
			return false;
		},
		_checkStartPos: function (bigRoadElem, deltaCol) {
			if (bigRoadElem.col <= deltaCol - 1) return false;
			if (bigRoadElem.col == deltaCol) {
				if (bigRoadElem.row <= 0) return false;
			}
			return true;
		},
		_checkShowPos: function (dataAll, isRed, row, col) {
			if (row >= rowMax2) return false;
			var elem = this._getFirstElem(dataAll, row, col);
			if (elem != undefined) return false;
			return true;
		},
		_makeElemCommon: function (bigRoadElem, allData, preElem, emptyColMin, deltaCol) {
			var elem = {};
			if (bigRoadElem.row == 0) {
				if (this._checkLength(bigRoadElem.col, deltaCol)) elem.isRed = true;
				else elem.isRed = false;
			} else {
				if (this._checkOther(bigRoadElem.row, bigRoadElem.col, deltaCol)) elem.isRed = true;
				else elem.isRed = false;
			}
			if (preElem == null) {
				elem.showRow = 0;
				elem.showCol = 0;
			} else {
				if (elem.isRed != preElem.isRed) {
					elem.showRow = 0;
					elem.showCol = emptyColMin;
				} else {
					var checkOk = this._checkShowPos(allData, elem.isRed, preElem.showRow + 1, preElem.showCol);
					if (checkOk) {
						elem.showRow = preElem.showRow + 1;
						elem.showCol = preElem.showCol;
					} else {
						elem.showRow = preElem.showRow;
						elem.showCol = preElem.showCol + 1;
					}
				}
			}
			return elem;
		},
		_addToBigEyeRoad: function (bigRoadElem, isAdd) {
			if (bigRoadElem.baseElem.winType == confMgr.definition.WIN_STATE.WIN_DEUCE) return null;
			var deltaCol = 1;
			var checkOk = this._checkStartPos(bigRoadElem, deltaCol);
			if (!checkOk) return null;
			var elem = this._makeElemCommon(bigRoadElem, this._bigEyeRoadShowData, this._preBigEyeRoadElem, this._emptyBigEyeRoadColMin, deltaCol);
			if (isAdd) {
				if (elem.showRow == 0 && elem.showCol >= this._emptyBigEyeRoadColMin) this._emptyBigEyeRoadColMin = elem.showCol + 1;
				if (elem.showCol > this._bigEyeRoadColMax) this._bigEyeRoadColMax = elem.showCol;
				this._addElem(this._bigEyeRoadShowData, elem, elem.showRow, elem.showCol);
				this._preBigEyeRoadElem = elem;
			}
			return elem;
		},
		_addToSmallRoad: function (bigRoadElem, isAdd) {
			if (bigRoadElem.baseElem.winType == confMgr.definition.WIN_STATE.WIN_DEUCE) return null;
			var deltaCol = 2;
			var checkOk = this._checkStartPos(bigRoadElem, deltaCol);
			if (!checkOk) return null;
			var elem = this._makeElemCommon(bigRoadElem, this._smallRoadShowData, this._preSmallRoadElem, this._emptySmallRoadColMin, deltaCol);
			if (isAdd) {
				if (elem.showRow == 0 && elem.showCol >= this._emptySmallRoadColMin) this._emptySmallRoadColMin = elem.showCol + 1;
				if (elem.showCol > this._smallRoadColMax) this._smallRoadColMax = elem.showCol;
				this._addElem(this._smallRoadShowData, elem, elem.showRow, elem.showCol);
				this._preSmallRoadElem = elem;
			}
			return elem;
		},
		_addToCockroachRoad: function (bigRoadElem, isAdd) {
			if (bigRoadElem.baseElem.winType == confMgr.definition.WIN_STATE.WIN_DEUCE) return null;
			var deltaCol = 3;
			var checkOk = this._checkStartPos(bigRoadElem, deltaCol);
			if (!checkOk) return null;
			var elem = this._makeElemCommon(bigRoadElem, this._cockroachRoadShowData, this._preCockroachRoadElem, this._emptyCockroachRoadColMin, deltaCol);
			if (isAdd) {
				if (elem.showRow == 0 && elem.showCol >= this._emptyCockroachRoadColMin) this._emptyCockroachRoadColMin = elem.showCol + 1;
				if (elem.showCol > this._cockroachRoadColMax) this._cockroachRoadColMax = elem.showCol;
				this._addElem(this._cockroachRoadShowData, elem, elem.showRow, elem.showCol);
				this._preCockroachRoadElem = elem;
			}
			return elem;
		}
	});
	return Algorithm;
});
gbx.define("comm/helper/bank_mgr", ["gbx/class", "comm/helper/playerdata_mgr", "comm/ui/ui_utils", "conf/ui_locallization", "conf/bank_card"], function (Class, playerDataMgr, uiUtils, uiLocallization, bankCard) {
	var BankMgr = Class.extend({
		init: function () { },
		trimLeft: function (s) {
			if (s == null) {
				return "";
			}
			var whitespace = new String(" \t\n\r");
			var str = new String(s);
			if (whitespace.indexOf(str.charAt(0)) != -1) {
				var j = 0,
					i = str.length;
				while (j < i && whitespace.indexOf(str.charAt(j)) != -1) {
					j++;
				}
				str = str.substring(j, i);
			}
			return str;
		},
		trimRight: function (s) {
			if (s == null) return "";
			var whitespace = new String(" \t\n\r");
			var str = new String(s);
			if (whitespace.indexOf(str.charAt(str.length - 1)) != -1) {
				var i = str.length - 1;
				while (i >= 0 && whitespace.indexOf(str.charAt(i)) != -1) {
					i--;
				}
				str = str.substring(0, i + 1);
			}
			return str;
		},
		getNeedBankNumber: function (bankno) {
			bankno = this.trimLeft(bankno);
			bankno = this.trimRight(bankno);
			var needBankerNumber = bankno;
			needBankerNumber = needBankerNumber.replace(/ /g, "-");
			return needBankerNumber;
		},
		luhmCheck: function (bankno) {
			bankno = this.trimLeft(bankno);
			bankno = this.trimRight(bankno);
			bankno = bankno.replace(/ /g, "");
			if (bankno.length < 16 || bankno.length > 19) {
				uiUtils.showMesage(uiLocallization.bank_card_length_limit);
				return false;
			}
			var num = /^\d*$/;
			if (!num.exec(bankno)) {
				uiUtils.showMesage(uiLocallization.bank_card_must_number);
				return false;
			}
			var strBin = "10,18,30,35,37,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,58,60,62,65,68,69,84,87,88,94,95,98,99";
			if (strBin.indexOf(bankno.substring(0, 2)) == -1) {
				uiUtils.showMesage(uiLocallization.card_start_limit);
				return false;
			}
			var lastNum = bankno.substr(bankno.length - 1, 1);
			var first15Num = bankno.substr(0, bankno.length - 1);
			var newArr = new Array;
			for (var i = first15Num.length - 1; i > -1; i--) {
				newArr.push(first15Num.substr(i, 1));
			}
			var arrJiShu = new Array;
			var arrJiShu2 = new Array;
			var arrOuShu = new Array;
			for (var j = 0; j < newArr.length; j++) {
				if ((j + 1) % 2 == 1) {
					if (parseInt(newArr[j]) * 2 < 9) arrJiShu.push(parseInt(newArr[j]) * 2);
					else arrJiShu2.push(parseInt(newArr[j]) * 2);
				} else arrOuShu.push(newArr[j]);
			}
			var jishu_child1 = new Array;
			var jishu_child2 = new Array;
			for (var h = 0; h < arrJiShu2.length; h++) {
				jishu_child1.push(parseInt(arrJiShu2[h]) % 10);
				jishu_child2.push(parseInt(arrJiShu2[h]) / 10);
			}
			var sumJiShu = 0;
			var sumOuShu = 0;
			var sumJiShuChild1 = 0;
			var sumJiShuChild2 = 0;
			var sumTotal = 0;
			for (var m = 0; m < arrJiShu.length; m++) {
				sumJiShu = sumJiShu + parseInt(arrJiShu[m]);
			}
			for (var n = 0; n < arrOuShu.length; n++) {
				sumOuShu = sumOuShu + parseInt(arrOuShu[n]);
			}
			for (var p = 0; p < jishu_child1.length; p++) {
				sumJiShuChild1 = sumJiShuChild1 + parseInt(jishu_child1[p]);
				sumJiShuChild2 = sumJiShuChild2 + parseInt(jishu_child2[p]);
			}
			sumTotal = parseInt(sumJiShu) + parseInt(sumOuShu) + parseInt(sumJiShuChild1) + parseInt(sumJiShuChild2);
			var k = parseInt(sumTotal) % 10 == 0 ? 10 : parseInt(sumTotal) % 10;
			var luhm = 10 - k;
			if (lastNum == luhm) {
				return true;
			} else {
				uiUtils.showMesage(uiLocallization.card_verify_fail);
				return false;
			}
		},
		getCardData: function (cardNumber) {
			var str = cardNumber;
			str = str.replace(/-/g, "");
			var sub1 = str.substring(0, 4);
			var sub2 = str.substring(0, 5);
			var sub3 = str.substring(0, 6);
			var sub4 = str.substring(0, 7);
			var sub5 = str.substring(0, 8);
			var sub6 = str.substring(0, 9);
			var sub7 = str.substring(0, 10);
			var sub8 = str.substring(0, 11);
			var sub9 = str.substring(0, 12);
			if (bankCard[sub1]) {
				return bankCard[sub1];
			} else if (bankCard[sub2]) {
				return bankCard[sub2];
			} else if (bankCard[sub3]) {
				return bankCard[sub3];
			} else if (bankCard[sub4]) {
				return bankCard[sub4];
			} else if (bankCard[sub5]) {
				return bankCard[sub5];
			} else if (bankCard[sub6]) {
				return bankCard[sub6];
			} else if (bankCard[sub7]) {
				return bankCard[sub7];
			} else if (bankCard[sub8]) {
				return bankCard[sub8];
			} else if (bankCard[sub9]) {
				return bankCard[sub9];
			}
			return null;
		}
	}).singleton();
	return new BankMgr;
});
gbx.define("comm/helper/conf_mgr", ["gbx/render/loader"], function (loader) {
	return {
		definition: null,
		setting: null,
		read: function (url) {
			var path = "assets/" + url;
			var conf = loader.get(path);
			if (conf) {
				return conf;
			}
			gbx.log("assets/" + url);
			return loader.get("assets/" + url);
		},
		prepare: function () {
			if (this.definition == null) this.definition = this.read("baccarat/dat/definition.json");
			if (this.setting == null) this.setting = this.read("baccarat/dat/setting.json");
		}
	};
});
gbx.define("comm/helper/match_mgr", ["gbx/cclass", "gbx/hubs", "gbx/net/connector", "gbx/render/stage", "conf/game", "comm/helper/scene_mgr", "comm/helper/playerdata_mgr", "comm/ui/connect_loading", "comm/ui/top_confirm"], function (Class, hubs, server, stage, game, sceneMgr, playerDataMgr, loading, topConfirm) {
	var MatchMgr = Class.extend({
		init: function () {
			this._matchs = {};
			this._pollingId = 0;
			this._waitingId = 0;
			this.pollingLoad();
		},
		_onMttMatchStatusUpdate: function (obj) { },
		_onMatchStart: function (obj) {
			var matchId = obj.mid;
			if (matchId in this._matchs) {
				this._matchs[matchId].updateStatus(obj);
				if (this._matchs[matchId].isSigned) {
					this._matchs[matchId].isJoined = true;
				}
			}
			topConfirm.hide();
			this.publish("global.match.list_update.mtt", matchId);
		},
		_onMatchEnd: function (obj) {
			topConfirm.hide();
		},
		_loadGameByKindId: function (kindId, ctx, callback) {
			var code = Math.floor(kindId / 1e4),
				gameName = "",
				tab = 0;
			for (var key in game) {
				if (game[key].code === code) {
					gameName = key;
					if (game[key].type) {
						var type = Math.floor((kindId - code * 1e4) / 1e3),
							singleGame = game[key];
						for (key in singleGame.type) {
							if (singleGame.type[key].key === type) {
								tab = singleGame.type[key].tab;
								break;
							}
						}
					}
					break;
				}
			}
			sceneMgr.loadGame(gameName, tab, function () {
				callback.call(ctx);
			});
		},
		_askPlayerGotoCheckIn: function (obj) { },
		_intoMatchRoom: function (obj, err) { },
		pollingLoad: function () {
			clearTimeout(this._pollingId);
		},
		joinInventGameRoom: function (inventKey, error) { },
		getByMatchId: function (matchId) {
			return this._matchs[matchId];
		},
		end: function () {
			clearTimeout(this._waitingId);
			clearTimeout(this._pollingId);
		}
	}).singleton();
	return new MatchMgr;
});
gbx.define("comm/helper/playerdata_mgr", ["gbx/class", "gbx/hubs", "gbx/net/connector", "comm/data/player/player_data", "comm/helper/account_mgr", "comm/helper/scene_mgr", "comm/helper/conf_mgr"], function (Class, hubs, server, PlayerData, accountMgr, sceneMgr, confMgr) {
	var PlayerDataMgr = Class.extend({
		init: function () {
			this._myData = null;
			this._cachedData = {};
			this._rebateParentId = "";
			this._roomId = null;
			this._seatIdx = -1;
		},
		setData: function (data) {
			var key = data.uid;
			this._cachedData[key] = data;
		},
		getData: function (userId, doNotCreate) {
			var pData = this._cachedData[userId];
			if (!pData && !doNotCreate) pData = new PlayerData(userId);
			return pData;
		},
		getMyData: function () {
			return this._myData;
		},
		getMyUID: function () {
			return this._myData.uid;
		},
		isMyself: function (playerId) {
			if (this._myData.uid === playerId) return true;
			return false;
		},
		getMyNick: function () {
			return this._myData.nick;
		},
		setMyNick: function (v) {
			this._myData.nick = v;
		},
		getMyGold: function () {
			return this._myData.gold;
		},
		setMyGold: function (value) {
			this._myData.gold = value;
		},
		getMyCarryGold: function () {
			return this._myData.carryOnGold;
		},
		setMyCarryGold: function (value) {
			this._myData.carryOnGold = value;
		},
		updateMyCarryGold: function (value) {
			this._myData.carryOnGold += value;
		},
		updateMyGold: function (value) {
			this._myData.gold += value;
		},
		getMyDiamond: function () {
			return this._myData.diamond;
		},
		getMyVIPLevel: function () {
			return this._myData.vipLevel;
		},
		getMyHead: function () {
			return this._myData.head;
		},
		setMyHead: function (v) {
			this._myData.head = v;
		},
		getMySex: function () {
			return this._myData.sex;
		},
		isDealer: function () {
			return this._myData.isDealer;
		},
		setMeDealer: function (value) {
			this._myData.isDealer = value;
		},
		setRebateParentId: function (v) {
			this._rebateParentId = v;
		},
		getRebateParentId: function () {
			return this._rebateParentId;
		},
		setRoomId: function (id) {
			this._roomId = id;
		},
		getRoomId: function () {
			return this._roomId;
		},
		getChipArray: function () {
			return this._myData.chipArray;
		},
		setChipArray: function (v) {
			this._myData.chipArray = v;
		},
		getBankCardNumber: function () {
			return this._myData.bankCardNumber;
		},
		setBankCardNumber: function (v) {
			this._myData.bankCardNumber = v;
		},
		getVipRoomLimitList: function () {
			return this._myData.vipRoomLimitList;
		},
		getSeatIdx: function () {
			return this._seatIdx;
		},
		setSeatIdx: function (v) {
			this._seatIdx = v;
		},
		getServiceQQInfoList: function () {
			return this._myData._serviceQQInfoList;
		},
		setUserData: function (data) {
			var player = new PlayerData(data.UserID);
			this._myData = player;
			this._myData.uid = data.UserID;
			this._myData.sex = data.Gender;
			this._myData.nick = data.NickName;
			this._myData.head = data.FaceID;
			//this._myData.gold = data.InsureScore+data.Score;
			//this._myData.carryOnGold = data.Score;
			this._myData.serverID = data.ServerId;
			//this._myData.bankCardNumber = data.baccaratData.cardNumber;
			this._myData.diamond = data.Diamond;
			this._myData.level = data.Level;
			//this._myData.levelExp = data.playerData.levelExp;
			this._myData.vipLevel = data.VipLevel;
			this._myData.vipExp = data.VipExpire;
			//this._myData.vipRoomLimitList = data.baccaratData.limit;
			this._myData.vipRoomLimitList[0] = { type: 100, bankerFarmerBetMin: 100, allBankerFarmerBetMax: 15000 };
			//this._myData._serviceQQInfoList = data.baccaratData.gmInfo;
			this.origData = data;
			var chipArray = [];
			for (var i = 0; i < 5; i++) {
				var str1 = localStorage.getItem(i.toString());
				if (str1 != null && str1 != "null") {
					chipArray[i] = JSON.parse(str1);
				}
			}
			if (chipArray.length == 0) this._myData.chipArray = [{
				price: 1,
				index: 0
			}, {
				price: 5,
				index: 1
			}, {
				price: 10,
				index: 2
			}, {
				price: 50,
				index: 3
			}, {
				price: 100,
				index: 4
			}];
			else this._myData.chipArray = chipArray;
		},
		_dealOneItemProto: function (oneProto) {
			switch (oneProto.DType) {
				case confMgr.definition.D_TYPE.GOLD:
					break;
				case confMgr.definition.D_TYPE.DIAMOND:
					break;
				case confMgr.definition.D_TYPE.REBATE_POINT:
					break;
				case confMgr.definition.D_TYPE.CARRYON_GOLD:
					this.setMyCarryGold(oneProto.count);
					break;
				case confMgr.definition.D_TYPE.BACCARAT_GOLD:
					this.setMyGold(oneProto.count);
					break;
				default:
					break;
			}
		},
		dealItemProto: function (proto) {
			if (proto instanceof Array) {
				for (var i = 0; i < proto.length; i++) this._dealOneItemProto(proto[i]);
			} else {
				this._dealOneItemProto(proto);
			}
		},
		logout: function () {
			sceneMgr.switchTo("login", "switch_account");
		}
	}).singleton();
	return new PlayerDataMgr;
});
gbx.define("comm/helper/resource_helper", function () {
	var _res = {};
	return {
		setSection: function (key, array) { },
		add: function (key, value) {
			if (key in _res) {
				_res[key].push(value);
			} else {
				_res[key] = [value];
			}
		},
		get: function (key) {
			if (key in _res) {
				return _res[key];
			}
			return null;
		}
	};
});
gbx.define("comm/helper/room_mgr", ["gbx/class", "gbx/hubs", "gbx/net/connector", "gbx/net/messagecommand", "gbx/net/errorcode", "gbx/net/errorcode_des", "comm/helper/conf_mgr", "comm/helper/scene_mgr", "comm/ui/top_message", "comm/ui/connect_loading", "conf/ui_locallization", "comm/helper/playerdata_mgr", "gbx/bridge"], function (Class, hubs, server, CMD, ERROR_CODE, ERROR_CODE_DES, confMgr, sceneMgr, topMessage, loading, uiLocallization, playerDataMgr, bridge) {
	var RoomMgr = Class.extend({
		init: function () {
			this._roomData = [];
			this._chooseData = null;
			this._chooseType = "";
			this._lastRoomId = null;
			this._lastGetInRoom = 0;
			this._roomID = 0;
		},
		getAllRoomData: function (context, callback, typeID) {
			if (typeID == undefined) {
				typeID = 1;
			}
			var sendMsg = gtea.protobuf.encode("RequestGameServerInfo", {
				Type: typeID,
				Level: 0
			}, 100, 0);
			gtea.net.ProtobufConverter.getInstance().setCallback(CMD.BaccaratGetAllRoomData, 100, 0, "ReplyGameServerInfo");
			server.requestToGame(CMD.BaccaratGetAllRoomData, sendMsg, this, function (errorcode, roomList) {
				if (roomList.ErrorCode == undefined || roomList.ErrorCode == ERROR_CODE.OK) {
					//var data = gtea.protobuf.decode("BaccaratGetAllRoomDataResp", roomList);
					this._roomData = roomList.Options;
					var transData = [];
					for (var i = 0; i < this._roomData.length; i++) {
						var _data = this._roomData[i];
						var _trance = {};
						_trance.roomId = _data.ServerId;  //房间id
						//1002 1004 竞咪厅 1001 1003 其它
						//百家乐  房间类型 
						if (_data.GameTypeId == 1002 || _data.GameTypeId == 1004) {
							_trance.baccaratRoomType = 2;
						} else if (_data.GameTypeId == 1008) {
							_trance.baccaratRoomType = 4;
						} else if (_data.GameTypeId == 1009) {
							_trance.baccaratRoomType = 5;
						} else {
							_trance.baccaratRoomType = 1;
						}
						_trance.upToBanker = 1;  //是否可以上庄
						_trance.bankerMinMoney = parseInt(_data.LowerLimit) / 100; //上庄最小金额
						_trance.bankerFarmerBetMin = parseInt(_data.LowerLimit) / 100; //庄，闲区单人最小下注
						_trance.otherBetMin = parseInt(_data.DrawLowerLimit) / 100; //和，庄对，闲对区单人最小下注
						_trance.allBankerFarmerBetMax = parseInt(_data.UpperLimit) / 100; //庄，闲区所有玩家下注之和最大值
						_trance.allDeuceBetMax = parseInt(_data.DrawUpperLimit) / 100; //和区所有玩家下注之和最大值
						_trance.allFarmerPairBetMax = parseInt(_data.PairLowerLimit) / 100; //闲对区所有玩家下注之和最大值
						_trance.allBankerPairBetMax = parseInt(_data.PairUpperLimit) / 100; //庄对区所有玩家下注之和最大值
						_trance.playerNum = _data.PlayerCount;  //房间玩家数量
						var roundRecode = [];
						for (var n = 0; n < _data.ResultType.length; n++) {
							roundRecode[n] = {};
							roundRecode[n].farmerPair = _data.PairType[n] == 1 || _data.PairType[n] == 3;
							roundRecode[n].bankerPair = _data.PairType[n] == 2 || _data.PairType[n] == 3;
							roundRecode[n].winType = _data.ResultType[n];
							roundRecode[n].farmerNum = 0;
							roundRecode[n].bankerNum = 0;
						}
						_trance.roundResults = roundRecode, //回合结果记录
							_trance.seatMinMoney = parseInt(_data.UpperLimit) / 100; //入座最小金币
						transData[i] = _trance;
					}
					this._roomData = transData;
				}
				if (context != undefined && callback != undefined) callback.call(context, ERROR_CODE.OK);
			});
		},
		getOldRoomId: function (context, callback) {
			var sendMsg = gtea.protobuf.encode("BaccaratGetOldRoomReq", {});
			server.requestToGame(CMD.BaccaratGetOldRoom, sendMsg, this, function (errorcode, data) {
				if (errorcode == ERROR_CODE.OK) {
					var ret = gtea.protobuf.decode("BaccaratGetOldRoomResp", data);
					this._lastRoomId = ret.roomId;
					callback.call(context, ret.roomId);
				} else {
					callback.call(context, null);
				}
			});
		},
		createVIPRoom: function (roomName, resetTimesMax, type, chips) {
			var sendMsg = gtea.protobuf.encode("CreatePrivateRequest", {
				UserID: playerDataMgr.getMyUID(),
				RoomName: roomName,
				RoomType: 5002,
				PokerBoots: resetTimesMax,
				ChipsRange: parseInt(chips.substr(chips.indexOf("注") + 2))
			}, 151, 19);
			gtea.net.ProtobufConverter.getInstance().setCallback(CMD.CreateRoom, 151, 19, "ReplyCreatePrivate");
			server.requestToGame(CMD.CreateRoom, sendMsg, this, function (errorcode, data) {
				if (data.ErrorCode == ERROR_CODE.OK) {
					//var retData = gtea.protobuf.decode("CreateRoomResp", data);
					this._roomID = data.RoomId;
					sceneMgr.switchTo("baccarat_table");
				}
			});
		},
		joinRoomByRoomId: function (roomId) {
			var room = this.getRoom(roomId);
			if (room == null) {
				this.joinVIPRoomByRoomId(roomId);
			} else {
				this.setChoose(room);
				this.joinRoom();
			}
		},
		joinVIPRoomByRoomId: function (roomId) {
			loading.show();
			this.joinRoomReq(roomId);
		},
		joinRoom: function () {
			loading.show();
			var room = this.getChoose();
			if (room == null) {
				var roomList = this.getRoomList();
				if (roomList == null) {
					loading.hide();
					topMessage.post(uiLocallization.lack_room);
					return;
				}
				room = roomList[0];
			}
			this.joinRoomReq(room.roomId);
		},
		joinRoomReq: function (roomId) {
			//直接进入游戏,然后再取数据
			this._roomID = roomId;
			sceneMgr.switchTo("baccarat_table");
			/*var sendData = gtea.protobuf.encode("LoginByUserIDRequest", {
				UserID:playerDataMgr.getMyUID(),
				PassWord:"",
				KindID:1,
				ServerID: roomId,
				ClientIP:"",
				MachineID: bridge.getDeviceId()
			},151,0);
			server.requestToGame(CMD.JoinRoom, sendData, this, function(errorcode, data) {
				loading.hide();
				var isOK = false;
				if (data.ErrorCode == ERROR_CODE.OK) {
					var msgData = gtea.protobuf.decode("JoinRoomResp", data);
					if (msgData.result == ERROR_CODE.OK) isOK = true;
					else errorcode = msgData.result
				}
				if (isOK) sceneMgr.switchTo("baccarat_table")
			})*/
		},
		resetRoom: function (roomId) {
			var sendData = gtea.protobuf.encode("JoinRoomReq", {
				roomId: roomId,
				roomType: confMgr.definition.ChessRoomType.Baccarat
			});
			server.requestToGame(CMD.JoinRoom, sendData, this, function (errorcode, data) {
				loading.hide();
				var isOK = false;
				if (errorcode == ERROR_CODE.OK) {
					var msgData = gtea.protobuf.decode("JoinRoomResp", data);
					if (msgData.result == ERROR_CODE.OK) isOK = true;
				}
				if (isOK) {
					this.getRoomDataHeadFromServer(this, function (roomData) {
						if (roomData != null) {
							hubs.publish("global.game_status.reset_room", roomData);
							hubs.publish("global.net_connect.login_to_room_success");
							hubs.publish("global.net_connect.restart_heartbeat");
						} else {
							hubs.publish("global.net_connect.login_to_room");
						}
					});
				} else {
					hubs.publish("global.net_connect.login_to_room");
				}
			});
		},
		getRoomDataFromServer: function (context, func) {
			//在此处开始登录
			var sendData = gtea.protobuf.encode("LoginByUserIDRequest", {
				UserID: playerDataMgr.getMyUID(),
				PassWord: "",
				KindID: 1,
				ServerID: parseInt(this._roomID),
				ClientIP: "",
				MachineID: bridge.getDeviceId()
			}, 151, 0);
			gtea.net.ProtobufConverter.getInstance().setCallback(CMD.JoinRoom, 151, 0, "ReplyPlayerDetailInfo");
			server.requestToGame(CMD.JoinRoom, sendData, this, function (errorcode, data) {
				loading.hide();
				var isOK = false;
				if (data.ErrorCode == ERROR_CODE.OK) {

				} else {
					topMessage.post("进入游戏失败,错误码:" + data.ErrorCode);
				}
			});
			//游戏开始,先加监听
			gtea.net.ProtobufConverter.getInstance().setCallback(CMD.BaccaratSyncUserPut, 150, 100, "NoticeGameStart");
			//先返所有玩家
			gtea.net.ProtobufConverter.getInstance().setCallback(CMD.GetRoomData * 1000, 151, 2, "ServerMessageAllPlayersInfo");
			gtea.net.ProtobufConverter.getInstance().setCallback(CMD.BaccaratSyncSitDown, 151, 7, "ServerMessageOtherPlayerSitDown");
			gtea.net.ProtobufConverter.getInstance().setCallback(CMD.SyncPlayerQuitRoom, 151, 8, "ServerMessageOtherPlayerStandUp");
			gtea.net.ProtobufConverter.getInstance().setCallback(CMD.SyncPlayerJoinRoom, 150, 112, "BroadcastUserSit");
			server.requestToRoom(CMD.GetRoomData * 1000, null, this, function (errorcode, mdata) {
				//再返回场景信息
				//添加下注后续处理监听,场景中需要的监听
				gtea.net.ProtobufConverter.getInstance().setCallback(CMD.BaccaratSyncOnBet, 150, 108, "BroadcastUserBet");
				gtea.net.ProtobufConverter.getInstance().setCallback(CMD.BaccaratSyncSendCard, 150, 107, "BroadcastDealHndCard");
				gtea.net.ProtobufConverter.getInstance().setCallback(CMD.BaccaratSyncGameResult, 150, 105, "BroadcastGameOver");
				//竟咪厅
				gtea.net.ProtobufConverter.getInstance().setCallback(CMD.BaccaratSyncSendCardJM, 150, 102, "NoticeDealHeadCards");
				gtea.net.ProtobufConverter.getInstance().setCallback(CMD.BaccaratSyncLookCardJM, 150, 115, "BroadcastFlipAction");
				gtea.net.ProtobufConverter.getInstance().setCallback(CMD.BaccaratOpenCardJM, 150, 103, "NoticeFlopCard");
				gtea.net.ProtobufConverter.getInstance().setCallback(CMD.BaccaratOpenCardEXTJM, 150, 104, "NoticeFlopExtraCard");
				gtea.net.ProtobufConverter.getInstance().setCallback(CMD.BaccaratSyncFlyCardJM, 150, 110, "BroadcastStartQiePai");
				gtea.net.ProtobufConverter.getInstance().setCallback(CMD.BaccaratSyncLookSoundJM, 150, 116, "BroadcastUserBooing");
				gtea.net.ProtobufConverter.getInstance().setCallback(CMD.BaccaratOpenCardOpenJM, 150, 117, "BroadcastOpenCard");
				gtea.net.ProtobufConverter.getInstance().setCallback(CMD.BaccaratSyncMark, 150, 118, "BroadcastResetBetLeader");
				gtea.net.ProtobufConverter.getInstance().setCallback(CMD.BaccaratSyncOnRemoveBet, 150, 109, "BroadcastCancelBet");
				//var sendData = gtea.protobuf.encode("GetRoomDataReq", {});
				gtea.net.ProtobufConverter.getInstance().setCallback(CMD.GetRoomData, 150, 114, "BroadcastSceneGame");
				server.requestToRoom(CMD.GetRoomData, null, this, function (errorcode, data) {
					//var msgData = gtea.protobuf.decode("GetRoomDataResp", data);
					if (data.ErrorCode == undefined || data.ErrorCode == ERROR_CODE.OK) {
						myGlobalData.bankerBetMaxUserID = undefined;
						myGlobalData.farmerBetMaxUserID = undefined;

						var players = mdata.PlayerInfos;
						var myPlayerData = [];

						for (var i = 0; i < players.length; i++) {
							var pData = {};
							pData.playerInfo = {};
							pData.seatIdx = players[i].ChairID > 4 ? -1 : players[i].ChairID;
							pData.carryOnGold = parseInt(players[i].Score) / 100;
							//好像无用
							pData.areaBetAmount = [111, 222, 333, 444, 555, 666, 777];
							pData.chipInfo = [];
							var bankBetMaxData = { userid: "" };
							var farmerBetMaxData = { userid: "" };
							for (var v = 0; v < data.UserBetScore.length; v++) {
								for (var n = 0; n < data.UserBetScore[v].BetScore.length; n++) {
									data.UserBetScore[v].BetScore[n] = parseInt(data.UserBetScore[v].BetScore[n]) / 100;
									if (pData.chipInfo[n] == undefined) {
										pData.chipInfo[n] = {
											area: (n + 1),
											money: data.UserBetScore[v].BetScore[n]
										};
									} else {
										pData.chipInfo[n].money = pData.chipInfo[n].money + parseInt(data.UserBetScore[v].BetScore[n]);
									}
									if (n == 0) {
										if (bankBetMaxData.score == undefined || bankBetMaxData.score < data.UserBetScore[v].BetScore[n]) {
											bankBetMaxData.score = data.UserBetScore[v].BetScore[n];
											bankBetMaxData.userid = data.UserBetScore[v].BetUserId;
										}
									} else if (n == 1) {
										if (farmerBetMaxData.score == undefined || farmerBetMaxData.score < data.UserBetScore[v].BetScore[n]) {
											farmerBetMaxData.score = data.UserBetScore[v].BetScore[n];
											farmerBetMaxData.userid = data.UserBetScore[v].BetUserId;
										}
									}
								}
							}

							pData.playerInfo.playerId = players[i].UserID;
							pData.playerInfo.nickName = players[i].NickName;
							pData.playerInfo.sex = players[i].Gender;
							pData.playerInfo.roomCoin = 0;
							pData.playerInfo.level = players[i].Level;
							pData.playerInfo.vipLevel = players[i].VipLevel;
							pData.playerInfo.playerIcon = players[i].FaceID;
							pData.playerInfo.isRobot = true;
							//optional PlayerMJCount mjCount = 9;   //个人的麻将游戏统计信息
							//optional string ipAddr = 10;            //本次登陆IP地址
							//optional string packageId = 11;
							myPlayerData[i] = pData;
						}

						var msgData = {};
						msgData.state = data.GameState; //游戏状态
						msgData.leftSendCardTime = data.LeftTime; //剩余发牌时间
						msgData.leftCardNum = data.LeftCount; //剩余牌数
						msgData.bankerCards = data.BankerCards; //庄家牌
						msgData.farmerCards = data.PlayerCards;//闲家牌
						msgData.winType = 6; //牌局结果，庄，闲，和
						msgData.bankerPair = 7; //庄对
						msgData.farmerPair = 8; //闲对
						msgData.bankerId = ""; //庄家id
						msgData.bankerScore = 10;//庄家成绩
						msgData.bankerRounds = 11; //连庄次数
						msgData.waitBankers = 12;//排庄玩家id
						msgData.players = myPlayerData;//玩家
						msgData.showSeats = 14; //座位上玩家id
						msgData.sendCardSteps = [4, 5, 6, 7]; //竞咪厅发牌阶段列表
						msgData.sendCardLeftTime = 0; //发牌剩余时间 
						msgData.bankerBetMax = bankBetMaxData.userid; //庄家下注最多的玩家id
						msgData.farmerBetMax = farmerBetMaxData.userid; //闲家下注最多的玩家id
						msgData.lookCardDir = 19; //咪牌方向
						msgData.lookStep = 20; //咪牌进度
						msgData.lookRadian = 21;//咪牌角度
						msgData.roomName = 22; //VIP厅，房间名字
						msgData.pwd = 23;//VIP厅，房间密码
						msgData.resetTimes = 24; //VIP厅，重置次数
						msgData.resetTimesMax = 25; //VIP厅，最大重置次数 
						msgData.vipRoomData = 26;//VIP厅信息(废弃)
						msgData.isConfirmBet = false; //是否确认了下注
						msgData.playerSeatIdx = data.SelfSeatId; //玩家本人的座位index
						msgData.step2Send2 = true; //竞咪厅第二阶段庄闲同时发牌
						msgData.isFlyCard = 30; //是否飞牌
						msgData.oneRoomData = 31;
						msgData.BetTime = data.BetTime;
						msgData.RubCardIime = data.RubCardIime;
						msgData.ServerID = data.ServerId;
						msgData.baccaratRoomType = (data.GameType == 1002 || data.GameType == 1004) ? 2 : 1;
						//if (msgData.baccaratRoom.oneRoomData) this.changeChoose(msgData.baccaratRoom.oneRoomData);
						func.call(context, msgData);
					} else {
						func.call(context, null);
					}
				});
			});

		},
		getRoomDataHeadFromServer: function (context, func) {
			var sendData = gtea.protobuf.encode("GetRoomDataHeadReq", {
				roomId: this._chooseData.roomId
			});
			server.requestToGame(CMD.GetRoomDataHead, sendData, this, function (errorcode, data) {
				var msgData = gtea.protobuf.decode("GetRoomDataHeadResp", data);
				if (msgData.result == ERROR_CODE.OK) {
					if (msgData.baccaratRoom.oneRoomData) this.changeChoose(msgData.baccaratRoom.oneRoomData);
					func.call(context, msgData);
				}
				this._lastRoomId = this._chooseData.roomId;
				func.call(context, null);
			});
		},
		getRoom: function (roomId) {
			var roomList = this.getRoomList();
			if (roomList) {
				for (var i = 0; i < roomList.length; i++) {
					if (roomList[i].roomId === roomId) return roomList[i];
				}
			}
			return null;
		},
		getRoomList: function () {
			if (!this._roomData) return null;
			var list = this._roomData.sort(function (a, b) {
				var result = parseInt(a.bankerFarmerBetMin) - parseInt(b.bankerFarmerBetMin);
				if (result == 0) return parseInt(a.roomId) - parseInt(b.roomId);
				else return result;
			});
			return list;
		},
		getRoomListByType: function (baccaratRoomType) {
			var ret = [];
			var roomList = this.getRoomList();
			if (roomList) {
				for (var i = 0; i < roomList.length; i++) {
					if (roomList[i].baccaratRoomType === baccaratRoomType) {
						ret.push(roomList[i]);
					}
				}
			}
			return ret;
		},
		removeRoom: function (roomId) {
			for (var i = 0; i < this._roomData.length; i++) {
				if (this._roomData[i].roomId === roomId) {
					this._roomData.splice(i, 1);
					break;
				}
			}
			if (this._chooseData != null) {
				if (this._chooseData.roomId === roomId) this._chooseData = null;
			}
		},
		setChoose: function (data) {
			this._chooseData = data;
		},
		getChoose: function () {
			return this._chooseData;
		},
		changeChoose: function (data) {
			this._chooseData = data;
			for (var i = 0; i < this._roomData.length; i++) {
				if (this._roomData[i].roomId === data.roomId) {
					this._roomData[i] = data;
					return;
				}
			}
		},
		getIsVip: function () {
			var data = this._chooseData;
			if (data == undefined) return false;
			if (data.baccaratRoomType == confMgr.definition.BaccaratRoomType.Vip) return true;
			return false;
		},
		set lastRoomId(v) {
			this._lastRoomId = v;
		},
		get lastRoomId() {
			return this._lastRoomId;
		},
		setChooseType: function (v) {
			this._chooseType = v;
		},
		getChooseType: function () {
			return this._chooseType;
		},
		checkGetInTime: function () {
			if (this._lastGetInRoom == 0) {
				this._lastGetInRoom = Date.now();
				return true;
			} else {
				var now = Date.now();
				if (now - this._lastGetInRoom > 500) {
					this._lastGetInRoom = Date.now();
					return true;
				} else return false;
			}
		}
	}).singleton();
	return new RoomMgr;
});
gbx.define("comm/helper/scene_mgr", ["conf/game", "conf/resource", "comm/helper/sound_mgr", "gbx/render/texture", "gbx/render/loader", "gbx/render/stage", "gbx/hubs", "comm/ui/scene_loading"], function (gameList, resList, soundMgr, texture, loader, stage, hubs, loading) {
	var sceneList = {},
		currentScene = null,
		currentSceneName = "",
		loadRes = [],
		clearRes = [],
		afterPrepareFun = null;
	!
		function () {
			if (soundMgr.usingOgg) {
				for (var key in resList) {
					for (var i = 0; i < resList[key].length; i++) {
						resList[key][i] = resList[key][i].replace(".mp3", ".ogg");
					}
				}
			}
			for (var game in gameList) {
				if ("scene" in gameList[game]) {
					sceneList[gameList[game].resource] = gameList[game].scene;
				} else if ("type" in gameList[game]) {
					for (var type in gameList[game].type) {
						if ("scene" in gameList[game].type[type]) {
							sceneList[gameList[game].type[type].resource] = gameList[game].type[type].scene;
						}
					}
				}
			}
		}();

	function travelResourceList(key) {
		if (typeof key === "string") {
			if (key === "lobby_auto") {
				key = "lobby_sp";
			}
			if (key in resList) {
				for (var l = resList[key], i = 0; i < l.length; i++) {
					travelResourceList(l[i]);
				}
			} else if (texture.usingTexturePack && /\.png$/.test(key)) {
				var url = texture.getPack(key);
				for (var i = 0; i < loadRes.length; i++) {
					if (loadRes[i] === url) {
						return;
					}
				}
				loadRes.push(url);
				loader.add(url);
			} else {
				loadRes.push(key);
				loader.add(key);
			}
		} else {
			loadRes.push(key.url);
			loader.add(key.url, key.type);
		}
	}

	function loadResource(sceneName, quiet, success, fail) {
		if (!quiet) {
			loading.show();
		}
		loader.clear();
		travelResourceList(sceneName);
		loader.load(loading, function () {
			gbx.log("scene res load ok");
			if (!quiet) {
				loading.hide();
			}
			success();
		}, loading.progress, function () {
			gbx.log("scene res load fail");
			fail && fail();
		});
	}

	function minusNotUsedResource() {
		for (var i = 0; i < clearRes.length; i++) {
			var flag = false;
			for (var j = 0; j < loadRes.length; j++) {
				if (loadRes[j] === clearRes[i]) {
					flag = true;
					break;
				}
			}
			if (!flag) {
				loader.remove(clearRes[i]);
			}
		}
	}

	function switchScene(sceneName, sceneInstance, args, show) {
		if (currentScene != null) {
			currentScene.end();
		}
		setTimeout(minusNotUsedResource, 1);
		clearRes = [];
		window.currentSceneName = sceneName;
		currentSceneName = sceneName;
		currentScene = sceneInstance;
		if (show) currentScene.show.apply(currentScene, args);
	}
	hubs.subscribe("global.scene.change", function (sceneName, quiet, args) {
		if (currentScene === sceneName) return;
		afterPrepareFun = null;
		if (sceneName in sceneList) {
			clearRes = loadRes;
			loadRes = [];
			loadResource(sceneName, quiet, function () {
				gbx.require([sceneList[sceneName]], function (sceneInstance) {
					if (sceneInstance.prepareShow != undefined) {
						afterPrepareFun = function () {
							switchScene(sceneName, sceneInstance, args, false);
						};
						sceneInstance.prepareShow.call(sceneInstance);
					} else {
						switchScene(sceneName, sceneInstance, args, true);
					}
				});
			}, function () {
				loadRes = clearRes;
				hubs.publish("global.scene.change", sceneName, quiet, args);
			});
		}
	});
	return {
		switchToAfterPrepare: function () {
			if (afterPrepareFun != null) afterPrepareFun();
			afterPrepareFun = null;
		},
		switchTo: function (sceneName) {
			var args = Array.prototype.slice.call(arguments, 1);
			gbx.log("switch to:", sceneName, args);
			hubs.publish("global.scene.change", sceneName, false, args);
		},
		quietSwitchTo: function (sceneName) {
			var args = Array.prototype.slice.call(arguments, 1);
			gbx.log("quiet switch to:", sceneName, args);
			hubs.publish("global.scene.change", sceneName, true, args);
		},
		loadGame: function (game, type, success, fail) {
			gbx.log("loadGame", game, type);
			if (type === undefined) {
				type = 1;
			} !function retry() {
				if (game in gameList) {
					if ("type" in gameList[game]) {
						for (var key in gameList[game].type) {
							if (gameList[game].type[key].tab === type) {
								loadResource(gameList[game].type[key].resource, false, function () {
									gbx.require(["game/" + game + "/installer"], function (installer) {
										installer.run(success);
									});
								}, retry);
								return;
							}
						}
					} else {
						loadResource(gameList[game].resource, false, success, retry);
						return;
					}
				}
			}();
			fail && fail();
		},
		getCurrentScene: function () {
			return currentSceneName;
		}
	};
});
gbx.define("comm/helper/sound_mgr", ["gbx/render/loader", "gbx/bridge"], function (loader, bridge) {
	var sound = laya.media.SoundManager;
	var firstPlay = true,
		setting, lastBgm = "",
		usingOgg = false;
	!function () {
		var obj = document.createElement("audio");
		if ("canPlayType" in obj && !obj.canPlayType("audio/mp3")) {
			usingOgg = true;
		}
	}();
	if (localStorage["soundSetting"]) {
		setting = JSON.parse(localStorage["soundSetting"]);
		sound.soundMuted = !setting.se;
		sound.soundVolume = setting.vol / 100;
		sound.musicMuted = !setting.bgm;
		sound.musicVolume = setting.vol / 100;
	} else {
		setting = {
			bgm: true,
			se: true,
			vol: 80
		};
	}
	var warm = false,
		bad = false;
	if (!("AudioContext" in window) && !("webkitAudioContext" in window)) {
		setting.bgm = false;
		setting.se = false;
		bad = true;
	}

	function saveSetting() {
		localStorage["soundSetting"] = JSON.stringify(setting);
	}
	var soundMgr = {
		playBGM: function (url) {
			if (myGlobalData.soundOff) return;
			if (bridge.getPlatform() === "web" && navigator && navigator.userAgent && /MQQBrowser/i.test(navigator.userAgent)) {
				return;
			}
			if (usingOgg) {
				url = url.replace(".mp3", ".ogg");
			}
			lastBgm = url;
			if (!setting.bgm) {
				return;
			}
			sound.playMusic(url);
		},
		stopBGM: function () {
			sound.stopMusic();
		},
		playSE: function (url, v, callback) {
			if (myGlobalData.soundOff) return;
			if (!setting.se) {
				callback && callback();
				return;
			}
			if ("conch" in window) {
				url = url.replace("/se/", "/se/wav/").replace(".mp3", ".wav");
				loader.loadOnce([url], this, function () {
					sound.playSound(url, 1, new laya.utils.Handler(null, callback, [], true));
				});
				return;
			} else if (usingOgg) {
				url = url.replace(".mp3", ".ogg");
			}
			if (v) sound.setMusicVolume(v);
			sound.playSound(url, 1, new laya.utils.Handler(null, callback, [], true));
		},
		unlock: function () { },
		setPlayingSoundMax: function (max) { },
		clearCache: function (url) { },
		pause: function () {
			sound.setMusicVolume(0);
			sound.setSoundVolume(0);
		},
		resume: function () {
			sound.setMusicVolume(setting.vol / 100);
			sound.setSoundVolume(setting.vol / 100);
		},
		get usingOgg() {
			return usingOgg;
		},
		get bgm() {
			return setting.bgm;
		},
		get se() {
			return setting.se;
		},
		get volume() {
			return setting.vol;
		},
		set bgm(v) {
			setting.bgm = v;
			sound.musicMuted = !v;
			saveSetting();
			if (v) {
				this.playBGM(lastBgm);
			}
		},
		set se(v) {
			setting.se = v;
			sound.soundMuted = !v;
			saveSetting();
			if (bad && !warm && v) {
				alert("您的浏览器对音频的支持效果差，开启音频功能后可能会导致内存不足。");
				warm = true;
			}
		},
		set volume(v) {
			setting.vol = v;
			sound.setMusicVolume(v / 100);
			sound.setSoundVolume(v / 100);
			saveSetting();
			if (bad && !warm && v) {
				alert("您的浏览器对音频的支持效果差，开启音频功能后可能会导致内存不足。");
				warm = true;
			}
		}
	};
	return soundMgr;
});
gbx.define("comm/helper/trumpet_mgr", ["gbx/cclass", "gbx/net/connector"], function (Class, server) {
	var TrumpetMgr = Class.extend({
		init: function () {
			this.trumpetHistory = new Array;
			this.load();
		},
		load: function () { },
		getTrumpetHistory: function () {
			return this.trumpetHistory;
		},
		updateTrumpetHistory: function (context) {
			if (this.trumpetHistory.length >= 10) this.trumpetHistory.pop();
			this.trumpetHistory.unshift(context.context);
			this.publish("global.trumpet.update", context.context);
		},
		setTrumpetHistory: function (args) {
			for (var i = 0; i < args.length; i++) {
				this.updateTrumpetHistory(args[i]);
			}
		}
	}).singleton();
	return new TrumpetMgr;
});