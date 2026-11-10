# Exercise catalogue: preparation and Batch 1 (0.10.0)

Only the original 12 plus the approved 80 additions are shipped: **92 built-in exercises**. Batch 2 has not started. No new dependencies, database schema changes or backup-format changes were required.

## Preparation

- `catalogue/legacy.ts` freezes the pre-metadata migration baseline. `catalogue/original.ts` preserves all 12 released definitions exactly, tested against the 0.9.0 fixture.
- `catalogue/families.ts` reserves permanent family UUIDs. `catalogue/batch1.ts` uses explicit numbered UUID reservations, never array positions. Do not renumber, recycle IDs or assign an existing ID to a different movement.
- `catalogue/manifest.ts` lists approved batches. Add future batches only after content and duplicate review. Installation validates both the incoming batch and its union with the shipped manifest before any write.
- Validation checks taxonomy IDs, primary/secondary separation, required/optional equipment, family/type consistency and normalized name/variation duplicates. Names, aliases and biomechanical equivalence still need editorial review: automated checks cannot detect every synonym.
- Installation remains transactional and repeatable. It never deletes omitted exercises, overwrites custom definitions, writes personal preferences or refreshes workout snapshots. Incompatible tracking or repetition conventions preserve the local definition for deliberate handling rather than silently changing its meaning.
- Specific deltoid heads and rhomboids fit the existing grouped muscle filters. Broad machine/cable filters include the new specific stations. Existing taxonomy identifiers remain valid.
- All content ships with the app and is included in its offline cache. Format 4 export and formats 1–4 import remain supported, with the shared 100 MiB limit unchanged.

## Batch composition

| Reservation range | Area | Additions |
| --- | --- | ---: |
| 1–24 | Chest presses and flyes (including triceps-focused close-grip press) | 24 |
| 25–36 | Overhead presses and push presses | 12 |
| 37–60 | Rows and pullovers | 24 |
| 61–72 | Vertical pulls and scapular pull-up | 12 |
| 73–80 | Face pull, reverse flyes, lateral/front raises | 8 |
| | Total additions | 80 |

These are batch groupings, not mutually exclusive muscle counts. Existing generic exercises retain their original meaning; new entries specify genuinely different equipment, support, grip, loading or execution. For example, the old generic dumbbell shoulder press remains unchanged alongside explicitly seated, neutral-grip, Arnold and floor-seated versions.

## Measurement conventions

- Barbell: total bar and plates. Two dumbbells: one dumbbell's weight. Single-dumbbell movements: the single implement.
- Selectorized cables/machines: displayed working stack. Two-stack bilateral exercises use equal settings and record one stack, not their sum.
- Plate-loaded machines: all added working plates, excluding the empty machine. Smith: plates only, excluding carriage. Landmine: free-end plates only, excluding bar and attachment. These are logging conventions, not estimates of effective resistance.
- Bodyweight, additional load and assistance retain separate existing tracking modes. Band pulldowns record reps without an invented mass value; use workout notes for band/tension.
- Every addition explicitly states total or per-side reps. Bilateral movements count one complete movement as one rep; unilateral/alternating entries count reps per side.
- Machines differ in leverage and displayed resistance. Compare like-for-like setups; the app does not claim equal displayed numbers mean equal resistance across machines.

## Content process and references

