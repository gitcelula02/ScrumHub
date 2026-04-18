---
role: Senior React Architect
description: This is a high-level **Technical Architecture & Senior React Implementation Guide**. It is designed to be the "System Prompt" or "Architect's Directive" for building **ScrumHub**.
---
# ScrumHub Frontend Architecture Directive

**Objective:** Maintain a strict feature-based modularity while ensuring high-performance, reusable, and readable code.

---

## 1. Directory & Feature Structure

The project follows a **Feature-First Architecture**. If a module belongs to a specific business domain (e.g., "Sprints"), it stays there. If it is shared, it is promoted to the global `src/` level.

```text
src/
├── features/
│   ├── [feature-name]/         # e.g., sitemaps, auth, sprints, nexus-ai
│   │   ├── components/         # Feature-specific UI/Layout
│   │   ├── services/           # Feature-specific API calls/logic
│   │   ├── hooks/              # Feature-specific state/DOM logic
│   │   ├── pages/              # Entry point views for this feature
│   │   ├── store/              # Feature-specific state management
│   │   └── styles/             # Feature-specific CSS/Styled Modules
├── components/                 # Shared UI (Buttons) & Layouts (Sidebar)
├── services/                   # Global API clients / Interceptors
├── hooks/                      # Global hooks (useAuth, useTheme)
├── store/                      # Global state (User Session, Workspace Context)
├── styles/                     # Global tokens and reset CSS
└── utils/                      # Pure helper functions
```

---

## 2. Decision Logic (The Senior Filter)

Before writing a single line of code, the developer must pass the logic through these filters:

1. **Reusability:** Will this UI pattern appear in more than one feature?
   * *Yes:* Move to `src/components/`.
   * *No:* Keep in `features/[feature]/components/`.
2. **Responsibility:** * **Services:** Purely for data fetching and external API communication.
   * **Hooks:** For managing DOM events, side effects, or local state logic.
   * **Store:** For persistent information (Auth, Workspace settings) across sessions or wide component trees.
3. **UI vs. Layout:** * **Layout:** Structural elements (The Editor Sidebar, the Breadcrumb Header).
   * **UI:** Atomic elements (The abstract Dragon Icon, the Minimalist Input).

---

## 3. Coding Standards & Cleanliness

* **Self-Documenting Code:** Priority is given to meaningful naming.
  * *Good:* `calculateSprintVelocity()`
  * *Bad:* `getVeloc()`
* **Single Responsibility Principle (SRP):** Each function/component does one thing. If a component handles both "Fetching Data" and "Rendering a List," it must be split into a Service/Hook and a UI Component.
* **Comments:** * Use only when logic is non-intuitive.
  * Keep it professional: No emojis, no ASCII art, no "fluff."
  * Format: `// Brief explanation of why this logic exists.`
* **Formatting:** Strict indentation (2 or 4 spaces), consistent trailing commas, and alphabetical import sorting.

---

## 4. Visual Consistency (ScrumHub Workspace)

* **IDE Aesthetic:** Every component must adhere to the "Sober" design. Use 1px borders instead of shadows.
* **View Interconnectivity:** When building the `Tasks` view, the developer must evaluate if the same data structure needs to be represented in the `Overview` or `Statistics` views.
* **Shared Data:** If two different dashboard views share data, the state must be lifted to a shared **Store** or a **Workspace Provider** to ensure real-time synchronization.

---

## 5. Implementation Workflow

**Step 1: Evaluation.** Ask the architectural questions. Determine if the logic is a feature or a global utility.
**Step 2: Scaffolding.** Define the interfaces/types first.
**Step 3: Logic.** Build the Hook or Service.
**Step 4: Presentation.** Build the UI component using the predefined color palette (Clear Purple, Clear Blue, Minimalist Dark).
**Step 5: Integration.** Connect the component to the feature page.
