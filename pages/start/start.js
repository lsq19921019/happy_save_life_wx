const app = getApp();
const util = require("../../utils/util.js");
const myUrl = require("../../utils/url.js");

Page({
  //页面数据
  data: {
    options: null, //传过来的传数
    logo: app.globalData.headImg,
    title: app.globalData.title,
  },

  onLoad: function (options) {
    var that = this;

    //响应式高度
    wx.getSystemInfo({
      success: function (res) {
        var clientHeight = res.windowHeight,
          clientWidth = res.windowWidth,
          //比例
          rpxR = 750 / clientWidth;
        var calc = clientHeight * rpxR;
        console.log(calc)
        that.setData({
          winHeight: calc
        });
      }
    });
    
    //接收返回过来的options
    that.data.options = options;
    options = JSON.parse(options.options)     //params

    // 设置标题
    wx.setNavigationBarTitle({
      title: app.globalData.title
    });

    util.loginFlow(app, 1, () => { }); //换取seeionKey

    //获取
    //这里要分两种情况:扫码进来和非扫码进来
    if (options.scene) {   //小程序扫码进来  异步执行
      util.getParame(options.scene, (props) => {
        globalDataFun(props)
      })
      return;
    }

    globalDataFun(options); //不是扫码进来
    //全局参数赋值
    function globalDataFun(options) {
      console.log(options)
      app.globalData.userkey = options.userId || options.e || '';
      app.globalData.freePlatform = options.freePlatform || '';
      app.globalData.freeOrderId = options.freeOrderId || '';
      app.globalData.shareData = options.shareData || '' //判断能否领红包
    }
  },


  //用户授权登录回调
  accreditLogin: function (e) {
    if (!e.detail.encryptedData) return;
    wx.showLoading({
      mask: true,
      title: '正在登录中.....'
    })

    util.myLogin(app, 0, (res) => {
      if (res != 'OK') return;
      wx.showToast({
        title: "登录成功",
        icon: 'none',
        duration: 3000,
      })

      var options1 = getCurrentPages()[getCurrentPages().length - 1].options

      console.log(options1);
      setTimeout(() => {

        wx.reLaunch({
          url: options1.route + '?loginParm=' + options1.options,

          fail: function () {
            console.log('跳转到tabbar页面失败,直接默认跳转到首页')//跳转失败，直接默认跳转到首页
            wx.switchTab({
              url: '/pages/index/index',
            })

            // wx.switchTab({
            //   url: '/pages/home/home',
            // })

            // wx.showToast({
            //   title: "tabbar页面"+options1.route,
            //   icon: 'none',
            //   duration: 3000,
            // })
          }
        })

      }, 2000)
    })
  }
})