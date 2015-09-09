/// <reference path="../typings/tsd.d.ts" />

class BotMain {
    private _token:string;
    constructor() {
    }
    start(token:string) {
        this._token = token;
        console.log('BotMain start..');
    }
}
export = BotMain;
