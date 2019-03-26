const app = getApp()
const myUrl = require("../../utils/url.js");
const util = require("../../utils/util.js");
var user = wx.getStorageSync('userMsg');

// 2  爆款排行
// 10  高额神券
// 3  品牌好货
// 1  1.9包邮

Page({

  /**
   * 页面的初始数据
   */
  data: {
    ifFree: false,
    showfree: true,
    role: user.role, //用户角色
    _num: 0, //排序 默认综合
    arrange: 0, //商品显示样式

    _active: 0, //导航选中
    catId: '', //分类id
    catlist: [], //分类列表  女装、男装
    themlist: [],
    goodslist: [],
    modulelist: [], //装修
    themIconList: [
      //   {
      //   name: '新人免单',
      //   icon: 'https://bnlnimg.bnln100.com/themIcon2.png'
      // },
      //  {
      //   name: '新手教程',
      //     icon: 'https://bnlnimg.bnln100.com/themIcon4.png'
      // }, 
      // {
      //   name: '9.9秒杀',
      //     icon: 'https://bnlnimg.bnln100.com/themIcon5.png'
      //   },

      {
        name: '爆款排行',
        themeId: 2,
        icon: 'https://bnlnimg.bnln100.com/themIcon6.png'
      },
      
      {
        name: '高额神劵',
        themeId: 10,
        icon: 'https://bnlnimg.bnln100.com/themIcon3.png'
      },

      {
        name: '品牌好货',
        themeId: 3,
        icon: 'https://bnlnimg.bnln100.com/themIcon7.png'
      },
      {
        name: '1.9包邮',
        themeId: 1,
        icon: 'https://bnlnimg.bnln100.com/themIcon5.png'
      }


    ],

    page: 1, //页码
    showloding: false,
    nomore: false,
    maxcount: 30, //首页的页码
    goodscount: 20, // 百货商品的页码
    stop: false, //是否停止下拉刷新

    sendMsg: '', //搜索条件

    sliderOffset: 0,
    scrollPosition: 0,

    showup: false,
    showfill: false,

    masktop1: 1026 + 'rpx',
    wxExtraData: {
      "path": "pages/welfare_coupon/welfare_coupon?goods_id=1464722022&pid=40002_19012793&cpsSign=CC40002_19012793_3d8524ae2314544373722f7272e03a17&duoduo_type=2",
      "appId": "wx32540bd863b27570"
    },
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;

    wx.setNavigationBarTitle({
      title: app.globalData.title
    })
    //判断是否登录
    options = util.isLogin(that, app);
    if (!options) return;

    // that.class();     //装修
    that.getIndexInfo(1, 1);
    // that.getclass(); //获取分类
    // that.goodslist(1, 1);
    // that.getjumpinfo();

    //创建节点选择器
    var query = wx.createSelectorQuery();
    //选择id


    query.select('.navBar').boundingClientRect(function(rect) {
      that.setData({
        masktop: 2 * (rect.top + rect.height) + 250 + 'rpx'
      })
    }).exec();

  },

  //键盘输入时获取搜索的值
  bindBlur: function(e) {
    var that = this;
    var sendMsg = e.detail.value;
    that.setData({
      sendMsg: sendMsg
    })
    if (sendMsg == "") {
      that.setData({
        showclosebtn: false
      })
    }else{
      that.setData({
        showclosebtn: true
      })
    }
  },

  //查找跳转带上搜索的内容
  sendSeek: function(e) {
    var sendMsg = this.data.sendMsg;
    if (sendMsg == "") {
      wx.showToast({
        title: "亲，搜索条件不能为空哦！",
        icon: 'none',
        duration: 2000,
      })
      return;
    }
    wx.navigateTo({
      url: '/pages/seek/seek?key=' + sendMsg
    })
  },
  //清空搜索的内容
  clearSeek: function(e) {
    var that = this;
    // console.log(this.data.sendMsg);
    that.setData({
      sendMsg: '',
      showclosebtn: false
    })
    // console.log(this.data.sendMsg);
  },


  //分类点击事件
  cifyClick: function(e) {
    let that = this;
    let id = e.currentTarget.dataset.id; //索引
    let catid = e.currentTarget.dataset.catid;
    console.log(catid);

    id == 1000 && (id = 1)

    if (id <= 4) {
      that.setData({
        scrollPosition: 0
      })
    } else if (id > 4) {
      that.setData({
        scrollPosition: 50 * (id - 4)
      })
    }

    if (that.data._active == e.currentTarget.dataset.id) return; //不让用户重复点击

    that.setData({
      _active: e.currentTarget.dataset.id,
      seekNull: false,
      sliderOffset: e.currentTarget.offsetLeft - 10,
      catid: catid,
      _num: 0,
      page: 1,
      nomore: false,
      stop: false, //是否停止下拉刷新
    })

    if (e.currentTarget.dataset.id == 0) {
      that.goodslist(1, 1);
      return;
    }

    that.getData(that.data.page, that.data._num, that.data.catid, 1)
  },


  // 下拉面板切换当前项目排在第一位
  switch_cur: function(e) {
    let that = this;
    let id = e.currentTarget.dataset.id;
    let catid = e.currentTarget.dataset.catid;
    console.log(id)

    that.setData({
      _active: id,
      scrollPosition: (id) * 48,
      showup: false,

      catid: catid,
      _num: 0,
      page: 1,
      nomore: false,
      stop: false, //是否停止下拉刷新
    })

    that.getData(that.data.page, that.data._num, that.data.catid, 1)

  },

  // 获取首页的信息
  getIndexInfo: function(page, load) {
    let that = this;
    if (page == 1) {
      that.setData({
        showloding: false,
        nomore: false,
        goodslist: [],
      })
    } else {
      that.setData({
        showloding: true,
      })
    }

    var pams = {
      token: app.globalData.token,
    }


    util.request(myUrl.mainUrl + 'pdd/indexInfo?', pams, 'GET', load, function(res) {
      if (res.data.result != "OK") {
        wx.showToast({
          title: res.data.result,
          mask: "true",
          icon: 'none',
          duration: 3000
        })
        return;
      }

      var concat = that.data.goodslist; //上一次的请求的所有内容
      var result = res.data.list; //本次首页的商品信息
      var len = result.length


      // //小数点格式化
      for (let j = 0; j < len; j++) {
        result[j].couponMoney = result[j].couponMoney.toFixed(0);
        result[j].price = result[j].price.toFixed(2);
        result[j].endPrice = result[j].endPrice.toFixed(2);
        result[j].commission = result[j].commission.toFixed(2);
      }


      if (page == 1) {
        concat = [];
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
            showloding: true,
          })
        }
      }

     

      that.setData({
        goodslist: concat.concat(result),
        catlist: res.data.catList, //分类
        themlist: res.data.themList, //精选轮播
        ifFree: res.data.ifFree,
        modulelist: res.data.module,  //模块化

      })

    })
  },


  //获取首页商品 上拉加载时使用-----------------------------------------------------
  goodslist: function(page, load) {
    let that = this;

    // myUrl.mainUrl + that.data.api

    if (page == 1) {
      that.setData({
        showloding: false,
        nomore: false,
        goodslist: [],
      })
    } else {
      that.setData({
        showloding: true,
      })
    }

    var pams = {
      st: page,
      token: app.globalData.token,
    }

    util.request(myUrl.mainUrl + 'pdd/index/list?', pams, 'GET', load, function(res) {
      if (res.data.result != "OK") {
        wx.showToast({
          title: res.data.result,
          mask: "true",
          icon: 'none',
          duration: 3000
        })
        return;
      }

      var concat = that.data.goodslist; //上一次的请求的所有内容
      var result = res.data.list;
      var len = result.length


      //小数点格式化
      for (let j = 0; j < len; j++) {
        result[j].couponMoney = result[j].couponMoney.toFixed(0);
        result[j].price = result[j].price.toFixed(2);
        result[j].endPrice = result[j].endPrice.toFixed(2);
        result[j].commission = result[j].commission.toFixed(2);
      }


      if (page == 1) {
        concat = [];
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
            showloding: true,
          })
        }
      }



      that.setData({
        goodslist: concat.concat(result)
      })

    })

  },


  //获取百货商品列表(页码，排序类型，分类id,是否显示加载)
  getData: function(page, sortType, catId, load) {
    let that = this;
    if (page == 1) {
      that.setData({
        showloding: false,
        nomore: false,
        goodslist: [],
      })
    } else {
      that.setData({
        showloding: true,
      })
    }


    let pams = {
      token: app.globalData.token,
      catId: catId,
      keyword: '',
      st: page,
      sortType: sortType,
      ifOnlyCoupon: true
    }

    // 数据请求
    util.request(myUrl.mainUrl + 'pdd/search?', pams, 'POST', load, function(res) {
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

      var concat = that.data.goodslist; //上一次的请求的所有内容
      var result = res.data.list;
      var len = result.length

      //小数点格式化
      for (let j = 0; j < len; j++) {
        result[j].couponMoney = result[j].couponMoney.toFixed(0);
        result[j].price = result[j].price.toFixed(2);
        result[j].endPrice = result[j].endPrice.toFixed(2);
        result[j].commission = result[j].commission.toFixed(2);
      }

      if (len < that.data.goodscount) {
        that.setData({
          nomore: true,
          stop: true,
        })

      } else {
        that.setData({
          nomore: false,
          showloding: true,
        })
      }


      that.setData({
        goodslist: concat.concat(result)
      })

    })
  },

  //获取跳转到拼多多所带的参数-----------------------------------------
  // getjumpinfo: function () {
  //   let that = this;
  //   var pams = {
  //     token: app.globalData.token,
  //     partnerId: 888923
  //   }
  //   util.request(myUrl.mainUrl + 'pdd/getPddRed?', pams, 'GET', 0, function (res) {
  //     if (res.data.result != "OK") {
  //       wx.showToast({
  //         title: res.data.result,
  //         mask: "true",
  //         icon: 'none',
  //         duration: 3000
  //       })
  //       return;
  //     }
  //     // console.log(res.data)
  //     that.setData({
  //       wxExtraData: '',
  //       page_path: res.data.page_path
  //     })
  //   })
  // },


  //显示装修区域
  class: function() {
    let that = this;
    let pams = {
      token: app.globalData.token
    };
    util.request(myUrl.mainUrl + 'module/get', pams, 'GET', 0, function(res) {
      if (res.data.result == "OK") {
        if (res.data.module) {
          var modulelist = res.data.module;
          that.setData({
            modulelist: modulelist,
          })
        }

        Console.log(that.data.modulelist);

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


  //排序点击事件 百货商品
  sort: function(e) {
    let that = this;
    util.sort(e.currentTarget.dataset.style, that, function() {
      that.getData(1, that.data._num, that.data.catid, 1);
    })
  },


  //更改样式的事件
  changestyle: function() {
    let that = this;
    util.changestyle(that);
  },



  // 显示隐藏下拉面板
  sh_up: function(e) {
    let that = this;
    that.setData({
      showup: !that.data.showup,
    })
  },



  //跳转类

  //跳转到商品详情
  godetail: function(e) {
    let that = this;
    var id = e.currentTarget.dataset.id;
    var platform = e.currentTarget.dataset.platform
    wx.navigateTo({
      url: '/pages/details/details?id=' + id + '&platform=' + platform,
    })
  },

  //banner跳转到主题
  gothemed: function(e) {
    let that = this;
    console.log(e.currentTarget.dataset.themeid)
    wx.navigateTo({
      url: '/pages/themed/themed?themeId=' + e.currentTarget.dataset.themeid,
    })
  },

  //从百货里跳转到分类
  goclassify: function(e) {
    let that = this;
    console.log(e.currentTarget.dataset.catid)
    wx.navigateTo({
      url: '/pages/classify/classify?catid=' + e.currentTarget.dataset.catid+ "&title=" + e.currentTarget.dataset.catname,
    })
  },

  //从装修进入列表跳转
  go: function(e) {
    var concnet = e.currentTarget.dataset.concent;
    //参数json字符串
    var params = concnet.params;
    var paramsobj = JSON.parse(params);

    console.log(concnet)
    console.log(paramsobj);
    wx.navigateTo({
      url: '/pages/list/list?title=' + concnet.title + "&params=" + params + "&link=" + concnet.link
      // url: '/pages/list/list?themeId=' + paramsobj.themeId + '&title=' + concnet.title + "&params=" + params + "&link=" + concnet.link
    })
  },


  // 跳转到拼多多红包
  transred: function() {
    wx.navigateTo({
      url: '/package/pages/pddpacket/pddpacket'
    })
  },


  //从主题进入列表跳转
  jump: function(e) {
    let that = this;
    let themeTitle = e.currentTarget.dataset.title; //主题标题
    let index = e.currentTarget.dataset.index;
    var themeId;
    console.log(index);

    wx.navigateTo({
      url: '/pages/list/list?themeId=' + index + '&title=' + themeTitle
    })




    // switch (index) {
    //   case 0:
    //     //页面跳转新人免单
    //     wx.navigateTo({
    //       url: '/pages/newfree/newfree'
    //     })
    //     that.setData({
    //       showfree: false,
    //     })
    //     break;
    //   case 1:
    //     //页面跳转高额神券
    //     wx.navigateTo({
    //       url: '/pages/list/list?themeId=' + 10 + '&title=' + themeTitle
    //     })
    //     break;
    //   case 2:
    //     //页面跳转新手教程
    //     wx.navigateTo({
    //       url: '/package/pages/course/course'
    //     })
    //     break;
    //   case 3:
    //     //页面跳转9.9秒杀
    //     wx.navigateTo({
    //       url: '/pages/list/list?themeId=' + 2 + '&title=' + themeTitle
    //     })
    //     break;
    //   case 4:
    //     //页面跳转
    //     wx.navigateTo({
    //       url: '/package/pages/pddpacket/pddpacket'
    //     })
    //     break;

    //   default:
    //     break;
    // }

  },





  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  
  onPullDownRefresh: function() {
    var that = this;
    that.setData({
      page: 1,
      nomore: false,
      stop: false, //是否停止下拉刷新
    })

    if (that.data._active == 0) {
      // that.goodslist(1, 1);
      that.getIndexInfo(1, 0)
    } else {
      that.getData(1, that.data._num, that.data.catid, 1);
    }

    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    var that = this;
    console.log(that.data.stop);
    if (that.data.stop == true) {
      return;
    } else {
      that.setData({
        page: that.data.page + 1
      })
      if (that.data._active == 0) {
        that.goodslist(that.data.page, 0);
        // that.getIndexInfo(that.data.page, 0)
      } else {
        that.getData(that.data.page, that.data._num, that.data.catid, 0);
      }
    }

  },


  //用户点击右上角分享
  onShareAppMessage: function() {
    return {
      title: app.globalData.title,
      imageUrl: 'https://bnlnimg.bnln100.com/index_share.jpg',
      path: 'pages/index/index?userId=' + app.globalData.user.unionidF
    }
  },



  onShow: function() {
    let that = this;
    that.setData({
      role: wx.getStorageSync('userMsg').role, //角色代号 0粉丝   
      // showfree:false
    })
  },

  //显示新人免单的弹框刚进入时的弹框
  sh_free: function(e) {
    let that = this;
    that.setData({
      showfree: !that.data.showfree,
    })
  },


  //放弃代码---------------------------------------------------------------------------------------------

  //分类查询-----------------------------------------
  // getclass: function() {
  //   let that = this;
  //   var pams = {
  //     token: app.globalData.token,
  //   }
  //   util.request(myUrl.mainUrl + 'pdd/getIndex?', pams, 'GET', 0, function(res) {
  //     if (res.data.result != "OK") {
  //       wx.showToast({
  //         title: res.data.result,
  //         mask: "true",
  //         icon: 'none',
  //         duration: 3000
  //       })
  //       return;
  //     }

  //     that.setData({
  //       catlist: res.data.catList, //分类
  //       themlist: res.data.themList, //精选轮播
  //       ifFree: res.data.ifFree,
  //       // showfree:true,
  //       // themIconList: res.data.themIconList, //精选的主题列表
  //     })
  //   })
  // },


  // 筛选按钮显示下拉面板
  // filtrate: function(e) {
  //   let that = this;
  //   that.setData({
  //     showfill: !that.data.showfill,
  //   })
  // },



  //监听屏幕滚动
  // onPageScroll: function(res) {
  //   let that = this;
  //   if (that.data._active == 0) return;
  //   // that.listentop();
  // },

  //获取某个选择器距离顶部的距离
  // listentop: function() {
  //   let that = this;
  //   var query = wx.createSelectorQuery();
  //   query.select('.sortingbox').boundingClientRect(function(res1) {
  //     console.log(2 * (res1.top + res1.height) + 380);
  //     that.setData({
  //       masktop1: (2 * (res1.top + res1.height) + 380) + 'rpx'
  //     })
  //   }).exec();
  // },


  //获取formId
  formSubmit: function (e) {
    util.formId(e, app)
  },
  fstest: function (e) {
   console.log("==》 run fs test")
  },

})