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
  },
  item_code: (frm, cdt, cdn) => {
    var doc = locals[cdt][cdn]

    if (frm.doc.stock_entry_type === 'Material Transfer' || frm.doc.stock_entry_type === 'Material Issue') {

      if (doc.s_warehouse && doc.item_code) {

          let s_loc = get_nearest_loc_with_item(frm.doc.posting_date, doc.item_code, doc.s_warehouse)

          if (s_loc) {
            doc.source_warehouse_storage_location = s_loc
            cur_frm.refresh_field('source_warehouse_storage_location')
          }
      }
    } else if (frm.doc.stock_entry_type === 'Material Receipt') {

      if (doc.t_warehouse && doc.item_code) {
        let t_loc = get_nearest_loc_with_item(frm.doc.posting_date, doc.item_code, doc.t_warehouse)

        if(t_loc) {
          doc.target_warehouse_storage_location = t_loc
          cur_frm.refresh_field('target_warehouse_storage_location')
        }
      }
    }
  }
});

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
        location = r.message.location
      } else if (r.message.EX) {
        frappe.throw(__(r.message.EX))
      } else {
        location = false
      }
    }
  });
  return location
}

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

      if (doc.purpose === 'Material Transfer' || doc.purpose === 'Material Issue') {

        if (child['s_warehouse'] && child['item_code']) {
          let s_wbs = is_wbs(child['s_warehouse'])

          if (s_wbs) {
            let settings_id = get_relative_settings(frm.doc.posting_date, child['s_warehouse'], child['item_code']);

            if (settings_id.length > 0) {
              return {
                filters:[
                  ['rarb_warehouse', '=', child['s_warehouse']],
                  ['name', 'in', settings_id]
                ]
              }
            } else {
              let name = get_storage_location(frm.doc.posting_date, child['s_warehouse'])

              if (settings_id.length > 0) {
                return {
                  filters:[
                    ['rarb_warehouse', '=', child['s_warehouse']],
                    ['name', 'in', name]
                  ]
                }
              } else {
                frappe.throw(__(`No Storage location for combination Source warehouse : ${child['t_warehouse']} and Item : ${child['item_code']}`))
              }
            }
          }
        } else if (child['s_warehouse']) {
          let s_wbs = is_wbs(child['s_warehouse'])

          if (s_wbs) {
            let settings_id = get_nearest_settings_id(frm.doc.posting_date, child['s_warehouse'])

            if (settings_id.length > 0) {
              return {
                filters:[
                  ['rarb_warehouse', '=', child['s_warehouse']],
                  ['name', 'in', settings_id]
                ]
              }
            } else {
              return {
                filters:[
                  ['rarb_warehouse', '=', child['s_warehouse']]
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

    }

    // filters for target warehouse storage location.
    frm.fields_dict["items"].grid.get_field("target_warehouse_storage_location").get_query = function(doc, cdt, cdn) {
      var child = locals[cdt][cdn];

      if (doc.purpose === 'Material Receipt' || doc.purpose === 'Material Transfer') {

        if (child['t_warehouse'] && child['item_code']) {
          let t_wbs = is_wbs(child['t_warehouse'])

          if (t_wbs) {
            let settings_id = get_relative_settings(frm.doc.posting_date, child['t_warehouse'], child['item_code'])

            if (settings_id.length > 0) {
              return {
                filters:[
                  ['rarb_warehouse', '=', child['t_warehouse']],
                  ['name', 'in', settings_id]
                ]
              }
            } else {

              let name = get_storage_location(frm.doc.posting_date, child['t_warehouse'], child['item_code'])

              if (name.length > 0) {
                return {
                  filters:[
                    ['rarb_warehouse', '=', child['t_warehouse']],
                    ['name', 'in', name]
                  ]
                }
              } else {
                frappe.throw(`No Storage location for combination Target warehouse : ${child['t_warehouse']} and Item : ${child['item_code']}`)
              }
            }
          }
        } else if (child['t_warehouse']) {
          let t_wbs = is_wbs(child['t_warehouse'])

          if (t_wbs) {
            let settings_id = get_nearest_settings_id(frm.doc.posting_date, child['t_warehouse'])

            if (settings_id.length > 0) {
              return {
                filters:[
                  ['rarb_warehouse', '=', child['t_warehouse']],
                  ['name', 'in', settings_id]
                ]
              }
            } else {
              return {
                filters:[
                  ['rarb_warehouse', '=', child['t_warehouse']]
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
    }
  },
  validate: (frm, cdt, cdn) => {
    let doc = locals[cdt][cdn];
    let child = doc.items
    validate_child(child, doc.purpose);

    let flag = check_stock_ledger_entry_for_transactions(JSON.stringify(doc))

    if (flag) {
        frappe.throw(__(flag))
        frappe.validated = false;
    }
  },
  after_save: (frm, cdt, cdn) => {

    if (frm.doc.docstatus === 1) {
      console.log(frm.doc.docstatus)
    }
  }
});


function get_storage_location(date, warehouse, item_code) {
  let name = [];
  frappe.call({
    method: 'wbs.wbs.doctype.wbs_settings.wbs_settings.get_storage_location',
    args: {
      'date': date,
      'warehouse': warehouse,
      'item_code': item_code
    },
    async: false,
    callback: (r) => {
      if (r.message.list) {
        console.log(r.message.list)
        r.message.list.forEach((i) => {
          name.push(i.name);
        });

      } else if (r.message.EX) {
        frappe.throw(__(r.message.EX))
      } else {
        name = []
      }
    }
  });
  return name
}

function check_stock_ledger_entry_for_transactions(doc) {
  let exc;
  frappe.call({
    method: 'wbs.wbs.doctype.wbs_settings.wbs_settings.check_stock_ledger_entry_for_transactions',
    args: {
      'doc': doc
    },
    async: false,
    freeze: true,
    callback: (r) => {
      if (r.message.Error) {
        exc = r.message.Error
      } else if (r.message.EX) {
        frappe.throw(__(r.message.EX))
      }
    }
  });
  return exc
}

function get_relative_settings(date, warehouse, item_code) {
  let list = [];
  frappe.call({
    method: 'wbs.wbs.doctype.wbs_settings.wbs_settings.get_relative_settings',
    args: {
      'transaction_date': date,
      'warehouse': warehouse,
      'item_code': item_code
    },
    async: false,
    callback: (r) => {
      if (r.message.list) {
        r.message.list.forEach(n => {
          list.push(n.name)
        })
      } else if (r.message.EX) {
        frappe.throw(__(r.message.throw))
      } else {
        list = []
      }
    }
  });
  return list
}

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


function validate_child(child, purpose) {

  child.forEach(c => {
    if (purpose === 'Material Issue' || purpose === 'Material Transfer') {

      if (c.s_warehouse) {
        let s_wbs = is_wbs(c.s_warehouse)

        if (s_wbs) {
          if (!c.source_warehouse_storage_location) {
            frappe.throw(__(`Source Warehouse Storage Location is mandatory for Stock Entry Type : ${purpose}, Please select Target Storage location at row : ${c.idx}`))
            frappe.validate = false;
          }

        }
      }
    }

    if (purpose === 'Material Receipt' || purpose === 'Material Transfer') {

      if (c.t_warehouse) {
        let t_wbs = is_wbs(c.t_warehouse)

        if (t_wbs) {

          if (!c.target_warehouse_storage_location) {
            frappe.throw(__(`Target Warehouse Storage Location is mandatory for Stock Entry Type : ${purpose}, Please select Target Storage location at row : ${c.idx}`));
            frappe.validated = false;
          }
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
