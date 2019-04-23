sap.ui.define([
	"billedit/controller/BaseController",
	"billedit/Services/MatterServices",
	"billedit/model/ReportModel",
	"sap/m/MessageBox"
], function(BaseController, MatterServices, ReportModel, MessageBox) {
	"use strict";

	return BaseController.extend("billedit.controller.BillSummary", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf billedit.view.BillSummary
		 */
		onInit: function() {
		
			this.bus = sap.ui.getCore().getEventBus();
			this.bus.subscribe("billSummaryMode","row", this._getButtonEvent, this);
		},
		_getButtonEvent: function(billSummaryMode,row, data) {
			this.BillEditModel = this.getView().getModel("MatterModel");
				var Btnviews={
						homeView:false,
						headerEdit:false,
						narrativeEdits:false,
						LineItemEdits:false,
						LineItemTransfers:false
					};
			    this.BillEditModel.setProperty("/Inputs/buttons/views", Btnviews);
			this.getPriceByMatterCall(data.data.Vbeln);
			this.getBillSummaryHeaderToGroupInfoCall(data.data.Vbeln);
			
		},
		getPriceByMatterCall: function(draftBillId) {
			var that = this;
			var BSTable=this.getView().byId("BillSummaryTable");
			this.showBusyIndicator();
			MatterServices.getInstance().getpricebymatter(this.BillEditModel, draftBillId, that)
				.done(function(oData) {
					that.hideBusyIndicator();
					if (oData.results.length === 0) {
						MessageBox.alert("No Data Found");
					} else {
						that.BillEditModel.setProperty("/Inputs/billSummaryData", oData.results);
						that.BillEditModel.setProperty("/Inputs/billSummaryDataLength", oData.results.length);
						var matterLineItemSummaryListCopyDiscount = [];
						var matterLineItemSummaryListStatsCopy = [];
						var NetValueFieldCame = 0,
							totalFeesTotal = 0,
							totalPerValTotal = 0,
							totalHardCostTotal = 0,
							totalSoftCostTotal = 0;

						totalFeesTotal = parseFloat(totalFeesTotal).toFixed(2);
						totalPerValTotal = parseFloat(totalPerValTotal).toFixed(2);
						totalHardCostTotal = parseFloat(totalHardCostTotal).toFixed(2);
						totalSoftCostTotal = parseFloat(totalSoftCostTotal).toFixed(2);
						console.log(oData.results);
					
						for (var i = 0; i < oData.results.length; i++) {
							//if (NetValueFieldCame === 0 ) {
							if (NetValueFieldCame === 0 && oData.results[i].Vtext === 'Net Value') {
								NetValueFieldCame = 1;
							}
							if (NetValueFieldCame === 1) {
								totalPerValTotal = parseFloat(totalPerValTotal) + parseFloat(oData.results[i].PercentValue);
								totalFeesTotal = parseFloat(totalFeesTotal) + parseFloat(oData.results[i].FeeValue);
								totalHardCostTotal = parseFloat(totalHardCostTotal) + parseFloat(oData.results[i].HcValue);
								totalSoftCostTotal = parseFloat(totalSoftCostTotal) + parseFloat(oData.results[i].ScValue);
							}
							
							if (oData.results[i].Isstatistical === "D") {
								matterLineItemSummaryListCopyDiscount.push(oData.results[i]);
							}
							if (oData.results[i].Isstatistical === "X") {
								matterLineItemSummaryListStatsCopy.push(oData.results[i]);
							}
							if (i === oData.results.length - 1) {
								that.BillEditModel.setProperty("/Inputs/billSummaryDiscountData", matterLineItemSummaryListCopyDiscount);
								that.BillEditModel.setProperty("/Inputs/billSummaryDiscountDataCount", matterLineItemSummaryListCopyDiscount.length);
								
								that.BillEditModel.setProperty("/Inputs/billSummaryStatsData", matterLineItemSummaryListStatsCopy);
								
								//Bill Summary Table Footer Values
								that.BillEditModel.setProperty("/Inputs/totalPerValTotal", totalPerValTotal);
								that.BillEditModel.setProperty("/Inputs/totalFeesTotal", totalFeesTotal);
								that.BillEditModel.setProperty("/Inputs/totalHardCostTotal", totalHardCostTotal);
								that.BillEditModel.setProperty("/Inputs/totalSoftCostTotal", totalSoftCostTotal);
								
							//	BSTable.addRow({});
							}
						}

					}

				})
				.fail(function(error) {
					that.hideBusyIndicator();
					that.DialogClosedWithCancel();

				});
		},
		getBillSummaryHeaderToGroupInfoCall:function(draftBillId){
			var that = this;
			this.showBusyIndicator();
			MatterServices.getInstance().getBillSummaryHeaderToGroupInfo(this.BillEditModel, draftBillId, that)
				.done(function(oData) {
				that.hideBusyIndicator();
					if (oData.results.length === 0) {
						MessageBox.alert("No Data Found");
					} else {
					that.BillEditModel.setProperty("/Inputs/lineSummaryData", oData.results);
					
					}

				})
				.fail(function(error) {
					that.hideBusyIndicator();
					that.DialogClosedWithCancel();

				});
		},
	
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf billedit.view.BillSummary
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf billedit.view.BillSummary
		 */
		onAfterRendering: function() {
			//this.getView().byId("FilterBar").setVisible(false);
		}

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf billedit.view.BillSummary
		 */
		//	onExit: function() {
		//
		//	}

	});

});