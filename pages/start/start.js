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
    console.log(options);
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
    
    console.log('==========*********===========启动页参数==========*********===========');
    console.log('===========启动URL==========');
    console.log(wx.getStorageSync('url_free_order'));
    console.log('===========启动URL==========');
    //接收返回过来的options
    if(wx.getStorageSync('url_free_order')){
      console.log('======freeorder=======');
      that.data.options = wx.getStorageSync('opn_free_order');
      options = wx.getStorageSync('opn_free_order');     //params
      console.log(options);
      console.log('======freeorder=======');
    }else{
      console.log('======otherpage=======');
      that.data.options = options;
      // if(opnions.loginParm){
      //   options = options.options     //params
      // }else{
        options = JSON.parse(options.options)     //params
      // }
      console.log(options);
      console.log('======otherpage=======');
    }
    console.log('==========*********===========启动页参数==========*********===========');

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
      var options1 = {};
      if(wx.getStorageSync('url_free_order')){
        options1 = {};
        // var options1 = wx.getStorageSync('opn_free_order');
        console.log('=====================启动页参数==freeorder===================');
        // console.log(options1);
        // // console.log(options1.route);
        // // console.log(options1);
        // console.log(options1.route);
        // console.log(options1.options);
        options1.options = wx.getStorageSync('opn_free_order');
        options1.route = wx.getStorageSync('url_free_order');
        console.log('=====================启动页参数==freeorder===================');
        
      }else{
        options1 = getCurrentPages()[getCurrentPages().length - 1].options
        console.log('=====================启动页参数=====================');
        console.log(options1);
        // console.log(options1.route);
        // console.log(options1);
        console.log(options1.route);
        console.log(options1.options);
        if(JSON.parse(options1.options).route){
          wx.setStorageSync("url_free_order",JSON.parse(options1.options).route);
          wx.setStorageSync("opn_free_order",JSON.parse(options1.options).options);
        }
        console.log('=====================启动页参数=====================');
      }
      
      // console.log(options1.options.replace('\',''));
      // if(options1.route.indexOf('freeOrder')>-1){
      //   options1.options={};
      // }
      setTimeout(() => {
        if(wx.getStorageSync('url_free_order')){
          // var options1 = wx.getStorageSync('opn_free_order');
          console.log('=====================启动页参数==freeorder===================');
          // console.log(options1);
          // // console.log(options1.route);
          // // console.log(options1);
          // console.log(options1.route);
          // console.log(options1.options);
          options1.options = {};
          options1.route = '/pages/freeOrder/freeOrder';
          console.log(wx.getStorageSync('url_free_order'));
          console.log('=====================启动页参数==freeorder===================');
          
        }
        wx.reLaunch({
          url: options1.route + '?loginParm=' + options1.options,
          // url: options1.route + '?loginParm={}',

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
          },
          success: function(){
            // if(options1.route.indexOf('freeOrder')>-1){
            //   wx.removeStorage({
            //     key: 'url_free_order',
            //     success: function(res) {
            //       console.log(res);
            //     },
            //   });
            //   wx.removeStorage({
            //     key: 'opn_free_order',
            //     success: function(res) {
            //       console.log(res);
            //     },
            //   });
            // }
          }
        })

      }, 2000)
    })
  }
})