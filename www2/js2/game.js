(function () {
	var _$bindid_ = 0;
	var $__classmap__ = window.$__classmap__ = [];
	$__classmap__["Object"] = Object;
	$__classmap__["Function"] = Function;
	$__classmap__["Array"] = Array;
	$__classmap__["String"] = String;
	var _$extend_ = _$extend_ ||
		function (d, b) {
			d.$set_get = $$_copy_(d.$set_get || {}, b.$set_get);
			for (var p in b) {
				if (p != "$set_get" && Object.hasOwnProperty.call(b, p)) d[p] = b[p];
			}

			function __() {
				this.constructor = d;
			}
			__.prototype = b.prototype;
			d.prototype = new __;
			d.prototype.__implements__ = $$_copy_({}, b.prototype.__implements__);
		};

	function $typeof(o, name) {
		return o && (o.__implements__ && o.__implements__[name] || o.__class__ == name);
	}

	function $isClass(o) {
		return o.__isclass__ || o == Object || o == String || o == Array;
	}

	function $$_copy_(dec, src) {
		if (!src) return null;
		dec = dec || {};
		for (var i in src) dec[i] = src[i];
		return dec;
	}

	function $implements(dec, src) {
		dec.__implements__ = $$_copy_(dec.__implements__, src);
	}

	function $def_getset_(o, bStatic, name, set_get) {
		set_get.enumerable = set_get.configurable = true;
		o.$set_get = o.$set_get || {};
		o.$set_get[(bStatic ? "-" : "") + name] = set_get;
		if (!set_get.get) set_get.get = function () { };
		if (!set_get.set) set_get.set = function () { };
		Object.defineProperty(bStatic ? o : o.prototype, name, set_get);
	}

	function $classHasOwnProperty(name, o) {
		if (Object.hasOwnProperty.call(o.prototype, name)) return true;
		return o.prototype.__super__ == null ? null : $classHasOwnProperty(name, o.prototype.__super__);
	}

	function $hasOwnProperty(name, o) {
		o = o || this;
		return Object.hasOwnProperty.call(o, name) || $classHasOwnProperty(name, o.__class__);
	}

	function $InitClass(o, fullName, chgHasOwnProperty, _super) {
		_super && _$extend_(o, _super);
		$__classmap__[fullName] = o;
		_super && (o.prototype.__super__ = _super);
		chgHasOwnProperty && (o.prototype.hasOwnProperty = $hasOwnProperty);
		o.prototype.__class__ = o;
		o.prototype.__className__ = fullName;
		o.__className__ = fullName;
		o.__isclass__ = true;
	}

	function $getset_get(o, name) {
		return o && (o = o.$set_get) && (o = o[name]) ? o.get : null;
	}

	function $getset_set(o, name) {
		return o && (o = o.$set_get) && (o = o[name]) ? o.set : null;
	}

	function $set(o, name, value) {
		o.$set_get[name].set.call(o, value);
	}

	function $get(o, name) {
		return o.$set_get[name].get.call(o);
	}

	function $nullfunc() { }

	function __INIT__(_class) {
		_class.__$INIT__ && _class.__$INIT__();
		return __INIT__;
	}

	function createpackage(className) {
		var strs = className.split(".");
		var p = window;
		for (var i = 0, sz = strs.length; i < sz; i++) {
			var n = strs[i];
			p = p[n] ? p[n] : p[n] = {};
		}
	}
	createpackage("gtea.utils");
	createpackage("gtea.math");
	createpackage("gtea.events");
	createpackage("gtea.net");
	createpackage("gtea.rpc");
	createpackage("gtea.protobuf");
	gtea.utils.toUnicode = function (str) {
		var res = [], len = str.length;
		for (var i = 0; i < len; ++i) {
			res[i] = ("00" + str.charCodeAt(i).toString(16)).slice(-4);
		}
		return str ? "\\u" + res.join("\\u") : "";
	};
	gtea.utils.trace = window.gbx == null ?
		function () { } : function (s, p) {
			gbx.log(s, p);
		};
	gtea.utils.bind = function (o, m) {
		if (m == null) return null;
		if (m.__$BiD___ == null) m.__$BiD___ = _$bindid_++;
		var f;
		if (o.$GTEA__closures__ == null) o.$GTEA__closures__ = {};
		else f = o.$GTEA__closures__[m.__$BiD___];
		if (f == null) {
			f = function () {
				return f.method.apply(f.scope, arguments);
			};
			f.scope = o;
			f.method = m;
			o.$GTEA__closures__[m.__$BiD___] = f;
		}
		return f;
	};
	var ProtobufConverter = gtea.net.ProtobufConverter = function () {
		function ProtobufConverter() {
			Event.__$INIT__();
			this._proto = null;
			this._basePath = "assets/myproto/";
			this._protoLib = {};
			this._cmd2msg = {};
			this._cmd2oldCmd = {};
			this._oldCmd2cmd = {};
		}
		$InitClass(ProtobufConverter, "gtea.net.ProtobufConverter", true);
		var __proto__ = ProtobufConverter.prototype;
		//设置新老callback转换,没有考虑风里多个主动回调,因为当前项目没有这个需求
		__proto__.setCallback = function (oldCmd, mainCmd, subCmd, msgName) {
			this._cmd2msg[mainCmd + "_" + subCmd] = msgName;
			this._cmd2oldCmd[mainCmd + "_" + subCmd] = oldCmd;
			this._oldCmd2cmd[oldCmd] = mainCmd + "_" + subCmd;
		};

		__proto__.oldCmd2cmd = function (oldCmd) {
			return this._oldCmd2cmd[oldCmd];
		};

		__proto__.cmd2oldCmd = function (mainCmd, subCmd) {
			return this._cmd2oldCmd[mainCmd + "_" + subCmd];
		};

		__proto__.cmd2msg = function (mainCmd, subCmd) {
			return this._cmd2msg[mainCmd + "_" + subCmd];
		};
		__proto__.addProtoAsync = function (protoName) {
			var protoFileName = this._basePath + protoName;
			var protobufConverter = this;
			Laya.loader.load(protoFileName, Laya.Handler.create(this, function (data) {
				var proto = dcodeIO.ProtoBuf.loadProto(data);
				protobufConverter._protoLib[protoName] = proto;
				//protobufConverter._proto = proto
			}));
		};
		__proto__.encode = function (messageName, content, maincmd, subcmd) {
			var proto = null;
			var bytes = null;
			if (messageName != undefined) {
				for (var key in this._protoLib) {
					proto = this._protoLib[key];
					var willBreak = false;
					var child = proto.ns.children[0].children;
					for (var i = 0; i < child.length; i++) {
						if (child[i].name == messageName) {
							willBreak = true;
							break;
						}
					}
					if (willBreak) {
						break;
					}
				}
			}
			if (proto == null) {

			} else {
				this._proto = proto;
				var messageBuilder = this._proto.build("message." + messageName);
				if (messageBuilder == null) {
					console.log("===========proto error:" + messageName);
					return;
				} else {
					bytes = messageBuilder.encode(content).toBuffer();
				}
			}
			bytes = enPackets(maincmd, subcmd, bytes);
			//测试成功
			//var result = parsePackets(bytes)
			//result = messageBuilder.decode(result[2]);
			return bytes;
		};
		__proto__.decode = function (messageName, bytes) {
			var result = parsePackets(bytes);
			var proto = null;
			messageName = ProtobufConverter.getInstance().cmd2msg(result[0], result[1]);
			if (messageName == undefined) {

			} else {
				for (var key in this._protoLib) {
					proto = this._protoLib[key];
					var willBreak = false;
					var child = proto.ns.children[0].children;
					for (var i = 0; i < child.length; i++) {
						if (child[i].name == messageName) {
							willBreak = true;
							break;
						}
					}
					if (willBreak) {
						break;
					}
				}
			}
			if (proto == null) {

			} else {
				this._proto = proto;
				var messageBuilder = this._proto.build("message." + messageName);
				result[2] = messageBuilder.decode(result[2]);
			}
			var cmd = ProtobufConverter.getInstance().cmd2oldCmd(result[0], result[1]);
			if (cmd == undefined) {
				if (result[0] != 1000 || result[1] != 1) {
					console.log("命令:" + result[0] + "," + result[1] + ",没有后续回调", result[2]);
				}
			} else {
				result[3] = cmd;
			}
			return result;
		};
		ProtobufConverter.getInstance = function () {
			if (ProtobufConverter.s_Instance == null) ProtobufConverter.s_Instance = new ProtobufConverter;
			return ProtobufConverter.s_Instance;
		};
		ProtobufConverter.addProtoAsync = function (protoName) {
			ProtobufConverter.getInstance().addProtoAsync(protoName);
		};
		ProtobufConverter.encode = function (messageName, content) {
			return ProtobufConverter.getInstance().encode(messageName, content);
		};
		ProtobufConverter.decode = function (messageName, content) {
			return ProtobufConverter.getInstance().decode(messageName, content);
		};
		ProtobufConverter.__$INIT__ = function () {
			this.__$INIT__ = $nullfunc;
		};
		return ProtobufConverter;
	}();
	gtea.protobuf.addProtoAsync = function (protoName) {
		return ProtobufConverter.getInstance().addProtoAsync(protoName);
	};
	gtea.protobuf.encode = function (messageName, content, maincmd, subcmd) {
		if (maincmd == undefined || subcmd == undefined) {
			console.log("发送一个错误包," + messageName);
		} else if (maincmd != 1000 || subcmd != 1) {
			gbx.log("发包:" + (new Date()).toLocaleTimeString() + ",[" + maincmd + "," + subcmd + "]");
			gbx.log(content);
		}
		return ProtobufConverter.getInstance().encode(messageName, content, maincmd, subcmd);
	};
	gtea.protobuf.decode = function (messageName, content) {
		return ProtobufConverter.getInstance().decode(messageName, content);
	};
	var Event = gtea.events.Event = function () {
		function Event(t, agv) {
			Event.__$INIT__();
			this._type_ = t;
			this._agv_ = agv;
		}
		$InitClass(Event, "gtea.events.Event", true);
		var __proto__ = Event.prototype;
		__proto__.attachDispatcher = function (value) {
			this._dispatcher_ = value;
		};
		$def_getset_(Event, false, "type", {
			get: function () {
				return this._type_;
			}
		});
		$def_getset_(Event, false, "dispatcher", {
			get: function () {
				return this._dispatcher_;
			}
		});
		$def_getset_(Event, false, "agv", {
			get: function () {
				return this._agv_;
			}
		});
		Event.__$INIT__ = function () {
			this.__$INIT__ = $nullfunc;
		};
		return Event;
	}();
	var EventDispatcher = gtea.events.EventDispatcher = function () {
		function EventDispatcher() {
			EventDispatcher.__$INIT__();
			this._dispatching_ = false;
		}
		$InitClass(EventDispatcher, "gtea.events.EventDispatcher", true);
		var __proto__ = EventDispatcher.prototype;
		__proto__.addEventListener = function (type, listener, func) {
			if (listener == null || func == null) return null;
			if (this._eventListener_ == null) this._eventListener_ = [];
			var eobj = new Object;
			eobj.listener = gtea.utils.bind(listener, func);
			eobj._deleted_ = false;
			var thisType = this._eventListener_[type];
			if (!thisType) thisType = this._eventListener_[type] = [];
			else {
				if (thisType.length > 0) {
					for (var i = 0, sz = thisType.length; i < sz; i++) {
						if (thisType[i].listener == eobj.listener) return thisType[i];
					}
				}
			}
			thisType.push(eobj);
			return eobj;
		};
		__proto__.dispatchEvent = function (event) {
			if (this._eventListener_ == null) return false;
			var thisType = this._eventListener_[event.type];
			if (!thisType) return false;
			event.attachDispatcher(this);
			this._dispatching_ = true;
			for (var i = 0, sz = thisType.length; i < sz; i++) {
				var oe = thisType[i];
				if (!oe._deleted_) oe.listener(event);
			}
			this._dispatching_ = false;
			var needgc = false;
			for (i = 0, sz = thisType.length; i < sz; i++) {
				var oe = thisType[i];
				if (oe._deleted_) {
					needgc = true;
					break;
				}
			}
			if (needgc) this.__GCListener__(event.type);
			return true;
		};
		__proto__.hasEventListener = function (type) {
			return this._eventListener_ && this._eventListener_[type] != null && this._eventListener_[type].length > 0;
		};
		__proto__.removeEventListener = function (type, listener, func) {
			var thisType;
			if (this._eventListener_ != null && (thisType = this._eventListener_[type])) {
				var listener = gtea.utils.bind(listener, func);
				var needgc = false;
				for (var i = 0, sz = thisType.length; i < sz; i++) {
					var oe = thisType[i];
					if (oe.listener == listener) {
						needgc = !oe._deleted_;
						oe._deleted_ = true;
						break;
					}
				}
				if (needgc && !this._dispatching_) this.__GCListener__(type);
			}
		};
		__proto__.removeAllEventListener = function () {
			this._eventListener_ = null;
		};
		__proto__.__GCListener__ = function (type) {
			var thisType = this._eventListener_[type];
			if (!thisType) return false;
			var tsz = [];
			for (var i = 0, sz = thisType.length; i < sz; i++) {
				var oe = thisType[i];
				if (!oe._deleted_) tsz.push(oe);
			}
			if (tsz.length == 0) this._eventListener_[type] = null;
			else this._eventListener_[type] = tsz;
		};
		EventDispatcher.__$INIT__ = function () {
			this.__$INIT__ = $nullfunc;
		};
		return EventDispatcher;
	}();
	gtea.net.SOCKET_STATUS_DISCONNECTED = 0;
	gtea.net.SOCKET_STATUS_CONNECTED = 1;
	gtea.net.PACKET_TYPE_REQUESTRESPONSE = 1;
	gtea.net.PACKET_TYPE_SERVERINFORM = 2;
	gtea.net.PACKET_TYPE_FORWARD = 3;
	gtea.net.PACKET_TYPE_REPORT = 4;
	gtea.net.PACKET_TYPE_SYNC = 5;
	gtea.net.PACKET_TYPE_IPC = 6;
	gtea.net.PACKET_TYPE_IPCREQUEST = 7;
	gtea.net.PACKET_TYPE_IPCRESPONSE = 8;
	gtea.net.PACKET_TYPE_SYNCREQUEST = 9;
	gtea.net.DISCONNECT_REASON_SOCKET = 1;
	gtea.net.DISCONNECT_REASON_REQUEST = 2;
	gtea.net.DISCONNECT_REASON_HEARTBEAT = 3;
	gtea.net.DISCONNECT_REASON_COMMAND = 4;
	gtea.net.DISCONNECT_REASON_TOROOM = 5;
	gtea.net.LOGIN_TYPE_NORMAL = 1;
	gtea.net.LOGIN_TYPE_RELOGIN = 2;
	gtea.net.LOGIN_TYPE_TOROOM = 3;
	gtea.net.TIME_OUT = 15e3;
	gtea.net.Socket = function (_super) {
		function Socket() {
			Socket.__$INIT__();
			_super.call(this);
			this.m_socket = null;
			this.m_status = gtea.net.SOCKET_STATUS_DISCONNECTED;
		}
		$InitClass(Socket, "gtea.net.Socket", true, _super);
		var __proto__ = Socket.prototype;
		__proto__.connect = function (host, port) {
			if (this.m_socket != null) this.close();
			if (port < 0 || port > 65535) return false;
			var url = "ws://" + host + ":" + port + "/ws/client";
			this.m_socket = new WebSocket(url);
			this.m_socket.binaryType = "arraybuffer";
			this.m_socket.onopen = gtea.utils.bind(this, this.onOpenHandler);
			this.m_socket.onmessage = gtea.utils.bind(this, this.onMessageHandler);
			this.m_socket.onclose = gtea.utils.bind(this, this.onCloseHandler);
			this.m_socket.onerror = gtea.utils.bind(this, this.onErrorHandler);
		};
		__proto__.onOpenHandler = function (__args) {
			this.m_status = gtea.net.SOCKET_STATUS_CONNECTED;
			var evt = new Event("connect", {});
			evt.attachDispatcher(this);
			this.dispatchEvent(evt);
		};
		__proto__.onMessageHandler = function (msg) {
			NetMsgMgr.getInstance().recvMsg(msg.data);
		};
		__proto__.onCloseHandler = function (__args) {
			this.m_status = gtea.net.SOCKET_STATUS_DISCONNECTED;
			var evt = new Event("close", {});
			evt.attachDispatcher(this);
			this.dispatchEvent(evt);
		};
		__proto__.onErrorHandler = function (__args) {
			this.m_status = gtea.net.SOCKET_STATUS_DISCONNECTED;
			var evt = new Event("error", {});
			evt.attachDispatcher(this);
			this.dispatchEvent(evt);
		};
		__proto__.send = function (msg) {
			this.m_socket.send(msg);
		};
		__proto__.close = function () {
			this.m_status = gtea.net.SOCKET_STATUS_DISCONNECTED;
			if (this.m_socket != null) {
				try {
					this.m_socket.close();
				} catch (e) { }
				this.m_socket = null;
			}
		};
		$def_getset_(Socket, false, "connected", {
			get: function () {
				return this.m_status == gtea.net.SOCKET_STATUS_CONNECTED;
			}
		});
		Socket.__$INIT__ = function () {
			this.__$INIT__ = $nullfunc;
		};
		return Socket;
	}(gtea.events.EventDispatcher);
	var RPCSession = gtea.net.RPCSession = function () {
		function RPCSession(requestId, callbackObj, msg, outTime) {
			RPCSession.__$INIT__();
			this.m_nRequestId = requestId;
			this.m_callbackObj = callbackObj;
			this.m_callTime = Date.now();
			this.m_outTime = outTime;
		}
		$InitClass(RPCSession, "gtea.net.RPCSession", true);
		var __proto__ = RPCSession.prototype;
		__proto__.isTimeOut = function (now) {
			if (this.m_outTime == -1) return false;
			var time = now - this.m_callTime;
			if (time > this.m_outTime) return true;
			return false;
		};
		__proto__.callback = function (errorCode, data) {
			if (this.m_callbackObj != null) this.m_callbackObj(errorCode, data);
		};
		RPCSession.__$INIT__ = function () {
			this.__$INIT__ = $nullfunc;
		};
		return RPCSession;
	}();
	var RPC = gtea.net.RPC = function () {
		function RPC() {
			RPC.__$INIT__();
			this.m_szSession = [];
			this._timer = setInterval(gtea.utils.bind(this, this.onTimer), 1e3);
		}
		$InitClass(RPC, "gtea.net.RPCMgr", true);
		var __proto__ = RPC.prototype;
		__proto__.onTimer = function () {
			var isTimeOut = false;
			var now = Date.now();
			for (var i = 0, sz = this.m_szSession.length; i < sz; i++) {
				var session = this.m_szSession[i];
				if (session.isTimeOut(now)) {
					isTimeOut = true;
					break;
				}
			}
			if (isTimeOut) {
				this.m_szSession = [];
				//是否超时由1000,1心跳协议来斗室,不在此处理
				//NetMsgMgr.getInstance().onTimeOut()
			}
		};
		__proto__.clearSession = function () {
			this.m_szSession = [];
		};
		__proto__.response = function (requestId, errorCode, data) {
			for (var i = 0, sz = this.m_szSession.length; i < sz; i++) {
				var session = this.m_szSession[i];
				if (session.m_nRequestId == requestId) {
					this.m_szSession.splice(i, 1);
					session.callback(errorCode, data);
					break;
				}
			}
		};
		__proto__.removeRequest = function (requestId) {
			for (var i = 0, sz = this.m_szSession.length; i < sz; i++) {
				var session = this.m_szSession[i];
				if (session.m_nRequestId == requestId) {
					this.m_szSession.splice(i, 1);
					break;
				}
			}
		};
		__proto__.requestToGame = function (command, data, callbackObj, outTime) {
			if (!NetMsgMgr.getInstance().connected) {
				if (callbackObj != null) callbackObj(1003, null);
				return;
			}
			var bytes = RPC.wrapMessage(command, gtea.net.PACKET_TYPE_REQUESTRESPONSE, null, NetMsgMgr.getInstance().m_sToken, data);
			var session = new RPCSession(RPC.s_nRequestId++, callbackObj, bytes, outTime);
			this.m_szSession.push(session);
			if (bytes != null) {
				NetMsgMgr.sendMsg(bytes);
			}
		};
		__proto__.requestToRoom = function (command, data, callbackObj, outTime) {
			if (!NetMsgMgr.getInstance().connected) {
				if (callbackObj != null) callbackObj(1003, null);
				return;
			}
			var bytes = RPC.wrapMessage(command, gtea.net.PACKET_TYPE_SYNCREQUEST, null, NetMsgMgr.getInstance().m_sToken, data);
			var session = new RPCSession(RPC.s_nRequestId++, callbackObj, bytes, outTime);
			this.m_szSession.push(session);
			if (bytes != null) {
				NetMsgMgr.sendMsg(bytes);
			}
		};
		__proto__.sendToRoom = function (command, data) {
			if (!NetMsgMgr.getInstance().connected) return;
			var bytes = RPC.wrapMessage(command, gtea.net.PACKET_TYPE_SYNC, null, NetMsgMgr.getInstance().m_sToken, data);
			NetMsgMgr.sendMsg(bytes);
		};
		RPC.s_nRequestId = 1;
		RPC.getInstance = function () {
			if (RPC.s_instance == null) RPC.s_instance = new RPC;
			return RPC.s_instance;
		};
		RPC.response = function (requestId, errorCode, data) {
			RPC.getInstance().response(requestId, errorCode, data);
		};
		RPC.removeRequest = function (requestId) {
			RPC.getInstance().removeRequest(requestId);
		};
		RPC.clearSession = function () {
			RPC.getInstance().clearSession();
		};
		RPC.wrapMessage = function (command, packType, roomServer, authToken, data) {
			/*var wrapContent = {
				cmd: command,
				requestId: RPC.s_nRequestId,
				errorCode: 0,
				packType: packType,
				roomServer: roomServer,
				authToken: authToken,
				data: data
			};
			var wrapBytes = ProtobufConverter.encode("WrapPacket", wrapContent);*/
			return data;
		};
		RPC.__$INIT__ = function () {
			this.__$INIT__ = $nullfunc;
		};
		return RPC;
	}();
	gtea.rpc.sendToRoom = function (command, data) {
		RPC.getInstance().sendToRoom(command, data);
	};
	gtea.rpc.requestToGame = function (command, data, caller, callback) {
		var callbackObj = gtea.utils.bind(caller, callback);
		NetMsgMgr.getMsgReceiver().registerHandler(command, caller, callbackObj);
		RPC.getInstance().requestToGame(command, data, callbackObj, gtea.net.TIME_OUT);
	};
	gtea.rpc.requestToRoom = function (command, data, caller, callback) {
		var callbackObj = gtea.utils.bind(caller, callback);
		NetMsgMgr.getMsgReceiver().registerHandler(command, caller, callbackObj);
		RPC.getInstance().requestToRoom(command, data, callbackObj, gtea.net.TIME_OUT);
	};
	var NetMsgMgr = gtea.net.NetMsgMgr = function (_super) {
		function NetMsgMgr() {
			NetMsgMgr.__$INIT__();
			this.m_socket = null;
			this.m_bConnecting = false;
			this.m_msgReceiver = null;
			this.m_connectedCallback = null;
			this.m_lostCallback = null;
		}
		$InitClass(NetMsgMgr, "gtea.net.NetMsgMgr", true, _super);
		var __proto__ = NetMsgMgr.prototype;
		__proto__.connect = function (host, port, connectedCallback, lostCallback) {
			if (this.m_bConnecting) return;
			if (this.m_socket == null) {
				this.m_socket = new gtea.net.Socket;
				this.m_socket.addEventListener("connect", this, this.onSocketConnected);
				this.m_socket.addEventListener("close", this, this.onSocketClose);
				this.m_socket.addEventListener("error", this, this.onSocketError);
			} else {
				if (this.m_socket.connected) return false;
			}
			this.m_connectedCallback = connectedCallback;
			this.m_lostCallback = lostCallback;
			this.m_bConnecting = true;
			this.m_socket.connect(host, port);
			return true;
		};
		__proto__.onSocketConnected = function (event) {
			gtea.utils.trace("%c[net] sokcet connected", "color:blue");
			this.m_bConnecting = false;
			this.m_connectedCallback && this.m_connectedCallback();
		};
		__proto__.onSocketClose = function (event) {
			gtea.utils.trace("%c[net] sokcet close", "color:blue");
			this.m_bConnecting = false;
			this.m_socket.removeEventListener("connect", this, this.onSocketConnected);
			this.m_socket.removeEventListener("close", this, this.onSocketClose);
			this.m_socket.removeEventListener("error", this, this.onSocketError);
			this.m_socket = null;
			this.m_lostCallback && this.m_lostCallback(gtea.net.DISCONNECT_REASON_SOCKET);
			var evt = new Event("socket_error", {});
			evt.attachDispatcher(this);
			this.dispatchEvent(evt);
		};
		__proto__.onSocketError = function (event) {
			gtea.utils.trace("%c[net] sokcet error", "color:blue");
			
			this.m_bConnecting = false;
			this.m_socket.removeEventListener("connect", this, this.onSocketConnected);
			this.m_socket.removeEventListener("close", this, this.onSocketClose);
			this.m_socket.removeEventListener("error", this, this.onSocketError);
			this.m_socket = null;
			this.m_lostCallback && this.m_lostCallback(gtea.net.DISCONNECT_REASON_SOCKET);
			var evt = new Event("socket_error", {});
			evt.attachDispatcher(this);
			this.dispatchEvent(evt);
		};
		__proto__.onTimeOut = function () {
			gtea.utils.trace("%c[net] sokcet time out", "color:blue");
			this.m_bConnecting = false;
			this.m_socket.removeEventListener("connect", this, this.onSocketConnected);
			this.m_socket.removeEventListener("close", this, this.onSocketClose);
			this.m_socket.removeEventListener("error", this, this.onSocketError);
			this.m_socket = null;
			this.m_lostCallback && this.m_lostCallback(gtea.net.DISCONNECT_REASON_REQUEST);
			var evt = new Event("socket_error", {});
			evt.attachDispatcher(this);
			this.dispatchEvent(evt);
		};
		__proto__._sendMsg = function (netmsg) {
			this.m_socket.send(netmsg);
		};
		__proto__._unwrapMessage = function (bytes) {
			var message = ProtobufConverter.decode("WrapPacket", bytes);
			return message;
		};
		__proto__.recvMsg = function (msg) {
			//不做太多判断,直接处理
			var message = this._unwrapMessage(msg);
			if (message == undefined) {

			} else {
				if (message[0] == 1000 && message[1] == 1) {
					//console.log("心跳包,"+(new Date()).toLocaleTimeString())
					var sendData = gtea.protobuf.encode(null, null, 1000, 1);
					sendData = enPackets(1000, 1, sendData);
					this.m_socket.send(sendData);
				} else {
					gbx.log("收包:" + (new Date()).toLocaleTimeString() + ",[" + message[0] + "," + message[1] + "]");
					gbx.log(message[2]);
					this.m_msgReceiver.onMessage(message[3], message[2]);
				}
			}
			/*var message = this._unwrapMessage(msg);
			var isOk = this.m_msgReceiver.checkMessage(message);
			if (isOk) {
				if (message.packType == gtea.net.PACKET_TYPE_REQUESTRESPONSE || message.packType == gtea.net.PACKET_TYPE_SYNCREQUEST) RPC.response(message.requestId, message.errorCode, message.data);
				else this.m_msgReceiver.onMessage(message.cmd, message.data)
			} else {
				if (message.packType == gtea.net.PACKET_TYPE_REQUESTRESPONSE || message.packType == gtea.net.PACKET_TYPE_SYNCREQUEST) RPC.response(message.requestId, message.errorCode, message.data)
			}*/
		};
		__proto__._close = function () {
			if (this.m_socket != null) {
				this.m_lostCallback = null;
				this.m_socket.close();
			}
		};
		$def_getset_(NetMsgMgr, false, "connected", {
			get: function () {
				if (this.m_socket != null) return this.m_socket.connected;
				return false;
			}
		});
		NetMsgMgr.getInstance = function () {
			if (NetMsgMgr.s_instance == null) NetMsgMgr.s_instance = new NetMsgMgr;
			return NetMsgMgr.s_instance;
		};
		NetMsgMgr.connect = function (host, port, onConnectedCallback, onLostCallback) {
			return NetMsgMgr.getInstance().connect(host, port, onConnectedCallback, onLostCallback);
		};
		NetMsgMgr.sendMsg = function (msg) {
			NetMsgMgr.getInstance()._sendMsg(msg);
		};
		NetMsgMgr.setMsgReceiver = function (objmgr) {
			NetMsgMgr.getInstance().m_msgReceiver = objmgr;
		};
		NetMsgMgr.getMsgReceiver = function () {
			return NetMsgMgr.getInstance().m_msgReceiver;
		};
		NetMsgMgr.close = function () {
			NetMsgMgr.getInstance()._close();
			RPC.clearSession();
		};
		NetMsgMgr.__$INIT__ = function () {
			this.__$INIT__ = $nullfunc;
		};
		return NetMsgMgr;
	}(gtea.events.EventDispatcher);
})();
gbx.define("gbx/bridge", ["gbx/net/connector", "gbx/net/messagecommand", "gbx/net/errorcode", "gbx/net/errorcode_des", "gbx/net/net_tool", "gbx/hubs", "conf/platform"], function (server, CMD, ERROR_CODE, ERROR_CODE_DES, netTool, hubs, Platform) {
	var readyState = false,
		waittingList = [],
		inAppPurchase, dlgProgress = {
			ctx: null,
			callback: null
		};
	var cpOerderId, rechargeId, rechargeConfig, myUID;
	document.addEventListener("deviceready", function () {
		readyState = true;
		if ("gbxBridge" in window && gbxBridge.getPlatform() === "iOS") {
			inAppPurchase = cordova.require("cordova-plugin-inapppurchase.PaymentsPlugin");
			if (waittingList.length) {
				for (var i = 0; i < waittingList.length; i++) {
					waittingList[i].fn.apply(waittingList[i].ctx, waittingList[i].args);
				}
				waittingList = [];
			}
		}
	}, false);

	function registBridgeCallback() {
		if ("gbxBridge" in window) {
			gbxBridge.onVisibilityChange = function (isHide) {
				if ("CustomEvent" in window) {
					var evt = new CustomEvent("gamepause", {
						detail: isHide
					});
					document.dispatchEvent(evt);
				} else {
					var evt = document.createEvent("CustomEvent");
					evt.initCustomEvent("gamepause", true, true, isHide);
					document.dispatchEvent(evt);
				}
			};
			gbxBridge.onBackAction = function () {
				hubs.publish("global.app.back_action");
			};
			gbxBridge.onDownloadGameProgress = function (percent) {
				dlgProgress.callback.call(dlgProgress.ctx, percent);
			};
			gbxBridge.payCallBackiOS = function (jsonPar) {
				var receiptData = jsonPar;
				v.printLog("payCallBackiOS:" + receiptData);
				hubs.publish("platform.platform_manager", receiptData);
			};
		}
	}
	registBridgeCallback();
	var v = {
		get isParticleDownloadSupported() {
			var k = v.getPlatform() !== "web" && v.getVersion() >= 1.1;
			return k;
		},
		getParticleInfo: function (ctx, callback) {
			if (v.getPlatform() === "iOS") {
				cordova.exec(function (data) {
					callback.call(ctx, JSON.parse(data.config));
				}, null, "Native", "getDownloadGameConfig", []);
			} else if ("getDownloadGameConfig" in gbxBridge) {
				var str = gbxBridge.getDownloadGameConfig();
				callback.call(ctx, JSON.parse(str));
			}
		},
		sendGameReady: function () {
			if ("gbxBridge" in window) {
				if (v.getPlatform() === "iOS") {
					cordova.exec(null, null, "Native", "gameReady", []);
				} else if ("gameReady" in gbxBridge) {
					gbxBridge.gameReady();
				}
			}
		},
		startDownloadGame: function (key, context, callback) {
			dlgProgress.ctx = context;
			dlgProgress.callback = callback;
			if (v.getPlatform() === "iOS") {
				cordova.exec(null, null, "Native", "downloadGame", [key]);
			} else {
				gbxBridge.downloadGame(key);
			}
		},
		exitApp: function () {
			if ("gbxBridge" in window) {
				gbxBridge.exitApp();
			}
		},
		printLog: function (msg) {
			if ("gbxBridge" in window) {
				gbxBridge.printLog(msg);
			} else {
				console.log.apply(console, msg);
			}
		},
		getPlatform: function () {
			if (laya.utils.Browser.onIOS) {
				return "ios";
			} else if (laya.utils.Browser.onAndriod) {
				return "android";
			} else if (laya.utils.Browser.onPC) {
				return "web";
			}
			return "unknown";
		},
		getProvider: function () {
			if ("gbxBridge" in window) {
				return gbxBridge.getProvider();
			}
			return null;
		},
		getVersion: function () {
			if ("gbxBridge" in window) {
				return gbxBridge.getVersion();
			}
			return "1.0.0";
		},
		getPackageId: function () {
			if ("gbxBridge" in window) {
				return gbxBridge.getPackageId();
			}
			return "";
		},
		getServerInfo: function () {
			if ("gbxBridge" in window) {
				if ("getServerInfo" in gbxBridge) return gbxBridge.getServerInfo();
			}
			return "";
		},
		clipboardCopy: function (msg) {
			if ("gbxBridge" in window) {
				if (v.getPlatform() === "iOS") {
					gbxBridge.clipboardCopy(msg);
				}
			}
		},
		setProducts: function (productList) {
			if (v.getPlatform() !== "web") {
				if (readyState && inAppPurchase) {
					gbx.log("inAppPurchase.setProducts:", productList);
					inAppPurchase.getProducts(productList).then(function (products) {
						gbx.log("inAppPurchase.setProducts Response:", products);
					}).
						catch(function (err) {
							gbx.log("inAppPurchase.setProducts Error:", err);
						});
				} else {
					waittingList.push({
						ctx: this,
						fn: this.setProducts,
						args: [productList]
					});
				}
			} else { }
		},
		requestPayment: function (productId, callback, failCallback) {
			if (v.getPlatform() !== "web") {
				if (readyState) {
					gbx.log("inAppPurchase.buy:", productId);
					inAppPurchase.buy(productId).then(function (data) {
						gbx.log("inAppPurchase.buy Response:", data);
						callback(data);
					}).
						catch(function (err) {
							gbx.log("inAppPurchase.buy Error:", err);
							failCallback(err);
						});
				} else {
					waittingList.push({
						ctx: this,
						fn: this.requestPayment,
						args: [productId, callback, failCallback]
					});
				}
			} else {
				failCallback({
					errorMessage: "不支持的设备",
					errorCode: -100
				});
			}
		},
		payment: function (rechargeId) {
			v.printLog("rechargeId:" + rechargeId);
			if ("gbxBridge" in window) {
				gbxBridge.payment(rechargeId);
			}
		},
		payH5: function (orderId, totalAmount, subject, callBack, remark) {
			if ("gbxBridge" in window) {
				gbxBridge.payH5(orderId, totalAmount, subject, callBack, remark);
			}
		},
		pay: function (selectWay, transdata, sign) {
			if ("gbxBridge" in window) {
				gbxBridge.payGood(selectWay, transdata, sign);
			}
		},
		openUrl: function (url) {
			if ("cordova" in window) {	
				cordova.InAppBrowser.open(url, "_blank", "location=no");
			} else {
				window.location.href=url;
			}
		},
		savePic: function () {
			if ("gbxBridge" in window) {
				gbxBridge.savePic();
			}
		},
		getDeviceId: function () {
			if ("gbxBridge" in window) {
				return gbxBridge.getDeviceId();
			}
			return "40-8D-5C-23-AC-87_test";
		},
		detectOS: function () {
			var isWin = navigator.platform == "Win32" || navigator.platform == "Windows";
			if (isWin) return "Win";
			var isMac = navigator.platform == "Mac68K" || navigator.platform == "MacPPC" || navigator.platform == "Macintosh" || navigator.platform == "MacIntel";
			if (isMac) return "Mac";
			var isUnix = navigator.platform == "X11" && !isWin && !isMac;
			if (isUnix) return "Unix";
			var isLinux = String(navigator.platform).indexOf("Linux") > -1;
			if (isLinux) return "Linux";
			return "other";
		}
	};
	return v;
});
gbx.define("gbx/cclass", ["gbx/class", "gbx/hubs"], function (Class, hubs) {
	var CommunicableClass = Class.extend({
		init: function () {
			this.__subscribes = [];
		},
		unsubscribe: function () {
			var args = Array.prototype.slice.call(arguments, 0);
			for (var i = this.__subscribes.length - 1; i >= 0; i--) {
				if (this.__subscribes[i][0] == args[0] && this.__subscribes[i][1] == args[1] && (!args[2] || this.__subscribes[i][2] == args[2])) {
					hubs.unsubscribe.apply(hubs, this.__subscribes[i]);
					this.__subscribes.splice(i, 0);
					break;
				}
			}
		},
		unsubscribeAll: function () {
			for (var i = 0; i < this.__subscribes.length; i++) {
				hubs.unsubscribe.apply(hubs, this.__subscribes[i]);
			}
			this.__subscribes = [];
		},
		subscribe: function () {
			var args = Array.prototype.slice.call(arguments, 0);
			hubs.subscribe.apply(hubs, args);
			this.__subscribes.push(args);
		},
		publish: function () {
			var args = Array.prototype.slice.call(arguments, 0);
			hubs.publish.apply(hubs, args);
		},
		end: function () {
			this.unsubscribeAll();
		}
	});
	return CommunicableClass;
});
gbx.define("gbx/class", function () {
	var initializing = false,
		fnTest = /xyz/.test(function () {
			xyz;
		}) ? /\b_super\b/ : /.*/;
	var Class = function () { };
	Class.extend = function (prop) {
		var _super = this.prototype;
		initializing = true;
		var prototype = new this;
		initializing = false;
		for (var name in prop) {
			var g = prop.__lookupGetter__(name),
				s = prop.__lookupSetter__(name);
			if (g || s) {
				g && prototype.__defineGetter__(name, g);
				s && prototype.__defineSetter__(name, s);
				continue;
			}
			prototype[name] = typeof prop[name] == "function" && typeof _super[name] == "function" && fnTest.test(prop[name]) ?
				function (name, fn) {
					return function () {
						var tmp = this._super;
						this._super = _super[name];
						var ret = fn.apply(this, arguments);
						this._super = tmp;
						return ret;
					};
				}(name, prop[name]) : prop[name];
		}

		function Class() {
			var proto = Object.getPrototypeOf(this),
				ret;
			if (proto.hasOwnProperty("__singleton") && proto.__singleton != null) {
				return proto.__singleton;
			}
			if (!initializing && this.init) {
				ret = this.init.apply(this, arguments);
			}
			if (proto.hasOwnProperty("__singleton")) {
				proto.__singleton = this;
			}
			if (ret != undefined) {
				return ret;
			}
		}

		function Singleton() {
			if (!this.prototype.hasOwnProperty("__singleton")) {
				this.prototype.__singleton = null;
			}
			return Class;
		}
		Class.prototype = prototype;
		Class.prototype.constructor = Class;
		Class.extend = arguments.callee;
		Class.singleton = Singleton;
		return Class;
	};
	return Class;
});
gbx.define("gbx/debug", ["gbx/bridge"], function (bridge) {
	function argsToData(args, data, prefix) {
		if (prefix) {
			prefix += ".";
		}
		for (var key in args) {
			if (typeof args[key] == "object") {
				argsToData(args[key], data, prefix + key);
			} else {
				data.append(prefix + key, args[key]);
			}
		}
	}
	return {
		alertError: function () {
			window.onerror = function (msg, url, line, column, err) {
				alert(msg + "\r" + url + "\r" + line + "\r" + column + "\r" + err);
			};
		},
		showFps: function () {
			Laya.Stat.show(0, 0);
		},
		printLog: function () {
			gbx.log = function () {
				var args = Array.prototype.slice.call(arguments, 0);
				console.log.apply(console, args);
			};
			gbx.assert = function () {
				var args = Array.prototype.slice.call(arguments, 0);
				console.assert.apply(console, args);
			};
		},
		printLogSp: function () {
			gbx.log = function () {
				var args = Array.prototype.slice.call(arguments, 0).map(function (v) {
					if (v instanceof Object) {
						return JSON.stringify(v);
					}
					return v;
				}).join(" ");
				bridge.printLog([args]);
			};
			gbx.assert = function (appear) {
				var args = Array.prototype.slice.call(arguments, 1).map(function (v) {
					if (v instanceof Object) {
						return JSON.stringify(v);
					}
					return v;
				}).join(" ");
				if (appear) {
					throw args;
				}
			};
		},
		postLog: function () {
			if ("FormData" in window) {
				gbx.log = function () {
					var args = Array.prototype.slice.call(arguments, 0);
					var data = new FormData();
					argsToData(args, data, "");
					var xhr = new XMLHttpRequest();
					xhr.open("post", "log");
					xhr.send(data);
				};
				gbx.assert = function (condition) {
					if (condition) {
						return;
					}
					var args = Array.prototype.slice.call(arguments, 1);
					var data = new FormData();
					argsToData(args, data, "");
					var xhr = new XMLHttpRequest();
					xhr.open("post", "assert");
					xhr.send(data);
				};
			}
		}
	};
});
gbx.define("gbx/device", function () {
	var exports = {};
	(function (window, undefined) {
		"use strict";
		var LIBVERSION = "0.7.10",
			EMPTY = "",
			UNKNOWN = "?",
			FUNC_TYPE = "function",
			UNDEF_TYPE = "undefined",
			OBJ_TYPE = "object",
			STR_TYPE = "string",
			MAJOR = "major",
			MODEL = "model",
			NAME = "name",
			TYPE = "type",
			VENDOR = "vendor",
			VERSION = "version",
			ARCHITECTURE = "architecture",
			CONSOLE = "console",
			MOBILE = "mobile",
			TABLET = "tablet",
			SMARTTV = "smarttv",
			WEARABLE = "wearable",
			EMBEDDED = "embedded";
		var util = {
			extend: function (regexes, extensions) {
				var margedRegexes = {};
				for (var i in regexes) {
					if (extensions[i] && extensions[i].length % 2 === 0) {
						margedRegexes[i] = extensions[i].concat(regexes[i]);
					} else {
						margedRegexes[i] = regexes[i];
					}
				}
				return margedRegexes;
			},
			has: function (str1, str2) {
				if (typeof str1 === "string") {
					return str2.toLowerCase().indexOf(str1.toLowerCase()) !== -1;
				} else {
					return false;
				}
			},
			lowerize: function (str) {
				return str.toLowerCase();
			},
			major: function (version) {
				return typeof version === STR_TYPE ? version.split(".")[0] : undefined;
			}
		};
		var mapper = {
			rgx: function () {
				var result, i = 0,
					j, k, p, q, matches, match, args = arguments;
				while (i < args.length && !matches) {
					var regex = args[i],
						props = args[i + 1];
					if (typeof result === UNDEF_TYPE) {
						result = {};
						for (p in props) {
							if (props.hasOwnProperty(p)) {
								q = props[p];
								if (typeof q === OBJ_TYPE) {
									result[q[0]] = undefined;
								} else {
									result[q] = undefined;
								}
							}
						}
					}
					j = k = 0;
					while (j < regex.length && !matches) {
						matches = regex[j++].exec(this.getUA());
						if (matches) {
							for (p = 0; p < props.length; p++) {
								match = matches[++k];
								q = props[p];
								if (typeof q === OBJ_TYPE && q.length > 0) {
									if (q.length == 2) {
										if (typeof q[1] == FUNC_TYPE) {
											result[q[0]] = q[1].call(this, match);
										} else {
											result[q[0]] = q[1];
										}
									} else if (q.length == 3) {
										if (typeof q[1] === FUNC_TYPE && !(q[1].exec && q[1].test)) {
											result[q[0]] = match ? q[1].call(this, match, q[2]) : undefined;
										} else {
											result[q[0]] = match ? match.replace(q[1], q[2]) : undefined;
										}
									} else if (q.length == 4) {
										result[q[0]] = match ? q[3].call(this, match.replace(q[1], q[2])) : undefined;
									}
								} else {
									result[q] = match ? match : undefined;
								}
							}
						}
					}
					i += 2;
				}
				return result;
			},
			str: function (str, map) {
				for (var i in map) {
					if (typeof map[i] === OBJ_TYPE && map[i].length > 0) {
						for (var j = 0; j < map[i].length; j++) {
							if (util.has(map[i][j], str)) {
								return i === UNKNOWN ? undefined : i;
							}
						}
					} else if (util.has(map[i], str)) {
						return i === UNKNOWN ? undefined : i;
					}
				}
				return str;
			}
		};
		var maps = {
			browser: {
				oldsafari: {
					version: {
						"1.0": "/8",
						1.2: "/1",
						1.3: "/3",
						"2.0": "/412",
						"2.0.2": "/416",
						"2.0.3": "/417",
						"2.0.4": "/419",
						"?": "/"
					}
				}
			},
			device: {
				amazon: {
					model: {
						"Fire Phone": ["SD", "KF"]
					}
				},
				sprint: {
					model: {
						"Evo Shift 4G": "7373KT"
					},
					vendor: {
						HTC: "APA",
						Sprint: "Sprint"
					}
				}
			},
			os: {
				windows: {
					version: {
						ME: "4.90",
						"NT 3.11": "NT3.51",
						"NT 4.0": "NT4.0",
						2000: "NT 5.0",
						XP: ["NT 5.1", "NT 5.2"],
						Vista: "NT 6.0",
						7: "NT 6.1",
						8: "NT 6.2",
						8.1: "NT 6.3",
						10: ["NT 6.4", "NT 10.0"],
						RT: "ARM"
					}
				}
			}
		};
		var regexes = {
			browser: [
				[/(opera\smini)\/([\w.-]+)/i, /(opera\s[mobiletab]+).+version\/([\w.-]+)/i, /(opera).+version\/([\w.]+)/i, /(opera)[/\s]+([\w.]+)/i],
				[NAME, VERSION],
				[/(OPiOS)[/\s]+([\w.]+)/i],
				[
					[NAME, "Opera Mini"], VERSION
				],
				[/\s(opr)\/([\w.]+)/i],
				[
					[NAME, "Opera"], VERSION
				],
				[/(kindle)\/([\w.]+)/i, /(lunascape|maxthon|netfront|jasmine|blazer)[/\s]?([\w.]+)*/i, /(avant\s|iemobile|slim|baidu)(?:browser)?[/\s]?([\w.]*)/i, /(?:ms|\()(ie)\s([\w.]+)/i, /(rekonq)\/([\w.]+)*/i, /(chromium|flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron|vivaldi|iridium|phantomjs)\/([\w.-]+)/i],
				[NAME, VERSION],
				[/(trident).+rv[:\s]([\w.]+).+like\sgecko/i],
				[
					[NAME, "IE"], VERSION
				],
				[/(edge)\/((\d+)?[\w.]+)/i],
				[NAME, VERSION],
				[/(yabrowser)\/([\w.]+)/i],
				[
					[NAME, "Yandex"], VERSION
				],
				[/(comodo_dragon)\/([\w.]+)/i],
				[
					[NAME, /_/g, " "], VERSION
				],
				[/(chrome|omniweb|arora|[tizenoka]{5}\s?browser)\/v?([\w.]+)/i, /(qqbrowser)[/\s]?([\w.]+)/i],
				[NAME, VERSION],
				[/(uc\s?browser)[/\s]?([\w.]+)/i, /ucweb.+(ucbrowser)[/\s]?([\w.]+)/i, /JUC.+(ucweb)[/\s]?([\w.]+)/i],
				[
					[NAME, "UCBrowser"], VERSION
				],
				[/(dolfin)\/([\w.]+)/i],
				[
					[NAME, "Dolphin"], VERSION
				],
				[/((?:android.+)crmo|crios)\/([\w.]+)/i],
				[
					[NAME, "Chrome"], VERSION
				],
				[/XiaoMi\/MiuiBrowser\/([\w.]+)/i],
				[VERSION, [NAME, "MIUI Browser"]],
				[/android.+version\/([\w.]+)\s+(?:mobile\s?safari|safari)/i],
				[VERSION, [NAME, "Android Browser"]],
				[/FBAV\/([\w.]+);/i],
				[VERSION, [NAME, "Facebook"]],
				[/fxios\/([\w.-]+)/i],
				[VERSION, [NAME, "Firefox"]],
				[/version\/([\w.]+).+?mobile\/\w+\s(safari)/i],
				[VERSION, [NAME, "Mobile Safari"]],
				[/version\/([\w.]+).+?(mobile\s?safari|safari)/i],
				[VERSION, NAME],
				[/webkit.+?(mobile\s?safari|safari)(\/[\w.]+)/i],
				[NAME, [VERSION, mapper.str, maps.browser.oldsafari.version]],
				[/(konqueror)\/([\w.]+)/i, /(webkit|khtml)\/([\w.]+)/i],
				[NAME, VERSION],
				[/(navigator|netscape)\/([\w.-]+)/i],
				[
					[NAME, "Netscape"], VERSION
				],
				[/(swiftfox)/i, /(icedragon|iceweasel|camino|chimera|fennec|maemo\sbrowser|minimo|conkeror)[/\s]?([\w.+]+)/i, /(firefox|seamonkey|k-meleon|icecat|iceape|firebird|phoenix)\/([\w.-]+)/i, /(mozilla)\/([\w.]+).+rv:.+gecko\/\d+/i, /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir)[/\s]?([\w.]+)/i, /(links)\s\(([\w.]+)/i, /(gobrowser)\/?([\w.]+)*/i, /(ice\s?browser)\/v?([\w._]+)/i, /(mosaic)[/\s]([\w.]+)/i],
				[NAME, VERSION]
			],
			cpu: [
				[/(?:(amd|x(?:(?:86|64)[_-])?|wow|win)64)[;)]/i],
				[
					[ARCHITECTURE, "amd64"]
				],
				[/(ia32(?=;))/i],
				[
					[ARCHITECTURE, util.lowerize]
				],
				[/((?:i[346]|x)86)[;)]/i],
				[
					[ARCHITECTURE, "ia32"]
				],
				[/windows\s(ce|mobile);\sppc;/i],
				[
					[ARCHITECTURE, "arm"]
				],
				[/((?:ppc|powerpc)(?:64)?)(?:\smac|;|\))/i],
				[
					[ARCHITECTURE, /ower/, "", util.lowerize]
				],
				[/(sun4\w)[;)]/i],
				[
					[ARCHITECTURE, "sparc"]
				],
				[/((?:avr32|ia64(?=;))|68k(?=\))|arm(?:64|(?=v\d+;))|(?=atmel\s)avr|(?:irix|mips|sparc)(?:64)?(?=;)|pa-risc)/i],
				[
					[ARCHITECTURE, util.lowerize]
				]
			],
			device: [
				[/\((ipad|playbook);[\w\s);-]+(rim|apple)/i],
				[MODEL, VENDOR, [TYPE, TABLET]],
				[/applecoremedia\/[\w.]+ \((ipad)/],
				[MODEL, [VENDOR, "Apple"],
					[TYPE, TABLET]
				],
				[/(apple\s{0,1}tv)/i],
				[
					[MODEL, "Apple TV"],
					[VENDOR, "Apple"]
				],
				[/(archos)\s(gamepad2?)/i, /(hp).+(touchpad)/i, /(kindle)\/([\w.]+)/i, /\s(nook)[\w\s]+build\/(\w+)/i, /(dell)\s(strea[kpr\s\d]*[\dko])/i],
				[VENDOR, MODEL, [TYPE, TABLET]],
				[/(kf[A-z]+)\sbuild\/[\w.]+.*silk\//i],
				[MODEL, [VENDOR, "Amazon"],
					[TYPE, TABLET]
				],
				[/(sd|kf)[0349hijorstuw]+\sbuild\/[\w.]+.*silk\//i],
				[
					[MODEL, mapper.str, maps.device.amazon.model],
					[VENDOR, "Amazon"],
					[TYPE, MOBILE]
				],
				[/\((ip[honed|\s\w*]+);.+(apple)/i],
				[MODEL, VENDOR, [TYPE, MOBILE]],
				[/\((ip[honed|\s\w*]+);/i],
				[MODEL, [VENDOR, "Apple"],
					[TYPE, MOBILE]
				],
				[/(blackberry)[\s-]?(\w+)/i, /(blackberry|benq|palm(?=-)|sonyericsson|acer|asus|dell|huawei|meizu|motorola|polytron)[\s_-]?([\w-]+)*/i, /(hp)\s([\w\s]+\w)/i, /(asus)-?(\w+)/i],
				[VENDOR, MODEL, [TYPE, MOBILE]],
				[/\(bb10;\s(\w+)/i],
				[MODEL, [VENDOR, "BlackBerry"],
					[TYPE, MOBILE]
				],
				[/android.+(transfo[prime\s]{4,10}\s\w+|eeepc|slider\s\w+|nexus 7)/i],
				[MODEL, [VENDOR, "Asus"],
					[TYPE, TABLET]
				],
				[/(sony)\s(tablet\s[ps])\sbuild\//i, /(sony)?(?:sgp.+)\sbuild\//i],
				[
					[VENDOR, "Sony"],
					[MODEL, "Xperia Tablet"],
					[TYPE, TABLET]
				],
				[/(?:sony)?(?:(?:(?:c|d)\d{4})|(?:so[-l].+))\sbuild\//i],
				[
					[VENDOR, "Sony"],
					[MODEL, "Xperia Phone"],
					[TYPE, MOBILE]
				],
				[/\s(ouya)\s/i, /(nintendo)\s([wids3u]+)/i],
				[VENDOR, MODEL, [TYPE, CONSOLE]],
				[/android.+;\s(shield)\sbuild/i],
				[MODEL, [VENDOR, "Nvidia"],
					[TYPE, CONSOLE]
				],
				[/(playstation\s[34portablevi]+)/i],
				[MODEL, [VENDOR, "Sony"],
					[TYPE, CONSOLE]
				],
				[/(sprint\s(\w+))/i],
				[
					[VENDOR, mapper.str, maps.device.sprint.vendor],
					[MODEL, mapper.str, maps.device.sprint.model],
					[TYPE, MOBILE]
				],
				[/(lenovo)\s?(S(?:5000|6000)+(?:[-][\w+]))/i],
				[VENDOR, MODEL, [TYPE, TABLET]],
				[/(htc)[;_\s-]+([\w\s]+(?=\))|\w+)*/i, /(zte)-(\w+)*/i, /(alcatel|geeksphone|huawei|lenovo|nexian|panasonic|(?=;\s)sony)[_\s-]?([\w-]+)*/i],
				[VENDOR, [MODEL, /_/g, " "],
					[TYPE, MOBILE]
				],
				[/(nexus\s9)/i],
				[MODEL, [VENDOR, "HTC"],
					[TYPE, TABLET]
				],
				[/[\s(;](xbox(?:\sone)?)[\s);]/i],
				[MODEL, [VENDOR, "Microsoft"],
					[TYPE, CONSOLE]
				],
				[/(kin\.[onetw]{3})/i],
				[
					[MODEL, /\./g, " "],
					[VENDOR, "Microsoft"],
					[TYPE, MOBILE]
				],
				[/\s(milestone|droid(?:[2-4x]|\s(?:bionic|x2|pro|razr))?(:?\s4g)?)[\w\s]+build\//i, /mot[\s-]?(\w+)*/i, /(XT\d{3,4}) build\//i, /(nexus\s[6])/i],
				[MODEL, [VENDOR, "Motorola"],
					[TYPE, MOBILE]
				],
				[/android.+\s(mz60\d|xoom[\s2]{0,2})\sbuild\//i],
				[MODEL, [VENDOR, "Motorola"],
					[TYPE, TABLET]
				],
				[/android.+((sch-i[89]0\d|shw-m380s|gt-p\d{4}|gt-n8000|sgh-t8[56]9|nexus 10))/i, /((SM-T\w+))/i],
				[
					[VENDOR, "Samsung"], MODEL, [TYPE, TABLET]
				],
				[/((s[cgp]h-\w+|gt-\w+|galaxy\snexus|sm-n900))/i, /(sam[sung]*)[\s-]*(\w+-?[\w-]*)*/i, /sec-((sgh\w+))/i],
				[
					[VENDOR, "Samsung"], MODEL, [TYPE, MOBILE]
				],
				[/(samsung);smarttv/i],
				[VENDOR, MODEL, [TYPE, SMARTTV]],
				[/\(dtv[);].+(aquos)/i],
				[MODEL, [VENDOR, "Sharp"],
					[TYPE, SMARTTV]
				],
				[/sie-(\w+)*/i],
				[MODEL, [VENDOR, "Siemens"],
					[TYPE, MOBILE]
				],
				[/(maemo|nokia).*(n900|lumia\s\d+)/i, /(nokia)[\s_-]?([\w-]+)*/i],
				[
					[VENDOR, "Nokia"], MODEL, [TYPE, MOBILE]
				],
				[/android\s3\.[\s\w;-]{10}(a\d{3})/i],
				[MODEL, [VENDOR, "Acer"],
					[TYPE, TABLET]
				],
				[/android\s3\.[\s\w;-]{10}(lg?)-([06cv9]{3,4})/i],
				[
					[VENDOR, "LG"], MODEL, [TYPE, TABLET]
				],
				[/(lg) netcast\.tv/i],
				[VENDOR, MODEL, [TYPE, SMARTTV]],
				[/(nexus\s[45])/i, /lg[e;\s/-]+(\w+)*/i],
				[MODEL, [VENDOR, "LG"],
					[TYPE, MOBILE]
				],
				[/android.+(ideatab[a-z0-9\-\s]+)/i],
				[MODEL, [VENDOR, "Lenovo"],
					[TYPE, TABLET]
				],
				[/linux;.+((jolla));/i],
				[VENDOR, MODEL, [TYPE, MOBILE]],
				[/((pebble))app\/[\d.]+\s/i],
				[VENDOR, MODEL, [TYPE, WEARABLE]],
				[/android.+;\s(glass)\s\d/i],
				[MODEL, [VENDOR, "Google"],
					[TYPE, WEARABLE]
				],
				[/android.+(\w+)\s+build\/hm\1/i, /android.+(hm[\s\-_]*note?[\s_]*(?:\d\w)?)\s+build/i, /android.+(mi[\s\-_]*(?:one|one[\s_]plus)?[\s_]*(?:\d\w)?)\s+build/i],
				[
					[MODEL, /_/g, " "],
					[VENDOR, "Xiaomi"],
					[TYPE, MOBILE]
				],
				[/\s(tablet)[;/\s]/i, /\s(mobile)[;/\s]/i],
				[
					[TYPE, util.lowerize], VENDOR, MODEL
				]
			],
			engine: [
				[/windows.+\sedge\/([\w.]+)/i],
				[VERSION, [NAME, "EdgeHTML"]],
				[/(presto)\/([\w.]+)/i, /(webkit|trident|netfront|netsurf|amaya|lynx|w3m)\/([\w.]+)/i, /(khtml|tasman|links)[/\s]\(?([\w.]+)/i, /(icab)[/\s]([23]\.[\d.]+)/i],
				[NAME, VERSION],
				[/rv:([\w.]+).*(gecko)/i],
				[VERSION, NAME]
			],
			os: [
				[/microsoft\s(windows)\s(vista|xp)/i],
				[NAME, VERSION],
				[/(windows)\snt\s6\.2;\s(arm)/i, /(windows\sphone(?:\sos)*|windows\smobile|windows)[\s/]?([ntce\d.\s]+\w)/i],
				[NAME, [VERSION, mapper.str, maps.os.windows.version]],
				[/(win(?=3|9|n)|win\s9x\s)([nt\d.]+)/i],
				[
					[NAME, "Windows"],
					[VERSION, mapper.str, maps.os.windows.version]
				],
				[/\((bb)(10);/i],
				[
					[NAME, "BlackBerry"], VERSION
				],
				[/(blackberry)\w*\/?([\w.]+)*/i, /(tizen)[/\s]([\w.]+)/i, /(android|webos|palm\sos|qnx|bada|rim\stablet\sos|meego|contiki)[/\s-]?([\w.]+)*/i, /linux;.+(sailfish);/i],
				[NAME, VERSION],
				[/(symbian\s?os|symbos|s60(?=;))[/\s-]?([\w.]+)*/i],
				[
					[NAME, "Symbian"], VERSION
				],
				[/\((series40);/i],
				[NAME],
				[/mozilla.+\(mobile;.+gecko.+firefox/i],
				[
					[NAME, "Firefox OS"], VERSION
				],
				[/(nintendo|playstation)\s([wids34portablevu]+)/i, /(mint)[/\s(]?(\w+)*/i, /(mageia|vectorlinux)[;\s]/i, /(joli|[kxln]?ubuntu|debian|[open]*suse|gentoo|(?=\s)arch|slackware|fedora|mandriva|centos|pclinuxos|redhat|zenwalk|linpus)[/\s-]?([\w.-]+)*/i, /(hurd|linux)\s?([\w.]+)*/i, /(gnu)\s?([\w.]+)*/i],
				[NAME, VERSION],
				[/(cros)\s[\w]+\s([\w.]+\w)/i],
				[
					[NAME, "Chromium OS"], VERSION
				],
				[/(sunos)\s?([\w.]+\d)*/i],
				[
					[NAME, "Solaris"], VERSION
				],
				[/\s([frentopc-]{0,4}bsd|dragonfly)\s?([\w.]+)*/i],
				[NAME, VERSION],
				[/(ip[honead]+)(?:.*os\s([\w]+)*\slike\smac|;\sopera)/i],
				[
					[NAME, "iOS"],
					[VERSION, /_/g, "."]
				],
				[/(mac\sos\sx)\s?([\w\s.]+\w)*/i, /(macintosh|mac(?=_powerpc)\s)/i],
				[
					[NAME, "Mac OS"],
					[VERSION, /_/g, "."]
				],
				[/((?:open)?solaris)[/\s-]?([\w.]+)*/i, /(haiku)\s(\w+)/i, /(aix)\s((\d)(?=\.|\)|\s)[\w.]*)*/i, /(plan\s9|minix|beos|os\/2|amigaos|morphos|risc\sos|openvms)/i, /(unix)\s?([\w.]+)*/i],
				[NAME, VERSION]
			]
		};
		var UAParser = function (uastring, extensions) {
			if (!(this instanceof UAParser)) {
				return new UAParser(uastring, extensions).getResult();
			}
			var ua = uastring || (window && window.navigator && window.navigator.userAgent ? window.navigator.userAgent : EMPTY);
			var rgxmap = extensions ? util.extend(regexes, extensions) : regexes;
			this.getBrowser = function () {
				var browser = mapper.rgx.apply(this, rgxmap.browser);
				browser.major = util.major(browser.version);
				return browser;
			};
			this.getCPU = function () {
				return mapper.rgx.apply(this, rgxmap.cpu);
			};
			this.getDevice = function () {
				return mapper.rgx.apply(this, rgxmap.device);
			};
			this.getEngine = function () {
				return mapper.rgx.apply(this, rgxmap.engine);
			};
			this.getOS = function () {
				return mapper.rgx.apply(this, rgxmap.os);
			};
			this.getResult = function () {
				return {
					ua: this.getUA(),
					browser: this.getBrowser(),
					engine: this.getEngine(),
					os: this.getOS(),
					device: this.getDevice(),
					cpu: this.getCPU()
				};
			};
			this.getUA = function () {
				return ua;
			};
			this.setUA = function (uastring) {
				ua = uastring;
				return this;
			};
			return this;
		};
		UAParser.VERSION = LIBVERSION;
		UAParser.BROWSER = {
			NAME: NAME,
			MAJOR: MAJOR,
			VERSION: VERSION
		};
		UAParser.CPU = {
			ARCHITECTURE: ARCHITECTURE
		};
		UAParser.DEVICE = {
			MODEL: MODEL,
			VENDOR: VENDOR,
			TYPE: TYPE,
			CONSOLE: CONSOLE,
			MOBILE: MOBILE,
			SMARTTV: SMARTTV,
			TABLET: TABLET,
			WEARABLE: WEARABLE,
			EMBEDDED: EMBEDDED
		};
		UAParser.ENGINE = {
			NAME: NAME,
			VERSION: VERSION
		};
		UAParser.OS = {
			NAME: NAME,
			VERSION: VERSION
		};
		if (typeof exports !== UNDEF_TYPE) {
			if (typeof module !== UNDEF_TYPE && module.exports) {
				exports = module.exports = UAParser;
			}
			exports.UAParser = UAParser;
		} else {
			if (typeof define === FUNC_TYPE && define.amd) {
				define("ua-parser-js", [], function () {
					return UAParser;
				});
			} else {
				window.UAParser = UAParser;
			}
		}
		var $ = window.jQuery || window.Zepto;
		if (typeof $ !== UNDEF_TYPE) {
			var parser = new UAParser();
			$.ua = parser.getResult();
			$.ua.get = function () {
				return parser.getUA();
			};
			$.ua.set = function (uastring) {
				parser.setUA(uastring);
				var result = parser.getResult();
				for (var prop in result) {
					$.ua[prop] = result[prop];
				}
			};
		}
	})(typeof window === "object" ? window : this);
	var parser = new exports.UAParser();
	return parser.getResult();
});
gbx.define("gbx/envir", function () {
	var info = {
		url: "",
		domain: "",
		port: "",
		host: "",
		protocol: "",
		path: "",
		file: "",
		root: "",
		querystring: {}
	};
	if ("location" in window) {
		location.search.replace("?", "").split("&").forEach(function (v) {
			var m = v.split("=");
			if (m.length === 2) {
				info.querystring[m[0].toLowerCase()] = m[1];
			}
		});
		info.url = location.href, info.domain = location.hostname, info.port = location.port, info.host = location.host, info.protocol = location.protocol, info.path = location.pathname.split("/").slice(0, -1).join("/") + "/", info.file = location.pathname.split("/").pop(), info.root = info.protocol + "//" + info.host + info.path;
	}
	return {
		get queryString() {
			return info.querystring;
		},
		get url() {
			return info.url;
		},
		get host() {
			return info.host;
		},
		get root() {
			return info.root;
		}
	};
});
gbx.define("gbx/hubs", function () {
	var slice = [].slice,
		subscriptions = {};
	var hubs = amplify = {
		publish: function (topic) {
			if (typeof topic !== "string") {
				throw new Error("You must provide a valid topic to publish.");
			}
			var args = slice.call(arguments, 1),
				topicSubscriptions, subscription, length, i = 0,
				ret;
			if (!subscriptions[topic]) {
				return true;
			}
			topicSubscriptions = subscriptions[topic].slice();
			for (length = topicSubscriptions.length; i < length; i++) {
				subscription = topicSubscriptions[i];
				ret = subscription.callback.apply(subscription.context, args);
				if (ret === false) {
					break;
				}
			}
			return ret !== false;
		},
		subscribe: function (topic, context, callback, priority) {
			if (typeof topic !== "string") {
				throw new Error("You must provide a valid topic to create a subscription.");
			}
			if (arguments.length === 3 && typeof callback === "number") {
				priority = callback;
				callback = context;
				context = null;
			}
			if (arguments.length === 2) {
				callback = context;
				context = null;
			}
			priority = priority || 10;
			var topicIndex = 0,
				topics = topic.split(/\s/),
				topicLength = topics.length,
				added;
			for (; topicIndex < topicLength; topicIndex++) {
				topic = topics[topicIndex];
				added = false;
				if (!subscriptions[topic]) {
					subscriptions[topic] = [];
				}
				var i = subscriptions[topic].length - 1,
					subscriptionInfo = {
						callback: callback,
						context: context,
						priority: priority
					};
				for (; i >= 0; i--) {
					if (subscriptions[topic][i].priority <= priority) {
						subscriptions[topic].splice(i + 1, 0, subscriptionInfo);
						added = true;
						break;
					}
				}
				if (!added) {
					subscriptions[topic].unshift(subscriptionInfo);
				}
			}
			return callback;
		},
		unsubscribe: function (topic, context, callback) {
			if (typeof topic !== "string") {
				throw new Error("You must provide a valid topic to remove a subscription.");
			}
			if (arguments.length === 2) {
				callback = context;
				context = null;
			}
			if (!subscriptions[topic]) {
				return;
			}
			var length = subscriptions[topic].length,
				i = 0;
			for (; i < length; i++) {
				if (subscriptions[topic][i].callback === callback) {
					if (!context || subscriptions[topic][i].context === context) {
						subscriptions[topic].splice(i, 1);
						i--;
						length--;
					}
				}
			}
		},
		removeTopic: function (topic) {
			if (typeof topic !== "string") {
				throw new Error("You must provide a valid topic to remove a topic.");
			}
			if (!subscriptions[topic]) {
				return;
			}
			subscriptions[topic].length = 0;
			delete subscriptions[topic];
		},
		removeTopicRegexp: function (regexp) {
			if (!(regexp instanceof RegExp)) {
				throw new Error("You must provide a valid regexp to remove a topic.");
			}
			var count = 0;
			for (var key in subscriptions) {
				if (regexp.test(key)) {
					hubs.removeTopic(key);
					count++;
				}
			}
			return count;
		}
	};
	return hubs;
});
gbx.define("gbx/pool", function () {
	function ObjectPool(Cls) {
		this.cls = Cls;
		this.metrics = {};
		this._clearMetrics();
		this._objpool = [];
	}
	ObjectPool.prototype.alloc = function alloc() {
		var obj;
		if (this._objpool.length == 0) {
			obj = new this.cls;
			this.metrics.totalalloc++;
		} else {
			obj = this._objpool.pop();
			this.metrics.totalfree--;
		}
		return obj;
	};
	ObjectPool.prototype.free = function (obj) {
		var k;
		this._objpool.push(obj);
		this.metrics.totalfree++;
	};
	ObjectPool.prototype.collect = function (cls) {
		this._objpool = [];
		var inUse = this.metrics.totalalloc - this.metrics.totalfree;
		this._clearMetrics(inUse);
	};
	ObjectPool.prototype._clearMetrics = function (allocated) {
		this.metrics.totalalloc = allocated || 0;
		this.metrics.totalfree = 0;
	};
	return ObjectPool;
});
gbx.define("gbx/sound", function () {
	var SoundPlayer = function () {
		if (!("AudioContext" in window) && !("webkitAudioContext" in window)) {
			gbx.log("not support audio");
			return {
				checkUnlockState: function () { },
				unlock: function () { },
				setLoadedBuffer: function () { },
				preloadBGM: function () { },
				volume: function () {
					return 0;
				},
				mute: function () {
					return true;
				},
				muteSE: function () {
					return true;
				},
				playBGM: function () { },
				stopBGM: function () { },
				setPlayingSoundMax: function () { },
				playSE: function () { },
				clearBuff: function () { },
				pause: function () { },
				resume: function () { }
			};
		}
		var atx = new (window.AudioContext || window.webkitAudioContext);
		var buffs = {},
			playingBgm = null,
			playingSoundCount = 0,
			playingSoundMax = 5;
		var volume = .8,
			mute = false,
			muteSE = false;

		function loadUrl(url, callback) {
			var xhr = new XMLHttpRequest;
			xhr.open("GET", url, true);
			xhr.responseType = "arraybuffer";
			xhr.onload = function () {
				atx.decodeAudioData(xhr.response, function (buffer) {
					buffs[url] = buffer;
					callback && callback();
				});
			};
			xhr.send();
		}

		function createSource(url) {
			var gain = atx.createGain();
			var src = atx.createBufferSource();
			src.connect(gain);
			src.buffer = buffs[url];
			gain.connect(atx.destination);
			gain.gain.value = volume;
			return {
				src: src,
				gain: gain.gain
			};
		}

		function swapBGM(url, loopStart, loopEnd) {
			if (playingBgm != null) {
				var oldBgm = playingBgm;
				oldBgm.src.stop(atx.currentTime);
			}
			var newBgm = createSource(url);
			if (loopStart != undefined && loopStart > 0) { } else {
				newBgm.src.loop = true;
				newBgm.src.loopStart = loopStart || 0;
				newBgm.src.loopEnd = loopEnd || 0;
			}
			newBgm.src.start(atx.currentTime, 0);
			playingBgm = newBgm;
		}
		return {
			checkUnlockState: function (callback) {
				var buffer = atx.createBuffer(1, 1, 22050);
				var source = atx.createBufferSource();
				source.buffer = buffer;
				source.connect(atx.destination);
				source.start(0, 0);
				setTimeout(function () {
					if (source.playbackState === source.PLAYING_STATE || source.playbackState === source.FINISHED_STATE) {
						callback(true);
					} else {
						callback(false);
					}
				}, 0);
			},
			unlock: function () {
				var isMobileDevice = /iphone|ipad|ipod|android/i.test(navigator.userAgent);
				var eventType = isMobileDevice ? "touchend" : "mousedown";
				document.body.addEventListener(eventType, function unlocker() {
					var buffer = atx.createBuffer(1, 1, 22050);
					var source = atx.createBufferSource();
					source.buffer = buffer;
					source.connect(atx.destination);
					source.start(0, 0);
					document.body.removeEventListener(eventType, unlocker, false);
				}, false);
			},
			setLoadedBuffer: function (url, buffer) {
				if (url in buffs) {
					return;
				}
				if (!buffer || !buffer.audioBuffer) {
					return;
				}
				buffs[url] = buffer.audioBuffer;
			},
			preloadBGM: function (url) {
				if (url in buffs) {
					return;
				}
				loadUrl(url);
			},
			volume: function (set) {
				if (set != undefined) {
					volume = set;
					if (playingBgm != null) {
						playingBgm.gain.value = volume;
					}
				} else {
					return volume;
				}
			},
			mute: function (set) {
				if (set != undefined) {
					mute = set;
					if (playingBgm != null) {
						playingBgm.src.stop(0);
					}
				} else {
					return mute;
				}
			},
			muteSE: function (set) {
				if (set != undefined) {
					muteSE = set;
				} else {
					return muteSE;
				}
			},
			playBGM: function (url, loopStart, loopEnd) {
				if (mute) {
					return;
				}
				if (url in buffs) {
					swapBGM(url, loopStart, loopEnd);
				} else {
					loadUrl(url, function () {
						swapBGM(url, loopStart, loopEnd);
					});
				}
			},
			stopBGM: function () {
				if (playingBgm != null) {
					playingBgm.src.stop(0);
				}
			},
			setPlayingSoundMax: function (max) {
				playingSoundMax = max;
			},
			playSE: function (url, callback) {
				if (muteSE) {
					return;
				}
				if (playingSoundCount > playingSoundMax) {
					return;
				}
				if (url in buffs) {
					var src = createSource(url).src;
					playingSoundCount++;
					setTimeout(function () {
						playingSoundCount--;
						callback && callback();
					}, src.buffer.duration * 1e3);
					src.start(atx.currentTime, 0);
				} else {
					loadUrl(url, function () {
						var src = createSource(url).src;
						playingSoundCount++;
						setTimeout(function () {
							playingSoundCount--;
							callback && callback();
						}, src.buffer.duration * 1e3);
						src.start(atx.currentTime, 0);
					});
				}
			},
			clearBuff: function (url) {
				delete buffs[url];
			},
			pause: function () {
				if (atx.state === "running") {
					atx.suspend();
				} else if (playingBgm != null) {
					playingBgm.gain.value = 0;
				}
			},
			resume: function () {
				if (atx.state === "suspended") {
					atx.resume();
				} else if (playingBgm != null) {
					playingBgm.gain.value = volume;
				}
			}
		};
	}();
	return SoundPlayer;
});
gbx.define("gbx/timer", ["gbx/class"], function (Class) {
	var list = [],
		tid = 0,
		interval = 30,
		runTimer = function () {
			var tmp = list.slice(0),
				now = Date.now();
			for (var i = 0; i < tmp.length; i++) {
				if (tmp[i].enabled) {
					tmp[i].update(now);
				}
			}
			if (list.length) {
				tid = setTimeout(runTimer, interval);
			}
		};
	var Timer = Class.extend({
		init: function () {
			this._list = {};
			this._lastTick = Date.now();
			this._tid = 0;
			this._pid = 0;
			this._end = false;
			this.update = this._update.bind(this);
			list.push(this);
			if (list.length === 1) {
				runTimer();
			}
		},
		get enabled() {
			return !this._end;
		},
		setTimeout: function (delay, ctx, fn) {
			this._add(false, delay, ctx, fn);
		},
		setInterval: function (delay, ctx, fn) {
			this._add(true, delay, ctx, fn);
		},
		clearTimer: function (ctx, fn) {
			for (var key in this._list) {
				var info = this._list[key];
				if (info.ctx === ctx && info.fn === fn) {
					info.enable = false;
					delete this._list[key];
					return true;
				}
			}
			return false;
		},
		_add: function (loop, delay, ctx, fn) {
			for (var key in this._list) {
				var info = this._list[key];
				if (info.ctx === ctx && info.fn === fn) {
					info.enable = true;
					info.loop = loop;
					info.delay = delay;
					info.next = delay;
					return;
				}
			}
			var id = this._pid++,
				info = {
					enable: true,
					loop: loop,
					delay: delay,
					next: delay,
					ctx: ctx,
					fn: fn
				};
			this._list[id] = info;
		},
		_update: function (now) {
			var delta = now - this._lastTick;
			this._lastTick = now;
			for (var key in this._list) {
				var info = this._list[key];
				if (info.enable) {
					info.next -= delta;
					if (info.next <= 0) {
						if (!info.loop) {
							info.enable = false;
							delete this._list[key];
						} else {
							info.next += info.delay;
						}
						info.fn.call(info.ctx);
					}
				}
			}
		},
		end: function () {
			this._end = true;
			for (var i = 0; i < list.length; i++) {
				if (list[i] === this) {
					list.splice(i, 1);
				}
			}
			delete this.update;
		}
	});
	return Timer;
});
gbx.define("sp/dummy", ["conf/system", "gbx/net/connector", "comm/helper/scene_mgr", "comm/ui/connect_loading", "gbx/device", "gbx/util"], function (sys, server, sceneMgr, loading, device, util) {
	return {
		init: function (callback) {
			callback && callback();
		},
		get specLogin() {
			return false;
		},
		get specPurchase() {
			return false;
		},
		setLoginSuccessCallback: function (context, handler) { },
		startLogin: function () { },
		logout: function () { },
		get canLogout() {
			return true;
		},
		purchase: function (data, success, fail) { }
	};
});
gbx.require.queue(["conf/system", "gbx/render/stage", "gbx/render/loader", "gbx/debug", "gbx/bridge", "gbx/hubs", "gbx/render/display/sprite", "comm/helper/scene_mgr", "comm/helper/sound_mgr", "gbx/net/msg_receiver", "gbx/device"], function (sys, stage, loader, debug, bridge, hub, Sprite, sceneMgr, soundMgr, msgReceiver, device) {
	stage.initStageWithSize(sys.width, sys.height);
	//if (bridge.getPlatform() !== "web") debug.printLogSp();
	//else debug.printLog();
	//全打印
	debug.printLogSp();
	stage.setFrameSpeed(stage.FRAME_SPEED.SLOW);
	stage.setScaleMode(sys.scale);
	stage.setAlignment(sys.align);
	stage.setVerticalAligmnent(sys.valign);
	var os = bridge.detectOS();
	if (os.indexOf("Win") != -1 || os.indexOf("Mac") != -1) stage.setOrientation("horizontal");
	else stage.setOrientation(sys.orientation);
	var webglCheckContextNames = ["webgl", "experimental-webgl", "moz-webgl", "webkit-3d"],
		webglCheckPassed = false;
	for (var i = 0; i < webglCheckContextNames.length; i++) {
		var ctx = stage.getContext(webglCheckContextNames[i]);
		if (ctx) {
			webglCheckPassed = true;
			break;
		}
	}
	if (!webglCheckPassed) {
		alert("您的浏览器不支持WebGL或没有开启WebGL功能。");
	}
	//whr
	gtea.protobuf.addProtoAsync("logon_server_message.proto");
	gtea.protobuf.addProtoAsync("gate_server_message.proto");
	gtea.protobuf.addProtoAsync("common_server_message.proto");
	gtea.protobuf.addProtoAsync("game_server_message.proto");
	gtea.protobuf.addProtoAsync("bacc_message.proto");

	var resAtlas = ["res/atlas/assets/baccarat/tex.json",
		"res/atlas/assets/baccarat/tex/chat.json",
		"res/atlas/assets/baccarat/tex/chips.json",
		"res/atlas/assets/baccarat/tex/effect.json",
		"res/atlas/assets/baccarat/tex/playerlist.json",
		"res/atlas/assets/main/bank.json",
		"res/atlas/assets/main/bankIcon.json",
		"res/atlas/assets/main/card.json",
		"res/atlas/assets/main/emoji.json",
		"res/atlas/assets/main/head.json",
		"res/atlas/assets/main/login.json",
		"res/atlas/assets/main/public.json",
		"res/atlas/assets/main/qrCode.json",
		"res/atlas/assets/main/waysheet.json",
		"res/atlas/assets/main/bank/bankCharge.json",
		"res/atlas/assets/main/bank/rechargeChip.json",
		"res/atlas/assets/main/common/error.json",
		"res/atlas/assets/main/common/loading.json",
		"res/atlas/assets/main/common/marquee.json",
		"res/atlas/assets/main/lobby/sp.json",
		"res/atlas/assets/main/lobby/sp/bindParent.json",
		"res/atlas/assets/main/lobby/sp/bindPhone.json",
		"res/atlas/assets/main/lobby/sp/changeHead.json",
		"res/atlas/assets/main/lobby/sp/gambledetail.json",
		"res/atlas/assets/main/lobby/sp/game_spread.json",
		"res/atlas/assets/main/lobby/sp/mail.json",
		"res/atlas/assets/main/lobby/sp/rank.json",
		"res/atlas/assets/main/lobby/sp/service.json",
		"res/atlas/assets/main/lobby/sp/syssetting.json",
		"res/atlas/assets/main/lobby/sp/vip.json",
		"res/atlas/assets/main/login/num.json"];
	loader.loadOnce(resAtlas, this, function () {
		loader.setFileHashTable(loader.get(sys.fileHashTable));
		sceneMgr.quietSwitchTo("login", true, false);
	});

	soundMgr.unlock();

	function setFullscreen(element) {
		var rfc;
		for (var i = 0, l = ["requestFullscreen", "mozRequestFullScreen", "msRequestFullscreen", "webkitRequestFullscreen"]; i < l.length; i++) {
			if (l[i] in element) {
				rfc = function () {
					element[l[i]]();
				};
				break;
			}
		}
		if (rfc == undefined) {
			rfc = function () {
				console.log("not support");
			};
		}
		var evt = "touchend";
		element.addEventListener(evt, function b() {
			rfc();
			element.removeEventListener(evt, b, false);
		}, false);
	}
	document.addEventListener("gamepause", function (e) {
		document.gamePause = e.detail;
		if (e.detail) {
			stage.renderingEnabled = false;
			if (device.os.name !== "iOS") {
				soundMgr.pause();
			}
		} else {
			stage.renderingEnabled = true;
			if (device.os.name !== "iOS") {
				soundMgr.resume();
			}
		}
		hub.publish("global.game_status.pause");
		if (!document.gamePause) document.gamePauseInGame = false;
	}, false);
	document.addEventListener("visibilitychange", function (e) {
		var isHide = document.visibilityState === "hidden";
		if (device.browser.name !== "IE" && "CustomEvent" in window) {
			var evt = new CustomEvent("gamepause", {
				detail: isHide
			});
			document.dispatchEvent(evt);
		} else {
			var evt = document.createEvent("CustomEvent");
			evt.initCustomEvent("gamepause", true, true, isHide);
			document.dispatchEvent(evt);
		}
	}, false);
	if (device.os.name === "Mac OS") {
		window.onbeforeunload = function (e) {
			return "你确定要退出游戏吗";
		};
	}
});