//'viewimage field:image maxheight:190 maxwidth:250 class:articleimage
(function($) {
module("AET Media (Files,Images,Video)", {
	setup: function(){
	  config.extensions.testUtils.addTiddlers([
	    {title:"aet.imagetiddler",tags:['foo','bar','baz'],fields:{"image":"100x100.png","video":"http://youtube.com/video"}}
	  ]);
	},
	teardown: function() {
		config.extensions.testUtils.removeTiddlers(["aet.imagetiddler"]);
	}
});

test("macro: view video", function(){
 
  var expected,actual,place,place2,tid;
  place = document.createElement("div");
  tid = store.getTiddler("aet.imagetiddler");
  config.macros.view.handler(place,null,["video","video"],null,"video video width:200 src:jonsunsupportedwebsite.com/video",tid);
  same("No video.",$(place).text(),"only selected external video websites work.");
  //if(!config.browser.isIE){
    config.macros.aet.setMetaData("aet.imagetiddler",'video','http://www.youtube.com/watch?v=Bxvm0LKbcAI');
    config.macros.view.handler(place,null,["video","video"],null,"video video width:200",tid);
    same($("object",place).length,1,"object created");
  //}
  config.macros.aet.setMetaData("aet.imagetiddler",'video','');
  
  config.macros.view.handler(place,null,["video","video"],null,"video video width:200",tid);
  same("",$(place).text(),"blank works fine");
});

})(jQuery);