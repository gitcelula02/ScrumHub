---
title: documentation norms
description: this file explain the norms a documentation file must always follow to be agent readable and no roundabout
---
# Documentation Norms
The following are rules and directions that must be fulfilled when creating or modifying any documentation file. 

## Considerations
- All documentation files must be properly established in their corresponding folder, the folder works as a tag for the markdown file to understand the category or scope it holds.
- All documentation must be on Markdown format, and have as little extra content as possible (No emojis, no redundancy)
- Use obsidian as markdown editor, make sure to add relationships for the graph to be generated and make the second brain
## Non-negotiable 
- Documentation files must be less than 500 lines or 3000 words. If it surpassed that, it must be divided into multiple files
- All documentation must be on English. 
- Do not include commands or code into documentation files unless is for skills or exemplification
- All documentation files must have headers and properties "name" and "description"
- Create documentation per feature
---
## Creating a New Feature Doc

When creating `docs/features/[name]/`:

1. Create `SPEC.md` — route, components, UX description (stable)
2. Create `STATUS.md` — implementation state (living log)
3. **After completing work, update STATUS.md** with what was done

### STATUS.md Format

```markdown
# [Feature] Status

**Last updated:** YYYY-MM-DD

## Implementation State

| Component | Status | Notes |
|-----------|--------|-------|
| Service | ✅ Done | |
| Hook | 🚧 In Progress | |
| Component | 📋 Planned | |

## Known Issues
- None

## Recent Changes
- YYYY-MM-DD: Completed service layer
```

---
