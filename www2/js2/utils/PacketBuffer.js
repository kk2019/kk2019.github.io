// buffer: ArrayBuffer = new ArrayBuffer(4096);
var headLength = 5;
var cmdLength = 4;
var key = "6279baiyikejitest";

// 解包
function parsePackets(data) {
	var msgBuffer = data.slice(this.headLength);
	var msgEncode = this.ab2str(msgBuffer);
	msgEncode = this.xxtea_decrypt(msgEncode, key);
	var encodeBuffer = this.str2ab(msgEncode);
	var buffer = new DataView(encodeBuffer);

	var commandMain = buffer.getInt16(0);
	var commandSub = buffer.getInt16(2);
	//console.log('Command packets:' + commandMain + "," + commandSub);
	//let msgBody = this.ab2str(encodeBuffer.slice(cmdLength));
	return [commandMain, commandSub, encodeBuffer.slice(cmdLength)];
}

// 封包
function enPackets(maincmd, subcmd, data) {
	if(data == undefined){
		data = new ArrayBuffer(0);
	}
	var dataU8 = new Uint8Array(data);
	var bodyArrayBuff = new ArrayBuffer(data.byteLength + cmdLength);
	var setDV = new DataView(bodyArrayBuff);
	setDV.setUint16(0, maincmd);
	setDV.setUint16(2, subcmd);
	var setU8 = new Uint8Array(bodyArrayBuff);
	setU8.set(dataU8, cmdLength);
	bodyArrayBuff = ab2str(bodyArrayBuff);
	bodyArrayBuff = xxtea_encrypt(bodyArrayBuff, key);
	bodyArrayBuff = str2ab(bodyArrayBuff);

	var encryptBuff = new ArrayBuffer(bodyArrayBuff.byteLength + headLength);
	setDV = new DataView(encryptBuff);
	setDV.setUint16(0, 0x6279);
	setDV.setUint8(2, 0x01);
	setDV.setUint16(3, bodyArrayBuff.byteLength);
	var bodyBuffU8 = new Uint8Array(bodyArrayBuff);
	setU8 = new Uint8Array(encryptBuff);
	setU8.set(bodyBuffU8, headLength);
	//验证成功
	//var result =parsePackets(encryptBuff)
	//result[2] = str2ab(result[2])
	return encryptBuff;
}

// ArrayBuffer转为字符串，参数为ArrayBuffer对象
function ab2str(buf) {
	var uint8 = new Uint8Array(buf);
	return String.fromCharCode.apply(null, uint8);
}

// 字符串转为ArrayBuffer对象，参数为字符串
function str2ab(str) {
	var buf = new ArrayBuffer(str.length); // 每个字符占用2个字节
	var bufView = new Uint8Array(buf);
	for (var i = 0, strLen = str.length; i < strLen; i++) {
		bufView[i] = str.charCodeAt(i);
	}
	return buf;
}

/* xxtea.js
 *
 * Author:       Ma Bingyao <andot@ujn.edu.cn>
 * Copyright:    CoolCode.CN
 * Version:      1.2
 * LastModified: 2006-05-02
 * This library is free.  You can redistribute it and/or modify it.
 * http://www.coolcode.cn/?p=128
 */
function long2str(v, w) {
	var vl = v.length;
	var sl = v[vl - 1] & 0xffffffff;
	for (var i = 0; i < vl; i++) {
		v[i] = String.fromCharCode(v[i] & 0xff,
			v[i] >>> 8 & 0xff,
			v[i] >>> 16 & 0xff,
			v[i] >>> 24 & 0xff);
	}
	if (w) {
		return v.join("").substring(0, sl);
	} else {
		return v.join("");
	}
}

function str2long(s, w) {
	var len = s.length;
	var v = [];
	for (var i = 0; i < len; i += 4) {
		v[i >> 2] = s.charCodeAt(i) | s.charCodeAt(i + 1) << 8 | s.charCodeAt(i + 2) << 16 | s.charCodeAt(i + 3) << 24;
	}
	if (w) {
		v[v.length] = len;
	}
	return v;
}

function xxtea_encrypt(str, key) {
	if (str == "") {
		return "";
	}
	var v = this.str2long(str, true);
	var k = this.str2long(key, false);
	var n = v.length - 1;

	var z = v[n],
		y = v[0],
		delta = 0x9E3779B9;
	var mx, e, q = Math.floor(6 + 52 / (n + 1)),
		sum = 0;
	while (q-- > 0) {
		sum = sum + delta & 0xffffffff;
		e = sum >>> 2 & 3;
		for (var p = 0; p < n; p++) {
			y = v[p + 1];
			mx = (z >>> 5 ^ y << 2) + (y >>> 3 ^ z << 4) ^ (sum ^ y) + (k[p & 3 ^ e] ^ z);
			z = v[p] = v[p] + mx & 0xffffffff;
		}
		y = v[0];
		mx = (z >>> 5 ^ y << 2) + (y >>> 3 ^ z << 4) ^ (sum ^ y) + (k[p & 3 ^ e] ^ z);
		z = v[n] = v[n] + mx & 0xffffffff;
	}

	return this.long2str(v, false);
}

function xxtea_decrypt(str, key) {
	if (str == "") {
		return "";
	}
	var v = this.str2long(str, false);
	var k = this.str2long(key, false);
	var n = v.length - 1;

	var z = v[n - 1],
		y = v[0],
		delta = 0x9E3779B9;
	var mx, e, q = Math.floor(6 + 52 / (n + 1)),
		sum = q * delta & 0xffffffff;
	while (sum != 0) {
		e = sum >>> 2 & 3;
		for (var p = n; p > 0; p--) {
			z = v[p - 1];
			mx = (z >>> 5 ^ y << 2) + (y >>> 3 ^ z << 4) ^ (sum ^ y) + (k[p & 3 ^ e] ^ z);
			y = v[p] = v[p] - mx & 0xffffffff;
		}
		z = v[n];
		mx = (z >>> 5 ^ y << 2) + (y >>> 3 ^ z << 4) ^ (sum ^ y) + (k[p & 3 ^ e] ^ z);
		y = v[0] = v[0] - mx & 0xffffffff;
		sum = sum - delta & 0xffffffff;
	}

	return this.long2str(v, true);
}