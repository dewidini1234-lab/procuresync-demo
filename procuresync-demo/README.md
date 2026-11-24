# ProcureSync Interactive Demo

A static, guided portfolio version of the existing ProcureSync procurement application. Explore six roles and follow shared sample records from requisition to settlement.

## Open the demo

Open `index.html` in a modern browser. The HTML, CSS, JavaScript, Bootstrap styles, and Chart.js assets are bundled locally. Internet access and installation are optional.

Enter the shared demo password `ExploreProcure!2026`. Production opens first. Use the numbered navigation to switch roles, the sidebar to change pages, and the page guide to understand the current responsibility.

English is the default language. Use the language selector on the introduction, login, or workspace to switch to Bahasa Indonesia. The choice is saved independently, and switching preserves unsaved form inputs.

The scenario is saved in localStorage. The entry session is stored in sessionStorage. If browser storage is blocked, the demo uses memory for the current page session. **Restart Demo** restores the sample records. The scenario clock is fixed at 10:30 WIB on the date it was started, so dated receiving assignments remain predictable.

## Try the connected workflow

1. Open the sample protective-gloves draft in **Production**. Choose Maya, then submit it.
2. Switch to **Purchasing**, open the submitted request, enter the fixed vendor price, and send the quote to Finance.
3. Switch to **Finance**, open Initial requisition approval, and approve the request within its monthly budget.
4. Return to **Purchasing**, select the whole approved request in the sourcing cart, and issue its purchase order.
5. Switch to **Warehouse**, open the order in Incoming delivery queue, select the receiving staff, and record the intact quantity with the fictional delivery note.
6. Switch to **Finance**, create an invoice against that PO and its receipt. Load the sample extraction transcript, review the billed values with a reason, and save the correction.
7. Approve the matched invoice, then confirm its exact full amount using a fictional proof identifier. The simulated confirmer is `finance_a`.

A separate sample paper invoice starts with a price discrepancy. Its approved PO price is IDR 58,000 per ream, while the original extraction contains IDR 64,000. Correct the reviewed price and preserve the original transcript.

A sample glove receipt contains two damaged boxes. Finance can choose return to vendor or debit note. Purchasing records the follow-up, and Warehouse can receive replacements against the parent receipt.

## Role coverage

| Role | Pages represented |
| --- | --- |
| Production | Dashboard, new requisition, drafts/history, staff contracts and dated schedules, activity |
| Division Manager | Scoped dashboard, division requisitions, profile/cost center, activity |
| Purchasing | Dashboard, sourcing queue, batch PO cart and issued orders, returns, vendor/price directory, activity |
| Finance | Dashboard, monthly budgets, initial PR decisions, OCR/HITL and matching, beneficiary verification, settlement/reversals/reports, activity |
| Warehouse | Dashboard, incoming orders, blind receiving, receipt/damage/replacement lineage, staff/schedules, activity |
| Super Admin | System overview, accounts and capabilities, cost centers, item/staff governance, global activity |

Production and Division Manager are alternative request origins. Purchasing returns for PO issuance after Finance approves the budget. Finance returns after Warehouse receiving to reconcile invoices and record payment. The manager role uses its own cost center. Initial budget approval belongs to Finance.

## Original implementation references

The source application was inspected directly on 25 November 2026. The current working copy, including its operator/shift refactor, supplied the reference behavior.

| Reference in the original repository | Demo use |
| --- | --- |
| `config/navigation.php`, `config/permissions.php` | Exported role menus and canonical capabilities in `assets/config.js` |
| `public/assets/app.css`, vendor Bootstrap/Chart.js files | Reused visual palette, base components, chart library and licenses |
| `RequisitionService`, `BudgetService` | PR states, sourcing, scoped requester views, cancellations and reservations |
| `PurchaseOrderService`, `ReceivingService`, `ReceiptLedger` | Whole-PR batching, vendor grouping, blind receiving, FIFO and replacement lineage |
| `KioskService`, `ShiftScheduleService`, `GovernanceService` | One operator choice, contract-based Production overtime, dated Warehouse shifts and master governance |
| `InvoiceService`, `LocalOcrService`, `ThreeWayMatchingService` | Preserved extraction evidence, human correction, matching and approval gates |
| `PaymentService`, `PaymentCostAllocator`, `FinanceReconciliation` | Single-account Finance, exact full transfer, proportional center shares, reversal and distinct logistics/payment status |

