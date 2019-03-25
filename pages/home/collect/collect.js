const app = getApp();
const myUrl = require("../../../utils/url.js");
const util = require("../../../utils/util.js");

Page({
  data: {
    _active: 0,//分类选中
    activeIndex: 0,//当前展示的Tab项索引
    scrollTop: 0,//回到顶部距离



    sysData: {},//是否开启砍价和主题分类
    role: app.globalData.role,//用户角色

    //商品
    goodslist: [],//商品
    gProps: {},//商品发送的参数
    seekNull: false,//商品列表为空时，提示用户
    noneData: false,//下拉没数据时提示
    gStatus: true,//回到顶部图标的显示和隐藏

    //店铺
    storeList: [],//列表
    sProps: {},//商品发送的参数
    sNull: false,//商品列表为空时，提示用户
    sNoData: false,//下拉没数据时提示
    sStatus: true,//回到顶部图标的显示和隐藏

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //商品列表
    let gProps = {
      token: app.globalData.token,
      page: 1,
      deviceId: "/mini"
    };
    this.data.gProps = gProps;
    this.getData(0, 1);

    //店铺
    let sProps = {
      token: app.globalData.token,
      page: 1,
      deviceId: "/mini"
    };
    this.data.sProps = sProps;
    this.getShop(0, 1);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      sysData: app.globalData.sysData,
      role: app.globalData.role
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


  //导航条点击滑动
  cifyClick: function (e) {
    let id = e.currentTarget.dataset.id
    this.setData({
      // scrollPosition: 0,
      _active: id,
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: id
    })
  },


  //联动 让导航跟内容同步
  bindChange: function (e) {
    let that = this;
    let current = e.detail.current;
    wx.createSelectorQuery().select('#dom_' + current).boundingClientRect(function (rect) {
      that.setData({
        activeIndex: current,
        _active: current,
        sliderOffset: rect.left,
      });
    }).exec()
  },

  /* 收藏商品例表
   * page  分页    输入99代表分页
   * load  加载框  是否选择要加载框 0无  1有 
   */
  getData: function (page, load) {
    let that = this;
    util.request(myUrl.goodsUrl + 'userGoods/list', this.data.gProps, 'GET', load, function (res) {
      wx.stopPullDownRefresh()
      if (res.data.result != "OK") {
        wx.showToast({
          title: res.data.result,
          mask: "true",
          icon: 'none',
          duration: 3000
        })
        return;
      } else if (res.data.list.length == 0 && page == 99) {
        that.setData({
          noneData: true
        })
        return
      } else if (res.data.list.length == 0 && page == 100) {
        //上接刷新  没数据时 把页面重置为1并刷新页面
        that.data.page = 1; that.getData(100, 0); return;
      } else if (res.data.list.length == 0){
        that.setData({
          seekNull: true
        })
      }

      //小数点格式化
      for (let j = 0; j < res.data.list.length; j++) {
        res.data.list[j].price = res.data.list[j].price.toFixed(2)
        res.data.list[j].endPrice = res.data.list[j].endPrice.toFixed(2)
        res.data.list[j].couponMoney = res.data.list[j].couponMoney.toFixed(0)
        res.data.list[j].commission = res.data.list[j].commission.toFixed(2)
      }
      if (page == 99) {
        that.setData({
          goodslist: that.data.goodslist.concat(res.data.list),  //将现查出的数据合并到以前的数据中
        })
      } else {
        that.setData({
          goodslist: res.data.list,  //将现查出的数据覆盖掉以前的数据
        })
      }
    })
  },

  //页面跳转
  skip:function(e){
    let id = e.currentTarget.dataset.id;
    let platform = e.currentTarget.dataset.platform;

    console.log(e.currentTarget.dataset.platform);
    console.log(e.currentTarget.dataset.id); 
      wx.navigateTo({
        url: `/pages/details/details?id=${id}&platform=${platform}`
      })
   
  },

  //商品回到顶部
  gScroll: function (e) {
    if (e.detail.scrollTop >= 600) {
      this.setData({
        gStatus: false
      })
    } else {
      this.setData({
        gStatus: true
      })
    }
  },

  backTop: function () {
    this.setData({
      scrollTop: 0
    });
  },



  /* 收藏店铺例表
  * page  分页    输入99代表分页
  * load  加载框  是否选择要加载框 0无  1有 
  */
  getShop: function (page, load) {
    let that = this;
    util.request(myUrl.goodsUrl + 'userShop/list', this.data.sProps, 'GET', load, function (res) {
      console.log(res.data)
      wx.stopPullDownRefresh()
      if (res.data.result != "OK") {
        wx.showToast({
          title: res.data.result,
          mask: "true",
          icon: 'none',
          duration: 3000
        })
        return;
      } else if (res.data.list.length == 0 && page == 99) {
        that.setData({
          sNoData: true
        })
        return
      } else if (res.data.list.length == 0 && page == 100) {
        //上接刷新  没数据时 把页面重置为1并刷新页面
        that.data.page = 1; that.getData(100, 0); return;
      } else if (res.data.list.length == 0) {
        that.setData({
          sNull: true
        })
      }

      if (page == 99) {
        that.setData({
          storeList: that.data.goodslist.concat(res.data.list),  //将现查出的数据合并到以前的数据中
        })
      } else {
        that.setData({
          storeList: res.data.list,  //将现查出的数据覆盖掉以前的数据
        })
      }
    })
  },

  //商品回到顶部
  sScroll: function (e) {
    if (e.detail.scrollTop >= 600) {
      this.setData({
        sStatus: false
      })
    } else {
      this.setData({
        sStatus: true
      })
    }
  },


  //店铺列表上拉刷新
  sDownLoad: function () {
    this.data.sProps.page++;
    this.getShop(99, 0);
  },


  //商品列表上拉刷新
  bindDownLoad: function () {
    this.data.gProps.page++;
    this.getData(99, 0);
  },

})