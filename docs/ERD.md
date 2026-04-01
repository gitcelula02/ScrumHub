# Entity-Relationship Diagram
## Entities

### User
**id**: Int
    - Primary Key
**username**: String
    - Unique
**email**: String
    - Unique
**password**: String
    - Hashed
**role**: String
    - Admin, User, Guest

### Task
**id**: Int
    - Primary Key
**title**: String
**description**: String
**status**: String
    - To Do, In Progress, Done
**priority**: String
    - Low, Medium, High
**due_date**: Date
**assignee_id**: Int
    - Foreign Key to User
**reporter_id**: Int
    - Foreign Key to User
**project_id**: Int
    - Foreign Key to Project

### Comment
**id**: Int
    - Primary Key
**user_id**: Int
    - Foreign Key to User
**task_id**: Int
    - Foreign Key to Task
**comment**: String
    - Comment text

### Project
**id**: Int
    - Primary Key
**name**: String
**description**: String
**status**: String
    - To Do, In Progress, Done
**priority**: String
    - Low, Medium, High
**due_date**: Date
**assignee_id**: Int
    - Foreign Key to User
**reporter_id**: Int
    - Foreign Key to User

### Epic
**id**: Int
    - Primary Key
**name**: String
**description**: String
**status**: String
    - To Do, In Progress, Done
**priority**: String
    - Low, Medium, High
**due_date**: Date
**assignee_id**: Int
    - Foreign Key to User
**reporter_id**: Int
    - Foreign Key to User
**project_id**: Int
    - Foreign Key to Project

### User Story
**id**: Int
    - Primary Key
**name**: String
**description**: String
**status**: String
    - To Do, In Progress, Done
**priority**: String
    - Low, Medium, High
**due_date**: Date
**assignee_id**: Int
    - Foreign Key to User
**reporter_id**: Int
    - Foreign Key to User
**project_id**: Int
    - Foreign Key to Project
**epic_id**: Int
    - Foreign Key to Epic

### Acceptance Criteria
**id**: Int
    - Primary Key
**name**: String
**description**: String
**status**: String
    - To Do, In Progress, Done
**priority**: String
    - Low, Medium, High
**due_date**: Date
**assignee_id**: Int
    - Foreign Key to User
**reporter_id**: Int
    - Foreign Key to User
**project_id**: Int
    - Foreign Key to Project
**epic_id**: Int
    - Foreign Key to Epic
**user_story_id**: Int
    - Foreign Key to User Story

### Sprint
**id**: Int
    - Primary Key
**name**: String
**description**: String
**status**: String
    - To Do, In Progress, Done
**priority**: String
    - Low, Medium, High
**due_date**: Date
**start_date**: Date
**assignee_id**: Int
    - Foreign Key to User
**reporter_id**: Int
    - Foreign Key to User
**project_id**: Int
    - Foreign Key to Project`


## Diagram
