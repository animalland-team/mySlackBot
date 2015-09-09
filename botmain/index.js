/// <reference path="../typings/tsd.d.ts" />
var BotMain = (function () {
    function BotMain() {
    }
    BotMain.prototype.start = function (token) {
        this._token = token;
        console.log('BotMain start..');
    };
    return BotMain;
})();
module.exports = BotMain;
