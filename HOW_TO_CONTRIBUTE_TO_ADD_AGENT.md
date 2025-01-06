# How to Contribute to Agent Directory

Thank you for your interest in contributing to our Agent Directory! This guide will help you understand how to add or modify AI agents in our system.

## Getting Started

1. Fork the repository
2. Clone your forked repository
3. Create a new branch for your contribution
4. Make your changes
5. Submit a Pull Request

## Adding a New Agent

### 1. Create a New File

Create a new TypeScript file in the `agents` directory with a descriptive name:

```bash
src/renderer/src/pages/AgentDirectoryPage/agents/your-agent-name.ts
```

### 2. Implement Your Agent

Use this template for your agent implementation:

```typescript
import { Agent } from '@renderer/types/agent'

export const YourAgent: Agent = {
  id: 'unique-agent-id',
  title: 'Your Agent Title',
  tags: ['relevant', 'tags', 'here'],
  systemPrompt: `Detailed system prompt that defines your agent's behavior and capabilities.
- Key areas of expertise
- Specific capabilities
- Important guidelines

Current project path: {{projectPath}}
Current date: {{date}}

You can:
1. First capability
2. Second capability
3. Third capability`,
  author: {
    name: 'Your Name',
    url: 'https://github.com/your-username',
    avatar: 'https://avatars.githubusercontent.com/u/your-id?v=4'
  }
}
```

### 3. Add to Index

Add your agent to \`index.ts\`:

```typescript
import { YourAgent } from './your-agent-name'

export const Agents = [
  // ... existing agents ...
  YourAgent
]
```

## Guidelines for Creating Agents

### System Prompt Guidelines

1. **Be Specific**: Clearly define the agent's expertise and limitations
2. **Structure**: Use bullet points and numbered lists for clarity
3. **Include Variables**: Use \`{{projectPath}}\` and \`{{date}}\` where appropriate
4. **Focus**: Keep the prompt focused on a specific domain or skill set
5. **Length**: Aim for comprehensive but concise prompts (200-500 words)

### Tags Guidelines

1. **Relevance**: Use tags that accurately describe the agent's capabilities
2. **Consistency**: Check existing tags and reuse where appropriate
3. **Quantity**: Use 2-4 tags per agent
4. **Format**: Use singular form for consistency (e.g., 'Web' not 'Webs')

### Testing Your Agent

1. Run the application locally
2. Test your agent with various prompts
3. Verify search functionality works with your agent's content
4. Check tag filtering works correctly
5. Ensure dark/light mode compatibility

## Quality Checklist

Before submitting your PR, ensure:

- [ ] Agent ID is unique
- [ ] Title is clear and descriptive
- [ ] Tags are appropriate and consistent
- [ ] System prompt is well-structured and comprehensive
- [ ] Author information is complete
- [ ] Code follows TypeScript best practices
- [ ] No linting errors (\`npm run lint\`)
- [ ] No type errors (\`npm run typecheck\`)

## Review Process

1. Submit your Pull Request
2. Address any automated check failures
3. Wait for maintainer review
4. Address any feedback
5. Your contribution will be merged once approved

## Additional Information

- Maintainers review PRs within 1-2 business days
- For major changes, open an issue first
- Follow the existing code style
- Update tests if necessary
- Keep commits atomic and well-documented

## Need Help?

- Open an issue for questions
- Join our community Discord for discussions
- Read our [Code of Conduct](./CODE_OF_CONDUCT.md)

Thank you for contributing to making our Agent Directory better! 🎉