# WxMoment

### 开发指南


安装依赖

```
npm install
```

运行服务 

```
node server.js
```

编译JS

```
component build --name wxmoment
gulp build
```


##更新记录

2015-08-17

 * 修复统计模块中sendEvent上报问题
 * 默认统计增加页面来源pv统计，取url中from参数来判定来源（微信分享中，分享给朋友from=singlemessage，分享到朋友圈from=timeline，开发者若要区别其他渠道的来源可在url中加上from=xxx的参数）