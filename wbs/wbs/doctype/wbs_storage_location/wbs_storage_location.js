// Copyright (c) 2022, yashwanth and contributors
// For license information, please see license.txt

frappe.ui.form.on('WBS Storage Location', {
	refresh: (frm) => {

    if (!frm.doc.__islocal) {

			// Hide Section Location and items if is_group.
      if (frm.doc.is_group === 1) {
        frm.set_df_property('item_details_section', 'hidden', true);
        frm.set_df_property('stored_items_section', 'hidden', true);

      } else {
        frm.set_df_property('item_details_section', 'hidden', false);

				if (frm.doc.storage_location_can_store === 'Any Items') {
					frm.set_df_property('stored_items_section', 'hidden', true);
				} else {
					frm.set_df_property('stored_items_section', 'hidden', false);
				}
      }

			// Hide Field Attribute Name if not name.
			if (frm.doc.attribute_record_by_idname === 'Name') {
				frm.set_df_property('attribute', 'hidden', false);
			} else {
				frm.set_df_property('attribute', 'hidden', true);
			}

			// Display List options attribute_level.
			if (frm.doc.wbs_settings_id) {

				frm.trigger('set_level');

			} else {
				frm.set_df_property('attribute_level', 'options', []);
				frm.refresh_field('attribute_level');
			}
    }
	},
  is_group: (frm) => {

    if (frm.doc.is_group === 1) {
      frm.set_df_property('item_details_section', 'hidden', true);
      frm.set_df_property('stored_items_section', 'hidden', true);
    } else {
      frm.set_df_property('item_details_section', 'hidden', false);

			if (frm.doc.storage_location_can_store === 'Any Items') {
				frm.set_df_property('stored_items_section', 'hidden', true);
			} else {
				frm.set_df_property('stored_items_section', 'hidden', false);
			}
    }
  },
  wbs_settings_id: (frm) => {

		if (!frm.doc.__islocal && frm.doc.wbs_settings_id) {
			frm.set_value('attribute_level', '');
			frm.refresh_field('attribute_level');
		}

    if (frm.doc.wbs_settings_id) {
      let rarb_warehouse = get_rarb_warehouse(frm.doc.wbs_settings_id);

      if (rarb_warehouse) {
        frm.set_value('rarb_warehouse', rarb_warehouse)
        frm.refresh_field('rarb_warehouse');
      }

			frm.trigger('set_level');

		} else {
			frm.set_df_property('attribute_level', 'options', []);
			frm.refresh_field('attribute_level');
		}

  },
	attribute_record_by_idname: (frm) => {

		if (frm.doc.attribute_record_by_idname === 'Name') {
			frm.set_df_property('attribute', 'hidden', false);
		} else {
			frm.set_df_property('attribute', 'hidden', true);
		}
	},
	storage_location_can_store: (frm) => {

		if (frm.doc.storage_location_can_store === 'Any Items') {
			frm.set_df_property('stored_items_section', 'hidden', true);
		} else {
			frm.set_df_property('stored_items_section', 'hidden', false);
		}
	},
	attribute_level: (frm) => {

		if (frm.doc.attribute_level) {

			if (parseInt(frm.doc.attribute_level) === 1) {
				frm.set_value('parent_attribute', `Level ${frm.doc.attribute_level} Attribute`);
				frm.refresh_field('parent_attribute');
				frm.trigger('set_name');
			}

			if (parseInt(frm.doc.attribute_level) > 1) {
				frm.set_value('parent_attribute', '');
				frm.refresh_field('parent_attribute');
				frm.trigger('set_name');
			}

		} else {
			frm.set_value('parent_attribute', '');
			frm.refresh_field('parent_attribute');
			frm.set_value('attribute_name', '');
			frm.refresh_field('attribute_name');
		}
	},
	set_level: (frm) => {
		let attributes = get_attributes(frm.doc.wbs_settings_id);

		if (attributes) {
			let atr_lv = [];
				attributes.forEach(lv => {
					atr_lv.push(lv.attribute_level);
				});

				if (atr_lv.length > 0) {
					frm.set_df_property('attribute_level', 'options', atr_lv.sort());
					frm.refresh_field('attribute_level');
				}
		}
	},
	set_name: (frm) => {
		let atr_name = get_attribute_name(frm.doc.wbs_settings_id, frm.doc.attribute_level);

		if (atr_name) {
			frm.set_value('attribute_name', atr_name);
			frm.refresh_field('attribute_name');
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
        attrs = r.message.attrs.length > 0 ? r.message.attrs : false;
      } else {
        attrs = false;
      }
    }
  });
  return attrs
}


// API to get Attribute Name of wbs warehouse.
// @param ID, LEVEl.
// @return NAME.
function get_attribute_name(ID, lvl) {
	let flag;
	frappe.call({
		method: 'wbs.wbs.doctype.wbs_storage_location.wbs_storage_location.get_attribute_name',
		args: {
			'id': ID,
			'lv': lvl
		},
		async: false,
		callback: (r) => {
			if (r.message.name) {
				flag = r.message.name;
			} else {
				flag = false;
			}
		}
	});
	return flag
}
