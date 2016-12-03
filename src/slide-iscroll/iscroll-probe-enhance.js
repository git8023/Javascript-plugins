/*
 * 当前增强版针对IScroll版本: v5.1.3 iscroll-probe
 * github: https://github.com/git8023/Javascript-plugins/
 */
/**
 * IScroll包装增强工具, 实现目的为新增4个边界滑动事件:<br>
 * <ul>
 * <li>boundary: 边界外滑动事件</li>
 * <li>moving: 边界内滑动事件</li>
 * <li>boundary: 超出边界事件监听</li>
 * <li>slideDown: 下拉事件监听(越界下拉事件)</li>
 * <li>slideUp: 上拉事件监听(越界上拉事件)</li>
 * </ul>
 * 
 * @param _iScroll
 *          {IScroll} 滚动对象, 必须指定probeType==3
 * @param _offsetHeight
 *          {Number} 触发事件需要滑动的对象高度, 单位:px
 * @returns {IScrollWrapper} 包装增强工具
 */
function IScrollWrapper(_iScroll, _offsetHeight) {
  var callee = arguments.callee;
  if (!(this instanceof callee)) return new arguments.callee(_iScroll, _offsetHeight);
  var $thisObj  = this, 
      _conf     = {
                    iScroll : _iScroll,
                    offset  : _offsetHeight
                  }, 
      _events   = {
                    boundary  : function(direction){log("active boundary: "+direction);},  // 到达边界线
                    moving    : function(direction){log("moving: "+ direction);},           // 超出边界但不够指定位置
                    slideDown : function(){log("slideDown: "+ JSON.stringify(arguments));},        // 下拉
                    slideUp   : function(){log("slideUp: "+ JSON.stringify(arguments));},          // 上拉
                  },
      _keys     = {
                    DOWN  : "down",
                    UP    : "up",
                    STOP  : "stop"
                  };

  /**
   * 注册事件
   * 
   * @param events {Object} 可配置事件项
   * <table border="1">
   * <tr>
   *  <th>事件名</th>
   *  <th>参数</th>
   *  <th>返回值</th>
   *  <th>说明</th>
   * </tr>
   * <tr>
   *  <td>boundary</td>
   *  <td>direction{String}[down|up] 移动方向</td>
   *  <td>-/-</td>
   *  <td>滑动超出边界外时</td>
   * </tr>
   * <tr>
   *  <td>moving</td>
   *  <td>direction{String}[down|up|stop] 移动方向</td>
   *  <td>-/-</td>
   *  <td>移动时执行(包括边界内)</td>
   * </tr>
   * <tr>
   *  <td>slideDown</td>
   *  <td>-/-</td>
   *  <td>-/-</td>
   *  <td>下拉事件, 至少需要触发boundary事件</td>
   * </tr>
   * <tr>
   *  <td>slideUp</td>
   *  <td>-/-</td>
   *  <td>-/-</td>
   *  <td>上拉事件, 至少需要触发boundary事件</td>
   * </tr>
   * </table>
   * @returns {this}
   */
  this.registerEvents = function(events) {
    for (var i in _events)
      if (events[i] instanceof Function)
        _events[i] = events[i];
  };

  (function(){
    _conf.iScroll.on("scroll", scroll);
    _conf.iScroll.on("scrollEnd", scrollEnd);
  })();

  // 滚动时
  function scroll(){
    var OFFSET_HEIGHT = _conf.offset;
    if (this.y > OFFSET_HEIGHT)
      _events.boundary(this.directionType=_keys.DOWN);
    else if (this.y > 0)
      _events.moving(this.movingType=_keys.DOWN);
    else if (this.y < (this.maxScrollY-OFFSET_HEIGHT)) 
      _events.boundary(this.directionType=_keys.UP);
    else if (0 > this.y) 
      _events.moving(this.movingType=_keys.UP);

    var y = parseInt(this.y);
    if (0==y || y==this.maxScrollY){
      _events.moving(this.movingType=_keys.STOP);
      this.movingType = null;
    }
  }

  // 滚动停止
  function scrollEnd(e){
    switch(this.directionType) {
    case _keys.DOWN:
      _events.slideDown.apply(this);
      break;
    case _keys.UP:
      _events.slideUp.apply(this);
      break;
    }
    this.directionType = null;
  }

  // 日志记录
  function log(msg) {
    (msg instanceof Object) && (msg=JSON.strigify(msg));
    console?console.log(msg):alert(msg);
  }

  return this;
}