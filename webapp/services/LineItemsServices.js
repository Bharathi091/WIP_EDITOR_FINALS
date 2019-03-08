sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/core/format/DateFormat",
		"wip/model/ReportModel"
], function(Object, DateFormat, ReportModel) {
	"use strict";
	var instance;
	var LineItemsServices = Object.extend("wip.services.LineItemsServices", {
		constructor: function() {
             
             this.getView().setModel(new ReportModel().getModel(), "InputsModel");
             
		},
		
		selectListItem: function(oModel,aFilter){
	          debugger;
	          	var deferred = $.Deferred();
				oModel.read("/WipDetailsSet", {
				filters: aFilter,
				success: function(oData) {
	                deferred.resolve(oData);

				},
				error: function() {
					
				
					deferred.reject();
				}
				
			} 
			);

			
				return deferred.promise();
			
		},
		
			onConsolidate: function(selectedConsolidateArray,oModel){
				alert("asdada");
				debugger;
			var deferred = $.Deferred();
			
			this.getView().setModel(new ReportModel().getModel(), "InputsModel");
			
			var InputFields = this.getView().getModel("InputsModel");
			
			var docNumber = "";
			selectedConsolidateArray.forEach(function(item){
				
			docNumber = docNumber + item.Belnr + ',';
				
			}	);
			 var lastIndex = docNumber.lastIndexOf(",");
            docNumber = docNumber.substring(0, lastIndex);
            
     
			var userServiceUrl = oModel + InputFields.getProperty("/Inputs/services/WIPTRANSFER") + 
			InputFields.getProperty("/Inputs/qParms/ACTION") +
			InputFields.getProperty("/Inputs/action/CONSOLIDATE")+
			InputFields.getProperty("/Inputs/lsValues/CONUMBER")+
			"'" + docNumber + "'" +
			InputFields.getProperty("/Inputs/lsValues/Buzei")+ "'" +
			InputFields.getProperty("/Inputs/lsValues/Hours")+ "'" +
			InputFields.getProperty("/Inputs/lsValues/Percentage")+ "'" +
			InputFields.getProperty("/Inputs/lsValues/ToActivityCode")+ "'" +
			InputFields.getProperty("/Inputs/lsValues/ToFfActivityCode")+ "'" +
			InputFields.getProperty("/Inputs/lsValues/ToFfTaskCode")+ "'" +
			InputFields.getProperty("/Inputs/lsValues/ToMatter")+ "'" +
			InputFields.getProperty("/Inputs/lsValues/ToTaskCode")+ "'" +
			InputFields.getProperty("/Inputs/qParms/JSON");
			
			
			debugger;
			
			jQuery.ajax({
				type: "GET",
				url: userServiceUrl,
				cache: false,
				contentType: "application/json",
				dataType: "json",
				processData: false,
				success: function(result) {
					deferred.resolve(result);
					debugger
				},
				error: function() {
					deferred.reject();
				}

			});

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
			// var dateTimeVal='datetime '+fromdate;

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
			//odata read for Phase code
			
			oModelPhasecodes.read(phasecodedataset, {
				filters: phasefilter,
				success: function(oData) {
					
					console.log("phase",oData);
					deferred.resolve(oData);

				},
				error: function() {
					
					console.log("error");
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

			//odata read for Phase code
		
			oModelTaskcodes.read(taskcodedataset, {
				filters: taskfilter,
				success: function(oData) {
				
					console.log("taskcode",oData);
					deferred.resolve(oData);

				},
				error: function(err) {
						console.log(error);
					deferred.reject();
				}
			});
			return deferred.promise();
		},
		getActivitycodes: function(WipEditModel, thisRow, pspid, that) {
			
			var deferred = $.Deferred();
			var service = WipEditModel.getProperty("/Inputs");
			var taskcodeServiceUrl = that.getOwnerComponent().getModel('ZPRS_WIPCODES_SRV').sServiceUrl;
			//get Activity codes

			var oModelActivitycodes = new sap.ui.model.odata.v2.ODataModel({
				serviceUrl: taskcodeServiceUrl
			}, true);

			var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy-MM-ddThh:ss:mm"
			});

			var now = new Date();
			var nowUtc = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds());
			var wrkdt = dateFormat.format(nowUtc);

			// if (thisRow !== "" && thisRow.Budat!==null) {
      
			// 	wrkdt = sap.ui.core.format.DateFormat.getDateInstance({
			// 		source: {
			// 			pattern: "timestamp"
			// 		},
			// 		pattern: "dd.MM.yyyy"
			// 	}).format(new Date(thisRow[0].Budat.match(/\d+/)[0] * 1));
			// }

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

			//odata read for activity code
			oModelActivitycodes.read(activitycodedataset, {
				filters: taskfilter,
				success: function(oData) {
	console.log("activitycode",oData);
					deferred.resolve(oData);

				},
				error: function() {
					deferred.reject();
				}
			});
			return deferred.promise();

		},
	getFFtaskcodes: function(WipEditModel, thisRow, pspid, that) {
		
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

			//odata read for activity code
			oModelFFTaskcodes.read(fftaskcodedataset, {
				filters: fftaskfilter,
				success: function(oData) {
				
					console.log("fftask",oData);
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

			//odata read for FFActivitycodes
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