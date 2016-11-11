/*
 * https://github.com/git8023/Javascript-plugins/
 */
/**
 * 滑动器, $ctnr>ul>li>img.item
 * @param $ctnr {jQuery} 容器
 * @param debug {Boolean} true-开启调试模式
 */
function Slider($ctnr, debug) {
  if (!(this instanceof arguments.callee)) return new arguments.callee($ctnr);
  var $thisObj  = this,
      _attrs    = {
                   speed  : function(){
                     var speed = _conf.container.attr("slider-speed")-0;
                     !isNaN(speed) && (0<speed) && (_conf.speed=speed);
                     return _attrs;
                   },
                   pause  : function(){
                     var pause = _conf.container.attr("slider-pause")-0;
                     !isNaN(pause) && (0<pause) && (_conf.pause=pause);
                     return _attrs;
                   },
                   scrollOffset  : function(){
                     var scrollOffset = _conf.container.attr("slider-scroll-offset")-0;
                     !isNaN(scrollOffset) && (0<=scrollOffset) && (_conf.scrollOffset=scrollOffset);
                     return _attrs;
                   },
                   offsetSpeed    : function(){
                     var scrollSpeed = _conf.container.attr("slider-offset-speed")-0;
                     !isNaN(scrollSpeed) && (0<=scrollSpeed) && (_conf.offsetSpeed=scrollSpeed);
                     return _attrs;
                   }
                  },
      _conf     = {
                    speed         : 700,        // 项切换速度:ms
                    pause         : 2500,       // 项停留时间:ms
//                    flow          : "left",     // 切换模式: up/down/left/right
//                    fillRule      : "auto",     // 填充规则: auto/width/height
                    autoPlay      : false,      // 自动播放: true/false
                    container     : $($ctnr),   // 原始容器
                    currItemCtnr  : null,       // 当前展示的图片
                    banner        : null,       // 横幅容器
                    scrollOffset  : 150,        // 滚动修改缓冲值
                    offsetSpeed  : 500,        // 缓冲值修复时长
                    timer         : null,       // 定时器
                  },
      _events   = {
                    completed : null,     // 初始化完成后事件, context:Slider
                    swapping  : null,     // 项切换前事件, context:Slider, parameter:$current,$next
                    swapped   : null,     // 项切换后事件, context:Slider, parameter:$current
                    pause     : null,     // 暂停事件, context:Slider, parameter:$current
                    play      : null,     // 播放事件, context:Slider
                  },
      _style    = {
                    TOP_CONTAINER   : "slider-container",       // 顶层容器
                    BANNER_WINDOW   : "slider-banner-window",   // 项目列表容器
                    LIST_CONTAINER  : "slider-list-container",  // 项目列表容器
                    ITEM_CONTAINER  : "slider-item-container",  // (图片)项目容器
                    ITEM            : "slider-item",            // (图片)项目
                    CURRENT         : "slider-item-current",    // 当前展示的项
                  };

  /**
   * 事件注册
   * @param sliderEventBuilder {SliderEventBuilder} 事件构建器
   * @returns {Slider}
   */
  this.registerEvents = function(sliderEventBuilder){
    if (sliderEventBuilder instanceof SliderEventBuilder) {
      var events = sliderEventBuilder.build();
      Utils.each(_events, function(fn,name){
        var fn = events[name];
        Validator.isFunction(fn) && (_events[name]=fn);
      });
    }
    return $thisObj;
  };

  /**
   * 初始化
   */
  this.init = function(){
    insertStyle();
    _conf.container.addClass(_style.TOP_CONTAINER)
    _conf.banner = _conf.container.find(">div").addClass(_style.BANNER_WINDOW)
    _conf.banner
      .find("ul").addClass(_style.LIST_CONTAINER)
      .find("li").addClass(_style.ITEM_CONTAINER)
      .find("img").addClass(_style.ITEM);

    // 第一张图片复制一个在最后
    _conf.banner.find("."+_style.ITEM_CONTAINER+":first")
      .clone()
      .appendTo(_conf.banner.find("."+_style.LIST_CONTAINER));

    _conf.banner
      .find("."+_style.ITEM).width(_conf.container.width())
      .hover(function(){
        // 暂停
        clearInterval(_conf.timer);
        Validator.isFunction(_events.pause) && _events.pause.call($thisObj);
      },$thisObj.play);

    resetBanner();
    _conf.banner.find("."+_style.ITEM_CONTAINER).each(function(){$(this).attr("offset-left", $(this).offset().left);});
    _conf.currItemCtnr = _conf.banner.find("."+_style.ITEM_CONTAINER+":eq(0)").addClass(_style.CURRENT);
    _conf.autoPlay && $thisObj.play();

    // 创建完成后事件
    var fn = _events.completed;
    Validator.isFunction(fn) && fn.call($thisObj);

    return $thisObj;
  };

  /** 从控件中读取配置 */
  this.conf=function(){
    _attrs.speed().pause().scrollOffset().offsetSpeed();
    $thisObj.init().play();
    return $thisObj;
  };

  /**
   * 开始播放
   * @returns {Slider}
   */
  this.play = function(){
    var fn = _events.play;
    if(Validator.isFunction(fn) && (false==fn.call($thisObj)))
      return;

    _conf.timer = setInterval(function(){
      scrollToNext();
    }, _conf.pause);
  };

  // 滚动至下一个项
  function scrollToNext() {
    var itemCount     = _conf.banner.find("."+_style.ITEM_CONTAINER).size(),
        currIdx       = _conf.currItemCtnr.index(),
        lasted        = (currIdx==itemCount-1),
        nextIdx       = lasted?0:(currIdx+1),
        offset        = (0==nextIdx)?0:_conf.scrollOffset,
        bannerOffset  = _conf.banner.offset().left;
    _conf.banner.find("."+_style.CURRENT).removeClass(_style.CURRENT);

    // 切换前
    var oldItem = _conf.currItemCtnr,
        fn      = _events.swapping;
    _conf.currItemCtnr = _conf.banner.find("."+_style.ITEM_CONTAINER+":eq("+nextIdx+")").addClass(_style.CURRENT);
    if (Validator.isFunction(fn) && (false==fn.call($thisObj, oldItem, _conf.currItemCtnr)))
      return;

    _conf.banner.animate({
      scrollLeft  : _conf.currItemCtnr.attr("offset-left")-bannerOffset+offset
    }, _conf.speed, function(){

      _conf.banner.animate({
        scrollLeft:_conf.banner.scrollLeft()-offset
      }, _conf.offsetSpeed, function(){

        // 最后一张定位到第一张
        if ((itemCount-2)==currIdx) {
          _conf.banner.find("."+_style.CURRENT).removeClass(_style.CURRENT);
          _conf.currItemCtnr = _conf.banner.find("."+_style.ITEM_CONTAINER+":eq(0)").addClass(_style.CURRENT);
          _conf.banner.scrollLeft(0);
        }

        // 切换后
        Validator.isFunction(_events.swapped) && _events.swapped.call($thisObj);
      });
    });
  }

  /**
   * 设置或获取当前项下标
   * @param index {Number} 下标值
   * @returns {Number} index非法时,获取当前展示的项下标. 否则返回index
   */
  this.currItem = function(index) {
    _index = parseInt(index);
    if ((0<=_index) && (index==_index)) return scrollTo(_index);
    if(!_conf.currItemCtnr)
      _conf.currItemCtnr = _conf.container.find("."+_style.ITEM_CONTAINER+":first").addClass(_style.CURRENT);
    return _conf.currItemCtnr;
  }

  // 重置横幅宽度
  function resetBanner(){
    var banner  = _conf.container.find("." + _style.BANNER_WINDOW),
        imgs    = banner.find("img"),
        width   = -1,
        height  = -1;
    imgs.each(function(){
      var $this = $(this),
          h     = parseFloat($this.height()),
          w     = parseFloat($this.width());
      (w>width)&&(width=w);
      (h>height)&&(height=h);
    });
    banner.width(width);
    banner.height(height);
  }

  // 插入样式表
  function insertStyle(){
    var $style  = $("<style/>",{
      id:"slider"
    }).appendTo($("head"));

    var topCss = "." + _style.TOP_CONTAINER+",."+_style.TOP_CONTAINER + " ul"+",."+_style.TOP_CONTAINER + " li";
    $style.append(createClass(topCss, {"padding":"0", "margin":"0", "list-style":"none"}));
    $style.append(createClass("."+_style.BANNER_WINDOW, {"overflow":"hidden"}));
    $style.append(createClass("."+_style.LIST_CONTAINER, {"width":"1000%"}));
    $style.append(createClass("."+_style.ITEM_CONTAINER, {"display":"inline"}));
  }

  // 创建样式字符串, <style/>内部数据
  function createClass(name, css){
    var cssStr = $("<div/>").css(css||{}).attr("style");
    return name+"{"+cssStr+"}";
  }

  return this;
}
(function($){
  $.fn.slider=function(debug){return new Slider($(this), debug).conf();};
})(jQuery);