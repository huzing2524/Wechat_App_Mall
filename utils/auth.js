const WXAPI = require('apifm-wxapi');
const config = require('../config');
const baseApi = config.baseApi;

async function checkSession(){
  return new Promise((resolve, reject) => {
    wx.checkSession({
      success() {
        return resolve(true)
      },
      fail() {
        return resolve(false)
      }
    })
  })
}

// 检测登录状态，返回 true / false
async function checkHasLogined() {
  const token = wx.getStorageSync('token')
  if (!token) {
    return false
  }
  // 微信检查登录态是否过期
  const loggined = await checkSession()
  if (!loggined) {
    wx.removeStorageSync('token')
    return false
  }

  return true
}

async function wxaCode(){
  return new Promise((resolve, reject) => {
    wx.login({
      success(res) {
        return resolve(res.code)
      },
      fail() {
        wx.showToast({
          title: '获取code失败',
          icon: 'none'
        })
        return resolve('获取code失败')
      }
    })
  })
}

async function getUserInfo() {
  return new Promise((resolve, reject) => {
    wx.getUserInfo({
      success: res => {
        return resolve(res)
      },
      fail: err => {
        console.error(err)
        return resolve()
      }
    })
  })
}

async function login(page){
  // wx.login({
  //   success (res) {
  //     console.log('login->', res)
  //     if (res.code) {
  //       wx.request({
  //         url: baseApi + 'login',
  //         data: {code: res.code},
  //         method: "POST",
  //         success (res) {
  //           console.log('请求后台登录成功->' + res.data);
            
  //         },
  //         fail (res) {
  //           console.log('请求失败->' + res)
  //         }
  //       })
  //     } else {
  //         // 登录错误
  //         console.log('登录失败！' + res.errMsg)
  //         wx.showModal({
  //           title: '无法登录',
  //           content: res.errMsg,
  //           showCancel: false
  //         })
  //         return;
  //     }
  //   }
  // })

  console.log('登录------');
  wx.login({
    success: function (res) {
      WXAPI.login_wx(res.code).then(function (res) {
        console.log('res->', res)
        console.log('res.flag->', res.flag);
        if (res.flag == 1) {
          // 登录错误
          wx.showModal({
            title: '自动登录失败！',
            content: res.msg,
            showCancel: false
          })
          return;
        }
        wx.setStorageSync('token', res.token);
        console.log('res.token->', res.token);
        if ( page ) {
          page.onShow()
        }
      })
    }
  })
}

async function register(page) {
  let _this = this;
  console.log('注册------');
  // wx.login({
  //   success: function (res) {
  //     let code = res.code; // 微信登录接口返回的 code 参数，下面注册接口需要用到
  //     wx.getUserInfo({
  //       success: function (res) {
  //         console.log('我的 授权登录res->', res)
  //         let iv = res.iv;
  //         let encryptedData = res.encryptedData;

  //         let referrer = '' // 推荐人
  //         let referrer_storge = wx.getStorageSync('referrer');
  //         if (referrer_storge) {
  //           referrer = referrer_storge;
  //         }
  //         // 下面开始调用注册接口
  //         wx.request({
  //           url: baseApi + 'register',
  //           data: {
  //             code: code,
  //             encryptedData: encryptedData,
  //             iv: iv
  //           },
  //           method: "POST",
  //           success (res) {
  //             console.log('请求后台登录成功->' + res.data);
  //             wx.setStorageSync('jwt_token', res.data.jwt_token);
  //             // _this.setData({wxlogin: true});
  //             // _this.onshow();
  //           },
  //           fail (res) {
  //             console.log('请求失败->' + res)
  //           }
  //         })
  //       }
  //     })
  //   }
  // })

  wx.login({
    success: function (res) {
      let code = res.code; // 微信登录接口返回的 code 参数，下面注册接口需要用到
      wx.getUserInfo({
        success: function (res) {
          let iv = res.iv;
          let encryptedData = res.encryptedData;
          
          // 下面开始调用注册接口
          WXAPI.register_complex({
            code: code,
            encryptedData: encryptedData,
            iv: iv
          }).then(function (res) {
            _this.login(page);
          })
        }
      })
    }
  })
}

function logOut(){
  wx.removeStorageSync('token')
  wx.removeStorageSync('uid')
}

async function checkAndAuthorize (scope) {
  return new Promise((resolve, reject) => {
    wx.getSetting({
      success(res) {
        if (!res.authSetting[scope]) {
          wx.authorize({
            scope: scope,
            success() {
              resolve() // 无返回参数
            },
            fail(e){
              console.error(e)
              // if (e.errMsg.indexof('auth deny') != -1) {
              //   wx.showToast({
              //     title: e.errMsg,
              //     icon: 'none'
              //   })
              // }
              wx.showModal({
                title: '无权操作',
                content: '需要获得您的授权',
                showCancel: false,
                confirmText: '立即授权',
                confirmColor: '#e64340',
                success(res) {
                  wx.openSetting();
                },
                fail(e){
                  console.error(e)
                  reject(e)
                },
              })
            }
          })
        } else {
          resolve() // 无返回参数
        }
      },
      fail(e){
        console.error(e)
        reject(e)
      }
    })
  })  
}


module.exports = {
  checkHasLogined: checkHasLogined,
  wxaCode: wxaCode,
  getUserInfo: getUserInfo,
  login: login,
  register: register,
  logOut: logOut,
  checkAndAuthorize: checkAndAuthorize
}