init();
const cookie =
  'PHPSESSID=58817389_SM8TQ0dpJkKcBG1iHo5NesyN3Ux4wMo1; __cf_bm=PIqI3jDHlyI2bqqXJEEnWAICQroF6qf6f3TQZ6huZrk-1661593425-0-Aar2a23xzBMW/1WZZ0lGFz2IQSx5MxWl41+KYz61dppsRB0vJvxCjKhPOxYwAJ37qqC4kVpvCa1jFrX0xuVmhmh0QyX7mXMyYwiAMdcKh59s;';
const exCookie =
  'ipb_member_id=6210097;ipb_pass_hash=6633ccfac561fb46fcc8831b86863932;igneous=9f5988e6c;';
const agent =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 12_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148';
const onlyGif = false;
const onlyImg = false;
const exHelper = false;
let page = 1;

function init() {
  $input.text({
    text: $clipboard.link
      ? $clipboard.link.match(/https:\/\/.+?pixiv\.net.+/)
      : '',
    placeholder: '输入Pixiv链接',
    handler: async function (link) {
      try {
        if (link && link.indexOf('/users/') >= 0) {
          let pid = link.match(/\d+/);
          let list = await illustsDetail(pid);
          let authorName = list[0].author_details.user_name;
          if (!$file.exists(`shared://${authorName}`))
            $file.mkdir(`shared://${authorName}`);
          for (let listdetail of list) {
            let title = listdetail.title;
            console.log(`获取${title}info`);
            let { detail, type } = await artworkDetail(listdetail.id);
            switch (type) {
              case 'manga':
                if (!onlyGif) {
                  let mgPage = 0;
                  for (let mg of detail) {
                    let url = mg.url_big;
                    let fileName = url.slice(
                      url.lastIndexOf('/') + 1,
                      url.length
                    );
                    let imgType = url.slice(url.lastIndexOf('.'), url.length);
                    if ($cache.get(`${fileName}`)) {
                      console.log(`${title}_p${mgPage}${imgType}已存在`);
                      mgPage++;
                      continue;
                    }
                    $ui.loading(`正在下载图片\n${title}_p${mgPage}`);
                    console.log(`正在下载${title}_p${mgPage}`);
                    let img = await request(url, 'get', {
                      Referer: 'https://pixiv.net'
                    });
                    //await $photo.save(img.rawData);
                    await saveData(
                      img.rawData,
                      `shared://${authorName}/${page}_p${mgPage}${imgType}`
                    );
                    $cache.set(`${fileName}`, true);
                    mgPage++;
                  }
                  page++;
                }
                break;
              case 'gif':
                if (!onlyImg) {
                  let url = detail.src;
                  let fileName = url.slice(
                    url.lastIndexOf('/') + 1,
                    url.length
                  );
                  if ($cache.get(fileName)) {
                    console.log(`${fileName}.gif已存在`);
                    page++;
                    continue;
                  }
                  $ui.loading(`正在下载ZIP\n${title}`);
                  console.log(`正在下载${title}.zip`);
                  let zip = await request(url, 'get', {
                    Referer: 'https://pixiv.net'
                  });
                  await $file.write({
                    path: `shared://${authorName}/${title}.zip`,
                    data: zip.rawData
                  });
                  await makeGif(authorName, title, detail.frames, fileName);
                }
                break;
              case 'img':
                if (!onlyGif) {
                  let url = detail.url_big;
                  let fileName = url.slice(
                    url.lastIndexOf('/') + 1,
                    url.length
                  );
                  let imgType = url.slice(url.lastIndexOf('.'), url.length);
                  if ($cache.get(fileName)) {
                    console.log(`${title}${imgType}已存在`);
                    page++;
                    continue;
                  }
                  $ui.loading(`正在下载图片\n${title}`);
                  console.log(`正在下载${title}`);
                  let img = await request(url, 'get', {
                    Referer: 'https://pixiv.net'
                  });
                  //await $photo.save(img.rawData);
                  await saveData(
                    img.rawData,
                    `shared://${authorName}/${page}${imgType}`
                  );
                  page++;
                  $cache.set(`${fileName}`, true);
                }
                break;
            }
          }
          if (exHelper) {
            console.log('正在打包ZIP');
            $ui.loading('正在打包ZIP');
            $archiver.zip({
              directory: `shared://${authorName}/`,
              dest: `shared://${authorName}/${authorName}.zip`,
              handler: async function (sucess) {
                if (sucess) {
                  let galleryLink = await createGallery(authorName, link);
                  let progresskey = await request(galleryLink, 'get', {
                    Cookie: cookie,
                    'User-agnet': agent
                  })
                    .data.match(/id="progresskey" value="\w+"/)
                    .replace(/value="(\w+)"/, '$1');
                  console.log(progresskey, galleryLink);
                  await uploadGallery(authorName, galleryLink);
                }
              }
            });
            console.log('爬取完成');
            $push.schedule({
              title: authorName,
              body: '爬取完成'
            });
          } else {
            console.log('爬取完成');
                        $push.schedule({
                          title: authorName,
                          body: '爬取完成'
                        });
          }
          $ui.loading(false);
        } else if (link.indexOf('/artworks/') >= 0) {
          let pid = link.match(/\d+/);
          let detail = await artworkDetail(pid);
          let img = await request(detail.url_big, 'get', {
            Referer: 'https://pixiv.net'
          });
          await $photo.save(img);
        }
      } catch (e) {
        console.error(e);
      }
    }
  });
}

