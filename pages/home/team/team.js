import * as echarts from '../../../ec-canvas/echarts';

function setOption(chart) {
  const option = {
    backgroundColor: "#ffffff",
    color: ["#c210fe", "#634ce5"],
    series: [{
      label: {
        normal: {
          fontSize: 12,
          color: "black"
        }
      },
      
      labelLine: {
        show: true,
        length: 10,
        length2: 10,
        // smooth:1,
      },
      clickable: false,
      type: 'pie',
      center: ['50%', '50%'],
      radius: ['60%', '70%'],
      data: [],
      itemStyle: {
        emphasis: {
          shadowBlur: 8,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 2, 2, 0.3)'
        }
      }
    }]
  };
  chart.setOption(option);
}


const myUrl = require("../../../utils/url.js");
const util = require('../../../utils/util.js');
const app = getApp();
Page({
  //页面的初始数据
  data: {
    _num: 1, //默认
    teamData: {}, //团队数据
    teamList:[],
    pams: {}, //参数
    nickName: '', //搜索的用户名
    opt: '不被选中', //选中
    floorstatus: true, //回到顶部图标显示和隐藏
    noneData: false, //下拉没数据时提示
    no_repeat: true,
    showTeam: true, //团队
    showChange: true, //粉丝
    teamState: {
      firsts: 1000
    }, //团队分析
    otherChart: {
      lazyLoad: true //延迟加载
    },
    teamsNum: '',
    barline: '', //横线高度
    getNum: '', //参数回调
    scene: false, //场景值是否显示回到首页
    mouthList: [{
      "month": "1",
      "state": "1"
    }, {
      "month": "2",
      "state": "0"
    }, {
      "month": "3",
      "state": "0"
    }, {
      "month": "4",
      "state": "0"
    }, {
      "month": "5",
      "state": "0"
    }, {
      "month": "6",
      "state": "0"
    }, {
      "month": "7",
      "state": "0"
    }, {
      "month": "8",
      "state": "0"
    }, {
      "month": "9",
      "state": "0"
    }, {
      "month": "10",
      "state": "0"
    }, {
      "month": "11",
      "state": "0"
    }, {
      "month": "12",
      "state": "0"
    }], //月份
    addBg: false,
    lastNum: 0,
    sliderOffset: 600, //右侧弹框滑动效果
    changeNum: 1, //默认显示
    month: '1', //月份
    platform: 5, //默认平台
    showSlide: true, //是否展示筛选
    newIndex: 0, //
    ranking: [{
      "grading": "新贵",
      "state": "1"
    }, {
      "grading": "青铜",
      "state": "0"
    }, {
      "grading": "白银",
      "state": "0"
    }, {
      "grading": "黄金",
      "state": "0"
    }, {
      "grading": "铂金",
      "state": "0"
    }, {
      "grading": "钻石",
      "state": "0"
    }, {
      "grading": "王者",
      "state": "0"
    }, {
      "grading": "顶级",
      "state": "0"
    }], //段位
    level: 0, //默认查询段位
    proxyLevel: 1, //
    showAsk: false, //文案显示

    newIns: '', //文案内容
    Gf: false, //判断用户是否有上传二维码
    shoeGf: false, //展示好友添加情况
    sendName: '' //发送信息的名字



  },
  //返回首页
  toHome: function () {
    wx.reLaunch({
      url: '/pages/index/index',
    })
  },
  //监听页面加载
  onLoad: function(options) {
    let that = this;
    //判断是否登录
    options = util.isLogin(this, app);
    if (!options) return;

    that.start();

    if (getCurrentPages().length < 2) {
      //从其他页面直接跳转过来的，如 分享,  模板消息
      that.setData({
        ifRootPage: true
      })
    }
    // ifQueryUnite：2是城市合伙人
    that.setData({
      ifQueryUnite: options.ifQueryUnite
    })

    // 文案
    // that.getIns()
   //团队报表数据 
    // setTimeout(function() {
    //   that.init()
    // }, 500)
  },
  onReady: function() {
    // 获取组件
    this.ecComponent = this.selectComponent('#mychart-dom-pie');
  },
  init: function() {
    let that = this;
    that.ecComponent.init((canvas, width, height) => {
      // 获取组件的 canvas、width、height 后的回调函数
      // 在这里初始化图表
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height
      });
      let funOtherChart = chart;
      setOption(chart);
      //图表数据对接
      let pams = {
        token: app.globalData.token,
        deviceId: "/mini"
      }
      util.request(myUrl.mainUrl + "user/r/teamState", pams, 'POST', 1, function(res) {
        if (res.data.result != "OK") {
          wx.showToast({
            title: res.data.result,
            icon: 'none',
            duration: 3000,
          })
          return
        }
        let list = res.data.state.levelStateList
        // css+js
        list.map(function(item, index) {
          if (item.scale != 0) {
            res.data.state.levelStateList.height = item.scale
          }
        })
        that.setData({
          teamState: res.data.state,
          teamsNum: res.data.state.teams + res.data.state.firsts,
          levelStateList: res.data.state.levelStateList
        })

        if (res.data.state.levelStateList.length != 0) {
          let levelStateList = res.data.state.levelStateList,
            otherArrList = res.data.state;
          if (otherArrList.teams == 0) {
            funOtherChart.setOption({
              color: ["#634ce5"],
              series: [{
                data: [{
                  value: otherArrList.firsts,
                  name: "直属用户" + otherArrList.firsts + "人" + "-" + ((res.data.state.firsts / that.data.teamsNum) * 100).toFixed(0) + '%'
                }, ]
              }]
            })
          } else if (otherArrList.firsts == 0) {
            funOtherChart.setOption({
              color: ["#c210fe"],
              series: [{
                data: [{
                    value: otherArrList.teams,
                    name: "团队用户" + otherArrList.teams + "人" + "-" + ((res.data.state.teams / that.data.teamsNum) * 100).toFixed(0) + '%'
                  },

                ]
              }]
            })
          } else {
            funOtherChart.setOption({
              color: ["#c210fe", "#634ce5"],
              series: [{
                data: [{
                    value: otherArrList.teams,
                    name: "团队用户" + otherArrList.teams + "人" + "-" + ((res.data.state.teams / that.data.teamsNum) * 100).toFixed(0) + '%'
                  },
                  {
                    value: otherArrList.firsts,
                    name: "直属用户" + otherArrList.firsts + "人" + "-" + ((res.data.state.firsts / that.data.teamsNum) * 100).toFixed(0) + '%'
                  },
                ]
              }]
            })
          }
        }
      })

      // 将图表实例绑定到 this 上，可以在其他成员函数（如 dispose）中访问
      this.chart = chart;
      // 注意这里一定要返回 chart 实例，否则会影响事件处理等
      return chart;
    });




  },
  start: function() {
    let that = this;
    this.setData({
      scene: app.globalData.scene || false
    })
    let untine;
    if (that.data.ifQueryUnite == 2) {
      untine = that.data.ifQueryUnite
    } else {
      untine = ''
    }

    let pams = {
      token: app.globalData.token,
      nickName: '', //昵称
      type: '', //0:消费者 1:代理
      p: 1, //分页
      deviceId: "/mini",
      proxyLevel: '', //代理级别
      level: "", //查询分销级别 
      year: '', //年份
      month: '', //月份
      ifQueryUnite: untine
    };
    that.data.pams = pams;
    
    that.dataLoad(1, 0);
  },

  //直属团队
  dataLoad: function(load, pag) { //pag分页 99
    
    let that = this;
    util.request(myUrl.mainUrl + "user/r/team", this.data.pams, 'POST', load, function(res) {
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
        that.setData({
          countNormal: res.data.countNormal,
          countProxy: res.data.countProxy,
          teamList: that.data.teamList.concat(res.data.list)
        })
      } else {
        that.setData({
          countNormal: res.data.countNormal,
          countProxy: res.data.countProxy,
          teamList: res.data.list
        })
      }
    })
  },

  team: function(e) {
    let ts = this;
    if (e.target.dataset.index == 1) {
      ts.setData({
        showTeam: true
      })
    }
    if (e.target.dataset.index == 2) {
      ts.setData({
        showTeam: false

      })
      setTimeout(function() {
        ts.init()
      }, 500)
    }
  },
  //获取用户输入的信息
  userInput: function(e) {
    this.setData({
      nickName: e.detail.value
    })
  },
  //发送用户按索的内容到服务器
  sendMsg: function() {
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
  seek: function(e) {
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
      type: eid, //0:消费者 1:代理
      p: 1, //分页
      deviceId: "/mini",
      proxyLevel: '', //代理级别
      level: '', //查询分销级别 
      year: '', //年份
      month: '', //月份
    }
    
    this.data.pams = pams;
    this.dataLoad(1, 0);
  },


  //上拉刷新
  onReachBottom: function() {
    this.data.pams.p = this.data.pams.p + 1
    this.dataLoad(0, 99);
  },


  //回到顶部
  onPageScroll: function(e) {
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

  backTop: function() {
    wx.pageScrollTo({
      scrollTop: 0,
    })
  },

  sendNetwork: function(e) {
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


  onShow: function() {
    // 计算barline 高度
    let that = this;
   // that.dataLoad(1, 0);
    wx.getSystemInfo({
      success: function(res) {
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

    //判断用户是否有上传二维码
    if (app.globalData.user.wxEwm != '') {
      that.setData({
        Gf: true
      })
    }
  },
  change: function(index) {
    let num = index.currentTarget.dataset.num;
    let that = this;
    that.data.ranking[that.data.newIndex].state = 0
    // that.setData({
    //   newIndex: index.currentTarget.dataset.num
    // })
    that.data.ranking[num].state = 1
    that.setData({
      ranking: that.data.ranking,
      level: index.currentTarget.dataset.item,
      newIndex: index.currentTarget.dataset.num,
      proxyLevel: index.currentTarget.dataset.num + 1
    })
    console.log(index.currentTarget.dataset.num + 1)
  },

  // 提交事件
  // reset: function() {
  //   let that = this;
  //   that.data.mouthList.map(function(item, index) {
  //     that.data.mouthList[index].state = 0;
  //     that.data.mouthList[0].state = 1
  //   })
  //   that.data.ranking.map(function(item, index) {
  //     that.data.ranking[index].state = 0;
  //     that.data.ranking[0].state = 1
  //   })
  //   that.setData({
  //     mouthList: that.data.mouthList,
  //     ranking: that.data.ranking,
  //     newIndex: 0,
  //     lastNum: 0
  //   })

  // },

  // 隐藏筛选
  // hideSlide: function() {
  //   this.setData({
  //     showSlide: false,
  //     sliderOffset: 600
  //   })
  // },
  // 分类
  // showSlide: function() {
  //   this.setData({
  //     showSlide: true,
  //     sliderOffset: 0
  //   })
  // },

  // 点击添加背景
  // addBg: function(index) {
  //   let num = index.currentTarget.dataset.add;
  //   let that = this;
  //   that.data.mouthList[that.data.lastNum].state = 0
  //   that.setData({
  //     lastNum: index.currentTarget.dataset.add
  //   })
  //   that.data.mouthList[num].state = 1
  //   that.setData({
  //     mouthList: that.data.mouthList,
  //     month: index.currentTarget.dataset.item,

  //   })
  // },


  // 提交
  // confirm: function(e) {
  //   let that = this;
  //   let pams = {
  //     token: app.globalData.token,
  //     nickName: '', //昵称
  //     type: '', //0:消费者 1:代理
  //     p: 1, //分页
  //     deviceId: "/mini",
  //     proxyLevel: that.data.proxyLevel, //代理级别
  //     level: 0, //查询分销级别 
  //     year: 2018, //年份
  //     month: that.data.month, //月份
  //   }
  //   that.data.pams = pams;
  //   that.dataLoad(1, 0);
  //   that.setData({
  //     showSlide: true,
  //     sliderOffset: 600,
  //     opt: '3', //选中状态
  //   })
  //   console.log(that.data.opt)
  // },

  // 段位查看
  // sendLevel: function(e) {
  //   let pams = (e.currentTarget.dataset.level) + 1;
  //   let name = e.currentTarget.dataset.name //角色
  //   let nums = e.currentTarget.dataset.nums //总数
  //   let firstNums = this.data.levelStateList[pams - 1].firstNums //直属
  //   wx.navigateTo({
  //     url: '/pages/home/team/myTeam/myteam?leve=' + pams + '&name=' + name + '&nums=' + nums + '&firstNums=' + firstNums,
  //   })
  // },

  // showAsk: function(insId) {
  //   console.log(insId.currentTarget.dataset.insid)
  //   this.setData({
  //     showAsk: !this.data.showAsk
  //   })
  // },


  // 文案
  // getIns: function() {
  //   let that = this;
  //   let pams = {
  //     insid: 114,
  //     token: app.globalData.token,
  //     deviceId: "/mini"
  //   }
  //   util.request(myUrl.goodsUrl + 'sys/ins', pams, 'GET', "1", function(res) {
  //     that.setData({
  //       newIns: res.data.content
  //     })
  //   })
  // },

  // 绑定关系
  // reject: function(e) {
  //   let that = this;
  //   let slect = this.data.teamData.list[e.currentTarget.dataset.id]
  //   //用户上传二维码
  //   if (!that.data.Gf) {
  //     this.setData({
  //       shoeGf: !this.data.shoeGf,
  //       sendName: slect.wxNickName
  //     })
  //     return;
  //   };

  //   //用户己经上传二维码，才发送消息
  //   let pams = {
  //     userId: slect.id,
  //     token: app.globalData.token
  //   }
  //   util.request(myUrl.mainUrl + 'user/sendMsm', pams, 'GET', 1, (res) => {
  //     if (res.data.result != "OK") {
  //       wx.showToast({
  //         title: res.data.result,
  //         icon: 'none',
  //         duration: 3000,
  //       })
  //       return
  //     }
  //     this.setData({
  //       shoeGf: !this.data.shoeGf,
  //       sendName: slect.wxNickName
  //     })
  //   })
  //   // this.setData({
  //   //   shoeGf: !this.data.shoeGf,
  //   //   sendName: slect.wxNickName
  //   // })
  // },


  //关闭弹窗
  closeRej: function() {
    this.setData({
      shoeGf: !this.data.shoeGf
    })
  },

  //用户点击右上角分享
  onShareAppMessage: function() {
    this.setData({
      shoeGf: false
    })
    return {
      title: '每天有上千种商品更新，众多优质商品汇聚，比线下更实惠',
      imageUrl: "https://bnlnimg.bnln100.com/15.png",
      path: 'pages/index/index?userId=' + app.globalData.user.unionidF
    }
  },

// 复制微信号
  copy: function(e) {
    var con = e.currentTarget.dataset.wx;
    var id = e.currentTarget.dataset.id;
    var wxNickName = e.currentTarget.dataset.wxh;
    if (con == '') {
      wx.showModal({
        title: '提示',
        content: '您的粉丝尚未绑定微信号，是否需要发送一条消息通知' + wxNickName,
        success(res) {
          if (res.confirm) {
            let pams = {
              userId: id,
              token: app.globalData.token
            }
            util.request(myUrl.mainUrl + 'user/sendMsmByWarn', pams, 'GET', 1, (res) => {
              if (res.data.result != "OK") {
                wx.showToast({
                  title: res.data.result,
                  icon: 'none',
                  duration: 3000,
                })
                return
              }

              wx.showToast({
                title: '发送成功',
                icon: 'none'
              })

            })

          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
      return;
    }
    util.copy(con, function() {
      wx.hideToast();
      wx.showToast({
        title: '微信号已复制，快去添加好友吧',
        icon: 'none'
      })
    })
  }

})