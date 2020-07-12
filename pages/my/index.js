const app = getApp()
const WXAPI = require('apifm-wxapi')
const AUTH = require('../../utils/auth')
const TOOLS = require('../../utils/tools.js')
const CONFIG = require('../../config.js')
const baseApi = CONFIG.baseApi;

Page({
  data: {
    wxlogin: true,

    balance: 0.00,
    freeze: 0,
    score: 0,
    growth: 0,
    score_sign_continuous: 0,
    rechargeOpen: false, // 是否开启充值[预存]功能

    // 用户订单统计数据
    count_id_no_confirm: 0,
    count_id_no_pay: 0,
    count_id_no_reputation: 0,
    count_id_no_transfer: 0,
  },
  onLoad() {},
  onShow() {
    console.log('我的 页面刷新------');

    const _this = this
    const order_hx_uids = wx.getStorageSync('order_hx_uids')
    this.setData({
      version: CONFIG.version,
      order_hx_uids
    })

    AUTH.checkHasLogined().then(isLogined => {
      console.log('检查是否已经登录');
      this.setData({
        wxlogin: isLogined
      })
      if (isLogined) {
        _this.getUserApiInfo();
        // _this.getUserAmount();
        // _this.orderStatistics();
      }
    })

    // 获取购物车数据，显示TabBarBadge
    TOOLS.showTabBarBadge();
  },
  aboutUs: function () {
    wx.showModal({
      title: '关于我们',
      content: '本系统基于开源小程序商城系统 https://github.com/EastWorld/wechat-app-mall 搭建，祝大家使用愉快！',
      showCancel: false
    })
  },
  logOut() {
    AUTH.logOut()
    wx.reLaunch({
      url: '/pages/my/index'
    })
  },
  getPhoneNumber: function (e) {
    if (!e.detail.errMsg || e.detail.errMsg != "getPhoneNumber:ok") {
      wx.showModal({
        title: '提示',
        content: e.detail.errMsg,
        showCancel: false
      })
      return;
    }
    WXAPI.bindMobileWxa(wx.getStorageSync('token'), e.detail.encryptedData, e.detail.iv).then(res => {
      if (res.code === 10002) {
        this.setData({
          wxlogin: false
        })
        return
      }
      if (res.code == 0) {
        wx.showToast({
          title: '绑定成功',
          icon: 'success',
          duration: 2000
        })
        this.getUserApiInfo();
      } else {
        wx.showModal({
          title: '提示',
          content: res.msg,
          showCancel: false
        })
      }
    })
  },
  getUserApiInfo: function () {
    console.log('获取用户详情------');
    var that = this;
    wx.request({
      url: baseApi + 'user/detail',
      data: {
        token: wx.getStorageSync('token')
      },
      method: 'GET',
      success(res) {
        if (res.statusCode == 200) {
          console.log('用户信息 res.data -> ' + res.data)
          let apiUserInfoMap = res.data;
          that.setData({
            apiUserInfoMap: apiUserInfoMap
          });
        }
      }

    })
  },
  getUserAmount: function () {
    var that = this;
    WXAPI.userAmount(wx.getStorageSync('token')).then(function (res) {
      if (res.code == 0) {
        that.setData({
          balance: res.data.balance.toFixed(2),
          freeze: res.data.freeze.toFixed(2),
          score: res.data.score,
          growth: res.data.growth
        });
      }
    })
  },
  handleOrderCount: function (count) {
    return count > 99 ? '99+' : count;
  },
  orderStatistics: function () {
    WXAPI.orderStatistics(wx.getStorageSync('token')).then((res) => {
      if (res.code == 0) {
        const {
          count_id_no_confirm,
          count_id_no_pay,
          count_id_no_reputation,
          count_id_no_transfer,
        } = res.data || {}
        this.setData({
          count_id_no_confirm: this.handleOrderCount(count_id_no_confirm),
          count_id_no_pay: this.handleOrderCount(count_id_no_pay),
          count_id_no_reputation: this.handleOrderCount(count_id_no_reputation),
          count_id_no_transfer: this.handleOrderCount(count_id_no_transfer),
        })
      }
    })
  },
  goAsset: function () {
    wx.navigateTo({
      url: "/pages/asset/index"
    })
  },
  goScore: function () {
    wx.navigateTo({
      url: "/pages/score/index"
    })
  },
  goOrder: function (e) {
    wx.navigateTo({
      url: "/pages/order-list/index?type=" + e.currentTarget.dataset.type
    })
  },
  cancelLogin() {
    this.setData({
      wxlogin: true
    })
  },
  goLogin() {
    this.setData({
      wxlogin: false
    })
  },
  processLogin(e) {
    console.log('我的界面 立即登录 e->', e, e.detail)

    this.setData({
      wxlogin: true
    });
    var that = this;

    wx.login({
      success: function (res) {
        let code = res.code; // 微信登录接口返回的 code 参数，下面注册接口需要用到
        wx.getUserInfo({
          success: function (res) {
            console.log('我的 授权登录res->', res)
            let iv = res.iv;
            let encryptedData = res.encryptedData;

            wx.request({
              url: baseApi + 'user/login',
              data: {
                code: code,
                encryptedData: encryptedData,
                iv: iv
              },
              method: "POST",
              success(res) {
                if (res.statusCode == 200) {
                  // console.log('请求后台登录成功 res.data.token->' + res.data.token);
                  wx.setStorageSync('token', res.data.token);
                  // 刷新页面。更新用户信息
                  that.onShow();
                } else {
                  wx.showModal({
                    title: '提示',
                    content: '登录失败，请重试！',
                    showCancel: false
                  })
                }
              },
              fail(res) {
                console.log('请求失败->' + res)
              }
            })
          }
        })
      }
    })

  },
  scanOrderCode() {
    wx.scanCode({
      onlyFromCamera: true,
      success(res) {
        wx.navigateTo({
          url: '/pages/order-details/scan-result?hxNumber=' + res.result,
        })
      },
      fail(err) {
        console.error(err)
        wx.showToast({
          title: err.errMsg,
          icon: 'none'
        })
      }
    })
  },
  clearStorage() {
    wx.clearStorageSync();
    wx.showToast({
      title: '已清除',
      icon: 'success'
    });
    wx.reLaunch({
      url: '/pages/my/index'
    })
  },
})