# LineBot 回報機器人
一個簡單的回報機器人，省去一些小麻煩 \
順便練習一下LineBot串接跟部屬

## 前置需求
- Line 帳號
- Line 機器人帳號
- [NodeJs v18](https://nodejs.org/en)
- [ngrok](https://ngrok.com/)
    > Line Bot 環境測試用，因為 Line Bot 強制需要用 SSL 憑證
- 可選 [render](https://render.com/)
    > 雲端伺服器架設，免費的

## 環境檔案
當你 Clone 完專案後 \
有兩個檔案需要自己手動新增 \
因為涉及到一些隱私 \
<font color="pink">**都新增在跟目錄即可**</font> 

**.env**
```sh
# 伺服器連接埠
PORT=<port>
# Line 的 Access Token
LINE_ACCESS_TOKEN=<token>
# Line 的 Access 金鑰
LINE_ACCESS_SECRET=<secret>
# 只有此 Admin 才有辦法使用其他機器人指令
ADMIN_UUID=<uuid>
# 機器人只會在這個群組中才會有反應
TARGET_GROUP_UUID=<uuid>
```

<br />
<br />

**member.json** \
結構為 key 為 Id, Value 為名子
```json
{
    "xxxxxxx": "Bill",
    "xxxxxxa": "John",
    ...
    "xxxxxxx": "Kevin",
    "xxxxxx9": "Sandy"
}
```

## 啟動

安裝套件、編譯
```sh
npm run build
```

開啟伺服器
```sh
npm run start
```

開啟 ngrok 代理伺服器
```sh
#將個人 Authtoken 加入 ngrok agent 中
ngrok config add-authtoken <your Authtoken>

#利用 ngrok agent 與本機專案的 port (預設 38888) 開啟安全通道
ngrok http 38888
```

複製這串中的 **https://xxxx-xxx-xx-xx-xxx.ngrok-free.app** 到 Line Bot Console 的 Webhook 上，並且驗證看看是否正常
```
Forwarding                    https://xxxx-xxx-xx-xx-xxx.ngrok-free.app -> http://localhost:38888
```

## LineBot
將 Line Bot 邀進群組
目前總共有 4 種指令
- **$reset**
    > 重制所有人的回報紀錄
- **$fmt**
    > 產生回報格式文字
- **$left**
    > 印出還有哪些人尚未回報
- **$xxxx xxxx**
    > 回報訊息
