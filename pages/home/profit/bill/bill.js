var app = getApp()
var myUrl = require("../../../../utils/url.js");
var util = require('../../../../utils/util.js');

Page({
  //页面的初始数据
  data: {
    dataList: [],
    isShow: false,
    p: 1,//页面
  },
  onLoad: function (options) {
    this.getData();

  },
  getData: function (type) {
    var that = this;
    //测试数据
    let pams = {
      token: app.globalData.token,
      p: this.data.p,
      deviceId: "/mini"
    };

    util.request(myUrl.goodsUrl + 'user/r/walletRecord', pams, 'GET', 1 , function (res) {
      console.log(res)
      if (res.data.result != "OK") {
        wx.showToast({
          title: res.data.result,
          icon: 'none',
          duration: 3000,
        })
        return;
      } else if (res.data.list.length == 0) {
        if (type == 99) {
          that.setData({
            isShow: true
          })
          return
        }
        return;
      }

      
      let group = []
      let groupBranch = {}
      groupBranch.list = []


      for (let j = 0; j < res.data.list.length; j++) {
        res.data.list[j].amount = res.data.list[j].amount.toFixed(2)
        res.data.list[j].createTime = util.formatDate(res.data.list[j].createTime)
        //将数组分类
        if (j == 0) {
          let data = res.data.list[0].createTime;
          groupBranch.title = data.slice(0, 4) + "年" + data.slice(5, 7) + "日"
          groupBranch.list.push(res.data.list[0])
        } else if (res.data.list[j - 1].createTime.slice(0, 7) == res.data.list[j].createTime.slice(0, 7)) {//判断是不是同一年同一月  
          //同
          groupBranch.list.push(res.data.list[j])
        } else {
          //不同  先压进group，然后清空 groupBranch,再新建组
          group.push(groupBranch)
          groupBranch = {}
          groupBranch.list = []
          let data = res.data.list[j].createTime;
          groupBranch.title = data.slice(0, 4) + "年" + data.slice(5, 7) + "日"
          groupBranch.list.push(res.data.list[j])
        }
      }
      group.push(groupBranch)


      if (type == 99) {
        that.setData({
          dataList: that.data.dataList.concat(group),  //将现查出的数据合并到以前的数据中
        })
        console.log(that.data.dataList);
      } else {
        console.log(group);
        that.setData({
          dataList: group,  //将现查出的数据覆盖掉以前的数据
        })
      }
    })
  },
  //页面上拉触底事件的处理函数
  onReachBottom: function () {
    if (this.data.isShow) return;

    // 分页，修改页码+1
    this.setData({
      p: this.data.p + 1
    })
    this.getData(99)  //区分分页方法，就是传个参数过去，如果是99，就是分页，没传99，就是普通方法
  },
  //回到顶部
  onPageScroll: function (e) {
    if (e.scrollTop >= 600) {
      this.setData({
        floorstatus: true
      })
    } else {
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
  }
})