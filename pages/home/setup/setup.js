const app = getApp()
const myUrl = require("../../../utils/url.js");
const util = require('../../../utils/util.js');

Page({
  data: {
    link:'',
    serverLink:''
  },
  // 监听页面加载 一次
  onLoad: function (options) {
    util.request(myUrl.runUrl + 'sys/aboutBnln', {}, 'GET', 0, (res)=> {
      if (res.data.result != "OK") {
        wx.showToast({
          title: res.data.result,
          mask: "true",
          icon: 'none',
          duration: 3000
        })
        return;
      }
      this.setData({
        link: res.data.data.url
      })
    })
    util.request(myUrl.mainUrl + 'sys/serviceAndPrivocy', {}, 'GET', 0, (res) => {
      if (res.data.result != "OK") {
        wx.showToast({
          title: res.data.result,
          mask: "true",
          icon: 'none',
          duration: 3000
        })
        return;
      }
      this.setData({
        serverLink: res.data.url
      })
    })
  },
 
})