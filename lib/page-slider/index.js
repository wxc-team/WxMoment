/**
 * @author  : littledu
 * @version : 0.2.2
 * @date    : 2015-07-24
 * @repository: https://github.com/littledu/PageSlider
 */

var AnalyticsCommon = require('../analytics/analyticsCommon.js');

//默认参数
var defaults = {
    direction: 'vertical',    //滚动方向：vertical/horizontal
    currentClass: 'current',  //当前 className
    gestureFollowing: false,  //是否需要手势跟随
    hasDot: false,            //是否生成标识点
    rememberLastVisited: false,
    preventDefault: true,
    animationPlayOnce: false,
    dev: false,               //开发模式，传入数值，直接跳到正在开发的屏数
    onSwipeUp: function () {  //swipeUp 回调
    },
    onSwipeDown: function () {//swipeDown 回调
    },
    onSwipeLeft: function () {//swipeLeft 回调
    },
    onSwipeRight: function () {//swipeRight 回调
    },
    oninit: function () {     //初始化完成时的回调
    },
    onbeforechange: function () {  //开始切换前的回调
    },
    onchange: function () {   //每一屏切换完成时的回调
    }
};

//一些辅助全局变量
var pageWidth = document.documentElement.clientWidth,
    pageHeight = document.documentElement.clientHeight,
    curPage,
    lockNext,
    lockPrev,
    state,
    startPos,
    offset,
    pageScrollTop;

function PageSlider(options) {
    $.extend(this, defaults, options);

    if (this.pages.length <= 0) {
        throw new Error('target para not pass');
    }

    this.target = this.pages.eq(0).parent();
    this.length = this.pages.length;
    this.moveTo = PageSlider.prototype.moveTo;
    this.index = 0;
    this.timer = null;

    if (this.direction === 'vertical' || this.direction === 'v') {
        this.direction = 'v';
    }

    if (this.direction === 'horizontal' || this.direction === 'h') {
        this.direction = 'h';
    }

    if (this.length <= 1) return;

    this._init();
}

