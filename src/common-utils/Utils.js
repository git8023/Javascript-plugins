/** 校验工具 */
var Validator = {
  isFunction: function(fn) {return (fn instanceof Function);},
  isNotFunction: function(fn) {return !Validator.isFunction(fn);},

  isArray: function(arr) {return (arr instanceof Array);},
  isNotArray: function(arr) {return !Validator.isArray(arr);},

  isObject:function(obj){return obj instanceof Object;},
  isNotObject:function(obj){return !Validator.isObject(obj);},

  isJQuery:function(obj){return (obj instanceof jQuery);},
  isNotJQuery:function(obj){return !Validator.isJQuery(obj);},

  isString:function(str){return /^string$/i.test(typeof str);},
  isNotString:function(str){return !Validator.isString(str);},
};

/** 通用工具 */
var Utils = {
  /**
   * 数组, 对象属性遍历
   * @param obj {Array|Object} 目标对象
   * @param fn {Function} 属性处理器; 参数:value,propName; 返回值:false-停止遍历
   */
  each: function(obj, fn) {
    var v=null;
    for (var k in obj) if(false==fn.call(obj,obj[k],k))break;
  },

  /**
   * 数组, 对象属性遍历
   * @param obj {Array|Object} 目标对象
   * @param fn {Function} 属性处理器; 参数:value,propName; 返回值:false-停止遍历
   */
  eachValue: function(obj, fn) {
    Utils.each(obj, function(v,k){
      if (Validator.isNotFunction(v))
        return fn.apply(this, arguments);
    });
  },

  /**
   * 函数遍历
   * @param obj {Array|Object} 目标对象
   * @param fn {Function} 属性处理器; 参数:value,propName; 返回值:false-停止遍历
   */
  eachFn: function(obj, fn){
    Utils.each(obj, function(v,k){
      if (Validator.isFunction(v))
        return fn.apply(this, arguments);
    });
  },

  /**
   * 分段读取数组
   * @param arr {Array} 目标数组
   * @param length {Number} 分段长度, 默认为数组长度
   * @param fn {Function} 分段处理器; 参数:subArr, count; 返回值:false-停止分段
   */
  limit: function(arr, length, fn) {
    if (Validator.isNotArray(arr) || Validator.isNotFunction(fn)) return;
    if (!arr.length) return;
    (length<=0) && (length=arr.length);
    var count     = 1,
        maxCount  = parseInt((arr.length+length-1)/length),
        sIdx      = 0,
        eIdx      = count*length;
    while (count<=maxCount) {
      (eIdx>arr.length) && (eIdx=arr.length);
      var subArr = arr.slice(sIdx, eIdx);
      if (false == fn.call(arr, subArr)) break;
      sIdx = eIdx;
      count ++;
      eIdx = count*length;
    }
  },

  /**
   * 日期格式化
   * @param date {Date} 日期对象
   * @param format {String} 格式化规则(yyyyMMddhhmmssS), 默认:"yyyy-MM-dd hh:mm:ss:S"
   * @returns {String} 格式化日期字符串
   */
  dateFormat: function(date, format) {
    function formatter(format) {
      format = (format || "yyyy-MM-dd hh:mm:ss");
      var time = this.getTime();
      if (isNaN(time)) { return; }
      var o = {
        "M+": this.getMonth() + 1,
        "d+": this.getDate(),
        "h+": this.getHours(),
        "m+": this.getMinutes(),
        "s+": this.getSeconds(),
        "q+": Math.floor((this.getMonth() + 3) / 3),
        "S": this.getMilliseconds()
      };

      if (/(y+)/.test(format))
        format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));

      for ( var k in o) 
        if (new RegExp("(" + k + ")").test(format))
          format = format.replace(RegExp.$1, RegExp.$1.length == 1 
                  ? o[k] 
                  : ("00" + o[k]).substr(("" + o[k]).length));
      return format;
    }
    return formatter.call(date, format);
  },

  /**
   * 日期字符串解析
   * @param dateStr {String} 格式化字符串
   * @param pattern {String} 日期格式化规则
   * @returns {Date} 解析成功返回日期对象
   */
  dateParse: function(dateStr, pattern){
    function parser(dateStr, pattern) {
      var metaPatterns = {
          /**
           * 元规则决策表, 每项决策中会新增三个属性:
           * <p>
           * beginIndex: {Number}<br>
           * pLength: {Number}<br>
           * original: {String}
           * </p>
           */
          metas: {
              /** 年规则 */
              y: {name: "Year", setYear: function(date) {date.setFullYear(this.original || 0);}},
              /** 月规则 */
              M: {name: "Month",setMonth: function(date) {date.setMonth((!this.original.length || isNaN(this.original)) ? 0 : (this.original - 1));}},
              /** 月中的天数规则 */
              d: {name: "Day", setDay: function(date) {date.setDate(this.original || 0);}},
              /** 小时规则 */
              h: {name: "Hour",setHour: function(date) {date.setHours(this.original || 0);}},
              /** 分钟规则 */
              m: {name: "Minute",setMinute: function(date) {date.setMinutes(this.original || 0);}},
              /** 秒规则 */
              s: {name: "Second",setSecond: function(date) {date.setSeconds(this.original || 0);}},
              /** 毫秒规则 */
              S: {name: "Millisecond",setMillisecond: function(date) {date.setMilliseconds(this.original || 0);}}
          },

          /**
           * 设值
           * @param date {Date} 目标日期
           * @returns {Date} 修改后日期
           */
          setValues: function(date) {
              this.metas.y.setYear(date);
              this.metas.M.setMonth(date);
              this.metas.d.setDay(date);
              this.metas.h.setHour(date);
              this.metas.m.setMinute(date);
              this.metas.s.setSecond(date);
              this.metas.S.setMillisecond(date);
              return date;
          },

          /**
           * 校验器
           * @param orgiDateStr {String} 日期字符串
           * @param tgtPattern {String} 解析规则
           * @returns {Boolean} true-解析成功, false-规则不能匹配日期字符串
           */
          validate: function(orgiDateStr, tgtPattern) {
              var NUMBER_PATTERN = "\\d",
                  MX_PATTERN      = "\\d+";
              var replacedPattern = (tgtPattern || "") + "";
              if (!replacedPattern) return false;

              // 记录当前所能支持的所有元字符
              var metasStr = [];
              for (var meta in this.metas) metasStr.push(meta);

              // 替换pattern中年月日时分秒的字符为\d
              replacedPattern = replacedPattern.replace(/\//g, "\\/");
              Utils.each(metasStr,function(meta){
                replacedPattern = replacedPattern.replace(eval("(/" + meta + "/g)"), "S"==meta?MX_PATTERN:NUMBER_PATTERN);
              });
              replacedPattern = replacedPattern.replace(/\\\\/g, "\\").replace(/[\/]/g, "\/");

              // 使用替换后的pattern校验dateStr是否有效
              var result = eval("(/^" + replacedPattern + "$/)").test(orgiDateStr);
              if (result) {
                  var _this = this;
                  // 校验通过, 按顺序设置元规则开始索引和值
                  // > 按元规则分组
                  var metasGroup = metasStr.join("");
                  // /([yMdhms])\1*/g: 提取的元规则
                  var groupRegExp = eval("(/([" + metasGroup + "])\\1*/g)");
                  // 替换掉日期字符串分隔符字符
                  var onlyNumberDateStr = orgiDateStr.replace(/[^\d]+/g, "");
                  // 把原pattern中的年月日时分秒解为有序的正则表达式数组,
                  var orgiValIdx = 0;
                  Utils.each(tgtPattern.match(groupRegExp), function(metaGroup){
                      // :> 设置每个组的 beginIndex, pLength, original
                      var meta = _this.metas[metaGroup[0]];
                      meta.beginIndex = tgtPattern.indexOf(metaGroup);
                      meta.pLength = metaGroup.length;
                      if ("S" != metaGroup[0])
                        meta.original = onlyNumberDateStr.substring(orgiValIdx, (orgiValIdx + meta.pLength));
                      else
                        meta.original = onlyNumberDateStr.substring(orgiValIdx);
                      orgiValIdx += meta.pLength;
                  });
              }
              return result;
          }
      };

      // 解析完成后按Date构造顺序构建目标Date对象
      var success = metaPatterns.validate(dateStr, pattern);
      if (!success) {
          return null;
      } else {
          metaPatterns.setValues(this);
          return this;
      }
    };
    return parser.apply(new Date(), arguments);
  },

  /**
   * 执行函数
   * @param ctxt {Object} 上下文环境
   * @param fn {Function} 目标函数对象
   * @param pn {Object} 从第三个参数开始到最后一个参数为止, 作为执行函数的参数
   * @returns {Object} 函数非法返回 undefined, 否则返回函数执行结果
   */
  invoke : function(ctxt, fn, p1, p2, pn){
    if(Validator.isNotFunction(fn)) return;
    var ps = [];
    Utils.each(arguments,function(v,k){(2<=k)&&ps.push(v);});
    return fn.apply(ctxt, ps);
  },

  /**
   * 获取真实路径
   * @param url {String} 相对路径
   * @param appendProject {Boolean} true-URL中需要包含项目名称
   * @returns {String} URL访问路径
   */
  getRealUrl: function(url, appendProject) {
    var baseUrl = Utils.getBaseUrl(appendProject);
    url+="";
    return ((0<=url.indexOf(baseUrl)) ? url : (baseUrl + url.replace("\\","/").replace("//","/")));
  },

  /**
   * 获取项目路径
   * @param appendProject {Boolean} true-URL中需要包含项目名称
   * @returns {String} 项目根目录
   */
  getBaseUrl : function(appendProject){
    return location.origin+"/"+(appendProject?(location.pathname.match(/^\/([^\/]+)\/.+/)[1]+"/"):"");
  },

  /**
   * 获取屏幕高度
   * @returns {Number} 屏幕高度
   */
  screenHeight : function(){
    return document.documentElement.clientHeight||document.body.clientHeight;
  },
  
  /**
   * 获取屏幕宽度
   * @returns {Number} 屏幕宽度
   */
  screenWidth : function(){
    return document.documentElement.clientWidth||document.body.clientWidth;
  },

  /**
   * 属性拷贝
   * @param target {Object} 目标对象
   * @param orig {Object} 来源对象
   * @param fn {Function} 属性拷贝前
   */
  copyProperties : function(target, src, fn) {
    if (!target || Validator.isNotObject(target)) throw new Error("The target is not Object");
    if (!src || Validator.isNotObject(src)) throw new Error("The source is not Object");
    Validator.isNotFunction(fn) && (fn=function(){});
    Utils.each(src, function(v, k){
      if(false==fn(k, v, target[k])) return;
      target[k]=v;
    });
  },

  /**
   * 获取屏幕属性
   * @returns {Screen} width:可用区域宽度, height:可用区域高度
   */
  screen : function(){
    return {
      width   : document.documentElement.clientWidth,
      height  : document.documentElement.clientHeight
    };
  },

  /**
   * 注册唯一委托事件
   * @param ctxt {jQuery} 被委托对象
   * @param selector {String} 选择器
   * @param events {String} 事件名, 多个事件使用空格分割
   * @param fn {Function} 事件处理器
   * @returns 被委托对象
   */
  uniqueDelegate : function(ctxt, selector, events, fn){
    if (Validator.isNotJQuery(ctxt)) throw new Error("Delegatable must be instance of jQuery");
    if (Validator.isNotFunction(fn)) throw new Error("Event handler must be instance of Function");
    return ctxt.undelegate(selector, events).delegate(selector, events, fn);
  },

  /**
   * Hash Code算法
   * @param obj {Object} 当前参数为Object类型时, 使用JSON.stringify(obj)转换为字符串, 其它数据直接转换为字符串
   * @returns {String} hashCode值
   */
  hashCode : function(obj){
    var hash  = 0,
        str   = Validator.isObject(obj)?JSON.stringify(obj):(""+obj);
    if (str.length == 0) return hash;
    for (var i in str) {
      hash = ((hash<<5)-hash)+str[i];
      hash = hash & hash;
    }
    return hash;
  }
};

