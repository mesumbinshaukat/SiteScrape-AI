import * as fs from 'fs/promises';
import * as path from 'path';
import aiService from './aiService';
import logger from './loggerService';

interface ElementorWidget {
  id: string;
  elType: string;
  widgetType?: string;
  settings: any;
  elements?: ElementorWidget[];
}

interface ElementorTemplate {
  content: ElementorWidget[];
  page_settings: any;
  version: string;
  title: string;
  type: string;
}

export class ElementorTemplateGenerator {
  async generateTemplate(
    reactCode: string,
    sectionName: string,
    html: string
  ): Promise<ElementorTemplate> {
    logger.ai('Elementor', `Generating Elementor template for ${sectionName}...`);

    // Use AI to generate Elementor structure
    const aiResponse = await aiService.generateElementorTemplate(reactCode, sectionName);
    
    if (aiResponse.success && aiResponse.data) {
      try {
        const aiTemplate = JSON.parse(aiResponse.data);
        logger.ai('Elementor', 'AI generated Elementor template', aiTemplate);
        return aiTemplate;
      } catch (error) {
        logger.warning('Elementor', 'AI template parsing failed, using fallback');
      }
    }

    // Fallback: Generate basic template
    return this.generateFallbackTemplate(sectionName, html);
  }

  private generateFallbackTemplate(sectionName: string, html: string): ElementorTemplate {
    const template: ElementorTemplate = {
      content: [
        {
          id: this.generateId(),
          elType: 'section',
          settings: {
            layout: 'boxed',
            gap: 'default'
          },
          elements: [
            {
              id: this.generateId(),
              elType: 'column',
              settings: {
                _column_size: 100
              },
              elements: [
                {
                  id: this.generateId(),
                  elType: 'widget',
                  widgetType: 'html',
                  settings: {
                    html: html,
                    _element_id: sectionName.toLowerCase().replace(/\s+/g, '-')
                  }
                }
              ]
            }
          ]
        }
      ],
      page_settings: {
        post_status: 'publish',
        template: 'elementor_canvas'
      },
      version: '3.16.0',
      title: sectionName,
      type: 'page'
    };

    return template;
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  async saveTemplate(template: ElementorTemplate, outputPath: string): Promise<void> {
    const jsonContent = JSON.stringify(template, null, 2);
    await fs.writeFile(outputPath, jsonContent, 'utf-8');
    logger.success('Elementor', `Template saved to ${outputPath}`);
  }

  async generateAllTemplates(
    components: Array<{ name: string; code: string; html: string }>,
    outputDir: string
  ): Promise<void> {
    await fs.mkdir(outputDir, { recursive: true });

    for (const component of components) {
      const template = await this.generateTemplate(
        component.code,
        component.name,
        component.html
      );

      const filename = `${component.name.toLowerCase().replace(/\s+/g, '-')}-template.json`;
      const filepath = path.join(outputDir, filename);
      
      await this.saveTemplate(template, filepath);
    }

    logger.success('Elementor', `Generated ${components.length} Elementor templates`);
  }

  async generateElementorKitJSON(templates: string[], outputPath: string): Promise<void> {
    const kit = {
      version: '3.16.0',
      title: 'SiteScape AI Kit',
      type: 'kit',
      templates: templates.map((name, index) => ({
        id: index + 1,
        title: name,
        type: 'page',
        thumbnail: '',
        date: new Date().toISOString(),
        author: 'SiteScape AI',
        hasPageSettings: true,
        categories: ['imported'],
        keywords: ['ai', 'imported'],
        template_id: index + 1
      })),
      content: [],
      page_settings: [],
      system_colors: [],
      custom_colors: [],
      system_typography: [],
      custom_typography: []
    };

    await fs.writeFile(outputPath, JSON.stringify(kit, null, 2), 'utf-8');
    logger.success('Elementor', `Elementor kit JSON saved to ${outputPath}`);
  }
}

export default new ElementorTemplateGenerator();
