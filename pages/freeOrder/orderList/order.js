const app = getApp()
const myUrl = require("../../../utils/url.js");
const util = require('../../../utils/util.js');
Page({
  //页面的初始数据
  data: {
    _num: 1,//初始页面 A级  B级
    _num_: 6,
    p: 1,//页面
    dataList: [],
    floorstatus: false,
    queryOederNo: "", //订单查询
    mouthList: [{ "month": "1", "state": "1" }, { "month": "2", "state": "0" }, { "month": "3", "state": "0" }, { "month": "4", "state": "0" }, { "month": "5", "state": "0" }, { "month": "6", "state": "0" }, { "month": "7", "state": "0" }, { "month": "8", "state": "0" }, { "month": "9", "state": "0" }, { "month": "10", "state": "0" }, { "month": "11", "state": "0" }, { "month": "12", "state": "0" }], //月份
    showSlide: true, //是否展示筛选
    showGet: false, //是否可挽回
    getMoney: "",//可挽回的收益数目
    addBg: false,
    lastNum: 0,
    sliderOffset: 600,//右侧弹框滑动效果
    changeNum: 1,//默认显示
    // month: '1',//月份
    month: '',
    platform: '',//默认平台
    msg:'',//可挽回信息
    status:''//订单状态
  },

  onLoad: function (options) {
    //判断是否登录
    options = util.isLogin(this, app);
    if (!options) return; 

    if (getCurrentPages().length < 2) {
      //从其他页面直接跳转过来的，如 分享,  模板消息
      this.setData({
        ifRootPage: true
      })
    }
    this.getData(0, 1);  
  },


  
  getData: function (type,page) { //type==99代表分页
    let that = this;
    let pams = {
      // token: app.globalData.token,
      token: app.globalData.token,
      // token: "mu_e0d4f545-a304-4d40-8998-a06feb93ffb7",
      pageNum: 1,
      // orderNo: "",
      // platform: '',
      // p: that.data.p,
      // level: that.data._num,
      // deviceId: "/mini",
      // year: 2019,
      // month: that.data.month,
      status: that.data._num_==6?'':that.data._num_
    };
   
    util.request(myUrl.goodsUrl + 'pdd/free/order', pams, 'GET', page, function (res) {
      if (res.data.result != "OK") {
        wx.showToast({
          title: res.data.result,
          icon: 'none',
          duration: 3000,
        })
        return;
      }
      console.log(res.data)
      //小数点格式化
      for (let j = 0; j < res.data.list.length; j++) {
        res.data.list[j].price = res.data.list[j].price.toFixed(2)
        res.data.list[j].commission = res.data.list[j].commission.toFixed(2)
        //res.data.list[j].createTime = util.formatDate((res.data.list[j].createTime) * 1000)
      }
      if (type == 99) {
        that.setData({
          dataList: that.data.dataList.concat(res.data.list),  //将现查出的数据合并到以前的数据中
        })
      } else {
        that.setData({
          dataList: res.data.list,  //将现查出的数据覆盖掉以前的数据
        })
      }
    })
  },
  //团队、直属筛选切换tab
  sendNetwork: function (e) {
    let e_num = e.currentTarget.dataset.style;
    if (this.data._num == e_num) {
      return
    } else if (e_num == 1) {
      this.setData({
        _num: 1,
        p: 1
      })
    } else if (e_num == 2) {
      this.setData({
        _num: 2,
        p: 1
      })
    }
    this.getData(0, 0);
  },
  //订单状态筛选切换tab
  sendNetwork_: function (e) {
    let e_num = e.currentTarget.dataset.style;
    if (this.data._num_ == e_num) {
      return
    } else if (e_num == 0) {
      this.setData({
        _num_: 0,
        p: 1
      })
    } else if (e_num == 2) {
      this.setData({
        _num_: 2,
        p: 1
      })
    } else if (e_num == 3) {
      this.setData({
        _num_: 3,
        p: 1
      })
    } else if (e_num == 4) {
      this.setData({
        _num_: 4,
        p: 1
      })
    } else if (e_num == 5) {
      this.setData({
        _num_: 5,
        p: 1
      })
    } else if (e_num == 6) {
      this.setData({
        _num_: 6,
        p: 1
      })
    }
    this.getData(0, 0);
  },
  //返回首页
  toHome: function () {
    wx.reLaunch({
      url: '/pages/freeOrder/freeOrder',
    })
  },
  //回到顶部
  onPageScroll: function (e) {
    if (e.scrollTop >= 300) {
      this.setData({
        floorstatus: true
      })
    } else if (e.scrollTop < 280) {
      this.setData({
        floorstatus: false
      })
    }
  },
  backTop: function () {
    wx.pageScrollTo({
      scrollTop: 0,
    })
  },
  //用户点击右上角分享
  onShareAppMessage: function () {
    return {
      title: '每天有上千种商品更新，众多优质商品汇聚，比线下更实惠',
      imageUrl: "https://bnlnimg.bnln100.com/15.png",
      path: 'pages/index/index?userId=' + app.globalData.user.unionidF
    }
  },
  // 页面多次渲染
  onShow:function(){
    this.upgradeStatus()
  },
  // 订单搜索
  bindBlur: function (e) {
    console.log(e.detail.value)
    let that = this, key = e.detail.value;

    this.setData({
      queryOederNo: key
    })
  },
  
  sendSeek: function (no) {
    let that = this;
    let pams = {
      // token: app.globalData.token,
      token: app.globalData.token,
      
      pageNum: 1,
      // orderNo: that.data.queryOederNo,
      // p: that.data.p,
      // level: that.data._num,
      // deviceId: "/mini",
      // year: '',
      // month: '',
      status: that.data._num_==6?'':that.data._num_
    };
    util.request(myUrl.goodsUrl + 'pdd/free/order', pams, 'GET', "1", function (res) {
      console.log(res.data.list)
      if (res.data.result != "OK") {
        wx.showToast({
          title: res.data.result,
          icon: 'none',
          duration: 3000,
        })
        return;
      }
      that.setData({
        dataList: res.data.list,  //将现查出的数据覆盖掉以前的数据
      })
    })
  },

  // 分类
  showSlide: function () {
    this.setData({
      showSlide: false,
      sliderOffset: 0
    })
    console.log(this.data.sliderOffset)
  },
  // 隐藏筛选
  hideSlide: function () {
    this.setData({
      showSlide: true,
      sliderOffset: 600
    })
  },
  // 查看可挽回收益
  checkGet: function (index) {
    let that = this;
    let num = index.currentTarget.dataset.index
    if (that.data.dataList[num].ifGet != 0) {
      return
    }
    that.setData({
      showGet: true,
      // getNum:
      getMoney: that.data.dataList[num].commission
    })
  },
  showTip: function () {
    this.setData({
      showGet: false,
    })
  },
  // 点击添加背景
  addBg: function (index) {
    let num = index.currentTarget.dataset.add;
    let that = this;
    that.data.mouthList[that.data.lastNum].state = 0
    that.data.mouthList[num].state = 1
    that.setData({
      mouthList: that.data.mouthList,
      month: index.currentTarget.dataset.item,
      lastNum: index.currentTarget.dataset.add
    })
  },
  change: function (num) {
    let ts = this
    let index = num.currentTarget.dataset.num;
    ts.setData({
      changeNum: index,
      platform: num.currentTarget.dataset.type
    })
    console.log(num.currentTarget.dataset)
  },
  // 提交事件
  reset: function () {
    let that = this;
    that.setData({
      changeNum: 1,
      lastNum: 0
    })
    that.data.mouthList.map(function (item, index) {
      that.data.mouthList[index].state = 0;
      that.data.mouthList[0].state = 1
    })
    that.setData({
      mouthList: that.data.mouthList,
    })
  },
  confirm: function () {
    let that = this;
    let pams = {
      // token: app.globalData.token,
      token: app.globalData.token,
      
      pageNum: 1,
      // orderNo: "",
      // p: that.data.p,
      // level: that.data._num,
      // deviceId: "/mini",
      // year: 2019,
      // month: that.data.month,
      // platform: that.data.platform,
      status: that.data._num_==6?'':that.data._num_
    };
    util.request(myUrl.goodsUrl + 'pdd/free/order', pams, 'GET', "1", function (res) {
      console.log(res.data.list)
      if (res.data.result != "OK") {
        wx.showToast({
          title: res.data.result,
          icon: 'none',
          duration: 3000,
        })
        return;
      }
      console.log(res.data)
      that.setData({
        dataList: res.data.list,  //将现查出的数据覆盖掉以前的数据
        sliderOffset: 600,
        showSlide: true,
      })
    })
  },
  // 查看升级信息
  upgradeStatus: function () {
    let that = this;
    let pams = {
      token: app.globalData.token,
    };
    util.request(myUrl.goodsUrl + 'user/r/upgradeStatus', pams, 'GET', "1", function (res) {
      console.log(res.data.msg)
      if (res.data.result != "OK") {
        wx.showToast({
          title: res.data.result,
          icon: 'none',
          duration: 3000,
        })
        return;
      }
      that.setData({
        msg: res.data.msg
      })
    })
  },

onPullDownRefresh:function(){
  this.setData({
    p:  1
  })
  this.getData(1, 0)   //区分分页方法，就是传个参数过去，如果是99，就是分页，没传99，就是普通方法
  wx.stopPullDownRefresh();
},

  //页面上拉触底事件的处理函数
  onReachBottom: function () {
    // 分页，修改页码+1
    this.setData({
      p: this.data.p + 1
    })
    this.getData(99, 0)  //区分分页方法，就是传个参数过去，如果是99，就是分页，没传99，就是普通方法
  },

  handleCopy(e){
    
    wx.setClipboardData({
      data: e.currentTarget.dataset.orderno,
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
            wx.showToast({
              title: '订单号已复制！',
              icon: 'none'
            })
      }
    })
  },
})