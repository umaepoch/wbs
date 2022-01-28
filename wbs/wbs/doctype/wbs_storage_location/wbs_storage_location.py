# -*- coding: utf-8 -*-
# Copyright (c) 2022, yashwanth and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class WBSStorageLocation(Document):
	pass

@frappe.whitelist()
def get_attributes(id):
	try:
		atr_list = frappe.db.sql("""select attribute_level, attribute_name from `tabWBS Attributes`
								where parent=%s""", (id), as_dict=1)

		return {"SC": True, 'attrs': atr_list}
	except Exception as ex:
		return {"EX": ex}


@frappe.whitelist()
def get_attribute_name(id, lv):
	try:
		name = frappe.db.sql("""select attribute_name from `tabWBS Attributes`
							where parent=%s and attribute_level=%s""", (id, lv), as_dict = 1);

		return {'name': name[0].attribute_name}
	except Exception as ex:
		return {"EX" : ex}


@frappe.whitelist()
def get_parent_lvl_by_id_name(id, level):
	try:
		check_for_level = int(level) - 1
		parent = frappe.db.sql("""select tsl.attribute, ta.refer_by from `tabWBS Storage Location` as tsl
								join `tabWBS Attributes` as ta on tsl.wbs_settings_id = ta.parent
								where tsl.wbs_settings_id = %s and ta.attribute_level = %s and tsl.attribute_level = %s""",(id, level, str(check_for_level)), as_dict=1);

		if parent and len(parent) > 0:
			return {'parent': parent[len(parent) - 1].attribute, 'refer_by': parent[len(parent) - 1].refer_by}
		return False
	except Exception as ex:
		return {'EX': ex}


@frappe.whitelist()
def get_refer_by(id):
	try:
		refer_by = frappe.db.sql("""select refer_by from `tabWBS Attributes` where parent=%s and attribute_level=%s""", (id, str(1)), as_dict = 1)

		if refer_by and len(refer_by) > 0:
			return {'refer_by': refer_by[len(refer_by) - 1].refer_by}
		return False
	except Exception as ex:
		return {'EX': ex}
