import * as fs from 'fs/promises';
import * as path from 'path';
import * as cheerio from 'cheerio';
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

interface ScrapedContent {
  headings: Array<{ level: string; text: string }>;
  paragraphs: string[];
  images: Array<{ src: string; alt: string }>;
  links: Array<{ href: string; text: string }>;
  buttons: Array<{ text: string; href: string }>;
  videos: Array<{ src: string; type: string }>;
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

  private extractContent(html: string): ScrapedContent {
    const $ = cheerio.load(html);
    const content: ScrapedContent = {
      headings: [],
      paragraphs: [],
      images: [],
      links: [],
      buttons: [],
      videos: []
    };

    // Extract headings
    $('h1, h2, h3, h4, h5, h6').each((_, el) => {
      const text = $(el).text().trim();
      if (text) {
        content.headings.push({
          level: el.tagName.toLowerCase(),
          text
        });
      }
    });

    // Extract paragraphs
    $('p').each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 10) {
        content.paragraphs.push(text);
      }
    });

    // Extract images
    $('img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src') || '';
      const alt = $(el).attr('alt') || '';
      if (src) {
        content.images.push({ src, alt });
      }
    });

    // Extract links
    $('a').each((_, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim();
      if (href && text) {
        content.links.push({ href, text });
      }
    });

    // Extract buttons
    $('button, .button, .btn, a.btn').each((_, el) => {
      const text = $(el).text().trim();
      const href = $(el).attr('href') || '#';
      if (text) {
        content.buttons.push({ text, href });
      }
    });

    // Extract videos
    $('video source, video').each((_, el) => {
      const src = $(el).attr('src') || '';
      const type = $(el).attr('type') || 'video/mp4';
      if (src) {
        content.videos.push({ src, type });
      }
    });

    return content;
  }

  private createHeadingWidget(heading: { level: string; text: string }): ElementorWidget {
    const tagMap: any = { h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4', h5: 'h5', h6: 'h6' };
    
    return {
      id: this.generateId(),
      elType: 'widget',
      widgetType: 'heading',
      settings: {
        title: heading.text,
        header_size: tagMap[heading.level] || 'h2',
        align: 'left'
      }
    };
  }

  private createTextWidget(text: string): ElementorWidget {
    return {
      id: this.generateId(),
      elType: 'widget',
      widgetType: 'text-editor',
      settings: {
        editor: `<p>${text}</p>`
      }
    };
  }

  private createImageWidget(image: { src: string; alt: string }): ElementorWidget {
    return {
      id: this.generateId(),
      elType: 'widget',
      widgetType: 'image',
      settings: {
        image: {
          url: image.src,
          id: ''
        },
        image_alt: image.alt,
        caption_source: 'none'
      }
    };
  }

  private createButtonWidget(button: { text: string; href: string }): ElementorWidget {
    return {
      id: this.generateId(),
      elType: 'widget',
      widgetType: 'button',
      settings: {
        text: button.text,
        link: {
          url: button.href,
          is_external: button.href.startsWith('http'),
          nofollow: false
        },
        align: 'left',
        button_type: 'primary'
      }
    };
  }

  private createVideoWidget(video: { src: string; type: string }): ElementorWidget {
    return {
      id: this.generateId(),
      elType: 'widget',
      widgetType: 'video',
      settings: {
        video_type: 'hosted',
        hosted_url: video.src,
        autoplay: false,
        mute: false,
        loop: false,
        controls: true
      }
    };
  }

  private generateFallbackTemplate(sectionName: string, html: string): ElementorTemplate {
    console.log(`📝 [Elementor] Generating intelligent template for ${sectionName}`);
    
    // Extract content from HTML
    const content = this.extractContent(html);
    console.log(`✅ [Elementor] Extracted: ${content.headings.length} headings, ${content.paragraphs.length} paragraphs, ${content.images.length} images, ${content.buttons.length} buttons`);

    // Create widgets from extracted content
    const widgets: ElementorWidget[] = [];

    // Add headings
    content.headings.slice(0, 5).forEach(heading => {
      widgets.push(this.createHeadingWidget(heading));
    });

    // Add paragraphs
    content.paragraphs.slice(0, 10).forEach(text => {
      widgets.push(this.createTextWidget(text));
    });

    // Add images
    content.images.slice(0, 10).forEach(image => {
      widgets.push(this.createImageWidget(image));
    });

    // Add buttons
    content.buttons.slice(0, 5).forEach(button => {
      widgets.push(this.createButtonWidget(button));
    });

    // Add videos
    content.videos.slice(0, 3).forEach(video => {
      widgets.push(this.createVideoWidget(video));
    });

    // If no widgets extracted, use HTML fallback
    if (widgets.length === 0) {
      console.log(`⚠️  [Elementor] No content extracted, using HTML widget`);
      widgets.push({
        id: this.generateId(),
        elType: 'widget',
        widgetType: 'html',
        settings: {
          html: html,
          _element_id: sectionName.toLowerCase().replace(/\s+/g, '-')
        }
      });
    }

    const template: ElementorTemplate = {
      content: [
        {
          id: this.generateId(),
          elType: 'section',
          settings: {
            layout: 'boxed',
            gap: 'default',
            content_width: 'boxed'
          },
          elements: [
            {
              id: this.generateId(),
              elType: 'column',
              settings: {
                _column_size: 100,
                _inline_size: null
              },
              elements: widgets
            }
          ]
        }
      ],
      page_settings: {
        post_status: 'publish',
        template: 'elementor_canvas',
        post_title: sectionName,
        post_excerpt: `${sectionName} page generated by SiteScape AI`
      },
      version: '3.16.0',
      title: sectionName,
      type: 'page'
    };

    console.log(`✅ [Elementor] Template created with ${widgets.length} widgets`);
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
