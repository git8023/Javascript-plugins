/*
 * https://github.com/git8023/Javascript-plugins/
 */

/**
 * 滑动监听器
 * @param $ctnr {jQuery} 带滚动条的容器
 */
function SlideListener($ctnr) {
  if (!(this instanceof arguments.callee)) return new arguments.callee();
  var $thisObj  = this,
      _conf     = {
                    $ctnr : $($ctnr), // 内容滚动容器
                  },
      _events   = {
                    scroll    : null,   // 滚动时
                    topped    : null,   // 滚动到顶部时
                    bottom    : null,   // 滚动到底部时
                  },
      _style    = {
                    NO_SCROLL : "no-scroll",  // 隐藏滚动条
                  };
  $thisObj.container = _conf.$ctnr;

  /**
   * 注册事件
   * @param events 事件对象, 可配置事件:
   * <table border="1">
   *  <tr>
   *    <th>事件名</th>
   *    <th>参数</th>
   *    <th>返回值</th>
   *    <th>说明</th>
   *  </tr>
   *  <tr>
   *    <td>scroll</td>
   *    <td>-/-</td>
   *    <td>-/-</td>
   *    <td>滚动中事件</td>
   *  </tr>
   *  <tr>
   *    <td>topped</td>
   *    <td>-/-</td>
   *    <td>-/-</td>
   *    <td>滚动到顶部</td>
   *  </tr>
   *  <tr>
   *    <td>bottom</td>
   *    <td>-/-</td>
   *    <td>-/-</td>
   *    <td>滚动到底部</td>
   *  </tr>
   * </table>
   */
  this.registerEvents = function(events){
    Utils.each(_events, function(v, k){Validator.isFunction(events[k]) && (_events[k]=events[k])});
    return $thisObj;
  };

  (function(){
    _conf.$ctnr.scroll(scrollHandler);
    function scrollHandler(e) {
      var $this         = $(this),
          viewHeight    = $this.height(),
          contentHeight = $this[0].scrollHeight,
          scrollVal     = $this.scrollTop();

      // 滚动时
      if (Validator.isFunction(_events.scroll))
        _events.scroll.call($thisObj);

      // 顶部
      var isTop = (0==scrollVal);
      if (isTop && Validator.isFunction(_events.topped))
        _events.topped.call($thisObj);

      // 底部
      var isBottom = (scrollVal==contentHeight-viewHeight);
      if (isBottom && Validator.isFunction(_events.bottom))
        _events.bottom.call($thisObj);
    }
  })();

  return this;
}