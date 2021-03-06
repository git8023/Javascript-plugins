/*
 * https://github.com/git8023/Javascript-plugins/
 */
/**
 * 上下布局
 * 
 * @param $ctnr {jQuery} 布局器外部容器
 * @param debug {Boolean} true-开启调试模式
 */
function UDLayout($ctnr, debug) {
  if (Validator.isNotJQuery($ctnr)) throw new Error("Invalid container, must instance of jQuery");
  if (!(this instanceof arguments.callee)) return new arguments.callee($ctnr, debug);
  var $thisObj  = this,
      _conf     = {
                    ctnr  : $($ctnr),     // 外部容器
                    $up   : null,         // 顶部容器
                    $down : null,         // 底部容器
                  },
      _events   = {
                    completed : null,     // 初始化完成后
                  },
      _styles   = {
                    CONTAINER       : "layout-ud-container",  // 外部容器
                    TOP_CONTAINER   : "layout-top",           // 顶部容器
                    DOWN_CONTAINER  : "layout-down",          // 底部容器
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
   * @param topHeight {Number} 顶部容器高度; 0.1~1.0之间时使用百分比, 大于1时使用像素单位
   * @returns {UDLayout}
   */
  this.init = function(topHeight){
    log("start initial layout");
    var usePx = (0>topHeight&&topHeight>1),
        unit  = usePx?"px":"%",
        maxH  = (usePx?_conf.ctnr.height():100)-0,
        uH    = usePx?topHeight:(topHeight*100),
        dH    = maxH-uH,
        ctnr  = _conf.ctnr.addClass(_styles.CONTAINER);
    log("top height["+(uH+unit)+"], down height["+(dH+unit)+"]");

    log("query top container["+_styles.TOP_CONTAINER+"]");
    _conf.$up = getContainer(ctnr, _styles.TOP_CONTAINER)
                  .css({
                    "height"    : uH+unit,
                    "width"     : "100%",
                    "display"   : "block",
                    "overflow"  : "hidden"
                  });

    log("query top container["+_styles.DOWN_CONTAINER+"]");
    _conf.$down = getContainer(ctnr, _styles.DOWN_CONTAINER)
                    .css({
                      "height"    : dH+unit,
                      "width"     : "100%",
                      "display"   : "block",
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