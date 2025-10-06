import * as fs from 'fs/promises';
import * as path from 'path';
import sharp from 'sharp';
import aiService from './aiService';
import logger from './loggerService';
import Build from '../models/Build';
import Scrape from '../models/Scrape';
import Conversion from '../models/Conversion';

export class WPThemeBuilder {
  private projectPath: string = '';
  private wpThemePath: string = '';
  private jobId: string = '';
  private themeName: string = '';

  private async copyDir(src: string, dest: string): Promise<void> {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await this.copyDir(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  private async optimizeImage(inputPath: string, outputPath: string): Promise<void> {
    try {
      const ext = path.extname(inputPath).toLowerCase();
      if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        await sharp(inputPath)
          .webp({ quality: 80 })
          .toFile(outputPath.replace(ext, '.webp'));
        
        // Keep original too
        await fs.copyFile(inputPath, outputPath);
      } else {
        await fs.copyFile(inputPath, outputPath);
      }
    } catch (error) {
      // Fallback: just copy
      await fs.copyFile(inputPath, outputPath);
    }
  }

  private generateStyleCSS(): string {
    return `/*
Theme Name: ${this.themeName}
Theme URI: https://example.com
Author: SiteScape AI
Author URI: https://example.com
Description: AI-generated WordPress theme with Elementor support
Version: 1.0.0
License: GNU General Public License v2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
Text Domain: ${this.themeName.toLowerCase().replace(/\s+/g, '-')}
Tags: elementor, ai-generated, responsive
*/

/* Theme styles are enqueued via functions.php */
`;
  }

  private generateFunctionsPHP(): string {
    return `<?php
/**
 * ${this.themeName} functions and definitions
 */

if (!defined('ABSPATH')) {
    exit;
}

// Theme setup
function ${this.themeName.toLowerCase().replace(/\s+/g, '_')}_setup() {
    // Add theme support
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', array('search-form', 'comment-form', 'comment-list', 'gallery', 'caption'));
    add_theme_support('custom-logo');
    add_theme_support('responsive-embeds');
    
    // Elementor support
    add_theme_support('elementor');
    
    // Register navigation menus
    register_nav_menus(array(
        'primary' => __('Primary Menu', '${this.themeName.toLowerCase().replace(/\s+/g, '-')}'),
        'footer' => __('Footer Menu', '${this.themeName.toLowerCase().replace(/\s+/g, '-')}'),
    ));
}
add_action('after_setup_theme', '${this.themeName.toLowerCase().replace(/\s+/g, '_')}_setup');

// Enqueue scripts and styles
function ${this.themeName.toLowerCase().replace(/\s+/g, '_')}_scripts() {
    // Enqueue main stylesheet
    wp_enqueue_style('${this.themeName.toLowerCase().replace(/\s+/g, '-')}-style', get_stylesheet_uri(), array(), '1.0.0');
    
    // Enqueue custom styles
    wp_enqueue_style('${this.themeName.toLowerCase().replace(/\s+/g, '-')}-main', get_template_directory_uri() . '/assets/css/main.css', array(), '1.0.0');
    
    // Enqueue scripts
    wp_enqueue_script('${this.themeName.toLowerCase().replace(/\s+/g, '-')}-main', get_template_directory_uri() . '/assets/js/main.js', array('jquery'), '1.0.0', true);
}
add_action('wp_enqueue_scripts', '${this.themeName.toLowerCase().replace(/\s+/g, '_')}_scripts');

// Elementor compatibility
function ${this.themeName.toLowerCase().replace(/\s+/g, '_')}_register_elementor_locations($elementor_theme_manager) {
    $elementor_theme_manager->register_all_core_location();
}
add_action('elementor/theme/register_locations', '${this.themeName.toLowerCase().replace(/\s+/g, '_')}_register_elementor_locations');

// Custom Elementor widgets
function ${this.themeName.toLowerCase().replace(/\s+/g, '_')}_register_widgets() {
    // Register custom widgets here
    // Example: require_once get_template_directory() . '/widgets/custom-widget.php';
}
add_action('elementor/widgets/widgets_registered', '${this.themeName.toLowerCase().replace(/\s+/g, '_')}_register_widgets');

// Add Elementor support for custom post types
function ${this.themeName.toLowerCase().replace(/\s+/g, '_')}_add_cpt_support() {
    $cpt_support = get_option('elementor_cpt_support');
    if (!$cpt_support) {
        $cpt_support = ['page', 'post'];
        update_option('elementor_cpt_support', $cpt_support);
    }
}
add_action('after_switch_theme', '${this.themeName.toLowerCase().replace(/\s+/g, '_')}_add_cpt_support');
?>
`;
  }

  private generateIndexPHP(): string {
    return `<?php
/**
 * The main template file
 */

get_header();
?>

<main id="main" class="site-main">
    <?php
    if (have_posts()) :
        while (have_posts()) :
            the_post();
            ?>
            <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
                <header class="entry-header">
                    <?php the_title('<h1 class="entry-title">', '</h1>'); ?>
                </header>

                <div class="entry-content">
                    <?php
                    the_content();
                    ?>
                </div>
            </article>
            <?php
        endwhile;
    else :
        ?>
        <p><?php _e('No content found', '${this.themeName.toLowerCase().replace(/\s+/g, '-')}'); ?></p>
        <?php
    endif;
    ?>
</main>

<?php
get_footer();
?>
`;
  }

  private generateHeaderPHP(): string {
    return `<?php
/**
 * The header template
 */
?>
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<div id="page" class="site">
    <header id="masthead" class="site-header">
        <div class="site-branding">
            <?php
            if (has_custom_logo()) {
                the_custom_logo();
            } else {
                ?>
                <h1 class="site-title"><a href="<?php echo esc_url(home_url('/')); ?>"><?php bloginfo('name'); ?></a></h1>
                <?php
            }
            ?>
        </div>

        <nav id="site-navigation" class="main-navigation">
            <?php
            wp_nav_menu(array(
                'theme_location' => 'primary',
                'menu_id' => 'primary-menu',
            ));
            ?>
        </nav>
    </header>

    <div id="content" class="site-content">
`;
  }

  private generateFooterPHP(): string {
    return `<?php
/**
 * The footer template
 */
?>
    </div><!-- #content -->

    <footer id="colophon" class="site-footer">
        <div class="site-info">
            <nav id="footer-navigation" class="footer-navigation">
                <?php
                wp_nav_menu(array(
                    'theme_location' => 'footer',
                    'menu_id' => 'footer-menu',
                ));
                ?>
            </nav>
            <p>&copy; <?php echo date('Y'); ?> <?php bloginfo('name'); ?>. All rights reserved.</p>
        </div>
    </footer>
</div><!-- #page -->

<?php wp_footer(); ?>
</body>
</html>
`;
  }

  private generateDemoContent(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
    xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/"
    xmlns:content="http://purl.org/rss/1.0/modules/content/"
    xmlns:wfw="http://wellformedweb.org/CommentAPI/"
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:wp="http://wordpress.org/export/1.2/">
<channel>
    <title>${this.themeName} Demo Content</title>
    <description>Demo content for ${this.themeName}</description>
    <wp:wxr_version>1.2</wp:wxr_version>
    
    <item>
        <title>Sample Page</title>
        <content:encoded><![CDATA[
            <p>This is sample content. Replace with your own content or edit with Elementor.</p>
        ]]></content:encoded>
        <wp:post_type>page</wp:post_type>
        <wp:status>publish</wp:status>
    </item>
</channel>
</rss>
`;
  }

  async buildWordPressTheme(jobId: string, io: any): Promise<void> {
    try {
      this.jobId = jobId;
      this.projectPath = path.join(process.cwd(), 'projects', jobId);
      
      const scrape = await Scrape.findOne({ jobId });
      this.themeName = scrape?.metadata?.title || 'AI Generated Theme';
      
      this.wpThemePath = path.join(this.projectPath, 'wp-theme');
      
      io.emit('progress', { jobId, status: 'building', progress: 92 });

      // Create theme structure
      await fs.mkdir(path.join(this.wpThemePath, 'assets', 'css'), { recursive: true });
      await fs.mkdir(path.join(this.wpThemePath, 'assets', 'js'), { recursive: true });
      await fs.mkdir(path.join(this.wpThemePath, 'assets', 'images'), { recursive: true });
      await fs.mkdir(path.join(this.wpThemePath, 'assets', 'fonts'), { recursive: true });
      await fs.mkdir(path.join(this.wpThemePath, 'assets', 'videos'), { recursive: true });
      await fs.mkdir(path.join(this.wpThemePath, 'assets', 'audio'), { recursive: true });
      await fs.mkdir(path.join(this.wpThemePath, 'assets', 'documents'), { recursive: true });

      // Generate theme files
      await fs.writeFile(
        path.join(this.wpThemePath, 'style.css'),
        this.generateStyleCSS()
      );

      await fs.writeFile(
        path.join(this.wpThemePath, 'functions.php'),
        this.generateFunctionsPHP()
      );

      await fs.writeFile(
        path.join(this.wpThemePath, 'index.php'),
        this.generateIndexPHP()
      );

      await fs.writeFile(
        path.join(this.wpThemePath, 'header.php'),
        this.generateHeaderPHP()
      );

      await fs.writeFile(
        path.join(this.wpThemePath, 'footer.php'),
        this.generateFooterPHP()
      );

      // Copy and optimize assets
      const scrapedAssetsPath = path.join(this.projectPath, 'scraped');
      
      // Copy CSS
      const cssPath = path.join(scrapedAssetsPath, 'css');
      try {
        const cssFiles = await fs.readdir(cssPath);
        let combinedCSS = '';
        for (const file of cssFiles) {
          combinedCSS += await fs.readFile(path.join(cssPath, file), 'utf-8') + '\n';
        }
        await fs.writeFile(
          path.join(this.wpThemePath, 'assets', 'css', 'main.css'),
          combinedCSS
        );
      } catch {}

      // Copy JS
      const jsPath = path.join(scrapedAssetsPath, 'js');
      try {
        const jsFiles = await fs.readdir(jsPath);
        let combinedJS = '';
        for (const file of jsFiles) {
          combinedJS += await fs.readFile(path.join(jsPath, file), 'utf-8') + '\n';
        }
        await fs.writeFile(
          path.join(this.wpThemePath, 'assets', 'js', 'main.js'),
          combinedJS
        );
      } catch {}

      io.emit('progress', { jobId, status: 'building', progress: 95 });

      // Optimize and copy images
      const imagesPath = path.join(scrapedAssetsPath, 'images');
      try {
        const imageFiles = await fs.readdir(imagesPath);
        logger.info('Theme Builder', `Copying ${imageFiles.length} images...`);
        for (const file of imageFiles) {
          await this.optimizeImage(
            path.join(imagesPath, file),
            path.join(this.wpThemePath, 'assets', 'images', file)
          );
        }
        logger.success('Theme Builder', `Copied ${imageFiles.length} images`);
      } catch (error: any) {
        logger.warning('Theme Builder', 'No images to copy');
      }

      // Copy fonts
      const fontsPath = path.join(scrapedAssetsPath, 'fonts');
      try {
        const fontFiles = await fs.readdir(fontsPath);
        logger.info('Theme Builder', `Copying ${fontFiles.length} fonts...`);
        for (const file of fontFiles) {
          await fs.copyFile(
            path.join(fontsPath, file),
            path.join(this.wpThemePath, 'assets', 'fonts', file)
          );
        }
        logger.success('Theme Builder', `Copied ${fontFiles.length} fonts`);
      } catch (error: any) {
        logger.warning('Theme Builder', 'No fonts to copy');
      }

      // Copy videos
      const videosPath = path.join(scrapedAssetsPath, 'videos');
      try {
        const videoFiles = await fs.readdir(videosPath);
        logger.info('Theme Builder', `Copying ${videoFiles.length} videos...`);
        for (const file of videoFiles) {
          await fs.copyFile(
            path.join(videosPath, file),
            path.join(this.wpThemePath, 'assets', 'videos', file)
          );
        }
        logger.success('Theme Builder', `Copied ${videoFiles.length} videos`);
      } catch (error: any) {
        logger.warning('Theme Builder', 'No videos to copy');
      }

      // Copy audio
      const audioPath = path.join(scrapedAssetsPath, 'audio');
      try {
        const audioFiles = await fs.readdir(audioPath);
        logger.info('Theme Builder', `Copying ${audioFiles.length} audio files...`);
        for (const file of audioFiles) {
          await fs.copyFile(
            path.join(audioPath, file),
            path.join(this.wpThemePath, 'assets', 'audio', file)
          );
        }
        logger.success('Theme Builder', `Copied ${audioFiles.length} audio files`);
      } catch (error: any) {
        logger.warning('Theme Builder', 'No audio files to copy');
      }

      // Copy documents
      const documentsPath = path.join(scrapedAssetsPath, 'documents');
      try {
        const documentFiles = await fs.readdir(documentsPath);
        logger.info('Theme Builder', `Copying ${documentFiles.length} documents...`);
        for (const file of documentFiles) {
          await fs.copyFile(
            path.join(documentsPath, file),
            path.join(this.wpThemePath, 'assets', 'documents', file)
          );
        }
        logger.success('Theme Builder', `Copied ${documentFiles.length} documents`);
      } catch (error: any) {
        logger.warning('Theme Builder', 'No documents to copy');
      }

      // Generate demo content
      const demoContentPath = path.join(this.projectPath, 'demo-content.xml');
      await fs.writeFile(demoContentPath, this.generateDemoContent());

      // Generate asset manifest
      const manifest = await this.generateAssetManifest(scrapedAssetsPath);
      await fs.writeFile(
        path.join(this.projectPath, 'asset-manifest.json'),
        JSON.stringify(manifest, null, 2)
      );

      // AI Validation before packaging
      logger.ai('Validation', 'AI reviewing project completeness...');
      const validation = await aiService.validateProjectCompleteness(this.projectPath, manifest);
      
      if (validation.success && validation.data) {
        try {
          const validationResult = JSON.parse(validation.data);
          logger.ai('Validation', `AI Review: ${validationResult.summary}`, validationResult);
          
          if (!validationResult.canProceed && validationResult.severity === 'high') {
            logger.error('Validation', 'Critical issues found, but proceeding with available assets', validationResult.issues);
          } else if (validationResult.issues && validationResult.issues.length > 0) {
            logger.warning('Validation', `AI found ${validationResult.issues.length} issues`, validationResult.issues);
          } else {
            logger.success('Validation', 'AI validation passed - project is complete');
          }
        } catch (error: any) {
          logger.warning('Validation', 'AI validation response could not be parsed, proceeding anyway');
        }
      }

      // Generate README
      const readme = `# ${this.themeName}

## Installation Instructions

1. **Upload Theme**
   - Go to WordPress Admin > Appearance > Themes
   - Click "Add New" > "Upload Theme"
   - Choose the theme zip file
   - Click "Install Now" and then "Activate"

2. **Import Demo Content**
   - Go to Tools > Import
   - Install "WordPress Importer" if not already installed
   - Click "Run Importer"
   - Upload the \`demo-content.xml\` file
   - Check "Download and import file attachments"
   - Click "Submit"

3. **Configure Elementor**
   - Install Elementor plugin (free or Pro)
   - Go to Elementor > Settings
   - The theme is already configured for Elementor compatibility
   - Edit any page with Elementor to customize

4. **Customize**
   - Go to Appearance > Customize to configure site identity, menus, etc.
   - Use Elementor to edit page layouts and content
   - All styles and assets are optimized and ready to use

## Features
- Fully responsive design
- Elementor compatible (Free & Pro)
- Optimized assets (WebP images)
- Clean, semantic code
- SEO-friendly structure

## Support
This theme was generated by SiteScape AI. For customization, use Elementor or edit theme files directly.
`;
      await fs.writeFile(path.join(this.projectPath, 'README.md'), readme);

      // Save build metadata
      const stats = await this.getDirectoryStats(this.wpThemePath);
      
      await Build.create({
        jobId,
        wpThemePath: this.wpThemePath,
        demoContentPath,
        zipPath: '',
        metadata: {
          themeName: this.themeName,
          themeVersion: '1.0.0',
          elementorCompatible: true,
          totalFiles: stats.fileCount,
          zipSize: 0
        }
      });

      await Scrape.findOneAndUpdate(
        { jobId },
        { status: 'completed', progress: 100 }
      );

      io.emit('progress', { jobId, status: 'completed', progress: 100 });

    } catch (error: any) {
      await Scrape.findOneAndUpdate(
        { jobId },
        { status: 'failed', error: error.message }
      );
      io.emit('error', { jobId, error: error.message });
      throw error;
    }
  }

