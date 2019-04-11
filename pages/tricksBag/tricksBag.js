// pages/atext/atext.js

const app = getApp()
const myUrl = require("../../utils/url.js");
const util = require("../../utils/util.js");
var user = wx.getStorageSync('userMsg');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    role: user.role, //用户角色
    arrange: 0, //商品显示样式
    goodslist: [],
    themeId:'', //主题id
    imageUrl:'',
    hbImgBl: false,
    hbImg:'',
    shareUrl:'',
    shareType:'',
    shareTextList:{
      s_10:{
        text_1:'拼多多红包福利专享会场，超多大额优惠券',
        text_2:'红包发放中，一键立抢>>',
      },
      s_4:{
        text_1:'拼多多优惠券商城，超低价商品抢购中',
        text_2:'全场低至1.9元包邮',
        text_3:'全场百万好货任你选~',
      },
      s_11:{
        text_1:'每天转一转，大批0元商品等你免费拿 ',
        text_2:'拼多多新用户，必中免单',
      },
      s_1:{
        text_1:'拼多多热销榜出炉了',
        text_2:'来来来，看看今天有什么值得买的~',
      },
      s_2:{
        text_1:'官方旗舰店，高性价比品牌清仓',
        text_2:'品牌好货任你选',
      },
      s_0:{
        text_1:'全网最低价，1.9包邮送到家',
        text_2:'还剩最后8小时…',
      },
      s_14:{
        text_1:'限时秒杀，底价狂欢，即将售罄',
        text_2:'最后2小时疯抢中~',
      },
      s_15:{
        text_1:'充话费充流量，限时优惠，极速到账',
        text_2:'拼多多充值中心',
      },
      s_16:{
        text_1:'数码家电底价狂欢，正品服务有保障',
        text_2:'省钱就来拼多多电器城',
      },
      share_url:'',
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.setNavigationBarTitle({ title: '赚钱锦囊'});// title名
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
    // let that = this;
    // that.setData({
    //   role: wx.getStorageSync('userMsg').role, //角色代号 0粉丝   
    // })
    wx.setNavigationBarTitle({ title: '赚钱锦囊'});// title名
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
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
   

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    let pages = getCurrentPages();
    let currentPage = pages[pages.length - 1];
    let url = currentPage.route;
    let options = currentPage.options
    url = url + "?themeId=" + options.themeId+ "&title=" + options.title + "&userId=" + app.globalData.user.unionidF;
    return {
      title: options.title,
      path: url
    }
  },
  //保存图片到相册
  saveImageToPhotosAlbum:function(img){
    wx.showLoading({
      title: '加载中',
    });
    let that = this;
    that.copyTitle();
    wx.downloadFile({
      // url: myUrl.mainUrl + 'share/loadFileByUrl?token=' + app.globalData.token + '&url=' + goodsinfo.goodsImg, //转换成二进制流
      url: that.data.imageUrl, //转换成二进制流
      success: function(res) {
        console.log(res);
        that.setData({
          hbImgBl: true,
          hbImg: res.tempFilePath,
        })
                  wx.saveImageToPhotosAlbum({
                    filePath: res.tempFilePath,
                    success: function() {
                      wx.hideLoading();
                      wx.showToast({
                        title: '分享图已保存',
                        icon: "success",
                        duration: 3000
                      })
                    },
                    fail: function() {
                      wx.hideLoading();
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
                                    wx.saveImageToPhotosAlbum({
                                      filePath: res.tempFilePath,
                                      success: function() {
                                        wx.showToast({
                                          title: '分享图已保存至相册',
                                          icon: "success",
                                          duration: 3000
                                        })
                                      }
                                    })
                                  }
                                })
                              }
                            })
                          }
                        }
                      })
                    }
                  })
      },
      fail: function() {
        console.log("安全域名问题失败了")
      }
    });
    
  },
  //海报生成
  canvasFn: function(e) {
    let that = this;
    let channelType = e.currentTarget.dataset.channeltype;
    let pams = {
      token: app.globalData.token,
      channelType: channelType,
    }
    util.request(myUrl.mainUrl + 'pdd/promUrlGenerate?', pams, 'GET', 1, function(resp) {
      console.log(resp);
      if(resp.data.result==='OK'){
        that.setData({
          shareType: parseInt(e.currentTarget.dataset.channeltype),
          hbImgBl: true,
          shareUrl: resp.data.url,
          imageUrl: resp.data.img,

          hbImg: resp.data.img,
        })
          // wx.showLoading({
          //   title: '正在生成海报',
          // })
      }
    });
    // wx.downloadFile({
    //   // url: myUrl.mainUrl + 'share/loadFileByUrl?token=' + app.globalData.token + '&url=' + goodsinfo.goodsImg, //转换成二进制流
    //   url: myUrl.mainUrl + '/pdd/promUrlGenerate?token=' + app.globalData.token + '&channelType=' + channelType, //转换成二进制流
    //   success: function(res) {
    //     console.log(res);
    //   },
    //   fail: function() {
    //     console.log("安全域名问题失败了")
    //   }
    // });
    // wx.showLoading({
    //   title: '正在生成海报',
    // })
  },
  //一键复制文本内容
  copyTitle:function(e){
    let self = this;
    let that=self.data;
    let copy_content = '';
    let temp_list = that.shareTextList["s_"+that.shareType];
    if(that.shareType ==='4'){
      copy_content = temp_list.text_1+temp_list.text_2+'点击链接'+that.shareUrl+temp_list.text_3;
    }else{
      copy_content = temp_list.text_1+'点击链接'+that.shareUrl+temp_list.text_2;
    }
        wx.setClipboardData({
          data: copy_content,
          success: function(res) {
            // self.setData({copyTip:true}),
            // wx.showModal({
            //   title: '提示',
            //   content: '复制成功',
            //   success: function(res) {
            //     if (res.confirm) {
            //       console.log('确定')
            //     } else if (res.cancel) {
            //       console.log('取消')
            //     }
            //   }
            // })
            wx.showToast({
              title: '操作成功！',
              icon: "success",
              duration: 3000
            })
          },
          fail: function(res) {
            wx.showToast({
              title: '操作失败！',
              icon: "success",
              duration: 3000
            })
          }
        })
  },
  // 关闭canvas
  hideMark: function() {
    this.setData({
      hbImgBl: false,
    })
  },
 
})