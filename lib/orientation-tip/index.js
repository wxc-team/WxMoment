/**
 * 旋屏提示
 */
var $ = require('zepto');
var tpl = require('./template.html');

module.exports = function () {

    // 初始化 DOM
    if(!$('#qr-box__img').length)
	    $('body').append(tpl);

	// 插图图片
    Zepto(function ($) {

    	// 插入二维码
        var img_url = $('meta[name="wxm:link"]').attr('content');
        if(!img_url)
        	img_url = window.location.href;
        img_url = encodeURIComponent(img_url);
        $('#qr-box__img').attr('style', 'background-image:url(https://game.weixin.qq.com/cgi-bin/comm/qrcode?s=10&m=1&d=' + img_url + ')');
        
        // 插入缩略图
        var thumb_img = $('meta[name="wxm:img_url"]').attr('content');
        if (thumb_img)
        	$('#qr-box__thumb').attr('style', 'background-image:url(' + thumb_img + ')');
    })

};
