$(function(){
  // 获取布局器
  var layout = new LRLayout($(".layout-ud-container"), true);
  // 注册事件, 必须在初始化之前执行
  layout.registerEvents({completed:function(){console.log(this);}});
  // 初始化布局器
  layout.init(0.3);
});