// Temporary: checks that Netlify AI Gateway passes image blocks through to Claude.
import Anthropic from '@anthropic-ai/sdk';

const RED_PNG = 'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAIAAAAlC+aJAAAAeUlEQVR4nO3PQQkAMAzAwKqpf0ETMxF7HINABFzm7H7dcEEDWtCAFjSgBQ1oQQNa0IAWNKAFDWhBA1rQgBY0oAUNaEEDWtCAFjSgBQ1oQQNa0IAWNKAFDWhBA1rQgBY0oAUNaEEDWtCAFjSgBQ1oQQNa0IAWNKAFj125G4EPHrsLDgAAAABJRU5ErkJggg==';

export async function GET() {
  const anthropic = new Anthropic();
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-5-5',
    max_tokens: 20,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/png', data: RED_PNG } },
          { type: 'text', text: 'What single color fills this image? Answer in one word.' },
        ],
      },
    ],
  });
  return Response.json({ content: message.content, usage: message.usage });
}
