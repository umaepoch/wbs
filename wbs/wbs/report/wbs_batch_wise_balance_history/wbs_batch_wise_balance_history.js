// Copyright (c) 2016, yashwanth and contributors
// For license information, please see license.txt
/* eslint-disable */

frappe.query_reports["WBS Batch Wise Balance History"] = {
	"filters": [
                {
                        "fieldname":"company",
                        "label": __("Company"),
                        "fieldtype": "Link",
                        "options": "Company",
                        "default": frappe.defaults.get_user_default("Company"),
                        "reqd": 1
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
                        "fieldname":"item_code",
                        "label": __("Item Code"),
                        "fieldtype": "Link",
                        "options": "Item",
                        "get_query": function() {
                                return {
                                        filters: {
                                                "has_batch_no": 1
                                        }
                                };
                        }
                },
								{
                        "fieldname":"warehouse",
                        "label": __("Warehouse"),
                        "fieldtype": "Link",
                        "options": "Warehouse",
                        "get_query": function() {
                                let company = frappe.query_report.get_filter_value('company');
                                return {
                                        filters: {
                                                "company": company
                                        }
                                };
                        }
                },
                {
                        "fieldname":"batch_no",
                        "label": __("Batch No"),
                        "fieldtype": "Link",
                        "options": "Batch",
                        "get_query": function() {
                                let item_code = frappe.query_report.get_filter_value('item_code');
                                return {
                                        filters: {
                                                "item": item_code
                                        }
                                };
                        }
                },
        ],
				"formatter": function (value, row, column, data, default_formatter) {
		        if (column.fieldname == "Batch" && data && !!data["Batch"]) {
		                value = data["Batch"];
		                column.link_onclick = "frappe.query_reports['Batch-Wise Balance History'].set_batch_route_to_stock_ledger(" + JSON.stringify(data) + ")";
		        }

		        value = default_formatter(value, row, column, data);
		        return value;
        },
        "set_batch_route_to_stock_ledger": function (data) {
            frappe.route_options = {
                    "batch_no": data["Batch"]
            };

            frappe.set_route("query-report", "Stock Ledger");
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
