sap.ui.define([
	"wip/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"wip/model/formatter",
	"sap/ui/core/routing/History",
	"sap/ui/model/Filter",
	"wip/model/ReportModel",
	"sap/ui/model/FilterOperator",
	"wip/services/LineItemsServices"

], function(BaseController, JSONModel, formatter, History, Filter, ReportModel, FilterOperator, LineItemsServices) {
	"use strict";

	return BaseController.extend("wip.controller.Report", {
		formatter: formatter,
		
		onInit: function(oEvent) {
			debugger;
			
			
			this.homeArr = [];
			this.narrativeEditsArr = [];
			this.lineItemEditsArr = [];
			this.lineItemTransfers = [];

			this.arr = [];
			this.rowData = [];
			this.aFilter = [];
			this._oGlobalFilter = [];
			this.jsonModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.jsonModel, "JSONModel");
			this.getView().setModel(new ReportModel().getModel(), "InputsModel");

		},

	
		onPress: function(oEvent) {
			debugger;
			var a = [];
			var otable = [];
			var aFilter = [];
			var Pspid = oEvent.getSource().getProperty("title");
			var odatefrom = this.getView().byId("SmartFilterBar").getControlByKey("Budat").getFrom();
			var odateto = this.getView().byId("SmartFilterBar").getControlByKey("Budat").getTo();
			aFilter.push(new Filter("Pspid", FilterOperator.EQ, Pspid));
			aFilter.push(new Filter("Budat", sap.ui.model.FilterOperator.BT, odatefrom, odateto));
			var oModel = this.getOwnerComponent().getModel();
			var that = this;

			oModel.read("/WipDetailsSet", {
				filters: aFilter,
				success: function(oData) {
					that.rowData = oData;
					debugger;
					
					that.homeArr = oData.results;
					that.arr = oData.results;
					that.jsonModel.setProperty("/modelData", oData.results);
					that.jsonModel.setProperty("/Matter", oData.results[0].Pspid);
					that.jsonModel.setProperty("/LeadPartner", oData.results[1].Sname);
					that.jsonModel.setProperty("/BillingOffice", oData.results[0].Werks);

				}
			});

			var InputFields = this.getView().getModel("InputsModel");
			var filters = InputFields.getProperty("/Inputs/Filters/filters");
			for (var i = 1; i <= filters.length; i++) {
				var table = InputFields.getProperty("/Inputs/Filters/Filter" + i + "/table");
				otable.push(table);

			}
			InputFields.setProperty("/Inputs/rootPspid", Pspid);

			for (var j = 0; j < otable.length; j++) {
				var tableId = otable[j];
				this.byId(tableId).rebindTable();
			}
			InputFields.setProperty("/Inputs/IconTabs/Narrative_Edits", true);
			InputFields.setProperty("/Inputs/IconTabs/Line_Item_Edits", true);
			InputFields.setProperty("/Inputs/IconTabs/Line_Item_Transfers", true);

		},

		onBeforeRebindTable: function(oEvent) {

			var oBindingParams = oEvent.getParameter("bindingParams");

			var InputFields = this.getView().getModel("InputsModel");

			var Matter = InputFields.getProperty("/Inputs/rootPspid");
			oBindingParams.filters.push(
				new Filter("Pspid", FilterOperator.EQ, Matter));

		},
		
		listSorting: function(oEvent) {

			var InputsModel = this.getView().getModel("InputsModel");

			var masterItems = InputsModel.getProperty("/Inputs/masterItems");

			if (masterItems.length > 0) {
				var reversedMasteredItems = masterItems.reverse();
				InputsModel.setProperty("/Inputs/masterItems", reversedMasteredItems);
			}
		},
		
		Review: function(){
		var otable=this.getView().byId("WipDetailsSet1");
				$.each(otable.getSelectedIndices(), function(i, o) {
				var selContext = otable.getContextByIndex(o);
				selContext.getModel().setProperty(selContext.getPath() + "/ReviewComplete", "X");
				var obj = selContext.getObject();
				obj.ReviewComplete = "X";
			
			
				});
	},
			Unreview: function(){
		var otable=this.getView().byId("WipDetailsSet1");
				$.each(otable.getSelectedIndices(), function(i, o) {
				var selContext = otable.getContextByIndex(o);
				selContext.getModel().setProperty(selContext.getPath() + "/ReviewComplete", "");
				var obj = selContext.getObject();
				obj.ReviewComplete = "";
			
			
				});
	},
		
		
		capitalizeFirstLetter: function(string) {

			return string.charAt(0).toUpperCase() + string.slice(1);

		},
	capitalization: function() {
			var data = [];
			var res = [];
			var NarStr;

			data = this.arr;
			var that = this;

			var endChars = [".", "?", "!", "\"", "'"];

			res = $.each(data, function(item) {
				NarStr = that.capitalizeFirstLetter(that.arr[item].NarrativeString);
				if (NarStr !== "") {
					var lastChar = NarStr.charAt(NarStr.length - 1);
					if (endChars.indexOf(lastChar.slice(-1)) === -1) {
						NarStr = NarStr + ".";
						that.arr[item].NarrativeString = NarStr;
					}
					return that.arr[item].NarrativeString;
				}

			});

			this.jsonModel.setProperty("/modelData", res);

			var Otable = this.getView().byId("WipDetailsSet1");

			this.getView().setModel(this.jsonModel);
			Otable.bindRows("/modelData");
		},
		
			removeSpaces: function(oEvt) {
			var data = [];
			var result;
			data = this.arr;
			var that = this;
			var res = [];
			res = $.each(data, function(item) {
				result = that.arr[item].NarrativeString.replace(/\s+/g, "").trim();
				that.arr[item].NarrativeString = result;

				return that.arr[item].NarrativeString;
			});
			this.jsonModel.setProperty("/modelData", res);
			var Otable = this.getView().byId("WipDetailsSet1");
			// this.jsonModel.setData(res);
			this.getView().setModel(this.jsonModel);
			Otable.bindRows("/modelData");

		},
		
		
			globalSearch: function(oEvent) {

			debugger;

			var searchValue = this.byId("searchText").getValue();

			var iconTabKey = this.byId("idIconTabBar").getSelectedKey();

			if (iconTabKey === "Home") {

					debugger;

					var result=[];

					this.homeArr.forEach(
						function(value,index){
							

							  var myJSON = JSON.stringify( jQuery.extend({},value));
				             var obj1 = myJSON;
				        
				             
				             if(obj1.toLowerCase().includes(searchValue.toLowerCase()))
				             {
				              	result.push(value);
				             }

						}
						);
						
						  // this.clearTabledata("smartTable_ResponsiveTable0");   
						  
					//	 this.byId("smartTable_ResponsiveTable1").rebindTable();
						 
				
				
		






			        	var otable =	this.byId("WipDetailsSet0");
			        	debugger;

						this.jsonModel.setData({
							modelData: result
						});
						otable.setModel(this.jsonModel);

						otable.bindRows("/modelData");
						
				
						// otable.setModel(this.jsonModel);

						//  otable.setBindingContext("/modelData");
						
						//this.byId("smartTable_ResponsiveTable0").getBinding("columns").refresh(true);
						//	this.byId("smartTable_ResponsiveTable0").getModel().refresh(true);
						//		this.byId("smartTable_ResponsiveTable0").getModel().updateBindings();

				//	this.byId("smartTable_ResponsiveTable0").rebindTable();
			} 
			else if (iconTabKey === "NarrativeEdits") {
					this.byId("smartTable_ResponsiveTable1").rebindTable();
			} 
			else if (iconTabKey === "LineItemEdits") {
					this.byId("smartTable_ResponsiveTable2").rebindTable();
			} 
			else
			{
					this.byId("smartTable_ResponsiveTable3").rebindTable();
			}
			
				this.jsonModel.setProperty("/Matter", this.matter);
				this.jsonModel.setProperty("/LeadPartner", this.leadpartner);
			    this.jsonModel.setProperty("/BillingOffice", this.billingpartner);

		},
            
            
          Reload: function() {
		//	var table = this.byId("WipDetailsSet1");

		// 	for(var i=0;i<table.getRows().length;i++){
		// 		if(this.rowData.results[i].NarrativeString===table.getRows()[i].getCells()[5].getValue()) {
		// 			this.ReloadTable();
			
		// 		} 
		// 	else {
		// 			this._Dialog = sap.ui.xmlfragment("wip.view.Fragment",this);
  //              this._Dialog.open();
               
		// 		}
		// }
		debugger;
		var model1 = JSON.parse(this.jsonModel.getJSON())["modelData"];
		var model2 = this.homeArr;
		if(model1 === model2)
		{
		alert("zfzsafdzsa");
		
			this._Dialog = sap.ui.xmlfragment("wip.view.Fragment",this);
                this._Dialog.open();
		}
	   
		},
		closeDialog:function(){
			 this._Dialog.close();
		},
		ReloadTable:function(){
		var oTable = [];
			var InputFields = this.getView().getModel("InputsModel");
			var filters = InputFields.getProperty("/Inputs/Filters/filters");
			for (var i = 1; i <= filters.length; i++) {
				var table = this.getView().getModel("InputsModel").getProperty("/Inputs/Filters/Filter" + i + "/table");
				oTable.push(table);
			}
			for (var j = 0; j < oTable.length; j++) {
				var tableID = oTable[j];
				this.getView().byId(tableID).getModel().refresh(true);
			}
			this._Dialog.close();
		},  
            
            
		onDataReceived0: function(oEvent) {
debugger;
			this.homeArr = oEvent.getParameters().getParameter('data')['results'];

		},
		onDataReceived1: function(oEvent) {

			this.narrativeEditsArr = oEvent.getParameters().getParameter('data')['results'];

		},
		onDataReceived2: function(oEvent) {

			this.lineItemEditsArr = oEvent.getParameters().getParameter('data')['results'];

		},
		onDataReceived3: function(oEvent) {

			this.lineItemTransfers = oEvent.getParameters().getParameter('data')['results'];

		},

		
		
		
		NarrativeEditsSelection: function(oEvent) {

			debugger;
			var InputFields = this.getView().getModel("InputsModel");
			var rowCount = this.byId("WipDetailsSet1").getSelectedIndices();

			if (rowCount.length) {

				InputFields.setProperty("/Inputs/ToolbarEnable/Reviewed", true);
				InputFields.setProperty("/Inputs/ToolbarEnable/Unreview", true);
				InputFields.setProperty("/Inputs/ToolbarEnable/Replace_Words", true);

			} else {

				InputFields.setProperty("/Inputs/ToolbarEnable/Reviewed", false);
				InputFields.setProperty("/Inputs/ToolbarEnable/Unreview", false);
				InputFields.setProperty("/Inputs/ToolbarEnable/Replace_Words", false);
			}

		},

		LineItemEditsSelection: function() {

			var InputFields = this.getView().getModel("InputsModel");
			var rowCount = this.byId("WipDetailsSet2").getSelectedIndices();

			if (rowCount.length === 1) {

				InputFields.setProperty("/Inputs/ToolbarEnable/Reviewed", true);
				InputFields.setProperty("/Inputs/ToolbarEnable/Unreview", true);
				InputFields.setProperty("/Inputs/ToolbarEnable/Updatecodes", true);
				InputFields.setProperty("/Inputs/ToolbarEnable/Modify_Reverse", true);

			} else if (rowCount.length > 1) {
				InputFields.setProperty("/Inputs/ToolbarEnable/Reviewed", true);
				InputFields.setProperty("/Inputs/ToolbarEnable/Unreview", true);
				InputFields.setProperty("/Inputs/ToolbarEnable/Updatecodes", true);
				InputFields.setProperty("/Inputs/ToolbarEnable/Modify_Reverse", false);
			} else {

				InputFields.setProperty("/Inputs/ToolbarEnable/Reviewed", false);
				InputFields.setProperty("/Inputs/ToolbarEnable/Unreview", false);
				InputFields.setProperty("/Inputs/ToolbarEnable/Updatecodes", false);
				InputFields.setProperty("/Inputs/ToolbarEnable/Modify_Reverse", false);

			}

		},
		LineItemTransferSelection: function(oEvent) {
			debugger;
			var InputFields = this.getView().getModel("InputsModel");
			var rowCount = this.byId("WipDetailsSet3").getSelectedIndices();
			this.byId("ToMatter3");

			// Need to update Updatecodes Logic based on control filed selection in th table columns

			if (rowCount.length === 1) {

				InputFields.setProperty("/Inputs/ToolbarEnable/Consolidate", false);
				InputFields.setProperty("/Inputs/ToolbarEnable/Mass_Transfer", true);
				InputFields.setProperty("/Inputs/ToolbarEnable/Updatecodes", false);
				InputFields.setProperty("/Inputs/ToolbarEnable/Split_Transfer", true);

			} else if (rowCount.length > 1) {

				InputFields.setProperty("/Inputs/ToolbarEnable/Consolidate", true);
				InputFields.setProperty("/Inputs/ToolbarEnable/Mass_Transfer", true);
				InputFields.setProperty("/Inputs/ToolbarEnable/Updatecodes", false);
				InputFields.setProperty("/Inputs/ToolbarEnable/Split_Transfer", false);
			} else {

				InputFields.setProperty("/Inputs/ToolbarEnable/Consolidate", false);
				InputFields.setProperty("/Inputs/ToolbarEnable/Mass_Transfer", false);
				InputFields.setProperty("/Inputs/ToolbarEnable/Updatecodes", false);
				InputFields.setProperty("/Inputs/ToolbarEnable/Split_Transfer", false);

			}

		},

		handleIconTabBarSelect: function(oEvent) {
			debugger;
			var InputFields = this.getView().getModel("InputsModel");
			var change = oEvent.getSource();

			var value = change.getSelectedKey();

			if (value === "NarrativeEdits") {

				//Visible property set
				InputFields.setProperty("/Inputs/Toolbar/Reviewed", true);
				InputFields.setProperty("/Inputs/Toolbar/Unreview", true);
				InputFields.setProperty("/Inputs/Toolbar/Save", true);
				InputFields.setProperty("/Inputs/Toolbar/Save_Layout", false);
				InputFields.setProperty("/Inputs/Toolbar/Modify_Reverse", false);
				InputFields.setProperty("/Inputs/Toolbar/Consolidate", false);
				InputFields.setProperty("/Inputs/Toolbar/Updatecodes", false);
				InputFields.setProperty("/Inputs/Toolbar/GlobalSpellCheck", true);
				InputFields.setProperty("/Inputs/Toolbar/Mass_Transfer", false);
				InputFields.setProperty("/Inputs/Toolbar/Split_Transfer", false);
				InputFields.setProperty("/Inputs/Toolbar/Replace_Words", true);

				//Enable Property set 

				InputFields.setProperty("/Inputs/ToolbarEnable/Reviewed", false);
				InputFields.setProperty("/Inputs/ToolbarEnable/Unreview", false);
				InputFields.setProperty("/Inputs/ToolbarEnable/Replace_Words", false);

			} else if (value === "LineItemEdits") {

				//Visible property set
				InputFields.setProperty("/Inputs/Toolbar/Reviewed", true);
				InputFields.setProperty("/Inputs/Toolbar/Unreview", true);
				InputFields.setProperty("/Inputs/Toolbar/Save", true);
				InputFields.setProperty("/Inputs/Toolbar/Save_Layout", true);
				InputFields.setProperty("/Inputs/Toolbar/Modify_Reverse", true);
				InputFields.setProperty("/Inputs/Toolbar/Consolidate", false);
				InputFields.setProperty("/Inputs/Toolbar/Updatecodes", true);
				InputFields.setProperty("/Inputs/Toolbar/GlobalSpellCheck", false);
				InputFields.setProperty("/Inputs/Toolbar/Mass_Transfer", false);
				InputFields.setProperty("/Inputs/Toolbar/Split_Transfer", false);
				InputFields.setProperty("/Inputs/Toolbar/Replace_Words", false);

				//Enable Property set 

				InputFields.setProperty("/Inputs/ToolbarEnable/Reviewed", false);
				InputFields.setProperty("/Inputs/ToolbarEnable/Unreview", false);
				InputFields.setProperty("/Inputs/ToolbarEnable/Updatecodes", false);
				InputFields.setProperty("/Inputs/ToolbarEnable/Modify_Reverse", false);
				this.data(this.rowData);

			} else if (value === "LineItemTransfers") {

				//Visible property set
				InputFields.setProperty("/Inputs/Toolbar/Reviewed", false);
				InputFields.setProperty("/Inputs/Toolbar/Unreview", false);
				InputFields.setProperty("/Inputs/Toolbar/Save", true);
				InputFields.setProperty("/Inputs/Toolbar/Save_Layout", true);
				InputFields.setProperty("/Inputs/Toolbar/Modify_Reverse", false);
				InputFields.setProperty("/Inputs/Toolbar/Consolidate", true);
				InputFields.setProperty("/Inputs/Toolbar/Updatecodes", true);
				InputFields.setProperty("/Inputs/Toolbar/GlobalSpellCheck", false);
				InputFields.setProperty("/Inputs/Toolbar/Mass_Transfer", true);
				InputFields.setProperty("/Inputs/Toolbar/Split_Transfer", true);
				InputFields.setProperty("/Inputs/Toolbar/Replace_Words", false);

				//Enable Property set 

				InputFields.setProperty("/Inputs/ToolbarEnable/Consolidate", false);
				InputFields.setProperty("/Inputs/ToolbarEnable/Mass_Transfer", false);
				InputFields.setProperty("/Inputs/ToolbarEnable/Updatecodes", false);
				InputFields.setProperty("/Inputs/ToolbarEnable/Split_Transfer", false);
			} else {
				//Visible property set
				InputFields.setProperty("/Inputs/Toolbar/Reviewed", false);
				InputFields.setProperty("/Inputs/Toolbar/Unreview", false);
				InputFields.setProperty("/Inputs/Toolbar/Save", false);
				InputFields.setProperty("/Inputs/Toolbar/Save_Layout", true);
				InputFields.setProperty("/Inputs/Toolbar/Modify_Reverse", false);
				InputFields.setProperty("/Inputs/Toolbar/Consolidate", false);
				InputFields.setProperty("/Inputs/Toolbar/Updatecodes", false);
				InputFields.setProperty("/Inputs/Toolbar/GlobalSpellCheck", false);
				InputFields.setProperty("/Inputs/Toolbar/Mass_Transfer", false);
				InputFields.setProperty("/Inputs/Toolbar/Split_Transfer", false);
				InputFields.setProperty("/Inputs/Toolbar/Replace_Words", false);

				//Enable Property set 

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

		gotoPress: function(oEvent) {
			debugger;
			//sap.ui.core.BusyIndicator.show(0);
			var value = this.getView().byId("SmartFilterBar").getControlByKey("Pspid").getTokens().length;
			var aFilter = [];
			if (value >= 1) {
				var InputFields = this.getView().getModel("InputsModel");
				InputFields.setProperty("/Inputs/hideFilterBar", false);
			}
			var oModel = this.getOwnerComponent().getModel();
			oModel.refresh(true);

			var object = this.getView().byId("SmartFilterBar").getControlByKey("Pspid").getTokens();
			var odatefrom = this.getView().byId("SmartFilterBar").getControlByKey("Budat").getFrom();
			var odateto = this.getView().byId("SmartFilterBar").getControlByKey("Budat").getTo();
			var that = this;
			$.each(object, function(j, token) {
				if (object) {
					aFilter.push(new Filter("Pspid", "EQ", token.getText()));
				}
				if (odatefrom) {
					aFilter.push(new Filter("Budat", sap.ui.model.FilterOperator.BT, odatefrom, odateto));
				}

				oModel.read("/WipMattersSet", {
					filters: aFilter,
					success: function(oData) {

						that.arr = oData.results;

						var InputFields = that.getView().getModel("InputsModel");

						InputFields.setProperty("/Inputs/masterItems", oData.results);

					}
				});

			});

		},

		handlePress1: function() {
			this.getView().byId("toggle2").setVisible(true);
			this.getView().byId("toggle1").setVisible(false);
		},
		handlePress2: function() {
			this.getView().byId("toggle2").setVisible(false);
			this.getView().byId("toggle1").setVisible(true);
		},
		// Reload: function() {
		// 	var oTable = [];
		// 	var InputFields = this.getView().getModel("InputsModel");
		// 	var filters = InputFields.getProperty("/Inputs/Filters/filters");
		// 	for (var i = 1; i <= filters.length; i++) {
		// 		var table = this.getView().getModel("InputsModel").getProperty("/Inputs/Filters/Filter" + i + "/table");
		// 		oTable.push(table);
		// 	}
		// 	for (var j = 0; j < oTable.length; j++) {
		// 		var tableID = oTable[j];
		// 		this.getView().byId(tableID).getModel().refresh();
		// 	}

		// },
		handleDelete: function(oEvent) {
			debugger;
			var otable = [];
			var oList = oEvent.getSource(),
				oItem = oEvent.getParameter("listItem");
			var oTitle = oEvent.getParameter("listItem").getTitle();
			var oMatter = this.jsonModel.getProperty("/Matter");
			var InputFields = this.getView().getModel("InputsModel");
			var filters = InputFields.getProperty("/Inputs/Filters/filters");
			//var oModel = this.getOwnerComponent().getModel();
			var that = this;
			if (oTitle === oMatter) {

				this.jsonModel.setProperty("/Matter", "");
				this.jsonModel.setProperty("/LeadPartner", "");
				this.jsonModel.setProperty("/BillingOffice", "");

				for (var i = 1; i <= filters.length; i++) {
					var table = InputFields.getProperty("/Inputs/Filters/Filter" + i + "/table");
					otable.push(table);

				}
				InputFields.setProperty("/Inputs/rootPspid", "");

				for (var j = 0; j < otable.length; j++) {
					var tableId = otable[j];
					this.byId(tableId).rebindTable();

				}
			}
			oList.removeItem(oItem);
		},
		onBack: function() {
			var sPreviousHash = History.getInstance().getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {

				this.getOwnerComponent().getRouter().navTo("woklist", null, true);
			}
		},
		data: function(odata) {
			debugger;
			this.WipEditModel = this.getModel("InputsModel");
			this.serviceInstance = LineItemsServices.getInstance();
			this.getLineItemsData(odata['results']);
		},
		getLineItemsData: function(Rowdata) {
			debugger;
			var Pspid = Rowdata[0].Pspid;
			//this.showBusyIndicator();
			var that = this;
			$.when(that.serviceInstance.getPhaseCodes(that.WipEditModel, Pspid, that),
			that.serviceInstance.getTaskcodes(that.WipEditModel, "", that),
			that.serviceInstance.getActivitycodes(that.WipEditModel, Rowdata, Pspid, that),
			that.serviceInstance.getFFtaskcodes(that.WipEditModel, Rowdata, Pspid, that),
			that.serviceInstance.getFFActivitycodes(that.WipEditModel, "" , Pspid , that))
					
					
				.done(function(phaseCodes, taskCodes) {

				});
		}

	});

});