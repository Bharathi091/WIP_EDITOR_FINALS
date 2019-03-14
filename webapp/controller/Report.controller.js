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

			this.uniqueId = [];
			this.narIndices = [];
			this.saveObjects = [];

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

			var otable = [];
			var aFilter = [];
			var Pspid = oEvent.getSource().getProperty("title");
			var odatefrom = this.getView().byId("SmartFilterBar").getControlByKey("Budat").getFrom();
			var odateto = this.getView().byId("SmartFilterBar").getControlByKey("Budat").getTo();
			aFilter.push(new Filter("Pspid", FilterOperator.EQ, Pspid));
			aFilter.push(new Filter("Budat", sap.ui.model.FilterOperator.BT, odatefrom, odateto));
			var oModel = this.getOwnerComponent().getModel();

			//var dataObj = LineItemsServices.getInstance().selectListItem(oModel,aFilter);

			LineItemsServices.getInstance().selectListItem(oModel, aFilter)
				.done(function(oData) {

					// alert("success");
				})
				.fail(function() {

					// alert("Fail");

				});

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
					
						// that.byId("smartTable_ResponsiveTable3").setIgnoreFromPersonalisation("Zzwiprate");
                     that.rowData = [];
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
				
			    	this.getView().byId("list").getModel("InputFields").setData(reversedMasteredItems);
				
			}
		},

		ReviewUnreview: function(oEvent) {
			debugger;
			var text = oEvent.getSource().getText();
			var tableLineEdits = this.getView().byId("WipDetailsSet2");
			var index = tableLineEdits.getSelectedIndices();
			for (var i = 0; i < index.length; i++) {
				tableLineEdits.getRows()[index[i]].getCells()[0].setVisible(true);
				tableLineEdits.getRows()[index[i]].getCells()[1].setVisible(false);
				if (text === "Reviewed") {
					tableLineEdits.getRows()[index[i]].getCells()[0].setTooltip("Reviewed");
				} else {
					tableLineEdits.getRows()[index[i]].getCells()[0].setTooltip("Unreviewed");
				}

			}
			var oTable = [];
			var InputFields = this.getView().getModel("InputsModel");
			var filters = InputFields.getProperty("/Inputs/Filters/filters");
		
			for (var j = 1; j <= filters.length; j++) {
				var table = this.getView().getModel("InputsModel").getProperty("/Inputs/Filters/Filter" + j + "/uitbale");
                
				var otable = this.byId(table);

				$.each(otable.getSelectedIndices(), function(k, o) {
					var selContext = otable.getContextByIndex(o);

					var obj = selContext.getObject();
					if (text === "Reviewed") {
						selContext.getModel().setProperty(selContext.getPath() + "/ReviewComplete", "X");
						obj.ReviewComplete = "X";
                       
					} else {
						selContext.getModel().setProperty(selContext.getPath() + "/ReviewComplete", "");
						obj.ReviewComplete = "";
					

					}
					oTable.push(obj);

				});

			}

			this.makeBatchCallsReviewUnreview(oTable);
		    this.jsonModel.setProperty("/modelData", this.homeArr);
		    
		   

			this.getView().setModel(this.jsonModel);
			
			 var Otable0 = this.getView().byId("WipDetailsSet");
			Otable0.bindRows("/modelData");
			
			 var Otable = this.getView().byId("WipDetailsSet1");
			// // Otable.setModel(this.jsonModel);
			 Otable.bindRows("/modelData");
			// var Otable1 = this.getView().byId("WipDetailsSet2");
			// Otable1.setModel(this.jsonModel);
			// Otable1.bindRows("/modelData");

		},
		makeBatchCallsReviewUnreview: function(oList) {

			debugger;

			var oComponent = this.getOwnerComponent(),
				// getting component and model from it
				oFModel = oComponent.getModel(),
				// tData consists oList
				tData = $.extend(true, [], oList),

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

				},
				error: function(oData) {
					MessageBox.show(JSON.parse(oData.responseText).error.message.value);

				}
			});
		},

		capitalizeFirstLetter: function(string) {

			return string.charAt(0).toUpperCase() + string.slice(1);

		},
		capitalization: function() {
			debugger;
			var InputFields = this.getView().getModel("InputsModel");

			InputFields.setProperty("/Inputs/isChanged", true);
			var data = [];
			var res = [];
			var Otable = this.getView().byId("WipDetailsSet1");
			//this.jsonModel.setProperty("/modelData", this.rowData );
			var NarStr;

			//data = this.rowData;

			this.rowData.forEach(function(o, k) {
				data[k] = o;
			});

			var that = this;

			var endChars = [".", "?", "!", "\"", "'"];

			res = $.each(data, function(item) {
				NarStr = that.capitalizeFirstLetter(data[item].NarrativeString);
				data[item].NarrativeString = NarStr;
				if (NarStr !== "") {
					var lastChar = NarStr.charAt(NarStr.length - 1);
					if (endChars.indexOf(lastChar.slice(-1)) === -1) {
						NarStr = NarStr + ".";
						data[item].NarrativeString = NarStr;

					}
					return data[item].NarrativeString;
				}

			});

			this.jsonModel.setProperty("/modelData", data);

			this.getView().byId("WipDetailsSet1").setModel(this.jsonModel);
			Otable.bindRows("/modelData");
		},

		remove_character: function(str, char_pos) {
			var part1 = str.substring(0, char_pos);
			var part2 = str.substring(char_pos + 1, str.length);
			return (part1 + part2);
		},

		removeSpaces: function(oEvt) {
			debugger;
			var InputFields = this.getView().getModel("InputsModel");

			InputFields.setProperty("/Inputs/isChanged", true);
			var data = [];
			var result;

			this.rowData.forEach(function(o, k) {
				data[k] = o;
			});

			var that = this;
			var res = [];
			res = $.each(data, function(item) {
				result = data[item].NarrativeString.replace(/\s+/g, " ").trim();
				var lastChar = result.charAt(result.length - 1);
				var spaceLastChar = result.charAt(result.length - 2);

				if (lastChar === "." && spaceLastChar === " ") {

					result = that.remove_character(result, result.length - 2);

				}

				data[item].NarrativeString = result;

				return data[item].NarrativeString;
			});
			this.jsonModel.setProperty("/modelData", res);
			var Otable = this.getView().byId("WipDetailsSet1");
			// this.jsonModel.setData(res);
			this.getView().byId("WipDetailsSet1").setModel(this.jsonModel);
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
                           
                        debugger;   
                           
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
		// Reload: function(oEvent) {

		// 	debugger;

		// 	this.filter = oEvent.getSource().getParent().getParent().getParent().getText();

		// 	var InputFields = this.getView().getModel("InputsModel");
		// 	var change = InputFields.getProperty("/Inputs/isChanged");
		// 	console.log(change);
		// 	if (change === true) {
		// 		this._Dialog = sap.ui.xmlfragment("wip.view.Fragment", this);
		// 		this._Dialog.open();
		// 	} else {
		// 		this.ReloadTable();

		// 	}

		// },

		// closeDialog: function() {
		// 	this._Dialog.close();

		// },

		// ReloadTable: function(oEvent) {

		// 	var InputFields = this.getView().getModel("InputsModel");

		// 	var value = this.filter;

		// 	if (value === " ") {
		// 		this.getView().byId("WipDetailsSet").getModel().refresh(true);
		// 	} else if (value === "Narrative_Edits") {
		// 		sap.ui.core.BusyIndicator.show(0);
		// 		this.getView().byId("WipDetailsSet1").getModel().refresh(true);
		// 		var pspid = this.jsonModel.getProperty("/Matter");
		// 		var oModel = this.getOwnerComponent().getModel();
		// 		var aFilter = [];
		// 		aFilter.push(new Filter("Pspid", FilterOperator.EQ, pspid));

		// 		var that = this;
		// 		oModel.read("/WipDetailsSet", {
		// 			filters: aFilter,
		// 			success: function(oData) {
		// 				sap.ui.core.BusyIndicator.hide(0);

		// 				debugger;

		// 				that.jsonModel.setProperty("/modelData", oData.results);

		// 			}
		// 		});

		// 	} else if (value === "Line_Item_Edits") {
		// 		sap.ui.core.BusyIndicator.show(0);
		// 		this.data(this.rowData);

		// 	} else {
				
				
		// 		sap.ui.core.BusyIndicator.show(0);

		// 		var pspid = this.jsonModel.getProperty("/Matter");
		// 		var oModel = this.getOwnerComponent().getModel();
		// 		var aFilter = [];
		// 		aFilter.push(new Filter("Pspid", FilterOperator.EQ, pspid));

		// 		var that = this;
		// 		oModel.read("/WipDetailsSet", {
		// 			filters: aFilter,
		// 			success: function(oData) {
		// 				sap.ui.core.BusyIndicator.hide(0);

		// 				debugger;

		// 				that.jsonModel.setProperty("/modelData", oData.results);
		// 				that.jsonModel.setProperty("/modelData", that.homeArr);

		// 				that.getView().byId("WipDetailsSet3").setModel(that.jsonModel);
		// 				var Otable = that.getView().byId("WipDetailsSet3");
		// 				Otable.bindRows("/modelData");

		// 			}
		// 		});
				
				
		// 	}

		// 	if (this._Dialog) {

		// 		this._Dialog.close();

		// 	}
		// 	InputFields.setProperty("/Inputs/isChanged", false);

		// },

        Reload: function(oEvent) {

			debugger;

			this.filter = oEvent.getSource().getParent().getParent().getParent().getText();

			var InputFields = this.getView().getModel("InputsModel");
			var change = InputFields.getProperty("/Inputs/isChanged");
			console.log(change);
			if (change === true) {
				this._Dialog = sap.ui.xmlfragment("wip.view.Fragment", this);
				this._Dialog.open();
			} else {
				this.ReloadTable();

			}

		},

		closeDialog: function() {
			this._Dialog.close();
			
		
			

		},

		// ReloadTable: function(oEvent) {
		// 	debugger;
		// 	var InputFields = this.getView().getModel("InputsModel");

		// 	var value = this.filter;

		// 	if (value === " ") {
		// 		this.getView().byId("WipDetailsSet").getModel().refresh(true);
		// 	} else if (value === "Narrative_Edits") {
		// 		sap.ui.core.BusyIndicator.show(0);
		// 		this.getView().byId("WipDetailsSet1").getModel().refresh(true);
		// 		var pspid = this.jsonModel.getProperty("/Matter");
		// 		var oModel = this.getOwnerComponent().getModel();
		// 		var aFilter = [];
		// 		aFilter.push(new Filter("Pspid", FilterOperator.EQ, pspid));

		// 		var that = this;
		// 		oModel.read("/WipDetailsSet", {
		// 			filters: aFilter,
		// 			success: function(oData) {
		// 				sap.ui.core.BusyIndicator.hide(0);

		// 				debugger;
  //                         that.homeArr = oData.results;
		// 				that.jsonModel.setProperty("/modelData", oData.results);
		// 				//that.jsonModel.setProperty("/modelData", that.homeArr);
						
		// 					that.homeArr.forEach(function(o, k) {
		// 				that.rowData[k] = o;
		// 		        	});

		// 				// that.jsonModel.setProperty("/modelData", that.homeArr);

		// 				// that.getView().byId("WipDetailsSet1").setModel(that.jsonModel);
		// 				// var Otable = this.getView().byId("WipDetailsSet1");
		// 				// Otable.bindRows("/modelData");

		// 			}
		// 		});

		// 	} else if (value === "Line_Item_Edits") {
		// 		sap.ui.core.BusyIndicator.show(0);
		// 		this.data(this.homeArr);

		// 	} else {
		// 		sap.ui.core.BusyIndicator.show(0);

		// 		var pspid = this.jsonModel.getProperty("/Matter");
		// 		var oModel = this.getOwnerComponent().getModel();
		// 		var aFilter = [];
		// 		aFilter.push(new Filter("Pspid", FilterOperator.EQ, pspid));

		// 		var that = this;
		// 		oModel.read("/WipDetailsSet", {
		// 			filters: aFilter,
		// 			success: function(oData) {
		// 				sap.ui.core.BusyIndicator.hide(0);

		// 				debugger;
  //                      that.homeArr = oData.results;
		// 				that.jsonModel.setProperty("/modelData", oData.results);
		// 				//that.jsonModel.setProperty("/modelData", that.homeArr);
						
		// 					that.homeArr.forEach(function(o, k) {
		// 				that.rowData[k] = o;
		// 			});

		// 				that.getView().byId("WipDetailsSet3").setModel(that.jsonModel);
		// 				var Otable = that.getView().byId("WipDetailsSet3");
		// 				Otable.bindRows("/modelData");

		// 			}
		// 		});
		// 	}

		// 	if (this._Dialog) {

		// 		this._Dialog.close();

		// 	}
		// 	InputFields.setProperty("/Inputs/isChanged", false);
			
			
		
			

		// },
      
      
      
      ReloadTable: function(oEvent) {
			debugger;
			var InputFields = this.getView().getModel("InputsModel");
				var filter = this.getView().byId("idIconTabBar").getSelectedKey();
				if(filter === "Home"){
						this.getView().byId("WipDetailsSet").getModel().refresh(true);
				}
			if (filter === "NarrativeEdits") {
				sap.ui.core.BusyIndicator.show(0);
				this.getView().byId("WipDetailsSet1").getModel().refresh(true);
				var pspid = this.jsonModel.getProperty("/Matter");
				var oModel = this.getOwnerComponent().getModel();
				var aFilter = [];
				aFilter.push(new Filter("Pspid", FilterOperator.EQ, pspid));

				var that = this;
				oModel.read("/WipDetailsSet", {
					filters: aFilter,
					success: function(oData) {
						sap.ui.core.BusyIndicator.hide(0);

						debugger;
						that.homeArr=oData.results;

						that.jsonModel.setProperty("/modelData", oData.results);
                         that.rowData = [];
						that.homeArr.forEach(function(o, k) {
						that.rowData[k] = o;
					});


					}
				});
			} else if (filter === "LineItemEdits") {
				sap.ui.core.BusyIndicator.show(0);
				this.data(this.homeArr);
			} else {
			sap.ui.core.BusyIndicator.show(0);

				var pspid = this.jsonModel.getProperty("/Matter");
				var oModel = this.getOwnerComponent().getModel();
				var aFilter = [];
				aFilter.push(new Filter("Pspid", FilterOperator.EQ, pspid));

				var that = this;
				oModel.read("/WipDetailsSet", {
					filters: aFilter,
					success: function(oData) {
						sap.ui.core.BusyIndicator.hide(0);

						debugger;
						that.homeArr=oData.results;
						that.jsonModel.setProperty("/modelData", oData.results);
						that.rowData = [];
						that.homeArr.forEach(function(o, k) {
						that.rowData[k] = o;
					});

					
					}
				});
					this.data(this.homeArr);
			}
			if (this._Dialog) {

				this._Dialog.close();

			}
			InputFields.setProperty("/Inputs/isChanged", false);
			
			
		
			

		},
      
      
		changeNarrative: function(oEvent) {

			debugger;
			var InputFields = this.getView().getModel("InputsModel");

			InputFields.setProperty("/Inputs/isChanged", true);

			var changedRow = oEvent.getSource().getBindingContext();
			// changedRow.getModel().setProperty(changedRow.getPath() + "/NarrativeString", oEvent.getParameters().value);
			var obj = changedRow.getObject();
			obj.NarrativeString = oEvent.getParameters().value;
			var idx = oEvent.getSource().getParent();
			var index = idx.getIndex();
			var that = this;
			this.rowData = [];
			this.homeArr.forEach(function(o, i) {
				that.rowData[i] = o;
			});
			this.rowData[index] = obj;

			this.narIndices.push(index);

			$.each(this.narIndices, function(i, el) {
				if ($.inArray(el, that.uniqueId) === -1) that.uniqueId.push(el);
			});
		},
		CodesChange: function(oEvent) {
			debugger;
			var InputFields = this.getView().getModel("InputsModel");
			
			  var item = oEvent.getSource().getParent();
			var idx = oEvent.getSource().getParent().getParent().indexOfRow(item);
			this.narIndices.push(idx);

			InputFields.setProperty("/Inputs/isChanged", true);
			
			
			
			// var changedRow = oEvent.getSource().getBindingContext();
			// // changedRow.getModel().setProperty(changedRow.getPath() + "/NarrativeString", oEvent.getParameters().value);
			// var obj = jQuery.extend({}, changedRow.getObject());

			// obj.Zzactcd = oEvent.getSource().getSelectedItem().getText();
			// var idx = oEvent.getSource().getParent();
			// var index = idx.getIndex();
			// var that = this;

			// debugger;
			// this.homeArr.forEach(function(o, i) {
			// 	that.rowData[i] = o;
			// });
			// this.rowData[index] = obj;
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

				InputFields.setProperty("/Inputs/ToolbarEnable/Split_Transfer", true);

			} else if (rowCount.length > 1) {

				InputFields.setProperty("/Inputs/ToolbarEnable/Consolidate", true);
				InputFields.setProperty("/Inputs/ToolbarEnable/Mass_Transfer", true);

				InputFields.setProperty("/Inputs/ToolbarEnable/Split_Transfer", false);
			} else {

				InputFields.setProperty("/Inputs/ToolbarEnable/Consolidate", false);
				InputFields.setProperty("/Inputs/ToolbarEnable/Mass_Transfer", false);

				InputFields.setProperty("/Inputs/ToolbarEnable/Split_Transfer", false);

			}

		},

		handleIconTabBarSelect: function(oEvent) {
			debugger;

			this.byId("searchText").setValue("");

			var InputFields = this.getView().getModel("InputsModel");
			var change = oEvent.getSource();

			var value = change.getSelectedKey();
			
			this.ReloadTable();

			if (value === "NarrativeEdits") {
				
				this.jsonModel.setProperty("/modelData", this.homeArr);

				this.getView().byId("WipDetailsSet1").setModel(this.jsonModel);
				var Otable = this.getView().byId("WipDetailsSet1");
				Otable.bindRows("/modelData");
				
				
				var tableLineEdits = this.getView().byId("WipDetailsSet2");
				var index = tableLineEdits.getSelectedIndices();
				for (var i = 0; i < index.length; i++) {
					tableLineEdits.getRows()[index[i]].getCells()[0].setVisible(false);
					tableLineEdits.getRows()[index[i]].getCells()[1].setVisible(true);

				}

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
				var tableLineEdits = this.getView().byId("WipDetailsSet2");
				var index = tableLineEdits.getSelectedIndices();
				for (var i = 0; i < index.length; i++) {
					tableLineEdits.getRows()[index[i]].getCells()[0].setVisible(false);
					tableLineEdits.getRows()[index[i]].getCells()[1].setVisible(true);

				}

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
				this.tableId = "WipDetailsSet2";
                debugger;
				var that = this;
				this.rowData = [];
				this.jsonModel.getData()["modelData"].forEach(function(item, f) {

					that.rowData[f] = item;

				});

				//	console.log(this.jsonModel.getData()["modelData"]);
				if(this.jsonModel.getProperty("/Matter")!==""){
				this.data(this.rowData);
				}
			} else if (value === "LineItemTransfers") {
				var tableLineEdits = this.getView().byId("WipDetailsSet2");
				var index = tableLineEdits.getSelectedIndices();
				for (var i = 0; i < index.length; i++) {
					tableLineEdits.getRows()[index[i]].getCells()[0].setVisible(false);
					tableLineEdits.getRows()[index[i]].getCells()[1].setVisible(true);

				}
				this.getView(0).byId("WipDetailsSet2").getModel().refresh(true);

				var tableLineEdits1 = this.getView().byId("WipDetailsSet3");

				var len = tableLineEdits1.getRows().length;
				for (var q = 0; q < len; q++) {
					tableLineEdits1.getRows()[q].getCells()[0].setVisible(false);

				}
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
				this.tableId = "WipDetailsSet3";
				
					if(this.jsonModel.getProperty("/Matter")!==""){
				this.data(this.rowData);
				}
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
			var that = this;
			$.each(object, function(j, token) {
				if (object) {
					aFilter.push(new Filter("Pspid", "EQ", token.getText()));
				}

				oModel.read("/WipMattersSet", {
					filters: aFilter,
					success: function(oData) {
						debugger;
						// alert("in");
						that.arr = oData.results;
						console.log(oData.results);

						var InputFields = that.getView().getModel("InputsModel");
						debugger;
						InputFields.setProperty("/Inputs/masterItems", oData.results);
						
						var oModel1 = new sap.ui.model.json.JSONModel();

						oModel1.setData(oData);

						var aData = oModel1.getProperty("/results");

						var oModel = new sap.ui.model.json.JSONModel(aData);

						that.getView().byId("list").setModel(oModel, "InputFields");

					}
				});
				// 				

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
e
				this.getOwnerComponent().getRouter().navTo("woklist", null, true);
			}
		},

		// onReplacewords: function(evt) {
		// 	var oTable = this.getView().byId("smartTable_ResponsiveTable1").getTable();
		// 	if (oTable.getSelectedIndices().length === 0) {
		// 		debugger;
		// 		MessageBox.show(
		// 			"Select atleast one item!", {
		// 				icon: sap.m.MessageBox.Icon.WARNING,
		// 				title: "Replace",
		// 				actions: [sap.m.MessageBox.Action.OK]
		// 			}
		// 		);
		// 		return;
		// 	} else {
		// 		var odialog = this._getreplaceDialogbox();
		// 		odialog.open();
		// 	}
		// },
		// _getreplaceDialogbox: function() {
		// 	if (!this._oreplaceDialog) {
		// 		this._oreplaceDialog = sap.ui.xmlfragment("replaceword", "wip.view.popup", this);
		// 		this.getView().addDependent(this._oreplaceDialog);
		// 	}
		// 	return this._oreplaceDialog;
		// },
		// closereplaceDialog: function() {
		// 	sap.ui.getCore().byId("replaceword--string0").setValue("");
		// 	sap.ui.getCore().byId("replaceword--replace0").setValue("");
		// 	sap.ui.getCore().byId("replaceword--word").setSelected(true);
		// 	var tbl = sap.ui.core.Fragment.byId("replaceword", "bottomTable0");
		// 	$.each(tbl.getItems(), function(d, o) {
		// 		if (d > 0) {
		// 			var rowid = o.getId();
		// 			tbl.removeItem(rowid);
		// 		}
		// 	});
		// 	this._getreplaceDialogbox().close();
		// },
		// onreplace: function() {
		// 	debugger;
		// 	var InputFields = this.getView().getModel("InputsModel");

		// 	InputFields.setProperty("/Inputs/isChanged", true);
		// 	var oTable = this.getView().byId("smartTable_ResponsiveTable1").getTable();
		// 	// console.log(oTable.getRows());
		// 	var oTable1 = sap.ui.core.Fragment.byId("replaceword", "bottomTable0");
		// 	var index = oTable1.getItems().length;
		// 	console.log(index);

		// 	var that = this;
		// 	$.each(oTable.getSelectedIndices(), function(i, o) {

		// 		var ctx = oTable.getContextByIndex(o);
		// 		var m = ctx.getObject();
		// 		var str = m.NarrativeString;
		// 		var items = oTable1.getItems();
		// 		$.each(items, function(l, obj) {
		// 			var cells = obj.getCells();
		// 			// var string = sap.ui.getCore().byId("replaceword--string" + j).getValue();
		// 			// var replacewith = sap.ui.getCore().byId("replaceword--replace" + j).getValue();
		// 			var string = cells[0].getValue();
		// 			var replacewith = cells[1].getValue();
		// 			var searchindex = str.search(string);
		// 			if (searchindex >= 0) {

		// 				var res = str.replace(string, replacewith);
		// 				that.replaceItems = that.jsonModel.getProperty("/modelData");
		// 				that.replaceItems[o].NarrativeString = res;
		// 				// console.log(that.replaceItems);
		// 					if(str !== res){
						
		// 					that.saveObjects.push(that.replaceItems[o]);
		// 				}
		// 				str = that.replaceItems[o].NarrativeString;

		// 			}

		// 		});
		// 		that.jsonModel.setProperty("/modelData", that.replaceItems);
		// 	that.getView().byId("WipDetailsSet1").setModel(that.jsonModel);
		// 		oTable.bindRows("/modelData");

		// 	});
		// 	sap.ui.getCore().byId("replaceword--string0").setValue("");
		// 	sap.ui.getCore().byId("replaceword--replace0").setValue("");
		// 	var tbl = sap.ui.core.Fragment.byId("replaceword", "bottomTable0");
		// 	$.each(tbl.getItems(), function(d, o) {
		// 		if (d > 0) {
		// 			var rowid = o.getId();
		// 			tbl.removeItem(rowid);
		// 		}
		// 	});
		// 	this._getreplaceDialogbox().close();
		// },
		// replaceall: function() {
		// 	var oTable = this.getView().byId("smartTable_ResponsiveTable1").getTable();
		// 	var oTable1 = sap.ui.core.Fragment.byId("replaceword", "bottomTable0");
		// 	var replaceItems = this.jsonModel.getProperty("/modelData");
		// 	var that = this;
		// 	var result = $.each(replaceItems, function(i, o) {

		// 		var m = o;
		// 		var str = m.NarrativeString;
		// 		var items = oTable1.getItems();
		// 		$.each(items, function(l, obj) {
		// 			var cells = obj.getCells();
		// 			var string = cells[0].getValue();
		// 			var replacewith = cells[1].getValue();
		// 			var searchindex = str.search(string);
		// 			if (searchindex >= 0) {
		// 				var res = str.replace(string, replacewith);
		// 				that.replace = that.jsonModel.getProperty("/modelData");
		// 				that.replace[i].NarrativeString = res;
						
		// 					if(str !== res)
		// 				{
		// 					that.saveObjects.push(that.replace[i]);
		// 				}
						
		// 				str = that.replace[i].NarrativeString;
		// 			}
		// 		});
		// 		return that.replace;

		// 	});

		// 	this.jsonModel.setProperty("/modelData", result);
		// 	this.getView().setModel(this.jsonModel);
		// 	oTable.bindRows("/modelData");
		// 	sap.ui.getCore().byId("replaceword--string0").setValue("");
		// 	sap.ui.getCore().byId("replaceword--replace0").setValue("");
		// 	var tbl = sap.ui.core.Fragment.byId("replaceword", "bottomTable0");
		// 	$.each(tbl.getItems(), function(d, o) {
		// 		if (d > 0) {
		// 			var rowid = o.getId();
		// 			tbl.removeItem(rowid);
		// 		}
		// 	});
		// 	this._getreplaceDialogbox().close();
		// },
		
		
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
			sap.ui.getCore().byId("replaceword--string0").setValue("");
			sap.ui.getCore().byId("replaceword--replace0").setValue("");
			sap.ui.getCore().byId("replaceword--word").setSelected(true);
			var tbl = sap.ui.core.Fragment.byId("replaceword", "bottomTable0");
			$.each(tbl.getItems(), function(d, o) {
				if (d > 0) {
					var rowid = o.getId();
					tbl.removeItem(rowid);
				}
			});
			this._oreplaceDialog.close();
		},
		onreplace: function() {
			var oTable = this.getView().byId("smartTable_ResponsiveTable1").getTable();
			// console.log(oTable.getRows());
			var oTable1 = sap.ui.core.Fragment.byId("replaceword", "bottomTable0");

			var that = this;
			$.each(oTable.getSelectedIndices(), function(i, o) {
				debugger;
				var ctx = oTable.getContextByIndex(o);
				var m = ctx.getObject();
				var str = m.NarrativeString;
				var res;
				debugger;
				var items = oTable1.getItems();
				$.each(items, function(l, obj) {
					debugger;
					var cells = obj.getCells();
					var string = cells[0].getValue();
					var replacewith = cells[1].getValue();
					var check = cells[3].getSelected();
					if (check) {
                         
                         var pullstop = str.lastIndexOf(".");
                         if(pullstop){
			            str = str.substring(0, pullstop);
                         }
						var stringarr = str.split(" ");
					
						var startindex = stringarr.indexOf(string);
						if (startindex >= 0) {
							stringarr[startindex] = replacewith;
						}
						if(pullstop){
						stringarr.push(".");
						}
						res = stringarr.join(" ");
						
						if(pullstop){
						res = that.remove_character(res, res.length-2);
						}
						
				
						
							} else {
						debugger;
						var searchindex = str.search(string);
						if (searchindex >= 0) {
							res = str.replace(string, replacewith);
						}
					}

					that.replaceItems = that.jsonModel.getProperty("/modelData");
					that.replaceItems[o].NarrativeString = res;
					
						if(str != res)
						{
							that.saveObjects.push(that.replaceItems[o]);
						}
					
					str = that.replaceItems[o].NarrativeString;

				});
				that.jsonModel.setProperty("/modelData", that.replaceItems);
				oTable.setModel(that.jsonModel);
				oTable.bindRows("/modelData");

			});
			sap.ui.getCore().byId("replaceword--string0").setValue("");
			sap.ui.getCore().byId("replaceword--replace0").setValue("");
			sap.ui.getCore().byId("replaceword--word").setSelected(true);
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
				var res;
				var items = oTable1.getItems();
				$.each(items, function(l, obj) {
					var cells = obj.getCells();
					var string = cells[0].getValue();
					var replacewith = cells[1].getValue();
					var check = cells[3].getSelected();
					if (check) {
						
						 var pullstop = str.lastIndexOf(".");
                         if(pullstop){
			            str = str.substring(0, pullstop);
                         }

						var stringarr = str.split(" ");
						var startindex = stringarr.indexOf(string);
						if (startindex >= 0) {
							stringarr[startindex] = replacewith;
						}
							if(pullstop){
						stringarr.push(".");
						}
						
						res = stringarr.join(" ");
						
							if(pullstop){
						res = that.remove_character(res, res.length-2);
						}
						that.replace = that.jsonModel.getProperty("/modelData");
						that.replace[i].NarrativeString = res;
						
							if(str != res)
						{
							that.saveObjects.push(that.replace[i]);
						}
						
						str = that.replace[i].NarrativeString;

					} else {

						var searchindex = str.search(string);
						if (searchindex >= 0) {
							res = str.replace(string, replacewith);
							that.replace = that.jsonModel.getProperty("/modelData");
							that.replace[i].NarrativeString = res;
							str = that.replace[i].NarrativeString;
						}
					}

				});
				return that.replace;
			});

			this.jsonModel.setProperty("/modelData", result);
			oTable.setModel(this.jsonModel);
			oTable.bindRows("/modelData");
			sap.ui.getCore().byId("replaceword--string0").setValue("");
			sap.ui.getCore().byId("replaceword--replace0").setValue("");
			sap.ui.getCore().byId("replaceword--word").setSelected(true);
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
		
		// onmasstransfer: function() {

		// 	var odialog = this._getDialogmass();
		// 	odialog.open();
		// 	var oTable = this.getView().byId("WipDetailsSet3");
		// 	var ofrag = sap.ui.core.Fragment.byId("masstransfer", "masstransfertable");
		// 	$.each(oTable.getSelectedIndices(), function(i, o) {

		// 		var tableContext = oTable.getContextByIndex(o);
		// 		var obj = tableContext.getObject();
		// 		var itemno = obj.Buzei;
		// 		var docno = obj.Belnr;
		// 		ofrag.addItem(new sap.m.ColumnListItem({
		// 			cells: [new sap.m.Text({
		// 					width: "100%",
		// 					text: docno
		// 				}),
		// 				new sap.m.Text({
		// 					width: "100%",
		// 					text: itemno
		// 				}),
		// 				new sap.m.Button({
		// 					text: "delete",
		// 					press: function(oEvent) {
		// 						var tbl = sap.ui.core.Fragment.byId("masstransfer", "masstransfertable");
		// 						var src = oEvent.getSource().getParent();
		// 						var rowid = src.getId();
		// 						tbl.removeItem(rowid);
		// 					}
		// 				})

		// 			]
		// 		}));
		// 	});
		// },
		// _getDialogmass: function() {
		// 	if (!this._omassDialog) {
		// 		this._omassDialog = sap.ui.xmlfragment("masstransfer", "wip.view.masstransfer", this);
		// 		this.getView().addDependent(this._omassDialog);
		// 	}
		// 	return this._omassDialog;
		// },
		// closemassDialog: function() {
		// 	sap.ui.core.Fragment.byId("masstransfer", "percentage").setValue("100");
		// 	var tbl = sap.ui.core.Fragment.byId("masstransfer", "masstransfertable");
		// 	$.each(tbl.getItems(), function(i, o) {
		// 		var rowid = o.getId();
		// 		tbl.removeItem(rowid);
		// 	});
		// 	this._omassDialog.close();
		// },
		// onmassTransferchange: function() {

		// 	var matter = sap.ui.core.Fragment.byId("masstransfer", "masspspid").getValue();
		// 	this.WipEditModel = this.getModel("InputsModel");
		// 	this.serviceInstance = LineItemsServices.getInstance();
		// 	var percent = sap.ui.core.Fragment.byId("masstransfer", "percentage").getValue();
		// 	var oTable1 = sap.ui.core.Fragment.byId("masstransfer", "masstransfertable");
		// 	var items = oTable1.getItems();
		// 	console.log("items");
		// 	console.log(items);
		// 	var Docno = [];
		// 	$.each(items, function(l, obj) {

		// 		var cells = obj.getCells();
		// 		var string = cells[0].getText();
		// 		Docno.push(string);
		// 	});
		// 	console.log("Docno");
		// 	console.log(Docno);
		// 	var check = false;
		// 	var oView = this.getView(),
		// 		oTable = oView.byId("WipDetailsSet3");
		// 	var selectindex = oTable.getSelectedIndices();
		// 	if (matter != "") {
		// 		var Pspid = matter;
		// 		var lineItems = this.homeArr;
		// 		var that = this;

		// 		$.when(
		// 			that.serviceInstance.getPhaseCodes(that.WipEditModel, Pspid, that),
		// 			that.serviceInstance.getTaskcodes(that.WipEditModel, "", that),
		// 			that.serviceInstance.getActivitycodes(that.WipEditModel, "", Pspid, that),
		// 			that.serviceInstance.getFFtaskcodes(that.WipEditModel, "", Pspid, that),
		// 			that.serviceInstance.getFFActivitycodes(that.WipEditModel, "", Pspid, that))

		// 		.done(function(phaseCodes, taskCodes, activityCodes, ffTskCodes, ffActCodes) {

		// 			$.each(oTable.getSelectedIndices(), function(j, o) {

		// 				var ctx = oTable.getContextByIndex(o);
		// 				var m = ctx.getObject();
		// 				var docno = m.Belnr;
		// 				check = Docno.includes(docno);
		// 				if (check) {

		// 					lineItems[o].ToMatter = matter;
		// 					lineItems[o].Percent = percent;
		// 					lineItems[o].taskCodes = lineItems[o].Zztskcd.length ? [{
		// 						TaskCodes: "",
		// 						TaskCodeDesc: ""
		// 					}].concat(taskCodes.results) : taskCodes.results;
		// 					lineItems[o].actCodes = lineItems[o].Zzactcd.length ? [{
		// 						ActivityCodes: "",
		// 						ActivityCodeDesc: ""
		// 					}].concat(activityCodes.results) : activityCodes.results;
		// 					lineItems[o].ffTskCodes = lineItems[o].Zzfftskcd.length ? [{
		// 						FfTaskCodes: "",
		// 						FfTaskCodeDesc: ""
		// 					}].concat(ffTskCodes.results) : ffTskCodes.results;
		// 					lineItems[o].ffActCodes = lineItems[o].Zzffactcd.length ? [{
		// 						FfActivityCodes: "",
		// 						FfActivityCodeDesc: ""
		// 					}].concat(ffActCodes.results) : ffActCodes.results;
		// 					lineItems[o].index = o;
		// 					lineItems[o].indeces = o;
		// 					lineItems[o].isRowEdited = true;

		// 				} else {
		// 					// check = false;
		// 					var indes = selectindex.indexOf(o);
		// 					selectindex[indes] = " ";
		// 				}

		// 			});
		// 			that.getView().setModel(that.jsonModel);
		// 			oTable.bindRows("/modelData");
		// 			console.log(selectindex);
		// 			// for (var s = 0; s < selectindex.length; s++) {
		// 			// 	debugger;
		// 			// 	var value = selectindex[s];
		// 			// 	if (value !== "") {
		// 			// 		oTable.setSelectedIndex(value);
		// 			// 	}

		// 			// }
		// 			that.onEditTable(selectindex);
		// 		});
		// 	}
		// 	sap.ui.core.Fragment.byId("masstransfer", "percentage").setValue("100");
		// 	var tbl = sap.ui.core.Fragment.byId("masstransfer", "masstransfertable");
		// 	$.each(tbl.getItems(), function(i, o) {
		// 		var rowid = o.getId();
		// 		tbl.removeItem(rowid);
		// 	});

		// 	this._omassDialog.close();
		// 	var InputFields = this.getView().getModel("InputsModel");
		// 	InputFields.setProperty("/Inputs/ToolbarEnable/Updatecodes", true);
		// },
		// onEditTable: function(selindexes) {
		// 	debugger;
		// 	var oView = this.getView(),
		// 		oTable = oView.byId("WipDetailsSet3");

		// 	for (var i = 0; i < selindexes.length; i++) {
		// 		var value = selindexes[i];
		// 		if (value !== " ") {
		// 			var ctx = oTable.getContextByIndex(value);
		// 			var m = ctx.getModel(ctx.getPath());
		// 			m.setProperty(ctx.getPath() + "/Edit", true);
		// 			oTable.addSelectionInterval(value, value);

		// 		}
		// 	}

		// },
		
		
		onmasstransfer: function() {

			var odialog = this._getDialogmass();

			//sap.ui.core.Fragment.byId("masstransfer", "masspspid").setValue("1500008011");
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
			sap.ui.core.Fragment.byId("masstransfer", "percentage").setValue("100");
			var tbl = sap.ui.core.Fragment.byId("masstransfer", "masstransfertable");
			$.each(tbl.getItems(), function(i, o) {
				var rowid = o.getId();
				tbl.removeItem(rowid);
			});

			this._omassDialog.close();

		},
		onmassTransferchange: function() {
			debugger;
			var matter = sap.ui.core.Fragment.byId("masstransfer", "masspspid").getValue();
			// var InputFields = this.getView().getModel("InputsModel");

			// InputFields.setProperty("/Inputs/matter", matter);
			// this.masstransfer(matter);
			this.WipEditModel = this.getModel("InputsModel");
			// var matter = this.WipEditModel.getProperty("/Inputs/matter");
			this.serviceInstance = LineItemsServices.getInstance();
			var percent = sap.ui.core.Fragment.byId("masstransfer", "percentage").getValue();
			var oTable1 = sap.ui.core.Fragment.byId("masstransfer", "masstransfertable");
			var items = oTable1.getItems();
			var Docno = [];
			$.each(items, function(l, obj) {

				var cells = obj.getCells();
				var string = cells[0].getText();
				Docno.push(string);
			});
			// console.log("Docno");
			// console.log(Docno);
			var check = false;
			var oView = this.getView(),
				oTable = oView.byId("WipDetailsSet3");
			var selectindex = oTable.getSelectedIndices();
			if (matter != "") {
				var Pspid = matter;
				var lineItems = this.homeArr;
				var that = this;

				$.when(
					that.serviceInstance.getPhaseCodes(that.WipEditModel, Pspid, that),
					that.serviceInstance.getTaskcodes(that.WipEditModel, "", that),
					that.serviceInstance.getActivitycodes(that.WipEditModel, "", Pspid, that),
					that.serviceInstance.getFFtaskcodes(that.WipEditModel, "", Pspid, that),
					that.serviceInstance.getFFActivitycodes(that.WipEditModel, "", Pspid, that))

				.done(function(phaseCodes, taskCodes, activityCodes, ffTskCodes, ffActCodes) {

					$.each(oTable.getSelectedIndices(), function(j, o) {
						debugger;
						var ctx = oTable.getContextByIndex(o);
						var m = ctx.getObject();
						var docno = m.Belnr;
						check = Docno.includes(docno);
						if (check) {

							lineItems[o].ToMatter = matter;
							lineItems[o].Percent = percent;
							lineItems[o].taskCodes = lineItems[o].Zztskcd.length ? [{
								TaskCodes: "",
								TaskCodeDesc: ""
							}].concat(taskCodes.results) : taskCodes.results;
							lineItems[o].actCodes = lineItems[o].Zzactcd.length ? [{
								ActivityCodes: "",
								ActivityCodeDesc: ""
							}].concat(activityCodes.results) : activityCodes.results;
							lineItems[o].ffTskCodes = lineItems[o].Zzfftskcd.length ? [{
								FfTaskCodes: "",
								FfTaskCodeDesc: ""
							}].concat(ffTskCodes.results) : ffTskCodes.results;
							lineItems[o].ffActCodes = lineItems[o].Zzffactcd.length ? [{
								FfActivityCodes: "",
								FfActivityCodeDesc: ""
							}].concat(ffActCodes.results) : ffActCodes.results;
							lineItems[o].index = o;
							lineItems[o].indeces = o;
							lineItems[o].isRowEdited = true;

						} else {
							// check = false;
							var indes = selectindex.indexOf(o);
							selectindex[indes] = " ";
						}

					});
					that.jsonModel.setProperty("/modelData", lineItems);

					that.getView().byId("WipDetailsSet3").setModel(that.jsonModel);
					oTable.bindRows("/modelData");
					console.log(selectindex);
					for (var s = 0; s < selectindex.length; s++) {
						debugger;
						var value = selectindex[s];
						if (value !== "") {
							oTable.setSelectedIndex(value);
						}

					}

					that.onEditTable(selectindex);
				});
			}
			var InputFields = this.getView().getModel("InputsModel");
			InputFields.setProperty("/Inputs/ToolbarEnable/Updatecodes", true);
			InputFields.setProperty("/Inputs/isChanged", true);
			sap.ui.core.Fragment.byId("masstransfer", "percentage").setValue("100");
			var tbl = sap.ui.core.Fragment.byId("masstransfer", "masstransfertable");
			$.each(tbl.getItems(), function(i, o) {
				var rowid = o.getId();
				tbl.removeItem(rowid);
			});

			this._omassDialog.close();
		},
		// masstransfer:function(pspid){
		// 	this.WipEditModel = this.getModel("InputsModel");
		// 	var matter = this.WipEditModel.getProperty("/Inputs/matter");
		// 	this.serviceInstance = LineItemsServices.getInstance();
		// 	var percent = sap.ui.core.Fragment.byId("masstransfer", "percentage").getValue();
		// 	var oTable1 = sap.ui.core.Fragment.byId("masstransfer", "masstransfertable");
		// 	var items = oTable1.getItems();
		// 	var Docno = [];
		// 	$.each(items, function(l, obj) {

		// 		var cells = obj.getCells();
		// 		var string = cells[0].getText();
		// 		Docno.push(string);
		// 	});
		// 	// console.log("Docno");
		// 	// console.log(Docno);
		// 	var check = false;
		// 	var oView = this.getView(),
		// 		oTable = oView.byId("WipDetailsSet3");
		// 	var selectindex = oTable.getSelectedIndices();
		// 	if (matter != "") {
		// 		var Pspid = matter;
		// 		var lineItems = this.homeArr;
		// 		var that = this;

		// 		$.when(
		// 			that.serviceInstance.getPhaseCodes(that.WipEditModel, Pspid, that),
		// 			that.serviceInstance.getTaskcodes(that.WipEditModel, "", that),
		// 			that.serviceInstance.getActivitycodes(that.WipEditModel, "", Pspid, that),
		// 			that.serviceInstance.getFFtaskcodes(that.WipEditModel, "", Pspid, that),
		// 			that.serviceInstance.getFFActivitycodes(that.WipEditModel, "", Pspid, that))

		// 		.done(function(phaseCodes, taskCodes, activityCodes, ffTskCodes, ffActCodes) {

		// 			$.each(oTable.getSelectedIndices(), function(j, o) {
		// 				debugger;
		// 				var ctx = oTable.getContextByIndex(o);
		// 				var m = ctx.getObject();
		// 				var docno = m.Belnr;
		// 				check = Docno.includes(docno);
		// 				if (check) {

		// 					lineItems[o].ToMatter = matter;
		// 					lineItems[o].Percent = percent;
		// 					lineItems[o].taskCodes = lineItems[o].Zztskcd.length ? [{
		// 						TaskCodes: "",
		// 						TaskCodeDesc: ""
		// 					}].concat(taskCodes.results) : taskCodes.results;
		// 					lineItems[o].actCodes = lineItems[o].Zzactcd.length ? [{
		// 						ActivityCodes: "",
		// 						ActivityCodeDesc: ""
		// 					}].concat(activityCodes.results) : activityCodes.results;
		// 					lineItems[o].ffTskCodes = lineItems[o].Zzfftskcd.length ? [{
		// 						FfTaskCodes: "",
		// 						FfTaskCodeDesc: ""
		// 					}].concat(ffTskCodes.results) : ffTskCodes.results;
		// 					lineItems[o].ffActCodes = lineItems[o].Zzffactcd.length ? [{
		// 						FfActivityCodes: "",
		// 						FfActivityCodeDesc: ""
		// 					}].concat(ffActCodes.results) : ffActCodes.results;
		// 					lineItems[o].index = o;
		// 					lineItems[o].indeces = o;
		// 					lineItems[o].isRowEdited = true;

		// 				} else {
		// 					// check = false;
		// 					var indes = selectindex.indexOf(o);
		// 					selectindex[indes] = " ";
		// 				}

		// 			});
		// 			that.jsonModel.setProperty("/modelData", lineItems);

		// 			that.getView().byId("WipDetailsSet3").setModel(that.jsonModel);
		// 			oTable.bindRows("/modelData");
		// 			console.log(selectindex);

		// 			that.onEditTable(selectindex);
		// 		});
		// 	}
		// 	var InputFields = this.getView().getModel("InputsModel");
		// 	InputFields.setProperty("/Inputs/ToolbarEnable/Updatecodes", true);
		// 	InputFields.setProperty("/Inputs/isChanged", true);
		// 	sap.ui.core.Fragment.byId("masstransfer", "percentage").setValue("100");
		// 	var tbl = sap.ui.core.Fragment.byId("masstransfer", "masstransfertable");
		// 	$.each(tbl.getItems(), function(i, o) {
		// 		var rowid = o.getId();
		// 		tbl.removeItem(rowid);
		// 	});

		// 	this._omassDialog.close();

		// },
		onEditTable: function(selindexes) {
			debugger;
			var InputFields = this.getView().getModel("InputsModel");

			InputFields.setProperty("/Inputs/isChanged", true);
			var oView = this.getView(),
				oTable = oView.byId("WipDetailsSet3");

			for (var i = 0; i < selindexes.length; i++) {
				var value = selindexes[i];
				if (value !== " ") {
					var ctx = oTable.getContextByIndex(value);
					var m = ctx.getModel(ctx.getPath());
					m.setProperty(ctx.getPath() + "/Edit", true);
					oTable.addSelectionInterval(value, value);

				}
			}

		},
		
		
		
	


		
		

		data: function(odata) {
			debugger;
			this.WipEditModel = this.getModel("InputsModel");
			this.serviceInstance = LineItemsServices.getInstance();
			this.getLineItemsData(odata);
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
				if (Rowdata.length > 0) {
					debugger;
					that.jsonModel.setProperty("/LinetableResults", Rowdata.length);
					var lineItems = Rowdata;
					for (var i = 0; i < lineItems.length; i++) {
						debugger;
						// lineItems[i].phaseCodes = lineItems[i].Zzphasecode.length ? [{
						// 	Phasecode: lineItems[i].Zzphasecode ,
						// 	PhasecodeDesc: ""
						// }].concat(phaseCodes.results) : phaseCodes.results;
						lineItems[i].taskCodes = lineItems[i].Zztskcd.length ? [{
							TaskCodes: lineItems[i].Zztskcd,
							TaskCodeDesc: ""
						}].concat(taskCodes.results) : taskCodes.results;
						lineItems[i].actCodes = lineItems[i].Zzactcd.length ? [{
							ActivityCodes: lineItems[i].Zzactcd,
							ActivityCodeDesc: ""
						}].concat(activityCodes.results) : activityCodes.results;
						lineItems[i].ffTskCodes = lineItems[i].Zzfftskcd.length ? [{
							FfTaskCodes: lineItems[i].Zzfftskcd,
							FfTaskCodeDesc: ""
						}].concat(ffTskCodes.results) : ffTskCodes.results;
						lineItems[i].ffActCodes = lineItems[i].Zzffactcd.length ? [{
							FfActivityCodes: lineItems[i].Zzffactcd,
							FfActivityCodeDesc: ""
						}].concat(ffActCodes.results) : ffActCodes.results;
						lineItems[i].index = i;
						lineItems[i].indeces = i;
						lineItems[i].selectedPhaseCode = lineItems[i].Zzphasecode;
						lineItems[i].selectedTaskCode = lineItems[i].Zztskcd;
						lineItems[i].selectedActCode = lineItems[i].Zzactcd;
						lineItems[i].selectedFFTaskCode = lineItems[i].Zzfftskcd;
						lineItems[i].selectedFFActCode = lineItems[i].Zzffactcd;
						lineItems[i].isRowEdited = false;
					}
				}
				that.jsonModel.setProperty("/modelData", lineItems);
				var Otable1 = that.getView().byId("WipDetailsSet2");
				var Otable2 = that.getView().byId("WipDetailsSet3");
				Otable1.setModel(that.jsonModel);
				Otable1.bindRows("/modelData");
				Otable2.setModel(that.jsonModel);
				Otable2.bindRows("/modelData");
			});

		},
		phaseCodesChange: function(oEvent) {
			debugger;
			var item = oEvent.getSource().getParent();
			var idx = item.getIndex();
			var thisRow = oEvent.getSource().getParent().getParent().getContextByIndex(idx).getObject();
            this.narIndices.push(idx);
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

				var isTask = that.jsonModel.getProperty("/LineItemEdits/" + idx + "/Zztskcd");
				that.jsonModel.setProperty("/LineItemEdits/" + idx + "/taskCodes", isTask.length ? [{
					TaskCodes: isTask,
					TaskCodeDesc: ""
				}].concat(taskCodes.results) : taskCodes.results);

				if (that.jsonModel.getProperty("/LineItemEdits/" + idx + "/Zzphase") === that.jsonModel.getProperty(
						"/LineItemEdits/" + idx + "/selectedPhaseCode")) {
					that.jsonModel.setProperty("/LineItemEdits/" + idx + "/selectedTaskCode", that.jsonModel.getProperty(
						"/LineItemEdits/" + idx + "/Zzphase"));
				} else {
					that.jsonModel.setProperty("/LineItemEdits/" + idx + "/selectedTaskCode", that.jsonModel.getProperty(
						"/LineItemEdits/" + idx + "/Zztskcd"));
				}
				var isAct = that.jsonModel.getProperty("/LineItemEdits/" + idx + "/Zzactcd");
				that.jsonModel.setProperty("/LineItemEdits/" + idx + "/actCodes", isAct.length ? [{
					ActivityCodes: isAct,
					ActivityCodeDesc: ""
				}].concat(activityCodes.results) : activityCodes.results);

				var isFFtsk = that.jsonModel.getProperty("/LineItemEdits/" + idx + "/Zzfftskcd");
				that.jsonModel.setProperty("/LineItemEdits/" + idx + "/ffTskCodes", isFFtsk.length ? [{
					FfTaskCodes: isFFtsk,
					FfTaskCodeDesc: ""
				}].concat(ffTskCodes.results) : ffTskCodes.results);
				var isFFact = that.jsonModel.getProperty("/LineItemEdits/" + idx + "/Zzffactcd");
				that.jsonModel.setProperty("/LineItemEdits/" + idx + "/ffActCodes", isFFact.length ? [{
					ffActCodes: isFFact,
					FfActivityCodeDesc: ""
				}].concat(ffActCodes.results) : ffActCodes.results);

			});
		},
		fftaskCodeChange: function(oEvent) {
			debugger;
			var InputFields = this.getView().getModel("InputsModel");

			InputFields.setProperty("/Inputs/isChanged", true);
			var item = oEvent.getSource().getParent();
			var idx = item.getIndex();
			var thisRow = oEvent.getSource().getParent().getParent().getContextByIndex(idx).getObject();
	        this.narIndices.push(idx);
			var ffTaskcodeselected = oEvent.getSource().getSelectedItem().getKey();
			var InputFields = this.getView().getModel("InputsModel");
			var pspid = InputFields.getProperty("/Inputs/rootPspid");
			sap.ui.core.BusyIndicator.show(0);
			var that = this;

			$.when(
				that.serviceInstance.getFFActivitycodes(that.WipEditModel, ffTaskcodeselected, pspid, that)
			)

			.done(function(ffActCodes) {
				debugger;
				sap.ui.core.BusyIndicator.hide(0);
				if (that.homeArr.length > 0) {

					var isffact = that.jsonModel.getProperty("/modelData/" + idx + "/Zzffactcd");
					that.jsonModel.setProperty("/modelData/" + idx + "/ffActCodes", isffact.length ? [{
						FfActivityCodeDesc: isffact,
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

		// onUpdateCodes: function() {
		// 	debugger;

		// 	this.aIndices = this.getView().byId("WipDetailsSet2").getSelectedIndices();
		// 	var sMsg;
		// 	if (this.aIndices.length < 1) {
		// 		sMsg = "Please Select Atleast One item";
		// 		this.showAlert("WIP Edit", sMsg);
		// 	} else {

		// 		var oView = this.getView();
		// 		var oDialog = this._getupdateCodesDialog();
		// 		oView.addDependent(oDialog);
		// 		oDialog.open();

		// 		sap.ui.core.Fragment.byId("update", "phaseCodeChk").setSelected(false);
		// 		sap.ui.core.Fragment.byId("update", "taskCodeChk").setSelected(false);
		// 		sap.ui.core.Fragment.byId("update", "ActivityCodeChk").setSelected(false);
		// 		sap.ui.core.Fragment.byId("update", "FFTaskCodeChk").setSelected(false);
		// 		sap.ui.core.Fragment.byId("update", "FFActCodeChk").setSelected(false);

		// 		this.updatesCodes = {
		// 			rowData: {},
		// 			phaseCodes: {},
		// 			taskCodes: {},
		// 			actCodes: {},
		// 			ffTskCodes: {},
		// 			ffActCodes: {},
		// 			selectedPhaseCode: "",
		// 			selectedTaskCode: "",
		// 			selectedActCode: "",
		// 			selectedFFTaskCode: "",
		// 			selectedFFActCode: ""

		// 		};

		// 		this.selectedRows = new JSONModel(this.updatesCodes);

		// 		var selectedrow = this.jsonModel.getProperty("/modelData/" + this.aIndices[0]);

		// 		//this.selectedRows.setProperty("/phaseCodes", selectedrow.phaseCodes);
		// 		this.selectedRows.setProperty("/taskCodes", selectedrow.taskCodes);
		// 		this.selectedRows.setProperty("/actCodes", selectedrow.actCodes);
		// 		this.selectedRows.setProperty("/ffTskCodes", selectedrow.ffTskCodes);
		// 		this.selectedRows.setProperty("/ffActCodes", selectedrow.ffActCodes);
		// 		this.selectedRows.setProperty("/rowData", selectedrow);
		// 		this._UpdateCodesDialog.setModel(this.selectedRows, "updatesCodesModel");
		// 	}

		// },
		// _getupdateCodesDialog: function() {
		// 	if (!this._UpdateCodesDialog) {
		// 		this._UpdateCodesDialog = sap.ui.xmlfragment("update", "wip.view.Dialog", this.getView().getController());
		// 	}
		// 	return this._UpdateCodesDialog;

		// },
		// UpdateCodesCancel: function() {
		// 	this._UpdateCodesDialog.close();
		// },
		// UpdateCodes: function() {

		// 	debugger;
		// 	var selectedLines = this.getView().byId("WipDetailsSet2").getSelectedIndices();
		// 	this.UpdateCodesCancel();
		// 	for (var c = 0; c < selectedLines.length; c++) {

		// 		var phaseCodeChk = sap.ui.core.Fragment.byId("update", "phaseCodeChk").getSelected();
		// 		var taskCodeChk = sap.ui.core.Fragment.byId("update", "taskCodeChk").getSelected();
		// 		var ActivityCodeChk = sap.ui.core.Fragment.byId("update", "ActivityCodeChk").getSelected();
		// 		var FFTaskCodeChk = sap.ui.core.Fragment.byId("update", "FFTaskCodeChk").getSelected();
		// 		var FFActCodeChk = sap.ui.core.Fragment.byId("update", "FFActCodeChk").getSelected();

		// 		// if (phaseCodeChk === true) {
		// 		// 	this.jsonModel.setProperty("/LineItemEdits/" + selectedLines[c] + "/phaseCodes", this.selectedRows.getProperty(
		// 		// 		"/phaseCodes"));
		// 		// 	this.jsonModel.setProperty("/LineItemEdits/" + selectedLines[c] + "/selectedPhaseCode", sap.ui.core.Fragment.byId("update",
		// 		// 		"selectedPhaseCode").getSelectedKey());
		// 		// 	this.BillEditModel.setProperty("/LineItemEdits/" + selectedLines[c] + "/isRowEdited", true);

		// 		// }
		// 		if (taskCodeChk === true && phaseCodeChk === true) {

		// 			this.jsonModel.setProperty("/modelData/" + selectedLines[c] + "/taskCodes", this.selectedRows.getProperty(
		// 				"/taskCodes"));
		// 			this.jsonModel.setProperty("/modelData/" + selectedLines[c] + "/selectedTaskCode", sap.ui.core.Fragment.byId("update",
		// 				"selectedTaskCode").getSelectedKey());
		// 			//this.BillEditModel.setProperty("/LineItemEdits/" + selectedLines[c] + "/isRowEdited", true);
		// 		}
		// 		if (ActivityCodeChk === true) {

		// 			this.jsonModel.setProperty("/modelData/" + selectedLines[c] + "/actCodes", this.selectedRows.getProperty(
		// 				"/actCodes"));
		// 			this.jsonModel.setProperty("/modelData/" + selectedLines[c] + "/selectedActCode", sap.ui.core.Fragment.byId("update",
		// 				"selectedActCode").getSelectedKey());

		// 		}
		// 		if (FFTaskCodeChk === true) {

		// 			this.jsonModel.setProperty("/modelData/" + selectedLines[c] + "/ffTskCodes", this.selectedRows.getProperty(
		// 				"/ffTskCodes"));
		// 			this.jsonModel.setProperty("/modelData/" + selectedLines[c] + "/selectedFFTaskCode", sap.ui.core.Fragment.byId("update",
		// 				"selectedFFTaskCode").getSelectedKey());

		// 		}
		// 		if (FFActCodeChk === true && FFTaskCodeChk === true) {

		// 			this.jsonModel.setProperty("/modelData/" + selectedLines[c] + "/ffActCodes", this.selectedRows.getProperty(
		// 				"/ffActCodes"));
		// 			this.jsonModel.setProperty("/modelData/" + selectedLines[c] + "/selectedFFActCode", sap.ui.core.Fragment.byId("update",
		// 				"selectedFFActCode").getSelectedKey());
		// 		}

		// 	}
		// },
		// UpdateCodesffTaskcodechange: function(oEvent) {
		// 	debugger;
		// 	var ffTaskcodeselected = oEvent.getSource().getSelectedItem().getKey();

		// 	var InputFields = this.getView().getModel("InputsModel");
		// 	var pspid = InputFields.getProperty("/Inputs/rootPspid");
		// 	sap.ui.core.BusyIndicator.show(0);
		// 	var that = this;

		// 	$.when(
		// 		that.serviceInstance.getFFActivitycodes(that.WipEditModel, ffTaskcodeselected, pspid, that)
		// 	)

		// 	.done(function(updateffActCodes) {
		// 		debugger;
		// 		that.selectedRows.setProperty("/ffActCodes", updateffActCodes.results);

		// 	});
		// },
		// onUpdateCodes: function() {
		// 	debugger;
		// 	this.aIndices = this.getView().byId(this.tableId).getSelectedIndices();
		// 	var sMsg;
		// 	var check = false;
		// 	if (this.aIndices.length < 1) {
		// 		sMsg = "Please Select Atleast One item";
		// 		this.showAlert("WIP Edit", sMsg);

		// 	} else {

		// 		var oView = this.getView();
		// 		if (this.tableId === "WipDetailsSet2") {
		// 			var oDialog = this._getupdateCodesDialog();
		// 			oView.addDependent(oDialog);
		// 			oDialog.open();
		// 			var i = 0;
		// 			check = true;
		// 		} else {

		// 			var Tomatters = [];
		// 			var check = false;
		// 			var oTable = this.getView().byId(this.tableId);
		// 			$.each(oTable.getSelectedIndices(), function(j, o) {
		// 				var ctx = oTable.getContextByIndex(o);
		// 				var m = ctx.getObject();
		// 				var ToMatter = m.ToMatter;
		// 				Tomatters.push(ToMatter);
		// 			});
		// 			for (var j = 1; j < Tomatters.length; j++) {
		// 				if (Tomatters[j] !== Tomatters[0]) {
		// 					check = false;
		// 					alert("please check the matter numbers");
		// 				} else {
		// 					check = true;
		// 					var oTDialog = this._gettransferupdateCodesDialog();
		// 					oView.addDependent(oTDialog);
		// 					oTDialog.open();
		// 					var i = 1;

		// 				}
		// 			}

		// 		}
		// 		if (check) {
		// 			sap.ui.core.Fragment.byId("update", "phaseCodeChk" + i).setSelected(false);
		// 			sap.ui.core.Fragment.byId("update", "taskCodeChk" + i).setSelected(false);
		// 			sap.ui.core.Fragment.byId("update", "ActivityCodeChk" + i).setSelected(false);
		// 			sap.ui.core.Fragment.byId("update", "FFTaskCodeChk" + i).setSelected(false);
		// 			sap.ui.core.Fragment.byId("update", "FFActCodeChk" + i).setSelected(false);

		// 			this.updatesCodes = {
		// 				rowData: {},
		// 				phaseCodes: {},
		// 				taskCodes: {},
		// 				actCodes: {},
		// 				ffTskCodes: {},
		// 				ffActCodes: {},
		// 				selectedPhaseCode: "",
		// 				selectedTaskCode: "",
		// 				selectedActCode: "",
		// 				selectedFFTaskCode: "",
		// 				selectedFFActCode: ""

		// 			};
		// 			this.updatesCodes1 = {
		// 				rowData: {},
		// 				phaseCodes: {},
		// 				taskCodes: {},
		// 				actCodes: {},
		// 				ffTskCodes: {},
		// 				ffActCodes: {},
		// 				selectedPhaseCode: "",
		// 				selectedTaskCode: "",
		// 				selectedActCode: "",
		// 				selectedFFTaskCode: "",
		// 				selectedFFActCode: ""

		// 			};

		// 			this.selectedRows = new JSONModel(this.updatesCodes);

		// 			var selectedrow = this.jsonModel.getProperty("/modelData/" + this.aIndices[0]);

		// 			//this.selectedRows.setProperty("/phaseCodes", selectedrow.phaseCodes);
		// 			this.selectedRows.setProperty("/taskCodes", selectedrow.taskCodes);
		// 			this.selectedRows.setProperty("/actCodes", selectedrow.actCodes);
		// 			this.selectedRows.setProperty("/ffTskCodes", selectedrow.ffTskCodes);
		// 			this.selectedRows.setProperty("/ffActCodes", selectedrow.ffActCodes);
		// 			this.selectedRows.setProperty("/rowData", selectedrow);
		// 			if (this.tableId === "WipDetailsSet3") {
		// 				this._transferUpdateCodesDialog.setModel(this.selectedRows, "updatesCodesModel1");
		// 			} else {
		// 				this._UpdateCodesDialog.setModel(this.selectedRows, "updatesCodesModel");
		// 			}

		// 		}
		// 	}

		// },
		
		onUpdateCodes: function() {
			debugger;
			if (this.tableId === "WipDetailsSet3") {
				var modelValues = this.jsonModel.oData.modelData;
				var tomatteridx = [];
				var tomatters=[];
				for (var i = 0; i < modelValues.length; i++) {
					var tomatter = modelValues[i].ToMatter;
					if (tomatter !== "") {
						tomatteridx.push(i);
						tomatters.push(tomatter);
					}

				}
				this.aIndices = tomatteridx;
			}
			else
			{
				this.aIndices = this.getView().byId(this.tableId).getSelectedIndices();
			}
			
			var sMsg;
			var check = false;
			if (this.aIndices.length < 1) {
				sMsg = "Please Select Atleast One item";
				this.showAlert("WIP Edit", sMsg);

			} else {

				var oView = this.getView();
				if (this.tableId === "WipDetailsSet2") {
					var oDialog = this._getupdateCodesDialog();
					oView.addDependent(oDialog);
					oDialog.open();
					var i = 0;
					check = true;
				} else {

					var Tomatters = tomatters;
					var check = false;
					// var oTable = this.getView().byId(this.tableId);
					// $.each(oTable.getSelectedIndices(), function(j, o) {
					// 	var ctx = oTable.getContextByIndex(o);
					// 	var m = ctx.getObject();
					// 	var ToMatter = m.ToMatter;
					// 	Tomatters.push(ToMatter);
					// });
					var matter = [];
					for (var j = 1; j < Tomatters.length; j++) {
						if (Tomatters[j] !== Tomatters[0]) {
							check = false;
							matter.push(Tomatters[j]);
						}

					}
					if (matter.length === 0) {
						check = true;
						var oTDialog = this._gettransferupdateCodesDialog();
						oView.addDependent(oTDialog);
						oTDialog.open();
						var i = 1;
					} else {
						alert("please check the matter number");
					}

				}
				if (check) {
					sap.ui.core.Fragment.byId("update", "phaseCodeChk" + i).setSelected(false);
					sap.ui.core.Fragment.byId("update", "taskCodeChk" + i).setSelected(false);
					sap.ui.core.Fragment.byId("update", "ActivityCodeChk" + i).setSelected(false);
					sap.ui.core.Fragment.byId("update", "FFTaskCodeChk" + i).setSelected(false);
					sap.ui.core.Fragment.byId("update", "FFActCodeChk" + i).setSelected(false);

					this.updatesCodes = {
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
					this.updatesCodes1 = {
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

					this.selectedRows = new JSONModel(this.updatesCodes);

					var selectedrow = this.jsonModel.getProperty("/modelData/" + this.aIndices[0]);

					//this.selectedRows.setProperty("/phaseCodes", selectedrow.phaseCodes);
					this.selectedRows.setProperty("/taskCodes", selectedrow.taskCodes);
					this.selectedRows.setProperty("/actCodes", selectedrow.actCodes);
					this.selectedRows.setProperty("/ffTskCodes", selectedrow.ffTskCodes);
					this.selectedRows.setProperty("/ffActCodes", selectedrow.ffActCodes);
					this.selectedRows.setProperty("/rowData", selectedrow);
					if (this.tableId === "WipDetailsSet3") {
						this._transferUpdateCodesDialog.setModel(this.selectedRows, "updatesCodesModel1");
					} else {
						this._UpdateCodesDialog.setModel(this.selectedRows, "updatesCodesModel");
					}

				}
			}

		},
		
		_getupdateCodesDialog: function() {
			if (!this._UpdateCodesDialog) {
				this._UpdateCodesDialog = sap.ui.xmlfragment("update", "wip.view.Dialog", this.getView().getController());
			}
			return this._UpdateCodesDialog;

		},
		_gettransferupdateCodesDialog: function() {
			if (!this._transferUpdateCodesDialog) {
				this._transferUpdateCodesDialog = sap.ui.xmlfragment("update", "wip.view.LineitemTransferDialog", this.getView().getController());
			}
			return this._transferUpdateCodesDialog;

		},
		UpdateCodesCancel: function() {
			if (this.tableId === "WipDetailsSet2") {
				this._UpdateCodesDialog.close();
			} else {
				this._transferUpdateCodesDialog.close();
			}

		},
		// UpdateCodes: function() {

		// 	debugger;
		// 	var selectedLines = this.getView().byId(this.tableId).getSelectedIndices();
		// 	this.UpdateCodesCancel();
		// 	if (this.tableId === "WipDetailsSet2") {
		// 		var i = 0;

		// 	} else {
		// 		var i = 1;
		// 	}
		// 	for (var c = 0; c < selectedLines.length; c++) {

		// 		var phaseCodeChk = sap.ui.core.Fragment.byId("update", "phaseCodeChk" + i).getSelected();
		// 		var taskCodeChk = sap.ui.core.Fragment.byId("update", "taskCodeChk" + i).getSelected();
		// 		var ActivityCodeChk = sap.ui.core.Fragment.byId("update", "ActivityCodeChk" + i).getSelected();
		// 		var FFTaskCodeChk = sap.ui.core.Fragment.byId("update", "FFTaskCodeChk" + i).getSelected();
		// 		var FFActCodeChk = sap.ui.core.Fragment.byId("update", "FFActCodeChk" + i).getSelected();

		// 		// if (phaseCodeChk === true) {
		// 		// 	this.jsonModel.setProperty("/LineItemEdits/" + selectedLines[c] + "/phaseCodes", this.selectedRows.getProperty(
		// 		// 		"/phaseCodes"));
		// 		// 	this.jsonModel.setProperty("/LineItemEdits/" + selectedLines[c] + "/selectedPhaseCode", sap.ui.core.Fragment.byId("update",
		// 		// 		"selectedPhaseCode").getSelectedKey());
		// 		// 	this.BillEditModel.setProperty("/LineItemEdits/" + selectedLines[c] + "/isRowEdited", true);

		// 		// }
		// 		if (taskCodeChk === true && phaseCodeChk === true) {

		// 			this.jsonModel.setProperty("/modelData/" + selectedLines[c] + "/taskCodes", this.selectedRows.getProperty(
		// 				"/taskCodes"));
		// 			this.jsonModel.setProperty("/modelData/" + selectedLines[c] + "/selectedTaskCode", sap.ui.core.Fragment.byId("update",
		// 				"selectedTaskCode" + i).getSelectedKey());
		// 			//this.BillEditModel.setProperty("/LineItemEdits/" + selectedLines[c] + "/isRowEdited", true);
		// 		}
		// 		if (ActivityCodeChk === true) {

		// 			this.jsonModel.setProperty("/modelData/" + selectedLines[c] + "/actCodes", this.selectedRows.getProperty(
		// 				"/actCodes"));
		// 			this.jsonModel.setProperty("/modelData/" + selectedLines[c] + "/selectedActCode", sap.ui.core.Fragment.byId("update",
		// 				"selectedActCode" + i).getSelectedKey());

		// 		}
		// 		if (FFTaskCodeChk === true) {

		// 			this.jsonModel.setProperty("/modelData/" + selectedLines[c] + "/ffTskCodes", this.selectedRows.getProperty(
		// 				"/ffTskCodes"));
		// 			this.jsonModel.setProperty("/modelData/" + selectedLines[c] + "/selectedFFTaskCode", sap.ui.core.Fragment.byId("update",
		// 				"selectedFFTaskCode" + i).getSelectedKey());

		// 		}
		// 		if (FFActCodeChk === true && FFTaskCodeChk === true) {

		// 			this.jsonModel.setProperty("/modelData/" + selectedLines[c] + "/ffActCodes", this.selectedRows.getProperty(
		// 				"/ffActCodes"));
		// 			this.jsonModel.setProperty("/modelData/" + selectedLines[c] + "/selectedFFActCode", sap.ui.core.Fragment.byId("update",
		// 				"selectedFFActCode" + i).getSelectedKey());
		// 		}

		// 	}

		// },
		
		
		UpdateCodes: function() {

			debugger;
		
			this.UpdateCodesCancel();
			if (this.tableId === "WipDetailsSet2") {
				var i = 0;
					var selectedLines = this.getView().byId(this.tableId).getSelectedIndices();

			} else {
				var i = 1;
				var selectedLines=this.aIndices;
			}
			for (var c = 0; c < selectedLines.length; c++) {

				var phaseCodeChk = sap.ui.core.Fragment.byId("update", "phaseCodeChk" + i).getSelected();
				var taskCodeChk = sap.ui.core.Fragment.byId("update", "taskCodeChk" + i).getSelected();
				var ActivityCodeChk = sap.ui.core.Fragment.byId("update", "ActivityCodeChk" + i).getSelected();
				var FFTaskCodeChk = sap.ui.core.Fragment.byId("update", "FFTaskCodeChk" + i).getSelected();
				var FFActCodeChk = sap.ui.core.Fragment.byId("update", "FFActCodeChk" + i).getSelected();

				// if (phaseCodeChk === true) {
				// 	this.jsonModel.setProperty("/LineItemEdits/" + selectedLines[c] + "/phaseCodes", this.selectedRows.getProperty(
				// 		"/phaseCodes"));
				// 	this.jsonModel.setProperty("/LineItemEdits/" + selectedLines[c] + "/selectedPhaseCode", sap.ui.core.Fragment.byId("update",
				// 		"selectedPhaseCode").getSelectedKey());
				// 	this.BillEditModel.setProperty("/LineItemEdits/" + selectedLines[c] + "/isRowEdited", true);

				// }
				if (taskCodeChk === true && phaseCodeChk === true) {

					this.jsonModel.setProperty("/modelData/" + selectedLines[c] + "/taskCodes", this.selectedRows.getProperty(
						"/taskCodes"));
					this.jsonModel.setProperty("/modelData/" + selectedLines[c] + "/selectedTaskCode", sap.ui.core.Fragment.byId("update",
						"selectedTaskCode" + i).getSelectedKey());
					//this.BillEditModel.setProperty("/LineItemEdits/" + selectedLines[c] + "/isRowEdited", true);
				}
				if (ActivityCodeChk === true) {

					this.jsonModel.setProperty("/modelData/" + selectedLines[c] + "/actCodes", this.selectedRows.getProperty(
						"/actCodes"));
					this.jsonModel.setProperty("/modelData/" + selectedLines[c] + "/selectedActCode", sap.ui.core.Fragment.byId("update",
						"selectedActCode" + i).getSelectedKey());

				}
				if (FFTaskCodeChk === true) {

					this.jsonModel.setProperty("/modelData/" + selectedLines[c] + "/ffTskCodes", this.selectedRows.getProperty(
						"/ffTskCodes"));
					this.jsonModel.setProperty("/modelData/" + selectedLines[c] + "/selectedFFTaskCode", sap.ui.core.Fragment.byId("update",
						"selectedFFTaskCode" + i).getSelectedKey());

				}
				if (FFActCodeChk === true && FFTaskCodeChk === true) {

					this.jsonModel.setProperty("/modelData/" + selectedLines[c] + "/ffActCodes", this.selectedRows.getProperty(
						"/ffActCodes"));
					this.jsonModel.setProperty("/modelData/" + selectedLines[c] + "/selectedFFActCode", sap.ui.core.Fragment.byId("update",
						"selectedFFActCode" + i).getSelectedKey());
				}

			}

		},
		
		UpdateCodesffTaskcodechange: function(oEvent) {
			debugger;
			var ffTaskcodeselected = oEvent.getSource().getSelectedItem().getKey();

			var InputFields = this.getView().getModel("InputsModel");
			var pspid = InputFields.getProperty("/Inputs/rootPspid");
			sap.ui.core.BusyIndicator.show(0);
			var that = this;

			$.when(
				that.serviceInstance.getFFActivitycodes(that.WipEditModel, ffTaskcodeselected, pspid, that)
			)

			.done(function(updateffActCodes) {
				debugger;
				that.selectedRows.setProperty("/ffActCodes", updateffActCodes.results);

			});
		},

		onConsolidate: function() {
			debugger;
			var passingArray = [];

			var oModel = this.getOwnerComponent().getModel().sServiceUrl;

			var InputFields = this.getView().getModel("InputsModel");

			var oTable = this.getView().byId("smartTable_ResponsiveTable3").getTable();

			oTable.getSelectedIndices().forEach(function(j, o) {

				var ctx = oTable.getContextByIndex(o);
				var m = ctx.getObject();
				passingArray.push(m);

			});

			var docNumber = "";
			passingArray.forEach(function(item) {

				docNumber = docNumber + item.Belnr + ',';

			});
			var lastIndex = docNumber.lastIndexOf(",");
			docNumber = docNumber.substring(0, lastIndex);

			var userServiceUrl = oModel + InputFields.getProperty("/Inputs/services/WIPTRANSFER") +
				InputFields.getProperty("/Inputs/qParms/ACTION") +
				InputFields.getProperty("/Inputs/action/CONSOLIDATE") +
				InputFields.getProperty("/Inputs/lsValues/CONUMBER") +
				"'" + docNumber + "'" +
				InputFields.getProperty("/Inputs/lsValues/Buzei") + "''" +
				InputFields.getProperty("/Inputs/lsValues/Hours") + "''" +
				InputFields.getProperty("/Inputs/lsValues/Percentage") + "''" +
				InputFields.getProperty("/Inputs/lsValues/ToActivityCode") + "''" +
				InputFields.getProperty("/Inputs/lsValues/ToFfActivityCode") + "''" +
				InputFields.getProperty("/Inputs/lsValues/ToFfTaskCode") + "''" +
				InputFields.getProperty("/Inputs/lsValues/ToMatter") + "''" +
				InputFields.getProperty("/Inputs/lsValues/ToTaskCode") + "''" +
				InputFields.getProperty("/Inputs/qParms/JSON");

			console.log(userServiceUrl);

			var that = this;

			//consolidate service calling

			LineItemsServices.getInstance().onConsolidate(userServiceUrl)
				.done(function(oData) {
					debugger;

					var tableLineEdits = that.getView().byId("WipDetailsSet3");
					var index = tableLineEdits.getSelectedIndices();

					//    for (var i = 0; i < index.length; i++) {
					// tableLineEdits.getRows()[index[i]].getCells()[0].setVisible(true);

					// if (text === "Reviewed") {
					// 	tableLineEdits.getRows()[index[i]].getCells()[0].setTooltip("Reviewed");
					// } else {
					// 	tableLineEdits.getRows()[index[i]].getCells()[0].setTooltip("Unreviewed");
					// }

					//   }

					var i = 0;

					$.each(index, function(k, o) {
						// we can access the row wise context for the table
						var errorDefined = oData.d.results[i].Message;
						tableLineEdits.getRows()[o].getCells()[0].setVisible(true);

						if (errorDefined.includes("ERROR")) {

							tableLineEdits.getRows()[o].getCells()[0].setProperty("color", "red");
							tableLineEdits.getRows()[o].getCells()[0].setTooltip(errorDefined);

						} else {

							tableLineEdits.getRows()[o].getCells()[0].setProperty("color", "red");
							tableLineEdits.getRows()[o].getCells()[0].setTooltip(errorDefined);

						}

						i++;

					});

				})
				.fail(function() {
					debugger;
					alert("Fail");

				});

		},

		onSave: function(oEvt) {
			debugger;
			var sServiceUrl = this.getOwnerComponent().getModel().sServiceUrl;
			var that = this;
			$.each(that.uniqueId, function(i) {
				var narStr = that.rowData[i];
				that.saveObjects.push(narStr);
			});
			var changeObj = this.saveObjects;
			$.each(changeObj, function(i, obj) {
				var obj1 = {
					NarrativeString: obj.NarrativeString
				};

				var obj2 = {
					Pspid: obj.Pspid,
					Tdid: obj.Tdid,
					Tdname: obj.Tdname,
					Tdobject: obj.Tdobject,
					Pernr: obj.Pernr
				};
				var req = {},
					requestBody = {};
				var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
				requestBody = obj1;
				req = obj2;
				var sPath = "/WipDetailsSet(Pspid='" + req.Pspid + "',Tdid='" + req.Tdid + "',Tdname='" + req.Tdname + "',Tdobject='" + req.Tdobject +
					"',Pernr='" + req.Pernr + "')";
				
				oModel.update(sPath, requestBody, req);

			});
			this.saveObjects = [];

		}
		// onSave: function(oEvt) {
		// 	var that = this;
		// 	$.each(this.narIndices, function(i, el) {
		// 		if ($.inArray(el, that.uniqueId) === -1) that.uniqueId.push(el);
		// 	});
		// 	var sServiceUrl = this.getOwnerComponent().getModel().sServiceUrl;
		// 	$.each(that.uniqueId, function(i) {
		// 		var rowdat = that.rowData[i];
		// 		that.saveObjects.push(rowdat);
		// 	});
		// 	var finalArray = this.saveObjects;
		// 	this.saveObjects = [];
		
		// 	var oComponent = this.getOwnerComponent(),

		// 		oFModel = oComponent.getModel(),
		// 		tData = $.extend(true, [], finalArray),
		// 		urlParams,
		// 		CoNumber = [],
		// 		Hours = [],
		// 		Percentage = [],
		// 		ToActivityCode = [],
		// 		ToFfActivityCode = [],
		// 		ToFfTaskCode = [],
		// 		ToMatter = [],
		// 		ToTaskCode = [],
		// 		ToPhaseCode = [],
		// 		Buzei = [];

		// 	$.each(tData, function(i, o) {
		// 		CoNumber.push(o.Belnr);

		// 		Hours.push(o.Megbtr);
		// 		Percentage.push(o.Percent);
		// 		ToActivityCode.push(o.Zzactcd);
		// 		ToFfActivityCode.push(o.Zzffactcd);
		// 		ToFfTaskCode.push(o.Zzfftskcd);
		// 		ToMatter.push(o.Pspid);
		// 		ToTaskCode.push(o.Zztskcd);
		// 		ToPhaseCode.push(o.Zzphase);
		// 		Buzei.push(o.Buzei);
		// 	});

		// 	urlParams = {

		// 		Action: "EDIT",
		// 		CoNumber: CoNumber,
		// 		Hours: Hours,
		// 		Percentage: Percentage,
		// 		ToActivityCode: ToActivityCode,
		// 		ToFfActivityCode: ToFfActivityCode,
		// 		ToFfTaskCode: ToFfTaskCode,
		// 		ToMatter: ToMatter,
		// 		ToTaskCode: ToTaskCode,
		// 		ToPhaseCode: ToPhaseCode,
		// 		Buzei: Buzei

		// 	};
	     
		
		// 	var jsonModel = that.getView().getModel("JSONModel");

		// 	oFModel.callFunction("/WIPTRANSFER", {
		// 		method: "GET",
		// 		urlParameters: urlParams,
		// 		success: function(oData) {

		// 			sap.ui.core.BusyIndicator.hide();
		// 			var res = oData.results;
		// 			for (var i = 0; i < res.length; i++) {
		// 				that.msgTxt = res[i].Message;
		// 				/*	msgs.push(msgTxt);*/
		// 				// if (that.msgTxt !== "") {
		// 				// 	var cells = rows[i + 1].getCells();
		// 				// 	cells[9].setProperty("visible", true);
		// 				// 	cells[9].setTooltip(that.msgTxt);
		// 				// }

		// 			}
		// 			// jsonModel.setProperty("/modelData", oData.results);

		// 		}
		// 	});

		// }

	});

});