// pages/newfree/newfree.js
const app = getApp()
const myUrl = require("../../utils/url.js");
const util = require('../../utils/util.js');
// var user = wx.getStorageSync('userMsg');


Page({

  /**
   * 页面的初始数据
   */
  data: {
    _num: 0, //排序 默认综合
    arrange: 1, //商品显示样式
    catid: '',

    //分页功能
    goodslist: [], //商品例表
    page: 1, //页码
    showloding: false,
    nomore: false,
    maxcount: 30,
    stop: false, //是否停止下拉刷新
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;

    that.getData(1, 1)
  },
  //获取百货商品列表(页码，排序类型，分类id,是否显示加载)
  getData: function(page,load) {
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
      st: page,
    }

    // 数据请求
    util.request(myUrl.mainUrl +'pdd/goodsFree?', pams, 'POST', load, function(res) {
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


  godetail: function (e) {
    let that = this;
    var id = e.currentTarget.dataset.id;
    var platform = e.currentTarget.dataset.platform
    wx.navigateTo({
      url: '/pages/details/details?id=' + id + '&platform=' + platform +'&ifFree=1',
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
  onShow: function () {
    // let that = this;
    // that.setData({
    //   role: wx.getStorageSync('userMsg').role, //角色代号 0粉丝  
    // })
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

    that.getData(1,  1);
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

      that.getData(that.data.page, 0);
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {
    return {
      path: 'pages/newfree/newfree?userId=' + app.globalData.user.unionidF
    }
  }
})