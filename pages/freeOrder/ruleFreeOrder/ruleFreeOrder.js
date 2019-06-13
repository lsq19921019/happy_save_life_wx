const app = getApp()
const myUrl = require("../../../utils/url.js");
const util = require('../../../utils/util.js');
Page({
  //页面的初始数据
  data: {
    _type: 0,//初始页面 A级  B级
    page_num: 0,
    data_list:'',
    page_size: 0,
  },
  getDates: function(time){
    let date =getDate(time);
    let M = date.getMonth() + 1;
    let y = date.getFullYear();
    let d = date.getDate();
    let hours = date.getHours();
    let min = date.getMinutes();
    let sec = date.getSeconds();
    return y+'-'+M+'-'+d+' '+hours+':'+min+':'+sec;
  },
  getList: function(p_size,type_){
    var that = this;
    var pams = {
      token: wx.getStorageSync('token'),
      type: type_,
      p: p_size
    }
    util.request(myUrl.mainUrl + 'user/r/getRecord', pams, 'GET', 0, function (res) {
      console.log(res.data);
      if (res.data.result == 'OK') {
        that.setData({
          page_num:res.data.list.length,
          data_list: res.data.list,
          page_size: p_size+1
        });
        // that.setData({
        //   aliNo: res.data.aliAccount,
        //   aliname: res.data.name,
        //   waitDeal: res.data.wd,
        //   amount: res.data.amount,
        //   balance: res.data.balance,
        // })
      }     
    });
  },

  
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    // var that = this;
    // that.setData({
    //   page: 1,
    //   nomore: false,
    //   stop: false, //是否停止下拉刷新
    // })
    // that.getData(1, 1);
    setTimeout(()=>{
      wx.stopPullDownRefresh();
    },500);
  },
  
  onLoad: function (options) {
    // //判断是否登录
    // options = util.isLogin(this, app);
    // if (!options) return; 

    // if (getCurrentPages().length < 2) {
    //   //从其他页面直接跳转过来的，如 分享,  模板消息
    //   this.setData({
    //     ifRootPage: true
    //   })
    // }
    // this.getData(0, 1); 
    wx.setNavigationBarTitle({ title: '规则说明' });// title名 
  },
  // 页面多次渲染
  onShow:function(){
    // this.upgradeStatus()
    this.getList(this.data.page_size,this.data._type);
    wx.setNavigationBarTitle({ title: '规则说明' });// title名 
  },
  tabSwitch: function(e){
    let e_num = e.currentTarget.dataset.style;
    if (this.data._type == e_num) {
        return
      } else if (e_num == 0) {
        this.setData({
          _type: 0,
          page_size: 0
        })
        this.getList(this.data.page_size,0);
      } else if (e_num == 1) {
        this.setData({
          _type: 1,
          page_size: 0
        })
        this.getList(this.data.page_size,1);
      } 
  },
  toHomePage:function(){
    console.log(666666666);
    wx.switchTab({
      url: '/pages/freeOrder/freeOrder'
    })
  }
});