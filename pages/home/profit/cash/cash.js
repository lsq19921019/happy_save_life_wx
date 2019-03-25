var app = getApp()
var myUrl = require("../../../../utils/url.js");
var util = require('../../../../utils/util.js');
Page({
  //页面的初始数据
  data: {
    amount: 0,//提现的金额
    wallet: "",//余额
    // aliNo: "",//支付宝帐号帐号,
    AliAccount: "", //支付宝帐号
    ifWd: "", //是否可提现
    msg: "", //
    withdrawal: false //
  },
  //生命周期函数--监听页面加载
  onLoad: function (options) {
    this.setData({
      wallet: options.wallet
    })
    let pams = {};
    let ts = this;
    pams.token = app.globalData.token;
    util.request(myUrl.goodsUrl + "/user/r/getAli", pams, 'GET', "1", function (res) {
      if (res.data.result != 'OK') {
        wx.showToast({
          title: res.data.result,
          mask: "true",
          icon: 'none',
          duration: 3000,
        })
        return
      }
      ts.setData({
        AliAccount: res.data.aliAccount,
        name: res.data.name
      })
    })
  },
  //显示
  onShow: function () {
    var that = this;
    wx.getStorage({
      key: 'userMsg',
      success: function (res) {
        that.setData({
          // aliNo: res.data.aliNo
        })
      }
    })
  },
  //获取用户输入内容
  amountInput: function (e) {
    this.setData({
      amount: e.detail.value
    })
  },
  //提交提现审请
  button: function () {
    let that = this;
    var isbool = Number(that.data.amount) > Number(that.data.wallet)
    // 提现判断
    let pams = {
      token: app.globalData.token,
    };
    // 提现金额合法判断
    if (that.data.amount == "" || that.data.amount == 0) {
      wx.showToast({
        title: "亲,请填写提现金额",
        mask: "true",
        icon: 'none',
        duration: 1500,
      })
      return;
    } else if (isbool) {
      wx.showToast({
        title: "亲,您余额不足",
        mask: "true",
        icon: 'none',
        duration: 1500,
      })
      return;
    }
    util.request(myUrl.runUrl + '/user/r/wdCheck', pams, 'GET', "1", function (res) {
      if (res.data.result != 'OK') {
        wx.showToast({
          title: res.data.result,
          mask: "true",
          icon: 'none',
          duration: 1500,
        })
        return
      }
      that.setData({
        ifWd: res.data.ifWd,
        msg: res.data.msg
      })
      // 是否可提现判断
      if (that.data.ifWd != '1') {
        wx.showToast({
          // title: that.data.msg,
          title: "不在提现期间",
          mask: "true",
          icon: 'none',
          duration: 1500,
        })
        return
      } else {
        let pams = {
          token: app.globalData.token,
          amount: that.data.amount
        };
        util.request(myUrl.runUrl + 'user/wd', pams, 'GET', "1", function (res) {
          console.log(222)
          if (res.data.result != 'OK') {
            wx.showToast({
              title: res.data.result,
              mask: "true",
              icon: 'none',
              duration: 1500,
            })
            setTimeout(function(){
              that.getback()
            },2000)
            return
          }
          var num = that.data.wallet - that.data.amount;
          that.setData({
            wallet: num,
            withdrawal: true
          })
          // wx.showToast({
          //   title: "提现成功",
          //   mask: "true",
          //   icon: 'none',
          //   duration: 3000,
          // })
        })
      }
      // 判断
    })
  },
  // 修改支付宝账号
  Getali: function () {
    let ts = this;
    let sendAccount = ts.data.AliAccount;
    let sendName = ts.data.name;
    wx.navigateTo({
      url: '/pages/home/setup/Alipay/Alipay?aliAccount=' + sendAccount + '&name=' + sendName,
    })
  },
  // 返回上一层
  getback: function () {
    wx.navigateBack({
      delta: 1
    })
  }
})