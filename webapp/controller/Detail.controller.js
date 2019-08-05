/*global location */
sap.ui.define([
			"zprs/wipeditor/controller/BaseController",
			"sap/ui/model/Filter",
			"sap/ui/model/json/JSONModel",
			"zprs/wipeditor/model/ReportModel",
			"sap/ui/model/FilterOperator",
			"zprs/wipeditor/services/LineItemsServices",
			"zprs/wipeditor/services/HomeServices",
			"zprs/wipeditor/model/formatter",
			"sap/ui/core/format/DateFormat",
			"sap/m/MessageBox",
			// "sap/ui/export/Spreadsheet",
		], function(BaseController, Filter, JSONModel, ReportModel, FilterOperator, LineItemsServices, HomeServices, formatter, DateFormat,
			MessageBox, Spreadsheet) {
			"use strict";

			return BaseController.extend("zprs.wipeditor.controller.Detail", {

				formatter: formatter,

				/* =========================================================== */
				/* lifecycle methods                                           */
				/* =========================================================== */

				onInit: function(oEvent) {

					// var oIconTabBar = this.byId("idIconTabBarMulti");
					// oIconTabBar.setTabDensityMode("Compact");

					// $("#__component0---detail--NarrativeEditsVBox--WipDetailsSet1-vsb").addStyleClass("uiscroll");

					this.jsonModel = new sap.ui.model.json.JSONModel();
					this.getView().setModel(this.jsonModel, "JSONModel");
					this.getView().setModel(new ReportModel().getModel(), "InputsModel");
					sap.ui.getCore().byId(this.getView().getId() + "--SmartFilterBar-btnShowHide").setVisible(false);

					this.bus = sap.ui.getCore().getEventBus();

					this.filterArr = [];
					this.bus.subscribe("homeChannel", "toSummaryEdit", this.homeData, this);
					this.bus.subscribe("masterToDetail", "toDetail", this.masterToDetail, this);

					var InputFields = this.getModel("InputsModel");
					var visible = InputFields.getProperty("/Inputs/visible0");
					this.jsonModel.setProperty("/visible", visible);
					var ColumnsItems = InputFields.getProperty("/Inputs/ColumnsItems0");
					this.jsonModel.setProperty("/ColumnsItems", ColumnsItems);

					var smarttbl = this.getView().byId("smartTable_ResponsiveTable0");
					smarttbl._oTable.setVisible(false);

					var generalSetting = new JSONModel({
						showRowDetail: true,
						showComments: false,
						showNarr: false
					});

					// this.byId("idAppControl").setMode(sap.m.SplitAppMode.HideMode);
					// this.byId("idAppControl").hideMaster();
					$(this.getView().getId() + "--idIconTabBarMulti--header").css("height", "25%");
					this.setModel(generalSetting, "generalSetting");
					this.setupInitialData();
					// this.byId("dynamicPageId").setHeaderExpanded(false);
					// this.sizeChanged(sap.ui.Device.media.getCurrentRange(sap.ui.Device.media.RANGESETS.SAP_STANDARD));
					// this.scrollChange(sap.ui.Device.resize.height);
					var that = this;

					$(document).ready(function() {
						$(window).keydown(function(event) {
							that.reset();
						});
						$(window).mousedown(function(event) {
							that.reset();
						});
						$(window).mousemove(function(event) {
							that.reset();
						});
					});

					this.timeInterval = 0;

				},

				reset: function() {

					var that = this;

					if (that.timeInterval) {
						clearTimeout(that.timeInterval);

					}

					that.timeInterval = setTimeout(function() {

						MessageBox.show(
							"Session is Idle for more time. Do you want to keep the Session", {
								title: "User Session",
								actions: [sap.m.MessageBox.Action.CANCEL, sap.m.MessageBox.Action.OK],
								onClose: function(oAction) {

									if (oAction === "CANCEL") {
										that.gotoPress();
										that.byId("idIconTabBarMulti").setVisible(false);

									}

								}

							}
						);

					}, 300000);

				},

				homeData: function(homeChannel, toSummaryEdit, data) {
					var that = this;
					var InputFields = this.getModel("InputsModel");
					var results = InputFields.getProperty("/Inputs/homeTable");

					InputFields.setProperty("/Inputs/currView", {
						view: "Home",
						scope: this
					});
					this.jsonModel.setProperty("/modelData", results);
					var Otable = this.getView().byId("WipDetailsSet");

					var smarttbl = this.getView().byId("smartTable_ResponsiveTable0");
					smarttbl._oTable.setVisible(false);
					Otable.setModel(this.jsonModel);
					this.jsonModel.setProperty("/RowCount", results.length);
					this.byId("searchText").setValue("");

					var visible = InputFields.getProperty("/Inputs/visible0");
					this.jsonModel.setProperty("/visible", visible);
					var ColumnsItems = InputFields.getProperty("/Inputs/ColumnsItems0");
					this.jsonModel.setProperty("/ColumnsItems", ColumnsItems);

					// var visible = $.extend(true, {}, InputFields.getProperty("/Inputs/DefaultVisible0"));
					// this.jsonModel.setProperty("/visible", visible);
					// var ColumnsItems = $.extend(true, [], InputFields.getProperty("/Inputs/DefaultColumns0"));
					// this.jsonModel.setProperty("/ColumnsItems", ColumnsItems);

					var change = InputFields.getProperty("/Inputs/isChanged");

					if (change === true && data.button === undefined) {

						this._Dialog = sap.ui.xmlfragment("zprs.wipeditor.Fragments.Fragment", this);
						this._Dialog.open();
					} else {
						if (data.button === undefined) {

							this.ReloadTable();
						}

					}

				},

				//userid and currentdate
				setupInitialData: function() {

					// sap.ui.core.BusyIndicator.hide(0);
					var that = this;

					var sets = that.getModel("InputsModel").getProperty("/Inputs/services");
					var oComponent = that.getOwnerComponent();

					$.when(HomeServices.getInstance().getUserSettingsDataService(sets, oComponent))
						.done(function(userData) {

							that.getModel("InputsModel").setProperty("/Inputs/userSettingsData", userData);

							sap.ui.core.BusyIndicator.hide(0);

						});

				},

				//onpress from masterpage to detail page
				masterToDetail: function(masterToDetail, toDetail, data) {

					var that = this;

					this.pspid = data.pspid;

					// data.par1.push(new Filter("Pspid", FilterOperator.EQ, this.pspid ));
					// 	data.par1[0].aFilters[1].aFilters.forEach(function(item) {
					// 			item.sOperator = "EQ";

					// 		});

					sap.ui.core.BusyIndicator.show(0);
					var InputFields = this.getView().getModel("InputsModel");
					var Pspid = InputFields.getProperty("/Inputs/rootPspid");
					InputFields.setProperty("/Inputs/masterFilter", data.par1);
					var oModel = this.getOwnerComponent().getModel();
					var value = InputFields.getProperty("/Inputs/isChanged");
					if (value === false) {

						LineItemsServices.getInstance().selectListItem(oModel, data.par1)
							.done(function(oData) {

								sap.ui.core.BusyIndicator.hide(0);
								that.getModel("InputsModel").setProperty("/Inputs/homeTable", oData.results);
								that.getModel("InputsModel").setProperty("/Inputs/globalSearchModel", oData.results);
								var res = oData.results;
								for (var i = 0; i < res.length; i++) {
									res[i].iconVisible = false;
									res[i].iconColor = "";
									res[i].iconTooltip = "";
									res[i].isEditable = false;
								}

								// that.jsonModel.setProperty("/Inputs/masterItems", listItems);
								var oTable = that.byId("WipDetailsSet");
								oTable.setModel(that.jsonModel);
								that.jsonModel.setProperty("/modelData", res);

								that.jsonModel.setProperty("/RowCount", oData.results.length);
								InputFields.setProperty("/Inputs/growing", oData.results.length);

								that.getModel("InputsModel").setProperty("/Inputs/dynamicId", that.byId("dynamicPageId"));
								that.byId("idIconTabBarMulti").setVisible(true);
								that.byId("idIconTabBarMulti").getItems()[0].setVisible(true);
								that.byId("idIconTabBarMulti").getItems()[1].setVisible(true);
								that.byId("idIconTabBarMulti").getItems()[2].setVisible(true);
								that.byId("idIconTabBarMulti").getItems()[3].setVisible(true);
								that.byId("idIconTabBarMulti").setSelectedKey("Home");

								InputFields.setProperty("/Inputs/icontabbarid", that.byId("idIconTabBarMulti"));
								var boffice = data.bOffice.concat(" ", data.BofficeName);;
								InputFields.setProperty("/Inputs/formMatter", data.pspid);
								InputFields.setProperty("/Inputs/formLeadPartner", data.BpatnerName);
								InputFields.setProperty("/Inputs/formBillingOffice", boffice);

								InputFields.setProperty("/Inputs/viewId", that.getView().getId());

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

								if (!that._oResponsivePopover) {
									that._oResponsivePopover = sap.ui.xmlfragment("personalizationDialog0", "zprs.wipeditor.fragments.personalizationDialog", that);
									that._oResponsivePopover.setModel(that.getView().getModel());
								}
								that.byId("dynamicPageId").setHeaderExpanded(false);
								var Pspid = data.pspid;
								InputFields.setProperty("/Inputs/rootPspid", Pspid);
								var oTable = that.byId("WipDetailsSet");

								oTable.addEventDelegate({
									onAfterRendering: function() {

										var oHeader = this.$().find('.sapMListTblHeaderCell'); //Get hold of table header elements
										for (var i = 0; i < oHeader.length; i++) {
											var oID = oHeader[i].id;
											that.onClick(oID);
										}

									}
								}, oTable);

								// var oTable = that.getView().byId("WipDetailsSet");

								// that.onHide();

							})
							.fail(function(err) {
								sap.ui.core.BusyIndicator.hide(0);
								// MessageBox.show(err.message);
							});
					} else {
						sap.ui.core.BusyIndicator.hide(0);

						InputFields.setProperty("/Inputs/newPress", true);
						this._Dialog = sap.ui.xmlfragment("zprs.wipeditor.Fragments.Fragment", this);
						this._Dialog.open();

					}
				},

				//narrative toggle press
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

				//showhide filterbar
				showFilter: function() {

					var visible = this.getView().byId("SmartFilterBar").getVisible();
					if (visible) {
						this.getView().byId("SmartFilterBar").setVisible(false);
						this.getView().byId("scrollId").setHeight("74%");
						this.getModel("InputsModel").setProperty("/Inputs/isHidden", false);
					} else {
						this.getView().byId("SmartFilterBar").setVisible(true);
						this.getView().byId("scrollId").setHeight("40%");
						this.getModel("InputsModel").setProperty("/Inputs/isHidden", true);
					}
					this.bus = sap.ui.getCore().getEventBus();
					this.bus.publish("filterbar", "showfilterbar", {
						parNarrative: this.getModel("InputsModel").getProperty("/Inputs/isHidden")
					});
				},

				//workdate fixed
				initiatedFilterbars: function() {

					var oDate = new Date();
					var dateField = this.getView().byId("SmartFilterBar").getControlByKey("Budat");
					dateField.setDateValue(new Date('01/01/2014'));
					dateField.setSecondDateValue(oDate);

				},

				//master page show/hide
				onHide: function() {
					if (this.hide === "hidemaster") {
						this.bus = sap.ui.getCore().getEventBus();
						this.bus.publish("showHide", "Master", {
							par1: "hidemaster"
						});
						this.hide = "showMaster";
					} else {
						this.bus = sap.ui.getCore().getEventBus();
						this.bus.publish("showHide", "Master", {
							par1: "showMaster"
						});
						this.hide = "hidemaster";
					}

				},

				//smartfilterbar go
				gotoPress: function(oEvent) {

					sap.ui.core.BusyIndicator.show(0);
					var value = this.getView().byId("SmartFilterBar").getControlByKey("Budat").getTo();

					var InputFields = this.getView().getModel("InputsModel");
					InputFields.setProperty("/Inputs/isChanged", false);

					var oModel = this.getOwnerComponent().getModel();
					oModel.refresh(true);
					this.values = 0;

					var smartFilterBar = this.getView().byId("SmartFilterBar");
					InputFields.setProperty("/Inputs/smartfilterId", smartFilterBar);
					var id = this.byId("dynamicPageHeader").getId();
					var id = sap.ui.getCore().byId(id + "-collapseBtn");
					console.log(id);

					id.attachPress(function(oEvent) {
							this.getModel("InputsModel").setProperty("/Inputs/isExpanded", false);
							this.bus = sap.ui.getCore().getEventBus();
							this.bus.publish("expansion", "header", {
								par1: this.getModel("InputsModel").getProperty("/Inputs/isExpanded")

							});
					});
							var close = sap.ui.getCore().byId("__title0-expandBtn");
							close.attachPress(function(evt) {
								this.getModel("InputsModel").setProperty("/Inputs/isExpanded", true);
								this.bus = sap.ui.getCore().getEventBus();
								this.bus.publish("expansion", "header", {
									par1: this.getModel("InputsModel").getProperty("/Inputs/isExpanded")

								});

							});

							var filters = [];
							filters = smartFilterBar.getFilters();
							var arrchk = filters[0].aFilters;
							debugger;
							if (arrchk) {
								for (var i = 1; i <= arrchk.length - 1; i++) {

									if (arrchk[i].aFilters[0].sPath == "Client") {
										var lenOfValue = filters[0].aFilters[i].aFilters[0].oValue1.length;

										for (var j = 0; j < 10 - lenOfValue; j++) {
											filters[0].aFilters[i].aFilters[0].oValue1 = "0" + filters[0].aFilters[i].aFilters[0].oValue1;
										}

									}

								}
							}
							InputFields.setProperty("/Inputs/timeKeeperValue", []);
							var timeKeeper = this.getView().byId("SmartFilterBar").getControlByKey("Pernr").getTokens();
							timeKeeper.forEach(function(obj) {

								InputFields.getProperty("/Inputs/timeKeeperValue").push(obj.getText().replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, ''));

							});
							if (timeKeeper.length === 0) {
								InputFields.setProperty("/Inputs/timeKeeperValue", []);
							}
							InputFields.setProperty("/Inputs/DocNUmber", []);
							var DocNum = this.getView().byId("SmartFilterBar").getControlByKey("Belnr").getTokens();
							DocNum.forEach(function(obj) {

								InputFields.getProperty("/Inputs/DocNUmber").push(obj.getText().replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, ''));

							});
							if (DocNum.length === 0) {
								InputFields.setProperty("/Inputs/DocNUmber", []);
							}

							var BusinessPartner = this.getView().byId("SmartFilterBar").getControlByKey("MpatnerParvw").getProperty("selectedKey");
							var BusinessPartnerNumber = this.getView().byId("SmartFilterBar").getControlByKey("Mpatner").getTokens();
							if (BusinessPartner.length || BusinessPartnerNumber.length > 0) {
								if (BusinessPartner.length && BusinessPartnerNumber.length > 0) {
									filters.push(new Filter("MpatnerParvw", "EQ", BusinessPartner));
								} else {
									sap.ui.core.BusyIndicator.hide(0);
									sap.m.MessageBox.error("Business Partner is Required for Business Partner Type", {
										title: "Error", // default
										onClose: null, // default
										styleClass: "", // default
										initialFocus: null, // default
										textDirection: sap.ui.core.TextDirection.Inherit // default
									});

									return;
								}

							}

							var that = this;

							var toDate = this.getView().byId("SmartFilterBar").getControlByKey("Budat").getTo();

							var fromDate = this.getView().byId("SmartFilterBar").getControlByKey("Budat").getFrom();

							InputFields.setProperty("/Inputs/odatefrom", fromDate);

							InputFields.setProperty("/Inputs/odateto", toDate);
							this.bus = sap.ui.getCore().getEventBus();
							this.bus.publish("detailToMaster", "toMaster", {
								par1: filters,
								smartfilterid: smartFilterBar,
								icontabbarId: this.byId("idIconTabBarMulti")
							});
							InputFields.setProperty("/Inputs/currentFilters", filters);

							that.jsonModel.setProperty("/modelData", "");

							that.jsonModel.setProperty("/RowCount", "");

							that.byId("idIconTabBarMulti").getItems()[1].setVisible(false);
							that.byId("idIconTabBarMulti").getItems()[2].setVisible(false);
							that.byId("idIconTabBarMulti").getItems()[3].setVisible(false);
							that.byId("idIconTabBarMulti").setSelectedKey("Home");

							InputFields.setProperty("/Inputs/formMatter", "");
							InputFields.setProperty("/Inputs/formLeadPartner", "");
							InputFields.setProperty("/Inputs/formBillingOffice", "");
							that.byId("dynamicPageId").setHeaderExpanded(false)

						},

						//icontabbar tab selection
						handleIconTabBarSelect: function(evt) {
							var InputFields = this.getModel("InputsModel");

							var change = evt.getSource();

							var value = change.getSelectedKey();
							if (value === "NarrativeEdits") {
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
									par1: "NarrativeEdits"
								});
							} else if (value === "LineItemEdits") {

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
									par1: "LineItemEdits"
								});
							} else if (value === "LineItemTransfers") {

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
									par1: "LineItemTransfers"
								});
							} else {
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

								this.bus.publish("homeChannel", "toSummaryEdit", {
									parHome: "home"
								});
							}
						},

						//dynmaic page header hide/show
						toggleHeaderOnTitleClick: function(evt) {
							debugger;
							var isExpanded = this.getModel("InputsModel").getProperty("/Inputs/isExpanded");
							if (isExpanded === true) {
								this.getModel("InputsModel").setProperty("/Inputs/isExpanded", true);

							} else {
								this.getModel("InputsModel").setProperty("/Inputs/isExpanded", false);
							}
							this.bus = sap.ui.getCore().getEventBus();
							this.bus.publish("expansion", "header", {
								par1: this.getModel("InputsModel").getProperty("/Inputs/isExpanded")

							});

						},

						//common function for Narrativeedits
						NarrativeFunction: function(oControlEvent) {

							this.bus = sap.ui.getCore().getEventBus();
							this.bus.publish("homeChannelNarrative", "toSummaryEditNarrative", {
								parNarrative: "narrativeEdit",
								button: oControlEvent.getSource().getText()
							});
						},

						//common function for lineitemedits
						LineItemEditsFuntion: function(oControlEvent) {

							this.bus = sap.ui.getCore().getEventBus();
							this.bus.publish("homeChannelLineItemEdits", "toSummaryEditLineItem", {
								parLineItem: "lineItemEdit",
								button: oControlEvent.getSource().getText()
							});

						},

						//common function for lineitemtransfers
						LineItemTransferfunction: function(oControlEvent) {
							this.bus = sap.ui.getCore().getEventBus();
							this.bus.publish("homeChannelLineItemTransfer", "toSummaryEditLineItemTransfer", {
								parLineItemTransfer: "lineItemTransfer",
								button: oControlEvent.getSource().getText()
							});
						},

						//reload home
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
						ReloadTable: function() {

							var that = this;
							// this.filters = data.par1;
							sap.ui.core.BusyIndicator.show(0);
							var InputFields = this.getView().getModel("InputsModel");
							var Pspid = this.pspid;
							var oModel = this.getOwnerComponent().getModel();
							var filter = InputFields.getProperty("/Inputs/masterFilter");
							LineItemsServices.getInstance().selectListItem(oModel, filter)
								.done(function(oData) {

									sap.ui.core.BusyIndicator.hide(0);
									that.getModel("InputsModel").setProperty("/Inputs/homeTable", oData.results);
									that.getModel("InputsModel").setProperty("/Inputs/globalSearchModel", oData.results);
									var res = oData.results;
									for (var i = 0; i < res.length; i++) {
										res[i].iconVisible = false;
										res[i].iconColor = "";
										res[i].iconTooltip = "";
										res[i].isEditable = false;
									}

									var listItems = that.getModel("InputsModel").getProperty("/Inputs/masterItems");
									for (var i = 0; i < listItems.length; i++) {
										if (listItems[i].Pspid === Pspid) {
											listItems[i].hcolor = "Information";
										} else {
											listItems[i].hcolor = "None";
										}
									}
									that.jsonModel.setProperty("/Inputs/masterItems", listItems);
									var oTable = that.byId("WipDetailsSet");
									oTable.setModel(that.jsonModel);
									that.jsonModel.setProperty("/modelData", res);

									that.jsonModel.setProperty("/RowCount", oData.results.length);
									InputFields.setProperty("/Inputs/growing", oData.results.length);

									that.getModel("InputsModel").setProperty("/Inputs/dynamicId", that.byId("dynamicPageId"));

									that.byId("idIconTabBarMulti").getItems()[1].setVisible(true);
									that.byId("idIconTabBarMulti").getItems()[2].setVisible(true);
									that.byId("idIconTabBarMulti").getItems()[3].setVisible(true);
									that.byId("idIconTabBarMulti").setSelectedKey("Home");

									InputFields.setProperty("/Inputs/icontabbarid", that.byId("idIconTabBarMulti"));

									InputFields.setProperty("/Inputs/viewId", that.getView().getId());

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

									if (!that._oResponsivePopover) {
										that._oResponsivePopover = sap.ui.xmlfragment("personalizationDialog0", "zprs.wipeditor.fragments.personalizationDialog",
											that);
										that._oResponsivePopover.setModel(that.getView().getModel());
									}
									that.byId("dynamicPageId").setHeaderExpanded(false);
									var Pspid = that.pspid;
									InputFields.setProperty("/Inputs/rootPspid", Pspid);
									var oTable = that.byId("WipDetailsSet");

									oTable.addEventDelegate({
										onAfterRendering: function() {
											if (that.getView().byId("variant")) {

												$("#" + that.getView().getId() + "--variant-trigger-inner").click(function() {

													that.getView().byId("variant").oVariantSave.setVisible(false);
												});

												$("#" + that.getView().getId() + "--variant-text-inner").click(function() {

													that.getView().byId("variant").oVariantSave.setVisible(false);
												});

											}
											var oHeader = this.$().find('.sapMListTblHeaderCell'); //Get hold of table header elements
											for (var i = 0; i < oHeader.length; i++) {
												var oID = oHeader[i].id;
												that.onClick(oID);
											}

										}
									}, oTable);

									// var oTable = that.getView().byId("WipDetailsSet");

									// that.onHide();

								})
								.fail(function(err) {
									sap.ui.core.BusyIndicator.hide(0);
									// MessageBox.show(err.message);
								});
							if (this._Dialog) {

								this._Dialog.close();

							}
							InputFields.setProperty("/Inputs/isChanged", false);

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

							var otable = this.byId("WipDetailsSet");

							// this.jsonModel.setData({
							// 	modelData: result
							// });
							this.jsonModel.setProperty("/modelData", result);

							this.getModel("InputsModel").setProperty("/Inputs/globalSearchModel", result);

							var visible = this.getModel("InputsModel").getProperty("/Inputs/visible0");
							this.jsonModel.setProperty("/visible", visible);

							var ColumnsItems = this.getModel("InputsModel").getProperty("/Inputs/ColumnsItems0");
							this.jsonModel.setProperty("/ColumnsItems", ColumnsItems);
							otable.setModel(this.jsonModel);

							// otable.bindRows("/modelData");
							var len = this.jsonModel.getProperty("/modelData").length;
							this.jsonModel.setProperty("/RowCount", len);

						},

						//apply variant
						applyVariant: function() {
							var that = this;
							setTimeout(function() {
								that.jsonModel.setProperty("/modelData", that.getModel("InputsModel").getProperty("/Inputs/homeTable"));
							}, 1000);
						},

						//export home
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
										UTC: true,
										pattern: 'dd.MM.YYYY'
									};
									obj.type = "date";
									obj.textAlign = 'begin';
								}
								arr.push(obj);
								if (colE === columnsArray.length - 1) {
									return arr;
								}
							}

						},
						ExportLineItem: function(Event) {

							var tableId = this.getView().byId("WipDetailsSet");

							var aCols, oSettings, oExcelDate, oDateFormat, oExcelFileName, oExportData;
							aCols = this.createColumnConfig1(tableId);
							oExportData = this.getView().getModel("InputsModel").getProperty("/Inputs/globalSearchModel");
							oDateFormat = DateFormat.getDateInstance({
								formatOptions: {
									style: 'medium',
									UTC: true,
									pattern: 'dd.MM.YYYY'

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

						//home variants
						onAfterRendering: function() {
							var valuelayouturl = this.getOwnerComponent().getModel('ZPRS_VARIANT_MAINTENANCE_SRV').sServiceUrl;
							var oModellayout = new sap.ui.model.odata.v2.ODataModel({
								serviceUrl: valuelayouturl
							}, true);
							var that = this;
							var aFilter = [];
							aFilter.push(new Filter("ContId", "EQ", "S2C.WIPEDITOR.VIEW"));
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
									that.filterChangeData();
									if (that.getView().byId("variant")) {

										$("#" + that.getView().getId() + "--variant-trigger-inner").click(function() {

											that.getView().byId("variant").oVariantSave.setVisible(false);
										});

										$("#" + that.getView().getId() + "--variant-text-inner").click(function() {

											that.getView().byId("variant").oVariantSave.setVisible(false);
										});

									}

									//	$("#__page1-intHeader-BarPH.sapMBarContainer.sapMBarPH").addClass("sapUiCompFilterBar ");

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
							aFilter.push(new Filter("ContId", "EQ", "S2C.WIPEDITOR.VIEW"));
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
						},
						onLayoutModify: function(oEvent) {

							// var aParameters = oEvent.getParameters();

							// var oSummaryCMTTable = this.getView().byId("tblSummaryCMT"),
							// 	oSummaryCMTable = this.getView().byId("tblSummaryCM"),
							// 	oDetailTable = this.getView().byId("tblDetailed");

							// var ContId;
							// var VarinatSaveSet;
							// if (oDetailTable.getVisible()) {
							this.saveCheck = true;
							this.newValRenamed = false;
							var ContId = "S2C.WIPEDITOR.VIEW";
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
							var ContId = "S2C.WIPEDITOR.VIEW";
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