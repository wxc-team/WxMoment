/**
 * 统计公用库
 */


(function(){
    var head = document.getElementsByTagName("head")[0] || document.documentElement;
    var script = document.createElement("script");
    script.async = "true";
    script.src = "http://pingjs.qq.com/ping.js";

    var done = false;

    // 加载完毕后执行
    script.onload = script.onreadystatechange = function () {
        if (!done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
            done = true;
            try {
                //基本事件统计
                pgvMain();
                //上报performance
                sendPerformance();
            } catch (err) {
                console.log(err)
            }
            script.onload = script.onreadystatechange = null;
        }
    };

    head.insertBefore(script, head.firstChild);


})()

function sendPerformance(){
    var sendImg = new Image();
    var url = getTimingUrl(7824, 12, 1);
    sendImg.src = url;
}

var pf = window.webkitPerformance ? window.webkitPerformance : window.msPerformance;
pf = (pf ? pf : window.performance);
var nowTime = new Date().getTime();

// 获取Performance timing数据；
function getTimingUrl (f1, f2, f3){
    var timingUrl = 'http://isdspeed.qq.com/cgi-bin/r.cgi';
    var _t, _p = pf, _ta = ['navigationStart','unloadEventStart','unloadEventEnd','redirectStart','redirectEnd','fetchStart','domainLookupStart','domainLookupEnd','connectStart','connectEnd','requestStart',/*10*/'responseStart','responseEnd','domLoading','domInteractive','domContentLoadedEventStart','domContentLoadedEventEnd','domComplete','loadEventStart','loadEventEnd'], _da = [], _t0, _tmp;

    if (_p && (_t = _p.timing)) {

        if (!_t.domContentLoadedEventStart) {
            _ta.splice(15, 2, 'domContentLoaded', 'domContentLoaded');
        }

        _t0 = _t[_ta[0]];
        for (var i = 1, l = _ta.length; i < l; i++) {
            _tmp = _t[_ta[i]];
            _tmp = (_tmp ? (_tmp - _t0) : 0);
            if (_tmp > 0) {
                _da.push( i + '=' + _tmp);
            }
        }

        if (window.d0) {//统计页面初始化时的d0时间
            _da.push('30=' + (window.d0 - _t0));
        }

        var url = timingUrl + '?flag1=' + f1 + '&flag2=' + f2 + '&flag3=' + f3 + '&' + _da.join('&');

        return url;
    }
};


var AnalyticsCommon = {
    config: {},

    setConfig: function (config) {
        this.config = config;
    },

    sendEvent: function (category, name, projectName) {
        projectName = projectName || this.config.projectName;
        var num = 1;
        var clock = setTimeout(function () {
            if(typeof pgvSendClick === "function" && projectName){
                clearTimeout(clock);
                if (category !== "" && name !== "") {
                    pgvSendClick({hottag: 'WXM.' + projectName + "." + category + "." + name});
                }
            }
        }, 200)

    },

    sendEventOnce: function(category, name, projectName){
        projectName = projectName || this.config.projectName;
        if(typeof pgvSendClick === "function" && projectName && category !== "" && name !== ""){
            pgvSendClick({hottag: 'WXM.' + projectName + "." + category + "." + name});
        }
    }

}

function addEvent(oTarget, sEventType, fnHandler) {
    if (oTarget.addEventListener) {
        oTarget.addEventListener(sEventType, fnHandler, false);
    } else if (oTarget.attachEvent) {
        oTarget.attachEvent("on" + sEventType, fnHandler);
    } else {
        oTarget["on" + sEventType] = fnHandler;
    }
}



function sendVisitDuration(){
    var pfTime = pf ? pf.timing.domComplete : nowTime;
    var time = new Date().getTime() - pfTime;
    time = Math.ceil(time/1000);
    if(time > 0){
        var category = '0-2s';
        if(time > 2 && time < 5){
            category = '2-5s';
        }else if(time > 5 && time < 10){
            category = '5-10s';
        }else if(time > 10 && time < 15){
            category = '10-15s';
        }else if(time > 15 && time < 30){
            category = '15-30s';
        }else if(time > 30 && time < 60){
            category = '30-60s';
        }else if(time > 60 && time < 120){
            category = '60-120s';
        }else if(time > 120 && time < 300){
            category = '120-300s';
        }else if(time > 300){
            category = '>300s';
        }
        AnalyticsCommon.sendEventOnce(category, time, AnalyticsCommon.config.projectName + "Leaving")
    }
}

addEvent(window, "pagehide", sendVisitDuration);

var sendNetWork = function () {
    WeixinJSBridge.invoke('getNetworkType', {}, function(res) {
        var arr = res.err_msg.split(':');
        var network = arr && (arr.length > 1) && arr[1];
        AnalyticsCommon.sendEvent('networkWxm', network);
    })
}

addEvent(document, 'WeixinJSBridgeReady', sendNetWork);



module.exports = AnalyticsCommon;