[Open the original ProcureSync repository](https://github.com/dewidini1234-lab/ProcureSync).

## Simulation boundaries

All people, suppliers, documents, payment identifiers, and amounts in this package are fictional. The demo uses an independent browser-local data model. It communicates with zero application endpoints.

Role navigation demonstrates role-appropriate pages and views. The published JavaScript and browser storage are inspectable. The source application performs real authentication, authorization, transaction locking, database constraints, private file handling, and append-only database enforcement.

The demo presents these bounded adaptations.

- The shared password is a public entry convenience.
- English and Bahasa Indonesia are available throughout the interface. Centralized translations affect labels, guides, statuses, validation and currency presentation. Unit identifiers, document references, names, notes and transaction values retain their original data.
- OCR is represented by an editable fictional extraction transcript and local SKU parser. Delivery-note and payment-proof identifiers stand in for uploaded files. Proof reuse is checked by the supplied demo identifier.
- Matching, monetary values, quantities, budget limits, FIFO, and state guards execute in JavaScript. Amounts use integer cents, quantities use integer thousandths, and proportional rounding assigns residual cents in ascending center order.
- A vendor batch supports one fixed price for each SKU. Differently priced requests for that SKU can be issued separately. The original PHP implementation supports more detailed grouping.
- Reports use browser printing and Save as PDF. The PHP application's XLSX/PDF exporters, full invoice allocation override tools, account recovery, division succession/mergers, and database concurrency enforcement remain features of the original application.
- The demo provides representative master-data and account interactions. Newly created fictional account records share the existing demo entry experience.

## Files

```text
index.html
.nojekyll
assets/
  config.js              Source-derived menus and capabilities
  locales.js             Central English/Indonesian presentation catalog
  i18n.js                Locale persistence and protected data rendering
  model.js               Sample records and guarded simulation transitions
  views.js               Introduction, role pages and contextual guides
  app.js                 Hash routing, session, storage and browser interaction
  demo.css               Demo layout, responsive behavior and landing page
  original.css           Copy of the source application's stylesheet
  favicon.svg
  vendor/                Local Bootstrap/Chart.js assets and licenses
tests/
  model.test.cjs          Workflow and presentation checks using Node built-ins
  session.test.cjs        Routing, login, reload, language and restart checks
  i18n.test.cjs           Bilingual pages, UOM and data preservation
VALIDATION.md
README.md
```

## Publish with GitHub Pages

This folder is self-contained. GitHub Pages needs `index.html`, `.nojekyll`, and `assets/` at the chosen publishing location. All asset URLs are relative. Navigation uses hashes such as `#/FINANCE/invoices`, so refreshing a workspace keeps the request on the static entry page.

For an existing repository, use its existing Pages publishing arrangement and copy these static files into that publishing directory, preserving unrelated files. GitHub's branch-based publishing supports the branch root or `/docs`. A GitHub Actions Pages deployment can publish another selected directory as its artifact. A folder named `demo` requires either that artifact configuration or placement within the selected publishing root. The original PHP/MySQL application remains the separate source project.

The prepared Pages bundle includes a workflow that tests and publishes only the demo directory on the existing main branch. Follow PUBLISH.md in that bundle for the terminal commands and one-time Pages setting.

[GitHub's publishing-source guide](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) explains the supported locations. [GitHub's site-creation guide](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site) describes the entry file and resulting site URL.

## Run the included checks

Node.js is used only for these development checks.

```powershell
node tests/model.test.cjs
node tests/session.test.cjs
node tests/i18n.test.cjs
```

See `VALIDATION.md` for the checks completed and the browser-verification limit.
