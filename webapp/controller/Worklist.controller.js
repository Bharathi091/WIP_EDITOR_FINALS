sap.ui.define([
	"wip/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"wip/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(BaseController, JSONModel, History, formatter, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("wip.controller.Worklist", {

		getRouter: function() {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		onNav: function() {
			this.getRouter().navTo("Report", {
				objectId: 20
			});
		},
		onBind: function() {
                var value = this.getView().byId("SmartFilterBar").getControlByKey("Pspid").getTokens().length;
				var aFilter = [];

				var object = this.getView().byId("SmartFilterBar").getControlByKey("Pspid").getTokens();
				// var date = this.getView().byId("SmartFilterBar").getControlByKey("Pspid").getTokens();
				var odatefrom = this.getView().byId("SmartFilterBar").getControlByKey("Budat").getFrom();
			
				var odateto = this.getView().byId("SmartFilterBar").getControlByKey("Budat").getTo();

				$.each(object, function(j, token) {
					if (object) {
						aFilter.push(new Filter("Pspid", "EQ", token.getText()));
					}
				});

				if (odatefrom) {
					aFilter.push(new Filter("Budat", sap.ui.model.FilterOperator.BT, odatefrom, odateto));
				}
				var stringObject = JSON.stringify(aFilter);

			
			this.getRouter().navTo("splitapp", {
				objectName: stringObject
			});
		}

	});
});