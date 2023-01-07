(function(){var PlistParser={};PlistParser.parse=function(plist_xml){try{if(typeof Titanium.XML!='undefined'){plist_xml=Titanium.XML.parseString(plist_xml);}}catch(e){var parser=new DOMParser();plist_xml=parser.parseFromString(plist_xml,'text/xml');}
var result=this._xml_to_json(plist_xml.getElementsByTagName('plist').item(0));return result;};PlistParser._xml_to_json=function(xml_node){var parser=this;var parent_node=xml_node;var parent_node_name=parent_node.nodeName;var child_nodes=[];for(var i=0;i<parent_node.childNodes.length;++i){var child=parent_node.childNodes.item(i);if(child.nodeName!='#text'){child_nodes.push(child);};};switch(parent_node_name){case'plist':if(child_nodes.length>1){var plist_array=[];for(var i=0;i<child_nodes.length;++i){plist_array.push(parser._xml_to_json(child_nodes[i]));};return plist_array;}else{return parser._xml_to_json(child_nodes[0]);}
break;case'dict':var dictionary={};var key_name;var key_value;for(var i=0;i<child_nodes.length;++i){var child=child_nodes[i];if(child.nodeName=='#text'){}else if(child.nodeName=='key'){key_name=PlistParser._textValue(child.firstChild);}else{key_value=parser._xml_to_json(child);dictionary[key_name]=key_value;}}
return dictionary;case'array':var standard_array=[];for(var i=0;i<child_nodes.length;++i){var child=child_nodes[i];standard_array.push(parser._xml_to_json(child));}
return standard_array;case'string':return PlistParser._textValue(parent_node);case'date':var date=PlistParser._parseDate(PlistParser._textValue(parent_node));return date.toString();case'integer':return parseInt(PlistParser._textValue(parent_node),10);case'real':return parseFloat(PlistParser._textValue(parent_node));case'data':return PlistParser._textValue(parent_node);case'true':return true;case'false':return false;case'#text':break;};};PlistParser._textValue=function(node){if(node.text){return node.text;}else{return node.textContent;};};PlistParser._parseDate=function(date_string){var reISO=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/;var matched_date=reISO.exec(date_string);if(matched_date){return new Date(Date.UTC(+matched_date[1],+matched_date[2]-1,+matched_date[3],+matched_date[4],+matched_date[5],+matched_date[6]));};};PlistParser.serialize=function(_obj){try{if(typeof _obj.toSource!=='undefined'&&typeof _obj.callee==='undefined'){return _obj.toSource();}}catch(e){}
switch(typeof _obj)
{case'number':case'boolean':case'function':return _obj;case'string':return'\''+_obj+'\'';case'object':var str;if(_obj.constructor===Array||typeof _obj.callee!=='undefined')
{str='[';var i,len=_obj.length;for(i=0;i<len-1;i++){str+=PlistParser.serialize(_obj[i])+',';}
str+=PlistParser.serialize(_obj[i])+']';}
else
{str='{';var key;for(key in _obj){if(_obj.hasOwnProperty(key)){str+=key+':'+PlistParser.serialize(_obj[key])+',';};};str=str.replace(/\,$/,'')+'}';}
return str;default:return'UNKNOWN';};};PlistParser.toPlist=function(obj){var xml='<?xml version="1.0" encoding="UTF-8"?>';xml+='<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">';var container=document.createElement('xml');var plist=document.createElement('plist');plist.setAttribute('version','1.0');container.appendChild(plist);var root=document.createElement('dict');plist.appendChild(root);var getISOString=function(date){function pad(n){return n<10?'0'+n:n}
return date.getUTCFullYear()+'-'
+pad(date.getUTCMonth()+1)+'-'
+pad(date.getUTCDate())+'T'
+pad(date.getUTCHours())+':'
+pad(date.getUTCMinutes())+':'
+pad(date.getUTCSeconds())+'Z';}
var walkObj=function(target,obj,callback){for(var i in obj){callback(target,i,obj[i]);}}
var processObject=function(target,name,value){var key=document.createElement('key');key.innerHTML=name;target.appendChild(key);if(typeof value=='object'){if(value instanceof Date){var date=document.createElement('date');date.innerHTML=getISOString(value);target.appendChild(date);}else{var dict=document.createElement('dict');walkObj(dict,value,processObject)
target.appendChild(dict);}}else if(typeof value=='boolean'){var bool=document.createElement(value.toString());target.appendChild(bool);}else{var string=document.createElement('string');string.innerHTML=value;target.appendChild(string);}};walkObj(root,obj,processObject);return xml+container.innerHTML;};this.PlistParser=PlistParser})();

