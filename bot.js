var fs = require('fs');
var BotMain = require('./botmain');

var TOKEN_FILE = '.token';
var args = process.argv.slice(2);

var token = args[0];

if(token) {
    // コマンドライン引数からtokenが見つかった
    console.log('found token from argv.');
}

if(!token) {
    token = process.env.ENV_SLACK_BOTS_TOKEN;
    if(token) {
        // 環境変数からtokenが見つかった
        console.log('found token fron env.ENV_SLACK_BOTS_TOKEN.');
    }
}

if(!token) {
    var hasToken = fs.existsSync(TOKEN_FILE);
    if(!hasToken) {
        token = fs.readFileSync('.token', 'utf-8');
        if(token) {
            // 環境変数からtokenが見つかった
            console.log('found token from .token file.');
        }
    }
}

if(!token) {
    console.log('could not find token.');
    process.exit(1);
}

// console.log('token=',token);

(new BotMain()).start(token);
