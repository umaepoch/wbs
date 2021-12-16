# -*- coding: utf-8 -*-
# Copyright (c) 2021, yashwanth and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from frappe.model.mapper import get_mapped_doc
from datetime import datetime, timedelta
import datetime
import json
from frappe import _
class WBSWarehouse(Document):
	pass

@frappe.whitelist()
def make_wbs_warehouse(source_name, target_doc=None, ignore_permissions=False):
	#print "source_name ------------",source_name
	def set_missing_values(source, target):
		target.is_pos = 0
		target.ignore_pricing_rule = 1
		target.flags.ignore_permissions = True
		target.run_method("set_missing_values")
		target.run_method("set_po_nos")
		target.run_method("calculate_taxes_and_totals")
#		set company address
#		target.update(get_company_address(target.company))
#		if target.company_address:
#			target.update(get_fetch_values("Documents Review Details", 'company_address', target.company_address))
#		 set the redeem loyalty points if provided via shopping cart
#		if source.loyalty_points and source.order_type == "Shopping Cart":
#			target.redeem_loyalty_points = 1
	def postprocess(source, target):
		set_missing_values(source, target)
		#Get the advance paid Journal Entries in Sales Invoice Advance
		#target.set_advances()
	doc = get_mapped_doc("Warehouse", source_name,	{
		"Warehouse": {
			"doctype": "WBS Warehouse",
			"field_map": {
				"warehouse": source_name
			},
			"validation": {
				"docstatus": ["=", 0],
			}
		}
	},  target_doc, postprocess, ignore_permissions=ignore_permissions)

	return doc
@frappe.whitelist()
def get_higher_date(warehouse,start_date,name):
	try:
		end_date = ""
		flag = False
		start_date = datetime.datetime.strptime(start_date, "%Y-%m-%d").date()

		dates = frappe.db.sql("""select name,start_date from `tabWBS Warehouse`
								where warehouse = %s and start_date > %s and docstatus =1 order by start_date asc limit 1 """,
								(warehouse,start_date), as_dict = 1)
		# print("higher : ", dates)
		# dates_lower = frappe.db.sql("""select name,start_date from `tabWBS Warehouse`
		# 								where warehouse = %s and start_date < %s and docstatus = 1 order by start_date desc limit 1 """,
		# 								(warehouse,start_date), as_dict = 1)
		# print("lower : ",dates_lower)
		#
		# if dates_lower:
		# 	for date in dates_lower:
		# 		end_date = start_date - timedelta(days=1)
		# 		names = date.name
		# 		doc = frappe.get_doc("WBS Warehouse", names)
		# 		frappe.db.sql("""update `tabWBS Warehouse` set end_date = '"""+ str(end_date)+"""'where name='"""+str(names)+"""'""")
		# 		# doc.end_date = end_date
		# 		# doc.save()
		# 		# print("date : ",end_date," doc name : ", names)

		if dates:
			for date in dates:
				end_date = date.start_date - timedelta(days=1)
				doc = frappe.get_doc("WBS Warehouse", name)
				doc.end_date = end_date
				doc.save()
			flag = True

		return {"SC": flag}
	except Exception as ex:
		return {"EX": ex}

@frappe.whitelist()
def get_end_foramte_date(end_date,start_date, warehouse):
	flag = False
	now = datetime.datetime.now()
	current_date =  now.strftime("%Y-%m-%d")

	if current_date <= end_date and current_date >= start_date:
		is_active = 1
		flag = True
	else:
		is_active = 0
		flag = False
	return flag

@frappe.whitelist()
def get_next_start_date(warehouse,start_date,name):
	flag = False
	get_higher_date = ""
	now = datetime.datetime.now()
	current_date =  now.strftime("%Y-%m-%d")
	#print "current_date------------",type(current_date)
	get_higher_date = dates = frappe.db.sql("""select name,start_date from `tabWBS Warehouse` where warehouse = %s and start_date > %s and docstatus =1 order by start_date asc limit 1 """,(warehouse,start_date), as_dict = 1)
	if start_date <= current_date:
		#print "yeah date is greater then"
		is_active = 1
		flag = True
		#frappe.db.sql("""update `tabWBS Warehouse` set is_active = '"""+ str(is_active)+"""' where warehouse='"""+str(warehouse)+"""' and name = '"""+name+"""'""")
	elif start_date <= current_date and get_higher_date is None:
		flag = True
	elif start_date > current_date:
		is_active = 0
		flag = False
		#frappe.db.sql("""update `tabWBS Warehouse` set is_active = '"""+ str(is_active)+"""' where warehouse='"""+str(warehouse)+"""' and name = '"""+name+"""'""")
	#return current_date
	return flag

