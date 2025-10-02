# Repository Guidelines

## Project Structure & Module Organization
The app is a Vite-powered React client written in TypeScript. Feature views should live inside `src/routes/` alongside their loaders and hooks, while presentational pieces belong in `src/components/`. Shared helpers settle under `src/lib/`; keep generated artifacts such as `src/routeTree.gen.ts` untouched unless you rebuild them through the router tooling. Static assets originate from `public/`, and production bundles are emitted to `dist/`. Sample GraphQL requests (`exampleQuery.graphql`) and the `otpSchema.json` schema file document the upstream OTP API contract.

## Build, Test, and Development Commands
Install once with `npm install`. Use `npm run dev` to launch Vite on port 3000, and `npm run start` for the same build in non-watch mode. Ship-ready bundles come from `npm run build`, with `npm run serve` to preview the compiled output locally. Run the Vitest suite via `npm run test`; pass `--watch` when iterating.

## Coding Style & Naming Conventions
Stick to TypeScript modules with ESNext syntax and two-space indentation. React components are PascalCase (`src/components/FareCard.tsx`), hooks are camelCase and live in files prefixed with `use`. Derive CSS through Tailwind classes; global overrides belong in `src/styles.css`. Prefer named exports for reusable utilities, and keep GraphQL artifacts suffixed with `.graphql` for tooling compatibility.

## Testing Guidelines
Tests rely on Vitest and React Testing Library. Co-locate UI tests beside the component under test using the `*.test.tsx` suffix and the Testing Library idioms (`screen`, `userEvent`). Validate data helpers with `*.test.ts`. Ensure new features cover critical UI states and GraphQL error handling, and aim to run the entire suite before submitting.

## Commit & Pull Request Guidelines
Follow the existing git history by writing concise, imperative subject lines ("Add fare detail view"). Group related changes into single commits, include test updates, and avoid noise from generated artifacts. Pull requests must summarize behavior changes, call out impacted routes, link the corresponding ticket, and attach screenshots or GIFs for visual updates. Highlight any configuration steps reviewers must perform.

