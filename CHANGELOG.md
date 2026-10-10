# Changelog

All notable changes to **3D Printing Hub** are recorded here, grouped by the date the work
landed. Every bullet keeps its commit subject and short SHA, so any line can be traced back
to the commit that produced it.

## 2026-10-10
- feat: color filament weight adjuster buttons (96a93d6)
- feat: show swatch color brand material in print job filament column (da8e7cd)
- Feat: add filament summary panel with totals, avg price, brand and weight extremes (263c014)

## 2026-10-09
- feat: reorder navbar with centered links and right-aligned actions (695c6ba)
- feat: add color swatch dropdown to filament form (2e9f8a1)
- feat: show filament color swatch and material type in stock table (2075c0a)
- fix: align page container padding across feature pages (a019368)

## 2026-10-06
- Add animated navbar theme toggle (5d3441a)
- Format stock prices to two decimals (c3a47dd)
- docs: add low-stock alerts specification (3892188)
- feat: add per-product low-stock alerts (2ac5916)

## 2026-10-05
- docs: update phase 12a (bce6d0d)
- docs: add sales backend spec (0d985cc)
- Add sales backend (270c51c)
- Add phase 12b sales frontend spec (68da97e)
- feat: add sales money owed frontend (9377892)
- docs: specify print job registry phase (0a52c2e)
- feat: complete print job registry (21874a7)
- feat: add persisted dark/light theme toggle (5ce143d)
- feat: include filament details in print job selector (9e80ecd)
- Improve print job form and service (c4e0473)
- test: cover print job form open and cancel (b71e273)

## 2026-10-04
- docs: specify clients frontend phase (b9dfff6)
- Add clients frontend phase 11b (e0ca042)
- docs: specify client archiving phase (60601b1)
- feat: archive clients without deleting data (ffabafa)

## 2026-10-01
- Add client backend CRUD and validation (4ab4dc9)

## 2026-09-30
- docs: specify clients backend phase (98eb61d)

## 2026-09-28
- Phase 9: Complete global table component - shared table implementation with sorting and filtering (18b2993)
- feat(specs): add phase 10 filament weight adjuster specifications (bdec72d)
- feat: add filament weight adjuster (0c84177)

## 2026-09-21
- Add Phase 9 global table component spec (dde137d)

## 2026-09-20
- docs: add phase 6 sign-out styling spec (369eee1)
- feat(nav-bar): apply shared nav-link convention to sign-out control (2317fbd)
- merge: phase-6 sign-out button styling (cd4f25f)
- docs: specify Phase 7 frontend architecture consolidation (49e85ea)
- feat: consolidate frontend architecture (b252743)
- merge: phase 7 frontend architecture consolidation (2819d1c)
- docs: check phase 7 completed (d95e579)
- cos: syntax error on prompting (ca8d4db)
- docs: specs for phase 8 (0932f9a)
- feat: add global timestamp formatter (2109cbb)
- docs: broaden phase 9 shared table scope (1013ae7)

## 2026-09-19
- docs: spec for nginx docker error created (71ed63e)
- fix: stabilize docker startup and health checks (a0cc761)
- merge: dev into main (b1cf31f)
- merge: phase-5 docker startup reliability (9d06a5a)
- docs: pahase 5 completed (dd2b922)

## 2026-09-18
- Add CI validation gates and document results (ff9163b)
- Align Angular versions for npm ci (f51e81f)
- Sync frontend lockfile with Angular versions (ec5c8c4)
- Document CI gates and coverage policy (1cd6bb3)
- docs: update roadmap to add an error fix (5678be1)

## 2026-09-17
- docs: add checkbox to roadmap.md (e2d7760)
- docs: specify Phase 4 CI gates (e229be6)

## 2026-09-16
- add login (41b8345)
- add a ps1 script to run both projects the same time (a458b89)
- Create the consitution of the project (802c887)
- docs: spec phase 0 remainder and phase 1 dev scripts (a89a75a)
- chore: env template and gitignore hygiene (1ba4c04)
- fix: developer scripts on SQLite and the real ports (25abb1d)
- chore: remove dead solution project references (ce25010)
- docs: close phase 0 and 1 gaps in the register (79a167b)
- docs: record the pre-existing client spec failure (70a78ec)
- docs: record the validation evidence and fix the V6 command (a60d5ad)
- docs: declare the no-automatic-commits working agreement (fa20080)
- feat: add liveness health endpoint (0f033d2)
- feat: proxy identity routes and gate compose on health (f229616)
- feat: add first-run registration page (bb06b15)
- docs: document the five-minute Docker quickstart (df125a1)
- docs: close phase 2 traceability gaps (698dd31)
- docs: add five-minute quickstart phase plan (6456917)
- docs: record phase 2 implementation commits (f02357c)
- merge: phase 2 five-minute quickstart (34dcffb)
- docs: define mandatory testing policy (e2cd822)
- merge: testing policy constitution (a48fbfb)
- docs: add phase 3 backend test foundation spec (97ad6ee)
- Add backend test foundation and frontend validation baseline (d27bdb0)

