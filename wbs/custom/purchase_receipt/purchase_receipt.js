frappe.ui.form.on("Purchase Receipt", {
    setup: function(frm) {
        frm.get_update_stock = function(frm) {
            return frm.doc.update_stock;
        };
        frm.get_set_warehouse = function(frm) {
            return frm.doc.set_warehouse;
        }
    },
});


frappe.ui.form.on("Purchase Receipt Item", {
    form_render: function(frm, cdt, cdn) {
        if(frm.get_update_stock(frm)) {
            if(frm.get_set_warehouse(frm)) {
                let doc = locals[cdt][cdn];
                console.log(doc.warehouse)
                let wbs = is_wbs(doc.warehouse);
                console.log(wbs)

                if(wbs) {
                    var wrapper = frm.fields_dict[doc.parentfield].grid.grid_rows_by_docname[cdn].grid_form.fields_dict['warehouse_storage_location'].$wrapper;
                    wrapper.show();
                    refresh_field("items");
                } else {
                    var wrapper = frm.fields_dict[doc.parentfield].grid.grid_rows_by_docname[cdn].grid_form.fields_dict['warehouse_storage_location'].$wrapper;
                    wrapper.hide();
                    console.log("hide 1");
                    refresh_field("items");
                }
            } else {
                let doc = locals[cdt][cdn];
                var wrapper = frm.fields_dict[doc.parentfield].grid.grid_rows_by_docname[cdn].grid_form.fields_dict['warehouse_storage_location'].$wrapper;
                wrapper.hide();
                console.log("hide 2");
                refresh_field("items");
            }
        } else {
            let doc = locals[cdt][cdn];
            var wrapper = frm.fields_dict[doc.parentfield].grid.grid_rows_by_docname[cdn].grid_form.fields_dict['warehouse_storage_location'].$wrapper;
            wrapper.hide();
            console.log("hide 3");
            refresh_field("items");
        }
    },

    pch_ptr: function(frm, cdt, cdn) {
      let doc = locals[cdt][cdn];

      if(doc.pch_pts > doc.pch_ptr * 0.93) {
        doc.pch_pts = doc.pch_ptr * 0.93;
        refresh_field("items");
      }
    },    

    pch_pts: function(frm, cdt, cdn) {
      let doc = locals[cdt][cdn];

      if(doc.pch_ptr < doc.pch_pts * 1.07) {
        doc.pch_ptr = doc.pch_pts * 1.07;
        refresh_field("items");
      }
    },

    warehouse: function(frm, cdt, cdn) {
        let doc = locals[cdt][cdn];

        if(doc.warehouse) {
            let wbs = is_wbs(doc.warehouse);

            if(wbs) {
                var wrapper = frm.fields_dict[doc.parentfield].grid.grid_rows_by_docname[cdn].grid_form.fields_dict['warehouse_storage_location'].$wrapper;
                wrapper.show();
                refresh_field("items");
            } else {
                var wrapper = frm.fields_dict[doc.parentfield].grid.grid_rows_by_docname[cdn].grid_form.fields_dict['warehouse_storage_location'].$wrapper;
                wrapper.hide();
                console.log("hide 4");
                refresh_field("items");
            }
        } else {
            var wrapper = frm.fields_dict[doc.parentfield].grid.grid_rows_by_docname[cdn].grid_form.fields_dict['warehouse_storage_location'].$wrapper;
            wrapper.hide();
            console.log("hide 5");
            refresh_field("items");
        }
    },

    item_code: function(frm, cdt, cdn) {
        var doc = locals[cdt][cdn]

        if(doc.item_code && doc.warehouse) {
            let loc = get_nearest_loc_with_item(frm.doc.posting_date, doc.item_code, doc.warehouse);
            console.log("nearest", loc)
            if(loc) {
                let id = get_strg_id(loc);
                console.log("in loc", id)
                doc.warehouse_storage_location = loc;
                doc.storage_location_id = id ? id : '';
                frm.refresh_field('items');
            } else {
                let previous = get_previous_transaction("TARGET", frm.doc.posting_date, doc.warehouse, doc.item_code);
                console.log("previous", previous);
                if(previous) {
                    let id = get_strg_id(previous.strg_loc);
                    console.log("previous id", id);
                    doc.warehouse_storage_location = previous.strg_loc;
                    doc.storage_location_id = id ? id : '';
                    frm.refresh_field('items');
                }
            }
        }
    },
});


function is_wbs(warehouse) {
    let flag;

    frappe.call({
      method: 'wbs.wbs.doctype.wbs_settings.wbs_settings.is_wbs',
      args: {
        'warehouse': warehouse
      },
      async: false,
      callback: (r) => {
        if (r.message.is_wbs_active === 1) {
          flag = true;
        } else if (r.message.is_wbs_active === 0){
          flag = false;
        }
      }
    });
    return flag;
}

function get_nearest_loc_with_item(date, item_code, warehouse) {
    let location;
    frappe.call({
      method: 'wbs.wbs.doctype.wbs_storage_location.wbs_storage_location.get_nearest_loc_with_item',
      args: {
        'date': date,
        'item_code': item_code,
        'warehouse': warehouse
      },
      async: false,
      callback: (r) => {
        if (r.message.location) {
          location = r.message.location;
        } else if (r.message.EX) {
          frappe.throw(__(r.message.EX));
        } else {
          location = false;
        }
      }
    });
    return location;
}

function get_strg_id(warehouse) {
    let id;
    frappe.call({
      method: 'wbs.wbs.doctype.wbs_storage_location.wbs_storage_location.get_strg_id',
      args: {
        'warehouse': warehouse
      },
      async: false,
      freeze: true,
      callback: (r) => {
        if (r.message.EX) {
          frappe.throw(__(r.message.EX));
        }
  
        if (r.message.ID) {
          id = r.message.ID;
        } else {
          id = false;
        }
      }
    })
    return id;
}

function get_previous_transaction(type, date, warehouse, item_code) {
    let name;
    frappe.call({
      method: 'wbs.wbs.doctype.wbs_settings.wbs_settings.get_previous_transaction',
      args: {
        'type': type,
        'date': date,
        'warehouse': warehouse,
        'item_code': item_code
      },
      async: false,
      callback: (r) => {
        if (r.message) {
          name = r.message;
        } else if (r.message.EX) {
          frappe.throw(__(r.message.EX));
        } else {
          name = false;
        }
      }
    });
    return name;
}