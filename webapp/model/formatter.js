sap.ui.define([], function() {
	"use strict";

	return {
		/**
		 * Rounds the currency value to 2 digits
		 *
		 * @public
		 * @param {string} sValue value to be formatted
		 * @returns {string} formatted currency value with 2 digits
		 */
		currencyValue: function(sValue) {
			if (!sValue) {
				return "";
			}

			return parseFloat(sValue).toFixed(2);
		},
		editablefunction: function(sValue) {
			

			if (sValue) {
				return true;
			} else {
				return false;

			}
		},

		isReviewByStatus: function(svalue) {
			var value = "";
			if (svalue === "Reviewed" || svalue === "X") {
				value = "Reviewed";
				this.type = "Accept";
			} else {
				value = "";
				this.type = "Default";

			}
			return value;
		},
			isReviewByStatusEdits: function(svalue) {
			var value = "";
			if (svalue === "X") {
				value = "Reviewed";
				this.type = "Accept";
			} else {
				value = "";
				this.type = "Default";

			}
			return value;
		},
		isInfo: function(svalue) {

		
			var value = "";
			if (svalue === "X") {
				value = "red";
			} else if (svalue === "Y") {
				value = "green";

			} else {
				value = "";
			}
			return value;
		},
		fixeddecimal: function(TransVal, sValue) {
			
			if (TransVal !== "SOFTCOST" && TransVal !== "HARDCOST") {
				return parseFloat(sValue).toFixed(2);
			} else {
				return parseFloat(sValue).toFixed(0);
			}
		},
		RemoveDecimalZeros: function(sValue) {

			if (parseInt(sValue) === 0) {
				return "";
			} else {
				return sValue;
			}

		},
		removeLeadingZeros: function(svalue) {
			if (parseInt(svalue) === 0) {
				return "";
			} else {
				return parseInt(svalue).toString();
			}
		},
	};

});