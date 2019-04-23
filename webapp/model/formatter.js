sap.ui.define([], function() {
	"use strict";

	return {

		/**
		 * Rounds the number unit value to 2 digits
		 * @public
		 * @param {string} sValue the number string to be rounded
		 * @returns {string} sValue with 2 digits rounded
		 */
		numberUnit: function(sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(2);
		},
		showItem: function(sValue) {
			if (sValue) {
				return true;
			}else{
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

	};

});