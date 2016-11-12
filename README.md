# Javascript-plugins  

  * [轮播(slider)]('https://github.com/git8023/Javascript-plugins/blob/master/README.md#横幅轮播')
  * [表单(form)]('https://github.com/git8023/jQuery-Form-Util')

## 横幅轮播
 * 仅仅作为展示只用时, 可使用`jQuery`方式加载横幅
 
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
