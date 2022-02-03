# -*- coding: utf-8 -*-
# Copyright (c) 2022, yashwanth and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
import datetime

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
		list = frappe.db.sql("""select name from `tabWBS Settings`
							where warehouse=%s and start_date<=%s order by start_date desc""", (warehouse, transaction_date), as_dict=1);
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
		if list and len(list) > 0 and len(list) == 1:
			if list[len(list) - 1].is_wbs_active == 1:
				return {'is_wbs_active':True}
		return False
	except Exception as ex:
		return {'EX': ex}


@frappe.whitelist()
def get_relative_settings(transaction_date, warehouse, item_code):
	try:
		list = frappe.db.sql("""select twsl.name from `tabWBS Stored Items` as twsi
							join `tabWBS Storage Location` as twsl on twsl.name = twsi.parent
							join `tabWBS Settings` as tws on tws.name = twsl.wbs_settings_id
							where (tws.start_date<=%s and tws.warehouse = %s) and (twsl.rarb_warehouse = %s and twsi.item_code = %s)""",
							(transaction_date, warehouse, warehouse, item_code), as_dict =1);

		print(list)

		if list and len(list) > 0:
			return {'list': list}

		return False
	except Exception as ex:
		return {'EX': ex}
