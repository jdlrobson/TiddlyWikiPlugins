/***
|''Name''|NumberSortFilterPlugin|
|''Author''|Jon Robson|
|''Version''|0.7.0|
|''Status''|@@experimental@@|
|''Source''|https://raw.github.com/jdlrobson/TiddlyWikiPlugins/master/plugins/Filters/NumberSortFilterPlugin.js|
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
!Notes
Adds the following filters
{{{
[numbersort[title]]
}}}
***/
//{{{
config.filters.numbersort = function(results,match) {
	var field = match[3];
	results = results.sort(function(a, b) {
		var val1 = a[field] || a.fields[field];
		var val2 = b[field] || b.fields[field];
		return parseFloat(val1, 10) < parseFloat(val2, 10) ? -1 : 1;
	});
	return results;
};
//}}}
