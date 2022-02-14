# Copyright (c) 2013, yashwanth and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe import _
from frappe.utils import flt, cint, getdate
from wbs.wbs.doctype.wbs_storage_location.wbs_storage_location import get_entry_detail, get_id

def execute(filters=None):
	if not filters: filters = {}

	if filters.from_date > filters.to_date:
		frappe.throw(_("From Date must be before To Date"))

	float_precision = cint(frappe.db.get_default("float_precision")) or 3

	validate_date(filters)
	columns = get_columns(filters)
	item_map = get_item_details(filters)
	iwb_map = get_item_warehouse_batch_map(filters, float_precision)

	data = []
	for item in sorted(iwb_map):
		for wh in sorted(iwb_map[item]):
			for batch in sorted(iwb_map[item][wh]):
				qty_dict = iwb_map[item][wh][batch]
				if qty_dict.opening_qty or qty_dict.in_qty or qty_dict.out_qty or qty_dict.bal_qty and filters.get('wbs_settings'):

					# fetch locations based on VOUCHER_NO and VOUCHER_DETAIL_NO.
					strg_loc = {}
					details = get_entry_detail(qty_dict.voucher_no, wh, item, qty_dict.voucher_detail_no)

					if details.get('s_warehouse') == wh and item == details.get('item_code'):
						id = get_id(details.get('source_warehouse_storage_location'))
						if id:
							strg_loc.update({
								'wbs_storage_location': details.get('source_warehouse_storage_location'),
								'wbs_id': id
							})

					if details.get('t_warehouse') == wh and item == details.get('item_code'):
						id = get_id(details.get('target_warehouse_storage_location'))
						if id:
							strg_loc.update({
								'wbs_storage_location': details.get('target_warehouse_storage_location'),
								'wbs_id': id
							})

					data.append([item, item_map[item]["item_name"], item_map[item]["description"],
					 	strg_loc.get('wbs_storage_location'), strg_loc.get('wbs_id'),qty_dict.voucher_no, wh, batch,
						flt(qty_dict.opening_qty, float_precision), flt(qty_dict.in_qty, float_precision),
						flt(qty_dict.out_qty, float_precision), flt(qty_dict.bal_qty, float_precision),
						 item_map[item]["stock_uom"]
					])

	return columns, data


def validate_date(filters):
	if filters.get('wbs_settings'):
		actual_from_date = get_start_date(filters.get('wbs_settings'))
		actual_to_date = get_end_date(filters.get('wbs_settings'))
		selected_from_date = datetime.strptime(filters.get('from_date'), '%Y-%m-%d').date() if filters.get('from_date') else ''
		selected_to_date = datetime.strptime(filters.get('to_date'), '%Y-%m-%d').date() if filters.get('to_date') else ''

		if actual_from_date.get('from_date') and actual_to_date.get('to_date'):
			if selected_from_date < actual_from_date.get('from_date') or selected_from_date > actual_to_date.get('to_date') or selected_to_date > actual_to_date.get('to_date') or selected_to_date < actual_from_date.get('from_date'):
				frappe.throw(_('From and To date should be between WBS Settings Duration'))
		if actual_from_date.get('from_date') and actual_to_date.get('INFINITE'):
			if selected_from_date < actual_from_date.get('from_date'):
				frappe.throw(_('From and To date should be between WBS Settings Duration'))

	return

def get_columns(filters):
	"""return columns based on filters"""

	columns = [_("Item") + ":Link/Item:100"] + [_("Item Name") + "::150"] + [_("Description") + "::150"] + \
	[_("WBS Storage Location") + ":Link/WBS Storage Location:150"] +[_("WBS ID") + "::100"]+ [_("Voucher #") + ":Link/Stock Entry:100"] + \
	[_("Warehouse") + ":Link/Warehouse:100"] + [_("Batch") + ":Link/Batch:100"] + [_("Opening Qty") + ":Float:90"] + \
	[_("In Qty") + ":Float:80"] + [_("Out Qty") + ":Float:80"] + [_("Balance Qty") + ":Float:90"] + \
	[_("UOM") + "::90"]


	return columns

def get_conditions(filters):
	conditions = ""
	if not filters.get("from_date"):
		frappe.throw(_("'From Date' is required"))

	if filters.get("to_date"):
		conditions += " and posting_date <= '%s'" % filters["to_date"]
	else:
		frappe.throw(_("'To Date' is required"))

	for field in ["item_code", "warehouse", "batch_no", "company"]:
		if filters.get(field):
			conditions += " and {0} = {1}".format(field, frappe.db.escape(filters.get(field)))

	return conditions

#get all details
def get_stock_ledger_entries(filters):
	conditions = get_conditions(filters)
	return frappe.db.sql("""
		select item_code,voucher_no, voucher_detail_no, batch_no, warehouse, posting_date, sum(actual_qty) as actual_qty
		from `tabStock Ledger Entry`
		where docstatus < 2 and ifnull(batch_no, '') != '' %s
		group by voucher_no, batch_no, item_code, warehouse
		order by item_code, warehouse""" %
		conditions, as_dict=1)

def get_item_warehouse_batch_map(filters, float_precision):
	sle = get_stock_ledger_entries(filters)
	iwb_map = {}

	from_date = getdate(filters["from_date"])
	to_date = getdate(filters["to_date"])

	for d in sle:
		iwb_map.setdefault(d.item_code, {}).setdefault(d.warehouse, {})\
			.setdefault(d.batch_no, frappe._dict({
				"opening_qty": 0.0, "in_qty": 0.0, "out_qty": 0.0, "bal_qty": 0.0,
				"voucher_no": d.voucher_no, "voucher_detail_no": d.voucher_detail_no
			}))
		qty_dict = iwb_map[d.item_code][d.warehouse][d.batch_no]
		if d.posting_date < from_date:
			qty_dict.opening_qty = flt(qty_dict.opening_qty, float_precision) \
				+ flt(d.actual_qty, float_precision)
		elif d.posting_date >= from_date and d.posting_date <= to_date:
			if flt(d.actual_qty) > 0:
				qty_dict.in_qty = flt(qty_dict.in_qty, float_precision) + flt(d.actual_qty, float_precision)
			else:
				qty_dict.out_qty = flt(qty_dict.out_qty, float_precision) \
					+ abs(flt(d.actual_qty, float_precision))

		qty_dict.bal_qty = flt(qty_dict.bal_qty, float_precision) + flt(d.actual_qty, float_precision)

	return iwb_map

def get_item_details(filters):
	item_map = {}
	for d in frappe.db.sql("select name, item_name, description, stock_uom from tabItem", as_dict=1):
		item_map.setdefault(d.name, d)

	return item_map
