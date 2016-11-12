# Javascript-plugins  

  * [轮播(slider)]('')

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
  
