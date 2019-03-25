const app = getApp()
const myUrl = require("../../../../utils/url.js");
const util = require('../../../../utils/util.js');
Page({

  //页面的初始数据 
  data: {
    sendMsg: "", //用户输入内容
    sendMsgLength: 0, //计算用户输入内容的长度
    uploadImg: '../../../../img/qrcode.png', //上传图片
    uploadImgIsbool: "请上传微信二维码", //提示文字
    jumpBox: false //弹框显示和隐藏
  },

  //页面加载
  onLoad: function(options) {},

  //获取输入内容
  inputMsg: function(e) {
    if (e) {
      var key = e.detail.value;
      console.log(e.detail.value)

      let phReg = new RegExp(/[^\a-\z\A-\Z0-9\u4E00-\u9FA5\@\.\，\。\？\！\?\!\...]/g); //匹配汉字，数字，字母以及个别标点
      //是否符合
      var isReg = false;

      phReg.test(key) ? isReg = true : isReg = false;
      if (isReg) {
        let newkey = ""
        wx.showToast({
          title: '请勿输入特殊字符',
          icon: "none",
          mask: "true",
          duration: 2000
        })
        console.log(isReg)
        for (let i = 0; i < key.length; i++) {
          newkey = newkey + key.substr(i, 1).replace(phReg, '') //循环遍历所输入的字符，检验最后一个输入，若不符合，就return函数，后面的setData({})就不会存储不符合内容
        }
        return newkey
      }
      this.setData({
        sendMsg: key,
        sendMsgLength: key.length
      })
    }

  },

  // 从相机中获取图片,并显示出来
  getPicture: function() {
    let that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: function(res) {
        console.log(res)
        that.setData({
          uploadImg: res.tempFilePaths[0],
          uploadImgIsbool: "点击更换二维码"
        })
      }
    })
  },

  //删除二维码
  deleteCode: function() {
    this.setData({
      uploadImg: '../../../../img/qrcode.png',
      uploadImgIsbool: !this.data.uploadImgIsbool
    })
  },

  // 弹框显示和隐藏
  isJumpBox: function() {
    this.setData({
      jumpBox: !this.data.jumpBox
    })
  },

  // 提交事件
  submit: function() {
    let that = this;
    that.inputMsg();
    if (that.data.sendMsg == "") {
      wx.showToast({
        title: "个人说明不能为空",
        mask: "true",
        icon: 'none',
        duration: 3000
      })
      return;
    } else if (that.data.uploadImg == '../../../../img/qrcode.png') {
      wx.showToast({
        title: "请上传二维码",
        mask: "true",
        icon: 'none',
        duration: 3000
      })
      return;
    };
    wx.showLoading({
      mask: true,
      title: '上传中'
    })

    wx.uploadFile({
      url: myUrl.mainUrl + "user/updateInsWxEwm",
      header: {
        "content-type": "application/x-www-form-urlencoded;charset=utf-8"
      },
      filePath: that.data.uploadImg,
      name: 'wxEwm',
      formData: {
        token: app.globalData.token,
        ins: that.data.sendMsg
      },
      success: function(res) {
        wx.hideLoading()
        console.log(res)
        let resData = JSON.parse(res.data)

        //失败
        if (resData.result != 'OK') {
          wx.showToast({
            title: resData.result,
            mask: "true",
            icon: 'none',
            duration: 3000
          })
          return;
        }

        app.globalData.user.ins = that.data.sendMsg
        app.globalData.user.wxEwm = that.data.uploadImg

        //更新本地缓存
        var user = wx.getStorageSync('userMsg');
        user.ins = that.data.sendMsg;
        user.wxEwm = that.data.wxEwm;
        wx.setStorage({
          key: 'userMsg',
          data: user,
        })


        //成功
        wx.showToast({
          title: '上传成功',
          mask: "true",
          icon: 'none',
          duration: 3000
        })
        //返回上一级
        setTimeout(function() {
          wx.navigateBack({
            delta: 1
          })
        }, 2000)
      },
      fail: function() {
        wx.hideLoading()
        wx.showToast({
          title: '网络连接超时',
          icon: "none",
          mask: "true",
          duration: 3000
        })
      }
    })
  },



})