/**
 * 异步请求工具
 */
function AjaxUtil() {
  if (!(this instanceof arguments.callee)) return new arguments.callee();
  var $thisObj = this;

  /**
   * 发送Ajax请求
   * @param conf {Object} 与jQuery.ajax参数相同
   */
  this.ajax = function(conf) {
    Validator.isNotObject(conf) && (conf={});
    var url = $.trim(conf["url"]);
    if (!url) throw new Error("Missing required parameter[url]["+JSON.stringify(conf)+"]");
    Validator.isNotFunction(conf["error"]) && (conf["error"]=$thisObj.errHandler);
    if (Validator.isFunction($thisObj.beforeSend)) {
      var stop = (false==$thisObj.beforeSend(conf["data"]));
      if (stop) return;
    }
    $.ajax(conf);
  };

  /**
   * 发送Ajax请求, POST请求方式, JSON响应格式
   * @param conf {Object} 与jQuery.ajax参数相同
   */
  this.jsonAjax = function(conf) {
    Validator.isNotObject(conf) && (conf={});
    conf["dataType"] = "JSON";
    conf["type"] = "POST";
    $thisObj.ajax(conf);
  };

  /**
   * 默认错误处理
   * @param errData {Object} 错误消息
   */
  this.errHandler = function(errData) {
    var printer = console?console.error:alert;
    printer("Ajax error: " + JSON.stringify(errData));
  };

  /**
   * 请求发送前
   * @param param {Object} 请求参数
   * @returns false-阻止请求
   */
  this.beforeSend = function(param) {
  };

  return this;
};
AjaxUtil.instance = new AjaxUtil();

