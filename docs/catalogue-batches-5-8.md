# Combined Batches 5–8: 100 additions (0.14.0)

**100 new entries; 432 built-in exercises in total.** This is the revised scope: one combined batch of 100, replacing the four larger planned batches. The 332 previously released definitions and their IDs are unchanged. The original 650-entry plan was a planning target and is not represented as completed here. No further catalogue expansion is included.

| Reservations | Editorial area | Added |
| --- | --- | ---: |
| 1–25 | Calisthenics, bodyweight, rings and suspension | 25 |
| 26–50 | Resistance bands, kettlebells and landmine | 25 |
| 51–75 | Core, calves, hips, spinal stability and neck | 25 |
| 76–100 | Power, conditioning, specialty equipment and remaining gaps | 25 |

Groups are editorial, not mutually exclusive muscle counts. Variations have meaningful differences in equipment, support, execution or tracking. Examples include stable-floor versus suspended push-ups, unmeasured suspension support versus unassisted pistol squats, one-bell versus two-bell loading, supported versus floor-based spinal work, and static farmer holds versus timed walking carries. Nordic curls and cable hip flexion fill remaining gaps. The prior generic definitions remain intact.

## Identity and preservation

New UUIDs are explicitly reserved under `ba51c580-0000-4000-8000-`, listed in `tests/fixtures/combined-batches-ids.json`. Do not renumber, reuse or derive reservations from order. The exact 332-entry 0.13.0 baseline is frozen in `tests/fixtures/catalogue-0.13.0.json` and compared against the complete manifest. New taxonomy IDs identify actual equipment, muscles and patterns; older IDs and labels are unchanged.

The existing transactional installer, workout repositories, service-worker policy and backup pipeline are unchanged. The combined batch only adds definitions and catalogue markers, preserving custom definitions (including exact reserved-ID collisions), personal rest/favourites, historical and unfinished snapshots, drafts, timers and other saved data. No new dependency, database migration or backup-format change was needed. JSON format 4 export, formats 1–4 import and the shared 100 MiB limit remain supported.

## Logging conventions and scope

- Bodyweight and suspension/ring entries use the existing bodyweight mode. Strap angle, ring height and hand assistance can be noted. Manual help does not acquire a fictitious assistance mass.
- Bands record reps without estimating kilograms. Use notes for band, length, tension and anchor. One kettlebell records its own mass; equal double-kettlebell sets record one bell. Landmine values count free-end plates only.
- A medicine ball or sandbag records its actual implement mass. Specialty bars use actual bar plus plates. Weighted back extensions keep added load separate from bodyweight.
- Neck isometrics use gentle manual pressure and time only; they do not record external load. Lateral and rotational holds count time per direction. No loaded neck bridges or speculative equipment combinations were added.
- Power entries count reps, including jumps and throws. No jump height, distance, velocity or power is inferred. Ropes and skipping use working seconds. Timed farmer carries and sled efforts use load and seconds, without distance, speed or friction estimates. These are catalogue definitions using existing tracking, not new activity modes or a cardio module.
- Per-side reps specify the working leg, arm or direction in notes where ambiguous. Unequal holds can be logged in separate sets with side notes.

