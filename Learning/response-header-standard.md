# Response Header Standard

Use this standard whenever an AI in a website project is replying to the owner, and especially when the reply includes:

- a prompt to copy into another AI
- an approval request
- an action request (e.g. "upload these photos", "confirm the service list")
- a deploy or launch decision
- a review handoff

## Required Header Format

```text
Current: [Phase number X] > [Task Y] > [Work Z]
Purpose: [What this response is for]
Owner Action: [What the user must do now, if anything, or "None - continue"]
```

## Important Rules

- Keep the header to 1-3 lines.
- Keep the rest of the response useful and plain-spoken (the reader is a business owner, not a developer).
- Define any technical term the first time it appears (deploy, commit, repo, branch, etc.).
- If the action is for another AI or agent, say exactly which system should receive it.
- Use the current phase number from `phase-dependency-map.md` as the phase number when possible.
- Use the artifact name or active feature ID as the work name when possible.
- If the owner prefers a different title than `Owner`, use that exact label consistently.
