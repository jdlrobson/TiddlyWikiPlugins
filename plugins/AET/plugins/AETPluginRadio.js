//tags: systemConfig

/***
|''Name:''|AETRadio|
|''Requires''|AETPlugin|
|''Version:''|0.8.1|
|''Description:''|Adds radio boxes to the AdvancedEditTemplatePlugin|
|''Author:''|JonRobson |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Requires:''|[[AdvancedEditTemplate (core code)|http://svn.tiddlywiki.org/Trunk/contributors/JonRobson/plugins/AET/plugins/AET.js]]|
!Usage
{{{<<aet type:radio field:fieldname values:tiddlerTitle>>}}}
***/
//{{{
(function($){
config.macros.aet.controlTypes.radio = function(place, tiddlerobj, metaDataName, options){
	var valueSource = options.values || options.valuesSource;
	var source = store.getTiddlerText(valueSource) || "";
	var aet = config.macros.aet;
	var handler = function(ev){
		var newval = this.value;
		aet.setMetaData(tiddlerobj.title, metaDataName, newval, options.autosavechanges);
	};
	var currentValue = tiddlerobj ? tiddlerobj.fields[metaDataName] : false;
	var lines = source.split("\n");
	var radiogroupname = "radiogroup"+Math.random();
	var radioHtml = "";
	var selected;
	var container = $("<div />").addClass("aet_radioboxes").appendTo(place);
	for(var i=0; i < lines.length; i++){
		var def = lines[i];
		if(def != ""){
			var label, val;
			def = def.split(":");
			val = def.length == 2 ? def[1] : def[0];
			label = def[0];
			var input = $("<input />").addClass("aet_radiobutton").attr("type", "radio").
				val(val).attr("name", radiogroupname).appendTo(container);
			var label = $("<label />").text(label).appendTo(container);
			if(val == currentValue) {
				input.attr("checked", true);
			}
		}
	}
	$("<div />").addClass("clearboth").appendTo(place);
	$(".aet_radiobutton", place).click(handler);
};
})(jQuery);
//}}}
