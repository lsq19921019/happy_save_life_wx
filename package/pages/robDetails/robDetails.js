const app = getApp()
const myUrl = require("../../../utils/url.js");
const util = require('../../../utils/util.js');


Page({
  //页面的初始数据
  data: {
    spreadId: "",//商品ID
    goodsInfo: "none",//商品信息 
    state: 0,//状态，区分是发起者0，还是帮砍者1
    quan: 0, //判断是否有券 0有  1没
    detHint: false,//提示层 false为不显示
    joinCutUserList: "",//参与者信息
    shareimg: "",//转发自动定义图片
    options: '',//传过来的参数
    isShow: true,
    video: "",//是否是视频页面跳转过来 是的获取video src
    plays: false,//是否播放视频
    hbImgBl: false,
    hbImg: '',
    captchaImage: '',
    isNav: false,
    formId: "",//表单
    //猜你喜欢商品列表
    goodsList: "",
    mode: app.globalData.mode,//选择列表模版
    role: app.globalData.role,//用户角色
    sysData: {},//是否开启砍价和主题分类
    result: false,
    pid: ''// 当扫小程序码进来有pid
  },
  //监听页面加载   
  onLoad: function (options) {
    let that = this;
    that.data.pid = options.pid || '';// 当扫小程序码进来有pid
    options.video && that.setData({ video: options.video })//获取视频src
    options.userId && (app.globalData.userkey = options.userId)//获取分享者的userkey  
    options.state && that.setData({ state: options.state }) //判断状态
    that.data.spreadId = options.id//商品id
    this.data.options = options;

    console.log(that.data.state)

    //判断用户是否登录

      if (data == 'login' || data == 'OK') {
          options.state == 1 ? that.goodsHelp(options) : that.goodsMsg(1);
          that.guessData(options);
          that.setData({
            role: app.globalData.role
          })
      } else {
        that.index();
        return;
      }


    // 判断用户是否第一次进入该页面
    wx.getStorage({
      key: 'key',
      fail: function () {
        wx.setStorage({
          key: "key",
          data: "value"
        })
        that.setData({ detHint: true })
      }
    })
  },

  onShow: function () {
    this.setData({
      role: app.globalData.role
    })
  },


  //商品详情
  goodsMsg: function (load) {
    let that = this;
    let pams = {
      goodsId: that.data.spreadId,
      token: app.globalData.token,
      type: 0,
      appid: app.globalData.APPID,
    };
    util.request(myUrl.mainUrl + 'goods/getGoodsDetail', pams, 'GET', load, function (res) {
      if (res.data.result != "OK") {
        wx.showToast({
          title: res.data.result,
          icon: 'none',
          duration: 3000,
        })
        that.setData({
          result: true,
          goodsInfo: {}
        })
        return;
      }
      //数字格式化
      let formatting = res.data.sentCutUser;
      formatting.endPrice = formatting.endPrice.toFixed(2)
      formatting.price = formatting.price.toFixed(2)
      formatting.imgs = res.data.imgs

      that.forward(formatting);//合成转发图片

      //己帮助砍价的人员信息，己有人帮忙砍才有
      res.data.joinCutUserList ? '' : res.data.joinCutUserList = ''

      //判断是否有券
      if (formatting.couponMoney == 0 || formatting.couponMoney == "") {
        that.setData({
          quan: 1,
          goodsInfo: formatting,
          joinCutUserList: res.data.joinCutUserList,
          state: 0,
        })
      } else {
        that.setData({
          goodsInfo: formatting,
          joinCutUserList: res.data.joinCutUserList,
          state: 0
        })
      }
      wx.setNavigationBarTitle({ title: formatting.goodsName })// title名
    });
  },

  //帮忙斩价商品详情
  goodsHelp: function (options) {
    let that = this;
    let pams = {
      token: app.globalData.token,
      cutUserToken: options.userId,
      // cutUserToken:"NjQ=",//测试代码
      type: 0,
      goodsId: options.id
    };

    util.request(myUrl.mainUrl + 'goods/getSentCutUser', pams, 'GET', 1, function (res) {
      if (res.data.result != "OK") {
        wx.showToast({
          title: res.data.result,
          icon: 'none',
          duration: 3000,
        })
        return;
        that.setData({
          result: true,
          goodsInfo: {}
        })
      }
      let formatting = res.data.sentCutUser;

      //判断是否自己帮自己砍
      res.data.ifmyself == 1 && (that.goodsMsg(0))

      //判断是否己经帮忙砍过价res.data.type：0没  1有  如果有就显示发起砍价
      res.data.type == 1 && (formatting.haveBargain = res.data.type)

      //数字格式化
      formatting.endPrice = formatting.endPrice.toFixed(2)
      formatting.price = formatting.price.toFixed(2)
      formatting.imgs = res.data.imgs

      //合成转发图片
      that.forward(formatting);

      //己帮助砍价的人员信息，己有人帮忙砍才有
      res.data.joinCutUserList ? '' : res.data.joinCutUserList = ''

      //判断是否有券
      if (formatting.couponMoney == 0 || formatting.couponMoney == "") {
        that.setData({
          quan: 1,
          goodsInfo: formatting,
          joinCutUserList: res.data.joinCutUserList
        })
      } else {
        that.setData({
          goodsInfo: formatting,
          joinCutUserList: res.data.joinCutUserList
        })
      }
      wx.setNavigationBarTitle({ title: formatting.goodsName })//title名
    })
  },

  // 帮他砍
  helpBargain: function () {
    let that = this;
    util.checkAuthorize(app, function (data) {
      if (data == "NO") return;

      let pams = {};
      pams.token = app.globalData.token;
      pams.sentCutUserId = that.data.goodsInfo.id;

      util.request(myUrl.mainUrl + 'goods/saveCut', pams, 'GET', 1, function (res) {

        console.log(res.data.result)

        if (res.data.result != "OK") {
          // 自己给自己砍不改变状态 就一个弹框
          // if (res.data.result="亲,不可以给自己助力哦"){
          //   wx.showToast({
          //     title: res.data.result,
          //     icon: 'none',
          //     duration: 3000,
          //   })
          //   that.goodsMsg(0); 
          // }
          wx.showToast({
            title: res.data.result,
            icon: 'none',
            duration: 3000,
          })
          return;
        }
        wx.showToast({
          title: res.data.result,
          icon: 'none',
          duration: 3000,
        })
        that.goodsHelp(that.data.options);
      });
    })
  },

  // 猜你喜欢
  guessData: function (options) {
    util.like(this, app, options)
  },


  /*
  查看宝贝详情  淘宝有拼多多没，先不做
  see: function () {
   util.cowry(this)
  },*/


  // 分享海报
  hbImg: function () {
    let that = this;
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      canvasId: 'myCanvas',
      success: function (res) {
        wx.hideLoading();
        console.log("合成后的图" + res.tempFilePath)
        that.setData({
          hbImgBl: true,
          hbImg: res.tempFilePath,
        })
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function () {
            wx.showToast({
              title: '分享图已保存至相册',
              icon: "success",
              duration: 3000
            })
          },
          fail: function () {
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
                            success: function () {
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

  // 预览canvas图片
  previewImage: function (e) {
    wx.previewImage({
      urls: [this.data.hbImg],
    })
  },
  // 预览轮播图片
  previewBanner: function () {
    wx.previewImage({
      urls: this.data.bannerImg,
    })
  },

  // 关闭canvas
  hideMark: function () {
    this.setData({
      hbImgBl: false,
    })
  },
  // canvas文字自动调行
  canvasTextAutoLine: function (str, ctx, initX, initY, lineHeight) {
    var lineWidth = 0;
    var canvasWidth = 260;
    var lastSubStrIndex = 0;
    for (let i = 0; i < str.length; i++) {
      lineWidth += 14;
      if (lineWidth > canvasWidth - initX) {//减去initX,防止边界出现的问题
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

  // 图片下载
  canvasFn: function () {
    let that = this;
    wx.showLoading({
      title: '正在生成海报',
    })

    let ctx = wx.createCanvasContext('myCanvas');
    let len = that.data.goodsInfo.price.toString().length;
    let OriginalPrice = Number(this.data.goodsInfo.price);
    let OriginalPricewidth = 26 + len * 12 * 0.5;
    let linewidths = 128 + OriginalPricewidth;

    ctx.setFillStyle('white')
    ctx.setLineWidth("1")
    ctx.fillRect(0, 0, 300, 500)

    wx.downloadFile({
      url: 'https://' + this.data.goodsInfo.imgs[0].split("://")[1],
      success: function (res) {
        ctx.drawImage(res.tempFilePath, 0, 0, 300, 300)
      }
    })
    ctx.setFillStyle("#333333")
    ctx.setFontSize(16)
    ctx.lineWidth = 1;
    let str = this.data.goodsInfo.goodsName
    that.canvasTextAutoLine(str, ctx, 15, 326, 20)
    ctx.drawImage("../../../img/icon_quan.png", 10, 370, 45, 15)
    ctx.setFillStyle("#ffffff")
    ctx.setFontSize(11)
    ctx.fillText('券后价', 15, 382)
    ctx.setFillStyle("#e84d74")
    ctx.setFontSize(16)
    ctx.fillText('￥' + this.data.goodsInfo.endPrice, 60, 384)
    ctx.setFillStyle("#666666")
    ctx.setFontSize(12)
    ctx.fillText('原价￥' + OriginalPrice, 140, 383)
    ctx.moveTo(138, 378)
    ctx.lineTo(linewidths, 378)
    ctx.stroke()
    ctx.setFillStyle("#666666")
    ctx.setFontSize(12)
    ctx.fillText('限时限量', 240, 383)
    ctx.drawImage("../../../img/icon_quan1.png", 10, 410, 280, 80)
    ctx.setFillStyle("#ffffff")
    ctx.setFontSize(22)
    ctx.fillText(that.data.goodsInfo.couponMoney + '元优惠券', 54, 445)
    ctx.setFillStyle("#ffffff")
    ctx.setFontSize(14)
    ctx.fillText('微信内长按二维码领优惠券', 25, 472)
    ctx.draw(); //画之前清除以前的（清除）

    let pamss = {
      token: app.globalData.token,
      userId: app.globalData.user.unionidF,
      type: 2,
      goodsId: that.data.spreadId,
      path: 'package/pages/robDetails/robDetails?id=' + that.data.spreadId + '&userId=' + app.globalData.user.unionidF
    }
    util.request(myUrl.mainUrl + 'share/getMiniCode', pamss, 'GET', 0, function (res) {
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
        success: function (res) {
          ctx.drawImage(res.tempFilePath, 212, 415, 70, 70)
          ctx.draw(true, function () {//在之前画的基础上再画（不清除）
            that.hbImg();
          });
        },
        fail: function (res) {
          wx.hideLoading()
          wx.showToast({
            title: '网络连接超时',
            icon: 'none',
            duration: 3000,
          })
        }
      })

    })
  },

  //合成转发图片
  forward: function (goodsForward) {
    let that = this;
    let ctx = wx.createCanvasContext('shareCanvas');
    let len = goodsForward.price.toString().length;
    let OriginalPricewidth = 26 + len * 12 * 0.5;
    let linewidths = 48 + OriginalPricewidth;

    wx.downloadFile({
      url: 'https://' + goodsForward.imgs[0].split("://")[1],
      success: function (res) {
        ctx.drawImage(res.tempFilePath, 0, 0, 300, 300)
        ctx.drawImage("../../../img/709.png", 5, 48, linewidths, 30)
        ctx.setFillStyle("#ffffff")
        ctx.setFontSize(16)
        ctx.fillText('券后:' + goodsForward.endPrice + "元", 10, 70)//改
        ctx.drawImage("../../../img/709.png", 5, 88, linewidths, 30)
        ctx.setFillStyle("#ffffff")
        ctx.setFontSize(16)
        ctx.fillText('原价:' + goodsForward.price + "元", 10, 110) //改
        ctx.draw(false, function (e) {
          wx.canvasToTempFilePath({
            x: 0,
            y: 0,
            canvasId: 'shareCanvas',
            success: function (res1) {
              that.data.shareimg = res1.tempFilePath
            }
          })
        });
      }
    })

  },

  // 页面滚动触发事件的处理函数   
  onPageScroll: function (e) {
    if (e.scrollTop >= 580) {
      this.setData({
        isShow: false,
      })
    } else {
      this.setData({
        isShow: true,
      })
    }
  },
  //回到顶部
  backTop: function () {
    wx.pageScrollTo({
      scrollTop: 0,
    })
  },

  //立即领券 platform 1  2拼多
  download: function () {
    let that = this;
    let pams = {
      token: app.globalData.token,
      goodsId: that.data.spreadId,
      goodsName: that.data.goodsInfo.goodsName,
      price: that.data.goodsInfo.price,
      endPrice: that.data.goodsInfo.endPrice,
      couponMoney: that.data.goodsInfo.couponMoney,
      ifQw: 0,
      ifBuy: 1,
      goodsImg: that.data.goodsInfo.imgs[0],
      platform: 2,
      openType: 3,
      pid: that.data.pid,
      appid: app.globalData.APPID,
    };
    util.request(myUrl.goodsUrl + 'share/pddPromotion', pams, 'GET', 1, function (res) {
      if (res.data.result != "OK") {
        wx.showToast({
          title: res.data.result,
          icon: 'none',
          duration: 3000,
        })
        return;
      }
      wx.navigateToMiniProgram({
        appId: 'wx32540bd863b27570',
        path: res.data.url,
      })

    })
  },

  //获取formId
  formSubmit: function (e) {
    this.data.formId = e.detail.formId
  },

  //转发好友
  onShareAppMessage: function (options) {
    let that = this;
    let subState = 0;
    if (this.data.isNav == true) {
      //缩回动画  
      this.hideNav();
      this.setData({
        isNav: false
      })
    }
    //判断转发的方式 分享和助攻
    options.from == "button" && options.target.dataset.cutgoods ? subState = 1 : "";
    console.log('id=' + that.data.spreadId + '&state=' + subState + '&userId=' + app.globalData.user.unionidF)

    return {
      title: that.data.goodsInfo.goodsName,
      imageUrl: that.data.shareimg,
      path: 'package/pages/robDetails/robDetails?id=' + that.data.spreadId + '&state=' + subState + '&userId=' + app.globalData.user.unionidF,

      success: function () {
        console.log(options.target.dataset.cutgoods)

        if (options.from == "button" && options.target.dataset.cutgoods == 1) {

          let pams = {
            goodsId: that.data.spreadId,
            token: app.globalData.token,
            type: 0,
            appid: app.globalData.APPID,
          };
          util.request(myUrl.mainUrl + 'goods/saveSentCutUser', pams, 'GET', 0, function (res) {
            if (res.data.result != "OK") {
              wx.showToast({
                title: res.data.result,
                icon: 'none',
                duration: 3000,
              })
              return;
            }

            //数字格式化
            let formatting = res.data.sentCutUser;
            formatting.endPrice = formatting.endPrice.toFixed(2)
            formatting.price = formatting.price.toFixed(2)
            formatting.imgs = res.data.imgs


            res.data.joinCutUserList ? '' : res.data.joinCutUserList = ''
            that.setData({
              goodsInfo: formatting,
              joinCutUserList: res.data.joinCutUserList,
              state: 0
            })
          })
        }
      }
    }
  },

  //用户是消费者，不允许砍价
  consume: function () {
    wx.showModal({
      title: '提示',
      content: '您现在还是消费者，不能发起助力或助力好友，请按确定升级为新贵',
      success: (res) => {
        if (!res.confirm) return;
        wx.navigateTo({
          url: "/pages/home/jointTeam/jointTeam?upOne=1"
        })
      }
    })
  },



  // 首页跳转
  index: function (e) {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  // 菜单栏提示点击层
  hidedetHint: function () {
    this.setData({
      detHint: false
    })
  },
  showKj: function () {
    if (this.data.isNav) {
      //缩回动画  
      this.hideNav();
      this.setData({
        isNav: false
      })
    } else {
      //弹出动画  
      this.showNav();
      this.setData({
        isNav: true,
        detHint: false
      })
    }
  },
  // 弹出动画
  showNav: function () {
    var animationData2 = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease-out',
      delay: 50
    })
    var animationData3 = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease-out',
      delay: 100
    })
    var animationData4 = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease-out',
      delay: 150
    })
    animationData2.translateY(-150).opacity(1).step();
    animationData3.translateY(-100).opacity(1).step();
    animationData4.translateY(-50).opacity(1).step();
    this.setData({
      animationData2: animationData2.export(),
      animationData3: animationData3.export(),
      animationData4: animationData4.export(),
    })
  },
  // 收回动画
  hideNav: function () {
    var animationData2 = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease-out',
      delay: 100
    })
    var animationData3 = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease-out',
      delay: 50
    })
    var animationData4 = wx.createAnimation({
      duration: 500,
      timingFunction: 'ease-out',
      delay: 0
    })
    animationData2.translateY(0).opacity(0).step();
    animationData3.translateY(0).opacity(0).step();
    animationData4.translateY(0).opacity(0).step();
    this.setData({
      animationData2: animationData2.export(),
      animationData3: animationData3.export(),
      animationData4: animationData4.export(),
    })
  },
  hidekjbg: function () {
    this.hideNav();
    this.setData({
      isNav: false
    })
  },

  // 视频播放
  playvideo: function () {
    this.setData({ plays: true })
    wx.createVideoContext('myVideo').requestFullScreen()
    wx.createVideoContext('myVideo').play()
  },
  exitVV: function (e) {
    console.log(e.detail.fullScreen)
    if (!e.detail.fullScreen) {
      // 这里是退出全屏事件
      this.setData({ plays: false })
    }
  },
  // 猜你喜欢
  guessData: function (options) {
    util.like(this, app, options)
  }
})