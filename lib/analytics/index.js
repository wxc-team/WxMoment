/**
 * 统计
 */

function Analytics(config) {

    this.config = config;

    window.projectName = this.config.projectName;

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
            } catch (err) {
            }
            script.onload = script.onreadystatechange = null;
        }
    };

    head.insertBefore(script, head.firstChild);
}

Analytics.prototype.sendEvent = function (category, name) {
    if (typeof pgvSendClick === "function" && category !== "" && name !== "") {
        pgvSendClick({hottag: 'WXM.' + this.config.projectName + "." + category + "." + name});
    }
};

module.exports = Analytics;