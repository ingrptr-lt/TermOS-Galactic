import { CONFIG } from './config.js';
import DOMPurify from 'https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.0.6/purify.min.js';
import { marked } from 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';

export async function getAIResponse(messages) {
  const apiKey = localStorage.getItem(CONFIG.STORAGE_KEY);
  if (!apiKey) throw new Error("No API Key");

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { 
      "Authorization": `Bearer ${apiKey}`, 
      "Content-Type": "application/json" 
    },
    body: JSON.stringify({
      model: CONFIG.DEFAULT_MODEL,
      messages: messages,
      temperature: 0.6
    })
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message);
  
  // Security: Sanitize output
  return DOMPurify.sanitize(marked.parse(data.choices[0].message.content));
}
