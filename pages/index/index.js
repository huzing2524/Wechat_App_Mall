const WXAPI = require('apifm-wxapi')
const TOOLS = require('../../utils/tools.js')
const CONFIG = require('../../config.js')
const baseApi = CONFIG.baseApi;

const APP = getApp()
// fixed首次打开不显示标题的bug
APP.configLoadOK = () => {
  wx.setNavigationBarTitle({
    title: wx.getStorageSync('mallName')
  })
}

Page({
  data: {
    dev: APP.globalData.dev,
    prod: APP.globalData.prod,

    inputVal: "", // 搜索框内容
    goodsRecommend: [], // 推荐商品
    // kanjiaList: [], //砍价商品列表
    pingtuanList: [], //拼团商品列表

    loadingHidden: false, // loading
    selectCurrent: 0,
    categories: [],
    activeCategoryId: 0,
    goods: [],
    goodsNext: '',  // 分页：下一页是否有数据标志
    loadingMoreHidden: true, // 底部无数据提示分隔线

    coupons: [],

    curPage: 1,
    pageSize: 2,
    cateScrollTop: 0
  },

  tabClick: function (e) {
    wx.setStorageSync("_categoryId", e.currentTarget.id)
    wx.switchTab({
      url: '/pages/category/category',
    })
    // wx.navigateTo({
    //   url: '/pages/goods/list?categoryId=' + e.currentTarget.id,
    // })
  },
  toDetailsTap: function (e) {
    wx.navigateTo({
      url: "/pages/goods-details/index?id=" + e.currentTarget.dataset.id
    })
  },
  tapBanner: function (e) {
    const spu_id = e.currentTarget.dataset.spu
    // console.log('跳转spu id -> ', spu_id)
    if (spu_id) {
      wx.navigateTo({
        url: '/pages/goods-details/index?id=' + spu_id
      })
    }
  },
  adClick: function (e) {
    const url = e.currentTarget.dataset.url
    if (url) {
      wx.navigateTo({
        url
      })
    }
  },
  bindTypeTap: function (e) {
    this.setData({
      selectCurrent: e.index
    })
  },
  onLoad: function (e) {
    wx.showShareMenu({
      withShareTicket: true
    })
    const that = this
    if (e && e.scene) {
      const scene = decodeURIComponent(e.scene)
      if (scene) {
        wx.setStorageSync('referrer', scene.substring(11))
      }
    }
    wx.setNavigationBarTitle({
      title: wx.getStorageSync('mallName')
    })
    this.initBanners(); // 头部轮播图
    this.categories(); // 商品类别
    this.goodsList(); // 商品列表

    WXAPI.goods({
      recommendStatus: 1
    }).then(res => {
      if (res.code === 0) {
        that.setData({
          goodsRecommend: res.data
        })
      }
    })
    that.getCoupons()
    that.getNotice()
    // that.kanjiaGoods()
    that.pingtuanGoods()
    that.wxaMpLiveRooms()
  },
  async miaoshaGoods() {
    const res = await WXAPI.goods({
      miaosha: true
    })
    if (res.code == 0) {
      res.data.forEach(ele => {
        const _now = new Date().getTime()
        if (ele.dateStart) {
          ele.dateStartInt = new Date(ele.dateStart.replace(/-/g, '/')).getTime() - _now
        }
        if (ele.dateEnd) {
          ele.dateEndInt = new Date(ele.dateEnd.replace(/-/g, '/')).getTime() - _now
        }
      })
      this.setData({
        miaoshaGoods: res.data
      })
    }
  },
  async wxaMpLiveRooms() {
    const res = await WXAPI.wxaMpLiveRooms()
    if (res.code == 0 && res.data.length > 0) {
      this.setData({
        aliveRooms: res.data
      })
    }
  },

  // 读取头部轮播图
  async initBanners() {
    var that = this;
    wx.request({
      url: baseApi + 'banners',
      method: 'GET',
      success(res) {
        // console.log('banners -> ', res.data)
        that.setData({
          banners: res.data
        })
      }
    })
  },

  onShow: function (e) {
    // 获取购物车数据，显示TabBarBadge
    TOOLS.showTabBarBadge()
    this.goodsDynamic()
    this.miaoshaGoods()
  },
  async goodsDynamic() {
    const res = await WXAPI.goodsDynamic(0)
    if (res.code == 0) {
      this.setData({
        goodsDynamic: res.data
      })
    }
  },

  // 首页-商品类别
  async categories() {
    var that = this;
    wx.request({
      url: baseApi + 'spu/categories',
      method: 'GET',
      success(res) {
        // console.log('categories -> ', res.data);
        let categories = res.data;
        that.setData({
          categories: categories
        });
      }
    });
  },

  // 首页 - 商品列表
  async goodsList() {
    var that = this;
    wx.hideLoading();
    wx.request({
      url: baseApi + 'spus',
      method: 'GET',
      data: {
        page: that.data.curPage,
        page_size: that.data.pageSize
      },
      success(res) {
        // console.log('goodsList -> ', res.data);
        if (res.statusCode == 404) {
          // 商品列表数据分页加载完，页面到达底部
          that.setData({
            loadingMoreHidden: false
          });
          return
        };

        that.setData({
          goods: that.data.goods.concat(res.data.results),
          loadingMoreHidden: true,
          goodsNext: res.data.next  // 分页：下一页是否有数据标志
        })
      }
    })
  },

  async getGoodsList(categoryId, append) {
    //   if (categoryId == 0) {
    //     categoryId = "";
    //   }
    //   wx.showLoading({
    //     "mask": true
    //   })
    //   const res = await WXAPI.goods({
    //     categoryId: categoryId,
    //     page: this.data.curPage,
    //     pageSize: this.data.pageSize
    //   })
    //   wx.hideLoading()
    //   if (res.code == 404 || res.code == 700) {
    //     let newData = {
    //       loadingMoreHidden: false
    //     }
    //     if (!append) {
    //       newData.goods = []
    //     }
    //     this.setData(newData);
    //     return
    //   }
    //   let goods = [];
    //   if (append) {
    //     goods = this.data.goods
    //   }
    //   for (var i = 0; i < res.data.length; i++) {
    //     goods.push(res.data[i]);
    //   }
    //   this.setData({
    //     loadingMoreHidden: true,
    //     goods: goods,
    //   });
  },

  getCoupons: function () {
    var that = this;
    WXAPI.coupons().then(function (res) {
      if (res.code == 0) {
        that.setData({
          coupons: res.data
        });
      }
    })
  },
  onShareAppMessage: function () {
    return {
      title: '"' + wx.getStorageSync('mallName') + '" ' + wx.getStorageSync('share_profile'),
      path: '/pages/index/index?inviter_id=' + wx.getStorageSync('uid')
    }
  },

  // 首页-通知消息 滚动显示效果
  getNotice: function () {
    var that = this;
    wx.request({
      url: baseApi + 'notices',
      method: 'GET',
      success(res) {
        // console.log('noticeList', res.data.results);
        that.setData({
          noticeList: res.data.results
        })
      }
    })
    // WXAPI.noticeList({ pageSize: 5 }).then(function (res) {
    //   if (res.code == 0) {
    //     console.log('noticeList', res.data);
    //     that.setData({
    //       noticeList: res.data
    //     });
    //   }
    // })
  },

  // 底部商品列表分页加载更多
  onReachBottom: function () {
    // 判断下一页是否有数据：下一页next标志不为null才向后台请求商品列表接口 
    if (this.data.goodsNext) {
      this.setData({
        curPage: this.data.curPage + 1
      });
      this.goodsList();
    }
  },
  onPullDownRefresh: function () {
    this.setData({
      curPage: 1
    });
    this.goodsList();
    wx.stopPullDownRefresh()
  },

  // 获取砍价商品
  // async kanjiaGoods() {
  //   const res = await WXAPI.goods({
  //     kanjia: true
  //   });
  //   if (res.code == 0) {
  //     const kanjiaGoodsIds = []
  //     res.data.forEach(ele => {
  //       kanjiaGoodsIds.push(ele.id)
  //     })
  //     const goodsKanjiaSetRes = await WXAPI.kanjiaSet(kanjiaGoodsIds.join())
  //     if (goodsKanjiaSetRes.code == 0) {
  //       res.data.forEach(ele => {
  //         const _process = goodsKanjiaSetRes.data.find(_set => {
  //           console.log(_set)
  //           return _set.goodsId == ele.id
  //         })
  //         console.log(ele)
  //         console.log(_process)
  //         if (_process) {
  //           ele.process = 100 * _process.numberBuy / _process.number
  //         }
  //       })
  //       this.setData({
  //         kanjiaList: res.data
  //       })
  //     }
  //   }
  // },

  goCoupons: function (e) {
    wx.navigateTo({
      url: "/pages/coupons/index"
    })
  },
  pingtuanGoods() { // 获取团购商品列表
    const _this = this
    WXAPI.goods({
      pingtuan: true
    }).then(res => {
      if (res.code === 0) {
        _this.setData({
          pingtuanList: res.data
        })
      }
    })
  },
  bindinput(e) {
    this.setData({
      inputVal: e.detail.value
    })
  },
  bindconfirm(e) {
    this.setData({
      inputVal: e.detail.value
    })
    wx.navigateTo({
      url: '/pages/goods/list?name=' + this.data.inputVal,
    })
  },
  goSearch() {
    wx.navigateTo({
      url: '/pages/goods/list?name=' + this.data.inputVal,
    })
  }
})