(function(module, $) {

var place, dontexist, aet;
module("AET Core", {
	setup: function() {
		aet = config.macros.aet;
		place = jQuery("<div />").appendTo(document.body)[0];
		dontexist = new Tiddler("aet.dontexist");
		var tiddlers = ["aet.dontexist", "aet.jp", "aet.jon", "aet.jeremy",
			"aet.martin", "aet.suggestions", "aet.suggestions.complex"];
		for(var i = 0; i < tiddlers.length; i++) {
			story.displayTiddler(null, tiddlers[i], DEFAULT_EDIT_TEMPLATE);
		}
		config.extensions.testUtils.addTiddlers([
			{title:"aet.jp",tags:['foo','bar','baz'],fields:{"reports":""}},
			{title:"aet.jon",tags:['foo','bar','baz'],fields:{"reports":"aet.jeremy", "eats": "9", "animal": "2" }},
			{title:"aet.jeremy","tags":['baz','dum'],fields:{"reports":"aet.jp"}},
			{title:"aet.martin","tags":['baz','dum'],fields:{"reports":""}},
			{title:"aet.suggestions",text:"rabbit\ncat\nmonkey"},
			{title:"aet.suggestions.complex",text:"mammals>\ncat\nmonkey<\nreptiles>\nsnake\nlizard<\namphibians>\nfrog<"}
		]);
	},
	teardown: function() {
		jQuery(place).remove();
		var tiddlers = ["aet.dontexist", "aet.jp", "aet.jon", "aet.jeremy",
			"aet.martin", "aet.suggestions", "aet.suggestions.complex"];
		for(var i = 0; i < tiddlers.length; i++) {
			store.removeTiddler(tiddlers[i]);
			story.closeTiddler(tiddlers[i], true);
		}
	}
});
test("testing lingo",function(){
  config.macros.AdvancedEditTemplate.lingo.foo = "testing foo";
  same("testing foo",config.macros.AdvancedEditTemplate.translate("foo"),"Translation working as expected?");
})
test("getMetaData / setMetaData", function(){
  var expected,actual
  expected = config.macros.aet.getMetaData("aet.jon","reports");
  same(expected,"aet.jeremy","testing getMetaData");

  expected = config.macros.aet.getMetaData("aet.jon","likes");
  same(expected,false,"testing missing field value");
  
  config.macros.aet.setMetaData("aet.jon","likes","cheese");
  expected = config.macros.aet.getMetaData("aet.jon","likes");
  same(expected,"cheese","testing setting then getting a value");
  
  config.macros.aet.setMetaData("aet.jon","likes",false);
  expected =config.macros.aet.getMetaData("aet.jon","likes");
  same(expected,false,"testing setting a field to false");
  
  config.macros.aet.setMetaData("aet.dontexist","likes","everything");
  expected = config.macros.aet.getMetaData("aet.dontexist","likes");
  same(expected,"everything","checking the save to a non-existing tiddler worked ok");
  
  config.macros.aet.setMetaData("aet.jon","likes","");
  same(config.macros.aet.getMetaData("aet.jon","likes"),false,"checking empty string was saved");
  
});

test("readValues", function() {
	var text1 = "pig\nchicken\ncow\nsheep##comment";
	var text2 = "pig:0##comment\nchicken:1\ncow:2\nsheep:3##comment";
	var text3 = "pig:0>\npork\nbacon<\nchicken:1\ncow:2>\nsteak>\nrump\nsirloin<<\nsheep:3\n\n";
	var val1 = aet.extensions.dropdown.readValues(text1);
	var val2 = aet.extensions.dropdown.readValues(text2);
	var val3 = aet.extensions.dropdown.readValues(text3);
	var val4 = aet.extensions.dropdown.readValues(text3, true);
	strictEqual(val1["0"].items.length, 4);
	strictEqual(val1["0"].depth, 0);
	strictEqual(val1["0"].items[0].name, "pig");
	strictEqual(val1["0"].items[0].value, "pig");
	strictEqual(val1["0"].items[3].value, "sheep");
	strictEqual(val2["0"].items.length, 4);
	strictEqual(val2["0"].items[1].name, "chicken");
	strictEqual(val2["0"].items[1].value, "1");
	strictEqual(val3["0"].items.length, 4, "pig, chicken, cow, sheep should be menu 1")
	strictEqual(val3["0"].items[0].name, "pig");
	strictEqual(val3["0"].items[0].value, "0");
	strictEqual(val3["0"].items[0].submenu, "1");
	strictEqual(val3["1"].depth, 1);
	strictEqual(val3["1"].items.length, 2, "pork and bacon should be menu 2");
	strictEqual(val3["1"].items[0].name, "pork");
	strictEqual(val3["1"].items[1].name, "bacon");
	strictEqual(val3["0"].items[1].name, "chicken");
	strictEqual(val3["0"].items[2].name, "cow");
	strictEqual(val3["0"].items[3].name, "sheep");
	strictEqual(val3["0"].items[2].submenu, "2");
	strictEqual(val3["2"].depth, 1);
	strictEqual(val3["2"].items.length, 1, "menu 2 is just steak");
	strictEqual(val3["2"].items[0].name, "steak");
	strictEqual(val3["2"].items[0].submenu, "3");
	strictEqual(val3["3"].items.length, 2, "this menu is rump and sirloin");
	strictEqual(val3["3"].depth, 2);
	strictEqual(val3["3"].items[0].name, "rump");
	strictEqual(val3["3"].items[1].name, "sirloin");

	strictEqual(val4["0"].items[0].name, "chicken", "check sorting of menu 0");
	strictEqual(val4["0"].items[1].name, "cow", "check sorting of menu 0");
	strictEqual(val4["0"].items[2].name, "pig", "check sorting of menu 0");
	strictEqual(val4["0"].items[3].name, "sheep", "check sorting of menu 0");
	strictEqual(val4["1"].items[0].name, "bacon", "check sorting of menu 1");
	strictEqual(val4["1"].items[1].name, "pork", "check sorting of menu 1");
	strictEqual(val4["3"].items[0].name, "rump", "check sorting of menu 3");
	strictEqual(val4["3"].items[1].name, "sirloin", "check sorting of menu 3");
});

test("create (simple)", function() {
	var val1 = { "0": { 
		items: [{name: "chicken", value: "1"},
			{name: "cow", value: "2"}, {name: "pig", value: "3"}],
		depth: 0 }
		};
	aet.extensions.dropdown.create(place, "aet.jon", ["animal"], val1);
	strictEqual($("select", place).length, 1);
	strictEqual($("select option", place).length, 4, "the 4 options and the selected");
	strictEqual($("select", place).val(), "2");
});

test("_createSubMenu", function() {
	var menu = aet.extensions.dropdown._createSubMenu(place, [{ name: "foo", value: "1"},
		{ name: "bar", value: "2"}, { name: "zum", value: "3", submenu: "4"}], "animal", "2");
	strictEqual($(menu).val(), "2");
	strictEqual($("option[submenu=4]", menu).length, 1);
	strictEqual($("option:selected", menu).text(), "bar")
});

test("create (2 level)", function() {
	var val1 = { "0": { items: [{name: "chicken", value: "1"},
			{name: "cow", value: "2", submenu: "3"}, {name: "pig", value: "3", submenu: "7"}],
		depth: 0 }, "3": { items: [{name: "steak", value:"9" }],depth:1}, "7": { items: ["foo"], depth:1 }
	};
	aet.extensions.dropdown.create(place, "aet.jon", ["animal", "eats"], val1);
	var menus = $("select", place);
	var menu1 = menus[0];
	strictEqual(menus.length, 2, "2 are open");
	strictEqual($("option", menu1).length, 4, "the 3 options and the selected");
	strictEqual($(menu1).val(), "2");
	strictEqual($($("select", place)[1]).val(), "9");
});

module("AET IF");
test("if", function() {
	jQuery(place).text("foo")[0];
	var tiddler = new Tiddler("foo");
	tiddler.fields = { "x": "yes" };
	var res = config.macros.aet.extensions["if"].doIfStatement(place, "x&y", tiddler);
	var res2 = config.macros.aet.extensions["if"].doIfStatement(place, "x&!y", tiddler);
	var res3 = config.macros.aet.extensions["if"].doIfStatement(place, "x&!y&!z", tiddler);
	var res4 = config.macros.aet.extensions["if"].doIfStatement(place, "x|y|z", tiddler);
	var res5 = config.macros.aet.extensions["if"].doIfStatement(place, "x|y", tiddler);
	var res6 = config.macros.aet.extensions["if"].doIfStatement(place, "!x|y", tiddler);
	var res7 = config.macros.aet.extensions["if"].doIfStatement(place, "!x|!y", tiddler);
	same(res, false);
	same(res2, true);
	same(res3, true);
	same(res4, true);
	same(res5, true);
	same(res6, false);
	same(res7, true);
});

})(QUnit.module, jQuery);