////////////////////////////////////////////////////////////////////////////////////////////
let debug;
const $ = API('Journey', debug);
debug = $.read('Journey_debug');
const resBody = PlistParser.parse($response.body);
const path = $request.path;
let playerInfoMap = $.read('journeyPlayerInfoMap');
playerInfoMap = playerInfoMap ? new Map(JSON.parse(playerInfoMap)) : new Map();
const timesTamp = new Date().getTime();
const lastTimesTamp = $.read('journeyTimesTamp');
!(async () => {
    switch (path) {
        case '/WebObjects/GKInvitationService.woa/wa/relayUpdate':
            $.log(JSON.stringify(resBody));
            //运行间隔不得超过1100毫秒，避免重复通知
            if (resBody.status == 0 && timesTamp - lastTimesTamp > 1100) {
                $.notify('Journey', '', 'Reconnect');
                $.info('Reconnect');
            }
            break;
        case '/WebObjects/GKInvitationService.woa/wa/relayInitiate':
            $.log(JSON.stringify(resBody));
            if (resBody['self-relay-ip']) {
                $.notify('Journey', '', 'Start a new connection');
                $.info('Start a new connection');
            }
            break;
        case '/WebObjects/GKMatchmakerDispatcher.woa/wa/checkMatchStatus':
            $.log(JSON.stringify(resBody));
            //运行间隔不得超过1100毫秒，避免重复通知
            if (!resBody['poll-delay-ms'] && timesTamp - lastTimesTamp > 1100) {
                let playerId = resBody.matches[0]['player-id'];
                if (!playerInfoMap.get(playerId)) {
                    $.write(playerId, 'journeyMatchPlayerId');
                } else {
                    playerId = playerInfoMap.get(playerId);
                }
                $.notify('Journey', '', `Matched: ${playerId}`);
                $.info(`Mathed: ${playerId}`);
            }
            break;
        case '/WebObjects/GKFriendService.woa/wa/getFriendPlayerIds':
            //获取玩家name和playerId键值对、当前匹配玩家name
            let playerMatchId = $.read('journeyMatchPlayerId');
            for (let playerInfo of resBody.results) {
                let playerId = playerInfo['player-id'];
                if (playerMatchId && playerId == playerMatchId) {
                    $.notify('Journey', '', `PlayerName: ${playerInfo.alias}`);
                    $.info(`PlayerName: ${playerInfo.alias}`);
                    $.write('', 'journeyMatchPlayerId');
                }
                if (!playerInfoMap.get(playerId)) {
                    playerInfoMap.set(playerId, playerInfo.alias);
                }
            }
            $.write(JSON.stringify([...playerInfoMap]), 'journeyPlayerInfoMap');
            //创建持久化玩家列表，方便下次取值
            break;
    }
})()
    .catch((e) => $.error(e.message || e.error || e))
    .finally(() => {
        $.write(`${timesTamp}`, 'journeyTimesTamp');
        $.log(timesTamp - lastTimesTamp);
        $.done();
    });

/**
 * OpenAPI
 * @author: Peng-YM
 * https://github.com/Peng-YM/QuanX/blob/master/Tools/OpenAPI/README.md
 */
