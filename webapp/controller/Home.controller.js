/* global _:true */
sap.ui.define([
	"billedit/controller/BaseController",
	"billedit/model/ReportModel",
	"billedit/Services/MatterServices",
	"billedit/Services/PartnerService",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel"
], function(BaseController, ReportModel, MatterServices, PartnerService, Filter, FilterOperator, MessageBox, JSONModel) {
	"use strict";
	//70004567
	return BaseController.extend("billedit.controller.Home", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf billedit.view.Home
		 */
		onInit: function() {

			this.setModel(new ReportModel().getModel(), "MatterModel");
			this.BillEditModel = this.getModel("MatterModel");
			var Btnviews = {
				homeView: true,
				headerEdit: false,
				narrativeEdits: false,
				LineItemEdits: false,
				LineItemTransfers: false
			};
			var that=this;
			var btn = sap.ui.getCore().byId(this.getView().getId() + "--FilterBar-btnShowHide");
				btn.attachPress(function(oEvent) {

				if (oEvent.getSource().getProperty("text") === "Show Filter Bar") {
					
					that.BillEditModel.setProperty("/Inputs/filterBarExpanded", false);

					

				} else {
					
					that.BillEditModel.setProperty("/Inputs/filterBarExpanded", true);

				

				}

			});
			this.BillEditModel.setProperty("/Inputs/buttons/views", Btnviews);
			this.setupInitialData();

		},
		onBeforeRebindTable: function() {
		
		},
		TabClick: function(oControlEvent) {

			var sKey = oControlEvent.getParameter("key");
			this.bus = sap.ui.getCore().getEventBus();
			var that = this;
			this.enableMode();
			this.bus.publish(sKey, "row", {
				data: that.BillEditModel.getProperty("/Inputs/selectedRow")
			});

			// if(sKey==='billSummaryMode'){
			// 	this.bus.publish("billSummaryMode","row", {
			// 		data:that.BillEditModel.getProperty("/Inputs/selectedRow")
			// 	});	
			// }
			// else if(sKey==='narrativeMode'){
			// 	this.bus.publish("narrativeMode","row", {
			// 		data:that.BillEditModel.getProperty("/Inputs/selectedRow")
			// 	});	
			// }
			// else if(sKey==='headerEditMode'){
			// 	this.bus.publish("headerEditMode","row", {
			// 		data:that.BillEditModel.getProperty("/Inputs/selectedRow")
			// 	});	
			// }

		},
		buildTokens: function(token, keyPath, filters) {
			var val0 = "";
			var val1 = "";
			var operation = "";

			if (token.data().range === undefined) {
				val0 = token.getText();
				val1 = "";
				operation = sap.ui.model.FilterOperator.EQ;
			} else {
				if (token.data().range.exclude === true) {
					operation = sap.ui.model.FilterOperator.NE;
				} else {

					switch (token.data().range.operation.toString()) {
						case 'BT':
							operation = sap.ui.model.FilterOperator.BT;
							break;
						case 'Contains':
							operation = sap.ui.model.FilterOperator.Contains;
							break;
						case 'EndsWith':
							operation = sap.ui.model.FilterOperator.EndsWith;
							break;
						case 'EQ':
							operation = sap.ui.model.FilterOperator.EQ;
							break;
						case 'GE':
							operation = sap.ui.model.FilterOperator.GE;
							break;
						case 'GT':
							operation = sap.ui.model.FilterOperator.GT;
							break;
						case 'LE':
							operation = sap.ui.model.FilterOperator.LE;
							break;
						case 'LT':
							operation = sap.ui.model.FilterOperator.LT;
							break;
						case 'NE':
							operation = sap.ui.model.FilterOperator.NE;
							break;
						case 'StartsWith':
							operation = sap.ui.model.FilterOperator.StartsWith;
							break;
						default:
							operation = sap.ui.model.FilterOperator.EQ;
					}

				}
				if (token.data().range.value1) {
					val0 = token.data().range.value1.toString();
				}
				if (token.data().range.value2) {
					val1 = token.data().range.value2.toString();
				}

			}
			filters.push(
				new sap.ui.model.Filter({
					path: keyPath,
					operator: operation,
					value1: val0,
					value2: val1 //OR token.getKey(), depending on whjat do you store in key/value

				}));

			return filters;
		},
		masterFilterGo: function(oEvent) {
             
             debugger;
			this.showBusyIndicator();
			//	var oBindingParams = oEvent.getParameter("bindingParams");
			var that = this;
			var filters = [];
			/**For Section Filter Start**/
			var Filterbar = this.getView().byId("FilterBar");
			var InputFieldFilters = this.BillEditModel.getProperty("/Inputs/InputFields");

			for (var SF = 0; SF < InputFieldFilters.length; SF++) {

				var SmartInput = Filterbar.getControlByKey(InputFieldFilters[SF]);
				if (SmartInput.getTokens().length !== 0) {
					$.each(SmartInput.getTokens(), function(index, token) {
						that.buildTokens(token, InputFieldFilters[SF], filters);
					});
				}
			}

			// filters.push(new sap.ui.model.Filter({
			// 	path: 'MpatnerParvw',
			// 	operator: sap.ui.model.FilterOperator.EQ,
			// 	value1: sap.ui.getCore().byId("BusinessPartnerType").getSelectedKey()
			// }));
			filters.push(new sap.ui.model.Filter({
					path: 'Budat',
					operator: sap.ui.model.FilterOperator.BT,
					value1: new Date('01-01-2014'),
					value2: new Date()
				}),
				new sap.ui.model.Filter({
					path: 'Vbeln',
					operator: sap.ui.model.FilterOperator.EQ,
					value1: that.getView().byId("DraftBillNo").getValue()
				})
			);
			
			MatterServices.getInstance().getmattersSetfilter(this.BillEditModel, filters, that)
				.done(function(oData) {
					that.hideBusyIndicator();
					if (oData.results.length === 0) {
						MessageBox.alert("No Data Found");
					} else {
					
						//that.DialogClosedWithCancel();
						that.BillEditModel.setProperty("/Inputs/filterBarExpanded", false);
						that.BillEditModel.setProperty("/Inputs/viewdata", oData);
						
						// _.each(oData.results, function(item, i) {

						// 	item.date = dateFormat.format(item.Erdat);
						// 	item.index = i;

						// });

						that.getView().setModel(that.BillEditModel, "MatterModel");

					}

				})
				.fail(function(error) {

					that.hideBusyIndicator();
				//	that.DialogClosedWithCancel();

				});
		},
		setupInitialData: function() {
			this.BillEditModel = this.getModel("MatterModel");
			var that = this;
			//call to feth user data
			//after that call partner type service
			$.when(MatterServices.getInstance().UserDataSet(this.BillEditModel, this), PartnerService.getInstance().partnerType(this.BillEditModel,
					this))
				.done(function(userData, partnerTypeData) {
					that.BillEditModel.setProperty("/Inputs/formatterData", userData);
					that.BillEditModel.setProperty("/Inputs/partnerTypeData", partnerTypeData.results);
				});
			// sap.ui.getCore().byId("fromDateInput").setDateValue(new Date('01-01-2014'));
			// sap.ui.getCore().byId("toDateInput").setDateValue(new Date());

		},
		enableMode: function(oEvent) {
			this.BillEditModel = this.getModel("MatterModel");
			var draftBills = this.getView().byId("dataTable").getSelectedIndices();
			if (draftBills.length > 0) {

				var Btnviews = {
					homeView: true,
					headerEdit: false,
					narrativeEdits: false,
					LineItemEdits: false,
					LineItemTransfers: false
				};
				this.BillEditModel.setProperty("/Inputs/buttons/views", Btnviews);
				this.getView().byId("createFinalBill").setEnabled(true);
				this.getView().byId("cancelDraftBill").setEnabled(true);
				this.getView().byId("printFinalBill").setEnabled(true);
				this.getView().byId("changeStatus").setEnabled(true);

			} else {
				var Btnviews = {
					homeView: true,
					headerEdit: false,
					narrativeEdits: false,
					LineItemEdits: false,
					LineItemTransfers: false
				};
				this.BillEditModel.setProperty("/Inputs/buttons/views", Btnviews);
				this.getView().byId("createFinalBill").setEnabled(false);
				this.getView().byId("cancelDraftBill").setEnabled(false);
				this.getView().byId("printFinalBill").setEnabled(false);
				this.getView().byId("changeStatus").setEnabled(false);
			}

			var Modes = {
				"viewMode": true,
				"headerEditMode": false,
				"narrativeMode": false,
				"lineItemEditMode": false,
				"lineItemTransferMode": false,
				"billSummary": false,
				"createDraftBillMode": false
			};

			if (draftBills.length === 1) {
				Modes = {
					"viewMode": true,
					"headerEditMode": true,
					"narrativeMode": true,
					"lineItemEditMode": true,
					"lineItemTransferMode": true,
					"billSummary": true,
					"createDraftBillMode": false
				};

				var viewTableData = this.BillEditModel.getProperty("/Inputs/viewdata/results");
				var headerData = [];
				headerData.push(viewTableData[draftBills[0]]);
				this.BillEditModel.setProperty("/Inputs/headerEditData", headerData);
				this.BillEditModel.setProperty("/Inputs/selectedRow", viewTableData[draftBills[0]]);
				this.getView().byId("FilterBar").setVisible(false);
				this.getView().byId("printDraftBill").setEnabled(true);
				this.BillEditModel.setProperty("/Inputs/filterBarExpanded", false);
			} else {
				this.getView().byId("FilterBar").setVisible(true);
				this.getView().byId("printDraftBill").setEnabled(false);
				this.BillEditModel.setProperty("/Inputs/filterBarExpanded", true);

			}
			this.BillEditModel.setProperty("/Inputs/Modes", Modes);

		},
		footerBarMethod: function(oControlEvent) {
			this.bus = sap.ui.getCore().getEventBus();
			this.bus.publish("footerChannel", "footerButtons", {
				tab: oControlEvent.getSource().data("tab"),
				button: oControlEvent.getSource().data("button")
			});
			if (oControlEvent.getSource().data("button") === 'changeStatus') {
				var oDialog = this._getStatusDialog();
				this.getView().addDependent(oDialog);
				oDialog.open();
				var that = this;
				var ViewRowsData = this.BillEditModel.getProperty("/Inputs/viewdata/results");
				var selectedRows = [];
				var draftBills = this.getView().byId("dataTable").getSelectedIndices();
				_.each(draftBills, function(i) {
					selectedRows.push(ViewRowsData[i]);
				});
				this.showBusyIndicator();
				$.when(MatterServices.getInstance().getBillSummarySetStatus(this.BillEditModel, selectedRows, this))
					.done(function(statusList) {
						that.hideBusyIndicator();
						console.log(statusList);
						that.BillEditModel.setProperty("/statusList", statusList);
						that._statusDialog.setModel(new JSONModel({
							data: that.BillEditModel.getProperty("/statusList")
						}), "statusList");
					});

			}

		},
		selectStatus: function(oControlEvent) {
			var obj = oControlEvent.getSource().getBindingContext("statusList").getObject();
			var that = this;
			var ViewRowsData = this.BillEditModel.getProperty("/Inputs/viewdata/results");
			var selectedRows = [];
			var draftBills = this.getView().byId("dataTable").getSelectedIndices();
			_.each(draftBills, function(i) {
				selectedRows.push(ViewRowsData[i]);
			});
				this.showBusyIndicator();
				$.when(MatterServices.getInstance().changestatus(this.BillEditModel, selectedRows,obj, this))
					.done(function(statusList) {
						that.hideBusyIndicator();
						that.statusDialogClosedWithOk();
					});


		

		},

		printFinalBill: function(oControlEvent) {
			this.openPrintFinalBillDialog();
		},

		printDraftBill: function(oControlEvent) {
			this.openPrintBillDialog();
		},

		printDialogClosedWithCancel: function() {
			this._billsDialog.close();
		},
		printFinalDialogClosedWithCancel: function() {
			this._finalBillDialog.close();
		},
		statusDialogClosedWithOk: function() {
			this._statusDialog.close();
		},
		printDialogClosedWithOk: function() {

			var billsModel = this._billsDialog.getModel("printbillsData");

			var serviceUrls = this.BillEditModel.getProperty("/Inputs/services");

			var Row = this.BillEditModel.getProperty("/Inputs/selectedRow");

			var qparams = this.BillEditModel.getProperty("/Inputs/qParms");

			var url = encodeURI(this.getOwnerComponent().getModel('ZPRS_BILL_EDIT_SRV').sServiceUrl + serviceUrls.PDFOutCollection + "(Kappl='" +
				"V1" +
				"',Kschl='" + billsModel.getProperty("/selected") + "',DraftBill='" + Row.Vbeln + "')" + qparams.value);
			window.open(url, "_blank");

		},
		_getbillsDialog: function() {
			if (!this._billsDialog) {
				this._billsDialog = sap.ui.xmlfragment("dialogBill", "billedit.fragments.printDraftBill", this.getView().getController());
			}
			return this._billsDialog;
		},
		_getfinalbillsDialog: function() {
			if (!this._finalBillDialog) {
				this._finalBillDialog = sap.ui.xmlfragment("dialogBill", "billedit.fragments.printFinalBill", this.getView().getController());
			}
			return this._finalBillDialog;
		},
		_getStatusDialog: function() {
			if (!this._statusDialog) {
				this._statusDialog = sap.ui.xmlfragment("dialogBill", "billedit.fragments.changeStatus", this.getView().getController());
			}
			return this._statusDialog;
		},
		openPrintBillDialog: function() {
			var that = this;
			var oDialog = that._getbillsDialog();
			that.getView().addDependent(oDialog);
			oDialog.open();
			var billModel = this.BillEditModel.getProperty("/Inputs/selectedRow");

			this.showBusyIndicator();
			$.when(MatterServices.getInstance().getOutPutTypesets(this.BillEditModel, billModel, this))
				.done(function(printbillsData) {
					that.hideBusyIndicator();
					that.BillEditModel.setProperty("/printbillsData", printbillsData);
					that._billsDialog.setModel(new JSONModel({
						data: that.BillEditModel.getProperty("/printbillsData"),
						selected: "ZDR1"
					}), "printbillsData");
				});

		},
		openPrintFinalBillDialog: function() {

			var oDialog = this._getfinalbillsDialog();
			this.getView().addDependent(oDialog);
			oDialog.open();

			var ViewRowsData = this.BillEditModel.getProperty("/Inputs/viewdata/results");
			var selectedRows = [];

			var draftBills = this.getView().byId("dataTable").getSelectedIndices();
			_.each(draftBills, function(i) {
				selectedRows.push(ViewRowsData[i]);
			});
			if (selectedRows.length === 1) {
				this.getfinalbilltypes();
			} else {
				this.getfinalmassbilltypes();
			}

		},
		getfinalbilltypes: function() {
			this.showBusyIndicator();
			var billModel = this.BillEditModel.getProperty("/Inputs/selectedRow");
			var that = this;
			var sMsg = '';
			$.when(MatterServices.getInstance().getfinalbilltypes(this.BillEditModel, billModel, this))
				.done(function(printbillsData) {
					that.hideBusyIndicator();
					if (!(_.isUndefined(printbillsData))) {

						for (var i = 0; i < printbillsData.results.length; i++) {

							var message = printbillsData.results[i].Message;
							if (printbillsData.results[i].Iserror.toUpperCase() === 'X') {
								sMsg = message;
								that.showAlert("Error", sMsg);
								that.printFinalDialogClosedWithCancel();
								break;
							} else {
								var finalDr_Arr = _.filter(printbillsData.results, function(o) {
									return o.Default === 'X';
								});
								this.getFinalDr(finalDr_Arr[0].Kschl);
							}
						}
					}
					if (!(_.isUndefined(printbillsData.error))) {
						that.showAlert("Error", printbillsData.error.message.value);
						that.printFinalDialogClosedWithCancel();
					}
					that.BillEditModel.setProperty("/printfinalData", printbillsData.results);

					//console.log(printbillsData);
					// that.BillEditModel.setProperty("/printfinalData", printbillsData);
					// that._getfinalbillsDialog.setModel(new JSONModel({
					// 	data: that.BillEditModel.getProperty("/printfinalData"),
					// 	selected: "ZFB1"
					// }), "printfinalData");
				});
		},
		getFinalDr: function(dr) {

				if (this.BillEditModel.getProperty("/printfinalData")) {
					var finalD = _.filter(this.BillEditModel.getProperty("/printfinalData"), function(o) {
						return o.Kschl === dr;
					});
					this.BillEditModel.setProperty("/finalD", finalD[0]);
					//TODO print final bill

				}
			}
			/**
			 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
			 * (NOT before the first rendering! onInit() is used for that one!).
			 * @memberOf billedit.view.Home
			 */
			//	onBeforeRendering: function() {
			//
			//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf billedit.view.Home
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf billedit.view.Home
		 */
		//	onExit: function() {
		//
		//	}

	});

});