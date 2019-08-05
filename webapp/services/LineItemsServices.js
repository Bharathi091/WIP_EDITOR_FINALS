sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/core/format/DateFormat",
		"zprs/wipeditor/model/ReportModel"
], function(Object, DateFormat, ReportModel) {
	"use strict";
	var instance;
	var LineItemsServices = Object.extend("zprs.wipeditor.services.LineItemsServices", {
		constructor: function() {
             
            
             
		},
		
		selectListItem: function(oModel,aFilter){
	          
	          	var deferred = $.Deferred();
				oModel.read("/WipDetailsSet", {
				filters: aFilter,
				success: function(oData) {
	                deferred.resolve(oData);

				},
				error: function(err) {
					
				
					deferred.reject(err);
				}
				
			} 
			);

			
				return deferred.promise();
			
		},
		

		
		getPhaseCodes: function(WipEditModel, pspid, that) {
			
		
			var service = WipEditModel.getProperty("/Inputs");
			var deferred = $.Deferred();
			var phasecodeServiceUrl = that.getOwnerComponent().getModel('ZPRS_WIPCODES_SRV').sServiceUrl;

			var oModelPhasecodes = new sap.ui.model.odata.v2.ODataModel({
				serviceUrl: phasecodeServiceUrl
			}, true);
			var now = new Date();
			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy-MM-ddThh:ss:mm"
			});
			var nowUtc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
			var fromdate = dateFormat.format(nowUtc);
		

			var phasecodedataset = service.services.PhaseCodeSet;
			var phasefilter = [new sap.ui.model.Filter({
				path: "Pspid",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: pspid
			}), new sap.ui.model.Filter({
				path: "Workdate",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: fromdate
			})];
	
			
			oModelPhasecodes.read(phasecodedataset, {
				filters: phasefilter,
				success: function(oData) {
					
				
					deferred.resolve(oData);

				},
				error: function() {
					
				
					deferred.reject();
				}
			});
			return deferred.promise();
		},
		getTaskcodes: function(WipEditModel, phaseCodeSelected, that) {

			var deferred = $.Deferred();
			var service = WipEditModel.getProperty("/Inputs");
			var taskcodeServiceUrl = that.getOwnerComponent().getModel('ZPRS_WIPCODES_SRV').sServiceUrl;
			var oModelTaskcodes = new sap.ui.model.odata.v2.ODataModel({
				serviceUrl: taskcodeServiceUrl
			}, true);

			var taskcodedataset = service.services.TaskCodeSet;
			var taskfilter = [new sap.ui.model.Filter({
				path: 'Phasecode',
				operator: sap.ui.model.FilterOperator.EQ,
				value1: phaseCodeSelected
			})];

			
		
			oModelTaskcodes.read(taskcodedataset, {
				filters: taskfilter,
				success: function(oData) {
				
				
					deferred.resolve(oData);

				},
				error: function(err) {
					
					deferred.reject();
				}
			});
			return deferred.promise();
		},
		getActivitycodes: function(WipEditModel, pspid, that) {
			
			
			var deferred = $.Deferred();
			var service = WipEditModel.getProperty("/Inputs");
			var taskcodeServiceUrl = that.getOwnerComponent().getModel('ZPRS_WIPCODES_SRV').sServiceUrl;
		

			var oModelActivitycodes = new sap.ui.model.odata.v2.ODataModel({
				serviceUrl: taskcodeServiceUrl
			}, true);

			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy-MM-ddThh:ss:mm"
			});

			var now = new Date();
			var nowUtc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
			var wrkdt = dateFormat.format(nowUtc);

	

			var activitycodedataset = service.services.ActCodeSet;
			var taskfilter = [new sap.ui.model.Filter({
					path: "Pspid",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: pspid
				}),
				new sap.ui.model.Filter({
					path: "Workdate",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: wrkdt
				})
			];

		
			oModelActivitycodes.read(activitycodedataset, {
				filters: taskfilter,
				success: function(oData) {
	
					deferred.resolve(oData);

				},
				error: function() {
					deferred.reject();
				}
			});
			return deferred.promise();

		},
	getFFtaskcodes: function(WipEditModel, pspid, that) {
		
		
			var service = WipEditModel.getProperty("/Inputs");
			var deferred = $.Deferred();
			var taskcodeServiceUrl = that.getOwnerComponent().getModel('ZPRS_WIPCODES_SRV').sServiceUrl;
			var oModelFFTaskcodes = new sap.ui.model.odata.v2.ODataModel({
				serviceUrl: taskcodeServiceUrl
			}, true);

			var fftaskcodedataset = service.services.FfTaskCodeSet;
			var fftaskfilter = [new sap.ui.model.Filter({
				path: "Matter",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: pspid
			})];

		
			oModelFFTaskcodes.read(fftaskcodedataset, {
				filters: fftaskfilter,
				success: function(oData) {
				
				
					deferred.resolve(oData);

				},
				error: function(err) {
					
					deferred.reject();
				}
			});
			return deferred.promise();

		},
			getFFActivitycodes: function(WipEditModel, fftaskCodeSelected, pspid, that) {
				
	
			var deferred = $.Deferred();
			var service = WipEditModel.getProperty("/Inputs");
			var ffactvitycodeServiceUrl = that.getOwnerComponent().getModel('ZPRS_WIPCODES_SRV').sServiceUrl;
			var oModelFFActivitycodes = new sap.ui.model.odata.v2.ODataModel({
				serviceUrl: ffactvitycodeServiceUrl
			}, true);

			var ffactvitycodedataset = service.services.FfActivityCodeSet;
			var taskfilter = [new sap.ui.model.Filter({
					path: 'Matter',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: pspid
				}),
				new sap.ui.model.Filter({
					path: 'FfActivityCodeSet',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: fftaskCodeSelected
				})
			];

		
			oModelFFActivitycodes.read(ffactvitycodedataset, {
				filters: taskfilter,
				success: function(oData) {
				
					sap.ui.core.BusyIndicator.hide(0);
					deferred.resolve(oData);

				}.bind(this),
				error: function() {
					
					sap.ui.core.BusyIndicator.hide(0);
					deferred.reject();
				}
			});
			return deferred.promise();
		},
			addToDictionary: function(oFModel, ip_data, ref){
			
			var deferred = $.Deferred();
		
			var ServiceUrl = oFModel.sServiceUrl;

		
		
			jQuery.ajax({
				url: ServiceUrl,
				headers: {
					"X-CSRF-Token": "fetch"
				},
				success: function(data, textStatus, request) {
					var sapToken = request.getResponseHeader("X-CSRF-Token");
					var oHeaders = {
						"X-CSRF-Token": sapToken,
						"Content-Type": "application/json"
					};

					var oModel = new sap.ui.model.odata.v2.ODataModel({
						serviceUrl: ServiceUrl
					}, false);
				
					oModel.setHeaders(oHeaders);

					oModel.create("/AddWordsToDictionarySet", ip_data, {
						method: "POST",
						success: function(datas) {
							deferred.resolve(datas);
						},
						error: function(err) {
							deferred.reject();
						}
					});

				},
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
				instance = new LineItemsServices();
			}
			return instance;
		}
	};
});