sap.ui.define([
	"zprs/wipeditor/controller/BaseController",
		"zprs/wipeditor/services/LineItemsServices",
	"zprs/wipeditor/services/SplitItemsServices",
	"zprs/wipeditor/model/formatter",
		"sap/ui/model/json/JSONModel",
		"sap/m/MessageBox",
			"sap/ui/model/Filter"
], function(BaseController,LineItemsServices,SplitItemsServices,formatter,JSONModel,MessageBox,Filter) {
	"use strict";

	return BaseController.extend("zprs.wipeditor.controller.LineItemTransfers", {
		formatter:formatter,
		onInit: function() {
			
			
			this.bus = sap.ui.getCore().getEventBus();
			

			this.bus.subscribe("homeChannelLineItemTransfer", "toSummaryEditLineItemTransfer", this.lineItemTransfersData, this);
			
				this.jsonModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.jsonModel, "JSONModel");
			this.transferArray=[];
			this.index=[];
			

		},
		lineItemTransfersData: function(homeChannelLineItemTransfer, toSummaryEditLineItemTransfer, data) {
			
	if(!data.button){
			var InputFields = this.getModel("InputsModel");
			var results = InputFields.getProperty("/Inputs/homeTable");
			this.jsonModel.setProperty("/modelData", results);
			var Otable = this.getView().byId("WipDetailsSet3");
			Otable.setModel(this.jsonModel);
			this.jsonModel.setProperty("/RowCount3",results.length);
		
			Otable.bindRows("/modelData");
			
			this.byId("searchText").setValue("");
				// InputFields.setProperty("/Inputs/scope",this.getView().byId("WipDetailsSet3"));
				var OtableSmart0 = this.getView().byId("smartTable_ResponsiveTable3");
				var that = this;
					var oPersButton = OtableSmart0._oTablePersonalisationButton;
					oPersButton.attachPress(function() {
                     
						var oPersController = OtableSmart0._oPersController;
						var oPersDialog = oPersController._oDialog;

						oPersDialog.attachOk(function(oEvent) {
							
							setTimeout(function() {
							
								that.jsonModel.setProperty("/modelData",that.getModel("InputsModel").getProperty("/Inputs/homeTable"));
								var Otablenew = that.getView().byId("WipDetailsSet3");
								Otablenew.bindRows("/modelData");
							}, 1000);

						});

					});
						this.data(results);
						var tableLineEdits = this.getView().byId("WipDetailsSet3");

			var index = this.getModel("InputsModel").getProperty("/Inputs/rowLineTransfersCount");
			for (var i = 0; i < index.length; i++) {
				tableLineEdits.getRows()[index[i]].getCells()[0].setVisible(false);
			

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
					if(data.button === "Save"){
						this.onLineItemTransfersSave();
					} else if(data.button === "Updatecodes"){
						this.onUpdateCodes();
					} else if(data.button === "Consolidate"){
						this.onConsolidate();
					} else if(data.button === "Mass Transfer"){
						this.onMassTransfer();
					} else if(data.button === "Split Transfer"){
						this.onSplitTransfer();
					}
	}
		
				

		},
		
	
		onConsolidate: function() {

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
					var index = 	that.getModel("InputsModel").getProperty("/Inputs/rowLineTransfersCount");
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
		
				InputFields.setProperty("/Inputs/isChanged",true);
					InputFields.setProperty("/Inputs/scope",this.getView().byId("WipDetailsSet3"));

		},
		
		
	
		onSplitTransfer: function() {

			var oTable = this.getView().byId("smartTable_ResponsiveTable3").getTable();
			this._getSplitDialog().open();
			var idx = oTable.getSelectedIndex();
			var ctx = oTable.getContextByIndex(idx);
			var obj = ctx.getObject();
			var matter = obj.Pspid;
			var quantity = obj.Megbtr;
			this.docno = obj.Belnr;
	
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
				oTbl.addColumn(new sap.m.Column({
					header: new sap.m.Label({
							text: col.userCol

						})
					
				}));
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
					
						if (that.msgTxt !== "") {
							var cells = rows[i + 1].getCells();
							cells[9].setProperty("visible", true);
							cells[9].setTooltip(that.msgTxt);
						}

					}

				

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

		ReloadTable:function(){
			
				var aFilter = [];
				var table = this.getView().byId("WipDetailsSet3");
			var that = this;
				this.byId("searchText").setValue("");
				var InputFields = this.getModel("InputsModel");
			
				var Pspid =InputFields.getProperty("/Inputs/rootPspid");

			
			var odatefrom = InputFields.getProperty("/Inputs/odatefrom");
			var odateto =InputFields.getProperty("/Inputs/odateto");
			aFilter.push(new Filter("Pspid", sap.ui.model.FilterOperator.EQ, Pspid));
			aFilter.push(new Filter("Budat", sap.ui.model.FilterOperator.BT, odatefrom, odateto));
		
			var oModel = this.getOwnerComponent().getModel();
				sap.ui.core.BusyIndicator.show(0);
			LineItemsServices.getInstance().selectListItem(oModel, aFilter)
				.done(function(oData) {
					
					
					sap.ui.core.BusyIndicator.hide(0);

					that.jsonModel.setProperty("/modelData", oData.results);
					that.data(oData.results);
				
				
				
					table.setModel(that.jsonModel);
					table.bindRows("/modelData");


				})
				.fail(function() {
					

				});
					
					InputFields.setProperty("/Inputs/isChanged",false);
						InputFields.setProperty("/Inputs/scope", "");
							var tableLineEdits = this.getView().byId("WipDetailsSet3");

			var index = this.getModel("InputsModel").getProperty("/Inputs/rowLineTransfersCount");
			for (var i = 0; i < index.length; i++) {
				tableLineEdits.getRows()[index[i]].getCells()[0].setVisible(false);
			

			}
					if (this._Dialog) {

				this._Dialog.close();

			}
		},
		
		
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
				that.serviceInstance.getActivitycodes(that.WipEditModel, Rowdata, Pspid, that),
				that.serviceInstance.getFFtaskcodes(that.WipEditModel, Rowdata, Pspid, that),
				that.serviceInstance.getFFActivitycodes(that.WipEditModel, "", Pspid, that))

			.done(function(phaseCodes, taskCodes, activityCodes, ffTskCodes, ffActCodes) {

				if (Rowdata.length > 0) {

					that.jsonModel.setProperty("/LinetableResults", Rowdata.length);
					var lineItems = Rowdata;
					for (var i = 0; i < lineItems.length; i++) {

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
				that.getModel("InputsModel").setProperty("/Inputs/homeTable", lineItems);
				var Otable1 = that.getView().byId("WipDetailsSet3");
				that.jsonModel.setProperty("/modelData", lineItems);
				Otable1.setModel(that.jsonModel);
				Otable1.bindRows("/modelData");
			});
			
		},

		phaseCodesChange: function(oEvent) {
			

			var item = oEvent.getSource().getParent();
			var idx = item.getIndex();
			var thisRow = oEvent.getSource().getParent().getParent().getContextByIndex(idx).getObject();
				var InputFields = this.getView().getModel("InputsModel");
			var indexes = InputFields.getProperty("/Inputs/indexes");
			indexes.push(idx);
			var phaseCodeSelected = oEvent.getSource().getSelectedItem().getKey();
		

		
			var pspid = InputFields.getProperty("/Inputs/rootPspid");
			sap.ui.core.BusyIndicator.show(0);
			var that = this;

			$.when(that.serviceInstance.getTaskcodes(InputFields, phaseCodeSelected, that),
				that.serviceInstance.getActivitycodes(InputFields, thisRow, pspid, that),
				that.serviceInstance.getFFtaskcodes(InputFields, thisRow, pspid, that))

			.done(function(taskCodes, activityCodes, ffTskCodes, ffActCodes) {

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
			var InputFields = this.getView().getModel("InputsModel");
				InputFields.setProperty("/Inputs/isChanged",true);
					InputFields.setProperty("/Inputs/scope", this.getView().byId("WipDetailsSet3"));
		},
		fftaskCodeChange: function(oEvent) {
			

			var InputFields = this.getView().getModel("InputsModel");

			InputFields.setProperty("/Inputs/isChanged", true);
			var item = oEvent.getSource().getParent();
			var idx = item.getIndex();
			var thisRow = oEvent.getSource().getParent().getParent().getContextByIndex(idx).getObject();
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
				InputFields.setProperty("/Inputs/isChanged",true);
					InputFields.setProperty("/Inputs/scope", this.getView().byId("WipDetailsSet3"));

		},
		
	
		onMassTransfer: function() {

			var odialog = this._getDialogmass();

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
				this._omassDialog = sap.ui.xmlfragment("masstransfer", "zprs.wipeditor.Fragments.masstransfer", this);
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

			var oTbl = sap.ui.core.Fragment.byId("masstransfer", "matter");
			var matter = oTbl.getItems()[0].getCells()[0].getValue();
			this.WipEditModel = this.getModel("InputsModel");
			var data = this.WipEditModel.getProperty("/Inputs/homeTable");

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
			var selectindex = this.getModel("InputsModel").getProperty("/Inputs/rowLineTransfersCount");
			if (matter != "") {
				var Pspid = matter;
				var lineItems = data;
				var that = this;

				$.when(
					that.serviceInstance.getPhaseCodes(that.WipEditModel, Pspid, that),
					that.serviceInstance.getTaskcodes(that.WipEditModel, "", that),
					that.serviceInstance.getActivitycodes(that.WipEditModel, "", Pspid, that),
					that.serviceInstance.getFFtaskcodes(that.WipEditModel, "", Pspid, that),
					that.serviceInstance.getFFActivitycodes(that.WipEditModel, "", Pspid, that))

				.done(function(phaseCodes, taskCodes, activityCodes, ffTskCodes, ffActCodes) {

					$.each(selectindex, function(j, o) {

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
						
							var indes = selectindex.indexOf(o);
							selectindex[indes] = " ";
						}

					});
					that.jsonModel.setProperty("/modelData", lineItems);

					that.getView().byId("WipDetailsSet3").setModel(that.jsonModel);
					oTable.bindRows("/modelData");
				
					for (var s = 0; s < selectindex.length; s++) {

						var value = selectindex[s];
						if (value !== "") {
							oTable.setSelectedIndex(value);
						}

					}

					that.onEditTable(selectindex);
				});
			}
			var InputFields = this.getView().getModel("InputsModel");
			InputFields.setProperty("/Inputs/ToolbarEnable/LineItemTransferUpdatecodes", true);
			
			sap.ui.core.Fragment.byId("masstransfer", "percentage").setValue("100");
			var tbl = sap.ui.core.Fragment.byId("masstransfer", "masstransfertable");
			$.each(tbl.getItems(), function(i, o) {
				var rowid = o.getId();
				tbl.removeItem(rowid);
			});
	var InputFields = this.getView().getModel("InputsModel");
				InputFields.setProperty("/Inputs/isChanged",true);
						InputFields.setProperty("/Inputs/scope",this.getView().byId("WipDetailsSet3"));
		
			this._omassDialog.close();

		},
			onEditTable: function(selindexes) {

			var InputFields = this.getView().getModel("InputsModel");

		
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
				this._transferUpdateCodesDialog = sap.ui.xmlfragment("update", "zprs.wipeditor.Fragments.LineitemTransferDialog", this.getView().getController());
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
		
		
		
	
		
			changeTransferToMatter: function(oEvent) {
				

		
			var InputFields = this.getModel("InputsModel");
				InputFields.setProperty("/Inputs/ToolbarEnable/LineItemTransferUpdatecodes", true);
			var oView = this.getView(),
				oTable = oView.byId("WipDetailsSet3");
				this.WipEditModel = this.getModel("InputsModel");

			var idx = oEvent.getSource().getParent();
			var o = idx.getIndex();
			this.index.push(o);
			var indexes = InputFields.getProperty("/Inputs/indexes");
			indexes.push(idx);
			indexes = this.removeDups(this.index);
			var ctx = oTable.getContextByIndex(o);
			var m = ctx.getModel(ctx.getPath());
			var obj = ctx.getObject();
			this.transferArray.push(obj);
			var matter = obj.ToMatter;
			if (matter !== "") {
				var Pspid = matter;
				var lineItems = this.getModel("InputsModel").getProperty("/Inputs/homeTable");
				var that = this;
				this.serviceInstance = LineItemsServices.getInstance();
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
			var InputFields = this.getView().getModel("InputsModel");
				InputFields.setProperty("/Inputs/isChanged",true);
					InputFields.setProperty("/Inputs/scope", this.getView().byId("WipDetailsSet3"));

		},

		changeTransferPercentage: function(oEvent, oModel) {

			this.valueModifyedPercent = oEvent.getParameter("value");
			var tableBindingContext = oEvent.getSource().getBindingContext();
			tableBindingContext.getModel().setProperty(tableBindingContext.getPath() + "/Percent", this.valueModifyedPercent);
			var InputFields = this.getView().getModel("InputsModel");
				InputFields.setProperty("/Inputs/isChanged",true);

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
		onLineItemTransfersSave: function() {
			
			 	var InputFields = this.getModel("InputsModel");
			var indexes = 	InputFields.getProperty("/Inputs/indexes");
			if (indexes.length === 0) {

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

						this.TransferSave(this.transferArray);
					}
				}

			}

		},
		TransferSave: function(oList) {
			var that = this;
			var InputFields = this.getModel("InputsModel");
			var indexes = 	InputFields.getProperty("/Inputs/indexes");
			this.idxToPass = indexes.concat(this.selectedIndexTransferSave);
		

			var finalArray;
			finalArray = oList;
			if (this.idxToPass.length === 0) {
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
			InputFields.setProperty("/Inputs/indexes",[]);

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

		},
		CodesChange: function(oEvent) {
			var item = oEvent.getSource().getParent();
				var InputFields = this.getView().getModel("InputsModel");
			var idx = item.getIndex();
				var indexes = InputFields.getProperty("/Inputs/indexes");
			indexes.push(idx);
		
			InputFields.setProperty("/Inputs/isChanged", true);
				InputFields.setProperty("/Inputs/scope",this.getView().byId("WipDetailsSet2"));
		},
		
		
		
	LineItemTransferSelection: function(oEvent) {

			
		
		var rowCount = this.byId("WipDetailsSet3").getSelectedIndices();
			var rowLineItemTransferCOunt = [];
			var InputFields = this.getModel("InputsModel");
			
			for (var i = 0; i < rowCount.length; i++) {
			rowLineItemTransferCOunt.push(rowCount[i]);
			}
			this.getModel("InputsModel").setProperty("/Inputs/rowLineTransfersCount",rowLineItemTransferCOunt);

			

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
		
				onGlobalSearch:function(){
			
			
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

				

				var otable = this.byId("WipDetailsSet3");


				this.jsonModel.setData({
					modelData: result
				});
				otable.setModel(this.jsonModel);

				otable.bindRows("/modelData");
					this.jsonModel.setProperty("/RowCount3", result.length);

			
			
			
		},
			filter: function(oEvent) {

			

			oEvent.preventDefault();

			var value = oEvent.getParameters().value;

			var oFilter4 = new sap.ui.model.Filter(oEvent.getParameters().column.getFilterProperty(), sap.ui.model.FilterOperator.Contains,	value);

			this.byId("WipDetailsSet3").getBinding("rows").filter(oFilter4, "Application");

		}

		
					
		
		
		



	});

});