const app = getApp()
const myUrl = require("../../utils/url.js");
const util = require('../../utils/util.js');
Page({
  //页面的初始数据
  data: {
    _num: 1,//初始页面 A级  B级
    page_num: 0,
  },


  onLoad: function (options) {
    // //判断是否登录
    // options = util.isLogin(this, app);
    // if (!options) return; 

    // if (getCurrentPages().length < 2) {
    //   //从其他页面直接跳转过来的，如 分享,  模板消息
    //   this.setData({
    //     ifRootPage: true
    //   })
    // }
    // this.getData(0, 1); 
    wx.setNavigationBarTitle({ title: '收入明细' });// title名 
  },
  // 页面多次渲染
  onShow:function(){
    // this.upgradeStatus()
    wx.setNavigationBarTitle({ title: '收入明细' });// title名 
  },
  tabSwitch: function(e){
    let e_num = e.currentTarget.dataset.style;
    if (this.data._num == e_num) {
        return
      } else if (e_num == 1) {
        this.setData({
          _num: 1
        })
      } else if (e_num == 2) {
        this.setData({
          _num: 2
        })
      } 
  },
  toHomePage:function(){
    console.log(666666666);
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
});