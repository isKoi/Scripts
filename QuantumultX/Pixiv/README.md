# Pixiv

>网站内无法预览热门前30作品，仅App内支持

>启用脚本后重启App即可去除底部浮窗

## 配置 (二选一)

* [远程订阅(推荐)](https://github.com/qianli-Koi/Scripts/raw/master/QuantumultX/Pixiv/pixiv.snippet)

```properties
# 本地配置
[rewrite_local]
^https:\/\/oauth\.secure\.pixiv\.net\/auth\/token url script-response-body https://github.com/qianli-Koi/Scripts/raw/master/QuantumultX/Pixiv/pixiv.js
^https:\/\/app-api\.pixiv\.net\/v1\/search\/illust\?.*sort=(popular_desc|popular_female_desc|popular_male_desc) url script-request-header https://github.com/qianli-Koi/Scripts/raw/master/QuantumultX/Pixiv/pixiv.js 
^https:\/\/www\.pixiv\.net\/touch\/ajax\/user\/self\/status url script-response-body https://github.com/qianli-Koi/Scripts/raw/master/QuantumultX/Pixiv/pixiv.js
^https:\/\/www\.pixiv\.net\/touch\/ajax_api\/ajax_api\.php\?mode=get_user_data url script-response-body https://github.com/qianli-Koi/Scripts/raw/master/QuantumultX/Pixiv/pixiv.js
^https:\/\/www\.pixiv\.net\/?$ url script-response-body https://github.com/qianli-Koi/Scripts/raw/master/QuantumultX/Pixiv/pixiv.js

[MITM]
hostname=app-api.pixiv.net,oauth.secure.pixiv.net,www.pixiv.net
```
