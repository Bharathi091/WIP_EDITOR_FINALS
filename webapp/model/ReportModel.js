sap.ui.define([
	"billedit/model/BaseObject"
], function(BaseObject) {
	"use strict";
	return BaseObject.extend("billedit.model.ReportModel", {
		constructor: function(data) {
			BaseObject.call(this);

			this.Inputs = {

				"title": "Bill Edit",
				"services": {
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
				qParms: {
					SESSION_ID: "?session_id=",
					FILTER: "?$filter=",
					JSON: "&$format=json",
					DATAJSON: "?$format=json",
					METADATA: "/$metadata",
					ACTION: "?Action=",
					ACTION2: "?ACTION=",
					DBToStatus: "/DBToStatus",
					HeaderToGroupInfo: "/HeaderToGroupInfo",
					PriceByMatnr: "/PriceByMatnr",
					value: "/$value",
					Top20: "&$top=20"

				},
				lsValues: {
					SESSION_ID: localStorage.getItem("sid"),
					USER_ID: localStorage.getItem("uid"),
					CONUMBER: "&CoNumber=",
					Buzei: "&Buzei=",
					Hours: "&Hours=",
					WBS_NODE2: "&WBS_NODE2=",
					Percentage: "&Percentage=",
					ToActivityCode: "&ToActivityCode=",
					ToFfActivityCode: "&ToFfActivityCode=",
					ToFfTaskCode: "&ToFfTaskCode=",
					ToMatter: "&ToMatter=",
					ToTaskCode: "&ToTaskCode=",
					PSPID: "&PSPID=",
					Submit: "&Submit=",
					budat_to: "&budat_to=",
					budat_from: "&budat_from=",
					Budat: "&Budat=",
					Belnr: "?Belnr=",
					Vbeln: "&Vbeln=",
					FinalVbeln: "VBELN=",
					GROUPBILL: "&GROUPBILL=",
					FKDAT: "&FKDAT=",
					FKART: "&FKART=",
					STATUS: "&STATUS=",
					TYPEOFAPPROVAL: "&TYPEOFAPPROVAL=",
					CancelVbeln: "Vbeln=",
					Posnr: "&Posnr=",
					ToVbeln: "&ToVbeln=",
					Counter: "&Counter=",
					ToPhaseCode: "&ToPhaseCode="
				},
				"DateFields": ["Budat"],
				"SelectFields": ["MpatnerParvw"],
				"InputFields": ["Client", "Mpatner", "Pspid", "Rptgroup", "Mgbill", "Werks", "Vkorg", "Vbeln"],
				"Dictionaries": {},
				"Mode": {
					viewMode: true,
					headerMode: false
				},
				"constants": {},
				"formatterData": {},
				"partnerTypeData": [],
				"AdvFilter": {},
				"MasterFilterinputs": {
					"ValuhelpInput": [
						"ClientNumber",
						"BusinessPartnerNumber",
						"Matter",
						"MatterReportingGroup",
						"GroupBillID",
						"BillingOffice",
						"SalesOrg",
						"DraftBillNo"
					],
					"DateInput": [
						"fromDateInput",
						"toDateInput"
					],
					"DropdownInput": [
						"BusinessPartnerType"
					],
					"Input": ["DraftBillNo"],
					"goButton": {
						enable: false
					}

				},
				"AdvFilters": {

					"Keys": {

						"ClientNumber": "Client",
						"BusinessPartnerNumber": "BusinessPartnerNumber",
						"Matter": "MatterNumber",
						"MatterReportingGroup": "MatterReportingGroup",
						"GroupBillID": "GroupBillID",
						"BillingOffice": "BillingOffice",
						"SalesOrg": "SalesOrg"

					},

					"ClientNumber": [{
						label: "Search Term",
						template: "SearchTerm",
						field: "Sortl"
					}, {
						label: "Country",
						template: "Country",
						field: "Land1"
					}, {
						label: "Postal Code",
						template: "PostalCode",
						field: "Pstlz"
					}, {
						label: "City",
						template: "City",
						field: "Mcod3"
					}, {
						label: "Client Name",
						template: "ClientName",
						field: "Mcod1"
					}, {
						label: "Client",
						template: "Client",
						field: "Kunnr"
					}],
					"BusinessPartnerNumber": [{
						label: "Business Partner Number",
						template: "BusinessPartnerNumber",
						field: "Pernr"
					}, {
						label: "First Name",
						template: "FirstName",
						field: "Vorna"
					}, {
						label: "Last Name",
						template: "LastName",
						field: "Nachn"
					}],
					"Matter": [{
						label: "Matter Number",
						template: "MatterNumber",
						field: "Pspid"
					}, {
						label: "Description",
						template: "Description",
						field: "Post1"
					}],
					"MatterReportingGroup": [{
						label: "Matter Reporting Group",
						template: "MatterReportingGroup",
						field: "Rptgroup"
					}, {
						label: "Description",
						template: "Description",
						field: "Post1"
					}],
					"GroupBillID": [{
						label: "Group Bill ID",
						template: "GroupBillID",
						field: "Zzgrpbill"
					}, {
						label: "Description",
						template: "Description",
						field: "Post1"
					}],
					"BillingOffice": [{
						label: "Billing Office",
						template: "BillingOffice",
						field: "Werks"
					}, {
						label: "Description",
						template: "Description",
						field: "Name1"
					}],
					"SalesOrg": [{
						label: "Sales Org",
						template: "SalesOrg",
						field: "Vkorg"
					}, {
						label: "Description",
						template: "Description",
						field: "Vtext"
					}]

				},
				"Modes": {
					"viewMode": true,
					"headerEditMode": false,
					"narrativeMode": false,
					"lineItemEditMode": false,
					"lineItemTransferMode": false,
					"billSummary": false,
					"createDraftBillMode": false
				},
				"viewMode": {
					"settingFields": [{
						name: "Status Message",
						checked: false,
						id: "StatusMessage",
						enable: true,
						settings: true
					}, {
						name: "Draft Bill Status",
						checked: false,
						id: "DraftBillStatus",
						enable: true,
						settings: true
					}, {
						name: "Work Flow Status",
						checked: false,
						id: "WorkFlowStatus",
						enable: true,
						settings: true
					}, {
						name: "Comments",
						checked: false,
						id: "Comments",
						enable: true,
						settings: true
					}, {
						name: "Attachments",
						checked: false,
						id: "Attachments",
						enable: true,
						settings: false
					}, {
						name: "Additional WIP",
						checked: false,
						id: "AdditionalWIP",
						enable: true,
						settings: false
					}, {
						name: "Billing Partner",
						checked: false,
						id: "BillingPartner",
						enable: true,
						settings: true
					}, {
						name: "Client Name",
						checked: false,
						id: "ClientName",
						enable: true,
						settings: true
					}, {
						name: "Matter No",
						checked: false,
						id: "MatterNo",
						enable: true,
						settings: true
					}, {
						name: "Matter Description",
						checked: false,
						id: "MatterDescription",
						enable: true,
						settings: true
					}, {
						name: "Draft Bill",
						checked: false,
						id: "DraftBill",
						enable: true,
						settings: true
					}, {
						name: "Date",
						checked: false,
						id: "Date",
						enable: true,
						settings: true
					}, {
						name: "Currency",
						checked: false,
						id: "Currency",
						enable: true,
						settings: true
					}, {
						name: "Net Fees",
						checked: false,
						id: "NetFees",
						enable: true,
						settings: true
					}, {
						name: "Net Disb",
						checked: false,
						id: "NetDisb",
						enable: true,
						settings: true
					}, {
						name: "TaxView",
						checked: false,
						id: "TaxView",
						enable: true,
						settings: true
					}, {
						name: "Withholding Tax",
						checked: false,
						id: "WithholdingTax",
						enable: true,
						settings: true
					}, {
						name: "Total",
						checked: false,
						id: "Total",
						enable: true,
						settings: true
					}, {
						name: "Final Bill",
						checked: false,
						id: "FinalBill",
						enable: true,
						settings: true
					}, {
						name: "Billing Method",
						checked: false,
						id: "BillingMethod",
						enable: true,
						settings: true
					}]
				},
				buttons: {
					views: {
						homeView: false,
						headerEdit: false,
						narrativeEdits: false,
						LineItemEdits: false,
						LineItemTransfers: false
					}
				},
				filterBarExpanded:true,  
				"headerEditData": [],
				"billSummaryData": []
			};

		}
	});
});