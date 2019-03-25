// package/pages/pddpacket/pddpacket.js
const app = getApp()
const myUrl = require("../../../utils/url.js");
const util = require('../../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    wxExtraData: '',
    page_path: ''
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    that.getjumpinfo()
  },

  //获取跳转到拼多多所带的参数-----------------------------------------
  getjumpinfo: function() {
    let that = this;
    var pams = {
      token: app.globalData.token,
      partnerId: 888923
    }
    util.request(myUrl.mainUrl + 'pdd/getPddRed?', pams, 'GET', 0, function(res) {
      if (res.data.result != "OK") {
        wx.showToast({
          title: res.data.result,
          mask: "true",
          icon: 'none',
          duration: 3000
        })
        return;
      }
      // console.log(res.data)
      that.setData({
        wxExtraData: '',
        page_path: res.data.page_path
      })
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
  onPullDownRefresh: function() {
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      path: 'package/pages/pddpacket/pddpacket?userId=' + app.globalData.user.unionidF
    }
  }
})