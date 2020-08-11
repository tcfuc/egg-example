// app/service/user.js
const Service = require('egg').Service;
const superagent = require('superagent');
const { consoleLevel } = require('egg-mock');

class SpiderService extends Service {

  async getXueXiUrls(urls) {
    let result = [];
    let all = [];

    // await superagent.get(url).then(
    //   (res) => {
    //     result = JSON.parse(res.text);
    //   },
    //   (err) => {
    //     console.log(`学习强国抓取失败 - ${err}`);
    //   }
    // )

    await urls.forEach((item, index) => {
      let one = new Promise((resolve, reject) => {
        superagent.get(item).then(
          (res) => {
            // result = JSON.parse(res.text);
            result.push.apply(result,JSON.parse(res.text));
            console.log(`学习强国抓取成功 - ${item}`);
            resolve();
          },
          (err) => {
            console.log(`学习强国抓取失败 - ${err}`);
            reject();
          }
        )
      })
      all.push(one);
    })

    await Promise.all(all);

    return result;
  }

  async getXueXiNews(res, maxLength = 300, startTime = '1970-01-01 00:00:00', endTime = '2399-12-31 23:59:59') {
    function check(item, length) {
      if (length < maxLength) {
        if (DateDiff(item.publishTime, startTime) && DateDiff(endTime, item.publishTime)) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    };

    function DateDiff(Date_end, Date_start) {
      if(Date_end && Date_start){
        let aDate, oDate1, oDate2, iDays;
        Date_end = Date_end.split(" "); //将时间以空格划分为两个数组  第一个数组是 2019-05-20 第二个数组是 00：00：00
        aDate = Date_end[0].split("-"); //获取第一个数组的值
        oDate1 = new Date(aDate[0], aDate[1], aDate[2]); //将前半个数组以-拆分，每一个是一个数值
        Date_start = Date_start.split(" ");
        aDate = Date_start[0].split("-");
        oDate2 = new Date(aDate[0], aDate[1], aDate[2]);
        iDays = oDate1 - oDate2; //把相差的毫秒数转换为天数
  
        if(iDays < 0) {
          return false;
        } else {
          return true;
        }
      } else {
        return false;
      }
      
    }

    let myList = [];
    await res.forEach((item, index) => {
      if (check(item, myList.length)) {
        let myData = {
          editor: [],
          title: '',
          url: '',
          publishTime: '',
        };
        myData.editor = item.editor;
        myData.title = item.title;
        myData.url = item.url;
        myData.publishTime = item.publishTime;
        myList.push(myData);
      }
    });

    return myList;
  }

  async getNewsContent(res) {
    let myList = [];
    let all = [];

    await res.forEach((item, index) => {
      let one = new Promise((resolve, reject) => {
        if (item.url.indexOf('?id')) {
          const jsUrlTemp = item.url.slice(0, item.url.indexOf('/'));
          const jsUrlId = item.url.slice(item.url.indexOf('?id') + 4, item.url.indexOf('&'));
          const jsUrl = jsUrlTemp + '//boot-source.xuexi.cn/data/app/' + jsUrlId + '.js';
          this.getUrl(jsUrl).then(
            (res) => {
              resolve(res);
            }
          );
        }
      }).then((res) => {
        myList.push(res);
      });
      all.push(one);
    })

    await Promise.all(all);

    return myList;
  }

  async getUrl(url) {
    const detail = await superagent.get(url).then(
      async (res) => {
        let text = res.body.toString('utf8', 0,);
        text = text.slice(9, text.lastIndexOf(')'));

        let detail = await this.getDetailNew(text);
        return detail;
      },
      (err) => {
        console.log(`详情抓取失败 - ${err}`);
      }
    );

    return detail;
  }

  async getDetailNew(res) {
    let myData = {
      title: '',
      content: '',
      draft: 'N',
      type: 1,
      validTime: 0,
      source: '',
      creator: '',
      createTime: '',
    };

    async function computeTime(res) {
      let chineseArray = [];
      await res.replace((/[\u4e00-\u9fa5]/gm), function () {
        var text = arguments[0];
        var index = arguments[arguments.length - 2];
        chineseArray.push({
          text: text,
          index: index
        });
        return text;
      });
      let length = chineseArray.length;
      let contentTime = (length < 90) ? 1 : parseInt(length / 90);
      return contentTime;
    }

    res = JSON.parse(res);
    myData.title = res.title;
    myData.content = await this.formatNewsContent(res.content);
    myData.source = res.show_source;
    myData.creator = res.show_source;
    myData.createTime = res.publish_time;
    myData.validTime = await computeTime(myData.content);

    return myData;
  };

  async formatNewsContent(content) {
    let index = content.indexOf('<!--{img:'); // 字符出现的位置
    let num = 0; // 这个字符出现的次数

    while (index !== -1) {
      content = content.replace(`<!--{img:${num}}-->`, '')
      num++; // 每出现一次 次数加一
      index = content.indexOf('<!--{img:', index + 1); // 从字符串出现的位置的下一位置开始继续查找
    }
    return content;
  };

  async addXueXiNews(res) {
    let all = [];
    let result = "";

    await res.forEach((item, index) => {
      let one = new Promise((resolve, reject) => {
        superagent.post('http://localhost/fjpx/manager/news/one').set('Content-Type', 'application/json').send(JSON.stringify(item)).end((err, res) => {
          if (err) {
            reject(err);
          } else {
            resolve(res);
          }
        })
      })
      all.push(one);
    })

    await Promise.all(all).then(
      (res) => {
        result = `学习强国新增成功`;
      },
      (err) => {
        result = `学习强国新增失败 - ${err}`;
      }
    )

    return result;
  }
}

module.exports = SpiderService;