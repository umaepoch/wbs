// Copyright (c) 2016, yashwanth and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["WBS Stock Balance Report"] = {
	"filters": [
		{
			"fieldname": "company",
			"label": __("Company"),
			"fieldtype": "Link",
			"width": "80",
			"options": "Company",
			"default": frappe.defaults.get_default("company")
		},
		{
			"fieldname":"wbs_settings",
			"label": __("WBS Settings"),
			"fieldtype": "Link",
			"options": "WBS Settings",
			"reqd": 1,
			"on_change": function() {
				let id = frappe.query_report.get_filter_value('wbs_settings')
				if (id) {
					let start_date = get_start_date(id)
					let end_date = get_end_date(id)
					let warehouse = get_warehouse(id)
					if (start_date) {
						from_date = start_date
						frappe.query_report.set_filter_value('from_date', start_date)
					}

					if (end_date) {
						to_date = end_date
						frappe.query_report.set_filter_value('to_date', end_date)
					}

					if (warehouse) {
						frappe.query_report.set_filter_value('warehouse', warehouse)
					}
				}
			}
		},
		{
			"fieldname":"from_date",
			"label": __("From Date"),
			"fieldtype": "Date",
			"width": "80",
			"reqd": 1
		},
		{
			"fieldname":"to_date",
			"label": __("To Date"),
			"fieldtype": "Date",
			"width": "80",
			"reqd": 1
		},
		{
			"fieldname": "item_group",
			"label": __("Item Group"),
			"fieldtype": "Link",
			"width": "80",
			"options": "Item Group"
		},
		{
			"fieldname": "item_code",
			"label": __("Item"),
			"fieldtype": "Link",
			"width": "80",
			"options": "Item",
			"get_query": function() {
				return {
					query: "erpnext.controllers.queries.item_query",
				};
			}
		},
		{
			"fieldname": "warehouse",
			"label": __("Warehouse"),
			"fieldtype": "Link",
			"width": "80",
			"options": "Warehouse",
			get_query: () => {
				var warehouse_type = frappe.query_report.get_filter_value('warehouse_type');
				if(warehouse_type){
					return {
						filters: {
							'warehouse_type': warehouse_type
						}
					};
				}
			}
		},
		{
			"fieldname": "warehouse_type",
			"label": __("Warehouse Type"),
			"fieldtype": "Link",
			"width": "80",
			"options": "Warehouse Type"
		},
		{
			"fieldname":"include_uom",
			"label": __("Include UOM"),
			"fieldtype": "Link",
			"options": "UOM"
		},
		{
			"fieldname": "show_variant_attributes",
			"label": __("Show Variant Attributes"),
			"fieldtype": "Check"
		},
		{
			"fieldname": 'show_stock_ageing_data',
			"label": __('Show Stock Ageing Data'),
			"fieldtype": 'Check'
		},
	],

	"formatter": function (value, row, column, data, default_formatter) {
		value = default_formatter(value, row, column, data);

		if (column.fieldname == "out_qty" && data && data.out_qty > 0) {
			value = "<span style='color:red'>" + value + "</span>";
		}
		else if (column.fieldname == "in_qty" && data && data.in_qty > 0) {
			value = "<span style='color:green'>" + value + "</span>";
		}

		return value;
	}
};


function get_start_date(id) {
	let date;
	frappe.call({
		method: 'wbs.wbs.doctype.wbs_settings.wbs_settings.get_start_date',
		args: {
			'ID': id
		},
		async: false,
		callback: (r) => {
			if(r.message.from_date) {
				date = r.message.from_date
			} else if (r.message.EX){
				frappe.throw(__(r.message.EX))
			} else {
				date = false
			}
		}
	});
	return date
}

function get_end_date(id) {
	let date;
	frappe.call({
		method: 'wbs.wbs.doctype.wbs_settings.wbs_settings.get_end_date',
		args: {
			'ID': id
		},
		async: false,
		callback: (r) => {
			if(r.message.to_date) {
				date = r.message.to_date
			} else if (r.message.INFINITE) {
				date = ''
			} else if (r.message.EX){
				frappe.throw(__(r.message.EX))
			} else {
				date = false
			}
		}
	});
	return date
}

function get_warehouse(id){
	let warehouse;
	frappe.call({
		method: 'wbs.wbs.doctype.wbs_settings.wbs_settings.get_warehouse',
		args: {
			'ID': id
		},
		async: false,
		callback: (r) => {
			if (r.message.warehouse) {
				warehouse = r.message.warehouse
			} else if (r.message.EX) {
				frappe.throw(__(r.message.EX))
			} else {
				warehouse = false
			}
		}
	})
	return warehouse
}
