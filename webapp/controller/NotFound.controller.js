sap.ui.define([
		"zprs/wipeditor/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("zprs.wipeditor.controller.NotFound", {

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