Descriptions are original. Representative reference checks used [ACE's kettlebell library](https://www.acefitness.org/resources/everyone/exercise-library/equipment/kettlebells/?page=2), [VA's neck isometric reference](https://www.veteranshealthlibrary.va.gov/Rehab/OccupationalTherapy/Neck/3%2C89949) and [NSCA's landing guidance](https://www.nsca.com/education/videos/plyometric-implementation-setup-and-execution-of-jump-landing-positions-to-decrease-likelihood-of-injuries/). No proprietary app descriptions or media were imported, and no clinical treatment claims are made.

## Verification

All **239 automated tests** and the production build passed. Tests check permanent IDs, the 332-entry released baseline, names/aliases/variations and all metadata across 432 entries, grouping, equipment and tracking. An actual populated upgrade adds exactly 100 definitions. Mid-batch storage failure rolls the transaction back; repeat and concurrent installation are idempotent. Custom definitions, preferences, workout rows, snapshots, timers and drafts survive upgrades, reopening and staged restore.

Every new exercise is completed through the logger, finished into history and round-tripped through backup/restore. Representative bodyweight, bands, per-hand bell loading, added load, no-load duration and sled load/duration examples also test draft recovery. The full legacy and large-backup suite remains covered.

A 390 × 844 browser check confirmed 432 entries and the TGU alias. With the preview server stopped, the cached app reopened, retained a 20-second ring support hold, recovered a raw reps draft, saved an eight-rep band curl and finished both into history. This is browser verification, not a physical iPhone test.

After publication, physical iPhone acceptance should confirm 0.14.0, 432 built-in entries, retained old records and preferences, reps-only band logging and timed holds offline, recovery and history, and current-backup export/restore. Do not clear website data or uninstall the app to update it.

## Permanent inventory

All IDs begin `ba51c580-0000-4000-8000-`. Suffixes below are permanent.

| Suffix | Exercise | Primary muscles | Load / measurement / convention |
| --- | --- | --- | --- |
| 000000000001 | Incline push-up | chest | bodyweight / reps / total |
| 000000000002 | Knee push-up | chest | bodyweight / reps / total |
| 000000000003 | Decline push-up | chest | bodyweight / reps / total |
| 000000000004 | Pike push-up | anterior-deltoid, triceps | bodyweight / reps / total |
| 000000000005 | Feet-elevated pike push-up | anterior-deltoid, triceps | bodyweight / reps / total |
| 000000000006 | Archer push-up | chest | bodyweight / reps / per-side |
| 000000000007 | Scapular push-up | serratus-anterior | bodyweight / reps / total |
| 000000000008 | Ring push-up | chest | bodyweight / reps / total |
| 000000000009 | Ring row | lats, rhomboids | bodyweight / reps / total |
| 000000000010 | Ring dip | triceps, chest | bodyweight / reps / total |
| 000000000011 | Ring chin-up | lats, biceps | bodyweight / reps / total |
| 000000000012 | Ring support hold | triceps, shoulders | bodyweight / duration / unspecified |
| 000000000013 | Ring fallout | rectus-abdominis, obliques | bodyweight / reps / total |
| 000000000014 | Ring biceps curl | biceps | bodyweight / reps / total |
| 000000000015 | Ring triceps extension | triceps | bodyweight / reps / total |
| 000000000016 | Suspension trainer row | lats, rhomboids | bodyweight / reps / total |
| 000000000017 | Suspension trainer push-up | chest | bodyweight / reps / total |
| 000000000018 | Suspension trainer biceps curl | biceps | bodyweight / reps / total |
| 000000000019 | Suspension trainer triceps extension | triceps | bodyweight / reps / total |
| 000000000020 | Suspension trainer hamstring curl | hamstrings | bodyweight / reps / total |
| 000000000021 | Suspension trainer knee tuck | rectus-abdominis, obliques | bodyweight / reps / total |
| 000000000022 | Suspension trainer pike | rectus-abdominis, obliques | bodyweight / reps / total |
| 000000000023 | Suspension-assisted pistol squat | quadriceps, glutes | bodyweight / reps / per-side |
| 000000000024 | Pistol squat | quadriceps, glutes | bodyweight / reps / per-side |
| 000000000025 | Parallel-bar L-sit hold | hip-flexors, rectus-abdominis | bodyweight / duration / unspecified |
| 000000000026 | Resistance-band pull-apart | posterior-deltoid, rhomboids | reps-only / reps / total |
| 000000000027 | Resistance-band face pull | posterior-deltoid, traps | reps-only / reps / total |
| 000000000028 | Resistance-band external rotation | rotator-cuff | reps-only / reps / per-side |
| 000000000029 | Seated resistance-band row | lats, rhomboids | reps-only / reps / total |
| 000000000030 | Standing resistance-band chest press | chest | reps-only / reps / total |
| 000000000031 | Resistance-band biceps curl | biceps | reps-only / reps / total |
| 000000000032 | Resistance-band overhead triceps extension | triceps | reps-only / reps / total |
| 000000000033 | Resistance-band lateral raise | lateral-deltoid | reps-only / reps / total |
| 000000000034 | Resistance-band good morning | hamstrings, glutes | reps-only / reps / total |
| 000000000035 | Lateral resistance-band walk | abductors | reps-only / reps / per-side |
| 000000000036 | Two-hand kettlebell swing | hamstrings, glutes | kettlebell / reps / total |
| 000000000037 | Single-arm kettlebell swing | hamstrings, glutes | kettlebell / reps / per-side |
| 000000000038 | Kettlebell goblet squat | quadriceps, glutes | kettlebell / reps / total |
| 000000000039 | Kettlebell deadlift | glutes, hamstrings, quadriceps | kettlebell / reps / total |
| 000000000040 | Kettlebell Turkish get-up | core, shoulders, glutes | kettlebell / reps / per-side |
| 000000000041 | Single-arm kettlebell clean | glutes, hamstrings | kettlebell / reps / per-side |
| 000000000042 | Single-arm kettlebell snatch | glutes, hamstrings, shoulders | kettlebell / reps / per-side |
| 000000000043 | Single-arm kettlebell strict press | anterior-deltoid, lateral-deltoid | kettlebell / reps / per-side |
| 000000000044 | Single-arm kettlebell push press | anterior-deltoid, triceps | kettlebell / reps / per-side |
| 000000000045 | Single-arm kettlebell row | lats, rhomboids | kettlebell / reps / per-side |
| 000000000046 | Double-kettlebell front squat | quadriceps, glutes | kettlebells / reps / total |
| 000000000047 | Double-kettlebell clean | glutes, hamstrings | kettlebells / reps / total |
| 000000000048 | Landmine rotation | obliques | landmine / reps / per-side |
| 000000000049 | Standing single-arm landmine press | anterior-deltoid | landmine / reps / per-side |
| 000000000050 | Single-arm neutral-grip landmine row | lats, rhomboids | landmine / reps / per-side |
| 000000000051 | Dead bug | rectus-abdominis, obliques | bodyweight / reps / per-side |
| 000000000052 | Bird dog | lower-back, core | bodyweight / reps / per-side |
| 000000000053 | Side plank | obliques | bodyweight / duration / unspecified |
| 000000000054 | Reverse crunch | rectus-abdominis | bodyweight / reps / total |
| 000000000055 | Hanging knee raise | hip-flexors, rectus-abdominis | bodyweight / reps / total |
| 000000000056 | Hanging straight-leg raise | hip-flexors, rectus-abdominis | bodyweight / reps / total |
| 000000000057 | Kneeling ab-wheel rollout | rectus-abdominis, obliques | bodyweight / reps / total |
| 000000000058 | Short-lever Copenhagen plank | adductors | bodyweight / duration / unspecified |
| 000000000059 | Hollow body hold | rectus-abdominis, obliques | bodyweight / duration / unspecified |
| 000000000060 | Superman hold | lower-back, glutes | bodyweight / duration / unspecified |
| 000000000061 | 45-degree back extension | glutes, hamstrings | bodyweight / reps / total |
| 000000000062 | Weighted 45-degree back extension | glutes, hamstrings | added / reps / total |
| 000000000063 | Reverse hyperextension machine | glutes, hamstrings | plates / reps / total |
| 000000000064 | Single-leg bodyweight calf raise | calves | bodyweight / reps / per-side |
| 000000000065 | Bent-knee single-leg bodyweight calf raise | calves | bodyweight / reps / per-side |
| 000000000066 | Wall-supported tibialis raise | tibialis-anterior | bodyweight / reps / total |
| 000000000067 | Side-lying hip abduction | abductors | bodyweight / reps / per-side |
| 000000000068 | Side-lying hip adduction | adductors | bodyweight / reps / per-side |
| 000000000069 | Bodyweight clamshell | abductors | bodyweight / reps / per-side |
| 000000000070 | Hand-resisted neck flexion hold | neck | unloaded / duration / unspecified |
| 000000000071 | Hand-resisted neck extension hold | neck | unloaded / duration / unspecified |
| 000000000072 | Hand-resisted lateral neck hold | neck | unloaded / duration / unspecified |
| 000000000073 | Hand-resisted neck rotation hold | neck | unloaded / duration / unspecified |
| 000000000074 | Supine neck nod | neck | unloaded / reps / total |
| 000000000075 | Reverse plank hold | glutes, hamstrings | bodyweight / duration / unspecified |
| 000000000076 | Trap-bar jump | quadriceps, glutes | barbell / reps / total |
| 000000000077 | Box jump | quadriceps, glutes | bodyweight / reps / total |
| 000000000078 | Standing broad jump | quadriceps, glutes | bodyweight / reps / total |
| 000000000079 | Paused squat jump | quadriceps, glutes | bodyweight / reps / total |
| 000000000080 | Alternating lunge jump | quadriceps, glutes | bodyweight / reps / per-side |
| 000000000081 | Skater jump | glutes, abductors, quadriceps | bodyweight / reps / per-side |
| 000000000082 | Plyometric push-up | chest | bodyweight / reps / total |
| 000000000083 | Medicine-ball chest pass | chest | implement / reps / total |
| 000000000084 | Medicine-ball slam | lats, rectus-abdominis, glutes | implement / reps / total |
| 000000000085 | Rotational medicine-ball wall throw | obliques, glutes | implement / reps / per-side |
| 000000000086 | Hand-assisted Nordic hamstring curl | hamstrings | bodyweight / reps / total |
| 000000000087 | Alternating battle-rope waves | shoulders, forearms | unloaded / duration / unspecified |
| 000000000088 | Double-arm battle-rope slams | shoulders, lats, forearms | unloaded / duration / unspecified |
| 000000000089 | Burpee | chest, quadriceps, glutes | bodyweight / reps / total |
| 000000000090 | Mountain climber | hip-flexors, rectus-abdominis | bodyweight / reps / per-side |
| 000000000091 | Jumping jack | calves, abductors, shoulders | bodyweight / reps / total |
| 000000000092 | Jump rope | calves | unloaded / duration / unspecified |
| 000000000093 | Sandbag shouldering | glutes, hamstrings, quadriceps | implement / reps / per-side |
| 000000000094 | Sandbag bear-hug squat | quadriceps, glutes | implement / reps / total |
| 000000000095 | Timed dumbbell farmer carry | forearms, traps, core | dumbbells / duration / unspecified |
| 000000000096 | Timed sled push | quadriceps, glutes, calves | sled / duration / unspecified |
| 000000000097 | Timed backward sled drag | quadriceps | sled / duration / unspecified |
| 000000000098 | Multi-grip bar bench press | chest | barbell / reps / total |
| 000000000099 | Trap-bar Romanian deadlift | hamstrings, glutes | barbell / reps / total |
| 000000000100 | Standing cable hip flexion | hip-flexors | stack / reps / per-side |
