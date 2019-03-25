const app = getApp()
const myUrl = require("../../utils/url.js");
const util = require('../../utils/util.js');
var userMsg = wx.getStorageSync('userMsg');


Page({
  //页面的初始数据
  data: {
    maskphone: false,
    peonum: 0, //解锁几位小伙伴
    user: '', //用户信息
    phone: "", //电话号码
    role: 0, //角色代号 0粉丝  


    fromId: '', //收集fromId
    ifNeedCut: 0, //是否开启砍价功能
    ifNeedSchool: 0, //是否显示，0关，1开
    totalOrders: 0, //累计订单数(只计算直属)
    totalCommission: 0, //累计收益
    totalCheap: 0, //累计省钱(只计算直属)
    totalCousume: 0, //累计消费(只计算直属)
    wallet: 0, //个人可提现余额
    showDraw: false, //是否展示
    getSys: false, //默认是苹果系统
    buyMsg: [], //用户购买信息
    showMsg: '', //页面展示效果
    sm: false, //控制用户购习信息浮显


    sendMsg: '',
  },

  onLoad: function (options) {
    var that = this;
    that.getali(); //获取支付宝信息
    wx.setNavigationBarTitle({
      title: '我的',
    })

    console.log(wx.getStorageSync('userMsg').role)

    that.setData({
      role: wx.getStorageSync('userMsg').role, //角色代号 0粉丝  
    })
    //是否展示新手教程
    if (that.data.role == 0 && !app.globalData.ifShowCouse){
      that.setData({
        showcourse1:true
      })
    }
    
    that.meet();
    that.getrequest();


    //先检查sessionKey
    wx.checkSession({
      success: function () {
        console.log('sessionKey没过期session_key' + wx.getStorageSync('sessionKey'));
        that.setData({
          session_key: wx.getStorageSync('sessionKey')
        })
      },
      fail: function () {
        wx.login({
          success: res => {
            // console.log(res.code)
            let props = {
              jsCode: res.code,
              appid: app.globalData.APPID,
              secret: app.globalData.AppSecret
            }

            //第三方调用的接口
            let ifExt = null;
            app.globalData.ext ? ifExt = 'mini/user/componentOauth' : ifExt = 'mini/user/oauthByAppid';
            util.request(myUrl.userUrl + ifExt, props, "GET", 0, function (res) {
              let iscancel = res.errMsg.split(":")[1]
              if (iscancel != 'ok') {
                wx.showToast({
                  title: res.errMsg,
                  icon: 'none',
                  mask: 'true',
                  duration: 3000,
                })
                return;
              } else {
                console.log('session_key 已经失效,,新的session_key' + res.data.session_key);
                that.setData({
                  session_key: res.data.session_key
                })
              }

            })
          },
          fail: (res) => {
            console.log(res);
            wx.showToast({
              title: res.errMsg,
              icon: 'none',
              mask: 'true',
              duration: 3000,
            })
            return;
          }
        })


      }

    })
  },

  couse1ok: function(e){
    this.setData({
      showcourse1:false,
      showcourse2:true
    })
  },
  couse2ok: function (e) {
    app.globalData.ifShowCouse=true;
    this.setData({
      showcourse1: false,
      showcourse2: false
    })
  },
  copycon: function (e) {
    var con = e.currentTarget.dataset.concent;
    console.log(con.toString())
    util.copy(con.toString(), function () {

    })
  },


  // 数据请求
  getrequest: function () {
    let ts = this;
    let pams = {
      token: app.globalData.token,
      deviceId: "/mini"
    };
    util.request(myUrl.goodsUrl + 'order/r/stats', pams, 'GET', "1", function (res) {
      wx.stopPullDownRefresh()
      if (res.data.result != "OK") {
        wx.showToast({
          title: res.data.result,
          mask: "true",
          icon: 'none',
          duration: 3000
        })
        return;
      }
      res.data.totalCommission = res.data.totalCommission.toFixed(2)
      ts.setData({
        stats: res.data,
      })

    })
  },

  //生命周期函数--监听页面显示（多次）
  onShow: function () {
    wx.setNavigationBarTitle({
      title: '我的',
    })

    this.data.fromId = '';
    this.data.n = 0;

    this.getUserInfo() //获取用户信息
    this.getWallet(); //获取钱包
    this.getali(); //更新支付宝信息
    this.getnum(); //更新人数

    this.setData({
      ifNeedCut: app.globalData.sysData.ifNeedCut,
      ifNeedSchool: app.globalData.sysData.ifNeedSchool,
      ifNeedVoide: app.globalData.sysData.ifNeedVoide
    })
  },


  //获取formId
  formSubmit: function (e) {
    util.formId(e, app)
  },

  //下拉刷新 
  onPullDownRefresh: function () {
    let that = this;
    that.getUserInfo()

    wx.stopPullDownRefresh();
  },

  /*页面跳转*/
  jump: function (e) {
    var that = this;
    let n = parseInt(e.currentTarget.dataset.type);
    console.log(n);
    switch (n) {
      case 1:
        wx.navigateTo({
          url: "/pages/home/profit/profit"
        })
        break;
      case 2:
        wx.navigateTo({
          url: "/pages/home/profit/order/order"
        })
        break;
      case 3:
        wx.navigateTo({
          url: "/pages/home/team/team?ifQueryUnite=" + this.data.user.role
        })
        break;
      case 4:
        wx.navigateTo({
          url: "/package/pages/yaoqing/yaoqing"
        })
        break;
      case 5:
        wx.navigateTo({
          url: "/pages/home/collect/collect"
        })
        break;


      // case 6: //设置跳转出去
      //   var user = that.data.user;
      //   console.log(that.data.user.ins);
      //   if (user.ins) {
      //     wx.navigateTo({
      //       url: "/pages/home/setup/lookInfo/lookInfo?point=mySelf"
      //     })
      //   } else {
      //     wx.navigateTo({
      //       url: "/pages/home/setup/setupInfo/setupInfo"
      //     })
      //   }
      //   break;


    }
  },


  // 用户提现金额
  getWallet: function () {
    let that = this;
    let pams = {
      token: app.globalData.token,
      deviceId: "/mini"
    };
    util.request(myUrl.goodsUrl + 'order/r/stats', pams, 'GET', 0, function (res) {
      wx.stopPullDownRefresh()
      if (res.data.result != "OK") {
        wx.showToast({
          title: res.data.result,
          mask: "true",
          icon: 'none',
          duration: 3000
        })
        return;
      }
      that.setData({
        totalOrders: res.data.totalOrders, //累计订单数(只计算直属)
        totalCommission: res.data.totalCommission, //累计收益
        totalCheap: res.data.totalCheap, //累计省钱(只计算直属)
        totalCousume: res.data.totalCousume, //累计消费(只计算直属)
        wallet: res.data.wallet, //个人可提现余额
      })
    })
  },
  // 获取手机系统信息
  getSys: function () {
    let that = this;
    wx.getSystemInfo({
      success: function (res) {
        let reg = /iOS/i;
        if (reg.test(res.system)) {
          that.setData({
            getSys: true
          })
          // console.log(res.system)
        }
      }
    })
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


  //判断小程序是否己经认证
  meet: function () {
    let that = this;
    util.request(myUrl.mainUrl + 'mini/user/miniJoinUsInfo', {}, 'GET', 1, function (res) {
      if (res.data.result != "OK") {
        wx.showToast({
          title: res.data.result,
          icon: "none",
          mask: true,
          duration: 3000
        })
        return;
      }
      that.setData({
        proxyPooster: res.data.img,
        //判断小程序是否己经认证  1己认证  2没认证 
        ifAuth: res.data.type
        // ifAuth:2
      })
    })
  },

  //  加入合伙人
  gocourse: function () {
    wx.navigateTo({
      url: "/package/pages/course/course"
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

  //升级
  getPhoneNumber: function (e) {
    let that = this;

    //用户取消手机授权直接返回
    if (e.detail.iv == undefined && e.detail.encryptedData == undefined) {
      return;
    }

    console.log('升级用的session_key' + that.data.session_key)

    let param = {
      token: app.globalData.token,
      encryptedData: e.detail.encryptedData,
      sessionKey: that.data.session_key,
      iv: e.detail.iv,
      type: 1
    }

    util.request(myUrl.mainUrl + 'user/updateMobile', param, 'GET', 1, function (res) {
      that.upgrad(res)
    })

  },



  //没验证
  //验证手机号码
  inputPhone: function (e) {
    let phone = e.detail.value;
    let isReg = false;
    //手机号码正则
    let phReg = /^[1][3,4,5,7,8][0-9]{9}$/;
    phReg.test(phone) ? isReg = true : isReg = false
    if (!isReg) {
      wx.showToast({
        title: '亲，手机号码有误',
        icon: "none",
        mask: "true",
        duration: 2000
      })
      this.setData({
        phone: ""
      })
    } else {
      this.setData({
        phone: phone
      })
    }
  },

  //获取手机验证码
  getCode: function () {
    let that = this;
    if (that.data.phone == "") {
      wx.showToast({
        title: '亲,请输入手机号码',
        icon: "none",
        mask: "true",
        duration: 2000
      })
      return;
    }
    let pams = {
      mobile: that.data.phone,
      token: app.globalData.token
    };
    util.request(myUrl.mainUrl + "sms/send", pams, 'GET', 1, function (res) {
      console.log(res)
      if (res.data.result != "OK") {
        wx.showToast({
          title: res.data.result,
          icon: 'none',
          duration: 3000,
        })
        return
      }
      wx.showToast({
        title: "发送成功,请注意查收",
        icon: 'none',
        duration: 3000,
      })

      //计时器
      that.setData({
        giCode: false
      });
      that.myTimer = setInterval(() => {
        that.setData({
          time: that.data.time - 1
        });
        if (that.data.time == 0) {
          clearInterval(that.myTimer);
          that.myTimer = null;
          that.setData({
            giCode: true,
            time: 60
          });
        }
      }, 1000);
    })
  },

  //验证码判断
  inputCode: function (e) {
    let that = this;
    let code = e.detail.value;
    if (code == "") {
      wx.showToast({
        title: '亲,验证码不能为空',
        icon: "none",
        mask: "true",
        duration: 2000
      })
      return;
    }
    that.setData({
      authCode: code
    })
  },


  //提交按钮
  submit: function () {
    let that = this;
    let authCode = this.data.authCode;
    let phone = this.data.phone;

    if (authCode == "" || phone == "") {
      wx.showToast({
        title: '亲，输入内容不能为空',
        icon: "none",
        mask: "true",
        duration: 2000
      })
      return;
    }
    let pams = {
      mobile: phone,
      randCode: authCode,
      token: app.globalData.token,
      type: 1
    };

    util.request(myUrl.mainUrl + 'user/updateMobile', pams, 'GET', 1, function (res) {
      that.upgrad(res)
    });
  },

  getnum: function () {
    let that = this;
    let pams = {

      token: app.globalData.token,

    };

    util.request(myUrl.mainUrl + 'user/r/myLevel', pams, 'GET', 0, function (res) {
      if (res.data.result == 'OK') {
        that.setData({
          peonum: res.data.num
        })
      }
    });
  },


  //升级代理
  upgrad: function (res) {
    let that = this;
    console.log(res.data);
    if (res.data.result != "OK") {
      wx.showToast({
        title: res.data.result,
        icon: "none",
        mask: true,
        duration: 3000
      })
      return;
    }

    //数据更新
    app.globalData.user.mobile = res.data.mobile;
    app.globalData.role = res.data.role;
    app.globalData.user.roleName = res.data.roleName;
    app.globalData.user.role = res.data.role;

    //保存在本地缓存
    var user = wx.getStorageSync('userMsg');
    user.mobile = res.data.mobile;
    user.role = res.data.role;
    wx.setStorageSync("userMsg", user)


    that.getUserInfo(); //更新个人信息

    that.setData({
      role: res.data.role
    })

    //返回上一级
    wx.showToast({
      title: '升级成功',
      icon: "none",
      mask: true,
      duration: 2000
    })


  },

  //清除定时器
  onUnload: function () {
    let that = this;
    clearInterval(that.myTimer);
    that.setData({
      giCode: true,
      time: 60
    });
  },

  //获取个人信息并更新
  getUserInfo: function () {
    let that = this;
    let pams = {
      token: app.globalData.token,
      appid: app.globalData.APPID,
    }
    util.request(myUrl.mainUrl + 'user/r/get', pams, 'GET', 0, function (res) {
      console.log(res.data)
      if (res.data.result == 'OK') {
        that.setData({
          user: res.data,
          sendMsg:res.data.wxAccount,
          role: res.data.role
        })
       
        var userMsg = res.data; //更新本地缓存
        wx.setStorageSync('userMsg', userMsg);
        app.globalData.user = userMsg; //更新全局
        app.globalData.role = userMsg.role;

        res.data.role > 0 && that.getWallet(); //消费者，不存在钱包
      }
    })




  },


  //键盘输入时获取搜索的值
  bindBlur: function (e) {
    var that = this;
    var sendMsg = e.detail.value;
    that.setData({
      sendMsg: sendMsg
    })
  },

  showphone: function () {
    this.setData({
      maskphone: true
    })

  },

  firm: function () {
    let that = this;
    let pams = {
      token: app.globalData.token,
      wxAccount: that.data.sendMsg,
    }
    util.request(myUrl.mainUrl + 'user/s/updateWxAccount', pams, 'GET', 0, function (res) {
      // console.log(res.data.result);
      if (res.data.result == 'OK') {
        that.setData({
          maskphone: false
        })
        wx.showToast({
          title: '绑定成功',
          icon: 'success',
          duration: 2000
        })

        that.getUserInfo();
      } else {
        console.log(res.data.result)
        wx.showToast({
          title: '请输入微信号',
          icon: 'none',
          duration: 2000
        })
        // that.setData({
        //   maskphone: false
        // })
      }
    })

  },

  exit: function () {
    this.setData({
      maskphone: false
    })
  }


})