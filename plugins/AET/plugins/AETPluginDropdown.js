/***
|''Name:''|AETDropdown|
|''Description:''|Provides dropdowns|
|''Author:''|JonRobson|
|''Version:''|0.8.5|
|''Requires''|AETPlugin|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
!Usage
{{{<<aet type:dropdown field:foo values:{{tiddler title}}>>}}}
***/
//{{{
(function($){
var aet = config.macros.aet;
aet.extensions.dropdown = {
	sortValues: function(a, b) {
		return a.name < b.name ? -1 : 1;
	},
	readValues: function(text, sort) {
		var lines = text.split("\n");
		var obj = { "0" : { items: [], depth: 0 } };
		var currentMenu = 0;
		var menus = 0;
		var open = [];
		var closeMenu, openMenu;
		for(var i = 0; i < lines.length; i++) {
			var line = lines[i];
			if($.trim(line).length > 0) {
				if(line.indexOf("##") > -1){ //remove any commenting
					line = line.substring(0, line.indexOf("##"));
				}
				var nameval = line.split(":");
				var name = nameval[0];
				var val = nameval[1] || nameval[0];
			
				openMenu = val.indexOf(">") == val.length - 1 ? true : false;
				closeMenu = val.indexOf("<") > -1 ? true : false;
			
				if(openMenu) {
					var newval = val.substr(0, val.length - 1);
					name = val == name ? newval : name;
					val = newval;
				}
				if(closeMenu) {
					closeMenu = 0;
					var index = 0;
					var changeName = name == val;
					while(index > -1) {
						index = val.indexOf("<");
						if(index > -1) {
							val = val.substring(0, index) + val.substr(index + 1, val.length);
							closeMenu += 1;
						}
					}
					if(changeName) {
						name = val;
					}
				}
				var item = { name: name, value: val };
				var sub;
				obj[""+currentMenu].items.push(item);
				if(openMenu) {
					open.push(currentMenu);
					menus += 1;
					var sub = "" + menus;
					item.submenu = sub;
					obj[sub] = { items: [], depth: open.length };
					currentMenu = sub;
				}
				while(closeMenu > 0) {
					currentMenu = open.pop();
					closeMenu -= 1;
				}
			}
		}
		if(sort) {
			for(var i in obj) {
				obj[i].items = obj[i].items.sort(aet.extensions.dropdown.sortValues);
			}
		}
		return obj;
	},
	create: function(container, title, fields, values) {
		var menus = [];
		var openMenus = ["0"];
		while(openMenus.length > 0) {
			var id = openMenus.pop();
			var menuDef = values[id];
			var depth = menuDef.depth;
			var field = fields[depth];
			var selected = aet.getMetaData(title, field);
			var items = menuDef.items;
			var menu = aet.extensions.dropdown._createSubMenu(container, items, field, selected);
			$(menu).attr("depth", depth).attr("menu", id);
			var openSubMenu = $("option:selected", menu).attr("submenu");
			if(openSubMenu) {
				openMenus.push(openSubMenu);
			}
			menus.push(menu);
		}

		$(menus).change(function(ev) {
			var depth = $(ev.target).attr("depth");
			var value = $(ev.target).val();
			var field = $(ev.target).attr("field");
			for(var i = parseInt(depth, 10) + 1; i < fields.length; i++) {
				if(fields[i]) {
					aet.setMetaData(title, fields[i], "");
				}
			}
			aet.setMetaData(title, field, value);
			$(container).empty();
			aet.extensions.dropdown.create(container, title, fields, values);
		});
	},
	_createSubMenu: function(container, items, field, selected) {
		var menu = $("<select />").attr("field", field).appendTo(container)[0];
		$("<option />").val("").text("please select...").appendTo(menu);
		for(var i = 0; i < items.length; i++) {
			var item = items[i];
			var value = item.value;
			var submenu = item.submenu;
			var opt = $("<option />").val(value).text(item.name).appendTo(menu)[0];
			if(submenu) {
				$(opt).attr("submenu", submenu);
			}
			if(selected === value) {
				$(opt).attr("selected", true);
			}
		}
		return menu;
	}
};
aet.controlTypes.dropdown = function(container, tiddler, fieldName, options){
	var valueSource = options.values ||options.valuesSource;
	var values = aet.extensions.dropdown.readValues(store.getTiddlerText(valueSource), options.sorted)
	aet.extensions.dropdown.create(container, tiddler.title, fieldName.split(","), 
		values);
};
})(jQuery);
//}}}
