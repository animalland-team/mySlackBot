/// <reference path="../typings/tsd.d.ts" />
var Slack = require('./node-slack-client/client');
var http = require('http');
var querystring = require('querystring');
var ADMIN_USERS = ['harayoki', 'tkt', 'kenbu', 'ryota', 'charlie'];
// TODO d.tsが用意できたらInterfaceを削除
var MESSAGE_TYPES = {
    MESSAGE: 'message',
};
var BotMain = (function () {
    function BotMain() {
        console.log('BotMain instantiated.');
        http.createServer(this._handleHttpRequest.bind(this)).listen(process.env.PORT || 5000);
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
                if (channel.name === 'random') {
                    this._channelRandom = channel;
                }
            }
        }
        for (id in this._slack.groups) {
            group = this._slack.groups[id];
            if (group.is_open && !group.is_archived) {
                groups.push(group.name);
            }
        }
        this._botUser = this._slack.self;
        console.log("Welcome to Slack. You are @" + this._botUser.name + " of " + this._slack.team.name);
        console.log('You are in: ' + channels.join(', '));
        console.log('As well as: ' + groups.join(', '));
        console.log('random channel : ', this._channelRandom ? '#' + this._channelRandom.name : 'N / A');
    };
    BotMain.prototype.onError = function (error) {
        // errorはstring型だと思う
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
        if (channel && channel.name) {
            channelName = channel.name;
        }
        if (user && user.name) {
            userName = user.name;
        }
        console.log('Received(' + type + ') channel: #' + channelName, 'user: @' + userName, '"' + text + '"', timeStamp);
        if (type === MESSAGE_TYPES.MESSAGE && text && channel) {
            if (channelName === userName && ADMIN_USERS.indexOf(userName) >= 0) {
                // プライベートメッセージ(チャンネル名＝ユーザ名)がきたら、そのままrandomチャンネルに投げるよ
                this._handleDirectMessage(user, text);
            }
            else {
                this._handleMessage(channel, user, text);
            }
        }
    };
    BotMain.prototype._handleDirectMessage = function (user, text) {
        this._talkInRandomChannel(text);
    };
    BotMain.prototype._talkInRandomChannel = function (text) {
        if (this._channelRandom) {
            this._channelRandom.send(text);
        }
    };
    BotMain.prototype._handleMessage = function (channel, user, text) {
        if (text === void 0) { text = ''; }
        var reg = new RegExp('<@' + this._botUser.id + '>: .*');
        var mentioned = reg.test(text);
        if (!mentioned)
            return;
        // メンション後部分を取り出す
        text = text.split(' ').slice(1).join(' ');
        // TODO ここで正規表現とか使っていろいろ処理
        if (/^(ping|PING)$/.test(text)) {
            channel.send('PONG');
        }
    };
    BotMain.prototype._handleHttpRequest = function (request, response) {
        var url = request.url;
        var text = querystring.unescape(url.slice(1));
        response.writeHead(200, { "Content-Type": 'text/plain' });
        response.write('Animal land is alive!\n');
        response.write(request.method + ' ' + url + '\n');
        response.write(text + '\n');
        response.end();
        if (text && text.length > 0) {
            this._talkInRandomChannel(text);
        }
    };
    return BotMain;
})();
module.exports = BotMain;
