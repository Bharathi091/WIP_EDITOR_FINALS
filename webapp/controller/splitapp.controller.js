sap.ui.define([
	"wip/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"wip/model/ReportModel",
	"sap/ui/core/routing/History",
	"wip/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/UIComponent",
	"sap/m/MessageToast"

], function(BaseController, JSONModel, ReportModel, History, formatter, Filter, UIComponent, FilterOperator, MessageToast) {
	"use strict";

	return BaseController.extend("wip.controller.splitapp", {
		onInit: function() {
			this.getView().setModel(new ReportModel().getModel(), "InputsModel");
			var omodel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(omodel, "jsonmodel");
			this.getRouter().getRoute("splitapp").attachPatternMatched(this._onObjectMatched, this);
			this.afilter = [];
			this.rowlen = "";
			this._oGlobalFilter = null;
			this.getView().byId("show").setVisible(false);
		},

		_onObjectMatched: function(oEvent) {
			debugger;
			var object = oEvent.getParameter("arguments").objectName;
			this.afilter = JSON.parse(object);
			var oList = this.getView().byId("list");
			var oBinding = oList.getBinding("items");
			oBinding.filter(this.afilter);
		},

		onPress: function(oEvent) {

			var InputFields = this.getView().getModel("InputsModel");
			var filter = this.afilter;
			var oModel = this.getOwnerComponent().getModel();
			var omod = this.getView().getModel("jsonmodel");
			var that = this;
			oModel.read("/WipDetailsSet", {

				filters: filter,
				success: function(oData) {

					omod.setProperty("/modelData", oData.results);
					omod.setProperty("/rowlen", oData.results.length);
					omod.setProperty("/Matter", oData.results[0].Pspid);
					omod.setProperty("/Lead Partner", oData.results[0].Pernr);
					omod.setProperty("/BillingOffice", oData.results[0].Zzwerks);

				}

			});
			InputFields.setProperty("/Inputs/IconTabs/Narrative_Edits", true);
			InputFields.setProperty("/Inputs/IconTabs/Line_Item_Edits", true);
			InputFields.setProperty("/Inputs/IconTabs/Line_Item_Transfers", true);

		},
		handleIconTabBarSelect: function(oEvent) {
			debugger;
			var InputFields = this.getView().getModel("InputsModel");
			var change = oEvent.getSource();

			var value = change.getSelectedKey();
			alert(value);
			if (value === "NarrativeEdits") {
				InputFields.setProperty("/Inputs/exporttable", InputFields.getProperty("/Inputs/wipexport/exportColumns1"));
			} else if (value === "LineItemEdits") {
				InputFields.setProperty("/Inputs/exporttable", InputFields.getProperty("/Inputs/wipexport/exportColumns2"));
			} else if (value === "LineItemTransfers") {

			} else {
				InputFields.setProperty("/Inputs/exporttable", InputFields.getProperty("/Inputs/wipexport/exportColumns0"));
			}
		},
		onmattersearch: function(oEvent) {
			debugger;
			var aFilter = [];
			// var sQuery = oEvent.getParameter("query");
			var sQuery = oEvent.getSource().getValue();
			if (sQuery) {
				aFilter.push(new Filter("Pspid", "EQ", sQuery));
			}

			var oList = this.byId("invoiceList");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);
		},
		ondetailsearch: function(oEvent) {

			// build filter array
			var aFilter = [];
			var sQuery = oEvent.getParameter("query");
			this.filter(sQuery);

		},
		filter: function(sQuery) {
			debugger;

			this._oGlobalFilter = null;
			var columns = this.getView().getModel("InputsModel").getProperty("/Inputs/exporttable");
			for (var m = 0; m < columns.length; m++) {
				var column = columns[m];
				if (sQuery) {
					this._oGlobalFilter = new Filter([
						new Filter(column.key, "Contains", sQuery)

					], false);
				}
			}

			this._filter();

		},
		_filter: function() {
			debugger;
			var oFilter = null;
			if (this._oGlobalFilter) {
				oFilter = this._oGlobalFilter;
			}
			this.byId("dataTable0").getBinding("rows").filter(oFilter, "Application");
			this.byId("dataTable1").getBinding("rows").filter(oFilter, "Application");
			this.byId("dataTable2").getBinding("rows").filter(oFilter, "Application");
			this.byId("dataTable3").getBinding("rows").filter(oFilter, "Application");
		},
	
		handleDelete: function(oEvent) {
				debugger;
				var oList = oEvent.getSource(),
				oItem = oEvent.getParameter("listItem");
				oList.removeItem(oItem);
			
		},
	
		onpressmaster: function(oeve) {
			var detail = this.getView().byId("detail");
			detail.setVisibility(false);
		},
		onBack: function() {
			var sPreviousHash = History.getInstance().getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {

				this.getOwnerComponent().getRouter().navTo("woklist", null, true);
			}
		},
		onHide: function() {
			var oSplit = this.getView().byId("SplitAppCreditMemo");
			oSplit.setMode(sap.m.SplitAppMode.HideMode);
			this.getView().byId("hide").setVisible(false);
			this.getView().byId("show").setVisible(true);
		},
		onHide1: function() {
			var oSplit = this.getView().byId("SplitAppCreditMemo");
			oSplit.setMode(sap.m.SplitAppMode.StretchCompressMode);
			this.getView().byId("show").setVisible(false);
			this.getView().byId("hide").setVisible(true);
		}

	});
});