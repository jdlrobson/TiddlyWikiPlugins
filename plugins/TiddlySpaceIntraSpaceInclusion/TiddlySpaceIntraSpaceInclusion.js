/***
|''Name:''|TiddlySpaceIntraSpaceInclusion|
|''Description:''|Provides support for {{{<<tiddler Foo@bar>>}}} and {{{<<tiddler [[Foo]]@bar>>}}}|
|''Author:''|Jon Robson|
|''Source:''|https://github.com/jdlrobson/TiddlyWikiPlugins/raw/master/plugins/TiddlySpaceIntraSpaceInclusion/TiddlySpaceIntraSpaceInclusion.js|
|''Version:''|0.3.7|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
***/
//{{{
(function() {
	var _tidtext = TiddlyWiki.prototype.getTiddlerText;
	var cache = {};

	// allmost the same regExp as in TiddlySpaceLinkPlugin but .. no "mg" parameter, because it didn't work for this usecase.
	config.textPrimitives.spacenameLinkRegExp = new RegExp(config.textPrimitives.unWikiLink + 
													 "?(" + config.textPrimitives.bareTiddlerLetter + "*)@(" + config.textPrimitives.spaceName + ")", "");
	config.textPrimitives.tiddlyLinkSpacenameLinkRegExp = new RegExp("\\[\\[(.*?)(?:\\|(.*?))?\\]\\]@(" + config.textPrimitives.spaceName + ")", "");
	
	TiddlyWiki.prototype.getTiddlerText = function(title, defaultText) {
		var ct = config.textPrimitives;
		var match = ct.spacenameLinkRegExp.exec(title);	// foo@bar
		var match2 = ct.tiddlyLinkSpacenameLinkRegExp.exec(title); 	// [[foo]]@bar
		
		if(match || match2) {
		//	console.log('inner: ', 'spacename: ', match, 'tiddlyLink: ', match2, 'place: ');
			var tidtitle, space;
			if(match[1] && match.length === 3) {
				tidtitle = match[1];
				space = match[2];
			} else if(match2 && match2.length === 4) {
				tidtitle = match2[1];
				space = match2[3];
			}
			var newtitle = tidtitle + "@" + space;
			if(tidtitle && space) {
				title = newtitle;
			}
			if(tidtitle && space && !store.getTiddler(newtitle)) {
				var tiddler = new Tiddler(title);
				// get the tiddler, where the macro is rendered. //XXX will need more testing
				var el = story.findContainingTiddler(place);
				var refreshTitle = (el) ? el.getAttribute('tiddler') : null;

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
						// store.notify(title,true);
						story.refreshTiddler(refreshTitle,null,true);
						// story.refreshAllTiddlers(); // hacky but above link doesn't always seem to work!
					},
					error: function() {
						var tiddler = store.getTiddler(title);
						tiddler.text = "//error retrieving tiddler {{{" + title + "}}} from space @" + space + "//";
						store.addTiddler(tiddler);
						// store.notify(title,true);
						story.refreshTiddler(refreshTitle,null,true);
						// story.refreshAllTiddlers(); // hacky but above link doesn't always seem to work!
					}
				});
			}
		}
		return _tidtext.apply(this, [title, defaultText]);
	}
})();
//}}}
