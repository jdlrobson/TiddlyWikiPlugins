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
		inputLabel: {
			choice: "Select a space to install:"
		}
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
			paramifierName: args.pname ? args.pname[0] : "install",
			choices: args.choice,
			choiceLabels: args.choiceLabel,
			addMember: args.addMember ? args.addMember.join(",") : false
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
		if(options.choices) {
			var labels = options.choiceLabels || [];
			$("<div />").addClass("inputLabel optInputLabel").text(locale.inputLabel.choice).appendTo(form);
			for(var i = 0; i < options.choices.length; i++) {
				var choice = options.choices[i];
				var radio = $("<input type='radio' />").addClass("input optInput choice").attr("name", "choice").val(choice).appendTo(form)[0];
				if(i === 0) {
					$(radio).attr("checked", true);
				}
				var label = labels[i] ? labels[i] : choice;
				$("<span />").text(label).appendTo(form);
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
			var choices = $("[name=choice]", form);
			var includes = options.includeSpaces;
			if(choices.length > 0) {
				includes = [];
				var space = $("[name=choice]:checked").val();
				if(space) {
					includes.push(space);
				}
			}
			if(includes.length === 0) {
				macro.updateUserMessage(form, 3);
				return;
			}
			$(form).hide();
			macro.updateUserMessage(form, 4, true);
			if(userInfo.anon && identity) {
				pass = macro.generatePassword();
				macro.installNewUser(user, pass, includes, options);
			} else if(userInfo.anon && pass != pass2) {
				alert(locale.passwordError);
			} else if(userInfo.anon && user && pass == pass2) {
				macro.installNewUser(user, pass, includes, options);
			} else if(!userInfo.anon && user) {
				macro.setup(user, includes, options)
			} else {
				alert("Please enter a website address");
			}
		});
	},
	updateUserMessage: function(form, code, keephidden) {
		var locale = macro.locale;
		var container = form.parentNode;
		var username = $("[name='username']", form).text();
		var msg = "";
		switch(code) {
			case 1:
				msg = "Please enter a website address";
				break;
			case 2:
				msg = locale.passwordError;
				break;
			case 3:
				msg = locale.choiceError;
				break;
			case 4:
				msg = "Installing your new space...";
				break;
			case 5:
				msg = macro.locale.nameError.format(username);
				break;
			case 6:
				msg = macro.locale.spaceCreationError.format(username);
		}
		$(".messageArea", container).text(msg).show();
		if(!keephidden) {
			$(form).show();
		}
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
			if(options.addMember) {
				newLocation += "addMember:[[%0]]".format(options.addMember);
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

var p = config.paramifiers.addMember = {
	onstart: function(members) {
		var space = config.extensions.tiddlyspace.currentSpace.name;
		var host = config.extensions.tiddlyweb.host;
		space = new tiddlyweb.Space(space, host); // XXX: singleton
		p.add(space, members.split(","));
	},
	add: function(space, members) {
		var _dirty = story.isDirty();
		for(var i = 0; i < members.length; i++) {
			var username = members[i];
			space.members().add(username, function(){
				story.setDirty(false);
			}, function(){
				story.setDirty(false);
			});
		}
	}
};
var p2 = config.paramifiers.privacyMode = {
	onstart: function(mode) {
		if(mode == 'private') {
			config.options.chkPrivateMode = true;
			store.getTiddler("SystemSettings").fields['server.page.revision'] = 'false';
			saveSystemSetting("chkPrivateMode", true);
		}
	}
};

})(jQuery);
//}}}
