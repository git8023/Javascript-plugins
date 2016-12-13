# Javascript-plugins 
 * Banner
    * [Banner 自动切换](#横幅轮播)
    * [IScroll-Banner 仅滑动切换,支持放大查看单个项目, 推荐作为Banner详情使用](#iscroll-banner)
 * [滑动增强(iscroll-probe-enhance)](#滑动增强针对iscrolliscroll-probejs---513)
 * [表单(form)](#表单)  
 * 布局  
    * [上下布局(UDLayout)](#上下布局)  
    * [左右布局(UDLayout)](#左右布局)  
    * [布局示例](#布局示例)  
 * [侧边栏 (Sidebar)](#侧边栏 )
 * [数据网格 (DataGrid)](#数据网格)
 * [异步加载管理 (AjaxHistoryUtil)](#异步加载管理)

# 横幅轮播  
 * 仅仅作为展示之用时, 可使用`jQuery`方式加载横幅  
 
 属性名 | 属性值 | 说明
 ------ | ----- | -----
 slider-speed | {Number}正整数 | 项切换时间  
 slider-pause | {Number}正整数 | 项停留时间  
 slider-scroll-offset | {Number}正整数 |  项切换时偏移量  
 slider-offset-speed | {Number}正整数 | 偏移量执行时间  
 
 ```html
  <div style="width:50%; margin:10px auto; border:1px solid #F00"> 
    <div class="slider-container2" 
        style="border:2px solid #DDD; border-radius:5px;" 
        slider-speed="1000" slider-pause="2500" 
        slider-scroll-offset="0" slider-offset-speed="0"> 
        <div >
          <ul class=""> 
              <li><img src="img/1.jpg"/></li> 
              <li><img src="img/2.jpg"/></li>     
              <li><img src="img/3.jpg"/></li>     
              <li><img src="img/4.jpg"/></li>     
          </ul>     
        </div>     
    </div>     
  </div>     
 ```     
 ```javascript
  $(function(){
    $(".slider-container2").slider();
  });
 ```
 * 面向对象方式使用, 指定监听事件
 
 ```html
<div style="width:50%; margin:10px auto; border:1px solid #F00">
  <div class="slider-container" style="border:2px solid #DDD; border-radius:5px;">
      <div >
        <ul>
            <li><img src="img/1.jpg"/></li>
            <li><img src="img/2.jpg"/></li>
            <li><img src="img/3.jpg"/></li>
            <li><img src="img/4.jpg"/></li>
        </ul>
      </div>
  </div>
</div>
 ```
 事件名 |  参数 | 返回值 | 说明
 ------| ---- | ---- | ----
 completed | -/- |  -/- | 初始化完成后
 swapping | $current {jQuery} - 当前展示的项<br/>$next {jQuery} - 下一个要展示的项 | false - 停留在当前项 | 项切换前
 swapped | $current {jQuery} - 当前展示的项 | -/- | 项切换完成后
 pause | $current {jQuery} - 当前展示的项 | -/- | 鼠标悬停暂停时
 play | -/- | -/- | 鼠标离开后
  ```javascript
  $(function() {
    var el                  = $(".slider-container"),
        slider              = new Slider(el, true);
        sliderEventBuilder  = new SliderEventBuilder(),
    sliderEventBuilder
      .completed(function(){
        console.log("completed");
      }).play(function(){
        console.log("play:");
      }).swapping(function($curr, $next){
        console.log("swapping:");
      }).swapped(function($curr){
        console.log("swapped:");
      });

  slider
    .registerEvents(sliderEventBuilder)
    .init()
    .play();
  });
  ```  

# IScroll Banner
  * 依赖
    * iscroll-zoom.js `v5.1.3`
    * jQuery 
  * 事件说明
  
  事件名 | 参数 | 返回值 | 说明
   --- | --- | --- | --- 
   beforeAppend | item{jQuery} - 图片容器<br>index{Number} - 当前图片索引 | false - 过滤当前图片 | 图片项追加到容器之前
   afterAppend |  item{jQuery} - 图片容器<br>index{Number} - 当前图片索引 | false - 当前图片禁用缩放功能
   
  * 方法说明
  
  方法名 | 参数 | 返回值 | 说明
  --- | --- | --- | ---
  registerEvents | 参考事件说明 | {IScrollBanner} | 事件注册
  init | srcArr{Array} - 图片路径 | {IScrollBanner} | 初始化
  destroy | -/- | -/- | 释放资源
  
  * 如何使用
    ```javascript
    // 获取实例
    var banner = IScrollBanner.instance;
    // 或通过多实例方式获取
    // var banner = IScrollBanner();
    
    // 注册事件
    banner.registerEvents({
      beforeAppend  : function(item, index){
        // 过滤当前项
        // return false;
      },
      afterAppend   : function(item, index){
        // 返回false, 禁止当前项缩放
        // return false;
      }
    });
    
    // 初始化
    var imgSrcArr = ["1.png","2.png"];
    banner.init(imgSrcArr);
    ```
   
  

# 上下布局 
  * 首先引入必要文件  
    * jQuery   : 1.10+  
    * util     : Utils.js(本项目)  
    * UDLayout : UDLayout.js(本项目)   
 
  * HTML配置
  
  ```html
  <div class="container">
    <div class="layout-ud-container">
      <div class="layout-top"></div>
      <div class="layout-down"></div>
    </div>
  </div>
  ```
  * JS代码
  
  ```javascript
    $(function(){
        // 获取布局器
        var layout = new UDLayout($(".layout-ud-container"), true);
        // 注册事件, 必须在初始化之前执行
        layout.registerEvents({completed:function(){console.log(this);}});
        // 初始化布局器
        layout.init(0.3);
    });
  ```

# 左右布局  
  * 首先引入必要文件  
    * jQuery   : 1.10+  
    * util     : Utils.js(本项目)  
    * LRLayout : LRLayout.js(本项目)   
 
  * HTML配置
  ```html
  <div class="container">
    <div class="layout-ud-container">
      <div class="layout-left"></div>
      <div class="layout-right"></div>
    </div>
  </div>
  ```
  * JS代码
  
  ```javascript
    $(function(){
      // 获取布局器
      var layout = new LRLayout($(".layout-ud-container"), true);
      // 注册事件, 必须在初始化之前执行
      layout.registerEvents({completed:function(){console.log(this);}});
      // 初始化布局器
      layout.init(0.3);
    });
  ```
  
# 布局示例

  * 先分上下布局, 下部分左右
  
  ```html
  <style type="text/css">
    * {margin: 0; padding: 0; box-sizing: border-box; -webkit-box-sizing: border-box; -moz-box-sizing: border-box;}
    .ud-container {height: 400px;}
    .layout-top {background-color: #F00;}
    .layout-down {background-color: #0F0;}
    .layout-left {background-color: #FF0;}
    .layout-right {background-color: #0FF;}
  </style>
  <div class="ud-container">
    <div class="layout-top"></div>
    <div class="layout-down lr-container">
        <div class="layout-left"></div>
        <div class="layout-right"></div>
    </div>
  </div>
  <script type="text/javascript" src="../../jquery-1.10.2.js"></script>
  <script type="text/javascript" src="../../common-utils/Utils.js"></script>
  <script type="text/javascript" src="../ud/UDLayout.js"></script>
  <script type="text/javascript" src="../lr/LRLayout.js"></script>
  ```
  
  * 初始化布局
  
  ```javascript
    $(function(){
      var debug     = true;

      // 设置上下布局
      var udLayout  = new UDLayout($(".ud-container"), debug);
      udLayout.registerEvents({completed : function(){console.log(this)}}).init(0.1);

      // 设置左右布局
      var lrLayout  = new LRLayout($(".lr-container"), debug)
      lrLayout.registerEvents({completed : function(){console.log(this)}}).init(0.2);

      // 监控窗口变化
      $(".ud-container").height(document.documentElement.clientHeight);
      $(window).resize(function(){
        $(".ud-container").height(document.documentElement.clientHeight);
      });
    });
  ```
  * 效果查看
  
  ![](https://raw.githubusercontent.com/git8023/Javascript-plugins/master/src/layout/demo/layout-test.png)

# 滑动增强(针对[IScroll](https://github.com/cubiq/iscroll)iscroll-probe.js - 5.1.3)
  * HTML准备  
  
  ```html  
  <div id="wrapper">
    <ul>
      <li id="down" class="clear"></li>
      <li>Item 001</li>
      <li>Item 002</li>
      <li>Item 003</li>
      <li>...</li>
      <li>Item 098</li>
      <li>Item 099</li>
      <li>Item 100</li>
      <li id="up" class="clear"></li>
    </ul>
  </div>
  ```
  * CSS准备 
  
  ```css  
  *{margin:0;padding:0;}
  #wrapper {border:1px solid #F00; height:400px; overflow:hidden;}
  ```
  * 获取IScroll实例   
  
  ```javascript
  // probeType:3, 从v5开始需要指定改值才可监控scroll事件
  var iscroll = new IScroll("#wrapper",{probeType:3});
  ```
  * 获取增强版实例 
  
  ```javascript
  var wrapper = new IScrollWrapper(iscroll, 30);
  wrapper.registerEvents({
      boundary  : function(direction){// direction{String}[down|up] 移动方向 -/- 滑动超出边界外时 
        switch(direction) {
        case "up": 
          $("#up").html("松开加载更多数据"); break;
        case "down": 
          $("#down").html("松开刷新"); break;
        break;
        }
      }, 
      moving    : function(direction){ // direction{String}[down|up] 移动方向 -/- 移动时执行(包括边界内) 
        switch(direction) {
        case "up": 
          $("#up").html("上拉加载更多数据"); break;
        case "down": 
          $("#down").html("下拉刷新"); break;
        case "stop": 
          $(".clear").html("");
        break;
        }
      },
      slideDown : function(){ // -/- -/- 下拉事件, 至少需要触发boundary事件 
        $("<li/>",{html:++count}).insertAfter($("#down"));
        this.refresh();
      },
      slideUp   : function(){ // -/- -/- 上拉事件, 至少需要触发boundary事件 
        $("<li/>",{html:++count}).insertBefore($("#up"));
        this.refresh();
      }
    });
  ```
  * 增强版事件

  事件名|参数|返回值|说明 
 ------| ---- | ---- | ----
  boundary | direction{String}[down/up] 移动方向 | -/- | 滑动超出边界(OffsetHeight指定值外)时
  moving | direction{String}[down/up/stop] 移动方向 | -/- | 滑动超出边界(OffsetHeight指定值内)时 
  slideDown | -/- | -/- | 下拉事件, 至少需要触发boundary事件  
  slideUp | -/- | -/- | 上拉事件, 至少需要触发boundary事件  

  * 事件执行顺序
  
    * moving(up|down) -> moving(down|up) -> moving(stop)
    * moving(up) -> boundard(up) -> moving(down) -> moving(stop) -> slideUp()
    * moving(down) -> boundard(down) -> moving(up) -> moving(stop) -> slideUp()
  
  * 小贴士
  
    如果初始内容没有超过视窗容器, 可设置内容容器最小高度[min-height:101%;]

# 侧边栏
  每个侧边栏实例对象代表一个侧边栏, 如果要同时展示多个时, 需要获取多个`Sidebar`对象

  * 模块引入

    * jquery  
    * Utils.js(本项目) 
    * SideBar.js(本项目)

  * 通过javascript代码初始化侧边栏

  ```javascript
  // 获取侧边栏实例对象
  var sidebar = new Sidebar();
  // 通过配置数据初始化
  sidebar.init({
    direction : "right",              // {String} CSS Class样式,  默认值:up-Λ, right->, down-V, left-< 侧边栏所在的方向 
    closeIco  : "sidebar-back-ico",   // {String} up/right/button/left 关闭按钮图标样式 
    mainTitle : "Main Title",         // {String|jQuery|DOM} any 主标题 
    subTitle  : "Sub Title",          // {String|jQuery|DOM} any 副标题 
    width     : 0.6,                  // {Number} 0.1~1.0之间时使用百分比, 否则使用像素单位 容器占整个屏幕的宽度, 高度总是100% 
  });
  // 注册事件
  sidebar.registerEvents({
    opening : function(){console.log("opening");},  // false-阻止打开 侧边栏打开前 
    opened  : function(){console.log("opened");},   // 侧边栏打开后 
    closing : function(){console.log("closing");},  // false-阻止关闭 侧边栏关闭前 
    closed  : function(){console.log("closed");},   // 侧边栏关闭后 
  });
  // 显示侧边栏
  sidebar.show();
  // 隐藏侧边栏, 点击侧边栏外部区域或点击ICO区域
  sidebar.hide();
  ```
  
  * 配置说明  
  
  属性名 | 类型 | 范围 | 说明
 ------| ---- | ---- | ----
  direction | {String}  |  top/right/bottom/left | 侧边栏所在的方向
  closeIco  |  {String|jQuery} | -/- | 图标
  mainTitle  |  {String|jQuery} | -/- | 主标题
  subTitle | {String | jQuery} | -/- | 副标题
  width | {Number} | 0.1~1.0之间时使用百分比, 否则使用像素单位 | 左右侧边栏作为宽度, 上下侧边栏作为高度
  speed | {Number} | 正整数 | 动画执行时间
  
  * 可用方法 
  
  方法名 | 参数 | 返回值 | 说明
  -----|----|----|----
  init | 参考配置说明 |{Sidebar}| 初始化配置 |
  show | -/- |{Sidebar}|显示侧边栏
  sidebar | -/- |{Sidebar}|隐藏侧边栏
  registerEvents|参考事件说明|{Sidebar}|注册事件
  setIco|{String/jQuery} 图标|{jQuery} 图标容器控件|设置图标
  setMainTitle|{String/jQuery} 主标题|{jQuery} 主标题控件|设置主标题
  setSubTitle|{String/jQuery} 副标题|{jQuery} 副标题控件|设置副标题
  setBody|$body {String/jQuery} 主体内容<br>hasProject {String} 需要远程加载数据时, 需要指定URL中是否需要包含项目名(端口号后第一个文档结构)|{jQuery} 主体内容控件|设置主体内容,内容为字符串时解析为远程加载URL
  refresh|-/-|{Sidebar}|重置主体内容高度设置

  * 事件说明

  事件名|参数|返回值|说明
  ----|----|----|----
opening|-/-|{Boolean} false-阻止打开|侧边栏打开前 
opened|-/-|-/-|侧边栏打开后 
closing|-/-|{Boolean} false-阻止关闭|侧边栏关闭前 
closed|-/-|-/-|侧边栏关闭后 

# 数据网格

  * html配置

  ```html
  <div class="data-grid">
    <table>
      <thead>
        <tr>
          <th g-type="radio"></th>
          <th g-type="checkbox"></th>
          <th g-type="ordinal">#</th>
          <th g-prop-name="id">ID</th>
          <th g-prop-name="name">Name</th>
          <th g-prop-name="birthday" g-type="date" g-date-format="yyyy-MM-dd">Birthday</th>
        </tr>
      </thead>
    </table>
  </div>
  <div class="data-pager" 
    url="/pagingData"
    current="1"
    reload="true"
    pageSizes="10,20,50,100"
    numberCount="5"
    reloadBySize="true"
    />
  ```

  * javascript调用

  ```javascript
  var grid  = new DataGrid($(".data-grid"), true),
      pager = new Pager($(".data-pager"), true);
  pager.init({
    // 点击翻页后, 发送请求前
    beforeClick : function(index, next){},  // 参数 index, next; 返回值:false-截断执行

    // 获取到服务器响应后
    afterClick  : function(index, rData){   // 参数 index, data
      var dataList = rData.data.data;
      grid.fill(dataList, false);
    },

    // 初始化完成后
    completed   : function(){},

    // jQuery.ajax 请求发送前
    // 返回值: 发送Ajax请求时需要的参数, 
    // 如果返回值为[undefined|null]则使用默认值, 否则将使用处理后的返回值
    beforeSend  : function(conf){
      console.log(conf.param);
      conf.param["searchKeyWord"] = "test";
      return conf.param;
    },
  });
  ```

  * 数据网格配置项说明

  参数名 | 类型 | 范围 | 说明
  ---- | ---- | ---- | ----
  g-prop-name | {String} | -/- | 属性名
  g-empty | {String} | -/- | 指定属性值为空时, 展示的内容
  g-style | {String} | -/- | 表头行内样式
  g-class | {String} | -/- | 表头类样式
  g-child-style | {String} | -/- | 数据行行内样式
  g-child-class | {String} | -/- | 数据行类样式
  g-type | {String} | date-日期类型<br>ordinal - 行号<br>radio - 单选框<br>checkbox - 多选框|单元格类型, radio/checkbox时值为ordinal
  g-date-format | {String} | yMdhms | 当type为date时, 格式化日期样式
  text | {String} | -/- | 表头展示的数据, 可配置为TH标签体内容

  * 数据网格事件说明

  事件名 | 参数 | 返回值 | 说明
  ---- | ---- | ---- | ----
  cellDataHandler | propName{String} - 属性名<br>propVal{Object} - 属性值 | -/- | 单元格数据处理前
  cellHandler | cell{jQuery} - 单元格控件<br> propName{String} - 属性名<br>propVal{Object} - 属性值|-/-|单元格追加到行之前
  rowDataHandler | ordinal{Number} - 行号<br>rowData{Object} - 行数据 | -/- | 行数据处理前 
  rowHandler | row{jQuery} - 行控件<br>ordinal{Number} - 行号<br>rowData{Object} - 行数据 | -/- | 行追加到单元格之前
  fillingHandler | -/- | -/- | 网格数据处理前
  filledHandler | -/- | -/- | 网格数据填充完成后

  * 页脚配置项说明

  参数名 | 类型 | 范围 | 说明
  ---- | ---- | ---- | ----
  url | {String} | -/- | 分页处理接口(URL)
  current | {Number} | 正整数 | 默认展示的页码, 通常为1
  reload | {Boolean} | true/false | 点击当前页码时, 是否重新加载本页数据
  pageSizes | {Number} | 正整数 | 提供的可选页大小, 逗号分隔多项 
  numberCount | {Number} | 正整数 | 页码展示的数量 
  reloadBySize | {Boolean} | true/false | 改变页大小时, 是否立即刷新数据网格

  * 页脚事件说明

  事件名 | 参数 | 返回值 | 说明
  ---- | ---- | ---- | ----
  beforeClick | index{Number} - 当前页码<br>next{Number} - 目标页码 | {Boolean} - false,禁止前往目标数据页 | 点击页码后, 发送请求前
  afterClick | index{Number} - 当前页码<br>rData{Object} - 服务器响应的数据 | {Object} - 处理后的数据 | 获取服务器响应后, 处理数据前. 返回null/undefined时, 直接使用服务器相应数据
  completed | -/- | -/- | 初始化完成后(仅执行一次) 
  beforeSend | conf{Object} - 请求参数包装对象 | {Object} - 请求参数 | 发送请求前, 获取参数`var param = conf.param`, 返回null/undefined时, 直接使用默认参数,否则将使用返回值作为请求参数

  * 页脚方法说明

  方法名 | 参数 | 返回值 | 说明
  ---- | ---- | ---- | ----
  init | conf{Object} | {this} | 初始化页脚, 参数详情参照`页脚配置项说明`和`页脚事件说明`
  current | currentIndex{Number} - 当前页码 | {this} | 参数为空时,获取当前页码; 否则设置为参数指定页码
  reload | -/- | -/- | 重新加载本页数据

  * 分页数据响应格式说明

  ```javascript
  // 如果实际响应格式与当前格式不匹配时, 
  // 可在 afterClick 中做出调整
  var resultStruct =  { 
    flag : {Boolean}, 
    message : {String}, 
    data : { 
      pageSize  : {Number}, // 页大小 
      pageIndex : {Number}, // 当前页 
      pageTotal : {Number}, // 总页数 
      beginNum  : {Number}, // 开始页码 
      endNum    : {Number}, // 结束页码 
      rowCount  : {Number}, // 总页数 
      data      : {Object}  // 分页数据 
    } 
  };

  // 在afterClick中做出数据结构调整
  pager.init({
    afterClick : function(pageIndex, rData) {
      var pageData = { 
        flag : (1==rData.code), 
        message : rData.msg, 
        data : { 
          pageSize  : rData["pageSize"],  // 页大小 
          pageIndex : rData["pageIndex"], // 当前页 
          pageTotal : rData["pageTotal"], // 总页数 
          beginNum  : rData["beginNum"],  // 开始页码 
          endNum    : rData["endNum"],    // 结束页码 
          rowCount  : rData["rowCount"],  // 总页数 
          data      : rData["data"]       // 分页数据 
        } 
      };
      // grid.fill(pageData.data.data);
      return pageData;
    }
  });
  ```

# 表单

  * 获取表单对象

  ```javascript
  // formCtnr - form container, 表单容器, 不限于FORM控件可以是任意元素
  // debug    - 是否进入Debug模式, 在Debug模式中, 将在浏览器控制台打印一些有助于调试的信息
  var form = Form(formCtnr, debug);
  ```

  * 获取表单数据

  ```javascript
  // refreshCache - 是否刷新已缓存的表单项, 推荐仅在表单项或name属性值发生变化时使用true
  var formData = form.getData(refreshCache);
  // 表单数据对象说明:
  // Key    - {String} 表单控件name属性值, name属性非法时将排除该值
  // Value  - {String|Array} 典型表单控件仅包含单个值, 当包含input[type=checkbox]或select[multiple]时, 值为数组类型
  ```

  * 表单校验

  ```javascript
  // 表单校验依赖于正则表达式, 校验结果依赖于`validConf`指定
  var validPass = form.validate(validConf);
  ```

  * 表单校验HTML配置

  ```html
  <input 
      type        = "text" 
      name        = "text"

      regexp        = "{Regexp}"
      regexp-error  = "{RegexpErrorMessage}"

      eq-to       = "{jQuerySelector}"
      eq-to-error = "{equalToErrorMessage}"

      not-eq-to       = "{jQuerySelector}"
      not-eq-to-error = "{notEqualToErrorMessage}"

      remote-url  = "{RemoteUrl}"
    />
  ```

  配置说明

  属性名 | 属性值 | 说明
  ---- | ---- | ----
  regexp | {Regexp} | 正则表达式校验, 示例: regexp="/^.+$/"
  regexp-error | {String} | 正则表达式校验错误消息, 示例: regexp-error="当前值不能为空"
  eq-to | {String} | 相同值校验, 属性值为`jQuerySelector`, 示例: eq-to="[name='password']:first"
  eq-to-error | {String} | 相同值校验错误消息, 示例: not-eq-to="两次密码输入不一致"
  not-eq-to | {String} | 异同值校验, 属性值为`jQuerySelector`, 示例: not-eq-to="[name='account']:first"
  not-eq-to-error | {String} | 异同值校验错误消息, 示例: not-eq-to-error="密码不能与账户名相同"
  remote-url | {String} | 远程校验, 属性值为远程校验地址, 示例: remote-url="exists/account.do"

  * 表单校验`validate()`函数参数说明(值配置)

  参数名 | 类型 | 取值范围 | 说明
  --- | --- | --- | ---
  refreshCached | {Boolean} | true/false | 是否刷新表单项缓存
  validAll | {Boolean} | true/false | true-总是验证所有表单项,<br>false-遇到验证失败时停止验证.


  * 表单校验`validate()`函数参数说明(事件配置)

  事件名 | 参数 | 返回值 | 说明
  ---- | ---- | ---- | ----
  validSuccess | item-表单控件, value-值 | -/- | 验证通过回调函数
  validFailed | item-表单控件, value-值, errMsg-错误消息 | -/- | 验证失败回调函数
  remoteHandler | item-表单控件, resultData-服务器响应数据 | -/- | 远程验证回调函数
  validCompleted | validResult-校验结果,validate()返回值与当前结果一致 | -/- | 验证完成后回调函数

  * 方法说明

  方法名 | 参数 | 返回值 | 说明
  ---- | ---- | ---- | ----
  registerEvents | 参照 :表单校验事件配 | {this} | 事件注册
  getData | refreshCached{Boolean}-刷新表单项缓存 | {this} | 表单对象
  validate | validConf | {Boolean}-true:通过, false-失败 | 表单校验
  recover | -/- | -/- | 清空表单项, 恢复至初始状态
  backfill | formData{Object}-表单数据<br>beforeHandler{Function}-填充表单项统一前置处理器<br><br>namedHandlers{Object}-填充表单项指定名称处理器, 优先级高于beforeHandle<br>Key : {String} 表单项名称<br>Value : {Function} 处理器. 参数 : {item, value}; <br>返回值:false-终止当前表单回填 | -/- | 表单数据回填

# 异步加载管理

  用于ajax加载的页面支持浏览器前进/后退功能, 详情查看[示例代码](https://github.com/git8023/Javascript-plugins/tree/master/src/common-utils/ajaxHistoryUtil)

  ```javascript
  // 注册需要监控的hash值
  // hash     - 需要监控的hash值
  // handler  - 处理程序
  // coverage - 
  AjaxHistoryUtils.instance.registerHandler(hash, function(curr, pre){

    // 在浏览器地址栏hash值发生变化时, 
    // 如果与指定的 href相同, 
    // 就会执行当前函数
    $("#ctt").load(curr);
  }, coverage, context);

  // 注销指定hash监控
  AjaxHistoryUtils.instance.unregister(hash);
  ```
  