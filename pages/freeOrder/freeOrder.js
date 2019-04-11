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
    free_order_type: 0,
    progress_rate: 1,
    rate_amount_:60,
    rate_amount:80,
    countTimeNum:10,
    timer:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.setNavigationBarTitle({ title: '免单活动'});// title名
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
    wx.setNavigationBarTitle({ title: '免单活动'});// title名
    
    this.countDown();
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
  switchTab: function(e){
    let that = this;
    that.setData({
      free_order_type:e.currentTarget.dataset.type
    });
  },
  countTime: function(maxtime){
    
    let minutes = '',
    seconds = '',
    hours = '',
    msg = '',that=this;
          if (maxtime >= 0) {
            minutes = Math.floor(maxtime / 60);
          seconds = Math.floor(maxtime % 60);
          hours = Math.floor(maxtime / 3600);
            msg = "距离结束还有" + hours + "时" + minutes + "分" + seconds + "秒";
            console.log(msg);
      // 12                     document.all["timer"].innerHTML = msg;
      // 13                     if (maxtime == 5 * 60)alert("还剩5分钟");
              ;
              that.setData({
                countTimeNum:--maxtime
              })
      } else{
            clearInterval(that.data.timer);
            console.log("时间到，结束!");
        }
  },
  countDown: function(){
    let that=this; //一个小时，按秒计算，自己调整! 
    // let count_time = that.maxtime  
    console.log(that.data.countTimeNum);
        that.data.timer = setInterval(function(){
          that.countTime(that.data.countTimeNum);
        }, 1000);  
  }


})