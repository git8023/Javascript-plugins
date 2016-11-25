$(function(){
  $("button").click(function(e){
    e.stopPropagation();
    var sideBar = new SideBar().init({
      direction : $(this).attr("id"),   // {String} CSS Class样式,  默认值:up-Λ, right->, down-V, left-< 侧边栏所在的方向 
      closeIco  : "sidebar-back-ico",   // {String} up/right/button/left 关闭按钮图标样式 
      mainTitle : "Main Title",         // {String|jQuery|DOM} any 主标题 
      subTitle  : "Sub Title",          // {String|jQuery|DOM} any 副标题 
      width     : 0.6,                  // {Number} 0.1~1.0之间时使用百分比, 否则使用像素单位 容器占整个屏幕的宽度, 高度总是100% 
    }).registerEvents({
      opening : function(){console.log("opening");},// -/- false-阻止打开 侧边栏打开前 
      opened  : function(){console.log("opened");},// -/- -/- 侧边栏打开后 
      closing : function(){console.log("closing");},// -/- false-阻止关闭 侧边栏关闭前 
      closed  : function(){console.log("closed");},// -/- -/- 侧边栏关闭后 
    });

    setTimeout(function(){sideBar.show()}, 300);
    sideBar.setIco("X");
    setTimeout(function(){
      sideBar.setBody($("#ctt"), true).attr("id", "wrapper").addClass("sidebar-hidden-scroll");
      var wps = $("[id='wrapper']");
      if (wps.size() > 1)wps.eq(0).remove();
      new IScroll("#wrapper");
    }, 3000);
  });
});