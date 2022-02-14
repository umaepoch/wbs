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
def get_refer_by(id):
	try:
		refer_by = frappe.db.sql("""select refer_by from `tabWBS Attributes` where parent=%s and attribute_level=%s""", (id, str(1)), as_dict = 1)

		if refer_by and len(refer_by) > 0:
			return {'refer_by': refer_by[len(refer_by) - 1].refer_by}
		return False
	except Exception as ex:
		return {'EX': ex}


@frappe.whitelist()
def get_refer_by2(id, lvl):
	try:
		refer_by = frappe.db.sql("""select refer_by from `tabWBS Attributes` where parent=%s and attribute_level=%s""", (id, lvl), as_dict = 1);

		if refer_by and len(refer_by) > 0:
			return {'refer_by': refer_by[len(refer_by) - 1].refer_by}
		return False
	except Exception as ex:
		return {'EX': ex}


@frappe.whitelist()
def generate_idlv1(id, parent_attribute):
	try:
		list = frappe.db.sql("""select count(parent_attribute) as id_count from `tabWBS Storage Location`
							where wbs_settings_id = %s and parent_attribute = %s""", (id, parent_attribute), as_dict=1);

		return {'parent_list': list}
	except Exception as ex:
		return {'EX':ex}


@frappe.whitelist()
def get_parents(id, lvl):
	try:
		list = frappe.db.sql("""select attribute_id, attribute from `tabWBS Storage Location`
							where wbs_settings_id = %s and attribute_level = %s
							order by attribute_id""", (id, lvl), as_dict=1)

		return {'parent_list': list}
	except Exception as ex:
		return {'EX': ex}



@frappe.whitelist()
def generate_ids(id, parent_attribute):
	try:
		list = frappe.db.sql("""select count(parent_attribute) as id_count from `tabWBS Storage Location`
							where wbs_settings_id = %s and parent_attribute = %s""", (id, parent_attribute), as_dict=1);

		if list and len(list) > 0:

			if list[len(list) - 1].id_count >= 0:
				id = ''
				rep = parent_attribute.split("-")[len(parent_attribute.split("-")) - 1]

				if rep and rep.isdecimal():
					id = parent_attribute+"-"+str((list[len(list) - 1].id_count + 1))

				if rep and not rep.isdecimal():
					id = parent_attribute.replace(rep, str((list[len(list) - 1].id_count + 1)))

				return {'id':id.replace(' ', '')}

			return False

		return False
	except Exception as ex:

		return {'EX':ex}



@frappe.whitelist()
def generate_records_of_name(id, lvl, atr_name):
	try:
		list = frappe.db.sql("""select name_of_attribute_id from `tabWBS Storage Location`
							where wbs_settings_id = %s and attribute_level = %s and attribute=%s""",
							(id, lvl, atr_name), as_dict = 1);
		print(list)
		if list and len(list) > 0:
			if list[len(list) - 1].name_of_attribute_id:
				return {'Name': list[len(list) - 1].name_of_attribute_id}
		return False
	except Exception as ex:

		return {'EX': ex}


@frappe.whitelist()
def generate_records_of_id(id, lvl, atr_id):
	try:
		list = frappe.db.sql("""select name_of_attribute_id from `tabWBS Storage Location`
							where wbs_settings_id = %s and attribute_level = %s and attribute_id = %s""",
							(id, lvl, atr_id), as_dict = 1);
		print(list)
		if list and len(list) > 0:
			if list[len(list) - 1].name_of_attribute_id:
				return {'ID': list[len(list) - 1].name_of_attribute_id}
		return False
	except Exception as ex:

		return {'EX': ex}

@frappe.whitelist()
def get_specific_items(location):
	try:
		list = frappe.db.sql("""select twsi.item_code from `tabWBS Stored Items` as twsi
							join `tabWBS Storage Location` as twsl on twsl.name = twsi.parent
							where twsl.is_group='0' and twsl.storage_location_can_store = 'Specific Items' and twsi.parent = %s""",
							location, as_dict=1);

		print(list)
		if list and len(list) > 0:
			return {'list': list}
		return False
	except Exception as ex:
		return {'EX': ex}

@frappe.whitelist()
def get_nearest_loc_with_item(date, item_code, warehouse):
	try:
		list = frappe.db.sql("""select twsl.name from `tabWBS Settings` as tws
							join `tabWBS Storage Location` as twsl on twsl.wbs_settings_id = tws.name
							join `tabWBS Stored Items` as twsi on twsi.parent = twsl.name
							where (twsl.rarb_warehouse = %s and tws.warehouse= %s)
							and (tws.start_date <= %s and twsi.item_code = %s)
							and (twsl.storage_location_can_store = 'Specific Items' and twsl.is_group = '0')
							order by start_date desc""",(warehouse, warehouse, date, item_code), as_dict = 1);

		if list and len(list) == 1:
			return {'location': list[len(list) - 1].name}
		return False
	except Exception as ex:
		return {'EX': ex}


@frappe.whitelist()
def get_strg_id(warehouse):
	try:
		list = frappe.db.sql("""select name_of_attribute_id from `tabWBS Storage Location` where name=%s""", warehouse, as_dict=1);

		if list and len(list) > 0:
			return {'ID': list[len(list) - 1].name_of_attribute_id}
		return {'ID': False}
	except Exception as ex:
		return {'EX': ex}


@frappe.whitelist()
def check_item_already_exist(item_code, ID):
	try:
		if item_code:
			items = frappe.db.sql("""select tsi.parent from `tabWBS Stored Items` as tsi
								join `tabWBS Storage Location` as tsl on tsl.name = tsi.parent
								where tsi.item_code=%s and tsl.is_group='0' and tsl.wbs_settings_id = %s""", (item_code, ID), as_dict = 1)

			if items:
				return items
			return False
		return False
	except Exception as ex:
		return {'EX': ex}


def get_storage_location(ID):
	locations = []
	if ID:
		strg = frappe.db.sql("""select name from `tabWBS Storage Location` where wbs_settings_id=%s and is_group='0'""", ID, as_dict = 1)

		if strg:
			for s in strg:
				if s.get('name'):
					locations.append(s.get('name'))

	if locations:
		return locations
	return False

def get_entry_detail(voucher_no, warehouse, item_code):
	details = []
	if voucher_no:
		sel = frappe.db.sql("""select sed.parent, sed.item_code, sed.s_warehouse, sed.t_warehouse, sed.source_warehouse_storage_location, sed.target_warehouse_storage_location
							from `tabStock Entry Detail` as sed
							where (parent = %s and item_code = %s)
							and (s_warehouse = %s or t_warehouse = %s)""",
							(voucher_no, item_code, warehouse, warehouse),
							as_dict = 1)
		if sel:
			for s in sel:
				if s.get('parent'):
					return s
	return False

def get_id(ID):
	if ID:
		ids = frappe.db.sql("""select name_of_attribute_id from `tabWBS Storage Location` where name = %s and is_group = '0'""", ID, as_dict = 1)

		if ids and len(ids) == 1:
			return ids[len(ids) - len(ids)].name_of_attribute_id
	return False
