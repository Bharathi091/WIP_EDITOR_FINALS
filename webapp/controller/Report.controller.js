sap.ui.define([
	"wip/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"wip/model/formatter",
	"sap/ui/core/routing/History",
	"sap/ui/model/Filter",
	"wip/model/ReportModel",
	"sap/ui/model/FilterOperator",
	"wip/services/LineItemsServices",
	"sap/m/MessageBox"

], function(BaseController, JSONModel, formatter, History, Filter, ReportModel, FilterOperator, LineItemsServices, MessageBox) {
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
			this.byId("idIconTabBar").setSelectedKey("Home");
			oModel.read("/WipDetailsSet", {
				filters: aFilter,
				success: function(oData) {
				
					debugger;

					that.homeArr = oData.results;
					that.arr = oData.results;
					that.jsonModel.setProperty("/modelData", oData.results);
					that.jsonModel.setProperty("/Matter", oData.results[0].Pspid);
					that.jsonModel.setProperty("/LeadPartner", oData.results[1].Sname);
					that.jsonModel.setProperty("/BillingOffice", oData.results[0].Werks);
					
						that.homeArr.forEach(function(o, k) {
						that.rowData[k] = o;
					     });

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

		Review: function(oModel) {
			var oTable = [];
			var InputFields = this.getView().getModel("InputsModel");
			var filters = InputFields.getProperty("/Inputs/Filters/filters");
			for (var i = 1; i <= filters.length; i++) {
				var table = this.getView().getModel("InputsModel").getProperty("/Inputs/Filters/Filter" + i + "/uitbale");

				var otable = this.byId(table);

				$.each(otable.getSelectedIndices(), function(i, o) {
					var selContext = otable.getContextByIndex(o);
					selContext.getModel().setProperty(selContext.getPath() + "/ReviewComplete", "X");
					var obj = selContext.getObject();
					obj.ReviewComplete = "X";

					oTable.push(obj);

				});

			}
			this.makeBatchCalls(oTable, oModel);
		},
		Unreview: function(oModel) {

			var oTable = [];

			var InputFields = this.getView().getModel("InputsModel");
			var filters = InputFields.getProperty("/Inputs/Filters/filters");
			for (var i = 1; i <= filters.length; i++) {
				var table = this.getView().getModel("InputsModel").getProperty("/Inputs/Filters/Filter" + i + "/uitbale");

				var otable = this.byId(table);

				$.each(otable.getSelectedIndices(), function(i, o) {
					var selContext = otable.getContextByIndex(o);
					selContext.getModel().setProperty(selContext.getPath() + "/ReviewComplete", "");
					var obj = selContext.getObject();
					obj.ReviewComplete = "";

					oTable.push(obj);

				});
			}
			this.makeBatchCalls(oTable, oModel);
		},
		makeBatchCalls: function(oList, oModel1) {

			debugger;

			var oComponent = this.getOwnerComponent(),
				// getting component and model from it
				oFModel = oComponent.getModel(),
				// tData consists oList
				tData = $.extend(true, [], oList),
				tbl = this.getView().byId("WipDetailsSet1"),
				urlParams,
				ReviewArray = [],
				WorkDateArray = [],
				TimekeeperArray = [],
				TimekeepernameArray = [],
				WorkingofficeArray = [],
				NarrativeArray = [],
				CoNumber = [],
				Buzei = [];

			// pushing the column values in the respected arrays using their keys
			$.each(tData, function(i, o) {
				ReviewArray.push(o.ReviewComplete);
				WorkDateArray.push(o.Budat);
				TimekeeperArray.push(o.Sname);
				TimekeepernameArray.push(o.Pernr);
				WorkingofficeArray.push(o.Werks);
				NarrativeArray.push(o.NarrativeString);
				CoNumber.push(o.Belnr);
				Buzei.push(o.Buzei);

			});

			// passing them(arrays) to the keys which are given in urlParams
			urlParams = {

				CoNumber: CoNumber,
				Buzei: Buzei,
				ReviewStatus: ReviewArray

			};

			var that = this;
			var jsonModel = that.getView().getModel("JSONModel");
			// by using callFunction we pass urlParams to the table to save the data
			oFModel.callFunction("/WIPREVIEW", {
				method: "GET",
				urlParameters: urlParams,

				success: function(oData) {
					sap.ui.core.BusyIndicator.hide();

					var res = oData.results;
					var msgTxt = res[0].message;
					MessageBox.show(
						msgTxt, {
							icon: sap.m.MessageBox.Icon.SUCCESS,
							title: "Save",
							actions: [sap.m.MessageBox.Action.OK]
						}
					);
					that.hideShow();
					// binding the results back to the jsonModel
					jsonModel.setProperty("/modelData", oData.results);

				}
			});
		},

		capitalizeFirstLetter: function(string) {

			return string.charAt(0).toUpperCase() + string.slice(1);

		},
		capitalization: function() {
			debugger;
			var data = [];
			var res = [];
			var Otable = this.getView().byId("WipDetailsSet1");
			//this.jsonModel.setProperty("/modelData", this.rowData );
			var NarStr;

			data = this.rowData;
			var that = this;

			var endChars = [".", "?", "!", "\"", "'"];

			res = $.each(data, function(item) {
				NarStr = that.capitalizeFirstLetter(data[item].NarrativeString);
				if (NarStr !== "") {
					var lastChar = NarStr.charAt(NarStr.length - 1);
					if (endChars.indexOf(lastChar.slice(-1)) === -1) {
						NarStr = NarStr + ".";
						data[item].NarrativeString = NarStr;
					}
					return data[item].NarrativeString;
				}

			});

			this.jsonModel.setProperty("/modelData", res);

		

			this.getView().setModel(this.jsonModel);
			Otable.bindRows("/modelData");
		},

		removeSpaces: function(oEvt) {
			var data = [];
			var result;
			data = this.rowData;
			var that = this;
			var res = [];
			res = $.each(data, function(item) {
				result = data[item].NarrativeString.replace(/\s+/g, " ").trim();
				data[item].NarrativeString = result;

				return data[item].NarrativeString;
			});
			this.jsonModel.setProperty("/modelData", res);
			var Otable = this.getView().byId("WipDetailsSet1");
			// this.jsonModel.setData(res);
			this.getView().setModel(this.jsonModel);
			Otable.bindRows("/modelData");

		},

		onGlobalSearch: function(oEvent) {

			debugger;

			var searchValue = this.byId("searchText").getValue();

			var iconTabKey = this.byId("idIconTabBar").getSelectedKey();

			if (iconTabKey === "Home") {

				debugger;

				var result = [];

				this.homeArr.forEach(
					function(value, index) {

						var myJSON = JSON.stringify(jQuery.extend({}, value));
						var obj1 = myJSON;

						if (obj1.toLowerCase().includes(searchValue.toLowerCase())) {
							result.push(value);
						}

					}
				);

				// this.clearTabledata("smartTable_ResponsiveTable0");   

				//	 this.byId("smartTable_ResponsiveTable1").rebindTable();

				var otable = this.byId("WipDetailsSet");
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
			} else if (iconTabKey === "NarrativeEdits") {

				var result1 = [];

				this.homeArr.forEach(
					function(value, index) {

						var myJSON = JSON.stringify(jQuery.extend({}, value));
						var obj1 = myJSON;

						if (obj1.toLowerCase().includes(searchValue.toLowerCase())) {
							result1.push(value);
						}

					}
				);

				var otable1 = this.byId("WipDetailsSet1");
				debugger;

				this.jsonModel.setData({
					modelData: result1
				});
				otable1.setModel(this.jsonModel);

				otable1.bindRows("/modelData");

			} else if (iconTabKey === "LineItemEdits") {

				var result2 = [];

				this.homeArr.forEach(
					function(value, index) {

						var myJSON = JSON.stringify(jQuery.extend({}, value));
						var obj1 = myJSON;

						if (obj1.toLowerCase().includes(searchValue.toLowerCase())) {
							result2.push(value);
						}

					}
				);

				var otable2 = this.byId("WipDetailsSet2");
				debugger;

				this.jsonModel.setData({
					modelData: result2
				});
				otable2.setModel(this.jsonModel);

				otable2.bindRows("/modelData");

			} else {

				var result3 = [];

				this.homeArr.forEach(
					function(value, index) {

						var myJSON = JSON.stringify(jQuery.extend({}, value));
						var obj1 = myJSON;

						if (obj1.toLowerCase().includes(searchValue.toLowerCase())) {
							result3.push(value);
						}

					}
				);

				var otable3 = this.byId("WipDetailsSet3");
				debugger;

				this.jsonModel.setData({
					modelData: result3
				});
				otable3.setModel(this.jsonModel);

				otable3.bindRows("/modelData");

			}

			this.jsonModel.setProperty("/Matter", this.matter);
			this.jsonModel.setProperty("/LeadPartner", this.leadpartner);
			this.jsonModel.setProperty("/BillingOffice", this.billingpartner);

		},

		Reload: function(oEvent) {
		debugger;
			
			var row = this.rowData;
			var model1 = JSON.stringify(this.homeArr);
			var model2 = JSON.stringify(row);

			if (model1 === model2) {
				this.ReloadTable();
			} else {
				this._Dialog = sap.ui.xmlfragment("wip.view.Fragment", this);
				this._Dialog.open();
			}
			// var oTable = this.getView().byId("WipDetailsSet1");
			// var row = oTable.getBinding("rows").oModel.oData;
			var that = this;
				this.homeArr.forEach(function(o, j) {
						that.rowData[j] = o;
					});
					

		},
		
		changeNarrative: function(oEvent) {
            
            debugger;
            
			var changedRow = oEvent.getSource().getBindingContext();
			// changedRow.getModel().setProperty(changedRow.getPath() + "/NarrativeString", oEvent.getParameters().value);
			var obj = changedRow.getObject();
			obj.NarrativeString = oEvent.getParameters().value;
			var idx = oEvent.getSource().getParent();
			var index = oEvent.getSource().getParent().getParent().indexOfRow(idx);
			var that = this;
			this.homeArr.forEach(function(o, i) {
				that.rowData[i] = o;
			});
			this.rowData[index] = obj;
		},
		
		closeDialog: function() {
			this._Dialog.close();
		},
		ReloadTable: function() {
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

			this.byId("searchText").setValue("");

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
		//replace
		onReplacewords: function(evt) {
		var oTable = this.getView().byId("smartTable_ResponsiveTable1").getTable();
			if (oTable.getSelectedIndices().length === 0) {
				debugger;
				MessageBox.show(
					"Select atleast one item!", {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "Replace",
						actions: [sap.m.MessageBox.Action.OK]
					}
				);
				return;
			} else {
				var odialog = this._getreplaceDialogbox();
				odialog.open();
			}
		},
		_getreplaceDialogbox: function() {
			if (!this._oreplaceDialog) {
				this._oreplaceDialog = sap.ui.xmlfragment("replaceword", "wip.view.popup", this);
				this.getView().addDependent(this._oreplaceDialog);
			}
			return this._oreplaceDialog;
		},
		closereplaceDialog: function() {
			this._oreplaceDialog.close();
		},
		onreplace: function() {
			debugger;
			var oTable = this.getView().byId("smartTable_ResponsiveTable1").getTable();
			// console.log(oTable.getRows());
			var oTable1 = sap.ui.core.Fragment.byId("replaceword", "bottomTable0");
			var index = oTable1.getItems().length;
			console.log(index);

			var that = this;
			$.each(oTable.getSelectedIndices(), function(i, o) {

				var ctx = oTable.getContextByIndex(o);
				var m = ctx.getObject();
				var str = m.NarrativeString;
				var items = oTable1.getItems();
				$.each(items, function(l, obj) {
					var cells = obj.getCells();
					// var string = sap.ui.getCore().byId("replaceword--string" + j).getValue();
					// var replacewith = sap.ui.getCore().byId("replaceword--replace" + j).getValue();
					var string = cells[0].getValue();
					var replacewith = cells[1].getValue();
					var searchindex = str.search(string);
					if (searchindex >= 0) 
				    {
				    	
						var res = str.replace(string, replacewith);
						that.replaceItems = that.jsonModel.getProperty("/modelData");
						that.replaceItems[o].NarrativeString = res;
						// console.log(that.replaceItems);
						str = that.replaceItems[o].NarrativeString;
	
					}

				});
				that.jsonModel.setProperty("/modelData", that.replaceItems);
				that.getView().setModel(that.jsonModel);
				oTable.bindRows("/modelData");

			});
			sap.ui.getCore().byId("replaceword--string0").setValue("");
			sap.ui.getCore().byId("replaceword--replace0").setValue("");
			var tbl = sap.ui.core.Fragment.byId("replaceword", "bottomTable0");
			$.each(tbl.getItems(), function(d, o) {
				if (d > 0) {
					var rowid = o.getId();
					tbl.removeItem(rowid);
				}
			});
			this._getreplaceDialogbox().close();
		},
		replaceall: function() {
			var oTable = this.getView().byId("smartTable_ResponsiveTable1").getTable();
			var oTable1 = sap.ui.core.Fragment.byId("replaceword", "bottomTable0");
			var replaceItems = this.jsonModel.getProperty("/modelData");
			var that = this;
			var result = $.each(replaceItems, function(i, o) {

				var m = o;
				var str = m.NarrativeString;
				var items = oTable1.getItems();
				$.each(items, function(l, obj) {
					var cells = obj.getCells();
					var string = cells[0].getValue();
					var replacewith = cells[1].getValue();
					var searchindex = str.search(string);
					if (searchindex >= 0) {
						var res = str.replace(string, replacewith);
						that.replace = that.jsonModel.getProperty("/modelData");
						that.replace[i].NarrativeString = res;
						str = that.replace[i].NarrativeString;
					}
				});
				return that.replace;

			});

			this.jsonModel.setProperty("/modelData", result);
			this.getView().setModel(this.jsonModel);
			oTable.bindRows("/modelData");
			sap.ui.getCore().byId("replaceword--string0").setValue("");
			sap.ui.getCore().byId("replaceword--replace0").setValue("");
			var tbl = sap.ui.core.Fragment.byId("replaceword", "bottomTable0");
			$.each(tbl.getItems(), function(d, o) {
				if (d > 0) {
					var rowid = o.getId();
					tbl.removeItem(rowid);
				}
			});
			this._getreplaceDialogbox().close();
		},
		addbuttonToReplace: function(evt) {

			var oTable = sap.ui.core.Fragment.byId("replaceword", "bottomTable0");
			var col = [new sap.m.Input({
					width: "100%",
					name: "string[]"

				}),
				new sap.m.Input({

					width: "100%",
					name: "replace[]"
				}),
				new sap.m.CheckBox({

					selected: true,
					name: "default[]"
				}),
				new sap.m.CheckBox({

					selected: true,
					name: "word[]"
				}),
				new sap.m.Button({
					text: "delete",
					press: function(oEvent) {
						var tbl = sap.ui.core.Fragment.byId("replaceword", "bottomTable0");
						var src = oEvent.getSource().getParent();
						var rowid = src.getId();
						tbl.removeItem(rowid);

					}
				})

			];
			oTable.addItem(new sap.m.ColumnListItem({
				cells: col
			}));

		},
		onmasstransfer: function() {

			var odialog = this._getDialogmass();
			odialog.open();
			var oTable = this.getView().byId("WipDetailsSet3");
			var ofrag = sap.ui.core.Fragment.byId("masstransfer", "masstransfertable");
			$.each(oTable.getSelectedIndices(), function(i, o) {

				var tableContext = oTable.getContextByIndex(o);
				var obj = tableContext.getObject();
				var itemno = obj.Buzei;
				var docno = obj.Belnr;
				ofrag.addItem(new sap.m.ColumnListItem({
					cells: [new sap.m.Text({
							width: "100%",
							text: docno
						}),
						new sap.m.Text({
							width: "100%",
							text: itemno
						}),
						new sap.m.Button({
							text: "delete",
							press: function(oEvent) {
								var tbl = sap.ui.core.Fragment.byId("masstransfer", "masstransfertable");
								var src = oEvent.getSource().getParent();
								var rowid = src.getId();
								tbl.removeItem(rowid);
							}
						})

					]
				}));
			});
		},
		_getDialogmass: function() {
			if (!this._omassDialog) {
				this._omassDialog = sap.ui.xmlfragment("masstransfer", "wip.view.masstransfer", this);
				this.getView().addDependent(this._omassDialog);
			}
			return this._omassDialog;
		},
		closemassDialog: function() {
			this._omassDialog.close();
		},
		onmassTransfer: function() {

			var matter = sap.ui.core.Fragment.byId("masstransfer", "masspspid").getValue();
			var percent = sap.ui.core.Fragment.byId("masstransfer", "percentage").getValue();

			var oTable = this.getView().byId("WipDetailsSet3");
			var that = this;
			$.each(oTable.getSelectedIndices(), function(i, o) {
				that.masstransfer = that.jsonModel.getProperty("/modelData");
				that.masstransfer[o].ToMatter = matter;
				that.masstransfer[o].Percent = percent;
				// that.masstransfer[o]. = matter;

			});
			this.jsonModel.setProperty("/modelData", that.masstransfer);
			this.getView().setModel(this.jsonModel);
			oTable.bindRows("/modelData");
			sap.ui.core.Fragment.byId("masstransfer", "masspspid").setValue("");
			sap.ui.core.Fragment.byId("masstransfer", "percentage").setValue("100");
			var tbl = sap.ui.core.Fragment.byId("masstransfer", "masstransfertable");
			$.each(tbl.getItems(), function(i, o) {
				var rowid = o.getId();
				tbl.removeItem(rowid);

			});
			this._omassDialog.close();
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

			$.when(
				that.serviceInstance.getPhaseCodes(that.WipEditModel, Pspid, that),
				that.serviceInstance.getTaskcodes(that.WipEditModel, "", that),
				that.serviceInstance.getActivitycodes(that.WipEditModel, Rowdata, Pspid, that),
				that.serviceInstance.getFFtaskcodes(that.WipEditModel, Rowdata, Pspid, that),
				that.serviceInstance.getFFActivitycodes(that.WipEditModel, "", Pspid, that))

			.done(function(phaseCodes, taskCodes, activityCodes, ffTskCodes, ffActCodes) {
				debugger;
				phaseCodes.results.unshift("");
				activityCodes.results.unshift("");
				ffTskCodes.results.unshift("");
				for (var i = 0; i < Rowdata.length; i++) {
					that.jsonModel.setProperty("/modelData/" + i + "/phaseCodes", phaseCodes.results);
					that.jsonModel.setProperty("/modelData/" + i + "/taskCodes", taskCodes.results);
					that.jsonModel.setProperty("/modelData/" + i + "/activityCodes", activityCodes.results);
					that.jsonModel.setProperty("/modelData/" + i + "/ffTskCodes", ffTskCodes.results);
					that.jsonModel.setProperty("/modelData/" + i + "/ffTskCodes", ffActCodes.results);
				}

			});
			var Otable = this.getView().byId("WipDetailsSet2");

			Otable.setModel(this.jsonModel);
			Otable.bindRows("/modelData");
		},
		phaseCodesChange: function(oEvent) {
		debugger;
			var item = oEvent.getSource().getParent();
			var idx = oEvent.getSource().getParent().getParent().indexOfRow(item);
			var thisRow = oEvent.getSource().getParent().getParent().getContextByIndex(idx).getObject();

			var phaseCodeSelected = oEvent.getSource().getSelectedItem().getKey();
			var InputFields = this.getView().getModel("InputsModel");

			// var pspid = this.BillEditModel.getProperty("/LineItemEdits/0/Pspid");
			var pspid = InputFields.getProperty("/Inputs/rootPspid");
			sap.ui.core.BusyIndicator.show(0);
			var that = this;

			$.when(that.serviceInstance.getTaskcodes(that.WipEditModel, phaseCodeSelected, that),
				that.serviceInstance.getActivitycodes(that.WipEditModel, thisRow, pspid, that),
				that.serviceInstance.getFFtaskcodes(that.WipEditModel, thisRow, pspid, that))

			.done(function(taskCodes, activityCodes, ffTskCodes, ffActCodes) {
				debugger;
				sap.ui.core.BusyIndicator.hide(0);

				taskCodes.results.unshift("");
				activityCodes.results.unshift("");
				ffTskCodes.results.unshift("");
				if (idx !== "") {

					that.jsonModel.setProperty("/modelData/" + idx + "/taskCodes", taskCodes.results);
					that.jsonModel.setProperty("/modelData/" + idx + "/activityCodes", activityCodes.results);
					that.jsonModel.setProperty("/modelData/" + idx + "/ffTskCodes", ffTskCodes.results);
					that.jsonModel.setProperty("/modelData/" + idx + "/ffTskCodes", ffActCodes.results);

				}

			});
		},
		
			fftaskCodeChange: function(oEvent) {
			debugger;
			var item = oEvent.getSource().getParent();
			var idx = oEvent.getSource().getParent().getParent().indexOfRow(item);
			var thisRow = oEvent.getSource().getParent().getParent().getContextByIndex(idx).getObject();

			var ffTaskcodeselected = oEvent.getSource().getSelectedItem().getKey();
			var InputFields = this.getView().getModel("InputsModel");

			// var pspid = this.BillEditModel.getProperty("/LineItemEdits/0/Pspid");
			var pspid = InputFields.getProperty("/Inputs/rootPspid");
			sap.ui.core.BusyIndicator.show(0);
			var that = this;

			$.when(
				that.serviceInstance.getFFActivitycodes(that.WipEditModel, ffTaskcodeselected, pspid, that)
			)

			.done(function(ffActCodes) {
				debugger;
				sap.ui.core.BusyIndicator.hide(0);

				ffActCodes.results.unshift("");
				//that.jsonModel.setProperty("/ffActCodes", ffActCodes.results);
				if (that.rowData.results.length > 0) {

					var isTask = that.jsonModel.getProperty("/modelData/" + idx + "/ToZzfftskcd");
					that.jsonModel.setProperty("/modelData/" + idx + "/ffActCodes", isTask.length ? [{
						FfActivityCodeDesc: isTask,
						FfActivityCodeSetDesc: ""
					}].concat(ffActCodes.results) : ffActCodes.results);

				} else {
					that.showAlert("Wip Edit", "No Data Found");
				}

			});

		},
		onModifyReverse: function(evt) {

			var oTable = this.getView().byId("smartTable_ResponsiveTable2").getTable();

			var oBinding = oTable.getBinding("rows");
			var len = oBinding.getLength();

			this.selectedIndex = oTable.getSelectedIndex();
			this.ctx = oTable.getContextByIndex(this.selectedIndex);
			this.m = this.ctx.getObject();
			var belnr = this.m.Belnr;
			var HQ = this.m.Megbtr;
			this.jsonModel.setProperty("/Belnr", belnr);
			this.jsonModel.setProperty("/Megbtr", HQ);

			this._getModifyDialog().open();

		},
		_getModifyDialog: function() {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("modifyReverse", "wip.view.modifyreverse", this);
				this.getView().addDependent(this._oDialog);
			}

			return this._oDialog;
		},
		closeModifyDialog: function() {
			sap.ui.core.Fragment.byId("modifyReverse", "newHours").setValue("");
			this._getModifyDialog().close();
		},
		ModifyReverseSave: function(oModel) {
			var res = [];
			var ChangedTableData = [];
			this.Action = "MODIFY";
			this.newHours = sap.ui.core.Fragment.byId("modifyReverse", "newHours").getValue();
			this.jsonModel.setProperty("/Megbtr", this.newHours);
			this.jsonModel.setProperty("/Megbtr", sap.ui.core.Fragment.byId("modifyReverse", "newHours").getValue());
			var modrevData = this.jsonModel["oData"]["modelData"];
			// var modrevBelnr = this.m.Belnr;
			// var that = this;
			// 	res = $.each(modrevData, function(item,object) {

			// 	if(object.Belnr === modrevBelnr){

			// 		object.Megbtr = that.newHours;
			// 		this.obj = object;
			// 	}
			// 	return this.obj;
			// });

			//ChangedTableData = res[this.selectedIndex];
			var ChangedTableDat = modrevData[this.selectedIndex];
			ChangedTableDat.Megbtr = this.newHours;
			ChangedTableDat.Action = this.Action;
			ChangedTableData.push(ChangedTableDat);
			//this.saveNewRecords1(ChangedTableData, oModel);
			//this.makeBatchCalls(finalArray, oModel);
			this.makeBatchCallsModify(ChangedTableData, oModel);
			sap.ui.core.Fragment.byId("modifyReverse", "newHours").setValue("");
			this._getModifyDialog().close();

		},
		makeBatchCallsModify: function(oList, oModel1) {
			// oList contains selected no. of rows in creditMemo
			debugger;
			sap.ui.core.BusyIndicator.show();
			this.Action = "MODIFY";
			var oComponent = this.getOwnerComponent(),
				// getting component and model from it
				oFModel = oComponent.getModel(),

				// tData consists oList
				tData = $.extend(true, [], oList),
				tbl = this.getView().byId("WipDetailsSet2"),
				urlParams,
				Action = [],
				CoNumber = [],
				Hours = [],
				Percentage = [],
				ToActivityCode = [],
				ToFfActivityCode = [],
				ToFfTaskCode = [],
				ToMatter = [],
				ToTaskCode = [],
				Buzei = [],
				ToPhaseCode = [];

			$.each(tData, function(i, o) {
				Action.push(o.Action);
				CoNumber.push(o.Belnr);
				Hours.push(o.Megbtr);
				Percentage.push(o.Percentage);
				ToActivityCode.push(o.ToActivityCode);
				ToFfActivityCode.push(o.ToFfActivityCode);
				ToFfTaskCode.push(o.ToFfTaskCode);
				ToMatter.push(o.ToMatter);
				ToTaskCode.push(o.ToTaskCode);
				Buzei.push(o.Buzei);
				ToPhaseCode.push(o.ToPhaseCode);
			});

			// passing them(arrays) to the keys which are given in urlParams
			urlParams = {

				Action: Action,
				CoNumber: CoNumber,
				Hours: Hours,
				Percentage: Percentage,
				ToActivityCode: ToActivityCode,
				ToFfActivityCode: ToFfActivityCode,
				ToFfTaskCode: ToFfTaskCode,
				ToMatter: ToMatter,
				ToTaskCode: ToTaskCode,
				Buzei: Buzei,
				ToPhaseCode: ToPhaseCode

			};

			var that = this;
			var jsonModel = that.getView().getModel("JSONModel");
			// by using callFunction we pass urlParams to the table to save the data
			oFModel.callFunction("/WIPTRANSFER", {
				method: "GET",
				urlParameters: urlParams,

				success: function(oData) {
					sap.ui.core.BusyIndicator.hide();
					// var results = oData.results;
					// var msgTxt = "Modify/Reverse Request has been saved.";
					// var batchResp = oData.__batchResponses["0"].__changeResponses["0"],
					// resp = batchResp.oData;
					// that._oResponse(resp);
					var res = oData.results;
					var msgTxt = res[0].Message;
					MessageBox.show(
						msgTxt, {
							icon: sap.m.MessageBox.Icon.SUCCESS,
							title: "Save",
							actions: [sap.m.MessageBox.Action.OK]
						}
					);
					that.hideShow();
					// binding the results back to the jsonModel
					jsonModel.setProperty("/modelData", oData.results);

				}
			});
		},
	
		onSplitRow: function() {
			var oTable = this.getView().byId("smartTable_ResponsiveTable3").getTable();
			this._getSplitDialog().open();
			var idx = oTable.getSelectedIndex();
			var ctx = oTable.getContextByIndex(idx);
			var obj = ctx.getObject();
			var matter = obj.Pspid;
			var quantity = obj.Megbtr;
			this.docno = obj.Belnr;
			this.jsonModel.setProperty("/matter", matter);
			this.jsonModel.setProperty("/quantity", quantity);
			this.jsonModel.setProperty("/docno", this.docno);

		},
		_getSplitDialog: function() {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("splitTransfer", "wip.view.splittransfer", this);
				this.getView().addDependent(this._oDialog);
			}
			return this._oDialog;
		},
		closeSplitDialog: function() {
			this._getSplitDialog().close();
			var oTable = sap.ui.core.Fragment.byId("splitTransfer", "splitTable2");
			$.each(oTable.getItems(), function(i, o) {
				if (i === 0) {
					sap.ui.core.Fragment.byId("splitTransfer", "matter").setValue("");
					sap.ui.core.Fragment.byId("splitTransfer", "hours").setValue("");
				} else {
					var rowid = o.getId();
					oTable.removeItem(rowid);
				}
			});
		},
		onAdd: function() {
			var cols = [];
			var oTable = sap.ui.core.Fragment.byId("splitTransfer", "splitTable2");
			var cells = oTable.getItems()[0].getCells();
			var cell1 = cells[0].getValue();
			var cell2 = cells[1].getSelectedKey();
			var cell3 = cells[2].getSelectedKey();
			var cell4 = cells[3].getSelectedKey();
			var cell5 = cells[4].getSelectedKey();
			var cell6 = cells[5].getSelectedKey();
			var cell7 = cells[6].getValue();
			var cell8 = cells[7].getValue();
			sap.ui.core.Fragment.byId("splitTransfer", "matter").setValue("");
			sap.ui.core.Fragment.byId("splitTransfer", "hours").setValue("");
			var col = [new sap.m.Input({
					width: "100%",
					name: "ToMatter[]",
					value: cell1,
					key: "Pspid"

				}),
				new sap.m.Input({

					width: "100%",
					name: "phasecode[]",
					value: cell2,
					key: "Zzphase"
				}),
				new sap.m.Input({

					width: "100%",
					name: "taskcode[]",
					value: cell3,
					key: "ToZztskcd"
				}),
				new sap.m.Input({

					width: "100%",
					name: "activitycode[]",
					value: cell4,
					key: "ToZzactcd"
				}),
				new sap.m.Input({

					width: "100%",
					name: "fftaskcode[]",
					value: cell5,
					key: "ToZzfftskcd"
				}),
				new sap.m.Input({

					width: "100%",
					name: "ffactcode[]",
					value: cell6,
					key: "ToZzffactcd"
				}),

				new sap.m.Input({
					placeholder: "Quantity",
					width: "100%",
					name: "hours-quantity[]",
					value: cell7,
					key: "Megbtr"
				}),
				new sap.m.Input({
					placeholder: "%",
					width: "100%",
					name: "percentage[]",
					value: cell8,
					key: "Percent"
				}),
				new sap.ui.core.Icon({
					src: "sap-icon://delete",
					press: function(oEvt) {
						var src = oEvt.getSource().getParent();
						var rowid = src.getParent().indexOfItem(src);
						src.getParent().removeItem(rowid);

					}
				}),
				new sap.ui.core.Icon({
					src: "sap-icon://alert",
					// useIconTooltip: true,
					visible: false,
					color: "green"
				   // tooltip: this.msgTxt

				})
			];
			oTable.addItem(new sap.m.ColumnListItem({
				cells: col
			}));

		},
		onTransfer: function(oModel) {
			this.cols = [];
			this.colsval = [];
			var oTable = sap.ui.core.Fragment.byId("splitTransfer", "splitTable2");
			var rows = oTable.getItems();
			if (rows.length === 1) {
				MessageBox.alert("Please add Matters to Split Transfer.");
			} else {
				for (var i = 1; i < rows.length; i++) {
					var cells = rows[i].getCells();
					var cell1 = cells[0].getValue();
					var cell2 = cells[1].getValue();
					var cell3 = cells[2].getValue();
					var cell4 = cells[3].getValue();
					var cell5 = cells[4].getValue();
					var cell6 = cells[5].getValue();
					var cell7 = cells[6].getValue();
					var cell8 = cells[7].getValue();
					this.userObject = {
						Pspid: cell1,
						Zzphase: cell2,
						ToZztskcd: cell3,
						ToZzactcd: cell4,
						ToZzfftskcd: cell5,
						ToZzffactcd: cell6,
						Megbtr: cell7,
						Percent: cell8,
						Counter: i,
						Belnr: this.docno
					};
					this.colsval = [];
					this.cols.push(this.userObject);
					this.userObject = {
						Pspid: "",
						Zzphase: "",
						ToZztskcd: "",
						ToZzactcd: "",
						ToZzfftskcd: "",
						ToZzffactcd: "",
						Megbtr: "",
						Percent: "",
						Counter: "",
						Belnr: ""
					};

				}
				var changedTableData = this.cols;
				this.makeSplitBatchCalls(changedTableData, oModel);

			}
		},
		makeSplitBatchCalls: function(oList, oModel1) {
			debugger;
			sap.ui.core.BusyIndicator.show();
			this.Action = "SPLIT";
			var oComponent = this.getOwnerComponent(),

				oFModel = oComponent.getModel(),
				tData = $.extend(true, [], oList),
				tbl = this.getView().byId("WipDetailsSet3"),
				urlParams,

				CoNumber = [],
				Counter = [],
				Hours = [],
				Percentage = [],
				ToActivityCode = [],
				ToFfActivityCode = [],
				ToFfTaskCode = [],
				ToMatter = [],
				ToTaskCode = [],
				ToPhaseCode = [];

			$.each(tData, function(i, o) {
				CoNumber.push(o.Belnr);
				Counter.push(o.Counter);
				Hours.push(o.Megbtr);
				Percentage.push(o.Percent);
				ToActivityCode.push(o.ToZzactcd);
				ToFfActivityCode.push(o.ToZzffactcd);
				ToFfTaskCode.push(o.ToZzfftskcd);
				ToMatter.push(o.Pspid);
				ToTaskCode.push(o.ToZztskcd);
				ToPhaseCode.push(o.Zzphase);
			});

			urlParams = {

				Action: "SPLIT",
				CoNumber: CoNumber,
				Counter: Counter,
				Hours: Hours,
				Percentage: Percentage,
				ToActivityCode: ToActivityCode,
				ToFfActivityCode: ToFfActivityCode,
				ToFfTaskCode: ToFfTaskCode,
				ToMatter: ToMatter,
				ToTaskCode: ToTaskCode,
				ToPhaseCode: ToPhaseCode

			};
			var rows = sap.ui.core.Fragment.byId("splitTransfer", "splitTable2").getItems();
			var that = this;
			var jsonModel = that.getView().getModel("JSONModel");
			
			oFModel.callFunction("/WIPMSPLIT", {
				method: "GET",
				urlParameters: urlParams,
				success: function(oData) {

					sap.ui.core.BusyIndicator.hide();
					var res = oData.results;
					for (var i = 0; i < res.length; i++) {
						that.msgTxt = res[i].Message;
						/*	msgs.push(msgTxt);*/
						if (that.msgTxt !== "") {
							var cells = rows[i + 1].getCells();
							cells[9].setProperty("visible", true);
							cells[9].setTooltip(that.msgTxt);
						}

					}
					// MessageBox.show(
					// 	msgTxt, {
					// 		icon: sap.m.MessageBox.Icon.SUCCESS,
					// 		title: "Save",
					// 		actions: [sap.m.MessageBox.Action.OK]
					// 	}
					// );

					jsonModel.setProperty("/modelData", oData.results);

				}
			});
		},
	
		
		onUpdateCodes: function() {
			debugger;

			var aIndices = this.getView().byId("WipDetailsSet2").getSelectedIndices();
			var sMsg;
			if (aIndices.length < 1) {
				sMsg = "Please Select Atleast One item";
				this.showAlert("WIP Edit", sMsg);
			} else {

				var oView = this.getView();
				var oDialog = this._getupdateCodesDialog();
				oView.addDependent(oDialog);
				oDialog.open();

				sap.ui.core.Fragment.byId("update", "phaseCodeChk").setSelected(false);
				sap.ui.core.Fragment.byId("update", "taskCodeChk").setSelected(false);
				sap.ui.core.Fragment.byId("update", "ActivityCodeChk").setSelected(false);
				sap.ui.core.Fragment.byId("update", "FFTaskCodeChk").setSelected(false);
				sap.ui.core.Fragment.byId("update", "FFActCodeChk").setSelected(false);

				var updatesCodes = {
					rowData: {},
					phaseCodes: {},
					taskCodes: {},
					actCodes: {},
					ffTskCodes: {},
					ffActCodes: {},
					selectedPhaseCode: "",
					selectedTaskCode: "",
					selectedActCode: "",
					selectedFFTaskCode: "",
					selectedFFActCode: ""

				};

				this.selectedRows = new JSONModel(updatesCodes);
				this.BillEditModel = this.getModel("MatterModel");
	}

		},
		_getupdateCodesDialog: function() {
			if (!this._UpdateCodesDialog) {
				this._UpdateCodesDialog = sap.ui.xmlfragment("update", "wip.view.Dialog", this.getView().getController());
			}
			return this._UpdateCodesDialog;

		},
		UpdateCodesCancel: function() {
			this._UpdateCodesDialog.close();
		},
		UpdateCodes: function() {

			debugger;
			var selectedLines = this.getView().byId("WipDetailsSet").getSelectedIndices();
			this.UpdateCodesCancel();
			for (var c = 0; c < selectedLines.length; c++) {

				var phaseCodeChk = sap.ui.core.Fragment.byId("update", "phaseCodeChk").getSelected();
				var taskCodeChk = sap.ui.core.Fragment.byId("update", "taskCodeChk").getSelected();
				var ActivityCodeChk = sap.ui.core.Fragment.byId("update", "ActivityCodeChk").getSelected();
				var FFTaskCodeChk = sap.ui.core.Fragment.byId("update", "FFTaskCodeChk").getSelected();
				var FFActCodeChk = sap.ui.core.Fragment.byId("update", "FFActCodeChk").getSelected();

				// if (phaseCodeChk === true) {
				// 	this.BillEditModel.setProperty("/LineItemEdits/" + selectedLines[c] + "/phaseCodes", this.selectedRows.getProperty(
				// 		"/phaseCodes"));
				// 	this.BillEditModel.setProperty("/LineItemEdits/" + selectedLines[c] + "/selectedPhaseCode", sap.ui.core.Fragment.byId("update",
				// 		"selectedPhaseCode").getSelectedKey());
				// 	this.BillEditModel.setProperty("/LineItemEdits/" + selectedLines[c] + "/isRowEdited", true);

				// }
				// if (taskCodeChk === true) {

				// 	this.BillEditModel.setProperty("/LineItemEdits/" + selectedLines[c] + "/taskCodes", this.selectedRows.getProperty(
				// 		"/taskCodes"));
				// 	this.BillEditModel.setProperty("/LineItemEdits/" + selectedLines[c] + "/selectedTaskCode", sap.ui.core.Fragment.byId("update",
				// 		"selectedTaskCode").getSelectedKey());
				// 	this.BillEditModel.setProperty("/LineItemEdits/" + selectedLines[c] + "/isRowEdited", true);
				// }
				// if (ActivityCodeChk === true) {

				// 	this.BillEditModel.setProperty("/LineItemEdits/" + selectedLines[c] + "/actCodes", this.selectedRows.getProperty(
				// 		"/actCodes"));
				// 	this.BillEditModel.setProperty("/LineItemEdits/" + selectedLines[c] + "/selectedActCode", sap.ui.core.Fragment.byId("update",
				// 		"selectedActCode").getSelectedKey());
				// 	this.BillEditModel.setProperty("/LineItemEdits/" + selectedLines[c] + "/isRowEdited", true);

				// }
				// if (FFTaskCodeChk === true) {

				// 	this.BillEditModel.setProperty("/LineItemEdits/" + selectedLines[c] + "/ffTskCodes", this.selectedRows.getProperty(
				// 		"/ffTskCodes"));
				// 	this.BillEditModel.setProperty("/LineItemEdits/" + selectedLines[c] + "/selectedFFTaskCode", sap.ui.core.Fragment.byId("update",
				// 		"selectedFFTaskCode").getSelectedKey());
				// 	this.BillEditModel.setProperty("/LineItemEdits/" + selectedLines[c] + "/isRowEdited", true);
				// }
				// if (FFActCodeChk === true) {

				// 	this.BillEditModel.setProperty("/LineItemEdits/" + selectedLines[c] + "/ffActCodes", this.selectedRows.getProperty(
				// 		"/ffActCodes"));
				// 	this.BillEditModel.setProperty("/LineItemEdits/" + selectedLines[c] + "/selectedFFActCode", sap.ui.core.Fragment.byId("update",
				// 		"selectedFFActCode").getSelectedKey());
				// 	this.BillEditModel.setProperty("/LineItemEdits/" + selectedLines[c] + "/isRowEdited", true);
				// }

			}
		}

	});

});