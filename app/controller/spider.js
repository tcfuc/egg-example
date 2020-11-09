'use strict';

const Controller = require('egg').Controller;

class SpiderController extends Controller {
  async index() {
    const { ctx } = this;
    let newUrls = ['https://www.xuexi.cn/lgdata/1jscb6pu1n2.json?_st=26605838', 'https://www.xuexi.cn/lgdata/u1ght1omn2.json?_st=26618821', 'https://www.xuexi.cn/lgdata/slu9169f72.json?_st=26618868', 'https://www.xuexi.cn/lgdata/tuaihmuun2.json?_st=26618885', 'https://www.xuexi.cn/lgdata/1ajhkle8l72.json?_st=26618885'];
    
    //获取新闻列表
    let newsJson = await ctx.service.spider.getXueXiUrls(newUrls);
    //格式化数据并实现条件筛选
    let news = await ctx.service.spider.getXueXiNews(newsJson, 300, '2020-08-01 00:00:00');
    //获取新闻内容
    let contents = await ctx.service.spider.getNewsContent(news);
    console.log(contents.length);
    ctx.body = contents;
    //添加入数据库
    await ctx.service.spider.addXueXiNews(contents);
  }
}

module.exports = SpiderController;
