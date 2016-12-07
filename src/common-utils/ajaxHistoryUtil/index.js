$(function(){
  $(".link a").each(function(){
    var $this = $(this),
        hash  = $this.attr("href");
    AjaxHistoryUtils.instance.registerHandler(hash, function(curr, pre){
      $("#ctt").load(curr);
    });
  }).click(function(e){e.stopPropagation()});
});