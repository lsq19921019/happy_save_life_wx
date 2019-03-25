const myUrl = require("../../../../utils/url.js");
const util = require('../../../../utils/util.js');
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    headimg: '',//用户头像
    statsInfo: '',
    name: '',//用户名
    totalCheap: '',//累计省钱(只计算直属)
    totalCommission: '',//累计收益
    totalCousume: '',//累计消费(只计算直属)
    totalLoss: '',//累计损失收益
    totalOrders: '',//累计订单数(只计算直属)
    createTime: '',//注册时间
    firstFans: '',//直属粉丝
    firstProxys: '',//直属合伙人
    teamFans: '',//团队粉丝
    teamProxys: '',//团队合伙人
    upgradeTime:'',//升级时间
    mobile:'',//手机号码
    timeType:'',//是否存在升级时间
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options.point)
    let that = this;
    let pams = {
      token: app.globalData.token,
      userId: options.point
    }
    console.log(options)
    // 获取用户信息1
    util.request(myUrl.mainUrl + "order/r/stats", pams, 'GET', 0, function (res) {
      if (res.data.result != "OK") {
        wx.showToast({
          title: res.data.result,
          icon: 'none',
          duration: 3000,
        })
        return
      }
      that.setData({
        statsInfo: res.data.statsInfo,
        totalCheap: res.data.totalCheap,//累计省钱(只计算直属)
        totalCommission: res.data.totalCommission,//累计收益
        totalCousume: res.data.totalCousume,//累计消费(只计算直属)
        totalLoss: res.data.totalLoss,//累计损失收益
        totalOrders: res.data.totalOrders,//累计订单数(只计算直属)
        createTime: options.time,//注册时间
        firstFans: res.data.firstFans,//直属粉丝
        firstProxys: res.data.firstProxys,//直属合伙人
        teamFans: res.data.teamFans,//团队粉丝
        teamProxys: res.data.teamProxys,//团队合伙人
      })//
      console.log(res)
    })

    
    // 获取用户信息2
    util.request(myUrl.mainUrl + "user/r/get2", pams, 'GET', 0, function (res) {
      if (res.data.result != "OK") {
        wx.showToast({
          title: res.data.result,
          icon: 'none',
          duration: 3000,
        })
        return
      }
      let time,tp;
      if (res.data.upgradeTime!=undefined){
        time = util.formatDate(res.data.upgradeTime).slice(0, 10)
        tp=true
      }else{
        time=''
        tp=false
        console.log(res.data.upgradeTime)
      }
     
      that.setData({
        headimg: res.data.headImg,
        name: res.data.wxNickName,
        upgradeTime:time ,
        timeType:tp,
        mobile: res.data.mobile
      })
      console.log(res.data.upgradeTime,"时间")
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '每天有上千种商品更新，众多优质商品汇聚，比线下更实惠',
      imageUrl: "https://bnlnimg.bnln100.com/15.png",
      path: 'pages/index/index?userId=' + app.globalData.user.unionidF
    }
  }
})