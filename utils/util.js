/*备注:
1.在util.js文件刚加载过程中没办法用全局的 getApp() 函数获取到小程序实例。
  但过了一段时间就行，原因可能是js异步的问题
  解决方法:直接传参,在传用util.js的方法时，将getAPP()直接传进去
  注：在app.js中传 this,在其他js文件传 getAPP(),原因请看文档
*/

const myUrl = require("url.js");
const utilMd5 = require('md5.js');

/*  
 * 封装网络请求  request()
 * url:String         发送的网络请求的地址
 * data:Object        要发送的参数  
 * method:String      请求方式 GET或POST
 * load:Number        是否选择有加载框  0 没  1有 
 * callback:function  回调函数
 */


function request(url, data, method, load, callback, options) {
  if (load == 1) {
    wx.showLoading({
      mask: true,
      title: '加载中'
    })
  }else if(load == 2){
    wx.showLoading({
      mask: true,
      title: '加载中'
    });
    setTimeout(()=>{
      wx.hideLoading();
    },1500);
  }

  //每个接口都要加partnerId和签名,
  data.partnerId = getApp().globalData.partnerId;
  if(url.indexOf('pddPromotion')>-1){
console.log(data);
  }
  data.sign = czParms(data);
  wx.request({
    url: url,
    data: data,
    header: {
      "content-type": "application/x-www-form-urlencoded;charset=utf-8"
    },
    method: method,
    success: function (res) {
      load == 1 ? wx.hideLoading() : '';
      if (res.data.result == 'login') {
        var url = getCurrentPages()[getCurrentPages().length - 1].route; //本页面路径    
        var options = getCurrentPages()[getCurrentPages().length - 1].options; //参数
        options = options.loginParm ? JSON.parse(options.loginParm) : options; //如果参数是登录进来的options=options.loginParm
        console.log(options);
        wx.reLaunch({
          url: "/pages/start/start?route=/" + url + "&options=" + JSON.stringify(options)
        })
        return;
      }
      callback(res)
    },
    fail: function (res) {
      load == 1 ? wx.hideLoading() : ''
      wx.showToast({
        title: "网络连接超时",
        icon: 'none',
        duration: 3000,
      })
    }
  })
}


// MD5加密算法(url)
// md5加密

