/**
 * @description 数据网格
 * @author Huang.Yong
 * @version 0.1
 * @date 2016年10月5日-上午11:49:58
 * @param ctnr {jQuery|DOM} 数据网格容器
 * @returns {DataGrid} 数据网格对象
 */
function DataGrid(ctnr) {

  if (!(this instanceof arguments.callee)) return new arguments.callee();
  var $thisObj  = this, 
      _conf     = {};
  $thisObj.conf = _conf;

  /** 字典 */
  var KEYS = {
    INVALID_MSG         : "Invalid datagrid container.",
    KEY_OF_CONTAINER    : "ctnr",
    KEY_OF_HEADERS_CONF : "hs",
    KEY_OF_GRID         : "grid",
    KEY_OF_HEADERS_MAP  : "__headMap__",
    KEY_OF_DATE_FORMAT  : "dateFmt",

    VALUE_OF_DATE       : "date",

    ATTR_OF_ORDINAL     : "__ordinal__",
    ATTR_OF_PROP_NAME   : "g-prop-name",
    ATTR_OF_EMPTY       : "g-empty",
    ATTR_OF_STYLE       : "g-style",
    ATTR_OF_CLASS       : "g-class",
    ATTR_OF_CHILD_STYLE : "g-child-style",
    ATTR_OF_CHILD_CLASS : "g-child-class",
    ATTR_OF_TYPE        : "g-type",
    ATTR_OF_DATE_FORMAT : "g-date-format",
    ATTR_OF_TEXT        : "text",

    EVENT_OF_COLUMN_DATA_PREHANDLER : "cellDataHandler",
    EVENT_OF_COLUMN_PREHANDLER      : "cellHandler",
    EVENT_OF_ROW_DATA_PREHANDLER    : "rowDataHandler",
    EVENT_OF_ROW_HANDLER            : "rowHandler",
    EVENT_OF_FILLING_HANDLER        : "fillingHandler",
    EVENT_OF_FILLED_HANDLER         : "filledHandler"
  }

  var utils = {
    /** 值属性遍历 */
    eachVals: function(obj, handler) {
      (!obj) && (obj = {});
      if (!(handler instanceof Function)) return;
      utils.each(obj, function(v,k){
        if (v instanceof Function) return true;
        return handler(v,k);
      });
    },
    /** 属性遍历 */
    each: function(obj, handler) {
      (!obj) && (obj = {});
      if (!(handler instanceof Function)) return;
      for ( var k in obj) 
        if (false == handler(obj[k], k)) 
          break;
    },
    /** 获取表头配置 */
    get$ths: function(ctnr) {
      // Find in THEAD label
      var $ths = ctnr.find("thead th");
      // Find all TH labels
      (!$ths.length) && ($ths = ctnr.find("th"));
      // Find the first TR contains the TD configuration
      (!$ths.length) && ctnr.find("tr").each(function() {
        $ths = $(this).find("td");
        if ($ths.length) return false;
      });
      // Building headers configure
      var hs = [];
      $ths.each(function(){hs.push(utils.getAttrs(this));});
      return hs;
    },
    /** 获取属性集合 */
    getAttrs: function($el) {
      $el = $($el);
      var _el   = $el[0],
          len   = _el.attributes.length,
          attrs = {},
          name;

      while (0 <= --len) {
        name = _el.attributes[len]["name"];
        attrs[name] = $.trim($el.attr(name));
      }
      attrs[KEYS.ATTR_OF_TEXT] = $el.text();
      return attrs;
    }
  };

  /** 处理器 */
  var handlers = {
      _selectBoxFty 
        : function(type, name, val){
            return $("<input/>",{type:type,name:name, value:val});
          },
      ordinal 
        : function(data,conf,val){
            return data[KEYS.ATTR_OF_ORDINAL]
          },
      radio 
        : function(data,conf,val){
            return handlers._selectBoxFty("radio", "_radio",data[KEYS.ATTR_OF_ORDINAL]);
          },
      checkbox 
        : function(data,conf,val){
            return handlers._selectBoxFty("checkbox", "_checkbox",data[KEYS.ATTR_OF_ORDINAL]);
          },
      date 
        : function(data,conf,val){
            function formatter(fmt) {
              fmt = (fmt || "yyyy-MM-dd hh:mm:ss");
              var time = this.getTime();
              if (isNaN(time)) {return "";}
              var o = {
                "M+": this.getMonth()+1,
                "d+": this.getDate(),
                "h+": this.getHours(),
                "m+": this.getMinutes(),
                "s+": this.getSeconds(),
                "q+": Math.floor((this.getMonth() + 3) / 3),
                "S": this.getMilliseconds()
              };
    
              if (/(y+)/.test(fmt))
                fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    
              for ( var k in o) 
                if (new RegExp("(" + k + ")").test(fmt))
                  fmt = fmt.replace(RegExp.$1, RegExp.$1.length==1 
                          ? o[k] 
                          : ("00" + o[k]).substr(("" + o[k]).length));
              return fmt;
            }
            return formatter.call(new Date(val), conf[KEYS.ATTR_OF_DATE_FORMAT]);
          }
   };

  /** 事件处理器 */
  var eventHandlers = {
    cellDataHandler : null,
    cellHandler     : null,
    rowDataHandler  : null,
    rowHandler      : null,
    fillingHandler  : null,
    filledHandler   : null
  };

  /**
   * 注册事件
   * @param eventHandlers {Object} 事件构建器
   * @returns {this}
   */
  this.registerEvents = function(eventHandlers) {
    utils.each(_handlers, function(fn, name){
      fn=eventHandlers[name];
      Validator.isFunction(fn) && (_handlers[name]=fn);
    });
    return $thisObj;
  };

  /**
   * 填充数据
   * @param dataList {Array} 数据列表
   * @param append {Boolean} true-追加数据
   * @returns {this}
   */
  this.fill = function(dataList, append) {
    var grid  = _conf[KEYS.KEY_OF_GRID],
        tbody = $("<tbody/>");

    // filling handler
    Utils.invoke($thisObj, eventHandlers[KEYS.EVENT_OF_FILLING_HANDLER]);

    if (dataList instanceof Array) {
      utils.eachVals(dataList, function(rowData, idx){
        rowData[KEYS.ATTR_OF_ORDINAL]=idx-0+1;

        // row data handler
        Utils.invoke(
                $thisObj, 
                eventHandlers[KEYS.EVENT_OF_ROW_DATA_PREHANDLER], 
                rowData,
                idx
                );
        var row = createRow(rowData);

        // row handler
        var rowHandler = eventHandlers[KEYS.EVENT_OF_ROW_HANDLER];
        Utils.invoke(
                $thisObj, 
                eventHandlers[KEYS.EVENT_OF_ROW_HANDLER], 
                row, 
                idx, 
                rowData
                );
        row.appendTo(tbody);
      });
    }

    var oldTbody = grid.find("tbody");
    !append && oldTbody.html("");
    !oldTbody.length && (oldTbody=$("<tbody/>").appendTo(grid));
    oldTbody.append(tbody.find("tr"));

    // grid after handler
    Utils.invoke(
            $thisObj, 
            eventHandlers[KEYS.EVENT_OF_FILLED_HANDLER]
            );

    return $thisObj;
  };

  // create row<TR>
  function createRow(data) {
    var row = $("<tr/>");
    utils.eachVals(_conf[KEYS.KEY_OF_HEADERS_MAP], function(hConf){
      var propName  = hConf[KEYS.ATTR_OF_PROP_NAME],
          propVal   = data[propName];

      // column data handler
      if (propName) {
        var t = Utils.invoke(
                $thisObj,
                eventHandlers[KEYS.EVENT_OF_COLUMN_DATA_PREHANDLER],
                propName,
                propVal
                );
        (undefined!=t) && (propVal=t);
      }
      var cell = typeHandle(data, hConf);

      // repair property value by label configure
      if (hConf[KEYS.ATTR_OF_EMPTY] && !propVal)
        propVal = hConf[KEYS.ATTR_OF_EMPTY];
      var dateFmt = hConf[KEYS.ATTR_OF_TYPE];
      if (KEYS.VALUE_OF_DATE == dateFmt) {
        var fmt = hConf[KEYS.ATTR_OF_DATE_FORMAT];
        if (!!fmt) {
          var t = Utils.invoke(
                    $thisObj,
                    handlers[KEYS.KEY_OF_DATE_FORMAT],
                    propVal,
                    fmt
                    );
          (undefined!=t) && (propVal=t);
        }
      }
      !cell && (cell=$("<td/>").html(propVal));

      // set style
      var cStyle  = hConf[KEYS.ATTR_OF_CHILD_STYLE];
      cStyle && cell.attr("style",cStyle);
      var cClass  = hConf[KEYS.ATTR_OF_CHILD_CLASS];
      cClass && cell.addClass(cClass);

      // column handler
      Utils.invoke(
              $thisObj,
              eventHandlers[KEYS.EVENT_OF_COLUMN_PREHANDLER],
              cell,
              propName,
              propVal
              );
      cell.appendTo(row);
    });
    return row;
  }

  // Type handler
  function typeHandle(data, hConf) {
    var fnName      = hConf[KEYS.ATTR_OF_TYPE],
        innerLabel  = data[hConf[KEYS.ATTR_OF_PROP_NAME]];
    fnName && (innerLabel=Utils.invoke($thisObj, handlers[fnName], data, hConf, innerLabel));
    return $("<td>").append(innerLabel);
  }

  (function init() {
    // verification
    _ctnr = $(ctnr);
    if (!ctnr || !_ctnr.length) throw new Error(KEYS.INVALID_MSG);

    // set header configure
    _conf[KEYS.KEY_OF_CONTAINER]    = _ctnr;
    _conf[KEYS.KEY_OF_HEADERS_CONF] = utils.get$ths(_ctnr);
    _conf[KEYS.KEY_OF_HEADERS_MAP]  = {};
    utils.eachVals(_conf[KEYS.KEY_OF_HEADERS_CONF], function(hConf){
      var propName  = hConf[KEYS.ATTR_OF_PROP_NAME];
      (!propName) && (propName=Math.random());
      _conf[KEYS.KEY_OF_HEADERS_MAP][propName] = hConf;
    });

    // Create grid
    var grid  = _conf[KEYS.KEY_OF_GRID] 
              = $("<table/>")
                  .attr("class",_ctnr.find("table").attr("class"))
                  .attr("style",_ctnr.find("table").attr("style")),
        thead = $("<thead/>").appendTo(grid),
        tr    = $("<tr/>").appendTo(thead);
    utils.eachVals( _conf[KEYS.KEY_OF_HEADERS_CONF], function(hConf){
      $("<th/>", {
        style   : hConf[KEYS.ATTR_OF_STYLE],
        "class" : hConf[KEYS.ATTR_OF_CLASS],
        html    : hConf[KEYS.ATTR_OF_TEXT]
      }).appendTo(tr);
    });
    grid.appendTo(_ctnr.html(""));

  })();
  return this;
}
