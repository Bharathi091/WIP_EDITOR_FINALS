sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/core/format/DateFormat"
], function(Object, DateFormat) {
	"use strict";
	var instance;
	var LineItemsServices = Object.extend("billedit.Services.LineItemsServices", {
		constructor: function() {

		},
		getLineItemsData: function(BillEditModel, vblen, that) {

			var service = BillEditModel.getProperty("/Inputs");

			var deferred = $.Deferred();
			var userServiceUrl = that.getOwnerComponent().getModel('ZPRS_BILL_EDIT_SRV').sServiceUrl + service.services.billdataset + vblen +
				"')" +
				service.services.OrderItemSet;
			jQuery.ajax({
				type: "GET",
				url: userServiceUrl,
				cache: false,
				contentType: "application/json",
				dataType: "json",
				processData: false,
				success: function(result) {
					deferred.resolve(result);
				},
				error: function() {
					deferred.reject();
				}

			});

			return deferred.promise();

		},
		getPhaseCodes: function(BillEditModel, pspid, that) {
			
			var service = BillEditModel.getProperty("/Inputs");
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
					console.log("-----------Phase--------------------",oData);
					deferred.resolve(oData);

				},
				error: function() {
					deferred.reject();
				}
			});
			return deferred.promise();
		},
		getTaskcodes: function(BillEditModel, phaseCodeSelected, that) {
			debugger
			var deferred = $.Deferred();
			var service = BillEditModel.getProperty("/Inputs");
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
					console.log("-----------task--------------------");
					deferred.resolve(oData);

				},
				error: function(err) {
						console.log(err);
						console.log("-----------err--------------------");
					deferred.reject();
				}
			});
			return deferred.promise();
		},
		getActivitycodes: function(BillEditModel, thisRow, pspid, that) {
			var deferred = $.Deferred();
			var service = BillEditModel.getProperty("/Inputs");
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

			if (thisRow !== "" && thisRow.Budat!==null) {
      
				wrkdt = sap.ui.core.format.DateFormat.getDateInstance({
					source: {
						pattern: "timestamp"
					},
					pattern: "dd.MM.yyyy"
				}).format(new Date(thisRow.Budat.match(/\d+/)[0] * 1));
			}

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
	console.log("-----------activity--------------------");
					deferred.resolve(oData);

				},
				error: function() {
					deferred.reject();
				}
			});
			return deferred.promise();

		},
		getFFtaskcodes: function(BillEditModel, thisRow, pspid, that) {
			var service = BillEditModel.getProperty("/Inputs");
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
					console.log("-----------fftask--------------------");
					deferred.resolve(oData);

				},
				error: function(err) {
					
					deferred.reject();
				}
			});
			return deferred.promise();

		},
		getFFActivitycodes: function(BillEditModel, fftaskCodeSelected, pspid, that) {
			var deferred = $.Deferred();
			var service = BillEditModel.getProperty("/Inputs");
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
					console.log("-----------ffactivity--------------------");
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
		getWFComments: function(BillEditModel, billModel, that) {
			var deferred = $.Deferred();
			var service = BillEditModel.getProperty("/Inputs");
			var userServiceUrl = that.getOwnerComponent().getModel('ZPRS_BILL_EDIT_SRV').sServiceUrl;

			var oModelUserName = new sap.ui.model.odata.v2.ODataModel({
				serviceUrl: userServiceUrl
			}, false);
			//oModelUserName.setUseBatch(false);
			var WFCommentsSet = service.services.WFCommentsSet;

			var commentsFilter = [new sap.ui.model.Filter({
				path: "Vbeln",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: billModel.Vbeln
			}), new sap.ui.model.Filter({
				path: "Posnr",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: billModel.Posnr
			}), new sap.ui.model.Filter({
				path: "Area",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: "W2"
			})];

			oModelUserName.read(WFCommentsSet, {
				filters: commentsFilter,
				success: function(oData) {
					deferred.resolve(oData);

				}.bind(this),
				error: function() {
					deferred.reject();

				}
			});
			return deferred.promise();

		},
		saveBillDetailOrderItemSet: function(BillEditModel, ip_data,Action, that) {
			var deferred = $.Deferred();
			var service = BillEditModel.getProperty("/Inputs");
			var ServiceUrl = that.getOwnerComponent().getModel('ZPRS_BILL_EDIT_SRV').sServiceUrl;

			ip_data.Action = Action;
            delete ip_data.__metadata;
            delete ip_data.DBToStatus;
            delete ip_data.taxlistcopy;
            delete ip_data.FileList;
            delete ip_data.info;
            delete ip_data.imagedisplay;
            delete ip_data.isSelect;
            delete ip_data.taskcodesdetails;
            delete ip_data.activitycodesdetails;
            delete ip_data.Fftaskcodesdetails;
            delete ip_data.ToMatter;
            
            ip_data.DiscAmount = ip_data.DiscAmount ? ip_data.DiscAmount.toString() : '0';
            ip_data.Kursk = ip_data.Kursk ? ip_data.Kursk.toString() : '0';
            ip_data.DiscPercent = ip_data.DiscPercent ? ip_data.DiscPercent.toString() : '0';

            ip_data.Zztrustamt = ip_data.Zztrustamt ? ip_data.Zztrustamt.toString() : '0';
            ip_data.Zzfundsamt = ip_data.Zzfundsamt ? ip_data.Zzfundsamt.toString() : '0';
            ip_data.Zzcreditamt = ip_data.Zzcreditamt ? ip_data.Zzcreditamt.toString() : '0';
			
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
					var billSet = service.services.BillSummarySet;
					oModel.setHeaders(oHeaders);

					oModel.create(billSet, ip_data, {
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