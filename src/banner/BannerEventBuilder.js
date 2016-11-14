/*
 * https://github.com/git8023/Javascript-plugins/
 */
/**
 * 滑动器事件构建器
 */
function BannerEventBuilder() {
  if (!(this instanceof arguments.callee)) return new arguments.callee();
  var $thisObj  = this,
      events    = {};

  /**
   * 构建事件对象
   * @returns {Object} 事件对象
   */
  this.build = function(){
    return events;
  }

//  /**
//   * 获取可配置事件名:
//   * <table border="1">
//   * <tr>
//   *    <th>事件名</th>
//   *    <th>参数</th>
//   *    <th>返回值</th>
//   *    <th>说明</th>
//   * </tr>
//   * <tr>
//   *    <td>completed</td>
//   *    <td>-/-</td>
//   *    <td>-/-</td>
//   *    <td>初始化完成后</td>
//   * </tr>
//   * <tr>
//   *    <td>swapping</td>
//   *    <td>$current,$next</td>
//   *    <td>false-停留在当前项目</td>
//   *    <td>项目切换前</td>
//   * </tr>
//   * <tr>
//   *    <td>swapped</td>
//   *    <td>$current</td>
//   *    <td>-/-</td>
//   *    <td>项目切换后</td>
//   * </tr>
//   * <tr>
//   *    <td>pause</td>
//   *    <td>$current</td>
//   *    <td>-/-</td>
//   *    <td>暂停播放</td>
//   * </tr>
//   * <tr>
//   *    <td>play</td>
//   *    <td>-/-</td>
//   *    <td>-/-</td>
//   *    <td>播放</td>
//   * </tr>
//   * </table>
//   * @returns {Object} 可配置事件对象, 配置方式: events.completed(eventHandler);...
//   */
//  this.events = function(){
//    var es = {
//        completed : function(fn){setEvent("completed", fn); return es;},
//        swapping  : function(fn){setEvent("swapping", fn); return es;},
//        swapped   : function(fn){setEvent("swapped", fn); return es;},
//        pause     : function(fn){setEvent("pause", fn); return es;},
//        play      : function(fn){setEvent("play", fn); return es;}
//    };
//    return es;
//  };

  /** 初始化完成后 */
  this.completed=function(fn){setEvent("completed", fn); return $thisObj;};
  /** 项切换前, 参数:$current,$next, 返回值:false-停留在当前项目 */
  this.swapping=function(fn){setEvent("swapping", fn); return $thisObj;};
  /** 项目切换后, 参数:$current */
  this.swapped=function(fn){setEvent("swapped", fn); return $thisObj;};
  /** 暂停播放, 参数:$current */
  this.pause=function(fn){setEvent("pause", fn); return $thisObj;};
  /** 播放后 */
  this.play=function(fn){setEvent("play", fn); return $thisObj;};


  /**
   * 设置事件
   * @param eventName {String} 事件名
   * @param fn {Function} 事件对象
   * @returns {Function} 已存在的同名事件对象
   */
  function setEvent(eventName, fn){
    if (!(fn instanceof Function)) return;
    var oldFn = events[eventName];
    events[eventName] = fn;
    return oldFn;
  }

  return this;
}