// pages/goodsDetails/goodsDetails.js
/* 
1 发送请求获取数据 
2 点击轮播图 预览大图
  1 给轮播图绑定点击事件
  2 调用小程序的api  previewImage 
3 点击 加入购物车
  1 先绑定点击事件
  2 获取缓存中的购物车数据 数组格式 
  3 先判断 当前的商品是否已经存在于 购物车
  4 已经存在 修改商品数据  执行购物车数量++ 重新把购物车数组 填充回缓存中
  5 不存在于购物车的数组中 直接给购物车数组添加一个新元素 新元素 带上 购买数量属性 num  重新把购物车数组 填充回缓存中
  6 弹出提示
4 商品收藏
  1 页面onShow的时候  加载缓存中的商品收藏的数据
  2 判断当前商品是不是被收藏 
    1 是 改变页面的图标
    2 不是 。。
  3 点击商品收藏按钮 
    1 判断该商品是否存在于缓存数组中
    2 已经存在 把该商品删除
    3 没有存在 把商品添加到收藏数组中 存入到缓存中即可
 */
/*import { request } from "../../request/index.js";
import regeneratorRuntime from '../../lib/runtime/runtime';*/
var goodlist1;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    gid:'',
    goodlist:'',
    color:'白色',
    size:'S',
    goodsObj: {},
     // 商品是否被收藏
     isCollect:false,
     //商品数量
     goodsNumber: 1,
     minusStatus: 'disabled',
     //遮罩层显示状态
     mask: true,
     //购物车弹窗显示隐藏
     cartBox: true,
     //单规格
     danguige: true,
   
     specActive:1,
     Active:1,
     guigelist: [
       {
         id: 1,
         guige: '白色'
       },
       {
         id: 2,
         guige: '红色'
       },
       {
         id: 3,
         guige: '黑色'
       }
     ],
     guigelist1: [
       {
         id: 1,
         guige: 'S'
       },
       {
         id: 2,
         guige: 'M'
       },
       {
         id: 3,
         guige: 'L'
       }
     ],
   },
   // 商品对象
   GoodsInfo: {gid:'',uname:'',num:''},
   //收藏对象
   collectInfo:{gid:'',uname:''},
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    var uname=wx.getStorageSync('uname')
    this.setData({
      gid:options.gid
    })
    console.log(this.data.gid)
    wx.request({
      url: 'http://127.0.0.1:3000/toGoodDetail',
      method: 'POST',
      data: {
        gid:this.data.gid,
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success(res) {
        goodlist1=res.data.data;
        var imglist;
        // var imglist = goodlist1.gphoto.split('&')[0];
        // console.log(goodlist1[0].gphoto)
        if(goodlist1[0].gphoto.length>0){
          imglist= goodlist1[0].gphoto.split('&');
          var reg1 = new RegExp('\n', 'g');//全局替换换行符
          for(var i=0;i<imglist.length&&imglist.length!=0;i++){
            imglist[i] = imglist[i].replace(reg1,'').replace(/\s+/g, '')
          }
          console.log(imglist)
        }
        that.setData({
          goodlist:goodlist1,
          goodsObj:imglist,
        })
        // console.log(imglist)
        console.log(that.data.goodlist) 
        console.log(that.data.goodsObj) 
      }
    })
    wx.request({
      url: 'http://127.0.0.1:3000/isCollected',
      method: 'POST',
      data: {
        gid:this.data.gid,
        uname:uname
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success(res) {
        var flag = res.data.data;
        console.log(flag)
        if(flag!=''){
          that.setData({
            isCollect:true
          })
        }
      }
    })
  },
  onShow: function () {
    let pages = getCurrentPages();
    let currentPage = pages[pages.length - 1];
    let options = currentPage.options;
    const { goods_id } = options;
    this.getGoodsDetail(goods_id);


  },
  // 获取商品详情数据
  async getGoodsDetail(goods_id) {
    const goodsObj = await request({ url: "/goods/detail", data: { goods_id } });
    this.GoodsInfo = goodsObj;
    // 1 获取缓存中的商品收藏的数组
    let collect = wx.getStorageSync("collect") || [];
    // 2 判断当前商品是否被收藏
    let isCollect = collect.some(v => v.goods_id === this.GoodsInfo.goods_id);
    this.setData({
      goodsObj: {
        goods_name: goodsObj.goods_name,
        goods_price: goodsObj.goods_price,
        // iphone部分手机 不识别 webp图片格式 
        // 最好找到后台 让他进行修改 
        // 临时自己改 确保后台存在 1.webp => 1.jpg 
        goods_introduce: goodsObj.goods_introduce.replace(/\.webp/g, '.jpg'),
        pics: goodsObj.pics
      },
      isCollect
    })
  },
  // 点击轮播图 放大预览
  handlePrevewImage(e) {
    // 1 先构造要预览的图片数组 
    const urls = this.GoodsInfo.pics.map(v => v.pics_mid);
    // 2 接收传递过来的图片url
    const current = e.currentTarget.dataset.url;
    wx.previewImage({
      current,
      urls
    });

  },
  // 点击 加入购物车
handleCartAdd() {
  // 1 获取缓存中的购物车 数组
  let cart = wx.getStorageSync("cart") || [];
  var uname=wx.getStorageSync('uname')
  // 2 判断 商品对象是否存在于购物车数组中
  let index = cart.findIndex(v=>v.gid==this.data.gid);
  if(uname==''){
    wx.switchTab({
      url: '/pages/mine/mine',
    })
    wx.showToast({
      title: '请先登录',
    });
  }else{
    var flag;
    wx.request({
      url: 'http://127.0.0.1:3000/addgoodstoShoppingcart',
      method: 'POST',
      data: {
        gid:this.data.gid,
        uname:uname,
        color:this.data.color
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success(res) {
        flag = res.data.data;
      }
    })
  if (index == -1 || flag=='') {
    //3  不存在 第一次添加
    this.GoodsInfo.gid = this.data.gid;
    this.GoodsInfo.uname = uname;
    this.GoodsInfo.num = 1;
    cart.push(this.GoodsInfo);
    wx.request({
      url: 'http://127.0.0.1:3000/addgoodstoShoppingcart',
      method: 'POST',
      data: {
        gid:this.data.gid,
        uname:uname,
        color:this.data.color,
        size:this.data.size,
        number:this.data.goodsNumber
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success(res) {
        
      }
    })
  } else {
    // 4 已经存在购物车数据 执行 num++
    cart[index].num++;
    wx.request({
      url: 'http://127.0.0.1:3000/updatashoppingcartNumber',
      method: 'POST',
      data: {
        gid:this.data.gid,
        uname:uname,
        color:this.data.color,
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success(res) {

      }
    })
  }
  // 6 弹窗提示
  wx.showToast({
    title: '加入成功',
    icon: 'success',
    // true 防止用户 手抖 疯狂点击按钮 
    mask: true
  })
}
  // 5 把购物车重新添加回缓存中
  wx.setStorageSync("cart", cart);
  this.showCart();
},

  // 点击 商品收藏图标
  handleCollect(){
    let isCollect=false;
    let collect;
    var uname=wx.getStorageSync('uname')
    console.log(uname)
    if(uname==''){
      wx.switchTab({
        url: '/pages/mine/mine',
      })
      wx.showToast({
        title: '请先登录',
      });
    }else{
    // 1 获取缓存中的商品收藏数组
    collect=wx.getStorageSync("collect")||[];
    console.log(collect)
    // 2 判断该商品是否被收藏过
    let index=collect.findIndex(v=>v.gid==this.data.gid);
    console.log('index'+index)
    // 3 当index!=-1表示 已经收藏过 
    if(index!=-1){
      // 能找到 已经收藏过了  在数组中删除该商品
      collect.splice(index,1);
      isCollect=false;
      wx.request({
        url: 'http://127.0.0.1:3000/deletegoodsfromfavorite',
        method: 'POST',
        data: {
          gid:this.data.gid,
          uname:uname
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success(res) {
          
        }
      })
      var goodlist1 = this.data.goodlist;
      goodlist1[0].favorite = goodlist1[0].favorite-1
      console.log(goodlist1)
      this.setData({
        goodlist:goodlist1
      })
      wx.showToast({
        title: '取消成功',
        icon: 'success',
        mask: true
      });
        
    }else{
      // 没有收藏过
      this.collectInfo.gid=this.data.gid
      this.collectInfo.uname=uname
      collect.push(this.collectInfo);
      isCollect=true;
      wx.request({
        url: 'http://127.0.0.1:3000/addgoodstofavorite',
        method: 'POST',
        data: {
          gid:this.data.gid,
          uname:uname
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success(res) {
          
        }
      })
      var goodlist1 = this.data.goodlist;
      goodlist1[0].favorite = goodlist1[0].favorite+1
      console.log(goodlist1)
      this.setData({
        goodlist:goodlist1
      })
      wx.showToast({
        title: '收藏成功',
        icon: 'success',
        mask: true
      });
    }
  }
    // 4 把数组存入到缓存中
    console.log(collect)
    wx.setStorageSync("collect", collect);
    // 5 修改data中的属性  isCollect
    this.setData({
      isCollect
    })
      
  
  },
  /* 购物车弹窗部分函数*/
showCart() {
  this.setData({
    cartBox: !this.data.cartBox, //显示隐藏购物车弹窗
    mask: !this.data.mask, //显示隐藏遮罩层
  });
},
//点击遮罩层隐藏弹窗
hideAllBox() {
  this.setData({
    //遮罩层隐藏
    mask: true,
    //产品参数弹窗隐藏
    paramsBox: true,
    //购物车弹窗隐藏
    cartBox: true,
    //选择规格弹窗隐藏
    choice: true,

  })
},
/* 点击减号 */
reduceNumber: function () {
  var num = this.data.goodsNumber;
  // 如果大于1时，才可以减  
  if (num > 1) {
    num--;
  }
  // 只有大于一件的时候，才能normal状态，否则disable状态  
  var minusStatus = num <= 1 ? 'disabled' : 'normal';
  // 将数值与状态写回  
  this.setData({
    goodsNumber: num,
    minusStatus: minusStatus
  });
},
/* 点击加号 */
addNumber: function () {
  var num = this.data.goodsNumber;
  // 不作过多考虑自增1  
  num++;
  // 只有大于一件的时候，才能normal状态，否则disable状态  
  var minusStatus = num < 1 ? 'disabled' : 'normal';
  // 将数值与状态写回  
  this.setData({
    goodsNumber: num,
    minusStatus: minusStatus
  });
},
/* 输入框事件 */
inputValueChange: function (e) {
  var num = e.detail.value;
  // 将数值与状态写回  
  this.setData({
    goodsNumber: num
  });
},
/*选定参数事件*/
OneSelectSpec:function(e){
  console.log(e.target.dataset.gui_id)
  console.log(this.data.guigelist[e.target.dataset.gui_id-1].guige)
  this.setData({
    specActive:e.target.dataset.gui_id,
    color:this.data.guigelist[e.target.dataset.gui_id-1].guige
  })
},
OneSelectSpecNext:function(e){
  console.log(e.target.dataset.gui_id)
  console.log(this.data.guigelist1[e.target.dataset.gui_id-1].guige)
  this.setData({
    Active:e.target.dataset.gui_id,
    size:this.data.guigelist[e.target.dataset.gui_id-1].guige
  })
},

})