# Session Resume Protocol

Use this protocol whenever a new AI session enters a project that contains the `Small Business Websites` folder.

## Step 1

Read these first if they exist:

- `Small Business Websites/START-HERE.md`
- `Small Business Websites/README.md`
- `Small Business Websites/canonical-paths.md`
- `Small Business Websites/phase-dependency-map.md`
- `docs/tracking/execution-preferences.md`
- `docs/tracking/progress.md`
- `docs/tracking/decision-log.md`
- `docs/tracking/change-control.md`

## Step 2

Determine:

- current phase
- last completed action
- blocked or stale artifacts
- whether the next phase is allowed to start

## Step 3

If `docs/tracking/progress.md` does not exist:

- create it from `Small Business Websites/00-operating-model/progress-tracker-template.md`
- record the current phase as `00-operating-model`
- record that the project was initialized without a prior tracking file

## Step 4

Do not restart a completed phase unless:

- the progress tracker marks it stale
- the dependency map says an upstream input changed
- the owner explicitly asks for a re-run

## Step 5

At phase end, update:

- `docs/tracking/progress.md`
- `docs/tracking/decision-log.md` when material decisions occurred
- `docs/tracking/version-history.md` when a meaningful iteration, release, or rollback occurred

## Step 6

If inputs are missing, conflicting, or insufficient (for example: no photos, no confirmed service list, no deploy target):

- record the issue in `docs/tracking/progress.md`
- stop the affected phase
- ask a clear question instead of improvising