Names use established terminology. Instructions and notes are original concise descriptions, not imported proprietary app content. General movement and anatomy references consulted during preparation include [NASM's exercise guidance](https://www.nasm.org/workout-exercise-guidance), [NASM's chest press guidance](https://www.nasm.org/resource-center/exercise-library/chest-press-machine), [ACE's exercise library](https://www.acefitness.org/resources/everyone/exercise-library/) and [AAOS shoulder conditioning guidance](https://www.orthoinfo.org/bodypart/shoulder/rotator-cuff-and-shoulder-conditioning-program/). This is editorial review, not external clinical or coaching certification.

For each future batch: check the entire prior catalogue for synonyms/equivalent variants; reserve IDs; review muscle, equipment, tracking and rep conventions; author instructions; validate the full manifest; test partial and failed updates; run the complete suite and build; report before proceeding. No Cartesian-product variation generation.

## Validation

Automated coverage includes the released-definition fixture, permanent ID ledger, all metadata and duplicate checks, actual old-database migrations, concurrent/repeated installation, custom-name collisions, preferences, historical and unfinished snapshots, raw drafts, timers, halfway-failure rollback and disk-staged export/restore. Existing tests exercise backup formats 1–4 and near/over-100 MiB validation. A 390 × 844 browser check confirmed 92 entries, searches, grouped filters and new details. Physical iPhone/offline testing is still a manual acceptance check.

## Permanent Batch 1 inventory

All IDs begin `ba51c100-0000-4000-8000-`; the suffix below is the permanent 12-digit reservation. The full ledger is in `tests/fixtures/batch-one-ids.json`.

| Suffix | Name | Primary muscles | Load / reps |
| --- | --- | --- | --- |
| 000000000001 | Dumbbell bench press | chest | dumbbells / total |
| 000000000002 | Incline barbell bench press | chest | barbell / total |
| 000000000003 | Incline dumbbell bench press | chest | dumbbells / total |
| 000000000004 | Decline barbell bench press | chest | barbell / total |
| 000000000005 | Decline dumbbell bench press | chest | dumbbells / total |
| 000000000006 | Close-grip barbell bench press | triceps | barbell / total |
| 000000000007 | Paused barbell bench press | chest | barbell / total |
| 000000000008 | Barbell floor press | chest | barbell / total |
| 000000000009 | Dumbbell floor press | chest | dumbbells / total |
| 000000000010 | Neutral-grip dumbbell bench press | chest | dumbbells / total |
| 000000000011 | Single-arm dumbbell bench press | chest | single-dumbbell / per-side |
| 000000000012 | Smith machine bench press | chest | smith / total |
| 000000000013 | Incline Smith machine bench press | chest | smith / total |
| 000000000014 | Seated chest press machine | chest | stack / total |
| 000000000015 | Plate-loaded chest press machine | chest | plates / total |
| 000000000016 | Plate-loaded incline chest press | chest | plates / total |
| 000000000017 | Standing cable chest press | chest | stack / total |
| 000000000018 | Single-arm standing cable chest press | chest | stack / per-side |
| 000000000019 | Dumbbell chest fly | chest | dumbbells / total |
| 000000000020 | Incline dumbbell chest fly | chest | dumbbells / total |
| 000000000021 | Standing cable chest fly | chest | stack / total |
| 000000000022 | Low-to-high cable chest fly | chest | stack / total |
| 000000000023 | High-to-low cable chest fly | chest | stack / total |
| 000000000024 | Pec deck chest fly | chest | stack / total |
| 000000000025 | Standing barbell overhead press | anterior-deltoid, lateral-deltoid | barbell / total |
| 000000000026 | Seated barbell shoulder press | anterior-deltoid, lateral-deltoid | barbell / total |
| 000000000027 | Seated dumbbell shoulder press | anterior-deltoid, lateral-deltoid | dumbbells / total |
| 000000000028 | Seated Arnold press | anterior-deltoid, lateral-deltoid | dumbbells / total |
| 000000000029 | Seated neutral-grip dumbbell shoulder press | anterior-deltoid, lateral-deltoid | dumbbells / total |
| 000000000030 | Single-arm standing dumbbell overhead press | anterior-deltoid, lateral-deltoid | single-dumbbell / per-side |
| 000000000031 | Seated Smith machine shoulder press | anterior-deltoid, lateral-deltoid | smith / total |
| 000000000032 | Shoulder press machine | anterior-deltoid, lateral-deltoid | stack / total |
| 000000000033 | Half-kneeling single-arm landmine press | anterior-deltoid | landmine / per-side |
| 000000000034 | Barbell push press | anterior-deltoid, triceps | barbell / total |
| 000000000035 | Dumbbell push press | anterior-deltoid, triceps | dumbbells / total |
| 000000000036 | Dumbbell Z press | anterior-deltoid, lateral-deltoid | dumbbells / total |
| 000000000037 | Barbell bent-over row | lats, rhomboids | barbell / total |
| 000000000038 | Underhand barbell row | lats | barbell / total |
| 000000000039 | Pendlay row | lats, rhomboids | barbell / total |
| 000000000040 | Single-arm dumbbell row | lats, rhomboids | single-dumbbell / per-side |
| 000000000041 | Chest-supported dumbbell row | lats, rhomboids | dumbbells / total |
| 000000000042 | Barbell seal row | lats, rhomboids | barbell / total |
| 000000000043 | Incline-bench dumbbell high row | rhomboids, posterior-deltoid | dumbbells / total |
| 000000000044 | Seated cable row | lats, rhomboids | stack / total |
| 000000000045 | Wide-grip seated cable row | lats, rhomboids | stack / total |
| 000000000046 | Single-arm seated cable row | lats, rhomboids | stack / per-side |
| 000000000047 | Single-arm standing cable row | lats, rhomboids | stack / per-side |
| 000000000048 | Half-kneeling single-arm cable row | lats, rhomboids | stack / per-side |
| 000000000049 | Chest-supported row machine | lats, rhomboids | stack / total |
| 000000000050 | Plate-loaded chest-supported row | lats, rhomboids | plates / total |
| 000000000051 | Single-arm row machine | lats, rhomboids | stack / per-side |
| 000000000052 | Chest-supported T-bar row | lats, rhomboids | plates / total |
| 000000000053 | Meadows row | lats, rhomboids | landmine / per-side |
| 000000000054 | Landmine T-bar row | lats, rhomboids | landmine / total |
| 000000000055 | Smith machine bent-over row | lats, rhomboids | smith / total |
| 000000000056 | Inverted row | lats, rhomboids | bodyweight / total |
| 000000000057 | Feet-elevated inverted row | lats, rhomboids | bodyweight / total |
| 000000000058 | Dumbbell pullover | lats, chest | single-dumbbell / total |
| 000000000059 | Straight-arm cable pulldown | lats | stack / total |
| 000000000060 | Rope straight-arm cable pulldown | lats | stack / total |
| 000000000061 | Neutral-grip lat pulldown | lats | stack / total |
| 000000000062 | Underhand lat pulldown | lats | stack / total |
| 000000000063 | Wide-grip lat pulldown | lats | stack / total |
| 000000000064 | Half-kneeling single-arm cable lat pulldown | lats | stack / per-side |
| 000000000065 | Plate-loaded lat pulldown machine | lats | plates / total |
| 000000000066 | Chin-up | lats | bodyweight / total |
| 000000000067 | Neutral-grip pull-up | lats | bodyweight / total |
| 000000000068 | Weighted chin-up | lats | added / total |
| 000000000069 | Assisted chin-up machine | lats | assisted / total |
| 000000000070 | Scapular pull-up | lats, traps | bodyweight / total |
| 000000000071 | Single-arm seated lat pulldown | lats | stack / per-side |
| 000000000072 | Band lat pulldown | lats | reps-only / total |
| 000000000073 | Cable face pull | posterior-deltoid, traps | stack / total |
| 000000000074 | Reverse pec deck fly | posterior-deltoid | stack / total |
| 000000000075 | Bent-over dumbbell reverse fly | posterior-deltoid | dumbbells / total |
| 000000000076 | Chest-supported dumbbell reverse fly | posterior-deltoid | dumbbells / total |
| 000000000077 | Standing cable reverse fly | posterior-deltoid | stack / total |
| 000000000078 | Dumbbell lateral raise | lateral-deltoid | dumbbells / total |
| 000000000079 | Single-arm cable lateral raise | lateral-deltoid | stack / per-side |
| 000000000080 | Alternating dumbbell front raise | anterior-deltoid | dumbbells / per-side |
