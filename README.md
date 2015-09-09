Slackボットです。

・botにプライべートメッセージを送ると、その内容でrandomチャンネルに話しかけます

・立ち上がったwebサーバー(通常port:5000)にアクセスしたURL欄の内容でrandomチャンネルに話しかけます

ex) http://localhost:5000/こんにちは

#### 準備 ####

`npm install`

#### botトークンの指定 ####

slackのBots管理画面から入手

https://animalland.slack.com/services/new

環境変数で指定するか

`export ENV_SLACK_BOTS_TOKEN=your_token_here`

実行時にコマンド引数で指定するか

`node bot.js your_token_here`

.tokenファイルにあらかじめトークンを書いておくか、します。

herokuで動かす場合は、

`heroku config:set ENV_SLACK_BOTS_TOKEN='your_token_here'`

#### 実行 ####

`node bot.js`

永続化する場合は、

`forever start bot.js`

Herokuの場合は

`heroku create your_app_name` (初回のみ)

`git push heroku master`


#### TODO ####

・フォームで入力して投稿
・連続投稿禁止、セキュリティ対策
・BASIC認証とか
・admin設定もソースの外部化

#### 開発メモ ####

"grunt"でbotmain以下のtsをjsにコンパイルします

tsdでモジュール定義追加：tsd query モジュール名 --action install --resolve --save
