# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from frappe import _

def get_data():
	return [
		{
			"module_name": "Wbs",
			"category": "Modules",
			"label": _("Warehouse Bin System"),
			"color": "grey",
			"icon": "octicon octicon-file-directory",
			"type": "module"
		}
	]
