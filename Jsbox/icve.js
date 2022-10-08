$app.keyboardToolbarEnabled = true;
const sleep = (sec = 1) => {
  return new Promise(rev => {
    setTimeout(rev, sec * 1000);
  });
};
!(async () => {
  let { verifyImg, verifyCookie } = await getverify();
  init(verifyImg, verifyCookie);
})();
async function init(verifyImg, verifyCookie) {
  try {
    $ui.render({
      views: [
        {
          type: 'image',
          props: { data: verifyImg, id: 'verify' },
          layout: (make, view) => {
            make.top.equalTo(100);
            make.centerX.equalTo(view.super);
            make.height.equalTo(verifyImg.image.size.height);
            make.width.equalTo(verifyImg.image.size.width);
          }
        },
        {
          type: 'input',
          props: { placeholder: '输入你看到的验证码', id: 'code' },
          layout: (make, view) => {
            make.left.right.inset(13);
            make.height.equalTo(50);
            make.top.equalTo($('verify').bottom).offset(10);
          },
          events: {
            returned: async function (sender) {
              sender.blur();
              let verifyCode = sender.text;
              let cookie = await login(
                2112503101,
                'Alqc0426.',
                verifyCookie,
                verifyCode
              );
              if (!cookie) {
                await getverify().then(data => {
                  $('verify').data = data.verifyImg;
                  $('code').text = '';
                  verifyCookie = data.verifyCookie;
                });
                return;
              }
              let courseList = await getCourseList(cookie);
              let course = courseList.get($('courseName').text);
              startlearn(cookie, course.courseOpenId, course.openClassId);
            }
          }
        },
        {
          type: 'input',
          props: {
            placeholder: '输入完整的课程名',
            text: $cache.get('courseName'),
            id: 'courseName'
          },
          layout: (make, view) => {
            make.left.right.inset(13);
            make.height.equalTo(50);
            make.top.equalTo($('code').bottom).offset(10);
          },
          events: {
            changed: sender => {
              $cache.set('courseName', $('courseName').text);
            },
            returned: sender => {
              sender.blur();
            }
          }
        },
        {
          type: 'button',
          props: { title: '重新载入验证码', id: 'loadCode' },
          layout: (make, view) => {
            make.top.equalTo($('courseName').bottom).offset(10);
            make.left.inset(13);
            make.width.equalTo(($device.info.screen.width - 30) / 2);
            make.height.equalTo(50);
          },
          events: {
            tapped: async function () {
              await getverify().then(data => {
                $('verify').data = data.verifyImg;
                verifyCookie = data.verifyCookie;
              });
            }
          }
        },
        {
          type: 'button',
          props: { title: '开始刷课', id: 'done' },
          layout: (make, view) => {
            make.top.equalTo($('courseName').bottom).offset(10);
            make.left.equalTo($('loadCode').right).inset(10);
            make.right.inset(13);
            make.height.equalTo(50);
          },
          events: {
            tapped: async function () {
              let cookie = await login(
                2112503101,
                'Alqc0426.',
                verifyCookie,
                $('code').text
              );
              if (!cookie) {
                await getverify().then(data => {
                  $('verify').data = data.verifyImg;
                  $('code').text = '';
                  verifyCookie = data.verifyCookie;
                });
                return;
              }
              let courseList = await getCourseList(cookie);
              let course = courseList.get($('courseName').text);
              startlearn(cookie, course.courseOpenId, course.openClassId);
            }
          }
        }
      ]
    });
  } catch (e) {
    console.error(e);
  }
}
async function startlearn(cookie, courseOpenId, openClassId) {
  try {
    let { ProcessList, moduleId } = await getProcessList(
      cookie,
      courseOpenId,
      openClassId
    );
    for (let process of ProcessList) {
      if (process.percent != 100) {
        let topicList = await getTopicByModuleId(
          cookie,
          courseOpenId,
          openClassId,
          process.id
        );
        for (let topic of topicList) {
          let cellList = await getCellByTopicId(
            cookie,
            courseOpenId,
            openClassId,
            topic.id
          );
          for (let cell of cellList) {
            let cellPercent =
              cell.stuCellPercent != null
                ? cell.stuCellPercent
                : cell.stuCellFourPercent;
            if (cellPercent < 95) {
              let cellinfo = await getcellinfo(
                cookie,
                courseOpenId,
                openClassId,
                cell.Id,
                moduleId
              );
              if (cellinfo.categoryName.match(/文档/)) {
                let lastPage = $cache.get(cell.Id) ? $cache.get(cell.Id) : 0;
                let page = cellinfo.pageCount ? cellinfo.pageCount : 30;
                console.log(
                  `课程:${cell.cellName}  页数:${cellinfo.pageCount}`
                );
                if (lastPage) {
                  console.log(`继续之前的进度  ${lastPage}页`);
                  $ui.toast(`继续之前的进度\n${lastPage}页`, 3);
                }
                let i = lastPage;
                let j = 0;
                do {
                  i += 3;
                  if (!j) {
                    if (i > page) {
                      i = page;
                      j++;
                    }
                  }
                  await stuProcessCellLog(
                    cookie,
                    courseOpenId,
                    openClassId,
                    cell.Id,
                    moduleId,
                    i,
                    0,
                    2
                  );
                  await sleep();
                } while (i < page);
              } else if (cellinfo.categoryName.match(/视频|音频|其它/)) {
                let lastAudioLong = $cache.get(cell.Id)
                  ? $cache.get(cell.Id)
                  : 0;
                let audioVideoLong = cellinfo.audioVideoLong - lastAudioLong;
                console.log(
                  `课程${cell.cellName}  时长:` +
                    Math.ceil(cellinfo.audioVideoLong / 60) +
                    '分钟  预计' +
                    Math.ceil(((audioVideoLong / 20) * 5) / 60) +
                    '分钟后完成'
                );
                if (lastAudioLong) {
                  $ui.toast(`继续之前的进度\n${lastAudioLong}秒`, 3);
                  console.log(`继续之前的进度  ${lastAudioLong}秒`);
                }
                let i = lastAudioLong;
                let j = 0;
                do {
                  await stuProcessCellLog(
                    cookie,
                    courseOpenId,
                    openClassId,
                    cell.Id,
                    moduleId,
                    0,
                    i,
                    2
                  );
                  i += 20;
                  if (!j) {
                    if (i > cellinfo.audioVideoLong) {
                      i = cellinfo.audioVideoLong;
                      j++;
                    }
                  }
                  await sleep(5);
                } while (i <= cellinfo.audioVideoLong);
              }
            } else {
              console.log(`${cell.cellName}  已完成`);
            }
          }
        }
      } else {
        console.log(`${process.name}  已完成`);
      }
    }
    console.log('课程学习完成');
    $push.schedule({ title: '职教云', body: '课程学习完成' });
  } catch (e) {
    console.error(e);
  }
}
async function getverify() {
  try {
    let resp = await request(
      'https://zjy2.icve.com.cn/api/common/VerifyCode/index',
      'get'
    );
    let verifyCookie = resp.response.headers['Set-Cookie'];
    verifyCookie = verifyCookie.slice(
      verifyCookie.indexOf('=') + 1,
      verifyCookie.indexOf(';')
    );
    let verifyImg = resp.rawData;
    return { verifyImg, verifyCookie };
  } catch (e) {
    console.error(e);
  }
}
async function login(username, passwd, verifycookie, verifycode) {
  try {
    let resp = await request(
      'https://zjy2.icve.com.cn/api/common/login/login',
      'post',
      {
        Cookie: 'verifycode=' + verifycookie,
        Referer: 'https://zjy2.icve.com.cn/portal/login.html',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.2 Mobile/15E148 Safari/604.1',
        Host: 'zjy2.icve.com.cn'
      },
      { userName: username, userPwd: passwd, verifyCode: verifycode }
    );
    if (resp.data.code == -16) {
      $ui.error('验证码错误');
      return false;
    } else {
      let cookie = resp.response.headers['Set-Cookie'];
      cookie = cookie.replace(/.+auth=(.+?;).+/, '$1');
      let token = resp.data.token;
      $ui.toast('登陆成功');
      return `auth=${cookie}token=${token}`;
    }
  } catch (e) {
    console.error(e);
  }
}
async function getCourseList(cookie) {
  try {
    let resp = await $http.post({
      url:
        'https://zjy2.icve.com.cn/api/student/learning/getLearnningCourseList',
      header: {
        Cookie: cookie,
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.2 Mobile/15E148 Safari/604.1',
        Host: 'zjy2.icve.com.cn',
        Referer:
          'https://zjy2.icve.com.cn/student/learning/courseList.html?type=1'
      }
    });
    resp = resp.data;
    if (resp.code == 1) {
      let list = resp.courseList;
      let courseList = new Map();
      for (let course of list) {
        if (course.process != 100) {
          courseList.set(course.courseName, {
            courseOpenId: course.courseOpenId,
            openClassId: course.openClassId,
            Id: course.Id
          });
        }
      }
      $ui.toast('获取待修课程');
      return courseList;
    } else {
      console.error('getCourseList');
      console.error(resp);
      return await getCourseList(cookie);
    }
  } catch (e) {
    console.error(e);
  }
}
async function getProcessList(cookie, courseOpenId, openClassId) {
  try {
    let resp = await request(
      'https://zjy2.icve.com.cn/api/study/process/getProcessList',
      'post',
      {
        Cookie: cookie,
        Referer: `https://zjy2.icve.com.cn/study/process/process.html?courseOpenId=${courseOpenId}&openClassId=${openClassId}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        Host: 'zjy2.icve.com.cn',
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.2 Mobile/15E148 Safari/604.1'
      },
      { courseOpenId: courseOpenId, openClassId: openClassId }
    );
    resp = resp.data;
    if (resp.code == 1) {
      let ProcessList = resp.progress.moduleList;
      let moduleId = resp.progress.moduleId;
      return { ProcessList, moduleId };
    } else {
      console.error('getProcessList');
      console.error(resp);
      return await getProcessList(cookie, courseOpenId, openClassId);
    }
  } catch (e) {
    console.error(e);
  }
}
async function getTopicByModuleId(cookie, courseOpenId, openClassId, moduleId) {
  try {
    let resp = await request(
      'https://zjy2.icve.com.cn/api/study/process/getTopicByModuleId',
      'post',
      {
        Cookie: cookie,
        Referer: `https://zjy2.icve.com.cn/study/process/process.html?courseOpenId=${courseOpenId}&openClassId=${openClassId}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        Host: 'zjy2.icve.com.cn',
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.2 Mobile/15E148 Safari/604.1'
      },
      { courseOpenId: courseOpenId, moduleId: moduleId }
    );
    resp = resp.data;
    if (resp.code == 1) {
      let topicList = resp.topicList;
      return topicList;
    } else {
      console.error('getTopicByModuleId');
      console.error(resp);
      return await getTopicByModuleId(
        cookie,
        courseOpenId,
        openClassId,
        moduleId
      );
    }
  } catch (e) {
    console.error(e);
  }
}
async function getCellByTopicId(cookie, courseOpenId, openClassId, topicId) {
  try {
    let resp = await request(
      'https://zjy2.icve.com.cn/api/study/process/getCellByTopicId',
      'post',
      {
        Cookie: cookie,
        Referer: `https://zjy2.icve.com.cn/study/process/process.html?courseOpenId=${courseOpenId}&openClassId=${openClassId}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        Host: 'zjy2.icve.com.cn',
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.2 Mobile/15E148 Safari/604.1'
      },
      { courseOpenId: courseOpenId, openClassId: openClassId, topicId: topicId }
    );
    resp = resp.data;
    if (resp.code == 1) {
      let cellList = [];
      for (let cell of resp.cellList) {
        if (cell.categoryName == '子节点') {
          cellList.push(...cell.childNodeList);
        } else {
          cellList.push(cell);
        }
      }
      return cellList;
    } else {
      console.error('getCellByTopicId');
      console.error(resp);
      return await getCellByTopicId(cookie, courseOpenId, openClassId, topicId);
    }
  } catch (e) {
    console.error(e);
  }
}
async function getcellinfo(
  cookie,
  courseOpenId,
  openClassId,
  cellId,
  moduleId
) {
  try {
    let resp = await request(
      'https://zjy2.icve.com.cn/api/common/Directory/viewDirectory',
      'post',
      {
        Cookie: cookie,
        Referer: `https://zjy2.icve.com.cn/common/directory/directory.html?courseOpenId=${courseOpenId}&openClassId=${openClassId}&cellId=${cellId}&moduleId=${moduleId}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        Host: 'zjy2.icve.com.cn',
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.2 Mobile/15E148 Safari/604.1'
      },
      {
        courseOpenId: courseOpenId,
        openClassId: openClassId,
        cellId: cellId,
        moduleId: moduleId
      }
    );
    resp = resp.data;
    let code = resp.code;
    if (code == 1) {
      return resp;
    } else if (code == -1) {
      console.log(resp.msg);
      let sleepTime = resp.msg.match(/\d+分钟/)[0].match(/\d+/) * 60;
      await sleep(sleepTime);
      return await getcellinfo(
        cookie,
        courseOpenId,
        openClassId,
        cellId,
        moduleId
      );
    } else if (code == -100) {
      await changeStuStudyProcessCellData(
        cookie,
        courseOpenId,
        openClassId,
        cellId,
        moduleId,
        resp.currCellName
      );
      return await getcellinfo(
        cookie,
        courseOpenId,
        openClassId,
        cellId,
        moduleId
      );
    } else {
      console.error('getcellinfo');
      console.error(resp);
      return await getcellinfo(
        cookie,
        courseOpenId,
        openClassId,
        cellId,
        moduleId
      );
    }
  } catch (e) {
    console.error(e);
  }
}
async function changeStuStudyProcessCellData(
  cookie,
  courseOpenId,
  openClassId,
  cellId,
  moduleId,
  currCellName
) {
  try {
    let resp = await request(
      'https://zjy2.icve.com.cn/api/common/Directory/changeStuStudyProcessCellData',
      'post',
      {
        Cookie: cookie,
        Referer: `https://zjy2.icve.com.cn/common/directory/directory.html?courseOpenId=${courseOpenId}&openClassId=${openClassId}&cellId=${cellId}&moduleId=${moduleId}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        Host: 'zjy2.icve.com.cn',
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.2 Mobile/15E148 Safari/604.1'
      },
      {
        courseOpenId: courseOpenId,
        openClassId: openClassId,
        cellId: cellId,
        moduleId: moduleId,
        cellname: currCellName
      }
    );
    return resp;
  } catch (e) {
    console.error(e);
  }
}
async function stuProcessCellLog(
  cookie,
  courseOpenId,
  openClassId,
  cellId,
  moduleId,
  page,
  celltime,
  retryCount
) {
  try {
    let resp = await request(
      'https://zjy2.icve.com.cn/api/common/Directory/stuProcessCellLog',
      'post',
      {
        Cookie: cookie,
        Referer: `https://zjy2.icve.com.cn/common/directory/directory.html?courseOpenId=${courseOpenId}&openClassId=${openClassId}&cellId=${cellId}&moduleId=${moduleId}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        Host: 'zjy2.icve.com.cn',
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 13_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.2 Mobile/15E148 Safari/604.1'
      },
      {
        courseOpenId: courseOpenId,
        openClassId: openClassId,
        cellId: cellId,
        cellLogId: '',
        picNum: page,
        studyNewlyTime: celltime,
        studyNewlyPicNum: page
      }
    );
    resp = resp.data;
    let code = resp.code;
    if (code == -2 || code == -1 || code == -500) {
      if (retryCount) {
        console.error(`${resp.msg},10秒后进行第${3 - retryCount}次尝试`);
        retryCount--;
        await sleep(10);
        console.warn('正在尝试');
        return await stuProcessCellLog(
          cookie,
          courseOpenId,
          openClassId,
          cellId,
          moduleId,
          page,
          celltime,
          retryCount
        );
      } else {
        alert(`${resp.msg},超出重试次数,强制睡眠5分钟`);
        await sleep(300);
      }
    } else if (code == 1) {
      if (page != 0) {
        $ui.toast(`${page}页${resp.msg}`);
        $cache.set(cellId, page);
      }
      if (celltime != 0) {
        $ui.toast(`${celltime}秒'${resp.msg}`);
        $cache.set(cellId, celltime);
      }
    } else {
      console.error('stuProcessCellLog');
      console.error(resp);
      return await stuProcessCellLog(
        cookie,
        courseOpenId,
        openClassId,
        cellId,
        moduleId,
        page,
        celltime,
        retryCount
      );
    }
    return;
  } catch (e) {
    console.error(e);
  }
}

async function request(url, method, headers, bodys) {
  switch (method) {
    case 'get':
      let resp = await $http
        .get({
          url: url,
          header: headers,
          timeout: 2
        })
        .then(async resp => {
          if (!resp.error) {
            return resp;
          }
          if (resp.error.code == -1001) {
            return await request(url, method, headers);
          } else {
            console.error(url);
            console.error(resp.error);
          }
        });
      return resp;
      break;
    case 'post':
      let rep = await $http
        .post({
          url: url,
          header: headers,
          body: bodys,
          timeout: 2
        })
        .then(async resp => {
          if (!resp.error) {
            return resp;
          }
          if (resp.error.code == -1001) {
            return await request(url, method, headers, bodys);
          } else {
            console.error(url);
            console.error(resp.error);
          }
        });
      return rep;
      break;
  }
}
