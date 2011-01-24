/***
|''Name:''|AET_Checkboxes|
|''Description:''|Adds radio boxes to the AdvancedEditTemplatePlugin|
|''Author:''|JonRobson |
|''Version:''|0.8.1|
|''Date:''|Oct 2010|
|''Requires:''|AETPlugin|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Requires:''|[[AdvancedEditTemplate (core code)|http://svn.tiddlywiki.org/Trunk/contributors/JonRobson/plugins/AET/plugins/AET.js]]|
!Usage
{{{<<aet type:radio field:fieldname values:tiddlerTitle>>}}}
***/
//{{{
(function($){
config.macros.aet.extensions.checkbox = {
	createCheckBox: function(place, title, metaDataName, autosavechanges){
		var macro = config.macros.aet;
		var c = document.createElement("input");
		c.setAttribute("type","checkbox");
		c.value = "false";
		place.appendChild(c);
		var selected = macro.getMetaData(title, metaDataName);
		if(!selected) {
			var qsvalue = macro.getVariableFromQueryString(metaDataName);
			if(qsvalue) selected = qsvalue;
		}
		if(selected){
			c.value = selected;
			c.checked = true;
		}
		var that = macro; 
		$(c).click(function(ev){
			var taskTiddler = story.findContainingTiddler(place);
			var title = taskTiddler.getAttribute("tiddler");
			if(this.checked) {
				that.setMetaData(title, metaDataName, "true", autosavechanges);
			} else{
				that.setMetaData(title, metaDataName, null, autosavechanges);
			}
		});
	}
};
config.macros.aet.controlTypes.checkbox = function(place, tiddler, fieldName, options){
	config.macros.aet.extensions.checkbox.createCheckBox(place, tiddler.title, fieldName, options.autosavechanges);
};
})(jQuery);
//}}}
