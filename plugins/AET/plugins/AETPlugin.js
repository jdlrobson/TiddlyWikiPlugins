/***
|''Name:''|AETPlugin|
|''Description:''|Provides stuff the standard edit macro doesn't. First things first.. dropdowns!|
|''Author:''|JonRobson |
|''Version:''|0.9.0|
|''Date:''|Jan 2011|
|''Source''|https://github.com/jdlrobson/TiddlyWiki/raw/master/plugins/AET/plugins/AETPlugin.js|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
!Usage
{{{<<aet type:dropdown field:foo values:{{tiddler title}}>>}}}
!Parameters
autosavechanges - updates fields as they change (For use in ViewTemplates)
***/
//{{{
(function($){
try{
		config.locationData = [];
		config.geoData = {};
	config.shadowTiddlers.AdvancedEditTemplateStyle = "/*{{{*/\n" +
	".clearboth {clear:both;}\n"+
	".aet_radioboxes label {width:auto;float:left;}\n"+
	".aet_radioboxes input {width:auto;float:left;}\n"+
	".tip {font-style:italic;font-weight:bold;}\n"+
	".dp-popup {position:absolute;background-color:white;} a.dp-choose-date {float: left; width: 16px; height: 16px; padding: 0; margin: 5px 3px 0; display: block; text-indent: -2000px; overflow: hidden; background: url(calendar.png) no-repeat; }a.dp-choose-date.dp-disabled { background-position: 0 -20px;	cursor: default;}input.dp-applied { width: 140px; float: left;}\n"+
	".filebrowser{background-color:white; border:solid 1px black;}\n"+
	"a.dp-choose-date {border:solid 1px black;}\n"+
	".dp-nav-prev {float:left;}\n"+
	".dp-nav-next {float:right;}\n"+
	".dp-calendar {clear:both;}\n"+
	".dp-popup {padding:10px;border:solid 1px black;z-index:4;}\n"+
	".jCalendar .selected {background-color:gray;}\n"+
	"/*}}}*/"
store.addNotification("AdvancedEditTemplateStyle", refreshStyles);
} catch(e) {
};

String.prototype.toJSON = function(){
	var namedprms = this.parseParams(null, null, true);
	var options = {};
	for(var i=0; i < namedprms.length;i++){
		var nameval = namedprms[i];
		if(nameval.name) {
			options[nameval.name] = nameval.value;
		}
	}
	return options;
};

var aet = config.macros.AdvancedEditTemplate = {
	lingo:{
		"aet_upload":"Upload a local file:",
		"aet_imgpreview":"a preview of currently selected image will be shown here",
		"aet_select":"Please select.."
	},
	translate: function(id){
		if(!aet.lingo[id]) {
			return id;
		} else {
			return aet.lingo[id];
		}
	},
	extensions: {
		"if":{
			_doStatement: function(stmt, tiddler, or){
				var delimiter = "&";
				if(or) {
					delimiter = "|";
				}
				var params = stmt.split(delimiter);
				var finalEval = true;
				if(or) finalEval = false;
				for(var i=0; i < params.length; i++){
					var evaluatesTo = true;
					var arg = params[i];
					if(arg.indexOf("!") == 0){
							var x = tiddler.fields[arg.substr(1)];
							if(x) {
								evaluatesTo = false;
							} else {
								evaluatesTo = true;
							}
					} else{
						var x = tiddler.fields[arg];
						if(!x){
								evaluatesTo = false;
						}
					}
					if(or) {
						finalEval = evaluatesTo || finalEval;
					} else{
						finalEval = evaluatesTo && finalEval;
					}
				}
				return finalEval;
			},
			doIfStatement: function(place, stmt, tiddler){
				var or = false;
				if(stmt.indexOf("|") > -1) {
					or = true;
				}
				var finalEval = this._doStatement(stmt, tiddler, or);
				if(!finalEval) {
					$(place).empty();
				}
				return finalEval;
			}
		}
	},
	controlTypes: {},
	handler: function(place, macroName, p, wikifier, paramString, tiddler) {
		var options = paramString.toJSON();
		if(options["if"]){
			aet.extensions["if"].doIfStatement(place,options["if"],tiddler);
		}
		var controlType = options.type;
		var field = options.field || options.metaDataName;
		options.field = field;
		var controlHandler = aet.controlTypes[controlType];
		if(controlHandler) {
			var container = $("<div />").appendTo(place)[0];
			controlHandler(container,tiddler,field,options);
		}
	},
	getMetaData: function(title, extField){
		extField = extField.toLowerCase();
		var tiddler = store.getTiddler(title);
		var edit = $("[edit=%0]".format(extField), story.getTiddler(title));
		if(edit.length > 0) {
			var val = edit.val();
			return val ? val : false;
		} else if(!tiddler) {
			return false;
		} else {
			if(!tiddler.fields[extField]){
				return false;
			}
			else{
				return tiddler.fields[extField];
			}
		}
	},
	setMetaData: function(title, extField, extFieldVal, autosavechanges){
		if(autosavechanges) {
			var t = store.getTiddler(title);
			if(!t) {
				t = new Tiddler(title);
				if(config.shadowTiddlers[title]) {
					t.text = config.shadowTiddlers[title];
				}
				merge(t.fields, config.defaultCustomFields);
			}
			t.fields[extField] = extFieldVal;
			t = store.saveTiddler(t);
			if(aet.savetimeout) {
				window.clearTimeout(aet.savetimeout);
			}
			aet.savetimeout = window.setTimeout(function() {
					autoSaveChanges(null, [t]);
				}, 1000);
		} else {
			extField = extField.toLowerCase();
			var tidEl = story.getTiddler(title);
			var edit = $("[edit=%0]".format(extField), tidEl);
			if(edit.length === 0) {
				edit = $("<input />").attr("type", "hidden").attr("edit", extField).appendTo(tidEl);
			}
			extFieldVal = extFieldVal ? extFieldVal : "";
			edit.val(extFieldVal);
		}
	},
	getVariableFromQueryString:function(varName){
		var qs = window.location.search.substring(1);
		var atts = qs.split("&");
		for(var i =0; i <atts.length; i++){
			var varVal = atts[i].split("=");
			if(varVal[0]==varName){
				return decodeURI(varVal[1]);
			}
		}
		return false;
	}
};

config.macros.aet = aet;
if(config.macros.view){
	if(!config.macros.view.views) {
		config.macros.view.views = {};
	}
	config.macros.view.views.linklist = function(value,place,params,wikifier,paramString,tiddler) {
		var classname = "";
		var values = value.split("\n");
		for(var i = 0; i < values.length; i++){
				wikify("[[%0]]\n".format([values[i]]), place);
		}
	};
	config.macros.view.views.hiddeninput = function(value,place,params,wikifier,paramString,tiddler) {
		var classname="";
		if(params[2]) {
			classname = params[2];
		}
		$(place).append("<input type='hidden' value='"+value+"'/>");
	};
}
})(jQuery);
//}}}
