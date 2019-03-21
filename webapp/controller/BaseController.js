sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"wip/model/formatter"
], function(Controller, formatter) {
	"use strict";

	return Controller.extend("wip.controller.BaseController", {
		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function() {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function(sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function(oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */
		onShareEmailPress: function() {
			var oViewModel = (this.getModel("objectView") || this.getModel("worklistView"));
			sap.m.URLHelper.triggerEmail(
				null,
				oViewModel.getProperty("/shareSendEmailSubject"),
				oViewModel.getProperty("/shareSendEmailMessage")
			);
		},
		Export: function() {

			var iconTabBarFilter = this.getView().byId("idIconTabBar").getSelectedKey();
			if (iconTabBarFilter === "Home") {

				this.onExport("WipDetailsSet");
			} else if (iconTabBarFilter === "NarrativeEdits") {

				this.onExport("WipDetailsSet1");
			} else if (iconTabBarFilter === "LineItemEdits") {

				this.onExport("WipDetailsSet2");
			} else {

				this.onExport("WipDetailsSet3");
			}

		},
		onExport: function(tableId) {
			var oTable = this.byId(tableId);
			var oExport = oTable.exportData();
			var sModel = oTable.data("mainmodel");
			if (sModel) {
				var aExpCol = oExport.getColumns();
				var aCol = oTable.getColumns();
				aCol.forEach(function(oColumn, i) {
					var oCell = new sap.ui.core.util.ExportCell();
					console.log(oCell.getMetadata());
					if (oColumn.data("ctype") === "DatePicker") {
						oCell.bindProperty("content", {
							path: sModel + ">" + oColumn.getSortProperty(),
							formatter: formatter.getDateFormat
						});
						aExpCol[i].setTemplate(oCell);
					} else if (oColumn.data("ctype") === "TimePicker") {
						oCell.bindProperty("content", {
							path: sModel + ">" + oColumn.getSortProperty(),
							formatter: formatter.getTimeFormat
						});
						aExpCol[i].setTemplate(oCell);
					}
				});
			}
			oExport.saveFile("WipDetailsSet" + new Date());
		}

	});

});