---
name: planning
description: 'Decompose tasks into verified steps with acceptance criteria and checkpoint-driven execution.'
---

## **Skill: Structured Implementation Planning & Execution**

### **Core Philosophy**
Never execute a full task in one pass. Decompose, plan, verify, checkpoint. Context is expensive and fragile—write the plan down, execute against it, validate against acceptance criteria, and only then proceed.

---

### **Phase 1: Task Decomposition & Plan Creation**

**When you receive any non-trivial task (anything requiring more than 3 distinct actions or 10 minutes of work), STOP. Do not begin implementation.**

Instead, execute this decomposition protocol:

```
1. ANALYZE the request. Identify:
   - The final deliverable/output
   - Implicit constraints (time, format, dependencies)
   - Risks or ambiguous requirements
   
2. DECOMPOSE into atomic steps. Each step must:
   - Be independently completable
   - Produce a verifiable artifact (code, text, data, file)
   - Take no more than 15-20 minutes of work
   - Have zero hidden dependencies on future steps

3. For each step, define ACCEPTANCE CRITERIA:
   - Concrete: "Function X returns Y when given Z"
   - Observable: Can be verified by inspection or test
   - Binary: Either met or not met—no "mostly done"
   - Minimum 2 criteria per step, ideally 3-5

4. Write the IMPLEMENTATION PLAN as a structured document:
   - Step ID (e.g., S1, S2)
   - Description
   - Acceptance Criteria (numbered AC1.1, AC1.2...)
   - Dependencies (which steps must complete first)
   - Estimated effort
   - Current Status: [NOT_STARTED / IN_PROGRESS / UNDER_REVIEW / COMPLETE]
```

**Example Plan Format:**
```markdown
## Implementation Plan: [Task Name]

**S1: Setup Project Structure**
- Description: Initialize directory, config files, and dependencies
- Acceptance Criteria:
  - AC1.1: `package.json` exists with all required dependencies listed
  - AC1.2: `src/` directory contains `index.js`, `utils/`, `tests/`
  - AC1.3: `npm test` runs without errors (even if 0 tests)
- Dependencies: None
- Status: NOT_STARTED

**S2: Implement Core Parser**
- Description: Build the input parsing module
- Acceptance Criteria:
  - AC2.1: Handles valid input without throwing
  - AC2.2: Returns specific error for malformed input (test with 3 bad cases)
  - AC2.3: Output schema matches specification document
- Dependencies: S1
- Status: NOT_STARTED
```

---

### **Phase 2: Step Execution with Verification Loop**

**For each step, follow this exact sequence:**

```
STEP_EXECUTION_PROTOCOL:

1. SELECT the next unblocked step (all dependencies COMPLETE)
2. ANNOUNCE: "Executing Step [ID]: [Brief Description]"
3. IMPLEMENT the step to the best of your ability
4. SELF-VERIFY against ALL acceptance criteria:
   - Check AC1: [PASS / FAIL] — Evidence: [what you checked]
   - Check AC2: [PASS / FAIL] — Evidence: [what you checked]
   - ...
5. IF any criterion FAILS:
   - Do NOT proceed
   - Report: "Step [ID] self-verification failed. Issues: [list]"
   - Ask user: "Should I retry this step, or modify the acceptance criteria?"
   - WAIT for user response
6. IF all criteria PASS:
   - Report: "Step [ID] complete. Acceptance criteria verified."
   - Present evidence (code snippets, test output, file contents)
   - Ask user: "Please review and confirm this step is complete, or flag issues."
   - WAIT for explicit user confirmation
7. ONLY AFTER user confirmation:
   - Mark step status: COMPLETE
   - Proceed to next unblocked step
```

---

### **Phase 3: Human Checkpoint Rules**

**Mandatory user checkpoints occur at:**

| Trigger | Action Required |
|--------|-----------------|
| Plan first created | User must approve/revise the implementation plan before any execution |
| After each step completes | User must confirm acceptance criteria are met |
| Before any step with HIGH_RISK tag | Extra confirmation required |
| If acceptance criteria need mid-step modification