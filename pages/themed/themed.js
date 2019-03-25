// pages/atext/atext.js

const app = getApp()
const myUrl = require("../../utils/url.js");
const util = require("../../utils/util.js");
var user = wx.getStorageSync('userMsg');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    role: user.role, //用户角色
    arrange: 0, //商品显示样式
    goodslist: [],
    themeId:'', //主题id
    imageUrl:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    //设置标题
    wx.setNavigationBarTitle({
      title: options.title || app.globalData.title
    })
  
    if (getCurrentPages().length < 2){
       //从其他页面直接跳转过来的，如 分享,  模板消息
      that.setData({
        ifRootPage: true
      })
    }
    that.setData({
      themeId: options.themeId
    })
    that.goodslist(1,1)
  },

  //获取主题商品------------------------------------------
  goodslist: function (page, load) {
    let that = this;
    // myUrl.mainUrl + that.data.api

    if (page == 1) {
      that.setData({
        showloding: false,
        nomore: false,
        goodslist: [],
      })
    } else {
      that.setData({
        showloding: true,
      })
    }

    var pams = {
      token: app.globalData.token,
      themeId: that.data.themeId,
    }

    util.request(myUrl.mainUrl + 'pdd/theme/list?', pams, 'GET', load, function (res) {
      if (res.data.result != "OK") {
        wx.showToast({
          title: res.data.result,
          mask: "true",
          icon: 'none',
          duration: 3000
        })
        return;
      }

      var result = res.data.list;
      var len = result.length


      //小数点格式化
      for (let j = 0; j < len; j++) {
        result[j].couponMoney = result[j].couponMoney.toFixed(0);
        result[j].price = result[j].price.toFixed(2);
        result[j].endPrice = result[j].endPrice.toFixed(2);
        result[j].commission = result[j].commission.toFixed(2);
      }


      that.setData({
        goodslist:result,
        imageUrl: res.data.imageUrl
      })

    })

  },

  godetail: function (e) {
    let that = this;
    var id = e.currentTarget.dataset.id;
    var platform = e.currentTarget.dataset.platform
    wx.navigateTo({
      url: '/pages/details/details?id=' + id + '&platform=' + platform,
    })
  },
  //返回首页
  toHome: function () {
    wx.reLaunch({
      url: '/pages/index/index',  //周id
    })
  },
 

  

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
   
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let that = this;
    that.setData({
      role: wx.getStorageSync('userMsg').role, //角色代号 0粉丝   
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
   

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    let pages = getCurrentPages();
    let currentPage = pages[pages.length - 1];
    let url = currentPage.route;
    let options = currentPage.options
    url = url + "?themeId=" + options.themeId+ "&title=" + options.title + "&userId=" + app.globalData.user.unionidF;
    return {
      path: url
    }
  },


 
})