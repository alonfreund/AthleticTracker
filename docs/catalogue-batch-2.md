# Batch 2: lower-body catalogue (0.11.0)

**80 additions; 172 built-in exercises in total.** This implements only Batch 2 of the approved expansion plan. Batch 3 has not started. No dependencies, database schema changes, backup format changes or fitness features were added.

## Approved expansion sequence

| Batch | Additions | Running total | Scope |
| --- | ---: | ---: | --- |
| Original | 12 | 12 | Existing frozen definitions |
| 1 | 80 | 92 | Upper-body presses and pulls |
| 2 | 80 | 172 | Squats, hinges, lunges, steps, thrusts and bridges |
| 3 | 80 | 252 | Deltoids, biceps, triceps, forearms and grip |
| 4 | 80 | 332 | Machine, cable and Smith coverage; isolation gaps |
| 5 | 80 | 412 | Calisthenics, bodyweight, rings and suspension |
| 6 | 80 | 492 | Bands, kettlebells and landmine |
| 7 | 80 | 572 | Core, calves, hips, spinal stability and neck |
| 8 | 78 | 650 | Specialty equipment, power, conditioning and audited gaps |

Future totals remain quality targets rather than quotas. Content can span categories in earlier batches, so later batches must check the entire existing catalogue before selecting candidates.

## Batch 2 composition

| Reservations | Area | Additions |
| --- | --- | ---: |
| 1–24 | Squats and leg presses | 24 |
| 25–44 | Deadlifts, good mornings and cable/landmine hinges | 20 |
| 45–68 | Lunges, split squats, step-ups and step-down | 24 |
| 69–80 | Hip thrusts and floor bridges | 12 |

Existing barbell back squat and Romanian deadlift definitions remain unchanged. New entries distinguish meaningful equipment, support, range, movement or loading differences: raised versus low trap-bar handles; floor-reset versus top-start deadlifts; stationary versus stepping lunges; rear-foot versus front-foot elevation; bench-supported hip thrusts versus floor bridges. Cosmetic stance/grip combinations were not generated to fill the count.

## Identity and safe installation

New definitions use explicit reservations in namespace `ba51c200-0000-4000-8000-`, never array indexes. The permanent ID/name ledger is `tests/fixtures/batch-two-ids.json`. `tests/fixtures/catalogue-0.10.0.json` freezes all 92 released definitions and tests compare them exactly against the new manifest.

The shared definition factory now accepts the separately reserved Batch 2 namespace; Batch 1's wrapper, IDs and output are unchanged. New permanent families cover leg presses, good mornings, lunges, split squats, steps, thrusts, bridges and pull-throughs. The existing deadlift and squat families are reused where appropriate. Taxonomy additions identify the actual machine/loading setups, a secure heel wedge, squat box and optional bar pad.

The existing transactional installer is unchanged. It validates the complete manifest, adds missing definitions and markers atomically, never deletes omitted rows, and does not write workout tables or personal preferences. Locally modified, archived and custom definitions remain intact. The schema remains 5 and JSON backup format remains 4, with formats 1–4 importable and the existing shared 100 MiB cap.

## Logging conventions

- Barbell and specialty bar: actual bar plus plates. Two-dumbbell movements: one dumbbell's weight. Goblet, sumo squat and loaded bridge/thrust entries use one dumbbell and record its single weight.
- Plate-loaded leg press, squat and hip-thrust machines: total added working plates only, excluding unloaded sled/lever mass. The selectorized horizontal leg press uses the displayed stack setting.
- Smith: added plates only, excluding carriage. Landmine: free-end plates only, excluding the bar/attachment. These conventions do not estimate effective resistance.
- Bodyweight movements do not require external weight. All unilateral, alternating and walking variations explicitly count reps per side. Walking lunges count working steps per leg; distance is not claimed or stored.
- Single-leg dumbbell RDL uses two dumbbells and records one dumbbell's weight; its notes distinguish this setup. Single-leg plate-loaded leg press records the full plate load, not half the sled load.
- Standard hinge/squat movements remain repetitions-based. No distance, power, cardio or routine functionality is introduced.

