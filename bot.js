var fs = require('fs');
var BotMain = require('./botmain');

var args = process.argv.slice(2);

//args.forEach(function (val, index) {
//    console.log(index + ': ' + val);
//});

var token = args[0];

if(!token) {
    var TOKEN_FILE = '.token';
    var hasToken = fs.existsSync(TOKEN_FILE);
    if(!hasToken) {
        console.log('can not find .token file');
        process.exit(1);
    }
    token = fs.readFileSync('.token', 'utf-8');
}

(new BotMain()).start(token);
