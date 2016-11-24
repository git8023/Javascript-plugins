/**
 * 侧边栏, 一个对象代表一个侧边栏
 * @returns {SideBar}
 */
function SideBar() {
  if (!(this instanceof arguments.callee)) return new arguments.callee();
  var $thisObj  = this,
      _conf     = {
                    direction   : "left",       // 方向, up/right/button/left
                    closeIco    : null,         // 返回图标, <,>,Λ,V
                    mainTitle   : "main title", // 主标题
                    subTitle    : "sub title",  // 副标题
                    width       : 1,            // 宽度, 0.1~1.0之间时使用百分比, 否则使用像素单位
                    $ctnr       : null,         // 主容器
                    $head       : null,         // 标题容器
                    $hIco       : null,         // 返回容器
                    $hMainTitle : null,         // 主标题
                    $hSubTitle  : null,         // 副标题
                    $body       : null,         // 内容容器
                    $footer     : null,         // 底部容器
                  },
      _events   = {},
      _styles   = {
                    CONTAINER         : "sidebar",              // 主容器样式
                    HEADER_CONTAINER  : "sidebar-head",         // 头部容器
                    HEADER_BACK_ICO   : "sidebar-back",         // 头部返回图标容器
                    HEADER_MAIN_TITLE : "sidebar-title-main",   // 主标题
                    HEADER_SUB_TITLE  : "sidebar-title-sub",    // 副标题
                    MAIN_BODY         : "sidebar-body",         // 内容容器
                    FOOTER            : "sidebar-footer",       // 底部容器
                    NO_SCROLL         : "sidebar-hidden-scroll" // body隐藏滚动条
                  };

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
   *    <td>CSS Class样式, <br>默认值:up-Λ, right->, down-V, left-<</td>
   *    <td>侧边栏所在的方向</td>
   * </tr>
   * <tr>
   *    <td>closeIco</td>
   *    <td>{String}</td>
   *    <td>up/right/button/left</td>
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
      _conf.$ctnr.width(size+unit);
      break;
    default:
      _conf.$ctnr.height(size+unit);
    }

    // 设置内容
    _conf.$hMainTitle.append(_conf.mainTitle);
    _conf.$hSubTitle.append(_conf.subTitle);

    return $thisObj;
  };

  // Body是否可以滚动
  function bodyEnabledScroll(enabled){
    enabled?$("body,html").removeClass(_styles.NO_SCROLL):$("body,html").addClass(_styles.NO_SCROLL);
  }

  // 注册事件
  function registerEvent(){
    _conf.$hIco.click(function(e){
      switch(_conf.direction){
      case "left":
      case "right":
        var w = _conf.$ctnr.width();
        _conf.$ctnr.animate({
          right : -w
        }, function(){
          bodyEnabledScroll(true);
          _conf.$ctnr.hide();
        }).attr("data-right", w);
        break;
      default:
        var h = _conf.$ctnr.height();
        _conf.$ctnr.animate({
          top : -h
        }, function(){
          bodyEnabledScroll(true);
          _conf.$ctnr.hide();
        }).attr("data-right", h);
      }
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

  return this;
}
