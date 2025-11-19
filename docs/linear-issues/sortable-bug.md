# Bug Report: Drag and Drop Page Reordering Not Working

## Description

The drag-and-drop functionality for page reordering in the Admin interface is not functioning as expected for the user.

## Symptoms

- User reports: "when I select + hold a page it does not move".
- The drag handle is visible, but interacting with it does not initiate the drag operation.
- The issue persists after:
  - Adding `touch-action: none` to the drag handle.
  - Adding `ghost-class` and `drag-class` for visual feedback.
  - Hard refreshing the browser.
  - Restarting the dev server.

## Technical Implementation

- **Library:** `@vueuse/integrations/useSortable` (wrapping `SortableJS`).
- **Component:** `app/components/admin/AdminPageList.vue`.
- **Configuration:**
  - `handle: '.drag-handle'`
  - `el` ref bound to `<tbody>`
  - `list` ref bound to `localPages` (reactive array)

## Verification Status

- **Agent Environment:** Works correctly. Dragging via the handle reorders the list and persists changes.
- **User Environment:** Fails. No movement occurs.

## Potential Causes to Investigate

1.  **Browser Compatibility:** Specific browser issues with SortableJS (e.g., Safari, Firefox).
2.  **Dependency Loading:** `sortablejs` might not be correctly loaded in the user's environment despite server restart.
3.  **Event Conflicts:** Other global event listeners might be interfering with drag initiation.
4.  **CSS Issues:** `z-index` or layout issues preventing the handle from capturing events.

## Next Steps

- [ ] Gather browser information (User Agent).
- [ ] Check browser console for specific errors or warnings.
- [ ] Verify if `Sortable` is correctly instantiated on the element.
- [ ] Test with a minimal reproduction case.
