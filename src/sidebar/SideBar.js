/**
 * 侧边栏, 一个对象代表一个侧边栏
 * @returns {SideBar}
 */
function Sidebar() {
  if (!(this instanceof arguments.callee)) return new arguments.callee();
  var $thisObj  = this,
      _conf     = {
                    direction   : "left",       // 方向, top/right/bottom/left
                    closeIco    : null,         // 返回图标, <,>,Λ,V
                    mainTitle   : "main title", // 主标题
                    subTitle    : "sub title",  // 副标题
                    width       : 1,            // 宽度, 0.1~1.0之间时使用百分比, 否则使用像素单位
                    speed       : 200,          // 动画执行时间 ms

                    $ctnr       : null,         // 主容器
                    $head       : null,         // 标题容器
                    $hIco       : null,         // 返回容器
                    $hMainTitle : null,         // 主标题
                    $hSubTitle  : null,         // 副标题
                    $body       : null,         // 内容容器
                    $footer     : null,         // 底部容器
                    $screen     : null,         // 遮罩
                  },
      _events   = {
                    opening     : null,   // 打开前
                    opened      : null,   // 打开后
                    closing     : null,   // 关闭前
                    closed      : null,   // 关闭后
                  },
      _styles   = {
                    CONTAINER           : "sidebar",                      // 主容器样式
                    HEADER_CONTAINER    : "sidebar-head",                 // 头部容器
                    HEADER_BACK_ICO     : "sidebar-back",                 // 头部返回图标容器
                    HEADER_MAIN_TITLE   : "sidebar-title-main",           // 主标题
                    HEADER_SUB_TITLE    : "sidebar-title-sub",            // 副标题
                    MAIN_BODY           : "sidebar-body",                 // 内容容器
                    FOOTER              : "sidebar-footer",               // 底部容器
                    NO_SCROLL           : "sidebar-hidden-scroll",        // body隐藏滚动条
                    TRANSPARENT         : "sidebar-transparent",          // 设置为透明的
                    SCREEN              : "sidebar-screen",               // 遮罩
                    NO_BEFORE_OR_AFTER  : "sidebar-no-before-and-after",  // 去除前置或后置内容
                  }
      inited    = false,
      screenId  = "_"+new Date().getTime();
  $thisObj.conf = _conf;

  /**
   * 初始化
   * @param conf 配置项
   * <table border="1">
   * <tr>
   *    <th>参数名</th>
   *    <th>类型</th>
   *    <th>范围</th>
   *    <th>说明</th>
   * </tr>
   * <tr>
   *    <td>direction</td>
   *    <td>{String}</td>
   *    <td>CSS Class样式</td>
   *    <td>侧边栏所在的方向</td>
   * </tr>
   * <tr>
   *    <td>closeIco</td>
   *    <td>{String}</td>
   *    <td>top/right/bottom/left</td>
   *    <td>关闭按钮图标样式</td>
   * </tr>
   * <tr>
   *    <td>mainTitle</td>
   *    <td>{String|jQuery|DOM}</td>
   *    <td>any</td>
   *    <td>主标题</td>
   * </tr>
   * <tr>
   *    <td>subTitle</td>
   *    <td>{String|jQuery|DOM}</td>
   *    <td>any</td>
   *    <td>副标题</td>
   * </tr>
   * <tr>
   *    <td>width</td>
   *    <td>{Number}</td>
   *    <td>0.1~1.0之间时使用百分比, 否则使用像素单位</td>
   *    <td>容器占整个屏幕的宽度, 高度总是100%</td>
   * </tr>
   * <tr>
   *    <td>speed</td>
   *    <td>{Number}</td>
   *    <td>any</td>
   *    <td>动画执行时长</td>
   * </tr>
   * </table>
   */
  this.init = function(conf) {
    // 配置
    (conf instanceof Object)&&Utils.eachValue(_conf, function(v,k){_conf[k]=conf[k]||v;});

    // 设置容器
    _conf.$ctnr       = $(createTemporary());
    _conf.$head       = _conf.$ctnr.find("."+_styles.HEADER_CONTAINER);
    _conf.$hIco       = _conf.$ctnr.find("."+_styles.HEADER_BACK_ICO);
    _conf.$hMainTitle = _conf.$ctnr.find("."+_styles.HEADER_MAIN_TITLE);
    _conf.$hSubTitle  = _conf.$ctnr.find("."+_styles.HEADER_SUB_TITLE);
    _conf.$body       = _conf.$ctnr.find("."+_styles.MAIN_BODY);
    _conf.$footer     = _conf.$ctnr.find("."+_styles.FOOTER);
    _conf.$screen     = $("<div/>").addClass(_styles.SCREEN).appendTo($("body"));
    _conf.$ctnr.addClass(_conf.direction);
    _conf.$ctnr.appendTo($("body"));
    bodyEnabledScroll(false);
    registerEvent();

    // 设置尺寸
    var usePx = !(0<_conf.width && _conf.width<=1),
        unit  = usePx?"px":"%",
        size  = usePx?_conf.width:(100*_conf.width);
    switch(_conf.direction){
    case "left":
    case "right":
      _conf.$ctnr.css("width", size+unit);
      break;
    default:
      _conf.$ctnr.css("height", size+unit);
    }
    _conf.$body.height(_conf.$ctnr.height()-_conf.$head.height());
    $(window).resize(function(){
      _conf.$body.height(_conf.$ctnr.height()-_conf.$head.height());
    });

    // 设置内容
    _conf.$hMainTitle.append(_conf.mainTitle);
    _conf.$hSubTitle.append(_conf.subTitle);

    // 隐藏
    _conf.$ctnr.addClass(_styles.TRANSPARENT);
    _conf.$hIco.click();

    setTimeout(function(){inited=true;}, _conf.speed+100);
    return $thisObj;
  };

  // Body是否可以滚动
  function bodyEnabledScroll(enabled){
    if(enabled){
      $("body,html").removeClass(_styles.NO_SCROLL);
      _conf.$ctnr.removeClass(_styles.TRANSPARENT);
    } else {
      $("body,html").addClass(_styles.NO_SCROLL);
    }
  }

  /**
   * 注册事件
   * @param events 事件配置
   * <table border="1">
   *  <tr>
   *    <th>事件名</th>
   *    <th>参数</th>
   *    <th>返回值</th>
   *    <th>说明</th>
   *  </tr>
   *  <tr>
   *    <td>opening</td>
   *    <td>-/-</td>
   *    <td>false-阻止打开</td>
   *    <td>侧边栏打开前</td>
   *  </tr>
   *  <tr>
   *    <td>opened</td>
   *    <td>-/-</td>
   *    <td>-/-</td>
   *    <td>侧边栏打开后</td>
   *  </tr>
   *  <tr>
   *    <td>closing</td>
   *    <td>-/-</td>
   *    <td>false-阻止关闭</td>
   *    <td>侧边栏关闭前</td>
   *  </tr>
   *  <tr>
   *    <td>closed</td>
   *    <td>-/-</td>
   *    <td>-/-</td>
   *    <td>侧边栏关闭后</td>
   *  </tr>
   * </table>
   * @returns {this}
   */
  this.registerEvents = function(events){
    (events instanceof Object)&&Utils.eachValue(_events, function(fn,k){
      Validator.isFunction(events[k])&&(_events[k]=events[k]);
    });
    return $thisObj;
  };

  /**
   * 显示侧边栏
   * @returns {this}
   */
  this.show = function(){
    // 侧边栏打开前
    var r = Utils.invoke($thisObj, _events.opening);
    if (false === r) return;

    _conf.$screen.show();
    bodyEnabledScroll(false);
    _conf.$ctnr.show();
    var param = {};
    param[_conf.direction]=0;
    _conf.$ctnr.animate(param, _conf.speed, function(){
      Utils.invoke($thisObj, _events.opened);
    });
    return $thisObj;
  }

  /**
   * 隐藏侧边栏
   * @returns {this}
   */
  this.hide = function(){
    _conf.$hIco.click();
    return $thisObj;
  }

  // 注册事件
  function registerEvent(){
    _conf.$screen.click(function(){_conf.$hIco.click();});
    _conf.$hIco.click(function(e){
      e.stopPropagation();
      if (inited) {
        var r = Utils.invoke($thisObj, _events.closing);
        if (false === r) return;
      }

      var size;
      switch(_conf.direction){
      case "left":
      case "right":
        size = _conf.$ctnr.width();
        break;
      case "top":
      case "bottom":
        size = _conf.$ctnr.height();
        break;
      }

      var param = {};
      param[_conf.direction] = -size;
      _conf.$ctnr.attr("data-size", size).animate(param, _conf.speed, function(){
        bodyEnabledScroll(true);
        _conf.$ctnr.hide();
        _conf.$screen.hide();
        inited && Utils.invoke($thisObj, _events.closed);
      });
    });
  }

  // 创建模板
  function createTemporary(){
    return "<div class='"+_styles.CONTAINER+"'>"
         + "  <div class='"+_styles.HEADER_CONTAINER+"'>"
         + "    <div class='"+_styles.HEADER_BACK_ICO+"'></div>"
         + "    <div class='"+_styles.HEADER_MAIN_TITLE+"'></div>"
         + "    <div class='"+_styles.HEADER_SUB_TITLE+"'></div>"
         + "  </div>"
         + "  <div class='"+_styles.MAIN_BODY+"'></div>"
         + "  <div class='"+_styles.FOOTER+"'></div>"
         + "</div>";
  }

  /**
   * 设置图标
   * @param ico {String|jQuery|DOM} 图标
   * @returns {jQuery} 图标控件
   */
  this.setIco = function(ico){return _conf.$hIco.html("").append(ico).addClass(_styles.NO_BEFORE_OR_AFTER);};

  /**
   * 设置主标题
   * @param mainTitle {String|jQuery|DOM} 主标题
   * @returns {jQuery} 主标题控件
   */
  this.setMainTitle = function(mainTitle){return _conf.$hMainTitle.html("").append(mainTitle);};

  /**
   * 设置副标题
   * @param subTitle {String|jQuery|DOM} 副标题
   * @returns {jQuery} 副标题控件
   */
  this.setSubTitle = function(subTitle){return _conf.$hSubTitle.html("").append(subTitle);};

  /**
   * 设置主体内容
   * @param $body {jQuery|String} 主体内容, 内容为字符串时解析为远程加载URL
   * @param hasProject {Boolean} 需要远程加载数据时, 需要指定URL中是否需要包含项目名(端口号后第一个文档结构)
   * @returns {jQuery} 主体内容控件
   */
  this.setBody = function($body, hasProject) {
    var body = _conf.$body.html("");
    if (Validator.isJQuery($body)) body.append($body);
    else if("string" == typeof $body) body.load(Utils.getRealUrl($body, !!hasProject));
    return body;
  };

  /**
   * 重置高度分配
   * @returns {this}
   */
  this.refresh = function(){
    var maxH    = _conf.$ctnr.height(),
        topH    = _conf.$head.height(),
        footerH = _conf.$footer.height();
    _conf.$body.height(maxH-topH-footerH);
    return $thisObj;
  }

  return this;
}
