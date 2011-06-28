/***
|''Name''|TiddlySpaceInstaller|
|''Version''|0.3.15|
|''Requires''|GUID|
|''Source''|https://github.com/jdlrobson/TiddlyWikiPlugins/raw/master/plugins/TiddlySpaceInstaller/TiddlySpaceInstaller.js|
!Usage
{{{<<showInstall bar Foo>>}}}
Opens the tiddler Foo to visitors of the bar space. 
In a space that is not bar, nothing happens.

{{{<<install foo bar>>}}}
Provides a ui for installing a space that includes foo and bar taking into account whether the user is new or currently logged in.
optional parameters:
* label - change the label of the button that is clicked to install.
* header - provide alternative text to show for "choose a website address"
***/
//{{{
(function($) {

var tweb = config.extensions.tiddlyweb;
var tiddlyspace = config.extensions.tiddlyspace;
config.macros.showInstall = {
	handler: function(place, macroName, params) {
		if(config.extensions.tiddlyspace.currentSpace.name == params[0]) {
			story.displayTiddler(null, params[1] || "Install");
		}
	}
};
var macro = config.macros.install = {
	locale: {
		spaceName: "Choose a website address (note this will also be your tiddlyspace username):",
		identity: "Logged in as %0.",
		spaceCreationError: "Failed to create space %0",
		password: "Enter a password:",
		passwordAgain: "Enter password again:",
		setup: "create",
		passwordError: "your passwords do not match.. please try entering them again.",
		nameError: "The name %0 is taken or is invalid. Please try another.",
		loginRequired: "You must be logged in to use this.",
		inputLabel: {}
	},
	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		var args = paramString.parseParams("anon")[0];
		params = args.anon || [];
		var locale = macro.locale;
		var mustBeLoggedIn = args.loggedInOnly ? args.loggedInOnly[0] != "no" : false;
		var options = {
			headerTxt: args.header ? args.header[0] : locale.spaceName,
			setupLabel: args.label ? args.label[0] : locale.setup,
			loginTiddler: args.loginTiddler ? args.loginTiddler[0] : false,
			inputs: args.input ? args.input : [],
			paramifierName: args.pname ? args.pname[0] : "install"
		};
		tweb.getStatus(function(r) {
			options.identity = tweb.status.identity;
			var host = r.server_host.host;
			if(params.length === 0) {
				params = [ tiddlyspace.currentSpace.name ];
			}
			options.includeSpaces = params;
			var container = $("<div />").appendTo(place)[0];
			tweb.getUserInfo(function(userInfo) {
				var disabled = userInfo.anon && mustBeLoggedIn && !options.identity;
				if(!disabled) {
					var form = $("<form />").addClass("spaceInstaller").appendTo(container)[0];
					macro._fillForm(form, host, userInfo, options);
				} else {
					var c = $("<span />").addClass("annotation").appendTo(container)[0];
					if(options.loginTiddler) {
						wikify(store.getTiddlerText(options.loginTiddler), c);
					} else {
						$(c).text(macro.locale.loginRequired);
					}
				}
			});
		});
	},
	_fillForm: function(form, host, userInfo, options) {
		var locale = macro.locale;
		$("<div />").text(options.headerTxt).appendTo(form);
		var user = $("<input />").addClass("reqInput input").attr("name", "username").attr("type", "text").appendTo(form);
		$("<span />").text("." + host).addClass("reqInputLabel inputLabel").appendTo(form);
		var identity = options.identity;
		if(userInfo.anon && !identity) {
			$("<div />").addClass("reqInputLabel inputLabel").text(locale.password).appendTo(form);
			var pass1 = $("<input />").addClass("reqInput input").attr("name", "pass1").attr("type", "password").appendTo(form);
			$("<div />").addClass("reqInputLabel inputLabel").text(locale.passwordAgain).appendTo(form);
			var pass2 = $("<input />").addClass("reqInput input").attr("name", "pass2").attr("type", "password").appendTo(form);
		} else if(userInfo.anon && identity) {
			$("<input />").attr("type", "hidden").attr("name", "identity").val(identity).appendTo(form);
			$("<div />").text(locale.identity.format(identity)).appendTo(form);
		}
		var inputs = options.inputs;
		for(var i = 0; i < inputs.length; i++) {
			var name = inputs[i];
			if(!["pass1", "pass2", "username"].contains(name)) {
				$("<div />").addClass("inputLabel optInputLabel").text(locale.inputLabel[name] || name).appendTo(form);
				$("<input />").addClass("input optInput").attr("input", "user").attr("name", name).appendTo(form);
			}
		}
		$("<input />").addClass("installButton").attr("type", "submit").val(options.setupLabel).appendTo(form);
		$(form).submit(function(ev) {
			ev.preventDefault();
			var paramifier = [];
			$("[input=user]", ev.target).each(function(i, el) {
				paramifier.push("%0:%1".format($(el).attr("name"), $(el).val()));
			});
			if(paramifier.length === 0) {
				paramifier = false;
			} else {
				paramifier = paramifier.join(" ");
			}
			var user = $("[name=username]", ev.target).val();
			var pass = $("[name=pass1]", ev.target).val();
			var pass2 = $("[name=pass2]", ev.target).val();
			options.paramifier = paramifier;
			if(userInfo.anon && identity) {
				pass = macro.generatePassword();
				macro.installNewUser(user, pass, options.includeSpaces, options);
			} else if(userInfo.anon && pass != pass2) {
				alert(locale.passwordError);
			} else if(userInfo.anon && user && pass == pass2) {
				macro.installNewUser(user, pass, options.includeSpaces, options);
			} else if(!userInfo.anon && user) {
				macro.setup(user, options.includeSpaces, options)
			} else {
				alert("Please enter a website address");
			}
		});
	},
	generatePassword: function() {
		var guid = config.extensions.GuidPlugin;
		return guid ? guid.guid.generate() + "_" + guid.guid.generate() :
			"" + Math.random() * 1000;
	},
	installNewUser: function(username, password, includes, options) {
		username = username.toLowerCase();
		var user = new tiddlyweb.User(username, password, tweb.host);
		user.create(
			function() {
				config.macros.TiddlySpaceLogin.login(username, password, function() {
					macro.setup(username, includes, options);
				});
			},
			function() {
				alert(macro.locale.nameError.format(username));
			}
		);
	},
	setup: function(spacename, includes, options) {
		var identity = options.identity;
		var space = new tiddlyweb.Space(spacename, tweb.host);
		tweb.getStatus(function(status) {
			var url = tiddlyspace.getHost(status.server_host, spacename);
			var newLocation = "%0#".format(url);
			if(identity) {
				newLocation += "auth:OpenID=%0".format(identity);
			}
			if(options.paramifier) {
				newLocation += "%0:[[%1]]".format(options.paramifierName, options.paramifier);
			}

			space.create(function() {
				$.ajax({
					url: tweb.host + "/spaces/"+ spacename,
					type: "POST",
					contentType: "application/json",
					data: jQuery.toJSON({
						"subscriptions": includes
					}),
					success: function() {
						window.location = newLocation;
					},
					error: function() {
						window.location = newLocation;
					}
				});
			}, function() {
				alert(macro.locale.spaceCreationError.format(spacename));
			});
		});
	}
};

})(jQuery);
//}}}
