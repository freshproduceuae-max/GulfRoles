# Lessons Learned

Hard-won rules from real small-business website builds. Read this before build and deployment. These are the failures that actually happen — treat them as guardrails, not suggestions.

## Images and Logo (the #1 source of failure)

- **Reference only real, committed files.** The most common live-site bug is an `<img>` that points to a file which was never added to git. It looks fine locally and shows a broken image on the live host. Confirm every referenced file is committed and pushed.
- **Map every placeholder to a real file before build.** Keep the mapping in `docs/assets/asset-inventory.md`: slot name → filename → source photo → alt text. Do not invent stand-in images the owner never provided.
- **Name files meaningfully and consistently:** `hero-main.jpg`, `event-wedding.jpg`, `gallery-1.jpg`. Avoid `pasted-1738...png` and other temporary names in the final set.
- **Paths are case-sensitive on the host.** `images/Logo.png` and `images/logo.png` are the same on Windows but different on Vercel/Linux. Match case exactly between the file and the reference.
- **Keep only what is used.** Remove unused/pasted images before launch so the repo stays clean and small.
- **Optimize large photos.** Multi-megabyte images slow the site. Prefer reasonably sized JP/WebP.

## Git and Deployment

- **Never commit `node_modules`, build caches, or large binaries.** They blow past the host/GitHub 100 MB file limit and make pushes hang or fail. Put them in `.gitignore` from the start.
- **Small, frequent commits.** Static hosts like Vercel redeploy automatically on push; keep changes reviewable.
- **Verify on the live URL, not just locally.** After deploy, load the real URL and confirm images load, links work, and CTAs fire. A hard refresh (Ctrl/Cmd+Shift+R) clears cached old versions.
- **Revert discipline.** When the owner says "revert", return to the last known-good state — don't stack new guesses on top of a broken one.

## Design and Content

- **Implement an imported design as-is.** If the owner brings a design (from a design tool or a file), build that design. Do not silently re-frame it into a different framework or restyle it unless asked.
- **Keep the full offering.** Never quietly drop a service, cuisine, product, or menu item the owner listed. If a section gets long, use dialogs/accordions — but keep the content.
- **Mobile-first.** Design for the phone first, then scale up. Most small-business traffic is mobile.
- **Every action needs three states:** loading, success, and error. A form or button that only handles the happy path is not done.
- **Warm, human copy.** For an owner-run business, service-hearted CTAs ("Let us serve you", "Plan my celebration") usually beat transactional ones ("Get a quote"). Match the owner's voice.
- **Ask before improvising UX.** When a real choice exists (e.g. how a dialog behaves on mobile), ask with a short recommendation rather than guessing.

## Verification

- **Prove it before claiming it.** Don't say a step works until it has been checked — locally via a preview server, or on the live URL. If something failed, say so plainly with the evidence.

## Mobile Page Architecture

- **Separate mobile.html from index.html — auto-redirect both ways.** Add a 5-line script to `index.html` that sends phones (mobile UA or width ≤ 640px) to `mobile.html`; add the same redirect in `mobile.html` sending desktops back to `index.html`. No loops, clean separation.
- **Banner on top, floating hamburger.** Place a full-width banner image at the very top; float a small, circular hamburger button (e.g. 44px, white with shadow) in the top-right corner over it. On tap, open a full-screen overlay menu.
- **Logo lives in the menu overlay, not the header.** The sticky header gets cluttered with both logo and hamburger. Instead: show only the hamburger on the main page, and display your logo at the top of the full-screen menu overlay. Cleaner, more space.
- **Menu items stay on one line.** No sub-descriptions (hints) next to menu links — they cause text to wrap. One link per line. Hints can live inside dialogs/details sections if needed.
- **Scroll spy for menu highlight, not header label.** Track which section the user is in and highlight it green in the open menu. Do NOT show a distracting header label that says "Gallery" — it's confusing because the label doesn't update smoothly while scrolling and seems broken.
- **Full-screen sheet dialogs.** When a user taps an offer card, open a full-screen overlay (not a modal box) with details. On dismiss, return to the page. This feels native and uses the screen space well.
- **Compact 2-column card grids, not 4-column.** Larger cards (2 per row) on mobile feel substantial and tap-friendly. 4-column grids are hard to read and interact with on a phone.
- **Horizontal swipe strips for type galleries.** Event types, galleries, testimonials — let the user swipe horizontally to scroll through them. Reduces vertical scrolling fatigue.
- **Lock body scroll when overlay is open.** Set `body.style.overflow = 'hidden'` when opening a menu or dialog; restore it on close. Prevents awkward "scroll the page while the overlay is open" behavior.

## Conversion

- **No-backend forms can still convert.** A "request a quote" form can open WhatsApp with the message pre-filled (`https://wa.me/<number>?text=...`), needing no server.
- **Make contact obvious.** A floating WhatsApp/call button and repeated, clear CTAs matter more than clever features for these businesses.
