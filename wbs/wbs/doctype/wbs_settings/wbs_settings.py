# -*- coding: utf-8 -*-
# Copyright (c) 2022, yashwanth and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
import json
from frappe.model.document import Document
from datetime import date, timedelta

class WBSSettings(Document):
	pass

@frappe.whitelist()
def get_doc_url():
	try:
		doc = frappe.new_doc('WBS Settings')
		url = doc.get_url()
		return {'url': url}
	except Exception as ex:
		return {'EX': ex}


@frappe.whitelist()
def get_nearest_settings_id(transaction_date, warehouse):
	try:
		list = frappe.db.sql("""select twsl.name from `tabWBS Settings` as tws
							join `tabWBS Storage Location` as twsl on twsl.wbs_settings_id = tws.name
							where tws.warehouse=%s and tws.start_date<=%s and twsl.is_group = '0'
							order by tws.start_date desc""", (warehouse, transaction_date), as_dict=1);
		print(list)

		if list and len(list) > 0:
			return {'list': list}

		return False
	except Exception as ex:
		return {"EX": ex}

@frappe.whitelist()
def is_wbs(warehouse):
	try:
		list = frappe.db.sql("""select is_wbs_active from `tabWarehouse` where name = %s""", warehouse, as_dict = 1)

		print(list)
		if list and len(list):
			if list[len(list) - 1].is_wbs_active == 1:
				return {'is_wbs_active': 1}
			else:
				return {'is_wbs_active': 0}
		return False
	except Exception as ex:
		return {'EX': ex}


@frappe.whitelist()
def get_relative_settings(transaction_date, warehouse, item_code):
	try:
		list = frappe.db.sql("""select twsl.name from `tabWBS Stored Items` as twsi
							join `tabWBS Storage Location` as twsl on twsl.name = twsi.parent
							join `tabWBS Settings` as tws on tws.name = twsl.wbs_settings_id
							where (tws.start_date<=%s and tws.warehouse = %s)
							and (twsl.rarb_warehouse = %s and twsi.item_code = %s)
							and (twsl.storage_location_can_store = 'Specific Items' and twsl.is_group = '0')""",
							(transaction_date, warehouse, warehouse, item_code), as_dict =1);

		print(list)

		if list and len(list) > 0:
			return {'list': list}

		return False
	except Exception as ex:
		return {'EX': ex}


@frappe.whitelist()
def check_stock_ledger_entry_for_transactions(doc):
	try:
		stock_entry = json.loads(doc)

		if stock_entry.get('purpose') == 'Material Transfer' or stock_entry.get('purpose') == 'Material Issue':
			posting_date = stock_entry.get('posting_date')

			if stock_entry.get('items') and len(stock_entry.get('items')) > 0:
				for i in stock_entry.get('items'):
					s_wbs = check_wbs(i.get('s_warehouse'))

					if s_wbs == 1:
						warehouse = i.get('s_warehouse')
						item_code = i.get('item_code')
						strg_loc = i.get('source_warehouse_storage_location')
						list = get_entries(warehouse, posting_date, item_code, strg_loc)

						if list:

							if int(list.get('qty_after_transaction')) == 0:
								return {'Error': 'quantity available in source warehouse storage location {0} at row : {1} is : {2}'.format(strg_loc,i.get('idx'), int(list.get('qty_after_transaction')))}

							is_quantity_available = int(list.get('qty_after_transaction') - i.get('qty'))

							if is_quantity_available < 0:
								return {'Error': 'quantity not available in source warehouse storage location {0} at row : {1}'.format(strg_loc,i.get('idx'))}
							else:
								return False
						else:
							return {'Error': 'quantity not available in source warehouse storage location {0} at row : {1}'.format(strg_loc,i.get('idx'))}

		# elif stock_entry.get('Material Receipt') == 'Material Receipt':
		# 	posting_date = stock_entry.get('posting_date')
		#
		# 	if stock_entry.get('items') and len(stock_entry.get('items')) > 0:
		# 		for i in stock_entry.get('items'):
		# 			warehouse = i.get('t_warehouse')
		# 			item_code = i.get('item_code')
		# 			strg_loc = i.get('target_warehouse_storage_location')
		#
		# 			list = frappe.db.sql("""select sle.item_code, se.purpose, sle.actual_qty, sle.qty_after_transaction, sle.posting_date, sle.posting_time from `tabStock Ledger Entry` as sle
		# 								join `tabStock Entry` as se on se.name = sle.voucher_no
		# 								join `tabStock Entry Detail` as sed on sed.parent = se.name
		# 								where (sle.warehouse = %s and sle.posting_date <= %s)
		# 								and (sle.item_code = %s and sed.target_warehouse_storage_location = %s)
		# 								group by sle.item_code
		# 								order by sle.posting_time desc""", (warehouse, posting_date, item_code, strg_loc), as_dict = 1);
		#
		# 			if list and len(list) > 0:
		# 				for l in list:
		# 					is_quantity_available = int(l.get('qty_after_transaction') - i.get('qty'))
		#
		# 					if is_quantity_available == 0 or is_quantity_available < 0:
		# 						return {'Error': 'quantity not available in source warehouse storage location {0} at row : {1}'.format(strg_loc,i.get('idx'))}
		# 					else:
		# 						return False
		# 			else:
		# 				return False

		return {"SC": False}
	except Exception as ex:
		return {'EX': ex}


