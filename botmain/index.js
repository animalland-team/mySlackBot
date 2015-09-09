/// <reference path="../typings/tsd.d.ts" />
var Slack = require('../node-slack-client');
var ADMIN_USERS = ['harayoki', 'tkt', 'kenbu', 'ryota', 'charlie'];
// TODO d.tsが用意できたらInterfaceを削除
var MESSAGE_TYPES = {
    MESSAGE: 'message',
};
var BotMain = (function () {
    function BotMain() {
        console.log('BotMain instantiated.');
    }
    BotMain.prototype.start = function (token) {
        var autoReconnect = true;
        var autoMark = true;
        this._slack = new Slack(token, autoReconnect, autoMark);
        this._slack.on('open', this.onOpen.bind(this));
        this._slack.on('error', this.onError.bind(this));
        this._slack.on('message', this.onMessage.bind(this));
        this._slack.login();
    };
    BotMain.prototype.onOpen = function () {
        console.log('onOpen');
        var id;
        var channels = [];
        var channel;
        var groups = [];
        var group;
        for (id in this._slack.channels) {
            channel = this._slack.channels[id];
            if (channel.is_member) {
                channels.push('#' + channel.name + ' (' + id + ')');
            }
            if (channel.name == 'random') {
                this._channelRandom = channel;
            }
        }
        for (id in this._slack.groups) {
            group = this._slack.groups[id];
            if (group.is_open && !group.is_archived) {
                groups.push(group.name);
            }
        }
        console.log("Welcome to Slack. You are @" + this._slack.self.name + " of " + this._slack.team.name);
        console.log('You are in: ' + channels.join(', '));
        console.log('As well as: ' + groups.join(', '));
    };
    BotMain.prototype.onError = function (error) {
        // string型だと思う
        return console.error("Error: " + error);
    };
    BotMain.prototype.onMessage = function (message) {
        var channel = this._slack.getChannelGroupOrDMByID(message.channel);
        var user = this._slack.getUserByID(message.user);
        var type = message.type;
        var text = message.text;
        var timeStamp = message.ts;
        var channelName = 'UNKNOWN_CHANNEL';
        var userName = 'UNKNOWN_USER';
        if (channel && channel.is_channel) {
            channelName = channel.name;
        }
        if (user && user.name) {
            userName = user.name;
        }
        console.log('Received(' + type + ') channel: #' + channelName, 'user: @' + userName, '"' + text + '"', timeStamp);
        if (type === MESSAGE_TYPES.MESSAGE && text && channel) {
            if (channelName === userName && ADMIN_USERS.indexOf(userName)) {
                // プライベートメッセージ(チャンネル名＝ユーザ名)がきたら、そのままrandomチャンネルに投げるよ
                this._handleDirectMessage(user, text);
            }
            else {
                this._handletMessage(channel, user, text);
            }
        }
    };
    BotMain.prototype._handleDirectMessage = function (user, text) {
        if (this._channelRandom) {
            this._channelRandom.send(text);
        }
    };
    BotMain.prototype._handletMessage = function (channel, user, text) {
        if (text === void 0) { text = ''; }
        // TODO ここで正規表現とか使って処理
        var reg = /^(ping|PING)$/;
        if (reg.test(text)) {
            channel.send('PONG');
        }
    };
    return BotMain;
})();
module.exports = BotMain;
