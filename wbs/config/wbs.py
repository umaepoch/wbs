from __future__ import unicode_literals
from frappe import _

def get_data():
	return [
		{
			"label": _("WBS"),
			"items": [
				{
					"type": "doctype",
					"name": "Warehouse",
					"onboard": 1,
					"label": _("Warehouse")
				},
				{
					"type": "doctype",
					"name": "WBS ID",
					"onboard": 1,
					"label": _("WBS ID")
				},
				{
					"type": "doctype",
					"name": "WBS Warehouse",
					"onboard": 1,
					"label": _("WBS Warehouse")
				},
				{
					"type": "doctype",
					"name": "WBS Settings",
					"onboard": 1,
					"label": _("WBS Settings")
				},
				{
					"type": "doctype",
					"name": "WBS Storage Location",
					"onboard": 1,
					"label": _("WBS Storage Location")
				},
				{
					"type": "doctype",
					"name": "Attribute Name",
					"onboard": 1,
					"label": _("Attribute Name")
				}

			]
		},
		{
            "label": "WBS Reports",
            "icon": "fa fa-cog",
            "items": [
                {
                    "type": "report",
					"is_query_report": True,
					"name": "WBS Stock Ledger Report",
					"doctype": "Stock Ledger Entry",
					"onboard": 1
                },
                {
                    "type": "report",
					"is_query_report": True,
					"name": "WBS Stock Balance Report",
					"doctype": "Stock Ledger Entry",
					"onboard": 1
                },
				{
					"type": "report",
					"is_query_report": True,
					"name": "WBS Batch Wise Balance History",
					"doctype": "Stock Ledger Entry",
					"onboard": 1
				}
            ]
        }
	]
