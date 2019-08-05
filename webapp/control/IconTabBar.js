/*global wrkflwui:true*/
/* eslint-disable sap-no-ui5base-prop */

sap.ui.define([
	"sap/m/IconTabHeader"
], function(IconTabHeader) {
	"use strict";

	return IconTabHeader.extend("wrkflwui.control.IconTabHeader", {
		init: function() {
			if (sap.m.IconTabHeader.prototype.init) {
				sap.m.IconTabHeader.prototype.init.apply(this, arguments);
			}
		},
		setSelectedItem: function(oItem) {
			if (this.getSelectedKey() === oItem.mProperties.key) {
				return;
			}
			if (!this.validateTab(oItem.mProperties.key)) {
				return;
			}
			if (sap.m.IconTabHeader.prototype.setSelectedItem) {
				sap.m.IconTabHeader.prototype.setSelectedItem.apply(this, arguments);
			}
		},
		renderer: {}
	});

});

sap.ui.define(["sap/m/IconTabBar"],

	function(IconTabBar) {
		return IconTabBar.extend("wrkflwui.control.IconTabBar", {
			metadata: {
				aggregations: {
					_header: {
						type: 'wrkflwui.control.IconTabHeader',
						multiple: false,
						visibility: 'hidden'
					}
				}
			},
			_getIconTabHeader: function() {
				var c = this.getAggregation('_header');
				if (!c) {
					c = new wrkflwui.control.IconTabHeader(this.getId() + '--header', {});
					this.setAggregation('_header', c, true);
				}
				return c;
			},
			renderer: {}
		});
	});