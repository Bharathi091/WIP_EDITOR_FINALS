sap.ui.define([
		"billedit/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("billedit.controller.NotFound", {

			/**
			 * Navigates to the worklist when the link is pressed
			 * @public
			 */
			onLinkPressed : function () {
				this.getRouter().navTo("worklist");
			}

		});

	}
);