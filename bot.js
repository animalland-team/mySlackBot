var fs = require('fs');

var TOKEN_FILE = '.token';
var hasToken = fs.existsSync(TOKEN_FILE);
if(!hasToken) {
    console.log('can not find .token file');
    process.exit(1);
}
var text = fs.readFileSync('.token', 'utf-8');
console.log(text);

