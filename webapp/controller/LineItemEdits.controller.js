sap.ui.define([
	"zprs/wipeditor/controller/BaseController",
	"zprs/wipeditor/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel",
	"zprs/wipeditor/services/LineItemsServices",
	"sap/m/MessageBox",
	'sap/ui/model/Sorter',
	"sap/ui/core/format/DateFormat",
// "sap/ui/export/Spreadsheet", 
], function(BaseController, formatter, Filter, JSONModel, LineItemsServices, MessageBox, Sorter, DateFormat,Spreadsheet) {
	"use strict";

	return BaseController.extend("zprs.wipeditor.controller.LineItemEdits", {
		formatter: formatter,

		onInit: function() {
			
		

			this.bus = sap.ui.getCore().getEventBus();

			this.bus.subscribe("homeChannelLineItemEdits", "toSummaryEditLineItem", this.lineItemEditsData, this);
			this.bus.subscribe("filterbar", "showfilterbar", this.showHideFilterBar, this);

			this.jsonModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.jsonModel, "JSONModel");
			this.rowLineItemCount = [];
			this.indexes = [];
			this.filterArr = [];
			
				


		},

		//Lineitemedits binding
		lineItemEditsData: function(homeChannelLineItemEdits, toSummaryEditLineItem, data) {
			if (!data.button) {

				var InputFields = this.getModel("InputsModel");
				var results = InputFields.getProperty("/Inputs/homeTable");
				this.jsonModel.setProperty("/RowCount2", results.length);
				InputFields.setProperty("/Inputs/currView", {
					view: "lineEdits",
					scope: this
				});
				var visible = InputFields.getProperty("/Inputs/visible1");
				this.jsonModel.setProperty("/visible", visible);
				var ColumnsItems = InputFields.getProperty("/Inputs/ColumnsItems1");
				this.jsonModel.setProperty("/ColumnsItems", ColumnsItems);
				// var visible = $.extend(true, {}, InputFields.getProperty("/Inputs/DefaultVisible1"));
				// this.jsonModel.setProperty("/visible", visible);
				// var ColumnsItems = $.extend(true, [], InputFields.getProperty("/Inputs/DefaultColumns1"));
				// this.jsonModel.setProperty("/ColumnsItems", ColumnsItems);

				this.byId("searchText").setValue("");
			

				var generalSetting = new JSONModel({
					showRowDetail: true,
					showComments: false,
					showNarr: false
				});
				this.setModel(generalSetting, "generalSetting");
				var that = this;
				if (!this._oResponsivePopover) {
					this._oResponsivePopover = sap.ui.xmlfragment("personalizationDialog", "zprs.wipeditor.fragments.personalizationDialog", this);
					this._oResponsivePopover.setModel(this.getView().getModel());
				}

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
				} else if (data.button === "Modify/Reverse") {
					this.onModifyReverse(data.button);
				} else if (data.button === "Update Codes") {
					this.onUpdateCodes();
				} else if (data.button === "Save") {
					this.onLineItemEditsSave();
				}

			}
		
	
           
			var smarttbl = this.getView().byId("smartTable_ResponsiveTable2");
			smarttbl._oTable.setVisible(false);
		
		var oTable = this.getView().byId("WipDetailsSet2");
		
		var that = this;
				oTable.addEventDelegate({
							onAfterRendering: function() {
								debugger;
								
							

								var oHeader = that.getView().byId("WipDetailsSet2").$().find('.sapMListTblHeaderCell'); //Get hold of table header elements
								for (var i = 0; i < oHeader.length; i++) {
									var oID = oHeader[i].id;
									that.onClick(oID);
								}

							}
						}, oTable);
			
			

		},

	
		//narrative toggle
		onPressToggle: function(evt) {

			var m = this.getModel("generalSetting"),
				md = m.getData(),
				src = evt.getSource();
			if (src.getIcon() === "sap-icon://expand-group") {
				md.showRowDetail = false;
				md.showNarr = true;
				md.showComments = false;
				src.setIcon("sap-icon://collapse-group");
			} else {
				md.showRowDetail = true;
				md.showNarr = false;
				md.showComments = false;
				src.setIcon("sap-icon://expand-group");
			}
			m.refresh();
			// var show = jQuery(".test");
			// 	$(".test1").show();
		},

		//narrative toggle change method
		handelTblFieldChange: function(oEvent) {

			var context = oEvent.getSource().getBindingContext("JSONModel");
			var obj = context.getObject();

			var oldValue = oEvent.getParameters().value;
			var newValue = oEvent.getParameters().newValue;
			this.getModel("InputsModel").setProperty("/Inputs/oldValue", oldValue);
			this.getModel("InputsModel").setProperty("/Inputs/newValue", newValue);
			var saveObjects = this.getModel("InputsModel").getProperty("/Inputs/saveObjects");
			saveObjects.push(obj);
			this.getModel("InputsModel").setProperty("/Inputs/isChanged", true);
			this.getModel("InputsModel").setProperty("/Inputs/scope", this.getView().byId("WipDetailsSet2"));

		},

		//apply variant
		applyVariant: function() {
			var that = this;
			setTimeout(function() {
				that.jsonModel.setProperty("/modelData", that.getModel("InputsModel").getProperty("/Inputs/homeTable"));
				var Otablenew = that.getView().byId("WipDetailsSet2");
				Otablenew.bindRows("/modelData");
			}, 1000);
		},

		//column sorting
		onClick: function(oID) {

			var that = this;
			$('#' + oID).click(function(oEvent) {

				var oTarget = oEvent.currentTarget;
				var oLabelText = oTarget.childNodes[0].textContent;
				var values = that.getView().getModel("i18n").getResourceBundle().aPropertyFiles[0].mProperties;
				for (var name in values) {

					var value = values[name];
					if (value === oLabelText) {
						var oKey = name;
					}
				}

				that.jsonModel.setProperty("/bindingValue", oKey);

				var value = "";
				that.filterArr.forEach(function(obj) {
					if (obj.Key === oKey) {
						value = obj.Value;
						if (obj.Key === "ReviewComplete") {
							value = obj.reviewValue;
						}

					}

				});
				if (oKey !== "Zzwipcur") {

					that._oResponsivePopover.openBy(oTarget);
				}
				if (oKey === "Budat" || oKey === "Cpudt" || oKey === "Bldat") {
					sap.ui.core.Fragment.byId("personalizationDialog", "filterBox").setVisible(false);
				} else {
					sap.ui.core.Fragment.byId("personalizationDialog", "filterBox").setVisible(true);
				}

				if (oKey === "Zzphase" || oKey === "Zztskcd" || oKey === "Zzactcd" || oKey === "Zzffactcd" || oKey === "Zzfftskcd") {
					sap.ui.core.Fragment.byId("personalizationDialog", "sortAsc").setVisible(false);
					sap.ui.core.Fragment.byId("personalizationDialog", "sortDesc").setVisible(false);
				} else {
					sap.ui.core.Fragment.byId("personalizationDialog", "sortAsc").setVisible(true);
					sap.ui.core.Fragment.byId("personalizationDialog", "sortDesc").setVisible(true);
				}

				sap.ui.core.Fragment.byId("personalizationDialog", "filterValue").setValue(value);
			});
		},
		onAscending: function() {

			var oTable = this.getView().byId("WipDetailsSet2");
			var oItems = oTable.getBinding("items");
			var oBindingPath = this.jsonModel.getProperty("/bindingValue");
			var tableItems = this.getModel("InputsModel").getProperty("/Inputs/globalSearchModel");
			var Data = tableItems.sort(function(a, b) {

				if (oBindingPath === "Megbtr" || oBindingPath === "RateLocl" || oBindingPath === "AmountMatter" || oBindingPath === "AmountLocl" ||
					oBindingPath === "AmountGlb") {
					var x = a[oBindingPath].toLowerCase();
					var y = b[oBindingPath].toLowerCase();
					return x - y;
				} else if (oBindingPath === "Bldat" || oBindingPath === "Budat" || oBindingPath === "Cpudt") {

					return new Date(a[oBindingPath]) - new Date(b[oBindingPath]);

				} else {
					var x = a[oBindingPath].toLowerCase();
					var y = b[oBindingPath].toLowerCase();
					if (x < y) {
						return -1;
					}
					if (x > y) {
						return 1;
					}
					return 0;
				}

			});

			this.jsonModel.setProperty("/modelData", Data);
			oTable.setModel(this.jsonModel);
           
          
           
			this._oResponsivePopover.close();

		},
		onDescending: function() {

			var oTable = this.getView().byId("WipDetailsSet2");
			var oItems = oTable.getBinding("items");
			var oBindingPath = this.jsonModel.getProperty("/bindingValue");
			var tableItems = this.getModel("InputsModel").getProperty("/Inputs/globalSearchModel");

			var Data = tableItems.sort(function(a, b) {

				if (oBindingPath === "Megbtr" || oBindingPath === "RateLocl" || oBindingPath === "AmountMatter" || oBindingPath === "AmountLocl" ||
					oBindingPath === "AmountGlb") {
					var x = a[oBindingPath].toLowerCase();
					var y = b[oBindingPath].toLowerCase();
					return y - x;

				} else if (oBindingPath === "Bldat" || oBindingPath === "Budat" || oBindingPath === "Cpudt") {

					return new Date(b[oBindingPath]) - new Date(a[oBindingPath]);

				} else {
					var x = a[oBindingPath].toLowerCase();
					var y = b[oBindingPath].toLowerCase();
					if (x < y) {
						return 1;
					}
					if (x > y) {
						return -1;
					}
					return 0;
				}

			});

			this.jsonModel.setProperty("/modelData", Data);
			oTable.setModel(this.jsonModel);


			this._oResponsivePopover.close();
		},

		//column filtering
		onChange: function(oEvent) {

			var InputFields = this.getModel("InputsModel");
			var oTable = this.getView().byId("WipDetailsSet2");
			var oValue = oEvent.getParameter("value");
			var revVal = "";
			if (oValue === "") {
				oValue = " ";
			}
			var oBindingPath = this.jsonModel.getProperty("/bindingValue");

			if (oBindingPath === "ReviewComplete") {

				revVal = oValue;
				if ("Reviewed".includes(oValue)) {

					oValue = "X";
				}

			}
			var that = this;
			if (oValue === " ") {

				if (this.filterArr.length > 0) {

					this.filterArr.forEach(function(obj, id) {
						if (obj.Key === oBindingPath) {
							that.filterArr.splice(id, 1);
						}
					});
				}

			} else {

				var idxs = 0;
				var log = false;
				this.filterArr.forEach(function(obj, id) {

					if (obj.Key === oBindingPath) {
						log = true;
						idxs = id;
					}

				});
				if (log) {

					if (oBindingPath === "ReviewComplete") {

						this.filterArr[idxs] = {
							Key: oBindingPath,
							Value: oValue,
							reviewValue: revVal
						};
					} else {
						this.filterArr[idxs] = {
							Key: oBindingPath,
							Value: oValue
						};
					}

				} else {

					if (oBindingPath === "ReviewComplete") {

						this.filterArr.push({
							Key: oBindingPath,
							Value: oValue,
							reviewValue: revVal
						});
					} else {
						this.filterArr.push({
							Key: oBindingPath,
							Value: oValue
						});
					}

				}

			}
			if (!this.filterArr.length > 0) {
				var results = InputFields.getProperty("/Inputs/homeTable");
				this.data(results);
			} else {

				var aFilters = [];

				this.filterArr.forEach(function(obj) {

					var oFilter = new Filter(obj.Key, "Contains", obj.Value);
					aFilters.push(oFilter);

				});

			}
			var resArr = [];
			var oItems = oTable.getBinding("items");
			var results = oItems.filter(aFilters, "Application");
			this.jsonModel.setProperty("/RowCount2", results.aIndices.length);
			for (var l = 0; l < results.aIndices.length; l++) {
				var modelData = this.jsonModel.getProperty("/modelData");
				var res = modelData[results.aIndices[l]];
				resArr.push(res);
			}
			this.getModel("InputsModel").setProperty("/Inputs/globalSearchModel", resArr);
		
			this._oResponsivePopover.close();
			
			
		

		},

		//review unreview
		ReviewUnreview: function(button) {

			var text = button;
			var tableLineEdits = this.getView().byId("WipDetailsSet2");

			var selectedLines = this.getModel("InputsModel").getProperty("/Inputs/rowLineCount");
			for (var i = 0; i < selectedLines.length; i++) {
				tableLineEdits.getItems()[selectedLines[i]].getCells()[0].setVisible(true);
				tableLineEdits.getItems()[selectedLines[i]].getCells()[1].setVisible(false);
				if (text === "Reviewed") {
					tableLineEdits.getItems()[selectedLines[i]].getCells()[0].setProperty("color", "green");
					tableLineEdits.getItems()[selectedLines[i]].getCells()[0].setTooltip("Reviewed");
				} else {
					tableLineEdits.getItems()[selectedLines[i]].getCells()[0].setProperty("color", "green");
					tableLineEdits.getItems()[selectedLines[i]].getCells()[0].setTooltip("UnReviewed");
				}

			}
			var oTable = [];

			var otable = this.byId("WipDetailsSet2");

			$.each(selectedLines, function(k, o) {
				var selContext = otable.getSelectedContexts();

				var obj = selContext[k].getObject();
				if (text === "Reviewed") {
					selContext[k].getModel().setProperty(selContext[k].getPath() + "/ReviewComplete", "X");
					obj.ReviewComplete = "X";

				} else {
					selContext[k].getModel().setProperty(selContext[k].getPath() + "/ReviewComplete", "");
					obj.ReviewComplete = "";

				}

				oTable.push(obj);
			});

			this.makeBatchCallsReviewUnreview(oTable, text);

		},
		makeBatchCallsReviewUnreview: function(oList, text) {

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

					var otable = that.byId("WipDetailsSet2");
					var selectedIndex = that.getModel("InputsModel").getProperty("/Inputs/rowLineCount");
					$.each(selectedIndex, function(k, o) {
						var selContext = otable.getSelectedContexts();

						var obj = selContext[k].getObject();
						if (text === "Reviewed") {
							selContext[k].getModel().setProperty(selContext[k].getPath() + "/ReviewComplete", "X");
							obj.ReviewComplete = "X";

						} else {
							selContext[k].getModel().setProperty(selContext[k].getPath() + "/ReviewComplete", "");
							obj.ReviewComplete = "";

						}

					});
					that.data(that.getModel("InputsModel").getProperty("/Inputs/homeTable"));

				},
				error: function(oData) {
					// MessageBox.show(JSON.parse(oData.responseText).error.message.value);

				}
			});
			var selectedLines = that.getModel("InputsModel").getProperty("/Inputs/rowLineCount");
			var otable = that.byId("WipDetailsSet2");
			$.each(selectedLines, function(k, o) {
				var selContext = otable.getSelectedContexts(k);

				var obj = selContext[k].getObject();
				if (text === "Reviewed") {
					selContext[k].getModel().setProperty(selContext[k].getPath() + "/ReviewComplete", "X");
					obj.ReviewComplete = "X";

				} else {
					selContext[k].getModel().setProperty(selContext[k].getPath() + "/ReviewComplete", "");
					obj.ReviewComplete = "";

				}
			});

		},

		//lineitems selection
		LineItemEditsSelection: function(oEvent) {

			var otable = this.byId("WipDetailsSet2");
			var item = this.byId("WipDetailsSet2").getSelectedItems();
			var index = [];
			for (var j = 0; j < item.length; j++) {

				var ind = otable.indexOfItem(item[j]);
				index.push(ind);
			}

			// 	var rowLineCount = [];
			// 			rowLineCount.push(index);
			var InputFields = this.getModel("InputsModel");

			// 			for (var i = 0; i < index.length; i++) {
			// 				rowLineCount.push(index[i]);
			// 			}

			this.getModel("InputsModel").setProperty("/Inputs/rowLineCount", index);

			if (index.length === 1) {

				InputFields.setProperty("/Inputs/ToolbarEnable/LineItemReviewed", true);
				InputFields.setProperty("/Inputs/ToolbarEnable/LineItemUnreview", true);
				InputFields.setProperty("/Inputs/ToolbarEnable/LineItemUpdatecodes", true);

				InputFields.setProperty("/Inputs/ToolbarEnable/Modify_Reverse", true);

			} else if (index.length > 1) {
				InputFields.setProperty("/Inputs/ToolbarEnable/LineItemReviewed", true);
				InputFields.setProperty("/Inputs/ToolbarEnable/LineItemUnreview", true);
				InputFields.setProperty("/Inputs/ToolbarEnable/LineItemUpdatecodes", true);
				InputFields.setProperty("/Inputs/ToolbarEnable/Modify_Reverse", false);

			} else {

				InputFields.setProperty("/Inputs/ToolbarEnable/LineItemReviewed", false);
				InputFields.setProperty("/Inputs/ToolbarEnable/LineItemUnreview", false);
				InputFields.setProperty("/Inputs/ToolbarEnable/LineItemUpdatecodes", false);
				InputFields.setProperty("/Inputs/ToolbarEnable/Modify_Reverse", false);

			}

		},

		//reload lineitems
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

			var aFilter = [];
			this.filterArr = [];
			var table = this.getView().byId("WipDetailsSet2");
			var that = this;
			this.byId("searchText").setValue("");
			var InputFields = this.getModel("InputsModel");

			var Pspid = InputFields.getProperty("/Inputs/rootPspid");

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

					sap.ui.core.BusyIndicator.hide(0);

					var oItems = that.getView().byId("WipDetailsSet2").getBinding("items");
					var results = oItems.filter(that.filterArr, "Application");

					that.jsonModel.setProperty("/modelData", oData.results);
					that.jsonModel.setProperty("/RowCount2", oData.results.length);
					that.data(oData.results);
					table.removeSelections();
					table.setModel(that.jsonModel);
					
					// table.bindRows("/modelData");

				})
				.fail(function() {
					sap.ui.core.BusyIndicator.hide(0);
				});

			// var visible = $.extend(true, {}, InputFields.getProperty("/Inputs/DefaultVisible1"));
			// this.jsonModel.setProperty("/visible", visible);
			// var ColumnsItems = $.extend(true, [], InputFields.getProperty("/Inputs/DefaultColumns1"));
			// this.jsonModel.setProperty("/ColumnsItems", ColumnsItems);

			InputFields.setProperty("/Inputs/isChanged", false);
			InputFields.setProperty("/Inputs/scope", "");
			var tableLineEdits = this.getView().byId("WipDetailsSet2");
			setTimeout(function() {
				var index = that.getModel("InputsModel").getProperty("/Inputs/homeTable").length;
				for (var i = 0; i < index; i++) {
					tableLineEdits.getItems()[i].getCells()[0].setVisible(false);
					tableLineEdits.getItems()[i].getCells()[1].setVisible(true);
				}
			}, 1000);

			if (this._Dialog) {

				this._Dialog.close();

			}
			InputFields.setProperty("/Inputs/ToolbarEnable/LineItemReviewed", false);
			InputFields.setProperty("/Inputs/ToolbarEnable/LineItemUnreview", false);
			InputFields.setProperty("/Inputs/ToolbarEnable/LineItemUpdatecodes", false);

			InputFields.setProperty("/Inputs/ToolbarEnable/Modify_Reverse", false);
		},
	
		//service for codes
		data: function(odata) {

			this.WipEditModel = this.getModel("InputsModel");
			this.serviceInstance = LineItemsServices.getInstance();
			this.getLineItemsData(odata);
		},
		getLineItemsData: function(Rowdata) {

			var Pspid = Rowdata[0].Pspid;

			var that = this;

			$.when(
				that.serviceInstance.getPhaseCodes(that.WipEditModel, Pspid, that),
				that.serviceInstance.getTaskcodes(that.WipEditModel, "", that),
				that.serviceInstance.getActivitycodes(that.WipEditModel, Pspid, that),
				that.serviceInstance.getFFtaskcodes(that.WipEditModel, Pspid, that),
				that.serviceInstance.getFFActivitycodes(that.WipEditModel, "", Pspid, that))

			.done(function(phaseCodes, taskCodes, activityCodes, ffTskCodes, ffActCodes) {

					if (Rowdata.length > 0) {

						that.jsonModel.setProperty("/LinetableResults", Rowdata.length);
						var lineItems = Rowdata;
						for (var i = 0; i < lineItems.length; i++) {

							lineItems[i].phaseCodes = lineItems[i].Zzphase.length ? [{
								Phasecode: lineItems[i].Zzphase,
								PhasecodeDesc: ""
							}].concat(phaseCodes.results) : phaseCodes.results;
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
							lineItems[i].selectedPhaseCode = lineItems[i].Zzphase;
							lineItems[i].selectedTaskCode = lineItems[i].Zztskcd;
							lineItems[i].selectedActCode = lineItems[i].Zzactcd;
							lineItems[i].selectedFFTaskCode = lineItems[i].Zzfftskcd;
							lineItems[i].selectedFFActCode = lineItems[i].Zzffactcd;
							lineItems[i].isRowEdited = false;
						}
					}

					that.getModel("InputsModel").setProperty("/Inputs/homeTable", lineItems);
					var Otable1 = that.getView().byId("WipDetailsSet2");
					that.jsonModel.setProperty("/modelData", lineItems);
					Otable1.setModel(that.jsonModel);
					// Otable1.bindRows("/modelData");
				})
				.fail(function() {
					sap.ui.core.BusyIndicator.hide(0);
				});

		},

		//codes change
		phaseCodesChange: function(oEvent) {

			var item = oEvent.getSource().getParent().getBindingContextPath();
			var srt = item.split("/");

			var idx = srt[srt.length - 1];
			var InputFields = this.getView().getModel("InputsModel");
			var indexes = [];
			indexes.push(idx);
			this.index = indexes;
			var tableModle = oEvent.getSource().getParent().getParent().getModel();
			var thisRow = tableModle.getProperty(item);

			var indexes = InputFields.getProperty("/Inputs/indexes");
			indexes.push(idx);
			//	this.narIndices.push(idx);
			var phaseCodeSelected = oEvent.getSource().getSelectedItem().getKey();
			var InputFields = this.getView().getModel("InputsModel");

			var pspid = InputFields.getProperty("/Inputs/rootPspid");
			sap.ui.core.BusyIndicator.show(0);
			var that = this;

			$.when(that.serviceInstance.getTaskcodes(InputFields, phaseCodeSelected, that),
				that.serviceInstance.getActivitycodes(InputFields, pspid, that),
				that.serviceInstance.getFFtaskcodes(InputFields, pspid, that))

			.done(function(taskCodes, activityCodes, ffTskCodes, ffActCodes) {

					sap.ui.core.BusyIndicator.hide(0);

					var isTask = that.jsonModel.getProperty("/modelData/" + idx + "/Zztskcd");
					that.jsonModel.setProperty("/modelData/" + idx + "/taskCodes", isTask.length ? [{
						TaskCodes: isTask,
						TaskCodeDesc: ""
					}].concat(taskCodes.results) : taskCodes.results);

					if (that.jsonModel.getProperty("/modelData/" + idx + "/Zzphase") === that.jsonModel.getProperty(
							"/modelData/" + idx + "/selectedPhaseCode")) {
						that.jsonModel.setProperty("/modelData/" + idx + "/selectedTaskCode", that.jsonModel.getProperty(
							"/modelData/" + idx + "/Zzphase"));
					} else {
						that.jsonModel.setProperty("/modelData/" + idx + "/selectedTaskCode", that.jsonModel.getProperty(
							"/modelData/" + idx + "/Zztskcd"));
					}
					var isAct = that.jsonModel.getProperty("/modelData/" + idx + "/Zzactcd");
					that.jsonModel.setProperty("/modelData/" + idx + "/actCodes", isAct.length ? [{
						ActivityCodes: isAct,
						ActivityCodeDesc: ""
					}].concat(activityCodes.results) : activityCodes.results);

					var isFFtsk = that.jsonModel.getProperty("/modelData/" + idx + "/Zzfftskcd");
					that.jsonModel.setProperty("/modelData/" + idx + "/ffTskCodes", isFFtsk.length ? [{
						FfTaskCodes: isFFtsk,
						FfTaskCodeDesc: ""
					}].concat(ffTskCodes.results) : ffTskCodes.results);
					var isFFact = that.jsonModel.getProperty("/modelData/" + idx + "/Zzffactcd");
					that.jsonModel.setProperty("/modelData/" + idx + "/ffActCodes", isFFact.length ? [{
						ffActCodes: isFFact,
						FfActivityCodeDesc: ""
					}].concat(ffActCodes.results) : ffActCodes.results);

				})
				.fail(function() {
					sap.ui.core.BusyIndicator.hide(0);
				});
			InputFields.setProperty("/Inputs/isChanged", true);
			InputFields.setProperty("/Inputs/scope", this.getView().byId("WipDetailsSet2"));
		},
		fftaskCodeChange: function(oEvent) {

			var item = oEvent.getSource().getParent().getBindingContextPath();
			var srt = item.split("/");

			var idx = srt[srt.length - 1];
			var InputFields = this.getView().getModel("InputsModel");
			var indexes = [];
			indexes.push(idx);
			this.index = indexes;
			var tableModle = oEvent.getSource().getParent().getParent().getModel();
			var thisRow = tableModle.getProperty(item);

			var indexes = InputFields.getProperty("/Inputs/indexes");
			indexes.push(idx);

			var ffTaskcodeselected = oEvent.getSource().getSelectedItem().getKey();
			var InputFields = this.getView().getModel("InputsModel");
			var pspid = InputFields.getProperty("/Inputs/rootPspid");
			var results = InputFields.getProperty("/Inputs/homeTable");
			sap.ui.core.BusyIndicator.show(0);
			var that = this;
			this.serviceInstance = LineItemsServices.getInstance();

			$.when(
				that.serviceInstance.getFFActivitycodes(InputFields, ffTaskcodeselected, pspid, that)
			)

			.done(function(ffActCodes) {

					sap.ui.core.BusyIndicator.hide(0);
					if (results.length > 0) {

						var isffact = that.jsonModel.getProperty("/modelData/" + idx + "/Zzffactcd");
						that.jsonModel.setProperty("/modelData/" + idx + "/ffActCodes", isffact.length ? [{
							FfActivityCodeDesc: isffact,
							FfActivityCodeSetDesc: ""
						}].concat(ffActCodes.results) : ffActCodes.results);

					} else {
						that.showAlert("Wip Edit", "No Data Found");
					}

				})
				.fail(function() {
					sap.ui.core.BusyIndicator.hide(0);
				});
			InputFields.setProperty("/Inputs/isChanged", true);

			InputFields.setProperty("/Inputs/scope", this.getView().byId("WipDetailsSet2"));

		},
		CodesChange: function(oEvent) {

			var item = oEvent.getSource().getParent().getBindingContextPath();
			var srt = item.split("/");

			var idx = srt[srt.length - 1];
			var InputFields = this.getView().getModel("InputsModel");
			var indexes = [];
			indexes.push(idx);
			this.index = indexes;
			var tableModle = oEvent.getSource().getParent().getParent().getModel();
			var thisRow = tableModle.getProperty(item);

			var indexes = InputFields.getProperty("/Inputs/indexes");
			indexes.push(idx);

			InputFields.setProperty("/Inputs/isChanged", true);
			InputFields.setProperty("/Inputs/scope", this.getView().byId("WipDetailsSet2"));
			this.jsonModel.setProperty("/modelData", this.getModel("InputsModel").getProperty("/Inputs/homeTable"));

		},

		//updatecodes
		onUpdateCodes: function() {

			var selectedLines = this.getModel("InputsModel").getProperty("/Inputs/rowLineCount");
			this.index = selectedLines;

			var InputFields = this.getView().getModel("InputsModel");
			var indexes = InputFields.getProperty("/Inputs/indexes");
			for (var j = 0; j < selectedLines.length; j++) {
				indexes.push(selectedLines[j]);
			}

			var sMsg;
			var check = false;
			if (selectedLines.length < 1) {
				sMsg = "Please Select Atleast One item";

			} else {

				var oView = this.getView();

				var oDialog = this._getupdateCodesDialog();
				oView.addDependent(oDialog);
				oDialog.open();
				var i = 0;
				check = true;

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

					this.selectedRows = new JSONModel(this.updatesCodes);

					var selectedrow = this.jsonModel.getProperty("/modelData/" + selectedLines[0]);
					this.selectedRows.setProperty("/phaseCodes", selectedrow.phaseCodes);
					this.selectedRows.setProperty("/taskCodes", selectedrow.taskCodes);
					this.selectedRows.setProperty("/actCodes", selectedrow.actCodes);
					this.selectedRows.setProperty("/ffTskCodes", selectedrow.ffTskCodes);
					this.selectedRows.setProperty("/ffActCodes", selectedrow.ffActCodes);
					this.selectedRows.setProperty("/rowData", selectedrow);

					this._UpdateCodesDialog.setModel(this.selectedRows, "updatesCodesModel");

				}
			}
			InputFields.setProperty("/Inputs/isChanged", true);
			InputFields.setProperty("/Inputs/scope", this.getView().byId("WipDetailsSet2"));

		},
		_getupdateCodesDialog: function() {
			if (!this._UpdateCodesDialog) {
				this._UpdateCodesDialog = sap.ui.xmlfragment("update", "zprs.wipeditor.Fragments.Dialog", this.getView().getController());
			}
			return this._UpdateCodesDialog;

		},
		UpdateCodesCancel: function() {

			this._UpdateCodesDialog.close();

		},
		UpdateCodes: function() {

			this.UpdateCodesCancel();

			var i = 0;

			var selectedLines = this.getModel("InputsModel").getProperty("/Inputs/rowLineCount");

			for (var c = 0; c < selectedLines.length; c++) {

				var phaseCodeChk = sap.ui.core.Fragment.byId("update", "phaseCodeChk" + i).getSelected();
				var taskCodeChk = sap.ui.core.Fragment.byId("update", "taskCodeChk" + i).getSelected();
				var ActivityCodeChk = sap.ui.core.Fragment.byId("update", "ActivityCodeChk" + i).getSelected();
				var FFTaskCodeChk = sap.ui.core.Fragment.byId("update", "FFTaskCodeChk" + i).getSelected();
				var FFActCodeChk = sap.ui.core.Fragment.byId("update", "FFActCodeChk" + i).getSelected();

				if (taskCodeChk === true && phaseCodeChk === true) {

					this.jsonModel.setProperty("/modelData/" + selectedLines[c] + "/taskCodes", this.selectedRows.getProperty(
						"/taskCodes"));
					this.jsonModel.setProperty("/modelData/" + selectedLines[c] + "/selectedTaskCode", sap.ui.core.Fragment.byId("update",
						"selectedTaskCode" + i).getSelectedKey());

				}
				if (phaseCodeChk === true) {

					this.jsonModel.setProperty("/modelData/" + selectedLines[c] + "/taskCodes", this.selectedRows.getProperty(
						"/taskCodes"));
					this.jsonModel.setProperty("/modelData/" + selectedLines[c] + "/phaseCodes", this.selectedRows.getProperty(
						"/phaseCodes"));
					this.jsonModel.setProperty("/modelData/" + selectedLines[c] + "/selectedPhaseCode", sap.ui.core.Fragment.byId(
						"update",
						"selectedPhaseCode" + i).getSelectedKey());

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
					this.jsonModel.setProperty("/modelData/" + selectedLines[c] + "/ffActCodes", this.selectedRows.getProperty(
						"/ffActCodes"));

				}
				if (FFActCodeChk === true && FFTaskCodeChk === true) {

					this.jsonModel.setProperty("/modelData/" + selectedLines[c] + "/ffActCodes", this.selectedRows.getProperty(
						"/ffActCodes"));
					this.jsonModel.setProperty("/modelData/" + selectedLines[c] + "/selectedFFActCode", sap.ui.core.Fragment.byId("update",
						"selectedFFActCode" + i).getSelectedKey());
				}

			}
			this.getModel("InputsModel").getProperty("/Inputs/rowLineCount", []);

		},
		UpdateCodesphasecodechange: function(oEvent) {

			var InputFields = this.getView().getModel("InputsModel");

			var phaseCodeSelected = oEvent.getSource().getSelectedItem().getKey();
			var pspid = InputFields.getProperty("/Inputs/rootPspid");

			var that = this;

			$.when(that.serviceInstance.getTaskcodes(InputFields, phaseCodeSelected, that),
					that.serviceInstance.getActivitycodes(InputFields, pspid, that),
					that.serviceInstance.getFFtaskcodes(InputFields, pspid, that))
				.done(function(taskCodes, activityCodes, ffTskCodes) {
					that.selectedRows.setProperty("/taskCodes", taskCodes.results);
					that.selectedRows.setProperty("/actCodes", activityCodes.results);
					that.selectedRows.setProperty("/ffTskCodes", ffTskCodes.results);

				})
				.fail(function() {
					sap.ui.core.BusyIndicator.hide(0);
				});
		},
		UpdateCodesffTaskcodechange: function(oEvent) {

			var ffTaskcodeselected = oEvent.getSource().getSelectedItem().getKey();

			var InputFields = this.getView().getModel("InputsModel");
			var pspid = InputFields.getProperty("/Inputs/rootPspid");

			var that = this;
			this.serviceInstance = LineItemsServices.getInstance();

			$.when(
				that.serviceInstance.getFFActivitycodes(InputFields, ffTaskcodeselected, pspid, that)
			)

			.done(function(updateffActCodes) {

					that.selectedRows.setProperty("/ffActCodes", updateffActCodes.results);

				})
				.fail(function() {
					sap.ui.core.BusyIndicator.hide(0);
				});
		},

		//modifyreverse
		onModifyReverse: function(button) {

			var oTable = this.getView().byId("WipDetailsSet2");

			var oBinding = oTable.getItems();

			var selectedLines = this.getModel("InputsModel").getProperty("/Inputs/rowLineCount");
			// this.selectedIndex = oTable.getSelectedIndex();
			this.ctx = oTable.getSelectedContexts(0);
			this.m = this.ctx[0].getObject();
			var belnr = this.m.Belnr;
			var HQ = this.m.Megbtr;
			this.jsonModel.setProperty("/Belnr", belnr);
			this.jsonModel.setProperty("/Megbtr", HQ);

			this._getModifyDialog().open();

		},
		_getModifyDialog: function() {
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment("modifyReverse", "zprs.wipeditor.Fragments.modifyreverse", this);
				this.getView().addDependent(this._oDialog);
			}

			return this._oDialog;
		},
		closeModifyDialog: function() {
			sap.ui.core.Fragment.byId("modifyReverse", "newHours").setValue("");
			this._getModifyDialog().close();
		},
		newHoursChange:function(evt){
		var value = evt.getParameters("value").value;
			if(value){
				sap.ui.core.Fragment.byId("modifyReverse", "saveId").setVisible(true);
			}
			else{
				sap.ui.core.Fragment.byId("modifyReverse", "saveId").setVisible(false);
			}
		},
		ModifyReverseSave: function(oModel) {

			var res = [];
			var ChangedTableData = [];
			this.Action = "MODIFY";
			this.newHours = sap.ui.core.Fragment.byId("modifyReverse", "newHours").getValue();
			// this.jsonModel.setProperty("/Megbtr", this.newHours);
			// this.jsonModel.setProperty("/Megbtr", sap.ui.core.Fragment.byId("modifyReverse", "newHours").getValue());
			var modrevData = this.jsonModel["oData"]["modelData"];
			this.selectedIndex = this.getModel("InputsModel").getProperty("/Inputs/rowLineCount");
			var that = this;
			var ChangedTableDat = {};

			modrevData.forEach(function(obj, io) {

				if (io === that.selectedIndex[0]) {
					ChangedTableDat = $.extend(true, {}, obj);
				}
			});

			ChangedTableDat.Megbtr = this.newHours;
			ChangedTableDat.Action = this.Action;
			ChangedTableData.push(ChangedTableDat);

			this.makeBatchCallsModify(ChangedTableData, oModel);
			sap.ui.core.Fragment.byId("modifyReverse", "newHours").setValue("");
			this._getModifyDialog().close();
			var InputFields = this.getView().getModel("InputsModel");

			InputFields.setProperty("/Inputs/scope", this.getView().byId("WipDetailsSet2"));

		},
		makeBatchCallsModify: function(oList, oModel1) {

			sap.ui.core.BusyIndicator.show();
			this.Action = "MODIFY";
			var oComponent = this.getOwnerComponent(),

				oFModel = oComponent.getModel(),

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

			oFModel.callFunction("/WIPTRANSFER", {
				method: "GET",
				urlParameters: urlParams,

				success: function(oData) {
					sap.ui.core.BusyIndicator.hide();

					var res = oData.results;
					var msgTxt = res[0].Message;
					MessageBox.show(
						msgTxt, {

							actions: [sap.m.MessageBox.Action.OK],

						}
					);
					if (!msgTxt.includes("ERROR")) {
						that.ReloadTable();
					}

				},
				error: function(err) {
					sap.ui.core.BusyIndicator.hide();
				}
			});
		},
		
		//lineitemedits save
		removeDups: function(indexs) {
			var unique = {};
			indexs.forEach(function(i) {
				if (!unique[i]) {
					unique[i] = true;
				}
			});
			return Object.keys(unique);
		},
		onLineItemEditsSave: function() {

			var m = this.getModel("generalSetting"),
				md = m.getData();
			if (md.showNarr === true) {
				this.narativeSave();
			} else {

				var that = this;

				var saveObjects = this.getModel("InputsModel").getProperty("/Inputs/saveObjects");
				var indexes = this.getModel("InputsModel").getProperty("/Inputs/indexes");
				indexes = this.removeDups(indexes);
				var data = this.getModel("InputsModel").getProperty("/Inputs/homeTable");
				$.each(indexes, function(i, o) {
					var rowdat = data[o];
					saveObjects.push(rowdat);
				});

				this.getModel("InputsModel").setProperty("/Inputs/indexes", []);
				var finalArray;
				finalArray = saveObjects;
				if (saveObjects.length === 0) {
					MessageBox.show(
						"No changes exists please verify and save.", {
							icon: sap.m.MessageBox.Icon.INFORMATION,
							title: "Line Item Edits",
							actions: [sap.m.MessageBox.Action.OK]
						}
					);
				}
				this.getModel("InputsModel").setProperty("/Inputs/saveObjects", []);

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

					Hours.push(o.Quantity);
					Percentage.push(o.Percent);
					ToActivityCode.push(o.selectedActCode);
					ToFfActivityCode.push(o.selectedFFActCode);
					ToFfTaskCode.push(o.selectedFFTaskCode);
					ToMatter.push(o.Pspid);
					ToTaskCode.push(o.selectedTaskCode);
					ToPhaseCode.push(o.selectedPhaseCode);
					Buzei.push(o.Buzei);
				});

				ToPhaseCode.forEach(function(item, index) {

					if (/\s/.test(item)) {
						item = item.replace(/\s+/g, '%20');
						ToPhaseCode[index] = item;
					}
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
						var msgSplit = msgTxt.split(' ');
						// MessageBox.show(
						// 	msgTxt, {
						// 		icon: sap.m.MessageBox.Icon.ERROR,
						// 		title: "Error",
						// 		actions: [sap.m.MessageBox.Action.OK]
						// 	}
						// );

						var tableLineEdits = that.getView().byId("WipDetailsSet2");

						var selectedLines = indexes;

						for (var i = 0; i < selectedLines.length; i++) {

							if (msgSplit[0] === "ERROR") {

								tableLineEdits.getItems()[selectedLines[i]].getCells()[0].setVisible(true);
								tableLineEdits.getItems()[selectedLines[i]].getCells()[0].setProperty("color", "red");
								tableLineEdits.getItems()[selectedLines[i]].getCells()[0].setTooltip(msgTxt);

							} else {

								tableLineEdits.getItems()[selectedLines[i]].getCells()[0].setVisible(true);
								tableLineEdits.getItems()[selectedLines[i]].getCells()[0].setProperty("color", "green");
								tableLineEdits.getItems()[selectedLines[i]].getCells()[0].setTooltip(msgTxt);

							}

						}

						that.getModel("InputsModel").setProperty("/Inputs/rowLineCount", []);

					},
					error: function(err) {
						sap.ui.core.BusyIndicator.hide();
						var tableLineEdits = that.getView().byId("WipDetailsSet2");

						var selectedLines = indexes;

						for (var i = 0; i < selectedLines.length; i++) {
							ableLineEdits.getItems()[selectedLines[i]].getCells()[0].setVisible(true);
							tableLineEdits.getItems()[selectedLines[i]].getCells()[0].setProperty("color", "red");
							tableLineEdits.getItems()[selectedLines[i]].getCells()[0].setTooltip(err.responseText);
						}
						that.getModel("InputsModel").setProperty("/Inputs/rowLineCount", []);
					}
				});
			}

			var InputFields = this.getView().getModel("InputsModel");
			InputFields.setProperty("/Inputs/isChanged", false);
			finalArray = [];
		},
		
		//narrative toggle save
		narativeSave: function() {

			var sServiceUrl = this.getOwnerComponent().getModel().sServiceUrl;
			var that = this;
			var saveObjects = this.getModel("InputsModel").getProperty("/Inputs/saveObjects");
			this.uniqueId = [];
			var changeObj = [];
			$.each(saveObjects, function(i, el) {
				if ($.inArray(el, changeObj) === -1) changeObj.push(el);
			});

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
		
		//global search
		onGlobalSearch: function() {

			var searchValue = this.byId("searchText").getValue();

			var result = [];

			this.getModel("InputsModel").getProperty("/Inputs/globalSearchModel").forEach(
				function(value, index) {

					var date = value.Budat;

					var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({

						// formatOptions: { style: 'medium' , UTC:true ,pattern: 'dd.MM.YYYY' }
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

			var otable = this.byId("WipDetailsSet2");

			this.jsonModel.setProperty("/modelData",result);
			//this.getModel("InputsModel").setProperty("/Inputs/globalSearchModel", result);
		

			var visible = this.getModel("InputsModel").getProperty("/Inputs/visible1");
			this.jsonModel.setProperty("/visible", visible);

			var ColumnsItems = this.getModel("InputsModel").getProperty("/Inputs/ColumnsItems1");
			this.jsonModel.setProperty("/ColumnsItems", ColumnsItems);
	otable.setModel(this.jsonModel);
			// otable.bindRows("/modelData");

			var len = this.jsonModel.getProperty("/modelData").length;
			this.jsonModel.setProperty("/RowCount2", len);
            
          
            
		},

		//export lineitemedits data
		createColumnConfig1: function(tableId) {

			var i18nLabel = this.getView().getModel("i18n").getResourceBundle();

			var that = this;
			// var iTotalCols = $.extend(true, {}, that.jsonModel.getProperty("/visible"));

			// var enableColumns = [];

			// for (var key in iTotalCols) {
			// 	if (iTotalCols[key] === true) {
			// 		enableColumns.push(key);
			// 	}

			// }

			// var columnsArray = enableColumns.concat( "Zzphase", "Zztskcd", "Zzactcd", "Zzfftskcd",
			// 	"NarrativeString");
			var arrt = [];
			tableId.getColumns().forEach(function(item, index) {
				if (tableId.getColumns()[index].getVisible()) {
					arrt[index] = JSON.parse(tableId.getColumns()[index].mAggregations.customData[0].getValue()).columnKey;
				}

			});

			var columnsArray = [];
			arrt.forEach(function(item) {
				if (item) {
					columnsArray.push(item);
				}
			})

			var arr = [];
			var dateFields = ["Bldat", "Budat", "Cpudt"];
			for (var colE = 0; colE < columnsArray.length; colE++) {

				var key = columnsArray[colE];
				var trimmedKey = key.trim();
				var labelname = i18nLabel.getText(trimmedKey);
				var obj = {
					label: labelname,
					property: trimmedKey,
					// width: iTotalCols[colE].mProperties.width
				};
				if (dateFields.includes(trimmedKey)) {
					obj.format = {
						style: 'medium',
						UTC: true
					};
					obj.type = "date";
					obj.textAlign = 'begin';
				}
				if (obj.label !== "Reviewed" && obj.label !== "Info") {
					arr.push(obj);

				}
				if (colE === columnsArray.length - 1) {

					return arr;
				}

			}

		},
		ExportLineItem: function(Event) {

			var tableId = this.getView().byId("WipDetailsSet2");

			var aCols, oSettings, oExcelDate, oDateFormat, oExcelFileName, oExportData;
			aCols = this.createColumnConfig1(tableId);
			console.log(aCols);
			// if (tableId.getId().substring(12) === "homeTable") {
			// 	oExportData = this.getView().getModel("InputsModel").getProperty("/Inputs/results");
			// } else {
			// 	oExportData = this.getView().getModel("InputsModel").getProperty("/Inputs/LineitemsCopy");
			// }
			oExportData = this.getView().getModel("InputsModel").getProperty("/Inputs/globalSearchModel");
			oExportData.forEach(function(obj) {
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

		//variants
		onAfterRendering: function() {
			var valuelayouturl = this.getOwnerComponent().getModel('ZPRS_VARIANT_MAINTENANCE_SRV').sServiceUrl;
			var oModellayout = new sap.ui.model.odata.v2.ODataModel({
				serviceUrl: valuelayouturl
			}, true);
			var that = this;
			var aFilter = [];
			aFilter.push(new Filter("ContId", "EQ", "S2C.WIPEDITOR.LIEDIT"));
			var VarinatSaveSet = "/VarinatSaveSet";
			oModellayout.read(VarinatSaveSet, {
				filters: aFilter,
				success: function(oData) {

					if (oData.results.length > 0) {
						var values = oData.results[0].Value;
						var parsed = JSON.parse(values);
						that.jsonModel.setProperty("/VarinatSavedata", oData.results);
						that.jsonModel.setProperty("/VarinatSaveSet", parsed);
						that.jsonModel.setProperty("/oldData", parsed);
						that.jsonModel.setProperty("/UserId", oData.results[0].UserId);
						parsed.forEach(function(obj, j) {
							if (obj.default) {
								that.getView().byId("variant").setInitialSelectionKey(obj.name);
								that.getView().byId("variant").setDefaultVariantKey(obj.name);
								var selectedkey = obj.name;
								var data = that.jsonModel.getProperty("/VarinatSaveSet");

								var selectedkeys = [];
								data.forEach(function(obj) {
									if (obj.name == selectedkey) {
										var columns = obj.variantdata.columns;
										for (var j = 0; j < columns.length; j++) {
											selectedkeys.push(columns[j].name);
										}
									}
								});

								var selColumnKeys = [];
								var items = that.jsonModel.getProperty("/ColumnsItems");

								for (var i = 0; i < selectedkeys.length; i++) {
									var colname = selectedkeys[i];
									items.forEach(function(obj) {
										if (obj.text == colname) {
											selColumnKeys.push(obj.columnKey);
											obj.visible = true;
										} else {
											obj.visible = false;
										}
									});
								}

								var oColumnKeys = [];
								items.forEach(function(obj) {
									oColumnKeys.push(obj.columnKey);
								});

								var visible = that.jsonModel.getProperty("/visible");
								for (var i = 0; i < oColumnKeys.length; i++) {
									var item = oColumnKeys[i];
									if (selColumnKeys.includes(item)) {
										visible[item] = true;
									} else {
										visible[item] = false;
									}
								}
								var cols = that.jsonModel.getProperty("/ColumnsItems");
								cols.forEach(function(obj) {
									if (selectedkeys.includes(obj.text)) {
										obj.visible = true;
									} else {
										obj.visible = false;
									}
								});

								that.jsonModel.setProperty("/visible", visible);
								that.jsonModel.setProperty("/ColumnsItems", cols);
							}
						});
					}
					
						
						if (that.getView().byId("variant")) {
						
						
						$("#" +that.getView().getId() + "--variant-trigger-inner").click(function(){

                        	that.getView().byId("variant").oVariantSave.setVisible(false);
                        });

                        $("#" +that.getView().getId() + "--variant-text-inner").click(function(){

                        	that.getView().byId("variant").oVariantSave.setVisible(false);
                        });


						
					}
					var oHeader = that.byId("WipDetailsSet2").$().find('.sapMListTblHeaderCell');
						
							for (var i = 0; i < oHeader.length; i++) {
								var oID = oHeader[i].id;
								that.onClick(oID);
							}
							$(".sapMPanelWrappingDivTb ").addClass("sapContrastPlus sapMIBar sapMHeader-CTX");
				
					
				},
				error: function(err) {
					MessageBox.show(
						"Error", {
							icon: sap.m.MessageBox.Icon.ERROR,
							title: "Error!",
							actions: [sap.m.MessageBox.Action.OK]
						}
					);
				}
			});

		},
		bindnewdata: function() {

			var valuelayouturl = this.getOwnerComponent().getModel('ZPRS_VARIANT_MAINTENANCE_SRV').sServiceUrl;
			var oModellayout = new sap.ui.model.odata.v2.ODataModel({
				serviceUrl: valuelayouturl
			}, true);
			// var oSummaryCMTTable = this.getView().byId("tblSummaryCMT"),
			// 	oSummaryCMTable = this.getView().byId("tblSummaryCM"),
			// 	oDetailTable = this.getView().byId("tblDetailed");
			// var tableId;
			var aFilter = [];
			// var VarinatSavedata;
			// var VarinatSaveSet;
			// var ColumnsItems;
			// var visibleid;
			// var variant;
			// if (oDetailTable.getVisible()) {
			aFilter.push(new Filter("ContId", "EQ", "S2C.WIPEDITOR.LIEDIT"));
			var VarinatSavedata = "/VarinatSavedata";
			var VarinatSaveSet = "/VarinatSaveSet";
			var ColumnsItems = "/ColumnsItems";
			var visibleid = "/visible";
			var variant = "variant";
			// } else if (oSummaryCMTTable.getVisible()) {
			// 	aFilter.push(new Filter("ContId", "EQ", "S2C.WIPREPORT.UI.CMT"));
			// 	VarinatSavedata = "/VarinatSavedata2";
			// 	VarinatSaveSet = "/VarinatSaveSet2";
			// 	ColumnsItems = "/ColumnsItems2";
			// 	visibleid = "/visible2";
			// 	variant = "variant2";
			// } else if (oSummaryCMTable.getVisible()) {
			// 	aFilter.push(new Filter("ContId", "EQ", "S2C.WIPREPORT.UI.CM"));
			// 	VarinatSavedata = "/VarinatSavedata3";
			// 	VarinatSaveSet = "/VarinatSaveSet3";
			// 	ColumnsItems = "/ColumnsItems3";
			// 	visibleid = "/visible3";
			// 	variant = "variant3";
			// }
			var that = this;
			var VarinatSaveSet = "/VarinatSaveSet";
			oModellayout.read(VarinatSaveSet, {
				filters: aFilter,
				success: function(oData) {

					var values = oData.results[0].Value;
					var parsed = JSON.parse(values);
					that.jsonModel.setProperty(VarinatSavedata, oData.results);
					that.jsonModel.setProperty(VarinatSaveSet, parsed);
					parsed.forEach(function(obj, j) {
						that.byId(variant).mAggregations.variantItems[j].setAuthor(obj.Author);
					});

					if (that.saveCheck) {
						parsed.forEach(function(obj, j) {

							if (obj.default) {

								var selectedkey = obj.name;
								var data = that.jsonModel.getProperty(VarinatSaveSet);
								// that.byId(variant).setDefaultVariantKey(selectedkey);
								// that.getView().byId(variant).setInitialSelectionKey(selectedkey);
								var key = that.byId(variant).getDefaultVariantKey();
								var renamedVars = that.byId(variant).aRenamedVariants;
								var renamedValue = _.result(_.find(renamedVars, function(obj) {
									return obj.name === selectedkey;
								}), 'name');
								if (renamedValue === selectedkey && that.newValRenamed) {

								} else if (renamedValue === selectedkey && !that.newValRenamed) {
									that.byId(variant).setDefaultVariantKey(selectedkey);
									that.getView().byId(variant).setInitialSelectionKey(selectedkey);
								} else {
									that.byId(variant).setDefaultVariantKey(key);
								}
								var selectedkeys = [];
								data.forEach(function(obj) {
									if (obj.name == selectedkey) {
										var columns = obj.variantdata.columns;
										for (var j = 0; j < columns.length; j++) {
											selectedkeys.push(columns[j].name);
										}
									}
								});
								var selColumnKeys = [];
								var items = that.jsonModel.getProperty(ColumnsItems);

								for (var i = 0; i < selectedkeys.length; i++) {
									var colname = selectedkeys[i];
									items.forEach(function(obj) {
										if (obj.text == colname) {
											selColumnKeys.push(obj.columnKey);
											obj.visible = true;
										} else {
											obj.visible = false;
										}
									});
								}
								var oColumnKeys = [];
								items.forEach(function(obj) {
									oColumnKeys.push(obj.columnKey);
								});

								var visible = that.jsonModel.getProperty(visibleid);
								for (var i = 0; i < oColumnKeys.length; i++) {
									var item = oColumnKeys[i];
									if (selColumnKeys.includes(item)) {
										visible[item] = true;
									} else {
										visible[item] = false;
									}
								}
								var cols = that.jsonModel.getProperty(ColumnsItems);
								cols.forEach(function(obj) {
									if (selectedkeys.includes(obj.text)) {
										obj.visible = true;
									} else {
										obj.visible = false;
									}
								});

								that.jsonModel.setProperty(visibleid, visible);
								that.jsonModel.setProperty(ColumnsItems, cols);

							}
						});
					}
				},
				error: function(err) {
					MessageBox.show(
						"Error", {
							icon: sap.m.MessageBox.Icon.ERROR,
							title: "Error!",
							actions: [sap.m.MessageBox.Action.OK]
						}
					);
				}
			});

		},
		onlayoutitmSelect: function(oEvent) {

			// var oSummaryCMTTable = this.getView().byId("tblSummaryCMT"),
			// 	oSummaryCMTable = this.getView().byId("tblSummaryCM"),
			// 	oDetailTable = this.getView().byId("tblDetailed");
			// var VarinatSaveSet;
			// var ColumnsItems;
			// var visibleid;
			// var variant;
			// if (oDetailTable.getVisible()) {
			var VarinatSaveSet = "/VarinatSaveSet";
			var ColumnsItems = "/ColumnsItems";
			var visibleid = "/visible";
			var variant = "variant";
			// } else if (oSummaryCMTTable.getVisible()) {
			// 	VarinatSaveSet = "/VarinatSaveSet2";
			// 	ColumnsItems = "/ColumnsItems2";
			// 	visibleid = "/visible2";
			// 	variant = "variant2";
			// } else if (oSummaryCMTable.getVisible()) {
			// 	VarinatSaveSet = "/VarinatSaveSet3";
			// 	ColumnsItems = "/ColumnsItems3";
			// 	visibleid = "/visible3";
			// 	variant = "variant3";
			// }
var that = this;
			var selectedkey = this.getView().byId(variant).getSelectionKey();
			if (selectedkey == "*standard*") {
				// var Colitems = this.jsonModel.getProperty(ColumnsItems);
				// Colitems.forEach(function(obj) {
				// 	obj.visible = true;
				// });

				var visiblestandard = this.jsonModel.getProperty(visibleid);

				var standardSettingColumns = this.getModel("InputsModel").getProperty("/Inputs/standardSettingColumns");

				var Colitems = this.getModel("InputsModel").getProperty("/Inputs/DefaultColumns0");

				visiblestandard = _.mapValues(visiblestandard, () => true);

				var keys = Object.keys(visiblestandard);

				for (var i = 0; i < keys.length; i++) {

					var key = keys[i];

					if (standardSettingColumns.includes(key)) {
						visiblestandard[key] = true;
					} else {
						visiblestandard[key] = false;
					}

				}
				for (var i = 0; i < Colitems.length; i++) {

					var columnkey = Colitems[i].columnKey;

					if (standardSettingColumns.includes(columnkey)) {
						Colitems[i].visible = true;
					} else {
						Colitems[i].visible = false;
					}

				}

				console.log(visiblestandard);
				var ColumnsItems1 = this.getModel("InputsModel").getProperty("/Inputs/DefaultColumns0");
				this.jsonModel.setProperty("/ColumnsItems", ColumnsItems1);

				this.jsonModel.setProperty(ColumnsItems, ColumnsItems1);
				this.jsonModel.setProperty(visibleid, visiblestandard);

			} else {

				var seltext = this.getView().byId(variant)._getSelectedItem().mProperties.text;
				var data = this.jsonModel.getProperty(VarinatSaveSet);
				var selectedkeys = [];
				data.forEach(function(obj) {
					if ((obj.name == selectedkey) || (obj.name == seltext)) {
						var columns = obj.variantdata.columns;
						for (var j = 0; j < columns.length; j++) {
							selectedkeys.push(columns[j].name);
						}
					}
				});
				var selColumnKeys = [];
				var items = this.jsonModel.getProperty(ColumnsItems);

				for (var i = 0; i < selectedkeys.length; i++) {
					var colname = selectedkeys[i];
					items.forEach(function(obj) {
						if (obj.text == colname) {
							selColumnKeys.push(obj.columnKey);
							obj.visible = true;
						} else {
							obj.visible = false;
						}
					});
				}

				var oColumnKeys = [];
				items.forEach(function(obj) {
					oColumnKeys.push(obj.columnKey);
				});

				var visible = this.jsonModel.getProperty(visibleid);
				for (var i = 0; i < oColumnKeys.length; i++) {
					var item = oColumnKeys[i];
					if (selColumnKeys.includes(item)) {
						visible[item] = true;
					} else {
						visible[item] = false;
					}
				}
				var cols = this.jsonModel.getProperty(ColumnsItems);
				cols.forEach(function(obj) {
					if (selectedkeys.includes(obj.text)) {

						obj.visible = true;
					} else {
						obj.visible = false;
					}
				});

				this.jsonModel.setProperty(visibleid, visible);
				this.jsonModel.setProperty(ColumnsItems, cols);

			}
				var oHeader = this.byId("WipDetailsSet2").$().find('.sapMListTblHeaderCell');
						
							for (var i = 0; i < oHeader.length; i++) {
								var oID = oHeader[i].id;
								that.onClick(oID);
							}
							$(".sapMPanelWrappingDivTb ").addClass("sapContrastPlus sapMIBar sapMHeader-CTX");
		},
		onLayoutModify: function(oEvent) {

			// var aParameters = oEvent.getParameters();

			// var oSummaryCMTTable = this.getView().byId("tblSummaryCMT"),
			// 	oSummaryCMTable = this.getView().byId("tblSummaryCM"),
			// 	oDetailTable = this.getView().byId("tblDetailed");

			// var ContId;
			// var VarinatSaveSet;
			// if (oDetailTable.getVisible()) {
			this.saveCheck = false;
			this.newValRenamed = false;
			var ContId = "S2C.WIPEDITOR.LIEDIT";
			var VarinatSaveSet = "VarinatSaveSet";
			// } else if (oSummaryCMTTable.getVisible()) {
			// 	ContId = "S2C.WIPREPORT.UI.CMT";
			// 	VarinatSaveSet = "VarinatSaveSet2";
			// } else if (oSummaryCMTable.getVisible()) {
			// 	ContId = "S2C.WIPREPORT.UI.CM";
			// 	VarinatSaveSet = "VarinatSaveSet3";
			// }
			//manage deleted;
			var deleted = oEvent.getParameters().deleted;
			var data = this.jsonModel.getProperty("/" + VarinatSaveSet);

			if (deleted.length !== 0) {
				for (var i = 0; i < deleted.length; i++) {
					data.forEach(function(obj, j) {
						if (obj.name == deleted[i] || oEvent.getSource().mAggregations.variantItems[j].getProperty("key") == deleted[i]) {
							data.splice(j, 1);
						}
					});
				}
			}

			//manage default
			var defaultname = oEvent.getParameters().def;
			data.forEach(function(obj, j) {
				if (obj.name == defaultname || oEvent.getSource().mAggregations.variantItems[j].getProperty("key") == defaultname) {
					obj.default = true;
				} else {
					obj.default = false;
				}
			});

			// manage renamed
			var that = this;
			var oldData = this.jsonModel.getProperty("/oldData");
			var renamed = oEvent.getParameters().renamed;

			if (renamed.length !== 0) {
				for (var i = 0; i < renamed.length; i++) {
					if (renamed[i].key === defaultname) {
						if (oldData.length !== 0) {
							for (var j = 0; j < oldData.length; j++) {
								if (oldData[j].name == renamed[i].key || oldData[j].name == renamed[i].name) {
									oldData[j].name = renamed[i].key;
									that.jsonModel.setProperty("/oldData", oldData);
									that.newValRenamed = false;
									break;
								} else {
									that.newValRenamed = true;
								}
							}
						}
					} else {
						that.newValRenamed = true;
					}
				}
			}

			if (renamed.length !== 0) {
				for (var i = 0; i < renamed.length; i++) {
					data.forEach(function(obj, j) {
						if (oEvent.getSource().mAggregations.variantItems[j].getProperty("key") == renamed[i].key) {
							obj.name = renamed[i].name;
						}
					});
				}
			}
			var mainobj = new Object({
				ContId: ContId,
				Value: JSON.stringify(data)
			});
			this.makelayoutBatchCall(mainobj);

		},
		makelayoutBatchCall: function(object) {

			var batchChanges = [];
			var entitySet = "/VarinatSaveSet";
			var oModel = new sap.ui.model.odata.ODataModel(this.getOwnerComponent().getModel("ZPRS_VARIANT_MAINTENANCE_SRV").sServiceUrl);
			batchChanges.push(oModel.createBatchOperation(entitySet, "POST", object));
			oModel.addBatchChangeOperations(batchChanges);
			oModel.setUseBatch(true);
			var that = this;
			sap.ui.core.BusyIndicator.show(0);
			oModel.submitBatch(function(data) {
				sap.ui.core.BusyIndicator.hide();
				var batchResp = data.__batchResponses[0],
					resp = batchResp.response,
					result = resp && resp.body ? resp.body : 1;

				if (batchResp.__changeResponses === undefined) {
					var oXmlData = result;
					var oXMLModel = new sap.ui.model.xml.XMLModel();
					oXMLModel.setXML(oXmlData);
					var error;
					if (oXMLModel.getProperty("/message")) {
						error = oXMLModel.getProperty("/message");
					} else {
						error = "error";
					}

					MessageBox.show(
						error, {
							icon: sap.m.MessageBox.Icon.ERROR,
							title: "Error",
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function(oAction) {}
						}
					);
				}
				if (batchResp.response === undefined) {
					that.bindnewdata();
					// jQuery.sap.delayedCall(5000, that, 	that.bindnewdata());
					// var oSummaryCMTTable = that.getView().byId("tblSummaryCMT"),
					// 	oSummaryCMTable = that.getView().byId("tblSummaryCM"),
					// 	oDetailTable = that.getView().byId("tblDetailed");
					var tableId;
					// var varianttext;
					// var ColumnsItems;
					// var visible;
					// if (oDetailTable.getVisible()) {
					var visible = "visible";
					var ColumnsItems = "ColumnsItems";
					var varianttext = "variant";
					// that.bindnewdata();
					// } else if (oSummaryCMTTable.getVisible()) {
					// 	visible = "visible2";
					// 	ColumnsItems = "ColumnsItems2";
					// 	varianttext = "variant2";
					// 	// that.bindnewdata2();
					// } else if (oSummaryCMTable.getVisible()) {
					// 	visible = "visible3"
					// 	ColumnsItems = "ColumnsItems3";
					// 	varianttext = "variant3";
					// 	// that.bindnewdata3();
					// }
					var key = that.byId(varianttext).getDefaultVariantKey();
					if (that.saveCheck) {
						if (key == "*standard*") {

							that.byId(varianttext).setDefaultVariantKey(key);
							that.getView().byId(varianttext).setInitialSelectionKey(key);
							var Colitems = that.jsonModel.getProperty("/" + ColumnsItems);
							Colitems.forEach(function(obj) {
								obj.visible = true;
							});
							// var visiblestandard = that.jsonModel.getProperty("/" + visible);
							var visiblestandard = that.getModel("InputsModel").getProperty("/Inputs/visiblekeys0");
							visiblestandard = _.mapValues(visiblestandard, () => true);

							var columns = that.getModel("InputsModel").getProperty("/Inputs/DefaultColumns0");

							var standardSettingColumns = that.getModel("InputsModel").getProperty("/Inputs/standardSettingColumns");

							columns.forEach(function(item) {
								if (standardSettingColumns.includes(item.columnKey)) {
									item.visible = true;
								} else {
									item.visible = false;
								}

							});
							var ColumnsItems1 = that.getModel("InputsModel").getProperty("/Inputs/DefaultColumns0");
							that.jsonModel.setProperty("/ColumnsItems", ColumnsItems1);

							that.jsonModel.setProperty(ColumnsItems, ColumnsItems1);

							// that.jsonModel.setProperty("/" + ColumnsItems, Colitems);
							// that.jsonModel.setProperty("/" + visible, visiblestandard);
						} else {
							that.byId(varianttext).setDefaultVariantKey(key);
							that.getView().byId(varianttext).setInitialSelectionKey(key);

						}
					}
				}

			}, function(err) {
				that.getView().setBusy(false);
				sap.ui.core.BusyIndicator.hide();
				var error = err.message;
				MessageBox.show(
					error, {
						icon: sap.m.MessageBox.Icon.WARNING,
						title: "Error",
						actions: [sap.m.MessageBox.Action.OK]
					}
				);
			});

		},
		onlayoutSave: function(oEvent) {

			// var oSummaryCMTTable = this.getView().byId("tblSummaryCMT"),
			// 	oSummaryCMTable = this.getView().byId("tblSummaryCM"),
			// 	oDetailTable = this.getView().byId("tblDetailed");

			// var ContId;
			// var VarinatSavedata;
			// var VarinatSaveSet;
			// var ColumnsItems;
			// var visibleid;
			// var variant;
			// if (oDetailTable.getVisible()) {
			var ContId = "S2C.WIPEDITOR.LIEDIT";
			var VarinatSavedata = "/VarinatSavedata";
			var VarinatSaveSet = "/VarinatSaveSet";
			var ColumnsItems = "/ColumnsItems";
			var visibleid = "/visible";

			// } else if (oSummaryCMTTable.getVisible()) {
			// 	ContId = "S2C.WIPREPORT.UI.CMT";
			// 	VarinatSavedata = "/VarinatSavedata2";
			// 	VarinatSaveSet = "/VarinatSaveSet2";
			// 	ColumnsItems = "/ColumnsItems2";
			// 	visibleid = "/visible2";

			// } else if (oSummaryCMTable.getVisible()) {
			// 	ContId = "S2C.WIPREPORT.UI.CM";
			// 	VarinatSavedata = "/VarinatSavedata3";
			// 	VarinatSaveSet = "/VarinatSaveSet3";
			// 	ColumnsItems = "/ColumnsItems3";
			// 	visibleid = "/visible3";

			// }
			var data = this.jsonModel.getProperty(VarinatSavedata);
			var name = oEvent.getParameters().name;
			var defaultchk = oEvent.getParameters().def;;
			var value = [];
			if (this.jsonModel.getProperty(VarinatSaveSet) !== undefined) {
				value = this.jsonModel.getProperty(VarinatSaveSet);
			}

			var that = this;
			var check = false;
			if (value.length == undefined) {
				check = false;
			} else {
				value.forEach(function(obj) {
					if (obj.name == name) {
						check = true;
					}
				});
			}
			if (!check) {
				var columns = [];
				var selKeyNames = [];
				var visible = that.jsonModel.getProperty(visibleid);
				var filtered = _.pickBy(visible);
				var visiblekeys = _.keys(filtered);

				if (defaultchk) {
					value.forEach(function(obj) {
						if (obj.name !== name) {
							obj.default = false;
						}
					});
				}
				var items = this.jsonModel.getProperty(ColumnsItems);
				for (var h = 0; h < visiblekeys.length; h++) {
					var keyname = visiblekeys[h];
					items.forEach(function(obj) {
						if (obj.columnKey == keyname) {
							selKeyNames.push(obj.text);
						}
					});
				}

				for (var c = 0; c < selKeyNames.length; c++) {
					var column = new Object({
						name: selKeyNames[c],
						filters: [{}],
						sort: {},
						visible: true
					});
					columns.push(column);
				}
				var variantdata = new Object({
					columns: columns,
					grouping: {},
					scrollFocus: {},
					selection: [],
					treeView: {},
				});
				var newentry = new Object({
					name: oEvent.getParameters().name,
					default: oEvent.getParameters().def,
					Author: this.jsonModel.getProperty("/UserId"),
					variantdata: variantdata
				});
				if (newentry.default === false) {
					this.saveCheck = false;
				} else {
					this.saveCheck = true;
				}
				value.push(newentry);
				var mainobj = new Object({
					ContId: ContId,
					Value: JSON.stringify(value)
				});
				this.makelayoutBatchCall(mainobj);
			}

		},

	});

})