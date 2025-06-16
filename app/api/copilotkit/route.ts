import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from '@copilotkit/runtime';
import OpenAI from 'openai';
import { NextRequest } from 'next/server';

// Initialize the OpenAI client without specifying a model
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create the adapter — this is where you specify the model
const serviceAdapter = new OpenAIAdapter({
  openai,
  /*model: "gpt-4o-mini", */// ← Your desired model here
});

const runtime = new CopilotRuntime();

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: '/api/copilotkit',
  });

  return handleRequest(req);
};
