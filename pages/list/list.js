const app = getApp()
const myUrl = require("../../utils/url.js");
const util = require('../../utils/util.js');
var user = wx.getStorageSync('userMsg');


Page({
  /**
   * 页面的初始数据
   */
  data: {
    isbaokuan: true, //是否是爆款 list页面里才有
    role: user.role, //用户角色
    _num: 0, //排序 默认综合
    arrange: 0, //商品显示样式
    themeId: '',

    //分页功能
    goodslist: [], //商品例表
    page: 1, //页码
    showloding: false,
    nomore: false,
    maxcount: 20,
    stop: false, //是否停止下拉刷新
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;

    //设置标题
    wx.setNavigationBarTitle({
      title: options.title || '9.9'
    })
    that.setData({
      title: options.title
    });
    if (getCurrentPages().length < 2) {
      //从其他页面直接跳转过来的，如 分享,  模板消息
      that.setData({
        ifRootPage: true
      })
    }

    //装修穿过来的参数用装修的
    if (options.params) {
      var last_params = JSON.parse(options.params); //请求参数
      var url = options.link; //请求url
      that.setData({
        zx_lastparams: JSON.parse(options.params),
        zx_url: options.link
      })
      that.getData(1, that.data._num, that.data.themeId, 1);
      return;
    }

    if (options.themeId) {
      //设置主题id
      that.setData({
        themeId: options.themeId,
      })
      that.getData(1, that.data._num, that.data.themeId, 1)
      return;
    }


  },

  //获取百货商品列表(页码，排序类型，分类id,是否显示加载)
  getData: function(page, sortType, themeId, load) {
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

    let url = 'pdd/goods/list' //高额神券
    var pams = {};

    if (themeId == 1) {
      url = 'pdd/queryGoodslistByNinermb' //1.9包邮api—2.0
      pams = {
        pageNum: page,
        sortType: sortType,
        token: app.globalData.token,
      }
    } else if (themeId == 3) {
      url = 'pdd/brandGoodsList' //品牌好货商品api
      pams = {
        pageNum: page,
        sortType: sortType,
        token: app.globalData.token,
      }
    } else if (themeId == 2) {
      url = 'pdd/queryGoodslistByTopsales' //今天爆款
      pams = {
        pageNum: page,
        sortType: sortType,
        token: app.globalData.token,
      }
    } else if (themeId == 10) {
      url = 'pdd/goods/list'; //高额神券
      pams = {
        st: page,
        sortType: sortType,
        token: app.globalData.token,
        ifOnlyCoupon: true,
        themeId: themeId,
      }
    } else {
      url = that.data.zx_url; //装修进来动态改变
      pams = that.data.zx_lastparams
    }

    // 数据请求
    util.request(myUrl.mainUrl + url, pams, 'POST', load, function(res) {
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


      that.setData({
        goodslist: concat.concat(result)
      })

    })
  },

  godetail: function(e) {
    let that = this;
    var id = e.currentTarget.dataset.id;
    var platform = e.currentTarget.dataset.platform
    wx.navigateTo({
      url: '/pages/details/details?id=' + id + '&platform=' + platform,
    })
  },
  formSubmit: function (e) {
    util.formId(e, app)
  },

  //排序点击事件
  sort: function(e) {
    let that = this;
    util.sort(e.currentTarget.dataset.style, that, function() {
      that.getData(1, that.data._num, that.data.themeId, 1)
    })
  },

  //更改样式的事件
  changestyle: function() {
    let that = this;
    util.changestyle(that);
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

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
    var that = this;
    that.setData({
      page: 1,
      nomore: false,
      stop: false, //是否停止下拉刷新
    })

    that.getData(1, that.data._num, that.data.themeId, 1);

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    var that = this;
    console.log(that.data.stop);
    if (that.data.stop == true) {
      return
    } else {
      that.setData({
        page: that.data.page + 1
      })

      that.getData(that.data.page, that.data._num, that.data.themeId, 0);


      wx.stopPullDownRefresh();
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    
    let that = this;

    return {
      title: that.data.title,
      // path: 'pages/list/list?userId=' + app.globalData.user.unionidF
      path: '/pages/list/list?themeId=' + that.data.themeId + '&title=' + that.data.title
    }
  },

  //返回首页
  toHome: function () {
    wx.reLaunch({
      url: '/pages/index/index', 
    })
  },

  onShow: function() {
    let that = this;
    that.setData({
      role: wx.getStorageSync('userMsg').role, //角色代号 0粉丝  
    })
  }
})