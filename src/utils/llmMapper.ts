// src/utils/llmMapper.ts

import { OpenAI } from 'openai'; // Assuming you're using OpenAI's API
import { logger } from './logger';

const openai = new OpenAI(process.env.OPENAI_API_KEY);

/**
 * Uses an LLM to map unstructured custom fields to a structured format.
 * @param unstructuredData - The unstructured data to map.
 * @param instructions - Specific instructions for the LLM.
 */
export async function mapUsingLLM(unstructuredData: any, instructions: string): Promise<any> {
  try {
    const response = await openai.complete({
      engine: 'davinci',
      prompt: `${instructions}\nData:\n${JSON.stringify(unstructuredData)}`,
      maxTokens: 150,
    });

    const mappedData = JSON.parse(response.choices[0].text.trim());
    return mappedData;
  } catch (error) {
    logger.error('LLM mapping failed:', error.message);
    throw error;
  }
}