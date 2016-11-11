/**
 * 滑动器事件构建器
 */
function SliderEventBuilder() {
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

  /**
   * 获取可配置事件名:
   * completed, swapping, swapped, pause, play
   * @returns {Object} 可配置事件对象, 配置方式: events.completed(eventHandler);...
   */
  this.events = function(){
    return {
        completed : function(fn){return setEvent("completed", fn)},
        swapping  : function(fn){return setEvent("swapping", fn)},
        swapped   : function(fn){return setEvent("swapped", fn)},
        pause     : function(fn){return setEvent("pause", fn)},
        play      : function(fn){return setEvent("play", fn)}
    }
  };

  /**
   * 设置事件
   * @param eventName {String} 事件名
   * @param fn {Function} 事件对象
   * @returns {Function} 已存在的同名事件对象
   */
  function setEvent(eventName, fn){
    if (!(fn instanceof Function)) return;
    var oldFn = events[eventName];
    events[Name] = fn;
    return oldFn;
  }

  return this;
}