async function illustsDetail(pid) {
  let detail = [];
  let list = [];
  let page = 1;
  do {
    detail = await request(
      `https://www.pixiv.net/touch/ajax/user/illusts?id=${pid}&p=${page}&lang=zh`,
      'get',
      {
        Referer: 'https://pixiv.net',
        'User-Agent': agent,
        Cookie: cookie
      }
    );
    if (detail.data.body.illusts.length) {
      $ui.loading(`获取第${page}页作品信息`);
      console.log(`获取第${page}页作品信息`);
      list.push(...detail.data.body.illusts);
      page++;
    }
  } while (detail.data.body.illusts.length > 0);
  return list;
}

async function artworkDetail(pid) {
  let detail = await request(
    `https://www.pixiv.net/touch/ajax/illust/details?illust_id=${pid}&lang=zh`,
    'get',
    {
      Referer: 'https://pixiv.net',
      'User-Agent': agent,
      Cookie: cookie
    }
  ).data.body.illust_details;
  if (detail.manga_a) {
    detail = detail.manga_a;
    let type = 'manga';
    return { detail, type };
  } else if (detail.ugoira_meta) {
    detail = detail.ugoira_meta;
    let type = 'gif';
    return { detail, type };
  } else {
    let type = 'img';
    return { detail, type };
  }
}

async function makeGif(name, title, frames, fileName) {
  try {
    let zipPath = `shared://${name}/${title}.zip`;
    let unzipPath = `shared://${name}/${title}/`;
    if (!$file.exists(`shared://${name}/${title}/`)) {
      $file.mkdir(`shared://${name}/${title}/`);
      console.log(`正在解压${title}.zip`);
      $ui.loading(`正在解压ZIP\n${title}`);
      await $archiver.unzip({
        path: zipPath,
        dest: unzipPath
      });
    }
    let images = [];
    let config = [];
    console.log(`正在生成${title}.gif`);
    $ui.loading(`正在生成GIF\n${title}`);
    for (let i = 0; i < $file.list(unzipPath).length; i++) {
      images.push($file.read(unzipPath + frames[i].file).image);
      config.push(frames[i].delay / 1000);
    }
    let gif = await $imagekit.makeGIF(images, {
      durations: config
    });
    await saveData(gif, `shared://${name}/${page}.gif`);
    $cache.set(`${fileName}`, true);
    page++;
    $file.delete(zipPath);
    $file.delete(unzipPath);
  } catch (e) {
    console.error(e);
  }
}

async function createGallery(authorName, pixivLink) {
  console.log('正在创建画廊');
  $ui.loading('正在创建画廊');
  let link = await request(
    'https://exhentai.org/upld/managegallery?act=new',
    'post',
    {
      Cookie: exCookie,
      Host: 'exhentai.org',
      Origin: 'https://exhentai.org',
      Referer: 'https://exhentai.org/upld/managegallery?act=new',
      'User-Agnet': agent
    },
    {
      do_save: 1,
      gname_en: `[Pixiv] ${name}`,
      category: 6,
      foldername: authorName,
      ulcomment: pixivLink,
      tos: 'on'
    }
  ).response.headers.Location;
  return link;
}

async function uploadGallery(name, link, progresskey) {
  $ui.loading('正在上传画廊');
  console.log('正在上传画廊');
  let zip = await $file.read(`shared://${name}/${name}.zip`);
  $http.upload({
    url: link,
    showsProgress: true,
    form: {
      do_save: 1,
      gname_en: `[Pixiv] ${name}`,
      foldername: name,
      tos: 'on',
      progresskey: progresskey
    },
    files: [
      {
        data: zip,
        name: `file[]`,
        filename: `${name}.zip`
      }
    ],
    handler: resp => {
      $ui.loading(false);
      console.log('上传完成');
    }
  });
}

async function request(link, method, headers, body) {
  switch (method){
  case "get" :
    let rep = await $http.get({
      url: link,
      showsProgress: true,
      header: headers
    });
    return rep;
  break;
    case "post" :
    let res = await $http.post({
      url: link,
      showsProgress: true,
      header: headers,
      body: body
    });
    return res;
  break;
  }
}

function saveData(data, path) {
  $file.write({
    path: path,
    data: data
  });
}
