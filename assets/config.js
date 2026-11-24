window.DEMO_CONFIG = {
  "navigation": {
    "PRODUCTION": [
      [
        "Production dashboard",
        "/dashboard/PRODUCTION",
        "overview",
        "◈"
      ],
      [
        "Create production requisition",
        "/requisitions/new",
        "request",
        "+"
      ],
      [
        "Requisition history & drafts",
        "/requisitions",
        "pr",
        "▤"
      ],
      [
        "Manage shift staff",
        "/staff",
        "staff",
        "♙"
      ],
      [
        "Monthly activity history",
        "/history",
        "history",
        "◷"
      ]
    ],
    "DIVISION_MANAGER": [
      [
        "Division dashboard",
        "/dashboard/DIVISION_MANAGER",
        "overview",
        "◈"
      ],
      [
        "Create division requisition",
        "/requisitions/new",
        "request",
        "+"
      ],
      [
        "Requisition history & drafts",
        "/requisitions",
        "pr",
        "▤"
      ],
      [
        "Profile & cost center",
        "/profile",
        "profile",
        "♙"
      ],
      [
        "Monthly activity history",
        "/history",
        "history",
        "◷"
      ]
    ],
    "PURCHASING": [
      [
        "Purchasing dashboard",
        "/dashboard/PURCHASING",
        "overview",
        "◈"
      ],
      [
        "Requisition & sourcing queue",
        "/requisitions",
        "pr",
        "▤"
      ],
      [
        "Sourcing cart, orders & returns",
        "/orders",
        "po",
        "▦"
      ],
      [
        "Vendor & SKU directory",
        "/vendors",
        "vendor",
        "♙"
      ],
      [
        "Monthly activity history",
        "/history",
        "history",
        "◷"
      ]
    ],
    "WAREHOUSE": [
      [
        "Warehouse dashboard",
        "/dashboard/WAREHOUSE",
        "overview",
        "◈"
      ],
      [
        "Incoming delivery queue",
        "/warehouse/incoming",
        "po",
        "▣"
      ],
      [
        "Backorders, receipts & damage",
        "/receipts",
        "grn",
        "▤"
      ],
      [
        "Warehouse shift staff",
        "/staff",
        "staff",
        "♙"
      ],
      [
        "Warehouse activity history",
        "/history",
        "history",
        "◷"
      ]
    ],
    "FINANCE": [
      [
        "Finance dashboard",
        "/dashboard/FINANCE",
        "overview",
        "◈"
      ],
      [
        "Monthly budget control",
        "/budgets",
        "budget",
        "▦"
      ],
      [
        "Initial requisition approval",
        "/requisitions",
        "pr",
        "✓"
      ],
      [
        "3-way matching verification",
        "/invoices",
        "invoice",
        "⇄"
      ],
      [
        "Settlement & reports",
        "/finance/reports",
        "payment",
        "▤"
      ],
      [
        "Monthly activity history",
        "/history",
        "history",
        "◷"
      ]
    ],
    "SUPER_ADMIN": [
      [
        "System & security dashboard",
        "/dashboard/SUPER_ADMIN",
        "overview",
        "◈"
      ],
      [
        "User account management",
        "/admin/users",
        "user",
        "♙"
      ],
      [
        "Cost center management",
        "/admin/centers",
        "center",
        "▦"
      ],
      [
        "Master data governance",
        "/admin/masters",
        "master",
        "▤"
      ],
      [
        "Global audit trail",
        "/history",
        "history",
        "◷"
      ]
    ]
  },
  "permissions": {
    "SUPER_ADMIN": [
      "accounts.manage",
      "centers.manage",
      "masters.manage",
      "staff.manage",
      "dashboard.SUPER_ADMIN",
      "history.read",
      "security.read",
      "permissions.read",
      "accounts.reset"
    ],
    "PRODUCTION": [
      "catalog.read",
      "catalog.create",
      "pr.read",
      "pr.write",
      "staff.manage",
      "dashboard.PRODUCTION",
      "history.read",
      "kiosk.clear",
      "staff.read"
    ],
    "DIVISION_MANAGER": [
      "catalog.read",
      "catalog.create",
      "pr.read",
      "pr.write",
      "profile.write",
      "dashboard.DIVISION_MANAGER",
      "history.read"
    ],
    "PURCHASING": [
      "po.issue",
      "vendors.read",
      "vendors.manage",
      "receipts.read",
      "returns.manage",
      "pr.read",
      "pr.source",
      "pr.resolve",
      "dashboard.PURCHASING",
      "history.read",
      "files.delivery_note",
      "po.read",
      "financial.read"
    ],
    "WAREHOUSE": [
      "receipts.read",
      "receipts.post",
      "staff.manage",
      "dashboard.WAREHOUSE",
      "history.read",
      "kiosk.clear",
      "staff.read",
      "files.delivery_note",
      "po.read"
    ],
    "FINANCE": [
      "invoices.read",
      "invoices.manage",
      "invoices.approve",
      "invoices.pay",
      "finance.reports",
      "vendors.read",
      "vendors.verify",
      "receipts.read",
      "receipts.decide",
      "pr.read",
      "pr.resolve",
      "budgets.manage",
      "dashboard.FINANCE",
      "history.read",
      "files.delivery_note",
      "files.invoice",
      "files.payment",
      "po.read",
      "financial.read",
      "bank.read"
    ]
  }
};
