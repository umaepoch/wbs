from __future__ import unicode_literals
from frappe import _

def get_data():
	return [
		{
			"label": _("WBS"),
			"items": [
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
				}
			]
		}
	]

