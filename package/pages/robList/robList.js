const app = getApp()
const myUrl = require("../../../utils/url.js");
const util = require('../../../utils/util.js');

Page({
  //页面的初始数据
  data: {
    floorstatus: true,//加载
    noneData: false,//加载
    goodsList: [],//商品例表
    load: 1,//加载框
    st: 1,//分页
    isShow:false
  },
  //生命周期函数--监听页面加载
  onLoad: function (options) {
    this.GetData()
  },
  GetData: function (page) {
    let that = this;
    let list = {};
    list.pageNum = that.data.st;
    list.token = app.globalData.token;
    util.request(myUrl.mainUrl + "goods/cutList", list, 'GET', that.data.load, function (res) {
      if (res.data.result != "OK") {
        wx.showToast({
          title: res.data.result,
          mask: "true",
          icon: 'none',
          duration: 3000
        })
        return;
      }else if (page == 99 && res.data.list.length == 0) {
        that.setData({
          noneData: true
        })
        return;
      } else if (res.data.list.length == 0){
        that.setData({
          isShow:true
        })
      }
      // res.data.list = res.data.list.slice(0, 1)

      //小数点格式化
      for (let j = 0; j < res.data.list.length; j++) {
        res.data.list[j].price = res.data.list[j].price.toFixed(2)
        res.data.list[j].endPrice = res.data.list[j].endPrice.toFixed(2)
        res.data.list[j].couponMoney = res.data.list[j].couponMoney.toFixed(0)
        let c = ""
        res.data.list[j].num == 0 ? c = 0 : c = (res.data.list[j].cutNum / res.data.list[j].num).toFixed(2)
        res.data.list[j].progress = c * 100
        if (c > 0 && c <= 0.1) {
          res.data.list[j].progress_image = "schedule-10"
        } else if (c > 0.1 && c <= 0.2) {
          res.data.list[j].progress_image = "schedule-20"
        } else if (c > 0.2 && c <= 0.3) {
          res.data.list[j].progress_image = "schedule-30"
        } else if (c > 0.3 && c <= 0.4) {
          res.data.list[j].progress_image = "schedule-40"
        } else if (c > 0.4 && c <= 0.5) {
          res.data.list[j].progress_image = "schedule-50"
        } else if (c > 0.5 && c <= 0.6) {
          res.data.list[j].progress_image = "schedule-60"
        } else if (c > 0.6 && c <= 0.7) {
          res.data.list[j].progress_image = "schedule-70"
        } else if (c > 0.7 && c <= 0.8) {
          res.data.list[j].progress_image = "schedule-80"
        } else if (c > 0.8 && c < 1) {
          res.data.list[j].progress_image = "schedule-90"
        } else if (c == 1) {
          res.data.list[j].progress_image = "schedule-100"
        }
      }
      if (page == 99) {
        that.setData({
          goodsList: that.data.goodsList.concat(res.data.list),  //将现查出的数据合并到以前的数据中
        })
      } else {
        that.setData({
          goodsList: res.data.list  //将现查出的数据覆盖掉以前的数据
        })
      }
    })
  },
  //页面上拉触底事件的处理函数
  onReachBottom: function () {
    console.log(wx.getSystemInfoSync().windowHeight)
    if (this.data.noneData) return;
    this.data.load = 0;
    this.data.st++;
    this.GetData(99);
  },
  //回到顶部
  onPageScroll: function (e) {
    if (e.scrollTop >= 50) {
      this.setData({
        floorstatus: false
      })
    } else {
      this.setData({
        floorstatus: true
      })
    }
  },
  backTop: function () {
    wx.pageScrollTo({
      scrollTop: 0,
    })
  }
})