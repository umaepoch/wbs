// Copyright (c) 2019, Epoch and contributors
// For license information, please see license.txt


frappe.ui.form.on("WBS Warehouse", "refresh", function(frm, cdt, cdn){
	var doc = locals[cdt][cdn]
	if (cur_frm.doc.__islocal){
			if(cur_frm.doc.amended_from == undefined){
				cur_frm.set_df_property("wbs", "hidden", true);
			}
			else if(cur_frm.doc.amended_from != undefined){
				cur_frm.set_df_property("make_wbs", "hidden", true);
			}
		}
		if(cur_frm.doc.warehouse != undefined){
			cur_frm.set_df_property("warehouse", "read_only", true);
		}
});

frappe.ui.form.on("WBS Warehouse", "is_active", function(frm, cdt, cdn) {
	var doc = locals[cdt][cdn]
	var today = new Date();
	var dd = String(today.getDate()).padStart(2, '0');
	var mm = String(today.getMonth() + 1).padStart(2, '0');
	var yyyy = today.getFullYear();

	if (doc.is_active === 1) {
		today = yyyy+"-"+mm+"-"+dd
			if (doc.start_date != today){
				cur_frm.set_value("is_active", 0)
				if (doc.docstatus === 1) {
					console.log(doc)
					cur_frm.set_df_property('start_date','allow_on_submit', 1)
					refresh_field('start_date')
				}
				refresh_field('is_active')
				frappe.throw(__("Start date should be today for the WBS Warehouse to be active."))
			}
	}
})

// Get End Date.
frappe.ui.form.on("WBS Warehouse", "on_submit", function(frm, cdt, cdn) {
	var doc = locals[cdt][cdn]

	console.log(doc)
	if (doc.docstatus === 1) {
		var higher_date = get_higher_date(doc.warehouse, doc.start_date, doc.name)
		if (higher_date) {
				frm.reload_doc()
		}
	}
});

// API to get higher date.
// @return BOOLEAN.
// @param warehouse, start_date, doc_name.
function get_higher_date(warehouse, start_date, name) {
	var flag;
	frappe.call({
        method: 'wbs.wbs.doctype.wbs_warehouse.wbs_warehouse.get_higher_date',
        args: {
	    	"warehouse":warehouse,
      	"start_date":start_date,
	    	"name":name
        },
        async: false,
        callback: function(r) {
					if (r.message.SC) {
						flag = r.message.SC
					}
					if (r.message.EX) {
						frappe.throw(__(r.message.EX))
					}
        }
    });
		return flag
}

// validate child table items.
frappe.ui.form.on("WBS Warehouse", "validate", function(frm, cdt, cdn) {
	$.each(frm.doc.wbs || [], function(i, d) {
		if(d.wbs_type == "Specific Item" && (d.wbs_item=="" || d.wbs_item==null || d.wbs_item==undefined)) {
			frappe.msgprint("Row"+ '"'+d.idx+'"'+" WBS type is Mandatory ")
			frappe.validated = false;
		}
	});
});

// make WBS Items child tabel.
frappe.ui.form.on("WBS Warehouse", "make_wbs", function(frm, cdt, cdn) {
	var doc = locals[cdt][cdn]
	cur_frm.set_df_property("wbs", "hidden", false);
		for(var i = 1; i <= doc.number_of_rooms; i++){
			for(var j = 1; j <=  doc.number_of_aisles_per_room; j++){
				for(var k =1; k <= doc.number_of_racks_per_aisle; k++){
					for(var l = 1; l <= doc.number_of_bins_per_rack; l++){
						var wbs_id = i+"-"+j+"-"+k+"-"+l;
						var child = cur_frm.add_child("wbs");
				                frappe.model.set_value(child.doctype, child.name, "wbs_id", wbs_id);
					}
				}
			}
		cur_frm.refresh_field('wbs');
		}
		cur_frm.set_df_property("make_wbs", "hidden", true);
});

// create WBS ID.
frappe.ui.form.on("WBS Warehouse", "on_submit", function(frm, cdt, cdn) {
	var doc = locals[cdt][cdn]
	create_wbs_id(doc.name, doc.warehouse,doc.wbs);

})


// API for creating WBS ID.
// @return BOOLEAN.
// @param doc_name, warehouse, WBS id's.
function create_wbs_id(name, warehouse, wbs_ids) {
	frappe.call({
        method: 'wbs.wbs.doctype.wbs_warehouse.wbs_warehouse.create_wbs_id',
        args: {
	   "name":name,
	   "warehouse":warehouse,
	   "wbs_ids":wbs_ids
        },
        async: false,
        callback: function(r) {
           if (r.message.SC) {
						 frappe.msgprint("WBS ID's has been created!!!")
					 }
					 if (r.message.EX) {
						 frappe.throw(__(r.message.EX))
					 }
        }
    });
}


//	Make WBS Type Hidden based on WBS Active Status.
frappe.ui.form.on("WBS Item", "wbs_active", function(frm, cdt, cdn) {
	var doc = locals[cdt][cdn]
	if (doc.wbs_active === "Yes") {
		cur_frm.fields_dict.wbs.grid.toggle_display("wbs_type", true)
	} else {
		cur_frm.fields_dict.wbs.grid.toggle_display("wbs_type", false)
	}
});

// Make WBS Item Hidden on WBS type.
frappe.ui.form.on("WBS Item", "wbs_type", function(frm, cdt, cdn) {
	var doc = locals[cdt][cdn]
	if (doc.wbs_type === "Specific Item") {
		cur_frm.fields_dict.wbs.grid.toggle_display("wbs_item", true)
	}
	if (doc.wbs_type === "Any Item") {
		cur_frm.fields_dict.wbs.grid.toggle_display("wbs_item", false)
	}
})
