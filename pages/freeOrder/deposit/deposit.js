// pages/home/deposit/deposit.js
const app = getApp();
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
    aliNo: '',
    aliname: '',
    waitDeal: '',
    amount_: '',
    balance: '',
    show_info_box_mod:false,
    toAli:false,
    balance: 0,
    freeWallet: 0,
    no_balance: 0,
    aliphone:'',
    aliAccount: ''
    // success:true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    that.getali();
    console.log(options);  //上个页面带过来的余额跟号码
    // that.setData({
    //   wallet: parseFloat(options.wallet).toFixed(2),
    //   aliNo: options.phone
    // });
    var aliinfo = wx.getStorageSync('aliinfo');
    if ((that.data.aliphone && that.data.aliname) || aliinfo) {
      that.setData({
        toAli:false
      });
    }else{
      that.setData({
        toAli:true
      });
    }

    // that.getaliNo();
    // that.getwallet();
  },
  toAliPage: function(){
    wx.navigateTo({
      url: "/pages/freeOrder/Alipay/Alipay"
    })
  },
  //提现  如果支付宝账号存在去提现   不存在去绑定
  godeposit: function () {
    var that = this;
    var aliinfo = wx.getStorageSync('aliinfo');
    console.log(aliinfo);
    if ((that.data.aliphone && that.data.aliname) || aliinfo) {
      wx.navigateTo({
        url: "/pages/home/deposit/deposit?phone=" + that.data.aliphone + '&wallet=' + that.data.wallet
      })
    } else {
      wx.navigateTo({
        url: "/pages/home/setup/Alipay/Alipay"
      })
    }
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
          wallet: parseFloat(res.data.amount).toFixed(2)
        })
      }
      
    });
  },
//获取支付宝账号
getWdInfo: function () {
  var that = this;
  var pams = {
    token: wx.getStorageSync('token'),
  }
  util.request(myUrl.mainUrl + 'pdd/free/getWdInfo', pams, 'GET', 0, function (res) {
    console.log(res.data);
    if (res.data.result == 'OK') {
      
      that.setData({
        // aliNo: res.data.aliAccount,
        // aliname: res.data.name,
        // waitDeal: res.data.wd,
        // amount_: res.data.amount,

        freeWallet: res.data.freeWallet,
        balance: res.data.balance,
        no_balance: res.data.no_balance,
        aliAccount:res.data.aliAccount
      })
    }     
  });
},
//获取支付宝信息并保存在全局
getali: function () {
  var that = this;
  //  获取用户信息  判断用户是否绑定支付宝
  var pams = {
    token: wx.getStorageSync('token'),
  }

  util.request(myUrl.mainUrl + 'user/r/getAli', pams, 'GET', 0, function (res) {
    // console.log(res.data);
    if (res.data.result == 'OK') {
      if (res.data.aliAccount) {
        that.setData({
          aliphone: res.data.aliAccount,
          aliname: res.data.name
        })
        var aliinfo = {
          aliphone: res.data.aliAccount,
          aliname: res.data.name
        }

        app.globalData.aliinfo.aliphone = res.data.aliAccount; //保存在全局
        app.globalData.aliinfo.aliname = res.data.aliname; //保存在全局

        wx.setStorageSync('aliinfo', aliinfo); //保存在本地
        
        var aliinfo_ = wx.getStorageSync('aliinfo');
        if ((that.data.aliphone && that.data.aliname) || aliinfo_) {
          that.setData({
            toAli:false
          });
        }else{
          that.setData({
            toAli:true
          });
        }
      }
    } else {
      wx.showToast({
        title: res.data.result,
        mask: "true",
        icon: 'none',
        duration: 3000
      })
      return;
    }
  });

},
  //获取支付宝账号
  // getaliNo: function () {
  //   var that = this;
  //   var pams = {
  //     token: wx.getStorageSync('token'),
  //   }
  //   util.request(myUrl.mainUrl + 'user/r/getAli', pams, 'GET', 0, function (res) {
  //     console.log(res.data);
  //     if (res.data.result == 'OK') {
  //       // that.setData({
  //       //   aliNo: res.data.aliAccount,
  //       //   aliname: res.data.name,
  //       //   waitDeal: res.data.wd,
  //       //   amount: res.data.amount,
  //       //   balance: res.data.balance,
  //       // })
  //     }     
  //   });
  // },
  
  close_info_box(){
    let that = this;
    that.setData({
      show_info_box_mod:false,
    })
  },
  open_info_box(){
    let that = this;
    that.setData({
      show_info_box_mod:true,
    })
  },
  //提现
  deposit: function() {
    let that = this;
    if(that.data.toAli){
      wx.navigateTo({
        url: "/pages/home/setup/Alipay/Alipay"
      });
      return;
    }
    let reg_num = /^[0-9]+([.]{1}[0-9]{1,2})?$/;
    if (that.data.amount == '') {
      wx.showToast({
        title: '提现金额不能为空！',
        icon: 'none'
      })
      return;
    }

    if (!reg_num.test(that.data.amount)) {
      wx.showToast({
        title: '提现金额格式错误！必须为>0的金额，精确到小数点后2位！',
        icon: 'none'
      })
      return;
    }
    if ((that.data.amount)<1) {
      wx.showToast({
        title: '最低提现金额1元！',
        icon: 'none'
      })
      return;
    }
    // return;
    var pams = {
      token: wx.getStorageSync('token'),
      amount: that.data.amount,
    }
    util.request(myUrl.mainUrl + 'pdd/free/wd', pams, 'GET', 0, function(res) {
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
  },

  //去修改
  gochange: function() {
    var that=this;
    wx.navigateTo({
      url: '/pages/home/setup/Alipay/Alipay?beforeali=' + that.data.aliNo,
    })
  },
  toIncomeList: function(){
    
    wx.navigateTo({
      url: "/pages/freeOrder/incomelist/incomelist",
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
    var that=this;
    // this.getaliNo();
    this.getWdInfo();
    this.getwallet();
    this.getali(); //更新支付宝信息
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