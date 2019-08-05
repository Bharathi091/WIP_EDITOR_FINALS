jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

// We cannot provide stable mock data out of the template.
// If you introduce mock data, by adding .json files in your webapp/localService/mockdata folder you have to provide the following minimum data:
// * At least 3 Categories in the list
// * All 3 Categories have at least one Products

sap.ui.require([
	"sap/ui/test/Opa5",
	"com/mast/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"com/mast/test/integration/pages/App",
	"com/mast/test/integration/pages/Browser",
	"com/mast/test/integration/pages/Master",
	"com/mast/test/integration/pages/Detail",
	"com/mast/test/integration/pages/NotFound"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "com.mast.view."
	});

	sap.ui.require([
		"com/mast/test/integration/MasterJourney",
		"com/mast/test/integration/NavigationJourney",
		"com/mast/test/integration/NotFoundJourney",
		"com/mast/test/integration/BusyJourney",
		"com/mast/test/integration/FLPIntegrationJourney"
	], function () {
		QUnit.start();
	});
});