PageSlider.prototype = {
    _init: function () {
        var self = this;

        //初始化CSS动画，好让滑动有缓动效果
        this.target.css('-webkit-transition', '-webkit-transform 0.5s ease');

        //初始化设置每一屏的宽高
        this._reset();

        //如果是长页面
        this.pages.each(function () {
            var $this = $(this),
                $PageSliderWraper = $this.wrapInner('<div class="PageSlider__wraper"></div>').find('.PageSlider__wraper'),
                height = $PageSliderWraper.height();


            //当子元素高度超过页面时，需滚完再切换
            if (height > pageHeight) {
                $this.data('height', height);
                $this.css('overflow', 'auto');
            }

            //再清除辅助层
            $PageSliderWraper.children().unwrap();
        });

        //如果是横向滚动
        if (this.direction === 'h') {
            this.pages.css('float', 'left');
        }

        //如果需要生成屏标识
        if (this.hasDot) {
            this._createDot();
        }

        //绑定动态动画效果
        self._bindAnimation();

        this.target.on('touchstart', function (e) {
            self._startHandle(e);
        });

        this.target.on('touchmove', function (e) {
            self._moveHandle(e);
        });

        this.target.on('touchend', function (e) {
            self._endHandle(e);
        });

        $(window).on('resize', function () {
            self._reset();
            self.moveTo(self.index, true);
        });

        //如果需要记住上次访问的屏索引
        if (this.rememberLastVisited) {
            this.lastVisitedIndex = this._getLastVisited();
        }

        //初始化时不再直接调用 moveTo, 免得初始化时还会回调一次 onchange 等接口 from 0.2.2
        //this.moveTo(this.index, true);
        this.target.css('-webkit-transform', 'translate(0, 0)');
        this.pages.eq(0).addClass(this.currentClass);

        this.oninit.call(this);

        this._dev();
    },

    _startHandle: function (e) {
        var touch = e.touches[0];

        //如果动画在执行中则不予以操作
        if (state === 'running') {
            e.preventDefault();
            return;
        }

        startPos = this.direction === 'v' ? touch.clientY : touch.clientX;

        //是否禁止滑屏参数获取
        curPage = this.pages.eq(this.index);
        lockNext = curPage.data('lock-next');
        lockPrev = curPage.data('lock-prev');

        //是否是长页面
        curPage[0].pageScrollHeight = curPage.data('height');
        if (curPage[0].pageScrollHeight) {
            this.preventDefault = false;
            pageScrollTop = pageHeight + curPage.scrollTop();
        }

        //手势跟随判断
        if (this.gestureFollowing) {
            //获取当前的位置值
            var valArr = this.target.css('-webkit-transform').match(/translate\((-?\d+)px,\s+(-?\d+)px.*\)/);
            offset = parseFloat(this.direction === 'v' ? valArr[2] : valArr[1]);
        }
    },

    _moveHandle: function (e) {
        var touch = e.changedTouches[0],
            distance,
            endPos;

        //如果动画在执行中则不予以操作
        if (state === 'running') {
            e.preventDefault();
            return;
        }

        endPos = this.direction === 'v' ? touch.clientY : touch.clientX;
        distance = endPos - startPos;

        //如果存在长页面，需多判断一下，以阻止默认行为
        if (curPage[0].pageScrollHeight) {
            if (distance > 0 && pageScrollTop === pageHeight) e.preventDefault();

            if (distance < 0 && pageScrollTop === curPage[0].pageScrollHeight) e.preventDefault();
        }

        //如果不需要手势跟随，直接返回
        if (!this.gestureFollowing) {
            this._preventDefault(e);
            return;
        }

        //下面是在有手势跟随时的一些情况
        //1. 如果在第一屏或最后一屏，直接返回
        if ((this.index <= 0 && endPos > startPos) || (this.index >= this.length - 1 && endPos < startPos)) {
            e.preventDefault();
            return;
        }

        //2. 如果向上或向下被禁止，直接返回
        if ((distance > 0 && lockPrev) || distance < 0 && lockNext) {
            e.preventDefault();
            return;
        }

        //3. 没有特殊情况，需要手势跟随了，则
        distance = offset + distance + 'px';

        //移除动画缓动
        this._removeTransition();

        if (this.direction === 'v') {
            this.target.css('-webkit-transform', 'translate(0, ' + distance + ')');
        } else {
            this.target.css('-webkit-transform', 'translate(' + distance + ', 0)');
        }


        this._preventDefault(e);
    },

    _endHandle: function (e) {
        var touch = e.changedTouches[0],
            distance,
            endPos;

        //如果动画在执行中则不予以操作
        if (state === 'running') {
            e.preventDefault();
            return;
        }

        endPos = this.direction === 'v' ? touch.clientY : touch.clientX;
        distance = endPos - startPos;


        //设置动画缓动
        this._setTransition();

        //swipeDown
        if (distance > 0) {
            this.direction === 'v' ? this.onSwipeDown.call(this) : this.onSwipeRight.call(this);

            if (!lockPrev) {
                //如果是长页面，需判断一下是否到顶
                if (curPage[0].pageScrollHeight && pageScrollTop > pageHeight) {
                    return;
                } else if (distance > 20) {
                    this.prev();
                } else {
                    this.moveTo(this.index);
                }
            }
        }

        //swipeUp
        if (distance < 0) {
            this.direction === 'v' ? this.onSwipeUp.call(this) : this.onSwipeLeft.call(this);

            if (!lockNext) {
                //如果是长页面，需判断一下是否到底
                if (curPage[0].pageScrollHeight && pageScrollTop < curPage[0].pageScrollHeight) {
                    return;
                } else if (distance < -20) {
                    this.next();
                } else {
                    this.moveTo(this.index);
                }
            }
        }
    },

    moveTo: function (index, direct) {
        var distance,
            self = this;

        state = 'running';

        direct = direct || false;

        var type, name;
        if(Math.abs(index - this.index) > 1){
            type = 'pageSliderMoveWxm';
        }else if((index - this.index) > 0){
            type = 'pageSliderDownWxm';
        }else if((index - this.index) < 0){
            type = 'pageSliderUpWxm';
        }else if((index - this.index) == 0){
            type = 'pageResizeWxm'
        }
        if(index >= this.length){
            name = 'bottom';
        }else if(index < 0){
            name = 'top';
        }else{
            name = this.index + 'to' + index;
        }
        AnalyticsCommon.sendEvent(type, name);

        if (index >= this.length || index < 0) {
            state = 'end';
            return;
        }

        direct && this._removeTransition();

        this.onbeforechange.call(this);

        if (this.direction === 'v') {
            distance = -index * pageHeight + 'px';
            this.target.css('-webkit-transform', 'translate(0, ' + distance + ')');
        }

        if (this.direction === 'h') {
            distance = -index * pageWidth + 'px';
            this.target.css('-webkit-transform', 'translate(' + distance + ', 0)');
        }

        clearTimeout(this.timer);
        this.timer = setTimeout(function () {
            self._currentClass(index);
            self.prevIndex = self.index;
            self.index = index;
            self.onchange.call(self);

            direct && self._setTransition();

            //如果是较长的页面，在翻屏时，重置滚动条位置
            if (curPage && curPage[0].pageScrollHeight) {
                self.preventDefault = true;
                curPage.scrollTop(0);
            }

            self.rememberLastVisited && self._saveLastVisited();

            state = 'end';
            clearTimeout(this.timer);
        }, 500);
    },

    prev: function () {
        this.moveTo(this.index - 1);
    },

    next: function () {
        this.moveTo(this.index + 1);
    },

    _setTransition: function () {
        this.target.css('-webkit-transition', '-webkit-transform 0.5s ease');
    },

    _removeTransition: function () {
        this.target.css('-webkit-transition', 'none');
    },

    _currentClass: function (index) {
        var currentClass = this.currentClass;

        this.pages.eq(index).addClass(currentClass);
        if (index !== this.index && !this.animationPlayOnce) {
            this.pages.eq(this.index).removeClass(currentClass);
        }
    },

    _reset: function () {
        var direction = this.direction;

        pageWidth = document.documentElement.clientWidth;
        pageHeight = document.documentElement.clientHeight;

        this.pages.each(function () {
            var $this = $(this);

            $this.width(pageWidth + 'px');
            $this.height(pageHeight + 'px');
        });

        if (direction === 'v') {
            this.target.width(pageWidth + 'px');
            this.target.height(pageHeight * this.length + 'px');
        }

        if (direction === 'h') {
            this.target.width(pageWidth * this.length + 'px');
            this.target.height(pageHeight + 'px');
        }
    },

    _createDot: function () {
        var dots = '';

        for (var i = 0; i < this.length; i++) {
            dots += '<li>' + (i + 1) + '</li>';
        }

        $(dots).appendTo(this.target).wrapAll('<ul class="dot-list">');
    },

    _saveLastVisited: function () {
        var storage = window.localStorage;

        if (storage) {
            storage.setItem('pageSliderIndex', this.index);
        }
    },

    _getLastVisited: function () {
        var storage = window.localStorage;

        if (storage) {
            this.cacheIndex = storage.getItem('pageSliderIndex');
            return parseInt(this.cacheIndex);
        }
    },

    _bindAnimation: function () {
        var self = this,
            styleText = '<style>';

        $('[data-animation]').each(function (index) {
            var $this = $(this),
                dataAnimation = $this.data('animation'),
                animationName = dataAnimation['name'],
                animationDuration = dataAnimation['duration'] || 500,
                animationDelay = dataAnimation['delay'] || 0,
                animationTimeFunction = dataAnimation['timing-function'] || 'ease',
                animationFillMode = dataAnimation['fill-mode'] || 'both',
                animationIterationCount = dataAnimation['iteration-count'] || 1;

            $this.data('animationid', ++index);

            styleText += '.' + self.currentClass +
            ' ' +
            '[data-animationid="' + index + '"]' +
            '{' +
            '-webkit-animation-name: ' + animationName + ';' +
            '-webkit-animation-duration: ' + animationDuration + 'ms;' +
            '-webkit-animation-delay: ' + animationDelay + 'ms;' +
            '-webkit-animation-timing-function: ' + animationTimeFunction + ';' +
            '-webkit-animation-fill-mode: ' + animationFillMode + ';' +
            '-webkit-animation-iteration-count: ' + animationIterationCount + ';' +
            '}';

        });

        styleText + '</style>';
        $('head').eq(0).append(styleText);
    },

    _preventDefault: function (e) {
        this.preventDefault && e.preventDefault();
    },

    _dev: function () {
        if (this.dev !== false) {
            this.moveTo(this.dev, true);
        }
    }
}

module.exports = PageSlider;