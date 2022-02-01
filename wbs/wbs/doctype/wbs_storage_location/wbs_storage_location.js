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

				frm.set_df_property('parent_attribute', 'read_only', frm.doc.parent_attribute ? 1 : 0);
				frm.refresh_field('parent_attribute')

				frm.set_df_property('attribute_id', 'read_only', frm.doc.attribute_id ? 1 : 0);
				frm.refresh_field('attribute_id')

				frm.set_df_property('attribute', 'read_only', frm.doc.attribute ? 1 : 0);
				frm.refresh_field('attribute')

			} else {
				frm.set_value('attribute_level', []);
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

		if (frm.doc.wbs_settings_id) {
			frm.trigger('clear_form')
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
			frm.set_value('attribute_level', []);
			frm.refresh_field('attribute_level');
		}

  },
	clear_form: (frm) => {
		frm.set_value('attribute_level', []);
		frm.refresh_field('attribute_level');

		if (frm.doc.attribute_name) {
			frm.set_value('attribute_name', '');
			frm.refresh_field('attribute_name');
		}

		if (frm.doc.parent_attribute) {
			frm.set_value('parent_attribute', []);
			frm.set_df_property('parent_attribute', 'read_only', 1);
			frm.refresh_field('parent_attribute');
		} else {
			frm.set_df_property('parent_attribute', 'read_only', 1);
			frm.refresh_field('parent_attribute');
		}

		if (frm.doc.attribute_record_by_idname) {
			frm.set_value('attribute_record_by_idname', '');
			frm.refresh_field('attribute_record_by_idname');

			if (frm.doc.attribute) {
				frm.set_value('attribute', '');
				frm.refresh_field('attribute');
				frm.trigger('set_refer_by');
			}

			if (frm.doc.attribute_id) {
				frm.set_value('attribute_id', '');
				frm.refresh_field('attribute_id');
			}
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
				frm.set_df_property('parent_attribute', 'options', [`Level ${frm.doc.attribute_level} Attribute`]);
				frm.set_df_property('parent_attribute', 'read_only', 0);

				frm.refresh_field('parent_attribute');
				frm.trigger('set_name');
			}

			if (parseInt(frm.doc.attribute_level) > 1) {
				frm.trigger('set_name');

				let level = frm.doc.attribute_level - 1
				let parent = get_parents(frm.doc.wbs_settings_id, level)

				if (parent) {
					let pr_id = [];

					parent.forEach(p => {

						if (p.attribute) {
							pr_id.push(p.attribute_id+" - "+p.attribute)
						} else {
							pr_id.push(p.attribute_id);
						}
					});

					frm.set_df_property('parent_attribute', 'options', pr_id.length > 0 ? pr_id : [] );
					frm.set_df_property('parent_attribute', 'read_only', 0);
					frm.refresh_field('parent_attribute');
				}
			}

		} else {
			frm.set_value('parent_attribute', []);
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
	set_refer_by: (frm) => {

		if (frm.doc.attribute_record_by_idname === 'Name') {
			frm.set_df_property('attribute', 'hidden', false);
		} else {
			frm.set_df_property('attribute', 'hidden', true);
		}
	},
	parent_attribute: (frm) => {

		if (frm.doc.parent_attribute) {

			if (parseInt(frm.doc.attribute_level) === 1) {
				let refer_by = get_refer_by(frm.doc.wbs_settings_id)

				if (refer_by) {
					frm.set_value('attribute_record_by_idname', refer_by.refer_by ? refer_by.refer_by : '');
					frm.refresh_field('attribute_record_by_idname');

					let count = generate_idlv1(frm.doc.parent_attribute, frm.doc.wbs_settings_id);

					if (count) {
						let id = count[count.length - 1].id_count + 1

						frm.set_value('attribute_id', id ? id : '');
						frm.refresh_field('attribute_id');
					}
				}
			} else if (parseInt(frm.doc.attribute_level) > 1) {
				let refer_by = get_refer_by2(frm.doc.wbs_settings_id, frm.doc.attribute_level);

				if (refer_by) {
					frm.set_value('attribute_record_by_idname', refer_by.refer_by ? refer_by.refer_by : '');
					frm.refresh_field('attribute_record_by_idname');

					let id = generate_ids(frm.doc.wbs_settings_id, frm.doc.parent_attribute)

					if (id) {
						frm.set_value('attribute_id', id ? id : '');
						frm.refresh_field('attribute_id');
					}
				}
			}
		}
	},
	before_save: (frm) => {

		if (parseInt(frm.doc.attribute_level) === 1) {

			if (frm.doc.attribute_record_by_idname === 'Name') {
				frm.set_value('name_of_attribute_id', frm.doc.attribute ? frm.doc.attribute : '');
				frm.refresh_field('name_of_attribute_id');
			} else if (frm.doc.attribute_record_by_idname === 'ID') {
				frm.set_value('name_of_attribute_id', frm.doc.attribute_id ? frm.doc.attribute_id : '');
				frm.refresh_field('name_of_attribute_id');
			}
		}

		if (parseInt(frm.doc.attribute_level)  > 1) {
			let name = frm.doc.attribute ? frm.doc.attribute : '';
			let level = frm.doc.attribute_level - 1;
			let attribute_idname;
			let parent_recordby = get_refer_by2(frm.doc.wbs_settings_id, level);
			let name_of_attr_id;

			if (parent_recordby.refer_by === 'Name') {
				attribute_idname = frm.doc.parent_attribute.split('-')[frm.doc.parent_attribute.split('-').length - 1].trim();
				name_of_attr_id = generate_records_of_name(frm.doc.wbs_settings_id, level, attribute_idname);

			} else if (parent_recordby.refer_by === 'ID') {
				attribute_idname = frm.doc.parent_attribute
				name_of_attr_id = generate_records_of_id(frm.doc.wbs_settings_id, level, attribute_idname)
			}

			if (name_of_attr_id) {

				if (frm.doc.attribute_record_by_idname === 'Name' && name) {
					frm.set_value('name_of_attribute_id', name_of_attr_id+'-'+name);
					frm.refresh_field('name_of_attribute_id');
				} else if (frm.doc.attribute_record_by_idname === 'ID' && level >= 0) {
					frm.set_value('name_of_attribute_id',name_of_attr_id+'-'+frm.doc.attribute_id.split('-')[level]);
					frm.refresh_field('name_of_attribute_id');
				}
			}
		}
	},
	after_save: (frm) => {

		if (!frm.doc.__islocal && frm.doc.name) {

			if (frm.doc.wbs_settings_id) {

				frm.set_df_property('parent_attribute', 'read_only', frm.doc.parent_attribute ? 1 : 0);
				frm.refresh_field('parent_attribute')

				frm.set_df_property('attribute_id', 'read_only', frm.doc.attribute_id ? 1 : 0);
				frm.refresh_field('attribute_id')

				frm.set_df_property('attribute', 'read_only', frm.doc.attribute ? 1 : 0);
				frm.refresh_field('attribute')
			}
		}
	}
});

