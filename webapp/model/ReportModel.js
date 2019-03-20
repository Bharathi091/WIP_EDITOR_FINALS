sap.ui.define([
	"wip/model/BaseObject",
	"sap/ui/model/resource/ResourceModel"
], function(BaseObject, ResourceModel) {
	"use strict";
	return BaseObject.extend("wip.model.ReportModel", {

		constructor: function(data) {
			BaseObject.call(this);

			this.Inputs = {
				hideFilterBar: true,
				isChanged: false,
				rootPspid: "",
				masterItems: [],
				IconTabs: {
					Home: true,
					Narrative_Edits: false,
					Line_Item_Edits: false,
					Line_Item_Transfers: false
				},
					editableIndexes: [0],
				currentCol: {},
				createcontrols: [
					{
								"key": "Pspid",
								"type": "smartfield",
								"userCol": "To Matter",
								 "width" : "90px"
							},
							{
								"key": "Zzphase",
								"type": "Select",
								"userCol": "Phase Code",
							    "width" : "80px"
							
							},
						 {
								"key": "Zztskcd",
								"type": "Select",
								"userCol": "Task Code",
								"width" : "80px"
							},
								{
								"key": "Zzactcd",
								"type": "Select",
								"userCol": "Activity Code",
							    "width" : "80px"
							},{
								"key": "Zzfftskcd",
								"type": "Select",
								"userCol": "Flat Fee taskCode",
								"width" : "80px"
							},

							{
								"key": "Zzffactcd",
								"type": "Select",
								"userCol": "Flat Fee ActivityCode",
								"width" : "80px"
							},
							 {
								"key": "Megbtr",
								"type": "Input",
								"userCol": "Hours/Quantity",
								"width" : "80px"
							},
							{
								"key": "Percent",
								"type": "Input",
								"userCol": "Percentage",
								"width" : "60px"
							},
							{
								"type": "Button",
								"userCol": "",
								"width" : "50px"
							},
							{
								"type": "Icon",
								"userCol": "",
								 "width" :"50px"
							}
							

						],
						Columns:[{
							Pspid: "",
							Zzphase:[],
							Zzactcd: [],
							Zztskcd: [],
							Zzfftskcd: [],
							Zzffactcd: [],
							Megbtr: "",
							Percent: "",
				            selPhaseKey:"",
				            selTskKey:"",
				            selActKey:"", 
				            selFfTskKey:"",
				            selFfActKey:""

						}],

				qParms: {
					ACTION: "?Action=",
					JSON: "&$format=json"
				},
				action: {
					CONSOLIDATE: "'CONSOLIDATE'"
				},
				lsValues: {
					CONUMBER: "&CoNumber=",
					Buzei: "&Buzei=",
					Hours: "&Hours=",
					Percentage: "&Percentage=",
					ToActivityCode: "&ToActivityCode=",
					ToFfActivityCode: "&ToFfActivityCode=",
					ToFfTaskCode: "&ToFfTaskCode=",
					ToMatter: "&ToMatter=",
					ToTaskCode: "&ToTaskCode="

				},

				Filters: {
					filters: ["Filter1", "Filter2", "Filter3", "Filter4"],
					Filter1: {
						table: "smartTable_ResponsiveTable0",
						uitbale: "WipDetailsSet",
						createcontrols: [{
								"key": "Belnr",
								"type": "text",
								"userCol": "Document Number"
							}, {
								"key": "Awtyp",
								"type": "text",
								"userCol": "Transtype"
							}

							, {
								"key": "ZzbgrpDesc",
								"type": "text",
								"userCol": "Activity Description"
							}, {
								"key": "Bldat",
								"type": "DatePicker",
								"userCol": "Activity Description"
							}, {
								"key": "Tdid",
								"type": "text",
								"userCol": "Time Keeper no "
							}, {
								"key": "Tdname",
								"type": "text",
								"userCol": "Time Keeper Name"
							}, {
								"key": "Quantity",
								"type": "text",
								"userCol": "Quantity"
							}, {
								"key": "Zzblvl",
								"type": "text",
								"userCol": "Band Level"
							}, {
								"key": "ZzblvlDesc",
								"type": "text",
								"userCol": "BandLevel Description"
							}, {
								"key": "Zzbgrp",
								"type": "text",
								"userCol": "Practise Group"
							}, {
								"key": "ZzbgrpDesc",
								"type": "text",
								"userCol": "PractiseGroup Description"
							}, {
								"key": "Zzteam",
								"type": "text",
								"userCol": "Earner Team"
							}, {
								"key": "Zzfepgrp",
								"type": "text",
								"userCol": " Team Group"
							}, {
								"key": "ZzfepgrpDesc",
								"type": "text",
								"userCol": "Description"
							}, {
								"key": "ToZzactcd",
								"type": "DropDown",
								"userCol": "Activity Code"
							}, {
								"key": "ToZztskcd",
								"type": "DropDown",
								"userCol": "Task Code"
							}, {
								"key": "ToZzfftskcd",
								"type": "DropDown",
								"userCol": "Flat Fee taskCode"
							},

							{
								"key": "ToZzffactcd",
								"type": "DropDown",
								"userCol": "Flat Fee ActivityCode"
							}
						],

						Columns: {
							Belnr: "",
							Awtyp: "",

							ZzbgrpDesc: "",
							Bldat: "",
							Tdid: "",
							Tdname: "",
							Quantity: ""

						}

					},

					"Filter2": {
						table: "smartTable_ResponsiveTable1",
						uitbale: "WipDetailsSet1",
						createcontrols: [{
								"key": "Belnr",
								"type": "text",
								"userCol": "Document Number"
							}, {
								"key": "Awtyp",
								"type": "text",
								"userCol": "Transtype"
							}

							, {
								"key": "ZzbgrpDesc",
								"type": "text",
								"userCol": "Activity Description"
							}, {
								"key": "Bldat",
								"type": "DatePicker",
								"userCol": "Activity Description"
							}, {
								"key": "Tdid",
								"type": "text",
								"userCol": "Time Keeper no "
							}, {
								"key": "Tdname",
								"type": "text",
								"userCol": "Time Keeper Name"
							}, {
								"key": "Quantity",
								"type": "text",
								"userCol": "Quantity"
							}

						],

						Columns: {
							Belnr: "",
							Awtyp: "",

							ZzbgrpDesc: "",
							Bldat: "",
							Tdid: "",
							Tdname: "",
							Quantity: ""

						}

					},
					"Filter3": {
						table: "smartTable_ResponsiveTable2",
						uitbale: "WipDetailsSet2",
						createcontrols: [{
								"key": "Belnr",
								"type": "text",
								"userCol": "Document Number"
							}, {
								"key": "Awtyp",
								"type": "text",
								"userCol": "Transtype"
							}

							, {
								"key": "ZzbgrpDesc",
								"type": "text",
								"userCol": "Activity Description"
							}, {
								"key": "Bldat",
								"type": "DatePicker",
								"userCol": "Activity Description"
							}, {
								"key": "Tdid",
								"type": "text",
								"userCol": "Time Keeper no "
							}, {
								"key": "Tdname",
								"type": "text",
								"userCol": "Time Keeper Name"
							}, {
								"key": "Quantity",
								"type": "text",
								"userCol": "Quantity"
							}, {
								"key": "Zzblvl",
								"type": "text",
								"userCol": "Band Level"
							}, {
								"key": "ZzblvlDesc",
								"type": "text",
								"userCol": "BandLevel Description"
							}, {
								"key": "Zzbgrp",
								"type": "text",
								"userCol": "Practise Group"
							}, {
								"key": "ZzbgrpDesc",
								"type": "text",
								"userCol": "PractiseGroup Description"
							}, {
								"key": "Zzteam",
								"type": "text",
								"userCol": "Earner Team"
							}, {
								"key": "Zzfepgrp",
								"type": "text",
								"userCol": " Team Group"
							}, {
								"key": "ZzfepgrpDesc",
								"type": "text",
								"userCol": "Description"
							}, {
								"key": "ToZzactcd",
								"type": "DropDown",
								"userCol": "Activity Code"
							}, {
								"key": "ToZztskcd",
								"type": "DropDown",
								"userCol": "Task Code"
							}, {
								"key": "ToZzfftskcd",
								"type": "DropDown",
								"userCol": "Flat Fee taskCode"
							},

							{
								"key": "ToZzffactcd",
								"type": "DropDown",
								"userCol": "Flat Fee ActivityCode"
							}

						],

						Columns: {
							Belnr: "",
							Awtyp: "",

							ZzbgrpDesc: "",
							Bldat: "",
							Tdid: "",
							Tdname: "",
							Quantity: ""

						}

					},
					"Filter4": {
						table: "smartTable_ResponsiveTable3",
						uitbale: "WipDetailsSet3",
						createcontrols: [{
								"key": "Belnr",
								"type": "text",
								"userCol": "Document Number"
							}, {
								"key": "Awtyp",
								"type": "text",
								"userCol": "Transtype"
							}

							, {
								"key": "ZzbgrpDesc",
								"type": "text",
								"userCol": "Activity Description"
							}, {
								"key": "Bldat",
								"type": "DatePicker",
								"userCol": "Activity Description"
							}, {
								"key": "Tdid",
								"type": "text",
								"userCol": "Time Keeper no "
							}, {
								"key": "Tdname",
								"type": "text",
								"userCol": "Time Keeper Name"
							}, {
								"key": "Quantity",
								"type": "text",
								"userCol": "Quantity"
							}, {
								"key": "Zzblvl",
								"type": "text",
								"userCol": "Band Level"
							}, {
								"key": "ZzblvlDesc",
								"type": "text",
								"userCol": "BandLevel Description"
							}, {
								"key": "Zzbgrp",
								"type": "text",
								"userCol": "Practise Group"
							}, {
								"key": "ZzbgrpDesc",
								"type": "text",
								"userCol": "PractiseGroup Description"
							}, {
								"key": "Zzteam",
								"type": "text",
								"userCol": "Earner Team"
							}, {
								"key": "Zzfepgrp",
								"type": "text",
								"userCol": " Team Group"
							}, {
								"key": "ZzfepgrpDesc",
								"type": "text",
								"userCol": "Description"
							}, {
								"key": "ToZzactcd",
								"type": "DropDown",
								"userCol": "Activity Code"
							}, {
								"key": "ToZztskcd",
								"type": "DropDown",
								"userCol": "Task Code"
							}, {
								"key": "ToZzfftskcd",
								"type": "DropDown",
								"userCol": "Flat Fee taskCode"
							},

							{
								"key": "ToZzffactcd",
								"type": "DropDown",
								"userCol": "Flat Fee ActivityCode"
							},

						],

						Columns: {
							Belnr: "",
							Awtyp: "",

							ZzbgrpDesc: "",
							Bldat: "",
							Tdid: "",
							Tdname: "",
							Quantity: ""

						}

					}
				},
				Countries_collection: [{
						Key: "dataEn",
						Text: "Arabic"
					}, {
						Key: "dataFr",
						Text: "Catalan"
					}, {
						Key: "dataIt",
						Text: "Czech"
					}, {
						Key: "dataEn",
						Text: "Dutch"
					}, {
						Key: "dataEn",
						Text: "English(AU)"
					}, {
						Key: "dataEn",
						Text: "English(CA)"
					}, {
						Key: "dataEn",
						Text: "English(US)"
					}, {
						Key: "dataEn",
						Text: "English(UK)"
					}, {
						Key: "dataEn",
						Text: "French"
					}, {
						Key: "dataEn",
						Text: "German"
					}, {
						Key: "dataEn",
						Text: "Hungarian"
					}, {
						Key: "dataEn",
						Text: "Indonesian"
					},

					{
						Key: "dataEn",
						Text: "Italian"
					}, {
						Key: "dataEn",
						Text: "Polish"
					}, {
						Key: "dataEn",
						Text: "Portugese"
					}, {
						Key: "dataEn",
						Text: "Russian"
					}, {
						Key: "dataEn",
						Text: "Spanish"
					}, {
						Key: "dataEn",
						Text: "Swedish"
					}, {
						Key: "dataEn",
						Text: "Thai"
					}, {
						Key: "dataEn",
						Text: "Turkish"
					}
				],
				Toolbar: {
					Reviewed: false,
					Unreview: false,
					Save: false,
					Save_Layout: true,
					Modify_Reverse: false,
					Consolidate: false,
					Updatecodes: false,
					Updatecodestransfers: false,
					GlobalSpellCheck: false,
					Mass_Transfer: false,
					Split_Transfer: false,
					Replace_Words: false
				},

				ToolbarEnable: {
					Reviewed: false,
					Unreview: false,
					Replace_Words: false,
					Modify_Reverse: false,
					Updatecodes: false,
					Updatecodestransfers: false,
					Consolidate: false,
					Mass_Transfer: false,
					Split_Transfer: false
				},
				services: {
					"InitialuserDataset": "/UserDataSet(Uname='')",
					"UpdateduserDataset": "/UserDataSet(Bname='",
					"Matter": "/Matter",
					"OrderItemSet": "/OrderItemSet",
					"CreateFinal": "CreateFinal",
					"DraftCancel": "DraftCancel",
					"MatterSet": "/MatterSet",
					"FileListSet": "/FileListSet",
					"WipMattersSet": "/WipMattersSet",
					"WipDetailsSet": "/WipDetailsSet",
					"BillSelectSet": "/BillSelectSet",
					"BillDetailSet": "/BillDetailSet",
					"PricingTypeSet": "/PricingTypeSet",
					"PriceTypeItmSet": "/PriceTypeItmSet",
					"BillSummarySet": "/BillSummarySet",
					"batchBillSummarySet": "/BillSummarySet",
					"BillEditMatterDetailSet": "/BillEditMatterDetailSet",
					"PDFOutCollection": "/PDFOutCollection",
					"DbOutputTypeSet": "/DbOutputTypeSet",
					"FbOutputTypeSet": "/FbOutputTypeSet",
					"FBMassOutputTypeSet": "FBMassOutputTypeSet",
					"ClientByCompanyCodeSet": "/ClientsGeneralSet",
					"PaymentTermsSet": "/PaymentTermsSet",
					"Tax1InfoSet": "/Tax1InfoSet",
					"TimeKeeper": "/TimeKeeper",
					"TimeKeeperSet": "/PartnerNumberSet",
					"PartnerTypeTKSet": "/PartnerTypeSet",
					"MatterGroupBillSet": "/MatterGrpBillSet",
					"PartnerDetailSet": "/ClientPayersSet",
					"MatterReportingGroupSet": "/MatterReportingGroupSet",
					"SalesOrgSet": "/SalesOrgSet",
					"ZWerksSet": "/BillingOfficeSet",
					"OpenDbForMatterSet": "/OpenDbForMatterSet",
					"WIPTRANSFER": "/WIPTRANSFER",
					"WIPMSPLIT": "/WIPMSPLIT",
					"BILLTRANSFER": "/BillTransfer",
					"CurrencySet": "/CurrencySet",
					"TaskCodeSet": "/TaskCodeSet",
					"BillTextsSet": "/BillTextsSet",
					"ActivityCodeSet": "/ActivityCodeSet",
					"ActCodeSet": "/ActCodeSet",
					"MatterSearchSet": "/MatterSearchSet",
					"MatterPhaseSet": "/MatterPhaseSet",
					"FfTaskCodeSet": "/FfTaskCodeSet",
					"FfActivityCodeSet": "/FfActivityCodeSet",
					"CreateDraft": "CreateDraft",
					"DBCreateLogSet": "DBCreateLogSet",
					"ADDLATEWIP": "/AddLateWip",
					"ReplaceWordsSet": "/ReplaceWordsSet",
					"UserDataSet": "/UserDataSet",
					"WFCommentsSet": "/WFCommentsSet",
					"FBillMassPrint": "FBillMassPrint",
					"DBillMassPrint": "/DBillMassPrint",
					"FinalBillTypeSet": "/FinalBillTypeSet",
					"DbStatusSet": "/DbStatusSet",
					"ChangeStatus": "ChangeStatus",
					"ZprsShZzmatrptgrpWfSet": "/MatterRptGrpSet",
					"VarinatSaveSet": "/VarinatSaveSet",
					"GetLogSet": "GetLogSet",
					"lookup": {

						"COUNTRY": "/countrylookup/"

					},
					"OfficeSet": "/BillingOfficeSet",
					"HT001Set": "/SalesOrgSet",
					"PhaseCodeSet": "/PhaseCodeSet",
					"BreGroupingSet": "/BreGroupingSet",
					"WipAmountsSet": "/WipAmountsSet",
					"billdataset": "/BillSummarySet('"

				}

			};

		}
	});
});