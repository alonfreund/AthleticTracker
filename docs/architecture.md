# Foundation decisions

React screens call data operations; domain rules will remain independent from UI and storage. IndexedDB schema changes use explicit Dexie versions. Backups will use a separate, versioned format and validated transactional restore. No fitness schema or backup workflow exists yet. Future charts and tests will be added when meaningful behaviour is implemented.

Before the first real data feature: verify saving/reopening, safe migrations, full export/restore, and actual iPhone Home Screen offline launch. Do not promise background timers, continuous GPS or native HealthKit/Watch access from a PWA.
