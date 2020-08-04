const app = getApp();
const CONFIG = require('../../config.js')
const baseApi = CONFIG.baseApi;

Page({
  data: {
  
  },
  onLoad: function (options) {
    var that = this;
    wx.request({
      url: baseApi + 'notices/' + options.id,
      method: 'GET',
      success (res) {
        that.setData({notice: res.data})
      }
    })
  },
  onShareAppMessage() {
  },
})