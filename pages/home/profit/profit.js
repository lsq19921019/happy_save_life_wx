const app = getApp()
const myUrl = require("../../../utils/url.js");
const util = require('../../../utils/util.js');

Page({
  data: {
    _num: 1,//初始页面 A级  B级
    wallet: 0,
    stats: "",
    isbool: true,
    isShowToast: false,
    ialiAccountfWd: "",
    newins:'',//文案
    showIns:false,
    typenum:1,//默认数据
    showDraw: false,//是否展示
    getSys: false,//默认是苹果系统
  },



  //页面加载
  onLoad: function (options) {
    this.wire("canvasArc1", 55)
    this.wire("canvasArc2", 50)
    this.getIns();
    // 获取手机系统信息
    this.getSys()
  },
  clickDate: function (e) {
    this.setData({
      isbool: !this.data.isbool
    })
  },

  //监听页面显示
  onShow: function () {
    this.getrequest()
  },


  // 数据请求
  getrequest: function () {
    let ts = this;
    let pams = {
      token: app.globalData.token,
      deviceId: "/mini"
    };
    util.request(myUrl.goodsUrl + 'order/r/stats', pams, 'GET', "1", function (res) {
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

      //测试代码
      // let t = 99;
      // let y = 8000;
      // res.data.totalCommission = 10.1544546464646461355489748
      res.data.totalCommission = res.data.totalCommission.toFixed(2)
      ts.setData({
        stats: res.data,
        wallet: res.data.wallet
      })

      // 累计收益为0时，不执行下面代码
      if (res.data.totalCommission == 0) return;
      let t = res.data.statsInfo.estimate1;// 今日
      let y = res.data.statsInfo.estimate2;// 昨日

      let start = -0.25;
      let end = 1.8;
      if (t != 0 && y != 0) {
        let point = Math.round(t / (t + y) * 100)
        point = (point * 2 / 100) - 0.25//分界点
        point = (1.75 - point) / 2//弧长/2
        start = 0.8 - point;//开始弧长
        end = 0.8 + point;//结束弧长
      }
      //静态圆
      // ts.canvase(start,end);
      // 画动态圆
      let change = start;
      let time = setInterval(() => {
        ts.canvase(start, change);
        change += 0.05;
        if (change >= end) {
          clearInterval(time)
        }
      }, 30)
    })
  },

  //画边框
  wire: function (can, width) {
    // 页面渲染完成  
    var cxt_arc = wx.createCanvasContext(can);//创建并返回绘图上下文context对象。  
    cxt_arc.setLineWidth(1);//设置宽度
    cxt_arc.setStrokeStyle('#F9C0C5');//设置颜色
    cxt_arc.beginPath();//开始一个新的路径  
    cxt_arc.arc(150, 150, width, 0, Math.PI * 2, false);
    cxt_arc.stroke();//对当前路径进行描边  
    cxt_arc.draw(true);
  },


  //画填充内容
  canvase: function (start, end) {
    let price = this.data.stats.statsInfo.estimate2;

    // 页面渲染完成  
    var cxt_arc = wx.createCanvasContext('canvasArc');//创建并返回绘图上下文context对象。  
    cxt_arc.setLineWidth(6);//设置宽度
    cxt_arc.setStrokeStyle('#fff');//设置颜色
    cxt_arc.setLineCap('round')//线条的端点样式
    cxt_arc.beginPath();//开始一个新的路径  
    cxt_arc.arc(150, 150, 52, Math.PI * start, Math.PI * end, false);
    cxt_arc.stroke();//对当前路径进行描边  
    cxt_arc.draw();
  },

  // 检测支付宝
  checkWd: function () {
    let pams = {};
    let ts = this;
    pams.token = app.globalData.token;
    pams.deviceId="/mini"
    util.request(myUrl.goodsUrl + "/user/r/getAli", pams, 'GET', "1", function (res) {
      if (res.data.result != 'OK') {
        wx.showToast({
          title: res.data.result,
          mask: "true",
          icon: 'none',
          duration: 3000,
        })
        return
      }
      ts.setData({
        aliAccount: res.data.aliAccount
      })

      // 支付宝判断
      if (!ts.data.aliAccount) {
        wx.showModal({
          title: '提示',
          mask: "true",
          content: '亲，您还未绑定支付宝，没法提现，是否前往绑定支付宝',
          success: function (res) {
            if (res.confirm) {
              wx.navigateTo({
                url: '/pages/home/setup/Alipay/Alipay'
              })
            } else if (res.cancel) {
              wx.navigateBack({
                data: 1,
              })
            }
          },
        })
        return;
      }
    })
  },

  sendNetwork: function (e) {
    let e_num = e.currentTarget.dataset.style;
    if (this.data._num == e_num) {
      return
    } else if (e_num == 1) {
      this.setData({
        _num: 1,
      })
    } else if (e_num == 2) {
      this.setData({
        _num: 2,
      })
    }
  },
  moontype:function(e){
    let e_num = e.currentTarget.dataset.style;
    if (this.data.typenum == e_num) {
      return
    } else if (e_num == 1) {
      this.setData({
        typenum: 1,
      })
    } else if (e_num == 2) {
      this.setData({
        typenum: 2,
      })
    }
  },
  // 获取文案
  getIns: function () {
    let that=this;
    let pams = {
      insid: 113,
      token: app.globalData.token,
      deviceId: "/mini"
    }
    util.request(myUrl.goodsUrl + 'sys/ins', pams, 'GET', "1", function (res) {
      that.setData({
        newins: res.data.content
      })
    })
  },
  // 
  askLost:function(){
    this.setData({
      showIns: true
    })
  },
  hiddenIns:function(){
    this.setData({
      showIns:false
    })
  },
  // 展示提现提醒
  showDraw: function () {
    let that = this;
    that.setData({
      showDraw: !that.data.showDraw
    })
  },
  // 获取手机系统信息
  getSys: function () {
    let that = this;
    wx.getSystemInfo({
      success: function (res) {
        let reg = /iOS/i;
        if (reg.test(res.system)) {
          that.setData({
            getSys: true
          })
          console.log(res.system)
        }
      }
    })
  },


  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
  },
})