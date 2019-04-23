sap.ui.define([
	"zprs/wipeditor/controller/BaseController",
	"sap/ui/model/Filter",
		"sap/ui/model/json/JSONModel",
	"zprs/wipeditor/model/ReportModel",
	"sap/ui/model/FilterOperator",
		"zprs/wipeditor/services/LineItemsServices",
	"zprs/wipeditor/model/formatter",
		"sap/ui/core/format/DateFormat",
		

], function(BaseController, Filter,JSONModel, ReportModel, FilterOperator, LineItemsServices,formatter,DateFormat) {
	"use strict";

	return BaseController.extend("zprs.wipeditor.controller.Home", {
		formatter: formatter,
		onInit: function(oEvent) {
			
				this.jsonModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.jsonModel, "JSONModel");
			this.getView().setModel(new ReportModel().getModel(), "InputsModel");
			this.onHide();
				this.bus = sap.ui.getCore().getEventBus();

			this.bus.subscribe("homeChannel", "toSummaryEdit", this.homeData, this);

		},
	
		homeData: function(homeChannel, toSummaryEdit, data) {
			
				var InputFields = this.getModel("InputsModel");
			var results = InputFields.getProperty("/Inputs/homeTable");
			this.jsonModel.setProperty("/modelData", results);
			var Otable = this.getView().byId("WipDetailsSet");
			Otable.setModel(this.jsonModel);
			this.jsonModel.setProperty("/RowCount", results.length);
			if(!data.button){
			Otable.bindRows("/modelData");
		}
			
				 this.byId("searchText").setValue("");
				 
			var tableLineEdits = this.getView().byId("WipDetailsSet");

			var index = this.getModel("InputsModel").getProperty("/Inputs/rowLineCount");
			for (var i = 0; i < index.length; i++) {
				tableLineEdits.getRows()[index[i]].getCells()[0].setVisible(false);
				tableLineEdits.getRows()[index[i]].getCells()[1].setVisible(true);

			}
			var change = InputFields.getProperty("/Inputs/isChanged");

			if (change === true && data.button===undefined) {

				this._Dialog = sap.ui.xmlfragment("zprs.wipeditor.Fragments.Fragment", this);
				this._Dialog.open();
			} else  {
				if(data.button ===undefined){
				
				this.ReloadTable();
				}

			}
			
		
				
		},
	
		
			filter: function(oEvent) {

			

			oEvent.preventDefault();

			var value = oEvent.getParameters().value;

			var oFilter4 = new sap.ui.model.Filter(oEvent.getParameters().column.getFilterProperty(), sap.ui.model.FilterOperator.Contains,	value);

			this.byId("WipDetailsSet").getBinding("rows").filter(oFilter4, "Application");

		},


	
	
		  Reload: function(oEvent) {
				
			
			var table = this.getView().byId("WipDetailsSet");
 
			var InputFields = this.getModel("InputsModel");
		
			var change = InputFields.getProperty("/Inputs/isChanged");
			
				if (change === true) {
					               
				this._Dialog = sap.ui.xmlfragment("zprs.wipeditor.Fragments.Fragment", this);
				this._Dialog.open();
			} else {
				this.ReloadTable();

			}

		
		},

		ReloadTable:function(){
			
				var aFilter = [];
			
			var that = this;
				this.byId("searchText").setValue("");
				var InputFields = this.getModel("InputsModel");
			
				var Pspid =InputFields.getProperty("/Inputs/rootPspid");

			
			var odatefrom = InputFields.getProperty("/Inputs/odatefrom");
			var odateto =InputFields.getProperty("/Inputs/odateto");
			aFilter.push(new Filter("Pspid", sap.ui.model.FilterOperator.EQ, Pspid));
			aFilter.push(new Filter("Budat", sap.ui.model.FilterOperator.BT, odatefrom, odateto));
		
			var oModel = this.getOwnerComponent().getModel();
				sap.ui.core.BusyIndicator.show(0);
			LineItemsServices.getInstance().selectListItem(oModel, aFilter)
				.done(function(oData) {
					
					sap.ui.core.BusyIndicator.hide(0);

			
					
				
					that.jsonModel.setProperty("/modelData", oData.results);
						 that.data(oData.results);
				
				
				
				
					that.getView().byId("WipDetailsSet").setModel(that.jsonModel);
						that.getView().byId("WipDetailsSet").bindRows("/modelData");


				})
				.fail(function() {
					

				});
					
					InputFields.setProperty("/Inputs/isChanged",false);
					if (this._Dialog) {

				this._Dialog.close();

			}
		},

		
		onHide: function() {
			var oSplit = this.getView().byId("SplitApp");
			oSplit.setMode(sap.m.SplitAppMode.HideMode);
			this.getView().byId("hide").setVisible(false);
			this.getView().byId("show").setVisible(true);
		},
		onHide1: function() {
			var oSplit = this.getView().byId("SplitApp");
			oSplit.setMode(sap.m.SplitAppMode.StretchCompressMode);
			this.getView().byId("show").setVisible(false);
			this.getView().byId("hide").setVisible(true);
		},
		onGlobalSearch:function(){
			
			
				var searchValue = this.byId("searchText").getValue();



				

				var result = [];

				this.getModel("InputsModel").getProperty("/Inputs/homeTable").forEach(
					function(value, index) {

					var date = value.Budat;

						var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
							pattern: "dd.MM.yyyy"
						});
						var dateFormatted = dateFormat.format(date).toString();


						var myJSON = JSON.stringify(jQuery.extend({}, value));
						var obj1 = myJSON + dateFormatted;

						if (obj1.toLowerCase().includes(searchValue.toLowerCase())) {
							result.push(value);
						}
						
					

					}
				);

				

				var otable = this.byId("WipDetailsSet");


				this.jsonModel.setData({
					modelData: result
				});
				otable.setModel(this.jsonModel);

				otable.bindRows("/modelData");
				this.jsonModel.setProperty("/RowCount", result.length);

			
			
			
		},
		
				onNarrativePress: function(oEvent) {
			
			this.getModel("InputsModel").setProperty("/Inputs/saveObjects", []);
			this.getModel("InputsModel").setProperty("/Inputs/indexes", []);

			this.getView().byId("Home").setVisible(false);
			this.getView().byId("comboPosition").setVisible(true);
			this.getView().byId("NarrativeEditsVBox").setVisible(true);
			this.getView().byId("LineItemEditsVbox").setVisible(false);
			this.getView().byId("LineItemTransfersVbox").setVisible(false);
			var InputFields = this.getModel("InputsModel");
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

			this.bus = sap.ui.getCore().getEventBus();
			this.bus.publish("homeChannelNarrative", "toSummaryEditNarrative", {
				parNarrative: "narrativeEdit"
			});
			

		},
		onHomePress: function() {
			
			this.getModel("InputsModel").setProperty("/Inputs/saveObjects", []);
			this.getModel("InputsModel").setProperty("/Inputs/indexes", []);
			this.getView().byId("comboPosition").setVisible(false);
			this.getView().byId("Home").setVisible(true);
			this.getView().byId("NarrativeEditsVBox").setVisible(false);
			this.getView().byId("LineItemEditsVbox").setVisible(false);
			this.getView().byId("LineItemTransfersVbox").setVisible(false);

			this.bus = sap.ui.getCore().getEventBus();
			this.bus.publish("homeChannel", "toSummaryEdit", {
				parHome: "home"
			});
		
		},
		onLineItemEditsPress: function() {
			
			this.getModel("InputsModel").setProperty("/Inputs/saveObjects", []);
			this.getModel("InputsModel").setProperty("/Inputs/indexes", []);
			this.getView().byId("comboPosition").setVisible(false);
			this.getView().byId("Home").setVisible(false);
			this.getView().byId("NarrativeEditsVBox").setVisible(false);
			this.getView().byId("LineItemEditsVbox").setVisible(true);
			this.getView().byId("LineItemTransfersVbox").setVisible(false);
			var InputFields = this.getModel("InputsModel");
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
			this.bus = sap.ui.getCore().getEventBus();
			this.bus.publish("homeChannelLineItemEdits", "toSummaryEditLineItem", {
				parLineItem: "lineItemEdit"
			});
		
		},
		onLineItemTransfersPress: function() {
			
			
			this.getModel("InputsModel").setProperty("/Inputs/saveObjects", []);
			this.getModel("InputsModel").setProperty("/Inputs/indexes", []);
			this.getView().byId("comboPosition").setVisible(false);
			this.getView().byId("Home").setVisible(false);
			this.getView().byId("NarrativeEditsVBox").setVisible(false);
			this.getView().byId("LineItemEditsVbox").setVisible(false);
			this.getView().byId("LineItemTransfersVbox").setVisible(true);
			var InputFields = this.getModel("InputsModel");
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
			this.bus = sap.ui.getCore().getEventBus();
			this.bus.publish("homeChannelLineItemTransfer", "toSummaryEditLineItemTransfer", {
				parLineItemTransfer: "lineItemTransfer"
			});
		
		},
		NarrativeFunction:function(oControlEvent){
			
			
			
				this.bus = sap.ui.getCore().getEventBus();
			this.bus.publish("homeChannelNarrative", "toSummaryEditNarrative", {
				parNarrative: "narrativeEdit",
				button: oControlEvent.getSource().getText()
			});
		},
		LineItemEditsFuntion:function(oControlEvent){
				
					this.bus = sap.ui.getCore().getEventBus();
			this.bus.publish("homeChannelLineItemEdits", "toSummaryEditLineItem", {
				parLineItem: "lineItemEdit",
					button: oControlEvent.getSource().getText()
			});
		
		
		},
		LineItemTransferfunction:function(oControlEvent){
			this.bus = sap.ui.getCore().getEventBus();
			this.bus.publish("homeChannelLineItemTransfer", "toSummaryEditLineItemTransfer", {
				parLineItemTransfer: "lineItemTransfer",
					button: oControlEvent.getSource().getText()
			});
		}

		

	
			

	});

});