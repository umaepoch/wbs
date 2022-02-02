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
