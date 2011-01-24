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

var html_ext = config.macros.aet.extensions.html = {
	embedCode: "Please copy and paste the embed code of your video below"
};

config.macros.aet.controlTypes.html = function(place, tiddler, field, options) {
	var container = $("<div />").addClass("embedArea").appendTo(place)[0];
	$("<span />").text(html_ext.embedCode).appendTo(container);
	$("<input type='hidden' />").attr("edit", field).appendTo(container);
	var change = function(ev) {
		var val = $(ev.target).val();
		config.macros.aet.setMetaData(tiddler.title, field, "<html>%0</html>".format(val));
	};
	$("<textarea />").attr("edit", field).appendTo(container).change(change);
};

}(jQuery));
