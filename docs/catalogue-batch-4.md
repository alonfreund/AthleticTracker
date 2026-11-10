# Batch 4: machine, cable and Smith coverage (0.13.0)

**80 additions; 332 built-in exercises in total.** Only Batch 4 is implemented. Batch 5 has not started. No dependencies, database migrations, backup-format changes or new fitness features were added.

## Composition

| Reservations | Editorial group | Additions |
| --- | --- | ---: |
| 1–28 | Lower-body machine/cable isolation, calves and tibialis | 28 |
| 29–40 | Smith-machine coverage | 12 |
| 41–56 | Upper-body machine and row gaps | 16 |
| 57–72 | Cable flyes, raises, arm work and rotations | 16 |
| 73–80 | Cable/machine trunk and anti-rotation work | 8 |

The approved sequence is recorded in `catalogue-batch-2.md`. Batches are cross-cutting: this batch fills relevant cable/machine calf, hip and core gaps while later specialist batches still need to review prior content. No rows from future batches are included.

Candidates were checked against all 252 prior names, aliases, families, equipment and variation signatures. Differences reflect useful changes in setup, support, execution or tracking, not cosmetic Cartesian-product combinations. Examples include seated versus prone leg curls, independent-arm versus bilateral plate-loaded presses, cable-press repetitions versus an anti-rotation hold, and selectorized versus plate-loaded resistance. The old generic entries remain unchanged.

## Identity, taxonomy and preservation

New UUIDs use explicit permanent reservations in namespace `ba51c400-0000-4000-8000-`, recorded in `tests/fixtures/batch-four-ids.json`. Numbers are not runtime array indexes and must never be renumbered or recycled. New entries reuse existing families where appropriate; additions cover knee/hip isolation, calves, tibialis, upright rows, scaption and trunk work. Specific equipment IDs distinguish actual machine setups, ankle cuffs, a calf block and a wide neutral row handle.

The factory adds only a Batch 4 namespace wrapper. The complete 252-entry 0.12.0 baseline is frozen in `tests/fixtures/catalogue-0.12.0.json` and compared exactly with the new manifest. No old definition, ID, instruction, tracking convention or snapshot was revised.

The existing transactional catalogue installer is unchanged. It never deletes omitted exercises, rewrites custom definitions or personal preferences, or refreshes completed/unfinished workout snapshots. A custom definition colliding with a newly reserved ID is preserved too. Schema 5, export format 4, import formats 1–4 and the shared 100 MiB cap remain unchanged. All content ships in the offline app cache; no external media or service is required.

## Loading and repetition conventions

- Selectorized machines and cables use the displayed stack setting. Two equal independent cable stacks record one stack, not their sum.
- Plate-loaded machines record all plates on working levers, excluding the empty lever or sled. A single-arm independent-lever exercise records only plates on that working arm. The single-leg sled calf raise records the entire working sled's added plates, not half.
- Smith entries record added plates only, excluding carriage resistance. Notes specify stops and consistent machine/setup choice.
- A seated dip press uses external resistance; it is not an assisted suspended dip. Higher load means more resistance rather than more help.
- Unilateral entries count reps per side or cable direction. Machine torso rotations count one direction at a time. Bilateral entries count a complete movement once.
- Cable Pallof press records press-and-return reps; Cable Pallof hold records seconds per direction and has no repetition convention. It uses existing duration fields and logging controls.
- Machine leverage and cable ratios vary. These are consistent recording conventions, not estimates of equal effective resistance between models.

