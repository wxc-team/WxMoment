/**
 * 统计
 */
var analyticsCommon = require('./analyticsCommon');



function Analytics(config) {
    analyticsCommon.setConfig(config);
}


Analytics.prototype.sendEvent = function (category, name) {
    analyticsCommon.sendEvent(category, name, analyticsCommon.config.projectName);
};

module.exports = Analytics;