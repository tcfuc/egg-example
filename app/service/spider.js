// app/service/user.js
const Service = require('egg').Service;
const superagent = require('superagent');

class SpiderService extends Service {
  async find(uid) {
    const user = await this.ctx.db.query('select * from user where uid = ?', uid);
    return user;
  }

  async getXueXiUrls() {

  }

  async getXueXiNews() {

  }

  async getNewsContent() {

  }

  
}

module.exports = SpiderService;