def check_wbs(warehouse):
	try:
		if warehouse:
			list = frappe.db.sql("""select is_wbs_active from `tabWarehouse` where name = %s""", warehouse, as_dict = 1)

			if list and len(list):
				if list[len(list) - 1].is_wbs_active == 1:
					return 1
				else:
					return 0
			else:
				return 0
		else:
			return 0
	except Exception as ex:
		return ex


def get_entries(warehouse, posting_date, item_code, strg_loc):
	try:
		list = frappe.db.sql("""select sle.item_code, se.purpose, sle.actual_qty, sle.qty_after_transaction, sle.posting_date, sle.posting_time from `tabStock Ledger Entry` as sle
							join `tabStock Entry` as se on se.name = sle.voucher_no
							join `tabStock Entry Detail` as sed on sed.parent = se.name
							where (sle.warehouse = %s and sle.posting_date <= %s)
							and (sle.item_code = %s and (sed.source_warehouse_storage_location= %s or sed.target_warehouse_storage_location=%s))
							order by DATE(sle.posting_date) desc, sle.posting_time desc""", (warehouse, posting_date, item_code, strg_loc, strg_loc), as_dict = 1);

		if list and len(list) > 0:
			return list[len(list) - len(list)]
		else:
			return False
	except Exception as ex:
		return ex

@frappe.whitelist()
def get_storage_location(date, warehouse):
	try:
		list  = frappe.db.sql("""select twsl.name from `tabWBS Storage Location` as twsl
							join `tabWBS Settings` as tws on tws.name = twsl.wbs_settings_id
							where (tws.start_date<=%s and tws.warehouse = %s)
							and (twsl.rarb_warehouse = %s)
							and (twsl.storage_location_can_store = 'Any Items' and twsl.is_group = '0')""", (date, warehouse, warehouse),as_dict = 1)
		print(list)
		if list and len(list) > 0:
			return {"list": list}
		return False
	except Exception as ex:
		return {'EX': ex}


@frappe.whitelist()
def get_previous_transaction(type, date, warehouse, item_code):
	try:
		list = frappe.db.sql("""select sle.voucher_no, sle.item_code, sle.qty_after_transaction, sed.s_warehouse, sed.t_warehouse, sed.target_warehouse_storage_location, sed.source_warehouse_storage_location
							from `tabStock Ledger Entry` as sle
							join `tabStock Entry` as se on se.name = sle.voucher_no
							join `tabStock Entry Detail` as sed on sed.parent = sle.voucher_no
							where sle.warehouse = %s and sle.item_code = %s and sle.posting_date <= %s
							order by DATE(sle.posting_date) desc, sle.posting_time desc""", (warehouse, item_code, date), as_dict = 1)

		if list:
			transaction = list[len(list) - len(list)]
			if type == 'TARGET':
				if int(transaction.get('qty_after_transaction')) > 0:
					if transaction.get('s_warehouse') == warehouse:
						return {'strg_loc': transaction.get('source_warehouse_storage_location') if transaction.get('source_warehouse_storage_location') else ''}
					if transaction.get('t_warehouse') == warehouse:
						return {'strg_loc': transaction.get('target_warehouse_storage_location') if transaction.get('target_warehouse_storage_location') else ''}
			elif type == 'SOURCE':
				if transaction.get('s_warehouse') == warehouse:
					return {'strg_loc': transaction.get('source_warehouse_storage_location') if transaction.get('source_warehouse_storage_location') else ''}
				if transaction.get('t_warehouse') == warehouse:
					return {'strg_loc': transaction.get('target_warehouse_storage_location') if transaction.get('target_warehouse_storage_location') else ''}

		return False
	except Exception as ex:
		return {'EX': ex}


@frappe.whitelist()
def get_start_date(ID):
	try:
		if ID:
			start_date = frappe.db.sql("""select start_date from `tabWBS Settings` where name=%s""", ID, as_dict = 1)
			return {'from_date':start_date[len(start_date) - len(start_date)].start_date}
		return False
	except Exception as ex:
		return{'EX': ex}

@frappe.whitelist()
def get_end_date(ID):
	try:
		if ID:
			warehouse = frappe.db.sql("""select warehouse, start_date from `tabWBS Settings` where name=%s""",ID, as_dict = 1)

			if warehouse:
				print(warehouse)
				date = frappe.db.sql("""select name, start_date from `tabWBS Settings`
										where warehouse = %s and start_date > %s
										order by DATE(start_date) asc""",
										(warehouse[len(warehouse) - len(warehouse)].warehouse, warehouse[len(warehouse) - len(warehouse)].start_date),
										as_dict = 1);
				print(date)
				if date and date[len(date) - len(date)].start_date:
					next_date = date[len(date) - len(date)].start_date
					end_date = next_date - timedelta(1)
					return {'to_date':end_date}
				else:
					return {'INFINITE': 1}
		return False
	except Exception as ex:
		return {'EX': ex}
