
"node bot.js"

でボットを実行します。

永続化する場合は、

"forever start bot.js  -l ./bot.log"

とか

"grunt"

でbotmain以下のtsをjsにコンパイルします


メモ

tsdでモジュール定義追加

tsd query モジュール名 --action install --resolve --save