## 2026-09-06
- fix: indices en tablas que no tenian (d847611)

## 2026-09-05
- feat: add endpoitn to set a product stock to a specific qty (083dcf4)
- fix: add authorization and authentication to the endpoints (0654190)
- feat: se añadio manejo global de errores (4f716bb)
- feat: atomicidad en product stock (89aff2d)

## 2026-08-24
- redo: change postgres to sql lite (77d4cac)
- fix: migrate from postgres to sqllite (ecf12d8)

## 2026-08-15
- feat: simple dashboards added (205283f)
- fix: refactorizacion del front (ae9b0df)
- feat: enhance color and material type management with edit and delete functionality (59bbcef)

## 2026-08-14
- feat: update models prices automatically when new filament added or setting change (0bd307e)
- feat: add sorting to model and filament table (0dc27f8)
- feat: add filter to filament and model table (786a1cd)
- feat: add stock button and table and add recommended sale price value (faae155)
- feat: edit filament profile (682ad58)

## 2026-08-12
- fix; show error detail (9ff5ad8)
- fix: show validation error modal create (238a462)

## 2026-08-11
- feat: update and delete a model (b81d9ff)
- feat: add stocked page with route and navigation link (b3bbfda)
- feat: add product stock service, DTOs and CRUD controller (a89bc7a)

## 2026-08-10
- feat: implement application settings management functionality (0b4a607)
- feat(model-prints): add API endpoints, DTOs and management UI (5899021)

## 2026-08-09
- feat: filament endpoint add substract grams (d81fec0)
- feat: update grams button (3a34fe5)
- fix: filament add modal autoamtic pop out (1acb23d)
- feat: modelcategory controller (7e94848)
- feat: create model page (2ffc238)
- enh: DRY applied to styles (bed4114)

## 2026-08-08
- feat: filament profile button and api (b9b6605)
- fix: Unique profile per material and brand (bcb3195)
- feat: get all filament api (d112074)
- feat: filament table and add option (f18b0e1)
- feat: wrapped filametn form inside a modal (d420fbe)
- feat: delete filament api (6c6b23f)
- feat: api update filament (ede0ae9)
- feat: update and delete filament options (20cc369)
- feat: get entities in alphabetical order (ac9001f)
- fix: refactor frontend components (343e8bf)

## 2026-08-07
- feat: add brand and material type buttons (4e092df)
- fix: network for docker (5bb334b)
- fix: docker network (cc71f0c)

## 2026-08-06
- Feat: Add filament page on the web app (216c703)

## 2026-08-05
- feat: get filamet colors list (3fa0274)
- feat: api for controlling the brand entity (b26f49e)
- feat: add MaterialType Api and add fluent validation controllers (6196169)
- Feat: Add marketplace apis (36bacf2)
- Feat: add marketplace apis (ab5daa0)

## 2026-08-04
- Feat: agregar entities faltantes (2cff872)
- feat: add create color api (6d4cbe2)

## 2026-08-02
- fix: loaf front end (793131f)
- Separete front and back (bf65cf8)
- fix: corregir sintaxis de volumes en docker-compose (5be6da7)
- feat: arquitectura limpia de 3 contenedores sin archivos pesados (5846e8a)
- new angular project (c814622)

## 2026-08-01
- feat: Create front project and make first API (b355e96)
- Fix para pipeline (97653d5)
- fix de dockerfile (637079b)
- fix: corregir publicacion portable para incluir archivos de Blazor (a694ac2)

## 2026-07-29
- feat: inicializar solución .NET 10 3DPrintingHub con Clean Architecture (2f80bf7)
- chore: update Dockerfile base images to .NET 10 preview (9806e24)
- fix: update Dockerfile to use .slnx extension for .NET 10 (ca1edc4)
- crear entities, migracion de ef y modificar el pipeline para desplegar postgres (00bff00)
- fix: configurar tailscale con oauth secrets (c96dec3)
- fix: configurar tailscale con oauth secrets (93f7554)
- fix: corregir nombre de la imagen en docker-compose (605a288)

## 2026-07-28
- feat; agregar Dockerfile y workflow de despliegue automatico (8b9bfa0)
