sap.ui.define([
	"zprs/wipeditor/controller/BaseController",
	"zprs/wipeditor/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/json/JSONModel",
	"zprs/wipeditor/services/LineItemsServices",
	"sap/m/MessageBox"

], function(BaseController, formatter, Filter, JSONModel, LineItemsServices, MessageBox) {
	"use strict";

	return BaseController.extend("zprs.wipeditor.controller.LineItemEdits", {
		formatter: formatter,
		onInit: function() {
			

			this.bus = sap.ui.getCore().getEventBus();

			this.bus.subscribe("homeChannelLineItemEdits", "toSummaryEditLineItem", this.lineItemEditsData, this);

			this.jsonModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(this.jsonModel, "JSONModel");
			this.rowLineItemCount = [];
			this.indexes = [];

		},
		lineItemEditsData: function(homeChannelLineItemEdits, toSummaryEditLineItem, data) {
				if(!data.button){

			var InputFields = this.getModel("InputsModel");
			var results = InputFields.getProperty("/Inputs/homeTable");
			this.jsonModel.setProperty("/modelData", results);
			var Otable = this.getView().byId("WipDetailsSet2");
			Otable.setModel(this.jsonModel);
			this.jsonModel.setProperty("/RowCount2", results.length);
		
			Otable.bindRows("/modelData");
		
			this.byId("searchText").setValue("");
			this.data(results);
				
		
			var OtableSmart0 = this.getView().byId("smartTable_ResponsiveTable2");
			var that = this;
			var oPersButton = OtableSmart0._oTablePersonalisationButton;
			oPersButton.attachPress(function() {

				var oPersController = OtableSmart0._oPersController;
				var oPersDialog = oPersController._oDialog;

				oPersDialog.attachOk(function(oEvent) {

					setTimeout(function() {

						that.jsonModel.setProperty("/modelData", that.getModel("InputsModel").getProperty("/Inputs/homeTable"));
						var Otablenew = that.getView().byId("WipDetailsSet2");
						Otablenew.bindRows("/modelData");
					}, 1000);

				});

			});
				var tableLineEdits = this.getView().byId("WipDetailsSet2");

			var index = this.getModel("InputsModel").getProperty("/Inputs/rowLineCount");
			for (var i = 0; i < index.length; i++) {
				tableLineEdits.getRows()[index[i]].getCells()[0].setVisible(false);
				tableLineEdits.getRows()[index[i]].getCells()[1].setVisible(true);

			}
			InputFields.setProperty("/Inputs/indexes",[]);
			var change = InputFields.getProperty("/Inputs/isChanged");

			if (change === true ) {

				this._Dialog = sap.ui.xmlfragment("zprs.wipeditor.Fragments.Fragment", this);
				this._Dialog.open();
			} else  {
			

				this.ReloadTable();


			}
				}
				else {
			if(data.button === "Reviewed" || data.button === "Unreview"){
						this.ReviewUnreview(data.button);
					} else if(data.button === "Modify/Reverse"){
						this.onModifyReverse(data.button);
					} else if(data.button === "Updatecodes"){
						this.onUpdateCodes();
					} else if(data.button === "Save"){
						this.onLineItemEditsSave();
					}
			
	
}
		
		},

		ReviewUnreview: function(button) {
			

			var text = button;
			var tableLineEdits = this.getView().byId("WipDetailsSet2");
		
			var selectedLines = this.getModel("InputsModel").getProperty("/Inputs/rowLineCount");
			for (var i = 0; i < selectedLines.length; i++) {
				tableLineEdits.getRows()[selectedLines[i]].getCells()[0].setVisible(true);
				tableLineEdits.getRows()[selectedLines[i]].getCells()[1].setVisible(false);
				if (text === "Reviewed") {
					tableLineEdits.getRows()[selectedLines[i]].getCells()[0].setTooltip("Reviewed");
				} else {
					tableLineEdits.getRows()[selectedLines[i]].getCells()[0].setTooltip("Unreviewed");
				}

			}
			var oTable = [];
		

			var otable = this.byId("WipDetailsSet2");

			$.each(selectedLines, function(k, o) {
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
		LineItemEditsSelection: function() {

			var rowCount = this.byId("WipDetailsSet2").getSelectedIndices();
			var rowLineCount = [];
			var InputFields = this.getModel("InputsModel");

			for (var i = 0; i < rowCount.length; i++) {
				rowLineCount.push(rowCount[i]);
			}
			this.getModel("InputsModel").setProperty("/Inputs/rowLineCount", rowLineCount);

			if (rowCount.length === 1) {

				InputFields.setProperty("/Inputs/ToolbarEnable/LineItemReviewed", true);
				InputFields.setProperty("/Inputs/ToolbarEnable/LineItemUnreview", true);
				InputFields.setProperty("/Inputs/ToolbarEnable/LineItemUpdatecodes", true);
				
				InputFields.setProperty("/Inputs/ToolbarEnable/Modify_Reverse", true);
			

			} else if (rowCount.length > 1) {
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
			var table = this.getView().byId("WipDetailsSet2");
			var that = this;
			this.byId("searchText").setValue("");
			var InputFields = this.getModel("InputsModel");

			var Pspid = InputFields.getProperty("/Inputs/rootPspid");

			var odatefrom = InputFields.getProperty("/Inputs/odatefrom");
			var odateto = InputFields.getProperty("/Inputs/odateto");
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

			InputFields.setProperty("/Inputs/isChanged", false);
				InputFields.setProperty("/Inputs/scope", "");
					var tableLineEdits = this.getView().byId("WipDetailsSet2");

			var index = this.getModel("InputsModel").getProperty("/Inputs/rowLineCount");
			for (var i = 0; i < index.length; i++) {
				tableLineEdits.getRows()[index[i]].getCells()[0].setVisible(false);
				tableLineEdits.getRows()[index[i]].getCells()[1].setVisible(true);

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
				var Otable1 = that.getView().byId("WipDetailsSet2");
				that.jsonModel.setProperty("/modelData", lineItems);
				Otable1.setModel(that.jsonModel);
				Otable1.bindRows("/modelData");
			});

		},

		phaseCodesChange: function(oEvent) {
			

			var item = oEvent.getSource().getParent();
			var idx = item.getIndex();
			var thisRow = oEvent.getSource().getParent().getParent().getContextByIndex(idx).getObject();
			this.narIndices.push(idx);
			var phaseCodeSelected = oEvent.getSource().getSelectedItem().getKey();
			var InputFields = this.getView().getModel("InputsModel");

			
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
			InputFields.setProperty("/Inputs/isChanged", true);
				InputFields.setProperty("/Inputs/scope", this.getView().byId("WipDetailsSet2"));
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

			});
			InputFields.setProperty("/Inputs/isChanged", true);
		
			InputFields.setProperty("/Inputs/scope", this.getView().byId("WipDetailsSet2"));

		},

		onUpdateCodes: function() {
			

			var indices = this.getView().byId("WipDetailsSet2").getSelectedIndices();
		
			
			var InputFields = this.getView().getModel("InputsModel");
			var indexes = InputFields.getProperty("/Inputs/indexes");
			for (var j = 0; j < indices.length; j++) {
				indexes.push(indices[j]);
			}

			var sMsg;
			var check = false;
			if (indices.length < 1) {
				sMsg = "Please Select Atleast One item";
				this.showAlert("WIP Edit", sMsg);

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

					var selectedrow = this.jsonModel.getProperty("/modelData/" + indices[0]);

				
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
		
			var that = this;
			this.serviceInstance = LineItemsServices.getInstance();

			$.when(
				that.serviceInstance.getFFActivitycodes(InputFields, ffTaskcodeselected, pspid, that)
			)

			.done(function(updateffActCodes) {

				that.selectedRows.setProperty("/ffActCodes", updateffActCodes.results);

			});
		},

		onModifyReverse: function(button) {

			var oTable = this.getView().byId("smartTable_ResponsiveTable2").getTable();

			var oBinding = oTable.getBinding("rows");
		
	var selectedLines = this.getModel("InputsModel").getProperty("/Inputs/rowLineCount");
			// this.selectedIndex = oTable.getSelectedIndex();
			this.ctx = oTable.getContextByIndex(selectedLines);
			this.m = this.ctx.getObject();
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
		ModifyReverseSave: function(oModel) {
			var res = [];
			var ChangedTableData = [];
			this.Action = "MODIFY";
			this.newHours = sap.ui.core.Fragment.byId("modifyReverse", "newHours").getValue();
			this.jsonModel.setProperty("/Megbtr", this.newHours);
			this.jsonModel.setProperty("/Megbtr", sap.ui.core.Fragment.byId("modifyReverse", "newHours").getValue());
			var modrevData = this.jsonModel["oData"]["modelData"];

			var ChangedTableDat = modrevData[this.selectedIndex];
			ChangedTableDat.Megbtr = this.newHours;
			ChangedTableDat.Action = this.Action;
			ChangedTableData.push(ChangedTableDat);
		
			this.makeBatchCallsModify(ChangedTableData, oModel);
			sap.ui.core.Fragment.byId("modifyReverse", "newHours").setValue("");
			this._getModifyDialog().close();
			var InputFields = this.getView().getModel("InputsModel");
			InputFields.setProperty("/Inputs/isChanged", true);
				InputFields.setProperty("/Inputs/scope",this.getView().byId("WipDetailsSet2"));

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
							icon: sap.m.MessageBox.Icon.SUCCESS,
							title: "Save",
							actions: [sap.m.MessageBox.Action.OK]
						}
					);
					that.hideShow();
				
					jsonModel.setProperty("/modelData", oData.results);

				}
			});
		},

		onLineItemEditsSave: function() {
			var that = this;
		
			var saveObjects = this.getModel("InputsModel").getProperty("/Inputs/saveObjects");
			var indexes = this.getModel("InputsModel").getProperty("/Inputs/indexes");
			var data = this.getModel("InputsModel").getProperty("/Inputs/homeTable");
			$.each(indexes, function(i, o) {
				var rowdat = data[o];
				saveObjects.push(rowdat);
			});
		
			this.getModel("InputsModel").setProperty("/Inputs/indexes",[]); 
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
			this.getModel("InputsModel").setProperty("/Inputs/saveObjects",[]); 

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

			var otable = this.byId("WipDetailsSet2");

			this.jsonModel.setData({
				modelData: result
			});
			otable.setModel(this.jsonModel);

			otable.bindRows("/modelData");
			this.jsonModel.setProperty("/RowCount2", result.length);

		},
		CodesChange: function(oEvent) {
			
			var item = oEvent.getSource().getParent();
				var InputFields = this.getView().getModel("InputsModel");
			var idx = item.getIndex();
				var indexes = InputFields.getProperty("/Inputs/indexes");
			indexes.push(idx);
		
			InputFields.setProperty("/Inputs/isChanged", true);
				InputFields.setProperty("/Inputs/scope",this.getView().byId("WipDetailsSet2"));
				this.jsonModel.setProperty("/modelData",this.getModel("InputsModel").getProperty("/Inputs/homeTable"));
				
		},
		filter: function(oEvent) {

			oEvent.preventDefault();

			var value = oEvent.getParameters().value;

			var oFilter4 = new sap.ui.model.Filter(oEvent.getParameters().column.getFilterProperty(), sap.ui.model.FilterOperator.Contains,
				value);

			this.byId("WipDetailsSet2").getBinding("rows").filter(oFilter4, "Application");

		}

	

	});

})