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
			frm.trigger('set_refer_by');

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
			frm.trigger('set_refer_by')

		} else {
			frm.set_df_property('attribute_level', 'options', []);
			frm.refresh_field('attribute_level');
		}

  },
	attribute_record_by_idname: (frm) => {
			frm.trigger('set_refer_by');
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
				let refer_by = get_refer_by(frm.doc.wbs_settings_id)

				if (refer_by) {
					frm.set_value('attribute_record_by_idname', refer_by.refer_by ? refer_by.refer_by : '');
					frm.refresh_field('attribute_record_by_idname');
				}
			}

			if (parseInt(frm.doc.attribute_level) > 1) {
				frm.set_value('parent_attribute', '');
				frm.refresh_field('parent_attribute');
				frm.trigger('set_name');
				frm.trigger('set_parent_lvl');
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
	},
	set_parent_lvl: (frm) => {

		// let lvl = frm.doc.attribute_level - 1;
		let parent_lvl = get_parent_lvl_by_id_name(frm.doc.wbs_settings_id, frm.doc.attribute_level);

		if (parent_lvl) {
			frm.set_value('parent_attribute', parent_lvl.parent ? parent_lvl.parent : '');
			frm.refresh_field('parent_attribute');
			frm.set_value('attribute_record_by_idname', parent_lvl.refer_by ? parent_lvl.refer_by : '');
			frm.refresh_field('attribute_record_by_idname');
		}
	},
	set_refer_by: (frm) => {

		if (frm.doc.attribute_record_by_idname === 'Name') {
			frm.set_df_property('attribute', 'hidden', false);
		} else {
			frm.set_df_property('attribute', 'hidden', true);
		}
	}
});

// API to fetch parent level.
// @param ID, LEVEL.
// @return PARENT, REFER BY.
function get_parent_lvl_by_id_name(ID, lvl) {
	let parent_lvl;
	frappe.call({
		method: 'wbs.wbs.doctype.wbs_storage_location.wbs_storage_location.get_parent_lvl_by_id_name',
		args: {
			'id': ID,
			'level': lvl
		},
		async: false,
		callback: (r) => {
			if (r.message) {
				parent_lvl = r.message;
			}
			if (r.message.EX) {
				frappe.throw(__(r.message.EX))
			}
		}
	});
	return parent_lvl
}

function get_refer_by(ID) {
	let refer;
	frappe.call({
		method: 'wbs.wbs.doctype.wbs_storage_location.wbs_storage_location.get_refer_by',
		args: {
			'id': ID
		},
		async: false,
		callback: (r) => {
			if (r.message) {
				refer = r.message;
			}
			if (r.message.EX) {
				frappe.throw(__(r.message.EX))
			}
		}
	});
	return refer
}

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
