/***
|''Name''|AETImage|
|''Requires''|BinaryUploadPlugin ImageMacroPlugin|
|''Source''|https://github.com/jdlrobson/TiddlyWiki/raw/master/plugins/AET/plugins/AETPluginImage.js|
|''Version''|0.2.3|
!Usage
{{{<<binaryEdit field>>}}}
***/
//{{{
(function($) {
var image = config.macros.image;
var binary = config.macros.binaryUpload;
var macro = config.macros.binaryEdit = {
	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		var args = paramString.parseParams("anon")[0];
		var bag = args.bag ? args.bag[0] : false;
		var mode = args.mode ? args.mode[0] : "image";
		var imageOptions = image.getArguments(paramString, params);
		imageOptions.alt = imageOptions.alt ? imageOptions.alt : "no image";
		var container = $("<span />").addClass("binaryEditContainer").appendTo(place)[0];
		macro.createForm(container, args.anon[0], tiddler, { imageOptions: imageOptions, mode: mode, maxwidth: 200, maxheight: 200, bag: bag, hide: args.hide });
	},
	createForm: function(place, field, tiddler, options) {
		var mode = options.mode;
		var preview = $("<div />").addClass("preview").appendTo(place)[0];
		var value = tiddler ? tiddler.fields[field]  || "" : "";
		var tags = [];
		if(mode == "image") {
			tags.push("excludeLists image");
			macro.showImage(preview, value, options.imageOptions);
		} else if(mode == "file") {
			tags.push("excludeLists file")
		}
		var input = $("<input />").attr("type", "text").attr("edit", field).val(value).appendTo(place)[0];
		binary.createUploadForm(place, {
			bag: options.bag,
			tags: tags,
			callback: function(place, fileName, workspace, baseurl) {
				var url = "%0/%1".format([baseurl, fileName]);
				$(input).val(url);
				if(mode == "image") {
					macro.showImage(preview, url, options.imageOptions);
				} else if(mode == "file") {
					image.renderImage(preview, "link.svg", {width: 24, height: 24, link: url});
				}
			}
		});
		var hide = options.hide ? options.hide : [];
		/*if(hide.contains("tags")) {
			$(".binaryUploadtags", place).hide();
		}
		if(hide.contains("value")) {
			$("[edit=%0]".format([field]), place).hide();
		}*/
	},
	showImage: function(container, imageUrl, options) {
		$(container).empty();
		if(!imageUrl) {
			return;
		} else {
			image.renderImage(container, imageUrl, options);
		}
	}
};
})(jQuery);
//}}}
