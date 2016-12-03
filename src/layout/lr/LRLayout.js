/*
 * https://github.com/git8023/Javascript-plugins/
 */
/**
 * 左右布局
 * 
 * @param $ctnr {jQuery} 布局器外部容器
 * @param debug {Boolean} true-开启调试模式
 */
function LRLayout($ctnr, debug) {
  if (Validator.isNotJQuery($ctnr)) throw new Error("Invalid container, must instance of jQuery");
  if (!(this instanceof arguments.callee)) return new arguments.callee($ctnr, debug);
  var $thisObj  = this,
      _conf     = {
                    ctnr    : $($ctnr),     // 外部容器
                    $left   : null,         // 左部容器
                    $right  : null,         // 右部容器
                  },
      _events   = {
                    completed : null,     // 初始化完成后
                  },
      _styles   = {
                    CONTAINER       : "layout-container",  // 外部容器
                    LEFT_CONTAINER  : "layout-left",          // 左部容器
                    RIGHT_CONTAINER : "layout-right",         // 右部容器
                  };

  /**
   * 注册事件
   * @param {Object} 事件对象<br>
   * <table>
   *  <tr>
   *    <th>事件名</th>
   *    <th>参数</th>
   *    <th>返回值</th>
   *    <th>说明</th>
   *  </tr>
   *  <tr>
   *    <td>completed</td>
   *    <td>-/-</td>
   *    <td>-/-</td>
   *    <td>初始化完成后</td>
   *  </tr>
   * </table>
   * @returns {UDLayout}
   */
  this.registerEvents = function(events){
    Utils.each(_events, function(fn,k){Validator.isFunction(events[k]) && (_events[k]=events[k]);});
    return $thisObj;
  };

  /**
   * 布局初始化
   * @param leftWidth {Number} 顶部容器高度; 0.1~1.0之间时使用百分比, 大于1时使用像素单位
   * @returns {UDLayout}
   */
  this.init = function(leftWidth){
    log("start initial layout");
    var usePx = leftWidth>1,
        unit  = usePx?"px":"%",
        maxW  = (usePx?_conf.ctnr.width():100)-0,
        lW    = usePx?leftWidth:(leftWidth*100),
        rW    = maxW-lW,
        ctnr  = _conf.ctnr.addClass(_styles.CONTAINER);
    log("top height["+(lW+unit)+"], down height["+(rW+unit)+"]");

    log("query left container["+_styles.LEFT_CONTAINER+"]");
    _conf.$left = getContainer(ctnr, _styles.LEFT_CONTAINER)
                    .css({
                      "width"     : lW+unit,
                      "display"   : "inline-block",
                      "height"    : "100%",
                      "float"     : "left",
                      "overflow"  : "hidden"
                     });

    log("query right container["+_styles.RIGHT_CONTAINER+"]");
    _conf.$right = getContainer(ctnr, _styles.RIGHT_CONTAINER)
                    .css({
                      "width"     : rW+unit,
                      "display"   : "inline-block",
                      "height"    : "100%",
                      "clear"     : "both",
                      "overflow"  : "hidden"
                     });

    if (Validator.isFunction(_events.completed)){
      log("invoke completed event function.");
      _events.completed.call($thisObj);
    }

    log("initial layout completed.");
    return $thisObj;
  };

  // 获取指定容器, 不存在时创建
  function getContainer(ctnr, styleClass){
    var tmp = ctnr.find("."+styleClass);
    (!tmp.size()) && (tmp=$("<div/>").addClass(styleClass).appendTo(ctnr));
    return tmp;
  }

  // 记录日志
  function log(msg) {
    if (!debug) return;
    else if (msg instanceof Object) console.log(JSON.stringify(msg));
    else console.log(msg);
  }

  return this;
}