function czParms(pams) {
  // 参数以key键和val值重组
  let Zpams = JSON.stringify((pams)) //JOSN对象转换JSON字符串
  Zpams = Zpams.replace("{", "").replace("}", "") //去掉空格  
  // Zpams = Zpams.replace(/%/g, '%25'); //去掉空格  
  Zpams = Zpams.replace(/%/g, ''); //去掉空格
  Zpams = Zpams.replace(/\"/g, "") //去掉双引号
  // console.log(Zpams)
  var Apams = []; //定义一数组
  Apams = Zpams.split(","); //字符分割
  var array1 = [] //key数组
  var array2 = [] //val数组
  for (var i = 0; i < Apams.length; i++) {
    // console.log(Apams[i].split(":"))   //以:拆分key和val值
    array1 = array1.concat(Apams[i].split(":")[0])
    array2 = array2.concat(Apams[i].split(":")[1])
  }
  let eidtionTypeList = [];
  //组成待验证加密数组
  for (let i = 0; i < Apams.length; i++) {
    eidtionTypeList.push({
      key: array1[i],
      val: array2[i],
    })
  }
  return dataEncrypt(eidtionTypeList.sort(sortkey))
}


// 按参数key按字母从小到大排序
function sortkey(val1, val2) {
  // 转换
  val1 = val1.key.toLowerCase();
  val2 = val2.key.toLowerCase();
  // 获取较长元素的长度
  var length = val1.length > val2.length ? val1.length : val2.length;
  // 依次比较字母的unicode码，相等时返回0，小于时返回-1，大于时返回1
  for (var i = 0; i < length; i++) {
    var differ = val1.charCodeAt(i) - val2.charCodeAt(i);
    if (differ == 0) {
      continue;
    } else {
      if (val1.charAt(i) == '_') {
        return -1;
      }
      return differ;
    }
  }
  if (i == length) {
    return val1.length - val2.length;
  }
}


//md5数据加密
function dataEncrypt(eidtionTypeList) {
  //key排序后的值拼接.
  var _key = "";
  //对_key的val值拼接(空值跳过)
  for (var i = 0; i < eidtionTypeList.length; i++) {
    if (eidtionTypeList[i].val == "") continue;
    _key += eidtionTypeList[i].val;
  }
  var sign = utilMd5.hexMD5(decodeURI(_key));
  // console.log(sign)
  return sign;
}


//判断是否登录 分享进入把参数带到登录页并返回
function isLogin(that, app) {

  // 正常进来是options   登录页面进来的参数是 options.loginParm
  let options = getCurrentPages()[getCurrentPages().length - 1].options;
  options = options.loginParm ? JSON.parse(options.loginParm) : options;

  //通过本地缓存，获取token，判断用户是否登录
  let token = wx.getStorageSync('token');

  //未登录
  if (!token) {
    var url = getCurrentPages()[getCurrentPages().length - 1].route
    wx.reLaunch({
      url: '/pages/start/start?route=/' + url + '&options=' + JSON.stringify(options),
      fail: function () {//在安卓上小程序进入后台不能调用reLaunch
        wx.redirectTo({
          url: '/pages/start/start?route=/' + url + '&options=' + JSON.stringify(options)
        })
      }
    })
    return;

  } else {
    //己登录
    app.globalData.token = token;
    that.setData({
      role: app.globalData.role
    })

    return options;
  }


}


/*小程序登录流程 */
/*
 * 第一步：通过wx.login()获取code(临时登录凭证),发送code到后台换取 openId, sessionKey, unionId
 * app        全局的 getApp()函数 app.js传this 其它传getApp()
 */

function loginFlow(app, load, callback) {

  wx.login({
    success: res => {
      let props = {
        jsCode: res.code,
        appid: app.globalData.APPID,
        secret: app.globalData.AppSecret
      }

      //第三方调用的接口
      let ifExt = null;
      app.globalData.ext ? ifExt = 'mini/user/componentOauth' : ifExt = 'mini/user/oauthByAppid';
      request(myUrl.userUrl + ifExt, props, "GET", load, function (res) {
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
          app.globalData.sessionKey = res.data.session_key;
          app.globalData.openId = res.data.openid;
          app.globalData.unionId = res.data.unionid;
          wx.setStorageSync('sessionKey', res.data.session_key);
          wx.setStorageSync('openId', res.data.openid);
          wx.setStorageSync('unionId', res.data.unionid);
          console.log('新的sessionKey      ' + app.globalData.sessionKey);
          callback()
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

/*
 * 第二步：用户登录 获取用户基本信息，发送给后台换取token 和 usrMsg
 * app        全局的 getApp()函数 app.js传this 其它传getApp()
 * callback    回调
 */

function myLogin(app, load, callback) {
  let that = this;
  wx.getUserInfo({
    "withCredentials": "true",
    success: res => {
      //将用户信息发送给后台解密，获取更多的用户信息
      let props;
      let key;
      props = {
        encryptedData: res.encryptedData,
        iv: res.iv,
        sessionKey: app.globalData.sessionKey,
        wxOpenId: app.globalData.openId,
        unionidF: app.globalData.userkey,  //上下级关系
        freeOrderId: app.globalData.freeOrderId,
        shareData: app.globalData.shareData
      }


      request(myUrl.userUrl + 'mini/user/miniLogin', props, 'POST', load, function (da) {
        if (da.data.result != "OK") {
          wx.showToast({
            title: da.data.result,
            icon: 'none',
            duration: 3000,
          })
          callback('NO')
          return;
        }

        //赋值到全局变量  
        app.globalData.user = da.data;
        app.globalData.role = da.data.role;
        app.globalData.token = da.data.token;
        console.log(da.data);
        //将用户信息缓存到本地，备用
        wx.setStorageSync("userMsg", da.data);
        wx.setStorageSync('token', da.data.token);

        callback('OK')
      })
    }

  })
}


/*
 * 时间戳转换为yyyy-MM-dd hh:mm:ss 格式  formatDate()
 * inputTime   时间戳
 */
function formatDate(inputTime) {
  var date = new Date(inputTime);
  var y = date.getFullYear();
  var m = date.getMonth() + 1;
  m = m < 10 ? ('0' + m) : m;
  var d = date.getDate();
  d = d < 10 ? ('0' + d) : d;
  var h = date.getHours();
  h = h < 10 ? ('0' + h) : h;
  var minute = date.getMinutes();
  var second = date.getSeconds();
  minute = minute < 10 ? ('0' + minute) : minute;
  second = second < 10 ? ('0' + second) : second;
  return y + '-' + m + '-' + d + ' ' + h + ':' + minute;
  // return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
  // return y + '年' + m + '月' + d + '日' + h + ':' + minute;
};


//判断图片是否是http开头的URL
function avatarUrl(arrayObject) {
  let reg = /http/i;
  let item = arrayObject;
  for (let i = 0; i < item.length; i++) {
    let isbool = reg.test(item[i].headImg);
    if (item[i].img == "") {

    } else if (!isbool) {
      arrayObject[i].img = myUrl.imgUrl + item[i].img;
    }
  }
  return arrayObject;
}



//商品例表共用方法
/*  排序点击事件
 *  that  this
 *  rankNum  用户点击的值
 */
function sendNetwork(rankNum, that) {
  let sortType = '' //排序类型
  let arrow = "" //箭头的方向

  if (rankNum == that.data._num && (rankNum == 1 || rankNum == 2)) {
    return;
  } else if (rankNum != that.data._num) {
    that.data.updown = 2
  }
  switch (rankNum) {
    case '1': //综合排序
      sortType = ''
      break;
    case '2': //销量
      sortType = 8;
      break;
    case '3': //券后价
      if (that.data.updown == 2) {
        that.data.updown = 1
        arrow = "onDownArrowComm"
        sortType = 3;
      } else {
        that.data.updown = 2
        arrow = "onUpArrowComm"
        sortType = 4;
      }
      break;
    case '4': //佣金比例
      if (that.data.updown == 2) {
        that.data.updown = 1
        arrow = "onDownArrowComm"
        sortType = 9;
      } else {
        that.data.updown = 2
        arrow = "onUpArrowComm"
        sortType = 10;
      }
      break;
    case '22':
      sortType = 31;
      break;
  }
  that.setData({
    _num: rankNum,
    arrow: arrow
  })
  that.data.pams.sortType = sortType; //排序类型
  that.data.pams.st = 1

  that.getData(0, 1)
}


// 排序用法
function sort(rankNum, that, callback) {
  //如果点击的是券后价  有升降序
  if (rankNum == 9) {
    if (that.data._num == 9) {
      that.setData({
        _num: 10,
        page: 1,
        nomore: false,
        stop: false, //是否停止下拉刷新
      })
    } else {
      that.setData({
        _num: 9,
        page: 1,
        nomore: false,
        stop: false, //是否停止下拉刷新
      })
    }
    callback();
    // that.getData(1, that.data._num, that.data.ifOnlyCoupon, 1)
    return;
  }

  //直接改变_num
  that.setData({
    _num: rankNum,
    page: 1,
    nomore: false,
    stop: false, //是否停止下拉刷新
  })

  callback();
  // that.getData(1, that.data._num, that.data.ifOnlyCoupon, 1)
}


// 更改样式
function changestyle(that) {
  if (that.data.arrange == 0) {
    that.setData({
      arrange: 1
    })
  } else {
    that.setData({
      arrange: 0
    })
  }
}



//必抢功能选择
function ifNeedClass(app) {
  request(myUrl.mainUrl + 'mini/user/sysData', {}, 'GET', 0, function (res) {
    if (res.data.result != "OK") return;
    app.globalData.sysData = res.data
  })
}

//详情页查看宝贝详情
function cowry(that) {
  //seeLmg: [],//图片切换
  //detailsImg: { },
  //n: 0,

  if (that.data.n == 1) {
    wx.pageScrollTo({
      scrollTop: 0,
    })
    this.setData({
      detailsImg: 0,
      n: 2
    })
    return;
  } else if (that.data.n == 2) {
    if (!res.data.list) { }
    this.setData({
      detailsImg: that.data.seeLmg,
      n: 1
    })
    return;
  }

  request(myUrl.mainUrl + 'tb/goods/detailPic', {
    goodsid: that.data.spreadId
  }, 'GET', 1, function (res) {
    if (res.data.result != "OK") {
      wx.showToast({
        title: res.data.result,
        mask: "true",
        icon: 'none',
        duration: 2000,
      })
      return;
    }
    if (res.data.list) {
      that.setData({
        detailsImg: res.data.images,
        n: 1,
      })
      that.data.seeLmg = res.data.images
    }
  });
}

//详情页猜你喜欢
function like(that, app, options) {
  let pams = {
    goodsId: options.id,
    platform: 2,
    goodsName: that.data.goodsInfo.goodsName
  };
  request(myUrl.goodsUrl + 'pdd/goods/promote', pams, 'POST', 1, function (res) {
    if (res.data.result != "OK") {
      wx.showToast({
        title: res.data.result,
        icon: 'none',
        duration: 3000,
      })
      return;
    }
    if (res.data.list.length == 0) return
    for (let j = 0; j < res.data.list.length; j++) {
      res.data.list[j].price = res.data.list[j].price.toFixed(2)
      res.data.list[j].endPrice = res.data.list[j].endPrice.toFixed(2)
      res.data.list[j].couponMoney = res.data.list[j].couponMoney.toFixed(0)
      res.data.list[j].commission = res.data.list[j].commission.toFixed(2)
    }
    request(myUrl.mainUrl + 'mini/user/sysData', pams, 'GET', 0, (sts) => {
      that.setData({
        sysData: sts.data,
        goodsList: res.data.list,
        showGuess: true
      })
    })
  })
}



//收集formId
function formId(e, app) {
  // 初始化进入为1
  if (app.globalData.user.ifNewUser == undefined) {
    app.globalData.user.ifNewUser = 1;
  }
  console.log(app.globalData.user.ifNewUser);
  let props = {
    token: app.globalData.token,
    fromId: e.detail.formId,
    ifNewUser: app.globalData.user.ifNewUser,
    wxAppid: app.globalData.APPID
  }
  request(myUrl.mainUrl + 'mini/user/savefromId', props, 'GET', 0, function (res) {
    app.globalData.user.ifNewUser = res.data.ifNewUser
  })
}


//批量分享
//用户选中的商品
function cutEvent(e, that) {
  let i = e.currentTarget.dataset.sub //用户选中的商品下标

  if (that.data.shareArray.length > 8 && !that.data.optArray[i]) {
    wx.showToast({
      title: "一次最多只能分享九个商品哦",
      mask: "true",
      icon: 'none',
      duration: 2000
    })
    return;
  }
  that.data.optArray[i] = !that.data.optArray[i]
  that.setData({
    optArray: that.data.optArray
  })
  if (that.data.optArray[i]) {
    that.data.shareArray.push(e.currentTarget.dataset.id)
  } else {
    that.data.shareArray.map((val, index, arr) => {
      if (e.currentTarget.dataset.id == val) arr.splice(index, 1);
    })
  }

}

function code(that, app) {
  if (that.data.shareArray.length == 0) {
    wx.showToast({
      title: "你还没有选择商品哦~",
      mask: "true",
      icon: 'none',
      duration: 2000
    })
    return;
  }
  wx.showLoading({
    mask: true,
    title: '正在生成分享码..'
  })
  let goods = ''
  that.data.shareArray.map((val, index, arr) => {
    goods += val + ','
  })
  goods = goods.slice(0, goods.length - 1)
  console.log(goods)

  let pams = {
    token: app.globalData.token,
    platform: 2,
    goodsIds: goods
  }

  request(myUrl.mainUrl + 'share/getShareCode', pams, 'GET', 0, (res) => {
    wx.hideLoading()
    if (res.data.result != "OK") {
      wx.showToast({
        title: res.data.result,
        mask: "true",
        icon: 'none',
        duration: 3000
      })
      return;
    }
    that.data.code = res.data.code
    that.setData({
      showDraw: true
    })
  })
}


//code获取参数信息  涉及小程序码分享出去返回的参数
function getParame(code, callback) {
  let scene = decodeURIComponent(code)
  request(myUrl.mainUrl + "share/getParame", {
    code: scene
  }, 'GET', 0, (res) => {
    if (res.data.result != "OK") {
      wx.showToast({
        title: res.data.result,
        icon: 'none',
        duration: 3000,
      })
      return;
    }
  
    console.log("返回来的数据", res.data.param)
    let props = urlParse("?" + res.data.param)
    callback(props)
  })
}


//解析url参数
function urlParse(url) {
  let obj = {};
  let reg = /[?&][^?&]+=[^?&]+/g;
  let arr = url.match(reg);
  // ['?id=12345', '&a=b']
  if (arr) {
    arr.forEach((item) => {
      let tempArr = item.substring(1).split('=');
      let key = decodeURIComponent(tempArr[0]);
      let val = decodeURIComponent(tempArr[1]);
      obj[key] = val;
    });
  }
  return obj;
}

//复制内容到剪切板
function copy(concent, success) {
  wx.setClipboardData({
    data: concent,
    success: function (res) {
      success();
    }
  });
}

//获取剪切板内容
function getcli(callback) {
  wx.getClipboardData({
    success: function (res) {
      var cli = res.data;
      if (res.data != '') {
        callback(res);
      } else {
        callback(res);
      }
    }
  })
}


//转换万元
function trans(count) {
  if (count > 9999) {
    // count=(count/10000)+'万';
    return (count / 10000).toFixed(1) + '万';
  } else {
    return count
  }
}


module.exports = {
  request,
  loginFlow,
  formatDate,
  myLogin,
  avatarUrl,
  sendNetwork,
  ifNeedClass,
  cowry,
  like,
  formId,
  cutEvent,
  code,
  urlParse,
  getParame,
  sortkey,
  dataEncrypt,
  czParms,
  copy,
  getcli,
  isLogin,
  trans,
  sort, //排序
  changestyle, //更改样式
}