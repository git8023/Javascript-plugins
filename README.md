# Javascript-plugins 
 * [轮播(slider)](https://github.com/git8023/Javascript-plugins/blob/master/README.md#横幅轮播) 
 * [滑动增强(iscroll-probe-enhance)](https://github.com/git8023/Javascript-plugins/blob/master/README.md#滑动增强)
 * [表单(form)](https://github.com/git8023/jQuery-Form-Util)  
 * 布局  
    * [上下布局(UDLayout)](https://github.com/git8023/Javascript-plugins#上下布局)  
    * [左右布局(UDLayout)](https://github.com/git8023/Javascript-plugins#左右布局)  
    * [布局示例](https://github.com/git8023/Javascript-plugins#布局示例)  
 * [侧边栏 (Sidebar)](https://github.com/git8023/Javascript-plugins#侧边栏 )

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
 * OO方式使用, 指定监听事件
 
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
  setIco|{String|jQuery} 图标|{jQuery} 图标容器控件|设置图标
  setMainTitle|{String|jQuery} 主标题|{jQuery} 主标题控件|设置主标题
  setSubTitle|{String|jQuery} 副标题|{jQuery} 副标题控件|设置副标题
  setBody|$body {String|jQuery} 主体内容<br>hasProject {String} 需要远程加载数据时, 需要指定URL中是否需要包含项目名(端口号后第一个文档结构)|{jQuery} 主体内容控件|设置主体内容,内容为字符串时解析为远程加载URL
  refresh|-/-|{Sidebar}|重置主体内容高度设置

  * 事件说明

  事件名|参数|返回值|说明
  ----|----|----|----
opening|-/-|{Boolean} false-阻止打开|侧边栏打开前 
opened|-/-|-/-|侧边栏打开后 
closing|-/-|{Boolean} false-阻止关闭|侧边栏关闭前 
closed|-/-|-/-|侧边栏关闭后 

