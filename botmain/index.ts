/// <reference path="../typings/tsd.d.ts" />

var Slack = require('../node-slack-client');

var CHANNEL_ID_RANDOM = "C04TG7DQ1";
var USER_NAME_HARAYOKI = "harayoki";

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
}

interface IMessage {
    channel:string;
    user:string;
    type:string;
    text:string;
    ts:any; //timestamp?
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

    constructor() {
        console.log('BotMain instantiated.');
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
                channels.push("#" + channel.name);
            }
            channels.push();
        }
        for(id in this._slack.groups) {
            group = this._slack.groups[id];
            if (group.is_open && !group.is_archived) {
                groups.push(group.name);
            }
        }
        console.log("Welcome to Slack. You are @" + this._slack.self.name + " of " + this._slack.team.name);
        console.log('You are in: ' + channels.join(', '));
        console.log('As well as: ' + groups.join(', '));

        this._channelRandom = this._slack.getChannelGroupOrDMByID(CHANNEL_ID_RANDOM);

    }

    private onError(error:string):void {
        // string型だと思う
        return console.error("Error: " + error);
    }

    private onMessage(message:IMessage):void {
        var channel:IChannel = this._slack.getChannelGroupOrDMByID(message.channel);
        var user:IUser = this._slack.getUserByID(message.user);
        var type:string = message.type;
        var text:string = message.text;
        var timeStamp:any = message.ts;
        var channelName:string = 'UNKNOWN_CHANNEL';
        var userName:string = 'UNKNOWN_USER';
        if(channel && channel.is_channel) {
            channelName = '#' + channel.name;
        }
        if(user && user.name) {
            userName = '#' + user.name;
        }
        console.log('Received(' + type + ') channel:' + channelName,'user:',userName, '"' + text + '"', timeStamp);
        if (type === MESSAGE_TYPES.MESSAGE && text && channel) {
            if (channelName === USER_NAME_HARAYOKI) {
                // プライベートメッセージがきたらそのままrandomチャンネルに投げるよ
                this._handleDirectMessage(user, text);
            } else {
                this._handletMessage(channel, user, text);
            }
        }

    }

    private _handleDirectMessage(user:IUser, text:string):void {
        this._channelRandom.send(text);
    }

    private _handletMessage(channel:IChannel, user:IUser, text:string):void {
        // TODO ここで正規表現とか使って処理
    }

}
export = BotMain;
