/***
|''Name''|StoryFilters|
|''Author''|Jon Robson|
|''Version''|0.6.7|
|''Status''|@@experimental@@|
|''Source''|https://raw.github.com/jdlrobson/TiddlyWikiPlugins/master/plugins/Filters/StoryFiltersPlugin.js|
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
!Notes
Adds the following filters
{{{
[story[open]]
[story[sort]]
}}}
***/
//{{{
(function($) {
var _display = Story.prototype.displayTiddler;
Story.prototype.displayTiddler = function() {
	var res =  _display.apply(this, arguments);
	$("[macroName=list]").each(function(i, el) {
		config.macros.list.refresh(el);
	});
	return res;
};
var _close = Story.prototype.closeTiddler;
Story.prototype.closeTiddler = function() {
	var res =  _close.apply(this, arguments);
	$("[macroName=list]").each(function(i, el) {
		config.macros.list.refresh(el);
	});
	return res;
};

config.storyFilters = {
	open: function(tiddler) {
		return story.getTiddler(tiddler.title) ? true : false;
	},
	sort: function(a, b) {
		var i = $(story.getTiddler(a.title)).index();
		var j = $(story.getTiddler(b.title)).index();
		return i < j ? -1 : 1;
	}
};
config.filters.story = function(results, match) {
	var arg = match[3];
	var newresults = [];
	var handler = config.storyFilters[arg];
	if(arg == "sort") {
		return results.sort(handler);
	} else {
		var tiddlers = store.getTiddlers();
		for(var i = 0; i < tiddlers.length; i++) {
			var tiddler = tiddlers[i];
			if(handler && handler(tiddler)) {
				newresults.push(tiddler);
			}
		}
	}
	return newresults;
}

}(jQuery));
//}}}
