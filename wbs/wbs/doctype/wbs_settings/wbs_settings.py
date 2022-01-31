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
		print(doc)
		url = doc.get_url()
		print(url)
		return {'url': url}
	except Exception as ex:
		return {'EX': ex}