Instructions and notes are original. Reference checks used [ACE's exercise library](https://www.acefitness.org/resources/everyone/exercise-library/) for general terminology and [Life Fitness's kneeling leg curl](https://www.lifefitness.com/en-eu/catalog/strength-training/plate-loaded/life-fitness-kneeling-leg-curl) and [official equipment catalogue](https://www.lifefitness.com.au/wp-content/uploads/2025/04/LF-HS_ProductCatalogue_2025_low-res.pdf) to confirm representative equipment/loading distinctions. This is editorial review, not external coaching certification. No proprietary app catalogue, instructions or media were imported.

## Verification

Regression tests cover permanent IDs and all metadata, normalized names/aliases and variation duplicates across 332 definitions, exact preservation of the released 252, grouped muscle/equipment filters and load conventions. An actual populated upgrade adds exactly 80 records while preserving custom-name collisions, existing local/archived definitions, preferences, sessions, snapshots, sets, drafts, timers and other backup tables. Mid-batch failure rolls the whole transaction back; concurrent/repeated installation is idempotent.

Every addition is completed through the workout repository, finished into history and round-tripped through backup/restore. Representative stack, unilateral, plates, Smith and cable-duration examples also test raw draft recovery through reopened connections. Staged export/restore, old-backup reinstallation and the complete legacy/large-backup suite remain covered.

All **222 automated tests** and the production build passed. A 390 × 844 browser check confirmed 332 entries, alias search and duration/load details. With the preview server stopped, the cached app reopened, retained a completed machine set, recovered a raw partial duration draft, saved a cable hold and finished both into history. This is browser verification, not a physical iPhone test.

After publication, physical iPhone acceptance should confirm version 0.13.0, 332 built-in entries, the new machine/cable searches and details, reps and duration logging offline, recovery and history, current-backup export/restore, and unchanged older workouts/custom exercises/rest preferences. Do not clear website data or uninstall the app to update it.

## Permanent inventory

All IDs begin `ba51c400-0000-4000-8000-`; suffixes below are permanent.

| Suffix | Name | Primary muscles | Load / measurement / convention |
| --- | --- | --- | --- |
| 000000000001 | Leg extension machine | quadriceps | stack / reps / total |
| 000000000002 | Single-leg extension machine | quadriceps | stack / reps / per-side |
| 000000000003 | Seated leg curl machine | hamstrings | stack / reps / total |
| 000000000004 | Single-leg seated leg curl | hamstrings | stack / reps / per-side |
| 000000000005 | Lying leg curl machine | hamstrings | stack / reps / total |
| 000000000006 | Single-leg lying leg curl | hamstrings | stack / reps / per-side |
| 000000000007 | Standing leg curl machine | hamstrings | stack / reps / per-side |
| 000000000008 | Plate-loaded lying leg curl | hamstrings | plates / reps / total |
| 000000000009 | Plate-loaded kneeling leg curl | hamstrings | plates / reps / per-side |
| 000000000010 | Standing cable leg curl | hamstrings | stack / reps / per-side |
| 000000000011 | Lying cable leg curl | hamstrings | stack / reps / per-side |
| 000000000012 | Seated cable leg extension | quadriceps | stack / reps / per-side |
| 000000000013 | Standing cable hip extension | glutes | stack / reps / per-side |
| 000000000014 | Bench-supported cable glute kickback | glutes | stack / reps / per-side |
| 000000000015 | Glute kickback machine | glutes | stack / reps / per-side |
| 000000000016 | Hip abduction machine | abductors | stack / reps / total |
| 000000000017 | Hip adduction machine | adductors | stack / reps / total |
| 000000000018 | Standing cable hip abduction | abductors | stack / reps / per-side |
| 000000000019 | Standing cable hip adduction | adductors | stack / reps / per-side |
| 000000000020 | Seated calf raise machine | calves | plates / reps / total |
| 000000000021 | Standing calf raise machine | calves | stack / reps / total |
| 000000000022 | Donkey calf raise machine | calves | plates / reps / total |
| 000000000023 | 45-degree leg press calf raise | calves | plates / reps / total |
| 000000000024 | Single-leg 45-degree leg press calf raise | calves | plates / reps / per-side |
| 000000000025 | Smith machine standing calf raise | calves | smith / reps / total |
| 000000000026 | Smith machine seated calf raise | calves | smith / reps / total |
| 000000000027 | Standing cable calf raise | calves | stack / reps / total |
| 000000000028 | Tibialis raise machine | tibialis-anterior | plates / reps / total |
| 000000000029 | Decline Smith machine bench press | chest | smith / reps / total |
| 000000000030 | Close-grip Smith machine bench press | triceps | smith / reps / total |
| 000000000031 | Smith machine floor press | chest | smith / reps / total |
| 000000000032 | Standing Smith machine overhead press | anterior-deltoid, lateral-deltoid | smith / reps / total |
| 000000000033 | Smith machine shrug | traps | smith / reps / total |
| 000000000034 | Behind-the-back Smith machine shrug | traps | smith / reps / total |
| 000000000035 | Smith machine deadlift | glutes, hamstrings, quadriceps | smith / reps / total |
| 000000000036 | Smith machine good morning | hamstrings, glutes | smith / reps / total |
| 000000000037 | Smith machine reverse lunge | quadriceps, glutes | smith / reps / per-side |
| 000000000038 | Heels-elevated Smith machine squat | quadriceps, glutes | smith / reps / total |
| 000000000039 | Single-leg Smith machine Romanian deadlift | hamstrings, glutes | smith / reps / per-side |
| 000000000040 | Single-leg Smith machine calf raise | calves | smith / reps / per-side |
| 000000000041 | Incline chest press machine | chest | stack / reps / total |
| 000000000042 | Decline chest press machine | chest | stack / reps / total |
| 000000000043 | Plate-loaded shoulder press machine | anterior-deltoid, lateral-deltoid | plates / reps / total |
| 000000000044 | Single-arm plate-loaded shoulder press | anterior-deltoid, lateral-deltoid | plates / reps / per-side |
| 000000000045 | Single-arm plate-loaded chest press | chest | plates / reps / per-side |
| 000000000046 | Single-arm plate-loaded incline chest press | chest | plates / reps / per-side |
| 000000000047 | Plate-loaded high row machine | lats, rhomboids | plates / reps / total |
| 000000000048 | Single-arm plate-loaded high row | lats, rhomboids | plates / reps / per-side |
| 000000000049 | Wide neutral-grip seated cable row | rhomboids, traps | stack / reps / total |
| 000000000050 | Wide-grip chest-supported row machine | rhomboids, posterior-deltoid | stack / reps / total |
| 000000000051 | Pullover machine | lats | stack / reps / total |
| 000000000052 | Plate-loaded seated dip press | triceps | plates / reps / total |
| 000000000053 | Seated dip press machine | triceps | stack / reps / total |
| 000000000054 | Plate-loaded preacher curl machine | biceps | plates / reps / total |
| 000000000055 | Underhand plate-loaded lat pulldown | lats, biceps | plates / reps / total |
| 000000000056 | Single-arm plate-loaded lat pulldown | lats | plates / reps / per-side |
| 000000000057 | Single-arm standing cable chest fly | chest | stack / reps / per-side |
| 000000000058 | Flat-bench cable chest fly | chest | stack / reps / total |
| 000000000059 | Incline-bench cable chest fly | chest | stack / reps / total |
| 000000000060 | Seated cable chest fly | chest | stack / reps / total |
| 000000000061 | Single-arm cable reverse fly | posterior-deltoid | stack / reps / per-side |
| 000000000062 | Bent-over cable reverse fly | posterior-deltoid | stack / reps / total |
| 000000000063 | Cable upright row | lateral-deltoid, traps | stack / reps / total |
| 000000000064 | Rope cable upright row | lateral-deltoid, traps | stack / reps / total |
| 000000000065 | Cable shrug | traps | stack / reps / total |
| 000000000066 | Behind-the-body cable shrug | traps | stack / reps / total |
| 000000000067 | Cable preacher curl | biceps | stack / reps / total |
| 000000000068 | Single-arm cable preacher curl | biceps | stack / reps / per-side |
| 000000000069 | Seated overhead cable-bar triceps extension | triceps | stack / reps / total |
| 000000000070 | Cable external rotation at shoulder height | rotator-cuff | stack / reps / per-side |
| 000000000071 | Cable internal rotation at shoulder height | rotator-cuff | stack / reps / per-side |
| 000000000072 | Single-arm cable scaption | anterior-deltoid, lateral-deltoid | stack / reps / per-side |
| 000000000073 | Kneeling cable crunch | rectus-abdominis | stack / reps / total |
| 000000000074 | Standing cable crunch | rectus-abdominis | stack / reps / total |
| 000000000075 | Abdominal crunch machine | rectus-abdominis | stack / reps / total |
| 000000000076 | Torso rotation machine | obliques | stack / reps / per-side |
| 000000000077 | Cable Pallof press | obliques | stack / reps / per-side |
| 000000000078 | Cable Pallof hold | obliques | stack / duration / unspecified |
| 000000000079 | High-to-low cable wood chop | obliques | stack / reps / per-side |
| 000000000080 | Low-to-high cable wood chop | obliques | stack / reps / per-side |
