// Copyright (c) 2019, Epoch and contributors
// For license information, please see license.txt

// display link fields based on warehouse.
frappe.ui.form.on("Stock Entry Detail", {
  form_render: (frm, cdt, cdn) => {
    let doc = locals[cdt][cdn]

    if (frm.doc.stock_entry_type === 'Material Transfer' || frm.doc.stock_entry_type === 'Material Issue') {

      if (doc.s_warehouse) {
        let s_wbs = is_wbs(doc.s_warehouse)

        if (s_wbs) {
          var wrapper = frm.fields_dict[doc.parentfield].grid.grid_rows_by_docname[cdn].grid_form.fields_dict['source_warehouse_storage_location'].$wrapper
          wrapper.show()
          frm.refresh_field('items')
        } else {
          var wrapper = frm.fields_dict[doc.parentfield].grid.grid_rows_by_docname[cdn].grid_form.fields_dict['source_warehouse_storage_location'].$wrapper
          wrapper.hide()
          frm.refresh_field('items')
        }
      } else {
        var wrapper = frm.fields_dict[doc.parentfield].grid.grid_rows_by_docname[cdn].grid_form.fields_dict['source_warehouse_storage_location'].$wrapper
        wrapper.hide()
        frm.refresh_field('items')
      }
    }

    if (frm.doc.stock_entry_type === 'Material Transfer' || frm.doc.stock_entry_type === 'Material Receipt') {

      if (doc.t_warehouse) {
        let t_wbs = is_wbs(doc.t_warehouse)

        if (t_wbs) {
          var wrapper = frm.fields_dict[doc.parentfield].grid.grid_rows_by_docname[cdn].grid_form.fields_dict['target_warehouse_storage_location'].$wrapper
          wrapper.show()
          frm.refresh_field('items')
        } else {
          var wrapper = frm.fields_dict[doc.parentfield].grid.grid_rows_by_docname[cdn].grid_form.fields_dict['target_warehouse_storage_location'].$wrapper
          wrapper.hide()
          frm.refresh_field('items')
        }
      } else {
        var wrapper = frm.fields_dict[doc.parentfield].grid.grid_rows_by_docname[cdn].grid_form.fields_dict['target_warehouse_storage_location'].$wrapper
        wrapper.hide()
        frm.refresh_field('items')
      }
    }

    if (!doc.source_warehouse_storage_location) {
      doc.source_storage_location_id ='';
      frm.refresh_field('items')
    }

    if (!doc.target_warehouse_storage_location) {
      doc.target_storage_location_id ='';
      frm.refresh_field('items')
    }
  },
  t_warehouse: (frm, cdt, cdn) => {
    let doc = locals[cdt][cdn]

    if (frm.doc.stock_entry_type === 'Material Transfer' || frm.doc.stock_entry_type === 'Material Receipt') {

      if (doc.t_warehouse) {
        let t_wbs = is_wbs(doc.t_warehouse)

        if (t_wbs) {
          var wrapper = frm.fields_dict[doc.parentfield].grid.grid_rows_by_docname[cdn].grid_form.fields_dict['target_warehouse_storage_location'].$wrapper
          wrapper.show()
          frm.refresh_field('items')
        } else {
          var wrapper = frm.fields_dict[doc.parentfield].grid.grid_rows_by_docname[cdn].grid_form.fields_dict['target_warehouse_storage_location'].$wrapper
          wrapper.hide()
          frm.refresh_field('items')
        }
      } else {
        var wrapper = frm.fields_dict[doc.parentfield].grid.grid_rows_by_docname[cdn].grid_form.fields_dict['target_warehouse_storage_location'].$wrapper
        wrapper.hide()
        frm.refresh_field('items')
      }
    }
  },
  s_warehouse: (frm, cdt, cdn) => {
    let doc = locals[cdt][cdn]

    if (frm.doc.stock_entry_type === 'Material Transfer' || frm.doc.stock_entry_type === 'Material Issue') {

      if (doc.s_warehouse) {
        let s_wbs = is_wbs(doc.s_warehouse)

        if (s_wbs) {
          var wrapper = frm.fields_dict[doc.parentfield].grid.grid_rows_by_docname[cdn].grid_form.fields_dict['source_warehouse_storage_location'].$wrapper
          wrapper.show()
          frm.refresh_field('items')
        } else {
          var wrapper = frm.fields_dict[doc.parentfield].grid.grid_rows_by_docname[cdn].grid_form.fields_dict['source_warehouse_storage_location'].$wrapper
          wrapper.hide()
          frm.refresh_field('items')
        }
      } else {
        var wrapper = frm.fields_dict[doc.parentfield].grid.grid_rows_by_docname[cdn].grid_form.fields_dict['source_warehouse_storage_location'].$wrapper
        wrapper.hide()
        frm.refresh_field('items')
      }

    }
  },
  item_code: (frm, cdt, cdn) => {
    var doc = locals[cdt][cdn]

    // if (!doc.item_code) {
    //
    //   if (doc.source_warehouse_storage_location) {
    //     doc.source_warehouse_storage_location = ''
    //     cur_frm.refresh_field('source_warehouse_storage_location')
    //   }
    //
    //   if (doc.target_warehouse_storage_location) {
    //     doc.target_warehouse_storage_location = ''
    //     cur_frm.refresh_field('target_warehouse_storage_location')
    //   }
    // }

    if (frm.doc.stock_entry_type === 'Material Issue') {

      if (doc.s_warehouse && doc.item_code) {

          let s_loc = get_nearest_loc_with_item(frm.doc.posting_date, doc.item_code, doc.s_warehouse)

          if (s_loc) {
            doc.source_warehouse_storage_location = s_loc
            let id = get_strg_id(s_loc)
            doc.source_storage_location_id = id ? id : '';
            frm.refresh_field('items')
          }  else {
            let previous = get_previous_transaction("SOURCE",frm.doc.posting_date, doc.s_warehouse, doc.item_code)

            if (previous) {
              doc.source_warehouse_storage_location = previous.strg_loc;
              let id = get_strg_id(previous.strg_loc)
              doc.source_storage_location_id = id ? id : '';
              frm.refresh_field('items')
            }
          }
      }
    } else if (frm.doc.stock_entry_type === 'Material Receipt') {
      if (doc.t_warehouse && doc.item_code) {
        let t_loc = get_nearest_loc_with_item(frm.doc.posting_date, doc.item_code, doc.t_warehouse)

        if(t_loc) {
          doc.target_warehouse_storage_location = t_loc
          let id = get_strg_id(t_loc)
          doc.target_storage_location_id = id ? id : '';
          frm.refresh_field('items')
        }  else {
          let previous = get_previous_transaction("TARGET",frm.doc.posting_date, doc.t_warehouse, doc.item_code)

          if (previous) {
            doc.target_warehouse_storage_location = previous.strg_loc;
            let id = get_strg_id(previous.strg_loc)
            doc.target_storage_location_id = id ? id : '';
            frm.refresh_field('items')
          }
        }
      }
    } else if (frm.doc.stock_entry_type === 'Material Transfer') {

      if ((doc.s_warehouse && doc.item_code) || (doc.t_warehouse && doc.item_code)) {
        let s_wbs;
        let t_wbs;

        if (doc.s_warehouse) {
          s_wbs = is_wbs(doc.s_warehouse)
        } else {
          s_wbs = ''
        }

        if (doc.t_warehouse) {
          t_wbs = is_wbs(doc.t_warehouse)
        } else {
          t_wbs = ''

        }

        if (s_wbs && t_wbs) {
          let s_loc = get_nearest_loc_with_item(frm.doc.posting_date, doc.item_code, doc.s_warehouse)
          let t_loc = get_nearest_loc_with_item(frm.doc.posting_date, doc.item_code, doc.t_warehouse)

          if (s_loc && t_loc) {

            if (s_loc) {
              doc.source_warehouse_storage_location = s_loc
              let id = get_strg_id(s_loc)
              doc.source_storage_location_id = id ? id : '';
              frm.refresh_field('items')

              if (t_loc) {
                doc.target_warehouse_storage_location = t_loc
                let id2 = get_strg_id(t_loc)
                doc.target_storage_location_id = id2 ? id2 : '';
                frm.refresh_field('items')
              }
            }


          } else if (s_loc && !t_loc) {
            doc.source_warehouse_storage_location = s_loc
            let id = get_strg_id(s_loc)
            doc.source_storage_location_id = id ? id : '';
            frm.refresh_field('items')

            if (!t_loc) {
              let previous = get_previous_transaction("TARGET",frm.doc.posting_date, doc.t_warehouse, doc.item_code)

              if (previous) {
                doc.target_warehouse_storage_location = previous.strg_loc;
                let id = get_strg_id(previous.strg_loc)
                doc.target_storage_location_id = id ? id : '';
                frm.refresh_field('items')
              }
            }
          } else if (t_loc && !s_loc) {
            doc.target_warehouse_storage_location = t_loc
            let id = get_strg_id(t_loc)
            doc.target_storage_location_id = id ? id : '';
            frm.refresh_field('items')

            if (!s_loc) {
              let previous = get_previous_transaction("SOURCE",frm.doc.posting_date, doc.s_warehouse, doc.item_code)


              if (previous) {
                doc.source_warehouse_storage_location = previous.strg_loc;
                let id = get_strg_id(previous.strg_loc)
                doc.source_storage_location_id = id ? id : '';
                frm.refresh_field('items')
              }
            }
          } else if (!t_loc && !s_loc) {
            let previous = get_previous_transaction("TARGET",frm.doc.posting_date, doc.t_warehouse, doc.item_code)
            console.log(previous)
            if (previous) {
              doc.target_warehouse_storage_location = previous.strg_loc;
              let id = get_strg_id(previous.strg_loc)
              doc.target_storage_location_id = id ? id : '';
              frm.refresh_field('items')
            }

            let sprevious = get_previous_transaction("SOURCE",frm.doc.posting_date, doc.s_warehouse, doc.item_code)
            console.log(sprevious)
            if (sprevious) {
              doc.source_warehouse_storage_location = sprevious.strg_loc;
              let id = get_strg_id(sprevious.strg_loc)
              doc.source_storage_location_id = id ? id : '';
              frm.refresh_field('items')
            }
          }
        } else if (s_wbs) {
          let s_loc = get_nearest_loc_with_item(frm.doc.posting_date, doc.item_code, doc.s_warehouse)

          if (s_loc) {
            doc.source_warehouse_storage_location = s_loc
            let id = get_strg_id(s_loc)
            doc.source_storage_location_id = id ? id : '';
            frm.refresh_field('items')
          }  else {
            let previous = get_previous_transaction("SOURCE",frm.doc.posting_date, doc.s_warehouse, doc.item_code)

            if (previous) {
              doc.source_warehouse_storage_location = previous.strg_loc;
              let id = get_strg_id(previous.strg_loc)
              doc.source_storage_location_id = id ? id : '';
              frm.refresh_field('items')
            }
          }
        } else if (t_wbs) {
          let t_loc = get_nearest_loc_with_item(frm.doc.posting_date, doc.item_code, doc.t_warehouse)

          if(t_loc) {
            doc.target_warehouse_storage_location = t_loc
            let id = get_strg_id(t_loc)
            doc.target_storage_location_id = id ? id : '';
            frm.refresh_field('items')
          }  else {
            let previous = get_previous_transaction("TARGET",frm.doc.posting_date, doc.t_warehouse, doc.item_code)

            if (previous) {
              doc.target_warehouse_storage_location = previous.strg_loc;
              let id = get_strg_id(previous.strg_loc)
              doc.target_storage_location_id = id ? id : '';
              frm.refresh_field('items')
            }
          }
        }
      }
    }
  },
  source_warehouse_storage_location: (frm, cdt, cdn) => {
    let doc = locals[cdt][cdn]

    if (frm.doc.purpose === 'Material Transfer') {

      if (doc.s_warehouse) {

        let s_wbs = is_wbs(doc.s_warehouse)

        if (!s_wbs) {
          doc.source_warehouse_storage_location = ''
          doc.source_storage_location_id = '';
          frm.refresh_field('items')
        }

        if (s_wbs) {

          if (doc.source_warehouse_storage_location) {
            let id = get_strg_id(doc.source_warehouse_storage_location)
            doc.source_storage_location_id = id ? id : '';
            frm.refresh_field('items')
          } else {
            doc.source_storage_location_id ='';
            frm.refresh_field('items')
          }
        }
      }
    }

    if (frm.doc.purpose === 'Material Receipt') {
      doc.source_warehouse_storage_location = ''
      doc.source_storage_location_id = '';
      frm.refresh_field('items')
    }
  },
  target_warehouse_storage_location: (frm, cdt, cdn) =>{
    let doc = locals[cdt][cdn]

    if (frm.doc.purpose === 'Material Transfer') {

      if (doc.t_warehouse) {

        let t_wbs = is_wbs(doc.t_warehouse)

        if (!t_wbs) {
          doc.target_warehouse_storage_location = ''
          doc.target_storage_location_id = '';
          frm.refresh_field('items')
        }

        if (t_wbs) {

          if (doc.target_warehouse_storage_location) {
            let id = get_strg_id(doc.target_warehouse_storage_location)
            doc.target_storage_location_id = id ? id : '';
            frm.refresh_field('items')
          } else {
            doc.target_storage_location_id ='';
            frm.refresh_field('items')
          }
        }
      }
    }

    if (frm.doc.purpose === 'Material Issue') {
      doc.target_warehouse_storage_location = ''
      doc.target_storage_location_id = '';
      frm.refresh_field('items')
    }
  }
});

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
        frappe.throw(__(r.message.EX))
      }

      if (r.message.ID) {
        id = r.message.ID
      } else {
        id = false
      }
    }
  })
  return id
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
      if (r.message.is_wbs_active === 1) {
        flag = true;
      } else if (r.message.is_wbs_active === 0){
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
                  ['name', 'in', settings_id]
                ]
              }
            } else {
              let last_transaction = get_previous_transaction("SOURCE",frm.doc.posting_date, child['s_warehouse'], child['item_code'])
              // console.log(last_transaction)
              if (last_transaction.length > 0) {

                return {
                  filters:[
                    ['name', 'in', last_transaction]
                  ]
                }
              }

              let name = get_storage_location(frm.doc.posting_date, child['s_warehouse'])
              console.log(name)

              if (name.length > 0) {
                return {
                  filters:[
                    ['name', 'in', name]
                  ]
                }
              } else {
                let settings_id = get_nearest_settings_id(frm.doc.posting_date, child['s_warehouse'])

                if (settings_id.length > 0) {
                  return {
                    filters:[
                      ['name', 'in', settings_id]
                    ]
                  }
                } else {
                  return {
                    filters:[
                      ['rarb_warehouse', '=', child['t_warehouse']],
                      ['is_group','=', '0']
                    ]
                  }
                }
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
                  ['name', 'in', settings_id]
                ]
              }
            } else {
              return {
                filters:[
                  ['rarb_warehouse', '=', child['s_warehouse']],
                  ['is_group','=','0']
                ]
              }
            }
          }
        } else {
          frappe.throw(__('Please select the source warehouse'))
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
            let name = get_relative_settings(frm.doc.posting_date, child['t_warehouse'], child['item_code'])

            if (name.length > 0) {
              return {
                filters:[
                  ['rarb_warehouse', '=', child['t_warehouse']],
                  ['name', 'in', name]
                ]
              }
            } else {
              let last_transaction = get_previous_transaction("TARGET",frm.doc.posting_date, child['t_warehouse'], child['item_code'])

              if (last_transaction.length > 0) {

                return {
                  filters:[
                    ['rarb_warehouse', '=', child['t_warehouse']],
                    ['name', 'in', last_transaction]
                  ]
                }
              }

              let name = get_storage_location(frm.doc.posting_date, child['t_warehouse'])

              if (name.length > 0) {
                return {
                  filters:[
                    ['name', 'in', name]
                  ]
                }
              } else {
                let settings_id = get_nearest_settings_id(frm.doc.posting_date, child['t_warehouse'])

                if (settings_id.length > 0) {
                  return {
                    filters:[
                      ['name', 'in', settings_id]
                    ]
                  }
                } else {
                  return {
                    filters:[
                      ['rarb_warehouse', '=', child['t_warehouse']],
                      ['is_group','=', '0']
                    ]
                  }
                }
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
                  ['name', 'in', settings_id]
                ]
              }
            } else {
              return {
                filters:[
                  ['rarb_warehouse', '=', child['t_warehouse']],
                  ['is_group','=', '0']
                ]
              }
            }
          }
        } else {
          frappe.throw(__(`Please select the target warehouse.`))
        }
      }
    }
  },
  validate: (frm, cdt, cdn) => {
    let doc = locals[cdt][cdn];
    let child = doc.items
    validate_child(child, doc.purpose);

    // let flag = check_stock_ledger_entry_for_transactions(JSON.stringify(doc))
    //
    // if (flag) {
    //     frappe.throw(__(flag))
    //     frappe.validated = false;
    // }
  }
});

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
        name = r.message
      } else if (r.message.EX) {
        frappe.throw(__(r.message.EX))
      } else {
        name = false
      }
    }
  });
  return name
}


function get_storage_location(date, warehouse) {
  let name = [];
  frappe.call({
    method: 'wbs.wbs.doctype.wbs_settings.wbs_settings.get_storage_location',
    args: {
      'date': date,
      'warehouse': warehouse
    },
    async: false,
    callback: (r) => {
      if (r.message.list) {
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
    if (purpose === 'Material Issue') {

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

    if (purpose === 'Material Receipt') {

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

    if (purpose === 'Material Transfer') {
      if (c.s_warehouse || c.t_warehouse) {
        let s_wbs;
        let t_wbs;
        if (c.s_warehouse) {
          s_wbs = is_wbs(c.s_warehouse)
        } else {
          s_wbs = ''
        }

        if (c.t_warehouse) {
          t_wbs = is_wbs(c.t_warehouse)
        } else {
          t_wbs = ''
        }

        if (s_wbs) {

          if (!c.source_warehouse_storage_location) {
            frappe.throw(__(`Source Warehouse Storage Location is mandatory for Stock Entry Type : ${purpose}, Please select Target Storage location at row : ${c.idx}`))
            frappe.validate = false;
          }
        }

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
