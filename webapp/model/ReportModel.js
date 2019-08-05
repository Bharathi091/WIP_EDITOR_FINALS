sap.ui.define([
	"zprs/wipeditor/model/BaseObject",
	"sap/ui/model/resource/ResourceModel"
], function(BaseObject, ResourceModel) {
	"use strict";
	return BaseObject.extend("zprs.wipeditor.model.ReportModel", {

		constructor: function(data) {
			BaseObject.call(this);

			this.Inputs = {
				isExpanded:false,
				matters:[],
				userSettingsData:{},
				orgpx:"",
				dynmaicpx:"",
				dynamicId:{},
				growing:0,
				selectedMatter: {},
				firstTableId:{},
				hideFilterBar: true,
				isHidden: false,
				smartfilterId:{},
				masterFilter:[],
				icontabbarid:{},

				btn: "",
				rootPspid: "",
				currentFilters:[],
				applyArray: [],
				changeArray: {},
				onPressEvent: {},
				ColumnsItems: [],
				odatefrom: {},
				odateto: {},
				DocNUmber: [],
				timeKeeperValue: [],
				replaceArr: [],
				replaceAllArr: [],
				replaceStatus: "",
				masterItems: [],
				homeTable: [],
				globalSearchModel: [],
				saveObjects: [],
				indexes: [],
				globalStatus: false,
				rowNarrativeCount: [],
				rowLineCount: [],
				rowLineTransfersCount: [],
				spellCheckRowIndex: 0,
				spellCheckLogValue: 0,
				oldData: [],
				icon: false,
				iconColor: "",
				scope: {},
				homeScope: {},
				narrativeScope: {},
				lineItemEditsScope: {},
				lineItemTransfersScope: {},
				isChanged: false,

				formMatter: "",
				formLeadPartner: "",
				formBillingOffice: "",
			
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

					}
				},
				// saveObjects: [],
				editableIndexes: [0],
				currentCol: {},
				createMatter: [{
						"key": "Pspid",
						"type": "smartfield",
						"userCol": "To Matter",
						"width": "90px"
					}

				],
				Column: [{
					Pspid: ""

				}],
				createcontrols: [{
						"key": "Pspid",
						"type": "smartfield",
						"userCol": "To Matter",
						"width": "90px"
					}, {
						"key": "Zzphase",
						"type": "Select",
						"userCol": "Phase Code",
						"width": "80px"

					}, {
						"key": "Zztskcd",
						"type": "Select",
						"userCol": "Task Code",
						"width": "80px"
					}, {
						"key": "Zzactcd",
						"type": "Select",
						"userCol": "Activity Code",
						"width": "80px"
					}, {
						"key": "Zzfftskcd",
						"type": "Select",
						"userCol": "FF Task Code",
						"width": "80px"
					},

					{
						"key": "Zzffactcd",
						"type": "Select",
						"userCol": "FF Activity Code",
						"width": "80px"
					}, {
						"key": "Megbtr",
						"type": "Input",
						"userCol": "Hours/Quantity",
						"width": "80px"
					}, {
						"key": "Percent",
						"type": "Input",
						"userCol": "Percentage",
						"width": "60px"
					}, {
						"type": "Button",
						"userCol": "",
						"width": "50px"
					}, {
						"type": "Icon",
						"userCol": "",
						"width": "50px"
					}

				],
				Columns: [{
					Pspid: "",
					Zzphase: [],
					Zzactcd: [],
					Zztskcd: [],
					Zzfftskcd: [],
					Zzffactcd: [],
					Megbtr: "",
					Percent: "",
					selPhaseKey: "",
					selTskKey: "",
					selActKey: "",
					selFfTskKey: "",
					selFfActKey: ""

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
				changedLang: "en_US",
				dicDefLanguage: "en_US",

				Countries_collection: [
					{
						Key: "en_US",
						Text: "English(US)",
						lang: "en"
					}, 
					{
						Key: "ca",
						Text: "Catalan",
						lang:"ca"
					}, {
						Key: "cs_CZ",
						Text: "Czech",
							lang:"cs"
					}, {
						Key: "de_DE_frami",
						Text: "Dutch",
							lang:"nl"
					}, {
						Key: "en_AU",
						Text: "English(AU)",
							lang:"en"
					}, {
						Key: "en_CA",
						Text: "English(CA)",
							lang:"en"
					},
					{
						Key: "ar",
						Text: "Arabic",
						lang: "ar"
					},
					{
						Key: "en_GB",
						Text: "English(UK)",
							lang:"en"
					}, 
					{
						Key: "fr",
						Text: "French",
						lang: "fr"
					},
					{
						Key: "dataEn",
						Text: "German",
							lang:"de"
					}, {
						Key: "hu_HU",
						Text: "Hungarian",
							lang:"hu"
					}, {
						Key: "id_ID",
						Text: "Indonesian",
							lang:"id"
					},

					{
						Key: "it_IT",
						Text: "Italian",
							lang:"it"
					}, {
						Key: "pl_PL",
						Text: "Polish",
							lang:"pl"
					}, {
						Key: "pt_PT",
						Text: "Portugese",
							lang:"pt"
					}, {
						Key: "ru_RU",
						Text: "Russian",
							lang:"ru"
					}, {
						Key: "dataEn",
						Text: "Spanish",
							lang:"es"
					}, {
						Key: "sv_SE",
						Text: "Swedish",
							lang:"sv"
					}, {
						Key: "th_TH",
						Text: "Thai",
							lang:"th"
					}, {
						Key: "tr_TR",
						Text: "Turkish",
							lang:"tr"
					}
				],
				Toolbar: {
					NarrativeReviewed: false,
					NarrativeUnreview: false,
					LineItemReviewed: false,
					LineItemUnreview: false,
					NarrativeSave: false,
					LineItemEditSave: false,
					LineItemTransferSave: false,
					Save_Layout: true,
					Modify_Reverse: false,
					Consolidate: false,
					LineItemUpdatecodes: false,
					LineItemTransferUpdatecodes: false,
					Updatecodestransfers: false,
					GlobalSpellCheck: false,
					Mass_Transfer: false,
					Split_Transfer: false,
					Replace_Words: false
				},

				ToolbarEnable: {
					NarrativeReviewed: false,
					NarrativeUnreview: false,
					LineItemReviewed: false,
					LineItemUnreview: false,
					Replace_Words: false,
					Modify_Reverse: false,
					LineItemUpdatecodes: false,
					LineItemTransferUpdatecodes: false,
					Updatecodestransfers: false,
					Consolidate: false,
					Mass_Transfer: false,
					Split_Transfer: false,
					NarrativeSave: false,
					LineItemEditSave: false,
					LineItemTransferSave: false,
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

				},
				homeExportCols: [],
				lineItemEditsExportCols: [],
				lineItemTransfersExportCols: [],
			
			standardSettingColumns:["Belnr","Sname","Matnr","LstarText","Budat","Pernr","Megbtr","Zzblvl","ZzblvlDesc","Zzbgrp","ZzbgrpDesc","Zzteam","ZzteamDesc","Zzfepgrp","ZzfepgrpDesc","Zzphase","Zztskcd","Zzactcd","Zzfftskcd","Zzffactcd"],

				visible0: {
					Belnr: true,
					Sname: true,
					Matnr: true,
					LstarText: true,
					Budat: true,
					Pernr: true,
					Megbtr: true,

					Zzblvl: true,
					ZzblvlDesc: true,
					Zzbgrp: true,

					ZzbgrpDesc: true,
					Zzteam: true,
					ZzteamDesc: true,

					Zzfepgrp: true,
					ZzfepgrpDesc: true,
					Zzphase: true,
					Zztskcd: true,
					Zzactcd: true,

					Zzfftskcd: true,
					Zzffactcd: true,
					Pspid: false,
					Buzei: false,

					Bldat: false,

					Cpudt: false,
					Meinh: false,
					Title: false,

					Zzwerks: true,
					Bukrs: false,
					Werks: false,

					PsPosid: false,
					Lstar: false,

					RateLocl: false,
					AmountMatter: false,
					WaersMatter: false,
					AmountLocl: false,
					WaersLocl: false,
					AmountGlb: false,
					WaersGlb: false

				
				},
				ColumnsItems0: [{
					columnKey: "Pspid",
					text: "Matter Number",
					visible: false
				}, {
					columnKey: "Zzphase",
					text: "Phase Code",
					visible: true
				}, {
					columnKey: "Zzblvl",
					text: "Band Level",
					visible: true
				}, {
					columnKey: "ZzblvlDesc",
					text: "Band Level Description",
					visible: true
				}, {
					columnKey: "Zzbgrp",
					text: "Band Group",
					visible: true
				}, {
					columnKey: "Pernr",
					text: "Timekeeper No",
					visible: true
				}, {
					columnKey: "ZzbgrpDesc",
					text: "Band Group Description",
					visible: true
				}, {
					columnKey: "Zzteam",
					text: "Fee Earner Team",
					visible: true
				}, {
					columnKey: "ZzteamDesc",
					text: "Fee Earner Team Description",
					visible: true
				}, {
					columnKey: "Belnr",
					text: "Document No",
					visible: true
				}, {
					columnKey: "Zzfepgrp",
					text: "Practice Group ",
					visible: true
				}, {
					columnKey: "Buzei",
					text: "Line item",
					visible: false
				}, {
					columnKey: "ZzfepgrpDesc",
					text: "Practice Group Description",
					visible: true
				}, {
					columnKey: "Bldat",
					text: "Document Date",
					visible: false
				}, {
					columnKey: "Budat",
					text: "Work Date",
					visible: true
				}, {
					columnKey: "Cpudt",
					text: "Entered on",
					visible: false
				}, {
					columnKey: "Meinh",
					text: "UOM",
					visible: false
				}, {
					columnKey: "Title",
					text: "TimeKeeper Title",
					visible: false
				}, {
					columnKey: "Sname",
					text: "Timekeeper",
					visible: true
				}, {
					columnKey: "Zzwerks",
					text: "Working Office",
					visible: true
				}, {
					columnKey: "Bukrs",
					text: "Company Code",
					visible: false
				}, {
					columnKey: "Werks",
					text: "Billing Office",
					visible: false
				}, {
					columnKey: "Megbtr",
					text: "Hours/Quantity",
					visible: true
				}, {
					columnKey: "PsPosid",
					text: "Matter Working Office",
					visible: false
				}, {
					columnKey: "Lstar",
					text: "Activity Type",
					visible: false
				}, {
					columnKey: "LstarText",
					text: "Activity  Description",
					visible: true
				}, {
					columnKey: "Matnr",
					text: "Trans Type",
					visible: true
				}, {
					columnKey: "RateLocl",
					text: "Rate",
					visible: false
				}, {
					columnKey: "AmountMatter",
					text: "Matter Amount",
					visible: false
				}, {
					columnKey: "WaersMatter",
					text: "Matter Currency",
					visible: false
				}, {
					columnKey: "AmountLocl",
					text: "Local Amount",
					visible: false
				}, {
					columnKey: "WaersLocl",
					text: "Local Currency",
					visible: false
				}, {
					columnKey: "AmountGlb",
					text: "Global Amount",
					visible: false
				}, {
					columnKey: "WaersGlb",
					text: "Global Currency",
					visible: false
				}, {
					columnKey: "Zztskcd",
					text: "Task Code",
					visible: true
				}, {
					columnKey: "Zzactcd",
					text: "Activity Code",
					visible: true
				}, {
					columnKey: "Zzffactcd",
					text: "Flat Fee Activity Code",
					visible: true
				}, {
					columnKey: "Zzfftskcd",
					text: "Flat Fee Task Code",
					visible: true
				}],
				
				standardSettingColumnsLineitem:["Belnr","Sname","Matnr","LstarText","Budat","Pernr","Megbtr","Zzblvl","ZzblvlDesc","Zzbgrp","ZzbgrpDesc","Zzteam","ZzteamDesc","Zzfepgrp","ZzfepgrpDesc"],
				visible1: {

					Belnr: true,
					Sname: true,
					Matnr: true,
					LstarText: true,
					Budat: true,
					Pernr: true,
					Megbtr: true,
				

					Zzblvl: true,
					ZzblvlDesc: true,
					Zzbgrp: true,

					ZzbgrpDesc: true,
					Zzteam: true,
					ZzteamDesc: true,

					Zzfepgrp: true,
					ZzfepgrpDesc: true,
	Pspid: false,
					Buzei: false,

					Bldat: false,

					Cpudt: false,
					Meinh: false,
					Title: false,

					Zzwerks: true,
					Bukrs: false,
					Werks: false,

					PsPosid: false,
					Lstar: false,

					RateLocl: false,
					AmountMatter: false,
					WaersMatter: false,
					AmountLocl: false,
					WaersLocl: false,
					AmountGlb: false,
					WaersGlb: false
				},
				ColumnsItems1: [{
					columnKey: "Pspid",
					text: "Matter Number",
					visible: false
				}, {
					columnKey: "Zzblvl",
					text: "Band Level",
					visible: true
				}, {
					columnKey: "ZzblvlDesc",
					text: "Band Level Description",
					visible: true
				}, {
					columnKey: "Zzbgrp",
					text: "Band Group",
					visible: true
				}, {
					columnKey: "Pernr",
					text: "Timekeeper No",
					visible: true
				}, {
					columnKey: "ZzbgrpDesc",
					text: "Band Group Description",
					visible: true
				}, {
					columnKey: "Zzteam",
					text: "Fee Earner Team",
					visible: true
				}, {
					columnKey: "ZzteamDesc",
					text: "Fee Earner Team Description",
					visible: true
				}, {
					columnKey: "Belnr",
					text: "Document No",
					visible: true
				}, {
					columnKey: "Zzfepgrp",
					text: "Practice Group ",
					visible: true
				}, {
					columnKey: "Buzei",
					text: "Line item",
					visible: false
				}, {
					columnKey: "ZzfepgrpDesc",
					text: "Practice Group Description",
					visible: true
				}, {
					columnKey: "Bldat",
					text: "Document Date",
					visible: false
				}, {
					columnKey: "Budat",
					text: "Work Date",
					visible: true
				}, {
					columnKey: "Cpudt",
					text: "Entered on",
					visible: false
				}, {
					columnKey: "Meinh",
					text: "UOM",
					visible: false
				}, {
					columnKey: "Title",
					text: "TimeKeeper Title",
					visible: false
				}, {
					columnKey: "Sname",
					text: "Timekeeper",
					visible: true
				}, {
					columnKey: "Zzwerks",
					text: "Working Office",
					visible: true
				}, {
					columnKey: "Bukrs",
					text: "Company Code",
					visible: false
				}, {
					columnKey: "Werks",
					text: "Billing Office",
					visible: false
				}, {
					columnKey: "Megbtr",
					text: "Hours/Quantity",
					visible: true
				}, {
					columnKey: "PsPosid",
					text: "Matter Working Office",
					visible: false
				}, {
					columnKey: "Lstar",
					text: "Activity Type",
					visible: false
				}, {
					columnKey: "LstarText",
					text: "Activity  Description",
					visible: true
				}, {
					columnKey: "Matnr",
					text: "Trans Type",
					visible: true
				}, {
					columnKey: "RateLocl",
					text: "Rate",
					visible: false
				}, {
					columnKey: "AmountMatter",
					text: "Matter Amount",
					visible: false
				}, {
					columnKey: "WaersMatter",
					text: "Matter Currency",
					visible: false
				}, {
					columnKey: "AmountLocl",
					text: "Local Amount",
					visible: false
				}, {
					columnKey: "WaersLocl",
					text: "Local Currency",
					visible: false
				}, {
					columnKey: "AmountGlb",
					text: "Global Amount",
					visible: false
				}, {
					columnKey: "WaersGlb",
					text: "Global Currency",
					visible: false
				}, {
					columnKey: "ToZzfftskcd",
					text: "Flat Fee Task Code",
					visible: false
				}],
				
				standardSettingColumnsTransfres:["Belnr","Sname","Matnr","LstarText","Budat","Pernr","Megbtr","Zzblvl","ZzblvlDesc","Zzbgrp","ZzbgrpDesc","Zzteam","ZzteamDesc","ZzteamDesc","Zzfepgrp","ZzfepgrpDesc"],
				visible2: {

					Belnr: true,
					Sname: true,
					Matnr: true,
					LstarText: true,
					Budat: true,
					Pernr: true,
					Megbtr: true,
					

					Zzblvl: true,
					ZzblvlDesc: true,
					Zzbgrp: true,

					ZzbgrpDesc: true,
					Zzteam: true,
					ZzteamDesc: true,

					Zzfepgrp: true,
					ZzfepgrpDesc: true,
					Zzphase: true,
					Zztskcd: true,
					Zzactcd: true,
					Zzffactcd: true,
					Zzfftskcd: true,
						Pspid: false,
					Buzei: false,

					Bldat: false,

					Cpudt: false,
					Meinh: false,
					Title: false,

					Zzwerks: true,
					Bukrs: false,
					Werks: false,

					PsPosid: false,
					Lstar: false,

					RateLocl: false,
					AmountMatter: false,
					WaersMatter: false,
					AmountLocl: false,
					WaersLocl: false,
					AmountGlb: false,
					WaersGlb: false,


				},
				ColumnsItems2: [{
					columnKey: "Pspid",
					text: "Matter Number",
					visible: false
				}, {
					columnKey: "Zzblvl",
					text: "Band Level",
					visible: true
				}, {
					columnKey: "ZzblvlDesc",
					text: "Band Level Description",
					visible: true
				}, {
					columnKey: "Zzbgrp",
					text: "Band Group",
					visible: true
				}, {
					columnKey: "Pernr",
					text: "Timekeeper No",
					visible: true
				}, {
					columnKey: "ZzbgrpDesc",
					text: "Band Group Description",
					visible: true
				}, {
					columnKey: "Zzteam",
					text: "Fee Earner Team",
					visible: true
				}, {
					columnKey: "ZzteamDesc",
					text: "Fee Earner Team Description",
					visible: true
				}, {
					columnKey: "Belnr",
					text: "Document No",
					visible: true
				}, {
					columnKey: "Zzfepgrp",
					text: "Practice Group ",
					visible: true
				}, {
					columnKey: "Buzei",
					text: "Line item",
					visible: false
				}, {
					columnKey: "ZzfepgrpDesc",
					text: "Practice Group Description",
					visible: true
				}, {
					columnKey: "Bldat",
					text: "Document Date",
					visible: false
				}, {
					columnKey: "Budat",
					text: "Work Date",
					visible: true
				}, {
					columnKey: "Cpudt",
					text: "Entered on",
					visible: false
				}, {
					columnKey: "Meinh",
					text: "UOM",
					visible: false
				}, {
					columnKey: "Title",
					text: "TimeKeeper Title",
					visible: false
				}, {
					columnKey: "Sname",
					text: "Timekeeper",
					visible: true
				}, {
					columnKey: "Zzwerks",
					text: "Working Office",
					visible: true
				}, {
					columnKey: "Bukrs",
					text: "Company Code",
					visible: false
				}, {
					columnKey: "Werks",
					text: "Billing Office",
					visible: false
				}, {
					columnKey: "Megbtr",
					text: "Hours/Quantity",
					visible: true
				}, {
					columnKey: "PsPosid",
					text: "Matter Working Office",
					visible: false
				}, {
					columnKey: "Lstar",
					text: "Activity Type",
					visible: false
				}, {
					columnKey: "LstarText",
					text: "Activity  Description",
					visible: true
				}, {
					columnKey: "Matnr",
					text: "Trans Type",
					visible: true
				}, {
					columnKey: "RateLocl",
					text: "Rate",
					visible: false
				}, {
					columnKey: "AmountMatter",
					text: "Matter Amount",
					visible: false
				}, {
					columnKey: "WaersMatter",
					text: "Matter Currency",
					visible: false
				}, {
					columnKey: "AmountLocl",
					text: "Local Amount",
					visible: false
				}, {
					columnKey: "WaersLocl",
					text: "Local Currency",
					visible: false
				}, {
					columnKey: "AmountGlb",
					text: "Global Amount",
					visible: false
				}, {
					columnKey: "WaersGlb",
					text: "Global Currency",
					visible: false
				}, {
					columnKey: "ToZzfftskcd",
					text: "Flat Fee Task Code",
					visible: false
				}],
				DefaultVisible0: {

					Pspid: false,
					Zzphase: true,
					Zzblvl: true,
					ZzblvlDesc: true,
					Zzbgrp: true,
					Pernr: true,
					ZzbgrpDesc: true,
					Zzteam: true,
					ZzteamDesc: true,
					Belnr: true,
					Zzfepgrp: true,
					Buzei: false,
					ZzfepgrpDesc: true,
					Bldat: false,
					Budat: true,
					Cpudt: false,
					Meinh: false,
					Title: false,
					Sname: true,
					Zzwerks: true,
					Bukrs: false,
					Werks: false,
					Megbtr: true,
					PsPosid: false,
					Lstar: false,
					LstarText: true,
					Matnr: true,
					RateLocl: false,
					AmountMatter: false,
					WaersMatter: false,
					AmountLocl: false,
					WaersLocl: false,
					AmountGlb: false,
					WaersGlb: false,
					Zztskcd: true,
					Zzactcd: true,
					Zzffactcd: true,
					Zzfftskcd: true,

					

				},
				DefaultColumns0: [{
					columnKey: "Pspid",
					text: "Matter Number",
					visible: false
				}, {
					columnKey: "Zzphase",
					text: "Phase Code",
					visible: true
				}, {
					columnKey: "Zzblvl",
					text: "Band Level",
					visible: true
				}, {
					columnKey: "ZzblvlDesc",
					text: "Band Level Description",
					visible: true
				}, {
					columnKey: "Zzbgrp",
					text: "Band Group",
					visible: true
				}, {
					columnKey: "Pernr",
					text: "Timekeeper No",
					visible: true
				}, {
					columnKey: "ZzbgrpDesc",
					text: "Band Group Description",
					visible: true
				}, {
					columnKey: "Zzteam",
					text: "Fee Earner Team",
					visible: true
				}, {
					columnKey: "ZzteamDesc",
					text: "Fee Earner Team Description",
					visible: true
				}, {
					columnKey: "Belnr",
					text: "Document No",
					visible: true
				}, {
					columnKey: "Zzfepgrp",
					text: "Practice Group ",
					visible: true
				}, {
					columnKey: "Buzei",
					text: "Line item",
					visible: false
				}, {
					columnKey: "ZzfepgrpDesc",
					text: "Practice Group Description",
					visible: true
				}, {
					columnKey: "Bldat",
					text: "Document Date",
					visible: false
				}, {
					columnKey: "Budat",
					text: "Work Date",
					visible: true
				}, {
					columnKey: "Cpudt",
					text: "Entered on",
					visible: false
				}, {
					columnKey: "Meinh",
					text: "UOM",
					visible: false
				}, {
					columnKey: "Title",
					text: "TimeKeeper Title",
					visible: false
				}, {
					columnKey: "Sname",
					text: "Timekeeper",
					visible: true
				}, {
					columnKey: "Zzwerks",
					text: "Working Office",
					visible: true
				}, {
					columnKey: "Bukrs",
					text: "Company Code",
					visible: false
				}, {
					columnKey: "Werks",
					text: "Billing Office",
					visible: false
				}, {
					columnKey: "Megbtr",
					text: "Hours/Quantity",
					visible: true
				}, {
					columnKey: "PsPosid",
					text: "Matter Working Office",
					visible: false
				}, {
					columnKey: "Lstar",
					text: "Activity Type",
					visible: false
				}, {
					columnKey: "LstarText",
					text: "Activity  Description",
					visible: true
				}, {
					columnKey: "Matnr",
					text: "Trans Type",
					visible: true
				}, {
					columnKey: "RateLocl",
					text: "Rate",
					visible: false
				}, {
					columnKey: "AmountMatter",
					text: "Matter Amount",
					visible: false
				}, {
					columnKey: "WaersMatter",
					text: "Matter Currency",
					visible: false
				}, {
					columnKey: "AmountLocl",
					text: "Local Amount",
					visible: false
				}, {
					columnKey: "WaersLocl",
					text: "Local Currency",
					visible: false
				}, {
					columnKey: "AmountGlb",
					text: "Global Amount",
					visible: false
				}, {
					columnKey: "WaersGlb",
					text: "Global Currency",
					visible: false
				}, {
					columnKey: "Zztskcd",
					text: "Task Code",
					visible: true
				}, {
					columnKey: "Zzactcd",
					text: "Activity Code",
					visible: true
				}, {
					columnKey: "Zzffactcd",
					text: "Flat Fee Activity Code",
					visible: true
				}, {
					columnKey: "Zzfftskcd",
					text: "Flat Fee Task Code",
					visible: true
				}],
				DefaultVisible1: {

					Pspid: false,

					Zzblvl: true,
					ZzblvlDesc: true,
					Zzbgrp: true,
					Pernr: true,
					ZzbgrpDesc: true,
					Zzteam: true,
					ZzteamDesc: true,
					Belnr: true,
					Zzfepgrp: true,
					Buzei: false,
					ZzfepgrpDesc: true,
					Bldat: false,
					Budat: true,
					Cpudt: false,
					Meinh: false,
					Title: false,
					Sname: true,
					Zzwerks: true,
					Bukrs: false,
					Werks: false,
					Megbtr: true,
					PsPosid: false,
					Lstar: false,
					LstarText: true,
					Matnr: true,
					RateLocl: false,
					AmountMatter: false,
					WaersMatter: false,
					AmountLocl: false,
					WaersLocl: false,
					AmountGlb: false,
					WaersGlb: false,
					ToZzfftskcd: false

				},
				DefaultColumns1: [{
					columnKey: "Pspid",
					text: "Matter Number",
					visible: false
				}, {
					columnKey: "Zzblvl",
					text: "Band Level",
					visible: true
				}, {
					columnKey: "ZzblvlDesc",
					text: "Band Level Description",
					visible: true
				}, {
					columnKey: "Zzbgrp",
					text: "Band Group",
					visible: true
				}, {
					columnKey: "Pernr",
					text: "Timekeeper No",
					visible: true
				}, {
					columnKey: "ZzbgrpDesc",
					text: "Band Group Description",
					visible: true
				}, {
					columnKey: "Zzteam",
					text: "Fee Earner Team",
					visible: true
				}, {
					columnKey: "ZzteamDesc",
					text: "Fee Earner Team Description",
					visible: true
				}, {
					columnKey: "Belnr",
					text: "Document No",
					visible: true
				}, {
					columnKey: "Zzfepgrp",
					text: "Practice Group ",
					visible: true
				}, {
					columnKey: "Buzei",
					text: "Line item",
					visible: false
				}, {
					columnKey: "ZzfepgrpDesc",
					text: "Practice Group Description",
					visible: true
				}, {
					columnKey: "Bldat",
					text: "Document Date",
					visible: false
				}, {
					columnKey: "Budat",
					text: "Work Date",
					visible: true
				}, {
					columnKey: "Cpudt",
					text: "Entered on",
					visible: false
				}, {
					columnKey: "Meinh",
					text: "UOM",
					visible: false
				}, {
					columnKey: "Title",
					text: "TimeKeeper Title",
					visible: false
				}, {
					columnKey: "Sname",
					text: "Timekeeper",
					visible: true
				}, {
					columnKey: "Zzwerks",
					text: "Working Office",
					visible: true
				}, {
					columnKey: "Bukrs",
					text: "Company Code",
					visible: false
				}, {
					columnKey: "Werks",
					text: "Billing Office",
					visible: false
				}, {
					columnKey: "Megbtr",
					text: "Hours/Quantity",
					visible: true
				}, {
					columnKey: "PsPosid",
					text: "Matter Working Office",
					visible: false
				}, {
					columnKey: "Lstar",
					text: "Activity Type",
					visible: false
				}, {
					columnKey: "LstarText",
					text: "Activity  Description",
					visible: true
				}, {
					columnKey: "Matnr",
					text: "Trans Type",
					visible: true
				}, {
					columnKey: "RateLocl",
					text: "Rate",
					visible: false
				}, {
					columnKey: "AmountMatter",
					text: "Matter Amount",
					visible: false
				}, {
					columnKey: "WaersMatter",
					text: "Matter Currency",
					visible: false
				}, {
					columnKey: "AmountLocl",
					text: "Local Amount",
					visible: false
				}, {
					columnKey: "WaersLocl",
					text: "Local Currency",
					visible: false
				}, {
					columnKey: "AmountGlb",
					text: "Global Amount",
					visible: false
				}, {
					columnKey: "WaersGlb",
					text: "Global Currency",
					visible: false
				}, {
					columnKey: "ToZzfftskcd",
					text: "Flat Fee Task Code",
					visible: false
				}],
				DefaultVisible2: {

					Pspid: false,

					Zzblvl: true,
					ZzblvlDesc: true,
					Zzbgrp: true,
					Pernr: true,
					ZzbgrpDesc: true,
					Zzteam: true,
					ZzteamDesc: true,
					Belnr: true,
					Zzfepgrp: true,
					Buzei: false,
					ZzfepgrpDesc: true,
					Bldat: false,
					Budat: true,
					Cpudt: false,
					Meinh: false,
					Title: false,
					Sname: true,
					Zzwerks: true,
					Bukrs: false,
					Werks: false,
					Megbtr: true,
					PsPosid: false,
					Lstar: false,
					LstarText: true,
					Matnr: true,
					RateLocl: false,
					AmountMatter: false,
					WaersMatter: false,
					AmountLocl: false,
					WaersLocl: false,
					AmountGlb: false,
					WaersGlb: false,
					ToZzfftskcd: false

				},
				DefaultColumns2: [{
					columnKey: "Pspid",
					text: "Matter Number",
					visible: false
				}, {
					columnKey: "Zzblvl",
					text: "Band Level",
					visible: true
				}, {
					columnKey: "ZzblvlDesc",
					text: "Band Level Description",
					visible: true
				}, {
					columnKey: "Zzbgrp",
					text: "Band Group",
					visible: true
				}, {
					columnKey: "Pernr",
					text: "Timekeeper No",
					visible: true
				}, {
					columnKey: "ZzbgrpDesc",
					text: "Band Group Description",
					visible: true
				}, {
					columnKey: "Zzteam",
					text: "Fee Earner Team",
					visible: true
				}, {
					columnKey: "ZzteamDesc",
					text: "Fee Earner Team Description",
					visible: true
				}, {
					columnKey: "Belnr",
					text: "Document No",
					visible: true
				}, {
					columnKey: "Zzfepgrp",
					text: "Practice Group ",
					visible: true
				}, {
					columnKey: "Buzei",
					text: "Line item",
					visible: false
				}, {
					columnKey: "ZzfepgrpDesc",
					text: "Practice Group Description",
					visible: true
				}, {
					columnKey: "Bldat",
					text: "Document Date",
					visible: false
				}, {
					columnKey: "Budat",
					text: "Work Date",
					visible: true
				}, {
					columnKey: "Cpudt",
					text: "Entered on",
					visible: false
				}, {
					columnKey: "Meinh",
					text: "UOM",
					visible: false
				}, {
					columnKey: "Title",
					text: "TimeKeeper Title",
					visible: false
				}, {
					columnKey: "Sname",
					text: "Timekeeper",
					visible: true
				}, {
					columnKey: "Zzwerks",
					text: "Working Office",
					visible: true
				}, {
					columnKey: "Bukrs",
					text: "Company Code",
					visible: false
				}, {
					columnKey: "Werks",
					text: "Billing Office",
					visible: false
				}, {
					columnKey: "Megbtr",
					text: "Hours/Quantity",
					visible: true
				}, {
					columnKey: "PsPosid",
					text: "Matter Working Office",
					visible: false
				}, {
					columnKey: "Lstar",
					text: "Activity Type",
					visible: false
				}, {
					columnKey: "LstarText",
					text: "Activity  Description",
					visible: true
				}, {
					columnKey: "Matnr",
					text: "Trans Type",
					visible: true
				}, {
					columnKey: "RateLocl",
					text: "Rate",
					visible: false
				}, {
					columnKey: "AmountMatter",
					text: "Matter Amount",
					visible: false
				}, {
					columnKey: "WaersMatter",
					text: "Matter Currency",
					visible: false
				}, {
					columnKey: "AmountLocl",
					text: "Local Amount",
					visible: false
				}, {
					columnKey: "WaersLocl",
					text: "Local Currency",
					visible: false
				}, {
					columnKey: "AmountGlb",
					text: "Global Amount",
					visible: false
				}, {
					columnKey: "WaersGlb",
					text: "Global Currency",
					visible: false
				}, {
					columnKey: "ToZzfftskcd",
					text: "Flat Fee Task Code",
					visible: false
				}]

			};
		}
	});
});