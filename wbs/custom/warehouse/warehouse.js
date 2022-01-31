frappe.ui.form.on('Warehouse', {
  refresh: (frm) => {

    if (!frm.doc.__islocal) {
      frm.add_custom_button(__('Make WBS Warehouse & Specify WBS Settings'),() => {
        let local_docname = frappe.model.make_new_doc_and_get_name('WBS Settings');
        // let new_doc = frappe.new_doc('WBS Settings');
        frappe.set_route('Form/WBS Settings',local_docname, {'warehouse': frm.doc.name});
      });

    }
  }
})
