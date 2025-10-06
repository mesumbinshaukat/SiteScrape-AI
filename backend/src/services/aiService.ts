import axios from 'axios';
import promptManager from '../config/aiPrompts';

// Use the free model as specified in requirements
// Available free models: 'openai/gpt-4o-mini-2024-07-18', 'openai/gpt-oss-20b:free', 'google/gemini-flash-1.5'
const MODEL = 'deepseek/deepseek-chat-v3.1:free'; // Free reasoning model

interface AIResponse {
  success: boolean;
  data?: string;
  error?: string;
  reason?: string;
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

  async testConnection(): Promise<AIResponse> {
    const OPENROUTER_API_KEY = this.getApiKey();
    
    if (!OPENROUTER_API_KEY) {
      return { 
        success: false, 
        error: 'OPENROUTER_API_KEY not found in environment variables' 
      };
    }

    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: MODEL,
          messages: [
            {
              role: 'user',
              content: 'Reply with just "OK" if you can read this.'
            }
          ],
          max_tokens: 10
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:5000',
            'X-Title': 'SiteScape AI'
          },
          timeout: 15000
        }
      );

      // Check if we got a valid response
      if (response.data && response.status === 200) {
        const message = response.data.choices?.[0]?.message;
        const content = message?.content;
        const reasoning = message?.reasoning;
        
        // Check both content and reasoning fields (some models use reasoning)
        if (content || reasoning) {
          return { 
            success: true, 
            data: `${MODEL} (${response.data.provider || 'OpenRouter'})` 
          };
        } else {
          // Log the actual response for debugging
          console.log('   Debug: Response structure:', JSON.stringify(response.data, null, 2));
          return { 
            success: false, 
            error: `No content in response. Status: ${response.status}` 
          };
        }
      } else {
        return { 
          success: false, 
          error: `Unexpected response status: ${response.status}` 
        };
      }
    } catch (error: any) {
      // Better error handling
      if (error.response) {
        const errorData = error.response.data;
        const errorMsg = errorData?.error?.message || errorData?.message || error.message;
        console.log('   Debug: Error response:', JSON.stringify(errorData, null, 2));
        return { 
          success: false, 
          error: `API Error: ${errorMsg}` 
        };
      } else if (error.request) {
        return { 
          success: false, 
          error: 'No response from OpenRouter API (network issue)' 
        };
      } else {
        return { 
          success: false, 
          error: error.message 
        };
      }
    }
  }
}

export default new AIService();
