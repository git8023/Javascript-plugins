$(function(){
  $(".link a").each(function(){
    var $this = $(this),
        href  = $this.attr("href");
    AjaxHistoryUtils.instance.registerHandler(href, function(curr, pre){
      $("#ctt").load(curr);
    });
  }).click(function(e){e.stopPropagation()});
});