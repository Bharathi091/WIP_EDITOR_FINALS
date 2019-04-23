sap.ui.define([
	"zprs/wipeditor/controller/BaseController",
	"zprs/wipeditor/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel",
	"zprs/wipeditor/model/ReportModel",
	"zprs/wipeditor/services/LineItemsServices",
	"zprs/wipeditor/spell/spellChek",
	"sap/m/MessageBox"

], function(BaseController, formatter, Filter, JSONModel, ReportModel, LineItemsServices, spellChek, MessageBox) {
	"use strict";

	return BaseController.extend("zprs.wipeditor.controller.NarrativeEdits", {
		formatter: formatter,

		onInit: function() {

			this.bus = sap.ui.getCore().getEventBus();

			this.bus.subscribe("homeChannelNarrative", "toSummaryEditNarrative", this.narrativeEditData, this);

			this.jsonModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.jsonModel, "JSONModel");

		},
		narrativeEditData: function(homeChannelNarrative, toSummaryEditNarrative, data) {
	if (!data.button) {
			var InputFields = this.getModel("InputsModel");
			var results = InputFields.getProperty("/Inputs/homeTable");
			this.jsonModel.setProperty("/modelData", results);
			var Otable = this.getView().byId("WipDetailsSet1");
			Otable.setModel(this.jsonModel);
			this.jsonModel.setProperty("/RowCount1", results.length);
		
				Otable.bindRows("/modelData");
			
			this.byId("searchText").setValue("");

			var OtableSmart0 = this.getView().byId("smartTable_ResponsiveTable1");
			var that = this;
			var oPersButton = OtableSmart0._oTablePersonalisationButton;
			oPersButton.attachPress(function() {

				var oPersController = OtableSmart0._oPersController;
				var oPersDialog = oPersController._oDialog;

				oPersDialog.attachOk(function(oEvent) {

					setTimeout(function() {

						that.jsonModel.setProperty("/modelData", that.getModel("InputsModel").getProperty("/Inputs/homeTable"));
						var Otablenew = that.getView().byId("WipDetailsSet1");
						Otablenew.bindRows("/modelData");
					}, 1000);
				

				});

			});
		
				this.spellCheck();
				var tableLineEdits = this.getView().byId("WipDetailsSet1");

			var index = this.getModel("InputsModel").getProperty("/Inputs/rowLineCount");
			for (var i = 0; i < index.length; i++) {
				tableLineEdits.getRows()[index[i]].getCells()[0].setVisible(false);
				tableLineEdits.getRows()[index[i]].getCells()[1].setVisible(true);

			}
			var change = InputFields.getProperty("/Inputs/isChanged");

			if (change === true) {

				this._Dialog = sap.ui.xmlfragment("zprs.wipeditor.Fragments.Fragment", this);
				this._Dialog.open();
			} else  {
				
				
				this.ReloadTable();
				

			}
	}
		else {
			if (data.button === "Reviewed" || data.button === "Unreview") {
				this.ReviewUnreview(data.button);
			} else if (data.button === "Replace Words") {
				this.onReplacewords(data.button);
			} else if (data.button === "Save") {
				this.onNarrativeEditsSave();
			}
		}
		

		},
		scrollChange: function(oEvent) {
		this.logValueScroll = 1;

			this.spellCheck();
			this.getModel("InputsModel").setProperty("/Inputs/spellCheckLogValue",0);
			

		},

		filter: function(oEvent) {

			oEvent.preventDefault();

			var value = oEvent.getParameters().value;

			var oFilter4 = new sap.ui.model.Filter(oEvent.getParameters().column.getFilterProperty(), sap.ui.model.FilterOperator.Contains,
				value);

			this.byId("WipDetailsSet1").getBinding("rows").filter(oFilter4, "Application");

			
			this.spellCheck();

		},

		ReviewUnreview: function(button) {
			

			var text = button;

			var oTable = [];

			var otable = this.byId("WipDetailsSet1");
			 var selectedIndex = this.getModel("InputsModel").getProperty("/Inputs/rowNarrativeCount");

			$.each(selectedIndex, function(k, o) {
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

			this.makeBatchCallsReviewUnreview(oTable);
		
			
		},
		makeBatchCallsReviewUnreview: function(oList) {

			var oComponent = this.getOwnerComponent(),

				oFModel = oComponent.getModel(),

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

			var InputFields = this.getView().getModel("InputsModel");

			InputFields.setProperty("/Inputs/isChanged", true);
			var data = InputFields.getProperty("/Inputs/homeTable");
			var saveObjects = InputFields.getProperty("/Inputs/saveObjects");
			var res = [];
			var Otable = this.getView().byId("WipDetailsSet1");

			var NarStr;

			var that = this;

			var endChars = [".", "?", "!", "\"", "'"];

			res = $.each(data, function(item) {
				var narString = data[item].NarrativeString.trim();
				NarStr = that.capitalizeFirstLetter(data[item].NarrativeString.trim());
				data[item].NarrativeString = NarStr;

				if (NarStr !== "") {
					var lastChar = NarStr.charAt(NarStr.length - 1);
					if (endChars.indexOf(lastChar.slice(-1)) === -1) {
						NarStr = NarStr + ".";

						data[item].NarrativeString = NarStr;

					}

					if (narString != data[item].NarrativeString) {
						saveObjects.push(data[item]);
					}
					InputFields.setProperty("/Inputs/saveObjects", saveObjects);


					return data[item].NarrativeString;
				}

			});

			this.jsonModel.setProperty("/modelData", data);

			this.getView().byId("WipDetailsSet1").setModel(this.jsonModel);
			Otable.bindRows("/modelData");
			InputFields.setProperty("/Inputs/isChanged", true);
			InputFields.setProperty("/Inputs/scope", this.getView().byId("WipDetailsSet1"));
		
			this.spellCheck();

		},

		remove_character: function(str, char_pos) {
			var part1 = str.substring(0, char_pos);
			var part2 = str.substring(char_pos + 1, str.length);
			return (part1 + part2);
		},

		removeSpaces: function(oEvt) {

			var InputFields = this.getView().getModel("InputsModel");

			InputFields.setProperty("/Inputs/isChanged", true);
			var data = InputFields.getProperty("/Inputs/homeTable");
			var saveObjects = InputFields.getProperty("/Inputs/saveObjects");
			var result;

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

				if (narStr != result) {
					saveObjects.push(data[item]);
				}

				return data[item].NarrativeString;
			});

			this.jsonModel.setProperty("/modelData", data);
			var Otable = this.getView().byId("WipDetailsSet1");

			this.getView().byId("WipDetailsSet1").setModel(this.jsonModel);
			Otable.bindRows("/modelData");
			InputFields.setProperty("/Inputs/isChanged", true);
			InputFields.setProperty("/Inputs/scope", this.getView().byId("WipDetailsSet1"));

	
			this.spellCheck();

		},

		onReplacewords: function(evt) {
			var oTable = this.getView().byId("smartTable_ResponsiveTable1").getTable();
			var selectedIndex = this.getModel("InputsModel").getProperty("/Inputs/rowNarrativeCount");
			if (selectedIndex.length === 0) {

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
				this._oreplaceDialog = sap.ui.xmlfragment("replaceword", "zprs.wipeditor.Fragments.popup", this);
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

			var oTable1 = sap.ui.core.Fragment.byId("replaceword", "bottomTable0");
			this.replaceItems = [];
			var that = this;
			var data = this.getModel("InputsModel").getProperty("/Inputs/homeTable");
			var saveObjects = this.getModel("InputsModel").getProperty("/Inputs/saveObjects");
			var selectedIndex = this.getModel("InputsModel").getProperty("/Inputs/rowNarrativeCount");
			$.each(selectedIndex, function(i, o) {

				var ctx = oTable.getContextByIndex(o);
				var m = ctx.getObject();
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
					} else {

						res = str.split(string).join(replacewith);
					}
					data.forEach(function(obj, k) {
						that.replaceItems[k] = obj;
					});

					that.replaceItems[o].NarrativeString = res;

					if (str != res) {
						saveObjects.push(that.replaceItems[o]);
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
			this.getView().getModel("InputsModel").setProperty("/Inputs/isChanged", true);
			this.getView().getModel("InputsModel").setProperty("/Inputs/scope", this.getView().byId("WipDetailsSet1"));
			this.spellCheck();
		},
		replaceall: function() {

			var oTable = this.getView().byId("smartTable_ResponsiveTable1").getTable();
			var oTable1 = sap.ui.core.Fragment.byId("replaceword", "bottomTable0");

			var replaceItems = [];
			var data = this.getModel("InputsModel").getProperty("/Inputs/homeTable");
			var saveObjects = this.getModel("InputsModel").getProperty("/Inputs/saveObjects");
			data.forEach(function(obj, k) {
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
						data.forEach(function(obj, k) {
							that.replace[k] = obj;
						});

						that.replace[i].NarrativeString = res;

						if (str != res) {
							saveObjects.push(that.replace[i]);
						}

						str = that.replace[i].NarrativeString;

					} else {

						var searchindex = str.search(string);
						if (searchindex >= 0) {
							res = str.split(string).join(replacewith);

							data.forEach(function(obj, k) {
								that.replace[k] = obj;
							});
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
			this.getView().getModel("InputsModel").setProperty("/Inputs/isChanged", true);
			this.getModel("InputsModel").setProperty("/Inputs/scope", this.getView().byId("WipDetailsSet1"));
			this.spellCheck();

		},

		onNarrativeEditsSave: function() {
			var sServiceUrl = this.getOwnerComponent().getModel().sServiceUrl;
			var that = this;

			var saveObjects = this.getModel("InputsModel").getProperty("/Inputs/saveObjects");
			this.uniqueId = [];
			var changeObj = saveObjects;

			if (saveObjects.length === 0) {
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

			saveObjects = this.getModel("InputsModel").setProperty("/Inputs/saveObjects", []);
			var InputFields = this.getView().getModel("InputsModel");
			InputFields.setProperty("/Inputs/isChanged", false);
		},
		Reload: function(oEvent) {

			this.table = oEvent.getSource().getParent().getParent().getTable();

			var InputFields = this.getModel("InputsModel");

			var change = InputFields.getProperty("/Inputs/isChanged");

			if (change === true) {

				this._Dialog = sap.ui.xmlfragment("zprs.wipeditor.Fragments.Fragment", this);
				this._Dialog.open();
			} else {
				this.ReloadTable();

			}

		},

		ReloadTable: function() {

			this.ignoreLog = 1;
			var aFilter = [];
			var table = this.getView().byId("WipDetailsSet1");
			var that = this;
			this.byId("searchText").setValue("");
			var InputFields = this.getModel("InputsModel");

			var Pspid = InputFields.getProperty("/Inputs/rootPspid");

			var Otable = that.getView().byId("WipDetailsSet1");
			var odatefrom = InputFields.getProperty("/Inputs/odatefrom");
			var odateto = InputFields.getProperty("/Inputs/odateto");
			aFilter.push(new Filter("Pspid", sap.ui.model.FilterOperator.EQ, Pspid));
			aFilter.push(new Filter("Budat", sap.ui.model.FilterOperator.BT, odatefrom, odateto));

			var oModel = this.getOwnerComponent().getModel();
			sap.ui.core.BusyIndicator.show(0);
		

			LineItemsServices.getInstance().selectListItem(oModel, aFilter)
				.done(function(oData) {

					sap.ui.core.BusyIndicator.hide(0);

					that.getModel("InputsModel").setProperty("/Inputs/homeTable", oData.results);

					that.jsonModel.setProperty("/modelData", oData.results);

					Otable.setModel(that.jsonModel);
					Otable.bindRows("/modelData");

				})
				.fail(function() {

				});

			InputFields.setProperty("/Inputs/isChanged", false);
			InputFields.setProperty("/Inputs/scope", "");
			if (this._Dialog) {

				this._Dialog.close();

			}
	
			this.getView().byId("WipDetailsSet1").getModel().refresh(true);
			this.spellCheck();
		},

		NarrativeEditsSelection: function(oEvent) {

			var InputFields = this.getView().getModel("InputsModel");
			var rowCount = this.byId("WipDetailsSet1").getSelectedIndices();
			var rowLineCount = [];
				this.getModel("InputsModel").setProperty("/Inputs/spellCheckLogValue",1);

			for (var i = 0; i < rowCount.length; i++) {
				rowLineCount.push(rowCount[i]);
			}
			this.getModel("InputsModel").setProperty("/Inputs/rowNarrativeCount", rowLineCount);

			if (rowCount.length) {

				InputFields.setProperty("/Inputs/ToolbarEnable/NarrativeReviewed", true);
				InputFields.setProperty("/Inputs/ToolbarEnable/NarrativeUnreview", true);
				InputFields.setProperty("/Inputs/ToolbarEnable/Replace_Words", true);

			} else {

				InputFields.setProperty("/Inputs/ToolbarEnable/NarrativeReviewed", false);
				InputFields.setProperty("/Inputs/ToolbarEnable/NarrativeUnreview", false);
				InputFields.setProperty("/Inputs/ToolbarEnable/Replace_Words", false);

			}

		},
		onGlobalSearch: function() {

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

			var otable = this.byId("WipDetailsSet1");

			this.jsonModel.setData({
				modelData: result
			});
			otable.setModel(this.jsonModel);

			otable.bindRows("/modelData");
			this.jsonModel.setProperty("/RowCount1", result.length);
			this.spellCheck();

		},
		dictionaryChange: function(oEvent) {

			var key;
			var that = this;
			var selectedText = this.getView().byId("comboPosition").getSelectedItem().getText();
			var otable = this.getView().byId("WipDetailsSet1");
			var InputFields = this.getView().getModel("InputsModel");
			var dictionary = InputFields.getProperty("/Inputs/Countries_collection");
			for (var i = 0; i < dictionary.length; i++) {
				if (dictionary[i].Text === selectedText) {
					key = dictionary[i].Key;

					var language = dictionary[i].lang;
					InputFields.setProperty("/Inputs/changedLang", language);
					that.getView().getModel("InputsModel").setProperty("/Inputs/dicDefLanguage", dictionary[i].Key);

			
					this.spellCheck();
				}
			}

		},
		onNarrativeSort: function(oEvent) {
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

			var self = this;

		
			this.spellCheck();

			oEvent.getSource().getParent().getTable().setModel(this.jsonModel);

		},
		spellCheck: function() {
			var that = this;
			var Otable = this.getView().byId("WipDetailsSet1");
			setTimeout(function() {

				$(document).ready(function() {
					$(".fulcrum-editor-textarea").spellCheker({
						lang_code: that.getView().getModel("InputsModel").getProperty("/Inputs/dicDefLanguage"),
						scope1: that,
						table: Otable,
						scope: that.getModel("InputsModel").getProperty("/Inputs"),
						outputTex: 'NarrativeString',
						dictionaryPath: "./spell/typo/dictionaries"
					});
				});
			}, 1000);
		}

	});

});