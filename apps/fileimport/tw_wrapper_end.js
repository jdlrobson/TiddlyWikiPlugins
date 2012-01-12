(function($) {

if(window.ImportWizard) {
	var proxy = "%0", proxyType = "GET";
	if(config.extensions.tiddlyspace) {
		proxy = "/reflector?uri=%0";
		proxyType: "POST";
	}
	var loader = new TW21Loader();
	var internalizer = function(node) {
		var title = $(node).attr("title");
		var tiddler = new Tiddler(title);
		loader.internalizeTiddler(store, tiddler, title, node);
		return tiddler;
	};

	var importer = ImportWizard({proxy:"%0", save: function(tid, callback) {
		merge(tid.fields, config.defaultCustomFields);
		delete tid.fields["server.page.revision"];
		delete tid.fields["server.etag"];
		tid = store.saveTiddler(tid.title, tid.title, tid.text,
			tid.modifier, tid.modified, tid.tags, tid.fields, null, tid.created, tid.creator);
		autoSaveChanges(null, [tid]);
		callback();
	}, internalizeTiddler: internalizer, proxyType: proxyType });

	config.macros.importTiddlers = {
		handler: function(place) {
			var container = $("<div />").appendTo(place)[0];
			new WizardMaker(container, importer);
		}
	};
} else if(config.macros.importTiddlers) {
	var _import = config.macros.importTiddlers.handler;
	config.macros.importTiddlers.handler = function(place) {
		_import.apply(this, arguments);
		jQuery("<div class='annotation error' />").text("Please upgrade your browser to take advantage of the modernised file import mechanism of the TiddlyFileImportr plugin.").prependTo(place);
	};
}

})(jQuery);
//}}}
