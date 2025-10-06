import axios from 'axios';

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
    const prompt = `Analyze the website at ${url} for structure, animations, and data flows. Provide a detailed migration plan to React including:
1. Key sections (header, footer, navigation, content blocks)
2. Detected animations and transitions (CSS/JS based)
3. Interactive elements (forms, sliders, modals, etc.)
4. Suggested React libraries for complex features
5. Accessibility and performance optimization suggestions
6. Responsive design considerations

Format your response as a structured JSON with these keys: sections, animations, interactions, libraries, optimizations, responsive.`;

    return this.callOpenRouter(prompt);
  }

  async convertToReact(htmlSnippet: string, cssSnippet: string, jsSnippet: string): Promise<AIResponse> {
    const prompt = `Convert the following HTML/CSS/JS code to a React functional component with TypeScript. Preserve exact styles and interactions.

HTML:
\`\`\`html
${htmlSnippet.substring(0, 3000)}
\`\`\`

CSS:
\`\`\`css
${cssSnippet.substring(0, 2000)}
\`\`\`

JS:
\`\`\`javascript
${jsSnippet.substring(0, 2000)}
\`\`\`

Requirements:
1. Use functional components with hooks (useState, useEffect)
2. Convert CSS to styled-components or inline styles with TypeScript
3. Migrate JS logic to React state/effects
4. Handle animations with Framer Motion if needed
5. Ensure pixel-perfect UI matching
6. Make it responsive with media queries
7. Add TypeScript types

Return only the React component code with imports.`;

    return this.callOpenRouter(prompt);
  }

  async optimizeForElementor(reactCode: string): Promise<AIResponse> {
    const prompt = `Optimize this React code for WordPress Elementor integration:

\`\`\`tsx
${reactCode.substring(0, 4000)}
\`\`\`

Requirements:
1. Add hooks for editable sections (use data attributes for Elementor)
2. Convert dynamic content areas to use Elementor shortcodes placeholders
3. Ensure compatibility with Elementor's widget system
4. Add comments indicating where Elementor widgets should be registered
5. Maintain exact styling and functionality

Return the optimized code with detailed comments.`;

    return this.callOpenRouter(prompt);
  }

  async generateComponentStructure(html: string): Promise<AIResponse> {
    const prompt = `Analyze this HTML and break it down into reusable React components:

\`\`\`html
${html.substring(0, 5000)}
\`\`\`

Return a JSON structure with:
1. Component hierarchy (parent-child relationships)
2. Component names (semantic and descriptive)
3. Props for each component
4. Suggested file structure

Format: { "components": [{ "name": "", "children": [], "props": [], "filePath": "" }] }`;

    return this.callOpenRouter(prompt);
  }

  async discoverPages(url: string, html: string): Promise<AIResponse> {
    const prompt = `Analyze this website to discover all pages and navigation structure:

URL: ${url}

HTML Sample:
\`\`\`html
${html.substring(0, 3000)}
\`\`\`

Tasks:
1. Identify all internal links and navigation menus
2. Detect sitemap.xml location if exists
3. Find pagination patterns
4. Discover dynamic routes (e.g., /blog/:slug)
5. Identify multi-language versions
6. Suggest crawling strategy

Return JSON: { "pages": ["url1", "url2"], "sitemap": "url", "patterns": [], "strategy": "description" }`;

    return this.callOpenRouter(prompt);
  }

  async analyzeAssets(html: string): Promise<AIResponse> {
    const prompt = `Analyze this HTML to find ALL assets including hidden/lazy-loaded ones:

\`\`\`html
${html.substring(0, 4000)}
\`\`\`

Find:
1. All images (including data-src, srcset, background-image in styles)
2. Videos (video tags, embedded players, background videos)
3. Fonts (Google Fonts, custom fonts, @font-face)
4. Icons (SVG, icon fonts, sprite sheets)
5. Audio files
6. Documents (PDFs, etc.)
7. Lazy-loaded content patterns

Return JSON: { "images": [], "videos": [], "fonts": [], "icons": [], "audio": [], "documents": [], "lazyPatterns": [] }`;

    return this.callOpenRouter(prompt);
  }

  async extractDemoContent(html: string): Promise<AIResponse> {
    const prompt = `Extract demo content from this HTML for WordPress import:

\`\`\`html
${html.substring(0, 5000)}
\`\`\`

Extract:
1. Page title and meta description
2. Main content text (paragraphs, headings)
3. Image captions and alt text
4. Form labels and placeholders
5. Button texts and CTAs
6. Menu items
7. Footer content

Return JSON with structured content for WP XML generation.`;

    return this.callOpenRouter(prompt);
  }

  async generateElementorTemplate(reactCode: string, section: string): Promise<AIResponse> {
    const prompt = `Convert this React component to Elementor template JSON:

Section: ${section}

\`\`\`tsx
${reactCode.substring(0, 3000)}
\`\`\`

Generate Elementor JSON template with:
1. Sections, columns, and widgets
2. Proper widget types (heading, text, image, button, etc.)
3. Settings and styles
4. Responsive settings
5. Dynamic tags where applicable

Return valid Elementor JSON template structure.`;

    return this.callOpenRouter(prompt);
  }

  async validateProjectCompleteness(projectPath: string, manifest: any): Promise<AIResponse> {
    const prompt = `Review this project for completeness before packaging:

Project Path: ${projectPath}

Asset Manifest:
\`\`\`json
${JSON.stringify(manifest, null, 2)}
\`\`\`

Tasks:
1. Verify all expected assets are present (images, videos, fonts, audio, documents, CSS, JS)
2. Check if asset counts are reasonable for a website
3. Identify any missing critical assets
4. Suggest fixes for missing items
5. Validate file structure completeness
6. Check for potential issues

Return JSON:
{
  "isComplete": true/false,
  "issues": ["issue1", "issue2"],
  "missingAssets": ["type1", "type2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "severity": "low/medium/high",
  "canProceed": true/false,
  "summary": "brief summary"
}`;

    return this.callOpenRouter(prompt);
  }
}

export default new AIService();
