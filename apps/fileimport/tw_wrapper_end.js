(function($) {

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
	tid = store.saveTiddler(tid);
	autoSaveChanges(null, [tid]);
	callback();
}, internalizeTiddler: internalizer, proxyType: proxyType });

config.macros.importTiddlers = {
	handler: function(place) {
		var container = $("<div />").appendTo(place)[0];
		new WizardMaker(container, importer);
	}
};

})(jQuery);
//}}}
