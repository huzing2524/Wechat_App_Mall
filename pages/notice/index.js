const CONFIG = require('../../config.js')
const baseApi = CONFIG.baseApi;

Page({

  /**
   * 页面的初始数据
   */
  data: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.request({
      url: baseApi + 'notices',
      method: 'GET',
      success (res) {
        that.setData({noticeList: res.data.results})
      }
    })
  },
  onShow: function () {

  },
})