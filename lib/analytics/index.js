/**
 * 统计
 */
var analyticsCommon = require('./analyticsCommon');


function Analytics(config) {
    analyticsCommon.setConfig(config);


    var head = document.getElementsByTagName("head")[0] || document.documentElement;
    var script = document.createElement("script");
    script.async = "true";
    script.src = "//pingjs.qq.com/ping.js";

    var done = false;

    // 加载完毕后执行
    script.onload = script.onreadystatechange = function () {
        if (!done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
            done = true;
            try {
                //基本事件统计
                pgvMain();
                //上报performance
                analyticsCommon.sendPerformance();
            } catch (err) {
                console.log(err)
            }
            script.onload = script.onreadystatechange = null;
        }
    };

    head.insertBefore(script, head.firstChild);

}


Analytics.prototype.sendEvent = function (category, name) {
    analyticsCommon.sendEvent(category, name, analyticsCommon.config.projectName);
};

module.exports = Analytics;