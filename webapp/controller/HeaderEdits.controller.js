sap.ui.define([
	"billedit/controller/BaseController",
	"billedit/model/ReportModel"
], function(BaseController, ReportModel) {
	"use strict";

	return BaseController.extend("billedit.controller.HeaderEdits", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf billedit.view.HeaderEdits
		 */
		onInit: function() {
			this.bus = sap.ui.getCore().getEventBus();
			this.bus.subscribe("headerEditMode", "row", this._getButtonEvent, this);

		},
		_getButtonEvent: function(narrativeMode, row, data) {
			this.BillEditModel = this.getModel("MatterModel");
			if (data && data['data']) {
				var innerArray = [];
				var obj = data['data'];
				console.log(obj);
				innerArray.push(obj);
				var rowData = {
					"results": innerArray
				};
				this.BillEditModel.setProperty("/Inputs/headerEditData", rowData);
				var Btnviews={
						homeView:false,
						headerEdit:true,
						narrativeEdits:false,
						LineItemEdits:false,
						LineItemTransfers:false
					};
			    this.BillEditModel.setProperty("/Inputs/buttons/views", Btnviews);
			
			}

		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf billedit.view.HeaderEdits
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf billedit.view.HeaderEdits
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf billedit.view.HeaderEdits
		 */
		//	onExit: function() {
		//
		//	}

	});

});