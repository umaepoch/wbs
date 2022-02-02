// Copyright (c) 2019, Epoch and contributors
// For license information, please see license.txt

// display link fields based on warehouse.
frappe.ui.form.on("Stock Entry Detail", {
  form_render: (frm, cdt, cdn) => {
    let doc = locals[cdt][cdn];

    if (!frm.doc.stock_entry_type) {
      frappe.throw(__(`Please select Stock Entry Type before adding Items.`))
    }
    
    if (frm.doc.stock_entry_type === 'Material Transfer' || frm.doc.stock_entry_type === 'Material Issue') {

      if (doc.s_warehouse) {
        let s_wbs = is_wbs(doc.s_warehouse)

        if (s_wbs) {
          frm.fields_dict["items"].grid.set_column_disp("source_warehouse_storage_location",1);
        } else {
          frm.fields_dict["items"].grid.set_column_disp("source_warehouse_storage_location",0);
        }
      } else {
        frm.fields_dict["items"].grid.set_column_disp("source_warehouse_storage_location",0);
      }
    }

    if (frm.doc.stock_entry_type === 'Material Transfer' || frm.doc.stock_entry_type === 'Material Receipt') {

      if (doc.t_warehouse) {
        let t_wbs = is_wbs(doc.t_warehouse)

        if (t_wbs) {
          frm.fields_dict["items"].grid.set_column_disp("target_warehouse_storage_location",1);
        } else {
          frm.fields_dict["items"].grid.set_column_disp("target_warehouse_storage_location",0);
        }
      } else {
        frm.fields_dict["items"].grid.set_column_disp("target_warehouse_storage_location",0);
      }
    }

  },
  t_warehouse: (frm, cdt, cdn) => {
    let doc = locals[cdt][cdn]

    if (frm.doc.stock_entry_type === 'Material Transfer' || frm.doc.stock_entry_type === 'Material Receipt') {

      if (doc.t_warehouse) {
        let t_wbs = is_wbs(doc.t_warehouse)

        if (t_wbs) {
          console.log('show')
          frm.fields_dict["items"].grid.set_column_disp("target_warehouse_storage_location",1);
        } else {
          console.log('hide')
          frm.fields_dict["items"].grid.set_column_disp("target_warehouse_storage_location",0);
        }
      }
    }
  },
  s_warehouse: (frm, cdt, cdn) => {
    let doc = locals[cdt][cdn]

    if (frm.doc.stock_entry_type === 'Material Transfer' || frm.doc.stock_entry_type === 'Material Issue') {

      if (doc.s_warehouse) {
        let s_wbs = is_wbs(doc.s_warehouse)

        if (s_wbs) {
          console.log('show')
          frm.fields_dict["items"].grid.set_column_disp("source_warehouse_storage_location",1);
        } else {
          console.log('hide')
          frm.fields_dict["items"].grid.set_column_disp("source_warehouse_storage_location",0);
        }
      }
    }
  }
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
      if (r.message.is_wbs_active) {
        flag = true;
      } else {
        console.log('false not active wbs')
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

    // filters for item_code.
    frm.fields_dict["items"].grid.get_field("item_code").get_query = function(doc, cdt, cdn) {
      var child = locals[cdt][cdn]
      if (doc.purpose === 'Material Transfer' || doc.purpose === 'Material Issue') {

        if (child['source_warehouse_storage_location']) {
          let specific = get_specific_items(child['source_warehouse_storage_location'])

          if (specific.length > 0) {
            return {
              filters:[
                ['item_code', 'in', specific]
              ]
            }
          }
        }
      } else if (doc.purpose === 'Material Receipt') {

        if (child['target_warehouse_storage_location']) {
            let specific = get_specific_items(child['target_warehouse_storage_location'])

            if (specific.length > 0) {
              return {
                filters:[
                  ['item_code', 'in', specific]
                ]
              }
            }
        }
      }
    }


    // filters for source warehouse storage location.
    frm.fields_dict["items"].grid.get_field("source_warehouse_storage_location").get_query = function(doc, cdt, cdn) {
      var child = locals[cdt][cdn];

      if (child['s_warehouse']) {
        let t_wbs = is_wbs(child['s_warehouse'])

        if (t_wbs) {
          let settings_id = get_nearest_settings_id(frm.doc.posting_date, child['s_warehouse'])

          if (settings_id.length > 0) {
            return {
              filters:[
                ['rarb_warehouse', '=', child['s_warehouse']],
                ['wbs_settings_id', 'in', settings_id]
              ]
            }
          }
        }
      } else {
        return {
          filters:[
            ['rarb_warehouse', '=', child['s_warehouse']]
          ]
        }
      }

    }

    // filters for target warehouse storage location.
    frm.fields_dict["items"].grid.get_field("target_warehouse_storage_location").get_query = function(doc, cdt, cdn) {
      var child = locals[cdt][cdn];

      if (child['t_warehouse']) {
        let t_wbs = is_wbs(child['t_warehouse'])

        if (t_wbs) {
          let settings_id = get_nearest_settings_id(frm.doc.posting_date, child['t_warehouse'])

          if (settings_id.length > 0) {
            return {
              filters:[
                ['rarb_warehouse', '=', child['t_warehouse']],
                ['wbs_settings_id', 'in', settings_id]
              ]
            }
          }
        }
      } else {
        return {
          filters:[
            ['rarb_warehouse', '=', child['t_warehouse']]
          ]
        }
      }
    }
  },
  validate: (frm, cdt, cdn) => {
    let doc = locals[cdt][cdn];
    let child = doc.items
    validate_child(child);
  }
});

// API to get filter for items.
function get_specific_items(location) {
  let item = [];
  frappe.call({
    method: 'wbs.wbs.doctype.wbs_storage_location.wbs_storage_location.get_specific_items',
    args: {
      'location': location
    },
    async: false,
    callback: (r) => {
      if (r.message.list) {
        r.message.list.forEach((i) => {
          item.push(i.item_code)
        });
        item.sort()
      } else if (r.message.EX) {
        frappe.throw(__(r.message.EX))
      } else {
        item = [];
      }
    }
  });
  return item
}

// API to getfilter to storage locations.
function get_nearest_settings_id(trans_date, warehouse) {
  let list = []
  frappe.call({
    method: 'wbs.wbs.doctype.wbs_settings.wbs_settings.get_nearest_settings_id',
    args: {
      'transaction_date': trans_date,
      'warehouse': warehouse
    },
    async: false,
    callback: (r) => {
      if (r.message.list) {
        r.message.list.forEach(l => {
          list.push(l.name);
        });
      } else if (r.message.EX) {
        frappe.throw(__(r.message.EX))
      } else {
        list = []
      }
    }
  });
  return list
}


function validate_child(child) {

  child.forEach(c => {
    console.log(c)
    if (c.s_warehouse) {
      let s_wbs = is_wbs(c.s_warehouse)

      if (s_wbs) {
        if (!c.source_warehouse_storage_location) {
          frappe.throw(__(`Please select Source Warehouse Storage Location for WBS Warehouse ${c.s_warehouse} at row : ${c.idx} in Stock Entry Detail Items`))
        }
      }
    }

    if (c.t_warehouse) {
      let t_wbs = is_wbs(c.t_warehouse)

      if (t_wbs) {

        if (!c.target_warehouse_storage_location) {
          frappe.throw(__(`Please select Target Warehouse Storage Location for WBS Warehouse ${c.t_warehouse} at row : ${c.idx} in Stock Entry Detail Items`))
        }
      }
    }
  });
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
