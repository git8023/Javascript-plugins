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
                  },
      _event    = {
                    beforeAppend    : null, // 图片添加到容器前, 返回false-跳过追加
                    afterAppend     : null, // 图片添加到容器后, 返回false-禁止当前图片放大
                  };
  $thisObj.conf = _conf;

  /**
   * 事件注册
   * @param events 事件对象
   * <table border="1">
   *   <tr>
   *    <th>事件名</th>
   *    <th>参数</th>
   *    <th>返回值</th>
   *    <th>说明</th>
   *   </tr>
   *   <tr>
   *    <td>beforeAppend</td>
   *    <td>$img{jQuery}-当前图片</td>
   *    <td>false-不追加当前图片</td>
   *    <td>图片追前</td>
   *   </tr>
   *   <tr>
   *    <td>afterAppend</td>
   *    <td>$img{jQuery}-当前图片</td>
   *    <td>false-当前图片不允许缩放</td>
   *    <td>图片追后</td>
   *   </tr>
   * </table>
   * @returns {IScrollBanner}
   */
  this.registerEvents = function(events){
    events = events||{};
    Utils.eachValue(_event, function(fn, k){Validator.isFunction(events[k]) && (_event[k]=events[k])});
    return $thisObj;
  };

  /**
   * 从指定容器中初始化
   * @param $imgContainer {jQuery} 图片容器
   * @param filter {Function} 过滤器, 参数:$img, 返回值:false-过滤当前图片
   * @returns {IScrollBanner}
   */
  this.initByContainer = function($imgContainer, filter){
    var srcArr  = [],
        ctnr    = $($imgContainer),
        filter  = Validator.isFunction(filter)?filter:function(){};
    ctnr.find("img").each(function(){(false!=filter.call(this, $(this))) && srcArr.push(this.src)});
    return $thisObj.init(srcArr);
  }

  /**
   * 初始化
   * @param srcArr {Array} 图片列表
   * @returns {IScrollBanner}
   */
  this.init = function(srcArr){
    if (Validator.isNotArray(srcArr) || !srcArr.length) throw new Error("Invalid parameters[srcArr], must be instance of Array.");
    _conf.$ctnr     = $(template());
    _conf.$wrapper  = _conf.$ctnr.find("."+_style.WRAPPER);
    _conf.$scroll   = _conf.$ctnr.find("."+_style.SCROLL);
    Utils.eachValue(srcArr, function(src, idx){
      idx = parseInt(idx);
      var item    = $("<li/>").css({"display":"inline-block", height:"100%", "overflow":"hidden"}),
          img     = $("<img/>").appendTo(item);
      img.load(function(){
        $(this).css((this.width<this.height)?"max-height":"max-width", "100%");
      }).attr({src:src});

      if (Validator.isFunction(_event.beforeAppend) && false == _event.beforeAppend.call($thisObj, item, idx))return true;
      item.appendTo(_conf.$scroll);

      if (Validator.isFunction(_event.afterAppend) && false == _event.afterAppend.call($thisObj, item, idx))return true;
      var zoom = new IScroll(item[0],{
        zoom        : true,
        scrollX     : true,
        scrollY     : true,
        mouseWheel  : true,
        freeScroll  : true,
        wheelAction : 'zoom'
      }).on("zoomEnd", function(){
        var enableScroll = (1==this.scale);
        if (enableScroll){initIscroll().scrollToElement(this.wrapper,0);return;}
        if (_conf.iscroll) {
          _conf.iscroll.destroy(); 
          _conf.iscroll=null;
        }
      });
      _conf.zooms.push(zoom);
    });

    var screen = Utils.screen();
    _conf.$ctnr.css({"height":screen.height, overflow:"hidden", "z-index":"9999999"});
    var items = _conf.$scroll.find(">li").css({"height":screen.height, overflow:"hidden", width:screen.width});
    _conf.$scroll.css({"width":screen.width*items.size(), "height":screen.height});
    _conf.$ctnr.appendTo($("body").attr("style","overflow:hidden;"));
    initIscroll();
    return $thisObj;
  };

  // 初始化外部滚动
  function initIscroll(){
    _conf.iscroll = new IScroll(_conf.$wrapper[0],{
      scrollX     : true, 
      scrollY     : false,
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
    $("body").removeAttr("style");
  }

  return;
}
IScrollBanner.instance = new IScrollBanner();