/**
 * 数组工具
 */
var ArrayUtil = {
  _summary : "数组工具",

  /**
   * 数组转换为Map映射
   * @param arr {Array} 源数组, 数组中元素必须是Object类型
   * @param keyName {String} 对象属性
   * @returns {Object} Key{String}-每个元素获取的KeyName值, Value{Array}-相同KeyName值的元素对象列表
   */
  asMap : function(arr, keyName){
    var map = {};
    if (Validator.isNotArray(arr)) throw new Error("Invalid parameters, [arr] must be instance of Array");
    if (Validator.isNotString(keyName)) throw new Error("Invalid parameters, [keyName] must be instanceof String");
    Utils.eachValue(arr, function(v){
      var key     = (v||{})[keyName],
          oldVal  = map[key];
      !oldVal && (oldVal=map[key]=[]);
      oldVal.push(v);
    });
    return map;
  },

  /**
   * 分段读取数组
   * @param arr {Array} 目标数组
   * @param length {Number} 分段长度, 默认为数组长度
   * @param fn {Function} 分段处理器; 参数:subArr, count; 返回值:false-停止分段
   */
  limit: function(arr, length, fn) {
    if (Validator.isNotArray(arr) || Validator.isNotFunction(fn)) return;
    if (!arr.length) return;
    (length<=0) && (length=arr.length);
    var count     = 1,
        maxCount  = parseInt((arr.length+length-1)/length),
        sIdx      = 0,
        eIdx      = count*length;
    while (count<=maxCount) {
      (eIdx>arr.length) && (eIdx=arr.length);
      var subArr = arr.slice(sIdx, eIdx);
      if (false == fn.call(arr, subArr)) break;
      sIdx = eIdx;
      count ++;
      eIdx = count*length;
    }
  }
};


