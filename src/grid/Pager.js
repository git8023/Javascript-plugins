(function($) {
    $.pager = {
        style: {
            // 主容器
            mainContainer: "pg_container",
            // 触发器按钮
            trigger: "pg_btn",
            // 上一页
            prev: "prev",
            // 下一页
            next: "next",
            // 页码
            number: "pg_num",
            // 非触发器页码
            NaN: "pg_nan",
            // 激活页码
            current: "current"
        },
        // 页大小选项
        sizeList: [10, 20, 50],
        // 页码数量
        numberCount: 5,
        // 是否显示日志
        showLog: true
    };

    /**
     * 数据网格页脚
     * 
     * @param pagerCtt {jQuery} 页脚容器
     * @param debug {Boolean} true-显示日志信息
     */
    function Pager(pagerCtt, debug) {
        // 控件可配置参数
        var CONF_ATTRS = ["url", "current", "reload", "pageSizes", "numberCount", "reloadBySize"];
        // 事件列表
        var EVENT_NAMES = ["beforeClick", "afterClick", "completed", "beforeSend"];
        // 非数值页码
        var OTHER_NUMBER = "...";

        var $thisObj = this;
        $thisObj.pagerCtt = $(pagerCtt);

        /** 配置项 */
        $thisObj.conf = {};

        /** 事件列表 */
        $thisObj.events = {};

        /** 主容器 */
        $thisObj.pager = undefined;

        var _;

        /**
         * 初始化页脚
         * 
         * @param conf {Object} 初始化配置参数
         * 
         * <pre>
         * // 数据获取请求地址, 页脚容器中同名属性优先级更高
         * url : {String}
         * 响应格式 : {
         *   flag : {Boolean},
         *   message : {String},
         *   data : {
         *     pageSize : {Number},  // 页大小
         *     pageIndex : {Number}, // 当前页
         *     pageTotal : {Number}, // 总页数
         *     beginNum : {Number},  // 开始页码
         *     endNum : {Number},    // 结束页码
         *     rowCount : {Number},  // 总页数
         *     data : {Object}       // 分页数据
         *   }
         * }
         * 
         * // 可选页大小(引文逗号分割&quot;,&quot;), 页脚容器中同名属性优先级更高, 默认值: 10,20,50
         * pageSizes : {Array}-{Number}
         * 
         * // 改变页大小时重新加载数据, 页脚容器中同名属性优先级更高, 默认值:true
         * reloadBySize : {Boolean}
         *  
         * // 页码激活样式, 页脚容器中同名属性优先级更高, 默认值: current
         * current : {String} 
         * 
         * // 是否允许重复加载数据, 页脚容器中同名属性优先级更高, 默认值:false
         * reload : {Boolean}
         * 
         * // 需要显示的页码数量, 页脚容器中同名属性优先级更高, 默认值:5
         * numberCount : {Number} 
         * 
         * // 页码点击前触发 
         * beforeClick : {Function} 
         * 参数:{
         *   index:{Number}, 
         *   next:{Number}
         * }, 
         * 返回值:
         *   false-截断执行
         * 
         * // 点击页码并从远端得到数据后触发
         * afterClick : {Function} 
         * 参数:{
         *   index:{Number}, // 当前页码
         *   data:{Object} // 远程响应数据
         * }
         * 
         * // 页脚创建完成后触发, 该函数仅执行一次
         * completed : {Function}
         * 参数:{
         *   pager : {jQUery}
         * }
         * 
         * // 每次请求发送前触发
         * beforeSend : {Function}
         * 参数:{
         *   param : {JSON} // 默认请求参数
         * },
         * 返回值:
         *   发送Ajax请求时需要的参数,
         *   如果返回值为[undefined|null]则使用默认值,
         *   否则将使用处理后的返回值
         * 
         * </pre>
         */
        this.init = function(conf) {
            conf = (!conf) ? {} : conf;
            getConf(conf);
            getEvent(conf);
            validConf();
            $thisObj.create();

            log("The footer has been created.");
            log("Executing the callback function:completed");
            $thisObj.events["completed"]($thisObj.pager);
            return $thisObj;
        };

        /**
         * 创建页脚
         */
        this.create = function() {
            var pager = createBlock("", $.pager.style.mainContainer);
            $thisObj.pager = pager;
            $thisObj.pagerCtt.html("").append($thisObj.pager);

            // pageSize
            createPageSize($thisObj.conf["pageSizes"]).appendTo(pager);

            // prev
            createBlock("&lt;", $.pager.style.trigger, $.pager.style.prev)
              .appendTo(pager)
              .unbind("click")
              .click(toPage);

            // next
            createBlock("&gt;", $.pager.style.trigger, $.pager.style.next)
              .appendTo(pager)
              .unbind("click")
              .click(toPage);

            // 默认页码1
            createNum(1);

        };

        /**
         * 设置或获取当前页码
         * @param currentIndex {Number} 需要设置的页码, 当前值非法时则获取当前页码
         * @returns {Number} 当前页码
         */
        this.current = function(currentIndex) {
            var isNum = !isNaN(currentIndex);

            // 设置页码
            if (isNum) {
                createNum(currentIndex);
                return currentIndex;
            }

            // 获取页码
            var currTag = $thisObj.pager.find("." + $.pager.style.current);
            var currNum = parseInt(currTag.text());
            if (isNaN(currNum)) {
                log("当前页码非法");
                currNum = 0;
            }
            return currNum;
        };

        /**
         * 重新加载当前页面数据
         * @returns {this}
         */
        this.reload = function() {
            var currIdx = $thisObj.current();
            createNum(currIdx);
            return $thisObj;
        };

        // 创建页大小选项列表
        function createPageSize(arr) {
            var sl = $("<select/>", {"name":"pageSize"});
            $thisObj.conf["reloadBySize"] && sl.unbind("change").change($thisObj.reload);
            Utils.eachValue(arr, function(item){$("<option/>",{"value":item, "html":item}).appendTo(sl);});
            return $("<div/>").addClass("pg_size").append(sl);
        }

        // 创建页码
        function createNum(index) {
            log("执行前置函数:beforeClick");
            var bfrClick  = $thisObj.events["beforeClick"],
                t         = Utils.invoke($thisObj, bfrClick, $thisObj.current(), index),
                skip      = (undefined!=t?t:false);
            if (skip) {log("截断执行"); return;}

            log("获取参数:");
            var param = getUrlParam(index);
            log(param);

            log("Perform event functoin: beforeSend");
            var beforeSend = $thisObj.events["beforeSend"];
            var tmpParam = beforeSend({param:param});
            if (undefined!=tmpParam && null!=tmpParam) param=tmpParam;

            $.ajax({
                url       : param.url?param.url:$thisObj.conf.url,
                dataType  : "JSON",
                data      : param,
                type      : "POST",
                success   : function(data) {
                    var afterClick  = $thisObj.events["afterClick"],
                        tmpData     = afterClick.call($thisObj, index, data);
                    data = tmpData||data;

                    var failed = !data.flag;
                    if (failed) {log(data.message); return;}

                    $thisObj.data = data.data;
                    createNumAfter();
                }
            });
        }

        // 获取请求参数
        function getUrlParam(pageIndex) {
            return {pageSize:$thisObj.getPageSize(), pageIndex:pageIndex};
        }

        /**
         * 获取当前页大小
         * @returns {Number} 当前页大小
         */
        this.getPageSize = function() {
          return $thisObj.pager.find("select[name='pageSize']:eq(0)").val();
        };

        // 创建页码
        function createNumAfter() {
            /**
             * <pre>
             * 响应格式 : { 
             *  flag : {Boolean}, 
             *  message : {String}, 
             *  data : { 
             *    pageSize  : {Number}, // 页大小 
             *    pageIndex : {Number}, // 当前页 
             *    pageTotal : {Number}, // 总页数 
             *    beginNum  : {Number}, // 开始页码 
             *    endNum    : {Number}, // 结束页码 
             *    rowCount  : {Number}, // 总页数 
             *    data      : {Object}  // 分页数据 
             *  } 
             * }
             * </pre>
             */
            var data  = $thisObj.data,
                index = data.pageIndex, 
                total = data.pageTotal;

            var NUM_OTHERS = "...";
            var nums = [];
            nums.push(1);
            // total=10, index=4
            // [<] [1] ... [3] [4] [5] ... [10] [>]

            // total=10, index=1,2,3
            // [<] [1] [2] [3] [4] ... [10] [>]

            // total=10, index=8,9,10
            // [<] [1] ... [7] [8] [9] [10] [>]

            var numCnt  = $thisObj.conf["numberCount"],
                offset  = parseInt(numCnt / 2),
                begin   = index - offset,
                end     = index + offset;
            if (1>begin){end+=1-begin; begin=1;}
            if (total<end) {
                begin-=end-total; end=total;
                (1>begin) && (begin=1);
            }

            // 常规页码
            var tmpNums = [];
            for(var i=begin;i<=end;i++)tmpNums.push(i);

            // 开始页码 > 2, 则包含[...]
            if (2<begin){tmpNums.shift(); nums.push(OTHER_NUMBER);}

            // 添加显示页码
            (1==tmpNums[0]) && nums.shift();
            (2==tmpNums[0] && tmpNums.end()<total) && tmpNums.splice(0, 1, OTHER_NUMBER);
            for(var i=0; i<tmpNums.length; i++) nums.push(tmpNums[i]);

            /*
             * 当前显示的页码数量比总页码多, 且最后一位页码正好比最大页码少1, 那么最后一位应该是非数值页码
             */
            var tmlLen = nums.length;
            ($.pager.numberCount<tmlLen) 
              && (total-1==nums.end()) 
              && nums.splice(tmlLen - 1, 1, OTHER_NUMBER, total);

            // 结束页码 < total - 1, 则包含[...]
            if (total-1 > end) {
                // 省略号位置
                nums.pop();
                nums.push(OTHER_NUMBER);
                nums.push(total);
            }

            // 添加页码
            updateNums(nums, index);
        }

        // 更新页码
        function updateNums(nums, index) {
            // [prev] [...] [3] [4] [5] [...] [10] [next]
            clearNum();
            var next = $thisObj.pager.find("." + $.pager.style.next);
            for (var i = 0; i < nums.length; i++) {
                var num = nums[i],
                    btn = $("<div/>",{"html":num});

                if (isNaN(num)) btn.addClass($.pager.style.NaN);
                else {
                  btn.unbind("click")
                    .click(toPage)
                    .addClass($.pager.style.trigger+" "+$.pager.style.number);
                  (index == num) && btn.addClass($.pager.style["current"]);
                }
                next.before(btn);
            }
        }

        // 清理过时页码
        function clearNum() {
            $thisObj.pager.find("." + $.pager.style.number).remove();
            $thisObj.pager.find("." + $.pager.style.NaN).remove();
        }

        // 页面跳转
        function toPage() {
            var $this   = $(this),
                curr    = $thisObj.current(),
                num     = parseInt($this.text()),
                isNum   = !isNaN(num);

            (!isNum) && (num=getNextNum(curr, $this));

            // 验证是否需要重新加载数据
            if (curr == num) {
                var notReload = !eval($thisObj.conf["reload"]);
                if (notReload) {
                    log("Skip request, Configured cannot repeat load the same data[reload=" + isReload + "].");
                    return false;
                }
            }

            createNum(num);
        }

        // 获取下一个页码
        function getNextNum(curr, btn) {
            var toNum     = -1,
                clazz     = btn.attr("class"),
                prevRegex = eval("/" + $.pager.style.prev + "/"),
                nextRegex = eval("/" + $.pager.style.next + "/");

            if (prevRegex.test(clazz)) toNum = (curr==1 ? 1 : curr-1);
            else {
              var maxNum = $thisObj.data.pageTotal;
              toNum = (curr >= maxNum ? maxNum : curr + 1);
            }
            return toNum;
        }

        // 创建块结构
        function createBlock() {
            var block = $("<div/>"),
                len   = arguments.length;
            if (1>len) return block;

            block.html(arguments[0]);
            for (var i = 1; len > 1 && i < len; i++) {
              var clazz = $.trim(arguments[i]);
              (clazz) && block.addClass(clazz);
            }
            return block;
        }

        // 获取事件
        function getEvent(conf) {
            Utils.each(EVENT_NAMES, function(name, index) {
                var event = conf[name];
                if (Validator.isFunction(event)) {
                  event = function(){log("Invoke default event: "+name);};
                  $thisObj.events[name] = event;
                }
            });
        }

        // 配置项验证, 至少包含url
        function validConf() {
            var url = $thisObj.conf["url"];
            if (!$.trim(url)) {
                $thisObj.conf = undefined;
                throw new Error("缺少必要配置[url], 页脚初始化失败");
            }

            Utils.copyProperties($thisObj.conf, $.pager.style);
            var numCnt = $thisObj.conf["numberCount"];
            (!$.trim(numCnt) || 1>numCnt) 
              && (numCnt = $.pager.numberCount);
            $thisObj.conf["numberCount"] = numCnt;

            log("初始化成功:" + JSON.stringify($thisObj.conf));
        }

        // 获取配置项
        function getConf(conf) {
            Utils.eachValue(CONF_ATTRS, function(prop, i) {
                i = parseInt(i);
                if (isNaN(i)) return;
                var val = pagerCtt.attr(prop);
                val = (val ? val.trim() : null);
                if (!val || 0 >= val.length) {
                    val = conf[prop];
                    val = (val ? val.trim() : null);
                }
                $thisObj.conf[prop] = val;
            });

            // 转换页大小列表
            var sizeListStr = $thisObj.conf["pageSizes"];
            if (!sizeListStr) {
              $thisObj.conf["pageSizes"] = $.pager.sizeList;
              return;
            }

            var sizeList = [];
            sizeListStr = sizeListStr.trim();
            Utils.eachValue(sizeListStr.split(","), function(size, i) {
              size = $.trim(size);
              (!isNaN(size)) && sizeList.push(size);
            });
            $thisObj.conf["pageSizes"] = sizeList;
        }

        // 日志记录
        function log(msg) {
          if (!debug) return;
          var printer = console?console.log:null;
          Validator.isNotFunction(printer) && (printer=alert);
          (msg instanceof Object) && (msg=JSON.stringify(msg));
          printer(msg);
        }

        return this;
    }

    window.Pager = Pager;
    $.fn.pager = function(showLog){return new Pager($(this),showLog);};
})(jQuery);