function ENV(){const e="function"==typeof require&&"undefined"!=typeof $jsbox;return{isQX:"undefined"!=typeof $task,isLoon:"undefined"!=typeof $loon,isSurge:"undefined"!=typeof $httpClient&&"undefined"!=typeof $utils,isBrowser:"undefined"!=typeof document,isNode:"function"==typeof require&&!e,isJSBox:e,isRequest:"undefined"!=typeof $request,isScriptable:"undefined"!=typeof importModule}}function HTTP(e={baseURL:""}){const{isQX:t,isLoon:s,isSurge:o,isScriptable:n,isNode:i,isBrowser:r}=ENV(),u=/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;const a={};return["GET","POST","PUT","DELETE","HEAD","OPTIONS","PATCH"].forEach(h=>a[h.toLowerCase()]=(a=>(function(a,h){h="string"==typeof h?{url:h}:h;const d=e.baseURL;d&&!u.test(h.url||"")&&(h.url=d?d+h.url:h.url),h.body&&h.headers&&!h.headers["Content-Type"]&&(h.headers["Content-Type"]="application/x-www-form-urlencoded");const l=(h={...e,...h}).timeout,c={onRequest:()=>{},onResponse:e=>e,onTimeout:()=>{},...h.events};let f,p;if(c.onRequest(a,h),t)f=$task.fetch({method:a,...h});else if(s||o||i)f=new Promise((e,t)=>{(i?require("request"):$httpClient)[a.toLowerCase()](h,(s,o,n)=>{s?t(s):e({statusCode:o.status||o.statusCode,headers:o.headers,body:n})})});else if(n){const e=new Request(h.url);e.method=a,e.headers=h.headers,e.body=h.body,f=new Promise((t,s)=>{e.loadString().then(s=>{t({statusCode:e.response.statusCode,headers:e.response.headers,body:s})}).catch(e=>s(e))})}else r&&(f=new Promise((e,t)=>{fetch(h.url,{method:a,headers:h.headers,body:h.body}).then(e=>e.json()).then(t=>e({statusCode:t.status,headers:t.headers,body:t.data})).catch(t)}));const y=l?new Promise((e,t)=>{p=setTimeout(()=>(c.onTimeout(),t(`${a} URL: ${h.url} exceeds the timeout ${l} ms`)),l)}):null;return(y?Promise.race([y,f]).then(e=>(clearTimeout(p),e)):f).then(e=>c.onResponse(e))})(h,a))),a}function API(e="untitled",t=!1){const{isQX:s,isLoon:o,isSurge:n,isNode:i,isJSBox:r,isScriptable:u}=ENV();return new class{constructor(e,t){this.name=e,this.debug=t,this.http=HTTP(),this.env=ENV(),this.node=(()=>{if(i){return{fs:require("fs")}}return null})(),this.initCache();Promise.prototype.delay=function(e){return this.then(function(t){return((e,t)=>new Promise(function(s){setTimeout(s.bind(null,t),e)}))(e,t)})}}initCache(){if(s&&(this.cache=JSON.parse($prefs.valueForKey(this.name)||"{}")),(o||n)&&(this.cache=JSON.parse($persistentStore.read(this.name)||"{}")),i){let e="root.json";this.node.fs.existsSync(e)||this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.root={},e=`${this.name}.json`,this.node.fs.existsSync(e)?this.cache=JSON.parse(this.node.fs.readFileSync(`${this.name}.json`)):(this.node.fs.writeFileSync(e,JSON.stringify({}),{flag:"wx"},e=>console.log(e)),this.cache={})}}persistCache(){const e=JSON.stringify(this.cache,null,2);s&&$prefs.setValueForKey(e,this.name),(o||n)&&$persistentStore.write(e,this.name),i&&(this.node.fs.writeFileSync(`${this.name}.json`,e,{flag:"w"},e=>console.log(e)),this.node.fs.writeFileSync("root.json",JSON.stringify(this.root,null,2),{flag:"w"},e=>console.log(e)))}write(e,t){if(this.log(`SET ${t}`),-1!==t.indexOf("#")){if(t=t.substr(1),n||o)return $persistentStore.write(e,t);if(s)return $prefs.setValueForKey(e,t);i&&(this.root[t]=e)}else this.cache[t]=e;this.persistCache()}read(e){return this.log(`READ ${e}`),-1===e.indexOf("#")?this.cache[e]:(e=e.substr(1),n||o?$persistentStore.read(e):s?$prefs.valueForKey(e):i?this.root[e]:void 0)}delete(e){if(this.log(`DELETE ${e}`),-1!==e.indexOf("#")){if(e=e.substr(1),n||o)return $persistentStore.write(null,e);if(s)return $prefs.removeValueForKey(e);i&&delete this.root[e]}else delete this.cache[e];this.persistCache()}notify(e,t="",a="",h={}){const d=h["open-url"],l=h["media-url"];if(s&&$notify(e,t,a,h),n&&$notification.post(e,t,a+`${l?"\n多媒体:"+l:""}`,{url:d}),o){let s={};d&&(s.openUrl=d),l&&(s.mediaUrl=l),"{}"===JSON.stringify(s)?$notification.post(e,t,a):$notification.post(e,t,a,s)}if(i||u){const s=a+(d?`\n点击跳转: ${d}`:"")+(l?`\n多媒体: ${l}`:"");if(r){require("push").schedule({title:e,body:(t?t+"\n":"")+s})}else console.log(`${e}\n${t}\n${s}\n\n`)}}log(e){this.debug&&console.log(`[${this.name}] LOG: ${this.stringify(e)}`)}info(e){console.log(`[${this.name}] INFO: ${this.stringify(e)}`)}error(e){console.log(`[${this.name}] ERROR: ${this.stringify(e)}`)}wait(e){return new Promise(t=>setTimeout(t,e))}done(e={}){s||o||n?$done(e):i&&!r&&"undefined"!=typeof $context&&($context.headers=e.headers,$context.statusCode=e.statusCode,$context.body=e.body)}stringify(e){if("string"==typeof e||e instanceof String)return e;try{return JSON.stringify(e,null,2)}catch(e){return"[object Object]"}}}(e,t)}
