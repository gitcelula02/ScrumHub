# ScrumHub Features
This document contains all Future and implemented features.  
Any new implementation may be inserted here.

## Features Overview

### Frontend
The frontend must be intuitive and easy to use. 
The Frontend is the portal to all the features of the application.  
### Backend
The backend is composed of 2 layers.  
The database connection layer, with account, project, task, and user management.  
The AI layer, with the AI features of the application.  

## Application Purpose
This application is a management tool created to replace and facilitate SCRUM tools to create backlogs and manage projects.  
Similar to Jira and GitHub projects, the application must contain a board where the user can create, edit, delete, move and review tasks, for himself and assigned to others, based on their permissions.  
The application must also contain a feature to create and manage projects, with the ability to add and remove users, and assign them roles and permissions.  
Different from other applications, ScrumHub must have the capacity to represent the information and task inside the boards and backlog differently, concretely, the backlog should have a tree structure representation along with the classic one, where each node is a task, and the edges are the dependencies between tasks. There may be bees, that can represent tasks that have not real dependencies, but are related to one or more branches.  
The tree can have different colors representing the tasks state.  

All boards and backlogs should be able to be represented as a markdown file, this with the purpose of filling AI context, and easy human interpretation and manipulation that offers the Markdown format (All within a set of rules).  

Following the All-in-one place philosophy, the application relies on a unified chat feature. Each project maintains a single centralized chat room encompassing all active project participants. Teams serve as a tool to rapidly assign groups of people to a project, but do not constrain project chats into siloed rooms. Direct messaging between users is also available. All chat communication is connected to the AI in the following manner:  

- The users can call the AI inside the chat, and the AI will respond to the user, with the context of the chat and more importantly, the project context.  
This means that the AI must have access to the project's tasks, backlog, and board, and must be able to answer questions about them, and also suggest changes, like creating new tasks, moving tasks between boards, or changing the dependencies between tasks.  
- The AI can also be used to generate reports, summaries, or any other kind of information related to the project, based on the data in the database.  
- The AI can interpret and extract information from the voice chat (Only if allowed by the user) and create tasks or generate reports based on the conversation.  

The application will have a workspace, this workspace will not be for creating code but for SCRUM planing.  
It should allow to freely create any kind of diagrams, drawings and stick notes (similar to whimsical, miro, or mural), this can then be used as context for the AI for SCRUM planning, epic creation, editing, etc.
It should be a space where the user can freely write all the ideas, functionalities and more, in natural language and without worrying over spending the AI tokens early, and the use it later for AI context. Discussing ideas with the AI and analyzing their own project.
Changes can then be made later to create new features or change existing plans.  

The navigation between projects is unique, the sidebar will work like a folder structure (similar to Windows Explorer or macOS Finder), where the user can create folders, and inside the folders, they can create projects, and inside the projects, they can create boards, backlogs, chats, and workspaces.  
A chat is created automatically if a team is created, else it's not necessary.  
A workspace is manually created, and can be named, the user can have as many workspaces as he desires and connect them via links.  
A project always has a boards section, where the user can see his boards inside a single view, and a backlog section, where the user can see his backlog inside a single view.  
A sprint view is where the user should be able to create and modify sprints, assigning tasks from the backlog, An sprint can be seen in the tree view as well.  
A calendar view to see the tasks due times. This one it's not optional, tasks can be created within it.  
A reports view, where the user can see reports of the projects, made by the AI or by other users, that correspond to late due dates or external issues like weather, holidays, tools, etc.  
The user can create folders, rename them, and store any amount of projects inside them. The user can have folders inside folders, but can not create folders inside projects.  
Each project has a view where statistics from the project are seen, this view is displayed when the user is inside the project but not inside a specific view.  
- The statistics should include: 
    - Sprint percentage completion
    - Amount of tasks, epics
    - Percentage of acceptance criteria completed
    - Retrospectives on last sprint
    - Report issues

## Features

### Folder Structure and Navigation
Sidebar view displaying a hierarchical, file-system-like navigation array. Users can nest folders indefinitely, and applications (projects) reside within these folders. Projects act as parents to boards, backlogs, chats, and workspaces.

**Tech needs:**
- Recursive data structures for folder architecture and API endpoints for folder/project resolution.
- Dynamic UI for expanding, collapsing, and routing through the folder tree.

