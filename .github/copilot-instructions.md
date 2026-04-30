- The dev server is already running so you don't have to run it ever.

- NEVER use barrel files. They are a code smell.

- If asked to create a plan put it in the .github/plans/ folder and follow the existing plan format.

- Use clear understandable variable and function names. Avoid one letter variable names unless it's a common convention (e.g. 'i' for loop index).

## General Coding

- Use clear understandable variable and function names. Avoid one letter variable names unless it's a common convention (e.g. 'i' for loop index).
- Only create an abstraction if it's actually needed - Prefer clear function/variable names over inline comments - Avoid helper functions when a simple inline expression would suffice - Don't use emojis unless told to so
- Avoid defensive coding patterns unless absolutely necessary.
- **Keep implementations as simple as possible**. Avoid over-engineering or adding unnecessary complexity. Over engineering is bad and can lead to maintenance issues down the line. Always ask yourself if there's a simpler way to implement something before adding more code or abstractions.

## React

- Always refer to the vercel-react-best-practices/SKILL.md when creating or modifying React components, or Next.js pages.
- Avoid massive JSX blocks and compose smaller components - Colocate code that changes together - Avoid 'useEffect unless absolutely needed

## UI

- Don't add crazy gradients, or crazy hover effects - Prefer subtle shadows and borders - Follow shadcn/ui design patterns and components where possible
- Avoid custom colors outside of the design system - Prefer spacing that matches shadcn/ui design system
- Always refer to the UI components that exist and the code within before creating a new component
- Use tabler icons for icons - refer to existing usage for examples or fetch the latest from the docs

## Tailwind

- Mostly use built-in values, occasionally allow dynamic values, rarely globals - Always use v4 + global CSS file format + shadcn/ui

## TypeScript

- Don't unnecessarily add 'try / catch' - Don't cast to 'any'

## tRPC + React Query

- Default to `mutate` instead of `mutateAsync` for client mutations
- Put success and error handling in `onSuccess` and `onError` callbacks, either in the hook or per call site
- Only use `mutateAsync` when you truly need promise sequencing in the caller, and if you do, handle the rejection explicitly
- Avoid patterns that surface expected mutation failures as uncaught runtime errors in development

## Package manager

- I use bun as a package manager. Do not use npm for anything.

## OpenAPI

- Use the generate openapi script and update the docs with the generated openapi.json file.

## Testing

- Dont add tests unless explicitly asked to do so
