const app = getApp()
const myUrl = require("../../../utils/url.js");
const util = require('../../../utils/util.js');
var user = wx.getStorageSync('userMsg');

// 排序使用 
// data定义一个_num=0
Page({

  /**
   * 页面的初始数据
   */
  data: {
    role: user.role, //用户角色
    _num: 0, //排序 默认综合
    arrange: 0, //商品显示样式

    //分页功能
    goodslist: [], //商品例表
    page: 1, //页码
    showloding: false,
    nomore: false,
    maxcount: 30,
    stop: false, //是否停止下拉刷新

    sendMsg:'',


    mode: app.globalData.mode, //选择列表模版
    arrow: "",
 
  },

  //页面加载
  onLoad: function (options) {
    let that=this;
    wx.setNavigationBarTitle({ title: options.shopname })   //动态设置标题
    //根据平台id判断平台名称
    this.setData({
      shopname: options.shopname ||'18度休闲运动服',
      platform: options.platform||'2',
      mallId: options.mallId ||'294683',
      platName:"拼多多",
    })

    that.getData(1, that.data._num,1);
    that.seekAttent(that.data.platform);
 
  },

  onShow: function () {
    this.setData({
      sysData: app.globalData.sysData
    })
  },


  //键盘输入时获取搜索的值
  bindBlur: function (e) {
    var that = this;
    var sendMsg = e.detail.value;
    that.setData({
      sendMsg: sendMsg
    })
  },

  //查找跳转带上搜索的内容
  sendSeek: function (e) {
    var that = this;
    that.setData({
      page: 1,
      nomore: false,
      stop: false, //是否停止下拉刷新
    })
    that.getData(1, that.data._num,1)
  },




  //商品列表 
  getData: function (page, num, load) {
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


    let pams={
      token: app.globalData.token,
      st:page,
      keyword: that.data.sendMsg,
      mallId: that.data.mallId,
      sortType: num
      // sortType: that.data._num
    }

    // 数据请求
    util.request(myUrl.mainUrl + 'pdd/mallGoods', pams, 'POST', load, function (res) {
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
      var len = result.length;

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

      if (page == 1){
        that.setData({
          mallDetail: res.data.mallDetail
        })
      }

      that.setData({
        goodslist: concat.concat(result),
        // mallDetail: res.data.mallDetail
      })

     


      
    })
  },
  //排序点击事件 百货商品
  sort: function (e) {
    let that = this;
    util.sort(e.currentTarget.dataset.style, that, function () {
      that.getData(1, that.data._num, 1);
    })
  },

  //更改样式的事件
  changestyle: function () {
    let that = this;
    util.changestyle(that);
  },

  //是否己经收藏店铺
  seekAttent: function (platform) {
    let that = this;
    let pams = {
      token: app.globalData.token, //用户令牌
      shopName: this.data.shopname,
      platform: platform
    }
    util.request(myUrl.mainUrl + 'userShop/ifFocus', pams, 'post', 0, function (res) {
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
        ifFocus: res.data.ifFocus
      })

    })
  },


  //关注
  attent: function () {
    let pams = {
      token: app.globalData.token,
      shopName: this.data.shopname,
      shopPic: this.data.mallDetail.mallImg,
      platform: this.data.platform,
      shopId: this.data.mallId,
    }
    util.request(myUrl.mainUrl + 'userShop/save', pams, 'POST', 0, (res) => {
      if (res.data.result != "OK") {
        wx.showToast({
          title: res.data.result,
          mask: "true",
          icon: 'none',
          duration: 3000
        })
        return;
      }
      wx.showToast({
        title: "己关注",
        mask: "true",
        icon: 'none',
        duration: 3000
      })
      this.setData({
        ifFocus: true
      })
      console.log(this.data.ifFocus)
    })
  },

  //取消关注
  coneself: function () {
    let pams = {
      token: app.globalData.token,
      shopName: this.data.shopname,
      platform: this.data.platform,
      shopId: this.data.mallId
    }
    util.request(myUrl.mainUrl + 'userShop/del', pams, 'POST', 1, (res) => {
      if (res.data.result != "OK") {
        wx.showToast({
          title: res.data.result,
          mask: "true",
          icon: 'none',
          duration: 2000
        })
        return;
      }
      wx.showToast({
        title: "己取消关注",
        mask: "true",
        icon: 'none',
        duration: 2000
      })
      this.setData({
        ifFocus: false
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


  /**
    * 页面相关事件处理函数--监听用户下拉动作
    */
  onPullDownRefresh: function () {
    var that = this;
    that.setData({
      page: 1,
      nomore: false,
      stop: false, //是否停止下拉刷新
    })

    that.getData(1, that.data._num, 1);
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    console.log(that.data.stop);
    if (that.data.stop == true) {
      return
    } else {
      that.setData({
        page: that.data.page + 1
      })

      that.getData(that.data.page, that.data._num,  0);
    }
  },

  onShow: function () {
    let that = this;
    that.getData(1, that.data._num, 1);
    that.setData({
      role: wx.getStorageSync('userMsg').role, //角色代号 0粉丝  
    })
  }
 
})