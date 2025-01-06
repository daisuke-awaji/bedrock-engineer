# Agent Directory

This directory contains the definitions of all available AI agents in the system. Each agent is defined in its own file to make it easier for contributors to add new agents or modify existing ones.

## Adding a New Agent

To add a new agent:

1. Create a new file in this directory with the format `your-agent-name.ts`
2. Define your agent using the `Agent` type
3. Export your agent
4. Add your agent to the exports in `index.ts`

Example:

```typescript
import { Agent } from '@renderer/types/agent'

export const YourAgent: Agent = {
  id: 'your-agent-id',
  title: 'Your Agent Title',
  tags: ['tag1', 'tag2'],
  systemPrompt: `Your system prompt here...`,
  author: {
    name: 'Your Name',
    url: 'https://github.com/your-username',
    avatar: 'https://avatars.githubusercontent.com/u/your-id?v=4'
  }
}
```

## Agent Properties

- `id`: Unique identifier for the agent
- `title`: Display name of the agent
- `tags`: Array of relevant tags for filtering
- `systemPrompt`: The system prompt that defines the agent's behavior
- `author`: Information about the agent's creator
  - `name`: Author's name
  - `url`: Link to author's profile
  - `avatar`: URL to author's avatar image

## Guidelines

1. Keep system prompts focused and specific
2. Use clear and descriptive tags
3. Test your agent before submitting
4. Include real author information
5. Follow the existing code style