/** Loading界面 */
function LoadingWin() {
  if (!(this instanceof arguments.callee)) return new arguments.callee($ctnr);
  var $thisObj  = this,
      _conf     = {ctnr:$("body"), screen:null, loading:null};

  /**
   * 显示Loading
   * @param $ctnr {jQuery} 需要覆盖的容器
   * @returns {this}
   */
  this.show = function($ctnr) {
    if (!_conf.screen) {
      _conf.screen = $("<div/>").css({
        "position"      : "absolute",
        "top"           : 0,
        "left"          : 0,
        "width"         : "100%",
        "height"        : "100%",
        "background"    : "#000",
        "opacity"       : 0.2,
        "-moz-opacity"  : 0.2,
        "filter"        : "alpha(opacity=50)"
      });
      _conf.loading = $("<div/>").css({
        "position"    : "absolute",
        "top"         : 0,
        "left"        : 0,
        "width"       : "100%",
        "height"      : "100%",
        "background"  : "hashQuery('data:image/gif;base64,R0lGODlhUABQAIABAP///wAAACH/C05FVFNDQVBFMi4wAwEAAAAh/wtYTVAgRGF0YVhNUDw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTExIDc5LjE1ODMyNSwgMjAxNS8wOS8xMC0wMToxMDoyMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjZEQjIxNTI0QjZFMzExRTY4NjBEOEM0MEQ1QTAyRUJBIiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjZEQjIxNTI1QjZFMzExRTY4NjBEOEM0MEQ1QTAyRUJBIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NkRCMjE1MjJCNkUzMTFFNjg2MEQ4QzQwRDVBMDJFQkEiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NkRCMjE1MjNCNkUzMTFFNjg2MEQ4QzQwRDVBMDJFQkEiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4B//79/Pv6+fj39vX08/Lx8O/u7ezr6uno5+bl5OPi4eDf3t3c29rZ2NfW1dTT0tHQz87NzMvKycjHxsXEw8LB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') no-repeat center center"
      }).appendTo(_conf.screen);
    }
    Validator.isNotJQuery($ctnr) && ($ctnr=$("body"));
    _conf.ctnr=$ctnr;
    _conf.ctnr.css({"position":"relative"});
    _conf.screen.appendTo(_conf.ctnr).show();
  };

  /**
   * 隐藏
   * @returns {this}
   */
  this.hide = function(){_conf.screen.hide();};

  return this;
}
LoadingWin.instance = new LoadingWin();

