sap.ui.define([
	"zprs/wipeditor/controller/BaseController",
	"zprs/wipeditor/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel",
	"zprs/wipeditor/model/ReportModel",
	"zprs/wipeditor/services/LineItemsServices",
	"zprs/wipeditor/spell/spellChek",
	"sap/m/MessageBox",
	"zprs/wipeditor/spell/typo/typo",
	"sap/ui/core/format/DateFormat",
	"sap/ui/export/Spreadsheet",

], function(BaseController, formatter, Filter, JSONModel, ReportModel, LineItemsServices, spellChek, MessageBox, typo, DateFormat,
	Spreadsheet) {
	"use strict";

	return BaseController.extend("zprs.wipeditor.controller.NarrativeEdits", {
		formatter: formatter,

		onInit: function() {

			this.bus = sap.ui.getCore().getEventBus();

			this.bus.subscribe("homeChannelNarrative", "toSummaryEditNarrative", this.narrativeEditData, this);
			this.bus.subscribe("homeChannelNarrativespell", "toSummaryEditNarrativespell", this.spellCheck, this);
			this.bus.subscribe("expansion", "header", this.expansion, this);

			this.jsonModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.jsonModel, "JSONModel");

			this.wrongWordsArr = [];
			this.ignoreAllArr = "";
			this.spanId = 1000;
			this.nextNarrative = 0;
			this.userDictionary = [];
			this.globalLog = true;
			this.globalSpellArr = [];
			this.logArr = [];
			var that = this;
			this.oRootPath = jQuery.sap.getModulePath("zprs.wipeditor");
			this.dictionaryLib = new Typo("en_US", false, false, {
				// dictionaryPath: location.protocol + '//' + location.host + "/webapp/spell/typo/dictionaries"
				dictionaryPath: that.oRootPath + "/spell/typo/dictionaries"
			});

		},
		expansion: function(expansion, header, data) {
			if (window.screen.width > 1366) {

				var isExpanded = data.par1;
				if (isExpanded) {

					this.byId("WipDetailsSet1").setVisibleRowCount(13);
				} else {
					this.byId("WipDetailsSet1").setVisibleRowCount(18);
				}

			} else {
				var isExpanded = data.par1;
				if (isExpanded) {

					this.byId("WipDetailsSet1").setVisibleRowCount(5);
				} else {
					this.byId("WipDetailsSet1").setVisibleRowCount(10);
				}

			}
		},

		//narrative edits data binding
		narrativeEditData: function(homeChannelNarrative, toSummaryEditNarrative, data) {

			if (!data.button) {
				var InputFields = this.getModel("InputsModel");
				var results = InputFields.getProperty("/Inputs/homeTable");
				InputFields.setProperty("/Inputs/currView", {
					view: "NarEdits",
					scope: this
				});
				var resultsWithid = results;
				for (var i = 0; i < resultsWithid.length; i++) {
					resultsWithid[i].id = i;
				}

				InputFields.setProperty("/Inputs/homeTable", resultsWithid);
				this.jsonModel.setProperty("/modelData", resultsWithid);
				var Otable = this.getView().byId("WipDetailsSet1");
				Otable.setModel(this.jsonModel);
				this.jsonModel.setProperty("/RowCount1", results.length);
				if (window.screen.width > 1366) {

					this.byId("WipDetailsSet1").setVisibleRowCount(18);
				}
				Otable.bindRows("/modelData");

				this.byId("searchText").setValue("");
				this.byId("smartTable_ResponsiveTable1").setIgnoreFromPersonalisation(this.getModel("InputsModel").getProperty(
					"/Inputs/ignoreColumns"));
				//	__component0---detail--NarrativeEditsVBox--smartTable_ResponsiveTable1-ui5table-sapUiTableGridCnt

				// var OtableSmart0 = this.getView().byId("smartTable_ResponsiveTable1");
				// var that = this;
				// var oPersButton = OtableSmart0._oTablePersonalisationButton;
				// oPersButton.attachPress(function() {

				// 	var oPersController = OtableSmart0._oPersController;
				// 	var oPersDialog = oPersController._oDialog;

				// 	oPersDialog.attachOk(function(oEvent) {

				// 		setTimeout(function() {
				// 			

				// 			that.jsonModel.setProperty("/modelData", that.getModel("InputsModel").getProperty("/Inputs/homeTable"));
				// 			var Otablenew = that.getView().byId("WipDetailsSet1");
				// 			Otablenew.bindRows("/modelData");
				// 		}, 1000);

				// 	});

				// });

				this.spellCheck();

				var change = InputFields.getProperty("/Inputs/isChanged");

				if (change === true) {

					this._Dialog = sap.ui.xmlfragment("zprs.wipeditor.Fragments.Fragment", this);
					this._Dialog.open();
				} else {

					this.ReloadTable();

				}
			} else {
				if (data.button === "Reviewed" || data.button === "UnReview") {
					this.ReviewUnreview(data.button);
				} else if (data.button === "Replace Words") {
					this.onReplacewords(data.button);
				} else if (data.button === "Save") {
					this.onNarrativeEditsSave();
				} else if (data.button === "A Global Spell Check") {
					this.onGlobalSpellCheck();
				}
			}

			this.spellCheck();
			this.getUserDictionaryWords();

			var that = this;
			setTimeout(function() {
				$("#" + that.getView().byId("smartTable_ResponsiveTable1").sId + "-ui5table-sapUiTableGridCnt").css('display', 'none');
				that.getView().byId("smartTable_ResponsiveTable1").getTable().setVisible(false);
			}, 1000);

		},

		//apply variant
		applyVariant: function() {
			var that = this;
			setTimeout(function() {
				that.jsonModel.setProperty("/modelData", that.getModel("InputsModel").getProperty("/Inputs/homeTable"));
				var Otablenew = that.getView().byId("WipDetailsSet1");
				Otablenew.bindRows("/modelData");
			}, 1000);
		},

		//scroll event
		scrollChange: function(oEvent) {
			this.logValueScroll = 1;
			this.spellCheck();

			this.getModel("InputsModel").setProperty("/Inputs/spellCheckLogValue", 0);
			var that = this;
			setTimeout(function() {
				that.getView().byId("WipDetailsSet1").getRows()[0].getCells()[5].focus();
				//	that.getView().byId("Reload").focus();
			}, 1000);

		},

		//review unreview
		ReviewUnreview: function(button) {

			var oTable = [];

			var otable = this.byId("WipDetailsSet1");
			var selectedIndex = this.getModel("InputsModel").getProperty("/Inputs/rowNarrativeCount");
			var text = button;
			$.each(selectedIndex, function(k, o) {
				var selContext = otable.getContextByIndex(o);

				var obj = selContext.getObject();
				if (text === "Reviewed") {
					selContext.getModel().setProperty(selContext.getPath() + "/ReviewComplete", "Reviewed");
					obj.ReviewComplete = "X";

				} else {
					selContext.getModel().setProperty(selContext.getPath() + "/ReviewComplete", "");
					obj.ReviewComplete = "";

				}

				oTable.push(obj);

			});

			this.makeBatchCallsReviewUnreview(oTable, button);

		},
		makeBatchCallsReviewUnreview: function(oList, button) {
			sap.ui.core.BusyIndicator.show();
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
			var text = button;
			var jsonModel = that.getView().getModel("JSONModel");

			oFModel.callFunction("/WIPREVIEW", {
				method: "GET",
				urlParameters: urlParams,

				success: function(oData) {
					sap.ui.core.BusyIndicator.hide();

					var otable = that.byId("WipDetailsSet1");
					var selectedIndex = that.getModel("InputsModel").getProperty("/Inputs/rowNarrativeCount");
					$.each(selectedIndex, function(k, o) {
						var selContext = otable.getContextByIndex(o);

						var obj = selContext.getObject();
						if (text === "Reviewed") {
							selContext.getModel().setProperty(selContext.getPath() + "/ReviewComplete", "Reviewed");
							obj.ReviewComplete = "Reviewed";

						} else {
							selContext.getModel().setProperty(selContext.getPath() + "/ReviewComplete", "");
							obj.ReviewComplete = "";

						}

					});

				},
				error: function(oData) {
					sap.ui.core.BusyIndicator.hide();
					MessageBox.show(JSON.parse(oData.responseText).error.message.value);

				}
			});
		},

		//narrative capitalization
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

			setTimeout(function() {
				that.getView().byId("capitalization").focus();
			}, 1000);

		},

		//narrative remove spaces
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

			setTimeout(function() {
				that.getView().byId("Removespaces").focus();
			}, 1000);

		},

		//replace words
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
			var oTable2 = sap.ui.core.Fragment.byId("replaceword", "bottomTable01");
			oTable2.setVisible(false);
			oTable2.removeAllItems();

			this._oreplaceDialog.close();
		},
		onreplace: function() {

			var replaceLog = 0;
			var oTable = this.getView().byId("WipDetailsSet1");

			var oTable1 = sap.ui.core.Fragment.byId("replaceword", "bottomTable0");
			var string = oTable1.mAggregations.items[0].getCells()[0].getValue();
			if (string) {
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
						var stringSplit = string.split(" ");
						if (stringSplit.length > 1) {
							check = false;
						} else {
							var check = cells[3].getSelected();
						}

						if (check) {
							var stringarr = str.split(" ");
							$.each(stringarr, function(d, o) {
								if (stringarr[d] === string) {
									replaceLog++;
									stringarr[d] = replacewith;
								} else {
									if (stringarr[d].endsWith(".")) {
										var newSplitWord = stringarr[d].split(".");
										if (newSplitWord[0] === string) {
											stringarr[d] = replacewith + ".";
											replaceLog++;
										}
									}
								}
							});
							res = stringarr.join(" ");
						} else {

							res = str.split(string).join(replacewith);
							if (res !== str) {
								replaceLog++;
							}

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
					//	oTable.bindRows("/modelData");

				});
			} else {
				var oTable2 = sap.ui.core.Fragment.byId("replaceword", "bottomTable01");

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

					var items = oTable2.getItems();
					$.each(items, function(l, obj) {

						var cells = obj.getCells();
						var string = cells[0].getValue();
						var replacewith = cells[1].getValue();
						var check = cells[3].getSelected();
						var stringSplit = string.split(" ");
						if (stringSplit.length > 1) {
							check = false;
						} else {
							var check = cells[3].getSelected();
						}

						if (check) {
							var stringarr = str.split(" ");
							$.each(stringarr, function(d, o) {
								if (stringarr[d] === string) {
									replaceLog++;
									stringarr[d] = replacewith;
								} else {
									if (stringarr[d].endsWith(".")) {
										var newSplitWord = stringarr[d].split(".");
										if (newSplitWord[0] === string) {
											stringarr[d] = replacewith + ".";
											replaceLog++;
										}
									}
								}
							});
							res = stringarr.join(" ");
						} else {

							res = str.split(string).join(replacewith);
							if (res !== str) {
								replaceLog++;
							}

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
					//	oTable.bindRows("/modelData");

				});
			}
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
			// this.getView().getModel("InputsModel").setProperty("/Inputs/ToolbarEnable/NarrativeReviewed", false);
			// this.getView().getModel("InputsModel").setProperty("/Inputs/ToolbarEnable/NarrativeUnreview", false);
			// this.getView().getModel("InputsModel").setProperty("/Inputs/ToolbarEnable/Replace_Words", false);

			if (replaceLog === 0) {

				MessageBox.show(
					"We couldn't find what you were looking for", {

						title: "Invalid Word",
						actions: [sap.m.MessageBox.Action.OK]
					}
				);

			}
			var oTable2 = sap.ui.core.Fragment.byId("replaceword", "bottomTable01");
			oTable2.setVisible(false);
			oTable2.removeAllItems();
		},
		replaceall: function() {

			var replaceAllLog = 0;

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
					var stringSplit = string.split(" ");
					if (stringSplit.length > 1) {
						check = false;
					} else {
						var check = cells[3].getSelected();
					}
					if (check) {
						var stringarr = str.split(" ");
						$.each(stringarr, function(d, o) {
							if (stringarr[d] === string) {
								replaceAllLog++;
								stringarr[d] = replacewith;
							} else {
								if (stringarr[d].endsWith(".")) {
									var newSplitWord = stringarr[d].split(".");
									if (newSplitWord[0] === string) {
										replaceAllLog++;
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
							replaceAllLog++;
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
			//	oTable.bindRows("/modelData");

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
			// this.getView().getModel("InputsModel").setProperty("/Inputs/ToolbarEnable/NarrativeReviewed", false);
			// this.getView().getModel("InputsModel").setProperty("/Inputs/ToolbarEnable/NarrativeUnreview", false);
			// this.getView().getModel("InputsModel").setProperty("/Inputs/ToolbarEnable/Replace_Words", false);

			if (replaceAllLog === 0) {

				MessageBox.show(
					"We couldn't find what you were looking for", {

						title: "Invalid Word",
						actions: [sap.m.MessageBox.Action.OK]
					}
				);

			}
			var oTable2 = sap.ui.core.Fragment.byId("replaceword", "bottomTable01");
			oTable2.setVisible(false);
			oTable2.removeAllItems();

		},
		addbuttonToReplace: function(evt) {

			var oTable = sap.ui.core.Fragment.byId("replaceword", "bottomTable01");
			oTable.setVisible(true);
			var value = evt.getSource().getParent().mAggregations.cells[0].getValue();
			var value1 = evt.getSource().getParent().mAggregations.cells[1].getValue();

			sap.ui.core.Fragment.byId("replaceword", "bottomTable0").getItems()[0].mAggregations.cells[0].setValue("");

			sap.ui.core.Fragment.byId("replaceword", "bottomTable0").getItems()[0].mAggregations.cells[1].setValue("");

			var col = [new sap.m.Input({
					width: "100%",
					name: "string[]",
					value: value,
					editable: false

				}),
				new sap.m.Input({

					width: "100%",
					name: "replace[]",
					value: value1,
					editable: false
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
					type: "Reject",
					press: function(oEvent) {
						var tbl = sap.ui.core.Fragment.byId("replaceword", "bottomTable01");
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

		//narrative save
		onNarrativeEditsSave: function() {
			sap.ui.core.BusyIndicator.show(0);
			var sServiceUrl = this.getOwnerComponent().getModel().sServiceUrl;
			var that = this;

			var saveObjects = this.getModel("InputsModel").getProperty("/Inputs/saveObjects");
			this.uniqueId = [];
			var changeObj = [];
			$.each(saveObjects, function(i, el) {
				if (el.ReviewComplete === "Reviewed") el.ReviewComplete = "X";
				if ($.inArray(el, changeObj) === -1) changeObj.push(el);
			});

			if (saveObjects.length === 0) {
				sap.ui.core.BusyIndicator.hide(0);
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
				saveObjects = this.getModel("InputsModel").setProperty("/Inputs/saveObjects", []);
				var InputFields = this.getView().getModel("InputsModel");
				InputFields.setProperty("/Inputs/isChanged", false);

			}

		},

		//narrative table reload
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
			var len = InputFields.getProperty("/Inputs/DocNUmber").length;
			if (len > 0) {

				for (var i = 0; i < len; i++) {
					aFilter.push(new Filter("Belnr", "EQ", InputFields.getProperty("/Inputs/DocNUmber")[i]));
				}

			}

			var len1 = InputFields.getProperty("/Inputs/timeKeeperValue").length;
			if (len1 > 0) {

				for (var j = 0; j < len1; j++) {
					aFilter.push(new Filter("Pernr", "EQ", InputFields.getProperty("/Inputs/timeKeeperValue")[j]));
				}

			}

			var oModel = this.getOwnerComponent().getModel();
			sap.ui.core.BusyIndicator.show(0);

			LineItemsServices.getInstance().selectListItem(oModel, aFilter)
				.done(function(oData) {

					var odata = oData.results;
					for (var i = 0; i < oData.results.length; i++) {
						odata[i].id = i;
						if (odata[i].ReviewComplete === "X") {
							odata[i].ReviewComplete = "Reviewed";
						}
					}

					that.getModel("InputsModel").setProperty("/Inputs/homeTable", odata);

					that.jsonModel.setProperty("/modelData", odata);

					Otable.setModel(that.jsonModel);
					Otable.bindRows("/modelData");

					setTimeout(function() {
						sap.ui.core.BusyIndicator.hide(0);
						that.getView().byId("WipDetailsSet1").getRows()[0].getCells()[5].focus();

						that.getView().byId("Reload").focus();

					}, 1000);

				})
				.fail(function() {

				});

			InputFields.setProperty("/Inputs/isChanged", false);
			InputFields.setProperty("/Inputs/scope", "");
			if (this._Dialog) {

				this._Dialog.close();

			}
			InputFields.setProperty("/Inputs/ToolbarEnable/NarrativeReviewed", false);
			InputFields.setProperty("/Inputs/saveObjects", []);
			InputFields.setProperty("/Inputs/ToolbarEnable/NarrativeUnreview", false);
			InputFields.setProperty("/Inputs/ToolbarEnable/Replace_Words", false);
			this.getView().byId("WipDetailsSet1").getModel().refresh(true);
			this.spellCheck();

		},

		//narrative table selection
		NarrativeEditsSelection: function(oEvent) {

			var InputFields = this.getView().getModel("InputsModel");
			var rowCount = this.byId("WipDetailsSet1").getSelectedIndices();
			var rowLineCount = [];
			this.getModel("InputsModel").setProperty("/Inputs/spellCheckLogValue", 1);

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

		//global search
		onGlobalSearch: function() {

			var searchValue = this.byId("searchText").getValue();

			var result = [];

			this.getModel("InputsModel").getProperty("/Inputs/homeTable").forEach(
				function(value, index) {

					var date = value.Budat;

					var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
						// formatOptions:{ style: 'medium' , UTC:true ,pattern: 'dd.MM.YYYY' }
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
			this.getModel("InputsModel").setProperty("/Inputs/globalSearchModel", result);
			otable.setModel(this.jsonModel);

			otable.bindRows("/modelData");
			this.jsonModel.setProperty("/RowCount1", result.length);
			this.spellCheck();
			var that = this;
			setTimeout(function() {
				that.getView().byId("searchText").focus();
			}, 1000);

		},

		//dictionary
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

		//column sorting
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

		//narrative spellcheck
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
						dictionaryPath: that.oRootPath + "/spell/typo/dictionaries"
					});
				});
			}, 1000);
		},

		//Global Spell Check Code start --->

		onGlobalSpellCheck: function(oEvent) {

			var that = this;

			var InputFields = this.getView().getModel("InputsModel");

			if (InputFields.getProperty("/Inputs/globalStatus") === false) {

				this.dictionaryLib = new Typo("en_US", false, false, {
					// dictionaryPath: location.protocol + '//' + location.host + "/webapp/spell/typo/dictionaries"
					dictionaryPath: that.oRootPath + "/spell/typo/dictionaries"
				});
			}

			InputFields.setProperty("/Inputs/activity", "");
			InputFields.setProperty("/Inputs/applyLog", true);
			InputFields.setProperty("/Inputs/replacewith", []);
			this.logArr = [];
			var selectedNarrative = InputFields.getProperty("/Inputs/rowNarrativeCount");
			if (selectedNarrative.length > 0) {
				for (var i = 0; i < selectedNarrative.length; i++) {
					var element = $(".fulcrum-editor-textarea")[selectedNarrative[i]];
					if (element.innerHTML.includes("<span")) {

						that.logArr.push({
							id: selectedNarrative[i],
							Narrative: element.textContent
						});
					}
				}
				if (that.logArr.length === 0) {
					var odialog = this.GlobalSepllCheckDialog();
					sap.ui.core.Fragment.byId("GlobalSepllCheck", "MainFragment").setVisible(false);
					sap.ui.core.Fragment.byId("GlobalSepllCheck", "noSpell").setVisible(true);
					odialog.open();
				}
			} else {
				$(".fulcrum-editor-textarea").each(function(index, element) {

					if (element.innerHTML.includes("<span")) {

						that.logArr.push({
							id: index,
							Narrative: element.textContent
						});
					}
				});
			}

			var narrative = this.getNarrrative(this.logArr);
			if (narrative.length === 0) {
				var odialog = this.GlobalSepllCheckDialog();
				sap.ui.core.Fragment.byId("GlobalSepllCheck", "MainFragment").setVisible(false);
				sap.ui.core.Fragment.byId("GlobalSepllCheck", "noSpell").setVisible(true);
				odialog.open();
			}
			// narrative[0].Narrative = InputFields.getProperty("/Inputs/applyArray")[0].Narrative;
			else {
				var suggestionsList = that.getSuggestionList(narrative[1]);

				if (suggestionsList.length > 0) {

					if (this.globalLog === true) {

						var odialog = this.GlobalSepllCheckDialog();
						sap.ui.core.Fragment.byId("GlobalSepllCheck", "MainFragment").setVisible(true);
						sap.ui.core.Fragment.byId("GlobalSepllCheck", "noSpell").setVisible(false);

						if (InputFields.getProperty("/Inputs/globalStatus") === false) {
							sap.ui.core.Fragment.byId("GlobalSepllCheck", "fragmentDictionary").setSelectedIndex(0);

						}

						odialog.open();
						InputFields.setProperty("/Inputs/status", "open");

						this.globalSpellArr = [];
					}
					this.globalLog = false;

					this.setGlobalSpellCheckData(narrative[0].Narrative, suggestionsList, narrative[1]);

					this.globalSpellArr.push({
						idx: narrative[0].id,
						Narrative: narrative[0].Narrative,
						word: narrative[1]
					});

				} else {
					var odialog = this.GlobalSepllCheckDialog();
					sap.ui.core.Fragment.byId("GlobalSepllCheck", "MainFragment").setVisible(false);
					sap.ui.core.Fragment.byId("GlobalSepllCheck", "noSpell").setVisible(true);
					odialog.open();

				}
				InputFields.setProperty("/Inputs/globalStatus", false);
			}
			// $(".fulcrum-editor-textarea1")[0].innerHTML = InputFields.getProperty("/Inputs/applyArray")[0].Narrative;

		},

		GlobalSepllCheckDialog: function() {
			if (!this.Gspellcheck) {
				this.Gspellcheck = sap.ui.xmlfragment("GlobalSepllCheck", "zprs.wipeditor.Fragments.GlobalSpellCheck", this.getView().getController());

			}
			return this.Gspellcheck;
		},
		GlobalSpellCheckCancel: function() {

			this.Gspellcheck.close();
			this.nextNarrative = 0;
			this.logArr = [];
			this.globalLog = true;

			var InputsModel = this.getView().getModel("InputsModel");
			InputsModel.setProperty("/Inputs/replaceAllArr", []);
			InputsModel.setProperty("/Inputs/replaceArr", []);
			InputsModel.setProperty("/Inputs/applyArray", []);

			InputsModel.setProperty("/Inputs/activity", "");

			sap.ui.core.Fragment.byId("GlobalSepllCheck", "MainFragment").setVisible(true);
			sap.ui.core.Fragment.byId("GlobalSepllCheck", "noSpell").setVisible(false);

		},
		LineItemEditsSelection: function(oEvent) {
			var text = oEvent.getParameters().listItems[0].mAggregations.cells[0].mProperties.text;

			var InputsModel = this.getView().getModel("InputsModel");
			//	var string1 = oEvent.getSource().getTitle();
			InputsModel.setProperty("/Inputs/replaceWord", text);

		},
		GlobalSpellCheckOk: function() {

			this.nextNarrative = 0;
			var InputsModel = this.getView().getModel("InputsModel");
			var indexer = 0;
			if (this.globalSpellArr.length > 1) {
				indexer = this.globalSpellArr[this.globalSpellArr.length - 2].idx;
			}
			if (this.globalSpellArr.length === 1) {
				indexer = this.globalSpellArr[this.globalSpellArr.length - 1].idx;
			}

			this.globalLog = true;
			var that = this;

			var finalArray = InputsModel.getProperty("/Inputs/replaceAllArr").concat(InputsModel.getProperty("/Inputs/replaceArr"));
			//  if(finalArray.length !== 0 ){
			var saveObjects = InputsModel.getProperty("/Inputs/saveObjects");

			$(".fulcrum-editor-textarea").each(function(index, element) {

				if (element.innerHTML.includes("<span")) {

					that.logArr.forEach(function(item, io) {

						if (item.id === indexer) {

							finalArray.forEach(function(obj) {

								item.Narrative = that.globalReplaceAll(item.Narrative, obj.oldValue, obj.newValue);

							});

						}

						if (index === item.id) {

							element.innerHTML = item.Narrative;

							var changeObject = InputsModel.getProperty("/Inputs/homeTable")[index];
							changeObject.NarrativeString = element.innerText;
							//InputsModel.getProperty("/Inputs/homeTable")[index] = changeObject;
							saveObjects.push(changeObject);

						}

					});

				}

			});
			// }
			InputsModel.setProperty("/Inputs/applyArray", []);

			InputsModel.setProperty("/Inputs/replaceAllArr", []);
			InputsModel.setProperty("/Inputs/replaceArr", []);
			InputsModel.setProperty("/Inputs/globalStatus", false);

			InputsModel.setProperty("/Inputs/activity", "");

			this.logArr = [];
			this.Gspellcheck.close();

			this.spellCheck();

		},

		getUserDictionaryWords: function() {

			var that = this;
			var InputsModel = this.getView().getModel("InputsModel");
			sap.ui.core.BusyIndicator.show(0);
			this.getOwnerComponent().getModel().read("/AddWordsToDictionarySet", {
				method: "GET",
				success: function(oData) {

					that.userDictionary = oData.results;

					if (InputsModel.getProperty("/Inputs/changeStatusLog")) {

						var word = InputsModel.getProperty("/Inputs/currentWrongWord");
						var suggestionsList = that.getSuggestionList(InputsModel.getProperty("/Inputs/currentWrongWord"));

						that.userDictionary.forEach(function(item) {
							if (item.WrongWord === InputsModel.getProperty("/Inputs/currentWrongWord")) {
								suggestionsList.push(item.Word);
							}
						});

						var Narrative = $(".fulcrum-editor-textarea1")[0].innerHTML;

						that.Gspellcheck.setModel(new JSONModel({
							data: InputsModel.getProperty("/Inputs/Countries_collection"),
							narrative: Narrative,
							suggest: suggestionsList,
							word: word
						}), "CountriesList");

						InputsModel.setProperty("/Inputs/changeStatusLog", false);
					}

					sap.ui.core.BusyIndicator.hide(0);

				},

				error: function(oData) {

				}
			});
		},

		globalReplaceAll: function(str, find, replace) {

			return str.replace(new RegExp(find, 'g'), replace);
		},
		getNarrrative: function(nartiveArr) {

			var that = this;
			var NarrativeRows = nartiveArr;
			var arr = [];
			var InputsModel = this.getView().getModel("InputsModel");
			this.chklog = true;
			this.suggetLog = false;
			NarrativeRows.forEach(function(item, io) {
				var word = that.getWrongWord(item.Narrative);
				if (word.length > 0) {

					//item.Narrative = that.globalReplaceAll(item.Narrative, word[0], '<span class="target">' + word[0] + '</span>');
					InputsModel.setProperty("/Inputs/worngWord", word);

					word.forEach(function(itemo) {

						var suggestionsList = that.getSuggestionList(itemo);
						if (suggestionsList.length > 0) {
							that.suggetLog = true;
						}

						if (that.suggetLog) {

							if (that.chklog === true) {

								arr.push(item);
								arr.push(itemo);

								that.chklog = false;
							}

							InputsModel.getProperty("/Inputs/applyArray").push({
								idap: item.id,
								Narrative: that.globalReplaceAll(item.Narrative, itemo, '<span class="target">' + itemo + '</span>'),
								word: itemo

							});
						}

					});

					word.forEach(function(itemo) {

						that.logArr[io].Narrative = that.globalReplaceAll(item.Narrative, itemo, '<span class="target">' + itemo + '</span>');
					});

				}

			});

			// var word = this.getWrongWord(NarrativeRows[0]);
			// this.BillEditModel.setProperty("/Inputs/worngWord", word);
			// NarrativeRows[0] = this.globalReplaceAll(NarrativeRows[0], word[0], '<span class="target">' + word[0] + '</span>');
			// this.spanId++;
			// arr.push(NarrativeRows[0]);
			// arr.push(word[0]);
			// arr[0].Narrative = InputsModel.getProperty("/Inputs/applyArray")[0].Narrative;
			return arr;
		},
		getWrongWord: function(narrative) {

			var that = this;

			var str2 = narrative.replace(/\'/g, '').split(/([\s]+)/).filter(Boolean);

			var specialChars = /([\d!~@#$%^&*()_+\=\[\]{};':"\\|,.<>\/?]+)/;

			var stringText = [];

			str2.forEach(function(item) {

				if (/^\s+$/.test(item)) {

				} else {
					var log = 0;
					that.wrongWordsArr.forEach(function(obj) {

						if (obj.Text === item) {
							log = 1;
						}
					});

					if (log === 1) {
						if (that.ignoreAllArr.includes(item) || specialChars.test(item)) {

						} else {

							if (specialChars.test(item)) {

								var numericItem = "";
								var subText = item.replace(/\'/g, '').split(/([\d!~@#$%^&*()_+\=\[\]{};':"\\|,.<>\/?]+)/).filter(Boolean);

								subText.forEach(function(subItem) {

									if (specialChars.test(subItem) || that.ignoreAllArr.includes(subItem)) {

									} else {

										if (that.dictionaryLib.check(subItem) == false) {

											// if (!stringText) {
											// 	stringText = subItem;
											// }
											stringText.push(subItem);

										}

									}

								});

							} else {

								// if (!stringText) {
								// 	stringText = item;
								// }
								stringText.push(item);
							}
						}

					} else {

						if (that.dictionaryLib.check(item) == false) {

							if (that.ignoreAllArr.includes(item)) {

							} else {

								if (specialChars.test(item)) {

									var numericItem = "";
									var subText = item.replace(/\'/g, '').split(/([\d!~@#$%^&*()_+\=\[\]{};':"\\|,.<>\/?]+)/).filter(Boolean);

									subText.forEach(function(subItem) {

										if (specialChars.test(subItem) || that.ignoreAllArr.includes(subItem)) {

											numericItem = numericItem + subItem;
										} else {

											if (that.dictionaryLib.check(subItem) == false) {

												// if (!stringText) {
												// 	stringText = subItem;
												// }
												stringText.push(subItem);

											}

										}

									});

								} else {

									// if (!stringText) {
									// 	stringText = item;
									// }
									stringText.push(item);

								}

							}

						}

					}

				}

			});

			return stringText;

		},

		getSuggestionList: function(word) {
			var that = this;

			var suggestionsList = this.dictionaryLib.suggest(word);
			this.userDictionary.forEach(function(item) {
				if (item.WrongWord === that.wordSet) {
					suggestionsList.push(item.Word);
				}
			});

			return suggestionsList;
		},
		setGlobalSpellCheckData: function(Narrative, suggestionsList, word) {
			var InputsModel = this.getView().getModel("InputsModel");

			this.userDictionary.forEach(function(item) {
				if (item.WrongWord === word) {
					suggestionsList.push(item.Word);
				}
			});

			InputsModel.setProperty("/Inputs/currentWrongWord", word);
			this.Gspellcheck.setModel(new JSONModel({
				data: InputsModel.getProperty("/Inputs/Countries_collection"),
				narrative: Narrative,
				suggest: suggestionsList,
				word: word
			}), "CountriesList");

		},
		onListItemPress: function(oEvent) {

			var list = sap.ui.core.Fragment.byId("GlobalSepllCheck", "suggestList");
			oEvent.getSource().getBindingContextPath().fontcolor("blue");
			var InputsModel = this.getView().getModel("InputsModel");
			var string1 = oEvent.getSource().getTitle();
			InputsModel.setProperty("/Inputs/replaceWord", string1);
			// var id = oEvent.getSource().getId();
			// if (id) {
			// 	$("#" + id).css("background-color", "#CEDFEB");
			// }

			// var prevId = this.getModel("InputsModel").getProperty("/Inputs/listItemPrevId");
			// $("#" + prevId).css("background-color", "#ffffff");
			// this.getModel("InputsModel").setProperty("/Inputs/listItemPrevId", id);

		},

		GlobalUndo: function() {

			var InputsModel = this.getView().getModel("InputsModel");
			var activity = InputsModel.getProperty("/Inputs/activity");

			var that = this;

			if (this.globalSpellArr) {
				var len = this.globalSpellArr.length;
				if (this.globalSpellArr.length !== 1 && InputsModel.getProperty("/Inputs/applyLog") === true) {
					if (activity === "Apply") {

						this.nextNarrative--;

					}
					if (activity === "Ignore") {

						var getApplyItems = InputsModel.getProperty("/Inputs/applyArray");

						var index = getApplyItems[this.nextNarrative].idap;

						var objValue = InputsModel.getProperty("/Inputs/changeArray");

						that.logArr.forEach(function(item, io) {
							if (item.id === index) {

								item.Narrative = objValue.oldValue;

							}

						});
						$(".fulcrum-editor-textarea1")[0].innerHTML = objValue.oldValue;
						var value12 = $(".fulcrum-editor-textarea1")[0].innerText;

						getApplyItems.forEach(function(item, io) {

							if (item.idap === index) {

								item.Narrative = that.globalReplaceAll(value12, item.word, '<span class="target">' + item.word + '</span>');

							}

						});

						this.nextNarrative--;
					}
					if (activity === "Replace") {

						InputsModel.getProperty("/Inputs/replaceArr").pop();
						this.nextNarrative--;

						this.logArr.forEach(function(item, io) {

							if (item.id === that.globalSpellArr[len - 2].idx) {

								that.logArr[io].Narrative = that.globalSpellArr[len - 2].Narrative;
							}

						});
						this.replaceAllReplace();

					}
					if (activity === "ReplaceAll") {

						InputsModel.getProperty("/Inputs/replaceAllArr").pop();
						this.nextNarrative--;
						var replacedWord = InputsModel.getProperty("/Inputs/replacewith")[0].replaceWith;
						var originalWord = InputsModel.getProperty("/Inputs/replacewith")[0].replaceWord;

						this.logArr.forEach(function(item, io) {

							that.logArr[io].Narrative = that.globalReplaceAll(that.logArr[io].Narrative, replacedWord, '<span class="target">' +
								originalWord + '</span>');

						});

						this.replaceAllReplace();
					}
					if (activity === "IgnoreAll") {

						var currentWord = InputsModel.getProperty("/Inputs/currentWrongWord");

						this.logArr.forEach(function(item, io) {

							that.logArr[io].Narrative = that.globalReplaceAll(that.logArr[io].Narrative, currentWord, '<span class="target">' +
								currentWord + '</span>');

						});

					}

					this.globalSpellArr.push({
						idx: that.globalSpellArr[len - 2].idx,
						Narrative: this.globalSpellArr[len - 2].Narrative,
						word: this.globalSpellArr[len - 2].word
					});

					len = this.globalSpellArr.length;
					var suggestionsList = this.getSuggestionList(this.globalSpellArr[len - 1].word);
					this.setGlobalSpellCheckData(this.globalSpellArr[len - 1].Narrative, suggestionsList, this.globalSpellArr[len - 1].word);
					this.replaceAllReplace();
					this.logArr.forEach(function(item, ido) {
						if (item.id === that.globalSpellArr[len - 1].idx) {
							that.logArr[ido].Narrative = that.globalSpellArr[len - 1].Narrative;
						}

					});
					InputsModel.setProperty("/Inputs/applyLog", false);
				}
			}

		},

		GlobalIgnore: function() {

			var that = this;
			var InputsModel = this.getView().getModel("InputsModel");
			InputsModel.setProperty("/Inputs/activity", "Ignore");

			var getApplyItems = InputsModel.getProperty("/Inputs/applyArray");

			var value = $(".fulcrum-editor-textarea1")[0].innerText;
			var value2 = $(".fulcrum-editor-textarea1")[0].innerHTML;

			var index = getApplyItems[this.nextNarrative].idap;

			that.logArr.forEach(function(item, io) {
				if (item.id === index) {

					InputsModel.setProperty("/Inputs/changeArray", {

						oldValue: item.Narrative,
						newValue: value2

					});

					item.Narrative = value2;

				}

			});

			getApplyItems.forEach(function(item, io) {

				if (item.idap === index) {

					item.Narrative = that.globalReplaceAll(value, item.word, '<span class="target">' + item.word + '</span>');

				}

			});

			this.GlobalApply();
			InputsModel.setProperty("/Inputs/activity", "Ignore");
		},

		GlobalApply: function() {

			var InputsModel = this.getView().getModel("InputsModel");
			InputsModel.setProperty("/Inputs/activity", "Apply");
			var getApplyItems = InputsModel.getProperty("/Inputs/applyArray");

			var narrativeSet = "";
			var wordSet = "";
			var idSet = "";
			var that = this;

			this.nextNarrative++;

			if (getApplyItems.length - 1 >= this.nextNarrative) {

				if (getApplyItems[this.nextNarrative].Narrative.includes("<span")) {

					if (getApplyItems[this.nextNarrative]) {

						for (var i = this.nextNarrative; i < getApplyItems.length; i++) {
							var suggestionsList = that.getSuggestionList(getApplyItems[i].word);
							if (!suggestionsList.length > 0) {

								//	getApplyItems[i].Narrative.includes("<span")

								if (getApplyItems.length - 1 !== this.nextNarrative) {
									this.nextNarrative++;
								} else {

									sap.ui.core.Fragment.byId("GlobalSepllCheck", "MainFragment").setVisible(false);
									sap.ui.core.Fragment.byId("GlobalSepllCheck", "noSpell").setVisible(true);
								}

							} else {
								wordSet = getApplyItems[i].word;
								idSet = getApplyItems[i].idap;
								narrativeSet = getApplyItems[i].Narrative;
								break;
							}
						}

					}
					if (suggestionsList.length > 0) {
						InputsModel.setProperty("/Inputs/applyLog", true);
						this.globalSpellArr.push({
							idx: idSet,
							Narrative: narrativeSet,
							word: wordSet
						});

						this.setGlobalSpellCheckData(narrativeSet, suggestionsList, wordSet);

						this.replaceAllReplace();

					}

				} else {

					this.GlobalApply();
				}

			} else {

				sap.ui.core.Fragment.byId("GlobalSepllCheck", "MainFragment").setVisible(false);
				sap.ui.core.Fragment.byId("GlobalSepllCheck", "noSpell").setVisible(true);
			}

		},

		replaceAllReplace: function() {
			var InputsModel = this.getView().getModel("InputsModel");
			var that = this;

			var stringSplit = $(".fulcrum-editor-textarea1")[0].innerHTML.replace(/\'/g, '').split(
				/([\s\d!~@#$%^&*()_+\=\[\]{};':"\\|,.<>\/?]+)/).filter(Boolean);

			InputsModel.getProperty("/Inputs/replaceAllArr").forEach(function(item) {

				var log = false;
				stringSplit.forEach(function(valueItem) {

					if (valueItem === item.oldValue) {
						log = true;
					}

				});

				if (log === true) {

					$(".fulcrum-editor-textarea1")[0].innerHTML = that.globalReplaceAll($(".fulcrum-editor-textarea1")[0].innerHTML, item.oldValue,
						item.newValue);

				}

			});

			InputsModel.getProperty("/Inputs/replaceArr").forEach(function(item1) {

				var log1 = false;
				stringSplit.forEach(function(valueItem) {

					if (valueItem === item1.oldValue) {
						log1 = true;
					}

				});

				if (log1 === true) {

					$(".fulcrum-editor-textarea1")[0].innerHTML = that.globalReplaceAll($(".fulcrum-editor-textarea1")[0].innerHTML, item1.oldValue,
						item1.newValue);

				}

			});

		},

		GlobalRep: function() {

			var InputsModel = this.getView().getModel("InputsModel");
			var replaceWord = InputsModel.getProperty("/Inputs/replaceWord");

			if (replaceWord) {

				var currentWord = InputsModel.getProperty("/Inputs/currentWrongWord");
				var that = this;

				var index = this.globalSpellArr[this.globalSpellArr.length - 1].idx;

				if (InputsModel.getProperty("/Inputs/replaceArr").length) {

					if (index === InputsModel.getProperty("/Inputs/replaceArr")[0].id) {

						InputsModel.getProperty("/Inputs/replaceArr").push({
							id: index,
							oldValue: currentWord,
							newValue: replaceWord
						});

					} else {
						InputsModel.setProperty("/Inputs/replaceArr", []);
						InputsModel.getProperty("/Inputs/replaceArr").push({
							id: index,
							oldValue: currentWord,
							newValue: replaceWord
						});

					}

				} else {

					InputsModel.getProperty("/Inputs/replaceArr").push({
						id: index,
						oldValue: currentWord,
						newValue: replaceWord
					});
				}

				this.logArr.forEach(function(item, io) {

					if (item.id === index) {
						that.logArr[io].Narrative = that.globalReplaceAll(that.logArr[io].Narrative, '<span class="target">' + currentWord + '</span>',
							replaceWord);

					}

				});

				this.GlobalApply();

				this.replaceAllReplace();
				InputsModel.setProperty("/Inputs/replaceStatus", "Replace");
				InputsModel.setProperty("/Inputs/activity", "Replace");
				InputsModel.setProperty("/Inputs/applyLog", true);
				InputsModel.setProperty("/Inputs/replaceWord", "");
			} else {
				MessageBox.show(
					"Please select the word to Replace:", {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "WARNING",
						actions: [sap.m.MessageBox.Action.OK]
					}
				);
			}

		},
		GlobalRepAll: function() {

			var InputsModel = this.getView().getModel("InputsModel");
			var replaceWord = InputsModel.getProperty("/Inputs/replaceWord");

			if (replaceWord) {

				var currentWord = InputsModel.getProperty("/Inputs/currentWrongWord");

				var index = this.globalSpellArr[this.globalSpellArr.length - 1].idx;
				var that = this;

				InputsModel.getProperty("/Inputs/replacewith").push({

					replaceWith: replaceWord,
					replaceWord: currentWord

				});

				InputsModel.getProperty("/Inputs/replaceAllArr").push({
					id: index,
					oldValue: currentWord,
					newValue: replaceWord
				});

				this.logArr.forEach(function(item, io) {

					that.logArr[io].Narrative = that.globalReplaceAll(that.logArr[io].Narrative, '<span class="target">' + currentWord + '</span>',
						replaceWord);

					//$(".fulcrum-editor-textarea1")[0].innerHTML = that.logArr[io].Narrative;

				});

				InputsModel.getProperty("/Inputs/applyArray").forEach(function(item) {

					item.Narrative = that.globalReplaceAll(item.Narrative, '<span class="target">' + currentWord + '</span>',
						replaceWord);

				});

				this.GlobalApply();

				this.replaceAllReplace();

				InputsModel.setProperty("/Inputs/replaceStatus", "ReplaceAll");
				InputsModel.setProperty("/Inputs/activity", "ReplaceAll");
				InputsModel.setProperty("/Inputs/applyLog", true);
				InputsModel.setProperty("/Inputs/replaceWord", "");
			} else {
				MessageBox.show(
					"Please select the word to Replace:", {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "WARNING",
						actions: [sap.m.MessageBox.Action.OK]
					}
				);
			}

		},

		GlobalIgnoreAll: function() {

			var that = this;
			var InputsModel = this.getView().getModel("InputsModel");

			var currentWord = InputsModel.getProperty("/Inputs/currentWrongWord");
			var that = this;

			this.logArr.forEach(function(item, io) {

				that.logArr[io].Narrative = that.globalReplaceAll(that.logArr[io].Narrative, '<span class="target">' + currentWord + '</span>',
					currentWord);

			});

			InputsModel.getProperty("/Inputs/applyArray").forEach(function(item) {

				item.Narrative = that.globalReplaceAll(item.Narrative, '<span class="target">' + currentWord + '</span>', currentWord);

			});

			this.GlobalApply();

			this.replaceAllReplace();

			InputsModel.setProperty("/Inputs/activity", "IgnoreAll");
			InputsModel.setProperty("/Inputs/applyLog", true);
			InputsModel.setProperty("/Inputs/replaceWord", "");

		},
		GlobalAddDictionary: function() {

			var odialog = this.GlobalAddDictionaryDialog();
			odialog.open();
			var InputsModel = this.getView().getModel("InputsModel");
			sap.ui.core.Fragment.byId("suggestCheck", "TypeHere1").setValue("");
			this.suggestCheck.setModel(new JSONModel({
				data: InputsModel.getProperty("/Inputs/currentWrongWord")

			}), "CountriesList");

		},

		GlobalAddDictionaryDialog: function() {
			if (!this.suggestCheck) {
				this.suggestCheck = sap.ui.xmlfragment("suggestCheck", "zprs.wipeditor.Fragments.suggestion", this.getView().getController());

			}
			return this.suggestCheck;
		},
		suggestionDialogClosedWithCancel: function() {

			this.suggestCheck.close();
		},

		suggestionDialogClosedWithOk: function() {

			var InputsModel = this.getView().getModel("InputsModel");
			var currentWord = InputsModel.getProperty("/Inputs/currentWrongWord");

			var replaceWord1 = sap.ui.core.Fragment.byId("suggestCheck", "TypeHere1").getValue();
			// var lang = 	this.BillEditModel.getProperty("/Inputs/changeLang");
			var lang = "EN";
			var oFModel = this.getOwnerComponent().getModel();

			var ip_data = {};
			ip_data.Action = "INSERT";
			ip_data.Langu = lang;
			ip_data.Word = replaceWord1;
			ip_data.WrongWord = currentWord;

			var that = this;
			LineItemsServices.getInstance().addToDictionary(oFModel, ip_data, that)
				.done(function(oData) {

					that.getUserDictionaryWords();

					MessageBox.show(
						"Dictionary Updated Successfully", {
							icon: sap.m.MessageBox.Icon.SUCCESS,
							title: "SUCCESS",
							actions: [sap.m.MessageBox.Action.OK]
						}
					);
					that.suggestionDialogClosedWithCancel();
					InputsModel.setProperty("/Inputs/changeStatusLog", true);
					that.getUserDictionaryWords();

				})
				.fail(function(oData) {
					MessageBox.show(
						"Server Error", {
							icon: sap.m.MessageBox.Icon.ERROR,
							title: "ERROR",
							actions: [sap.m.MessageBox.Action.OK]
						}
					);
					that.suggestionDialogClosedWithCancel();
					// InputsModel.setProperty("/Inputs/changeStatusLog", true);
					// that.getUserDictionaryWords();

					// var suggestionsList = that.getSuggestionList(InputsModel.getProperty("/Inputs/currentWrongWord"));

					// that.Gspellcheck.setModel(new JSONModel({

					// 	suggest: suggestionsList

					// }), "CountriesList");

				});

		},

		dictionaryChangeFragment: function() {

			var key;
			var that = this;

			var selectedText = sap.ui.core.Fragment.byId("GlobalSepllCheck", "fragmentDictionary").getSelectedItem().getText();

			var InputFields = this.getView().getModel("InputsModel");

			InputFields.setProperty("/Inputs/globalStatus", true);

			var dictionary = InputFields.getProperty("/Inputs/Countries_collection");
			for (var i = 0; i < dictionary.length; i++) {
				if (dictionary[i].Text === selectedText) {
					key = dictionary[i].Key;
					this.dictionaryLib = new Typo(key, false, false, {
						// dictionaryPath: location.protocol + '//' + location.host + "/webapp/spell/typo/dictionaries"
						dictionaryPath: that.oRootPath + "/spell/typo/dictionaries"
					});
				}
			}

			this.GlobalSpellCheckCancel();

			this.onGlobalSpellCheck();

			//	this.handleSpellCheckFragment();

		},
		handleSpellCheckFragment: function() {
			var that = this;
			$(".fulcrum-editor-textarea1").each(function(index, element) {
				var string = this.innerText;
				var specialChars = /([\d!~@#$%^&*()_+\=\[\]{};':"\\|,.<>\/?]+)/;
				var word = string.split(" ");

				var sampletext = "";
				for (var j = 0; j < word.length; j++) {
					var splitword = word[j];

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

						} else {

							sampletext = sampletext + " " + splitword;

						}
					}

				}
				$(".fulcrum-editor-textarea1")[0].innerHTML = sampletext;

			});
		},

		//Global Spell Check Code END --->

		createColumnConfig: function(tableId) {

			var i18nLabel = this.getView().getModel("i18n").getResourceBundle();

			var iTotalCols = tableId.getColumns();
			var arr = [];
			var dateFields = ["Bldat", "Budat", "Cpudt"];
			for (var colE = 0; colE < iTotalCols.length; colE++) {
				var keyString = iTotalCols[colE].getCustomData()[0].mProperties.value;
				var keyJson = JSON.parse(keyString);
				var key = keyJson.columnKey;
				var trimmedKey = key.trim();
				var labelname = i18nLabel.getText(trimmedKey);

				var obj = {
					label: labelname,
					property: trimmedKey,
					width: iTotalCols[colE].mProperties.width
				};
				if (dateFields.includes(trimmedKey)) {
					obj.format = {
						style: 'medium',
						UTC: true,

					};
					obj.type = "date";
					obj.textAlign = 'begin';
				}
				if (obj.label !== "Reviewed") {
					arr.push(obj);
				}
				if (colE === iTotalCols.length - 1) {
					return arr;
				}
			}

		},
		Export: function(Event) {

			var tableId = this.byId("WipDetailsSet1");

			var aCols, oSettings, oExcelDate, oDateFormat, oExcelFileName, oExportData;
			aCols = this.createColumnConfig(tableId);

			oExportData = this.getView().getModel("InputsModel").getProperty("/Inputs/globalSearchModel");
			oExportData.forEach(function(obj, io) {

				var changeObj = tableId.getContextByIndex(io).getObject();
				obj.NarrativeString = changeObj.NarrativeString;

				if (obj.ReviewComplete === "X") {
					obj.ReviewComplete = "Reviewed";
				}
			});

			oDateFormat = DateFormat.getDateInstance({
				formatOptions: {
					style: 'medium',
					UTC: true

				}
			});
			oExcelDate = oDateFormat.format(new Date());
			var userName = this.getModel("InputsModel").getProperty("/Inputs/userSettingsData").Bname;
			oExcelFileName = userName + "_" + oExcelDate + ".xlsx";
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

	});

});