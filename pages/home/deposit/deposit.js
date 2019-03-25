// pages/home/deposit/deposit.js

const myUrl = require("../../../utils/url.js");
const util = require("../../../utils/util.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    amount: '',
    wallet: '',
    aliNo: '',
    success:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    console.log(options);  //上个页面带过来的余额跟号码
    that.setData({
      wallet: options.wallet,
      aliNo: options.phone
    })

    // that.getaliNo();
    // that.getwallet();
  },

   //获取输入金额
  bindBlur: function(e) {
    var that = this;
    var amount = e.detail.value
    that.setData({
      amount: amount
    })

  },
  // 获取余额
  getwallet:function(){
    var that = this;
    var pams = {
      token: wx.getStorageSync('token'),
    }
    util.request(myUrl.mainUrl + 'user/r/balance', pams, 'GET', 0, function (res) {
      console.log(res.data);
      if (res.data.result=='OK'){
        that.setData({
          wallet: res.data.amount
        })
      }
      
    });
  },

  //获取支付宝账号
  getaliNo: function () {
    var that = this;
    var pams = {
      token: wx.getStorageSync('token'),
    }
    util.request(myUrl.mainUrl + 'user/r/getAli', pams, 'GET', 0, function (res) {
      console.log(res.data);
      if (res.data.result == 'OK') {
        that.setData({
          aliNo: res.data.aliAccount,
          aliname: res.data.name
        })
      }     
    });
  },
  


  //提现
  deposit: function() {
    var that = this;
    if (that.data.amount == '') {
      wx.showToast({
        title: '提现金额不能为空！',
        icon: 'none'
      })
      return;
    }
    var pams = {
      token: wx.getStorageSync('token'),
      amount: that.data.amount,
    }
    util.request(myUrl.mainUrl + 'user/wd', pams, 'GET', 0, function(res) {
      console.log(res.data);
      if (res.data.result == 'OK') {
        wx.showToast({
          title: '提现成功!',
        })
        that.setData({
          success:true,
        })
      } else {
        wx.showToast({
          title: res.data.result,
          icon: 'none'
        })
      }
    });
x
  },

  //去修改
  gochange: function() {
    var that=this;
    wx.navigateTo({
      url: '/pages/home/setup/Alipay/Alipay?beforeali=' + that.data.aliNo,
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
  onShow: function(options) {
    this.getaliNo();
    this.getwallet();
  },
  gohome:function(){
    wx.navigateBack({
      delta: 1
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
      path: 'pages/index/index?userId=' + app.globalData.user.unionidF
    }
  }
})