frappe.ui.form.on('Warehouse', {
  refresh: (frm) => {

    if (!frm.doc.__islocal) {
      frm.add_custom_button(__('Make WBS Warehouse & Specify WBS Settings'),() => {
        let new_doc = frappe.model.get_new_doc('WBS Settings');
        frappe.set_route('Form/WBS Settings/New WBS Settings', {'warehouse': frm.doc.name});
      });

    }
  }
})
