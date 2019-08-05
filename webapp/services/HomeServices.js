sap.ui.define([
	"sap/ui/base/Object"
], function(Object) {
	"use strict";
	var instance;
	var HomeServices = Object.extend("zprs.wipeditor.Services.HomeServices", {
		constructor: function() {},
		getUserSettingsDataService: function(sets, oComponent) {
			

			var userDatamodel = oComponent.getModel("ZPRS_USER_DATA_SRV");
			var valueHelpModel = oComponent.getModel("ZPRS_VALUE_HELP_SRV");
			var deferred = $.Deferred();
			var rowdata = "";

			//Call Service
			valueHelpModel.read(sets.InitialuserDataset, {
				success: function(oData) {
					rowdata = oData;
					if (rowdata.Uname) {
						var userDataDataSet = sets.UpdateduserDataset + rowdata.Uname + "')";
						//odata read for user data
						userDatamodel.read(userDataDataSet, {
							success: function(oData1) {
								deferred.resolve(oData1);
							},
							error: function() {
								deferred.reject();
							}
						});
					} else {
						deferred.reject();
					}
				},
				error: function() {
					deferred.reject();
				}
			});
			return deferred.promise();
		},

		getTimekeeperListService: function(sets, oComponent) {
			var deferred = $.Deferred();
			var wipEditorDatamodel = oComponent.getModel("wipEditorModel");
			// var userServiceUrl = service.serviceUrl + service.wsParms.ZPRS_WIP_EDITOR_SRV;
			// var oModelTimekeeperSet = new sap.ui.model.odata.v2.ODataModel({
			// 	serviceUrl: userServiceUrl
			// }, true);

			wipEditorDatamodel.read(sets.UsridToTimekeeperSet, {
				success: function(oData) {
					deferred.resolve(oData);
				},
				error: function() {
					deferred.reject();
				}
			});
			return deferred.promise();
		},
		getEntitySetsService: function(sets, oComponent) {
			var deferred = $.Deferred();
			var beditModelService = oComponent.getModel("beditModel").sServiceUrl;

			jQuery.ajax({
				type: "GET",
				contentType: "application/json",
				url: beditModelService,
				dataType: "json",
				async: false,
				success: function(data, textStatus, jqXHR) {
					deferred.resolve(data);
				},
				error: function() {
					deferred.reject();
				}

			});

			return deferred.promise();
		},
		getSummaryEditsDataService: function(sets, oComponent, filter) {

			var deferred = $.Deferred();
			var beditModel = oComponent.getModel("beditModel");

			beditModel.read(sets.BillSummarySet, {
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
				instance = new HomeServices();
			}
			return instance;
		}
	};
});