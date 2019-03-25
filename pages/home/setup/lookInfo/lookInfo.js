var app = getApp()
var myUrl = require("../../../../utils/url.js");
var util = require('../../../../utils/util.js');

Page({
  //页面的初始数据
  data: {
    introduction: "该用户很懒。并没有填写个人说明", //个人介绍
    qrcodeUrl: "", //微信二维码
    showAmend: false, //判断是否显示修改按钮
    user: "", //用户信息
    otUser: "", //不是自己点击查看信息的
    opUser: "",
  },

  //生命周期函数--监听页面加载
  onLoad: function(options) {

    console.log(options.point);
    //判断是否登录
    // options = util.isLogin(this, app);
    // if (!options) return;

    options.point == "mySelf" ? wx.setNavigationBarTitle({
      title: '设置',
    }) : wx.setNavigationBarTitle({
      title: '城市合伙人',
    })

    console.log(options.point);
    // 传入参数options.point=mySelf，是指是自己查看信息，如果没的，那就是查看别人的信息和城市合伙人
    options.point == "mySelf" ? this.mySelf() : this.others(options.point)
    if (options.point == "mySelf") {
      this.setData({
        showAmend: true
      })
    }

    this.setData({
      opUser: options,
      user: app.globalData.user
    })
    console.log(this.data.opUser)
  },

  onShow: function() {

  },

  //查看个人的
  mySelf: function() {
    let that = this;
    let pams = {
      token: app.globalData.token
    };

    util.request(myUrl.mainUrl + "user/r/get", pams, 'GET', 0, function(res) {
      if (res.data.result != "OK") {
        wx.showToast({
          title: res.data.result,
          icon: 'none',
          mask: "true",
          duration: 3000,
        })
        return;
      }
      if (!res.data.wxEwm) return;
      that.setData({
        introduction: res.data.ins,
        qrcodeUrl: res.data.wxEwm
      })
    })
  },



  //查看获取合伙人
  others: function(userid) {
    let that = this;
    let pams = {
      userId: userid
    };
    util.request(myUrl.mainUrl + "user/r/get2", pams, 'GET', 1, function(res) {
      if (res.data.result != "OK") {
        wx.showToast({
          title: res.data.result,
          icon: 'none',
          mask: "true",
          duration: 3000,
        })
        return;
      }
      console.log(res)
      if (!res.data.wxEwm) return;
      that.setData({
        otUser: res.data,
        introduction: res.data.ins,
        qrcodeUrl: res.data.wxEwm
      })
    })
  },


  //下载二维码
  submit: function() {
    let that = this;
    // console.log('我点击了按钮')
    //下载图片保存在本地
    console.log(that.data.qrcodeUrl);
    wx.downloadFile({
      url: that.data.qrcodeUrl,
      success: function(res) {
        console.log(res.tempFilePath)
        var resimg = res.tempFilePath; //保存这张图后面要用到
        //调取相册授权
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function() {
            console.log('第一次进来授权成功直接保存')
            wx.showToast({
              title: '二维码已保存',
              icon: "success",
              duration: 3000
            })
          },
          fail: function() {
            console.log('第一次进来用户没有授权')

            //检查用户当前设置判断是否显示让用户重新授权的弹框
            wx.getSetting({
              success: (res) => {
                console.log(res.authSetting);
                // console.log(res.authSetting["scope.writePhotosAlbum"]);
                //如果没有设置保存到相册弹出让用户重新授权
                if (!res.authSetting['scope.writePhotosAlbum']) {
                  wx.showModal({
                    title: '授权提示',
                    content: '您未授权小程序,将图片保存在你的相册，请点击确定按钮重新授权',
                    success: (showRes) => {
                      if (!showRes.confirm) {
                        console.log('点击取消直接返回')
                        return;
                      } else {
                        console.log('点击确认进入设置')
                        wx.openSetting({
                          success: () => {
                            console.log('用户在设置里开启了授权')
                            wx.saveImageToPhotosAlbum({
                              filePath: resimg,
                              success: function() {
                                wx.showToast({
                                  title: '二维码已保存至相册',
                                  icon: "success",
                                  duration: 3000
                                })
                              },
                              fail: function() {
                                console.log("保存失败了")
                              }

                            })
                          }
                        })
                      }


                    }
                  })
                } else {

                }
              }

            })
          }
        })
      },

      fail: function(err) {
        console.log(err)
        wx.showToast({
          title: err,
          icon: "服务器开小差了，请稍后再试!",
          duration: 3000
        })
      }
    })
  },

  //长按保存二维码
  previewImage: function(e) {
    wx.previewImage({
      urls: [this.data.qrcodeUrl],
    })
  },
  //长按保存二维码
  previewof: function(e) {
    wx.previewImage({
      urls: ["../../../../img / official.png"],
    })
  },

  // 修改
  amend: function() {
    wx.navigateTo({
      url: '/pages/home/setup/setupInfo/setupInfo',
    })
  },
})