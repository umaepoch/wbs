frappe.ui.form.on('Warehouse', {
  refresh: (frm) => {

    if (!frm.doc.__islocal) {
      frm.add_custom_button(__('Make WBS Warehouse & Specify WBS Settings'),() => {
        let local_docname = frappe.model.make_new_doc_and_get_name('WBS Settings');
        // let url = get_url()
        // console.log(get_url())
        frappe.set_route('wbs-settings/new-wbs-settings',{'warehouse': frm.doc.name});
      });

    }
  }
});