  private async getDirectoryStats(dir: string): Promise<{ fileCount: number; totalSize: number }> {
    let fileCount = 0;
    let totalSize = 0;

    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const stats = await this.getDirectoryStats(fullPath);
        fileCount += stats.fileCount;
        totalSize += stats.totalSize;
      } else {
        fileCount++;
        const stat = await fs.stat(fullPath);
        totalSize += stat.size;
      }
    }

    return { fileCount, totalSize };
  }

  private async generateAssetManifest(scrapedAssetsPath: string): Promise<any> {
    const manifest: any = {
      generatedAt: new Date().toISOString(),
      themeName: this.themeName,
      assets: {
        images: [],
        videos: [],
        fonts: [],
        audio: [],
        documents: [],
        css: [],
        js: []
      },
      summary: {
        totalImages: 0,
        totalVideos: 0,
        totalFonts: 0,
        totalAudio: 0,
        totalDocuments: 0,
        totalCSS: 0,
        totalJS: 0,
        totalSize: 0
      }
    };

    const assetTypes = ['images', 'videos', 'fonts', 'audio', 'documents', 'css', 'js'];

    for (const type of assetTypes) {
      const typePath = path.join(scrapedAssetsPath, type);
      try {
        const files = await fs.readdir(typePath);
        for (const file of files) {
          const filePath = path.join(typePath, file);
          const stats = await fs.stat(filePath);
          manifest.assets[type].push({
            name: file,
            size: stats.size,
            sizeFormatted: this.formatBytes(stats.size)
          });
          manifest.summary[`total${type.charAt(0).toUpperCase() + type.slice(1)}`] = files.length;
          manifest.summary.totalSize += stats.size;
        }
      } catch {}
    }

    manifest.summary.totalSizeFormatted = this.formatBytes(manifest.summary.totalSize);
    manifest.summary.totalAssets = Object.values(manifest.summary).reduce((sum: number, val: any) => {
      return typeof val === 'number' && val !== manifest.summary.totalSize ? sum + val : sum;
    }, 0);

    return manifest;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}

export default new WPThemeBuilder();
