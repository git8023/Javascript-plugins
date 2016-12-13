/* iScroll-zoom.js: v5.1.3 github(https://github.com/git8023/Javascript-plugins) */
/**
 * 滚动横幅, 推荐用作查看而不是自动横幅滚动(自动横幅滚动可使用 /banner/Banner.js)
 * @version v0.0.1
 */
function IScrollBanner() {
  if (!(this instanceof arguments.callee)) return new arguments.callee();
  var $thisObj  = this,
      _conf     = {
                    $ctnr       : null,   // 外部容器
                    $wrapper    : null,   // 可视窗口
                    $scroll     : null,   // 可滚动内容
                    iscroll     : null,   // 滚动对象
                    zooms       : [],     // 缩放
                  },
      _style    = {
                    CONTAINER : "___banner-container",
                    WRAPPER   : "___banner-wrapper",
                    SCROLL    : "___banner-scroll"
                  };
  $thisObj.conf = _conf;

  /**
   * 初始化
   * @param srcArr {Array} 图片列表
   * @returns {this}
   */
  this.init = function(srcArr){
    if (Validator.isNotArray(srcArr) || !srcArr.length) throw new Error("Invalid parameters[srcArr], must be instance of Array.");
    _conf.$ctnr     = $(template());
    _conf.$wrapper  = _conf.$ctnr.find("."+_style.WRAPPER);
    _conf.$scroll   = _conf.$ctnr.find("."+_style.SCROLL);
    Utils.eachValue(srcArr, function(src){
      var item    = $("<li/>").css({"display":"inline-block", height:"100%", "overflow":"hidden"}).appendTo(_conf.$scroll),
          img     = $("<img/>").appendTo(item);
      img.load(function(){
        $(this).css((this.width<this.height)?"max-height":"max-width", "100%");
      }).attr({src:src});

      var zoom = new IScroll(item[0],{
        zoom        : true,
        scrollX     : true,
        scrollY     : true,
        mouseWheel  : true,
        freeScroll  : true,
        wheelAction : 'zoom'
      }).on("zoomEnd", function(){
        var enableScroll = (1==this.scale);
        if (enableScroll){initIscroll(time).scrollToElement(this.wrapper,0);return;}
        if (_conf.iscroll) {
          _conf.iscroll.destroy(); 
          _conf.iscroll=null;
        }
      });
      _conf.zooms.push(zoom);
    });

    var screen = Utils.screen();
    _conf.$ctnr.css({"height":screen.height, overflow:"hidden", "z-index":"9999999"});
    _conf.$scroll.find(">li").css({"height":screen.height, overflow:"hidden", width:screen.width});
    _conf.$scroll.css({"width":screen.width*srcArr.length, "height":screen.height});

    _conf.$ctnr.appendTo($("body").attr("style","overflow:hidden;"));

    initIscroll();
    return $thisObj;
  };

  // 初始化外部滚动
  function initIscroll(){
    _conf.iscroll = new IScroll(_conf.$wrapper[0],{
      scrollX     : true, 
      scrillY     : false, 
      snap        : true
    });

    return _conf.iscroll;
  }

  // 模板
  function template(){
    return "<div class='"+_style.CONTAINER+"'>"
            + "<div class='"+_style.WRAPPER+"'>"
              + "<ul class='"+_style.SCROLL+"'/>"
            +"</div>"
          +"</div>"
 }

  /** 释放资源 */
  this.destroy = function(){
    _conf.$ctnr && _conf.$ctnr.remove();
    _conf.iscroll && _conf.iscroll.destroy();
    $("body").rmeoveAttr("style");
  }

  return;
}
IScrollBanner.instance = new IScrollBanner();