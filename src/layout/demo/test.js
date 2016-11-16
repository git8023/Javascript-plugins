$(function(){
  var debug     = true,
      udLayout  = new UDLayout($(".ud-container"), debug)
                    .registerEvents({
                      completed : function(){console.log(this)}
                    }).init(0.1),
      lrLayout  = new LRLayout($(".lr-container"), debug)
                    .registerEvents({completed : function(){console.log(this)}})
                    .init(0.2);
  $(".ud-container").height(document.documentElement.clientHeight);
  $(window).resize(function(){
    $(".ud-container").height(document.documentElement.clientHeight);
  });
});