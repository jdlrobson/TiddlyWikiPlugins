/***
|''Name''|TiddlySpaceCloneTiddlerCommand|
|''Version''|0.5.5|
|''Status''|@@dev@@|
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
		$("<div />").addClass("message").text(msg).appendTo(popup);
		var input = $('<input type="text"/>').appendTo(popup).focus();
		$("<button />").addClass("button").text(options.okLabel || "ok").appendTo(popup).
			click(function(ev) {
				callback(ev, input.val());
			});

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
		if(tiddler && bag) {
			tweb.getStatus(function(status) {
				originMacro.prompt(ev, flick.tooltip, function(ev, space) {
					var uri = tiddlyspace.getHost(status.server_host, space);
					window.open("%0#clone:[[bags/%1/tiddlers/%2]]".format(uri, bag, title));
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
		var p = url.split("/");
		var bag = p[1];
		var context = {
			workspace: p[0] + "/" + bag
		};
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
				tiddler = morph ? morph(tiddler) : tiddler;
				store.addTiddler(tiddler);
				story.displayTiddler(null,tiddler, DEFAULT_EDIT_TEMPLATE);
			}
		});
	}
};

})(jQuery);
//}}}
