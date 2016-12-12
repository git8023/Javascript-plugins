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
        "background"  : "url('data:image/gif;base64,R0lGODlheAB4ALMNAMzMzPLy8qamptnZ2bOzs/r6+oCAgIyMjJmZmf///+bm5r+/v4GBgQAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/wtYTVAgRGF0YVhNUDw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTExIDc5LjE1ODMyNSwgMjAxNS8wOS8xMC0wMToxMDoyMCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjgzN0U4QjE0QkI2QzExRTY4Q0I1QTBGMERDRDAyNTU2IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjgzN0U4QjE1QkI2QzExRTY4Q0I1QTBGMERDRDAyNTU2Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6ODM3RThCMTJCQjZDMTFFNjhDQjVBMEYwRENEMDI1NTYiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6ODM3RThCMTNCQjZDMTFFNjhDQjVBMEYwRENEMDI1NTYiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4B//79/Pv6+fj39vX08/Lx8O/u7ezr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') no-repeat center center"
      }).appendTo(_conf.screen);
    }
    Validator.isNotJQuery($ctnr) && ($ctnr=$("body"));
    _conf.ctnr=$ctnr;
    _conf.ctnr.css({"position":"relative"});
    _conf.screen.appendTo(_conf.ctnr).show();
  };

  /** 隐藏 */
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
   * @param hash {String} 带有Hash参数
   * @param handler {Function} 处理函数, 参数:newHash, preHash
   * @param coverage {Boolean} 是否覆盖已存在的处理器
   * @param context {Object} 处理函数执行上下文, 默认使用window
   */
  this.registerHandler = function(hash, handler, coverage, context) {
    coverage = coverage||(undefined==coverage);
    if (Validator.isNotString(hash)) throw new Error("Invalid paramters[hash], must be instance of String");
    Validator.isNotObject(context) && (content=null);
    if (Validator.isNotFunction(handler)) throw new Error("Invalid parameters[handler], must be instace of Function");
    var old = _handlers[hash];
    if (old && !coverage) throw new Error("Cannot repeat set handler["+hash+"]");
    (!/^#/.test(hash))&&(hash="#"+hash);
    _handlers[hash] = {fn:handler, obj:context};
    return $thisObj;
  };

  /**
   * 注销处理器
   * @param hash {String} 要去除的Hash值
   * @returns {this}
   */
  this.unregister = function(hash) {
    delete _handlers[hash];
    return $thisObj;
  };

  (function(handler){
    window.onhashchange=handler;
  })(function(e){
    var hash = location.hash,
        handler   = _handlers[hash];
    if (!handler) return;
    var fn      = handler[_conf.HANDLER],
        ctxt    = handler[_conf.CONTEXT],
        newHash = /#/.test(e.newURL)?e.newURL.match(/#(.+)$/)[1]:null,
        oldHash = /#/.test(e.oldURL)?e.oldURL.match(/#(.+)$/)[1]:null;
    Validator.isFunction(fn) && fn.call(ctxt, newHash, oldHash);
  });

  return this;
}
AjaxHistoryUtils.instance = new AjaxHistoryUtils();

/** OGNL表达式工具 */
function OgnlUtil() {
  if (!(this instanceof arguments.callee)) return new arguments.callee();
  var $thisObj = this;
  
  /**
   * 获取对象的值
   * @param data {Object} 数据对象
   * @param ognl {String} ognl表达式
   */
  this.getValue = function(data, ognl) {
    var keys = ognl.split(".");
    if (1 == keys.length) {
      // 非数组
      var regex = /\[/;
      if (!regex.test(ognl)) return data?data[ognl.trim()]:data;
      else return getArrOgnlVal(data, ognl);
    }

    var idx     = ognl.indexOf("."),
        key     = ognl.substring(0, idx),
        isArr   = /\[\d+\]/.test(key),
        d       = isArr?getArrOgnlVal(data, key):data[key]
        newOgnl = ognl.substring(idx + 1);
    return $thisObj.getValue(d, newOgnl);
  }
  
  /**
   * 获取数组对象的值
   * @param data {Object} 数据对象
   * @param ognl {String} ognl表达式
   */
  function getArrOgnlVal(data, ognl) {
    // 获取数组对象
    var sIdx    = ognl.indexOf("["), 
        arrK    = ognl.substring(0, sIdx),
        arr     = data[arrK],
        idxStr  = ognl.substring(sIdx),
        idxReg  = /^(\[\d+\])+$/;
    if (!idxReg.test(idxStr)) throw new Error("非法下标索引:"+idxStr);
    
    // 获取值[1], [0][2]...
    var idxes = idxStr.split("][");

    // 一维数组
    if (1 == idxes) return arr[parseInt(idxes.replace("[","").replace("]",""))];
    
    // 多维数组
    var val=arr;
    idxes.each(function(v){val=val[parseInt(v.replace("[","").replace("]",""))]});
    return val;
  }
}
OgnlUtil.instance = new OgnlUtil();