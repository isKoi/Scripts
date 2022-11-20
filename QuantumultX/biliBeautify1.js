let body = JSON.parse($response.body);
const url = $request.url;

switch (true) {
    case /v2\/account\/mine/.test(url):
        body = body.data;
        body.level = 6;
        body['senior_gate'] = {"member_text":"硬核会员","birthday_conf":null,"identity":2};
        body.vip = {"status":1,"avatar_subscript":1,"nickname_color":"#FB7299","due_date":4102329600000,"role":3,"vip_pay_type":0,"avatar_subscript_url":"","label":{"bg_color":"#FB7299","bg_style":1,"text":"年度大会员","border_color":"","path":"","image":"https://i0.hdslb.com/bfs/vip/8d7e624d13d3e134251e4174a7318c19a8edbd71.png","label_theme":"hundred_annual_vip","text_color":"#FFFFFF"},"type":2,"themeType":0,"theme_type":0};
        body['sections_v2'] = [{"items":[{"id":396,"title":"离线缓存","uri":"bilibili://user_center/download","icon":"http://i0.hdslb.com/bfs/archive/5fc84565ab73e716d20cd2f65e0e1de9495d56f8.png","common_op_item":{}},{"id":397,"title":"历史记录","uri":"bilibili://user_center/history","icon":"http://i0.hdslb.com/bfs/archive/8385323c6acde52e9cd52514ae13c8b9481c1a16.png","common_op_item":{}},{"id":398,"title":"我的收藏","uri":"bilibili://user_center/favourite","icon":"http://i0.hdslb.com/bfs/archive/d79b19d983067a1b91614e830a7100c05204a821.png","common_op_item":{}},{"id":399,"title":"稍后再看","uri":"bilibili://user_center/watch_later","icon":"http://i0.hdslb.com/bfs/archive/63bb768caa02a68cb566a838f6f2415f0d1d02d6.png","need_login":1,"common_op_item":{}}],"style":1,"button":{}},{"title":"推荐服务","items":[{"id":400,"title":"我的课程","uri":"https://m.bilibili.com/cheese/mine?navhide=1&native.theme=1&night=0&spm_id_from=main.my-information.0.0.pv&csource=Me_myclass","icon":"http://i0.hdslb.com/bfs/archive/aa3a13c287e4d54a62b75917dd9970a3cde472e1.png","common_op_item":{}},{"id":402,"title":"个性装扮","uri":"https://www.bilibili.com/h5/mall/home?navhide=1&f_source=shop","icon":"http://i0.hdslb.com/bfs/archive/0bcad10661b50f583969b5a188c12e5f0731628c.png","common_op_item":{}},{"id":404,"title":"我的钱包","uri":"bilibili://bilipay/mine_wallet","icon":"http://i0.hdslb.com/bfs/archive/f416634e361824e74a855332b6ff14e2e7c2e082.png","common_op_item":{}}],"style":1,"button":{}},{"title":"更多服务","items":[{"id":407,"title":"联系客服","uri":"bilibili://user_center/feedback","icon":"http://i0.hdslb.com/bfs/archive/7ca840cf1d887a45ee1ef441ab57845bf26ef5fa.png","common_op_item":{}},{"id":410,"title":"设置","uri":"bilibili://user_center/setting","icon":"http://i0.hdslb.com/bfs/archive/e932404f2ee62e075a772920019e9fbdb4b5656a.png","common_op_item":{}}],"style":2,"button":{}}];
        delete body['vip_section_v2'];
    break;
    case /resource\/show\/skin/.test(url):
      const skinList = [
        {"id":"37742","name":"初音未来V4C五周年","preview":"http://i0.hdslb.com/bfs/garb/item/213bc76c09ec79323ceff990409751b7eb9417a1.jpg","ver":"1660720171","package_url":"http://i0.hdslb.com/bfs/garb/zip/359e03929b712a22bb31938f0731820525d5bb43.zip","data":{"color_mode":"dark","color":"#ffffff","color_second_page":"#1a3054","tail_color":"#ff727b","tail_color_selected":"#ffffff","tail_icon_ani":"true","tail_icon_ani_mode":"once","head_myself_mp4_play":"loop","tail_icon_mode":"img","side_bg_color":""}},
        {"id":"2138","name":"洛天依8th生日纪念","preview":"http://i0.hdslb.com/bfs/garb/item/0b89552166a9ffee88995e026027dbff948df447.jpg","ver":"1594091026","package_url":"http://i0.hdslb.com/bfs/garb/zip/297261f2a22571a3b2a968d874704d2d84694c3c.zip","data":{"color_mode":"dark","color":"#ffffff","color_second_page":"#4b73a4","tail_color":"#ffffff","tail_color_selected":"#11397d","tail_icon_ani":"true","tail_icon_ani_mode":"once","head_myself_mp4_play":"","tail_icon_mode":"","side_bg_color":"#325b8d"}},
        {"id":"3777","name":"神乐七奈","preview":"http://i0.hdslb.com/bfs/garb/item/012c57507c2366f3ae270f14be29bc493327eeaf.jpg","ver":"1610251923","package_url":"http://i0.hdslb.com/bfs/garb/zip/a7559172ce5bd5b211b929d7eb3bd3b00e2cc2dd.zip","data":{"color_mode":"light","color":"#212121","color_second_page":"#aec3e9","tail_color":"#6f63bd","tail_color_selected":"#ffffff","tail_icon_ani":"true","tail_icon_ani_mode":"once","head_myself_mp4_play":"once","tail_icon_mode":"","side_bg_color":"#747bb3"}}
      ];
        body.data['user_equip'] = skinList[randomNum(0, 2)];
        break;
        case /v2\/account\/myinfo/.test(url):
          body.data.vip = {"type":2,"status":1,"due_date":4102329600000,"vip_pay_type":0,"theme_type":0,"label":{"path":"","text":"年度大会员","label_theme":"hundred_annual_vip","text_color":"#FFFFFF","bg_style":1,"bg_color":"#FB7299","border_color":"","use_img_label":true,"img_label_uri_hans":"","img_label_uri_hant":"","img_label_uri_hans_static":"https://i0.hdslb.com/bfs/vip/8d7e624d13d3e134251e4174a7318c19a8edbd71.png","img_label_uri_hant_static":"https://i0.hdslb.com/bfs/activity-plat/static/20220614/e369244d0b14644f5e1a06431e22a4d5/VEW8fCC0hg.png"},"avatar_subscript":1,"nickname_color":"#FB7299","role":3,"avatar_subscript_url":"","tv_vip_status":1,"tv_vip_pay_type":0};
          body.data.level = 6;
          break;
}

function randomNum(minNum, maxNum) {
    switch (arguments.length) {
        case 1:
            return parseInt(Math.random() * minNum + 1, 10);
            break;
        case 2:
            return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
            break;
        default:
            return 0;
            break;
    }
}
$done({ body: JSON.stringify(body) });
