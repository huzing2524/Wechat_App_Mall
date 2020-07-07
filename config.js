module.exports = {
  // 开发环境 服务器地址，url前面必须要有http://
  baseApi: 'http://192.168.31.249:8000/',
  // 正式环境 服务器地址
  // baseApi: '',

  version: "1.0.0",
  note: '初始版本', // 这个为版本描述，无需修改
  subDomain: "tz", // 根据教程 https://www.it120.cc/help/qr6l4m.html 查看并设置你自己的 subDomain
  goodsDetailSkuShowType: 0, // 0 为点击立即购买按钮后出现规格尺寸、数量的选择； 1为直接在商品详情页面显示规格尺寸、数量的选择，而不弹框
  shopMod: 0, // 0为单店铺版本 ； 1为多店铺版本
}
