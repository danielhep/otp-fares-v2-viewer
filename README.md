# OTP Fare Viewer

A small Vite + React + Tailwind CSS application for visualizing OpenTripPlanner fare analysis data.

## Getting Started

```bash
npm install
npm run dev
```

The dev server runs on port 3000.

## Building For Production

```bash
npm run build
npm run serve
```

## Testing

This project uses [Vitest](https://vitest.dev/) and React Testing Library.

```bash
npm run test
```

## Project Structure

- `src/App.tsx` is the application shell that renders the shared header and the fare viewer UI.
- `src/components/` contains presentational components such as the header and fare viewer panels.
- `src/lib/` hosts pure analysis helpers and test files.
- `public/` contains static assets served verbatim.

Tailwind directives live in `src/styles.css`; styles are applied globally via the main entry point.
