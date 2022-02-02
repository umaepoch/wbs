// Copyright (c) 2019, Epoch and contributors
// For license information, please see license.txt

let purpose;

// display link fields based on warehouse.
frappe.ui.form.on("Stock Entry Detail", {
  form_render: (frm, cdt, cdn) => {
    let doc = locals[cdt][cdn];
    if (doc.s_warehouse) {
      let s_wbs = is_wbs(doc.s_warehouse)

      if (s_wbs) {
        cur_frm.fields_dict["items"].grid.set_column_disp("source_warehouse_storage_location",1);
      } else {
        cur_frm.fields_dict["items"].grid.set_column_disp("source_warehouse_storage_location",0);
      }
    } else {
      cur_frm.fields_dict["items"].grid.set_column_disp("source_warehouse_storage_location",0);
    }

    if (doc.t_warehouse) {
      let t_wbs = is_wbs(doc.t_warehouse)

      if (t_wbs) {
        cur_frm.fields_dict["items"].grid.set_column_disp("target_warehouse_storage_location",1);
      } else {
        cur_frm.fields_dict["items"].grid.set_column_disp("target_warehouse_storage_location",0);
      }
    } else {
      cur_frm.fields_dict["items"].grid.set_column_disp("target_warehouse_storage_location",0);
    }
  },
  t_warehouse: (frm, cdt, cdn) => {
    if (frm.doc.stock_entry_type === 'Material Transfer') {
      let doc = locals[cdt][cdn]

      if (doc.t_warehouse) {
        let t_wbs = is_wbs(doc.t_warehouse)

        if (t_wbs) {
          cur_frm.fields_dict["items"].grid.set_column_disp("target_warehouse_storage_location",1);
        } else {
          cur_frm.fields_dict["items"].grid.set_column_disp("target_warehouse_storage_location",0);
        }
      }
    }
  },
  s_warehouse: (frm, cdt, cdn) => {

    if (frm.doc.stock_entry_type === 'Material Transfer') {
      let doc = locals[cdt][cdn]

      if (doc.s_warehouse) {
        let s_wbs = is_wbs(doc.s_warehouse)

        if (s_wbs) {
          cur_frm.fields_dict["items"].grid.set_column_disp("source_warehouse_storage_location",1);
        } else {
          cur_frm.fields_dict["items"].grid.set_column_disp("source_warehouse_storage_location",0);
        }
      }
    }
  }
});

function is_wbs(warehouse) {
  let flag;
  frappe.call({
    method: 'frappe.client.get_value',
    args: {
      'doctype': 'Warehouse',
      'filetrs': {'is_wbs_active': 1, 'warehouse': warehouse},
      'fieldname': 'is_wbs_active'
    },
    async: false,
    callback: (r) => {
      if (r.message.is_wbs_active) {
        flag = true;
      } else {
        flag = false;
      }
    }
  });
  return flag
}



// Set filter for link fields.
frappe.ui.form.on('Stock Entry', {
  refresh: (frm, cdt, cdn) => {
    var doc = locals[cdt][cdn]

    // filters for source warehouse storage location.
    frm.fields_dict["items"].grid.get_field("source_warehouse_storage_location").get_query = function(doc, cdt, cdn) {
      var child = locals[cdt][cdn];
      return {
        filters:[
          ['rarb_warehouse', '=', child['s_warehouse']]
        ]
      }
    }

    // filters for target warehouse storage location.
    frm.fields_dict["items"].grid.get_field("target_warehouse_storage_location").get_query = function(doc, cdt, cdn) {
      var child = locals[cdt][cdn];
      return {
        filters:[
          ['rarb_warehouse', '=', child['t_warehouse']]
        ]
      }
    }
  }
});


function get_latest_wbs(warehouse) {
  let settings;
  // frappe.call({
  //   method: 'frappe.client.get_value',
  //   args: {
  //     'doctype': 'WBS Settings',
  //     'filters': {'start_date'}
  //   }
  // });
}

function get_value(s_warehouse) {
  let flag;
  frappe.call({
    method: 'frappe.client.get_value',
    args: {
      'doctype': 'WBS Warehouse',
      'filters': {'is_active': 1, 'warehouse': s_warehouse},
      'fieldname': 'is_active'
    },
    async: false,
    callback: function(r) {
      if (r.message.is_active) {
        flag = true
      } else {
        flag = false
      }
    }
  })
  return flag
}
