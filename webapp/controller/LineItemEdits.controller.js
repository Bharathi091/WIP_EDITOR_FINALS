sap.ui.define([
	"billedit/controller/BaseController",
	"billedit/Services/LineItemsServices",
	"billedit/Formatter/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(BaseController, LineItemsServices, formatter, JSONModel, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("billedit.controller.LineItemEdits", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf billedit.view.LineItemEdits
		 */
		formatter: formatter,
		onInit: function() {
			debugger;
			this.bus = sap.ui.getCore().getEventBus();
			this.bus.subscribe("lineItemEditsMode", "row", this._getButtonEvent, this);
			this.bus.subscribe("footerChannel", "footerButtons", this._getfooterButtonEvent, this);
		},
		enableButtons: function() {
			var aIndices = this.getView().byId("LinItemEditsTable").getSelectedIndices();

		},
		_getButtonEvent: function(narrativeMode, row, data) {
			debugger;
			this.BillEditModel = this.getModel("MatterModel");
			this.serviceInstance = LineItemsServices.getInstance();
			this.getLineItemsData(data['data']);
			var Btnviews = {
				homeView: false,
				headerEdit: false,
				narrativeEdits: false,
				LineItemEdits: true,
				LineItemTransfers: false
			};
			this.BillEditModel.setProperty("/Inputs/buttons/views", Btnviews);
		},
		refreshTable: function() {
			this.getLineItemsData(this.getLineItemsData(this.BillEditModel.getProperty("/Inputs/selectedRow")));
		},
		sortTheResultsfromArray: function(resultArray) {
			resultArray.results.sort(function compare(a, b) {
				return a.Posnr - b.Posnr;
			});
			return resultArray.results;
		},
		phaseCodesChange: function(oEvent) {
			debugger;
			var thisRow = oEvent.getSource().getBindingContext("MatterModel").getObject();
			var phaseCodeSelected = oEvent.getSource().getSelectedItem().getKey();
			var pspid = this.BillEditModel.getProperty("/LineItemEdits/0/Pspid");
			sap.ui.core.BusyIndicator.show(0);
			var that = this;

			$.when(that.serviceInstance.getTaskcodes(that.BillEditModel, phaseCodeSelected, that),
					that.serviceInstance.getActivitycodes(that.BillEditModel, thisRow, pspid, that),
					that.serviceInstance.getFFtaskcodes(that.BillEditModel, thisRow, pspid, that))
				.done(function(taskCodes, activityCodes, ffTskCodes) {
					sap.ui.core.BusyIndicator.hide(0);

					var isTask = that.BillEditModel.getProperty("/LineItemEdits/" + thisRow.index + "/Zztskcd");
					that.BillEditModel.setProperty("/LineItemEdits/" + thisRow.index + "/taskCodes", isTask.length ? [{
						TaskCodes: isTask,
						TaskCodeDesc: ""
					}].concat(taskCodes.results) : taskCodes.results);

					if (that.BillEditModel.getProperty("/LineItemEdits/" + thisRow.index + "/Zzphase") === that.BillEditModel.getProperty(
							"/LineItemEdits/" + thisRow.index + "/selectedPhaseCode")) {
						that.BillEditModel.setProperty("/LineItemEdits/" + thisRow.index + "/selectedTaskCode", that.BillEditModel.getProperty(
							"/LineItemEdits/" + thisRow.index + "/Zzphase"));
					} else {
						that.BillEditModel.setProperty("/LineItemEdits/" + thisRow.index + "/selectedTaskCode", that.BillEditModel.getProperty(
							"/LineItemEdits/" + thisRow.index + "/Zztskcd"));
					}
					var isAct = that.BillEditModel.getProperty("/LineItemEdits/" + thisRow.index + "/Zzactcd");
					that.BillEditModel.setProperty("/LineItemEdits/" + thisRow.index + "/actCodes", isAct.length ? [{
						ActivityCodes: isAct,
						ActivityCodeDesc: ""
					}].concat(activityCodes.results) : activityCodes.results);

					var isFFtsk = that.BillEditModel.getProperty("/LineItemEdits/" + thisRow.index + "/Zzfftskcd");
					that.BillEditModel.setProperty("/LineItemEdits/" + thisRow.index + "/ffTskCodes", isFFtsk.length ? [{
						FfTaskCodes: isFFtsk,
						FfTaskCodeDesc: ""
					}].concat(ffTskCodes.results) : ffTskCodes.results);
				});
		},
		getLineItemsData: function(Rowdata) {
			var Vbeln = Rowdata.Vbeln;
			var pspid = Rowdata.Pspid;
			this.showBusyIndicator();

			var that = this;

			$.when(that.serviceInstance.getLineItemsData(that.BillEditModel, Vbeln, that), that.serviceInstance
					.getPhaseCodes(that.BillEditModel, pspid, that), that.serviceInstance
					.getTaskcodes(that.BillEditModel, "", that), that.serviceInstance
					.getActivitycodes(that.BillEditModel, Rowdata, pspid, that), that.serviceInstance
					.getFFtaskcodes(that.BillEditModel, Rowdata, pspid, that))
				.done(function(lineItemsData, phaseCodes, taskCodes, activityCodes, ffTskCodes) {

					sap.ui.core.BusyIndicator.hide(0);

					if (lineItemsData.d.results.length > 0) {

						that.BillEditModel.setProperty("/LinetableResults", lineItemsData.d.results.length);
						//that.BillEditModel.setProperty("/LinetableResults", oData.d.results.length);
						var lineItems = that.sortTheResultsfromArray(lineItemsData.d);

						for (var i = 0; i < lineItems.length; i++) {
							
							debugger;

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
							}] : [];
							lineItems[i].index = i;
							lineItems[i].indeces = i;
							lineItems[i].selectedPhaseCode = lineItems[i].Zzphase;
							lineItems[i].selectedTaskCode = lineItems[i].Zztskcd;
							lineItems[i].selectedActCode = lineItems[i].Zzactcd;
							lineItems[i].selectedFFTaskCode = lineItems[i].Zzfftskcd;
							lineItems[i].selectedFFActCode = lineItems[i].Zzffactcd;
							lineItems[i].isRowEdited = false;

							lineItems[i].lineworkDate = sap.ui.core.format.DateFormat.getDateInstance({
								source: {
									pattern: "timestamp"
								},
								pattern: "dd.MM.yyyy"
							}).format(new Date(lineItems[i].Budat.match(/\d+/)[0] * 1));
							lineItems[i].Item = lineItems[i].Posnr.replace(/\b0+/g, '');
							lineItems[i].BaseQty = lineItems[i].BaseQty.toString();

						}

						that.BillEditModel.setProperty("/LineItemEdits", lineItems);

					} else {
						that.showAlert("Bill Edit", "No Data Found");
					}

				});

		},
		DialogClosedWithOk: function() {
			this._commentsDialog.close();

		},
		DialogClosedWithCancel: function() {
			this._commentsDialog.close();

		},
		_getCommentsDialog: function() {
			if (!this._commentsDialog) {
				this._commentsDialog = sap.ui.xmlfragment("dialogComment", "billedit.fragments.comments", this.getView().getController());

			}
			return this._commentsDialog;
		},
		comDialogClosedWithOk: function() {

			var selectedLines = this.getView().byId("LinItemEditsTable").getSelectedIndices();

			for (var c = 0; c < selectedLines.length; c++) {

				this.BillEditModel.setProperty("/LineItemEdits/" + selectedLines[c] + "/WfComments", sap.ui.core.Fragment.byId("dialogAddComment",
					"TypeHere").getValue());
			}
			this._addCommentsDialog.close();
		},
		LinecommentsMethod: function(oEvent) {
			sap.ui.core.BusyIndicator.show(0);
			var billEditSearchData = oEvent.getSource().getBindingContext("MatterModel").getObject();
			var that = this;

			that.serviceInstance.getWFComments(that.BillEditModel, billEditSearchData,that)
				.done(function(oData) {

					sap.ui.core.BusyIndicator.hide(0);

					var oDialog = that._getCommentsDialog();
					that.getView().addDependent(oDialog);
					oDialog.open();
					that._commentsDialog.setModel(new JSONModel(oData), "wfComments");

				})
				.fail(function() {
					sap.ui.core.BusyIndicator.hide(0);

				});

		},
		comDialogClosedWithCancel: function() {
			this._addCommentsDialog.close();
		},
		UpdateCodesCancel: function() {
			this._UpdateCodesDialog.close();
		},
		_getupdateCodesDialog: function() {
			if (!this._UpdateCodesDialog) {
				this._UpdateCodesDialog = sap.ui.xmlfragment("update", "billedit.fragments.Updatecodes", this.getView().getController());
			}
			return this._UpdateCodesDialog;
		},
		_getAddCommentsDialog: function() {
			if (!this._addCommentsDialog) {

				this._addCommentsDialog = sap.ui.xmlfragment("dialogAddComment", "billedit.fragments.Addcomments", this.getView().getController());

			}
			return this._addCommentsDialog;
		},
		
		open: function() {
debugger
			var aIndices = this.getView().byId("LinItemEditsTable").getSelectedIndices();
			var sMsg;
			if (aIndices.length < 1) {
				sMsg = "Please Select Atleast One item";
				this.showAlert("Bill Edit", sMsg);
			} else {

				var oView = this.getView();
				var oDialog = this._getupdateCodesDialog();
				oView.addDependent(oDialog);
				oDialog.open();

				sap.ui.core.Fragment.byId("update", "phaseCodeChk").setSelected(false);
				sap.ui.core.Fragment.byId("update", "taskCodeChk").setSelected(false);
				sap.ui.core.Fragment.byId("update", "ActivityCodeChk").setSelected(false);
				sap.ui.core.Fragment.byId("update", "FFTaskCodeChk").setSelected(false);
				sap.ui.core.Fragment.byId("update", "FFActCodeChk").setSelected(false);

				var updatesCodes = {
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

				this.selectedRows = new JSONModel(updatesCodes);

				var selectedrow = this.BillEditModel.getProperty("/LineItemEdits/" + aIndices[0]);

				this.selectedRows.setProperty("/phaseCodes", selectedrow.phaseCodes);
				this.selectedRows.setProperty("/taskCodes", selectedrow.taskCodes);
				this.selectedRows.setProperty("/actCodes", selectedrow.actCodes);
				this.selectedRows.setProperty("/ffTskCodes", selectedrow.ffTskCodes);
				this.selectedRows.setProperty("/ffActCodes", selectedrow.ffActCodes);
				this.selectedRows.setProperty("/rowData", selectedrow);
				this._UpdateCodesDialog.setModel(this.selectedRows, "updatesCodesModel");

			}

		},
		UpdateCodes: function() {

			var selectedLines = this.getView().byId("LinItemEditsTable").getSelectedIndices();

			this.UpdateCodesCancel();

			for (var c = 0; c < selectedLines.length; c++) {

				var phaseCodeChk = sap.ui.core.Fragment.byId("update", "phaseCodeChk").getSelected();
				var taskCodeChk = sap.ui.core.Fragment.byId("update", "taskCodeChk").getSelected();
				var ActivityCodeChk = sap.ui.core.Fragment.byId("update", "ActivityCodeChk").getSelected();
				var FFTaskCodeChk = sap.ui.core.Fragment.byId("update", "FFTaskCodeChk").getSelected();
				var FFActCodeChk = sap.ui.core.Fragment.byId("update", "FFActCodeChk").getSelected();

				if (phaseCodeChk === true) {
					this.BillEditModel.setProperty("/LineItemEdits/" + selectedLines[c] + "/phaseCodes", this.selectedRows.getProperty(
						"/phaseCodes"));
					this.BillEditModel.setProperty("/LineItemEdits/" + selectedLines[c] + "/selectedPhaseCode", sap.ui.core.Fragment.byId("update",
						"selectedPhaseCode").getSelectedKey());
					this.BillEditModel.setProperty("/LineItemEdits/" + selectedLines[c] + "/isRowEdited", true);

				}
				if (taskCodeChk === true) {

					this.BillEditModel.setProperty("/LineItemEdits/" + selectedLines[c] + "/taskCodes", this.selectedRows.getProperty(
						"/taskCodes"));
					this.BillEditModel.setProperty("/LineItemEdits/" + selectedLines[c] + "/selectedTaskCode", sap.ui.core.Fragment.byId("update",
						"selectedTaskCode").getSelectedKey());
					this.BillEditModel.setProperty("/LineItemEdits/" + selectedLines[c] + "/isRowEdited", true);
				}
				if (ActivityCodeChk === true) {

					this.BillEditModel.setProperty("/LineItemEdits/" + selectedLines[c] + "/actCodes", this.selectedRows.getProperty(
						"/actCodes"));
					this.BillEditModel.setProperty("/LineItemEdits/" + selectedLines[c] + "/selectedActCode", sap.ui.core.Fragment.byId("update",
						"selectedActCode").getSelectedKey());
					this.BillEditModel.setProperty("/LineItemEdits/" + selectedLines[c] + "/isRowEdited", true);

				}
				if (FFTaskCodeChk === true) {

					this.BillEditModel.setProperty("/LineItemEdits/" + selectedLines[c] + "/ffTskCodes", this.selectedRows.getProperty(
						"/ffTskCodes"));
					this.BillEditModel.setProperty("/LineItemEdits/" + selectedLines[c] + "/selectedFFTaskCode", sap.ui.core.Fragment.byId("update",
						"selectedFFTaskCode").getSelectedKey());
					this.BillEditModel.setProperty("/LineItemEdits/" + selectedLines[c] + "/isRowEdited", true);
				}
				if (FFActCodeChk === true) {

					this.BillEditModel.setProperty("/LineItemEdits/" + selectedLines[c] + "/ffActCodes", this.selectedRows.getProperty(
						"/ffActCodes"));
					this.BillEditModel.setProperty("/LineItemEdits/" + selectedLines[c] + "/selectedFFActCode", sap.ui.core.Fragment.byId("update",
						"selectedFFActCode").getSelectedKey());
					this.BillEditModel.setProperty("/LineItemEdits/" + selectedLines[c] + "/isRowEdited", true);
				}

			}
		},
		
		_getfooterButtonEvent: function(footerChannel, footerButtons, data) {
			if (data.tab === "Line") {
				if (data.button === "Comments") {
					var aIndices = this.getView().byId("LinItemEditsTable").getSelectedIndices();
					var sMsg;
					if (aIndices.length < 1) {
						sMsg = "Please Select Atleast One item";
						this.showAlert("Bill Edit", sMsg);
					} else {
						var oDialog = this._getAddCommentsDialog();
						this.getView().addDependent(oDialog);
						oDialog.open();
						var selectedrow = this.BillEditModel.getProperty("/LineItemEdits/" + aIndices[0]);
						console.log(selectedrow);
					}

				}
				 if (data.button === "update") {
					
					debugger

					this.open();

				}
			

			}

		}

	});

});