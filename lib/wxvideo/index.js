/**
 * 微信视频播放器，只能在mp.weixin.qq.com域名下使用
 */
var _ = require('../underscore/underscore.js');
var AnalyticsCommon = require('../analytics/analyticsCommon.js');

// 全局方法，给微信视频播放器回调
// 以下代码来自公众号文章内的代码，计算逻辑不要修改
;
(function(global) {
    var mpVideoBotH = 37;

    function setProperty(el, name, value, priority) {
        if (!!el.style.setProperty) {
            priority = priority || null;
            el.style.setProperty(name, value, priority);
        } else if (typeof el.style.cssText !== 'undefined') {
            priority = priority ? '!' + priority : '';
            el.style.cssText += ';' + name + ":" + value + priority + ";"; // 前面加多个分号兼容IE
        }
    }

    global.resetMpVideoH = function(iframe) {
        var container = iframe.getAttribute("wxm-container");
        var w = document.getElementById(container).offsetWidth;
        var h = Math.ceil(w * 3 / 4);

        if (iframe.getAttribute("ori_status") == 2) {
            h = h + mpVideoBotH;
        }

        iframe.setAttribute("width", w);
        iframe.setAttribute("height", h);
        setProperty(iframe, "position", "static", "important");
        return false;
    }

    global.__setOriginStatus = function(data) {
        var iframes = document.getElementsByTagName('iframe');
        var iframe, dom_w, dom_h, container;

        for (var i = 0, len = iframes.length; i < len; ++i) {
            iframe = iframes[i];
            var realsrc = iframe.getAttribute('src') || "";
            var match = realsrc.match(/[\?&]vid\=([^&]*)/);
            if (!match || !match[1]) {
                continue;
            }
            var vid = match[1];
            if (data.ori_status == 2 && vid == data.vid) {

                container = iframe.getAttribute("wxm-container");
                dom_w = document.getElementById(container).offsetWidth;
                dom_h = Math.ceil(dom_w * 3 / 4);

                iframe.setAttribute("height", dom_h + mpVideoBotH);
                iframe.setAttribute("ori_status", 2);
            }
        }
    }

    global.addEventListener('resize', function() {

        var iframes = document.getElementsByTagName('iframe');

        for (var i = 0, il = iframes.length; i < il; i++) {
            var a = iframes[i],
                src = a.getAttribute("src");
            if (!!src && src.indexOf("/mp/videoplayer") != -1) {
                setTimeout((function(a_tmp) {
                    return function() {
                        var container = a_tmp.getAttribute("wxm-container");
                        var w_tmp = document.getElementById(container).offsetWidth;
                        var h_tmp = Math.ceil(w_tmp * 3 / 4);

                        if (a_tmp.getAttribute("ori_status") == 2) {
                            h_tmp = h_tmp + mpVideoBotH;
                        }
                        a_tmp.setAttribute("width", w_tmp);
                        a_tmp.setAttribute("height", h_tmp);
                    };
                })(a), 100); //要稍微延时一些再set宽高，否则横屏切换竖屏会导致iframe内部可以滚动了
            }
        }
    }, false);
})(window);

/**
 * 微信视频播放器
 */
function WxVideo(config, callback) {
    this.playerConfig = null;
    this.videoUrl = '//mp.weixin.qq.com/mp/videoplayer';
    this.iframe = null;
    this.sizeRate = 3 / 4;

    // 设置微信视频播放器参数
    this.playerConfig = _.extend({
        vid: null, // 腾讯视频id
        width: "100%", // 根据高度计算得来，比例固定为宽高比4：3
        height: 300, // 播放器高度
        modId: "WxMomentVideo", // 播放区域容器
        xd: 1, // 不显示广告
        dd: 1, // 暂停时不显示跳转腾讯视频APP的banner
        vl: 1, // 不显示推荐视频
        zs: 1, // 不显示赞赏
    }, config);

    this.playerConfig.height = this.countHeight();

    if (!this.playerConfig.vid) {
        console.log('请设置视频 vid');
        return;
    }

    this._initPlayer();
}

// 初始化播放器
WxVideo.prototype._initPlayer = function() {
    var url = this.videoUrl + '?video_h=' + this.playerConfig.height;
    var params = ['vid', 'xd', 'dd', 'vl', 'zs'];

    for (var i = 0, l = params.length; i < l; i++) {
        url += '&' + params[i] + '=' + this.playerConfig[params[i]];
    }

    this.iframe = document.createElement('iframe');
    this.iframe.width = this.playerConfig.width;
    this.iframe.height = this.playerConfig.height;
    this.iframe.style.borderWidth = 0;
    this.iframe.style.opacity = 1;
    this.iframe.style.visibility = "visible";
    this.iframe.src = url;

    // 将iframe 的container 作为属性存储在iframe的dom上
    this.iframe.setAttribute('wxm-container', this.playerConfig.modId);

    document.getElementById(this.playerConfig.modId).appendChild(this.iframe);
};

// 根据播放区域宽度计算出高度，宽高比例4:3
WxVideo.prototype.countHeight = function() {
    // 如果设置的是100%，要去获取容器宽度
    if(this.playerConfig.width == "100%"){
        return document.getElementById(this.playerConfig.modId).offsetWidth * this.sizeRate;
    }else{
        return this.playerConfig.width * this.sizeRate;
    }
};

// 重置播放容器区域，只接收height参数，width由计算得出
WxVideo.prototype.resize = function(width) {
    if(width){
        this.playerConfig.width = width;
    }
    this.playerConfig.height = this.countHeight();
    this.iframe.width = this.playerConfig.width;
    this.iframe.height = this.playerConfig.height;
};

module.exports = WxVideo;