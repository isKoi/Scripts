let body = JSON.parse($response.body);
const skinList = [
  {"id":"37742","name":"初音未来V4C五周年","preview":"http://i0.hdslb.com/bfs/garb/item/213bc76c09ec79323ceff990409751b7eb9417a1.jpg","ver":"1660720171","package_url":"http://i0.hdslb.com/bfs/garb/zip/359e03929b712a22bb31938f0731820525d5bb43.zip","data":{"color_mode":"dark","color":"#ffffff","color_second_page":"#1a3054","tail_color":"#ff727b","tail_color_selected":"#ffffff","tail_icon_ani":"true","tail_icon_ani_mode":"once","head_myself_mp4_play":"loop","tail_icon_mode":"img","side_bg_color":""}},
  {"id":"2138","name":"洛天依8th生日纪念","preview":"http://i0.hdslb.com/bfs/garb/item/0b89552166a9ffee88995e026027dbff948df447.jpg","ver":"1594091026","package_url":"http://i0.hdslb.com/bfs/garb/zip/297261f2a22571a3b2a968d874704d2d84694c3c.zip","data":{"color_mode":"dark","color":"#ffffff","color_second_page":"#4b73a4","tail_color":"#ffffff","tail_color_selected":"#11397d","tail_icon_ani":"true","tail_icon_ani_mode":"once","head_myself_mp4_play":"","tail_icon_mode":"","side_bg_color":"#325b8d"}},
  {"id":"3777","name":"神乐七奈","preview":"http://i0.hdslb.com/bfs/garb/item/012c57507c2366f3ae270f14be29bc493327eeaf.jpg","ver":"1610251923","package_url":"http://i0.hdslb.com/bfs/garb/zip/a7559172ce5bd5b211b929d7eb3bd3b00e2cc2dd.zip","data":{"color_mode":"light","color":"#212121","color_second_page":"#aec3e9","tail_color":"#6f63bd","tail_color_selected":"#ffffff","tail_icon_ani":"true","tail_icon_ani_mode":"once","head_myself_mp4_play":"once","tail_icon_mode":"","side_bg_color":"#747bb3"}}
];
body.data['user_equip'] = skinList[randomNum(0,2)];

function randomNum(minNum,maxNum){ 
  switch(arguments.length){ 
      case 1: 
          return parseInt(Math.random()*minNum+1,10); 
      break; 
      case 2: 
          return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10); 
      break; 
          default: 
              return 0; 
          break; 
  } 
} 
$done({body: JSON.stringify(body)});
