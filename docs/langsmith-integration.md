# Langsmith Integration Guide

## Overview

Langsmith provides comprehensive tracing and monitoring for LLM applications, enabling detailed observability of AI interactions, performance metrics, and error tracking.

## Setup

### Environment Configuration

Add the following environment variables to your `.env` file:

```bash
# Langsmith Configuration
ANTHROPIC_API_KEY=your_anthropic_key_here
LANGSMITH_API_KEY=your_langsmith_key_here
LANGSMITH_PROJECT=compilar-v0.5
LANGSMITH_TRACING=true
```

### API Key Setup

1. **Anthropic API Key**: Obtain from [Anthropic Console](https://console.anthropic.com/)
2. **Langsmith API Key**: Obtain from [Langsmith Dashboard](https://smith.langchain.com/)

## Architecture

### Tracing Hierarchy

```
┌─ LLM Service (Chain Level)
│  ├─ Chat Completion (Chain)
│  ├─ Streaming Chat (Chain)
│  ├─ Embeddings (LLM)
│  └─ Batch Embeddings (Chain)
│
├─ Provider Level (LLM Level)
│  ├─ OpenAI Provider
│  │  ├─ Chat (LLM)
│  │  ├─ Stream (LLM)
│  │  └─ Embed (LLM)
│  └─ Anthropic Provider
│     ├─ Chat (LLM)
│     └─ Stream (LLM)
│
└─ Application Level (Chain Level)
   ├─ Coaching Service
   ├─ Assessment Service
   └─ RAG Service
```

### Trace Types

- **Chain**: Multi-step operations, service-level methods
- **LLM**: Direct provider API calls
- **Tool**: External tool or API usage

## Trace Metadata

All traces include comprehensive metadata for analysis:

### Standard Metadata
```typescript
{
  user_id: string,           // User identifier
  session_id: string,        // Session tracking
  feature: string,           // Feature type (assessment_coaching, chatbot, etc.)
  pillar: string,            // Assessment pillar (if applicable)
  mode: string,              // egalitarian/hierarchical
  conversation_id: string,   // Chat conversation tracking
  assessment_id: string,     // Assessment identifier
  provider: string,          // LLM provider (openai/anthropic)
  task: string,              // Task type (chat, embed, stream)
  timestamp: string,         // ISO timestamp
  model: string,             // Model name
  message_count: number,     // Number of messages
  text_length: number        // Text length for embeddings
}
```

### Feature-Specific Metadata

**Assessment Coaching**:
```typescript
{
  feature: 'assessment_coaching',
  pillar: 'leadership' | 'communication' | etc.,
  mode: 'egalitarian' | 'hierarchical',
  assessment_id: string
}
```

**Chatbot Conversations**:
```typescript
{
  feature: 'chatbot',
  conversation_id: string,
  message_count: number
}
```

**RAG Queries**:
```typescript
{
  feature: 'rag_query',
  query_length: number,
  results_count: number
}
```

## Monitoring Dashboard

### Accessing Langsmith

1. Visit [Langsmith Dashboard](https://smith.langchain.com)
2. Select project: `compilar-v0.5`
3. View traces in real-time

### Key Metrics to Monitor

#### Performance Metrics
- **Response Time**: Average time per request
- **Token Usage**: Input/output tokens consumed
- **Error Rate**: Failed request percentage
- **Provider Distribution**: OpenAI vs Anthropic usage

#### Quality Metrics
- **Trace Completeness**: Percentage of operations traced
- **Metadata Accuracy**: Correct feature/pillar attribution
- **Error Classification**: Types of failures occurring

#### User Experience
- **Conversation Length**: Average messages per session
- **Feature Usage**: Which AI features are most used
- **Error Impact**: How errors affect user experience

## Best Practices

### Trace Naming
- Use descriptive, consistent names
- Include provider and operation type
- Follow pattern: `{provider}_{operation}_{type}`

### Metadata Enrichment
- Always include user_id for user-level analysis
- Add feature context for business metrics
- Include performance data for optimization

### Error Handling
- Ensure errors are properly traced
- Include error context in metadata
- Don't break user flow for tracing failures

### Performance Considerations
- Tracing adds minimal overhead (~10-50ms)
- Asynchronous trace submission
- Configurable enable/disable via environment

## Troubleshooting

### Common Issues

#### Traces Not Appearing
- Check `LANGSMITH_API_KEY` is set correctly
- Verify `LANGSMITH_TRACING=true`
- Check network connectivity to Langsmith

#### Missing Metadata
- Ensure metadata objects are properly passed
- Check for null/undefined values
- Verify metadata structure matches expectations

#### Performance Impact
- Monitor response time degradation
- Consider sampling for high-volume operations
- Use environment flag to disable in production if needed

### Debug Mode

Enable debug logging:
```bash
DEBUG=langsmith:* npm run dev
```

## Integration Examples

### Basic Chat Tracing
```typescript
import { traceable } from "langsmith/traceable";

const chatWithTracing = traceable(
  async (messages, metadata) => {
    // Your chat logic here
    return response;
  },
  {
    name: "chat_completion",
    run_type: "chain",
    metadata: {
      user_id: metadata.userId,
      feature: "chatbot",
      message_count: messages.length
    }
  }
);
```

### Provider-Level Tracing
```typescript
const tracedProviderCall = traceable(
  async () => {
    // Direct API call to provider
    return apiResponse;
  },
  {
    name: "openai_chat",
    run_type: "llm",
    metadata: {
      model: "gpt-4-turbo",
      temperature: 0.7,
      user_id: context.userId
    }
  }
);
```

## API Reference

### Traceable Function
```typescript
traceable<T>(
  func: (...args: any[]) => T,
  config: {
    name: string;
    run_type: "chain" | "llm" | "tool";
    metadata?: Record<string, any>;
  }
): T
```

### Configuration Options
- `name`: Unique trace identifier
- `run_type`: Type of operation
- `metadata`: Additional context data

## Future Enhancements

### Planned Features
- **Custom Dashboards**: Application-specific metrics
- **Alerting**: Automated error notifications
- **A/B Testing**: Model performance comparison
- **Cost Tracking**: API usage cost analysis
- **User Journey Mapping**: End-to-end user flow tracing

### Advanced Analytics
- **Performance Regression Detection**
- **Automated Model Selection**
- **User Behavior Pattern Analysis**
- **Content Quality Scoring**

---

## Support

For issues with Langsmith integration:
1. Check [Langsmith Documentation](https://docs.smith.langchain.com/)
2. Review trace logs in application
3. Contact development team with trace IDs