# Contributing

All changes to this repository must go through pull requests. Do not push directly to `main`.

## Commit And PR Title Format

Pull request titles and pull request commits must follow Conventional Commits:

```text
<type>(optional-scope): <description>
```

Examples:

```text
feat: add Tencent form webhook
fix(api): reject invalid webhook signatures
docs: document Vercel deployment
chore: update dependencies
test(matrix): cover approved submission rendering
```

Allowed types:

- `feat`
- `fix`
- `docs`
- `style`
- `refactor`
- `test`
- `chore`
- `build`
- `ci`
- `perf`
- `revert`

Rules:

- Use lowercase types.
- Use an imperative, concise description.
- Do not use informal prefixes such as `[codex]`.
- If a commit or PR title does not follow this format, it must be amended before submission.
- Breaking changes must use `!` after the type or scope, or include a `BREAKING CHANGE:` footer.

## Required Checks

Before requesting review, run:

```bash
pnpm lint
pnpm test
pnpm build
```

GitHub Actions also checks PR title and commit messages. A PR that fails the Conventional Commits check should not be merged.
