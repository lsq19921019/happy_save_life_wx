const myUrl = require("../../../../utils/url.js");
const util = require('../../../../utils/util.js');
const app = getApp();
Page({
  //页面的初始数据
  data: {
    _num: 1, //默认
    teamData: {},//团队数据
    pams: {},//参数
    nickName: '',//搜索的用户名
    opt: '不被选中',//选中
    floorstatus: true,//回到顶部图标显示和隐藏
    noneData: false,//下拉没数据时提示
    no_repeat: true,
    showTeam: true, //团队
    showChange: true, //粉丝
    teamState: { firsts: 1000 },//团队分析
    teamsNum: '',
    barline: '', //横线高度
    getNum: '',//参数回调
    scene: false,//场景值是否显示回到首页
    mouthList: [{ "month": "1", "state": "1" }, { "month": "2", "state": "0" }, { "month": "3", "state": "0" }, { "month": "4", "state": "0" }, { "month": "5", "state": "0" }, { "month": "6", "state": "0" }, { "month": "7", "state": "0" }, { "month": "8", "state": "0" }, { "month": "9", "state": "0" }, { "month": "10", "state": "0" }, { "month": "11", "state": "0" }, { "month": "12", "state": "0" }], //月份
    addBg: false,
    lastNum: 0,
    sliderOffset: 600,//右侧弹框滑动效果
    changeNum: 1,//默认显示
    month: '1',//月份
    platform: 5,//默认平台
    showSlide: true, //是否展示筛选
    newIndex: 0,//
    ranking: [{ "grading": "新贵", "state": "1" }, { "grading": "青铜", "state": "0" }, { "grading": "白银", "state": "0" }, { "grading": "黄金", "state": "0" }, { "grading": "铂金", "state": "0" }, { "grading": "钻石", "state": "0" }, { "grading": "王者", "state": "0" }, { "grading": "顶级", "state": "0" }],//段位
    level: 0,//默认查询段位
    proxyLevel: 1,//
    leve: 1,//
    nums: '',//团队
    firstNums: ''//直属用户的数量
  },

  //监听页面加载
  onLoad: function (options) {
    let that = this;
    //判断是否登录
    options = util.isLogin(this, app);
    if (!options) return;
    
    wx.setNavigationBarTitle({ title: options.name })//设置标题

    let pams = {
      token: app.globalData.user.token,
      deviceId: "/mini"
    }
    let num;
    if (!options.nums){
      num = options.nums - options.firstNums
    }else{
      num=0
    }
    that.setData({
      leve: options.leve,
      nums: num,
      firstNums: options.firstNums
    })

    that.start();
  },
  start: function () {
    let that = this;
    this.setData({
      scene: app.globalData.scene
    })
    let pams = {
      token: app.globalData.token,
      nickName: '', //昵称
      type: '',//0:消费者 1:代理
      p: 1,//分页
      deviceId: "/mini",
      proxyLevel: that.data.leve,//代理级别
      level: '',//查询分销级别 
      year: '',//年份
      month: '',//月份
    };
    that.data.pams = pams;
    that.dataLoad(1, 0);
  },

  //直属团队
  dataLoad: function (load, pag) {//pag分页 99
    let that = this;
    util.request(myUrl.mainUrl + "user/r/team", this.data.pams, 'POST', load, function (res) {
      if (res.data.result != "OK") {
        wx.showToast({
          title: res.data.result,
          icon: 'none',
          duration: 3000,
        })
        return
      } else if (res.data.list.length == 0 && pag == 99) {
        that.setData({
          noneData: true
        })
        return;
      }
      if (pag == 99) {
        that.data.teamData.list.concat(res.data)
        that.setData({
          teamData: that.data.teamData
        })
      } else {
        that.setData({
          teamData: res.data
        })
      }
    })
  },
  team: function (e) {
    let ts = this;
    if (e.target.dataset.index == 1) {
      ts.setData({
        showTeam: true
      })
    } else {
      ts.setData({
        showTeam: false
      })
    }

  },
  //获取用户输入的信息
  userInput: function (e) {
    this.setData({
      nickName: e.detail.value
    })
  },
  //发送用户按索的内容到服务器
  sendMsg: function () {
    if (!this.data.no_repeat) return;
    this.data.no_repeat = false;
    setTimeout(() => {
      this.data.no_repeat = true;
    }, 500)

    this.setData({
      opt: ''
    })
    this.data.pams.nickName = this.data.nickName,
      this.data.pams.type = '',
      this.data.pams.p = 1
    this.dataLoad(1, 0);
  },
  //按粉丝还是合伙人查找
  seek: function (e) {
    let eid = e.currentTarget.dataset.id
    if (eid == this.data.opt) {
      return;
    }
    //把搜索内容先清空，才按粉丝还是代理查找
    this.setData({
      nickName: "",
      opt: eid,
      noneData: false
    })
    let pams = {
      token: app.globalData.token,
      nickName: '', //昵称
      type: eid,//0:消费者 1:代理
      p: 1,//分页
      deviceId: "/mini",
      proxyLevel: this.data.leve,//代理级别
      level: eid,//查询分销级别 
      year: '',//年份
      month: '',//月份
    }
    this.data.pams = pams;
    this.dataLoad(1, 0);
  },

  //上拉刷新
  onReachBottom: function () {
    this.data.pams.p = this.data.pams.p + 1
    this.dataLoad(0, 99);
  },

  //回到顶部
  onPageScroll: function (e) {
    if (e.scrollTop >= 300 && e.scrollTop < 500) {
      this.setData({
        floorstatus: false
      })
    } else if (e.scrollTop <= 300) {
      this.setData({
        floorstatus: true
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
  sendNetwork: function (e) {
    let e_num = e.currentTarget.dataset.style;
    if (this.data._num == e_num) {
      return
    } else if (e_num == 1) {
      this.setData({
        _num: 1,
        showChange: true
      })
    } else if (e_num == 2) {
      this.setData({
        _num: 2,
        showChange: false
      })
    }
  },
  onReady: function () {
  },
  onShow: function () {
    // 计算barline 高度
    let that = this;
    wx.getSystemInfo({
      success: function (res) {
        if (res.pixelRatio == 2 && res.windowWidth < 350) {
          console.log(1111)
          that.setData({
            barline: ["lin5", 'pieCir5', 'coverHeight5']
          })
        } else if (res.pixelRatio == 2 && res.windowWidth > 350) {

          that.setData({
            barline: ["lin6", 'pieCir6', 'coverHeight5']
          })
        } else if (res.windowWidth > 410) {
          that.setData({
            barline: ["linx", 'pieCirx', 'coverHeight5']
          })
          console.log(res.pixelRatio)
        } else if (res.windowWidth = 360 || res.pixelRatio == 3) {
          that.setData({
            barline: ["lin6", 'pieCirN5', 'coverHeight5']
          })
        } else {
          that.setData({
            barline: ["lin6", 'pieCirx', 'coverHeight5']
          })
        }
      }
    })
  },

})