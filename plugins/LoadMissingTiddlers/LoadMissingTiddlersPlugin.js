/***
|''Name''|LoadMissingTiddlersPlugin|
|''Status''|Experimental|
|''Version''|0.5.6|
!About
This updates your TiddlySpace when confronted with a missing tiddler to look at other known sources for that information.
Hacks the open paramifier to open regardless of whether tiddler exists locally.
***/
//{{{
(function($) {
var tiddlyspace = config.extensions.tiddlyspace;
config.paramifiers.open = {
	onstart: function(v) {
			story.displayTiddler("bottom",v,null,false,null);
	}
};

config.shadowTiddlers.TiddlySpaceFloorboards = ["%0_public", "%0_archive", "glossary_public"].join("\n");
config.floorboards = store.getTiddlerText("TiddlySpaceFloorboards").split("\n");

var ext = config.extensions.LoadMissingTiddlers = {
	notFound:  []
}
var _t = TiddlyWiki.prototype.getTiddler;
var _tid = TiddlyWiki.prototype.getTiddlerText;
TiddlyWiki.prototype.getTiddlerText = function(title,defaultText) {
	this.getTiddler(title);
	return _tid.apply(this, arguments);
}
TiddlyWiki.prototype.getTiddler = function(tiddlerName)
{
	var notFound = ext.notFound;
	var isUrl = tiddlerName.indexOf("http") === 0;
	var isEmpty = $.trim(tiddlerName).length === 0;
	var isTag = store.getTaggedTiddlers(tiddlerName).length > 0;
	var isTransclusion = tiddlerName.indexOf(config.textPrimitives.sectionSeparator) > -1;
	var isSlice = tiddlerName.indexOf(config.textPrimitives.sliceSeparator) > -1;
	var res = _t.apply(this, arguments);
	if(!res && !notFound.contains(tiddlerName) && !isTransclusion && !isTag && !isEmpty && !isSlice && !isUrl) {
		notFound.pushUnique(tiddlerName);
		window.setTimeout(function() {
			var dirty = story.isDirty(tiddlerName);
			if(!dirty) {
				story.loadMissingTiddler(tiddlerName, config.defaultCustomFields, function(context) {});
			}
		}, 300);
	} else {
		return res;
	}
};

Story.prototype.loadMissingTiddler = function(title,fields,callback) {
	var tiddler = new Tiddler(title);
	tiddler.fields = typeof fields == "string" ? fields.decodeHashMap() : fields || {};
	var context = {
		serverType: tiddler.getServerType()
	};
	if(!context.serverType) {
		if(!startingUp) {
			return;
		} else {
			var s = this;
			window.setTimeout(function() {
				s.loadMissingTiddler(title, fields || config.defaultCustomFields, callback);
			}, 1000);
			return config.messages.loadingMissingTiddler.format(title,"unknown","unknown","unknown");
		}
	}
	context.host = tiddler.fields['server.host'];
	context.workspace = tiddler.fields['server.workspace'];
	var adaptor = new config.adaptors[context.serverType];

	var getTiddlerCallback = function(context) {
		if(context.status) {
			var t = context.tiddler;
			if(!t.created)
				t.created = new Date();
			if(!t.modified)
				t.modified = t.created;
			var dirty = store.isDirty();
			context.tiddler = store.saveTiddler(t.title,t.title,t.text,t.modifier,t.modified,t.tags,t.fields,true,t.created,t.creator);
			store.setDirty(dirty);
			autoSaveChanges();
			if(callback) {
				callback(context);
			}
		} else {
			context.floorboard = typeof(context.floorboard) === "number" ? context.floorboard + 1 : 0;
			var isShadow = store.isShadowTiddler(context.title);
			// shadows are commonly called via getTiddler so there is a constraint that these can only live in the first floorboard bag
			// (also you don't want to somehow load someone elses theme!)
			if(context.floorboard < config.floorboards.length && !(isShadow && context.floorboard > 0) ) {
				var workspace = config.floorboards[context.floorboard].format(tiddlyspace.currentSpace.name);
				context.workspace = "bags/" +  workspace;
				var adaptor = new config.adaptors[context.serverType];
				adaptor.getTiddler(title,context,null,getTiddlerCallback);
			} else {
				story.refreshTiddler(context.title,null,true);
				if(callback) {
					callback(context);
				}
			}
		}
		context.adaptor.close();
	};
	adaptor.getTiddler(title,context,null,getTiddlerCallback);
	return config.messages.loadingMissingTiddler.format(title,context.serverType,context.host,context.workspace);
};
})(jQuery);
//}}}
