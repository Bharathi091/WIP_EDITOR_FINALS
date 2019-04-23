sap.ui.define([
	"sap/ui/base/Object"
], function(Object) {
	"use strict";
	var instance;
	var services = Object.extend("billedit.Services.PartnerService", {
		partnerType: function(BillEditModel, that) {

			var deferred = $.Deferred();

			var serviceUrls = BillEditModel.getProperty("/Inputs/services");
			var oModelPartnerTypeDetails = new sap.ui.model.odata.v2.ODataModel({
				serviceUrl: that.getOwnerComponent().getModel('ZPRS_BILL_EDIT_SRV').sServiceUrl
			}, true);

			var PartnerTypeTKSet = serviceUrls.PartnerTypeTKSet;

			oModelPartnerTypeDetails.read(PartnerTypeTKSet, {

				success: function(oData) {
					deferred.resolve(oData);

				}.bind(this),
				error: function() {
					deferred.reject();
					// TODO: Add error Popup

				}
			});
			return deferred.promise();

		}

	});
	return {
		getInstance: function() {
			if (!instance) {
				instance = new services();
			}
			return instance;
		}
	};
});