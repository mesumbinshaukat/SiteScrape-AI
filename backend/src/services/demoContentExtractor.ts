import * as cheerio from 'cheerio';
import * as fs from 'fs/promises';
import * as path from 'path';
import aiService from './aiService';
import logger from './loggerService';

interface DemoContent {
  pages: Array<{
    title: string;
    content: string;
    excerpt: string;
    slug: string;
  }>;
  media: Array<{
    url: string;
    title: string;
    alt: string;
  }>;
  menus: Array<{
    name: string;
    items: Array<{
      title: string;
      url: string;
    }>;
  }>;
}

export class DemoContentExtractor {
  async extractContent(html: string, url: string): Promise<DemoContent> {
    const $ = cheerio.load(html);
    const content: DemoContent = {
      pages: [],
      media: [],
      menus: []
    };

    // Extract page content
    const title = $('title').text() || $('h1').first().text() || 'Home';
    const mainContent = $('main, article, .content, #content').first().html() || $('body').html() || '';
    const excerpt = $('meta[name="description"]').attr('content') || 
                   $('p').first().text().substring(0, 160) || '';

    content.pages.push({
      title,
      content: this.cleanHTML(mainContent),
      excerpt,
      slug: this.createSlug(title)
    });

    // Extract media
    $('img').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src') || '';
      const alt = $(el).attr('alt') || '';
      const title = $(el).attr('title') || alt;

      if (src) {
        content.media.push({
          url: src,
          title,
          alt
        });
      }
    });

    // Extract navigation menus
    $('nav, .nav, .menu, #menu').each((i, el) => {
      const menuItems: Array<{ title: string; url: string }> = [];
      
      $(el).find('a').each((_, link) => {
        const href = $(link).attr('href') || '#';
        const text = $(link).text().trim();
        
        if (text) {
          menuItems.push({
            title: text,
            url: href
          });
        }
      });

      if (menuItems.length > 0) {
        content.menus.push({
          name: `Menu ${i + 1}`,
          items: menuItems
        });
      }
    });

    // Use AI to enhance content extraction
    logger.ai('Content Extraction', 'Using AI to extract demo content...');
    const aiContent = await aiService.extractDemoContent(html);
    
    if (aiContent.success && aiContent.data) {
      try {
        const aiResult = JSON.parse(aiContent.data);
        logger.ai('Content Extraction', 'AI enhanced content extraction', aiResult);
        // Merge AI results with extracted content
      } catch {}
    }

    return content;
  }

  private cleanHTML(html: string): string {
    const $ = cheerio.load(html);
    
    // Remove scripts and styles
    $('script, style').remove();
    
    // Remove empty elements
    $('*').each((_, el) => {
      if ($(el).text().trim() === '' && $(el).children().length === 0) {
        $(el).remove();
      }
    });

    return $.html();
  }

  private createSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async generateWordPressXML(content: DemoContent, outputPath: string): Promise<void> {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
    xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/"
    xmlns:content="http://purl.org/rss/1.0/modules/content/"
    xmlns:wfw="http://wellformedweb.org/CommentAPI/"
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:wp="http://wordpress.org/export/1.2/">
<channel>
    <title>SiteScape AI Demo Content</title>
    <description>Imported demo content</description>
    <wp:wxr_version>1.2</wp:wxr_version>
    <wp:base_site_url>http://localhost</wp:base_site_url>
    <wp:base_blog_url>http://localhost</wp:base_blog_url>

    ${content.pages.map((page, index) => `
    <item>
        <title><![CDATA[${page.title}]]></title>
        <link>http://localhost/${page.slug}/</link>
        <pubDate>${new Date().toUTCString()}</pubDate>
        <dc:creator><![CDATA[admin]]></dc:creator>
        <guid isPermaLink="false">http://localhost/?page_id=${index + 1}</guid>
        <description></description>
        <content:encoded><![CDATA[${page.content}]]></content:encoded>
        <excerpt:encoded><![CDATA[${page.excerpt}]]></excerpt:encoded>
        <wp:post_id>${index + 1}</wp:post_id>
        <wp:post_date>${new Date().toISOString()}</wp:post_date>
        <wp:post_type>page</wp:post_type>
        <wp:status>publish</wp:status>
        <wp:post_name>${page.slug}</wp:post_name>
    </item>
    `).join('')}

    ${content.media.map((media, index) => `
    <item>
        <title><![CDATA[${media.title || 'Image ' + (index + 1)}]]></title>
        <link>${media.url}</link>
        <pubDate>${new Date().toUTCString()}</pubDate>
        <dc:creator><![CDATA[admin]]></dc:creator>
        <guid isPermaLink="false">${media.url}</guid>
        <description><![CDATA[${media.alt}]]></description>
        <wp:post_id>${1000 + index}</wp:post_id>
        <wp:post_date>${new Date().toISOString()}</wp:post_date>
        <wp:post_type>attachment</wp:post_type>
        <wp:status>inherit</wp:status>
        <wp:attachment_url>${media.url}</wp:attachment_url>
    </item>
    `).join('')}

</channel>
</rss>`;

    await fs.writeFile(outputPath, xml, 'utf-8');
    logger.success('Demo Content', `WordPress XML generated at ${outputPath}`);
  }
}

export default new DemoContentExtractor();
