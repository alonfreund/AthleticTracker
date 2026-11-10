# Batch 3: shoulders, arms, forearms and grip (0.12.0)

**80 additions; 252 built-in exercises in total.** Only Batch 3 is implemented. Batch 4 has not started. No dependencies, database migrations, backup-format changes or new logger features were added.

## Composition

| Reservations | Editorial group | Additions |
| --- | --- | ---: |
| 1–18 | Deltoids, rotator cuff, scapular raises and shrugs | 18 |
| 19–42 | Biceps and elbow-flexor variations | 24 |
| 43–64 | Triceps extensions, dips and close-grip push-up | 22 |
| 65–80 | Forearms and grip | 16 |

These are editorial groups, not mutually exclusive muscle counts. Hammer and reverse curls also contribute to forearm coverage. Existing shoulder presses, lateral raises, reverse flyes, generic dumbbell curl and cable pushdown remain unchanged. New entries specify meaningful equipment, support, grip, cable direction or execution differences; no Cartesian-product generation was used.

## Data and identity

Every addition has an explicit permanent UUID in namespace `ba51c300-0000-4000-8000-`, with reserved suffixes recorded in `tests/fixtures/batch-three-ids.json`. Do not renumber or recycle reservations. The released 172-entry baseline is frozen in `tests/fixtures/catalogue-0.11.0.json`; tests compare its complete definitions exactly with the new manifest.

Existing family IDs are reused for curls, triceps extensions, raises and push-ups. New permanent families distinguish rotation, Y raises, shrugs, dips, wrist actions, grip holds, hangs and gripper closes. The taxonomy adds actual equipment identifiers and grip/radial-deviation movement patterns without renaming old IDs.

The shared content factory now accepts the existing duration tracking mode, held-plate mass and non-quantified hand-gripper resistance. This supplies definitions to existing strength fields rather than introducing a universal metric model or a new fitness feature. Historical factory output is unchanged, verified by the complete released baseline. Timed entries use unspecified repetition convention because repetitions do not apply; notes specify per-side duration where needed.

The installer remains transactional, repeatable and non-destructive. A compact workout-label bug was corrected: unweighted rep entries now say “Reps only” instead of “Timed hold”. Timed and loaded labels retain their previous meaning. No changes were made to the installer, live workout repositories, persistence model, service-worker policy or backup pipeline. Custom exercises and personal preferences are separate; finished and unfinished snapshots are never refreshed from the catalogue. Schema 5 and JSON backup format 4 remain in use; formats 1–4 and the 100 MiB limit remain supported.

## Logging conventions

- Bilateral dumbbell entries record one equal dumbbell's mass. Single-dumbbell entries record the implement once. Barbells/EZ bars record the actual bar plus plates.
- Cable/machine entries use the displayed stack setting. Equal dual stacks record one stack, not the sum. Bodyweight dips require no external mass; weighted dips record added mass and assisted dips record positive assistance.
- Plate front raises record the plate once. Pinch holds record all plates in the working hand, with thickness/setup in notes. Hand-gripper closes record reps without pretending nominal resistance ratings are interchangeable kilograms; keep the model/setting in workout notes.
- Farmer, suitcase, barbell and plate-pinch holds, dead hangs and towel hangs record seconds, not repetitions or distance. Farmer holds record one dumbbell weight. Suitcase and pinch hold time is per side; use side notes/separate sets if sides differ.
- Alternating curls count repetitions per arm. Supination/pronation/radial-deviation entries specify grip position because changing the lever length changes resistance without changing implement mass.
- Duration notes avoid repetition-only instructions. Existing rep-based entries and all old snapshots remain unchanged.

