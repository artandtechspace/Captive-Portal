# Agent Working Agreements

These guidelines apply to the entire repository and define the expectations for consistent, maintainable contributions.

## General Writing Style
- Write documentation and other textual deliverables in German with clear sentences and appropriate Markdown structure (headings, lists, tables).
- Keep the initial HTML file for portal pages below 128 KB and move large assets to separate files.
- Ensure that every UI remains fully usable within a 900 × 572 px viewport.

## Build and Execution Process
- Run `npm run preflight` before every commit. The command builds the project, runs tests, checks types, and lints the code in one step.
- Optionally run the individual steps (`npm run build`, `npm run test`, `npm run typecheck`, `npm run lint`) to narrow down local issues.
- Record all automated and manual checks in project logs or pull-request descriptions.

## Writing Tests (Vitest)
- Use Vitest consistently (`describe`, `it`, `expect`, `vi`) and follow the existing test style.
- Store test files (`*.test.ts`, `*.test.tsx`) next to the modules they cover. Test environments are defined in the corresponding `vitest.config.ts` files.
- Prepare mocks with `vi.mock('module', async (importOriginal) => { ... })` and rely on `importOriginal` to selectively reuse real implementations.
- Place critical `vi.mock` calls at the top of the file (before other imports) and use `const myMock = vi.hoisted(() => vi.fn());` when a hoisted helper is required.
- Reset mocks with `vi.resetAllMocks()` inside `beforeEach` and restore them with `vi.restoreAllMocks()` in `afterEach`.
- Create mock functions via `vi.fn()` and configure them using `mockImplementation`, `mockResolvedValue`, or `mockRejectedValue`. Use `vi.spyOn` for spies and restore them afterwards.
- Commonly mocked modules include Node built-ins (`fs`, `fs/promises`, `os`, `path`, `child_process`), external SDKs (`@google/genai`, `@modelcontextprotocol/sdk`), and internal packages.
- Test Ink components with `render()` from `ink-testing-library`, inspect `lastFrame()`, and wrap them in required `Context.Provider`s.
- Use `async`/`await` for asynchronous logic. For timers rely on `vi.useFakeTimers()`, `vi.advanceTimersByTimeAsync()`, and `vi.runAllTimersAsync()`. Validate promise rejections with `await expect(promise).rejects.toThrow(...)`.
- Review existing tests before adding new ones to understand mocking order and other conventions.

## Git Workflow
- All primary development happens on the `main` branch.

## JavaScript and TypeScript Guidelines
- Prefer plain objects with explicit TypeScript type definitions over classes.
- Use ES modules (`import`/`export`) to separate public and private APIs instead of class-based encapsulation.
- Avoid `any`. If a value has an unknown type, use `unknown` and narrow it afterwards.
- Apply type assertions (`as ...`) sparingly and challenge their necessity.
- In `switch` statements call `checkExhaustive` from `packages/cli/src/utils/checks.ts` in the `default` branch to enforce exhaustiveness.
- Favour array operators such as `.map()`, `.filter()`, `.reduce()`, `.slice()`, and `.sort()` to keep data transformations immutable.

## React Guidelines
- Implement only function components with Hooks (`useState`, `useReducer`, …); class components are not allowed.
- Keep render functions pure. Move side effects, subscriptions, and external synchronisation to `useEffect` (with complete dependency lists) or event handlers.
- Never mutate state directly. Use spread syntax, copies, or functional updates (`setState(prev => ...)`).
- Follow the Rules of Hooks rigorously: no hook calls inside loops, conditions, or nested functions.
- Use refs only when absolutely necessary (e.g. DOM focus, animations, third-party integrations) and avoid reading from `ref.current` during rendering.
- Structure components to be small and reusable. Extract shared logic into custom hooks instead of duplicating it.
- Write code that remains compatible with React concurrency (e.g. functional state updates and thorough effect cleanups).
- Avoid unnecessary `useEffect` calls; apply them solely for synchronising with external state.
- Leave optimisations such as `useMemo`, `useCallback`, or `React.memo` to cases where the React Compiler cannot cover them. Focus on clear, data-flow-oriented code.
- Plan data fetching to run in parallel whenever possible, leverage Suspense appropriately, and present lightweight loading states alongside resilient error handling.
- Deliver non-blocking user experiences: prefer subtle placeholders, provide friendly error messages, and render partial data as soon as it is available.

## Browser and Platform Requirements
- Do not use `sessionStorage`, `localStorage`, or modal dialogs (`alert`, `confirm`) in portal-specific code.
- Continuously document known limitations and workarounds for the iOS/macOS Captive Network Assistant.

## Documentation and Communication
- Extend release notes and project logs with relevant changes, decisions, and open issues.
- Describe all executed tests and manual checks in pull-request summaries.

## Comment Policy
- Add code comments only when they provide clear value. Do not use comments to communicate with reviewers.

## General Style Requirements
- Use hyphens rather than underscores in flag names (for example `my-flag` instead of `my_flag`).