function generate_records_of_id(ID, lvl, atr_id) {
	let rec_id;
	frappe.call({
		method: 'wbs.wbs.doctype.wbs_storage_location.wbs_storage_location.generate_records_of_id',
		args: {
			'id': ID,
			'lvl': lvl,
			'atr_id': atr_id
		},
		async: false,
		callback: (r) => {
			if (r.message) {
				rec_id = r.message.ID ? r.message.ID : '';
			}

			if (r.message.EX) {
				frappe.throw(__(r.message.EX))
			}
		}
	});
	return rec_id
}

function generate_records_of_name(ID, lvl, atr_name) {
	let rec_name;
	frappe.call({
		method: 'wbs.wbs.doctype.wbs_storage_location.wbs_storage_location.generate_records_of_name',
		args: {
			'id': ID,
			'lvl': lvl,
			'atr_name': atr_name
		},
		async: false,
		callback: (r) => {
			if (r.message) {
				rec_name = r.message.Name ? r.message.Name : '';
			}

			if (r.message.EX) {
				frappe.throw(_(r.message.EX))
			}
		}
	});
	return rec_name
}

// API to generate ID for level 1 attribute.
// @param ID, PARENT ATTRIBUTE.
// @return ID.
function generate_ids(ID, parent_attribute) {
	let id;
	frappe.call({
		method: 'wbs.wbs.doctype.wbs_storage_location.wbs_storage_location.generate_ids',
		args: {
			'id': ID,
			'parent_attribute': parent_attribute
		},
		async: false,
		callback: (r) => {
			if (r.message.id) {
				id = r.message.id;
			} else if (r.message.EX) {
				frappe.throw(__(r.message.EX))
			} else {
				id = false;
			}
		}
	});
	return id
}

function get_refer_by2(ID, level) {
	let refer;
	frappe.call({
		method: 'wbs.wbs.doctype.wbs_storage_location.wbs_storage_location.get_refer_by2',
		args: {
			'id': ID,
			'lvl': level
		},
		async: false,
		callback: (r) => {

			if (r.message.refer_by) {
				refer = r.message;
			}

			if (r.message.EX) {
				frappe.throw(__(r.message.EX));
			}
		}
	});
	return refer
}


function get_parents(ID, level) {
	let list;
	frappe.call({
		method: 'wbs.wbs.doctype.wbs_storage_location.wbs_storage_location.get_parents',
		args: {
			'id': ID,
			'lvl': level
		},
		async: false,
		callback: (r) => {
			if (r.message.parent_list) {
				list = r.message.parent_list.length > 0 ? r.message.parent_list : false;
			} else if (r.message.EX) {
				frappe.throw(__(r.message.EX))
			} else {
				list = false;
			}
		}
	});
	return list;
}

function generate_idlv1(parent_attribute, ID) {
	let list;
	frappe.call({
		method: 'wbs.wbs.doctype.wbs_storage_location.wbs_storage_location.generate_idlv1',
		args: {
			'id': ID,
			'parent_attribute': parent_attribute
		},
		async: false,
		callback: (r) => {
			if (r.message.parent_list) {
				list = r.message.parent_list.length > 0 ? r.message.parent_list : false;
			} else if (r.message.EX) {
				frappe.throw(__(r.message.EX))
			} else {
				list = false;
			}
		}
	});

	return list
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
