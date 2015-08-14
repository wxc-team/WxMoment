var serveComponent = require('component-middleware');
var serveStatic = require('serve-static');
var express = require('express');
var app = express();

app.use(serveComponent());
app.use(serveStatic(__dirname));
app.use(serveStatic(__dirname + '/lib'));

app.get('/', function (req, res) {
    res.send('Hello WxMoment!');
});

var server = app.listen(30001, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);

});