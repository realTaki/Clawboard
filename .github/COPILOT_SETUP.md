# GitHub Copilot Setup Documentation

## Overview

This repository is configured to work optimally with GitHub Copilot following GitHub's best practices for coding agents.

## Configuration Files

### 1. `.github/copilot-instructions.md`

The main Copilot instructions file that provides:
- **Project Overview**: Clear description of Clawboard's purpose and architecture
- **Core Technologies**: Complete tech stack (Monad, $CLAWDOGE, USDC, Moltbook, nad.fun)
- **Coding Conventions**: Detailed guidelines for:
  - General principles (security-first, clean code)
  - Smart contract development (validation, access controls, events)
  - Web3 integration (wallet states, error handling)
  - Browser extension patterns
  - Backend/leaderboard optimization
- **Key Concepts**: Domain-specific knowledge about vault tokens and incentive mechanisms
- **Testing Priorities**: Security, transaction flows, edge cases
- **Common Pitfalls**: Specific errors to avoid (transfer tax, vault ratios, MEV attacks)
- **Language Conventions**: Bilingual approach with Chinese for contract comments, English for general code

### 2. `.gitattributes`

Ensures proper file type handling for Copilot code review:
```
*.log text
```

This configuration ensures log files and other text-based files are properly recognized for code review.

## How Copilot Uses These Instructions

GitHub Copilot automatically reads `.github/copilot-instructions.md` when:
- Generating code suggestions in your IDE
- Providing code completions
- Reviewing pull requests
- Answering questions about the codebase

The instructions help Copilot:
- Generate code that follows project conventions
- Suggest appropriate patterns for different components
- Avoid common mistakes specific to this project
- Understand the economic and token mechanics unique to Clawboard

## Best Practices Implemented

✅ **Comprehensive Context**: Detailed project overview and architecture  
✅ **Specific Conventions**: Clear coding standards for each component type  
✅ **Security Focus**: Emphasis on smart contract security and Web3 best practices  
✅ **Domain Knowledge**: Explanation of unique concepts (vault tokens, incentive-as-learning-signal)  
✅ **Common Pitfalls**: Explicit warnings about frequent errors  
✅ **File Type Handling**: Proper `.gitattributes` configuration for code review  
✅ **Maintenance Guidelines**: Instructions for keeping the file up-to-date  
✅ **Bilingual Support**: Clear language conventions for mixed English/Chinese codebase

## Maintaining Copilot Instructions

The instructions should be updated when:
- New architectural components are added (e.g., new smart contracts, services)
- Coding standards change (e.g., adopting new libraries, patterns)
- Security issues are discovered (add to Common Pitfalls)
- Development workflows change (e.g., new testing procedures)
- Domain concepts evolve (e.g., new token mechanics)

## Testing Copilot Integration

To verify Copilot is using your instructions:
1. Open any file in your IDE with Copilot enabled
2. Start typing a comment or function related to the project
3. Check if suggestions align with conventions in copilot-instructions.md
4. For PR reviews, verify Copilot reviews consider project-specific context

## Resources

- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
- [Best Practices for Copilot Coding Agents](https://gh.io/copilot-coding-agent-tips)
- [Git Attributes Documentation](https://git-scm.com/docs/gitattributes)

## Questions or Issues?

If Copilot is not following the instructions or you need to add new conventions, please:
1. Review `.github/copilot-instructions.md` for accuracy
2. Update conventions as needed
3. Test with actual code generation
4. Document significant changes in commit messages