### Projects Management
Core capability allowing for the configuration of a project. The user assigns team members, defines roles, establishes permissions, and accesses high-level project analytics.

**Tech needs:**
- Robust user role and permission system.
- Endpoints linking individual users, teams, and their corresponding project access levels.

### Boards
View page where the user can see different and custom boards where the Scrum tasks are displayed, each board represents a task state, the user can change color and the status board, create and delete it. All boards of a project exist in a single unified view.

**Tech needs:**
- The AI can create and manipulate boards on user input.
- The boards can be seen as a markdown file text for AI processing and human manipulation.
- Drag and drop API integration on the UI for task manipulation.

### Backlog & Tree View
A single-view representation of the project's backlog. Alongside a standard list format, it provides a distinctive interactive tree structure where tasks act as nodes, dependencies act as edges, and "bees" represent related but unlinked tasks. Node colors convey their current state.

**Tech needs:**
- Graph-based data structures on the backend to evaluate standard acyclic dependencies.
- Interactive canvas or graph visualization library for the interface.
- Serialization into Markdown.
- AI integration reading graph architecture to suggest dependency changes.

### Sprints
A dedicated interface integrating seamlessly with the Backlog tree. It allows assigning pending tasks into designated timeline-bound sprints, which update dynamic metrics dynamically.

**Tech needs:**
- A filtering architecture grouping tasks temporally. 
- Logic coupling standard tasks with timebox parameters.

### Calendar
A compulsory calendar interface capturing all task and sprint deadlines. Supports creating tasks natively within specific dates on the interface.

**Tech needs:**
- Calendar component (e.g., FullCalendar or similar) connected to task objects.
- Create/Edit form overlaid on specific day selection.

### Integrated Chat
Communication portal functioning similarly to Discord. Can include team-based and project-based groups, distinct channels, direct messaging, and voice/video features. Users working inside a project always share a single chat thread, losing access only when unassigned from the project. The "Team" entity simplifies batch assigning users to a project.

**Tech needs:**
- Real-time architecture with WebSockets or SSE for communication.
- Persistent AI context processing for each chat thread. Users can query AI acting continuously as a project member.
- Audio processing and transcription for extracting instructions/context from voice chat (pending user consent).

### Workspaces
Blank canvas area functioning as a multipurpose drawing board (similar to Miro/Whimsical) utilizing prototype diagram elements (shapes, sticky notes, drawn diagrams, text, links). Diagram structures can serve as context tools for both human and AI UI construction. Acts as a sandbox before committing resources.

**Tech needs:**
- A canvas API framework mapping positions of elements.
- An AI agent capable of scraping text and conceptual models from workspace diagrams, generating markdown outlines, and creating actual project Epics or Tasks derived from sketched ideas.

### Retrospectives
A dedicated formal view connected to sprints. Focuses on gathering team feedback and assessing performance after each sprint ends.

**Tech needs:**
- Database schema linking retrospectives directly to completed sprints.
- Form/document editors for qualitative team feedback.

### User Profiles & Roles
Classical user profile options, with the capability for a user to select one or multiple SCRUM roles in their description. This profiling is leveraged by both users and the AI assistant to automatically distribute and assign tasks effectively.

**Tech needs:**
- User profile data models mapping to standard roles (e.g., Scrum Master, Product Owner, Developer).
- AI logic to evaluate profile roles during task recommendation.

### Configuration & AI Settings
View permitting the user to navigate and configure settings, especially pertaining to the AI assistant (e.g., skills, extra context, permissions). Divided into a general settings panel for default values, and specific project settings panels for fine-tuned context control within individual projects.

**Tech needs:**
- Global and project-scoped configuration state management in the backend.
- Granular permission logic determining who can modify project-level AI settings.

### Version Control (Backlog)
Git-like version control for the backlog. Depending on permissions, users can snapshot and store a new version of the backlog. This enables reverting to earlier states in case of human error or malfunctioning AI modifications. Appears on the general project view with a modal for details.

**Tech needs:**
- Historical snapshotting logic in the database for the Backlog graph.
- Diffing mechanism to display changes between snapshots in the frontend modal.

### Statistics and Reports
The default view when a user clicks on a project, showcasing analytical data such as sprint completion, absolute task counts, criteria success rates, and externally generated AI delay reports.

**Tech needs:**
- Analytical query optimization.
- AI capabilities combining current metrics + external logic (e.g., weather analysis) to build contextual and readable disruption reports.