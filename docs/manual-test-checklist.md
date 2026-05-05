# Manual Test Checklist

Use this checklist before publishing a source release or attaching new test builds.

## Core Session Logic

1. Launch the app and confirm the tray icon appears.
2. Confirm the active schedule mode is the expected one.
3. Let a work session run until the reminder triggers.
4. Confirm the countdown changes correctly during the blocking and rest phases.
5. Press `Esc` and confirm the current break is skipped cleanly.

## Pause and Resume Rules

1. Lock the screen and confirm the session pauses.
2. Resume or unlock and confirm the session continues.
3. Put the machine to sleep and confirm the session pauses.
4. Wake the machine and confirm the session resumes cleanly.

## Overlay Behavior

1. Confirm the overlay is above normal app windows.
2. Confirm the cat animation plays without a black background.
3. Confirm the countdown card stays fully inside the screen bounds.
4. Confirm the transition from intro animation to loop animation does not visibly break.

## Multi-Monitor Behavior

1. Trigger a break with all displays connected.
2. Confirm every display is covered.
3. Connect or enable a new display during a break.
4. Confirm the new display also becomes covered.
5. Disconnect a display and confirm the app continues without errors.

## Packaging Sanity Check

1. Rebuild the release artifacts.
2. Confirm the output files are present in `release/`.
3. Confirm no obsolete large media files were accidentally reintroduced into `public/cats/`.
4. Verify the package size is broadly in the expected range for the current platform.
