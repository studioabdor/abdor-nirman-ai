# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Strict Rules for the Coding Copilot

To ensure the project is manageable, easy to maintain, modular, and easy to debug, the coding copilot should adhere to the following strict rules:

### a. Code Structure & Modularity

*   **Component-Based Development:** Each feature (sketch to render, text to render, enhance details) should be a separate React component or module. This keeps the codebase organized and allows for independent development and testing.
*   **Reusable Utilities:** Create utility functions for common tasks (e.g., image processing, API calls) to avoid code duplication.
*   **Folder Structure:** Organize the project with clear folders:
    *   `/components`: Reusable UI components. (Typically `src/components/ui` and `src/components/shared`)
    *   `/features`: Feature-specific components and logic. (Typically `src/app/[featureName]/components`)
    *   `/services`: Firebase and API integration. (Typically `src/lib` for Firebase services, AI flows, server actions)
    *   `/styles`: CSS or styled-components. (Typically `src/app/globals.css` and Tailwind config)
    *   `/tests`: Unit and integration tests. (Typically `tests/`)
    *   *(Parenthetical notes added for mapping to current project structure where applicable)*
*   **Modularity in AI Flows:** Each distinct AI-driven operation (e.g., sketch-to-render, text-to-image, style suggestion) should be encapsulated in its own Genkit flow located in `src/ai/flows/`. These flows should handle interactions with specific AI models and can be invoked by server actions.

### b. Coding Standards

*   **Descriptive Naming:** Use clear, descriptive names for variables, functions, and components (e.g., `sketchCanvas`, `generateImageFromText`).
*   **Small Functions:** Each function should perform a single task. If a function exceeds approximately 20 lines of code (excluding comments and blank lines), consider breaking it down into smaller, more manageable sub-functions.
*   **Comments & Documentation:** 
    *   Comment complex logic, non-obvious decisions, and public APIs of functions/modules.
    *   Maintain a `README.md` file with an overview of the project’s architecture, setup instructions, and these guidelines.
    *   Consider an `ARCHITECTURE.md` for more detailed design choices and data flow diagrams.
*   **Consistent Style:** Use a linter (e.g., ESLint, already part of Next.js projects) to enforce consistent code formatting (e.g., indentation, semicolons, import order). Adhere to project-configured linting rules.
*   **TypeScript Usage:** Utilize TypeScript's features for strong typing to improve code quality and catch errors early. Define clear types or interfaces for function parameters, return values, and complex data structures.

### c. State Management & Data Flow

*   **Local State for UI:** Use React’s `useState` for local component state (e.g., input values, loading states, toggles).
*   **Global State for Shared Data:** If needed, use React Context API (`useContext`) for global state that doesn't change frequently (e.g., user authentication, theme preference). For more complex global state, consider solutions like Zustand or Jotai if Redux feels too heavy.
*   **Firebase Integration:** Use Firebase’s JavaScript SDK (`firebase/*`) and established service patterns (like those in `src/lib/auth.ts`, `src/lib/firestoreService.ts`, `src/lib/storageService.ts`) to handle authentication, database queries, and file storage.
*   **Server Actions:** Utilize Next.js Server Actions (in `src/lib/actions.ts`) for client-to-server communication, especially for invoking AI flows and interacting with Firebase services from the server side. Ensure these actions are secure and handle inputs carefully.

### d. Error Handling & Debugging

*   **Try-Catch Blocks:** Wrap API calls (especially to AI models and Firebase services) and other critical operations in `try...catch` blocks to handle errors gracefully.
*   **User Feedback:** Provide clear feedback to the user for errors (e.g., using toasts or inline messages). Avoid exposing raw error messages directly to the user.
*   **Logging:** Use `console.error` for logging errors on the server and client. For client-side, consider a more structured logging solution for production if needed. Avoid excessive `console.log` statements in production code.
*   **Testing:** Write unit tests for utility functions and critical business logic. Write integration tests for components and features using tools like Jest and React Testing Library. Place tests in the `/tests` directory.

### e. Version Control & Collaboration

*   **Git:** Use Git for version control.
*   **Branching Strategy:** Employ a clear branching strategy (e.g., `main` for production, `develop` for ongoing development, `feature/[feature-name]` for new features, `fix/[issue-name]` for bug fixes).
*   **Commit Messages:** Write clear, descriptive commit messages using conventional commit formats if possible (e.g., "feat: Add sketch to render feature", "fix: Resolve issue with image upload").
*   **Code Reviews:** If working in a team, conduct code reviews to ensure adherence to standards, catch issues early, and share knowledge. As an AI copilot, I will strive to produce code that is review-ready.

### f. Maintaining Context & Chain of Thought

*   **Project Documentation:** Refer to `README.md` and any `ARCHITECTURE.md` to understand the app’s structure, data flow, and key decisions.
*   **Contextual Comments:** Use comments within the code to explain the purpose of modules, complex functions, or specific design choices to help maintain context for future development and for the AI copilot.
*   **Modular Prompts:** When requesting assistance or delegating tasks, provide specific, context-rich prompts. For example, instead of "Write code for the app," use "Implement the `handleSubmit` function in `SketchToRenderForm.tsx` to upload the image to Firebase Storage using `storageService.uploadFile` and then call the `handleSketchToRender` server action."
