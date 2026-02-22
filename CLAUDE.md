# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a **static documentation archive** of system prompts, tool configurations, and model instructions from various AI coding assistants and platforms. It is forked/sourced from `x1xhlol/system-prompts-and-models-of-ai-tools`. There is no build system, no tests, and no application code — only text-based documentation files.

## Structure

Each top-level directory corresponds to a specific AI tool or platform (e.g., `Anthropic/`, `Cursor Prompts/`, `Windsurf/`, `Replit/`). Within each directory:

- **Prompt.txt** — The system prompt given to the AI model
- **Tools.json** — Tool/function definitions available to the model
- Some directories have variant names (e.g., `Agent Prompt.txt`, `Chat Prompt.txt`, `Builder Prompt.txt`)

The `Open Source prompts/` directory groups prompts from open-source tools (Bolt, Cline, Codex CLI, Gemini CLI, Lumo, RooCode).

## File Types

- `.txt` files — System prompts and instructions (plain text, often very long)
- `.json` files — Tool schemas and configurations
- `.yaml` files — Structured prompt configurations (found in `Amp/`)
- `.md` files — README documentation
- `.png` files — Screenshots and logos (in `assets/`)

## Working with This Repository

- **No build/test/lint commands exist.** Changes are purely content additions or edits to text files.
- When adding a new AI tool's prompts, create a new top-level directory named after the tool and place `Prompt.txt` and/or `Tools.json` inside it.
- Directory names use the tool's display name with spaces (e.g., `Augment Code`, `CodeBuddy Prompts`, `Manus Agent Tools & Prompt`).
- Licensed under GNU GPL v3 (`LICENSE.md`).
