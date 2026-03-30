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
Different that other applications, ScrumHub must have the capacity to represent the information and task inside the boards and backlog differently, concretely, the workflow must be represented on a tree structure, where each node is a task, and the edges are the dependencies between tasks. There may be bees, that can represent tasks that have not real dependencies, but are related to one or more branches.  

Following the All-in-one place philosophy, the application should have a chat feature, where the user can create and manage group chats for projects or teams (Where teams group chat may include the context of all projects the Team is in), and also direct messages between users.  
The chat groups can be managed like discord, where different channels and roles can be created, along with voice chat channels. All of it must be connected to the AI the following manner:  

- The users can call the AI inside the chat, and the AI will respond to the user, with the context of the chat and more importantly, the project context.  
This means that the AI must have access to the project's tasks, backlog, and board, and must be able to answer questions about them, and also suggest changes, like creating new tasks, moving tasks between boards, or changing the dependencies between tasks.  
- The AI can also be used to generate reports, summaries, or any other kind of information related to the project, based on the data in the database.  
- The AI can interpret and extract information from the voice chat (Only if allowed by the user) and create tasks or generate reports based on the conversation.  

Naturally, as GitHub, the application should have a workspace, where the user can generate code or review it based on the project context.  
This workspace should be connected to the AI, so that the user can ask the AI to generate code, review it, or suggest changes, based on the project context.  

## Features

### Boards
- [ ] Create and manage boards
    - [ ] Manage boards encapsulation
        - [ ] Folder
        - [ ] Categories
        - [ ] Tags
        - [ ] Teams/Team members
        - [ ] Local/cloud
    - [ ] Create boards
    - [ ] Edit boards
    - [ ] Delete boards
    - [ ] Manage board's columns
    - [ ] Manage board's tasks
    - [ ] Manage board's users
    - [ ] Manage board's permissions
    - [ ] Manage board's AI
- [ ] Create and manage boards with AI
    - [ ] AI created boards
    - [ ] AI boards review
    - [ ] AI boards editing
    - [ ] AI boards deletion
    - [ ] AI boards permissions
    - [ ] AI boards AI

### Backlog
- [ ] Create and manage backlog
    - [ ] Manage backlog encapsulation
        - [ ] Folder
        - [ ] Categories
        - [ ] Tags
        - [ ] Teams/Team members
        - [ ] Local/cloud
    - [ ] Create backlog
    - [ ] Edit backlog
    - [ ] Delete backlog
    - [ ] Manage backlog's columns
    - [ ] Manage backlog's tasks
    - [ ] Manage backlog's users
    - [ ] Manage backlog's permissions
    - [ ] Manage backlog's AI
    - [ ] backlog tree structure
    - [ ] backlog tree structure visualization
    - [ ] backlog tree structure editing
    - [ ] backlog tree structure deletion
    - [ ] backlog tree structure permissions
    - [ ] backlog tree structure AI

### Chat
- [ ] Create and manage chat
    - [ ] Manage chat encapsulation
        - [ ] Folder
        - [ ] Categories
        - [ ] Tags
        - [ ] Teams/Team members
        - [ ] Local/cloud
        - [ ] Board and backlogs context
        - [ ] AI context
    - [ ] Create chat
    - [ ] Edit chat
    - [ ] Delete chat
    - [ ] Manage chat's columns
    - [ ] Manage chat's tasks
    - [ ] Manage chat's users
    - [ ] Manage chat's permissions
    - [ ] Manage chat's AI
    - [ ] Manage chat's voice chat
    - [ ] Manage chat's video chat
    - [ ] Manage chat's screen sharing
    - [ ] Manage chat's file sharing
    - [ ] Manage chat's roles
