const body = JSON.parse($response.body);
if ($request && $request.url.indexOf('/auth/token') >= 0) {
  const Koi = init();
  const token = body.access_token;
  body.user['is_premium'] = true;
  body.response.user['is_premium'] = true;
  if (token) Koi.setdata(token, 'Koi_signtoken_pixiv');
} else if ($request && $request.url.indexOf('user/detail') > -1) {
  body.profile['is_premium'] = true;
} else {
  body = $response.body
    .replace(/"user_premium":"\d+/, '"user_premium":"1')
    .replace(/"is_premium":false/, '"is_premium":true')
    .replace(/"ads_disabled":false/, '"ads_disabled":true')
    .replace(/"show_ads":true/, '"show_ads":false')
    .replace(/"premium":false/, '"premium":true')
    .replace(
      /"pixiv.context.enablePopularSearch":false/,
      '"pixiv.context.enablePopularSearch":true'
    )
    .replace(/"pixiv.config.ad":true/, '"pixiv.config.ad":false')
    .replace(/"pixiv.strings.nopremium":".*?"/, '');
  $done({ body: body });
}
$done({ body: JSON.stringify(body) });
function init() {
  isSurge = () => {
    return undefined === this.$httpClient ? false : true;
  };
  isQuanX = () => {
    return undefined === this.$task ? false : true;
  };
  getdata = key => {
    if (isSurge()) return $persistentStore.read(key);
    if (isQuanX()) return $prefs.valueForKey(key);
  };
  setdata = (key, val) => {
    if (isSurge()) return $persistentStore.write(key, val);
    if (isQuanX()) return $prefs.setValueForKey(key, val);
  };
  msg = (title, subtitle, body) => {
    if (isSurge()) $notification.post(title, subtitle, body);
    if (isQuanX()) $notify(title, subtitle, body);
  };
  log = message => console.log(message);
  get = (url, cb) => {
    if (isSurge()) {
      $httpClient.get(url, cb);
    }
    if (isQuanX()) {
      url.method = 'GET';
      $task.fetch(url).then(resp => cb(null, resp, resp.body));
    }
  };
  post = (url, cb) => {
    if (isSurge()) {
      $httpClient.post(url, cb);
    }
    if (isQuanX()) {
      url.method = 'POST';
      $task.fetch(url).then(resp => cb(null, resp, resp.body));
    }
  };
  done = (value = {}) => {
    $done(value);
  };
  return { isSurge, isQuanX, msg, log, getdata, setdata, get, post, done };
}
