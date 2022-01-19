// Copyright (c) 2019, Epoch and contributors
// For license information, please see license.txt

let purpose;

frappe.ui.form.on("Stock Entry", {

  refresh:(frm, cdt, cdn) => {

    if (frm.doc.stock_entry_type) {

      if (frm.doc.stock_entry_type === "Material Transfer") {
        frm.fields_dict["items"].grid.set_column_disp(
          ["wbs_location_source_warehouse", "wbs_location_target_warehouse", "wbs_id_source_warehouse", "wbs_id_target_warehouse"],
          1);
      }

    }
  },
  stock_entry_type: (frm, cdt, cdn) => {

    if (frm.doc.stock_entry_type) {

      if (frm.doc.stock_entry_type === "Material Transfer") {
          frm.fields_dict["items"].grid.set_column_disp(
            ["wbs_location_source_warehouse", "wbs_location_target_warehouse", "wbs_id_source_warehouse", "wbs_id_target_warehouse"],
            1);
      } else {
        frm.fields_dict["items"].grid.set_column_disp(
          ["wbs_location_source_warehouse", "wbs_location_target_warehouse", "wbs_id_source_warehouse", "wbs_id_target_warehouse"],
          0);
      }

    }
  },
  validate: (frm) => {

    if (frm.doc.stock_entry_type) {

      if (frm.doc.stock_entry_type === "Material Transfer") {

        if (frm.doc.items) {

          frm.doc.items.forEach(detail => {
            let active = get_value(detail.s_warehouse);

            if (!active) {
              frappe.throw(__(`${detail.doctype} : ${detail.name} at row ${detail.idx} source warehouse ${detail.s_warehouse} is not an active WBS Warehouse`))
              frappe.validated = false;
            }
            let qty = check_available_qty(detail.s_warehouse, detail.qty)
          })
        }
      }
    }
  }
});

function check_available_qty(s_warehouse, qty) {
  let qty;
  // frappe.call({
  // });
}
// frappe.ui.form.on("Stock Entry Detail", {
//   s_warehouse: (frm) => {
//
//     if (frm.doc.s_warehouse) {
//       let active = get_value(detail.s_warehouse);
//
//       if (active) {
//         frm.fields_dict[doc.parentfield].grid.grid_rows_by_docname[cdn].grid_form.fields_dict['image_preview'].grid.set_column_disp(
//           ["wbs_location_source_warehouse", "wbs_location_target_warehouse", "wbs_id_source_warehouse", "wbs_id_target_warehouse"],
//           1);
//       }
//     }
//   }
// });

function get_value(s_warehouse) {
  let flag;
  frappe.call({
    method: 'frappe.client.get_value',
    args: {
      'doctype': 'WBS Warehouse',
      'filters': {'is_active': 1, 'warehouse': s_warehouse},
      'fieldname': 'is_active'
    },
    async: false,
    callback: function(r) {
      if (r.message.is_active) {
        flag = true
      } else {
        flag = false
      }
    }
  })
  return flag
}
