$(function(){
  var grid  = new DataGrid($(".data-grid"), true),
      pager = new Pager($(".data-pager"), true);
  pager.init({
    // 点击翻页后, 发送请求前
    beforeClick : function(index, next){},  // 参数 index, next; 返回值:false-截断执行

    // 获取到服务器响应后
    afterClick  : function(index, rData){   // 参数 index, data
      var dataList = rData.data;
      grid.fill(dataList, false);
    },

    // 初始化完成后
    completed   : function(){},

    // jQuery.ajax 请求发送前
    // 返回值: 发送Ajax请求时需要的参数, 
    // 如果返回值为[undefined|null]则使用默认值, 否则将使用处理后的返回值
    beforeSend  : function(conf){
      console.log(conf.param);
      conf.param["searchKeyWord"] = "test";
      return conf.param;
    },
  });
});