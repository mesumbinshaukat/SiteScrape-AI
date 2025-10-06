import * as fs from 'fs/promises';
import * as path from 'path';
import * as cheerio from 'cheerio';
import aiService from './aiService';
import Conversion from '../models/Conversion';
import Scrape from '../models/Scrape';

export class ConversionService {
  private projectPath: string = '';
  private jobId: string = '';

  private async readFile(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch {
      return '';
    }
  }

  private async writeFile(filePath: string, content: string): Promise<void> {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content);
  }

  private extractSections(html: string): Array<{ name: string; html: string; css: string }> {
    const $ = cheerio.load(html);
    const sections: Array<{ name: string; html: string; css: string }> = [];

    // Extract header
    const header = $('header, [role="banner"], .header, #header').first();
    if (header.length) {
      sections.push({
        name: 'Header',
        html: $.html(header),
        css: this.extractInlineStyles(header, $)
      });
    }

    // Extract navigation
    const nav = $('nav, [role="navigation"], .nav, .navbar').first();
    if (nav.length) {
      sections.push({
        name: 'Navigation',
        html: $.html(nav),
        css: this.extractInlineStyles(nav, $)
      });
    }

    // Extract main content
    const main = $('main, [role="main"], .main, #main').first();
    if (main.length) {
      sections.push({
        name: 'Main',
        html: $.html(main),
        css: this.extractInlineStyles(main, $)
      });
    }

    // Extract footer
    const footer = $('footer, [role="contentinfo"], .footer, #footer').first();
    if (footer.length) {
      sections.push({
        name: 'Footer',
        html: $.html(footer),
        css: this.extractInlineStyles(footer, $)
      });
    }

    return sections;
  }

  private extractInlineStyles(element: any, $: cheerio.CheerioAPI): string {
    let styles = '';
    element.find('[style]').each((_: number, el: any) => {
      styles += $(el).attr('style') + '\n';
    });
    return styles;
  }

  private cleanAIResponse(response: string): string {
    // Remove markdown code blocks
    let cleaned = response.replace(/```tsx\n/g, '').replace(/```typescript\n/g, '').replace(/```\n/g, '');
    cleaned = cleaned.replace(/```/g, '');
    
    // Remove explanatory text before import statements
    const importMatch = cleaned.match(/import\s+/);
    if (importMatch && importMatch.index) {
      cleaned = cleaned.substring(importMatch.index);
    }
    
    // Remove explanatory text after export statement
    const lastExportMatch = cleaned.lastIndexOf('export default');
    if (lastExportMatch !== -1) {
      const afterExport = cleaned.substring(lastExportMatch);
      const semicolonMatch = afterExport.match(/;/);
      if (semicolonMatch && semicolonMatch.index) {
        cleaned = cleaned.substring(0, lastExportMatch + semicolonMatch.index + 1);
      }
    }
    
    // Remove bullet points and explanatory sections
    cleaned = cleaned.split('\n').filter(line => {
      const trimmed = line.trim();
      return !trimmed.startsWith('This component') &&
             !trimmed.startsWith('1.') &&
             !trimmed.startsWith('2.') &&
             !trimmed.startsWith('3.') &&
             !trimmed.startsWith('4.') &&
             !trimmed.startsWith('5.') &&
             !trimmed.startsWith('6.') &&
             !trimmed.startsWith('7.') &&
             !trimmed.startsWith('8.') &&
             !trimmed.startsWith('The component') &&
             !trimmed.startsWith('Here\'s');
    }).join('\n');
    
    return cleaned.trim();
  }

  private async generateReactComponent(
    name: string,
    html: string,
    css: string,
    js: string
  ): Promise<string> {
    console.log(`\n🤖 [AI Conversion] Converting ${name} to React...`);
    const aiResponse = await aiService.convertToReact(html, css, js);
    
    if (aiResponse.success && aiResponse.data) {
      console.log(`✅ [AI Conversion] ${name} conversion successful`);
      
      // Clean the AI response
      const cleanedCode = this.cleanAIResponse(aiResponse.data);
      
      // Log AI conversion
      const conversion = await Conversion.findOne({ jobId: this.jobId });
      if (conversion) {
        conversion.aiLogs.push({
          step: `convert-${name}`,
          prompt: `Convert ${name} to React`,
          response: cleanedCode,
          timestamp: new Date()
        });
        await conversion.save();
      }

      console.log(`📝 [AI Conversion] ${name} code cleaned and ready`);
      return cleanedCode;
    }

    console.log(`⚠️  [AI Conversion] ${name} AI failed, using fallback`);
    // Fallback: Basic conversion
    return this.basicHtmlToReact(name, html, css);
  }

  private basicHtmlToReact(name: string, html: string, css: string): string {
    console.log(`📝 [Fallback] Using intelligent HTML-to-React conversion for ${name}`);
    const $ = cheerio.load(html);
    
    // Extract text content
    const textContent: string[] = [];
    $('h1, h2, h3, h4, h5, h6, p, span, a, button').each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 0) {
        textContent.push(text);
      }
    });
    
    // Extract images
    const images: string[] = [];
    $('img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (src) images.push(src);
    });
    
    // Extract links
    const links: Array<{href: string; text: string}> = [];
    $('a').each((_, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim();
      if (href && text) links.push({ href, text });
    });
    
    // Convert class to className
    $('*').each((_, el) => {
      const className = $(el).attr('class');
      if (className) {
        $(el).removeAttr('class');
        $(el).attr('className', className);
      }
      // Remove inline styles for cleaner output
      $(el).removeAttr('style');
    });

    const reactHtml = $.html();
    
    console.log(`✅ [Fallback] Extracted ${textContent.length} text elements, ${images.length} images, ${links.length} links`);

    return `import React from 'react';
import styled from 'styled-components';

const ${name}Wrapper = styled.div\`
  ${css}
  
  /* Responsive design */
  @media (max-width: 768px) {
    padding: 1rem;
  }
\`;

const ${name}: React.FC = () => {
  return (
    <${name}Wrapper>
      ${reactHtml}
    </${name}Wrapper>
  );
};

export default ${name};
`;
  }

  async convertToReact(jobId: string, io: any): Promise<void> {
    try {
      this.jobId = jobId;
      this.projectPath = path.join(process.cwd(), 'projects', jobId);
      const reactAppPath = path.join(this.projectPath, 'react-app');

      // Read scraped HTML
      const htmlPath = path.join(this.projectPath, 'scraped', 'html', 'index.html');
      const html = await this.readFile(htmlPath);

      if (!html) {
        throw new Error('No HTML file found');
      }

      io.emit('progress', { jobId, status: 'converting', progress: 75 });

      // Extract sections
      const sections = this.extractSections(html);

      // Read CSS files
      const cssDir = path.join(this.projectPath, 'scraped', 'css');
      let allCss = '';
      try {
        const cssFiles = await fs.readdir(cssDir);
        for (const file of cssFiles) {
          allCss += await this.readFile(path.join(cssDir, file)) + '\n';
        }
      } catch {}

      // Read JS files
      const jsDir = path.join(this.projectPath, 'scraped', 'js');
      let allJs = '';
      try {
        const jsFiles = await fs.readdir(jsDir);
        for (const file of jsFiles) {
          allJs += await this.readFile(path.join(jsDir, file)) + '\n';
        }
      } catch {}

      // Create React app structure
      await fs.mkdir(path.join(reactAppPath, 'src', 'components'), { recursive: true });
      await fs.mkdir(path.join(reactAppPath, 'src', 'styles'), { recursive: true });
      await fs.mkdir(path.join(reactAppPath, 'public'), { recursive: true });

      // Generate components
      const componentMappings: any[] = [];
      let progress = 75;

      for (const section of sections) {
        const component = await this.generateReactComponent(
          section.name,
          section.html,
          section.css,
          allJs
        );

        const componentPath = path.join(
          reactAppPath,
          'src',
          'components',
          `${section.name}.tsx`
        );
        await this.writeFile(componentPath, component);

        componentMappings.push({
          originalHtml: section.html,
          reactComponent: component,
          componentName: section.name
        });

        progress += 3;
        io.emit('progress', { jobId, status: 'converting', progress });
      }

      // Create App.tsx
      const appTsx = `import React from 'react';
${sections.map(s => `import ${s.name} from './components/${s.name}';`).join('\n')}

const App: React.FC = () => {
  return (
    <div className="App">
      ${sections.map(s => `<${s.name} />`).join('\n      ')}
    </div>
  );
};

export default App;
`;
      await this.writeFile(path.join(reactAppPath, 'src', 'App.tsx'), appTsx);

      // Create main.tsx
      const mainTsx = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;
      await this.writeFile(path.join(reactAppPath, 'src', 'main.tsx'), mainTsx);

      // Create global CSS
      await this.writeFile(
        path.join(reactAppPath, 'src', 'styles', 'index.css'),
        allCss
      );

      // Create package.json
      const packageJson = {
        name: 'scraped-react-app',
        version: '1.0.0',
        type: 'module',
        scripts: {
          dev: 'vite',
          build: 'tsc && vite build',
          preview: 'vite preview'
        },
        dependencies: {
          react: '^18.2.0',
          'react-dom': '^18.2.0',
          'styled-components': '^6.1.8',
          'framer-motion': '^10.16.16'
        },
        devDependencies: {
          '@types/react': '^18.2.45',
          '@types/react-dom': '^18.2.18',
          '@vitejs/plugin-react': '^4.2.1',
          typescript: '^5.3.3',
          vite: '^5.0.8'
        }
      };
      await this.writeFile(
        path.join(reactAppPath, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      // Create vite.config.ts
      const viteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
`;
      await this.writeFile(path.join(reactAppPath, 'vite.config.ts'), viteConfig);

      // Create tsconfig.json
      const tsConfig = {
        compilerOptions: {
          target: 'ES2020',
          useDefineForClassFields: true,
          lib: ['ES2020', 'DOM', 'DOM.Iterable'],
          module: 'ESNext',
          skipLibCheck: true,
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true,
          resolveJsonModule: true,
          isolatedModules: true,
          noEmit: true,
          jsx: 'react-jsx',
          strict: true
        },
        include: ['src']
      };
      await this.writeFile(
        path.join(reactAppPath, 'tsconfig.json'),
        JSON.stringify(tsConfig, null, 2)
      );

      // Create index.html
      const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Scraped React App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
      await this.writeFile(path.join(reactAppPath, 'index.html'), indexHtml);

      // Update conversion record
      await Conversion.findOneAndUpdate(
        { jobId },
        {
          componentMappings,
          reactAppPath
        }
      );

      await Scrape.findOneAndUpdate(
        { jobId },
        { status: 'building', progress: 90 }
      );

      io.emit('progress', { jobId, status: 'building', progress: 90 });

    } catch (error: any) {
      await Scrape.findOneAndUpdate(
        { jobId },
        { status: 'failed', error: error.message }
      );
      io.emit('error', { jobId, error: error.message });
      throw error;
    }
  }
}

export default new ConversionService();
