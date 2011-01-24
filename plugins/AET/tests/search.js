module("AET SearchBox", {
	setup: function() {
	  config.extensions.testUtils.addTiddlers([
	    {title:"aet.jp",tags:['foo','bar','baz'],fields:{"reports":""}},
	    {title:"aet.jon",tags:['foo','bar','baz'],fields:{"reports":"aet.jeremy"}},
	    {title:"aet.jeremy","tags":['baz','dum'],fields:{"reports":"aet.jp"}},
	    {title:"aet.martin","tags":['baz','dum'],fields:{"reports":""}},
	    {title:"aet.suggestions",text:"rabbit\ncat\nmonkey"}
	  ]);
	},
	teardown: function() {
		config.extensions.testUtils.removeTiddlers(["aet.jon", "aet.jp", "aet.jeremy", "aet.martin",
			"aet.suggestions"]);
	}
});

test("searchbox", function(){
  var place = document.createElement("place");
  var paramString ="type:search metaDataName:reports valuesSource:aet.suggestions";
  config.macros.aet.handler(place,null,[],null,paramString,tiddler)
  
});