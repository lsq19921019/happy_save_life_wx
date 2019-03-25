var app = getApp()
var myUrl = require("../../utils/url.js");
var util = require('../../utils/util.js');
var user = wx.getStorageSync('userMsg');


const WxParse = require('../wxParse/wxParse.js');
Page({
  data: {
    role: user.role, //用户角色
    navindex: 0,
    logo: app.globalData.headImg,
    title: app.globalData.title,
    replyTemArray: [],
    circlelist: [],
    page: 1, //页码
    showloding: false,
    nomore: false,
    maxcount: 30,
    stop: false, //是否停止下拉刷新

    canvasImg: '', //海报商品图片
    hbImgBl: false, //是否显示海报
  },

  //生命周期函数--监听页面加载
  onLoad: function(options) {
    let that = this;
    that.circlelist(1, 1, that.data.navindex);
  },

  qiehuan: function(e) {
    let that = this;
    var index = e.currentTarget.dataset.index;
    if (index == that.data.navindex) {
      return;
    }
    that.setData({
      replyTemArray: [],
      navindex: index,
      p: 1,
      nomore: false,
      stop: false, //是否停止下拉刷新
    })


    that.circlelist(1, 1, that.data.navindex);
  },

  jump_h5: function(e) {
    var link = e.currentTarget.dataset.link
    wx.navigateTo({
      url: '/package/pages/h5/h5?link=' + link,
    })
  },

  copycon: function(e) {
    var con = e.currentTarget.dataset.concent;
    util.copy(con, function() {})
  },


  copycon1: function(e) {
    var str = e.currentTarget.dataset.concent;
    var con = str.replace(/\s*/g, "");  //去掉空格

    // function delHtmlTag(str) {
    //   return str.replace(/<[^>]+>/g, ""); //去掉所有的html标记
    // }
    // var res = delHtmlTag(con); //去掉标签  

    var res =con.replace(/<[^>]+>/g, ""); //去掉所有的html标记
    var res1 = res.replace(/↵/g, "");     //去掉所有的↵符号
    var res2 = res1.replace(/[\r\n]/g, "") //去掉回车换行
    // console.log(con)  //去掉空格
    // console.log(res)  //去掉所有的html标记
    // console.log(res1) //去掉箭头
   
    console.log(res2)
    util.copy(res2, function() {})
  },

  //转发好友
  onShareAppMessage: function(e) {
    let that = this;
    console.log(e);

    var goodsinfo = e.target.dataset.goodsinfo;
    return {
      imageUrl: goodsinfo.goodsSmallImg,
      path: 'pages/details/details?userId=' + app.globalData.user.unionidF + '&id=' + goodsinfo.goodsId + "&platform=" + goodsinfo.platform
    }
  },

  circlelist: function(page, load, typeindex) {
    let that = this;
    // myUrl.mainUrl + that.data.api
    if (page == 1) {
      that.setData({
        showloding: false,
        // nomore: false,
      })
    } else {
      that.setData({
        showloding: true,
      })
    }

    var pams = {
      token: app.globalData.token,
      pageNum: page,
    }

    if (that.data.role == 0) {
      pams.type = ''
    } else {
      pams.type = typeindex
    }

    util.request(myUrl.mainUrl + 'pdd/circle/list?', pams, 'GET', load, function(res) {
      if (res.data.result != "OK") {
        wx.showToast({
          title: res.data.result,
          mask: "true",
          icon: 'none',
          duration: 3000
        })
        return;
      }


      var concat = that.data.circlelist; //上一次的请求的所有内容
      var wxmlconcat = that.data.replyTemArray; //上一次的请求的所有wxml
      that.data.replyTemArray = [];
      var result = res.data.list; //本次返回的内容
      var len = result.length;
      console.log(len);

      if (len == 0) {
        that.data.replyTemArray = [];
      } else {
        for (let i = 0; i < len; i++) {
          result[i].tkCommission = result[i].tkCommission.toFixed(2);
          WxParse.wxParse('article' + i, 'html', result[i].des, that, 5); //转化html  单文件

          if (i === len - 1) {
            WxParse.wxParseTemArray("replyTemArray", 'article', len, that)
          }
        }
      }



      // console.log(that.data.replyTemArray);
      if (page == 1) {
        concat = [];
        wxmlconcat = [];
        that.setData({
          stop: false,
        })
      } else {
        if (len < that.data.maxcount) {
          that.setData({
            nomore: true,
            stop: true,
          })
        } else {
          that.setData({
            nomore: false,
          })
        }
      }

      console.log(wxmlconcat);
      console.log(that.data.replyTemArray);

      that.setData({
        circlelist: concat.concat(result),
        replyTemArray: wxmlconcat.concat(that.data.replyTemArray),
        bannerimg: res.data.img,
        link: res.data.h5
      })

      console.log(that.data.replyTemArray);


      //当切换之后数据可能会保存之前切换的数据  所以手动清空一下
      // console.log(that.data.replyTemArray); //存放的是转换后的wxml文本
      // console.log(that.data.circlelist);   //后台返回的真实信息
      // var reallist = that.data.replyTemArray;

      // //通过循环的方法往replyTemArray里面添加添加属性    
      // reallist.map((item, index, arr) => {
      //   arr[index][0].reallist = that.data.circlelist[index]; //对应的时使用WxParse后的结构
      // });

      // that.setData({
      //   replyTemArray: reallist
      // })

      // console.log(that.data.replyTemArray);

    })

  },

  // 分享海报
  hbImg: function() {
    let that = this;

    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      canvasId: 'myCanvas',
      success: function(res) {
        wx.hideLoading();
        that.setData({
          hbImgBl: true,
          hbImg: res.tempFilePath,
        })

        // console.log(res.tempFilePath);

        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function() {
            wx.showToast({
              title: '分享图已保存',
              icon: "success",
              duration: 3000
            })
          },
          fail: function() {
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
      }
    })
  },

  // canvas文字自动调行
  canvasTextAutoLine: function(str, ctx, initX, initY, lineHeight) {
    var lineWidth = 0;
    var canvasWidth = 260;
    var lastSubStrIndex = 0;
    for (let i = 0; i < str.length; i++) {
      lineWidth += 14;
      if (lineWidth > canvasWidth - initX) { //减去initX,防止边界出现的问题
        ctx.fillText(str.substring(lastSubStrIndex, i), initX, initY);
        initY += lineHeight;
        lineWidth = 0;
        lastSubStrIndex = i;
      }
      if (i == str.length - 1) {
        ctx.fillText(str.substring(lastSubStrIndex, i + 1), initX, initY);
      }
    }
  },


  //海报生成
  canvasFn: function(e) {
    let that = this;
    let goodsinfo = e.currentTarget.dataset.goodsinfo;

    wx.downloadFile({
      url: myUrl.mainUrl + 'share/loadFileByUrl?token=' + app.globalData.token + '&url=' + goodsinfo.goodsImg, //转换成二进制流
      success: function(res) {
        that.data.canvasImg = res.tempFilePath; //把二进制图片图片保存下来，用于生成海报    
      },
      fail: function() {
        console.log("安全域名问题失败了")
      }
    })

    wx.showLoading({
      title: '正在生成海报',
    })

    let ctx = wx.createCanvasContext('myCanvas'); //生成画布
    let miniCode = "" //判断小程序是否己经下载完毕

    //下载小程序码
    let pamss = {
      type: 2,
      ifNew: 1,
      deviceId: "/mini",
      token: app.globalData.token,
      userId: app.globalData.user.unionidF,
      wxAppid: app.globalData.APPID,
      goodsId: goodsinfo.goodsId,
      platform: goodsinfo.platform
    }

    var path = '';
    app.globalData.ext ? path = 'share/getJWMiniCode' : path = 'share/getMiniCode';
    util.request(myUrl.mainUrl + path, pamss, 'GET', 0, function(res) {
      // console.log(res);
      if (res.data.result != "OK") {
        wx.showToast({
          title: res.data.result,
          icon: 'none',
          duration: 3000,
        })
        return;
      }

      wx.downloadFile({
        url: res.data.img,
        success: function(res) {
          // console.log(res.tempFilePath);
          miniCode = res.tempFilePath
        }
      })
    })

    // 商品名称
    let len = goodsinfo.goodsPrice.toString().length; //原价长度
    let OriginalPrice = Number(goodsinfo.goodsPrice); //原价改为number类型
    let OriginalPricewidth = 26 + len * 12 * 0.5; //原价的宽度
    let linewidths = 135 + OriginalPricewidth; //横线

    ctx.setFillStyle('#FFFFFF') //设置填充色
    ctx.setLineWidth("1") //设置线条的宽度
    ctx.fillRect(0, 0, 300, 500) //填充一个矩形

    ctx.setFillStyle("#333333")
    ctx.setFontSize(16)
    ctx.lineWidth = 1;
    let str = goodsinfo.goodsName
    if (str.length > 32) {
      str = str.substring(0, 32) + '...'
    }
    that.canvasTextAutoLine(str, ctx, 15, 326, 20) //文字自动调行

    // 商品第二行文字
    ctx.drawImage("../../img/icon_quan.png", 10, 370, 45, 15)
    ctx.setFillStyle("#e84d74")
    ctx.setFontSize(16)
    ctx.fillText('￥' + goodsinfo.endPrice, 60, 384)
    ctx.setFillStyle("#666666")
    ctx.setFontSize(12)
    ctx.fillText('原价￥' + OriginalPrice, 130, 383)
    ctx.moveTo(130, 378)
    ctx.lineTo(linewidths, 378)
    ctx.stroke()

    ctx.setFillStyle("#666666")
    ctx.setFontSize(12)
    ctx.fillText('限时限量', 240, 383)

    // 优惠券图片
    ctx.drawImage("../../img/icon_quan1.png", 10, 410, 280, 80)

    ctx.setFontSize(22)
    ctx.setFillStyle("#ffffff")
    ctx.fillText(goodsinfo.couponMoney + '元优惠券', 54, 445)

    ctx.setFillStyle("#ffffff")
    ctx.setFontSize(14)
    ctx.fillText('微信内长按二维码领优惠券', 25, 472)
    ctx.draw(); //画之前清除以前的（清除）

    let time = setInterval(function() {
      if (miniCode != '') {
        clearTimeout(time) //清空定时器

        if (that.data.canvasImg != '') {
          ctx.drawImage(that.data.canvasImg, 0, 0, 300, 300) //商品图片
        }
        ctx.drawImage(miniCode, 212, 415, 70, 70) //小程序码图片
        ctx.draw(true)
        setTimeout(function() {
          that.hbImg(); //合成海报图片保存到本地
        }, 500)
      }
    }, 150)

  },

  // 关闭canvas
  hideMark: function() {
    this.setData({
      hbImgBl: false,
    })
  },



  // 跳转到详情
  godetail: function(e) {
    var goodsid = e.currentTarget.dataset.goodsid;
    var platform = e.currentTarget.dataset.platform
    wx.navigateTo({
      url: '/pages/details/details?id=' + goodsid + '&platform=' + platform
    })
  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    var that = this;
    that.setData({
      p: 1,
      nomore: false,
      stop: false, //是否停止下拉刷新
    })

    that.circlelist(1, 1, that.data.navindex);

    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    var that = this;
    // console.log(that.data.stop);
    if (that.data.stop == true) {
      return
    } else {
      that.setData({
        page: that.data.page + 1
      })
      that.circlelist(that.data.page, 0, that.data.navindex);

    }
  },


  onShow: function() {
    let that = this;
    that.setData({
      role: wx.getStorageSync('userMsg').role, //角色代号 0粉丝  
    })
  },

  //------------------------------------------------------------------------------------------------------------------
  // 图片预览
  showbig: function(e) {
    console.log(e.currentTarget.dataset.imgarr)
    var imgarr = e.currentTarget.dataset.imgarr
    wx.previewImage({
      // current: '', // 当前显示图片的http链接
      urls: imgarr // 需要预览的图片http链接列表
    })
  },

  // 循环保存图片
  saveimgarr: function(e) {
    var imgarr = e.currentTarget.dataset.imgarr;
    let count = 0;
    for (let i = 0; i < imgarr.length; i++) {
      console.log(imgarr[i])
      // imgarr[i]=imgarr[i].replace("http", "https");
      // console.log(imgarr[i])
      wx.downloadFile({
        // url: myUrl.mainUrl + 'share/loadFileByUrl?token=' + app.globalData.token + '&url=' + imgarr[i], //转换成二进制流
        url: imgarr[i],
        success: function(res) {
          console.log(res)
          console.log(res.tempFilePath);
          if (res.statusCode === 200) {
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: function() {
                count++;
                console.log('第' + count + '张');
                if (count == imgarr.length) {
                  count = 0;
                  wx.showToast({
                    title: '分享图已全部保存',
                    icon: "success",
                    duration: 3000
                  })
                }
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
                              // wx.saveImageToPhotosAlbum({
                              //   filePath: yes,
                              //   success: function() {
                              //     wx.showToast({
                              //       title: '分享图已保存至相册',
                              //       icon: "success",
                              //       duration: 3000
                              //     })
                              //   }
                              // })
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
  }

})