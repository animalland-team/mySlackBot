/// <reference path="../typings/tsd.d.ts" />

var Slack = require('./node-slack-client/client');
var http = require('http');
var querystring = require('querystring');

var ADMIN_USERS:string[] = ['harayoki', 'tkt', 'kenbu', 'ryota', 'charlie'];

// TODO d.tsが用意できたらInterfaceを削除

var MESSAGE_TYPES = {
    MESSAGE : 'message',
}

interface IChannel {
    is_member:boolean;
    is_channel:boolean;
    name:string;
    send(text:string):void;
}

interface IGroup {
    is_open:boolean;
    is_archived:boolean;
    name:string;
}

interface IUser {
    name:string;
    id:string;
}

interface IMessage {
    channel:string;
    user:string;
    type:string;
    text:string;
    ts:string; //timestamp?
}

interface ISlack {
    on(type:string, handler:Function):void;
    login():void;
    getChannelGroupOrDMByID(id:string):IChannel;
    getUserByID(id:string):IUser;
    channels:any; // IChannelのObject型 型定義の仕方わからず
    groups:any; // IGroupのObject型 型定義の仕方わからず
    self:IUser; // IUserかな？
    team:any; // とりあえずany
}

class BotMain {

    private _slack:ISlack;
    private _channelRandom:IChannel;
    private _botUser:IUser;

    constructor() {
        console.log('BotMain instantiated.');
        http.createServer(this._handleHttpRequest.bind(this)).listen(process.env.PORT || 5000);
    }

    start(token:string):void {
        var autoReconnect = true;
        var autoMark = true;
        this._slack = new Slack(token, autoReconnect, autoMark);
        this._slack.on('open', this.onOpen.bind(this));
        this._slack.on('error', this.onError.bind(this))
        this._slack.on('message', this.onMessage.bind(this));
        this._slack.login();
    }

    private onOpen():void {
        console.log('onOpen');

        var id:string;
        var channels:string[] = [];
        var channel:IChannel;
        var groups:string[] = [];
        var group:IGroup;

        for(id in this._slack.channels) {
            channel = this._slack.channels[id];
            if (channel.is_member) {
                channels.push('#' + channel.name + ' (' + id + ')');
                if(channel.name === 'random') {
                    this._channelRandom = channel;
                }
            }
        }
        for(id in this._slack.groups) {
            group = this._slack.groups[id];
            if (group.is_open && !group.is_archived) {
                groups.push(group.name);
            }
        }
        this._botUser = this._slack.self;
        console.log("Welcome to Slack. You are @" + this._botUser.name + " of " + this._slack.team.name);
        console.log('You are in: ' + channels.join(', '));
        console.log('As well as: ' + groups.join(', '));
        console.log('random channel : ' , this._channelRandom ? '#' + this._channelRandom.name : 'N / A');

    }

    private onError(error:string):void {
        // errorはstring型だと思う
        return console.error("Error: " + error);
    }

    private onMessage(message:IMessage):void {
        var channel:IChannel = this._slack.getChannelGroupOrDMByID(message.channel);
        var user:IUser = this._slack.getUserByID(message.user);
        var type:string = message.type;
        var text:string = message.text;
        var timeStamp:string = message.ts;
        var channelName:string = 'UNKNOWN_CHANNEL';
        var userName:string = 'UNKNOWN_USER';
        if(channel && channel.name) {
            channelName = channel.name;
        }
        if(user && user.name) {
            userName = user.name;
        }
        console.log('Received(' + type + ') channel: #' + channelName,'user: @' + userName, '"' + text + '"', timeStamp);
        if (type === MESSAGE_TYPES.MESSAGE && text && channel) {
            if (channelName === userName && ADMIN_USERS.indexOf(userName) >= 0) {
                // プライベートメッセージ(チャンネル名＝ユーザ名)がきたら、そのままrandomチャンネルに投げるよ
                this._handleDirectMessage(user, text);
            } else {
                this._handleMessage(channel, user, text);
            }
        }

    }

    private _handleDirectMessage(user:IUser, text:string):void {
        this._talkInRandomChannel(text);
    }

    private _talkInRandomChannel(text:string):void {
        if(this._channelRandom) {
            this._channelRandom.send(text);
        }
    }

    private _handleMessage(channel:IChannel, user:IUser, text:string = ''):void {

        var reg:RegExp = new RegExp('<@'+this._botUser.id+'>: .*')
        var mentioned:boolean = reg.test(text);
        if(!mentioned) return;

        // メンション後部分を取り出す
        text = text.split(' ').slice(1).join(' ');

        // TODO ここで正規表現とか使っていろいろ処理
        if(/^(ping|PING)$/.test(text)) {
            channel.send('PONG');
        }

    }

    private _handleHttpRequest(request:any, response:any):void {
        var url:string = request.url;
        var text:string = querystring.unescape(url.slice(1));
        response.writeHead(200, {"Content-Type": 'text/plain'});
        response.write('Animal land is alive!\n');
        response.write(request.method + ' '+ url + '\n');
        response.write(text + '\n');
        response.end();

        if(text && text.length > 0) {
            this._talkInRandomChannel(text);
        }
    }

}
export = BotMain;
