/**
 * AI Prompt Configuration
 * Customize AI prompts for different conversion steps
 */

export interface AIPromptConfig {
  websiteAnalysis: string;
  pageDiscovery: string;
  assetAnalysis: string;
  htmlToReact: string;
  elementorOptimization: string;
  componentStructure: string;
  demoContentExtraction: string;
  elementorTemplate: string;
  projectValidation: string;
}

export const defaultPrompts: AIPromptConfig = {
  websiteAnalysis: `Analyze the website at {url} for structure, animations, and data flows. Provide a detailed migration plan to React including:
1. Key sections (header, footer, navigation, content blocks)
2. Detected animations and transitions (CSS/JS based)
3. Interactive elements (forms, sliders, modals, etc.)
4. Suggested React libraries for complex features
5. Accessibility and performance optimization suggestions
6. Responsive design considerations

Format your response as a structured JSON with these keys: sections, animations, interactions, libraries, optimizations, responsive.`,

  pageDiscovery: `Analyze this website to discover all pages and navigation structure:

URL: {url}

HTML Sample:
\`\`\`html
{html}
\`\`\`

Tasks:
1. Identify all internal links and navigation menus
2. Detect sitemap.xml location if exists
3. Find pagination patterns
4. Discover dynamic routes (e.g., /blog/:slug)
5. Identify multi-language versions
6. Suggest crawling strategy

Return JSON: { "pages": ["url1", "url2"], "sitemap": "url", "patterns": [], "strategy": "description" }`,

  assetAnalysis: `Analyze this HTML to find ALL assets including hidden/lazy-loaded ones:

\`\`\`html
{html}
\`\`\`

Find:
1. All images (including data-src, srcset, background-image in styles)
2. Videos (video tags, embedded players, background videos)
3. Fonts (Google Fonts, custom fonts, @font-face)
4. Icons (SVG, icon fonts, sprite sheets)
5. Audio files
6. Documents (PDFs, etc.)
7. Lazy-loaded content patterns

Return JSON: { "images": [], "videos": [], "fonts": [], "icons": [], "audio": [], "documents": [], "lazyPatterns": [] }`,

  htmlToReact: `Convert the following HTML/CSS/JS code to a React functional component with TypeScript. Preserve exact styles and interactions.

HTML:
\`\`\`html
{html}
\`\`\`

CSS:
\`\`\`css
{css}
\`\`\`

JS:
\`\`\`javascript
{js}
\`\`\`

Requirements:
1. Use functional components with hooks (useState, useEffect)
2. Convert CSS to styled-components or inline styles with TypeScript
3. Migrate JS logic to React state/effects
4. Handle animations with Framer Motion if needed
5. Ensure pixel-perfect UI matching
6. Make it responsive with media queries
7. Add TypeScript types

Return only the React component code with imports.`,

  elementorOptimization: `Optimize this React code for WordPress Elementor integration:

\`\`\`tsx
{reactCode}
\`\`\`

Requirements:
1. Add hooks for editable sections (use data attributes for Elementor)
2. Convert dynamic content areas to use Elementor shortcodes placeholders
3. Ensure compatibility with Elementor's widget system
4. Add comments indicating where Elementor widgets should be registered
5. Maintain exact styling and functionality

Return the optimized code with detailed comments.`,

  componentStructure: `Analyze this HTML and break it down into reusable React components:

\`\`\`html
{html}
\`\`\`

Return a JSON structure with:
1. Component hierarchy (parent-child relationships)
2. Component names (semantic and descriptive)
3. Props for each component
4. Suggested file structure

Format: { "components": [{ "name": "", "children": [], "props": [], "filePath": "" }] }`,

  demoContentExtraction: `Extract demo content from this HTML for WordPress import:

\`\`\`html
{html}
\`\`\`

Extract:
1. Page title and meta description
2. Main content text (paragraphs, headings)
3. Image captions and alt text
4. Form labels and placeholders
5. Button texts and CTAs
6. Menu items
7. Footer content

Return JSON with structured content for WP XML generation.`,

  elementorTemplate: `Convert this React component to Elementor template JSON:

Section: {section}

\`\`\`tsx
{reactCode}
\`\`\`

Generate Elementor JSON template with:
1. Sections, columns, and widgets
2. Proper widget types (heading, text, image, button, etc.)
3. Settings and styles
4. Responsive settings
5. Dynamic tags where applicable

Return valid Elementor JSON template structure.`,

  projectValidation: `Review this project for completeness before packaging:

Project Path: {projectPath}

Asset Manifest:
\`\`\`json
{manifest}
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
}`
};

/**
 * Load custom prompts from file or use defaults
 */
export class AIPromptManager {
  private prompts: AIPromptConfig;

  constructor(customPrompts?: Partial<AIPromptConfig>) {
    this.prompts = { ...defaultPrompts, ...customPrompts };
  }

  getPrompt(type: keyof AIPromptConfig, variables: Record<string, string>): string {
    let prompt = this.prompts[type];
    
    // Replace variables in prompt
    Object.entries(variables).forEach(([key, value]) => {
      prompt = prompt.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    });
    
    return prompt;
  }

  updatePrompt(type: keyof AIPromptConfig, newPrompt: string): void {
    this.prompts[type] = newPrompt;
  }

  getAllPrompts(): AIPromptConfig {
    return { ...this.prompts };
  }

  resetToDefaults(): void {
    this.prompts = { ...defaultPrompts };
  }
}

export default new AIPromptManager();
