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
