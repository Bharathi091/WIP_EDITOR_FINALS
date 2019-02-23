sap.ui.define([
		"wip/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("wip.controller.NotFound", {

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