/***
|''Name''|AETHtml|
|''Version''|0.2.51|
|''Requires''|AETPlugin|
|''Source''|https://github.com/jdlrobson/TiddlyWiki/raw/master/plugins/AET/plugins/AETHtml.js|
!Usage
Allows an easy way to copy html into a field.
{{{
<<aet type:html field:video>>
}}}
***/
//{{{
(function($) {

config.macros.aet.controlTypes.html = function(place, tiddler, field, options) {
	var preview = $("<div />").addClass("embedPreview").appendTo(place)[0];
	var container = $("<div />").addClass("embedArea").appendTo(place)[0];
	var initial = config.macros.aet.getMetaData(tiddler.title, field);
	var input = $("<input type='hidden' />").attr("edit", field).appendTo(container)[0];
	if(initial) {
		wikify(initial, preview);
		$(input).val(initial);
	}
	var change = function(ev) {
		var val = $(ev.target).val();
		$(preview).empty();
		if(val) {
			var value = "<html>%0</html>".format(val);
			config.macros.aet.setMetaData(tiddler.title, field, value);
			wikify(value, preview);
		} else {
			config.macros.aet.setMetaData(tiddler.title, field, false);
		}
	};
	$("<textarea />").appendTo(container).change(change);
};

}(jQuery));