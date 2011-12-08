/***
|''Name''|TiddlySpaceCloneTiddlerCommand|
|''Version''|0.5.8|
|''Status''|@@experimental@@|
|''Requires''|TiddlySpaceConfig TiddlySpaceTiddlerIconsPlugin TiddlySpacePublishingCommands|
!Code
***/
//{{{
(function($) {

var tiddlyspace = config.extensions.tiddlyspace;
var tweb = config.extensions.tiddlyweb;
var cmd = config.commands.publishTiddler;

merge(config.macros.tiddlerOrigin, {
	prompt: function(ev, msg, callback, options) {
		var popup = Popup.create(ev.target);
		$(popup).addClass("confirmationPopup prompt").click(function(ev) {
			if(ev.target.parentNode != document) {
				ev.stopPropagation();
			}
		});
		var form = $("<form />").appendTo(popup);
		$("<div />").addClass("message").text(msg).appendTo(form);
		var input = $('<input type="text"/>').appendTo(form).focus()[0];
		var submitForm = function(ev) {
			callback(ev, $(input).val());
			return false;
		};
		form.submit(submitForm);
		$("<button />").addClass("button").text(options.okLabel || "ok").appendTo(form).
			click(submitForm);

		Popup.show();
		ev.stopPropagation();
	}
});
var originMacro = config.macros.tiddlerOrigin;

var flick = config.commands.flickTiddler = {
	text: "flick tiddler",
	tooltip: "Flick this tiddler to another public space",
	isEnabled: function(tiddler) {
		return tiddlyspace.getTiddlerStatusType(tiddler) == "public";
	},
	handler: function(ev, src, title) {
		var tiddler = store.getTiddler(title);
		var bag = tiddler.fields["server.bag"];
		var revision = tiddler.fields["server.page.revision"];
		if(tiddler && bag && revision) {
			tweb.getStatus(function(status) {
				originMacro.prompt(ev, flick.tooltip, function(ev, space) {
					var uri = tiddlyspace.getHost(status.server_host, space);
					var fullUri = "%0#clone:[[bags/%1/tiddlers/%2/revisions/%3]]".
						format(uri, bag, title, revision);
					window.open(fullUri);
				}, {});
			});
		}
	}
};

var p = config.paramifiers.clone = {
	onstart: function(url) {
		p.clone(url);
	},
	clone: function(url, morph) {
		ajaxReq({
			dataType: "json",
			url: url,
			success: function(tiddler) {
				tiddler = config.adaptors.tiddlyweb.toTiddler(tiddler, config.defaultCustomFields['server.host']);
				delete tiddler.fields["server.bag"];
				delete tiddler.fields["server.permissions"];
				delete tiddler.fields["server.page.revision"];
				tiddler.modified = new Date();
				tiddler.fields["server.workspace"] = config.defaultCustomFields["server.workspace"];
				tiddler.fields["_original_tiddler_source"] = data.bag;
				tiddler.fields["_original_tiddler_revision"] = data.revision;
				tiddler = morph ? morph(tiddler) : tiddler;
				store.addTiddler(tiddler);
				story.displayTiddler(null,tiddler, DEFAULT_EDIT_TEMPLATE);
				window.location.hash = "";
			}
		});
	}
};

})(jQuery);
//}}}
