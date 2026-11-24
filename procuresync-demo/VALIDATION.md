# Demo validation

Completed on 25 November 2026, Asia/Jakarta.

| Check | Result |
| --- | --- |
| Workflow, numeric calculations and presentation | 22 test groups passed |
| Entry session, role routing, reload, restart and unsaved-input preservation | 10 test groups passed |
| Bilingual menus, guides, units, messages and data preservation | 8 test groups passed |
| Source-derived sidebar destinations | All 31 menu destinations rendered in English and Indonesian |
| JavaScript syntax | All first-party scripts passed Node syntax checks |
| Relative local assets | All 11 entry-page references exist locally and use relative paths |
| Application API dependencies | Zero fetch, XMLHttpRequest or WebSocket calls in first-party demo scripts |
| Source repository comparison | Original working-copy status matched the pre-development snapshot |

The workflow tests exercise role rejection, cross-center requester restrictions, whole-unit/duplicate-line validation, draft creation/submission, immutable creator identity, fixed sourcing quantities, budget limits, vendor batch issuance, overreceipt rejection, dated Warehouse identity, FIFO, replacement capacity, invoice duplication, OCR review, exact matching, single-account payment, reversal history, proportional cost-center shares and residual cents, overnight overtime, locked units, escaped user text, and fresh seed restoration.

Session tests execute the actual browser-controller script in a controlled document/storage environment. They exercise the initial welcome, failed and successful password entry, each role, unauthorized hash routing, stored-session reload, mobile sidebar initial state, restart and logout.

## Verification limits

A browser helper timed out during page inspection. A separate installed-browser screenshot attempt produced no image within its timeout. Visual rendering, actual mouse/keyboard interaction, mobile viewport layout, and print-to-PDF output remain unverified in a real browser.

The responsive CSS, page markup and routing logic were checked in source and controlled execution. The tests use the frontend simulation and its fictional data. The original PHP application and database were inspected as references.

GitHub Pages publication is pending the owner’s terminal commit/push and the repository’s Pages setting. A workflow publishing only demo/ has been prepared. Static files were served successfully from `/procuresync-demo/` during validation, which exercises a repository-style subdirectory. Refresh-safe hash routing and bundled relative asset paths are included.


Language tests verify the default and persisted locale, language controls on every entry point, both-language guides for every role menu, Indonesian unit dropdowns and statuses, centralized validation, unsaved inputs across rerender, unchanged quantity/price/identifier fields, and exact preservation of business text that happens to match a translation key. The translation runtime protects data before translating static presentation fragments.
