sap.ui.define([
	"zprs/wipeditor/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], function(BaseController, JSONModel) {
	"use strict";

	return BaseController.extend("zprs.wipeditor.controller.App", {

		onInit: function() {
			var oViewModel,
				fnSetAppNotBusy,
				oListSelector = this.getOwnerComponent().oListSelector,
				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

			oViewModel = new JSONModel({
				busy: true,
				delay: 0
			});
			this.setModel(oViewModel, "appView");

			fnSetAppNotBusy = function() {
				oViewModel.setProperty("/busy", false);
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			};

			this.getOwnerComponent().getModel().metadataLoaded()
				.then(fnSetAppNotBusy);
			this.byId("idAppControl").setMode(sap.m.SplitAppMode.HideMode);
			this.byId("idAppControl").hideMaster();

			// Makes sure that master view is hidden in split app
			// after a new list entry has been selected.
			oListSelector.attachListSelectionChange(function() {
				this.byId("idAppControl").hideMaster();
			}, this);

			// apply content density mode to root view
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			this.bus = sap.ui.getCore().getEventBus();
			this.bus.subscribe("showHide", "Master", this.hideMaster, this);

		},
		hideMaster: function(showHide, Master, data) {

			this.appId = this.byId("idAppControl");
			if (data.par1 === "showMaster") {
				this.byId("idAppControl").setMode(sap.m.SplitAppMode.StretchCompressMode);
				this.byId("idAppControl").showMaster();

			} else {
				this.byId("idAppControl").setMode(sap.m.SplitAppMode.HideMode);
				this.byId("idAppControl").hideMaster();

			}

		}

	});

});