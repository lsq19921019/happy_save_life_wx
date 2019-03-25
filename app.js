const util = require('utils/util.js');
const aldstat = require("./utils/ald-stat.js");

App({

  onLaunch: function (data) {
    const updateManager = wx.getUpdateManager()

    updateManager.onCheckForUpdate(function (res) {
      // 请求完新版本信息的回调
      console.log("版本=>"+res.hasUpdate)
    })

    updateManager.onUpdateReady(function () {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        showCancel:false,
        success: function (res) {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })

    updateManager.onUpdateFailed(function () {
      // 新版本下载失败
      wx.showModal({
        title: '更新提示',
        content: '新版本下载失败',
        showCancel: false
      })
    })
    //获取第三方自定义数据字段的同步接口。
    let extConfig = wx.getExtConfigSync ? wx.getExtConfigSync() : {}
    console.log(extConfig);
    
    // 第三方要的tabbar参数
    this.globalData.tabbar1 = extConfig.param_1;
    this.globalData.tabbar2 = extConfig.param_2;
    this.globalData.tabbar3 = extConfig.param_3;

    extConfig.extAppid ? this.globalData.ext = true : this.globalData.ext = false;
    this.globalData.APPID = extConfig.extAppid || 'wx8b5df949020cb310';
    this.globalData.AppSecret = extConfig.appSecret ||'453a596f847f5ce53d9ac63cc8e43157';
    this.globalData.partnerId = extConfig.partnerId || 88888;

    console.log(extConfig.title)
    this.globalData.title = extConfig.title|| "首页";  //标题
    this.globalData.ins = extConfig.ins|| "网购上，省钱又赚钱";   //描述
    // this.globalData.headImg = extConfig.headImg || "";   
    this.globalData.headImg = extConfig.headImg || "http://wx.qlogo.cn/mmopen/Q3auHgzwzM6sLMdPaD6nM3JdrYP5nKEQr27V2MXYxZ5aibkN7A5pxlCnXic1LibycLK7dEmUdMyXnGvM9GwG9Qu2Sutsjib7q1adRKEbxTuiaxdA/0";   

    //从本地获取用户user、role、token 
    let user = wx.getStorageSync('userMsg');
    let token = wx.getStorageSync('token');
    this.globalData.user = user||'';
    this.globalData.role = user.role||'';
    this.globalData.token = token||'';
  },

  //小程序跳转
  onShow: function (props) {
    this.globalData.return = 'a';
    if (props.referrerInfo && props.referrerInfo.extraData) {
      wx.navigateToMiniProgram({
        appId: props.referrerInfo.extraData.appId,
        path: props.referrerInfo.extraData.path
      })

      setTimeout(function () {
        wx.navigateBack({
          delta: -1
        })
      }, 2000);
    }
  },
 
  globalData: {
    ext:false,//区分是否是第三方，true是  false不是
    ifShowCouse:false,//是否已经展示的新手教程，只有在粉丝第一次进来的时候有效
    APPID: "",
    AppSecret: "",
    partnerId:'',//合作商ID
    title:"",
    headImg:"",
    openId: "",
    unionId: "",
    sessionKey: "",
    token: "",//用户令牌
    user:'',//用户信息
    userkey: '',//上级ID  上级分享ID
    mode: "3-1-0-6",//列表模版 目前只有3-1-0-5  3-1-0-6
    role: 0,//0:粉丝 1:合伙人 2:城市合伙人
    isshow:true, //定义一次渲染合伙人排位说明
    classify:'',//主题下的分类
    freeOrderId: '',//免单ID
    sysData: {
      ifNeedClass: 0,//是否开启主题上的分类 0:否,1需要
      ifNeedCut: 0 ,//是否开启砍价功能,0:否,1需要
      ifNeedSchool: 0 ,//0:否, 1需要,
      ifNeedVoide:1,
      ifShow:0
    },
    state:"",//swich状态
    shareData:'',//是否领红包，用于主题分享
    aliinfo:{
      aliphone:"",
      aliname:""
    }
  }
})