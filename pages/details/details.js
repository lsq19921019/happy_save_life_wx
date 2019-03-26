const app = getApp()
const myUrl = require("../../utils/url.js");
const util = require('../../utils/util.js');
var user = wx.getStorageSync('userMsg');


Page({

  //页面的初始数据
  data: {
    role: user.role, //用户角色
    arrowimg: '../../img/down_ico1.png',
    showimginfo: false,
    isshelves: true, //是否认下架  默认下架
    wxExtraData: {
      "path": "pages/welfare_coupon/welfare_coupon?goods_id=1464722022&pid=40002_19012793&cpsSign=CC40002_19012793_3d8524ae2314544373722f7272e03a17&duoduo_type=2",
      "appId": "wx32540bd863b27570"
    },

    tipSta: false,
    isCheck: false,
    isShow: true,
    goodsInfo: "none",
    img: "",
    spreadId: "", //商品id
    hbImgBl: false,
    hbImg: '',
    captchaImage: '',
    shareimg: "", //转发自动定义图片
    quan: 1, //判断是否有券 有1 没0
    e: "", //用于区分是否为web分享
    seekNull: false, //当服务返回来的数据为空时提示用户
    collect: false, //是否己经收藏

    //猜你喜欢商品列表
    goodsList: [],
    mode: app.globalData.mode, //选择列表模版

    sysData: {}, //是否开启砍价和主题分类
    showGuess: false, //判断猜你喜欢是否有数据
    result: false, //
    buyMsg: '', //用户购买信息
    showMsg: "", //选择展示的用户信息
    sm: false, //
    pid: '', // 当扫小程序码进来有pid
    canvasImg: "", //下载的图片 用于生成海报
    hideTimer: false, //销毁定时器
    platform: '', //平台值  显示不同平台

    desc_hide: 1,//是否隐藏商品描述
  },


  // tb复制口令
  copy: function() {
    let that = this;
    let pams = {
      token: app.globalData.token,
      goodsId: that.data.spreadId,
      goodsName: that.data.goodsInfo.goodsName,
      goodsImg: that.data.goodsInfo.goodsGalleryUrls[0],
      price: that.data.goodsInfo.price,
      endPrice: that.data.goodsInfo.endPrice,
      couponMoney: that.data.goodsInfo.couponMoney, //
      ifQw: 0, //1:全网商品（超级搜索出来的商品） 0:产品库的商品
      activityId: that.data.goodsInfo.activityId || '', //优惠券id
      // activityId:'9d0bed6b2d5a4339b4c4581'
    };

    util.request(myUrl.goodsUrl + 'share/goodsPwd', pams, 'GET', 0, function(res) {
      if (res.data.result == "OK") {
        wx.setClipboardData({
          data: res.data.pwd,
          success: function(res) {
            wx.showToast({
              title: '复制成功',
            })
          }
        })
      } else {
        wx.showToast({
          title: res.data.result,
          icon: 'none',
          duration: 3000,
        })
        return;
      }
    })

  },

  // 获取小程序链接
  download: function() {
    let that = this;
    var goodsInfo = that.data.goodsInfo;

    // 跳转到拼多多
    let pams = {
      goodsId: that.data.spreadId,
      goodsName: goodsInfo.goodsName,
      price: goodsInfo.price,
      endPrice: goodsInfo.endPrice,
      couponMoney: goodsInfo.couponMoney,
      ifQw: 0,
      ifBuy: 1,
      goodsImg: goodsInfo.goodsGalleryUrls[0],
      platform: goodsInfo.platform,
      openType: 3,
      deviceId: "/mini",
      pid: that.data.pid, //扫小程序码进来会有pid
      appid: app.globalData.APPID,
      ifFree: that.data.ifFree || ''
    };

    that.data.e == '' ? pams.token = app.globalData.token : pams.e = that.data.e
    util.request(myUrl.goodsUrl + 'share/pddPromotion', pams, 'GET', 0, function(res) {
      if (res.data.result != "OK") {
        // wx.showToast({
        //   title: res.data.result,
        //   icon: 'none',
        //   duration: 3000,
        // })

        that.setData({
          wxExtraData: '',
          jupappid: 'wx32540bd863b27570',
        })
        
        return;
      } else {
        that.setData({
          wxExtraData: '',
          jupappid: 'wx32540bd863b27570',
          path: res.data.url
        })
      }
    })

  },



  // 服务说明是否显示
  isCheck: function() {
    let that = this;
    that.setData({
      isCheck: (!that.data.isCheck),
    })
  },
  //返回首页
  toHome: function () {
    wx.reLaunch({
      url: '/pages/index/index',
    })
  },

  //收藏店铺
  addStore: function() {
    let that = this;
    var smallPic = '';
    var goodsInfo = that.data.goodsInfo;

    if (that.data.platform == 5 || that.data.platform == 4) {
      smallPic = goodsInfo.goodsGalleryUrls[0];
    } else {
      smallPic = goodsInfo.goodsGalleryUrls[1];
    }
    let pamss = {
      token: app.globalData.token,
      goodsId: that.data.spreadId,
      goodsName: goodsInfo.goodsName,
      goodsPic: goodsInfo.goodsGalleryUrls[0],
      smallPic: smallPic,
      price: goodsInfo.price,
      endPrice: goodsInfo.endPrice,
      couponMoney: goodsInfo.couponMoney,
      commission: goodsInfo.commission,
      sales: goodsInfo.sales,
      platform: that.data.platform,
      src: 0,
      activatyId: goodsInfo.activatyId || ''
    }
    util.request(myUrl.mainUrl + 'userGoods/save', pamss, 'GET', 0, function(res) {
      console.log(res.data);
      if (res.data.result != "OK") {
        wx.showToast({
          title: res.data.result,
          icon: 'none',
          duration: 3000,
        })
        return;
      }
      that.setData({
        collect: true
      })
      wx.showToast({
        title: "收藏成功",
        icon: 'none',
        duration: 2000,
      })

    })
  },

  //删除店铺
  delStore: function() {
    let that = this;
    let pamss = {
      token: app.globalData.token,
      goodsId: that.data.spreadId,
      platform: that.data.platform
    }
    util.request(myUrl.mainUrl + 'userGoods/del', pamss, 'GET', 0, function(res) {
      if (res.data.result != "OK") {
        wx.showToast({
          title: res.data.result,
          icon: 'none',
          duration: 3000,
        })
        return;
      }
      that.setData({
        collect: false
      })
      wx.showToast({
        title: "取消成功",
        icon: 'none',
        duration: 2000,
      })
    })
  },


  //生命周期函数--监听页面加载
  onLoad: function(options) {
    let that = this;
    
    // that.ceshi();
    if (getCurrentPages().length < 2) {
      //从其他页面直接跳转过来的，如 分享,  模板消息
      that.setData({
        ifRootPage: true
      })
    }

    if (options.ifFree) {
      that.setData({
        ifFree: options.ifFree,
      })
    }

    //判断是否登录
    options = util.isLogin(this, app);
    if (!options) return;

    //原谅我这写-_-实在想不出，有什么好的办法了->_->
    if (options.scene) {
      util.getParame(options.scene, (props) => {
        options = props;

        //tb  pdd   微选   京东
        if (options.platform == 1 || options.platform == 3) {
          that.setData({
            platform: 1,
          })
        }
        if (options.platform == 2) {
          that.setData({
            platform: 2,
          })

          //猜你喜欢
          util.like(that, app, options); //猜你喜欢
        }
        if (options.platform == 4) {
          that.setData({
            platform: 4,
          })
        }
        if (options.platform == 5) {
          that.setData({
            platform: 5,
          })
        }

        this.data.spreadId = options.id; //商品ID
        this.data.pid = options.pid || ''; // 当扫小程序码进来有pid
        this.data.e = options.e || ''; //用于区分是否为web分享
        this.goodsMsg(options);

      })
      return;
    }


    //tb  pdd   微选   京东
    if (options.platform == 1 || options.platform == 3) {
      that.setData({
        platform: 1,
      })
    }
    if (options.platform == 2) {
      that.setData({
        platform: 2,
      })

      //猜你喜欢
      util.like(that, app, options); //猜你喜欢
    }
    if (options.platform == 4) {
      that.setData({
        platform: 4,
      })
    }
    if (options.platform == 5) {
      that.setData({
        platform: 5,
      })
    }


    that.data.spreadId = options.id; //商品ID
    that.data.pid = options.pid || ''; // 当扫小程序码进来有pid
    that.data.e = options.e || ''; //用于区分是否为web分享
    that.goodsMsg(options);

  },

  // 用户购买信息
  // buyMsg: function(money) {
  //   let that = this;
  //   let pams = {
  //     token: app.globalData.token,
  //     type: 2,
  //     deviceId: "/mini",
  //   }
  //   util.request(myUrl.goodsUrl + 'msg/r/behaviorList', pams, 'GET', 1, function(res) {
  //     console.log(res)
  //     if (res.data.result != "OK") {
  //       wx.showToast({
  //         title: res.data.result,
  //         icon: 'none',
  //         duration: 3000,
  //       })
  //       return;
  //     }

  //     if (res.data.list.length != 0) {
  //       setTimeout(function() {
  //         that.setData({
  //           sm: true
  //         })
  //       }, 9000)

  //       res.data.list = res.data.list.slice(0, 50)
  //       res.data.list.map((item, index, array) => {
  //         item.content = item.content.replace(/{佣金} /, money + "元")
  //       })
  //       that.setData({
  //         buyMsg: res.data.list,
  //       })
  //       that.setTimer();
  //     }
  //   });
  // },


  // 定时器
  setTimer: function() {
    let that = this;
    let index = 0;
    let myTimer = setInterval(function() {
      let Msg = that.data.buyMsg[index]
      that.setData({
        showMsg: Msg
      })
      index++;
      if (index == that.data.buyMsg.length) {
        index = 0
      }
    }, 9000)
  },


  //商品详情
  goodsMsg: function(options) {
    let that = this;
    console.log(options);

    var pams = {
      token: app.globalData.token,
      goodsId: options.id,
      platform: options.platform
    };


    util.request(myUrl.goodsUrl + 'pdd/goods/detail', pams, 'GET', 1, function(res) {
      //后台报错
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

      //有信息但是信息不全显示下架
      // if (!res.data.endPrice || !res.data.price || !res.data.platform){
      //   that.setData({
      //     isshelves: true,   //是否认下架  默认下架
      //   })
      //   return;
      // }

      res.data.endPrice = res.data.endPrice.toFixed(2)
      res.data.price = res.data.price.toFixed(2)

      //判断是否有券
      if (res.data.couponMoney == 0 || res.data.couponMoney == "") {
        that.setData({
          quan: 0
        })
      }

      //合成转发图片
      that.forward(res.data);

      that.setData({
        goodsInfo: res.data, //商品信息
        collect: res.data.ifFocus, //是否收藏
        isshelves: false,
        imginfolist: res.data.mallDetail.list, //图文列表
        serviceList: res.data.mallDetail.serviceList, //支持的服务类型
        mallBean: res.data.mallDetail.mallBean
      })


      that.download();

      // 设置nav标题
      // wx.setNavigationBarTitle({
      //   title: res.data.goodsName || '商品详情'
      // })
      wx.setNavigationBarTitle({
        title: '商品详情'
      })

      // that.buyMsg(res.data.commission); //用户购买信息

      // console.log(that.data.goodsInfo.goodsDesc);
    });
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


  // 预览canvas图片
  previewImage: function(e) {
    wx.previewImage({
      urls: this.data.goodsInfo.goodsGalleryUrls,
    })
  },

  // 关闭canvas
  hideMark: function() {
    this.setData({
      hbImgBl: false,
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
  canvasFn: function() {
    // console.time("canvas")
    let that = this;
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
      goodsId: that.data.spreadId,
      wxAppid: app.globalData.APPID,
      platform: that.data.platform
    }

    var path = '';
    app.globalData.ext ? path = 'share/getJWMiniCode' : path = 'share/getMiniCode';
    util.request(myUrl.mainUrl + path, pamss, 'GET', 0, function(res) {
      console.log(res);
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
          miniCode = res.tempFilePath
        }
      })
    })


    let len = that.data.goodsInfo.price.toString().length; //原价长度
    let OriginalPrice = Number(this.data.goodsInfo.price); //原价改为number类型
    let OriginalPricewidth = 26 + len * 12 * 0.5; //原价的宽度
    let linewidths = 135 + OriginalPricewidth; //横线

    ctx.setFillStyle('#FFFFFF') //设置填充色
    ctx.setLineWidth("1") //设置线条的宽度
    ctx.fillRect(0, 0, 300, 500) //填充一个矩形

    ctx.setFillStyle("#333333")
    ctx.setFontSize(16)
    ctx.lineWidth = 1;
    let str = this.data.goodsInfo.goodsName
    if (str.length > 32) {
      str = str.substring(0, 32) + '...'
    }

    that.canvasTextAutoLine(str, ctx, 15, 326, 20) //文字自动调行

    ctx.drawImage("../../img/icon_quan.png", 10, 370, 45, 15)
    ctx.setFillStyle("#e84d74")
    ctx.setFontSize(16)
    ctx.fillText('￥' + this.data.goodsInfo.endPrice, 60, 384)
    ctx.setFillStyle("#666666")
    ctx.setFontSize(12)
    ctx.fillText('原价￥' + OriginalPrice, 130, 383)
    ctx.moveTo(130, 378)
    ctx.lineTo(linewidths, 378)
    ctx.stroke()

    ctx.setFillStyle("#666666")
    ctx.setFontSize(12)
    ctx.fillText('限时限量', 240, 383)

    ctx.drawImage("../../img/icon_quan1.png", 10, 410, 280, 80)

    ctx.setFontSize(22)
    ctx.setFillStyle("#ffffff")
    ctx.fillText(that.data.goodsInfo.couponMoney + '元优惠券', 54, 445)

    ctx.setFillStyle("#ffffff")
    ctx.setFontSize(14)
    ctx.fillText('微信内长按二维码领优惠券', 25, 472)
    ctx.draw(); //画之前清除以前的（清除）

    let time = setInterval(function() {
      if (miniCode != '') {
        clearTimeout(time) //清空定时器
        if (that.data.canvasImg != '') {
          ctx.drawImage(that.data.canvasImg, 0, 0, 300, 300) //下载海报
        }
        ctx.drawImage(miniCode, 212, 415, 70, 70) //小程序码

        ctx.draw(true)
        setTimeout(function() {
          that.hbImg();
          // console.timeEnd("canvas")
        }, 500)
      }
    }, 150)

  },


  //合成转发图片
  forward: function(goodsForward) {
    console.log('合成转发图片')
    let that = this;
    
    let yj = parseFloat(goodsForward.price);
    let endprice = parseFloat(goodsForward.endPrice);
    let yhq = parseInt(goodsForward.couponMoney)
    if (yj > 1000 && yj< 10000){
      yj = yj.toFixed(1);
    } else{
      if (yj > 10000) {
        yj = yj.toFixed(0);
      }else{
        yj = yj.toFixed(2);
      }
    }

    if (endprice > 1000 && endprice < 10000) {
      endprice = endprice.toFixed(1);
    } else {
      if (endprice > 10000) {
        endprice = endprice.toFixed(0);
      }else{
        endprice = endprice.toFixed(2);
      }
    }
    
    console.log(yj)
    let ctx = wx.createCanvasContext('shareCanvas');
    let len = goodsForward.price.toString().length;
    let OriginalPricewidth = 26 + len * 12 * 0.5;
    let linewidths = 48 + OriginalPricewidth;
    wx.downloadFile({
      url: myUrl.mainUrl + 'share/loadFileByUrl?token=' + app.globalData.token + '&url=' + goodsForward.goodsGalleryUrls[0],  //转换成二进制流
      success: function(res) {
        console.log(res.tempFilePath);
        that.data.canvasImg = res.tempFilePath;  //把二进制图片图片保存下来，用于生成海报
        ctx.drawImage(that.data.canvasImg, 0, 0, 400, 320);
        ctx.drawImage('../../img/share_bg3.png', 134, 268, 266, 52) 
        ctx.setFillStyle("#ffffff")
        ctx.setFontSize(20)
        ctx.fillText('原价￥' + yj, 150, 304) 
        ctx.drawImage('../../img/share_bg2.png', 280, 276, 106, 36)

        ctx.setFontSize(20)
        ctx.fillText('券', 290, 302)
        ctx.fillText(yhq, 340, 302)

        ctx.drawImage('../../img/share_bg.png', 0, 242, 150, 78)
        ctx.setFontSize(20)
        ctx.fillText('券后到手价', 10, 270) //改
        ctx.setFontSize(26); 
        ctx.fillText("￥" + endprice, 10, 310);

        ctx.draw(false, function(e) {
          wx.canvasToTempFilePath({
            x: 0,
            y: 0,
            canvasId: 'shareCanvas',
            success: function(res1) {
              console.log('合成图片成功' + res1.tempFilePath)
              that.setData({
                shareimg:res1.tempFilePath
              })
            }
          })
        });

      },
      
      fail: function() {
        console.log("安全域名问题失败了")
      }
    })

  },



  //回到顶部
  backTop: function() {
    wx.pageScrollTo({
      scrollTop: 0,
    })
  },



  //加入合伙人
  join: function() {
    wx.showModal({
      title: '提示',
      content: '您现在还是消费者，不能分享赚，请升级为代理',
      success: (res) => {
        if (!res.confirm) return;
        wx.switchTab({
          url: "/pages/home/home"
        })
      }
    })
  },

  // 首页跳转
  index: function(e) {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },


  // 反馈页面
  feedback() {
    wx.navigateTo({
      url: '/pages/details/feedback/feddback',
    })
  },





  // showimginfo: function(e) {
  //   let that = this;
  //   console.log(e.detail.y)
  //   if (that.data.arrowimg == '../../img/up_ico1.png') {
  //     that.setData({
  //       showimginfo: !that.data.showimginfo,
  //       arrowimg: '../../img/down_ico1.png'
  //     })
  //   } else {
  //     that.setData({
  //       showimginfo: !that.data.showimginfo,
  //       arrowimg: '../../img/up_ico1.png'
  //     })
  //   }

  //   setTimeout(function() {
  //     wx.pageScrollTo({
  //       scrollTop: e.detail.y - 30,
  //     })
  //   }, 500)
  // },

  //去店铺
  gostore: function(e) {
    var mallId = e.currentTarget.dataset.mallid
    var plat = e.currentTarget.dataset.platform;
    var name = e.currentTarget.dataset.shopname;

    wx.navigateTo({
      // url: '/package/pages/shop/shop?mallId={{goodsInfo.mallId}}&platform={{platform}}&shopname={{goodsInfo.mallName}}"',
      url: '/package/pages/shop/shop?mallId=' + mallId + '&platform=' + plat + '&shopname=' + name,
    })
  },
  onShow: function() {
    let that = this;
    that.setData({
      role: wx.getStorageSync('userMsg').role, //角色代号 0粉丝  
    })
  },

  onPullDownRefresh: function () {
    var that = this;
    wx.stopPullDownRefresh();
  },



  //转发好友
  onShareAppMessage: function () {
    let that = this;
    console.log('userId = ' + app.globalData.user.unionidF + ' & id=' + that.data.spreadId + "&platform=" + that.data.goodsInfo.platform);
    return {
      title: that.data.goodsInfo.goodsName,
      imageUrl: that.data.shareimg,
      path: '/pages/details/details?userId=' + app.globalData.user.unionidF + '&id=' + that.data.spreadId + "&platform=" + that.data.platform
    }
  },
  //显示/隐藏商品全部描述
  showAllDesc: function(e){
    // e.target.dataset.hide = '0';
    let that = this;
    console.log(that.data.desc_hide);
    if(that.data.desc_hide){
      that.setData({
        desc_hide: 0
      });
    }else{
      that.setData({
        desc_hide: 1
      });
    }
  },

  //一键复制文本内容
  copyTitle:function(e){
    var self=this;
    wx.setClipboardData({
      data: self.data.goodsInfo.goodsName,
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
      }
    })
  },

})