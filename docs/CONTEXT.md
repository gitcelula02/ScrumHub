---
description : This markdown document is designed as a **System Context & UI Specification** for a front-end generative model. It translates your brand vision into a technical design language that a developer or AI can immediately act upon to build the interface.
---

# UI/UX Specification: ScrumHub Workspace
**Project Persona:** High-End Developer Tool / Minimalist IDE
**Design Philosophy:** "Sober, Structured, and Sophisticated"

## 1. Brand Identity & Visual Language
* **Core Concept:** A SCRUM platform that feels like a premium code editor (IDE).
* **Mascot/Logo:** An abstract, geometric "S-Link" Dragon. Sharp angles, minimalist lines, representing fluid power and order.
* **Catchphrase:** *Architecting Agility.*
* **Color Palette (No Gradients):**
    * **Primary:** Clear Purple (Solid, high-contrast for primary actions).
    * **Secondary:** Clear Blue (Functional, used for progress and links).
    * **Surface:** Pure White (Light Mode) / Deep Charcoal-Black (Dark Mode - no "AI purples").
    * **Accents:** Low-opacity Purple/Blue for hover states and subtle nesting indicators.
* **Typography:** Monospace for data/IDs; Clean, high-readability Sans-Serif (e.g., Inter or JetBrains Sans) for the UI.

## 2. Layout & Navigation Architecture (The "Editor" UI)
The interface must ditch traditional "dashboard" cards in favor of a **Nested Workspace** layout.

* **The Explorer Sidebar:** A vertical left-hand rail managing projects like a file tree. Clicking a project "expands" its specific Scrum ceremonies as sub-folders (Sprints, Epics, Reports).
* **The Command Center:** A top-level "Breadcrumb" navigation that tracks the user’s location within the project hierarchy (e.g., `Project_Alpha > Sprint_04 > User_Story_22`).
* **Multi-Pane Interface:** Support for side-by-side views—for example, viewing a User Story on the left while the AI Chat (Nexus) is pinned to a right-hand panel.

## 3. Feature-to-View Mapping
### **Project & Epic Management (The "Hierarchy View")**
* **UX:** Use a clean list-based indentation style similar to folder structures. 
* **UI:** Minimalist icons (Chevrons) to expand/collapse Epics. No shadows; use 1px solid borders to define sections.

### **Sprint Planning & Task Board (The "Grid View")**
* **UX:** A "no-distraction" Kanban board. Task cards are flat with clear color-coded borders (not backgrounds) to indicate priority.
* **UI:** Drag-and-drop interactions should feel snappy. Status columns (To-Do, In Progress, Done) are separated by subtle vertical lines.

### **Nexus AI Integration (The "Terminal & Split View")**
* **UX:** Nexus should feel like a built-in terminal or a side-aligned assistant. It must have two modes:
    1.  **Global Chat:** A full-screen or large-panel view for deep project analysis.
    2.  **Contextual Overlay:** A slim sidebar accessible via a shortcut or a team chat trigger.
* **Manner of Speech:** Direct, technical, and proactive. It should present data as "Observations" or "System Logs."

### **Ceremonies & Reports (The "Data View")**
* **UX:** Retrospectives and Reviews are handled as collaborative documents/whiteboards within the workspace.
* **UI:** Use crisp, high-contrast line charts for statistics. Avoid "bubbly" graphics; keep data visualizations surgical and precise.

## 4. Interaction Principles
* **Hover-State Logic:** Use low-opacity tints to highlight the active "line" or "folder" the user is hovering over, mimicking code editor line highlighting.
* **The "Clean" Constraint:** No rounded corners exceeding 4px. No heavy drop shadows. No "glow" effects. High contrast is key to the "Sober" aesthetic.
* **Transitions:** Instant or very fast (150ms) linear transitions to maintain the feeling of a high-performance developer tool.

## 5. View Accompaniment Summary
Every view must be accompanied by an **"Action Header"** containing the project’s specific AI settings and member permissions, ensuring the user always knows their current "Kernel" configuration.