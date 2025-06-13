# Orchestrator Pattern

Split complex tasks into independent subtasks and execute them in parallel with minimal memory usage.

## Usage
```
/orchestrator [describe what you want to accomplish]
```

Automatically breaks down complex requests into parallel/sequential subtasks for faster execution.

### Examples
- `/orchestrator analyze code quality and list improvements`
- `/orchestrator implement JWT authentication with role management`  
- `/orchestrator run tests, lint, typecheck and fix all errors`
- `/orchestrator optimize React app performance`
- `/orchestrator prepare production deployment`

The orchestrator automatically determines task complexity, identifies dependencies, and executes optimal parallel/sequential strategy.

## Process

### 1. Analyze and Plan
- Break down the main task into 3-5 independent subtasks
- Identify minimal context needed for each subtask
- Define clear success criteria for each

### 2. Execute Subtasks
- Use Task tool to spawn independent agents
- Provide only essential context to each agent
- Request concise summary (100-200 words) as output
- Execute multiple tasks in parallel when possible

### 3. Aggregate Results
- Collect summaries from all subtasks
- Synthesize final result based on subtask outputs
- Report overall progress and completion status

## Example Usage

When given a complex refactoring task:
- Subtask 1: Analyze current code structure (summary only)
- Subtask 2: Identify refactoring targets (list only)
- Subtask 3: Check test coverage (percentage and critical paths)
- Subtask 4: Validate dependencies (compatibility matrix)

Each agent returns only essential findings, preventing memory overflow while maintaining task completeness.

## Sequential Execution Pattern

For complex tasks with dependencies, split into sequential steps:

### 1. Initial Analysis
- Analyze the entire task to understand scope and requirements
- Identify dependencies and execution order
- Plan sequential steps based on dependencies

### 2. Step Planning
- Break down into 2-4 sequential steps
- Each step can contain multiple parallel subtasks
- Define what context from previous steps is needed

### 3. Step-by-Step Execution
- Execute all subtasks within a step in parallel
- Wait for all subtasks in current step to complete
- Pass relevant results to next step
- Request concise summaries (100-200 words) from each subtask

### 4. Step Review and Adaptation
- After each step completion, review results
- Validate if remaining steps are still appropriate
- Adjust next steps based on discoveries
- Add, remove, or modify subtasks as needed

## Key Benefits

- **Memory Optimization**: Prevents memory exhaustion on long-running tasks
- **Parallel Efficiency**: Enables parallel execution for faster completion
- **Clear Boundaries**: Maintains clear task boundaries and responsibilities
- **Structured Progress**: Provides structured progress tracking
- **Sequential Logic**: Steps execute in order, allowing later steps to use earlier results
- **Progressive Understanding**: Build knowledge incrementally across steps

## Implementation Notes

- Always start with a single analysis task to understand the full scope
- Group related parallel tasks within the same step
- Pass only essential findings between steps (summaries, not full output)
- Use TodoWrite to track both steps and subtasks for visibility
- After each step, explicitly reconsider the plan:
  - Are the next steps still relevant?
  - Did we discover something that requires new tasks?
  - Can we skip or simplify upcoming steps?
  - Should we add new validation steps?