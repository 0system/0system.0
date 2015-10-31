
function bootForLib (LIB) {

	// This module should contain all coupling between cores and is one way to
	// couple all cores together. The coupling can change based on which cores are used
	// in a given context and for what purpose.
	// TODO: Move to 'contexts/0/page'
	// TODO: Replace all this with declarations when 0-context + ccjson is working in window and server

	var config = JSON.parse(decodeURIComponent($('head > meta[name="page.context"]').attr("value")));

	var contexts = {};

	function initPage () {
		return LIB.Promise.try(function () {

			contexts.time = new (LIB.Cores.time.forContexts(contexts)).Context(config.time || {});
			contexts.page = new (LIB.Cores.page.forContexts(contexts)).Context(config.page || {});
			contexts.auth = new (LIB.Cores.auth.forContexts(contexts)).Context(config.auth || {});
			contexts.fetch = new (LIB.Cores.fetch.forContexts(contexts)).Context(config.fetch || {});
			contexts.request = new (LIB.Cores.request.forContexts(contexts)).Context(config.request || {});
			contexts.template = new (LIB.Cores.template.forContexts(contexts)).Context(config.template || {});
			contexts.component = new (LIB.Cores.component.forContexts(contexts)).Context(config.component || {});
			contexts.data = new (LIB.Cores.data.forContexts(contexts)).Context(config.data || {});
			contexts.cache = new (LIB.Cores.cache.forContexts(contexts)).Context(config.cache || {});

			// TODO: Make 'adapters' into a core as well.
			contexts.adapters = {
				LIB: LIB
			};

			contexts.adapters["time.moment"] = LIB.Cores.time.adapters.moment.spin(contexts.time);
			contexts.adapters.time = {
				moment: contexts.adapters["time.moment"]
			};
			contexts.adapters.fetch = {
				window: LIB.Cores.fetch.adapters.window.spin(contexts.fetch)
			};
			contexts.adapters.request = {
				window: LIB.Cores.request.adapters.window.spin(contexts.request)
			};
			contexts.adapters.template = {
				firewidgets: LIB.Cores.template.adapters.firewidgets.spin(contexts.template)
			};
			contexts.adapters.component = {
				firewidgets: LIB.Cores.component.adapters.firewidgets.spin(contexts.component)
			};
			contexts.adapters.cache = {
				// TODO: Subclass context for each page and component in page and component to namespace localStorage(cache) keys.
				localStorage: LIB.Cores.cache.adapters.localStorage.spin(contexts.cache)
			};
			contexts.adapters.data = {
				"ccjson.record.mapper": LIB.Cores.data.adapters["ccjson.record.mapper"].spin(contexts.data)
			};

			return config;
		}).catch(function (err) {
			console.error("Error initializing page context:", err.stack);
			throw err;
		});
	}

	function initSession () {
		return LIB.Promise.try(function () {

			contexts.auth.on("changed:authenticated", function (authenticated) {

				if (authenticated) {
					contexts.page.setViews([
						"loggedin",
						"logout"
					]);

					$('#community-menu').visibility({
						type   : 'fixed',
						offset : 0
					});

if (typeof window.animateSkin === "function") {
	window.animateSkin();
}

				} else {
					contexts.page.setViews([
						"loggedout",
						"login"
					]);
				}
			});
			
			contexts.auth.on("redirect", function (url) {
				contexts.page.redirectTo(url);
			});
	
			LIB.Cores.auth.adapters.passport.spin(contexts.auth);

		}).catch(function (err) {
			console.error("Error initializing session:", err.stack);
			throw err;
		});
	}

	function initData() {
		return LIB.waitForLibraryProperty("Collections").then(function (collections) {
			return LIB.Promise.try(function () {
				Object.keys(collections).forEach(function (alias) {
					collections[alias].spin(contexts.data);
				});
			});
		}).then(function () {
			return LIB.waitForLibraryProperty("CollectionLoaders").then(function (collectionLoaders) {
				return LIB.Promise.all(collectionLoaders.map(function (spinLoader) {
					return LIB.Promise.try(function () {
						return spinLoader(contexts.data);
					});
				}));
			});
		}).then(function () {
		
			contexts.data.notifyInitialized();
			
		}).catch(function (err) {
			console.error("Error initializing data:", err.stack);
			throw err;
		});
	}

	function initPageManagement () {
		return LIB.Promise.try(function () {


			var cachedPageContent = {};

			var firewidgets = LIB.Cores.page.adapters.firewidgets.spin(LIB._.extend(contexts.page, {
				anchors: {
					"page-content": function (context) {

						var uri = contexts.page.getBaseUrl() + context.getPath() + ".md.htm";

						function fetchPageContent () {

							if (
								contexts.page.config.alwaysReload === false &&
								cachedPageContent[uri]
							) {
								// TODO: Optionally initiate fetch or HEAD and update page if changed.
								return LIB.Promise.resolve(cachedPageContent[uri]);
							}
							return contexts.adapters.fetch.window.fetch(uri).then(function(response) {
								if (response.status !== 200) {
									var err = new Error("Error fetching page content");
									err.code = response.status;
									throw err;
								}
								return response.text();
							}).then(function (html) {
								cachedPageContent[uri] = html;
								return html;
							});
						}

						// TODO: Cache page objects including new context from initContainerContext() below and just
						//       detach/re-attach when navigating in cached mode.
						return fetchPageContent().then(function (html) {

							// TODO: Remove this once scripts are cached more intelligently in nested contexts.
							contexts.component.resetComponentScripts();

 							return contexts.adapters.component.firewidgets.liftComponentsForPageFragment(
								contexts.page,
								html
							).then(function (htmlish) {
								
								function getHTML (htmlish) {
									if (typeof htmlish === "string") {
										return htmlish || "";
									} else
									if (typeof htmlish === "function") {
										return htmlish() || "";
									} else {
										console.error("htmlish", htmlish);
										throw new Error("Unknown factory for htmlish!");
									}
								}
								
								// Disable all page scripts thare are still left.
								// TODO: Enable running of page scripts for script tags that have a contract for a runtime declared.
								// @source http://stackoverflow.com/a/9899441/330439
								function removeScripts (text) {
									var SCRIPT_REGEX = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
									while (SCRIPT_REGEX.test(text)) {
									    text = text.replace(SCRIPT_REGEX, "");
									}
									return text;
								}

								var html = getHTML(htmlish);
								html = removeScripts(html);

								return {
									html: html
								};
							});
						}).catch(function (err) {
							console.error("Error fetching page content", err);
							return {
								html: "Got error status: " + err.code
							};
						});
					}
				},
				actions: {
					"login": function (context) {
						return LIB.Promise.try(function () {
							return contexts.auth.login('github');
						});
					},
					"logout": function (context) {
						return LIB.Promise.try(function () {
							return contexts.auth.logout('github');
						});
					}
				}
			}));


			var previousContainerContexts = null;
			contexts.page.on("rendered", function (event) {

				// TODO: Move to 'contexts/0/page.container'
				function initContainerContext (contexts) {
					return LIB.Promise.try(function () {

						if (previousContainerContexts) {
							// TODO: Implement generic destroy for all sub-classed contexts.
							previousContainerContexts.container.destroy();
						}
						previousContainerContexts = contexts;


						contexts.container = new (LIB.Cores.container.forContexts(contexts)).Context(config.container || {});
						
						contexts.container.setPageContext(event);

						contexts.adapters.container = {
							firewidgets: LIB.Cores.container.adapters.firewidgets.spin(contexts.container)
						};

						// NOTE: '.once' will change to '.on' when nested contexts are properly used.
						contexts.container.once("changed:components", function (components) {
							return contexts.adapters.component.firewidgets.instanciateComponents(components).catch(function (err) {
								console.error("Error initializing components:", err.stack);
								throw err;
							});
						});

						// Boot container.
						contexts.container.setDomNode(event.domNode);
					});
				}

				// TODO: Implement contexts recovery so we can bypass loading everything fresh
				//       when loading same container again.
				// TODO: Implement various ways to determine canonical container id.

				initContainerContext(
					contexts
					// TODO: Move to context clone/subclass function.
//					LIB._.assign(LIB._.clone(contexts), {
//						adapters: LIB._.clone(contexts.adapters)
//					})
				).catch(function (err) {
					console.error("Error initializing container context:", err.stack);
					throw err;
				});
			});


			var mainMenuPinned = null;

			contexts.page.on("changed:path", function (path) {

// TODO: Move this into the admin skin.

				try {
					// TODO: Optionally remember scoll positions of pages and re-apply on nav.
					var menuHeight = $(".main.menu").height();
					var pageContentElm = $("#page-content");
					var pageContentY = pageContentElm.offset().top;
					if (
						mainMenuPinned ||
						/\/Community\//.test(path)
					) {
						$(document).scrollTop(pageContentY - menuHeight * 2);
					}
					$('.main.menu .item').removeClass("active");
					$('.main.menu .item[href="' + path + '"]').addClass("active");
				} catch (err) {
					console.error("suppressed error", err);
				}
			});
	
			var onScroll = LIB._.debounce(function () {
				var isPinned = $(".main.menu").hasClass("fixed");
				if (isPinned !== mainMenuPinned) {
					mainMenuPinned = isPinned;
					if (mainMenuPinned) {
						$("body").addClass("main-menu-pinned");
					} else {
						$("body").removeClass("main-menu-pinned");
					}
				}
			}, 100);
			$(document).on('scroll', onScroll);
			onScroll();
	
		}).catch(function (err) {
			console.error("Error initializing page management:", err.stack);
			throw err;
		});
	}

	function initComponents () {

		return LIB.Promise.try(function () {
			
			// HACK
			if (window.__skipWaitForComponents) {
				return;
			}

			var componentContext = {
				cores: contexts
			};

			// TODO: Use 'cores/component/firewidget'
			return LIB.waitForLibraryProperty("Components").then(function (components) {
				Object.keys(components).forEach(function (alias) {
					contexts.component.registerComponentInstanceFactory(
						alias,
						components[alias].forContext(componentContext)
					);
				});
			});

		}).catch(function (err) {
			console.error("Error initializing components:", err.stack);
			throw err;
		});

//console.log("window.Library", window.Library);


/*		
		window.Cores.load.adapters.pinf.load(
			"/dist/DependencyVisualization.bundle.js"
		).then(function (container) {

			container.main();

		}).catch(function (err) {
			console.log("ERROR loading components using pinf loader:", err.stack);
		});

		window.Cores.load.adapters.requirejs.load(
			"/dist/DependencyVisualization.amd.js"
		).then(function (container) {

			container.main();

		}).catch(function (err) {
			console.log("ERROR loading components using requirejs loader:", err.stack);
		});
*/

/*
		window.Cores.load.adapters.systemjs.load(
			"/dist/DependencyVisualization.amd.js"
		).then(function (container) {

			container.main();

		}).catch(function (err) {
			console.log("ERROR loading components using systemjs loader:", err.stack);
		});
*/
	}

	return initPage().then(function () {
		return LIB.Promise.all([
			initSession(),
			initData(),
			initPageManagement(),
			initComponents()
		]);
	}).then(function () {
		// Spin up the page.
		LIB.Cores.page.adapters.page.spin(contexts.page);

		// TODO: Namespace this variable so each stack can export its own or modified version of a common one?
		window.contexts = contexts;
	});
}

window.waitForLibrary(function (LIB) {
	LIB.$(function () {
		LIB.waitForLibraryProperty("Cores").then(function () {
			return bootForLib(LIB);
		}).catch(function (err) {
			console.error("Error booting page:", err.stack);
		});
	});
});
