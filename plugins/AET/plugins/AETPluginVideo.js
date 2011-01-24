/***
|''Name''|AETPluginVideo|
|''Version''|0.2.2|
|''Requires''|AETPlugin|
|''Source''|https://github.com/jdlrobson/TiddlyWiki/raw/master/plugins/AET/plugins/AETPluginVideo.js|
!Usage
Adds video view types and updates AdvancedEditTemplate to provide ways to add them to documents
{{{
<<aet type:video field:video>>
}}}
Also provides video view type.
{{{
<<view videofield video 100 200>>
}}}
width 100 height 200.
***/
//{{{
(function($) {
	
var video_ext = config.macros.aet.extensions.video = {
	enableflash: "Please install the latest version of Flash to add videos to your article",
	unsupported: "This url links to a video we do not support!",
	showVideo: function(place, url, options) {
		var width = options.width;
		var height = options.height;
		width = width ? width : "180";
		height = height ? height : "130";
		var html;
		if(!url && typeof(url) != 'string') {
			url = "";
		}
		if(url.indexOf("www.youtube") != -1 || url.indexOf("http://youtube") != -1) {
			 html = "<object CLASSID='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000' CODEBASE='http://active.macromedia.com/flash/cabs/swflash.cab#version=3,0,0,11' width='"+width+"' height='"+height+"'><param name='movie' value='"+url+"&hl=en&fs=1&'></param><param name='allowFullScreen' value='true'></param><param name='allowscriptaccess' value='always'></param><embed src='"+url+"&hl=en&fs=1&' type='application/x-shockwave-flash' allowscriptaccess='always' allowfullscreen='true' width='"+width+"' height='"+height+"'></embed></object>";
		} else if(url.indexOf("justin.tv") != -1) {
			var regex = new RegExp("(width[ ]*=[\'\"])[^\'\"]*([\'\"])","g");
			var regex2 = new RegExp("(height[ ]*=[\'\"])[^\'\"]*([\'\"])","g");
			html = url.replace(regex, "width='"+width+"'").replace(regex2, "height='"+height+"'");
		} else {
			 html = config.macros.aet.lingo.novideo;
		}
		$(place).html(html);
	},
	convertyoutube: function(value) {
		var regex = new RegExp("src=[\"\']([^\"\']*)","g");
		if(regex.test(value)) {
			value = RegExp.lastParen;
		} else if(value.indexOf("watch?v=") !=-1) {
			value = value.replace("/watch?v=","/v/");
		} else if(value.indexOf(".com/v/") != -1) {
			 //good format
		}
		return value;
	},
	convert: function(title,field,value){
		var ext = config.macros.aet.extensions.video;
		var bad = false;
		if(value.indexOf("www.youtube.") != -1) {
			value = ext.convertyoutube(value);
		} else if(value.indexOf("justin.tv")) {
			bad = false;
			var regex = new RegExp("(width[ ]*=[\'\"])[^\'\"]*([\'\"])","g");
			var regex2 = new RegExp("(height[ ]*=[\'\"])[^\'\"]*([\'\"])","g");
			value = value.replace(regex, "width='250'").replace(regex2, "height='190'");
		} else {
			bad = true;
		}
		if(!value) {
			bad = true;
		}
		if(!bad){
			config.macros.aet.setMetaData(title,field,value);
		} else{
			config.macros.aet.setMetaData(title,field,"");
			if(value != "") {
				alert(ext.unsupported);
			}
		}
		return value;
	}
};

config.macros.aet.controlTypes.video = function(place, tiddler, field, options) {
	var aet = config.macros.aet;
	var ext = aet.extensions.video;
	if(config.flashSupport){
		var preview = document.createElement("div");
		preview.className = "video_preview";
		var editbox = document.createElement("input");
		editbox.className = "video_editbox";
		place.appendChild(preview);
		place.appendChild(editbox);
		var showvideo = function(value) {
			$(preview).empty();
			video_ext.showVideo(preview, value, {});
		};
		if(tiddler) {
			var value = tiddler.fields[field] ? tiddler.fields[field] : "";
			editbox.value = value;
			showvideo(value);
		}
		var handler = function(e) {
			var newvalue = ext.convert(tiddler.title, field, editbox.value);
			aet.setMetaData(tiddler.title, field, newvalue);
			showvideo(newvalue);
		};
		$(".video_editbox", place).blur(handler);
	} else {
		$("<div />").text(ext.enableflash).appendTo(place);
		return;
	}
};

if(navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.indexOf("Mac") == -1 &&
	navigator.appVersion.indexOf("3.1") == -1) { //for ie users
	config.flashSupport = true;
} else if(navigator.mimeTypes && navigator.mimeTypes["application/x-shockwave-flash"]) {
	config.flashSupport = true;
} else if(navigator.plugins["Shockwave Flash"] || navigator.plugins ["Shockwave Flash 2.0"]){
	config.flashSupport = true;
}

/*view video video w:180 h:130 src:x */
config.macros.aet.lingo.novideo = "No video.";
config.macros.view.views.video = function(value,place,params,wikifier,paramString,tiddler){
	var options = paramString.toJSON();
	var url = options.src ? options.src : value;
	options.width = params[2];
	options.height = params[3];
	video_ext.showVideo(place, url, options);
};

})(jQuery);
//}}}
