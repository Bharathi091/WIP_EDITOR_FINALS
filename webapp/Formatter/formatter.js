sap.ui.define(["sap/ui/core/format/DateFormat"], function(DateFormat) {
	"use strict";
	return {
		isLineItemComments: function(WfComments) {
			if (WfComments) {
				return true;
			} else {
				return false;
			}
		},
		dateText: function(inputDate) {
			if (inputDate) {
				return sap.ui.core.format.DateFormat.getDateInstance({
					source: {
						pattern: "timestamp"
					},
					pattern: "dd.MM.yyyy"
				}).format(new Date(inputDate.match(/\d+/)[0] * 1));
			} else {
				return "";
			}
		},
		RemoveLeadingZeros: function(text) {
			if (text) {
				return text.replace(/\b0+/g, "");
			} else {
				return "";
			}

		}
	};
});