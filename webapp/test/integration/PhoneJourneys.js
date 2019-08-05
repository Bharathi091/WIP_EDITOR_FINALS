jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

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
		"com/mast/test/integration/NavigationJourneyPhone",
		"com/mast/test/integration/NotFoundJourneyPhone",
		"com/mast/test/integration/BusyJourneyPhone"
	], function () {
		QUnit.start();
	});
});