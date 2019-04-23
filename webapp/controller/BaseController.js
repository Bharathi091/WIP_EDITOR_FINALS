sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel",
	"zprs/wipeditor/model/ReportModel",
	"sap/ui/model/FilterOperator",
	"zprs/wipeditor/model/formatter",
	"zprs/wipeditor/services/LineItemsServices",
	"zprs/wipeditor/services/SplitItemsServices",
	"sap/m/MessageBox",

	"sap/ui/core/format/DateFormat",
	"sap/ui/export/Spreadsheet"


], function(Controller, Filter, JSONModel, ReportModel, FilterOperator, formatter, LineItemsServices, SplitItemsServices, MessageBox,
	DateFormat,Spreadsheet) {
	"use strict";

	return Controller.extend("zprs.wipeditor.controller.BaseController", {
		formatter: formatter,
		onInit: function(oEvent) {

			this.jsonModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.jsonModel, "JSONModel");
			this.setModel(new ReportModel().getModel(), "InputsModel");
			this.table = "";

			var OtableSmart0 = this.getView().byId("smartTable_ResponsiveTable0");
			var oPersButton = OtableSmart0._oTablePersonalisationButton;
			oPersButton.attachPress(function() {

				var oPersController = OtableSmart0._oPersController;
				var oPersDialog = oPersController._oDialog;

				oPersDialog.attachOk(function(oEvent) {
					setTimeout(function() {
						this.jsonModel.setProperty("/modelData", this.getModel("InputsModel").getProperty("/Inputs/homeTable"));
						var Otablenew = this.getView().byId("WipDetailsSet");
						Otablenew.bindRows("/modelData");
					}, 1000);

				});

			});

		},


		gotoPress: function(oEvent) {

			this.onHide1();
			sap.ui.core.BusyIndicator.show(0);
			var value = this.getView().byId("SmartFilterBar").getControlByKey("Pspid").getTokens().length;
			var aFilter = [];
			if (value >= 1) {
				var InputFields = this.getView().getModel("InputsModel");
				InputFields.setProperty("/Inputs/hideFilterBar", false);
			}
			var oModel = this.getOwnerComponent().getModel();
			oModel.refresh(true);
			this.values = 0;
			this.getView().byId("list").removeSelections(true);
			var object = this.getView().byId("SmartFilterBar").getControlByKey("Pspid").getTokens();
			var that = this;
			InputFields.setProperty("/Inputs/masterItems", "");
			$.each(object, function(j, token) {
				if (object) {
					aFilter.push(new Filter("Pspid", "EQ", token.getText()));
				}

			});

			oModel.read("/WipMattersSet", {
				filters: aFilter,
				success: function(oData) {
					sap.ui.core.BusyIndicator.hide(0);

					InputFields.setProperty("/Inputs/masterItems", oData.results);
InputFields.setProperty("/Inputs/matserSearchItems", oData.results);


		that.jsonModel.setProperty("/modelData", "");
					that.getView().getModel("InputsModel").setProperty("/Inputs/formMatter", "");
					that.getView().getModel("InputsModel").setProperty("/Inputs/formLeadPartner", "");
					that.getView().getModel("InputsModel").setProperty("/Inputs/formBillingOffice", "");
					that.jsonModel.setProperty("/RowCount", "0");
						that.getView().byId("Home").setVisible(true);
			that.getView().byId("Narrative").setVisible(false);
			that.getView().byId("LineItemEdits").setVisible(false);
			that.getView().byId("LineItemTransfers").setVisible(false);
			that.getView().byId("NarrativeEditsVBox").setVisible(false);
			that.getView().byId("LineItemEditsVbox").setVisible(false);
			that.getView().byId("LineItemTransfersVbox").setVisible(false);

					

				}
			});

		},
		
		listSearch: function(oEvent) {
			debugger;
			var searchValue = this.byId("listSearch").getValue();

			var result = [];

			this.getModel("InputsModel").getProperty("/Inputs/matserSearchItems").forEach(
				function(value, index) {

					var myJSON = JSON.stringify(jQuery.extend({}, value));
					var obj1 = myJSON;

					if (obj1.toLowerCase().includes(searchValue.toLowerCase())) {
						result.push(value);
					}

				}
			);

			this.getModel("InputsModel").setProperty("/Inputs/masterItems", result);

		},

		onPress: function(oEvent) {
			
			var aFilter = [];
			var that = this;

			var InputFields = this.getModel("InputsModel");

			var Pspid = oEvent.getSource().getProperty("title");
			InputFields.setProperty("/Inputs/rootPspid", Pspid);

			var odatefrom = this.getView().byId("SmartFilterBar").getControlByKey("Budat").getFrom();
			InputFields.setProperty("/Inputs/odatefrom", odatefrom);
			var odateto = this.getView().byId("SmartFilterBar").getControlByKey("Budat").getTo();
			InputFields.setProperty("/Inputs/odateto", odateto);

			aFilter.push(new Filter("Pspid", FilterOperator.EQ, Pspid));
			aFilter.push(new Filter("Budat", sap.ui.model.FilterOperator.BT, odatefrom, odateto));
			this.getView().byId("Home");
			var oModel = this.getOwnerComponent().getModel();
			sap.ui.core.BusyIndicator.show(0);
			LineItemsServices.getInstance().selectListItem(oModel, aFilter)
				.done(function(oData) {

					sap.ui.core.BusyIndicator.hide(0);

					that.getModel("InputsModel").setProperty("/Inputs/homeTable", oData.results);

					that.jsonModel.setProperty("/modelData", oData.results);
					that.jsonModel.setProperty("/RowCount", oData.results.length);
					that.jsonModel.setProperty("/RowCount1", oData.results.length);
					that.jsonModel.setProperty("/RowCount2", oData.results.length);
					that.jsonModel.setProperty("/RowCount3", oData.results.length);

					that.getView().getModel("InputsModel").setProperty("/Inputs/formMatter", oData.results[0].Pspid);
					that.getView().getModel("InputsModel").setProperty("/Inputs/formLeadPartner", oData.results[0].Sname);
					that.getView().getModel("InputsModel").setProperty("/Inputs/formBillingOffice", oData.results[0].Werks);
				
				
				
					var Otable = that.getView().byId("WipDetailsSet");
					Otable.setModel(that.jsonModel);
					Otable.bindRows("/modelData");
					var OtableSmart0 = that.getView().byId("smartTable_ResponsiveTable0");

					var oPersButton = OtableSmart0._oTablePersonalisationButton;
					oPersButton.attachPress(function() {

						var oPersController = OtableSmart0._oPersController;
						var oPersDialog = oPersController._oDialog;

						oPersDialog.attachOk(function(oEvent) {

							setTimeout(function() {

								that.jsonModel.setProperty("/modelData", that.getModel("InputsModel").getProperty("/Inputs/homeTable"));
								var Otablenew = that.getView().byId("WipDetailsSet");
								Otablenew.bindRows("/modelData");
							}, 1000);

						});

					});

				})
				.fail(function() {

				});
		

			this.getView().byId("Narrative").setVisible(true);
			this.getView().byId("LineItemEdits").setVisible(true);
			this.getView().byId("LineItemTransfers").setVisible(true);

			this.getView().byId("comboPosition").setVisible(false);
			this.getView().byId("Home").setVisible(true);
			this.getView().byId("NarrativeEditsVBox").setVisible(false);
			this.getView().byId("LineItemEditsVbox").setVisible(false);
			this.getView().byId("LineItemTransfersVbox").setVisible(false);
			var homeScope = this.getView().byId("Home");
			var narScope = this.getView().byId("NarrativeEditsVBox");
			var lineItemEditScope = this.getView().byId("LineItemEditsVbox");
			var lineItemTransferScope = this.getView().byId("LineItemTransfersVbox");
			InputFields.setProperty("/Inputs/homeScope", homeScope);
			InputFields.setProperty("/Inputs/narrativeScope", narScope);
			InputFields.setProperty("/Inputs/lineItemEditsScope", lineItemEditScope);
			InputFields.setProperty("/Inputs/lineItemTransfersScope", lineItemTransferScope);
			InputFields.setProperty("/Inputs/isChanged", false);

		},

		listSorting: function(oEvent) {

			var InputsModel = this.getView().getModel("InputsModel");

			var masterItems = InputsModel.getProperty("/Inputs/masterItems");

			if (masterItems.length > 0) {
				var reversedMasteredItems = masterItems.reverse();
				InputsModel.setProperty("/Inputs/masterItems", reversedMasteredItems);

			

			}
		},

		handleDelete: function(oEvent) {

			
			var oList = oEvent.getSource(),
				oItem = oEvent.getParameter("listItem");
			var oTitle = oEvent.getParameter("listItem").getTitle();

			var InputFields = this.getView().getModel("InputsModel");
			var oMatter = InputFields.getProperty("/Inputs/formMatter");

			if (oTitle === oMatter) {
				this.jsonModel.setProperty("/modelData", "");
				this.jsonModel.setProperty("/RowCount", "0");

				this.getView().getModel("InputsModel").setProperty("/Inputs/formMatter", "");
				this.getView().getModel("InputsModel").setProperty("/Inputs/formLeadPartner", "");
				this.getView().getModel("InputsModel").setProperty("/Inputs/formBillingOffice", "");
				this.getView().byId("Home").setVisible(true);
				this.getView().byId("Narrative").setVisible(false);
				this.getView().byId("LineItemEdits").setVisible(false);
				this.getView().byId("LineItemTransfers").setVisible(false);
				this.getView().byId("NarrativeEditsVBox").setVisible(false);
				this.getView().byId("LineItemEditsVbox").setVisible(false);
				this.getView().byId("LineItemTransfersVbox").setVisible(false);
			}
			oList.removeItem(oItem);

		},

	
		closeDialog: function() {
		
			var Otable1 = this.getModel("InputsModel").getProperty("/Inputs/scope");
			
			var tableId = 	Otable1.getId().substring(12);

			var InputFields = this.getModel("InputsModel");
			var homeScope = InputFields.getProperty("/Inputs/homeScope");
			var narScope = InputFields.getProperty("/Inputs/narrativeScope");
			var lineItemEditScope = InputFields.getProperty("/Inputs/lineItemEditsScope");
			var lineItemTransferScope = InputFields.getProperty("/Inputs/lineItemTransfersScope");
			if (tableId === "WipDetailsSet") {
				this.getView().byId("comboPosition").setVisible(false);
				homeScope.setVisible(true);
				narScope.setVisible(false);
				lineItemEditScope.setVisible(false);
				lineItemTransferScope.setVisible(false);
				InputFields.setProperty("/Inputs/Toolbar/NarrativeReviewed", false);
				InputFields.setProperty("/Inputs/Toolbar/NarrativeUnreview", false);
				InputFields.setProperty("/Inputs/Toolbar/LineItemReviewed", false);
				InputFields.setProperty("/Inputs/Toolbar/LineItemUnreview", false);
				InputFields.setProperty("/Inputs/Toolbar/NarrativeSave", false);
				InputFields.setProperty("/Inputs/Toolbar/LineItemEditSave", false);
				InputFields.setProperty("/Inputs/Toolbar/LineItemTransferSave", false);
				InputFields.setProperty("/Inputs/Toolbar/Save_Layout", false);
				InputFields.setProperty("/Inputs/Toolbar/Modify_Reverse", false);
				InputFields.setProperty("/Inputs/Toolbar/Consolidate", false);
				InputFields.setProperty("/Inputs/Toolbar/LineItemUpdatecodes", false);
				InputFields.setProperty("/Inputs/Toolbar/LineItemTransferUpdatecodes", false);
				InputFields.setProperty("/Inputs/Toolbar/GlobalSpellCheck", false);
				InputFields.setProperty("/Inputs/Toolbar/Mass_Transfer", false);
				InputFields.setProperty("/Inputs/Toolbar/Split_Transfer", false);
				InputFields.setProperty("/Inputs/Toolbar/Replace_Words", false);
			} else if (tableId === "WipDetailsSet1") {
				this.byId("comboPosition").setVisible(true);
				homeScope.setVisible(false);
				narScope.setVisible(true);
				lineItemEditScope.setVisible(false);
				lineItemTransferScope.setVisible(false);
				InputFields.setProperty("/Inputs/Toolbar/NarrativeReviewed", true);
				InputFields.setProperty("/Inputs/Toolbar/NarrativeUnreview", true);
				InputFields.setProperty("/Inputs/Toolbar/LineItemReviewed", false);
				InputFields.setProperty("/Inputs/Toolbar/LineItemUnreview", false);
				InputFields.setProperty("/Inputs/Toolbar/NarrativeSave", true);
				InputFields.setProperty("/Inputs/Toolbar/LineItemEditSave", false);
				InputFields.setProperty("/Inputs/Toolbar/LineItemTransferSave", false);
				InputFields.setProperty("/Inputs/Toolbar/Save_Layout", false);
				InputFields.setProperty("/Inputs/Toolbar/Modify_Reverse", false);
				InputFields.setProperty("/Inputs/Toolbar/Consolidate", false);
				InputFields.setProperty("/Inputs/Toolbar/LineItemUpdatecodes", false);
				InputFields.setProperty("/Inputs/Toolbar/LineItemTransferUpdatecodes", false);
				InputFields.setProperty("/Inputs/Toolbar/GlobalSpellCheck", true);
				InputFields.setProperty("/Inputs/Toolbar/Mass_Transfer", false);
				InputFields.setProperty("/Inputs/Toolbar/Split_Transfer", false);
				InputFields.setProperty("/Inputs/Toolbar/Replace_Words", true);

				

				InputFields.setProperty("/Inputs/ToolbarEnable/NarrativeReviewed", false);
				InputFields.setProperty("/Inputs/ToolbarEnable/NarrativeUnreview", false);
				InputFields.setProperty("/Inputs/ToolbarEnable/Replace_Words", false);
				InputFields.setProperty("/Inputs/ToolbarEnable/NarrativeSave", true);

			} else if (tableId === "WipDetailsSet2") {
				this.getView().byId("comboPosition").setVisible(false);
				homeScope.setVisible(false);
				narScope.setVisible(false);
				lineItemEditScope.setVisible(true);
				lineItemTransferScope.setVisible(false);
				InputFields.setProperty("/Inputs/Toolbar/NarrativeReviewed", false);
				InputFields.setProperty("/Inputs/Toolbar/NarrativeUnreview", false);
				InputFields.setProperty("/Inputs/Toolbar/LineItemReviewed", true);
				InputFields.setProperty("/Inputs/Toolbar/LineItemUnreview", true);
				InputFields.setProperty("/Inputs/Toolbar/NarrativeSave", false);
				InputFields.setProperty("/Inputs/Toolbar/LineItemEditSave", true);
				InputFields.setProperty("/Inputs/Toolbar/LineItemTransferSave", false);
				InputFields.setProperty("/Inputs/Toolbar/Save_Layout", false);
				InputFields.setProperty("/Inputs/Toolbar/Modify_Reverse", true);
				InputFields.setProperty("/Inputs/Toolbar/Consolidate", false);
				InputFields.setProperty("/Inputs/Toolbar/LineItemUpdatecodes", true);
				InputFields.setProperty("/Inputs/Toolbar/LineItemTransferUpdatecodes", false);
				InputFields.setProperty("/Inputs/Toolbar/GlobalSpellCheck", false);
				InputFields.setProperty("/Inputs/Toolbar/Mass_Transfer", false);
				InputFields.setProperty("/Inputs/Toolbar/Split_Transfer", false);
				InputFields.setProperty("/Inputs/Toolbar/Replace_Words", false);

			

				InputFields.setProperty("/Inputs/ToolbarEnable/LineItemReviewed", false);
				InputFields.setProperty("/Inputs/ToolbarEnable/LineItemUnreview", false);
				InputFields.setProperty("/Inputs/ToolbarEnable/LineItemUpdatecodes", false);
				InputFields.setProperty("/Inputs/ToolbarEnable/Modify_Reverse", false);
				InputFields.setProperty("/Inputs/ToolbarEnable/LineItemEditSave", true);
			} else {
				this.getView().byId("comboPosition").setVisible(false);
				homeScope.setVisible(false);
				narScope.setVisible(false);
				lineItemEditScope.setVisible(false);
				lineItemTransferScope.setVisible(true);
				InputFields.setProperty("/Inputs/Toolbar/NarrativeReviewed", false);
				InputFields.setProperty("/Inputs/Toolbar/NarrativeUnreview", false);
				InputFields.setProperty("/Inputs/Toolbar/LineItemReviewed", false);
				InputFields.setProperty("/Inputs/Toolbar/LineItemUnreview", false);
				InputFields.setProperty("/Inputs/Toolbar/NarrativeSave", false);
				InputFields.setProperty("/Inputs/Toolbar/LineItemEditSave", false);
				InputFields.setProperty("/Inputs/Toolbar/LineItemTransferSave", true);
				InputFields.setProperty("/Inputs/Toolbar/Save_Layout", false);
				InputFields.setProperty("/Inputs/Toolbar/Modify_Reverse", false);
				InputFields.setProperty("/Inputs/Toolbar/Consolidate", true);
				InputFields.setProperty("/Inputs/Toolbar/LineItemUpdatecodes", false);
				InputFields.setProperty("/Inputs/Toolbar/LineItemTransferUpdatecodes", true);
				InputFields.setProperty("/Inputs/Toolbar/GlobalSpellCheck", false);
				InputFields.setProperty("/Inputs/Toolbar/Mass_Transfer", true);
				InputFields.setProperty("/Inputs/Toolbar/Split_Transfer", true);
				InputFields.setProperty("/Inputs/Toolbar/Replace_Words", false);

				InputFields.setProperty("/Inputs/ToolbarEnable/Consolidate", false);
				InputFields.setProperty("/Inputs/ToolbarEnable/Mass_Transfer", false);
				InputFields.setProperty("/Inputs/ToolbarEnable/LineItemTransferUpdatecodes", false);
				InputFields.setProperty("/Inputs/ToolbarEnable/Split_Transfer", false);
				InputFields.setProperty("/Inputs/ToolbarEnable/LineItemTransferSave", true);
			}
			this._Dialog.close();
		
		},
	
		createColumnConfig: function(tableId) {

			var i18nLabel = this.getView().getModel("i18n").getResourceBundle();

			var iTotalCols = tableId.getColumns();
			var arr = [];
			var dateFields = ["Bldat", "Budat", "Cpudt"];
			for (var colE = 0; colE < iTotalCols.length; colE++) {

				var obj = {
					label: i18nLabel.getText(iTotalCols[colE].mProperties.sortProperty),
					property: iTotalCols[colE].mProperties.sortProperty,
					width: iTotalCols[colE].mProperties.width
				};
				if (dateFields.includes(iTotalCols[colE].mProperties.sortProperty)) {
					obj.format = "MM/dd/YYY";
					obj.type = "date";
					obj.textAlign = 'begin';
				}
				arr.push(obj);
				if (colE === iTotalCols.length - 1) {
					return arr;
				}
			}

		},

		Export: function(Event) {
			

		
			var tableId = Event.getSource().getParent().getParent().getTable();

			var aCols, oSettings, oExcelDate, oDateFormat, oExcelFileName, oExportData;
			aCols = this.createColumnConfig(tableId);

			oExportData = this.getView().getModel("InputsModel").getProperty("/Inputs/homeTable");

			oDateFormat = DateFormat.getDateInstance({
				pattern: "MM-dd-YYYY"
			});
			oExcelDate = oDateFormat.format(new Date());
			oExcelFileName = "WipEditor" + oExcelDate + ".xlsx";
			oSettings = {
				workbook: {
					columns: aCols
				},
				dataSource: oExportData,
				fileName: oExcelFileName
			};
			var oSpreadsheet = new sap.ui.export.Spreadsheet(oSettings);
			oSpreadsheet.onprogress = function(iValue) {
				jQuery.sap.log.debug("Export: %" + iValue + " completed");
			};
			oSpreadsheet.build()
				.then(function() {
					jQuery.sap.log.debug("Export is finished");
				})
				.catch(function(sMessage) {
					jQuery.sap.log.error("Export error: " + sMessage);
				});
		},

		onSort: function(oEvent) {
			
			oEvent.preventDefault();
			var InputsModel = this.getView().getModel("InputsModel");
			var tableItems = this.jsonModel.getProperty("/modelData");
			var sortProperty = oEvent.getParameter("column").getProperty("sortProperty");

			var sortOrder = oEvent.getParameter("sortOrder");

			var sortedData = tableItems.sort(function(a, b) {
				if (sortProperty === "Budat") {
				
					return new Date(a.Budat) - new Date(b.Budat);
				} else {

					var x = a[sortProperty].toLowerCase();
					var y = b[sortProperty].toLowerCase();
					if (x < y) {
						return -1;
					}
					if (x > y) {
						return 1;
					}
					return 0;
				}

			});
			if (sortOrder == "Descending") {
				sortedData = sortedData.reverse();
			}

			this.jsonModel.setProperty("/modelData", sortedData);

			oEvent.getSource().getParent().getTable().setModel(that.jsonModel);

		},

		getModel: function(sName) {
			return this.getView().getModel(sName);
		},

	
		setModel: function(oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

	
		getResourceBundle: function() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

	
		onShareEmailPress: function() {
			var oViewModel = (this.getModel("objectView") || this.getModel("worklistView"));
			sap.m.URLHelper.triggerEmail(
				null,
				oViewModel.getProperty("/shareSendEmailSubject"),
				oViewModel.getProperty("/shareSendEmailMessage")
			);
		}

	});

});