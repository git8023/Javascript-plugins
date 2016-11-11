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

$(function(){
  $(".slider-container2").slider();
});