/** Ajax访问记录工具 */
function AjaxHistoryUtils() {
  if (!(this instanceof arguments.callee)) return new arguments.callee();
  var $thisObj  = this,
      _handlers = {},
      _conf     = {HANDLER:"fn", CONTEXT:"obj"};
  $thisObj.handlers = _handlers;

  /**
   * 注册
   * @param hashQuery {String} 目标地址
   * @param handler {Function} 处理函数, 参数:preUrl,cu
   * @param coverage {Boolean} 是否覆盖已存在的处理器
   * @param context {Object} 处理函数执行上下文, 默认使用window
   */
  this.registerHandler = function(hashQuery, handler, coverage, context) {
    if (Validator.isNotString(hashQuery)) throw new Error("Invalid paramters[hashQuery], must be instance of String");
    Validator.isNotObject(context) && (content=null);
    if (Validator.isNotFunction(handler)) throw new Error("Invalid parameters[handler], must be instace of Function");
    var old = _handlers[hashQuery];
    if (old && !coverage) throw new Error("Cannot repeat set handler["+hashQuery+"]");
    (!/^#/.test(hashQuery))&&(hashQuery="#"+hashQuery);
    _handlers[hashQuery] = {fn:handler, obj:context};
    return $thisObj;
  };

  (function(handler){
    window.onhashchange=handler;
  })(function(e){
    var hashQuery = location.hash,
        handler   = _handlers[hashQuery];
    if (!handler) return;
    var fn    = handler[_conf.HANDLER],
        ctxt  = handler[_conf.CONTEXT];
    Validator.isFunction(fn) && fn.call(ctxt, e.newURL, e.oldURL);
  });

  return this;
}
AjaxHistoryUtils.instance = new AjaxHistoryUtils();
