import axios from 'axios';
import promptManager from '../config/aiPrompts';

// Use the free model as specified in requirements
const MODEL = 'openai/gpt-4o-mini-2024-07-18'; // Free alternative to gpt-oss-20b

interface AIResponse {
  success: boolean;
  data?: string;
  error?: string;
}

export class AIService {
  private getApiKey(): string {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('❌ OPENROUTER_API_KEY not found in environment variables');
      console.error('Current env keys:', Object.keys(process.env).filter(k => k.includes('OPEN')));
    }
    return apiKey || '';
  }

  private extractJSON(text: string): any {
    if (!text) throw new Error('Empty response');

    // Try direct parse first
    try {
      return JSON.parse(text);
    } catch {}

    // Extract from markdown code block
    const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (codeBlockMatch) {
      try {
        return JSON.parse(codeBlockMatch[1].trim());
      } catch {}
    }

    // Extract from first { to last }
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      try {
        return JSON.parse(text.substring(start, end + 1));
      } catch {}
    }

    // Extract from first [ to last ]
    const arrayStart = text.indexOf('[');
    const arrayEnd = text.lastIndexOf(']');
    if (arrayStart !== -1 && arrayEnd !== -1) {
      try {
        return JSON.parse(text.substring(arrayStart, arrayEnd + 1));
      } catch {}
    }

    throw new Error('No valid JSON found in response');
  }

  // Public method for external use
  parseAIResponse(text: string): any {
    return this.extractJSON(text);
  }

  private async callOpenRouter(prompt: string, retries = 3): Promise<AIResponse> {
    const OPENROUTER_API_KEY = this.getApiKey();
    
    if (!OPENROUTER_API_KEY) {
      return { success: false, error: 'OpenRouter API key not configured' };
    }

    for (let i = 0; i < retries; i++) {
      try {
        const response = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: MODEL,
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ]
          },
          {
            headers: {
              'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'http://localhost:3000',
              'X-Title': 'SiteScape AI'
            }
          }
        );

        const content = response.data.choices[0]?.message?.content;
        return { success: true, data: content };
      } catch (error: any) {
        const errorMsg = error.response?.data?.error?.message || error.message;
        const statusCode = error.response?.status;
        console.error(`AI API call failed (attempt ${i + 1}/${retries}):`, statusCode, errorMsg);
        
        if (statusCode === 401) {
          console.error('❌ Authentication failed. Please check your OpenRouter API key.');
          return { success: false, error: 'Invalid API key' };
        }
        
        if (i === retries - 1) {
          return { success: false, error: errorMsg };
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    return { success: false, error: 'Max retries exceeded' };
  }

  async analyzeWebsite(url: string): Promise<AIResponse> {
    const prompt = promptManager.getPrompt('websiteAnalysis', { url });
    return this.callOpenRouter(prompt);
  }

  async convertToReact(htmlSnippet: string, cssSnippet: string, jsSnippet: string): Promise<AIResponse> {
    const prompt = promptManager.getPrompt('htmlToReact', {
      html: htmlSnippet.substring(0, 3000),
      css: cssSnippet.substring(0, 2000),
      js: jsSnippet.substring(0, 2000)
    });
    return this.callOpenRouter(prompt);
  }

  async optimizeForElementor(reactCode: string): Promise<AIResponse> {
    const prompt = promptManager.getPrompt('elementorOptimization', {
      reactCode: reactCode.substring(0, 4000)
    });
    return this.callOpenRouter(prompt);
  }

  async generateComponentStructure(html: string): Promise<AIResponse> {
    const prompt = promptManager.getPrompt('componentStructure', {
      html: html.substring(0, 5000)
    });
    return this.callOpenRouter(prompt);
  }

  async discoverPages(url: string, html: string): Promise<AIResponse> {
    const prompt = promptManager.getPrompt('pageDiscovery', {
      url,
      html: html.substring(0, 3000)
    });
    return this.callOpenRouter(prompt);
  }

  async analyzeAssets(html: string): Promise<AIResponse> {
    const prompt = promptManager.getPrompt('assetAnalysis', {
      html: html.substring(0, 4000)
    });
    return this.callOpenRouter(prompt);
  }

  async extractDemoContent(html: string): Promise<AIResponse> {
    const prompt = promptManager.getPrompt('demoContentExtraction', {
      html: html.substring(0, 5000)
    });
    return this.callOpenRouter(prompt);
  }

  async generateElementorTemplate(reactCode: string, section: string): Promise<AIResponse> {
    const prompt = promptManager.getPrompt('elementorTemplate', {
      section,
      reactCode: reactCode.substring(0, 3000)
    });
    return this.callOpenRouter(prompt);
  }

  async validateProjectCompleteness(projectPath: string, manifest: any): Promise<AIResponse> {
    const prompt = promptManager.getPrompt('projectValidation', {
      projectPath,
      manifest: JSON.stringify(manifest, null, 2)
    });
    return this.callOpenRouter(prompt);
  }
}

export default new AIService();
