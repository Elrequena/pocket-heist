---
description: Create a commit message by analizing git diffs
allowed-tools: Bash(git status:*), Bash(git diff --staged), Bash(git commit:*)
---

## Context:

- Current git status: !`git status`
- Current git diff: !`git diff --staged`

## Your task:

Analize above staged git changes and create a commit message. Use present tense and explain "why" something changed, not just "what"  has changed.

## Commit types with emojis:
Only use the following emojis

- ✨ `feat:` - New feature
- 🐛 `fix:` - Bug fix
- 🔨 `refactor:` - Refactoring code
- 📄 `docs:` - Documentation
- ☑️ `test:` - Tests
- ⚡ `perf:` - Performance

## Format:
Use the following format for making the commit message:

```bash
<emoji> <type>: <concise_description>
<optional_body_explaining_why>
```

## Output:

1. Show the summary of changes current staged
2. Propose commit message with appropiate emoji
3. Ask for confirmation before

DO NOT auto-commit - wait for user approval, and only commit if the user says so.