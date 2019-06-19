var app = getApp()
var myUrl = require("../../../utils/url.js");
var util = require('../../../utils/util.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    showTime: true, //时间倒数
    time: 60,
    aliData: "",
    beforeali: "", //原来支付宝账号
    name: "", //用户名
    alipay: "", //用户支付宝
    randCode: '', //验证码
    mobile: "", //用户手机
    giCode: true,
  },
  
  //生命周期函数--监听页面加载
  onLoad: function(options) {
    let that = this;
    console.log(options.beforeali)
    if (options.beforeali) {
      that.setData({
        showbefore: true,
        beforeali: options.beforeali
      })
      console.log('我是来修改的')
    } else {
      that.setData({
        showbefore: false
      })
      console.log('第一次填写')
    }
    that.setData({
      mobile: wx.getStorageSync('userMsg').mobile
    })
  },

  // 得到支付宝账号
  getaliNo: function() {
    var that = this;
    var pams = {
      token: wx.getStorageSync('token'),
    }
    util.request(myUrl.mainUrl + 'user/r/getAli', pams, 'GET', 0, function(res) {
      console.log(res.data);
      if (res.data.result == 'OK') {
        if (res.data.aliAccount) {
          that.setData({
            aliNo: res.data.aliAccount,
            aliname: res.data.name,
          })
        }
      }
    });
  },


  // 获取验证码
  randCode: function(e) {
    let that = this;
    let pams = {
      token: app.globalData.token,
      mobile: '',
      type:6,
      deviceId: "/mini"
    };
    util.request(myUrl.goodsUrl + "sms/send", pams, 'GET', "1", function(res) {
      wx.hideLoading()
      console.log(res)
      if (res.data.result != "OK") {
        wx.showToast({
          title: res.data.result,
          icon: 'none',
          mask: "true",
          duration: 2000,
        })
        return;
      }
      wx.showToast({
        title: "发送成功,请注意查收",
        icon: 'none',
        duration: 1000,
      })
      //计时器
      that.setData({
        showTime: false
      });
      that.myTimer = setInterval(() => {
        that.setData({
          time: that.data.time - 1
        });
        if (that.data.time == 0) {
          clearInterval(that.myTimer);
          that.myTimer = null;
          that.setData({
            showTime: true,
            time: 60,
          });
        }
      }, 1000);
    });

  },


  //清除定时器
  onUnload: function() {
    let that = this;
    clearInterval(that.myTimer);
    that.setData({
      giCode: true,
      time: 60
    });
  },



  //提交
  submit: function() {
    var that = this;
    var name, alipay, mobile, randCode;
    name = that.data.name;
    alipay = that.data.alipay;
    mobile = that.data.mobile;
    randCode = that.data.randCode;


    // 支付宝账号校验    
    var phReg = /^[1][3,4,5,7,8][0-9]{9}$/;  //手机号码正则    
    var emReg = /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/; //邮箱正则
    
    //是否符合
    var isReg = false;
    phReg.test(alipay) ? isReg = true : (emReg.test(alipay) ? isReg = true : isReg = false);

    // 验证码校验 
    let codeisReg = false;
    let codeReg = /^[0-9]*$/
    codeReg.test(randCode) ? codeisReg = true : codeisReg = false;

    console.log(codeisReg);


    if (name == "") {
     var title = '亲，姓名不能为空';
      wx.showToast({
        title: title,
        icon: "none",
        mask: "true",
        duration: 1000
      })
      return;
    }

    //  验证支付宝账号
    if (!isReg) {
      wx.showToast({
        title: '亲，支付宝帐号有误',
        icon: "none",
        mask: "true",
        duration: 2000
      })
      return;
    }

    //  验证验证码
    if ((randCode.length > 6 || randCode.length < 4 || randCode.length == 5) || randCode == "" || !codeisReg) {
      wx.showToast({
        title: '亲，请输入正确的验证码',
        icon: "none",
        mask: "true",
        duration: 1000
      })
      return;
    }


    //先提示
    wx.showModal({
      title: '提示',
      content: '请仔细核对支付宝账号及实名是否输入正确，实名与支付宝所绑定的用户名必须一致',
      cancelText: "再去检查",
      confirmText: "确定",
      success: function(res) {
        if (res.confirm) {
          let that = this;
          let pams = {
            token: app.globalData.token,
            aliAccount: alipay,
            name: name,
            randCode: randCode,
            mobile: mobile,
          };
          util.request(myUrl.goodsUrl + "user/updateAli", pams, 'GET', "1", function(res) {
            console.log(res)
            if (res.data.result != "OK") {
              wx.showToast({
                title: res.data.result,
                icon: 'none',
                mask: "true",
                duration: 2000,
              })
              return;
            }

            wx.showToast({
              title: '绑定成功',
              icon: "none",
              mask: "true",
              duration: 2000
            })
            setTimeout(function() {
              wx.navigateBack({
                delta: 1
              })
            }, 1000)
          });

        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })


  },

  //用户输入的姓名
  inputName: function(e) {
    var that = this;
    var name = e.detail.value;
    that.setData({
      name: name
    })
  },

  onPullDownRefresh: function() {
    // var that = this;
    // that.setData({
    //   page: 1,
    //   nomore: false,
    //   stop: false, //是否停止下拉刷新
    // })
    // that.getData(1, 1);
    setTimeout(()=>{
      wx.stopPullDownRefresh();
    },300);
  },
  // 支付账号
  inputAlipay: function(e) {
    var that = this;
    var alipay = e.detail.value;

    that.setData({
      alipay: alipay
    })
  },

  // 手机号 
  inputPhone: function(e) {
    var key = e.detail.value;
    let isReg = false;
    //手机号码正则
    let phReg = /^[1][3,4,5,7,8][0-9]{9}$/;
    phReg.test(key) ? isReg = true : isReg = false
    if (key == "" && key.length != 11) {
      wx.showToast({
        title: '亲，请输入正确的手机号码',
        icon: "none",
        mask: "true",
        duration: 2000
      })
      this.setData({
        phone: ""
      })
    } else {
      this.setData({
        phone: key
      })
    }
  },

  // 存储验证码内容
  inputCode: function(e) {
    let that = this;
    var randCode = e.detail.value;
    //  验证验证码
    that.setData({
      randCode: randCode
    })
  },

  onHide: function() {
    this.onUnload();
  }
})