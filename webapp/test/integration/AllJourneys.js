jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
		"sap/ui/test/Opa5",
		"wip/test/integration/pages/Common",
		"sap/ui/test/opaQunit",
		"wip/test/integration/pages/Worklist",
		"wip/test/integration/pages/Object",
		"wip/test/integration/pages/NotFound",
		"wip/test/integration/pages/Browser",
		"wip/test/integration/pages/App"
	], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "wip.view."
	});

	sap.ui.require([
		"wip/test/integration/WorklistJourney",
		"wip/test/integration/ObjectJourney",
		"wip/test/integration/NavigationJourney",
		"wip/test/integration/NotFoundJourney",
		"wip/test/integration/FLPIntegrationJourney"
	], function () {
		QUnit.start();
	});
});