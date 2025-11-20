# GEMINI.md

## Project Overview

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app). The application, "Hack Aware," is an AI-powered tool designed to check if a website is vulnerable to common security hacks.

The project is built with the following technologies:
- **Framework:** [Next.js](https://nextjs.org/) (a React framework)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Linting:** [ESLint](https://eslint.org/)

The application's main entry point is `src/app/page.tsx`, which renders the landing page located at `src/app/landing/page.tsx`.

## Building and Running

### Running the Development Server

To run the application in a development environment, use the following command:

```bash
npm run dev
```

This will start the development server, and you can view the application by opening [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production

To create a production-ready build of the application, run the following command:

```bash
npm run build
```

This will create an optimized build of the application in the `.next` directory.

### Starting the Production Server

To start the application in production mode (after building), use the following command:

```bash
npm run start
```

### Linting

To run the linter and check for code quality issues, use the following command:

```bash
npm run lint
```

## Development Conventions

- **Styling:** The project uses Tailwind CSS for styling. Utility classes are used directly in the JSX of the components.
- **Components:** The application's UI is built with React components. The main page component is located in `src/app/page.tsx`.
- **Routing:** The application uses the Next.js App Router. The file system is used to define routes. For example, `src/app/landing/page.tsx` corresponds to the `/landing` route.
- **TypeScript:** The project is written in TypeScript, and type checking is enforced.
