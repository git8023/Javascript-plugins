$(function() {
  var el                  = $(".slider-container"),
      slider              = new Slider(el, true);
      sliderEventBuilder  = new SliderEventBuilder(),
      events              = sliderEventBuilder.events();

  console.log(events);
  events.completed(function() {
//    console.log("completed:" + JSON.stringify(arguments));
    console.log("completed:");
  }).pause(function(curr){
//    console.log("pause:" + JSON.stringify(arguments));
    console.log("pause:");
  }).play(function(){
//    console.log("play:" + JSON.stringify(arguments));
    console.log("play:");
  }).swapping(function(curr, next){
//    console.log("swapping:" + JSON.stringify(arguments));
    console.log("swapping:");
  }).swapped(function(){
//    console.log("swapped:" + JSON.stringify(arguments));
    console.log("swapped:");
  });

  slider.registerEvents(sliderEventBuilder);
  slider.init().play();
});

