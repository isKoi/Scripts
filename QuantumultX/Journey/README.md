# Journey

>本脚本采用持久化友人列表方式获取名称，当匹配到友人时从持久化取出先前匹配过友人的名称，若是第一次匹配则会先显示GameId，随后调用接口另外通知名称

## 配置 (二选一)

* [远程订阅(推荐)](https://github.com/qianli-Koi/Scripts/raw/master/QuantumultX/Journey/journey.snippet)

```properties
# 本地配置
[rewrite_local]
^https:\/\/invitation\.gc\.apple\.com\/WebObjects\/GKInvitationService\.woa\/wa\/(relayInitiate|relayUpdate) url script-response-body https://github.com/qianli-Koi/Scripts/raw/master/QuantumultX/Journey/journey.js
^https:\/\/match\.gc\.apple\.com\/WebObjects\/GKMatchmakerDispatcher\.woa\/wa\/checkMatchStatus url script-response-body https://github.com/qianli-Koi/Scripts/raw/master/QuantumultX/Journey/journey.js
^https:\/\/friend\.gc\.apple\.com\/WebObjects\/GKFriendService\.woa\/wa\/getFriendPlayerIds url script-response-body https://github.com/qianli-Koi/Scripts/raw/master/QuantumultX/Journey/journey.js

[MITM]
hostname=match.gc.apple.com,invitation.gc.apple.com,friend.gc.apple.com
```
