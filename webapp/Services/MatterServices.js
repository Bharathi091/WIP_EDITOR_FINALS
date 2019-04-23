/* global _:true */
sap.ui.define([
	"sap/ui/base/Object"
], function(Object) {
	"use strict";
	var instance;

	var services = Object.extend("billedit.Services.MatterServices", {

		UserDataSet: function(BillEditModel, that) {

			var deferred = $.Deferred();
			/*Initiate Service Request*/

			var serviceUrls = BillEditModel.getProperty("/Inputs/services");
			var oModelUserName = new sap.ui.model.odata.v2.ODataModel({
				serviceUrl: that.getOwnerComponent().getModel('ZPRS_VALUE_HELP_SRV').sServiceUrl
			}, true);

			var initialUserDataset = serviceUrls.InitialuserDataset;
			var userDataServiceUrl = that.getOwnerComponent().getModel('ZPRS_USER_DATA_SRV').sServiceUrl;
			var rowdata = "";

			//Call Service
			oModelUserName.read(initialUserDataset, {
				success: function(oData) {
					rowdata = oData;
					if (rowdata.Uname) {
						var oModelUserData = new sap.ui.model.odata.v2.ODataModel({
							serviceUrl: userDataServiceUrl
						}, true);

						var userDataDataSet = serviceUrls.UpdateduserDataset + rowdata.Uname + "')";
						//odata read for user data
						oModelUserData.read(userDataDataSet, {
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
		getmattersSetfilter: function(BillEditModel, filter, that) {
			var serviceUrls = BillEditModel.getProperty("/Inputs/services");
			var deferred = $.Deferred();

			var masterServiceUrl = that.getOwnerComponent().getModel('ZPRS_BILL_EDIT_SRV').sServiceUrl;
			jQuery.ajax({
				url: masterServiceUrl,
				headers: {
					"X-CSRF-Token": "fetch"
				}
			}).then(
				function(result, status, xhr) {

					var sapToken = xhr.getResponseHeader('X-CSRF-Token');

					var oModelMasterService = new sap.ui.model.odata.v2.ODataModel({
						serviceUrl: masterServiceUrl
					}, true);
					oModelMasterService.setHeaders({
						"X-CSRF-Token": sapToken
					});
					var batchBillSummarySet = serviceUrls.batchBillSummarySet;

					oModelMasterService.read(batchBillSummarySet, {
						filters: filter,
						success: function(oData) {
							console.log(oData);
							deferred.resolve(oData);

						}.bind(this),
						error: function() {
							deferred.reject();

						}
					});
					return deferred.promise();

				},
				function() {
					alert("$.get failed!");

				}
			);
			return deferred.promise();

		},
		getpricebymatter: function(BillEditModel, draftbillId, that) {
			var serviceUrls = BillEditModel.getProperty("/Inputs/services");
			var qParms = BillEditModel.getProperty("/Inputs/qParms");
			var deferred = $.Deferred();

			var masterServiceUrl = that.getOwnerComponent().getModel('ZPRS_BILL_EDIT_SRV').sServiceUrl;
			jQuery.ajax({
				url: masterServiceUrl,
				headers: {
					"X-CSRF-Token": "fetch"
				}
			}).then(
				function(result, status, xhr) {

					var sapToken = xhr.getResponseHeader('X-CSRF-Token');

					var oModelMasterService = new sap.ui.model.odata.v2.ODataModel({
						serviceUrl: masterServiceUrl
					}, true);
					oModelMasterService.setHeaders({
						"X-CSRF-Token": sapToken
					});
					var batchBillSummarySet = serviceUrls.BillSummarySet + "('" + draftbillId + "')" + qParms.PriceByMatnr;
					oModelMasterService.setUseBatch(false);
					oModelMasterService.read(batchBillSummarySet, {
						success: function(oData) {
							console.log(oData);
							deferred.resolve(oData);

						}.bind(this),
						error: function() {
							deferred.reject();

						}
					});
					return deferred.promise();

				},
				function() {
					alert("$.get failed!");

				}
			);
			return deferred.promise();

		},
		getBillSummaryHeaderToGroupInfo: function(BillEditModel, draftbillId, that) {
			var serviceUrls = BillEditModel.getProperty("/Inputs/services");
			var qParms = BillEditModel.getProperty("/Inputs/qParms");
			var deferred = $.Deferred();

			var masterServiceUrl = that.getOwnerComponent().getModel('ZPRS_BILL_EDIT_SRV').sServiceUrl;
			jQuery.ajax({
				url: masterServiceUrl,
				headers: {
					"X-CSRF-Token": "fetch"
				}
			}).then(
				function(result, status, xhr) {

					var sapToken = xhr.getResponseHeader('X-CSRF-Token');

					var oModelMasterService = new sap.ui.model.odata.v2.ODataModel({
						serviceUrl: masterServiceUrl
					}, true);
					oModelMasterService.setHeaders({
						"X-CSRF-Token": sapToken
					});
					var batchBillSummaryHeaderToGroupSet = serviceUrls.BillSummarySet + "('" + draftbillId + "')" + qParms.HeaderToGroupInfo +
						qParms.DATAJSON;
					oModelMasterService.setUseBatch(false);
					oModelMasterService.read(batchBillSummaryHeaderToGroupSet, {
						success: function(oData) {
							console.log(oData);
							deferred.resolve(oData);

						}.bind(this),
						error: function() {
							deferred.reject();

						}
					});
					return deferred.promise();

				},
				function() {
					alert("$.get failed!");

				}
			);
			return deferred.promise();

		},
		getOutPutTypesets: function(BillEditModel, billModel, that) {

			var deferred = $.Deferred();

			var serviceUrls = BillEditModel.getProperty("/Inputs/services");
			var beditModel = new sap.ui.model.odata.v2.ODataModel({
				serviceUrl: that.getOwnerComponent().getModel('ZPRS_BILL_EDIT_SRV').sServiceUrl
			}, true);
			var DbOutputTypeSet = serviceUrls.DbOutputTypeSet;

			var PrintBillsfilter = [new sap.ui.model.Filter({
				path: "Kappl",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: "V1"
			}), new sap.ui.model.Filter({
				path: "Pspid",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: billModel.Pspid
			}), new sap.ui.model.Filter({
				path: "Vbeln",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: billModel.Vbeln
			})];

			beditModel.read(DbOutputTypeSet, {
				filters: PrintBillsfilter,
				success: function(oData) {
					deferred.resolve(oData);

				},
				error: function() {
					deferred.reject();

				}
			});
			return deferred.promise();

		},
		getfinalbilltypes: function(BillEditModel, billModel, that) {

			var deferred = $.Deferred();
			var serviceUrls = BillEditModel.getProperty("/Inputs/services");
			var beditModel = new sap.ui.model.odata.v2.ODataModel({
				serviceUrl: that.getOwnerComponent().getModel('ZPRS_BILL_EDIT_SRV').sServiceUrl
			}, true);
			var FbOutputTypeSet = serviceUrls.FbOutputTypeSet;
			var PrintBillsfilter = [new sap.ui.model.Filter({
				path: "Kappl",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: "V3"
			}), new sap.ui.model.Filter({
				path: "Pspid",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: billModel.Pspid
			}), new sap.ui.model.Filter({
				path: "Vbeln",
				operator: sap.ui.model.FilterOperator.EQ,
				value1: billModel.Vbeln
			})];

			beditModel.read(FbOutputTypeSet, {
				filters: PrintBillsfilter,
				success: function(oData) {
					deferred.resolve(oData);
				},
				error: function() {
					deferred.reject();
				}
			});
			return deferred.promise();

		},
		getBillSummarySetStatus: function(BillEditModel, matters, that) {
			var deferred = $.Deferred();
			var service = BillEditModel.getProperty("/Inputs");
			var ServiceUrl = that.getOwnerComponent().getModel('ZPRS_BILL_EDIT_SRV').sServiceUrl;
			var oModelStatus = new sap.ui.model.odata.v2.ODataModel({
				serviceUrl: ServiceUrl
			}, false);
			//oModelUserName.setUseBatch(false);
			var DbStatusSet = service.services.DbStatusSet;
			var billno = '';
			var TypeofApproval = '';
			var Filter = '';
			if (matters.length === 1) {
				billno = matters[0].Vbeln;
				TypeofApproval = matters[0].TypeOfApproval;
				debugger
				if (TypeofApproval === 'M') {
					Filter = [new sap.ui.model.Filter({
						path: "Vbeln",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: billno
					}), new sap.ui.model.Filter({
						path: "TypeOfApproval",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: TypeofApproval
					})];
				} else {
					Filter = [new sap.ui.model.Filter({
						path: "TypeOfApproval",
						operator: sap.ui.model.FilterOperator.EQ,
						value1: TypeofApproval
					})];
				}
			} else {
				billno = matters[0].Vbeln;
				Filter = [new sap.ui.model.Filter({
					path: "Vbeln",
					operator: sap.ui.model.FilterOperator.EQ,
					value1: billno
				})];
			}
			
			oModelStatus.read(DbStatusSet, {
				filters: Filter,
				success: function(oData) {
					deferred.resolve(oData);
				}.bind(this),
				error: function() {
					deferred.reject();
				}
			});
			return deferred.promise();
			
			

		},
		changestatus: function(BillEditModel,matters, status, that) {

			var serviceUrls = BillEditModel.getProperty("/Inputs/services");
			var lsValues = BillEditModel.getProperty("/Inputs/lsValues");
			var qParms = BillEditModel.getProperty("/Inputs/qParms");
			var masterServiceUrl = that.getOwnerComponent().getModel('ZPRS_BILL_EDIT_SRV').sServiceUrl;

			function getheadersuccess(response) {
				var sapToken = response.headers("X-CSRF-Token");
				var Vbeln = '';
				var TypeOfApproval = '';
				var STATUS = status.Estat;
				_.each(matters, function(item) {
					Vbeln = Vbeln + item.Vbeln + ',';
					TypeOfApproval = TypeOfApproval + item.TypeOfApproval + ',';
				});
				Vbeln = Vbeln.replaceAll('undefined', '');
				var lastIndex = Vbeln.lastIndexOf(",");
				Vbeln = Vbeln.substring(0, lastIndex);
				if (Vbeln === ',') {
					Vbeln = '';
				}

				TypeOfApproval = TypeOfApproval.replaceAll('undefined', '');
				var lastIndex1 = TypeOfApproval.lastIndexOf(",");
				TypeOfApproval = TypeOfApproval.substring(0, lastIndex1);
				if (TypeOfApproval === ',') {
					TypeOfApproval = '';
				}

				var url = encodeURI(serviceUrls.ChangeStatus + "?" + lsValues.FinalVbeln + "'" + Vbeln + "'" + lsValues.TYPEOFAPPROVAL + "'" +
					TypeOfApproval + "'" + lsValues.STATUS + "'" + STATUS + "'" + qParms.JSON);
				var batchChanges = [];
				batchChanges.push({
					requestUri: url,
					method: "GET"
				});
				var deferred = $.Deferred();
				var success = function(data, res) {

					if (data.__batchResponses[0].data) {
						var results = data.__batchResponses[0].data.results;
						deferred.resolve(results);

					} else {
						var resp = JSON.parse(data.__batchResponses[0].response.body);
						deferred.resolve(resp);
					}

				};

				// Rejects the promise when the call to datajs throws an error.
				var error = function(err, res1) {
					deferred.reject(err);
				};

				var changeStatusModel = new sap.ui.model.odata.v2.ODataModel({
					serviceUrl: masterServiceUrl
				}, false);

				changeStatusModel.setHeaders({
					"X-CSRF-Token": sapToken
				});

				changeStatusModel.create({
					__batchRequests: batchChanges
				}, {
					method: "POST",
					success: success,
					error: error
				});
				// Returns a promise that will be fulfilled or rejected when the call to the service returns.
				return deferred.promise();

			}

			function getheaderFailed(error) {

			}

			jQuery.ajax({
					url: masterServiceUrl,
					headers: {
						"X-CSRF-Token": "fetch"
					}
				}).then(getheadersuccess)
				.catch(getheaderFailed);
			//return deferred.promise();

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