/* global _:true */
sap.ui.define([
	"billedit/controller/BaseController",
	"billedit/Services/LineItemsServices"
], function(BaseController, LineItemsServices) {
	"use strict";

	return BaseController.extend("billedit.controller.NarrativeEdits", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf billedit.view.NarrativeEdits
		 */
		onInit: function() {

			this.bus = sap.ui.getCore().getEventBus();
			this.bus.subscribe("narrativeMode", "row", this._getButtonEvent, this);
			this.bus.subscribe("footerChannel", "footerButtons", this._getfooterButtonEvent, this);
		},
		_getButtonEvent: function(narrativeMode, row, data) {
			this.BillEditModel = this.getModel("MatterModel");
			this.serviceInstance = LineItemsServices.getInstance();
			var Btnviews = {
				homeView: false,
				headerEdit: false,
				narrativeEdits: true,
				LineItemEdits: false,
				LineItemTransfers: false
			};
			this.BillEditModel.setProperty("/Inputs/buttons/views", Btnviews);
			this.BillEditModel.setProperty("/replaceItems", []);

			this.getLineItemsData(data['data'].Vbeln);
		},
		refreshTable: function() {
			this.getLineItemsData(this.BillEditModel.getProperty("/Inputs/selectedRow/Vbeln"));
		},
		getLineItemsData: function(Vbeln) {

			this.showBusyIndicator();

			var that = this;
			that.serviceInstance.getLineItemsData(this.BillEditModel, Vbeln, that)
				.done(function(oData) {
					that.hideBusyIndicator();

					if (oData.d.results.length > 0) {
						that.BillEditModel.setProperty("/LinetableResults", oData.d.results.length);
						var lineItems = oData.d;
						lineItems.results.sort(function compare(a, b) {
							return a.Posnr - b.Posnr;
						});

						$.each(lineItems.results, function(index) {

							lineItems.results[index].lineworkDate = sap.ui.core.format.DateFormat.getDateInstance({
								source: {
									pattern: "timestamp"
								},
								pattern: "dd.MM.yyyy"
							}).format(new Date(lineItems.results[index].Budat.match(/\d+/)[0] * 1));
							lineItems.results[index].Item = lineItems.results[index].Posnr.replace(/\b0+/g, '');
							lineItems.results[index].BaseQty = lineItems.results[index].BaseQty.toString();
							lineItems.results[index].msg = true;
							lineItems.results[index].showReview = false;
							lineItems.results[index].Index = index;
							if (lineItems.results[index].Zzreview.toUpperCase() === 'X') {
								lineItems.results[index].showReview = true;
							}

						});

						that.BillEditModel.setProperty("/Lineitems", lineItems);
						var Lineitems = that.BillEditModel.getProperty("/Lineitems");
						var LineitemsCopy = that.BillEditModel.getProperty("/Lineitems");
						$.extend({}, Lineitems, LineitemsCopy);
						that.BillEditModel.setProperty("/LineitemsCopy", LineitemsCopy);
					} else {
						that.showAlert("Work Flow", "No Data Found");
					}

				})
				.fail(function() {

					that.hideBusyIndicator();

				});
		},
		replaceWordsOpen: function() {

			var aIndices = this.getView().byId("lineTable").getSelectedIndices();
			var sMsg;
			if (aIndices.length < 1) {
				sMsg = "Please Select Atleast One item";
				this.showAlert("Bill Edit", sMsg);
			} else {
				this.BillEditModel.setProperty("/replaceItems", []);
				var oView = this.getView();
				var oDialog = this._getreplaceWordssDialog();
				oView.addDependent(oDialog);
				oDialog.open();
			}
		},
		Replace: function() {

		},
		DialogClosedWithOk: function() {
			this._replaceWordsDialog.close();

		},
		_getreplaceWordssDialog: function() {
			if (!this._replaceWordsDialog) {
				this._replaceWordsDialog = sap.ui.xmlfragment("replace", "billedit.fragments.replaceWords", this.getView().getController());
			}
			return this._replaceWordsDialog;
		},
		_getfooterButtonEvent: function(footerChannel, footerButtons, data) {
				if (data.tab === "Narrative") {
			if (data.button === "replaceWords") {
				this.replaceWordsOpen();
			}
			if (data.button === "review") {
				this.ReviewUnReview('X');
			}
			if (data.button === "unreview") {
				this.ReviewUnReview('');
			}
			if (data.button === "save") {
				this.save();
			}
				}

		},
		save: function() {
			var transferitemsCpy = this.BillEditModel.getProperty("/LineitemsCopy/results");
			var indices = [];
			_.each(transferitemsCpy, function(item) {
				if (item.isRowEdited) {

					indices.push(item.Index);
				}
			});
				this.showBusyIndicator();
			var transferitems = _.filter(transferitemsCpy, function(o) {
				return o.isRowEdited;
			});
			var detaildata = [];
			var sMsg = '';
			if (transferitems.length < 1) {
				sMsg = "Please change Atleast One item";
				this.showAlert("Bill Edit", sMsg);
			} else {
				if (transferitems.length !== 0) {
					_.each(transferitems, function(item) {
						var ip_data = $.extend({}, item);
						delete ip_data.__metadata;
						delete ip_data.DBToStatus;
						delete ip_data.taxlistcopy;
						delete ip_data.FileList;
						delete ip_data.info;
						delete ip_data.imagedisplay;
						delete ip_data.isRowEdited;
						delete ip_data.isRowEditedValid;
						delete ip_data.isSelect;
						delete ip_data.ToVbeln;
						delete ip_data.ToPhase;
						delete ip_data.Ffactivitycodesdetails;
						delete ip_data.taxlistcopy;
						delete ip_data.taskcodesdetails;
						delete ip_data.activitycodesdetails;
						delete ip_data.Fftaskcodesdetails;
						delete ip_data.ToMatter;
						//new items
						delete ip_data.lineworkDate;
						delete ip_data.msg;
						delete ip_data.color;
						delete ip_data.src;
						delete ip_data.Item;
						delete ip_data.showReview;
						delete ip_data.Index;

						ip_data.ToMegbtr = ip_data.ToMegbtr.toString();
						ip_data.ToWtgbtr = ip_data.ToWtgbtr.toString();
						detaildata.push(ip_data);
					});
console.log(detaildata);
					var jsontopush = $.extend({}, this.BillEditModel.getProperty("/Inputs/selectedRow"));

					jsontopush.Audat = this.convertToJSONDate(jsontopush.Audat);
					jsontopush.Bstdk = this.convertToJSONDate(jsontopush.Bstdk);
					jsontopush['OrderItemSet'] = detaildata;

					var that = this;
					that.serviceInstance.saveBillDetailOrderItemSet(that.BillEditModel, jsontopush, 'LINEEDIT', that)
						.done(function(oData) {
							that.hideBusyIndicator();
							var LineitemsCopy = that.BillEditModel.getProperty("/LineitemsCopy/results");
							if (oData) {
								that.hideBusyIndicator();
								if (!(_.isUndefined(oData))) {
									var results = oData;
									var message = results.Message;
									//set only for changed rows
									that.showAlert("Bill Edit", message);
									_.each(indices, function(item) {
										
										LineitemsCopy[item].info = message;
										LineitemsCopy[item].msg = true;

										if (LineitemsCopy[item].info.indexOf("ERROR") !== -1 || LineitemsCopy[item].info.indexOf("Error") !== -1 ||
											LineitemsCopy[item].info.indexOf("error") !== -1) {
											LineitemsCopy[item].src ='sap-icon://alert';
											LineitemsCopy[item].color = 'red';
										} else {
											if (results.Iserror !== 'X') {
												LineitemsCopy[item].src = 'sap-icon://alert';
												LineitemsCopy[item].color = 'green';
											} else {
												LineitemsCopy[item].src = 'sap-icon://alert';
												LineitemsCopy[item].color = 'red';
											}
										}
										if(indices.length===item-1){
											that.BillEditModel.setProperty("/LineitemsCopy/results", LineitemsCopy);
											that.BillEditModel.setProperty("/Lineitems/results", LineitemsCopy);
										}

									});

								}
								if (!(_.isUndefined(oData.error))) {

									_.each(indices, function(item) {

										LineitemsCopy[item].info = oData.error.message.value;
										LineitemsCopy[item].msg = true;
										LineitemsCopy[item].color = 'red';
										LineitemsCopy[item].src = 'sap-icon://alert';

									});

								}

								that.BillEditModel.setProperty("/LineitemsCopy/results", LineitemsCopy);
								that.BillEditModel.setProperty("/Lineitems/results", LineitemsCopy);
								that.refreshTable();
							}

						})
						.fail(function() {

							that.hideBusyIndicator();

						});

				}
			}

		},
		changeNarrative: function(oEvent) {
			var thisRow = oEvent.getSource().getBindingContext("MatterModel").getObject();
			thisRow.isRowEdited = true;
			thisRow.Narrativechange='X';

		},
		ReviewUnReview: function(type) {

			var aIndices = this.getView().byId("lineTable").getSelectedIndices();
			var sMsg;
			if (aIndices.length < 1) {
				sMsg = "Please Select Atleast One item";
				this.showAlert("Bill Edit", sMsg);
			} else {

				this.showBusyIndicator();
				var transferitemsCpy = this.getView().byId("lineTable").getSelectedIndices();
				var LineitemsCopy = this.BillEditModel.getProperty("/LineitemsCopy/results");

				if (type === 'X') {
					_.each(transferitemsCpy, function(item) {
						LineitemsCopy[item].Zzreview = "X";
						LineitemsCopy[item].isRowEdited = true;
					});
				} else {
					_.each(transferitemsCpy, function(item) {
						LineitemsCopy[item].Zzreview = "";
						LineitemsCopy[item].isRowEdited = true;
					});
				}
				this.BillEditModel.setProperty("/LineitemsCopy/results", LineitemsCopy);

				var detaildata = [];

				var transferitems = _.filter(this.BillEditModel.getProperty("/LineitemsCopy/results"), function(o) {
					return o.isRowEdited;
				});

				if (transferitems.length !== 0) {
					_.each(transferitems, function(item) {
						var ip_data = $.extend({}, item);
						delete ip_data.__metadata;
						delete ip_data.DBToStatus;
						delete ip_data.taxlistcopy;
						delete ip_data.FileList;
						delete ip_data.info;
						delete ip_data.imagedisplay;
						delete ip_data.isRowEdited;
						delete ip_data.isRowEditedValid;
						delete ip_data.isSelect;
						delete ip_data.ToVbeln;
						delete ip_data.ToPhase;
						delete ip_data.Ffactivitycodesdetails;
						delete ip_data.taxlistcopy;
						delete ip_data.taskcodesdetails;
						delete ip_data.activitycodesdetails;
						delete ip_data.Fftaskcodesdetails;
						delete ip_data.ToMatter;
						//new items
						delete ip_data.lineworkDate;
						delete ip_data.msg;
						delete ip_data.color;
						delete ip_data.src;
						delete ip_data.Item;
						delete ip_data.showReview;
						delete ip_data.Index;

						ip_data.ToMegbtr = ip_data.ToMegbtr.toString();
						ip_data.ToWtgbtr = ip_data.ToWtgbtr.toString();
						detaildata.push(ip_data);
					});

					var jsontopush = $.extend({}, this.BillEditModel.getProperty("/Inputs/selectedRow"));

					jsontopush.Audat = this.convertToJSONDate(jsontopush.Audat);
					jsontopush.Bstdk = this.convertToJSONDate(jsontopush.Bstdk);
					jsontopush['OrderItemSet'] = detaildata;

					var that = this;
					that.serviceInstance.saveBillDetailOrderItemSet(that.BillEditModel, jsontopush, 'LINEEDIT', that)
						.done(function(oData) {
							that.hideBusyIndicator();
						//	var LineitemsCopy = that.BillEditModel.getProperty("/LineitemsCopy/results");
							if (oData) {

								if (!(_.isUndefined(oData))) {
									var results = oData;

									_.each(transferitemsCpy, function(item) {
										var message = results.Message;
										
										LineitemsCopy[item].info = message;
										LineitemsCopy[item].msg = true;

										// if (LineitemsCopy[item].info.indexOf("ERROR") !== -1 || LineitemsCopy[item].info.indexOf("Error") !== -1 ||
										// 	LineitemsCopy[item].info.indexOf("error") !== -1) {
										// 	LineitemsCopy[item].src = './assets/images/img_alert_split-screen.png';
										// 	LineitemsCopy[item].color = 'red';
										// } else {
										// 	if (results.Iserror !== 'X') {
										// 		LineitemsCopy[item].src = 'sap-icon://message-warning';
										// 		LineitemsCopy[item].color = 'green';
										// 	} else {
										// 		LineitemsCopy[item].src = 'sap-icon://message-warning';
										// 		LineitemsCopy[item].color = 'red';
										// 	}
										// }

									});
								}
								if (!(_.isUndefined(oData.error))) {
									for (var j = 0; j < LineitemsCopy.results.length; j++) {
										// LineitemsCopy[j].info = oData.error.message.value;
										// LineitemsCopy[j].msg = true;
										// LineitemsCopy[j].color = 'red';
										// LineitemsCopy[j].src = 'sap-icon://message-warning';
									}
								}

								that.BillEditModel.setProperty("/LineitemsCopy/results", LineitemsCopy);
								that.BillEditModel.setProperty("/Lineitems/results", LineitemsCopy);
								that.refreshTable();
							}

						})
						.fail(function() {

							that.hideBusyIndicator();

						});

				}
			}
		},
		replaceAllele: function(str, target, replacement, word) {
			if (word) {
				return str.split(target).join(replacement);
			} else {
				return str.replace(target, "$1" + replacement);
			}
		},

		ReplaceSelected: function(oEvent) {
			if (sap.ui.core.Fragment.byId("replace", "replaceTxt").getValue().trim() !== '') {
				this.addToReplace();
			}
			var LineitemsCopy = this.BillEditModel.getProperty("/LineitemsCopy/results");
			var replaceItems = this.BillEditModel.getProperty("/replaceItems");
			var that = this;
			_.each(replaceItems, function(item) {

				if (item.isSelect) {
					var narrativeswithwords = _.filter(LineitemsCopy, function(o) {

						return o.Narrative.indexOf(item.word) > -1;
					});
					var narrativeswithwordsforalert = _.filter(narrativeswithwords, function(o) {
						return o.Narrative.indexOf(item.word) > -1;
					});
					_.each(narrativeswithwords, function(itemwords) {

						var index = _.findIndex(LineitemsCopy, itemwords);

						var indexofele = LineitemsCopy[index].Narrative.indexOf(item.word);
						var word = item.word;
						var replace = item.replace;
						var replaceelement = true;
						if (item.isSelectWord) {
							var find = word.replace(/[-\\()\[\]{}^$*+.?|]/g, '\\$&');
							word = new RegExp('(\\s|^)(?:' + find + ')(?=\\s|$)', "g");
							// word = new RegExp('\\b' + item.word + '\\b', "g")
							replaceelement = false;
						}
						//  $scope.matterLineItemDetaillistCopy[index].Narrative = $scope.matterLineItemDetaillistCopy[index].Narrative.replaceAll(item.word, item.replace);
						LineitemsCopy[index].Narrative = that.replaceAllele(LineitemsCopy[index].Narrative, word, item.replace, replaceelement);

						LineitemsCopy[index].Narrativechange = 'X';
						LineitemsCopy[index].isRowEdited = true;
					});

				}
			});

			that.BillEditModel.setProperty("/LineitemsCopy/results", LineitemsCopy);

			that.DialogClosedWithOk();

		},
		deleteRow: function(oEvent) {

			var replaceItems = this.BillEditModel.getProperty("/replaceItems");
			replaceItems.splice(oEvent.getSource().getBindingContext("MatterModel").getObject(), 1);
			this.BillEditModel.setProperty("/replaceItems", replaceItems);
			if (replaceItems.length === 0) {
				sap.ui.core.Fragment.byId("replace", "replaceTable").setVisible(false);
			}

		},
		addToReplace: function(oController) {
			sap.ui.core.Fragment.byId("replace", "replaceTable").setVisible(true);
			var items = {
				word: sap.ui.core.Fragment.byId("replace", "replaceTxt").getValue(),
				replace: sap.ui.core.Fragment.byId("replace", "replacewith").getValue(),
				isSelect: sap.ui.core.Fragment.byId("replace", "default").getSelected(),
				isSelectWord: sap.ui.core.Fragment.byId("replace", "word").getSelected()
			};
			var replaceItems = this.BillEditModel.getProperty("/replaceItems");
			replaceItems.push(items);
			this.BillEditModel.setProperty("/replaceItems", replaceItems);
			sap.ui.core.Fragment.byId("replace", "replaceTxt").setValue('');
			sap.ui.core.Fragment.byId("replace", "replacewith").setValue('');

			// var oTable = sap.ui.core.Fragment.byId("replace", "bottomTable1");

			// var FirstTableitems = new sap.m.ColumnListItem({

			// 	cells: [new sap.m.Input({
			// 			text: sap.ui.core.Fragment.byId("replace", "replaceTxt").getValue(),
			// 			width: "100%",
			// 			name: "replaceTxt[]"
			// 		}),
			// 		new sap.m.Input({
			// 			text: sap.ui.core.Fragment.byId("replace", "replacewith").getValue(),
			// 			width: "100%",
			// 			name: "replaceWith[]"
			// 		}),
			// 		new sap.m.CheckBox({
			// 			selected: sap.ui.core.Fragment.byId("replace", "default").getSelected(),
			// 			name: "default[]"

			// 		}),
			// 		new sap.m.CheckBox({
			// 			selected: sap.ui.core.Fragment.byId("replace", "word").getSelected(),
			// 			name: "word[]"

			// 		}),
			// 		new sap.ui.core.Icon({
			// 			src: "sap-icon://delete",
			// 			hoverColor: "red",
			// 			activeColor: "red",
			// 			press: [oController.onDeleteIconPress, oController]
			// 		})
			// 	]

			// });
			// oTable.addItem(FirstTableitems);

			// //	var oTable = this.getView().byId("bottomTable0")
			// //	var oTable = sap.ui.xmlfragment("replace").getView().byId("bottomTable0");

			// console.log(oTable);
			// if (this.selectedKey === 0) {

			// 	for (var i = 0; i < data.results.length; i++) {

			// 		var oContext = this._createTableItemContext(data.results[i]);

			// 		var FirstTableitems = new sap.m.ColumnListItem({
			// 			cells: [
			// 				new sap.m.Text({
			// 					text: data.results[i].Docnum,
			// 					width: "100%"
			// 				}),
			// 				new sap.m.Text({
			// 					text: data.results[i].Currency,
			// 					width: "100%"
			// 				}),
			// 				new sap.m.Text({
			// 					text: data.results[i].Sendcctr,
			// 					width: "100%"
			// 				}),
			// 				new sap.ui.comp.smartfield.SmartField({
			// 					value: "{Recwbsel}",
			// 					editable: "{localModel>isEditable}",
			// 					change: $.proxy(this.handlChange, this),
			// 					width: "100%"
			// 				}),
			// 				new sap.m.Text({
			// 					text: data.results[i].Actvtyqty,
			// 					width: "100%"
			// 				}),
			// 				new sap.m.Text({
			// 					text: data.results[i].Price,
			// 					width: "100%"
			// 				}),
			// 				new sap.m.Text({
			// 					text: data.results[i].Acttype,
			// 					width: "100%"
			// 				}),
			// 				new sap.m.Text({
			// 					text: data.results[i].Personno,
			// 					width: "100%"
			// 				}),
			// 				new sap.m.Text({
			// 					text: data.results[i].Plant,
			// 					width: "100%"
			// 				}),
			// 				new sap.m.Text({
			// 					text: data.results[i].Segtext,
			// 					width: "100%"
			// 				}),
			// 				new sap.m.Text({
			// 					text: data.results[i].Valuetotal,
			// 					width: "100%"
			// 				}),
			// 				new sap.m.Text({
			// 					text: data.results[i].Zzworloc,
			// 					width: "100%"
			// 				}),
			// 				new sap.m.Text({
			// 					text: data.results[i].Narrative,
			// 					width: "100%"
			// 				})
			// 			]
			// 		});
			// 		FirstTableitems.setBindingContext(oContext);
			// 		oTable.addItem(FirstTableitems);
			// 		var delayInvk = (function(itm) {
			// 			return function() {
			// 				var c = itm.getCells()[3];
			// 				c.setEditable(true);
			// 			};
			// 		})(FirstTableitems);
			// 		jQuery.sap.delayedCall(500, this, delayInvk);
			// 	}
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf billedit.view.NarrativeEdits
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf billedit.view.NarrativeEdits
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf billedit.view.NarrativeEdits
		 */
		//	onExit: function() {
		//
		//	}

	});

});