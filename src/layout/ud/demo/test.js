$(function(){
  new UDLayout($(".layout-ud-container"), true)
    .registerEvents({
      completed : function(){console.log(this);}
    })
    .init(0.3);
});