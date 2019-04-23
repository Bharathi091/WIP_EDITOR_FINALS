sap.ui.define([
	"sap/ui/base/Object"
], function(Object) {
	"use strict";
	var instance;
	var services = Object.extend("zprs.bedit.Services.TKeeperService", {
		gettkeeperDetailsfilter: function(service, filter, excludefilter) {

			var deferred = $.Deferred();

			var gettkeeperDetailsServiceUrl = service.serviceUrl + service.wsParms.ZPRS_BILL_EDIT;
			var oModelPartnerTypeDetails = new sap.ui.model.odata.v2.ODataModel({
				serviceUrl: gettkeeperDetailsServiceUrl
			}, true);
				oModelPartnerTypeDetails.setUseBatch(false);

			var TimeKeeperSet = service.services.TimeKeeperSet;

			oModelPartnerTypeDetails.read(TimeKeeperSet, {
				filters: filter,
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