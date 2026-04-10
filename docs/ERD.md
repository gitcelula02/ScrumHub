# Entity-Relationship Diagram
## Entities

### User
**ID**: INT
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
**ID**: INT
    - Primary Key
**title**: String
**description**: String
**status**: String
    - To Do, In Progress, Done
**priority**: String
    - Low, Medium, High
**due_date**: Date
**assignee_id**: INT
    - Foreign Key to User
**reporter_id**: INT
    - Foreign Key to User
**project_id**: INT
    - Foreign Key to Project

### Comment
**ID**: INT
    - Primary Key
**user_id**: INT
    - Foreign Key to User
**task_id**: INT
    - Foreign Key to Task
**comment**: String
    - Comment text

### Project
**ID**: INT
    - Primary Key
**name**: String
**description**: String
**status**: String
    - To Do, In Progress, Done
**priority**: String
    - Low, Medium, High
**due_date**: Date
**assignee_id**: INT
    - Foreign Key to User
**reporter_id**: INT
    - Foreign Key to User

### Epic
**ID**: INT
    - Primary Key
**name**: String
**description**: String
**status**: String
    - To Do, In Progress, Done
**priority**: String
    - Low, Medium, High
**due_date**: Date
**assignee_id**: INT
    - Foreign Key to User
**reporter_id**: INT
    - Foreign Key to User
**project_id**: INT
    - Foreign Key to Project

### User Story
**ID**: INT
    - Primary Key
**name**: String
**description**: String
**status**: String
    - To Do, In Progress, Done
**priority**: String
    - Low, Medium, High
**due_date**: Date
**assignee_id**: INT
    - Foreign Key to User
**reporter_id**: INT
    - Foreign Key to User
**project_id**: INT
    - Foreign Key to Project
**epic_id**: INT
    - Foreign Key to Epic

### Acceptance Criteria
**ID**: INT
    - Primary Key
**name**: String
**description**: String
**status**: String
    - To Do, In Progress, Done
**priority**: String
    - Low, Medium, High
**due_date**: Date
**assignee_id**: INT
    - Foreign Key to User
**reporter_id**: INT
    - Foreign Key to User
**project_id**: INT
    - Foreign Key to Project
**epic_id**: INT
    - Foreign Key to Epic
**user_story_id**: INT
    - Foreign Key to User Story

### Sprint
**ID**: INT
    - Primary Key
**name**: String
**description**: String
**status**: String
    - To Do, In Progress, Done
**priority**: String
    - Low, Medium, High
**due_date**: Date
**start_date**: Date
**assignee_id**: INT
    - Foreign Key to User
**reporter_id**: INT
    - Foreign Key to User
**project_id**: INT
    - Foreign Key to Project`


## Diagram
