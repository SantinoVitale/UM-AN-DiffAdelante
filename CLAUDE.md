# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Setup Commands

This repository contains a simple static website with HTML, CSS, and JavaScript files. To view the project:

1. Open `index.html` in any web browser
2. For development, you can use a simple HTTP server (e.g., `python -m http.server` or `npx serve`) to avoid CORS issues when loading external resources

No build tools, package managers, or test frameworks are currently configured. As the project evolves, consider adding:
- A linting tool (e.g., ESLint for JavaScript, Stylelint for CSS)
- A testing framework (e.g., Jest for JavaScript unit tests)
- A build process for optimization and deployment

## Architecture Overview

The project follows a simple client-side web structure:

- `index.html`: Main HTML document containing the rainbow title header
- `css/style.css`: Stylesheet defining the rainbow title animation and visual effects
- `js/index.js`: Currently empty JavaScript file for future interactivity
- `ref/`: Directory containing reference documents (PDF and DOCX files) related to differentiation ahead
- `.git/`: Git repository metadata
- `.claude/`: Claude Code configuration directory (contains settings.local.json)

The frontend consists of a single HTML page with CSS animations for visual appeal. JavaScript is planned for future interactive features.

## Workflow Guidelines

Follow this plan-execute-review workflow for all development tasks:

1. **Plan Mode**: Before writing any code, use `/plan` mode to:
   - Understand requirements and constraints
   - Explore existing code patterns
   - Design implementation approach
   - Create detailed implementation plan
   - Exit plan mode for user approval

2. **Execute Phase**: Implement the approved plan by:
   - Writing code following existing patterns
   - Making focused, incremental changes
   - Regularly testing in browser
   - Committing changes with descriptive messages

3. **Review Phase**: After implementation, conduct review by:
   - Self-reviewing code for correctness and style
   - Running any validation checks (see Custom Commands below)
   - Preparing for potential code review
   - Using `/clear` between tasks to maintain clean context

## Custom Commands and Automation

Set up these customized workflows for efficiency:

### Predefined Command Aliases
Create shortcuts for repetitive operations in your shell or Claude Code settings:
- `cls`: Clear terminal screen and reset context (equivalent to `/clear`)
- `v`: View current project status (`git status` + file structure)
- `t`: Run test suite (to be implemented when tests are added)
- `l`: Run linter (to be implemented when linting is configured)

### Custom Skill/Workflow Creation
Develop reusable skills for common tasks:
- **Validation Loop Skill**: Create a skill that runs validation checks between development phases
- **Review Assistant Skill**: Automate common review tasks (checking syntax, formatting, etc.)
- **Deployment Prep Skill**: Automate steps needed before deployment (optimization, asset optimization)

### Sub-Agent Sessions for Parallel Work
Use EnterWorktree tool to create isolated workspaces for:
- Feature development (separate from main branch)
- Experimental spikes or prototypes
- Documentation writing
- Bug fixes requiring isolation

Each worktree provides a clean environment while sharing the same repository base.

### Validation Loops
Set up automated validation using:
- `/loop` command for recurring checks (e.g., every 5 minutes run linting/tests)
- Custom skills that trigger validation on file save or commit
- Pre-commit hooks to prevent invalid code from being committed

Remember to always follow the plan-execute-review flow and maintain clear separation between phases.
