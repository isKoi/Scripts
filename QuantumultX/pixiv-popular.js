var modifiedHeaders = $request.headers;
var modifiedPath = $request.path.replace(/search\/illust(.+)search_target=(partial|exact)/,"search/popular-preview/illust$1search_target=exact");
console.log(modifiedPath);
$done({path : modifiedPath , headers : modifiedHeaders});
