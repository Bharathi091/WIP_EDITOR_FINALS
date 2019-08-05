jQuery.sap.require("sap.ui.comp.valuehelpdialog.ValueHelpDialog");
sap.ui.define([
	"zprs/wipeditor/controller/BaseController",
	"zprs/wipeditor/services/LineItemsServices",
	"zprs/wipeditor/services/SplitItemsServices",
	"zprs/wipeditor/model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	'sap/ui/model/Sorter',
	"sap/ui/core/format/DateFormat",
	'sap/m/Dialog',
	"sap/ui/export/Spreadsheet",
	'sap/m/Button',
	'sap/m/Text'
], function(BaseController, LineItemsServices, SplitItemsServices, formatter, JSONModel, MessageBox, Filter, Sorter, DateFormat,
	Dialog, Spreadsheet, Button, Text) {
	"use strict";

	return BaseController.extend("zprs.wipeditor.controller.LineItemTransfers", {
		formatter: formatter,

		onInit: function() {

			this.bus = sap.ui.getCore().getEventBus();

			this.bus.subscribe("homeChannelLineItemTransfer", "toSummaryEditLineItemTransfer", this.lineItemTransfersData, this);

			this.jsonModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.jsonModel, "JSONModel");
			this.transferArray = [];
			this.index = [];
			this.filterArr = [];
			this.tomatter = [];

		},

		//lineitemtransfers table  binding
		lineItemTransfersData: function(homeChannelLineItemTransfer, toSummaryEditLineItemTransfer, data) {

			var that = this;
			if (!data.button) {

				this.getView().byId("WipDetailsSet3").setVisible(false);

				var InputFields = this.getModel("InputsModel");
				var results = InputFields.getProperty("/Inputs/homeTable");

				InputFields.setProperty("/Inputs/currView", {
					view: "lineTrans",
					scope: this
				});

				// var resultsWithinfo = results;
				// for (var i = 0; i < resultsWithinfo.length; i++) {
				// 	resultsWithinfo[i].info = "";
				// }
				// InputFields.setProperty("/Inputs/homeTable", resultsWithinfo);
				// this.jsonModel.setProperty("/modelData", resultsWithinfo);

				// var Otable = this.getView().byId("WipDetailsSet3");
				// Otable.setModel(this.jsonModel);
				this.jsonModel.setProperty("/RowCount3", results.length);

				var visible = InputFields.getProperty("/Inputs/visible2");
				this.jsonModel.setProperty("/visible", visible);
				var ColumnsItems = InputFields.getProperty("/Inputs/ColumnsItems2");
				this.jsonModel.setProperty("/ColumnsItems", ColumnsItems);

				// Otable.bindRows("/modelData");
				var generalSetting = new JSONModel({
					showRowDetail: true,
					showComments: false,
					showNarr: false
				});
				this.setModel(generalSetting, "generalSetting");

				this.byId("searchText").setValue("");
				// InputFields.setProperty("/Inputs/scope",this.getView().byId("WipDetailsSet3"));
				// var OtableSmart0 = this.getView().byId("smartTable_ResponsiveTable3");
				// var that = this;
				// var oPersButton = OtableSmart0._oTablePersonalisationButton;
				// oPersButton.attachPress(function() {

				// 	var oPersController = OtableSmart0._oPersController;
				// 	var oPersDialog = oPersController._oDialog;

				// 	oPersDialog.attachOk(function(oEvent) {

				// 		setTimeout(function() {

				// 			that.jsonModel.setProperty("/modelData", that.getModel("InputsModel").getProperty("/Inputs/homeTable"));
				// 			var Otablenew = that.getView().byId("WipDetailsSet3");
				// 			Otablenew.bindRows("/modelData");
				// 		}, 1000);

				// 	});

				// });
				var filters = [];
				var iOrder = "";
				var iType = "";
				var oModel = this.getOwnerComponent().getModel("ZPRS_VALUE_HELP_SRV");
				var filter1 = new sap.ui.model.Filter("Pspid", sap.ui.model.FilterOperator.Contains, iOrder);
				var filter2 = new sap.ui.model.Filter("Post1", sap.ui.model.FilterOperator.Contains, iType);
				filters.push(filter1);
				filters.push(filter2);

				// sap.m.MessageToast.show("Search pressed '");
				oModel.read("/MatterSearchSet", {
					filters: filters,
					success: function(oData) {

						that.getModel("InputsModel").setProperty("/Inputs/matters", oData.results);

					},
					error: function(err) {
						sap.ui.core.BusyIndicator.hide(0);
					}
				});

				if (!this._oResponsivePopoverTrans) {
					this._oResponsivePopoverTrans = sap.ui.xmlfragment("personalizationDialog1", "zprs.wipeditor.fragments.personalizationDialog",
						this);
					this._oResponsivePopoverTrans.setModel(this.getView().getModel());
				}

				// setTimeout(function() {
				// 	var tableLineEdits = this.getView().byId("WipDetailsSet3");

				// 	var index = this.getModel("InputsModel").getProperty("/Inputs/rowLineTransfersCount");
				// 	for (var i = 0; i < index.length; i++) {
				// 		tableLineEdits.getRows()[index[i]].getCells()[0].setVisible(false);

				// 	}
				// }, 1000);

				var change = InputFields.getProperty("/Inputs/isChanged");

				if (change === true) {

					this._Dialog = sap.ui.xmlfragment("zprs.wipeditor.Fragments.Fragment", this);
					this._Dialog.open();
				} else {

					this.ReloadTable();

				}
			} else {
				if (data.button === "Save") {
					this.onLineItemTransfersSave();
				} else if (data.button === "Update Codes") {
					this.onUpdateCodes();
				} else if (data.button === "Consolidate") {
					this.onConsolidate();
				} else if (data.button === "Mass Transfer") {
					this.onMassTransfer();
				} else if (data.button === "Split Transfer") {
					this.onSplitTransfer();
				}
			}
			var smarttbl = this.getView().byId("smartTable_ResponsiveTable3");
			smarttbl._oTable.setVisible(false);

			var oTable = this.getView().byId("WipDetailsSet3");

			var that = this;
			oTable.addEventDelegate({
				onAfterRendering: function() {

					var oHeader = that.getView().byId("WipDetailsSet3").$().find('.sapMListTblHeaderCell'); //Get hold of table header elements
					for (var i = 0; i < oHeader.length; i++) {
						var oID = oHeader[i].id;
						that.onClick(oID);
					}

				}
			}, oTable);

		},

		//F4 valuehelp dialog
		valueHelpRequest: function(evt) {
			this.oMultiInput = this.byId("ToMatter");
			var oInput = this.byId("ToMatter");

			var home = this.jsonModel.getProperty("/modelData");
			var that = this;
			var items = evt.getSource().getParent().getBindingContextPath().split("/");
			var idx = items[items.length - 1];

			this.tomatter.push(idx);
			var indexes = this.tomatter;
			this.index = this.index.concat(indexes);

			if (!this._oValueHelpDialog) {
				this._oValueHelpDialog = new sap.ui.comp.valuehelpdialog.ValueHelpDialog("idValueHelp", {
					supportMultiselect: false,
					basicSearchText: evt.getSource().getValue(),
					supportRangesOnly: false,
					supportRanges: false,
					contentHeight: "700px",
					contentWidth: "700px",
					title: "Matter",
					stretch: sap.ui.Device.system.phone,
					key: "Pspid",
					keys: "Pspid",
					descriptionKey: "Post1",
					verticalScrolling: true,

					filtermode: "true",
					ok: function(oEvent) {

						// var aTokens = oEvent.getParameter("tokens");
						// var matter = aTokens[aTokens.length - 1].getKey();
						var obj = oEvent.getSource().theTable.getSelectedIndex();
						var matter = oEvent.getSource().getTable().getModel().getData()[obj]["Pspid"]
							// var aTokens = oEvent.getParameter("tokens");
							// oInput.setTokens(aTokens);
							// for (var i = 0; i < home.length; i++) {
							// 	if (!(i === indexes[i])) {
							// 		home[i].ToMatter = "";
							// 	}

						// }

						$.each(that.tomatter, function(j, o) {

							home[that.tomatter[j]].ToMatter = matter;
							home[that.tomatter[j]].isEditableH = true;
							home[that.tomatter[j]].isEditableP = true;
							home[that.tomatter[j]].isEditable = true;
							home[that.tomatter[j]].iconColor = "";
							home[that.tomatter[j]].iconTooltip = "";
							home[that.tomatter[j]].iconVisible = false;
							home[that.tomatter[j]].Quantity = "0.000";
							home[that.tomatter[j]].Percent = "0.000";
							that.jsonModel.setProperty("/modelData/" + that.tomatter[j], home[that.tomatter[j]]);
							that.getView().byId("WipDetailsSet3").setModel(that.jsonModel);
							oTable.bindRows("/modelData/" + that.tomatter[j]);
							that.tomatter = [];

							// that.changeTransferToMatter();

						});

						this.close();
					},
					cancel: function(eve) {
						eve.getSource().setBasicSearchText("");
						this.close();
					}
				});
			} else {
				debugger;
				this._oValueHelpDialog.setBasicSearchText(evt.getSource().getValue());
			}

			var that = this;

			var oFilterBar = new sap.ui.comp.filterbar.FilterBar({
				advancedMode: true,
				// filterBarExpanded: false,
				filterBarExpanded: true,
				showGoOnFB: !sap.ui.Device.system.phone,
				filterGroupItems: [new sap.ui.comp.filterbar.FilterGroupItem({
						groupTitle: "foo",
						groupName: "gn1",
						name: "n1",
						label: "Matter",
						control: new sap.m.SearchField({

							liveChange: $.proxy(this.matterSearch, this)

						})
					})
					// 	new sap.ui.comp.filterbar.FilterGroupItem({
					// 		groupTitle: "foo",
					// 		groupName: "gn1",
					// 		name: "n2",
					// 		label: "Matter Name",
					// 		control: new sap.m.SearchField({

					// 			liveChange: $.proxy(this.matterNameSearch, this)

					// 		})
					// 	}),

				],

				search: function(oEvt) {
					var oParams = oEvt.getParameter("selectionSet");
					var iOrder = "";
					var iType = "";
					// var path = this.getModel("InputsModel").getProperty("/Inputs/matters");
					var filters = [];
					var filter1 = new sap.ui.model.Filter("Pspid", sap.ui.model.FilterOperator.Contains, iOrder);
					var filter2 = new sap.ui.model.Filter("Post1", sap.ui.model.FilterOperator.Contains, iType);
					filters.push(filter1);
					filters.push(filter2);

					sap.ui.core.BusyIndicator.show(0);
					// sap.m.MessageToast.show("Search pressed '");
					oModel.read("/MatterSearchSet", {
						filters: filters,
						success: function(oData) {
							sap.ui.core.BusyIndicator.hide(0);
							var oRowsModel = new sap.ui.model.json.JSONModel();
							oRowsModel.setData(oData.results);
							that.getModel("InputsModel").setProperty("/Inputs/matters", oData.results);
							that._oValueHelpDialog.getTable().setModel(oRowsModel);
							if (that._oValueHelpDialog.getTable().bindRows) {
								that._oValueHelpDialog.getTable().bindRows("/");
							}

						},
						error: function(err) {
							sap.ui.core.BusyIndicator.hide(0);
						}
					});
					// oTable.bindRows({
					// 	path: "/MatterSearchSet",

					//});
				}
			});
			// if (oFilterBar.setBasicSearch) {

			// 	oFilterBar.setBasicSearch(new sap.m.SearchField({
			// 		showSearchButton: sap.ui.Device.system.phone,
			// 		placeholder: "Search",
			// 		search: function(event) {
			// 			var self = that;
			// 			var value = event.getSource().getValue();

			// 			var filters = [];
			// 			var oModel = that.getOwnerComponent().getModel("ZPRS_VALUE_HELP_SRV");
			// 			filters.push(new sap.ui.model.Filter("Pspid", sap.ui.model.FilterOperator.Contains, value));
			// 			oModel.read("/MatterSearchSet", {
			// 				filters: filters,
			// 				success: function(oData) {

			// 					var oRowsModel = new sap.ui.model.json.JSONModel();
			// 					oRowsModel.setData(oData.results);
			// 					self.getModel("InputsModel").setProperty("/Inputs/matterSearch", oData.results);
			// 					self._oValueHelpDialog.getTable().setModel(oRowsModel);
			// 					if (self._oValueHelpDialog.getTable().bindRows) {
			// 						self._oValueHelpDialog.getTable().bindRows("/");
			// 					}

			// 				},
			// 				error: function(err) {
			// 					sap.ui.core.BusyIndicator.hide(0);
			// 				}
			// 			});
			// 		}
			// 	}));
			// }

			this._oValueHelpDialog.setFilterBar(oFilterBar);
			var oColModel = new sap.ui.model.json.JSONModel();
			oColModel.setData({
				cols: [{
					label: "Matter",
					template: "Pspid"
				}, {
					label: "Matter Name",
					template: "Post1"
				}]
			});
			var oTable = this._oValueHelpDialog.getTable();

			oTable.setModel(oColModel, "columns");
			var oModel = this.getOwnerComponent().getModel("ZPRS_VALUE_HELP_SRV");
			oTable.setModel(oModel);
			oTable.bindRows("/")

			this._oValueHelpDialog.open();

		},
		matterSearch: function(evt) {
			var value = evt.getSource().getValue();

			var oTable = this._oValueHelpDialog.getTable();
			// sap.m.MessageToast.show("Search pressed '");
			// oTable.bindRows({
			// 	path: "/MatterSearchSet",
			// 	filters: [
			// 		new sap.ui.model.Filter("Pspid", sap.ui.model.FilterOperator.Contains, value),

			// 	]
			// });
			var that = this;
			var filters = [];
			var oModel = this.getOwnerComponent().getModel("ZPRS_VALUE_HELP_SRV");
			filters.push(new sap.ui.model.Filter("Pspid", sap.ui.model.FilterOperator.Contains, value));
			oModel.read("/MatterSearchSet", {
				filters: filters,
				success: function(oData) {

					var oRowsModel = new sap.ui.model.json.JSONModel();
					oRowsModel.setData(oData.results);
					that.getModel("InputsModel").setProperty("/Inputs/matterSearch", oData.results);
					that._oValueHelpDialog.getTable().setModel(oRowsModel);
					if (that._oValueHelpDialog.getTable().bindRows) {
						that._oValueHelpDialog.getTable().bindRows("/");
					}

				},
				error: function(err) {
					sap.ui.core.BusyIndicator.hide(0);
				}
			});
		},
		// matterNameSearch: function(evt) {
		// 	var value = evt.getSource().getValue();

		// 	var oTable = this._oValueHelpDialog.getTable();
		// 	// sap.m.MessageToast.show("Search pressed '");
		// 	// oTable.bindRows({
		// 	// 	path: "/MatterSearchSet",
		// 	// 	filters: [
		// 	// 		new sap.ui.model.Filter("Post1", sap.ui.model.FilterOperator.Contains, value),

		// 	// 	]
		// 	// });
		// 	var that = this;
		// 	var filters = [];
		// 	var oModel = this.getOwnerComponent().getModel("ZPRS_VALUE_HELP_SRV");
		// 	filters.push(new sap.ui.model.Filter("Post1", sap.ui.model.FilterOperator.EQ, value));
		// 	oModel.read("/MatterSearchSet", {
		// 		filters: filters,
		// 		success: function(oData) {

		// 			var oRowsModel = new sap.ui.model.json.JSONModel();
		// 			oRowsModel.setData(oData.results);
		// 			that.getModel("InputsModel").setProperty("/Inputs/matterNameSearch", oData.results);
		// 			that._oValueHelpDialog.getTable().setModel(oRowsModel);
		// 			if (that._oValueHelpDialog.getTable().bindRows) {
		// 				that._oValueHelpDialog.getTable().bindRows("/");
		// 			}

		// 		},
		// 		error: function(err) {
		// 			sap.ui.core.BusyIndicator.hide(0);
		// 		}
		// 	});
		// },

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
		},

		//apply variant
		applyVariant: function() {
			var that = this;
			setTimeout(function() {
				that.jsonModel.setProperty("/modelData", that.getModel("InputsModel").getProperty("/Inputs/homeTable"));
				var Otablenew = that.getView().byId("WipDetailsSet3");
				Otablenew.bindRows("/modelData");
			}, 1000);
		},

		//column level sorting and filtering
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

					that._oResponsivePopoverTrans.openBy(oTarget);
				}

				if (oKey === "Budat" || oKey === "Cpudt" || oKey === "Bldat") {
					sap.ui.core.Fragment.byId("personalizationDialog1", "filterBox").setVisible(false);
				} else {
					sap.ui.core.Fragment.byId("personalizationDialog1", "filterBox").setVisible(true);
				}

				if (oKey === "Zzphase" || oKey === "Zztskcd" || oKey === "Zzactcd" || oKey === "Zzffactcd" || oKey === "Zzfftskcd") {
					sap.ui.core.Fragment.byId("personalizationDialog1", "sortAsc").setVisible(false);
					sap.ui.core.Fragment.byId("personalizationDialog1", "sortDesc").setVisible(false);
				} else {
					sap.ui.core.Fragment.byId("personalizationDialog1", "sortAsc").setVisible(true);
					sap.ui.core.Fragment.byId("personalizationDialog1", "sortDesc").setVisible(true);
				}

				sap.ui.core.Fragment.byId("personalizationDialog1", "filterValue").setValue(value);
			});
		},
		onAscending: function() {

			var oTable = this.getView().byId("WipDetailsSet3");
			var oItems = oTable.getBinding("items");
			var oBindingPath = this.jsonModel.getProperty("/bindingValue");
			var tableItems = this.getModel("InputsModel").getProperty("/Inputs/globalSearchModel");

			var Data = tableItems.sort(function(a, b) {

				if (oBindingPath === "Megbtr" || oBindingPath === "RateLocl" || oBindingPath === "AmountMatter" || oBindingPath ===
					"AmountLocl" ||
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

			$(".sapMPanelWrappingDivTb ").addClass("sapContrastPlus sapMIBar sapMHeader-CTX");

			this._oResponsivePopoverTrans.close();

		},
		onDescending: function() {

			var oTable = this.getView().byId("WipDetailsSet3");
			var oItems = oTable.getBinding("items");
			var oBindingPath = this.jsonModel.getProperty("/bindingValue");
			var tableItems = this.getModel("InputsModel").getProperty("/Inputs/globalSearchModel");
			var Data = tableItems.sort(function(a, b) {

				if (oBindingPath === "Megbtr" || oBindingPath === "RateLocl" || oBindingPath === "AmountMatter" || oBindingPath ===
					"AmountLocl" ||
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

			$(".sapMPanelWrappingDivTb ").addClass("sapContrastPlus sapMIBar sapMHeader-CTX");

			this._oResponsivePopoverTrans.close();
		},
		onChange: function(oEvent) {

			var InputFields = this.getModel("InputsModel");
			var oTable = this.getView().byId("WipDetailsSet3");
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
			this.jsonModel.setProperty("/RowCount3", results.aIndices.length);
			for (var l = 0; l < results.aIndices.length; l++) {
				var modelData = this.jsonModel.getProperty("/modelData");
				var res = modelData[results.aIndices[l]];
				resArr.push(res);
			}
			this.getModel("InputsModel").setProperty("/Inputs/globalSearchModel", resArr);

			this._oResponsivePopoverTrans.close();

		},

		//consolidate
		onConsolidate: function() {

			var passingArray = [];

			var oModel = this.getOwnerComponent().getModel().sServiceUrl;
			var oModel1 = this.getOwnerComponent().getModel();
			var InputFields = this.getView().getModel("InputsModel");

			var oTable = this.getView().byId("WipDetailsSet3");
			var selectedRows = this.getModel("InputsModel").getProperty("/Inputs/rowLineTransfersCount");

			for (var i = 0; i < selectedRows.length; i++) {
				var ctx = oTable.getSelectedContexts(selectedRows[i]);
				var m = ctx[i].getObject();
				passingArray.push(m);

			}

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

					var selectedLines = that.getModel("InputsModel").getProperty("/Inputs/rowLineTransfersCount");

					if (oData.results.length === 1) {

						var msgTxt = oData.results[0].Message;
						var msgSplit = msgTxt.split(' ');

						for (var k = 0; k < selectedLines.length; k++) {
							var obj = that.getModel("InputsModel").getProperty("/Inputs/homeTable")[selectedLines[k]];

							if (msgSplit[0] !== "ERROR") {

								obj.iconColor = "green";
								obj.iconVisible = true;
								obj.iconTooltip = msgTxt;
							} else {
								obj.iconColor = "red";
								obj.iconVisible = true;
								obj.iconTooltip = msgTxt;
							}
							var results = that.getModel("InputsModel").getProperty("/Inputs/homeTable");
							results[selectedLines[k]] = obj;
							that.jsonModel.setProperty("/modelData", results);

							// oTable.bindRows("/modelData");
						}
					} else {
						for (var i = 0; i < oData.results.length; i++) {
							sap.ui.core.BusyIndicator.hide();

							var context = oTable.getSelectedContexts(selectedLines[i]);
							var obj = context[i].getObject();
							var msgTxt = oData.results[i].Message;

							var msgSplit = msgTxt.split(' ');
							if (msgSplit[0] === "ERROR") {

								obj.iconColor = "red";
								obj.iconVisible = true;
								obj.iconTooltip = msgTxt;

								// oTable.getRows()[selectedLines[i]].getCells()[0].setVisible(true);
								// oTable.getRows()[selectedLines[i]].getCells()[0].setProperty("color", "red");
								// oTable.getRows()[selectedLines[i]].getCells()[0].setTooltip(msgTxt);

							} else {

								obj.iconColor = "green";
								obj.iconVisible = true;
								obj.iconTooltip = msgTxt;

								// oTable.getRows()[selectedLines[i]].getCells()[0].setVisible(true);
								// oTable.getRows()[selectedLines[i]].getCells()[0].setProperty("color", "green");
								// oTable.getRows()[selectedLines[i]].getCells()[0].setTooltip(msgTxt);

							}
							var results = that.getModel("InputsModel").getProperty("/Inputs/homeTable");
							results[selectedLines[i]] = obj;
							that.jsonModel.setProperty("/modelData", results);

							// oTable.bindRows("/modelData");
						}
					}
				}
			});

			InputFields.setProperty("/Inputs/isChanged", false);
			InputFields.setProperty("/Inputs/scope", this.getView().byId("WipDetailsSet3"));

		},

		//split transfer
		onSplitTransfer: function() {

			var oTable = this.getView().byId("WipDetailsSet3");
			this._getSplitDialog().open();
			var idx = this.getModel("InputsModel").getProperty("/Inputs/rowLineTransfersCount");
			var ctx = oTable.getSelectedContexts(idx[0]);
			var obj = ctx[0].getObject();
			var matter = obj.Pspid;
			var quantity = obj.Megbtr;
			this.docno = obj.Belnr;
			var selPhase = obj.Zzphase;
			var selTask = obj.Zztskcd;
			var selAct = obj.Zzactcd;
			var selFfTsk = obj.Zzfftskcd;
			var selFfAct = obj.Zzffactcd;
			this.jsonModel.setProperty("/matter", matter);
			this.jsonModel.setProperty("/quantity", quantity);
			this.jsonModel.setProperty("/docno", this.docno);
			this.jsonModel.setProperty("/selPhase", selPhase);
			this.jsonModel.setProperty("/selTask", selTask);
			this.jsonModel.setProperty("/selAct", selAct);
			this.jsonModel.setProperty("/selFfTsk", selFfTsk);
			this.jsonModel.setProperty("/selFfAct", selFfAct);
			this.createNewtableColumns();
			this.handleAddRow(1);

		},
		_getSplitDialog: function() {

			if (!this._splitDialog) {
				this._splitDialog = sap.ui.xmlfragment("splitTransfer", "zprs.wipeditor.Fragments.splittransfer", this);
				this.getView().addDependent(this._splitDialog);
			}
			return this._splitDialog;
		},
		closeSplitDialog: function() {

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

			var oTbl = sap.ui.core.Fragment.byId("splitTransfer", "splitTable2");
			var columns = this.getView().getModel("InputsModel").getProperty("/Inputs/createcontrols");
			for (var k = 0; k < columns.length; k++) {
				var col = columns[k];
				if (k == columns.length - 2 || k == columns.length - 1) {

					oTbl.addColumn(new sap.m.Column({
						header: new sap.m.Label({
							text: col.userCol,
							design: "Bold",

						}),
						width: "70px"

					}));

				} else {
					oTbl.addColumn(new sap.m.Column({
						header: new sap.m.Label({
							text: col.userCol,
							design: "Bold",

						}),
						width: "130px"

					}));
				}
			}

		},
		handleAddRow: function(count, userObj) {

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
									$(".sapMListTblCell").css('vertical-align', 'middle');

								}
							};
						})(FirstTableitems);
					}
				}
				jQuery.sap.delayedCall(500, this, delayInvk);
			}

		},
		_createTableItemContext: function(data) {

			var sets = "WipDetailsSet";
			var oModel = this.getOwnerComponent().getModel();
			var oContext = oModel.createEntry(sets, {
				properties: data
			});
			return oContext;
		},
		getTableItems: function(items) {

			var oTbl = sap.ui.core.Fragment.byId("splitTransfer", "splitTable2");
			var rows = oTbl.getItems();
			var len = rows.length;
			var newcolumns = this.getView().getModel("InputsModel").getProperty("/Inputs/createcontrols");
			var col = [];
			var currentObj = {};

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

							press: $.proxy(this.onDelete, this),

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

			});

		},
		onAdd: function(oEvt) {

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
			var iRowIndex = 0;
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

		},
		onTransfer: function(oModel) {

			this.cols = [];
			var oTable = sap.ui.core.Fragment.byId("splitTransfer", "splitTable2");
			var rows = oTable.getItems();
			if (rows.length === 1) {
				MessageBox.alert("Please add Matters to Split Transfer.");
			} else {
				for (var i = 0; i < rows.length; i++) {
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
						Belnr: ""
					};
				}
				if (this.cols[0].Pspid != "" && (this.cols[0].Megbtr != "" || this.cols[0].Percent != "")) {
					this.onAdd();
				} else {
					this.cols.splice(0, 1);
				}
				for (var k = 1; k <= this.cols.length; k++) {
					this.cols[k - 1].Counter = k;
				}
				var changedTableData = this.cols;
				this.makeSplitBatchCalls(changedTableData, oModel);

			}
		},
		makeSplitBatchCalls: function(oList, oModel1) {

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

			oFModel.callFunction("/WIPMSPLIT", {
				method: "GET",
				urlParameters: urlParams,
				success: function(oData) {

					sap.ui.core.BusyIndicator.hide();
					var res = oData.results;

					for (var i = 0; i < res.length; i++) {
						that.msgTxt = res[i].Message;
						var cells = rows[i + 1].getCells();
						if (that.msgTxt !== "") {

							var msgSplit = that.msgTxt.split(' ');

							if (msgSplit[0] === "ERROR") {

								cells[9].setProperty("color", "red");
								cells[9].setProperty("visible", true);
								cells[9].setTooltip(that.msgTxt);

							} else {

								cells[9].setProperty("color", "green");
								cells[9].setProperty("visible", true);
								cells[9].setTooltip(that.msgTxt);
							}
						} else {

							cells[9].setProperty("visible", false);
						}
					}

				},
				error: function(oError) {

					sap.ui.core.BusyIndicator.hide();
				}
			});
		},
		splitPhaseCodesChange: function(oEvent) {

			var item = oEvent.getSource().getParent();
			var oTable = sap.ui.core.Fragment.byId("splitTransfer", "splitTable2");
			var idx = oTable.indexOfItem(item);
			var phaseCodeSelected = oEvent.getSource().getSelectedItem().getKey();
			var InputFields = this.getView().getModel("InputsModel");
			var userArray = InputFields.getProperty("/Inputs/Columns");
			var pspid = item.getCells()[0].getValue();

			var that = this;

			$.when(that.serviceInstance.getTaskcodes(that.WipEditModel, phaseCodeSelected, that),
					that.serviceInstance.getActivitycodes(that.WipEditModel, pspid, that))
				.done(function(taskCodes, activityCodes) {

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

			var that = this;
			$.when(that.serviceInstance.getFFActivitycodes(that.WipEditModel, taskCodeSelected, pspid, that))
				.done(function(ffActCodes) {

					ffActCodes.results.unshift("");
					userArray.ffActCodes = ffActCodes.results;
					InputFields.getProperty("/Inputs/Columns")[idx].Zzffactcd = userArray.ffActCodes;
					that.getTableItems();

				});
		},

		//reload table
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
			var table = this.getView().byId("WipDetailsSet3");
			table.setVisible(false);
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

					var oItems = that.getView().byId("WipDetailsSet3").getBinding("items");
					var results = oItems.filter(this.filterArr, "Application");
					that.getView().byId("WipDetailsSet3").removeSelections();

					that.jsonModel.setProperty("/modelData", oData.results);
					that.jsonModel.setProperty("/RowCount3", oData.results.length);

					that.data(oData.results);

					//	sap.ui.core.BusyIndicator.hide(0);

				})
				.fail(function() {

				});

			// var visible = $.extend(true, {}, InputFields.getProperty("/Inputs/DefaultVisible2"));
			// this.jsonModel.setProperty("/visible", visible);
			// var ColumnsItems = $.extend(true, [], InputFields.getProperty("/Inputs/DefaultColumns2"));
			// this.jsonModel.setProperty("/ColumnsItems", ColumnsItems);

			InputFields.setProperty("/Inputs/isChanged", false);
			InputFields.setProperty("/Inputs/scope", "");

			if (this._Dialog) {

				this._Dialog.close();

			}
			InputFields.setProperty("/Inputs/ToolbarEnable/Consolidate", false);
			InputFields.setProperty("/Inputs/ToolbarEnable/Mass_Transfer", false);

			InputFields.setProperty("/Inputs/ToolbarEnable/Split_Transfer", false);
			InputFields.setProperty("/Inputs/ToolbarEnable/LineItemTransferUpdatecodes", false);
			this.transferArray = [];
			this.index = [];
		},

		//codes
		data: function(odata) {

			this.WipEditModel = this.getModel("InputsModel");
			this.serviceInstance = LineItemsServices.getInstance();
			this.getLineItemsData(odata);
		},
		getLineItemsData: function(Rowdata) {

			var Pspid = Rowdata[0].Pspid;

			var that = this;
			sap.ui.core.BusyIndicator.show(0);
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
						lineItems[i].isEditableH = false;
						lineItems[i].isEditableP = false;
						lineItems[i].isEditable = false;
					}
				}
				that.getModel("InputsModel").setProperty("/Inputs/homeTable", lineItems);
				that.getModel("InputsModel").setProperty("/Inputs/globalSearchModel", lineItems);

				for (var i = 0; i < lineItems.length; i++) {
					lineItems[i].iconVisible = false;
					lineItems[i].iconColor = "";
					lineItems[i].iconTooltip = "";
					lineItems[i].isEditableH = false;
					lineItems[i].isEditableP = false;
					lineItems[i].isEditable = false;
				}

				var Otable1 = that.getView().byId("WipDetailsSet3");
				Otable1.setVisible(true);
				that.jsonModel.setProperty("/modelData", lineItems);
				Otable1.setModel(that.jsonModel);
				// Otable1.bindRows("/modelData");

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

			var phaseCodeSelected = oEvent.getSource().getSelectedItem().getKey();
			var pspid = oEvent.getSource().getModel("JSONModel").getData().modelData[idx].ToMatter;
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

			});
			InputFields.setProperty("/Inputs/isChanged", true);
			InputFields.setProperty("/Inputs/scope", this.getView().byId("WipDetailsSet3"));
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
			sap.ui.core.BusyIndicator.show(0);
			var that = this;

			$.when(
				that.serviceInstance.getFFActivitycodes(InputFields, ffTaskcodeselected, pspid, that)
			)

			.done(function(ffActCodes) {

				sap.ui.core.BusyIndicator.hide(0);
				if (that.getModel("InputsModel").getProperty("/Inputs/homeTable").length > 0) {

					var isffact = that.jsonModel.getProperty("/modelData/" + idx + "/Zzffactcd");
					that.jsonModel.setProperty("/modelData/" + idx + "/ffActCodes", isffact.length ? [{
						FfActivityCodeDesc: isffact,
						FfActivityCodeSetDesc: ""
					}].concat(ffActCodes.results) : ffActCodes.results);

				} else {
					that.showAlert("Wip Edit", "No Data Found");
				}

			});
			var InputFields = this.getView().getModel("InputsModel");
			InputFields.setProperty("/Inputs/isChanged", true);
			InputFields.setProperty("/Inputs/scope", this.getView().byId("WipDetailsSet3"));

		},
		CodesChange: function(oEvent) {
			var item = oEvent.getSource().getParent();
			var InputFields = this.getView().getModel("InputsModel");
			// var idx = item.getIndex();
			// var indexes = InputFields.getProperty("/Inputs/indexes");
			// indexes.push(idx);

			InputFields.setProperty("/Inputs/isChanged", true);
			InputFields.setProperty("/Inputs/scope", this.getView().byId("WipDetailsSet2"));
		},

		//mass transfer
		handleChange: function(evt) {

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

			if (evt.getParameter("value")) {
				Model.setProperty(aPath + "/" + oSource.getBindingPath('value'), evt.getParameter("value"));

			} else {
				Model.setProperty(aPath + "/" + oSource.getBindingPath('value'), evt.getParameter("value"));

			}
			jQuery.sap.delayedCall(500, this, delayInvk);

		},
		onMassTransfer: function() {

			var odialog = this._getDialogmass();

			odialog.open();
			var oTable = this.getView().byId("WipDetailsSet3");
			var ofrag = sap.ui.core.Fragment.byId("masstransfer", "masstransfertable");
			var oTbl = sap.ui.core.Fragment.byId("masstransfer", "matter");
			var len = oTbl.getColumns().length;

			if (len > 0) {
				var oModel = oTbl.getModel();
				var aItems = oTbl.getItems();
				oModel.setProperty(aItems[0].getBindingContext().getPath() + "/Pspid", "");
			}

			if (len === 0) {
				var columns = this.getView().getModel("InputsModel").getProperty("/Inputs/createMatter");

				for (var k = 0; k < columns.length; k++) {
					var col = columns[k];
					oTbl.addColumn(new sap.m.Column({
						header: [new sap.m.Label({
							text: "Target Matter:",
							design: "Bold"

						})]

					}));
					oTbl.addColumn(new sap.m.Column({
						header: [new sap.m.Label({
							text: " Percentage:",
							design: "Bold"

						})]

					}));

				}
				this.handleAddRowMass(1);
			}
			var selindexes = this.getModel("InputsModel").getProperty("/Inputs/rowLineTransfersCount");
			var selindex = [];
			selindex.push(selindexes);
			this.getModel("InputsModel").setProperty("/Inputs/indexes", selindex);

			$.each(selindexes, function(i, o) {

				var tableContext = oTable.getSelectedContexts(i);
				var obj = tableContext[i].getObject();

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
							icon: "sap-icon://delete",
							type: "Reject",
							press: function(oEvent) {
								var tbl = sap.ui.core.Fragment.byId("masstransfer", "masstransfertable");
								var src = oEvent.getSource().getParent();
								var rowid = src.getId();

								var dialog = new Dialog({
									title: 'Warning',
									type: 'Message',
									state: 'Warning',
									content: new Text({
										text: 'Are you sure do you want to delete?'
									}),
									beginButton: new Button({
										text: 'OK',
										type: "Accept",
										press: function() {
											tbl.removeItem(rowid);
											dialog.close();
										}
									}),
									endButton: new Button({
										text: 'Cancel',
										type: "Reject",
										press: function() {
											dialog.close();
										}
									}),
									afterClose: function() {
										dialog.destroy();
									}
								});

								dialog.open();
								// MessageBox.warning(

								// 	"Are you sure do you want ot delete?", {
								// 		actions: [sap.m.MessageBox.Action.OK, sap.m.MessageBox.Action.CANCEL],

								// 		onClose: function(sAction) {
								// 			if (sAction === "OK") {
								// 				tbl.removeItem(rowid);
								// 			}

								// 		}
								// 	}
								// );

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
						id: "masspspid",
						change: $.proxy(this.handleChange, this)
					});
					var field1 = new sap.m.Input({
						id: "percentage",
						value: "100",

					});
					cols.push(field);
					cols.push(field1);
				}
			}
			var tableitems = new sap.m.ColumnListItem({
				cells: cols
			});

			return tableitems;
		},
		_getDialogmass: function() {
			if (!this._omassDialog) {
				this._omassDialog = sap.ui.xmlfragment("masstransfer", "zprs.wipeditor.Fragments.masstransfer", this);
				this.getView().addDependent(this._omassDialog);

			}
			return this._omassDialog;
		},
		closemassDialog: function() {

			var oTb2 = sap.ui.core.Fragment.byId("masstransfer", "matter");
			oTb2.getItems()[0].getCells()[1].setValue("100");
			var tbl = sap.ui.core.Fragment.byId("masstransfer", "masstransfertable");
			$.each(tbl.getItems(), function(i, o) {
				var rowid = o.getId();
				tbl.removeItem(rowid);
			});

			var oTbl = sap.ui.core.Fragment.byId("masstransfer", "matter");
			var oModel = oTbl.getModel();
			var aItems = oTbl.getItems();
			oModel.setProperty(aItems[0].getBindingContext().getPath() + "/Pspid", "");

			this._omassDialog.close();

		},
		onmassTransferchange: function() {

			var oTbl = sap.ui.core.Fragment.byId("masstransfer", "matter");
			var matter = oTbl.getItems()[0].getCells()[0].getValue();
			this.WipEditModel = this.getModel("InputsModel");
			var data = this.WipEditModel.getProperty("/Inputs/homeTable");

			this.serviceInstance = LineItemsServices.getInstance();
			var percent = oTbl.getItems()[0].getCells()[1].getValue();
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
			var selectindex = this.getModel("InputsModel").getProperty("/Inputs/rowLineTransfersCount");
			var index = [];
			var index = this.getModel("InputsModel").getProperty("/Inputs/rowLineTransfersCount");
			index = this.removeDups(index);
			this.index = this.index.concat(index);
			for (var i = 0; i < index.length; i++) {
				var obj = this.getModel("InputsModel").getProperty("/Inputs/homeTable")[index[i]];
				this.transferArray.push(obj);
			}
			this.getModel("InputsModel").setProperty("/Inputs/indexes", this.index);
			if (matter != "") {
				var Pspid = matter;
				var lineItems = data;
				var that = this;

				$.when(
					that.serviceInstance.getPhaseCodes(that.WipEditModel, Pspid, that),
					that.serviceInstance.getTaskcodes(that.WipEditModel, "", that),
					that.serviceInstance.getActivitycodes(that.WipEditModel, Pspid, that),
					that.serviceInstance.getFFtaskcodes(that.WipEditModel, Pspid, that),
					that.serviceInstance.getFFActivitycodes(that.WipEditModel, "", Pspid, that))

				.done(function(phaseCodes, taskCodes, activityCodes, ffTskCodes, ffActCodes) {

					$.each(selectindex, function(j, o) {

						var ctx = oTable.getSelectedContexts();
						var m = ctx[j].getObject();
						// ctx[j].getModel().setProperty(ctx[j].getPath() + "/ToMatter", matter);
						var docno = m.Belnr;
						check = Docno.includes(docno);
						if (check) {

							lineItems[o].ToMatter = matter;
							lineItems[o].Percent = percent;
							lineItems[o].phaseCodes = lineItems[o].Zzphase.length ? [{
								Phasecode: lineItems[o].Zzphase,
								PhasecodeDesc: ""
							}].concat(phaseCodes.results) : phaseCodes.results;
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
							if (lineItems[o].Matnr === "HARDCOST") {
								lineItems[o].isEditable = true;
								lineItems[o].isEditableP = true;
								lineItems[o].isEditableH = false;

							} else {
								lineItems[o].isEditable = true;
								lineItems[o].isEditableP = true;
								lineItems[o].isEditableH = true;
							}

						} else {

							var indes = selectindex.indexOf(o);
							selectindex[indes] = " ";
						}

					});
					that.jsonModel.setProperty("/modelData", lineItems);

					that.getView().byId("WipDetailsSet3").setModel(that.jsonModel);
					// oTable.bindRows("/modelData");

					for (var s = 0; s < selectindex.length; s++) {

						var value = selectindex[s];
						if (value !== "") {
							oTable.setSelectedItem(value);
						}

					}

					that.onEditTable(selectindex);
				});
				that.closemassDialog();
			} else {

				MessageBox.show(
					"Please enter Target Matter before transfer.", {

						actions: [sap.m.MessageBox.Action.OK]
					}
				);

			}
			var InputFields = this.getView().getModel("InputsModel");
			InputFields.setProperty("/Inputs/ToolbarEnable/LineItemTransferUpdatecodes", true);

			sap.ui.core.Fragment.byId("masstransfer", "percentage").setValue("100");
			var tbl = sap.ui.core.Fragment.byId("masstransfer", "masstransfertable");
			$.each(tbl.getItems(), function(i, o) {
				var rowid = o.getId();
				tbl.removeItem(rowid);
			});

			InputFields.setProperty("/Inputs/isChanged", true);
			InputFields.setProperty("/Inputs/scope", this.getView().byId("WipDetailsSet3"));

		},
		onEditTable: function(selindexes) {

			var InputFields = this.getView().getModel("InputsModel");

			var oView = this.getView(),
				oTable = oView.byId("WipDetailsSet3");

			for (var i = 0; i < selindexes.length; i++) {
				var value = selindexes[i];
				if (value !== " ") {
					var ctx = oTable.getSelectedContexts(i);

					var m = ctx[i].getModel(ctx[i].getPath());
					m.setProperty(ctx[i].getPath() + "/Edit", true);
					m.setProperty(ctx[i].getPath() + "/isEditableH", false);
					// 					oTable.addSelectionInterval(value, value);

				}
			}

		},

		//update codes
		onUpdateCodes: function() {

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

			var indexes = this.getModel("InputsModel").getProperty("/Inputs/indexes");

			for (var j = 0; j < this.aIndices.length; j++) {
				indexes.push(this.aIndices[j]);
			}

			var sMsg;
			var check = false;
			if (this.aIndices.length < 1) {
				sMsg = "Please Select Atleast One item";
				this.showAlert("WIP Edit", sMsg);

			} else {

				var oView = this.getView();

				var Tomatters = tomatters;
				var check = false;

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

					MessageBox.alert("please check the matter number");
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
					this.selectedRows.setProperty("/phaseCodes", selectedrow.phaseCodes);
					this.selectedRows.setProperty("/taskCodes", selectedrow.taskCodes);
					this.selectedRows.setProperty("/actCodes", selectedrow.actCodes);
					this.selectedRows.setProperty("/ffTskCodes", selectedrow.ffTskCodes);
					this.selectedRows.setProperty("/ffActCodes", selectedrow.ffActCodes);
					this.selectedRows.setProperty("/rowData", selectedrow);

					this._transferUpdateCodesDialog.setModel(this.selectedRows, "updatesCodesModel1");

				}
			}

		},
		_gettransferupdateCodesDialog: function() {
			if (!this._transferUpdateCodesDialog) {
				this._transferUpdateCodesDialog = sap.ui.xmlfragment("update", "zprs.wipeditor.Fragments.LineitemTransferDialog", this.getView()
					.getController());
			}
			return this._transferUpdateCodesDialog;

		},
		UpdateCodesCancel: function() {

			this._transferUpdateCodesDialog.close();

		},
		UpdateCodes: function() {

			this.UpdateCodesCancel();

			var i = 1;
			var selectedLines = this.aIndices;
			this.index = this.aIndices;
			for (var j = 0; j < this.index.length; j++) {
				var obj = this.getModel("InputsModel").getProperty("/Inputs/homeTable")[this.index[j]];
				this.transferArray.push(obj);
			}

			for (var c = 0; c < selectedLines.length; c++) {

				var phaseCodeChk = sap.ui.core.Fragment.byId("update", "phaseCodeChk" + i).getSelected();
				var taskCodeChk = sap.ui.core.Fragment.byId("update", "taskCodeChk" + i).getSelected();
				var ActivityCodeChk = sap.ui.core.Fragment.byId("update", "ActivityCodeChk" + i).getSelected();
				var FFTaskCodeChk = sap.ui.core.Fragment.byId("update", "FFTaskCodeChk" + i).getSelected();
				var FFActCodeChk = sap.ui.core.Fragment.byId("update", "FFActCodeChk" + i).getSelected();

				if (phaseCodeChk === true) {

					this.jsonModel.setProperty("/modelData/" + selectedLines[c] + "/taskCodes", this.selectedRows.getProperty(
						"/taskCodes"));
					this.jsonModel.setProperty("/modelData/" + selectedLines[c] + "/phaseCodes", this.selectedRows.getProperty(
						"/phaseCodes"));
					this.jsonModel.setProperty("/modelData/" + selectedLines[c] + "/selectedPhaseCode", sap.ui.core.Fragment.byId(
						"update",
						"selectedPhaseCode" + i).getSelectedKey());

				}
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

		},
		UpdateCodesphasecodechange: function(oEvent) {

			var InputFields = this.getView().getModel("InputsModel");

			var phaseCodeSelected = oEvent.getSource().getSelectedItem().getKey();
			// var pspid = InputFields.getProperty("/Inputs/rootPspid");

			var pspid = InputFields.getProperty("/Inputs/homeTable")[this.aIndices[0]].ToMatter;

			var that = this;

			$.when(that.serviceInstance.getTaskcodes(InputFields, phaseCodeSelected, that),
					that.serviceInstance.getActivitycodes(InputFields, pspid, that),
					that.serviceInstance.getFFtaskcodes(InputFields, pspid, that))
				.done(function(taskCodes, activityCodes, ffTskCodes) {
					that.selectedRows.setProperty("/taskCodes", taskCodes.results);
					that.selectedRows.setProperty("/actCodes", activityCodes.results);
					that.selectedRows.setProperty("/ffTskCodes", ffTskCodes.results);

				});
		},
		UpdateCodesffTaskcodechange: function(oEvent) {

			var ffTaskcodeselected = oEvent.getSource().getSelectedItem().getKey();

			var InputFields = this.getView().getModel("InputsModel");
			var pspid = InputFields.getProperty("/Inputs/rootPspid");
			sap.ui.core.BusyIndicator.show(0);
			var that = this;
			this.serviceInstance = LineItemsServices.getInstance();

			$.when(
				that.serviceInstance.getFFActivitycodes(InputFields, ffTaskcodeselected, pspid, that)
			)

			.done(function(updateffActCodes) {

				that.selectedRows.setProperty("/ffActCodes", updateffActCodes.results);

			});
		},

		//tomatter change
		changeTransferToMatter: function(oEvent) {

			// var InputFields = this.getModel("InputsModel");
			// InputFields.setProperty("/Inputs/ToolbarEnable/LineItemTransferUpdatecodes", true);
			// var home = InputFields.getProperty("/Inputs/homeTable");

			// var oTable = this.getView().byId("WipDetailsSet3");
			// this.WipEditModel = this.getModel("InputsModel");
			if (oEvent.sId === "change") {
				var item = oEvent.getSource().getParent().getBindingContextPath();
			} else {
				var item = oEvent.getParent().getBindingContextPath();
			}
			var srt = item.split("/");

			var idx = srt[srt.length - 1];

			// var InputFields = this.getView().getModel("InputsModel");
			// var indexes = [];

			// indexes.push(idx);

			// this.jsonModel.setProperty("/modelData", home);

			// this.index = this.index.concat(indexes);

			// var indexes = InputFields.getProperty("/Inputs/indexes");
			// indexes.push(idx);
			// indexes = this.removeDups(this.index);
			// InputFields.setProperty("/Inputs/indexes", indexes);
			//var obj = oEvent.getSource().getModel("JSONModel").getData().modelData[idx];

			var obj = this.jsonModel.getData()["modelData"][idx];
			// this.transferArray.push(obj);
			var matter = obj.ToMatter;

			if (matter !== "") {
				var Pspid = matter;
				var lineItems = this.getModel("InputsModel").getProperty("/Inputs/homeTable");
				var that = this;
				this.serviceInstance = LineItemsServices.getInstance();
				$.when(
					that.serviceInstance.getPhaseCodes(that.WipEditModel, Pspid, that),
					that.serviceInstance.getTaskcodes(that.WipEditModel, "", that),
					that.serviceInstance.getActivitycodes(that.WipEditModel, Pspid, that),
					that.serviceInstance.getFFtaskcodes(that.WipEditModel, Pspid, that),
					that.serviceInstance.getFFActivitycodes(that.WipEditModel, "", Pspid, that))

				.done(function(phaseCodes, taskCodes, activityCodes, ffTskCodes, ffActCodes) {

					lineItems[idx].ToMatter = matter;
					lineItems[idx].phaseCodes = lineItems[idx].Zzphase.length ? [{
						Phasecode: lineItems[idx].Zzphase,
						PhasecodeDesc: ""
					}].concat(phaseCodes.results) : phaseCodes.results;
					lineItems[idx].taskCodes = lineItems[idx].Zztskcd.length ? [{
						TaskCodes: "",
						TaskCodeDesc: ""
					}].concat(taskCodes.results) : taskCodes.results;
					lineItems[idx].actCodes = lineItems[idx].Zzactcd.length ? [{
						ActivityCodes: "",
						ActivityCodeDesc: ""
					}].concat(activityCodes.results) : activityCodes.results;
					lineItems[idx].ffTskCodes = lineItems[idx].Zzfftskcd.length ? [{
						FfTaskCodes: "",
						FfTaskCodeDesc: ""
					}].concat(ffTskCodes.results) : ffTskCodes.results;
					lineItems[idx].ffActCodes = lineItems[idx].Zzffactcd.length ? [{
						FfActivityCodes: "",
						FfActivityCodeDesc: ""
					}].concat(ffActCodes.results) : ffActCodes.results;
					lineItems[idx].index = idx;
					lineItems[idx].indeces = idx;
					lineItems[idx].isRowEdited = true;
					// lineItems[idx].isEditable = true;
					// 	lineItems[idx].isEditableH = true;
					// 		lineItems[idx].isEditableP = true;

					// if (lineItems[idx].Percent === "" && lineItems[idx].Quantity === "0.000") {
					// 	lineItems[idx].isEditableP = true;
					// 	lineItems[idx].isEditableH = true;
					// } else if (lineItems[idx].Percent !== "" && lineItems[idx].Quantity === "0.000") {
					// 	lineItems[idx].isEditableP = true;
					// 	lineItems[idx].isEditableH = false;
					// } else {
					// 	lineItems[idx].isEditableP = false;
					// 	lineItems[idx].isEditableH = true;
					// }

					that.jsonModel.setProperty("/modelData", lineItems);
					that.getView().byId("WipDetailsSet3").setModel(that.jsonModel);
					// 					oTable.bindRows("/modelData");

				});
			}

			InputFields.setProperty("/Inputs/isChanged", true);
			InputFields.setProperty("/Inputs/scope", this.getView().byId("WipDetailsSet3"));

		},

		suggest: function(oEvent) {
			var InputFields = this.getView().getModel("InputsModel");
			var home = InputFields.getProperty("/Inputs/homeTable");

			this.WipEditModel = this.getModel("InputsModel");
			var item = oEvent.getSource().getParent().getBindingContextPath();
			var srt = item.split("/");

			var idx = srt[srt.length - 1];

			var indexes = [];

			indexes.push(idx);
			this.index = this.index.concat(indexes);
			var obj = this.jsonModel.getData()["modelData"][idx];
			this.transferArray.push(obj);

			var value = oEvent.getSource().getValue();

			for (var i = 0; i < indexes.length; i++) {
				if (value === "") {
					var logchk = 1;
					home[idx].ToMatter = value;
					this.jsonModel.getProperty("/modelData")[idx].Percent = "";
					this.jsonModel.getProperty("/modelData")[idx].Quantity = "";
					home[idx].isEditable = false;
					home[idx].isEditableH = false;
					home[idx].isEditableP = false;

					home.forEach(function(item) {
						if (item.ToMatter.trim()) {
							logchk = 0;
						}
					});
					if (logchk) {
						InputFields.setProperty("/Inputs/ToolbarEnable/LineItemTransferUpdatecodes", false);
					}

				} else {
					InputFields.setProperty("/Inputs/ToolbarEnable/LineItemTransferUpdatecodes", true);
					home[idx].ToMatter = value;
					if (home[idx].Matnr === "HARDCOST") {
						home[idx].isEditable = true;
						home[idx].isEditableH = false;
						home[idx].isEditableP = true;

					} else {
						home[idx].isEditable = true;
						home[idx].isEditableH = true;
						home[idx].isEditableP = true;
					}
				}
			}

			//	 oEvent.getSource().applyFocusInfo(5);
			var oItem = this.getView().byId("WipDetailsSet3").getItems()[idx];
			var oFocusInfo = oItem.getCells()[1].getFocusInfo();
			this.jsonModel.setProperty("/modelData", home);

			var oTable = this.getView().byId("WipDetailsSet3");

			InputFields.setProperty("/Inputs/scope", this.getView().byId("WipDetailsSet3"));

			var oItem = this.getView().byId("WipDetailsSet3").getItems()[idx];
			oItem.getCells()[1].$().find('input').focus();

			// var oFocusInfo = oItem.getCells()[1].getFocusInfo();

			// var sText = oItem.getCells()[1].$().find('input').val();

			// oFocusInfo.cursorPos = sText.length;
			// oFocusInfo.selectionEnd = sText.length;
			// oFocusInfo.selectionStart = sText.length;

			oItem.getCells()[1].applyFocusInfo(oFocusInfo);

			var that = this;
			this.getView().byId("ToMatter").attachSubmit(function() {
				if (value.trim().length > 0) {
					that.changeTransferToMatter(this);

				}

			});

		},
		changeTransferQuantity: function(oEvent, oModel) {

			this.valueModifyedQuantity = oEvent.getParameter("value");
			var item = oEvent.getSource().getParent().getBindingContextPath();
			var srt = item.split("/");

			var idx = srt[srt.length - 1];

			var InputFields = this.getView().getModel("InputsModel");
			var indexes = [];

			indexes.push(idx);
			var hometable = this.getModel("InputsModel").getProperty("/Inputs/homeTable");
			for (var i = 0; i < indexes.length; i++) {
				var obj = this.getModel("InputsModel").getProperty("/Inputs/homeTable")[indexes[i]];
				obj.Quantity = this.valueModifyedQuantity;
				hometable[idx] = obj;

			}
			var value = oEvent.getSource().getValue();
			if (value) {
				hometable[idx].isEditableP = false;
			} else {
				hometable[idx].isEditableP = true;
			}

			this.jsonModel.setProperty("/modelData", hometable);
			var InputFields = this.getView().getModel("InputsModel");
			InputFields.setProperty("/Inputs/isChanged", true);
			InputFields.setProperty("/Inputs/scope", this.getView().byId("WipDetailsSet3"));

			var oItem = this.getView().byId("WipDetailsSet3").getItems()[idx];
			oItem.getCells()[3].$().find('input').focus();

			var oFocusInfo = oItem.getCells()[3].getFocusInfo();

			var sText = oItem.getCells()[3].$().find('input').val();

			oFocusInfo.cursorPos = sText.length;
			oFocusInfo.selectionEnd = sText.length;
			oFocusInfo.selectionStart = sText.length;
			oItem.getCells()[3].applyFocusInfo(oFocusInfo);

		},
		changeTransferPercentage: function(oEvent, oModel) {

			this.valueModifyedPercent = oEvent.getParameter("value");
			var item = oEvent.getSource().getParent().getBindingContextPath();
			var srt = item.split("/");

			var idx = srt[srt.length - 1];

			var InputFields = this.getView().getModel("InputsModel");
			var indexes = [];

			indexes.push(idx);
			var hometable = this.getModel("InputsModel").getProperty("/Inputs/homeTable");
			for (var i = 0; i < indexes.length; i++) {
				var obj = this.getModel("InputsModel").getProperty("/Inputs/homeTable")[indexes[i]];
				obj.Percent = this.valueModifyedPercent;
				hometable[idx] = obj;

			}
			var value = oEvent.getSource().getValue();
			if (value) {

				hometable[idx].isEditableH = false;
			} else {

				if (hometable[idx].Matnr === "HARDCOST") {

					hometable[idx].isEditableH = false;

				} else {

					hometable[idx].isEditableH = true;

				}

			}

			this.jsonModel.setProperty("/modelData", hometable);
			var InputFields = this.getView().getModel("InputsModel");

			InputFields.setProperty("/Inputs/isChanged", true);
			InputFields.setProperty("/Inputs/scope", this.getView().byId("WipDetailsSet3"));

			var oItem = this.getView().byId("WipDetailsSet3").getItems()[idx];
			oItem.getCells()[2].$().find('input').focus();

			var oFocusInfo = oItem.getCells()[2].getFocusInfo();

			var sText = oItem.getCells()[2].$().find('input').val();

			oFocusInfo.cursorPos = sText.length;
			oFocusInfo.selectionEnd = sText.length;
			oFocusInfo.selectionStart = sText.length;
			oItem.getCells()[2].applyFocusInfo(oFocusInfo);

		},

		//lineitemtransfers save
		removeDups: function(indexs) {
			var unique = {};
			indexs.forEach(function(i) {
				if (!unique[i]) {
					unique[i] = true;
				}
			});
			return Object.keys(unique);
		},
		onLineItemTransfersSave: function() {

			var InputFields = this.getModel("InputsModel");
			// var indexes = InputFields.getProperty("/Inputs/indexes");
			this.index = this.removeDups(this.index);
			if (this.index.length === 0) {

				MessageBox.show(
					"No changes exists please verify and save!", {
						title: "Line Item Transfers",
						actions: [sap.m.MessageBox.Action.OK],
						onClose: function(oAction) {
							if (oAction === "OK") {

							}

						}
					}
				);

			} else {
				this.transferArray = [];
				for (var i = 0; i < this.index.length; i++) {
					var obj = this.jsonModel.getData()["modelData"][this.index[i]];
					this.transferArray.push(obj);
				}

				var oTable = this.getView().byId("WipDetailsSet3");

				var oBinding = oTable.getBinding("rows");

				this.selectedIndexTransferSave = [];
				this.ctxTransferSave = [];
				this.mTransferSave = [];

				// this.selectedIndexTransferSave = this.index;

				// this.ctxTransferSave = oTable.getSelectedContexts();
				// if (this.ctxTransferSave.length != 0) {
				// 	for (var i = 0; i < this.ctxTransferSave.length; i++) {
				// 		this.transferArray.push(this.ctxTransferSave[i].getObject());
				// 	}
				// } else {
				// 	this.transferArray = this.transferArray;
				// }

				// for (var q = 0; q < this.transferArray.length; q++) {
				if ((this.transferArray[0].Percent === "" || this.transferArray[0].Percent === "0.000") && (this.transferArray[0].Quantity === "" ||
						this.transferArray[0].Quantity === "0.000")) {

					MessageBox.show(
						"Enter either Percentage or hours", {
							title: "Line Item Transfers",
							actions: [sap.m.MessageBox.Action.OK],
							onClose: function(oAction) {
								if (oAction === "OK") {

								}

							}
						}
					);

				} else {
					this.TransferSave(this.transferArray);
				}
				//	}

			}

			//	}

		},
		TransferSave: function(oList) {

			var that = this;
			var InputFields = this.getModel("InputsModel");
			var indexes = this.index;
			// this.idxToPass = indexes.concat(this.selectedIndexTransferSave);

			var finalArray;
			finalArray = oList;
			if (this.index.length === 0) {
				MessageBox.show(
					"No changes exists please verify and save.", {
						icon: sap.m.MessageBox.Icon.INFORMATION,
						title: "Line Item Edits",
						actions: [sap.m.MessageBox.Action.OK]
					}
				);
			}

			this.uniqueIdTransfer = [];
			this.idxToPass = [];

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
				Hours.push(o.Quantity);
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

					var res = oData.results;
					var tableLineEdits = that.getView().byId("WipDetailsSet3");

					var selectedLines = that.index;

					sap.ui.core.BusyIndicator.hide(0);

					for (var i = 0; i < res.length; i++) {
						var obj = that.getModel("InputsModel").getProperty("/Inputs/homeTable")[that.index[i]];

						var msgTxt = res[i].Message;
						var msgSplit = msgTxt.split(' ');
						if (msgSplit[0] === "ERROR") {

							obj.iconColor = "red";
							obj.iconVisible = true;
							obj.iconTooltip = msgTxt;

						} else {

							obj.iconColor = "green";
							obj.iconVisible = true;
							obj.iconTooltip = msgTxt;

						}

						var results = that.getModel("InputsModel").getProperty("/Inputs/homeTable");
						results[selectedLines[i]] = obj;
						that.jsonModel.setProperty("/modelData", results);

					}

					that.index = [];

				},
				error: function(err) {
					sap.ui.core.BusyIndicator.hide(0);
				}

			});
			var InputFields = this.getView().getModel("InputsModel");
			InputFields.setProperty("/Inputs/isChanged", false);
			finalArray = [];
			this.transferArray = [];

		},

		//transfers selection
		LineItemTransfersSelection: function(oEvent) {

			var otable = this.byId("WipDetailsSet3");
			var item = this.byId("WipDetailsSet3").getSelectedItems();
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
			var data = InputFields.getProperty("/Inputs/homeTable");

			this.getModel("InputsModel").setProperty("/Inputs/rowLineTransfersCount", index);

			if (index.length === 1) {
				for (var j = 0; j < index.length; j++) {

			
				if (data[index].Matnr === "HARDCOST") {
					InputFields.setProperty("/Inputs/ToolbarEnable/Consolidate", false);
					InputFields.setProperty("/Inputs/ToolbarEnable/Mass_Transfer", true);

					InputFields.setProperty("/Inputs/ToolbarEnable/Split_Transfer", false);
				} 
				else {
					InputFields.setProperty("/Inputs/ToolbarEnable/Consolidate", false);
					InputFields.setProperty("/Inputs/ToolbarEnable/Mass_Transfer", true);

					InputFields.setProperty("/Inputs/ToolbarEnable/Split_Transfer", true);
				}
				}

			} else if (index.length > 1) {
				

				InputFields.setProperty("/Inputs/ToolbarEnable/Consolidate", true);
				InputFields.setProperty("/Inputs/ToolbarEnable/Mass_Transfer", true);

				InputFields.setProperty("/Inputs/ToolbarEnable/Split_Transfer", false);

			} else {

				InputFields.setProperty("/Inputs/ToolbarEnable/Consolidate", false);
				InputFields.setProperty("/Inputs/ToolbarEnable/Mass_Transfer", false);

				InputFields.setProperty("/Inputs/ToolbarEnable/Split_Transfer", false);

			}

		},

		//globalsearch
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

			var otable = this.byId("WipDetailsSet3");

			this.jsonModel.setProperty("/modelData",result);
			this.getModel("InputsModel").setProperty("/Inputs/globalSearchModel", result);
			this.getModel("InputsModel").setProperty("/Inputs/globalSearchModel", result);
		

			var visible = this.getModel("InputsModel").getProperty("/Inputs/visible2");
			this.jsonModel.setProperty("/visible", visible);

			var ColumnsItems = this.getModel("InputsModel").getProperty("/Inputs/ColumnsItems2");
			this.jsonModel.setProperty("/ColumnsItems", ColumnsItems);
	otable.setModel(this.jsonModel);
			// otable.bindRows("/modelData");
			var len = this.jsonModel.getProperty("/modelData").length;
			this.jsonModel.setProperty("/RowCount3", len);

		},

		//export lineitem transfer data
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

			// var columnsArray = enableColumns.concat("Zzphase", "Zztskcd", "Zzactcd", "Zzfftskcd",
			// 	"Zzffactcd");
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

				};
				if (dateFields.includes(trimmedKey)) {
					obj.format = {
						style: 'medium',
						UTC: true
					};
					obj.type = "date";
					obj.textAlign = 'begin';
				}
				//&& obj.label !== "Hours/Quantity" -- > Quantity

				if (obj.label !== "Info" && obj.property !== "ToMatter" && obj.label !== "Percentage" && obj.property !== "Quantity") {
					arr.push(obj);
				}
				if (colE === columnsArray.length - 1) {
					return arr;
				}
			}

		},
		ExportLineItem: function(Event) {

			var tableId = this.getView().byId("WipDetailsSet3");

			var aCols, oSettings, oExcelDate, oDateFormat, oExcelFileName, oExportData;
			aCols = this.createColumnConfig1(tableId);
			// if (tableId.getId().substring(12) === "homeTable") {
			// 	oExportData = this.getView().getModel("InputsModel").getProperty("/Inputs/results");
			// } else {
			// 	oExportData = this.getView().getModel("InputsModel").getProperty("/Inputs/LineitemsCopy");
			// }
			oExportData = this.getView().getModel("InputsModel").getProperty("/Inputs/globalSearchModel");
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
			aFilter.push(new Filter("ContId", "EQ", "S2C.WIPEDITOR.LITRANSFER"));
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

						$("#" + that.getView().getId() + "--variant-trigger-inner").click(function() {

							that.getView().byId("variant").oVariantSave.setVisible(false);
						});

						$("#" + that.getView().getId() + "--variant-text-inner").click(function() {

							that.getView().byId("variant").oVariantSave.setVisible(false);
						});

					}
					var oHeader = that.byId("WipDetailsSet3").getColumns();

					for (var i = 0; i < oHeader.length; i++) {
						var oID = oHeader[i].sId;
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
			aFilter.push(new Filter("ContId", "EQ", "S2C.WIPEDITOR.LITRANSFER"));
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
			var oHeader = that.byId("WipDetailsSet3").getColumns();

			for (var i = 0; i < oHeader.length; i++) {
				var oID = oHeader[i].sId;
				that.onClick(oID);
			}
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
			var ContId = "S2C.WIPEDITOR.LITRANSFER";
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
			var ContId = "S2C.WIPEDITOR.LITRANSFER";
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

});