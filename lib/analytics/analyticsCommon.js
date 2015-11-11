/**
 * 统计公用库
 */

var pf = window.webkitPerformance ? window.webkitPerformance : window.msPerformance;
pf = (pf ? pf : window.performance);
var nowTime = new Date().getTime();

// 获取Performance timing数据；
function getTimingUrl(f1, f2, f3) {
    var timingUrl = '//isdspeed.qq.com/cgi-bin/r.cgi';
    var timing, ta = ['navigationStart', 'unloadEventStart', 'unloadEventEnd', 'redirectStart', 'redirectEnd', 'fetchStart', 'domainLookupStart', 'domainLookupEnd', 'connectStart', 'connectEnd', 'requestStart', /*10*/'responseStart', 'responseEnd', 'domLoading', 'domInteractive', 'domContentLoadedEventStart', 'domContentLoadedEventEnd', 'domComplete', 'loadEventStart', 'loadEventEnd'], data = [], t0, tmp;

    if (pf && (timing = pf.timing)) {

        if (!timing.domContentLoadedEventStart) {
            ta.splice(15, 2, 'domContentLoaded', 'domContentLoaded');
        }

        t0 = timing[ta[0]];
        for (var i = 1, l = ta.length; i < l; i++) {
            tmp = timing[ta[i]];
            tmp = (tmp ? (tmp - t0) : 0);
            if (tmp > 0) {
                data.push(i + '=' + tmp);
            }
        }

        var url = timingUrl + '?flag1=' + f1 + '&flag2=' + f2 + '&flag3=' + f3 + '&' + data.join('&');

        return url;
    }
};


var AnalyticsCommon = {
    config: {},

    sendPerformance: function () {
        var sendImg = new Image();
        var url = getTimingUrl(7824, 12, 1);
        url && (sendImg.src = url);
    },

    setConfig: function (config) {
        this.config = config;
    },

    sendEvent: function (category, name, projectName) {
        var that = this;
        if (typeof pgvSendClick === "function" && projectName) {
            if (category !== "" && name !== "") {
                pgvSendClick({hottag: 'WXM.' + projectName + "." + category + "." + name});
            }
        } else {
            var clock = setInterval(function () {
                projectName = projectName || that.config.projectName;
                if (typeof pgvSendClick === "function" && projectName) {
                    clearInterval(clock);
                    if (category !== "" && name !== "") {
                        pgvSendClick({hottag: 'WXM.' + projectName + "." + category + "." + name});
                    }
                }
            }, 200)
        }


    },

    sendEventOnce: function (category, name, projectName) {
        projectName = projectName || this.config.projectName;
        if (typeof pgvSendClick === "function" && projectName && category !== "" && name !== "") {
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


function sendVisitDuration() {
    var pfTime = pf ? pf.timing.domComplete : nowTime;
    var time = new Date().getTime() - pfTime;
    time = Math.ceil(time / 1000);
    if (time > 0) {
        var category = '0-2s';
        if (time > 2 && time < 5) {
            category = '2-5s';
        } else if (time > 5 && time < 10) {
            category = '5-10s';
        } else if (time > 10 && time < 15) {
            category = '10-15s';
        } else if (time > 15 && time < 30) {
            category = '15-30s';
        } else if (time > 30 && time < 60) {
            category = '30-60s';
        } else if (time > 60 && time < 120) {
            category = '60-120s';
        } else if (time > 120 && time < 300) {
            category = '120-300s';
        } else if (time > 300) {
            category = '>300s';
        }
        AnalyticsCommon.sendEventOnce(category, time, AnalyticsCommon.config.projectName + "Leaving")
    }
}

addEvent(window, "pagehide", sendVisitDuration);

var sendNetWork = function () {
    WeixinJSBridge.invoke('getNetworkType', {}, function (res) {
        var arr = res.err_msg.split(':');
        var network = arr && (arr.length > 1) && arr[1];
        AnalyticsCommon.sendEvent('networkWxm', network);
    })
}

addEvent(document, 'WeixinJSBridgeReady', sendNetWork);

//发送分享进来的页面的pv
(function () {
    var from = location.search.substr(1).match(/(^|&)from=([^&]*)(&|$)/)
    if (from && from[2]) {
        AnalyticsCommon.sendEvent('pvWxm', from[2]);
    }
})()


module.exports = AnalyticsCommon;