@frappe.whitelist()
def get_update_pre_doc(warehouse,start_date,name):
	try:
		get_is_active_update(warehouse,start_date,name)
		start_date = datetime.datetime.strftime(start_date, '%Y-%m-%d')
		dates = frappe.db.sql("""select name,start_date from `tabWBS Warehouse` where warehouse = %s and start_date < %s and docstatus =1 order by start_date desc limit 1 """,(warehouse,start_date), as_dict = 1)
		dates_higher = frappe.db.sql("""select name,start_date from `tabWBS Warehouse` where warehouse = %s and start_date > %s and docstatus =1 order by start_date asc limit 1 """,(warehouse,start_date), as_dict = 1)
		#print "dates----------------",dates
		if dates_higher:
			for date in dates_higher:
				end_date = date.start_date - timedelta(days=1)
				get_update_doc_value(name,end_date)
				frappe.db.sql("""update `tabWBS Warehouse` set end_date = '"""+ str(end_date)+"""' where name='"""+str(name)+"""' and docstatus =1""")
		if dates:
			for date in dates:
				end_date = start_date - timedelta(days=1)
				names = date.name
				#get_update_doc_value(names,end_date)
				frappe.db.sql("""update `tabWBS Warehouse` set end_date = '"""+ str(end_date)+"""' where name='"""+str(names)+"""'""")
		get_is_active_update(warehouse,start_date,name)
		return dates
	except Exception as ex:
		return ex

def get_is_active_update(warehouse,start_date,name):

	dates = frappe.db.sql("""select name,start_date,end_date from `tabWBS Warehouse`
							where warehouse = %s and start_date < %s and docstatus =1
							order by start_date desc limit 1 """,(warehouse,start_date), as_dict = 1)

	now = datetime.datetime.now()
	current_date =  now.strftime("%Y-%m-%d")
	#current_date = datetime.datetime.strptime(current_date, '%Y-%m-%d')
	for date in dates:
		names = date.name
		previous_start_date = date.start_date
		previous_end_date = date.end_date

		if str(previous_start_date) <= current_date and str(previous_end_date) >= current_date:
			#print "yeah date is greater then"
			is_active = 1
			#flag = True
			#print "is_active===============",is_active
			frappe.db.sql("""update `tabWBS Warehouse` set is_active = '"""+ str(is_active)+"""' where warehouse='"""+str(warehouse)+"""' and name = '"""+names+"""'""")
		else :
			is_active = 0
			#print "is_active===============",is_active
			#flag = False
			frappe.db.sql("""update `tabWBS Warehouse` set is_active = '"""+ str(is_active)+"""' where warehouse='"""+str(warehouse)+"""' and name = '"""+names+"""'""")
	return True

@frappe.whitelist()
def get_update_doc(name,end_date):
	doc = frappe.get_doc("WBS Warehouse" , name)
	modified = doc.modified
	doc.update({
		"modified":modified,
		"end_date":end_date
		})
	doc.save()
	return True

@frappe.whitelist()
def get_update_is_active(name,is_active):
	try:
		doc = frappe.get_doc("WBS Warehouse" , name)
		modified = doc.modified
		doc.update({
			   "modified":modified,
			   "is_active":is_active
			})
		doc.save()
		return True
	except Exception as ex:
		return ex

@frappe.whitelist()
def get_update_doc_value(name,end_date):
	try:
		doc = frappe.get_doc("WBS Warehouse" , name)
		modified = doc.modified
		doc.update({
			"modified":modified,
			"end_date":end_date
			})
		frappe.db.commit()
		# doc.save()
		return True
	except Exception as ex:
		return ex

