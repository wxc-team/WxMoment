var _ = require('underscore');

/**
 * 腾讯视频
 */

var video, player, playerConfig;

function _sendEvent (name) {
    if (typeof pgvSendClick === "function" && !!name && !!window.projectName) {
        pgvSendClick({hottag: 'WXM.' + window.projectName + ".videoWxm." + name});
    }
}

function Video(config, callback) {

    //设置腾讯视频播放器参数
    playerConfig = _.extend({
        vid: null,
        width: '100%',//视频尺寸设置100%表示根据父容器长宽自适应
        height: '100%',
        modId: "WxMomentVideo",
        isHtml5ControlAlwaysShow: false,//HTML5播放器是否一直显示控制栏
        isHtml5UseUI: true,//HTML5播放器是否使用自设计的控制栏
        html5LiveUIFeature: false,//HTML5直播播放器UI组件
        isHtml5UseFakeFullScreen: false,//是否强制使用伪全屏
        //isiPhoneShowPlaysinline: true,
        playerType:'html5',//使用 HTML5 播放器，不支持 IE
        noLimitBtn: true,//禁止显示腾讯视频右下角高清banner
        isiPhoneShowPosterOnPause : false,//设置暂停显示当前帧，仅微信内有效
        isHtml5ShowLoadingAdOnStart: false,//是否展示腾讯视频前的广告
        isHtml5ShowLoadingAdOnChange: false,
        vodFlashExtVars: {//flash点播播放器扩展flashvars参数
            share: 0,
            follow: 0,
            showlogo: 0,
            clientbar: 0
        },
        plugins: {
            AppBanner: 0,//是否显示提示下载App的banner
            AppRecommend: 0//是否显示播放技术后的推荐视频
        },
        autoplay: false,//是否自动播放
    }, config);

    playerConfig.oninited = function () {
        //播放器在视频载入完毕触发
        _sendEvent('oninited');
        if(config.oninited === 'function'){
            config.oninited();
        }
    }

    playerConfig.onplaying = function () {
        //播放器真正开始播放视频第一帧画面时
        _sendEvent('onplaying');
        if(config.onplaying === 'function'){
            config.onplaying();
        }
    }

    playerConfig.onpause = function () {
        //播放器触发暂停时，目前只针对HTML5播放器有效
        _sendEvent('onpause');
        if(config.onpause === 'function'){
            config.onpause();
        }
    }

    playerConfig.onresume = function () {
        //暂停后继续播放时触发
        _sendEvent('onresume');
        if(config.onresume === 'function'){
            config.onresume();
        }
    }

    playerConfig.onallended = function () {
        //播放器播放完毕时
        _sendEvent('onallended');
        if(config.onallended === 'function'){
            config.onallended();
        }
    }

    playerConfig.onfullscreen = function (isfull) {
        //onfullscreen(isfull) 播放器触发全屏/非全屏时，参数isfull表示当前是否是全屏
        _sendEvent('onfullscreen');
        if(config.onfullscreen === 'function'){
            config.onfullscreen();
        }
    }


    if (!playerConfig.vid) {
        console.log('请设置视频 vid');
        return;
    }

    loadPlayerRes();
    return player;
}

Video.prototype.getPlayer = function(){
    return player.getPlayer();
};

function loadPlayerRes() {
    var head = document.getElementsByTagName("head")[0] || document.documentElement;
    var script = document.createElement("script");
    script.async = "true";
    script.src = "http://imgcache.gtimg.cn/tencentvideo_v1/tvp/js/tvp.player_v2_zepto.js";

    var done = false;

    // 加载完毕后执行
    script.onload = script.onreadystatechange = function () {
        if (!done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
            done = true;
            try {
                initPlayer();
            } catch (err) {
            }
            script.onload = script.onreadystatechange = null;
        }
    };

    head.insertBefore(script, head.firstChild);
}

// 初始化播放器
function initPlayer() {

    video = new tvp.VideoInfo();
    player = new tvp.Player();

    video.setVid(playerConfig.vid);

    playerConfig.video = video;
    player.create(playerConfig);

    //video.setPoster(); //设置视频缩略图方法
}

module.exports = Video;