// Copyright (c) 2022, yashwanth and contributors
// For license information, please see license.txt

frappe.ui.form.on('WBS Settings', {
	start_date: function(frm) {
    let present_date = new Date();

    if (frm.doc.start_date) {
      let selected_date = new Date(frm.doc.start_date);

      if ((present_date.getFullYear() - selected_date.getFullYear()) === 0) {

        if (((present_date.getMonth()+1) - (selected_date.getMonth()+1)) === 0)  {

          if ((present_date.getDate() - selected_date.getDate()) > 0) {
            frappe.throw(__('Please select a future date.'))
          } else if ((present_date.getDate() - selected_date.getDate()) === 0) {
            frappe.throw(__('Please select a future date.'))
          }

        } else if (((present_date.getMonth()+1) - (selected_date.getMonth()+1)) < 0) {
          return;
        } else if (((present_date.getMonth()+1) - (selected_date.getMonth()+1)) > 0) {
          frappe.throw(__('Please select a futue date.'))
        }

      } else if ((present_date.getFullYear() - selected_date.getFullYear()) < 0) {
        return;
      } else if ((present_date.getFullYear() - selected_date.getFullYear()) > 0) {
        frappe.throw(__('Please select a futue date.'))
      }
    }
	},
  refresh: (frm) => {
    if (!frm.doc.__islocal) {

      if (frm.doc.start_date) {
        frm.set_df_property('start_date', 'read_only', 1);
      }
    }
  }
});


frappe.ui.form.on('WBS Attributes', {
	wbs_attributes_add: (frm, cdt, cdn) => {
		let doc  = locals[cdt][cdn]

		if (doc.idx) {
			doc.attribute_level = doc.idx
			frm.refresh_field('wbs_attributes')
		}
	},
	attribute_name: (frm, cdt, cdn) => {
		let doc = locals[cdt][cdn]
		let prev = frm.doc.wbs_attributes

		if (doc.idx > 1) {
			for (let i = 0; i < prev.length; i++) {
				for (let j = i+1; j < prev.length; j++) {
						if (prev[i].attribute_name === prev[j].attribute_name) {
							frappe.throw(__(`Attribute Name already selected at row : ${prev[i].idx}`))
						}
				}
			}
		}
	}
})