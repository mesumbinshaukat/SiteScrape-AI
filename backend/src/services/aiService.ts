import axios from 'axios';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '';
const MODEL = 'openai/gpt-4o-mini-2024-07-18';

interface AIResponse {
  success: boolean;
  data?: string;
  error?: string;
}

export class AIService {
  private async callOpenRouter(prompt: string, retries = 3): Promise<AIResponse> {
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
        console.error(`AI API call failed (attempt ${i + 1}/${retries}):`, error.message);
        if (i === retries - 1) {
          return { success: false, error: error.message };
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
}

export default new AIService();
