function setAnchors() {
    var cssText = "#weixin-tip{position: fixed; left:0; top:0; background: rgba(0,0,0,0.8); filter:alpha(opacity=80); width: 100%; height:100%; z-index: 100;} #weixin-tip p{text-align: center; margin-top: 10%; padding:0 5%;}";
    var ua = navigator.userAgent.toLowerCase(),
        iphoneos = (ua.match(/iphone os/i) == "iphone os") || (ua.match(/iph os/i) == "iph os") || (ua.match(/ipad/i) == "ipad"),
        android = (ua.match(/android/i) == "android") || (ua.match(/adr/i) == "adr") || (ua.match(/android/i) == "mi pad");

    var a_list = document.getElementsByTagName("a"),
        i = 0,
        len = a_list.length,
        get_par = "",
        get_par = function get_par(par) {
            var local_url = document.location.href;
            var get = local_url.indexOf(par + "=");
            if (get == -1) {
                return false;
            }
            var get_par = local_url.slice(par.length + get + 1);
            var nextPar = get_par.indexOf("&");
            if (nextPar != -1) {
                get_par = get_par.slice(0, nextPar);
            }
            return get_par;
        };

    place = get_par("place") || "626";

    for (i = 0; i < len; i++) {
        (function (index) {
            a_list[index].addEventListener('click', function () {
                DownSoft();
            }, false);
        })(i)
    }

    if (is_weixin()) {
        loadHtml();
        loadStyleText();
    }

    function getQueryString(name) {
        var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
        var r = window.location.search.substr(1).match(reg);
        if (r !== null) {
            return r[2];
        }
        return null;
    }


    function is_weixin() {
        // return true;
        var ua = navigator.userAgent.toLowerCase();
        if (ua.match(/MicroMessenger/i) == "micromessenger") {
            return true;
        } else {
            return false;
        }
    }

    function loadHtml() {
        var u = navigator.userAgent;
        var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1; //android终端
        var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端

        var div = document.createElement('div');
        div.id = 'weixin-tip';
        if (isiOS) {
            div.innerHTML = '<p><img src="images/live_weixin_ios.png" alt="微信打开" style="max-width: 100%; height: auto;"/></p>';
        } else {
            div.innerHTML = '<p><img src="images/live_weixin.png" alt="微信打开" style="max-width: 100%; height: auto;"/></p>';
        }
        console.log(div)
        document.body.appendChild(div);
    }

    function loadStyleText() {
        var style = document.createElement('style');
        style.rel = 'stylesheet';
        style.type = 'text/css';
        try {
            style.appendChild(document.createTextNode(cssText));
        } catch (e) {
            style.styleSheet.cssText = cssText; //ie9以下
        }
        var head = document.getElementsByTagName("head")[0]; //head标签之间加上style样式
        head.appendChild(style);
    }

    function DownSoft() {
        var clipboard = new ClipboardJS('.btn', {
            text: function() {
                return getQueryString('pid');
            }
        });
        var clipboard = new ClipboardJS('.ppt_dw', {
            text: function() {
                return getQueryString('pid');
            }
        });
        var clipboard = new ClipboardJS('.down-button', {
            text: function() {
                return getQueryString('pid');
            }
        });

        clipboard.on('success', function(e) {
            console.log(e);
        });

        clipboard.on('error', function(e) {
            console.log(e);
        });

        var pid = getQueryString('pid')
        var s = 'https:' == document.location.protocol ? true : false;
        if (pid != "" && pid != "undefined" && pid != null) {
            if(iphoneos){
                $('.gotoTrust').show();
            }
            var url1 = "http://agent.bjl16888.com/tp5/x3/tj.down?pid=" + pid + (s ? "&https=1" : "");
            window.location.href = url1;
            return;
        }

	   if(iphoneos) {
            // if(typeof isCompany != 'undefined') {
            //     if(isCompany === '1') {
            //         window.location.href = './install.html?v60';
            //         return;
            //     }
            // }
            $('.gotoTrust').show();
            var url = 'https://raw.githubusercontent.com/kk2019/kk2019.github.io/master/plist/jhhm/in.plist?v20190404';
            window.location.href=`itms-services://?action=download-manifest&url=${url}`   // 只能是企业包地址
            return;
        }

        window.location.href='https://zuiniubi.oss-cn-shenzhen.aliyuncs.com/20180902/cn_haomen_online_appid225_ver271_20180902.apk';

        return;

        var fr = getQueryString('fr')
        var s = 'https:' == document.location.protocol ? true : false;
        var pid = iphoneos ? iosplace : androidplace;
        if (typeof fr != 'undefined' && fr == 'code') {
            if (iphoneos){
                if(typeof iosplacecode != 'undefined') {
                    pid = iosplacecode;
                }
            } else {
                if(typeof androidplacecode != 'undefined') {
                    pid = androidplacecode;
                }
            }
        }
        var url = rurl + '?pid=' + pid + (s ? '&s=1' : '');
        console.log(url);
        window.location.href = url;
    }

}

window.addEventListener('DOMContentLoaded', setAnchors, false);