# //For Stock Entry Detail's custom field wbs Location (Source Warehouse) and wbs Location (Target Warehouse) .....
@frappe.whitelist()
def get_wbs_warehouse(warehouse):
	wbs_warehouse = frappe.db.sql("""select warehouse from `tabWBS Warehouse` where warehouse = '"""+warehouse+"""' and is_active =1 and docstatus =1""", as_dict =1)
	#print "wbs_warehouse------------",wbs_warehouse
	if wbs_warehouse:
		return wbs_warehouse
	else:
		return None
@frappe.whitelist()
def get_wbs_warehouse_item_name(warehouse):
	wbs_id = frappe.db.sql("""select ri.wbs_id,ri.name from `tabWBS Item` ri , `tabWBS Warehouse` r where r.warehouse = '"""+warehouse+"""' and ri.wbs_active = "Yes" and r.name = ri.parent and r.docstatus =1 and r.is_active =1 order by ri.wbs_id asc""", as_dict=1)

	return wbs_id
@frappe.whitelist()
def get_wbs_items_detail(warehouse,pch_wbs_location_src):
	wbs_items = frappe.db.sql("""select ri.wbs_item  from `tabWBS Item` ri, `tabWBS Warehouse` r where r.warehouse = '"""+warehouse+"""' and r.name = ri.parent and r.is_active =1 and ri.wbs_id = '"""+pch_wbs_location_src+"""'""", as_dict =1)
	return wbs_items

@frappe.whitelist()
def create_wbs_id(name, warehouse,wbs_ids):
	try:
		wbs = json.loads(wbs_ids)

		for id in wbs:
			ids = frappe.db.sql("""select wbs_id from `tabWBS ID` where wbs_id=%s""",id['wbs_id'], as_dict=1)
			if len(ids) == 0:
				outer_json = {
					"doctype": "WBS ID",
					"wbs_id": id['wbs_id']
				}
				doc = frappe.new_doc("WBS ID")
				doc.update(outer_json)
				doc.save()
		return {"SC": True}
	except Exception as ex:
		return {"EX": ex}

