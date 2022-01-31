frappe.ui.form.on('Warehouse', {
  refresh: (frm) => {

    if (!frm.doc.__islocal) {
      frm.add_custom_button(__('Make WBS Warehouse & Specify WBS Settings'),() => {
        let local_docname = frappe.model.make_new_doc_and_get_name('WBS Settings');
        let url = get_url()
        console.log(get_url())
        // frappe.set_route('Form/WBS Settings',local_docname, {'warehouse': frm.doc.name});
      });

    }
  }
});

function get_url() {
  let url;
  frappe.call({
    method: 'wbs.wbs.doctype.wbs_settings.wbs_settings.get_doc_url',
    async: false,
    callback: (r) => {
      if (r.message.url) {
        url = r.message.url
      }
      if (r.message.EX) {
        frappe.throw(__(r.message.EX))
      }
    }
  });
  return url
}
