/***
|''Name''|AETHtml|
|''Version''|0.2.3|
|''Requires''|AETPlugin|
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
	$("<input type='hidden' />").attr("edit", field).appendTo(container);
	var change = function(ev) {
		var val = $(ev.target).val();
		var value = "<html>%0</html>".format(val);
		config.macros.aet.setMetaData(tiddler.title, field, value);
		$(preview).empty();
		wikify(value, preview);
	};
	$("<textarea />").appendTo(container).change(change);
};

}(jQuery));
