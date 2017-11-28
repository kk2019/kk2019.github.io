gbx.define("gbx/net/check_code", ["gbx/cclass", "gbx/net/messagecommand", "gbx/net/messagecommand_des", "gbx/net/errorcode", "gbx/net/errorcode_des", "gbx/hubs", "comm/helper/room_mgr", "comm/ui/top_message", "comm/ui/top_confirm", "conf/ui_locallization"], function(Class, CMD, CMD_DES, ERROR_CODE, ERROR_CODE_DES, hubs, roomMgr, topMessage, topConfirm, uiLocallization) {
	var CheckCode = Class.extend({
		init: function() {
			this._super();
		},
		checkErrorCode: function(errorcode) {
			switch (errorcode) {
				case ERROR_CODE.BaccaratRoundNotEnd:
					this.backToLastRound();
					return true;
			}
			return false;
		},
		backToLastRound: function() {
			function success() {
				roomMgr.joinRoomByRoomId(roomMgr.lastRoomId);
			}

			function fail() {}
			if (roomMgr.lastRoomId == null) topMessage.post(uiLocallization.lastRoundTip);
			else topConfirm.ask(ERROR_CODE_DES[ERROR_CODE.BaccaratRoundNotEnd] + uiLocallization.backLastRound, this, success, fail);
		}
	});
	return new CheckCode;
});
gbx.define("gbx/net/connector", ["gbx/hubs", "gbx/net/messagecommand", "gbx/net/messagecommand_des"], function(hubs, CMD, CMD_DES) {
	var variables = {
		host: "",
		port: 0
	};
	var netConnector = {
		setServer: function(host, port) {
			variables.host = host;
			variables.port = port;
		},
		connect: function() {
			hubs.publish("global.net_connect.connected");
			return true;
		},
		requestToGame: function(command, content, caller, callback) {
			//gbx.log("%c[net] requestToGame " + command + " " + CMD_DES[command.toString()], "color:green");
			gtea.rpc.requestToGame(command, content, caller, callback);
		},
		requestToRoom: function(command, content, caller, callback) {
			//gbx.log("%c[net] requestToRoom " + command + " " + CMD_DES[command.toString()], "color:green");
			gtea.rpc.requestToRoom(command, content, caller, callback);
		},
		sendToRoom: function(command, content) {
			gtea.rpc.sendToRoom(command, content);
		}
	};
	return netConnector;
});
gbx.define("gbx/net/errorcode", {
	OK: 0,
	DefaultError: 1,
	CantOpenAddress: 100,
	BadRequest: 1e3,
	ServerException: 1001,
	TimeOut: 1002,
	Disconnect: 1003,
	MessageError: 1004,
	RequestParaError: 1005,
	ServerDataError: 1006,
	ServerClosed: 1007,
	ServerOnlineCountMax: 1008,
	ServerAllCountMax: 1009,
	ConditionNotMeet: 1100,
	UserAlreadyExist: 1101,
	AccountOrPwdError: 1102,
	PlayerNotCreate: 1103,
	NameUsed: 1104,
	NameLengthMax: 1105,
	NameErrorCode: 1106,
	GuildNameLengthMax: 1107,
	GuildManifestoLengthMax: 1108,
	BeBaned: 1109,
	ContainSensitiveWord: 1110,
	VersionLimit: 1111,
	LackMoney: 1112,
	RoomIsFull: 1113,
	LackRobot: 1114,
	RoomNotFount: 1115,
	InfoNotExist: 1116,
	NoneToGet: 1117,
	PasswordError: 1118,
	SMSCodeError: 1119,
	SMSCodeTimeOut: 1120,
	UserNotExist: 1121,
	SMSCodeSendError: 1122,
	PhoneUsed: 1123,
	PlayerNotExist: 1124,
	RoomNotExist: 1125,
	PlayerExist: 1126,
	OperationTooOften: 1127,
	PhoneNotExist: 1128,
	PlayerInRoom: 1129,
	MailNotExist: 1130,
	MailNoAward: 1131,
	SBInRoom: 1132,
	BankLackMoney: 1140,
	RebateRSParentIdError: 1150,
	RebateRSChildIdError: 1151,
	RebateRSHasParentId: 1152,
	RebateRSChildDuplicate: 1153,
	RebateRSMutualBinding: 1154,
	FriendMax: 1160,
	PeerOffline: 1161,
	SVIPAlreadyExist: 1170,
	SVIPAlreadyApplied: 1171,
	SVIPPresentToSelf: 1172,
	RechargeGetTransitFail: 1200,
	RechargeQRFail: 1201,
	BaccaratBetMin: 2001,
	BaccaratBetMax: 2002,
	BaccaratBetAreaMax: 2003,
	BaccaratBetBankerCantBet: 2004,
	BaccaratSeatBeTaken: 2005,
	BaccaratHasBankerAndFarmer: 2006,
	BaccaratRoundNotEnd: 2007,
	BaccaratHasNoSeat: 2008,
	BaccaratHasBet: 2009,
	BaccaratPlayerJoinAgin: 2010,
	ActivityCodeError: 2400,
	ActivityCodeServerError: 2401,
	ActivityCodeUsed: 2402,
	ActivityOvertime: 2403,
	ActivityNotCompleted: 2404,
	ActivityUsed: 2405,
	ActivityTimesMax: 2406,
	ActivityHasOpenFund: 2407,
	ActivityNotHasOpenFund: 2408,
	ActivityCodeTypeUsed: 2409,
	ActivityCodeOverTime: 2410,
	PlatformLoginCheckTryError: 2500,
	PlatformLoginCheckUrlError: 2501,
	PlatformLoginCheckParError: 2502,
	PlatformLoginCheckFail: 2503,
	PlatformRechargeCheckFail: 2504,
	PlatformOrderCheckFail: 2505,
	PlatformRechargeSignFail: 2506,
	PlatformRechargeLackMoney: 2507,
	PlatformRechargePayFail: 2508,
	PlatformRechargeCancelPayOK: 2509,
	PlatformRechargeCancelPayFail: 2510,
	PlatformRechargeQueryFail: 2511,
	GMAuthenticationFail: 5e3,
	GMServerError: 5001,
	GMPlayerNotExist: 5002,
	GMLackCurrency: 5003,
	GMLevelOutOfRange: 5004,
	GMAccountOrPwdError: 5005,
	GMServerIdExist: 5006,
	GMLoginServerError: 5007,
	GMNoticeNotExist: 5008,
	GMNoticeExist: 5009,
	GMServerIdNotExist: 5010,
	GMLackDate: 5011,
	GMUserExist: 5012,
	GMUserNotExist: 5013,
	GMRechargeServerError: 5014,
	GMFormatError: 5015,
	GMGuildNotExist: 5016,
	GMOrderLockAccountError: 5017,
	GMOrderUnlockAccountError: 5018,
	GMOrderStatusError: 5019,
	GMSVIPAlreadyApplied: 5020,
	GMSVIPRechargeRepeat: 5021,
	GMSVIPRechargeMin: 5022,
	GMXXX50200: 50200,
	GMXXX50201: 50201,
	GMXXX50211: 50211,
	GMXXX50212: 50212,
	GMXXX50222: 50222,
	GMXXX50223: 50223,
	GMXXX50233: 50233,
	GMXXX50234: 50234,
	GMXXX50244: 50244,
	AsyncResponse: 1e4,
	RelayResponse: 10001
});
gbx.define("gbx/net/errorcode_des", {
	0: "成功",
	1: "默认错误",
	100: "无法连接地址",
	1e3: "错误的请求消息",
	1001: "服务器错误",
	1002: "超时",
	1003: "断开连接",
	1004: "消息错误",
	1005: "请求参数异常",
	1006: "服务器数据错误",
	1007: "停服",
	1008: "达到在线人数上限",
	1009: "达到服务器总人数上限",
	1100: "条件不满足",
	1101: "用户已存在",
	1102: "用户名或密码错",
	1103: "玩家未创建",
	1104: "名字已经存在",
	1105: "名字超过最大长度",
	1106: "名字有屏蔽字符",
	1107: "工会名字超过最大长度",
	1108: "工会宣言名字超过最大长度",
	1109: "被禁止登入",
	1110: "包含敏感字符",
	1111: "版本限制",
	1112: "筹码不足",
	1113: "房间已满",
	1114: "机器人不足",
	1115: "房间不存在",
	1116: "信息不存在",
	1117: "没有可以领取的",
	1118: "密码错误",
	1119: "短信验证码验证错误",
	1120: "短信验证码超时",
	1121: "用户不存在",
	1122: "验证码发送失败",
	1123: "电话号码已注册",
	1124: "玩家不存在",
	1125: "房间不存在",
	1126: "玩家已经存在",
	1127: "操作太频繁",
	1128: "电话号码没有注册",
	1129: "玩家正在房间内",
	1130: "邮件不存在",
	1131: "邮件奖励不存在或者已经领取",
	1132: "房间内有玩家",
	1140: "银行，筹码不足",
	1150: "上线ID为空",
	1151: "下线ID为空",
	1152: "已经绑定上线",
	1153: "已经此玩家下线",
	1154: "不能相互绑定",
	1160: "好友数量达到上限",
	1161: "对方不在线",
	1170: "玩家已经成为VIP",
	1171: "已经提出申请",
	1172: "不能赠送给自己",
	1200: "充值，获取transit失败",
	1201: "充值，获取二维码失败",
	2001: "下注低于最小下注",
	2002: "下注高于最大下注",
	2003: "下注高于区域最大下注",
	2004: "庄家不能下注",
	2005: "座位上已经有玩家",
	2006: "不能同时压庄和闲",
	2007: "上一局未结束，不能进行此操作",
	2008: "没有入座，不能进行此操作",
	2009: "已经有人下注，不能飞牌",
	2010: "玩家再次进入房间",
	2400: "兑换码不存",
	2401: "该服务器不能使用此兑换码",
	2402: "已经使用过此兑换码",
	2403: "活动超时",
	2404: "活动未完成",
	2405: "奖励已经领取",
	2406: "活动领取次数上限",
	2407: "已经购买过开服基金",
	2408: "没有购买开服基金",
	2409: "已经使用过同类型的兑换码",
	2410: "激活码超时",
	2500: "渠道验证在try模块中出错",
	2501: "渠道验证地址错误",
	2502: "渠道验证参数错误",
	2503: "渠道验证失败",
	2504: "充值验证失败",
	2505: "订单请求失败",
	2506: "生成sign失败",
	2507: "金额不足",
	2508: "支付失败",
	2509: "退款成功",
	2510: "退款失败",
	2511: "查询失败",
	5e3: "运营专用，认证失败",
	5001: "运营专用，服务器出错",
	5002: "运营专用，玩家不存在",
	5003: "运营专用，金额不足",
	5004: "运营专用，等级超出范围",
	5005: "运营专用，账号密码错误",
	5006: "运营专用，服务器id已经存在",
	5007: "运营专用，登入服务器操作失败",
	5008: "运营专用，公告不存在",
	5009: "运营专用，公告已经存在",
	5010: "运营专用，服务器id不存在",
	5011: "运营专用，缺少时间",
	5012: "运营专用，用户已经存在",
	5013: "运营专用，用户已经存在",
	5014: "运营专用，充值服务器操作失败",
	5015: "运营专用，输入格式错误",
	5016: "运营专用，公会不存在",
	5017: "运营专用，锁定账号不正确",
	5018: "运营专用，解锁账号不正确",
	5019: "运营专用，订单状态不能变更",
	5020: "运营专用，已经提出了申请",
	5021: "运营专用，订单号重复",
	5022: "运营专用，低于最小金额",
	50200: "运营专用，缺少玩家ID",
	50201: "运营专用，请填写提现金额",
	50211: "运营专用，缺少玩家名字",
	50212: "运营专用，您的提现金额将于24小时之内到账，请及时查收",
	50222: "运营专用，缺少玩家名字或ID",
	50223: "运营专用，不要着急，管理员正在卖命审核您的账号",
	50233: "运营专用，请输入充值金额",
	50234: "运营专用，您的账号已通过审核",
	50244: "运营专用，您的申请未能通过管理员的审核，请提交正确的个人资料",
	1e4: "异步处理消息,服务器内部使用,协调GameServer",
	10001: "转发消息,服务器内部使用,协调GameServer"
});
gbx.define("gbx/net/messagecommand", {
	LoginCommand: 1,
	SetUserInfo: 2,
	NetHeartbeatCommand: 3,
	NetBeKickedCommand: 4,
	GetUserInfoCommand: 5,
	CreateRoom: 10,
	JoinRoom: 11,
	QuitRoom: 12,
	GetRoomData: 13,
	BaccaratSyncSitDown:133,
	GetRoomDataHead: 14,
	SMSGetAuthCode: 20,
	SMSAuthBind: 21,
	MJBindAgent: 25,
	SyncPlayerJoinRoom: 110,
	SyncRingBegin: 111,
	SyncError: 112,
	SyncPlayerQuitRoom: 113,
	SyncRingEnd: 114,
	SyncPlayerReady: 115,
	SyncRoomChat: 116,
	SyncForceLeft: 117,
	SyncHeartBeat: 118,
	SyncHeartBeatAck: 119,
	SyncPlayerLost: 120,
	RebateQueryRS: 200,
	RebateCreateRS: 201,
	RebateRemoveRS: 202,
	RebateUpdateData: 203,
	RBaccaratGetAward: 204,
	RBaccaratGetBaseInfo: 205,
	GetMailList: 300,
	OpenMail: 301,
	DelMail: 302,
	GetMailAward: 303,
	GetAllMailAward: 304,
	SetPlayerInfo: 320,
	PlayerInfoChanged: 321,
	GetMajiangCount: 322,
	GetMJRoomCreatePrice: 323,
	GetMJRechargeTable: 324,
	GetFriendListCommand: 350,
	SearchPlayerCommand: 351,
	AddFriendReqCommand: 352,
	AckFriendReq: 353,
	InviteJoinRoomReq: 354,
	InviteJoinRoomInform: 355,
	AddFriendInform: 356,
	AckFriendInform: 357,
	DeleteFriendCommand: 358,
	DeleteFriendInform: 359,
	GetMsgTipCommand: 370,
	GetNoticeCommand: 371,
	BroadcastPost: 372,
	BankTakeGold: 400,
	BankSaveGold: 401,
	BindCardNumber: 402,
	UnbindCardNumber: 403,
	GetGoldRank: 500,
	RechargeNotify: 600,
	Recharge: 601,
	GetCash: 602,
	QueryPlayerName: 700,
	BaccaratGetAllRoomData: 1e3,
	BaccaratSyncSendCard: 1001,
	BaccaratBet: 1002,
	BaccaratSyncOnBet: 1003,
	BaccaratSyncUserPut: 1004,
	BaccaratSyncGameResult: 1005,
	BaccaratSeat: 1006,
	BaccaratSyncOnSeat: 1007,
	BaccaratApplyBanker: 1008,
	BaccaratSyncBankerListChange: 1009,
	BaccaratSyncOnBanker: 1010,
	BaccaratChat: 1011,
	BaccaratSyncOnChat: 1012,
	BaccaratGetRoundRecord: 1013,
	BaccaratRemoveBet: 1014,
	BaccaratSyncOnRemoveBet: 1015,
	BaccaratSyncMark: 101555,
	BaccaratGetOldRoom: 1016,
	BaccaratSyncBankerNotice: 1017,
	BaccaratSyncSendCardJM: 1018,
	BaccaratLookCardJM: 1019,
	BaccaratSyncLookCardJM: 1020,
	BaccaratSyncLookCardEndJM: 1021,
	BaccaratChangeDirJM: 1022,
	BaccaratSyncChangeDirJM: 1023,
	BaccaratLookSoundJM: 1024,
	BaccaratSyncLookSoundJM: 1025,
	BaccaratSyncRoomEnd: 1026,
	BaccaratFlyCardJM: 1027,
	BaccaratSyncFlyCardJM: 1028,
	BaccaratOpenCardJM: 1029,
	BaccaratOpenCardEXTJM:10299,
	BaccaratOpenCardOpenJM:102999,
	BaccaratSyncShuffleCards: 1030,
	BaccaratConfirmBet: 1031,
	BaccaratSyncConfirmBet: 1032,
	BaccaratAutoSeat: 1033,
	BaccaratSyncOtherConfirmBet: 1034,
	BaccaratSyncShuffleStart: 1035,
	BaccaratShuffleEnd: 1036,
	BaccaratSyncShuffleEnd: 1037,
	BaccaratDismissRoom: 1038,
	BaccaratSVIPApply: 1100,
	BaccaratPresent: 1101,
	MaJiangGetOldRoom: 1500,
	TipRoomDismissVote: 2011,
	TipAction: 2012,
	TipExchange: 2013,
	TipLackChoice: 2014,
	TipPeng: 2015,
	TipGang: 2016,
	TipHu: 2017,
	TipTing: 2018,
	TipDiscard: 2019,
	TipFinish: 2020,
	TipChi: 2021,
	TipGaSelect: 2022,
	ActionTurn: 2041,
	ActDispatchCard: 2042,
	ActExchange: 2043,
	ActCardRefresh: 2044,
	ActDice: 2045,
	ActDiscard: 2046,
	ActPeng: 2047,
	ActGang: 2048,
	ActHu: 2049,
	ActDraw: 2050,
	ActLackChoice: 2051,
	ActShowHand: 2052,
	ActCallTing: 2053,
	ActMultiPao: 2054,
	ActShowHua: 2055,
	ActChi: 2056,
	ActGaSelect: 2057,
	ActHainanDraw: 2058,
	ActBuHua: 2059,
	PrimExchange: 2100,
	PrimLackChoice: 2102,
	PrimDiscard: 2103,
	PrimKick: 2107,
	PrimReady: 2108,
	PrimChat: 2109,
	PrimSort: 2110,
	PrimIsMatchGhost: 2111,
	PrimCallTing: 2112,
	PrimDismiss: 2113,
	PrimAutoSort: 2114,
	PrimGa: 2115,
	PrimChi: 2116,
	SyncMJRoomCoin: 2200,
	MJGetRoomRecord: 2201,
	StartDismissVote: 2202,
	SyncRoomDismissVote: 2203,
	SyncTingList: 2204
});
gbx.define("gbx/net/messagecommand_des", {
	1: "登录",
	2: "设置用户信息",
	3: "心跳",
	4: "踢人下线",
	5: "获取用户信息",
	10: "开房间",
	11: "加入房间",
	12: "退出房间",
	13: "玩家在房间中确认就位，并获取当前房间状态数据(SyncRequest)",
	14: "加入房间之前，获取房间基本信息",
	20: "获取绑定手机时候的短信验证码",
	21: "使用验证码进行验证绑定",
	25: "麻将绑定代理",
	110: "同步，玩家加入房间",
	111: "一轮开局，同步消息",
	112: "同步，错误消息",
	113: "同步，玩家退出房间",
	114: "同步，一轮结束",
	115: "同步(麻将)玩家准备确认状态",
	116: "房间聊天",
	117: "强迫玩家离开房间，比如踢人",
	118: "房间心跳消息",
	119: "房间心跳服务器回应",
	120: "玩家掉线消息",
	200: "返利，查询上下线",
	201: "返利，创建上下线",
	202: "返利，删除上下线",
	203: "返利，创建，修改用户返利信息",
	204: "返利，百家乐，领取返利",
	205: "返利，百家乐，基础信息",
	300: "获取邮件列表",
	301: "打开邮件",
	302: "删除邮件",
	303: "领取邮件附件",
	304: "领取所有邮件附件",
	320: "设置用户信息(头像、性别、昵称，等等)",
	321: "玩家信息改变通知",
	322: "获取麻将统计信息",
	323: "获取麻将创建房间价格表",
	324: "获取麻将充值物品表",
	350: "获取好友列表",
	351: "搜索用户",
	352: "添加好友请求",
	353: "确认好友申请(接收、拒绝)",
	354: "邀请加入房间的请求",
	355: "服务器向客户端推送的邀请加入房间消息",
	356: "被添加好友请求推送",
	357: "申请被对方通过，自己会收到通知",
	358: "删除好友",
	359: "删除好友的通知",
	370: "获取提示消息",
	371: "获取公告消息",
	372: "广播推送",
	400: "银行取钱",
	401: "银行存钱",
	402: "绑定银行卡",
	403: "解绑银行卡",
	500: "获取金币排行榜",
	600: "充值通知客户端",
	601: "充值",
	602: "提现",
	700: "查询玩家名字",
	1000: "百家乐，获取所有房间信息",
	1001: "百家乐，发牌",
	1002: "百家乐，下注(玩家操作)",
	1003: "百家乐，下注",
	1004: "百家乐，进入userPut状态",
	1005: "百家乐，每局结算",
	1006: "百家乐，座位(玩家操作)",
	1007: "百家乐，座位",
	1008: "百家乐，申请上庄(玩家操作)",
	1009: "百家乐，等待上庄列表变化",
	1010: "百家乐，庄家变化",
	1011: "百家乐，聊天(玩家操作)",
	1012: "百家乐，聊天",
	1013: "百家乐，获取每局记录",
	1014: "百家乐，撤销下注(玩家操作)",
	1015: "百家乐，撤销下注",
	1016: "百家乐，获取没结算的老房间",
	1017: "百家乐，上下庄反馈",
	1018: "百家乐，竞咪厅发牌",
	1019: "百家乐，竞咪厅咪牌(玩家操作)",
	1020: "百家乐，竞咪厅咪牌",
	1021: "百家乐，竞咪厅咪牌阶段结束",
	1022: "百家乐，竞咪厅变换咪牌方向(玩家操作)",
	1023: "百家乐，竞咪厅变换咪牌方向",
	1024: "百家乐，竞咪厅咪牌声音(玩家操作)",
	1025: "百家乐，竞咪厅咪牌声音",
	1026: "百家乐，房间关闭通知",
	1027: "百家乐，竞咪厅飞牌(玩家操作)",
	1028: "百家乐，竞咪厅飞牌",
	1029: "百家乐，竞咪厅翻牌(玩家操作)",
	1030: "百家乐，洗牌",
	1031: "百家乐，下注确认(玩家操作)",
	1032: "百家乐，下注确认",
	1033: "百家乐，自动上座(玩家操作)",
	1034: "百家乐，有人确认下注",
	1035: "百家乐，洗牌开始",
	1036: "百家乐，洗牌结束(玩家操作)",
	1037: "百家乐，洗牌结束",
	1038: "百家乐，解散房间",
	1100: "百家乐，申请SVIP",
	1101: "百家乐，赠送",
	1500: "麻将，获取正在玩的房间,掉线玩家重新进房间使用",
	2011: "提示解散房间选举开始",
	2012: "提示操作，等待输入开始",
	2013: "换牌提示",
	2014: "提示选缺",
	2015: "提示碰",
	2016: "提示杠",
	2017: "提示胡",
	2018: "听牌提示",
	2019: "提示出牌",
	2020: "等待输入结束",
	2021: "吃牌提示",
	2022: "提示选嘎",
	2041: "动作方位指示和时间倒数",
	2042: "发牌",
	2043: "换牌动作",
	2044: "刷新(手牌、面板、胡牌列表)",
	2045: "掷骰子",
	2046: "出牌动作",
	2047: "碰",
	2048: "杠",
	2049: "胡",
	2050: "摸牌",
	2051: "选缺",
	2052: "牌局结束，亮牌",
	2053: "报叫动作",
	2054: "一炮多响",
	2055: "海南麻将，将手牌中的花牌亮到面板中",
	2056: "海南麻将，吃",
	2057: "选嘎",
	2058: "海南麻将摸牌，可能要补花，要一次摸多张",
	2059: "补花到手牌",
	2100: "换牌选牌",
	2102: "选缺输入",
	2103: "出牌输入",
	2107: "房主踢人",
	2108: "确认准备",
	2109: "聊天输入",
	2110: "聊天输入",
	2111: "是否显示贴鬼碰杠",
	2112: "报叫",
	2113: "投票确认房间解散",
	2114: "恢复自动齐牌",
	2115: "海南麻将，选嘎",
	2116: "海南麻将，吃牌",
	2200: "麻将，同步刷新所有人的房间币",
	2201: "获取麻将房间记录",
	2202: "发起解散房间投票",
	2203: "解散房间投票结果同步",
	2204: "麻将,向玩家同步当前听牌状态"
});
gbx.define("gbx/net/msg_receiver", ["gbx/net/messagecommand", "gbx/net/messagecommand_des", "gbx/net/errorcode", "gbx/net/errorcode_des", "gbx/net/check_code", "gbx/hubs", "comm/ui/top_message", "game/baccarat/net/msg_receiver", "comm/net/msg_receiver"], function(CMD, CMD_DES, ERROR_CODE, ERROR_CODE_DES, checkErrorCode, hubs, topMessage, baccaratMsgReceiver, systemReceiver) {
	var msgReceiver = {
		_handlerMap: {},
		init: function() {
			this.registerHandler(CMD.BaccaratSyncSendCard, baccaratMsgReceiver, baccaratMsgReceiver.onSendCard);
			this.registerHandler(CMD.BaccaratSyncOnBet, baccaratMsgReceiver, baccaratMsgReceiver.onUserBet);
			this.registerHandler(CMD.BaccaratSyncOnRemoveBet, baccaratMsgReceiver, baccaratMsgReceiver.onRemoveBet);
			this.registerHandler(CMD.BaccaratSyncMark, baccaratMsgReceiver, baccaratMsgReceiver.onMark);
			this.registerHandler(CMD.BaccaratSyncUserPut, baccaratMsgReceiver, baccaratMsgReceiver.onNewRound);
			this.registerHandler(CMD.BaccaratSyncSitDown, baccaratMsgReceiver, baccaratMsgReceiver.onSitDown);
			this.registerHandler(CMD.BaccaratSyncGameResult, baccaratMsgReceiver, baccaratMsgReceiver.onRoundResult);
			this.registerHandler(CMD.BaccaratSyncOnSeat, baccaratMsgReceiver, baccaratMsgReceiver.onShowedSeatChanged);
			this.registerHandler(CMD.BaccaratSyncOnBanker, baccaratMsgReceiver, baccaratMsgReceiver.onDealerChanged);
			this.registerHandler(CMD.BaccaratSyncBankerListChange, baccaratMsgReceiver, baccaratMsgReceiver.onDealerListChanged);
			this.registerHandler(CMD.BaccaratSyncBankerNotice, baccaratMsgReceiver, baccaratMsgReceiver.onDealerNotice);
			this.registerHandler(CMD.SyncPlayerJoinRoom, baccaratMsgReceiver, baccaratMsgReceiver.onPlayerJoinRoom);
			this.registerHandler(CMD.SyncPlayerQuitRoom, baccaratMsgReceiver, baccaratMsgReceiver.onPlayerQuitRoom);
			this.registerHandler(CMD.BaccaratSyncOnChat, baccaratMsgReceiver, baccaratMsgReceiver.onChat);
			this.registerHandler(CMD.BaccaratSyncSendCardJM, baccaratMsgReceiver, baccaratMsgReceiver.onSendCardJM);
			this.registerHandler(CMD.BaccaratSyncLookCardJM, baccaratMsgReceiver, baccaratMsgReceiver.onUpdateCardFlipProcess);
			this.registerHandler(CMD.BaccaratOpenCardJM, baccaratMsgReceiver, baccaratMsgReceiver.onSyncOpenCardJM);
			this.registerHandler(CMD.BaccaratOpenCardEXTJM, baccaratMsgReceiver, baccaratMsgReceiver.onSyncOpenCardEXTJM);
			this.registerHandler(CMD.BaccaratOpenCardOpenJM, baccaratMsgReceiver, baccaratMsgReceiver.onSyncOpenCardOpenJM);
			this.registerHandler(CMD.BaccaratSyncLookCardEndJM, baccaratMsgReceiver, baccaratMsgReceiver.onSyncLookCardEndJM);
			this.registerHandler(CMD.BaccaratSyncChangeDirJM, baccaratMsgReceiver, baccaratMsgReceiver.onSyncChangeDirJM);
			this.registerHandler(CMD.BaccaratSyncLookSoundJM, baccaratMsgReceiver, baccaratMsgReceiver.onSyncMiLookSound);
			this.registerHandler(CMD.BaccaratSyncShuffleStart, baccaratMsgReceiver, baccaratMsgReceiver.onShuffleStart);
			this.registerHandler(CMD.BaccaratSyncShuffleEnd, baccaratMsgReceiver, baccaratMsgReceiver.onSyncShuffleEnd);
			this.registerHandler(CMD.BaccaratSyncConfirmBet, baccaratMsgReceiver, baccaratMsgReceiver.onSyncConfirmBet);
			this.registerHandler(CMD.BaccaratSyncOtherConfirmBet, baccaratMsgReceiver, baccaratMsgReceiver.onSyncOtherConfirmBet);
			this.registerHandler(CMD.BaccaratSyncFlyCardJM, baccaratMsgReceiver, baccaratMsgReceiver.onSyncFlyCardJM);
			this.registerHandler(CMD.PlayerInfoChanged, systemReceiver, systemReceiver.onPlayerInfoChange);
			this.registerHandler(CMD.RechargeNotify, systemReceiver, systemReceiver.onPay);
			this.registerHandler(CMD.SyncHeartBeatAck, systemReceiver, systemReceiver.onHeartbeat);
			this.registerHandler(CMD.NetBeKickedCommand, systemReceiver, systemReceiver.onKicked);
			this.registerHandler(CMD.BaccaratSyncRoomEnd, baccaratMsgReceiver, baccaratMsgReceiver.vipRoomEnd);
		},
		registerHandler: function(command, caller, handler) {
			this._handlerMap[command] = {
				caller: caller,
				handler: handler
			};
		},
		checkMessage: function(message) {
			//if (message.cmd != CMD.SyncHeartBeatAck) gbx.log("%c[net] receive message " + message.cmd + " " + CMD_DES[message.cmd.toString()], "color:blue");
			if (message.errorCode == ERROR_CODE.Disconnect) {
				hubs.publish("global.net_connect.disconnected", gtea.net.DISCONNECT_REASON_COMMAND);
				return false;
			}
			if (message.errorCode != 0) {
				var ret = checkErrorCode.checkErrorCode(message.errorCode);
				if (!ret) {
					topMessage.post(ERROR_CODE_DES[message.errorCode.toString()]);
				}
				return false;
			}
			if (message.cmd == CMD.SyncError) {
				var msgData = gtea.protobuf.decode("ErrorMessage", message.data);
				topMessage.post(ERROR_CODE_DES[msgData.errorCode.toString()]);
				return false;
			}
			return true;
		},
		onMessage: function(command, data) {
			if (command in this._handlerMap) {
				var handlerInfo = this._handlerMap[command];
				handlerInfo.handler.call(handlerInfo.caller, command, data);
			} else {
				//gbx.log("%c[net] receive message has not handler:" + command, "color:blue")
			}
		}
	};
	msgReceiver.init();
	gtea.net.NetMsgMgr.setMsgReceiver(msgReceiver);
	return msgReceiver;
});
gbx.define("gbx/net/net_tool", ["comm/ui/top_message", "conf/locallization", "gbx/net/errorcode", "gbx/net/errorcode_des", "comm/helper/account_mgr", "conf/platform"], function(topMessage, Locallization, ERROR_CODE, ERROR_CODE_DES, accountMgr, Platform) {
	var gamePaths = {
		getServerInfo: "http://user.vipva.net/index.php/"
	};
	return {
		createHttpRequest: function(path, sendMsg, caller, funSuccess, funFail, showError) {
			var isFirst = true;
			var param="";
			for(var key in sendMsg){
				if(isFirst){
					param += key+"="+sendMsg[key];
					isFirst=false;
				}else{
					param += "&"+key+"="+sendMsg[key];
				}
			}
			var request = new XMLHttpRequest;
			var requestURL = gamePaths.getServerInfo+path;
			request.open("POST", requestURL,true);
			request.setRequestHeader("Content-type","application/x-www-form-urlencoded");
			request.onreadystatechange = function() {
				if (request.readyState == 4) {
					if (request.status == 200) {
						if (funSuccess) funSuccess.call(caller, request);
					} else {
						if (showError === undefined) {
							topMessage.post(Locallization.requestError + " status " + request.status);
						} else {
							if (showError) topMessage.post(Locallization.requestError + " status " + request.status);
						}
						if (funFail) funFail.call(caller, request.status);
					}
				}
			};
			console.log("请求地址:"+requestURL+",参数:"+param);
			request.send(param);
		},
		createJsonHttpRequest: function(path, sendMsg, caller, funSuccess, funFail) {
			var request = new XMLHttpRequest;
			request.open("POST", path, true);
			request.onreadystatechange = function() {
				if (request.readyState == 4) {
					if (request.status == 200) {
						var res = request.response;
						if (funSuccess) funSuccess.call(caller, res);
					} else {
						topMessage.post(Locallization.requestError + " status " + request.status);
						if (funFail) funFail.call(caller, request.status);
					}
				}
			};
			request.send(sendMsg);
		},
		pushPath: function(key, value) {
			gamePaths[key] = value;
		},
		getPathByKey: function(key) {
			return gamePaths[key];
		},
		getSalt: function(caller, successEv, failEv, wrapCaller, wrapSuccess, warpFail) {
			var userData = accountMgr.getUserData();
			var sendMsg = gtea.protobuf.encode("GetSaltReq", {
				account: userData.account,
				platformId: Platform.platformId
			});
			this.createHttpRequest(this.getPathByKey("getSaltUrl"), sendMsg, this, function(data) {
				var ret = gtea.protobuf.decode("GetSaltResp", data);
				if (ret.result == ERROR_CODE.OK) {
					if (successEv) successEv.call(caller, ret);
					if (wrapSuccess) wrapSuccess.call(wrapCaller, ret);
				} else {
					if (failEv) failEv.call(caller, ret.result);
					if (warpFail) warpFail.call(wrapCaller, ERROR_CODE_DES[ret.result]);
				}
			}, function(status) {
				if (failEv) failEv.call(caller, status);
				if (warpFail) warpFail.call(wrapCaller, Locallization.saltCodeError + " status " + status);
			});
		},
		getVerifyCode: function(sType, caller, successEv, failEv,phoneNum) {
			this.createHttpRequest(sType, {appid:1002,gamever:1316,pfid:5,token:0,phone:phoneNum,stype:"register"}, this, function(ret) {
				//var ret = gtea.protobuf.decode("SMSGetAuthCodeResp", data);
				if (ret.statusText == "OK") {
					if (successEv) successEv.call(caller, ret.response);
				} else {
					if (failEv) failEv.call(caller, null, "获取手机验证码失败");
				}
			}, function(status) {
				if (failEv) failEv.call(caller, status, 0);
			});
		},
		createObjFromProto: function(proto) {
			var obj = {};
			var proNames = Object.getOwnPropertyNames(proto);
			for (var i in proNames) {
				var proName = proNames[i];
				obj[proName] = proto[proName];
			}
			return obj;
		}
	};
});