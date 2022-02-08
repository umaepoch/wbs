// Copyright (c) 2016, yashwanth and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["WBS Stock Ledger Entry Report"] = {
	"filters": [
		{
			'fieldname': 'wbs_storage_location',
			'label': __('WBS Storage Location'),
			'fieldtype': 'Link',
			'options': 'WBS Storage Location',
			'reqd': 1
		},
		{
			'fieldname': 'start_date',
			'label': __('Start Date'),
			'fieldtype': 'Date'
		},
		{
			'fieldname': 'end_date',
			'label': __('End Date'),
			'fieldtype': 'Date'
		}
	],
	onload: (report) => {
			let rep = frappe.query_report.report_name
			console.log(report)
			console.log(rep)
	}
};