Instructions are original. Terminology and general technique were reviewed against [ACE's exercise library](https://www.acefitness.org/resources/everyone/exercise-library/) and [NASM's exercise guidance](https://www.nasm.org/workout-exercise-guidance). These are reference checks, not copied content or external coaching certification. No proprietary app descriptions or media were used.

## Verification

Automated checks cover all 252 definitions, normalized names and aliases, variation signatures, taxonomy, explicit load/rep/time conventions and the frozen 172-entry baseline. Upgrade tests add exactly 80 entries while preserving custom-name collisions, archived/local definitions, preferences, history, snapshots, drafts and timers; a halfway storage failure rolls the entire batch back and retry/concurrent installation remains repeatable.

Every new exercise is logged and completed through the existing workout repository and round-tripped through backup/restore. Representative external-load/time, bodyweight/time, plate/time, gripper reps, added-load and assisted-load examples also test partial draft recovery, finishing, preferences and reopened connections. Disk-staged export/restore and legacy-backup reinstallation are exercised alongside the full formats 1–4 suite.

All **207 automated tests** and the production build pass. A 390 × 844 browser check confirmed 252 entries, aliases, timed load conventions and the corrected reps-only label. With the preview server stopped, the cached app reopened, recovered a partial seconds draft, saved and finished timed and reps-only sets, and displayed both correctly in history. A subsequent cached update retained those records; previous reps copied and saved offline in a new session. This does not replace physical iPhone acceptance.

Physical iPhone acceptance after publication: confirm 0.12.0 and 252 built-in entries; search Bayesian, Pinwheel and farmer hold; check previous workouts and preferences; log rep- and time-based examples offline; reopen/resume and finish; export/restore a current backup. Do not clear website data or uninstall the app to update.

## Permanent inventory

All IDs begin `ba51c300-0000-4000-8000-`; suffixes are permanent.

| Suffix | Name | Primary muscles | Load / measurement / convention |
| --- | --- | --- | --- |
| 000000000001 | Seated dumbbell lateral raise | lateral-deltoid | dumbbells / reps / total |
| 000000000002 | Leaning-away dumbbell lateral raise | lateral-deltoid | single-dumbbell / reps / per-side |
| 000000000003 | Side-lying incline dumbbell lateral raise | lateral-deltoid | single-dumbbell / reps / per-side |
| 000000000004 | Chest-supported dumbbell lateral raise | lateral-deltoid | dumbbells / reps / total |
| 000000000005 | Behind-the-body single-arm cable lateral raise | lateral-deltoid | stack / reps / per-side |
| 000000000006 | Lateral raise machine | lateral-deltoid | stack / reps / total |
| 000000000007 | Bilateral cable lateral raise | lateral-deltoid | stack / reps / total |
| 000000000008 | Barbell front raise | anterior-deltoid | barbell / reps / total |
| 000000000009 | Plate front raise | anterior-deltoid | plates-held / reps / total |
| 000000000010 | Simultaneous dumbbell front raise | anterior-deltoid | dumbbells / reps / total |
| 000000000011 | Single-arm cable front raise | anterior-deltoid | stack / reps / per-side |
| 000000000012 | Cable Y raise | traps | stack / reps / total |
| 000000000013 | Incline dumbbell Y raise | traps | dumbbells / reps / total |
| 000000000014 | Side-lying dumbbell external rotation | rotator-cuff | single-dumbbell / reps / per-side |
| 000000000015 | Cable external rotation at side | rotator-cuff | stack / reps / per-side |
| 000000000016 | Cable internal rotation at side | rotator-cuff | stack / reps / per-side |
| 000000000017 | Dumbbell shrug | traps | dumbbells / reps / total |
| 000000000018 | Barbell shrug | traps | barbell / reps / total |
| 000000000019 | Barbell curl | biceps | barbell / reps / total |
| 000000000020 | EZ-bar curl | biceps | barbell / reps / total |
| 000000000021 | Barbell reverse curl | forearms | barbell / reps / total |
| 000000000022 | EZ-bar reverse curl | forearms | barbell / reps / total |
| 000000000023 | Alternating dumbbell curl | biceps | dumbbells / reps / per-side |
| 000000000024 | Dumbbell hammer curl | forearms, biceps | dumbbells / reps / total |
| 000000000025 | Alternating dumbbell hammer curl | forearms, biceps | dumbbells / reps / per-side |
| 000000000026 | Cross-body dumbbell hammer curl | forearms, biceps | single-dumbbell / reps / per-side |
| 000000000027 | Seated dumbbell curl | biceps | dumbbells / reps / total |
| 000000000028 | Incline dumbbell curl | biceps | dumbbells / reps / total |
| 000000000029 | Incline dumbbell hammer curl | forearms, biceps | dumbbells / reps / total |
| 000000000030 | Dumbbell concentration curl | biceps | single-dumbbell / reps / per-side |
| 000000000031 | Single-arm dumbbell preacher curl | biceps | single-dumbbell / reps / per-side |
| 000000000032 | EZ-bar preacher curl | biceps | barbell / reps / total |
| 000000000033 | Barbell spider curl | biceps | barbell / reps / total |
| 000000000034 | Dumbbell spider curl | biceps | dumbbells / reps / total |
| 000000000035 | Lying cable curl | biceps | stack / reps / total |
| 000000000036 | Standing cable-bar curl | biceps | stack / reps / total |
| 000000000037 | Rope cable hammer curl | forearms, biceps | stack / reps / total |
| 000000000038 | Single-arm cable curl | biceps | stack / reps / per-side |
| 000000000039 | Behind-the-body cable curl | biceps | stack / reps / per-side |
| 000000000040 | High-cable double-biceps curl | biceps | stack / reps / total |
| 000000000041 | Preacher curl machine | biceps | stack / reps / total |
| 000000000042 | Dumbbell Zottman curl | biceps, forearms | dumbbells / reps / total |
| 000000000043 | Rope triceps pushdown | triceps | stack / reps / total |
| 000000000044 | Straight-bar triceps pushdown | triceps | stack / reps / total |
| 000000000045 | Reverse-grip triceps pushdown | triceps | stack / reps / total |
| 000000000046 | Single-arm cable triceps pushdown | triceps | stack / reps / per-side |
| 000000000047 | Cross-body cable triceps extension | triceps | stack / reps / per-side |
| 000000000048 | Overhead rope cable triceps extension | triceps | stack / reps / total |
| 000000000049 | Single-arm overhead cable triceps extension | triceps | stack / reps / per-side |
| 000000000050 | Lying cable triceps extension | triceps | stack / reps / total |
| 000000000051 | EZ-bar lying triceps extension | triceps | barbell / reps / total |
| 000000000052 | Barbell lying triceps extension | triceps | barbell / reps / total |
| 000000000053 | Dumbbell lying triceps extension | triceps | dumbbells / reps / total |
| 000000000054 | Rolling dumbbell triceps extension | triceps | dumbbells / reps / total |
| 000000000055 | Seated dumbbell overhead triceps extension | triceps | single-dumbbell / reps / total |
| 000000000056 | Single-arm dumbbell overhead triceps extension | triceps | single-dumbbell / reps / per-side |
| 000000000057 | Single-arm dumbbell triceps kickback | triceps | single-dumbbell / reps / per-side |
| 000000000058 | Single-arm cable triceps kickback | triceps | stack / reps / per-side |
| 000000000059 | Triceps extension machine | triceps | stack / reps / total |
| 000000000060 | Barbell JM press | triceps | barbell / reps / total |
| 000000000061 | Bodyweight triceps dip | triceps | bodyweight / reps / total |
| 000000000062 | Weighted triceps dip | triceps | added / reps / total |
| 000000000063 | Assisted dip machine | triceps | assisted / reps / total |
| 000000000064 | Close-grip push-up | triceps | bodyweight / reps / total |
| 000000000065 | Seated barbell wrist curl | forearms | barbell / reps / total |
| 000000000066 | Seated barbell reverse wrist curl | forearms | barbell / reps / total |
| 000000000067 | Single-arm dumbbell wrist curl | forearms | single-dumbbell / reps / per-side |
| 000000000068 | Single-arm dumbbell reverse wrist curl | forearms | single-dumbbell / reps / per-side |
| 000000000069 | Seated cable wrist curl | forearms | stack / reps / total |
| 000000000070 | Seated cable reverse wrist curl | forearms | stack / reps / total |
| 000000000071 | Dumbbell forearm pronation | forearms | single-dumbbell / reps / per-side |
| 000000000072 | Dumbbell forearm supination | forearms | single-dumbbell / reps / per-side |
| 000000000073 | Dumbbell wrist radial deviation | forearms | single-dumbbell / reps / per-side |
| 000000000074 | Dumbbell farmer hold | forearms | dumbbells / duration / unspecified |
| 000000000075 | Dumbbell suitcase hold | forearms | single-dumbbell / duration / unspecified |
| 000000000076 | Double-overhand barbell hold | forearms | barbell / duration / unspecified |
| 000000000077 | Single-hand plate pinch hold | forearms | plates-held / duration / unspecified |
| 000000000078 | Dead hang | forearms | bodyweight / duration / unspecified |
| 000000000079 | Towel hang | forearms | bodyweight / duration / unspecified |
| 000000000080 | Hand-gripper close | forearms | gripper / reps / per-side |