@frappe.whitelist()
def set_wbs_location(stock,data):
	voucher_no = stock.voucher_no
	voucher_type = stock.voucher_type
	voucher_detail_no = stock.voucher_detail_no
	item_code = stock.item_code
	warehouse = stock.warehouse
	trg_wbs_locations = ""
	src_wbs_locations = ""
	if voucher_type == "Stock Entry":

		trg_wbs_locations = frappe.db.sql("""
						select
							sti.pch_wbs_location_trg as wbs_id_trg, sti.qty as t_qty
						from
							`tabStock Entry` st ,`tabStock Entry Detail` sti
						where
							st.name = '"""+voucher_no+"""' and st.name = sti.parent and
							sti.item_code = '"""+item_code+"""' and  st.docstatus = 1
							and sti.t_warehouse = %s
							and sti.name = '"""+voucher_detail_no+"""'
							""",(warehouse), as_dict =1)
		src_wbs_locations = frappe.db.sql("""
						select
							sti.pch_wbs_location_src as wbs_id_src, sti.qty as s_qty
						from
							`tabStock Entry` st ,`tabStock Entry Detail` sti
						where
							st.name = '"""+voucher_no+"""' and st.name = sti.parent and
							sti.item_code = '"""+item_code+"""' and  st.docstatus = 1
							and sti.s_warehouse = %s
							and sti.name = '"""+voucher_detail_no+"""'
							""",(warehouse), as_dict =1)
	elif voucher_type == "Purchase Invoice":

		trg_wbs_locations = frappe.db.sql("""
						select
							sti.pch_wbs_location_trg as wbs_id_trg, sti.qty as t_qty
						from
							`tabPurchase Invoice` st ,`tabPurchase Invoice Item` sti
						where
							st.name = '"""+voucher_no+"""' and st.name = sti.parent and
							sti.item_code = '"""+item_code+"""' and  st.docstatus = 1 and
							sti.warehouse = %s  and
							sti.name = '"""+voucher_detail_no+"""'
							""",(warehouse), as_dict =1)
	elif voucher_type == "Purchase Receipt":

		trg_wbs_locations = frappe.db.sql("""
						select
							sti.pch_wbs_location_trg as wbs_id_trg, sti.qty as t_qty
						from
							`tabPurchase Receipt` st ,`tabPurchase Receipt Item` sti
						where
							st.name = '"""+voucher_no+"""' and st.name = sti.parent and
							sti.item_code = '"""+item_code+"""' and  st.docstatus = 1 and
							sti.warehouse = %s
							and sti.name = '"""+voucher_detail_no+"""'
							""",(warehouse), as_dict =1)


	elif voucher_type == "Sales Invoice":

		src_wbs_locations = frappe.db.sql("""
						select
							sti.pch_wbs_location_src as wbs_id_src, sti.qty as s_qty
						from
							`tabSales Invoice` st ,`tabSales Invoice Item` sti
						where
							st.name = '"""+voucher_no+"""' and st.name = sti.parent and
							sti.item_code = '"""+item_code+"""' and  st.docstatus = 1 and
							sti.warehouse = %s
							and sti.name = '"""+voucher_detail_no+"""'
							""",(warehouse), as_dict =1)
	elif voucher_type == "Delivery Note":

		src_wbs_locations = frappe.db.sql("""
						select
							sti.pch_wbs_location_src as wbs_id_src, sti.qty as s_qty
						from
							`tabDelivery Note` st ,`tabDelivery Note Item` sti
						where
							st.name = '"""+voucher_no+"""' and st.name = sti.parent and
							sti.item_code = '"""+item_code+"""' and  st.docstatus = 1 and
							sti.warehouse = %s
							and sti.name = '"""+voucher_detail_no+"""'
							""",(warehouse), as_dict =1)
	elif voucher_type == "Stock Reconciliation":

		src_wbs_locations = frappe.db.sql("""
						select
							sti.pch_wbs_location_src as wbs_id_src, sti.qty as s_qty
						from
							`tabStock Reconciliation` st ,`tabStock Reconciliation Item` sti
						where
							st.name = '"""+voucher_no+"""' and st.name = sti.parent and
							sti.item_code = '"""+item_code+"""' and  st.docstatus = 1""", as_dict =1)
	total = 0.0
	if src_wbs_locations:

		frappe.db.set_value("Stock Ledger Entry", stock.name, "wbs_location", src_wbs_locations[0].wbs_id_src)

	if trg_wbs_locations:
		frappe.db.set_value("Stock Ledger Entry", stock.name, "wbs_location", trg_wbs_locations[0].wbs_id_trg)

