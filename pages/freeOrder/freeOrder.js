// pages/atext/atext.js

const app = getApp()
const myUrl = require("../../utils/url.js");
const util = require("../../utils/util.js");
var user = wx.getStorageSync('userMsg');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    e: "", //用于区分是否为web分享
    role: user.role, //用户角色
    arrange: 0, //商品显示样式
    goodslist: [],
    free_order_type: 1,
    progress_rate: 1,
    rate_amount_:60,
    rate_amount:80,
    countTimeNum:10,
    timer:'',
    data_list:[],
    notice_list:[],
    timer_list:[],
    time_now:'',
    canvasImg:'',
    showInfo:false,
    session_key:'',
    goodsInfo:'',
    spreadId:'',
    pid:'',
    noData:true,
    show_layer:false,
    end_time_list:'',
    user_msg:user,
    ifHavaFree:'',
    showHomeBtn:true,
    showShareInfo:true,
    share_name:'暂无信息',
    share_head_img:'暂无信息',
    share_user_id:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log('==============页面参数==================');
    console.log(options);
    console.log('==============页面参数==================');
    if(options.userId){
      this.setData({
        share_user_id:options.userId
      });
      // this.getShareInfo(options.userId);
      // this.getShareInfo(app.globalData.userkey);
    }else if(options.loginParm){
      let o = JSON.parse(options.loginParm);
      this.setData({
        share_user_id:o.userId
      });
      // this.getShareInfo(o.userId);
    }
    if(options.fromhome){
      this.setData({
        showHomeBtn:false
      });
      this.setData({
        showShareInfo:false
      });
    }
    
    // this.setData({
    //   showShareInfo:true
    // });
    this.clearCountTime();
    wx.setNavigationBarTitle({ title: '免单活动'});// title名
    
    // 重写方法，自定义格式化日期
      Date.prototype.toLocaleString = function() {
        // 补0   例如 2018/7/10 14:7:2  补完后为 2018/07/10 14:07:02
        function addZero(num) {
            if(num<10)
                return "0" + num;
            return num;
        }
        // 按自定义拼接格式返回
        return this.getFullYear() + "/" + addZero(this.getMonth() + 1) + "/" + addZero(this.getDate()) + " " +
            addZero(this.getHours()) + ":" + addZero(this.getMinutes()) + ":" + addZero(this.getSeconds());
      };
      // // 根据毫秒数构建 Date 对象
      // var date = new Date(1499996760000);
      // // 按重写的自定义格式，格式化日期
      // dateTime = date.toLocaleString();

      
    let that = this;
    
    // that.ceshi();
    if (getCurrentPages().length < 2) {
      //从其他页面直接跳转过来的，如 分享,  模板消息
      that.setData({
        ifRootPage: true
      })
    }

    if (options.ifFree) {
      that.setData({
        ifFree: options.ifFree,
      })
    }

    //判断是否登录
    options = util.isLogin(this, app);
    if (!options) return;

    //原谅我这写-_-实在想不出，有什么好的办法了->_->
    if (options.scene) {
      util.getParame(options.scene, (props) => {
        options = props;

        //tb  pdd   微选   京东
        if (options.platform == 1 || options.platform == 3) {
          that.setData({
            platform: 1,
          })
        }
        if (options.platform == 2) {
          that.setData({
            platform: 2,
          })

          //猜你喜欢
          util.like(that, app, options); //猜你喜欢
        }
        if (options.platform == 4) {
          that.setData({
            platform: 4,
          })
        }
        if (options.platform == 5) {
          that.setData({
            platform: 5,
          })
        }

        this.data.spreadId = options.id; //商品ID
        this.data.pid = options.pid || ''; // 当扫小程序码进来有pid
        this.data.e = options.e || ''; //用于区分是否为web分享
        this.goodsMsg(options);

      })
      return;
    }


    //tb  pdd   微选   京东
    if (options.platform == 1 || options.platform == 3) {
      that.setData({
        platform: 1,
      })
    }
    if (options.platform == 2) {
      that.setData({
        platform: 2,
      })

      //猜你喜欢
      util.like(that, app, options); //猜你喜欢
    }
    if (options.platform == 4) {
      that.setData({
        platform: 4,
      })
    }
    if (options.platform == 5) {
      that.setData({
        platform: 5,
      })
    }


    that.data.spreadId = options.id; //商品ID
    that.data.pid = options.pid || ''; // 当扫小程序码进来有pid
    that.data.e = options.e || ''; //用于区分是否为web分享
    // that.goodsMsg(options);



    
    //先检查sessionKey
    wx.checkSession({
      success: function () {
        // console.log('sessionKey没过期session_key' + wx.getStorageSync('sessionKey'));
        // that.setData({
        //   session_key: wx.getStorageSync('sessionKey')
        // })
        wx.login({
          success: res => {
            // console.log(res.code)
            let props = {
              jsCode: res.code,
              appid: app.globalData.APPID,
              secret: app.globalData.AppSecret
            }

            //第三方调用的接口
            let ifExt = null;
            app.globalData.ext ? ifExt = 'mini/user/componentOauth' : ifExt = 'mini/user/oauthByAppid';
            util.request(myUrl.userUrl + ifExt, props, "GET", 0, function (res) {
              let iscancel = res.errMsg.split(":")[1]
              if (iscancel != 'ok') {
                wx.showToast({
                  title: res.errMsg,
                  icon: 'none',
                  mask: 'true',
                  duration: 3000,
                })
                return;
              } else {
                console.log('session_key 已经失效,,新的session_key' + res.data.session_key);
                that.setData({
                  session_key: res.data.session_key
                })
              }

            })
          },
          fail: (res) => {
            console.log(res);
            wx.showToast({
              title: res.errMsg,
              icon: 'none',
              mask: 'true',
              duration: 3000,
            })
            return;
          }
        })
      },
      fail: function () {
        wx.login({
          success: res => {
            // console.log(res.code)
            let props = {
              jsCode: res.code,
              appid: app.globalData.APPID,
              secret: app.globalData.AppSecret
            }

            //第三方调用的接口
            let ifExt = null;
            app.globalData.ext ? ifExt = 'mini/user/componentOauth' : ifExt = 'mini/user/oauthByAppid';
            util.request(myUrl.userUrl + ifExt, props, "GET", 0, function (res) {
              let iscancel = res.errMsg.split(":")[1]
              if (iscancel != 'ok') {
                wx.showToast({
                  title: res.errMsg,
                  icon: 'none',
                  mask: 'true',
                  duration: 3000,
                })
                return;
              } else {
                console.log('session_key 已经失效,,新的session_key' + res.data.session_key);
                that.setData({
                  session_key: res.data.session_key
                })
              }

            })
          },
          fail: (res) => {
            console.log(res);
            wx.showToast({
              title: res.errMsg,
              icon: 'none',
              mask: 'true',
              duration: 3000,
            })
            return;
          }
        })


      }

    })



  },

 
 

  

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let that = this;
    this.getShareInfo();
    // this.getShareInfo(options.userId);
    // this.getShareInfo(app.globalData.userkey);
    console.log("roleeeeeeeeeeeee==========="+app.globalData.role+"===========roleeeeeeeeeeeee");
    // wx.showToast({
    //   title: app.globalData.role+'======666666666666666666666',
    //   icon: 'none',
    //   mask: 'true',
    //   duration: 3000,
    // });
    console.log(wx);
    if(app.globalData.role===""||app.globalData.role==0){
      // console.log(app.globalData.role);0:粉丝;1:合伙人;
      that.setData({
        showInfo: true
      });
    }
    // that.setData({
    //   showInfo: true
    // });
    // that.data.data_list.forEach((ele,index)=>{
    //   // let t_fun='data_list['+index+'].t_fun';
    //   clearInterval(that.data.data_list[index].t_fun)
    // });
    that.stepFn().then(function(){that.clearCountTime()}).then(function(){
      
          that.setData({
            time_now:(new Date()).getTime()
          });
          // let that = this;
          // that.setData({
          //   role: wx.getStorageSync('userMsg').role, //角色代号 0粉丝   
          // })
          wx.setNavigationBarTitle({ title: '免单活动'});// title名
          
          // this.countDown();
          that.getData(that.data.free_order_type,1);
    },function(v){
      console.log('6666666');
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    this.clearCountTime();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    this.clearCountTime();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
   

  },
  /**
   * 用户点击右上角分享
   */
  
  //转发好友
  onShareAppMessage: function () {
    let that = this;
    // console.log('userId = ' + app.globalData.user.unionidF + ' & id=' + that.data.spreadId + "&platform=" + that.data.goodsInfo.platform);
    return {
      title: '拼多多免单活动，火热秒杀中！速来~',
      imageUrl: "https://duoyidian.hzinterconn.cn/share_freeorder.png",
      path: '/pages/freeOrder/freeOrder?userId=' + app.globalData.user.unionidF
    }
  },
  
  // 获取小程序链接
  download: function(pid,fid,obj) {
    let that = this;
    var goodsInfo = that.data.goodsInfo;

    // 跳转到拼多多
    let pams = {
      // goodsId: that.data.spreadId,
      goodsId: pid,
      goodsName: obj.goodsName,
      price: obj.price,
      endPrice: obj.endPrice,
      couponMoney: obj.couponMoney,
      ifQw: 0,
      ifBuy: 1,
      goodsImg: obj.goodsPic,
      platform: obj.platform,
      openType: 3,
      deviceId: "/mini",
      pid: that.data.pid, //扫小程序码进来会有pid
      appid: app.globalData.APPID,
      // ifFree: that.data.ifFree || ''
      ifFree: 1,
      goodsFreeId: fid
    };

    that.data.e == '' ? pams.token = app.globalData.token : pams.e = that.data.e;
    console.log(myUrl.goodsUrl);
    // return;
    util.request(myUrl.goodsUrl + 'share/pddPromotion', pams, 'GET', 0, function(res) {
      if (res.data.result != "OK") {
        // wx.showToast({
        //   title: res.data.result,
        //   icon: 'none',
        //   duration: 3000,
        // })

        that.setData({
          wxExtraData: '',
          jupappid: 'wx32540bd863b27570',
        })
        
        return;
      } else {
        that.setData({
          wxExtraData: '',
          jupappid: 'wx32540bd863b27570',
          path: res.data.url
        });
        
        wx.navigateToMiniProgram({
          appId: 'wx32540bd863b27570',
          path: res.data.url,
        })
      }
    })

  },
  checkFree:function(e){
    let that = this;
    // console.log(item);
    console.log(e.currentTarget.dataset.item);
    if(e.currentTarget.dataset.fid){

      let pams = {token:app.globalData.token, goodsFreeId:e.currentTarget.dataset.fid}
      util.request(myUrl.mainUrl + 'pdd/free/check?', pams, 'GET', 1, function(resp) {
        console.log(resp);
        if(resp.data.result==='OK'){
          // wx.navigateTo({
          //   url: '/pages/details/details?id=' + e.currentTarget.dataset.pid + '&platform=2',
          // });

          that.download(e.currentTarget.dataset.pid,e.currentTarget.dataset.fid,e.currentTarget.dataset.item);
          
        }else{
          wx.showToast({
            title: resp.data.result,
            // icon: "success",
            mask: "true",
            icon: 'none',
            duration: 3000
          })
        }
      });
      // return;


    }
  },
// http://129.204.138.152:8093/user/r/getFatherInfo?token=mu_65467097-8c8d-4251-93bf-4d54d15958d0&userId=oeWJc1LNZD12o-CNm909be6ssGMQ
  getShareInfo:function(id_){
    let that = this;
    let pams = {token:app.globalData.token}
    util.request(myUrl.mainUrl + 'user/r/getFatherInfo?', pams, 'GET', 1, function(resp) {
      console.log('============分享人信息================');
      console.log(resp);
      console.log('============分享人信息================');
      if(resp.data.result==='OK'){
        that.setData({
          share_head_img:resp.data.headImg,
          share_name:resp.data.nickName?resp.data.nickName:'暂无信息'
        });
      }
    });
  },
  toRules:function(){
    wx.navigateTo({
      url: '/pages/freeOrder/ruleFreeOrder/ruleFreeOrder',
    });
  },
  // get_dataList:function(){
  //   setTimeout
  // }
  getData:function(type,p_num){
    // token: app.globalData.token
    let that = this;
    // that.setData({
    //   show_layer: true
    // });
    // setTimeout(()=>{
    //   that.setData({
    //     show_layer: false
    //   });
    // },1200);
    that.stepFn().then(function(){
      that.clearCountTime()
      console.log('next');
    }).then(function(){
            if(that.data.notice_list&&that.data.notice_list.length>0){
              that.setData({
                data_list:'',
              });
            }else{
              that.setData({
                data_list:'',
                notice_list:''
              });
            }
            that.setData({
              time_now:(new Date()).getTime()
            });
            let pams = {pageNum:p_num, token:app.globalData.token, statusTime:type}
            util.request(myUrl.mainUrl + 'pdd/free/index?', pams, 'GET', 1, function(resp) {
              console.log(resp);
              if(resp.data.result==='OK'){
                wx.removeStorage({
                  key: 'url_free_order',
                  success: function(res) {
                    console.log(res);
                  },
                });
                wx.removeStorage({
                  key: 'opn_free_order',
                  success: function(res) {
                    console.log(res);
                  },
                });
                that.setData({
                  ifHavaFree:resp.data.ifHavaFree
                });
                
                if(that.data.notice_list&&that.data.notice_list.length>0){
                  that.setData({
                    data_list:resp.data.list,
                  });
                }else{
                  that.setData({
                    data_list:resp.data.list,
                    notice_list:resp.data.noticeList
                  });
                }
                if(that.data.data_list&&that.data.data_list.length>0){
                  that.setData({
                    noData: false
                  });
                }else{
                  that.setData({
                    noData: true
                  });
                }
                if(that.data.free_order_type==1){
                  // let count = 0;
                    let list_time = []; 
                    if(that.data.data_list&&that.data.data_list.length>0){
                      that.data.data_list.forEach((ele,index)=>{
                        list_time.push(that.data.data_list[index].endTime);
                        let time_tmp = null;
                        let end_time='data_list['+index+'].endTime';
                        
                        let sec='data_list['+index+'].sec';
                        let min='data_list['+index+'].min';
                        let hour='data_list['+index+'].hour';
                        let days='data_list['+index+'].days';
                        
                        let t_fun='data_list['+index+'].t_fun';
                        
                        that.setData({
                          [end_time]:that.data.data_list[index].endTime-1000,
                          [t_fun]:timers
                        });
                        
                        that.setData({
                          [sec]:parseInt(((that.data.data_list[index].endTime-that.data.time_now)/1000)%60)<10?'0'+parseInt(((that.data.data_list[index].endTime-that.data.time_now)/1000)%60):parseInt(((that.data.data_list[index].endTime-that.data.time_now)/1000)%60),
                          [min]:parseInt(((that.data.data_list[index].endTime-that.data.time_now)/1000/60)%60)<10?'0'+parseInt(((that.data.data_list[index].endTime-that.data.time_now)/1000/60)%60):parseInt(((that.data.data_list[index].endTime-that.data.time_now)/1000/60)%60),
                          [hour]:parseInt((((that.data.data_list[index].endTime-that.data.time_now)/1000)/3600)%24)<10?'0'+parseInt((((that.data.data_list[index].endTime-that.data.time_now)/1000)/3600)%24):parseInt((((that.data.data_list[index].endTime-that.data.time_now)/1000)/3600)%24),
                          [days]:parseInt((((that.data.data_list[index].endTime-that.data.time_now)/1000)/3600)/24)<10?'0'+parseInt((((that.data.data_list[index].endTime-that.data.time_now)/1000)/3600)/24):parseInt((((that.data.data_list[index].endTime-that.data.time_now)/1000)/3600)/24)
                        });
                        let timers = setInterval(function(){
                          let end_time='data_list['+index+'].endTime';
                          
                          let sec='data_list['+index+'].sec';
                          let min='data_list['+index+'].min';
                          let hour='data_list['+index+'].hour';
                          let days='data_list['+index+'].days';
                          
                          let t_fun='data_list['+index+'].t_fun';
                          
                          that.setData({
                            [end_time]:that.data.data_list[index].endTime-1000,
                            [t_fun]:timers
                          });
                          
                          that.setData({
                            [sec]:parseInt(((that.data.data_list[index].endTime-that.data.time_now)/1000)%60)<10?'0'+parseInt(((that.data.data_list[index].endTime-that.data.time_now)/1000)%60):parseInt(((that.data.data_list[index].endTime-that.data.time_now)/1000)%60),
                            [min]:parseInt(((that.data.data_list[index].endTime-that.data.time_now)/1000/60)%60)<10?'0'+parseInt(((that.data.data_list[index].endTime-that.data.time_now)/1000/60)%60):parseInt(((that.data.data_list[index].endTime-that.data.time_now)/1000/60)%60),
                            [hour]:parseInt((((that.data.data_list[index].endTime-that.data.time_now)/1000)/3600)%24)<10?'0'+parseInt((((that.data.data_list[index].endTime-that.data.time_now)/1000)/3600)%24):parseInt((((that.data.data_list[index].endTime-that.data.time_now)/1000)/3600)%24),
                            [days]:parseInt((((that.data.data_list[index].endTime-that.data.time_now)/1000)/3600)/24)<10?'0'+parseInt((((that.data.data_list[index].endTime-that.data.time_now)/1000)/3600)/24):parseInt((((that.data.data_list[index].endTime-that.data.time_now)/1000)/3600)/24)
                          });
                          console.log(that.data.data_list[index].hour+":"+that.data.data_list[index].min+":"+that.data.data_list[index].sec);
                          
                        },1000);
                      });
                      that.setData({
                        end_time_list: list_time
                      });
                    }
                }else{
                  return;
                }
              }else{
                that.setData({
                  noData: true
                });
              }
            });
    });
  },
  
  //一键复制文本内容
  copyTitle:function(e){
    let self = this;
    let that=self.data;
    let copy_content = '';
    let temp_list = that.shareTextList["s_"+that.shareType];
    if(that.shareType ==='4'){
      copy_content = temp_list.text_1+temp_list.text_2+'点击链接'+that.shareUrl+temp_list.text_3;
    }else{
      copy_content = temp_list.text_1+'点击链接'+that.shareUrl+temp_list.text_2;
    }
        wx.setClipboardData({
          data: copy_content,
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
              title: '操作成功！',
              icon: "success",
              duration: 3000
            })
          },
          fail: function(res) {
            wx.showToast({
              title: '操作失败！',
              icon: "success",
              duration: 3000
            })
          }
        })
  },
  // 关闭canvas
  hideMark: function() {
    this.setData({
      hbImgBl: false,
    })
  },
  showOff: function(){
    let that = this;
    that.setData({
      showInfo:false
    });
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  // showOn: function(e){
  //   let that = this;

  //   //用户取消手机授权直接返回
  //   if (e.detail.iv == undefined && e.detail.encryptedData == undefined) {
  //     return;
  //   }

  //   console.log('升级用的session_key' + that.data.session_key)

  //   let param = {
  //     token: app.globalData.token,
  //     encryptedData: e.detail.encryptedData,
  //     sessionKey: that.data.session_key,
  //     iv: e.detail.iv,
  //     type: 1
  //   }

  //   util.request(myUrl.mainUrl + 'user/updateMobile', param, 'GET', 1, function (res) {
  //     console.log(res);
  //     that.upgrad(res);
  //   })
  // },


  //升级代理
  upgrad: function (res) {
    let that = this;
    console.log(res.data);
    if (res.data.result != "OK") {
      wx.showToast({
        title: res.data.result,
        icon: "none",
        mask: true,
        duration: 3000
      })
      return;
    }

    //数据更新
    app.globalData.user.mobile = res.data.mobile;
    app.globalData.role = res.data.role;
    app.globalData.user.roleName = res.data.roleName;
    app.globalData.user.role = res.data.role;

    //保存在本地缓存
    var user = wx.getStorageSync('userMsg');
    user.mobile = res.data.mobile;
    user.role = res.data.role;
    wx.setStorageSync("userMsg", user)


    that.getUserInfo(); //更新个人信息

    that.setData({
      role: res.data.role
    })

    //返回上一级
    wx.showToast({
      title: '升级成功',
      icon: "none",
      mask: true,
      duration: 2000
    })


  },

  //获取个人信息并更新
  getUserInfo: function () {
    let that = this;
    let pams = {
      token: app.globalData.token,
      appid: app.globalData.APPID,
    }
    util.request(myUrl.mainUrl + 'user/r/get', pams, 'GET', 0, function (res) {
      console.log(res.data)
      if (res.data.result == 'OK') {
        that.setData({
          user: res.data,
          sendMsg:res.data.wxAccount,
          role: res.data.role
        })
       
        var userMsg = res.data; //更新本地缓存
        wx.setStorageSync('userMsg', userMsg);
        app.globalData.user = userMsg; //更新全局
        app.globalData.role = userMsg.role;

        res.data.role > 0 && that.getWallet(); //消费者，不存在钱包
      }
    })




  },
  
  // 用户提现金额
  getWallet: function () {
    let that = this;
    let pams = {
      token: app.globalData.token,
      deviceId: "/mini"
    };
    util.request(myUrl.goodsUrl + 'order/r/stats', pams, 'GET', 0, function (res) {
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
      that.setData({
        totalOrders: res.data.totalOrders, //累计订单数(只计算直属)
        totalCommission: res.data.totalCommission, //累计收益
        totalCheap: res.data.totalCheap, //累计省钱(只计算直属)
        totalCousume: res.data.totalCousume, //累计消费(只计算直属)
        wallet: res.data.wallet, //个人可提现余额
      })
    })
  },
  toOrder: function(){
    let that = this;
    that.stepFn().then(function(){that.clearCountTime()}).then(function(){
      wx.navigateTo({
        url: "/pages/freeOrder/orderList/order"
      })
    });
  },
  toDeposit: function(){
    let that = this;
    that.stepFn().then(function(){that.clearCountTime()}).then(function(){
      wx.navigateTo({
        // url: "/pages/home/deposit/deposit?phone=" + that.data.aliphone + '&wallet=' + that.data.wallet
        url: "/pages/freeOrder/deposit/deposit"
      });
    });
  },
  //升级
  getPhoneNumber: function (e) {
    let that = this;

    that.setData({
      showInfo:false
    });
    //用户取消手机授权直接返回
    if (e.detail.iv == undefined && e.detail.encryptedData == undefined) {
      // that.setData({
      //   showInfo:true
      // });
      return;
    }

    console.log('升级用的session_key' + that.data.session_key)

    let param = {
      token: app.globalData.token,
      encryptedData: e.detail.encryptedData,
      sessionKey: that.data.session_key,
      iv: e.detail.iv,
      type: 1
    }

    util.request(myUrl.mainUrl + 'user/updateMobile', param, 'GET', 1, function (res) {
      that.upgrad(res)
    })

  },
  switchTab: function(e){
    
    let that = this;
    // that.setData({
    //   show_layer:true
    // });
    if(e.currentTarget.dataset.type===that.data.free_order_type){
      return;
    }
    that.setData({
      free_order_type:e.currentTarget.dataset.type
    });
    
    // that.data.data_list.forEach((ele,index)=>{
    //   // let t_fun='data_list['+index+'].t_fun';
    //   clearInterval(that.data.data_list[index].t_fun)
    // });
    that.stepFn().then(function(msg){
      console.log(msg);
      that.clearCountTime();
    }).then(function(){
      // that.setData({
      //   data_list:[]
      // });
      // setTimeout(()=>{
        that.getData(e.currentTarget.dataset.type,1);
      // },1000);
    }).then(function(){
      // setTimeout(function(){
      //   that.setData({
      //     show_layer:false
      //   });
      // },1500);
    });
  },
  stepFn:function(){
    return new Promise(function(resolve){
      resolve(6666);
    });
  },
  clearCountTime:function(){
    let that = this;
      if(that.data.data_list&&that.data.data_list.length>0){
        that.data.data_list.forEach((ele,index)=>{
          // let t_fun='data_list['+index+'].t_fun';
          if(that.data.data_list[index].t_fun){
            clearInterval(that.data.data_list[index].t_fun)
          }
        });
        // setTimeout(()=>{
        //   that.data.data_list.forEach((ele,index)=>{
        //     // let t_fun='data_list['+index+'].t_fun';
        //       clearInterval(that.data.data_list[index].t_fun)
        //   });
        // });
      }
  },
  getTime(time,type){
    let that = this;
    that.data_list.forEach((index,ele)=>{
      let timer = setInterval(function(){
        that.countTime(ele.endTime/1000,type,this);
      }, 1000);
    });
  },
  countTime: function(maxtime,type,obj){
    let minutes = '',
    seconds = '',
    hours = '',
    msg = '',that=this;
          if (maxtime >= 0) {
            minutes = Math.floor(maxtime / 60);
          seconds = Math.floor(maxtime % 60);
          hours = Math.floor(maxtime / 3600);
            msg = "距离结束还有" + hours + "时" + minutes + "分" + seconds + "秒";
            console.log(msg);
      // 12                     document.all["timer"].innerHTML = msg;
      // 13                     if (maxtime == 5 * 60)alert("还剩5分钟");
              ;

              that.setData({
                countTimeNum:--maxtime
              })
              if(type==0){
                return seconds;
                
              }
      } else{
        if(obj){
          clearInterval(obj);
        }
            clearInterval(that.data.timer);
            console.log("时间到，结束!");
        }
  },
  countDown: function(){
    let that=this; //一个小时，按秒计算，自己调整! 
    // let count_time = that.maxtime  
    console.log(that.data.countTimeNum);
        that.data.timer = setInterval(function(){
         that.countTime(that.data.countTimeNum);
        }, 1000);  
  },


  canvasFn: function(e) {
    let that = this;
    
    let pams = {
      token: app.globalData.token,
      // channelType: channelType,
      wxAppid: app.globalData.APPID,
    }
    util.request(myUrl.mainUrl + 'share/getFreePosterUrl?', pams, 'GET', 1, function(resp) {
      console.log(resp);
      if(resp.data.result==='OK'){
        that.setData({
          hbImgBl: true,
          // shareUrl: resp.data.url,
          imageUrl: resp.data.img,

          // hbImg: resp.data.img,
        })
        setTimeout(function() {
          that.saveImageToPhotosAlbum(resp.data.img);
          // console.timeEnd("canvas")
        }, 500)
      }else{
        wx.showToast({
          title: res.data.result,
          mask: "true",
          icon: 'none',
          duration: 3000
        })
      }
    });
  },

  //海报生成
  canvasFn_: function(e) {
    
    // let that = this;
    // let channelType = e.currentTarget.dataset.channeltype;
    // let pams = {
    //   token: app.globalData.token,
    //   // channelType: channelType,
    //   wxAppid: app.globalData.APPID,
    // }
    // util.request(myUrl.mainUrl + 'share/getFreePosterUrl?', pams, 'GET', 1, function(resp) {
    //   console.log(resp);
    //   if(resp.data.result==='OK'){
    //     that.setData({
    //       // shareType: parseInt(e.currentTarget.dataset.channeltype),
    //       hbImgBl: true,
    //       shareUrl: resp.data.url,
    //       imageUrl: resp.data.img,

    //       hbImg: resp.data.img,
    //     })
    //       // wx.showLoading({
    //       //   title: '正在生成海报',
    //       // })
    //   }
    // });
    // console.time("canvas")
//     let that = this;
//     wx.showLoading({
//       title: '正在生成海报',
//     })

//     let ctx = wx.createCanvasContext('myCanvas'); //生成画布
//     let miniCode = "" //判断小程序是否己经下载完毕


//     //下载小程序码
//     let pamss = {
//       type: 2,
//       ifNew: 1,
//       deviceId: "/mini",
//       // token: app.globalData.token,
//       token: app.globalData.token,
//       userId: app.globalData.user.unionidF,
//       goodsId: '',
//       wxAppid: app.globalData.APPID,
//       platform: ''
//     }
//     // console.log(pamss);
//     // return;
//     var path = '';
//     app.globalData.ext ? path = 'share/getJWMiniCode' : path = 'share/getMiniCode';
//     util.request(myUrl.mainUrl + path, pamss, 'GET', 0, function(res) {
//       console.log(res);
//       if (res.data.result != "OK") {
//         wx.showToast({
//           title: res.data.result,
//           icon: 'none',
//           duration: 3000,
//         })
//         return;
//       }

//       wx.downloadFile({
//         url: res.data.img,
//         success: function(res) {
//           miniCode = res.tempFilePath
//         }
//       })
//     })

//     wx.downloadFile({
//       url: "https://bnlnimg.bnln100.com/freeorder_poster.png",
//       success: function(res) {
//         that.setData({
//           canvasImg: res.tempFilePath
//         })
        
//       }
//     })
// // return;
//     // let len = that.data.goodsInfo.price.toString().length; //原价长度
//     // let OriginalPrice = Number(this.data.goodsInfo.price); //原价改为number类型
//     // let OriginalPricewidth = 26 + len * 12 * 0.5; //原价的宽度
//     // let linewidths = 135 + OriginalPricewidth; //横线

//     ctx.setFillStyle('#FFFFFF') //设置填充色
//     ctx.setLineWidth("1") //设置线条的宽度
//     ctx.fillRect(0, 0, 375, 500) //填充一个矩形

//     ctx.setFillStyle("#333333")
//     ctx.setFontSize(16)
//     ctx.lineWidth = 1;
//     // let str = this.data.goodsInfo.goodsName
//     // if (str.length > 32) {
//     //   str = str.substring(0, 32) + '...'
//     // }

//     // that.canvasTextAutoLine('addwwd', ctx, 15, 326, 20) //文字自动调行

//     // ctx.drawImage("../../img/icon_quan.png", 10, 370, 45, 15)
//     // ctx.setFillStyle("#e84d74")
//     // ctx.setFontSize(16)
//     // ctx.fillText('￥' + '', 60, 384)
//     // ctx.setFillStyle("#666666")
//     // ctx.setFontSize(12)
//     // ctx.fillText('原价￥' + '', 130, 383)
//     // ctx.moveTo(130, 378)
//     // ctx.lineTo(0, 378)
//     // ctx.stroke()

//     // ctx.setFillStyle("#666666")
//     // ctx.setFontSize(12)
//     // ctx.fillText('限时限量', 240, 383)

//     // ctx.drawImage("https://duoyidian.hzinterconn.cn/freeorder_poster.png", 0, 0, 375, 500)
//     ctx.drawImage(that.data.canvasImg, 0, 0, 375, 500)
    
//     // ctx.setFontSize(22)
//     // ctx.setFillStyle("#ffffff")
//     // ctx.fillText('' + '元优惠券', 54, 445)

//     // ctx.setFillStyle("#ffffff")
//     // ctx.setFontSize(14)
//     // ctx.fillText('微信内长按二维码领优惠券', 25, 472)
//     ctx.draw(); //画之前清除以前的（清除）

//     let time = setInterval(function() {
//       if (miniCode != '') {
//         clearTimeout(time) //清空定时器
//         if (that.data.canvasImg != '') {
//           ctx.drawImage(that.data.canvasImg, 0, 0, 300, 300) //下载海报
//         }
//         ctx.drawImage(miniCode, 153, 380, 70, 70) //小程序码

//         ctx.draw(true)
//         setTimeout(function() {
//           that.hbImg();
//           // console.timeEnd("canvas")
//         }, 500)
//       }
//     }, 150)

  },

  //保存图片到相册
  saveImageToPhotosAlbum:function(img){
    wx.showLoading({
      title: '加载中',
    });
    let that = this;
    // that.copyTitle();
    wx.downloadFile({
      // url: myUrl.mainUrl + 'share/loadFileByUrl?token=' + app.globalData.token + '&url=' + goodsinfo.goodsImg, //转换成二进制流
      url: that.data.imageUrl, //转换成二进制流
      success: function(res) {
        console.log(res);
        that.setData({
          hbImgBl: true,
          hbImg: res.tempFilePath,
        })
                  wx.saveImageToPhotosAlbum({
                    filePath: res.tempFilePath,
                    success: function() {
                      wx.hideLoading();
                      wx.showToast({
                        title: '分享图已保存',
                        icon: "success",
                        duration: 3000
                      })
                    },
                    fail: function() {
                      wx.hideLoading();
                      wx.getSetting({
                        success: (getSetRes) => {
                          if (!getSetRes.authSetting["scope.writePhotosAlbum"]) {
                            wx.showModal({
                              title: '授权提示',
                              content: '您未授权小程序,将图片保存在你的相册，请点击确定按钮重新授权',
                              success: (showRes) => {
                                if (!showRes.confirm) {
                                  return;
                                }
                                wx.openSetting({
                                  success: () => {
                                    wx.saveImageToPhotosAlbum({
                                      filePath: res.tempFilePath,
                                      success: function() {
                                        wx.showToast({
                                          title: '分享图已保存至相册',
                                          icon: "success",
                                          duration: 3000
                                        })
                                      }
                                    })
                                  }
                                })
                              }
                            })
                          }
                        }
                      })
                    }
                  })
      },
      fail: function() {
        console.log("安全域名问题失败了")
      }
    });
    
  },
  // canvas文字自动调行
  canvasTextAutoLine: function(str, ctx, initX, initY, lineHeight) {
    // var lineWidth = 0;
    // var canvasWidth = 260;
    // var lastSubStrIndex = 0;
    // for (let i = 0; i < str.length; i++) {
    //   lineWidth += 14;
    //   if (lineWidth > canvasWidth - initX) { //减去initX,防止边界出现的问题
    //     ctx.fillText(str.substring(lastSubStrIndex, i), initX, initY);
    //     initY += lineHeight;
    //     lineWidth = 0;
    //     lastSubStrIndex = i;
    //   }
    //   if (i == str.length - 1) {
    //     ctx.fillText(str.substring(lastSubStrIndex, i + 1), initX, initY);
    //   }
    // }
  },
  
  // 分享海报
  hbImg: function() {
    let that = this;

    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      canvasId: 'myCanvas',
      success: function(res) {
        wx.hideLoading();
        that.setData({
          hbImgBl: true,
          hbImg: res.tempFilePath,
        })
        
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function() {
            wx.showToast({
              title: '分享图已保存',
              icon: "success",
              duration: 3000
            })
          },
          fail: function() {
            wx.getSetting({
              success: (getSetRes) => {
                if (!getSetRes.authSetting["scope.writePhotosAlbum"]) {
                  wx.showModal({
                    title: '授权提示',
                    content: '您未授权小程序,将图片保存在你的相册，请点击确定按钮重新授权',
                    success: (showRes) => {
                      if (!showRes.confirm) {
                        return;
                      }
                      wx.openSetting({
                        success: () => {
                          wx.saveImageToPhotosAlbum({
                            filePath: res.tempFilePath,
                            success: function() {
                              wx.showToast({
                                title: '分享图已保存至相册',
                                icon: "success",
                                duration: 3000
                              })
                            }
                          })
                        }
                      })
                    }
                  })
                }
              }
            })
          }
        })
      }
    })
  },

  toHome: function (e) {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },


})