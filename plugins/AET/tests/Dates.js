(function(module, $) {

var ext;
module("TiddlySpaceSpaces plugin", {
	setup: function() {
		ext = config.macros.aet.extensions.date;
	},
	teardown: function() {
		ext = null;
	}
});

test("_inputToYYYYMMDD", function() {
	var end = "0000";
	var val1 = ext._inputToYYYYMMDD("2010");
	var val2 = ext._inputToYYYYMMDD("02/10/2010");
	var val3 = ext._inputToYYYYMMDD("00/00/2003");
	var val4 = ext._inputToYYYYMMDD("04/00/1920");
	var val5 = ext._inputToYYYYMMDD("/1920");
	var val6 = ext._inputToYYYYMMDD("12/1912");
	var val7 = ext._inputToYYYYMMDD("03-2020");
	var val8 = ext._inputToYYYYMMDD("03-12-1920");
	var val9 = ext._inputToYYYYMMDD("bad");
	strictEqual(val1, "20100000"+end);
	strictEqual(val2, "20101002"+end);
	strictEqual(val3, "20030000"+end);
	strictEqual(val4, "19200004"+end);
	strictEqual(val5, "19200000"+end);
	strictEqual(val6, "19121200"+end);
	strictEqual(val7, "20200300"+end);
	strictEqual(val8, "19201203"+end);
	strictEqual(val9, false);
});

test("_getDateString", function() {
	var df = "DD/0MM/YYYY";
	var val1 = ext._getDateString("201000000000", df);
	var val2 = ext._getDateString("200203120000", df);
	var val3 = ext._getDateString("102200120000", df);
	var val4 = ext._getDateString("102203000000", df);
	strictEqual(val1, "2010", "no day or month");
	strictEqual(val2, "12/03/2002");
	strictEqual(val3, "1022", "no month");
	strictEqual(val4, "1022", "no day");
});

})(QUnit.module, jQuery);
