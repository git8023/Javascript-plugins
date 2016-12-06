/**
 * @Description 表单对象
 * @param formContainer
 *            {Element|jQuery} 表单控件, 可以是任意控件(DIV, P, FORM, ...等等), 只要包含
 *            SELECT|INPUT|TEXTAREA 元素且合法即可(表单元素必须包含<b>NAME</b>属性).
 * @param debug
 *            {Boolean} true-打印调试日志
 * @Usage 获取实例对象: var form = new Form(el, showLog);
 *        <ul>
 *        <li>基于正则表达式的表单验证</li>
 *        <li>获取表单数据</li>
 *        <li>表单回填</li>
 *        <li>通过内置函数提交表单</li>
 *        </ul>
 * @returns {Form} 表单对象实体
 * @author Huong.Yong
 */
function Form(formContainer, debug) {
    if (!(this instanceof arguments.callee)) return new arguments.callee(ormContainer, debug);
    var $thisObj = this;
    if (!formContainer) throw Error("Missing target form container");

    /** 等待远程响应列队数量 */
    var remotePendingCount = 0;

    /** 关键字 */
    var KEYS = {
        CONFIG: {
            AUTO_EVENT: {
                ITEM      : "item",
                HANDLER   : "handler",
                _summary  : "自动事件配置项字典"
            },
            SUMMARY: "_summary",
            _summary: "配置关键字字典"
        },
        ATTRIBUTE: {
            INPUT_TYPE    : "type",
            NAME          : "name",
            _summary      : "HTML 属性字典"
        },
        validate: {
            EVENTS: {
                VALID_SUCCESS       : "validSuccess",
                VALID_FAILED        : "validFailed",
                VALID_COMPLETED     : "validCompleted",
                REMOTE_HANDLER      : "remoteHandler",
                REFRESH_AUTO_EVENT  : "refreshAutoEvent",
                _summary            : "验证回调事件关键字"
            },
            ATTRIBUTES: {
                REGEXP                : "regexp",
                REGEXP_ERROR          : "regexp-error",
                EQULAS_TO             : "eq-to",
                EQULAS_TO_ERROR       : "eq-to-error",
                NOT_EQULAS_TO         : "not-eq-to",
                NOT_EQULAS_TO_ERROR   : "not-eq-to-error",
                REMOTE_URL            : "remote-url",
                REMOTE_ERROR          : "remote-error",
                REMOTE_TRIGGER_EVENT  : "remote-event",
                _summary              : "表单项可配置验证属性"
            },
            _summary: "表单验证可配置属性字典"
        },
        backfill: {
            HANDLERS: {
                BEFORE_HANDLER  : "beforeHandler",
                NAMED_HANDLERS  : "namedHandlers",
                DATE            : "date",
                _summary        : "表单回填事件字典"
            },
            ATTRIBUTES: {
                DATA_HANDLER    : "data-handler",
                DATE_FORMATTER  : "date-formatter",
                _summary        : "表单回填可配置属性字典"
            },
            PARAMETERS: {
                FORM_DATA : "formData",
                _summary  : "表单回填参数索引字典"
            },
            _summary: "表单回填关键字字典"
        },
        _summary: "关键字字典"
    };

    /** 常量值 */
    var FINAL_VALUE = {
        INPUT_TYPE_RADIO      : "RADIO",
        INPUT_TYPE_CHECKBOX   : "CHECKBOX",
        DEFAULT_DATE_PATTERN  : "yyyy-MM-dd hh:mm:ss",
        CHECKED_SELECTOR      : ":checked",
        EMPTY_STRING          : ""
    };

    /** 配置 */
    var config = {
        selectors: {
            singleSelectors: ["INPUT[name][type!='checkbox'][type!='radio'][type!='button']",
                    "INPUT:checked[name][type='radio']", "SELECT[name]", "TEXTAREA[name]"],
            repeatableSelectors: ["INPUT[name][type='checkbox']"],
            _summary: "表单项选择器"
        },

        // 数据处理器
        dataHandlers: {
            date: function(item, dateVal) {
                if (isNaN(dateVal)) return dateVal;
                var pattern = (item.attr(KEYS.backfill.ATTRIBUTES.DATE_FORMATTER) || FINAL_VALUE.DEFAULT_DATE_PATTERN);
                var date = new Date(dateVal);
                return date.format(pattern);
            },
            _summary: "数据处理器"
        },

        validators: {
            doRegex: function(item, regexp) {
                log("Do regex.");
                // 获取配置
                var regexp, regexAttr = KEYS.validate.ATTRIBUTES.REGEXP, regexpStr = item.attr(regexAttr);
                if (!regexpStr) return;

                // 配置项验证
                regexp = eval("(" + regexpStr + ")");
                log("regexp[" + regexp + "].");
                if (!(regexp instanceof RegExp)){log("Invalid ["+regexAttr+"] configure["+regexpStr+"].");return false;}

                // 正则表达式验证
                var val   = item.val(), errMsg = item.attr(KEYS.validate.ATTRIBUTES.REGEXP_ERROR),
                    valid = regexp.test(val);
                config.events.validate._invoke(item, valid, errMsg);

                return valid;
            },
            doEqTo: function(item) {
                log("Do equals to.");
                // 获取配置
                var equlasToAttr = KEYS.validate.ATTRIBUTES.EQULAS_TO, eqToSelector = item.attr(equlasToAttr);
                if (undefined == eqToSelector || !eqToSelector) return;

                // 执行 Equals To 验证
                log("Target control selector[" + equlasToAttr + "].");
                var targetCtrl  = $(eqToSelector), 
                    targetVal   = targetCtrl.val(),
                    val         = item.val(), 
                    errMsg      = item.attr(KEYS.validate.ATTRIBUTES.EQULAS_TO_ERROR),
                    valid       = (val==targetVal);
                config.events.validate._invoke(item, valid, errMsg);

                return valid;
            },
            doNotEqTo: function(item) {
                log("Do Not Equals To.");
                // 获取配置项
                var notEqulasToAttr = KEYS.validate.ATTRIBUTES.NOT_EQULAS_TO,
                    notEqToSelector = item.attr(notEqulasToAttr);
                if (undefined==notEqToSelector || !notEqToSelector) return;

                // 执行验证
                log("Target control selector[" + notEqToSelector + "].");
                var targetCtrl  = $(notEqToSelector), 
                    targetVal   = targetCtrl.val(),
                    val         = item.val(), 
                    errMsg      = item.attr(KEYS.validate.ATTRIBUTES.NOT_EQULAS_TO_ERROR),
                    valid       = (val != targetVal);
                config.events.validate._invoke(item, valid, errMsg);

                return valid;
            },
            doRemote: function(item) {
                log("Do remote varification.");

                // 获取remote-url
                var url = item.attr(KEYS.validate.ATTRIBUTES.REMOTE_URL);
                url = $.trim(url);
                if (!url) return;

                // remote等待计数+1
                remotePendingCount++;

                // 发送请求, 响应 成功|失败 remote等待计数-1
                var name  = item.attr("name"), 
                    value = item.val(),
                    param = {};
                param[name] = value;
                $.ajax({
                    url: Utils.getRealUrl(url, true),
                    data: param,
                    async: false,
                    success: function(rData) {
                        remotePendingCount--;
                        log("Remote verified result: >>" + (typeof rData == "object" ? JSON.stringify(rData) : rData));

                        // 尝试将返回结果处理为非字符串类型
                        try {rData=eval("("+rData+")")} 
                        catch (e) {log("Convert to Object failed:" + e.message + ".");}

                        // 优先执行客户远程结果处理器
                        var fn = config.events.validate.remoteHandler
                        Validator.isFunction(fn)&&config.events.validate.remoteHandler(item, rData);

                        // 执行默认处理器
                        var errMsg = item.attr(KEYS.validate.ATTRIBUTES.REMOTE_ERROR);
                        config.events.validate._invoke(item, rData, errMsg);
                    },
                    error: function(rData) {
                        remotePendingCount--;
                        // 按失败处理
                        log("error, remotePendingCount:" + remotePendingCount);
                        var errMsg = item.attr(KEYS.validate.ATTRIBUTES.REMOTE_ERROR);
                        config.events.validate._invoke(item, false, errMsg);
                    }
                });
            },

            // 执行指定验证器
            invoke: function(item) {
                item = $(item);
                var result = true, 
                    tmp;

                // 获取验证器类型
                // 可以叠加验证, 其中一个验证失败, 返回false; 否则继续验证, 直到调用完所有验证, 返回结果;
                // :> Regexp
                tmp = this.doRegex(item);
                result = (undefined!=tmp ? (tmp&&result) : result);

                // :> eqTo
                if (result) {
                    tmp = this.doEqTo(item);
                    result = (undefined!=tmp ? (tmp&&result) : result);
                }

                // :> notEqTo
                if (result) {
                    tmp = this.doNotEqTo(item);
                    result = (undefined!=tmp ? (tmp&&result) : result);
                }

                // :> remote
                if (result && !item.attr(KEYS.validate.ATTRIBUTES.REMOTE_TRIGGER_EVENT)) {
                    tmp = this.doRemote(item);
                    result = (undefined!=tmp ? (tmp&&result) : result);
                }

                return result;
            },

            _summary: "验证器列表"
        },

        // 事件配置
        events: {
            validate: {
                validSuccess    : null,
                validFailed     : null,
                validCompleted  : null,
                remoteHandler   : null,
                _invoke : function(item, valid, errMsg) {
                    if (undefined == item && undefined == valid) {
                        var result = this.validCompleted.apply($thisObj);
                    }

                    var val = item.val();
                    return valid 
                              ? this.validSuccess.call($thisObj, item, val) 
                              : this.validFailed.call($thisObj, item, val, errMsg);
                },
                _repair: function() {
                    for ( var k in this)
                        if (/$valid/.test(k) && Validator.isNotFunction(this[k])) 
                            this[k] = createEmptyFn();
                },
                _summary: "验证回调函数列表"
            },

            backfill: {
                beforeHandler : null,
                namedHandler  : [],
                _summary      : "表单回填事件列表"
            },

            _summary: "事件列表"
        },

        // 自动事件配置
        autoEvents: {
            keyup: {
                _summary: "键盘弹起事件配置: Key-表单名, Value:{item:表单项, handler:处理器}"
            },
            blur: {
                _summary: "失去焦点事件配置: Key-表单名, Value:{item:表单项, handler:处理器}"
            },
            isRegistered: function(item) {
                var name = item.attr(KEYS.ATTRIBUTE.NAME);
                return config.autoEvents.keyup[name] || config.autoEvents.blur[name];
            },
            supportEvent: function(key) {
                if (null != key) {
                    key += FINAL_VALUE.EMPTY_STRING;
                    var keyConf = config.autoEvents[key];
                    if (!!keyConf && !!keyConf[KEYS.CONFIG.SUMMARY])return true;
                }
                return false;
            },
            register: function() {
                var items = $thisObj.getNamedFormControl();
                Utils.each(items, function(item) {
                    // remote不支持键盘事件, 防止频繁发送请求
                    (!item.attr(KEYS.validate.ATTRIBUTES.REMOTE_URL)) && item.keyup(config.autoEvents.unifyHandler);
                    item.blur(config.autoEvents.unifyHandler);
                });
            },
            unifyHandler: function($event) {
                // this 就是当前表单项
                // 获取当前表单项的自动事件配置
                // 校验并调用自动事件处理器
                // 设置执行环境为当前Form对象
                var $this = $(this), name = $this.attr(KEYS.ATTRIBUTE.NAME), eventName = $event.type;
                var conf = config.autoEvents[eventName];
                if (!conf)return false;

                var keyUpEventConf = conf[name];
                if (!!keyUpEventConf) {
                    log("Found registered automation event configuration[formControlName=" + name + "].");
                    var handler = keyUpEventConf[KEYS.CONFIG.AUTO_EVENT.HANDLER];
                    Validator.isFunction(handler) && handler.call($thisObj, $this);
                } else {
                    log("The current form control unregistered automatic event[formControlName=" + name + "].");
                }
            },
            _summary: "表单项自动注册事件配置"
        },

        _summary: "配置列表"
    };

    // 创建空函数
    function createEmptyFn() {return function(){};}

    /**
     * 获取表单数据
     * @param refreshCached {Boolean} true-使用缓存的表单项, false-刷新表单项缓存
     * @returns {JSON} 表单数据
     */
    this.getData = function(refreshCached) {
        log("Get form data.");
        $thisObj.getFormItems(!!refreshCached);

        var data = {};
        // Single value
        log("Set single values.");
        $thisObj.formItems.singleValItems.each(function() {
            var $this = $(this), 
                name  = $.trim($this.attr(KEYS.ATTRIBUTE.NAME)),
                val   = $this.val();
            val && name && (data[name]=val);
        });

        // Array value
        log("Set repeat value.");
        $thisObj.formItems.repeatableItems.each(function() {
            var $this   = $(this), 
                val     = $this.val(),
                name    = $.trim($this.attr(KEYS.ATTRIBUTE.NAME)),
                exclude = !$this.is(":checked");

            if (!name || exclude) return true;

            if ("INPUT" == $this[0].tagName) {
                if (FINAL_VALUE.INPUT_TYPE_CHECKBOX == $this.attr(KEYS.ATTRIBUTE.INPUT_TYPE)) {
                    log("This is 'checkbox' input control.");
                    var choseCheckbox = $this.is(FINAL_VALUE.CHECKED_SELECTOR);
                    if (!choseCheckbox)return true;
                }
            }

            var oldVal = data[name];
            if (oldVal instanceof Array) {
                data[name].push(val);
            } else {
                data[name] = [val];
                oldVal && data[name].push(oldVal);
            }
        });
        log("show data:" + JSON.stringify(data));
        return data;
    }

    /**
     * 获取表单项, 表单项包含的控件请查阅 <b>Form.prototype.config.selectors.singleSelectors</b>
     * @param refreshCached {Boolean} true-使用缓存的表单项, false-重新获取表单项(<i>表单结构有变动时使用</i>)
     * @returns {Object} 表单项列表
     */
    this.getFormItems = function(refreshCached) {
        log("Get form controls[refreshCached='" + refreshCached + "'].");
        if ($thisObj.formItems.isEmpty() || refreshCached) {
            log("Refresh chached from controls.");

            var singleValSelectors = config.selectors.singleSelectors.toString();
            $thisObj.formItems.singleValItems = $thisObj.container.find(singleValSelectors);
            log("Single value controls size of : " + $thisObj.formItems.singleValItems.size() + ".");

            var repeatableValSelectors = config.selectors.repeatableSelectors.toString();
            $thisObj.formItems.repeatableItems = $thisObj.container.find(repeatableValSelectors);
            log("Repeatable value controls size of : " + $thisObj.formItems.repeatableItems.size() + ".");
        }
        return $thisObj.formItems;
    }

    /**
     * 表单验证
     * 
     * @param conf {Object} 验证配置, 以下是<i>conf</i>属性列表: <br>
     * <table border="1" width="100%">
     *  <tr>
     *    <th colspan="4">值类型参数</th>
     *  </tr>
     *  <tr>
     *    <th>参数名</th>
     *    <th>类型</th>
     *    <th>范围</th>
     *    <th>说明</th>
     *  </tr>
     *  <tr>
     *    <td>refreshCached</td>
     *    <td>{Boolean}</td>
     *    <td>默认值:false</td>
     *    <td>刷新表单项缓存表单项列表或存在影响验证结果的变动时, 应指定为 true</td>
     *  </tr>
     *  <tr>
     *    <td>validAll</td>
     *    <td>{Boolean}</td>
     *    <td>true-总是验证所有表单项,<br>false-遇到验证失败时停止验证.</td>
     *    <td>总是校验所有项, 远程验证与此配置无关</td>
     *  </tr>
     * </table>
     * <table border="1" width="100%">
     *  <tr>
     *    <th colspan="4">事件监控, 以下验证结果处理器会覆盖[registerEvents]已经注册的验证结果处理器</th>
     *  </tr>
     *  <tr>
     *    <th>事件名</th>
     *    <th>参数</th>
     *    <th>返回值</th>
     *    <th>说明</th>
     *  </tr>
     *  <tr>
     *    <td>validSuccess</td>
     *    <td>currItem, value</td>
     *    <td>-/-</td>
     *    <td>验证通过回调函数</td>
     *  </tr>
     *  <tr>
     *    <td>validFailed</td>
     *    <td>currItem, value, errMsgByConf</td>
     *    <td>-/-</td>
     *    <td>验证失败回调函数</td>
     *  </tr>
     *  <tr>
     *    <td>remoteHandler</td>
     *    <td>currItem, resultData</td>
     *    <td>-/-</td>
     *    <td>远程验证回调函数</td>
     *  </tr>
     *  <tr>
     *    <td>validCompleted</td>
     *    <td>validResult{Boolean}</td>
     *    <td>-/-</td>
     *    <td>验证完成后回调函数</td>
     *  </tr>
     * </table>
     * @returns {Boolean} true-验证通过, false-验证失败, undefined-丢失结果处理器(不执行验证)
     */
    this.validate = function(conf) {
        log("Form validation. Invoke configure:");
        log(conf);
        conf = (conf || {});
        var validResult = undefined;

        // 验证事件列表是否配置正确
        log("Set callbacks: validSuccess, validFailed, validCompleted");
        $thisObj.registerEvents(conf);
        if (!hasValidationHandler()) {
          log("Can't found any callbacks. Skip the verification.");
          return validResult;
        }

        // 获取表单项列表
        log("Get form controls.");
        if (conf["refreshCached"]) $thisObj.getFormItems(true);

        log("Get the form controls list and order structure.");
        var groupItems = $thisObj.getNamedFormControl();

        // 过滤暂时不支持的项: input[type='radio'], input[type='checkbox'], select
        if (!(groupItems && groupItems.length)) {
          log("Can't found form control, skip verification.");
          return validResult;
        }
        
        log("Filtering unsuport form controls: input[type='radio'], input[type='checkbox'], select.");
        var filteredArr = groupItems.filter(function(item) {
          var tagName = $.trim(item[0].tagName);
          if (/SELECT/i.test(tagName)) return false;
          if (/INPUT/i.test(tagName)) {
            var iptType = item.attr(KEYS.ATTRIBUTE.INPUT_TYPE);
            return (-1 == ["radio", "checkbox", "button"].indexOf(iptType));
          }
          return true;
        });
        log("Filtered tag size: " + filteredArr.length + ".");

        log("Validate start.");
        validResult = true;
        Utils.each(groupItems, function(item, idx) {
          log("Current form control name: " + item.attr(KEYS.ATTRIBUTE.NAME) + ".");
          validResult = (config.validators.invoke(item) && validResult);
          if (!(conf["validAll"] || validResult)) return false;
        });

        // 调用 validCompleted
        log("Callback validCompleted.");
        var validCompleted = config.events.validate.validCompleted;
        Validator.isFunction(validCompleted) && validCompleted.call($thisObj, validResult);

        // 返回校验结果
        log("Validate result: " + validResult + ".");
        return validResult;
    }

    // 检测是否已配置验证结果处理器
    function hasValidationHandler() {
        var hasValidSuccess = (config.events.validate.validSuccess instanceof Function);
        var validFailed = (config.events.validate.validFailed instanceof Function);
        var validCompleted = (config.events.validate.validCompleted instanceof Function);
        config.events.validate._repair();

        return hasValidSuccess||validFailed||validCompleted;
    }

    /**
     * 获取表单控件
     * @returns {Array} 表单控件数组, 按控件在表单中的顺序
     */
    this.getNamedFormControl = function() {
      var namedCtrls = [];
      $thisObj.container.find("[name]").each(function(){namedCtrls.push($(this))});
      return namedCtrls;
    }

    /**
     * 事件注册
     * @param events {Object} 事件列表
     * 
     * 自动触发事件:
     * refreshAutoEvent : {Boolean}     true-刷新自动事件
     * <table border="1" width="100%">
     *  <tr>
     *    <th colspan="4">事件监控, 以下验证结果处理器会覆盖[registerEvents]已经注册的验证结果处理器</th>
     *  </tr>
     *  <tr>
     *    <th>事件名</th>
     *    <th>参数</th>
     *    <th>返回值</th>
     *    <th>说明</th>
     *  </tr>
     *  <tr>
     *    <td>validSuccess</td>
     *    <td>currItem, value</td>
     *    <td>-/-</td>
     *    <td>验证通过回调函数</td>
     *  </tr>
     *  <tr>
     *    <td>validFailed</td>
     *    <td>currItem, value, errMsgByConf</td>
     *    <td>-/-</td>
     *    <td>验证失败回调函数</td>
     *  </tr>
     *  <tr>
     *    <td>remoteHandler</td>
     *    <td>currItem, resultData</td>
     *    <td>-/-</td>
     *    <td>远程验证回调函数</td>
     *  </tr>
     *  <tr>
     *    <td>validCompleted</td>
     *    <td>validResult{Boolean}</td>
     *    <td>-/-</td>
     *    <td>验证完成后回调函数</td>
     *  </tr>
     * </table>
     */
    this.registerEvents = function(events) {
        log("Register events:" + (events ? JSON.stringify(events) : events));
        events = (events || {});
        setValidEvents(events);
        setBackfillEvents(events);
        registerAutoEvent(events);
    }

    // 注册自动触发事件
    // 1. 覆盖注册
    // 2. 已注册事件可以注销, 删除表单中的 xx-event 属性
    // 3. 当前对象可提供注册记录追溯 config.autoEvents
    function registerAutoEvent(events) {
        if (!events[KEYS.validate.EVENTS.REFRESH_AUTO_EVENT]) return;
        log("Register automation event.");

        // 注册远程验证自动触发事件
        var remoteTriggerEventAttr = KEYS.validate.ATTRIBUTES.REMOTE_TRIGGER_EVENT;
        var nameAttr = KEYS.ATTRIBUTE.NAME;
        var remoteUrlAttr = KEYS.validate.ATTRIBUTES.REMOTE_URL;
        var autoRemoteSelector = "[" + nameAttr + "][" + remoteTriggerEventAttr + "][" + remoteUrlAttr + "]";
        var remoteAutoTags = $thisObj.container.find(autoRemoteSelector);
        var size = remoteAutoTags.size();
        if (!!size) {
            log("Register remote automation event[formItemControl=" + size + "].");
            remoteAutoTags.each(function() {
                var $this = $(this);
                // 获取自动事件配置
                var autoEventKey = $this.attr(remoteTriggerEventAttr);
                autoEventKey = (autoEventKey || FINAL_VALUE.EMPTY_STRING).trim();

                // 校验自动事件有效性事件: supported
                var supported = config.autoEvents.supportEvent(autoEventKey);
                if (!supported) {
                    log("Can't supported automation event name[eventName=" + autoEventKey + "]");
                    return true;
                }

                // 得到表单项名: name
                var itemCtrlName = $this.attr(KEYS.ATTRIBUTE.NAME);

                // 记录需要注册的自动事件
                var existEventForKey = config.autoEvents[autoEventKey];
                var conf = {};
                conf[KEYS.CONFIG.AUTO_EVENT.ITEM] = $this;
                conf[KEYS.CONFIG.AUTO_EVENT.HANDLER] = config.validators.doRemote;
                existEventForKey[itemCtrlName] = conf;
            });
        }
    }

    // 表单回填事件设置
    function setBackfillEvents(events) {
        for ( var key in KEYS.backfill.HANDLERS) {
            var eventName = KEYS.backfill.HANDLERS[key];
            var eventFn = events[eventName];
            Validator.isFunction(eventFn) && (config.events.backfill[eventName]=eventFn);
        }

        var namedHandler  = KEYS.backfill.HANDLERS.NAMED_HANDLERS,
            handlerConf   = config.events.backfill[namedHandler];
        
        config.events.backfill[namedHandler] = (events[namedHandler]||handlerConf);
        Validator.isNotObject(handlerConf) && (config.events.backfill[namedHandler]={});
    }

    // 验证事件设置
    function setValidEvents(events) {
      Utils.each(KEYS.validate.EVENTS, function(name){
        var fn = events[name];
        Validator.isFunction(fn) && (config.events.validate[name]=fn);
      });
    }

    /**
     * 表单项恢复到默认状态
     * @returns {this}
     */
    this.recover = function(){
      $thisObj.container.find("[name]").each(function(){
        var $this = $(this);
        $this.val(this.defaultValue);
        var tagName = this.tagName;
        if (/^SELECT$/ig.test(tagName)) {
          $this.val($this.find("[selected]").val());
        }

        var iptType = $this.attr("type"),
            cbkBox  = /(RADIO|CHECKBOX)/i.test(iptType),
            checked = $this.attr("checked");
        $this.prop("checked", !!checked);
      });
    }

    /**
     * 表单数据回填
     * @param conf {Object} 表单回填配置<br>
     * <table border="1">
     *  <tr>
     *    <th>参数名</th>
     *    <th>类型</th>
     *    <th>说明</th>
     *  </tr>
     *  <tr>
     *    <td>formData</td>
     *    <td>Object</td>
     *    <td>需要回填的表单数据</td>
     *  </tr>
     *  <tr>
     *    <td>beforeHandler</td>
     *    <td>Function</td>
     *    <td>填充表单项统一前置处理器<br>
     *        参数 : {item, value}<br>
     *        返回值: {Boolean} false-终止剩余表单回填
     *    </td>
     *  </tr>
     *  <tr>
     *    <td>namedHandlers</td>
     *    <td>Object</td>
     *    <td>填充表单项指定名称处理器, 优先级高于beforeHandle.<br>
     *        Key : {String} 表单项名称<br>
     *        Value : {Function} 处理器. 参数 : {item, value}; 返回值: {Boolean}
     *        false-终止当前表单回填<br>
     *    </td>
     *  </tr>
     * </table>
     */
    this.backfill = function(conf) {
      log("Backfill form data:[" + JSON.stringify(conf) + "]");
      conf = (conf || {});
      var formData = (conf[KEYS.backfill.PARAMETERS.FORM_DATA])||{};

      // 注册回填处理器
      var events = {};
      events[KEYS.backfill.HANDLERS.NAMED_HANDLERS] = conf[KEYS.backfill.HANDLERS.NAMED_HANDLERS];
      events[KEYS.backfill.HANDLERS.BEFORE_HANDLER] = conf[KEYS.backfill.HANDLERS.BEFORE_HANDLER];
      setBackfillEvents(events);

      // 迭代表单项缓存
      var formControls = $thisObj.getNamedFormControl();
      Utils.each(formControls, function(item) {
        // 获取表单项name属性
        // 通过name属性在formData中获取需要回填的值
        var name            = item.attr(KEYS.ATTRIBUTE.NAME),
            val             = OgnlUtil.instance.getValue(formData, name),

            // 获取数据处理器 > 处理数据
            dataHandlerName = item.attr(KEYS.backfill.ATTRIBUTES.DATA_HANDLER),
            dataHandler     = config.dataHandlers[dataHandlerName];
        Validator.isFunction(dataHandler) && (val=dataHandler(item, val));

        // 如果找到命名的回填前置处理器 > 调用前置处理器
        // 如果没找到命名的回填前置处理器, 执行统一前置处理器
        // 校验前置处理器是否阻止当前表单回填
        var handler = config.events.backfill[KEYS.backfill.HANDLERS.NAMED_HANDLERS][name];
        handler = (Validator.isFunction(handler) ? handler : config.events.backfill.beforeHandler);
        if (Validator.isFunction(handler) && (false == (handler(item, val)))) { return true; }

        // 调用函数为表单项设值
        setItemValue(item, val);
      });
    }

    // 为表单项设值
    function setItemValue(item, value) {
      if (null==value) value="";
      var tagName = item[0].tagName.toUpperCase();
      switch (tagName) {
      case "SELECT":
        // 这里可以控制如果找不到对应的数据项时, 可以添加当前值对应的 OPTION
        // 关于 multiple 的问题, 已被 $.val() 处理过
      case "TEXTAREA":item.val(value); break;
      case "INPUT":
        var iptType = item.attr(KEYS.ATTRIBUTE.INPUT_TYPE).toUpperCase();
        if (FINAL_VALUE.INPUT_TYPE_RADIO==iptType || FINAL_VALUE.INPUT_TYPE_CHECKBOX==iptType) setChose(item, value);
        else item.val(value);
        break;
      default: log("Can't support form-control:" + tagName + "."); break;
      }
    }

    // 设置复选(单选)框选中
    function setChose(item, value) {
      var checked   = false, 
          lawfulVal = (null!=value);
      if (lawfulVal) {
        Validator.isNotArray(value) && (value=[value]);
        Utils.each(value, function(v){
          var val = item.val();
          checked = (val==v);
          if (checked) return false;
        });
      }
      item.prop("checked", checked);
    }

    // 日志记录
    function log(msg) {
      (msg instanceof Object) && (msg = JSON.stringify(msg));
      console ? console.log(msg) : alert(msg);
    }

    // 准备就绪后, 执行初始化函数
    (function() {
      /** true-开启调试模式 */
      $thisObj.debug = !!debug;
      if ($thisObj.debug) {
        $thisObj.KEYS = KEYS;
        $thisObj.FINAL_VALUE = FINAL_VALUE;
        $thisObj.config = config;
      }

      /** 表单容器 */
      $thisObj.container = $(formContainer);

      /** 表单项 */
      $thisObj.formItems = {
        singleValItems: null,
        repeatableItems: null,
        isEmpty: function() {
          var emptySingleItems = (this.singleValItems && this.singleValItems.size()),
              emptyRepeatItems = (this.repeatableItems && this.repeatableItems.size());
          return !(emptySingleItems && emptyRepeatItems);
        },
        _summary: "表单项缓存列表"
      };

      // 注册自动事件
      config.autoEvents.register();

      if (!Form.dirCreated) {
        Form.dirCreated = true;
        Form.debugInstance = new Form($(document), true);
        Form.debugInstance.KEYS = KEYS;
        Form.debugInstance.FINAL_VALUE = FINAL_VALUE;
        Form.debugInstance.config = config;
        Form.dir = {
          KEYS    : Form.debugInstance.KEYS,
          config  : Form.debugInstance.config
        };
      }
    })();

    log("Create form instance.");
    return this;
}

(function($){$.fn.form = function(debug){return new Form($(this), debug);};})($);
