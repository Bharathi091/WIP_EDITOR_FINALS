/*global history */
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
	'sap/ui/model/Sorter',
	
	'sap/m/Dialog'
], function(Controller, Filter, JSONModel, ReportModel, FilterOperator, formatter, LineItemsServices, SplitItemsServices, MessageBox,
	Sorter,
	 Dialog) {
	"use strict";

	return Controller.extend("zprs.wipeditor.controller.BaseController", {
		/**
		 * Convenience method for accessing the router in every controller of the application.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */

		onInit: function() {

			this.jsonModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.jsonModel, "JSONModel");

			this.setModel(new ReportModel().getModel(), "InputsModel");

			this.table = "";
			this.filterArr = [];

			this.byId("smartTable_ResponsiveTable0").setIgnoreFromPersonalisation(this.getView().getModel("InputsModel").getProperty(
				"/settings/ignoreColumns"));

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

		getRouter: function() {
			return this.getOwnerComponent().getRouter();
		},

		/**
		 * Convenience method for getting the view model by name in every controller of the application.
		 * @public
		 * @param {string} sName the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function(sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model in every controller of the application.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function(oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Convenience method for getting the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Event handler for navigating back.
		 * It there is a history entry or an previous app-to-app navigation we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the master route.
		 * @public
		 */
		onNavBack: function() {
			var sPreviousHash = History.getInstance().getPreviousHash(),
				oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");

			if (sPreviousHash !== undefined || !oCrossAppNavigator.isInitialNavigation()) {
				history.go(-1);
			} else {
				this.getRouter().navTo("master", {}, true);
			}
		},

		//go button enable
		filterChangeData: function(evt) {

			var smartFilterBar = this.getView().byId("SmartFilterBar");

			var filters = smartFilterBar.getFilters();
			if (filters.length !== 0) {

				if (filters[0].hasOwnProperty("sPath")) {

					smartFilterBar.setSearchEnabled(false);
					var keyVal = smartFilterBar.getControlByKey("MpatnerParvw").getProperty("selectedKey");

					if (keyVal) {
						smartFilterBar.setSearchEnabled(true);
					} else {
						smartFilterBar.setSearchEnabled(false);
					}

				} else {
					smartFilterBar.setSearchEnabled(true);
				}
			}

		},
		businessPartnerTypeChange: function() {

			var smartFilterBar = this.getView().byId("SmartFilterBar");
			var keyVal = smartFilterBar.getControlByKey("MpatnerParvw").getProperty("selectedKey");

			if (keyVal) {
				smartFilterBar.setSearchEnabled(true);
			} else {
				smartFilterBar.setSearchEnabled(false);
			}

		},

		//masterpages list search
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

		//settings
		onSettingsopen: function() {

			var odialog = this._getsettingsDialogbox();

			odialog.open();

			odialog._headerTitle.setText("View Settings");

			var orderedData = this.jsonModel.getProperty("/ColumnsItems");
			var orderedDataAsc = _.orderBy(orderedData, ['text'], ['asc']);

			this.jsonModel.setProperty("/ColumnsItems", orderedDataAsc);

			odialog.setModel(new JSONModel({

				data: _.orderBy(this.jsonModel.getProperty("/ColumnsItems"), ['text'], ['asc']),
				ColumnsItems: _.orderBy(this.jsonModel.getProperty("/ColumnsItems"), ['text'], ['asc'])
			}), "settings");

		},
		_getsettingsDialogbox: function() {
			if (!this._oSettingsDialog) {

				this._oSettingsDialog = sap.ui.xmlfragment("settings", "zprs.wipeditor.Fragments.settings", this);
				// this._oSettingsDialog.mProperties.title = "View Settings";
				this.getView().addDependent(this._oSettingsDialog);

			}
			return this._oSettingsDialog;

		},
		onCancel: function() {

			var oPersDialog = this._oSettingsDialog;

			oPersDialog.getPanels()[0]._getSearchField().setProperty("value", "");
			oPersDialog.getPanels()[0]._getSearchField().fireSearch();

			this._oSettingsDialog.close();
		},
		onOK: function() {

			var oPersDialog = this._oSettingsDialog;
			var oPanel = oPersDialog.getPanels()[0];
			oPersDialog.getPanels()[0]._getSearchField().setProperty("value", "");
			oPersDialog.getPanels()[0]._getSearchField().fireSearch();

			var oPanelContent = oPanel.getAggregation("content")[1];
			var oColumnsTable = oPanelContent.getContent()[0];
			var oSelectedItems = oColumnsTable.getSelectedItems();

			var selColumnKeys = [];

			var items = this.jsonModel.getProperty("/ColumnsItems");
			var visible = this.jsonModel.getProperty("/visible");

			//selected col keys
			for (var i = 0; i < oSelectedItems.length; i++) {
				var colname = oSelectedItems[i].getCells()[0].getText();;
				items.forEach(function(obj) {
					if (obj.text == colname) {
						selColumnKeys.push(obj.columnKey);
					}
				});
			}
			this.jsonModel.setProperty("/ColumnsItems",items);
			var oColumnKeys = [];
			items.forEach(function(obj) {
				oColumnKeys.push(obj.columnKey);
			});

			for (var i = 0; i < oColumnKeys.length; i++) {
				var item = oColumnKeys[i];
				if (selColumnKeys.includes(item)) {
					visible[item] = true;
				} else {
					visible[item] = false;
				}
			}

			this.jsonModel.setProperty("/visible", visible);
			this._oSettingsDialog.close();
		},

		//list sort
		listSorting: function(oEvent) {

			var InputsModel = this.getView().getModel("InputsModel");

			var masterItems = InputsModel.getProperty("/Inputs/masterItems");

			if (masterItems.length > 0) {
				var reversedMasteredItems = masterItems.reverse();
				InputsModel.setProperty("/Inputs/masterItems", reversedMasteredItems);

			}
		},

		//click event for column sorting and filter
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

				that._oResponsivePopover.openBy(oTarget);
				if (oKey === "Budat" || oKey === "Cpudt" || oKey === "Bldat") {
					sap.ui.core.Fragment.byId("personalizationDialog0", "filterBox").setVisible(false);
				} else {
					sap.ui.core.Fragment.byId("personalizationDialog0", "filterBox").setVisible(true);
				}
				
			    if (oKey === "Zzphase" || oKey === "Zztskcd" || oKey === "Zzactcd" || oKey === "Zzffactcd" || oKey === "Zzfftskcd"){
					sap.ui.core.Fragment.byId("personalizationDialog0", "sortAsc").setVisible(false);
						sap.ui.core.Fragment.byId("personalizationDialog0", "sortDesc").setVisible(false);
				} else {
					sap.ui.core.Fragment.byId("personalizationDialog0", "sortAsc").setVisible(true);
					sap.ui.core.Fragment.byId("personalizationDialog0", "sortDesc").setVisible(true);
				}

				sap.ui.core.Fragment.byId("personalizationDialog0", "filterValue").setValue(value);
			});
		},

		//column sorting hometable
		onAscending: function() {

			var oTable = this.getView().byId("WipDetailsSet");
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

			var oTable = this.getView().byId("WipDetailsSet");
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

		//column filter hometable
		onChange: function(oEvent) {

			var InputFields = this.getModel("InputsModel");
			var oTable = this.getView().byId("WipDetailsSet");
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
				this.jsonModel.setProperty("/modelData", results);
				oTable.setModel(this.jsonModel);

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
			this.jsonModel.setProperty("/RowCount", results.aIndices.length);
			for (var l = 0; l < results.aIndices.length; l++) {
				var modelData = this.jsonModel.getProperty("/modelData");
				var res = modelData[results.aIndices[l]];
				resArr.push(res);
			}
			this.getModel("InputsModel").setProperty("/Inputs/globalSearchModel", resArr);

			this._oResponsivePopover.close();

		},

		//masterpages list delete
	

		//refresh dialogbox close
		closeDialog: function() {

			var Otable1 = this.getModel("InputsModel").getProperty("/Inputs/scope");

			var tableId = Otable1.getId();

			var InputFields = this.getModel("InputsModel");
			var viewId = InputFields.getProperty("/Inputs/viewId");

			var iconTabId = InputFields.getProperty("/Inputs/icontabbarid");
			if (tableId === viewId + "--Home--WipDetailsSet") {

				iconTabId.setSelectedKey("Home");
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

			} else if (tableId === viewId + "--NarrativeEditsVBox--WipDetailsSet1") {
				iconTabId.setSelectedKey("NarrativeEdits");
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

			} else if (tableId === viewId + "--LineItemEditsVbox--WipDetailsSet2") {

				iconTabId.setSelectedKey("LineItemEdits");
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
				var index = this.getModel("InputsModel").getProperty("/Inputs/rowLineCount");

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
				InputFields.setProperty("/Inputs/ToolbarEnable/LineItemEditSave", true);

			} else {

				iconTabId.setSelectedKey("LineItemTransfers");
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
				var index = this.getModel("InputsModel").getProperty("/Inputs/rowLineTransfersCount");

				if (index.length === 1) {

					InputFields.setProperty("/Inputs/ToolbarEnable/Consolidate", false);
					InputFields.setProperty("/Inputs/ToolbarEnable/Mass_Transfer", true);

					InputFields.setProperty("/Inputs/ToolbarEnable/Split_Transfer", true);

				} else if (index.length > 1) {

					InputFields.setProperty("/Inputs/ToolbarEnable/Consolidate", true);
					InputFields.setProperty("/Inputs/ToolbarEnable/Mass_Transfer", true);

					InputFields.setProperty("/Inputs/ToolbarEnable/Split_Transfer", false);

				} else {

					InputFields.setProperty("/Inputs/ToolbarEnable/Consolidate", false);
					InputFields.setProperty("/Inputs/ToolbarEnable/Mass_Transfer", false);

					InputFields.setProperty("/Inputs/ToolbarEnable/Split_Transfer", false);

				}
				InputFields.setProperty("/Inputs/ToolbarEnable/LineItemTransferSave", true);

			}
			this._Dialog.close();
			if (tableId === viewId + "--NarrativeEditsVBox--WipDetailsSet1") {
				this.bus = sap.ui.getCore().getEventBus();
				this.bus.publish("homeChannelNarrativespell", "toSummaryEditNarrativespell", {
					parNarrative: "narrativeEditspell"
				});
			}

		},

	
	

	});

});