def check_available_qty(stock,data):
	voucher_no = stock.voucher_no
	voucher_type = stock.voucher_type
	voucher_detail_no = stock.voucher_detail_no
	item_code = stock.item_code
	warehouse = stock.warehouse
	src_wbs_locations = ""
	if voucher_type == "Stock Entry":
		src_wbs_locations = frappe.db.sql("""
						select
							sti.pch_wbs_location_src as wbs_id_src, sti.transfer_qty as s_qty
						from
							`tabStock Entry` st ,`tabStock Entry Detail` sti
						where
							st.name = '"""+voucher_no+"""' and st.name = sti.parent and
							sti.item_code = '"""+item_code+"""' and  st.docstatus = 1
							and sti.s_warehouse = %s
							and sti.name = '"""+voucher_detail_no+"""'
							""",(warehouse), as_dict =1)
	elif voucher_type == "Sales Invoice":

		src_wbs_locations = frappe.db.sql("""
						select
							sti.pch_wbs_location_src as wbs_id_src, sti.stock_qty as s_qty
						from
							`tabSales Invoice` st ,`tabSales Invoice Item` sti
						where
							st.name = '"""+voucher_no+"""' and st.name = sti.parent and
							sti.item_code = '"""+item_code+"""' and  st.docstatus = 1 and
							sti.warehouse = %s
							and sti.name = '"""+voucher_detail_no+"""'
							""",(warehouse), as_dict =1)
	elif voucher_type == "Delivery Note":

		src_wbs_locations = frappe.db.sql("""
						select
							sti.pch_wbs_location_src as wbs_id_src, sti.stock_qty as s_qty
						from
							`tabDelivery Note` st ,`tabDelivery Note Item` sti
						where
							st.name = '"""+voucher_no+"""' and st.name = sti.parent and
							sti.item_code = '"""+item_code+"""' and  st.docstatus = 1 and
							sti.warehouse = %s
							and sti.name = '"""+voucher_detail_no+"""'
							""",(warehouse), as_dict =1)
	if stock.wbs_location is not None and stock.wbs_location != "":
		if src_wbs_locations:
			creation = str(stock.posting_date)+" "+str(stock.posting_time)
			stock_ledger = frappe.db.sql("""select
								*
							from
								`tabStock Ledger Entry`
							where
								warehouse = %s and item_code = %s and wbs_location = %s and docstatus = 1
								and creation <= %s""",
								(warehouse,item_code,src_wbs_locations[0].wbs_id_src,creation), as_dict=1)
			target_qty = 0.0
			source_qty = 0.0
			bal_qty = 0.0
			for led in stock_ledger:
				if led.voucher_type == "Purchase Invoice":
					target_qty += led.actual_qty
					bal_qty = target_qty - source_qty
				elif led.voucher_type == "Purchase Receipt":
					target_qty += led.actual_qty
					bal_qty = target_qty - source_qty
				elif led.voucher_type == "Stock Entry":
					stock_entry_datails = frappe.get_list("Stock Entry Detail", filters={'parent': led.voucher_no,'t_warehouse': led.warehouse, 'item_code': led.item_code, 'pch_wbs_location_trg': src_wbs_locations[0].wbs_id_src }, fields=['transfer_qty'])
					if stock_entry_datails:
						target_qty += stock_entry_datails[0].transfer_qty
						bal_qty = target_qty - source_qty

					stock_entry_datails = frappe.get_list("Stock Entry Detail", filters={'parent': led.voucher_no,'s_warehouse': led.warehouse, 'item_code': led.item_code, 'pch_wbs_location_src': src_wbs_locations[0].wbs_id_src }, fields=['transfer_qty'])
					if stock_entry_datails:
						source_qty += stock_entry_datails[0].transfer_qty
						bal_qty = target_qty - source_qty
				elif led.voucher_type == "Sales Invoice":
					source_qty -= led.actual_qty
					bal_qty = target_qty - source_qty
				elif led.voucher_type == "Delivery Note":
					source_qty -= led.actual_qty
					bal_qty = target_qty - source_qty
				elif led.voucher_type == "Stock Reconciliation":
					bal_qty = led.qty_after_transaction
					target_qty = led.qty_after_transaction
					target_qty += source_qty
			if bal_qty < src_wbs_locations[0].s_qty:
				frappe.throw(_("The Quantity is not available for "+frappe.bold(stock.item_code)+" at wbs Location "+frappe.bold(src_wbs_locations[0].wbs_id_src)+",Please use the currect wbs Location and try again..")+ '<br><br>' + _("Available qty is {0} {1}, you need {2} {3}").format(frappe.bold(bal_qty),frappe.bold(stock.stock_uom),frappe.bold(str(src_wbs_locations[0].s_qty)),frappe.bold(stock.stock_uom)), title=_('Insufficient Stock in WBS Warehouse'))

@frappe.whitelist()
def set_is_active(name,flag,docstatus):
	try:
		sc = False

		if int(flag) == 1:
			if int(docstatus) == 1:
				frappe.db.set_value("WBS Warehouse", name, "is_active", 1)
				frappe.db.commit()
				sc = True
			elif int(docstatus) == 2:
				frappe.db.set_value("WBS Warehouse", name, "is_active", 0)
				frappe.db.commit()
				sc = True
		elif int(flag) == 0:
			frappe.db.set_value("WBS Warehouse", name, "is_active", 0)
			frappe.db.commit()
			sc = True

		return {"SC":sc}
	except Exception as ex:
		return {"EX":ex}
	# print("set active doc")
