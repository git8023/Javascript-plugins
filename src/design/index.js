$(function(){
  var screen    = Utils.screen(),
      offset    = 0,
      $body     = $("body").height(screen.height-offset),
      $lrCtnr   = $body.find(".design-container");
      lrLayout  = new LRLayout($lrCtnr);
  lrLayout.init(300);
  $(window).resize(function(){$body.height(Utils.screen().height-offset)});
});