Instructions and notes are original. Terminology and basic movement classifications were checked against [ACE's exercise library](https://www.acefitness.org/resources/everyone/exercise-library/), [NASM's exercise guidance](https://www.nasm.org/workout-exercise-guidance) and [NSCA's glute-training movement discussion](https://dxpprod.nsca.com/contentassets/f921c5b3fe4142db964a943d3554b324/ptq-10.4.4-program-design-considerations-for-optimal-strength-hypertophy-glute-mucsles.pdf). This is an editorial content review, not external coaching certification. No proprietary app descriptions or media were copied.

## Verification and iPhone acceptance

Tests cover all 172 definitions, canonical names/aliases/variations, the frozen 92-entry baseline, new permanent IDs, required/optional equipment, explicit load/rep conventions, search/filter results, actual upgrade preserving user data, partial-install rollback/retry, concurrent installation, reopening, old-backup reinstallation and disk-staged export/restore. Representative weighted, per-side, machine-stack and bodyweight entries are logged, recovered and finished through the existing workout repository.

All 189 automated tests and the production build pass. A 390 × 844 browser check confirmed 172 entries, Bulgarian aliases and new details. With the preview server stopped, the cached app reopened, recovered a completed 12 kg × 8 set and a raw partial draft, saved another 12 kg × 6 set, finished and displayed both in history. This is browser verification, not a physical iPhone test.

After publication, confirm version 0.11.0 and 172 built-in entries; inspect a goblet squat, Bulgarian split squat, leg press and glute bridge; log a sample lower-body set offline; reopen/resume; finish and check history; export/restore a current backup; compare old workouts, custom exercises and saved rest preferences. Physical iPhone verification is still required. Do not clear website data or uninstall the app to update it.

## Permanent Batch 2 inventory

All IDs begin `ba51c200-0000-4000-8000-`. Suffixes below are permanent and must never be reused or renumbered.

| Suffix | Exercise | Primary muscles | Load / reps |
| --- | --- | --- | --- |
| 000000000001 | Barbell front squat | quadriceps, glutes | barbell / total |
| 000000000002 | Paused barbell back squat | quadriceps, glutes | barbell / total |
| 000000000003 | Barbell box squat | quadriceps, glutes | barbell / total |
| 000000000004 | Barbell pin squat | quadriceps, glutes | barbell / total |
| 000000000005 | Safety-bar squat | quadriceps, glutes | barbell / total |
| 000000000006 | Zercher squat | quadriceps, glutes | barbell / total |
| 000000000007 | Barbell hack squat | quadriceps, glutes | barbell / total |
| 000000000008 | Dumbbell goblet squat | quadriceps, glutes | single-dumbbell / total |
| 000000000009 | Double-dumbbell front squat | quadriceps, glutes | dumbbells / total |
| 000000000010 | Dumbbell suitcase squat | quadriceps, glutes | dumbbells / total |
| 000000000011 | Heels-elevated dumbbell goblet squat | quadriceps, glutes | single-dumbbell / total |
| 000000000012 | Dumbbell sumo squat | quadriceps, glutes, adductors | single-dumbbell / total |
| 000000000013 | Bodyweight squat | quadriceps, glutes | bodyweight / total |
| 000000000014 | Bodyweight box squat | quadriceps, glutes | bodyweight / total |
| 000000000015 | Smith machine squat | quadriceps, glutes | smith / total |
| 000000000016 | Smith machine front squat | quadriceps, glutes | smith / total |
| 000000000017 | 45-degree leg press | quadriceps, glutes | plates / total |
| 000000000018 | Horizontal leg press machine | quadriceps, glutes | stack / total |
| 000000000019 | Single-leg 45-degree leg press | quadriceps, glutes | plates / per-side |
| 000000000020 | Hack squat machine | quadriceps, glutes | plates / total |
| 000000000021 | Pendulum squat machine | quadriceps, glutes | plates / total |
| 000000000022 | Belt squat machine | quadriceps, glutes | plates / total |
| 000000000023 | Landmine squat | quadriceps, glutes | landmine / total |
| 000000000024 | Barbell cyclist squat | quadriceps, glutes | barbell / total |
| 000000000025 | Conventional barbell deadlift | glutes, hamstrings, quadriceps | barbell / total |
| 000000000026 | Sumo barbell deadlift | glutes, quadriceps, adductors | barbell / total |
| 000000000027 | High-handle trap-bar deadlift | glutes, quadriceps | barbell / total |
| 000000000028 | Low-handle trap-bar deadlift | glutes, quadriceps | barbell / total |
| 000000000029 | Barbell rack pull | glutes | barbell / total |
| 000000000030 | Deficit barbell deadlift | glutes, hamstrings, quadriceps | barbell / total |
| 000000000031 | Paused barbell deadlift | glutes, hamstrings, quadriceps | barbell / total |
| 000000000032 | Dumbbell deadlift | glutes, quadriceps, hamstrings | dumbbells / total |
| 000000000033 | Dumbbell Romanian deadlift | hamstrings, glutes | dumbbells / total |
| 000000000034 | Single-leg dumbbell Romanian deadlift | hamstrings, glutes | dumbbells / per-side |
| 000000000035 | Kickstand dumbbell Romanian deadlift | hamstrings, glutes | dumbbells / per-side |
| 000000000036 | Single-leg barbell Romanian deadlift | hamstrings, glutes | barbell / per-side |
| 000000000037 | Barbell good morning | hamstrings, glutes | barbell / total |
| 000000000038 | Seated barbell good morning | glutes, lower-back | barbell / total |
| 000000000039 | Safety-bar good morning | hamstrings, glutes | barbell / total |
| 000000000040 | Smith machine Romanian deadlift | hamstrings, glutes | smith / total |
| 000000000041 | Cable pull-through | hamstrings, glutes | stack / total |
| 000000000042 | Cable Romanian deadlift | hamstrings, glutes | stack / total |
| 000000000043 | Single-leg cable Romanian deadlift | hamstrings, glutes | stack / per-side |
| 000000000044 | Landmine Romanian deadlift | hamstrings, glutes | landmine / total |
| 000000000045 | Barbell forward lunge | quadriceps, glutes | barbell / per-side |
| 000000000046 | Barbell reverse lunge | quadriceps, glutes | barbell / per-side |
| 000000000047 | Barbell walking lunge | quadriceps, glutes | barbell / per-side |
| 000000000048 | Dumbbell forward lunge | quadriceps, glutes | dumbbells / per-side |
| 000000000049 | Dumbbell reverse lunge | quadriceps, glutes | dumbbells / per-side |
| 000000000050 | Dumbbell walking lunge | quadriceps, glutes | dumbbells / per-side |
| 000000000051 | Dumbbell lateral lunge | quadriceps, glutes, adductors | dumbbells / per-side |
| 000000000052 | Bodyweight reverse lunge | quadriceps, glutes | bodyweight / per-side |
| 000000000053 | Bodyweight walking lunge | quadriceps, glutes | bodyweight / per-side |
| 000000000054 | Bodyweight lateral lunge | quadriceps, glutes, adductors | bodyweight / per-side |
| 000000000055 | Bodyweight split squat | quadriceps, glutes | bodyweight / per-side |
| 000000000056 | Dumbbell split squat | quadriceps, glutes | dumbbells / per-side |
| 000000000057 | Barbell split squat | quadriceps, glutes | barbell / per-side |
| 000000000058 | Dumbbell rear-foot-elevated split squat | quadriceps, glutes | dumbbells / per-side |
| 000000000059 | Barbell rear-foot-elevated split squat | quadriceps, glutes | barbell / per-side |
| 000000000060 | Smith machine split squat | quadriceps, glutes | smith / per-side |
| 000000000061 | Smith machine rear-foot-elevated split squat | quadriceps, glutes | smith / per-side |
| 000000000062 | Front-foot-elevated dumbbell split squat | quadriceps, glutes | dumbbells / per-side |
| 000000000063 | Dumbbell step-up | quadriceps, glutes | dumbbells / per-side |
| 000000000064 | Barbell step-up | quadriceps, glutes | barbell / per-side |
| 000000000065 | Bodyweight step-up | quadriceps, glutes | bodyweight / per-side |
| 000000000066 | Dumbbell lateral step-up | quadriceps, glutes | dumbbells / per-side |
| 000000000067 | Bodyweight step-down | quadriceps, glutes | bodyweight / per-side |
| 000000000068 | Dumbbell curtsy lunge | quadriceps, glutes | dumbbells / per-side |
| 000000000069 | Barbell hip thrust | glutes | barbell / total |
| 000000000070 | Dumbbell hip thrust | glutes | single-dumbbell / total |
| 000000000071 | Smith machine hip thrust | glutes | smith / total |
| 000000000072 | Plate-loaded hip thrust machine | glutes | plates / total |
| 000000000073 | Bodyweight hip thrust | glutes | bodyweight / total |
| 000000000074 | Single-leg bodyweight hip thrust | glutes | bodyweight / per-side |
| 000000000075 | Single-leg dumbbell hip thrust | glutes | single-dumbbell / per-side |
| 000000000076 | Barbell glute bridge | glutes | barbell / total |
| 000000000077 | Dumbbell glute bridge | glutes | single-dumbbell / total |
| 000000000078 | Bodyweight glute bridge | glutes | bodyweight / total |
| 000000000079 | Single-leg bodyweight glute bridge | glutes | bodyweight / per-side |
| 000000000080 | Bodyweight frog pump | glutes | bodyweight / total |
