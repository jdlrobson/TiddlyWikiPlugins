jQuery(document).ready(function() {

module("ImageMacroPlugin: basic usage", {
	setup: function() {
		var tiddlers = [
			{title:"SVGExample.svg",tags:[],"text":'<svg><rect x = "10" y = "10" rx = "20" ry = "10" width = "200" height = "80" fill = "#d7d0b9" stroke = "#333" stroke-width = "1"/></svg>'},
			{ title: "foo", fields: {image: "SVGExample.svg"}, tags: []},
			{ title: "ImageExample", fields: { "server.content-type": "image/png" }}
		];
	   config.extensions.testUtils.addTiddlers(tiddlers);
	},
	teardown: function() {
		config.extensions.testUtils.removeTiddlers(["foo", "SVGExample.svg", "ImageExample"]);
	}
});

test("&lt;&lt;image SVGExample.svg&gt;&gt;",function(){
  var place = document.createElement("div");
	wikify("<<image SVGExample.svg>>",place);
	var tid = store.getTiddler("SVGExample.svg");
	same(tid.title,"SVGExample.svg");
	same($("svg",place).length,1);
});

test("&lt;&lt;image SVGExample.svg 20 20&gt;&gt;",function(){
  var place = document.createElement("div");
	wikify("<<image SVGExample.svg 20 20>>",place);
	var rootSVG = $("svg",place)[0];
	same(rootSVG.getAttribute("width"),"20");
	same(rootSVG.getAttribute("height"),"20");
});

test("&lt;&lt;image SVGExample.svg 20 20 alt:'alternate text'&gt;&gt;",function(){
  var place = document.createElement("div");

	wikify("<<image SVGExample.svg 20 20 alt:'alternate text'>>",place);
	var rootSVG = $("svg",place)[0];
	same(rootSVG.getAttribute("width"),"20");
	same(rootSVG.getAttribute("height"),"20");

	//disable svg
	$(place).empty();
	config.macros.image.svgAvailable = false;
	wikify("<<image SVGExample.svg 20 20 alt:'alternate text'>>",place);
	same($("img", place).attr("alt"), "alternate text", "alt text when svg unavailable");

	$(place).empty();
	wikify("<<image SVGExample.svg alt:'alternate text'>>",place);
	same($("span", place).text(), "alternate text", "alt text when svg unavailable (no width/height passed)");
});

test("_getDimensions (1.width and height set and preserve)", function(){
	var real = {width: 1000, height: 200};
	var req = {width: 50, height: 100};
	var got = config.macros.image._getDimensions(real, req, true);
	same(got.width, 50, "check width 1000*200 scaled to 50*100");
	same(got.height, 10, "check height ");
});

test("_getDimensions (2. width and height set and preserve)", function(){
	var real = {width: 400, height: 300};
	var req = {width: 200, height: 200};
	var got = config.macros.image._getDimensions(real, req, true);
	same(got.width, 200, "check width scale 400*300 to 200*200");
	same(got.height, 150, "check height");
});

test("_getDimensions (width and height set and no preserve)", function(){
	var real = {width: 1000, height: 200};
	var req = {width: 25, height: 50};
	var got = config.macros.image._getDimensions(real, req, false);
	same(got.width, 25);
	same(got.height, 50);
});

test("_getDimensions (only width requested no preserve)", function(){
	var real = {width: 1000, height: 200};
	var req = {width: 50};
	var got = config.macros.image._getDimensions(real, req, false);
	same(got.width, 50);
	same(got.height, 10, "height preserved");
});

test("_getDimensions (only height requested no preserve)", function(){
	var real = {width: 1000, height: 200};
	var req = {height: 50};
	var got = config.macros.image._getDimensions(real, req, false);
	same(got.height, 50, "height preserved");
	same(got.width, 250, "width also preserved");
});

test("_getDimensions (3. width and height set and preserve)", function(){
	var real = {width: 346, height: 341};
	var req = {width: 240, height: 170};
	var got = config.macros.image._getDimensions(real, req, true);
	same(got.width, 172, "HEIGHT should be preserved check 346*341 to 240*170");
	same(got.height, 170, "although width can be preserved, the height would be higher then requested");
});

test("_getDimensions (nothing given)", function(){
	var real = {width: 1000, height: 200};
	var req = {};
	var got = config.macros.image._getDimensions(real, req, false);
	same(got.height, 200, "use real height");
	same(got.width, 1000, "use real width");
});


var _svgAvailable;
module("ImageMacroPlugin: svg unavailable", {
	setup: function() {
		_svgAvailable = config.macros.image.svgAvailable;
		config.macros.image.svgAvailable = false;
		var tiddlers = [
	   {title:"SVGExample.svg",tags:[],"text":'<svg><rect x = "10" y = "10" rx = "20" ry = "10" width = "200" height = "80" fill = "#d7d0b9" stroke = "#333" stroke-width = "1"/></svg>'},
	   { title: "foobar", fields: {image: "SVGExample.svg"}, tags: []}
		];
		config.extensions.testUtils.addTiddlers(tiddlers);
		$("<div />").attr("id","imageTestArea").appendTo(document.body);
	},
	teardown: function() {
		config.macros.image.svgAvailable = _svgAvailable;
		config.extensions.testUtils.removeTiddlers(["foobar", "SVGExample.svg"]);
	}
});

test("view image image alt:broken", function() {
	var place = $("<div />")[0];
	wikify("<<view image image alt:brokenx>>", place, null, store.getTiddler("foobar"));
	same($("span", place).text(), "brokenx");
});

});
