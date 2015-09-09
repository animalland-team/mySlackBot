var fs = require('fs');
var BotMain = require('./botmain');

var TOKEN_FILE = '.token';
var hasToken = fs.existsSync(TOKEN_FILE);
if(!hasToken) {
    console.log('can not find .token file');
    process.exit(1);
}
var token = fs.readFileSync('.token', 'utf-8');
var botmain = new BotMain(token);
botmain.start(token);
