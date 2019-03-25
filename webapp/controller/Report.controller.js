sap.ui.define([
	"wip/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"wip/model/formatter",
	"sap/ui/core/routing/History",
	"sap/ui/model/Filter",
	"wip/model/ReportModel",
	"sap/ui/model/FilterOperator",
	"wip/services/LineItemsServices",
	"wip/services/SplitItemsServices",
	"wip/typo/typo",
	"wip/dist/caret",
	"sap/m/MessageBox"

], function(BaseController, JSONModel, formatter, History, Filter, ReportModel, FilterOperator, LineItemsServices, SplitItemsServices,
	typo, caret, MessageBox) {
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
			this.rowLineItemCount = [];
			this.arr = [];
			this.rowData = [];
			this.aFilter = [];
			this._oGlobalFilter = [];

			this.uniqueIdTransfer = [];
			this.index = [];
			this.indexes = [];
			this.transferArray = [];
			this.idxToPass = [];

			this.jsonModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.jsonModel, "JSONModel");
			this.getView().setModel(new ReportModel().getModel(), "InputsModel");
			this.onHide();

			this.spanId = 0;
			this.currentSpanId = "";
			this.menurowid = 0;
			this.ignoreAllArr = [];
			this.wrongWordsArr = [];
			this.igno = [];
			this.dictionaryLib = new Typo("en_US", false, false, {
				dictionaryPath: location.protocol + '//' + location.host + "/webapp/typo/dictionaries"
			});

		},
		dictionaryChange: function(oEvent) {
			debugger;
			var key;
			var that = this;
			var selectedText = this.getView().byId("comboPosition").getValue();
			var InputFields = this.getView().getModel("InputsModel");
			var dictionary = InputFields.getProperty("/Inputs/Countries_collection");
			for (var i = 0; i < dictionary.length; i++) {
				if (dictionary[i].Text === selectedText) {
					key = dictionary[i].Key;
					this.dictionaryLib = new Typo(key, false, false, {
						dictionaryPath: location.protocol + '//' + location.host + "/webapp/typo/dictionaries"
					});
					that.handlespellcheck(that.homeArr);

					that.jsonModel.setProperty("/modelData", that.homeArr);

					that.settimeout();
					that.onNarativeTexChange();
				}
			}

		},

		resetOffset: function($textField) {

			console.log("resetOffset")
			var offset = $textField.caret('offset');
			var position = $textField.caret('pos');

			return position;
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
			LineItemsServices.getInstance().selectListItem(oModel, aFilter)
				.done(function(oData) {

				})
				.fail(function() {

				});
			sap.ui.core.BusyIndicator.show(0);
			var that = this;
			this.byId("idIconTabBar").setSelectedKey("Home");
			oModel.read("/WipDetailsSet", {
				filters: aFilter,
				success: function(oData) {

					debugger;
					sap.ui.core.BusyIndicator.hide(0);

					that.arr = oData.results;
					for (var i = 0; i < that.arr.length; i++) {

						that.arr[i].NarrativeStringSpell = that.arr[i].NarrativeString;

					}
					that.homeArr = that.arr;
					that.jsonModel.setProperty("/RowCount", oData.results.length);
					that.jsonModel.setProperty("/RowCount1", oData.results.length);
					that.jsonModel.setProperty("/RowCount2", oData.results.length);
					that.jsonModel.setProperty("/RowCount3", oData.results.length);
					that.jsonModel.setProperty("/modelData", that.arr);
					that.jsonModel.setProperty("/Matter", oData.results[0].Pspid);
					that.jsonModel.setProperty("/LeadPartner", oData.results[1].Sname);
					that.jsonModel.setProperty("/BillingOffice", oData.results[0].Werks);

					that.rowData = [];
					that.homeArr.forEach(function(o, k) {
						that.rowData[k] = o;
					});

					that.getView().byId("WipDetailsSet").setModel(that.jsonModel);
					var Otable = that.getView().byId("WipDetailsSet");
					Otable.bindRows("/modelData");
					that.getView().byId("WipDetailsSet1").setModel(that.jsonModel);
					var Otable1 = that.getView().byId("WipDetailsSet1");
					Otable1.bindRows("/modelData");
					var NarrativeRows = that.homeArr.length;
					for (var i = 0; i < NarrativeRows; i++) {
						var oldnerst = that.homeArr[i].NarrativeString;
						var nerst = that.homeArr[i].NarrativeString;
						var specialChars = /([\d!~@#$%^&*()_+\=\[\]{};':"\\|,.<>\/?]+)/;
						var word = nerst.split(" ");

						var sampletext = "";
						for (var j = 0; j < word.length; j++) {
							var splitword = word[j];
							var splitword1 = word[j];

							if (specialChars.test(splitword)) {

								var numericItem = "";
								var subText = splitword.replace(/\'/g, '').split(/([\d!~@#$%^&*()_+\=\[\]{};':"\\|,.<>\/?]+)/).filter(Boolean);

								subText.forEach(function(subItem) {

									if (specialChars.test(subItem)) {

										numericItem = numericItem + subItem;
									} else {

										if (that.dictionaryLib.check(subItem) == false) {

											numericItem = numericItem + '<span id="id' + that.spanId +
												'"class="target">' + subItem + '</span>';

											that.wrongWordsArr.push({
												rowId: i,
												id: "#id" + that.spanId,
												Text: subItem
											});

											that.spanId++;

										} else {

											numericItem = numericItem + subItem;
										}

									}

								});

								sampletext = sampletext + " " + numericItem;

							} else {

								if (that.dictionaryLib.check(splitword) == false) {

									sampletext = sampletext + ' <span id="id' + that.spanId +
										'"class="target">' + splitword + '</span>';

									that.wrongWordsArr.push({
										rowId: i,
										id: "#id" + that.spanId,
										Text: splitword
									});

									that.spanId++;

								} else {

									sampletext = sampletext + " " + splitword;

								}
							}
							if (word.length - 1 === j) {
								that.homeArr[i].NarrativeStringSpell = sampletext;
								console.log(that.homeArr[i].NarrativeStringSpell);
							}
						}
						if (NarrativeRows - 1 === i) {
							that.jsonModel.setProperty("/modelData", that.homeArr);
						}

					}

				}
			});

			var InputFields = this.getView().getModel("InputsModel");
			var filters = InputFields.getProperty("/Inputs/Filters/filters");
			for (var i = 1; i <= filters.length; i++) {
				var table = InputFields.getProperty("/Inputs/Filters/Filter" + i + "/table");
				otable.push(table);

			}
			InputFields.setProperty("/Inputs/rootPspid", Pspid);

			InputFields.setProperty("/Inputs/IconTabs/Narrative_Edits", true);
			InputFields.setProperty("/Inputs/IconTabs/Line_Item_Edits", true);
			InputFields.setProperty("/Inputs/IconTabs/Line_Item_Transfers", true);

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
		handleIconTabBarSelect: function(oEvent) {
			debugger;
			var that = this;
			var InputFields = this.getView().getModel("InputsModel");
			var change = oEvent.getSource();

			var value = change.getSelectedKey();

			this.ReloadTable();

			if (value === "NarrativeEdits") {

				var Otable = this.getView().byId("WipDetailsSet1");

				this.byId("searchText1").setValue("");
				this.jsonModel.setProperty("/RowCount1", this.arr.length);

				this.jsonModel.setProperty("/modelData", this.arr);

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

				this.onNarativeTexChange();

			} else if (value === "LineItemEdits") {
				this.byId("searchText2").setValue("");
				this.jsonModel.setProperty("/RowCount2", this.arr.length);
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

			} else if (value === "LineItemTransfers") {
				this.byId("searchText3").setValue("");
				this.jsonModel.setProperty("/RowCount3", this.arr.length);
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

				InputFields.setProperty("/Inputs/ToolbarEnable/Consolidate", false);
				InputFields.setProperty("/Inputs/ToolbarEnable/Mass_Transfer", false);
				InputFields.setProperty("/Inputs/ToolbarEnable/Updatecodes", false);
				InputFields.setProperty("/Inputs/ToolbarEnable/Split_Transfer", false);
				this.tableId = "WipDetailsSet3";

			} else {
				this.byId("searchText").setValue("");
				this.jsonModel.setProperty("/modelData", this.arr);

				this.getView().byId("WipDetailsSet").setModel(this.jsonModel);
				var Otable = this.getView().byId("WipDetailsSet");
				Otable.bindRows("/modelData");
				this.jsonModel.setProperty("/RowCount", this.arr.length);

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

			}
			this.settimeout();
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
			for (var i = 0; i < rowCount.length; i++) {
				this.rowLineItemCount.push(rowCount[i]);
			}

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

			var NarStr;

			this.rowData.forEach(function(o, k) {
				data[k] = o;
			});

			var that = this;

			var endChars = [".", "?", "!", "\"", "'"];

			res = $.each(data, function(item) {
				var narString = data[item].NarrativeString;
				NarStr = that.capitalizeFirstLetter(data[item].NarrativeString);
				data[item].NarrativeStringSpell = NarStr;
				data[item].NarrativeString = NarStr;

				if (NarStr !== "") {
					var lastChar = NarStr.charAt(NarStr.length - 1);
					if (endChars.indexOf(lastChar.slice(-1)) === -1) {
						NarStr = NarStr + ".";
						data[item].NarrativeStringSpell = NarStr;
						data[item].NarrativeString = NarStr;

					}
					that.rowData[item].NarrativeStringSpell = NarStr;
					if (narString != data[item].NarrativeString) {
						that.saveObjects.push(data[item]);
					}

					return data[item].NarrativeStringSpell;
				}

			});

			var data1 = this.handlespellcheck(data);

			this.jsonModel.setProperty("/modelData", data1);
			this.rowData === data1;
			this.getView().byId("WipDetailsSet1").setModel(this.jsonModel);
			Otable.bindRows("/modelData");
			this.settimeout();
			this.onNarativeTexChange();
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
				var narStr = data[item].NarrativeString;
				result = data[item].NarrativeString.replace(/\s+/g, " ").trim();
				var lastChar = result.charAt(result.length - 1);
				var spaceLastChar = result.charAt(result.length - 2);

				if (lastChar === "." && spaceLastChar === " ") {

					result = that.remove_character(result, result.length - 2);

				}

				data[item].NarrativeString = result;
				data[item].NarrativeStringSpell = result;
				if (narStr != result) {
					that.saveObjects.push(data[item]);
				}

				return data[item].NarrativeString;
			});
			var data1 = this.handlespellcheck(res);
			this.jsonModel.setProperty("/modelData", data1);
			var Otable = this.getView().byId("WipDetailsSet1");
			// this.jsonModel.setData(res);
			this.getView().byId("WipDetailsSet1").setModel(this.jsonModel);
			Otable.bindRows("/modelData");
			this.settimeout();
			this.onNarativeTexChange();
		},

		handlespellcheck: function(data) {
			var that = this;
			debugger;
			var NarrativeRows = data.length;
			for (var i = 0; i < NarrativeRows; i++) {
				var oldnerst = that.homeArr[i].NarrativeString;
				var nerst = that.homeArr[i].NarrativeString;
				var specialChars = /([\d!~@#$%^&*()_+\=\[\]{};':"\\|,.<>\/?]+)/;
				var word = nerst.split(" ");

				var sampletext = "";
				for (var j = 0; j < word.length; j++) {
					var splitword = word[j];
					var splitword1 = word[j];

					if (this.igno.includes(splitword)) {
						sampletext = sampletext + " " + splitword;
					} else {
						if (specialChars.test(splitword)) {

							var numericItem = "";
							var subText = splitword.replace(/\'/g, '').split(/([\d!~@#$%^&*()_+\=\[\]{};':"\\|,.<>\/?]+)/).filter(Boolean);

							subText.forEach(function(subItem) {

								if (specialChars.test(subItem)) {

									numericItem = numericItem + subItem;
								} else {

									if (that.dictionaryLib.check(subItem) == false) {

										numericItem = numericItem + '<span id="id' + that.spanId +
											'"class="target">' + subItem + '</span>';

										that.wrongWordsArr.push({
											rowId: i,
											id: "#id" + that.spanId,
											Text: subItem
										});

										that.spanId++;

									} else {

										numericItem = numericItem + subItem;
									}

								}

							});

							sampletext = sampletext + " " + numericItem;

						} else {

							if (that.dictionaryLib.check(splitword) == false) {

								sampletext = sampletext + ' <span id="id' + that.spanId +
									'"class="target">' + splitword + '</span>';

								that.wrongWordsArr.push({
									rowId: i,
									id: "#id" + that.spanId,
									Text: splitword
								});

								that.spanId++;

							} else {

								sampletext = sampletext + " " + splitword;

							}
						}
						if (word.length - 1 === j) {
							data[i].NarrativeStringSpell = sampletext;

						}
					}
				}
			}
			this.igno = [];
			return data;
		},

		changeNarrative: function(index, text, stringText) {

			debugger;
			var InputFields = this.getView().getModel("InputsModel");
			InputFields.setProperty("/Inputs/isChanged", true);

			var Otable = this.getView().byId("WipDetailsSet1");
			var tableContext = Otable.getContextByIndex(index);
			var obj = tableContext.getObject();
			console.log("selected obj narrative string:" + text)
			obj.NarrativeStringSpell = stringText;
			obj.NarrativeString = text;
			console.log(obj.NarrativeStringSpell);

			var that = this;
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
			var filter = this.getView().byId("idIconTabBar").getSelectedKey();
			if (filter === "LineItemEdits") {
				this.narIndices.push(idx);
			}
			this.indexes.push(idx);

			InputFields.setProperty("/Inputs/isChanged", true);
		},

		onNarativeTexChange: function() {
			var that = this;

			$(".fulcrum-editor-textarea").each(function(index, element) {
				element.addEventListener("keyup", function() {
					debugger
					var i = $(this).closest('tr')["0"].rowIndex - 1;
					var position = that.resetOffset($("#" + this.id));

				var len = this.innerText.trim().length;
				    	var value = this.innerText.trim();
				      var mainSpaceLogValue = 0;
					if (event.code == 'Space') {
						debugger;
					
					
						$("#" + this.id).attr("data-isused", "true");
						
						
						if (position - 3 == len) {
                         alert("asdasdas");
							$("#" + this.id).caret('pos', position-1).focus();
							event.preventDefault();
						
                              return;
						} 
						if (position - 2 == len) {
                         alert("sadasda");
							$("#" + this.id).caret('pos', position).focus();
								event.preventDefault();
						
                              return;
							
						} 
						
						if(position == 1){
							
								$("#" + this.id).caret('pos', 0).focus();
								event.preventDefault();
						
                            return;
						}
						
						if(position < len){
			
							  var res1 = value.charAt(position-1);
							  var res2 = value.charAt(position-2);
							  var res3 = value.charAt(position-3);
							  
							  if(!/^\s+$/.test(res1) && /^\s+$/.test(res2)  && !/^\s+$/.test(res3)){
							  
							  	mainSpaceLogValue = 1;
							  }
							  if(/^\s+$/.test(res1) && /^\s+$/.test(res2)  && !/^\s+$/.test(res3)){
							  
							  	mainSpaceLogValue = 2;
							  }
							  if(!/^\s+$/.test(res1) && /^\s+$/.test(res2)  && /^\s+$/.test(res3)){
							  
							  	mainSpaceLogValue = 3;
							  }
							  
						
							 
 							
							
						}
						// else {
						// 	$("#" + this.id).caret('pos', len + 2).focus();
						// 	event.preventDefault();
						// 	log = 1;
						// }

					

					}

					// if (event.code == 'Space') {
					// 	debugger;
					// 	var log = 0;
					// 	var len = this.innerText.trim().length;
					// 	$("#" + this.id).attr("data-isused", "true");
					// 	if (position - 1 == len) {

					// 		$("#" + this.id).caret('pos', position).focus();
					// 		event.preventDefault();
					// 		log = 1;

					// 	}
					// 	if (log == 1) {
					// 		return;
					// 	}

					// }

					if (event.code == 'KeyC' && (event.ctrlKey || event.metaKey) || event.code == 'KeyV' && (event.ctrlKey || event.metaKey)) {

						if (event.code == 'KeyV') {
							$("#" + this.id).caret('pos', position + 2).focus();
						}
						event.preventDefault();

					}

					debugger

					$(window).resize(function() {
						console.log("resize window")
						var resizePosition = that.resetOffset($("#" + this.id));
						$("#" + this.id).caret('pos', resizePosition).focus();
						return;
					});

					debugger;
					var text = this.innerText;

					console.log(text)
					var srt = text.split(/\s+/);
					var specialChars = /([\d!~@#$%^&*()_+\=\[\]{};':"\\|,.<>\/?]+)/;

					var stringText = "";
					srt.forEach(function(item) {

						var log = 0;
						that.wrongWordsArr.forEach(function(obj) {

							if (obj.Text == item) {
								log = 1;
							}
						});

						if (log == 1) {
							if (that.ignoreAllArr.includes(item) || specialChars.test(item)) {

								stringText = stringText + " " + item;

							} else {

								if (specialChars.test(item)) {

									var numericItem = "";
									var subText = item.replace(/\'/g, '').split(/([\d!~@#$%^&*()_+\=\[\]{};':"\\|,.<>\/?]+)/).filter(Boolean);

									subText.forEach(function(subItem) {

										if (specialChars.test(subItem) || that.ignoreAllArr.includes(subItem)) {

											numericItem = numericItem + subItem;
										} else {

											if (that.dictionaryLib.check(subItem) == false) {

												numericItem = numericItem + '<span id="id' + that.spanId +
													'"class="target">' + subItem + '</span>';

												that.wrongWordsArr.push({
													rowId: i,
													id: "#id" + that.spanId,
													Text: subItem
												});

												that.spanId++;

											} else {

												numericItem = numericItem + subItem;
											}

										}

									});

									stringText = stringText + " " + numericItem;

								} else {

									stringText = stringText + ' <span id="id' + that.spanId +
										'"class="target">' + item + '</span>';
									that.wrongWordsArr.push({
										rowId: i,
										id: "#id" + that.spanId,
										Text: item
									});
									that.spanId++;
								}
							}

						} else {

							if (that.dictionaryLib.check(item) == false) {

								if (that.ignoreAllArr.includes(item)) {

									stringText = stringText + " " + item;

								} else {

									if (specialChars.test(item)) {

										var numericItem = "";
										var subText = item.replace(/\'/g, '').split(/([\d!~@#$%^&*()_+\=\[\]{};':"\\|,.<>\/?]+)/).filter(Boolean);

										subText.forEach(function(subItem) {

											if (specialChars.test(subItem) || that.ignoreAllArr.includes(subItem)) {

												numericItem = numericItem + subItem;
											} else {

												if (that.dictionaryLib.check(subItem) == false) {

													numericItem = numericItem + '<span id="id' + that.spanId +
														'"class="target">' + subItem + '</span>';

													that.wrongWordsArr.push({
														rowId: i,
														id: "#id" + that.spanId,
														Text: subItem
													});

													that.spanId++;

												} else {

													numericItem = numericItem + subItem;
												}

											}

										});

										stringText = stringText + " " + numericItem;

									} else {

										stringText = stringText + ' <span id="id' + that.spanId +
											'"class="target">' + item + '</span>';
										that.wrongWordsArr.push({
											rowId: i,
											id: "#id" + that.spanId,
											Text: item
										});
										that.spanId++;

									}

								}

							} else {

								stringText = stringText + " " + item;
							}

						}

					});

					this.innerHTML = stringText;
					debugger;
					that.changeNarrative(index, text, stringText);

					if (mainSpaceLogValue == 0) {

						if ($("#" + this.id).attr("data-isused") != "true") {

							$("#" + this.id).attr("data-isused", "true");

							$("#" + this.id).caret('pos', position + 1).focus();
						} else {

							$("#" + this.id).caret('pos', position).focus();

						}
					} else {
						if (mainSpaceLogValue == 1) {
							$("#" + this.id).caret('pos', position).focus();
						} else if (mainSpaceLogValue == 1) {
							$("#" + this.id).caret('pos', position).focus();
						} else {
							$("#" + this.id).caret('pos', position - 1).focus();
						}

					}

					// if ($("#" + this.id).attr("data-isused") != "true") {

					// 	$("#" + this.id).attr("data-isused", "true");

					// 	$("#" + this.id).caret('pos', position + 1).focus();
					// } else {

					// 	$("#" + this.id).caret('pos', position).focus();

					// }

					$(".target").contextmenu(function(eve) {
						debugger;
						document.addEventListener('contextmenu', event => event.preventDefault());
						debugger;
						console.log(eve.target.id);
						that.currentSpanId = eve.target.id;
						// this._menu = sap.ui.xmlfragment("spc.view.MenuItemEventing", this);
						//    	this._menu.open();
						console.log("test");
						that.array_of_suggestions = that.dictionaryLib.suggest(this.innerText);
						console.log(that.array_of_suggestions);

						this.suggestions = [];
						for (var k = 0; k < that.array_of_suggestions.length; k++) {
							var txt = that.array_of_suggestions[k];
							var obj = new Object();
							obj.text = txt;
							this.suggestions.push(obj);
						}
						this.suggestions.push({
							text: "ignoreAll"
						});
						that.menuModel = new sap.ui.model.json.JSONModel({
							mainMenu: this.suggestions
						});
						that.menuModel.setProperty("/menutext", this.suggestions);

						if (!that._menu) {
							that._menu = sap.ui.xmlfragment(
								"wip.view.MenuItemEventing",
								that
							);
							that.getView().addDependent(that._menu);
						}
						that._menu.setModel(that.menuModel, "menu");

						var eDock = sap.ui.core.Popup.Dock;

						that._menu.open(that._bKeyboard, $("#" + eve.target.id), eDock.BeginTop, eDock.BeginBottom, $("#" + eve.target.id));

					});

				});

			});

		},
		settimeout: function() {
			var that = this;
			setTimeout(function() {

				$(".target").contextmenu(function(eve) {

					document.addEventListener('contextmenu', event => event.preventDefault());

					that.currentSpanId = eve.target.id;
					that.menurowid = $(this).closest('tr')["0"].rowIndex - 1;
					that.array_of_suggestions = that.dictionaryLib.suggest(this.innerText);
					that.suggestions = [];
					for (var k = 0; k < that.array_of_suggestions.length; k++) {
						var txt = that.array_of_suggestions[k];
						var obj = new Object();
						obj.text = txt;
						that.suggestions.push(obj);
					}

					that.suggestions.push({
						text: "ignoreAll"
					});

					that.menuModel = new sap.ui.model.json.JSONModel({
						mainMenu: that.suggestions
					});
					that.menuModel.setProperty("/menutext", that.suggestions);
					if (!that._menu) {
						that._menu = sap.ui.xmlfragment(
							"wip.view.MenuItemEventing",
							that
						);

					}
					that._menu.setModel(that.menuModel, "menu");

					var eDock = sap.ui.core.Popup.Dock;
					that._menu.open(that._bKeyboard, $("#" + eve.target.id), eDock.BeginTop, eDock.BeginBottom, $("#" + eve.target.id));

				});

			}, 2000);
		},

		// onMenuItemPress: function(oEvent) {
		// 	var that = this;

		// 	var msg = oEvent.getParameter("item").getText();
		// 	var spanText = $("#" + that.currentSpanId)["0"].innerText;

		// 	if (msg == "ignoreAll") {

		// 		that.ignoreAllArr.push(spanText);
		// 		if (that.wrongWordsArr) {

		// 			that.wrongWordsArr.forEach(function(obj) {

		// 				if (obj.Text == spanText) {
		// 					debugger;
		//                          $(obj.id).contents().unwrap();
		// 					that.rowData[obj.rowId].NarrativeStringSpell.replace('<span id="id' + obj.id.substring(3) +
		// 						'"class="target">' + obj.Text + '</span>', obj.Text);
		// 					$(obj.id).contents().unwrap();
		// 				}

		// 			});

		// 			this.jsonModel.setProperty("/modelData", this.rowData);

		// 		}

		// 	} else {
		// 		debugger;

		// 		var spantext = $("#" + this.currentSpanId)["0"].innerText;

		// 		var rowindex = this.menurowid;
		// 		var cmpareId = "#" + this.currentSpanId;
		// 		that.wrongWordsArr.forEach(function(obj) {
		// 			if (obj.id == cmpareId) {
		// 				rowindex = obj.rowId;
		// 			}

		// 		});

		// 		var divId = $("#" + this.currentSpanId).parent()["0"].id;
		// 		var spantext = $("#" + this.currentSpanId)["0"].innerText;
		// 		var changedspantext = oEvent.getParameter("item").getText();
		// 		var narstr = this.rowData[rowindex].NarrativeString;
		// 		var narstrspell = this.rowData[rowindex].NarrativeStringSpell;

		// 		var newnarstrspell = narstrspell.replace('<span id="' + this.currentSpanId + '"class="target">' + spantext + '</span>',
		// 			changedspantext);

		// 		this.rowData[rowindex].NarrativeStringSpell = newnarstrspell;

		// 		this.saveObjects.push(this.rowData[rowindex]);
		// 		this.jsonModel.setProperty("/modelData", this.rowData);

		// 		var newnarstr = narstr.replace(spantext, changedspantext);

		// 		this.rowData[rowindex].NarrativeString = newnarstr;

		// 		this.jsonModel.setProperty("/modelData", this.rowData);
		// 		var oTable = this.getView().byId("WipDetailsSet1");
		// 		this.getView().byId("WipDetailsSet1").setModel(this.jsonModel);

		// 		oTable.bindRows("/modelData");

		// 		$(".target").contextmenu(function(eve) {
		// 			debugger;
		// 			document.addEventListener('contextmenu', event => event.preventDefault());
		// 			debugger;
		// 			console.log(eve.target.id);
		// 			that.currentSpanId = eve.target.id;
		// 			// this._menu = sap.ui.xmlfragment("spc.view.MenuItemEventing", this);
		// 			//    	this._menu.open();
		// 			console.log("test");
		// 			that.array_of_suggestions = that.dictionaryLib.suggest(this.innerText);
		// 			console.log(that.array_of_suggestions);

		// 			this.suggestions = [];
		// 			for (var k = 0; k < that.array_of_suggestions.length; k++) {
		// 				var txt = that.array_of_suggestions[k];
		// 				var obj = new Object();
		// 				obj.text = txt;
		// 				this.suggestions.push(obj);
		// 			}
		// 			this.suggestions.push({
		// 				text: "ignoreAll"
		// 			});
		// 			that.menuModel = new sap.ui.model.json.JSONModel({
		// 				mainMenu: this.suggestions
		// 			});
		// 			that.menuModel.setProperty("/menutext", this.suggestions);

		// 			if (!that._menu) {
		// 				that._menu = sap.ui.xmlfragment(
		// 					"wip.view.MenuItemEventing",
		// 					that
		// 				);
		// 				that.getView().addDependent(that._menu);
		// 			}
		// 			that._menu.setModel(that.menuModel, "menu");

		// 			var eDock = sap.ui.core.Popup.Dock;

		// 			that._menu.open(that._bKeyboard, $("#" + eve.target.id), eDock.BeginTop, eDock.BeginBottom, $("#" + eve.target.id));

		// 		});

		// 	}
		// 	that.igno = that.ignoreAllArr;
		// },

		onMenuItemPress: function(oEvent) {

			//var rowindex = this.menurowid;
			// var spantext = $("#" + this.currentSpanId)["0"].innerText;

			// var changedspantext = oEvent.getParameter("item").getText();
			// var narstr = this.rowData[rowindex].NarrativeString;
			// var narstrspell = this.rowData[rowindex].NarrativeStringSpell;
			// var newnarstr = narstr.replace(spantext, changedspantext);
			// this.rowData[rowindex].NarrativeString = newnarstr;
			// // var newnarstrspell = narstrspell.replace('<span id="' + this.currentSpanId + '" class="target">' + spantext + '</span>',
			// // 	changedspantext);

			// //this.rowData[rowindex].NarrativeStringSpell = newnarstrspell;

			// this.saveObjects.push(this.rowData[rowindex]);
			// this.jsonModel.setProperty("/modelData", this.rowData);
			// var oTable = this.getView().byId("WipDetailsSet1");
			// this.getView().byId("WipDetailsSet1").setModel(this.jsonModel);
			// oTable.bindRows("/modelData");

			// my code

			var that = this;

			var msg = oEvent.getParameter("item").getText();
			var spanText = $("#" + that.currentSpanId)["0"].innerText;

			if (msg == "ignoreAll") {

				that.ignoreAllArr.push(spanText);

				if (that.wrongWordsArr) {

					that.wrongWordsArr.forEach(function(obj) {

						if (obj.Text == spanText) {
							debugger;

							$(obj.id).contents().unwrap();

							// that.rowData[obj.rowId].NarrativeStringSpell.replace('<span id="id' + obj.id.substring(3) +
							// 	'"class="target">' + obj.Text + '</span>', obj.Text);

							var narstrspell = that.rowData[obj.rowId].NarrativeStringSpell;

							var newnarstrspell = narstrspell.replace('<span id="' + obj.id.substring(1) + '"class="target">' + obj.Text + '</span>',
								obj.Text);

							that.rowData[obj.rowId].NarrativeStringSpell = newnarstrspell;

							$(obj.id).contents().unwrap();
						}

					});
					debugger;
					this.jsonModel.setProperty("/modelData", this.rowData);
					var oTable = this.getView().byId("WipDetailsSet1");
					this.getView().byId("WipDetailsSet1").setModel(this.jsonModel);

					oTable.bindRows("/modelData");
					this.settimeout();
					this.onNarativeTexChange();

				}

			} else {
				debugger;

				// start 

				//     var rowindex = this.menurowid;
				//     var divId = $("#" + this.currentSpanId).parent()["0"].id;
				//  var text = $("#" + that.currentSpanId)["0"].innerText;
				//  var narstr = this.rowData[rowindex].NarrativeString;
				//  var narstrspell = this.rowData[rowindex].NarrativeStringSpell;
				//              var narstrspellSave = narstrspell.replace('<span id="' + this.currentSpanId + '"class="target">' + text + '</span>',msg);
				//              this.rowData[rowindex].NarrativeStringSpell = narstrspellSave;
				//     this.jsonModel.setProperty("/modelData", this.rowData);

				//     $("#" + that.currentSpanId)["0"].innerText = msg;		
				// 	$("#" + that.currentSpanId).contents().unwrap();
				//   // $("#" + that.currentSpanId).css("background-color", "transparent");

				//     var newnarstrSave = narstr.replace(narstr, $("#" + divId)["0"].innerText);

				// this.rowData[rowindex].NarrativeString = newnarstrSave;

				// 	this.jsonModel.setProperty("/modelData", this.rowData);
				// var oTable = this.getView().byId("WipDetailsSet1");
				// this.getView().byId("WipDetailsSet1").setModel(this.jsonModel);

				// this.saveObjects.push(this.rowData[rowindex]);
				// oTable.bindRows("/modelData");

				// narstr = narstr.replace(narstr, $("#" + this.currentSpanId).parent()["0"].innerText);

				// $("#" + that.currentSpanId)["0"].innerText = msg;

				// $("#" + that.currentSpanId).css("background-color", "transparent");
				// debugger;

				// this.saveObjects.push(that.rowData[currRowId]);
				// // this.uniqueId.push(currRowId);
				// this.jsonModel.setProperty("/modelData", that.rowData);
				// var oTable = this.getView().byId("WipDetailsSet1");
				// this.getView().byId("WipDetailsSet1").setModel(this.jsonModel);
				// oTable.bindRows("/modelData");

				// END

				var spantext = $("#" + this.currentSpanId)["0"].innerText;

				var rowindex = this.menurowid;
				var cmpareId = "#" + this.currentSpanId;
				that.wrongWordsArr.forEach(function(obj) {
					if (obj.id == cmpareId) {
						rowindex = obj.rowId;
					}

				});

				var divId = $("#" + this.currentSpanId).parent()["0"].id;
				var spantext = $("#" + this.currentSpanId)["0"].innerText;
				var changedspantext = oEvent.getParameter("item").getText();
				var narstr = this.rowData[rowindex].NarrativeString;
				var narstrspell = this.rowData[rowindex].NarrativeStringSpell;

				var newnarstrspell = narstrspell.replace('<span id="' + this.currentSpanId + '"class="target">' + spantext + '</span>',
					changedspantext);

				this.rowData[rowindex].NarrativeStringSpell = newnarstrspell;

				this.saveObjects.push(this.rowData[rowindex]);
				this.jsonModel.setProperty("/modelData", this.rowData);

				var newnarstr = narstr.replace(spantext, changedspantext);

				this.rowData[rowindex].NarrativeString = newnarstr;

				this.jsonModel.setProperty("/modelData", this.rowData);
				var oTable = this.getView().byId("WipDetailsSet1");
				this.getView().byId("WipDetailsSet1").setModel(this.jsonModel);

				oTable.bindRows("/modelData");

			}

			$(".target").contextmenu(function(eve) {
				debugger;
				document.addEventListener('contextmenu', event => event.preventDefault());
				debugger;
				console.log(eve.target.id);
				that.currentSpanId = eve.target.id;
				// this._menu = sap.ui.xmlfragment("spc.view.MenuItemEventing", this);
				//    	this._menu.open();
				console.log("test");
				that.array_of_suggestions = that.dictionaryLib.suggest(this.innerText);
				console.log(that.array_of_suggestions);

				this.suggestions = [];
				for (var k = 0; k < that.array_of_suggestions.length; k++) {
					var txt = that.array_of_suggestions[k];
					var obj = new Object();
					obj.text = txt;
					this.suggestions.push(obj);
				}
				this.suggestions.push({
					text: "ignoreAll"
				});
				that.menuModel = new sap.ui.model.json.JSONModel({
					mainMenu: this.suggestions
				});
				that.menuModel.setProperty("/menutext", this.suggestions);

				if (!that._menu) {
					that._menu = sap.ui.xmlfragment(
						"wip.view.MenuItemEventing",
						that
					);
					that.getView().addDependent(that._menu);
				}
				that._menu.setModel(that.menuModel, "menu");

				var eDock = sap.ui.core.Popup.Dock;

				that._menu.open(that._bKeyboard, $("#" + eve.target.id), eDock.BeginTop, eDock.BeginBottom, $("#" + eve.target.id));

			});
			that.igno = that.ignoreAllArr;
			this.settimeout();
			this.onNarativeTexChange();
		},

		onGlobalSearch: function(oEvent) {

			debugger;

			// var searchValue = this.byId("searchText").getValue();

			var iconTabKey = this.byId("idIconTabBar").getSelectedKey();

			if (iconTabKey === "Home") {

				var searchValue = this.byId("searchText").getValue();

				debugger;

				var result = [];

				this.homeArr.forEach(
					function(value, index) {

						var date = value.Budat;

						var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
							pattern: "dd.MM.yyyy"
						});
						var dateFormatted = dateFormat.format(date).toString();

						debugger;

						var myJSON = JSON.stringify(jQuery.extend({}, value));
						var obj1 = myJSON + dateFormatted;

						if (obj1.toLowerCase().includes(searchValue.toLowerCase())) {
							result.push(value);
						}

					}
				);

				var otable = this.byId("WipDetailsSet");
				debugger;

				this.jsonModel.setData({
					modelData: result
				});
				otable.setModel(this.jsonModel);

				otable.bindRows("/modelData");
				this.jsonModel.setProperty("/RowCount", result.length);
			} else if (iconTabKey === "NarrativeEdits") {

				var searchValue = this.byId("searchText1").getValue();

				var result1 = [];

				this.homeArr.forEach(
					function(value, index) {

						var date = value.Budat;

						var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
							pattern: "dd.MM.yyyy"
						});
						var dateFormatted = dateFormat.format(date).toString();

						var myJSON = JSON.stringify(jQuery.extend({}, value));
						var obj1 = myJSON + dateFormatted;

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
				this.jsonModel.setProperty("/RowCount1", result1.length);

			} else if (iconTabKey === "LineItemEdits") {

				var searchValue = this.byId("searchText2").getValue();

				var result2 = [];

				this.homeArr.forEach(
					function(value, index) {

						var date = value.Budat;

						var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
							pattern: "dd.MM.yyyy"
						});
						var dateFormatted = dateFormat.format(date).toString();

						var myJSON = JSON.stringify(jQuery.extend({}, value));
						var obj1 = myJSON + dateFormatted;

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
				this.jsonModel.setProperty("/RowCount2", result2.length);

			} else {

				var searchValue = this.byId("searchText3").getValue();

				var result3 = [];

				this.homeArr.forEach(
					function(value, index) {

						var date = value.Budat;

						var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
							pattern: "dd.MM.yyyy"
						});
						var dateFormatted = dateFormat.format(date).toString();

						var myJSON = JSON.stringify(jQuery.extend({}, value));
						var obj1 = myJSON + dateFormatted;

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
				this.jsonModel.setProperty("/RowCount3", result3.length);

			}

			this.jsonModel.setProperty("/Matter", this.homeArr[0].Pspid);
			this.jsonModel.setProperty("/LeadPartner", this.homeArr[0].Sname);
			this.jsonModel.setProperty("/BillingOffice", this.homeArr[0].Werks);

		},
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
		ReloadTable: function(oEvent) {
			debugger;
			var InputFields = this.getView().getModel("InputsModel");
			var filter = this.getView().byId("idIconTabBar").getSelectedKey();
			if (filter === "Home") {
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
						that.homeArr = that.arr;
						that.jsonModel.setProperty("/modelData", that.arr);
						that.rowData = [];
						that.homeArr.forEach(function(o, k) {
							that.rowData[k] = o;
						});

					}
				});
			} else if (filter === "NarrativeEdits") {
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
						that.homeArr = oData.results;
						that.jsonModel.setProperty("/modelData", that.arr);
						that.rowData = [];
						that.homeArr.forEach(function(o, k) {
							that.rowData[k] = o;
						});
						that.ignoreAllArr = [];
						that.igno = [];
						that.handlespellcheck(that.homeArr);

						that.jsonModel.setProperty("/modelData", that.homeArr);

						that.settimeout();
						that.onNarativeTexChange();

					}
				});

			} else if (filter === "LineItemEdits") {
				sap.ui.core.BusyIndicator.show(0);
				this.data(this.homeArr);
				var tableLineEdits = this.getView().byId("WipDetailsSet2");
				var index = this.rowLineItemCount;
				for (var i = 0; i < index.length; i++) {

					tableLineEdits.getRows()[index[i]].getCells()[0].setVisible(false);
					tableLineEdits.getRows()[index[i]].getCells()[1].setVisible(true);

				}

			} else {

				sap.ui.core.BusyIndicator.show(0);
				var tableLineEdits = this.getView().byId("WipDetailsSet3");
				var index = tableLineEdits.getSelectedIndices();
				for (var i = 0; i < index.length; i++) {
					tableLineEdits.getRows()[index[i]].getCells()[0].setVisible(false);

				}
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
						that.homeArr = oData.results;

						that.jsonModel.setProperty("/modelData", oData.results);
						that.rowData = [];
						that.homeArr.forEach(function(o, k) {
							that.rowData[k] = o;
						});
						that.data(that.rowData);

					}
				});

			}
			if (this._Dialog) {

				this._Dialog.close();

			}
			InputFields.setProperty("/Inputs/isChanged", false);

			var Otable = this.getView().byId("WipDetailsSet1");
			Otable.onAfterRendering();

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

			var object = this.getView().byId("SmartFilterBar").getControlByKey("Pspid").getTokens();
			var that = this;
			$.each(object, function(j, token) {
				if (object) {
					aFilter.push(new Filter("Pspid", "EQ", token.getText()));
				}

				oModel.read("/WipMattersSet", {
					filters: aFilter,
					success: function(oData) {
						sap.ui.core.BusyIndicator.hide(0);
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
						that.jsonModel.setProperty("/Matter", "");
						that.jsonModel.setProperty("/LeadPartner", "");
						that.jsonModel.setProperty("/BillingOffice", "");
						that.jsonModel.setProperty("/modelData", "");

						that.jsonModel.setProperty("/RowCount", "0");

					}
				});
				InputFields.setProperty("/Inputs/IconTabs/Narrative_Edits", false);
				InputFields.setProperty("/Inputs/IconTabs/Line_Item_Edits", false);
				InputFields.setProperty("/Inputs/IconTabs/Line_Item_Transfers", false);

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
				this.jsonModel.setProperty("/modelData", "");
				this.jsonModel.setProperty("/RowCount", "0");

			}
			oList.removeItem(oItem);

			InputFields.setProperty("/Inputs/IconTabs/Narrative_Edits", false);
			InputFields.setProperty("/Inputs/IconTabs/Line_Item_Edits", false);
			InputFields.setProperty("/Inputs/IconTabs/Line_Item_Transfers", false);
		},
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
			this.replaceItems = [];
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
						var stringarr = str.split(" ");
						$.each(stringarr, function(d, o) {
							if (stringarr[d] === string) {
								stringarr[d] = replacewith;
							} else {
								if (stringarr[d].endsWith(".")) {
									var newSplitWord = stringarr[d].split(".");
									if (newSplitWord[0] === string) {
										stringarr[d] = replacewith + ".";
									}
								}
							}
						});
						res = stringarr.join(" ");
					} else {
						debugger;
						res = str.split(string).join(replacewith);
					}
					that.rowData.forEach(function(obj, k) {
						that.replaceItems[k] = obj;
					});

					that.replaceItems[o].NarrativeString = res;
					that.replaceItems[o].NarrativeStringSpell = res;

					if (str != res) {
						that.saveObjects.push(that.replaceItems[o]);
					}

					str = that.replaceItems[o].NarrativeString;

				});
				var data1 = that.handlespellcheck(that.replaceItems);
				that.jsonModel.setProperty("/modelData", data1);
				oTable.setModel(that.jsonModel);
				oTable.bindRows("/modelData");
				that.settimeout();
				that.onNarativeTexChange();
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
			debugger;
			var oTable = this.getView().byId("smartTable_ResponsiveTable1").getTable();
			var oTable1 = sap.ui.core.Fragment.byId("replaceword", "bottomTable0");

			var replaceItems = [];
			this.rowData.forEach(function(obj, k) {
				replaceItems[k] = obj;
			});
			this.replace = [];
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
						var stringarr = str.split(" ");
						$.each(stringarr, function(d, o) {
							if (stringarr[d] === string) {
								stringarr[d] = replacewith;
							} else {
								if (stringarr[d].endsWith(".")) {
									var newSplitWord = stringarr[d].split(".");
									if (newSplitWord[0] === string) {
										stringarr[d] = replacewith + ".";
									}
								}
							}
						});
						res = stringarr.join(" ");
						that.rowData.forEach(function(obj, k) {
							that.replace[k] = obj;
						});

						that.replace[i].NarrativeString = res;
						that.replace[i].NarrativeString = res;

						if (str != res) {
							that.saveObjects.push(that.replace[i]);
						}

						str = that.replace[i].NarrativeString;

					} else {

						var searchindex = str.search(string);
						if (searchindex >= 0) {
							res = str.split(string).join(replacewith);
							// that.replace = that.jsonModel.getProperty("/modelData");
							that.rowData.forEach(function(obj, k) {
								that.replace[k] = obj;
							});
							that.replace[i].NarrativeString = res;
							that.replace[i].NarrativeStringSpell = res;
							str = that.replace[i].NarrativeString;
						}
					}

				});
				return that.replace;
			});
			var data1 = that.handlespellcheck(result);
			this.jsonModel.setProperty("/modelData", data1);
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
			this.settimeout();
			this.onNarativeTexChange();
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
					icon: "sap-icon://delete",
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
			debugger;
			var odialog = this._getDialogmass();
			//sap.ui.core.Fragment.byId("masstransfer", "masspspid").setValue("1500008011");
			odialog.open();
			var oTable = this.getView().byId("WipDetailsSet3");
			var ofrag = sap.ui.core.Fragment.byId("masstransfer", "masstransfertable");
			var oTbl = sap.ui.core.Fragment.byId("masstransfer", "matter");
			var len = oTbl.getColumns().length;
			if (len === 0) {
				var columns = this.getView().getModel("InputsModel").getProperty("/Inputs/createMatter");

				for (var k = 0; k < columns.length; k++) {
					var col = columns[k];
					oTbl.addColumn(new sap.m.Column({
						header: new sap.m.Label({
							text: col.userCol

						})

					}));
				}
				this.handleAddRowMass(1);
			}
			var selindexes = oTable.getSelectedIndices();
			for (var k = 0; k < selindexes.length; k++) {
				this.indexes.push(selindexes[k]);
			}

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
		handleAddRowMass: function(count) {
			var columnsCount = count;
			var that = this;
			for (var i = 0; i < columnsCount; i++) {
				var obj = jQuery.extend({}, that.getView().getModel("InputsModel").getProperty("/Inputs/Column"));
				var tableitems = this.getMatterField();
				var oContext = this._createTableItemContext(obj);

				var oTbl = sap.ui.core.Fragment.byId("masstransfer", "matter");
				tableitems.setBindingContext(oContext);
				oTbl.addItem(tableitems);
				var delayInvk = (function(itm) {
					return function() {
						var smartfieldIndexes = that.getView().getModel("InputsModel").getProperty("/Inputs/editableIndexes");

						for (var j = 0; j < smartfieldIndexes.length; j++) {
							var c = itm.getCells()[smartfieldIndexes[j]];
							c.setEditable(true);
						}
					};
				})(tableitems);
				jQuery.sap.delayedCall(500, this, delayInvk);
			}
		},
		getMatterField: function() {
			var columns = this.getView().getModel("InputsModel").getProperty("/Inputs/createMatter");
			var cols = [];
			for (var m = 0; m < columns.length; m++) {
				var item = columns[m];
				if (item.type === "smartfield") {
					var field = new sap.ui.comp.smartfield.SmartField({
						value: "{" + item.key + "}",
						editable: "{InputsModel>isEditable}",
						id: "masspspid"
					});
					cols.push(field);
				}
			}
			var tableitems = new sap.m.ColumnListItem({
				cells: cols
			});

			return tableitems;
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
			var oTbl = sap.ui.core.Fragment.byId("masstransfer", "matter");
			var matter = oTbl.getItems()[0].getCells()[0].getValue();

			this.WipEditModel = this.getModel("InputsModel");

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

			// $.each(oTbl.getItems(), function(i, o) {
			// 	var rowid = o.getId();
			// 	oTbl.removeItem(rowid);
			// });
			// oTbl.destroyColumns();
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
		// Split start -- > //

		onSplitRow: function() {
			debugger;

			var oTable = this.getView().byId("smartTable_ResponsiveTable3").getTable();
			this._getSplitDialog().open();
			var idx = oTable.getSelectedIndex();
			var ctx = oTable.getContextByIndex(idx);
			var obj = ctx.getObject();
			var matter = obj.Pspid;
			var quantity = obj.Megbtr;
			this.docno = obj.Belnr;
			// var selPhase = obj.ZzphaseCode ;
			var selTask = obj.Zztskcd;
			var selAct = obj.Zzactcd;
			var selFfTsk = obj.Zzfftskcd;
			var selFfAct = obj.Zzffactcd;
			this.jsonModel.setProperty("/matter", matter);
			this.jsonModel.setProperty("/quantity", quantity);
			this.jsonModel.setProperty("/docno", this.docno);
			this.jsonModel.setProperty("/selTask", selTask);
			this.jsonModel.setProperty("/selAct", selAct);
			this.jsonModel.setProperty("/selFfTsk", selFfTsk);
			this.jsonModel.setProperty("/selFfAct", selFfAct);
			this.createNewtableColumns();
			this.handleAddRow(1);
		},
		_getSplitDialog: function() {
			debugger;
			if (!this._splitDialog) {
				this._splitDialog = sap.ui.xmlfragment("splitTransfer", "wip.view.splittransfer", this);
				this.getView().addDependent(this._splitDialog);
			}
			return this._splitDialog;
		},
		closeSplitDialog: function() {
			debugger;
			this._getSplitDialog().close();
			var oTable = sap.ui.core.Fragment.byId("splitTransfer", "splitTable2");
			$.each(oTable.getItems(), function(i, o) {
				var rowid = o.getId();
				oTable.removeItem(rowid);
			});
			this.getView().getModel("InputsModel").setProperty("/Inputs/Columns", [{
				Pspid: "",
				Zzphase: [],
				Zzactcd: [],
				Zztskcd: [],
				Zzfftskcd: [],
				Zzffactcd: [],
				Megbtr: "",
				Percent: ""
			}]);
			oTable.destroyColumns();
		},
		createNewtableColumns: function() {
			debugger;
			var oTbl = sap.ui.core.Fragment.byId("splitTransfer", "splitTable2");
			var columns = this.getView().getModel("InputsModel").getProperty("/Inputs/createcontrols");
			for (var k = 0; k < columns.length; k++) {
				var col = columns[k];
				oTbl.addColumn(new sap.m.Column({
					header: new sap.m.Label({
							text: col.userCol

						})
						// width:col.width
				}));
			}

		},
		handleAddRow: function(count, userObj) {
			debugger;

			var arr = [];
			if (typeof userObj === "object" && userObj.constructor === Array) {
				arr = userObj;

			} else {
				arr.push(userObj);
			}

			var oTbl = sap.ui.core.Fragment.byId("splitTransfer", "splitTable2");
			var columnsCount = 0;
			if (count > 0) {
				columnsCount = count;
			} else {
				columnsCount = arr.length;
			}
			//Add rows to ths sap.m table
			var that = this;
			for (var i = 0; i < columnsCount; i++) {

				var obj = jQuery.extend({}, that.getView().getModel("InputsModel").getProperty("/Inputs/Columns"));
				var FirstTableitems;
				var oContext;
				if (count > 0) {
					FirstTableitems = this.getTableItems();
					oContext = this._createTableItemContext(obj);
				} else {
					var currentObj = jQuery.extend({}, arr[i]);
					FirstTableitems = this.getTableItems(currentObj);
					var obj1 = that.getView().getModel("InputsModel").getProperty("/Inputs/currentCol");
					oContext = this._createTableItemContext(obj1);
				}
				FirstTableitems.setBindingContext(oContext);
				oTbl.addItem(FirstTableitems);
				var rows = oTbl.getItems();
				for (var k = 0; k <= rows.length; k++) {
					if (k === 0) {
						var delayInvk = (function(itm) {
							return function() {
								var smartfieldIndexes = that.getView().getModel("InputsModel").getProperty("/Inputs/editableIndexes");
								for (var j = 0; j < smartfieldIndexes.length; j++) {
									var c = itm.getCells()[smartfieldIndexes[j]];
									c.setEditable(true);
								}
							};
						})(FirstTableitems);
					}
					if (k > 1) {
						var delayInvk = (function(itm) {
							return function() {
								var smartfieldIndexes = that.getView().getModel("InputsModel").getProperty("/Inputs/editableIndexes");
								for (var j = 0; j < smartfieldIndexes.length; j++) {
									var c = itm.getCells()[smartfieldIndexes[j]];
									c.setEditable(false);
								}
							};
						})(FirstTableitems);
					}
				}
				jQuery.sap.delayedCall(500, this, delayInvk);
			}

		},
		_createTableItemContext: function(data) {
			debugger;
			var sets = "WipDetailsSet";
			var oModel = this.getOwnerComponent().getModel();
			var oContext = oModel.createEntry(sets, {
				properties: data
			});
			return oContext;
		},
		getTableItems: function(items) {
			debugger;
			var oTbl = sap.ui.core.Fragment.byId("splitTransfer", "splitTable2");
			var rows = oTbl.getItems();
			var len = rows.length;
			var newcolumns = this.getView().getModel("InputsModel").getProperty("/Inputs/createcontrols");
			var col = [];
			var currentObj = {};
			// var InputsModel = this.getView().getModel("InputsModel");
			//   var rows = InputsModel.getProperty("/Inputs/Columns");
			//    var len = rows.length - 1;
			for (var i = 0; i < newcolumns.length; i++) {
				var item = newcolumns[i];
				if (item.type === "smartfield") {
					var field = new sap.ui.comp.smartfield.SmartField({
						value: "{" + item.key + "}",
						editable: "{InputsModel>isEditable}",
						change: $.proxy(this.handlChange, this)

					});
					col.push(field);
					if (items) {
						if (items.hasOwnProperty(item.key)) {
							currentObj[item.key] = items[item.key];
						} else {
							currentObj[item.key] = "";
						}
					} else {
						currentObj[item.key] = "";
					}
				}
				if (item.type === "Select") {
					if (item.key === "Zzphase") {
						var field = new sap.m.Select({
							selectedKey: "{InputsModel>/Inputs/Columns/" + len + "/selPhaseKey}",
							items: {
								path: "InputsModel>/Inputs/Columns/" + len + "/Zzphase",
								template: new sap.ui.core.ListItem({
									key: "{InputsModel>Phasecode}",
									text: "{InputsModel>Phasecode} {InputsModel>PhasecodeDesc}"
								}),
								templateShareable: true
							},
							change: $.proxy(this.splitPhaseCodesChange, this)
						});

						col.push(field);
						if (items) {
							if (items.hasOwnProperty(item.key)) {
								currentObj[item.key] = items[item.key];
							} else {
								currentObj[item.key] = "";
							}
						} else {
							currentObj[item.key] = "";
						}

					} else if (item.key === "Zzactcd") {
						var field = new sap.m.Select({
							selectedKey: "{InputsModel>/Inputs/Columns/" + len + "/selActKey}",

							items: {
								path: "InputsModel>/Inputs/Columns/" + len + "/Zzactcd",
								template: new sap.ui.core.ListItem({
									key: "{InputsModel>ActivityCodes}",
									text: "{InputsModel>ActivityCodes} {InputsModel>ActivityCodeDesc}"
								}),
								templateShareable: true
							}

						});

						col.push(field);
						if (items) {
							if (items.hasOwnProperty(item.key)) {
								currentObj[item.key] = items[item.key];
							} else {
								currentObj[item.key] = "";
							}
						} else {
							currentObj[item.key] = "";
						}

					} else if (item.key === "Zztskcd") {

						var field = new sap.m.Select({
							selectedKey: "{InputsModel>/Inputs/Columns/" + len + "/selTskKey}",
							items: {
								path: "InputsModel>/Inputs/Columns/" + len + "/Zztskcd",
								template: new sap.ui.core.ListItem({
									key: "{InputsModel>TaskCodes}",
									text: "{InputsModel>TaskCodes} {InputsModel>TaskCodeDesc}"

								}),
								templateShareable: true
							}

						});

						col.push(field);
						if (items) {
							if (items.hasOwnProperty(item.key)) {
								currentObj[item.key] = items[item.key];
							} else {
								currentObj[item.key] = "";
							}
						} else {
							currentObj[item.key] = "";
						}

					} else if (item.key === "Zzfftskcd") {

						var field = new sap.m.Select({
							selectedKey: "{InputsModel>/Inputs/Columns/" + len + "/selFfTskKey}",
							items: {
								path: "InputsModel>/Inputs/Columns/" + len + "/Zzfftskcd",
								template: new sap.ui.core.ListItem({
									key: "{InputsModel>FfTaskCodes}",
									text: "{InputsModel>FfTaskCodes} {InputsModel>FfTaskCodeDesc}"

								}),
								templateShareable: true
							},
							change: $.proxy(this.splitFfTaskCodesChange, this)

						});

						col.push(field);
						if (items) {
							if (items.hasOwnProperty(item.key)) {
								currentObj[item.key] = items[item.key];
							} else {
								currentObj[item.key] = "";
							}
						} else {
							currentObj[item.key] = "";
						}
					} else {
						var field = new sap.m.Select({
							selectedKey: "{InputsModel>/Inputs/Columns/" + len + "/selFfActKey}",
							items: {
								path: "InputsModel>/Inputs/Columns/" + len + "/Zzffactcd",
								template: new sap.ui.core.ListItem({
									key: "{InputsModel>FfActivityCodes}",
									text: "{InputsModel>FfActivityCodes} {InputsModel>FfActivityCodeDesc}"

								}),
								templateShareable: true
							}

						});

						col.push(field);
						if (items) {
							if (items.hasOwnProperty(item.key)) {
								currentObj[item.key] = items[item.key];
							} else {
								currentObj[item.key] = "";
							}
						} else {
							currentObj[item.key] = "";
						}

					}

				}

				if (item.type === "Input") {
					var field = new sap.m.Input({
						value: "{" + item.key + "}"
					});
					col.push(field);
					if (items) {
						if (items.hasOwnProperty(item.key)) {
							currentObj[item.key] = items[item.key];
						} else {
							currentObj[item.key] = "";
						}
					} else {

						currentObj[item.key] = "";

					}

				}
				if (item.type === "DatePicker") {
					var field = new sap.m.DatePicker({
						value: {
							path: item.key,
							type: 'sap.ui.model.type.Date',
							formatOptions: {
								displayFormat: "medium",
								strictParsing: true
									//	UTC: true
							}
						}

					});
					col.push(field);
					if (items) {
						if (items.hasOwnProperty(item["key"])) {
							currentObj[item.key] = items[item.key];
						} else {
							currentObj[item.key] = "";
						}
					} else {

						currentObj[item.key] = "";

					}

				}
				if (item.type === "Icon") {
					var field = new sap.ui.core.Icon({
						src: "sap-icon://alert",
						visible: false,
						color: "red"

					});
					col.push(field);
				}
				if (item.type === "Text") {
					var field = new sap.m.Text({
						text: "{" + item.key + "}"

					});
					col.push(field);
					if (items) {
						if (items.hasOwnProperty(item.key)) {
							currentObj[item.key] = items[item.key];
						} else {
							currentObj[item.key] = "";
						}
					} else {

						currentObj[item.key] = "";

					}

				}
				if (len <= 0) {
					if (item.type === "Button") {
						var field = new sap.m.Button({
							// text: "ADD",
							icon: "sap-icon://add",
							press: $.proxy(this.onAdd, this)
						});
						col.push(field);

					}
				} else {
					if (item.type === "Button") {
						var field = new sap.m.Button({
							// text: "Delete",
							icon: "sap-icon://delete",
							press: $.proxy(this.onDelete, this)
						});
						col.push(field);
					}
				}
			}
			var tableitems = new sap.m.ColumnListItem({
				cells: col
			});
			this.getView().getModel("InputsModel").setProperty("/Inputs/currentCol", currentObj);
			return tableitems;
		},
		handlChange: function(evt) {
			debugger;
			var oSource = evt.getSource();
			var items = oSource.getParent();
			var delayInvk = (function(itm) {
				return function() {
					var c = itm.getCells()[0];
					c.setEditable(true);
				};
			})(items);
			var aPath = oSource.getBindingContext().getPath();
			var Model = oSource.getBindingContext().getModel();
			var Pspid = evt.getParameter("value");
			if (evt.getParameter("value")) {
				Model.setProperty(aPath + "/" + oSource.getBindingPath('value'), evt.getParameter("value"));

			} else {
				Model.setProperty(aPath + "/" + oSource.getBindingPath('value'), evt.getParameter("value"));
				Pspid = evt.getParameter("value");
			}
			jQuery.sap.delayedCall(500, this, delayInvk);
			this.WipEditModel = this.getModel("InputsModel");
			this.serviceInstance = SplitItemsServices.getInstance();
			var InputFields = this.getView().getModel("InputsModel");
			var that = this;
			$.when(
				that.serviceInstance.getPhaseCodes(that.WipEditModel, Pspid, that),
				that.serviceInstance.getActivitycodes(that.WipEditModel, Pspid, that),
				that.serviceInstance.getFFtaskcodes(that.WipEditModel, Pspid, that))

			.done(function(phaseCodes, activityCodes, ffTskCodes) {
				debugger;
				phaseCodes.results.unshift("");
				activityCodes.results.unshift("");
				ffTskCodes.results.unshift("");
				InputFields.getProperty("/Inputs/Columns")[0].Pspid = Pspid;
				InputFields.getProperty("/Inputs/Columns")[0].Zzphase = phaseCodes.results;
				InputFields.getProperty("/Inputs/Columns")[0].Zzactcd = activityCodes.results;
				InputFields.getProperty("/Inputs/Columns")[0].Zzfftskcd = ffTskCodes.results;
				InputFields.setProperty("/Inputs/Columns/0/Zzphase", phaseCodes.results);
				InputFields.setProperty("/Inputs/Columns/0/Zzactcd", activityCodes.results);
				InputFields.setProperty("/Inputs/Columns/0/Zzfftskcd", ffTskCodes.results);
				// that.getTableItems();
			});

		},
		onAdd: function(oEvt) {
			debugger;
			var InputFields = this.getView().getModel("InputsModel");
			var oTable = sap.ui.core.Fragment.byId("splitTransfer", "splitTable2");
			var rows = oTable.getItems();
			var len = rows.length;
			var cells = oTable.getItems()[0].getCells();
			var hours = cells[6].getValue();
			var percentage = cells[7].getValue();
			var selPhaseKey = cells[1].getSelectedKey();
			var selTskKey = cells[2].getSelectedKey();
			var selActKey = cells[3].getSelectedKey();
			var selFfTskKey = cells[4].getSelectedKey();
			var selFfActKey = cells[5].getSelectedKey();
			if (hours) {
				InputFields.getProperty("/Inputs/Columns")[0].Megbtr = parseFloat(hours);
			}
			if (percentage) {
				InputFields.getProperty("/Inputs/Columns")[0].Percent = parseFloat(percentage);
			}
			if (selPhaseKey) {
				InputFields.getProperty("/Inputs/Columns")[0].selPhaseKey = selPhaseKey;
			}
			if (selTskKey) {
				InputFields.getProperty("/Inputs/Columns")[0].selTskKey = selTskKey;
			}
			if (selActKey) {
				InputFields.getProperty("/Inputs/Columns")[0].selActKey = selActKey;
			}
			if (selFfTskKey) {
				InputFields.getProperty("/Inputs/Columns")[0].selFfTskKey = selFfTskKey;
			}
			if (selFfActKey) {
				InputFields.getProperty("/Inputs/Columns")[0].selFfActKey = selFfActKey;
			}

			InputFields.getProperty("/Inputs/Columns").push(InputFields.getProperty("/Inputs/Columns")[0]);
			var iRowIndex = 0; //For First row in the table
			var oModel = oTable.getModel();
			var aItems = oTable.getItems();

			this.handleAddRow(0, InputFields.getProperty("/Inputs/Columns")[len]);
			InputFields.getProperty("/Inputs/Columns")[0] = {
				Pspid: "",
				Zzphase: [],
				Zzactcd: [],
				Zztskcd: [],
				Zzfftskcd: [],
				Zzffactcd: [],
				Megbtr: "",
				Percent: "",
				selPhaseKey: ""
			};
			oModel.setProperty(aItems[iRowIndex].getBindingContext().getPath() + "/Pspid", "");
			cells[1].setSelectedKey("");
			cells[2].setSelectedKey("");
			cells[3].setSelectedKey("");
			cells[4].setSelectedKey("");
			cells[5].setSelectedKey("");
			cells[6].setValue("");
			cells[7].setValue("");

		},
		onDelete: function(oEvt) {
			debugger;
			var src = oEvt.getSource().getParent();
			var rowid = src.getParent().indexOfItem(src);
			var InputFields = this.getView().getModel("InputsModel");
			var tablelength = sap.ui.core.Fragment.byId("splitTransfer", "splitTable2").getItems().length;
			var oTable = sap.ui.core.Fragment.byId("splitTransfer", "splitTable2");
			if (tablelength - 1 === rowid) {
				InputFields.getProperty("/Inputs/Columns").pop(InputFields.getProperty("/Inputs/Columns")[rowid]);
				src.getParent().removeItem(rowid);
			} else {
				InputFields.getProperty("/Inputs/Columns").splice(rowid, 1);
				oTable.removeAllItems();
				this.handleAddRow(0, InputFields.getProperty("/Inputs/Columns"));
			}

			// this.getTableItems();
		},
		onTransfer: function(oModel) {
			this.cols = [];
			var oTable = sap.ui.core.Fragment.byId("splitTransfer", "splitTable2");
			var rows = oTable.getItems();
			if (rows.length === 1) {
				MessageBox.alert("Please add Matters to Split Transfer.");
			} else {
				for (var i = 1; i < rows.length; i++) {
					var cells = rows[i].getCells();
					var matter = cells[0].getValue();
					var selPhaseKey = cells[1].getSelectedKey();
					var selTskKey = cells[2].getSelectedKey();
					var selActKey = cells[3].getSelectedKey();
					var selFfTskKey = cells[4].getSelectedKey();
					var selFfActKey = cells[5].getSelectedKey();
					var hours = cells[6].getValue();
					var percentage = cells[7].getValue();
					this.userObject = {
						Pspid: matter,
						Zzphase: selPhaseKey,
						ToZztskcd: selTskKey,
						ToZzactcd: selActKey,
						ToZzfftskcd: selFfTskKey,
						ToZzffactcd: selFfActKey,
						Megbtr: hours,
						Percent: percentage,
						Counter: i,
						Belnr: this.docno
					};
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
			// var jsonModel = that.getView().getModel("JSONModel");

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

					// jsonModel.setProperty("/modelData", oData.results);

				}
			});
		},
		splitPhaseCodesChange: function(oEvent) {
			debugger;
			var item = oEvent.getSource().getParent();
			var oTable = sap.ui.core.Fragment.byId("splitTransfer", "splitTable2");
			var idx = oTable.indexOfItem(item);
			var phaseCodeSelected = oEvent.getSource().getSelectedItem().getKey();
			var InputFields = this.getView().getModel("InputsModel");
			var userArray = InputFields.getProperty("/Inputs/Columns");
			var pspid = item.getCells()[0].getValue();
			// sap.ui.core.BusyIndicator.show(0);
			var that = this;

			$.when(that.serviceInstance.getTaskcodes(that.WipEditModel, phaseCodeSelected, that),
					that.serviceInstance.getActivitycodes(that.WipEditModel, pspid, that))
				.done(function(taskCodes, activityCodes) {
					debugger;
					// sap.ui.core.BusyIndicator.hide(0);
					taskCodes.results.unshift("");
					activityCodes.results.unshift("");
					userArray.taskCodes = taskCodes.results;
					userArray.activityCodes = activityCodes.results;
					InputFields.getProperty("/Inputs/Columns")[idx].Zztskcd = userArray.taskCodes;
					InputFields.getProperty("/Inputs/Columns")[idx].Zzactcd = userArray.activityCodes;
					that.getTableItems();
				});

		},
		splitFfTaskCodesChange: function(oEvent) {
			var item = oEvent.getSource().getParent();
			var oTable = sap.ui.core.Fragment.byId("splitTransfer", "splitTable2");
			var idx = oTable.indexOfItem(item);
			var taskCodeSelected = oEvent.getSource().getSelectedItem().getKey();
			var InputFields = this.getView().getModel("InputsModel");
			var userArray = InputFields.getProperty("/Inputs/Columns");
			var pspid = item.getCells()[0].getValue();
			// sap.ui.core.BusyIndicator.show(0);
			var that = this;
			$.when(that.serviceInstance.getFFActivitycodes(that.WipEditModel, taskCodeSelected, pspid, that))
				.done(function(ffActCodes) {
					debugger;
					// sap.ui.core.BusyIndicator.hide(0);
					ffActCodes.results.unshift("");
					userArray.ffActCodes = ffActCodes.results;
					InputFields.getProperty("/Inputs/Columns")[idx].Zzffactcd = userArray.ffActCodes;
					that.getTableItems();

				});
		},

		// Split END --> //

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
				var tomatters = [];
				for (var i = 0; i < modelValues.length; i++) {
					var tomatter = modelValues[i].ToMatter;
					if (tomatter !== "") {
						tomatteridx.push(i);
						tomatters.push(tomatter);
					}

				}
				this.aIndices = tomatteridx;
			} else {
				this.aIndices = this.getView().byId(this.tableId).getSelectedIndices();
			}
			var filter = this.getView().byId("idIconTabBar").getSelectedKey();
			if (filter === "LineItemEdits") {
				for (var k = 0; k < this.aIndices.length; k++) {
					this.narIndices.push(this.aIndices[k]);
				}

			}

			for (var j = 0; j < this.aIndices.length; j++) {
				this.indexes.push(this.aIndices[j]);
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
				var selectedLines = this.aIndices;
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
			var oModel1 = this.getOwnerComponent().getModel();
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

			oModel1.setUseBatch(false);
			oModel1.read("/WIPTRANSFER", {
				urlParameters: {
					"Action": "'CONSOLIDATE'",
					"CoNumber": "'" + docNumber + "'",
					"Buzei": "''",
					"Hours": "''",
					"Percentage": "''",
					"ToActivityCode": "''",
					"ToFfActivityCode": "''",
					"ToFfTaskCode": "''",
					"ToMatter": "''",
					"ToTaskCode": "''",
					"&$format": "json"

				},
				success: function(oData, oResponse) {
					var tableLineEdits = that.getView().byId("WipDetailsSet3");
					var index = tableLineEdits.getSelectedIndices();

					var i = 0;

					$.each(index, function(k, o) {

						var errorDefined = oData.results[i].Message;
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
				}
			});

		},

		onSave: function(oEvt) {
			var filter = this.getView().byId("idIconTabBar").getSelectedKey();
			if (filter === "NarrativeEdits") {
				this.onNarrativeEditsSave();
			} else if (filter === "LineItemEdits") {
				this.onLineItemEditsSave();
			} else {
				this.onLineItemTransfersSave();
			}

		},
		onNarrativeEditsSave: function(oEvt) {
			var sServiceUrl = this.getOwnerComponent().getModel().sServiceUrl;
			var that = this;
			$.each(that.uniqueId, function(i, o) {
				var narStr = that.rowData[o];
				that.saveObjects.push(narStr);
			});
			this.uniqueId = [];
			var changeObj = this.saveObjects;

			if (this.saveObjects.length === 0) {
				MessageBox.show(
					"No changes exists please verify and save.", {
						icon: sap.m.MessageBox.Icon.INFORMATION,
						title: "Narrative Edits",
						actions: [sap.m.MessageBox.Action.OK]
					}
				);
			} else {
				sap.ui.core.BusyIndicator.show(0);
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
				sap.ui.core.BusyIndicator.hide(0);
				MessageBox.show(
					"Narrative Updated Successfully", {
						icon: sap.m.MessageBox.Icon.SUCCESS,
						title: "Success",
						actions: [sap.m.MessageBox.Action.OK]
					}
				);

			}

			this.saveObjects = [];
			var InputFields = this.getView().getModel("InputsModel");
			InputFields.setProperty("/Inputs/isChanged", false);

		},
		onLineItemEditsSave: function(oEvt) {
			var that = this;
			$.each(this.narIndices, function(i, el) {
				if ($.inArray(el, that.uniqueId) === -1) that.uniqueId.push(el);
			});

			$.each(that.uniqueId, function(i, o) {
				var rowdat = that.rowData[o];
				that.saveObjects.push(rowdat);
			});
			this.uniqueId = [];
			this.narIndices = [];
			var finalArray;
			finalArray = this.saveObjects;
			if (this.saveObjects.length === 0) {
				MessageBox.show(
					"No changes exists please verify and save.", {
						icon: sap.m.MessageBox.Icon.INFORMATION,
						title: "Line Item Edits",
						actions: [sap.m.MessageBox.Action.OK]
					}
				);
			}
			this.saveObjects = [];

			var oComponent = this.getOwnerComponent(),

				oFModel = oComponent.getModel(),
				tData = $.extend(true, [], finalArray),
				urlParams,
				CoNumber = [],
				Hours = [],
				Percentage = [],
				ToActivityCode = [],
				ToFfActivityCode = [],
				ToFfTaskCode = [],
				ToMatter = [],
				ToTaskCode = [],
				ToPhaseCode = [],
				Buzei = [];

			$.each(tData, function(i, o) {
				CoNumber.push(o.Belnr);

				Hours.push(o.Megbtr);
				Percentage.push(o.Percent);
				ToActivityCode.push(o.Zzactcd);
				ToFfActivityCode.push(o.Zzffactcd);
				ToFfTaskCode.push(o.Zzfftskcd);
				ToMatter.push(o.Pspid);
				ToTaskCode.push(o.Zztskcd);
				ToPhaseCode.push(o.Zzphase);
				Buzei.push(o.Buzei);
			});

			urlParams = {

				Action: "EDIT",
				CoNumber: CoNumber,
				Hours: Hours,
				Percentage: Percentage,
				ToActivityCode: ToActivityCode,
				ToFfActivityCode: ToFfActivityCode,
				ToFfTaskCode: ToFfTaskCode,
				ToMatter: ToMatter,
				ToTaskCode: ToTaskCode,
				ToPhaseCode: ToPhaseCode,
				Buzei: Buzei

			};

			oFModel.callFunction("/WIPTRANSFER", {
				method: "GET",
				urlParameters: urlParams,
				success: function(oData) {
					sap.ui.core.BusyIndicator.hide();
					var res = oData.results;
					var msgTxt = res[0].Message;
					MessageBox.show(
						msgTxt, {
							icon: sap.m.MessageBox.Icon.ERROR,
							title: "Error",
							actions: [sap.m.MessageBox.Action.OK]
						}
					);

				}
			});

			var InputFields = this.getView().getModel("InputsModel");
			InputFields.setProperty("/Inputs/isChanged", false);
			finalArray = [];
		},

		changeTransferToMatter: function(oEvent) {
			debugger;

			var InputFields = this.getView().getModel("InputsModel");
			InputFields.setProperty("/Inputs/ToolbarEnable/Updatecodes", true);
			InputFields.setProperty("/Inputs/isChanged", true);
			var oView = this.getView(),
				oTable = oView.byId("WipDetailsSet3");

			var idx = oEvent.getSource().getParent();
			var o = idx.getIndex();
			this.index.push(o);
			this.indexes = this.removeDups(this.index);
			var ctx = oTable.getContextByIndex(o);
			var m = ctx.getModel(ctx.getPath());
			var obj = ctx.getObject();
			this.transferArray.push(obj);
			var matter = obj.ToMatter;
			if (matter !== "") {
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

					lineItems[o].ToMatter = matter;
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

					that.jsonModel.setProperty("/modelData", lineItems);
					that.getView().byId("WipDetailsSet3").setModel(that.jsonModel);
					oTable.bindRows("/modelData");
					m.setProperty(ctx.getPath() + "/Edit", true);
				});
			}

		},

		changeTransferPercentage: function(oEvent, oModel) {

			debugger;

			this.valueModifyedPercent = oEvent.getParameter("value");
			var tableBindingContext = oEvent.getSource().getBindingContext();
			tableBindingContext.getModel().setProperty(tableBindingContext.getPath() + "/Percent", this.valueModifyedPercent);

		},

		removeDups: function(indexs) {
			var unique = {};
			indexs.forEach(function(i) {
				if (!unique[i]) {
					unique[i] = true;
				}
			});
			return Object.keys(unique);
		},
		onLineItemTransfersSave: function(oModel) {
			debugger;

			debugger;

			if (this.indexes.length === 0) {

				MessageBox.show(
					"No changes exists please verify and save!", {
						title: "Save",
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function(oAction) {
							if (oAction === "OK") {

							}

						}
					}
				);

			} else {
				debugger;

				var oTable = this.getView().byId("smartTable_ResponsiveTable3").getTable();

				var oBinding = oTable.getBinding("rows");

				this.selectedIndexTransferSave = [];
				this.ctxTransferSave = [];
				this.mTransferSave = [];

				this.selectedIndexTransferSave = oTable.getSelectedIndices();

				for (var i = 0; i < this.selectedIndexTransferSave.length; i++) {
					this.ctxTransferSave = oTable.getContextByIndex(this.selectedIndexTransferSave[i]);
					this.transferArray.push(this.ctxTransferSave.getObject());
				}

				for (var q = 0; q < this.transferArray.length; q++) {
					if (this.transferArray[q].Percent === "" || this.transferArray[q].Percent === "0.000") {

						MessageBox.show(
							"Enter either Percentage or Hours", {
								title: "Save",
								actions: [sap.m.MessageBox.Action.OK],
								onClose: function(oAction) {
									if (oAction === "OK") {

									}

								}
							}
						);

					} else {

						this.TransferSave(this.transferArray, oModel);
					}
				}

			}

		},
		TransferSave: function(oList, oModel1) {
			var that = this;
			this.idxToPass = this.indexes.concat(this.selectedIndexTransferSave);
			$.each(this.idxToPass, function(i, el) {
				if ($.inArray(el, that.uniqueIdTransfer) === -1) that.uniqueIdTransfer.push(el);
			});

			var finalArray;
			finalArray = oList;
			if (this.uniqueIdTransfer.length === 0) {
				MessageBox.show(
					"No changes exists please verify and save.", {
						icon: sap.m.MessageBox.Icon.INFORMATION,
						title: "Line Item Edits",
						actions: [sap.m.MessageBox.Action.OK]
					}
				);
			}

			this.transferArray = [];
			this.uniqueIdTransfer = [];
			this.idxToPass = [];
			this.index = [];
			this.indexes = [];

			sap.ui.core.BusyIndicator.show();

			var oComponent = this.getOwnerComponent(),

				oFModel = oComponent.getModel(),

				tData = $.extend(true, [], finalArray),
				tbl = this.getView().byId("WipDetailsSet3"),
				urlParams,

				CoNumber = [],

				Hours = [],
				Percentage = [],
				ToActivityCode = [],
				ToFfActivityCode = [],
				ToFfTaskCode = [],
				ToMatter = [],
				ToTaskCode = [],
				ToPhaseCode = [],
				Buzei = [];

			$.each(tData, function(i, o) {

				CoNumber.push(o.Belnr);
				Percentage.push(o.Percent);
				ToActivityCode.push(o.selectedActCode);
				ToFfActivityCode.push(o.selectedFFActCode);
				ToFfTaskCode.push(o.selectedFFTaskCode);
				ToMatter.push(o.ToMatter);
				ToTaskCode.push(o.selectedTaskCode);
				ToPhaseCode.push(o.selectedPhaseCode);
				Buzei.push(o.Buzei);
			});

			urlParams = {

				Action: "TRANSFER",
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

			oFModel.callFunction("/WIPTRANSFER", {
				method: "GET",
				urlParameters: urlParams,
				success: function(oData) {
					that.aedit = true;
					sap.ui.core.BusyIndicator.hide();
					var res = oData.results;
					var msgTxt = res[0].Message;
					MessageBox.show(
						msgTxt, {
							icon: sap.m.MessageBox.Icon.ERROR,
							title: "ERROR",
							actions: [sap.m.MessageBox.Action.OK]
						}
					);

				}
			});
			var InputFields = this.getView().getModel("InputsModel");
			InputFields.setProperty("/Inputs/isChanged", false);
			finalArray = [];

		}

	});

});