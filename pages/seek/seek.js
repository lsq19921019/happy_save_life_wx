// 搜索页面

const app = getApp()
const myUrl = require("../../utils/url.js");
const util = require('../../utils/util.js');

var user = wx.getStorageSync('userMsg');


Page({

  /**
   * 页面的初始数据
   */
  data: {
    role: user.role, //用户角色
    
    seekvalue: '', //搜索词语
    _num: 0, //排序 默认综合
    arrange: 0, //商品显示样式
    ifOnlyCoupon: false, //是否只显示优惠商品

    //分页功能
    goodslist: [], //商品例表
    page: 1, //页码
    showloding: false,
    nomore: false,
    maxcount: 20,
    stop: false, //是否停止下拉刷新

    mode: app.globalData.mode, //选择列表模版
    role: app.globalData.role, //用户角色
    diff: 0, //区分是搜索进来,还是分类进来 0搜索  1分类

    swiState: false, //swich默认选择
    showDelCont: false
  },

  //生命周期函数--监听页面加载
  onLoad: function(options) {
    let that = this;

    // 发送的参数
    that.setData({
      seekvalue: options.key || '上衣'
    })

    //设置标题
    wx.setNavigationBarTitle({
      title: that.data.seekvalue
    });

    that.getData(1, that.data._num, that.data.ifOnlyCoupon, 1)

   


  },



  onShow: function() {
    let that = this;
    that.setData({
      role: wx.getStorageSync('userMsg').role, //角色代号 0粉丝  
    })
    that.setData({
      sysData: app.globalData.sysData,
      swiState: app.globalData.state
    })
    // if (this.data.sendMsg.length > 0) {
    that.setData({
      showDelCont: true
    })
    // }
  },

  // 是否显示优惠商品
  switchChange: function(e) {
    let that = this;
    console.log(e.detail.value)
    wx.pageScrollTo({
      scrollTop: 0,
    })

    that.setData({
      page: 1,
      nomore: false,
      stop: false, //是否停止下拉刷新
      ifOnlyCoupon: e.detail.value
    })


    that.getData(1, that.data._num, that.data.ifOnlyCoupon, 1)

    // app.globalData.state = e.detail.value
  },

  //搜索
  bindBlur: function(e) {
    this.setData({
      seekvalue: e.detail.value
    })
    if (e.detail.value.length > 0) {
      this.setData({
        showDelCont: true
      })
    } else if (e.detail.value.length == 0) {
      this.setData({
        showDelCont: false
      })
    }
  },

  sendSeek: function() {  
    var that = this;
    that.setData({
      page: 1,
      nomore: false,
      stop: false, //是否停止下拉刷新
    })

    that.getData(1, that.data._num, that.data.ifOnlyCoupon, 1)
   
  },

  //删除搜索内容
  delCont: function() {

    this.setData({
      seekvalue: '',
      showDelCont: false
    })
  },

  //商品列表
  getData: function(page, sortType, ifOnlyCoupon, load) {
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
      catId: '',
      keyword: that.data.seekvalue,
      st: page,
      sortType: sortType,
      ifOnlyCoupon: ifOnlyCoupon
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
        // result[j].commission = result[j].commission.toFixed(2);
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

  godetail: function (e) {
    let that = this;
    var id = e.currentTarget.dataset.id;
    var platform = e.currentTarget.dataset.platform
    wx.navigateTo({
      url: '/pages/details/details?id=' + id + '&platform=' + platform,
    })
  },


  //排序点击事件
  sort: function(e) {
    let that=this;
    util.sort(e.currentTarget.dataset.style, that, function(){
      that.getData(1, that.data._num, that.data.ifOnlyCoupon, 1)
    })
  },
  
  //更改样式的事件
  changestyle: function() {
    let that = this;
    util.changestyle(that);
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

    that.getData(1, that.data._num, that.data.ifOnlyCoupon, 1)
    wx.stopPullDownRefresh();
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

      that.getData(that.data.page, that.data._num, that.data.ifOnlyCoupon, 1)
    }
  },


  //回到顶部
  onPageScroll: function(e) {
    if (e.scrollTop >= 600) {
      this.setData({
        floorstatus: false
      })
    } else {
      this.setData({
        floorstatus: true
      })
    }
  },

  backTop: function() {
    wx.pageScrollTo({
      scrollTop: 0,
    })
  }
})