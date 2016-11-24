$(function(){
  
  var sideBar = new SideBar();
  sideBar.init({
    direction : "right",              // {String} CSS Class样式,  默认值:up-Λ, right->, down-V, left-< 侧边栏所在的方向 
    closeIco  : "sidebar-back-ico",  // {String} up/right/button/left 关闭按钮图标样式 
    mainTitle : "主标题",              // {String|jQuery|DOM} any 主标题 
    subTitle  : "副标题",              // {String|jQuery|DOM} any 副标题 
    width     : 0.6,                  // {Number} 0.1~1.0之间时使用百分比, 否则使用像素单位 容器占整个屏幕的宽度, 高度总是100% 
  });
  
});