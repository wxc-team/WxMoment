"use strict";

var _ = require('underscore');
var Analytics = require("analytics");
var PxLoader = require("loader");
var OrientationTip = require("orientation-tip");
var PageSlider = require("page-slider");
var Share = require("share");
var Video = require("video");
var Form = require("form");
var WxVideo = require("wxvideo");

var WxMoment = function (options) {
    this.version = '0.0.3';

    //默认配置
    this.options = {};

    //初始化配置
    this.options = _.extend(this.options, options);

    //赋值模块
    this.Loader = PxLoader;
    this.Analytics = Analytics;
    this.PageSlider = PageSlider;
    this.Share = Share;
    this.OrientationTip = OrientationTip;
    this.Video = Video;
    this.Form = Form;
    this.WxVideo = WxVideo;
};

// Date.now() shim for older browsers
if (!Date.now) {
    Date.now = function now() {
        return new Date().getTime();
    };
}

// shims to ensure we have newer Array utility methods
// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/isArray
if (!Array.isArray) {
    Array.isArray = function (arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
    };
}

module.exports = window.WxMoment = new WxMoment();


