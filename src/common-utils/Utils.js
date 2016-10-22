var Validator = {
  isFunction: function(fn) {return (fn instanceof Function);},
  isNotFunction: function(fn) {return !Validator.isFunction(fn);},
  isArray: function(arr) {return (arr instanceof Array);},
  isNotArray: function(arr) {return !Validator.isArray(arr);},
};

var Utils = {

  /**
   * 数组, 对象属性遍历
   * 
   * @param obj
   *          {Array|Object} 目标对象
   * @param fn
   *          {Function} 属性处理器; 参数:value,propName; 返回值:false-停止遍历
   */
  each: function(obj, fn) {
    if (Validator.isNotFunction(fn)) return;
    var v = null;
    for ( var k in obj)
      if (false == fn.call(obj, obj[k], k)) break;
  },

  /**
   * 数组, 对象属性遍历
   * 
   * @param obj
   *          {Array|Object} 目标对象
   * @param fn
   *          {Function} 属性处理器; 参数:value,propName; 返回值:false-停止遍历
   */
  eachValue: function(obj, fn) {
    Utils.each(obj, function(v,k){
      if (Validator.isNotFunction(v))
        return fn.apply(this, arguments);
    });
  },

  /**
   * 分段读取数组
   * 
   * @param arr
   *          {Array} 目标数组
   * @param length
   *          {Number} 分段长度, 默认为数组长度
   * @param fn
   *          {Function} 分段处理器; 参数:subArr, count; 返回值:false-停止分段
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
   * 
   * @param date
   *          {Date} 日期对象
   * @param format
   *          {String} 格式化规则(yyyyMMddhhmmssS), 默认:"yyyy-MM-dd hh:mm:ss:S"
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
}