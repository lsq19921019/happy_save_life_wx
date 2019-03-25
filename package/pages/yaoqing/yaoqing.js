// package/pages/yaoqing/yaoqing.js

const app = getApp()
const myUrl = require("../../../utils/url.js");
const util = require("../../../utils/util.js");
var user = wx.getStorageSync('userMsg');


Page({

  /**
   * 页面的初始数据
   */
  data: {

    imgUrls: ['http://t16img.yangkeduo.com/pdd_oms/2019-02-27/ef43e9cc33aec27c10acd8fbe355c1b3.jpg', 'http://t16img.yangkeduo.com/pdd_oms/2019-02-26/16c11fbc614c1b5369a281c42c6f8aab.jpg', 'http://t16img.yangkeduo.com/pdd_oms/2019-02-25/a4b9a8ca3cc79a915e35ad4e3d025afd.jpg', 'http://t16img.yangkeduo.com/pdd_oms/2019-02-22/84c0d26587c2cc2cd0ead5108bad06e2.jpg', 'http://t16img.yangkeduo.com/pdd_oms/2019-02-20/96c986bbd28699bb36f591d87caab619.jpg'],
    swiperIndex: 0, //这里不写第一次启动展示的时候会有问题
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log('haha');
    let that = this;

    that.getimgurl();

  },

  getimgurl: function() {
    let that = this;

    var pams = {
      token: app.globalData.token,
      wxAppid: app.globalData.APPID,
      index:0
    }

    util.request(myUrl.mainUrl + 'share/createPostersByMini?', pams, 'GET', 1, function(res) {
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
        imgUrls: res.data.list
      })


    })


  },


  bindchange(e) {
    this.setData({
      swiperIndex: e.detail.current
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
    let that=this;
    that.getimgurl();
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
    let that = this;
    return {
      // imageUrl: that.data.imgUrls[that.data.swiperIndex].posterUrl,
      imageUrl: 'https://bnlnimg.bnln100.com/index_share.jpg',
      path: '/pages/index/index?userId=' + app.globalData.user.unionidF

    }
  },

  savehb: function() {
    // var imgarr = e.currentTarget.dataset.imgarr;
    // let count = 0;

    let that = this;
    wx.downloadFile({
      url: that.data.imgUrls[that.data.swiperIndex].posterUrl,
      success: function(res) {
        console.log(res)
        console.log(res.tempFilePath);
        if (res.statusCode === 200) {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: function() {
              wx.showToast({
                title: '分享图已全部保存',
                icon: "success",
                duration: 3000
              })

            },

            fail: function(fail) {
              console.log(fail)
              wx.getSetting({
                success: (getSetRes) => {
                  if (!getSetRes.authSetting["scope.writePhotosAlbum"]) {
                    wx.showModal({
                      title: '授权提示',
                      content: '您未授权小程序,将图片保存在你的相册，请点击确定按钮重新授权',
                      success: (showRes) => {
                        if (!showRes.confirm) {
                          return;
                        }
                        wx.openSetting({
                          success: () => {

                          }
                        })
                      }
                    })
                  }

                }
              })
            }
          })
        }

      },
      fail: function() {
        console.info("安全域名图片失败");
      }
    })

  }
})