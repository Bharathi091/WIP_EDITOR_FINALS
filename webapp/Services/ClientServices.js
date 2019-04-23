/* global _:true */
sap.ui.define([
	"sap/ui/base/Object"
], function(Object) {
	"use strict";
	var instance;
	var services = Object.extend("zprs.bedit.Services.ClientServices", {
		constructor: function() {

		},
		setSavestateinfo: function(service, final, sapToken) {

			var data = final;
			data.ContId = data.ContId.toString();
			data.Value = JSON.stringify(data.Value);
			var deferred = $.Deferred();
			var VarinatSaveServiceUrl = encodeURI(service.serviceUrl + service.wsParms.ZPRS_VARIANT_MAINTENANCE_SRV + service.services.VarinatSaveSet);

			jQuery.ajax({
				url: VarinatSaveServiceUrl,
				data: data,
				headers: {
					'X-CSRF-Token': sapToken,
					'Content-Type': 'application/json'
				},
				success: function(data) {

					deferred.resolve(data);

				},
				error: function() {

					deferred.resolve('');
				}
			});

			return deferred.promise();

		},
		getclientDetailsfilter: function(service, filter, excludefilter, data) {

			var deferred = $.Deferred();

			var clientDetailsServiceUrl = service.serviceUrl + service.wsParms.ZPRS_BILL_EDIT;
			var oModelclientDetails = new sap.ui.model.odata.v2.ODataModel({
				serviceUrl: clientDetailsServiceUrl
			}, true);

			var clientDetailsset = service.services.ClientByCompanyCodeSet;

			oModelclientDetails.read(clientDetailsset, {
				filters: filter,
				success: function(oData) {
					deferred.resolve(oData);

				}.bind(this),
				error: function() {
					deferred.reject();

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