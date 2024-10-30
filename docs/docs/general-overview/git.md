# Git

Efficient teamwork relies heavily on mastering Git and GitHub. Below is an overview of our Git workflows, branching strategies, and essential best practices to ensure smooth collaboration within our team of multiple developers.

## Getting Started with Git

If you're new to Git or need a refresher, please watch the following tutorials:

- **Git Basics:** [freeCodeCamp.org Git Tutorial](https://www.youtube.com/watch?v=RGOj5yH7evk&ab_channel=freeCodeCamp.org)
- **Resolving Conflicts:** [CarmelleCodes Conflict Resolution](https://www.youtube.com/watch?v=QmKdodJU-js&t=23s&ab_channel=CarmelleCodes)
- **Opening Pull Requests:** [Jake Vanderplas PR Tutorial](https://www.youtube.com/watch?v=rgbCcBNZcdQ&ab_channel=JakeVanderplas)

## Branching Strategies

We primarily use two branching strategies:

1. **Task-Based Workflow** (Default)
2. **Structured Feature Branch Workflow** (Used on a case-by-case basis)

Both strategies ensure isolated development and a clean Git history, but they differ in scope and structure. Our default strategy is to **rebase on pull** to maintain a clean and linear project history.

### Task-Based Workflow (Default)

This is our default branching strategy. To summarize, you branch off of `master`, create a new branch for your task, and open a PR against the feature branch you just created.

1. **Start from `master`:**

   - Ensure you're on the `master` branch before creating a new branch.
   - Sync your local `master` with the remote `master` by running:
     ```bash
     git pull origin master
     ```

2. **Create a New Task-Specific Branch:**

   - Use the following naming convention:
     ```
     STP-TASKIDFROMJIRA-CARDNAMEFROMJIRA
     ```
     _Example:_ `STP-13-task-name-here`

3. **Install Dependencies:**

   - Run the following command to sync dependencies and set up configurations:
     ```bash
     yarn install
     ```

4. **Begin Development:**

   - Work on your task within the newly created branch.

5. **Open PR Against Feature Branch:**
   - Once the task is complete, open a PR against the feature branch you created.

### Structured Feature Branch Workflow (Case-by-Case)

The **Structured Feature Branch Workflow** is used for larger, more complex features that require additional structure and organization.

#### Why Feature Branches Are Important

Feature branches allow for isolated development of specific tasks or features, keeping the `master` or `main` branch clean and free of unfinished code. This reduces the risk of bugs and ensures stability in the main codebase.

By using feature branches:

- **Isolated Development:** You can work on a feature independently, reducing the likelihood of conflicts.
- **Parallel Workflows:** Multiple developers can work on different features simultaneously.
- **Safe Integration:** Features are integrated only when they are complete and tested.

#### Naming Convention for Feature Branches

To maintain consistency, we use the following naming convention for feature branches:

```
STP-FEAT-feature-name-here
```

_Example:_ `STP-FEAT-dashboard-page`

- **STP:** Represents the project or team abbreviation.
- **FEAT:** Denotes that this branch is for a feature.
- **feature-name-here:** A brief, descriptive name that identifies the feature.

#### How to Use Feature Branches Effectively

1. **Create the Branch:**

   - When starting a new feature, create a branch using the naming convention.
   - This allows you to track progress without merging unfinished code into `master`.

2. **Open PR Against Feature Branch:**
   - After completing your task (e.g., `STP-123-my-task-here`), open a PR against the feature branch (e.g., `STP-FEAT-my-feature-here`), not directly against `master`. This keeps feature development isolated until it's ready for merging.

### Commit and Pull Requests

- **Rebase on Pull:**

  - Our default strategy when pulling changes is to rebase to maintain a linear commit history.

- **Opening Pull Requests (PRs):**
  - Follow the [PR Tutorial](https://www.youtube.com/watch?v=rgbCcBNZcdQ&ab_channel=JakeVanderplas) for detailed guidance.
  - Ensure your PR is complete before requesting a merge to protect the codebase from incomplete or unstable code.

### Best Practices and Team Accountability

1. **Task Ownership:**

   - You are responsible for your task and associated PRs. If bugs arise, you must address and fix them.

2. **Seeking Help:**

   - While you are accountable for your tasks, don’t hesitate to ask for assistance when needed.

3. **Handling Blockers:**

   - If you encounter a "blocker" task that delays others, notify the team immediately so we can reassign resources if needed.

4. **Complete Task Objectives:**
   - PRs should only be merged once the entire task objective is achieved to ensure the codebase remains stable and complete.

### Code Review Process

- **Self-Review:**

  - Before assigning reviewers, perform a thorough review of your own code. This can often help identify basic bugs.

- **Peer Review:**
  - After self-review, assign your PR to team members for peer review to ensure code quality and consistency.

By adhering to these guidelines, we can maintain a high standard of code quality and efficient collaboration within our team.
