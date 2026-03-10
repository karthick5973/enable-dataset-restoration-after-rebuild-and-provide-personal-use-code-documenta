# Specification

## Summary
**Goal:** Ensure spare-parts data and maintenance password survive backend canister upgrades, add a client-side backup/restore path for dataset recovery, and document how to run/deploy and how persistence works for personal use.

**Planned changes:**
- Persist the uploaded spare-parts dataset, upload timestamp/retention metadata, and maintenance password across backend canister upgrades so state is not reset on rebuild/redeploy (within the existing 7-day retention behavior).
- Add a frontend backup/restore flow: automatically store the last successfully imported parsed dataset in browser storage, allow downloading it as a JSON backup, and allow restoring it to the backend after unlocking with the maintenance password (especially when the backend has zero parts but a local backup exists).
- Add in-repo English documentation for self-managed use: running locally, deploying with dfx, how data persistence and retention behave on upgrade, and how the backup/restore flow and Draft vs Live environments affect data availability.

**User-visible outcome:** After upgrading/redeploying the backend, previously imported spare parts and the maintenance password remain available (until retention expires); users can also download and restore a local JSON backup to recover data if the backend dataset is missing, and can follow English in-repo instructions to run and deploy the app themselves.
