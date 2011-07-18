/***
|''Name:''|TiddlySpaceIntraSpaceInclusion|
|''Description:''|Provides support for {{{<<tiddler Foo@bar>>}}}|
|''Author:''|Jon Robson|
|''Source:''|https://github.com/jdlrobson/TiddlyWikiPlugins/raw/master/plugins/TiddlySpaceIntraSpaceInclusion/TiddlySpaceIntraSpaceInclusion.js|
|''Version:''|0.3.6|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
***/
//{{{
(function() {
	var _tidtext = TiddlyWiki.prototype.getTiddlerText;
	var cache = {};
	TiddlyWiki.prototype.getTiddlerText = function(title, defaultText) {
		if(title) {
			var match = title.match(/\[{2}([^\]]*)\]\]@(.*)/); // matches [[foo]]@bar
			var match2 = title.match(/([^@]*)@(.*)/); // matches foo@bar
			var tidtitle, space;
			if(match && match.length === 3) {
				tidtitle = match[1];
				space = match[2];
			} else if(match2 && match2.length === 3) {
				tidtitle = match2[1];
				space = match2[2];
			}
			var newtitle = tidtitle + "@" + space;
			if(tidtitle && space) {
				title = newtitle;
			}
			if(tidtitle && space && !store.getTiddler(newtitle)) {
				var tiddler = new Tiddler(title);
				tiddler.text = "//retrieving from server//";
				tiddler.fields.doNotSave = "true";
				tiddler.tags = ["excludeLists", "excludeSearch", "excludeMissing"];
				merge(tiddler.fields, config.defaultCustomFields);
				tiddler.fields["server.bag"] = space + "_public";
				tiddler = store.addTiddler(tiddler);
				ajaxReq({ url: "/bags/" + space + "_public/tiddlers/" + tidtitle,
					dataType: "json",
					success: function(tid) {
						var tiddler = store.getTiddler(title);
						tiddler.text = tid.text;
						store.addTiddler(tiddler);
						store.notify(title,true);
						story.refreshAllTiddlers(); // hacky but above link doesn't always seem to work!
					},
					error: function() {
						var tiddler = store.getTiddler(title);
						tiddler.text = "//error retrieving tiddler " + title + " from space " + space + "//";
						store.addTiddler(tiddler);
						store.notify(title,true);
						story.refreshAllTiddlers(); // hacky but above link doesn't always seem to work!
					}
				});
			}
		}
		return _tidtext.apply(this, [title, defaultText]);
	}
})();
//}}}
