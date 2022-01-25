// Copyright (c) 2022, yashwanth and contributors
// For license information, please see license.txt

frappe.ui.form.on('WBS Storage Location', {
	refresh: (frm) => {

    if (!frm.doc.__islocal) {

      if (frm.doc.is_group === 1) {
        frm.set_df_property('item_details_section', 'hidden', true);
        frm.set_df_property('stored_items_section', 'hidden', true);
      } else {
        frm.set_df_property('item_details_section', 'hidden', false);
        frm.set_df_property('stored_items_section', 'hidden', false);
      }
    }
	},
  is_group: (frm) => {

    if (frm.doc.is_group === 1) {
      frm.set_df_property('item_details_section', 'hidden', true);
      frm.set_df_property('stored_items_section', 'hidden', true);
    } else {
      frm.set_df_property('item_details_section', 'hidden', false);
      frm.set_df_property('stored_items_section', 'hidden', false);
    }
  },
  wbs_settings_id: (frm) => {

    if (frm.doc.wbs_settings_id) {
      let rarb_warehouse = get_rarb_warehouse(frm.doc.wbs_settings_id);

      if (rarb_warehouse) {
        frm.set_value('rarb_warehouse', rarb_warehouse)
        frm.refresh_field('rarb_warehouse');
      }

      let attributes = get_attributes(frm.doc.wbs_settings_id);
      if (attributes) {
        console.log(attributes);
      }
    }
  }
});


// API to get Warehouse flagged as RARB from WBS Settings.
// @param ID.
// @return WAREHOUSE.
function get_rarb_warehouse(ID) {
  let warehouse;
  frappe.call({
    method:'frappe.client.get_value',
    args: {
      'doctype': 'WBS Settings',
      'filters': {'name': ID},
      'fieldname': 'warehouse'
    },
    async: false,
    callback: (r) => {
      if (r.message.warehouse) {
        warehouse = r.message.warehouse;
      } else {
        warehouse = false;
      }
    }
  });
  return warehouse
}

// API to get Warhouse Attributes.
// @return ATTRIBUTES.
// @param ID.
function get_attributes(ID) {
  let attrs;
  frappe.call({
    method:'wbs.wbs.doctype.wbs_storage_location.wbs_storage_location.get_attributes',
    args: {
      'id': ID
    },
    async: false,
    callback: (r) => {
      if (r.message.SC) {
        attrs = r.message.attrs;
      } else {
        attrs = false;
      }
    }
  });
  return attrs
}
