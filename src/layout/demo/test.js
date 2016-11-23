$(function(){
  var debug     = true;

  // 设置上下布局
  var udLayout  = new UDLayout($(".ud-container"), debug);
  udLayout.registerEvents({completed : function(){console.log(this)}}).init(0.1);

  // 设置左右布局
  var lrLayout  = new LRLayout($(".lr-container"), debug)
  lrLayout.registerEvents({completed : function(){console.log(this)}}).init(0.2);

  // 监控窗口变化
  $(".ud-container").height(document.documentElement.clientHeight);
  $(window).resize(function(){
    $(".ud-container").height(document.documentElement.clientHeight);
  });
});