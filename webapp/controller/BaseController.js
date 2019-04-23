sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/Label",
	"sap/m/Text",
	"billedit/extjs/lodash"
], function(Controller, Button, Dialog,Label,Text) {
	"use strict";

	return Controller.extend("billedit.controller.BaseController", {
		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function() {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		convertToJSONDate:function(strDate){
			var dt = new Date(strDate);
            var newDate = new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), dt.getMinutes(), dt.getSeconds(), dt.getMilliseconds()));
            return '/Date(' + newDate.getTime() + ')/';
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
		showAlert: function(title, message) {

			var dialog = new Dialog({
				title: title,
				type: 'Message',
				content: new Text({
					text: message
				}),
				beginButton: new Button({
					text: 'OK',
					press: function() {
						dialog.close();

					}
				}),

				afterClose: function() {
					dialog.destroy();
				}
			});

			dialog.open();
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
		showBusyIndicator: function() {
			sap.ui.core.BusyIndicator.show(0);
		},
		hideBusyIndicator: function() {
			sap.ui.core.BusyIndicator.hide(0);
		},
		onShareEmailPress: function() {
			var oViewModel = (this.getModel("objectView") || this.getModel("worklistView"));
			sap.m.URLHelper.triggerEmail(
				null,
				oViewModel.getProperty("/shareSendEmailSubject"),
				oViewModel.getProperty("/shareSendEmailMessage")
			);
		}

	});

});