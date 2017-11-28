gbx.define("gbx/util", function() {
	return {
		formatDateTime: function(date, format) {
			if (!(date instanceof Date)) {
				date = new Date(date);
			}
			var yyyy = date.getYear() + 1900,
				MM = ("0" + (date.getMonth() + 1)).slice(-2),
				dd = ("0" + date.getDate()).slice(-2),
				hh = ("0" + date.getHours()).slice(-2),
				mm = ("0" + date.getMinutes()).slice(-2),
				ss = ("0" + date.getSeconds()).slice(-2);
			if (format === undefined) {
				format = "yyyy-MM-dd hh:mm:ss";
			}
			return format.replace("yyyy", yyyy).replace("MM", MM).replace("dd", dd).replace("hh", hh).replace("mm", mm).replace("ss", ss);
		},
		fixLengthString: function(str, len, char) {
			if (char === undefined) {
				char = "0";
			} else if (char.toString().length > 1) {
				char = char.toString()[0];
			}
			str = new Array(len + 1).join(char) + str;
			return str.substring(str.length - len);
		},
		openURL: function(url) {
			window.open(url);
		},
		copyTextToClipboard: function(text, callback) {
			var textArea = document.createElement("textarea");
			textArea.value = text;
			document.body.appendChild(textArea);
			textArea.select();
			var ret = document.execCommand("copy");
			document.body.removeChild(textArea);
			if (!ret) {
				prompt("请复制下面对话框中的内容:", text);
			}
			callback(ret);
		},
		createDownload: function(url, fileName) {
			if ("URL" in window) {
				var xhr = new XMLHttpRequest;
				xhr.responseType = "blob";
				xhr.onreadystatechange = function() {
					if (xhr.readyState === 4) {
						if (xhr.status === 200) {
							var link = document.createElement("a"),
								blob = window.URL.createObjectURL(xhr.response);
							link.href = blob;
							link.download = fileName;
							document.body.appendChild(link);
							link.click();
							window.URL.revokeObjectURL(blob);
							document.body.removeChild(link);
						}
					}
				};
				xhr.open("get", url, true);
				xhr.send();
			} else {
				location.href = url;
			}
		},
		closeInitDiv: function() {
			document.getElementById("init").style.display = "none";
			document.getElementById("init_bg").style.display = "none";
		},
		closeSpreadDiv: function() {
			var div = document.getElementById("spread");
			if (div !== null) div.style.display = "none";
		}
	};
});