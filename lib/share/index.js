var _ = require('underscore');
var AnalyticsCommon = require('analytics/analyticsCommon');
/**
 * 微信分享
 */

function Share(config) {
    this.init(config);
}

function getContentByName(name) {

    if (document.getElementsByName("wxm:" + name).length == 1) {
        return document.getElementsByName("wxm:" + name)[0].getAttribute("content");
    } else {
        return "undefined";
    }

}

Share.prototype.init = function (config) {

    this.config = {

        timeline: {
            'title': getContentByName("timeline_title"),
            'desc': getContentByName("timeline_title")
        },

        appmessage: {
            'title': getContentByName("appmessage_title"),
            'desc': getContentByName("appmessage_desc")
        },

        global: {
            'img_url': getContentByName("img_url"),
            'link': getContentByName("link")
        }
    };

    this.config = _.extend({}, config, this.config);

    //通用设置
    this.config.timeline = _.extend({}, this.config.global, this.config.timeline);
    this.config.appmessage = _.extend({}, this.config.global, this.config.appmessage);

    var _this = this;

    var afterWeixinJSBridgeReady = function () {

        WeixinJSBridge.on("menu:share:appmessage", function () {
            WeixinJSBridge.invoke("sendAppMessage", _this.config.appmessage, function (r) {
                if (r.err_msg !== "send_app_msg:cancel" && _.isFunction(_this.config["appmessage"]['success'])) {
                    _this.config["appmessage"]['success']();
                    AnalyticsCommon.sendEvent('shareAppmessageWxm', 'success');
                } else if (_.isFunction(_this.config["appmessage"]['cancel'])) {
                    _this.config["appmessage"]['cancel']();
                    AnalyticsCommon.sendEvent('shareAppmessageWxm', 'cancel');
                }
            });
        });

        WeixinJSBridge.on("menu:share:timeline", function () {
            WeixinJSBridge.invoke("shareTimeline", _this.config.timeline, function (r) {
                if (r.err_msg !== "share_timeline:cancel" && _.isFunction(_this.config["timeline"]['success'])) {
                    _this.config["timeline"]['success']();
                    AnalyticsCommon.sendEvent('shareTimelineWxm', 'success');
                } else if (_.isFunction(_this.config["timeline"]['cancel'])) {
                    _this.config["timeline"]['cancel']();
                    AnalyticsCommon.sendEvent('shareTimelineWxm', 'cancel');
                }
            });
        });

    };

    if (typeof window.WeixinJSBridge == "undefined") {
        if (document.addEventListener) {
            document.addEventListener('WeixinJSBridgeReady', afterWeixinJSBridgeReady, false);
        } else if (document.attachEvent) {
            document.attachEvent('WeixinJSBridgeReady', afterWeixinJSBridgeReady);
            document.attachEvent('onWeixinJSBridgeReady', afterWeixinJSBridgeReady);
        }
    } else {
        afterWeixinJSBridgeReady();
    }

};

Share.prototype.set = function () {

    if (arguments.length === 3 && _.isString(arguments[0]) && _.isString(arguments[1])) {
        this.config[arguments[0]][arguments[1]] = arguments[2];
    } else {
        console.log('[WxMoment Share] set 函数参数错误')
    }

};


module.exports = Share;
