const fs = require('fs');
const path = require('path');
const marked = require('marked');

// Create directories if they don't exist
const dirs = ['dist', 'dist/blog', 'dist/css', 'dist/js', 'dist/images'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Create a simple favicon SVG
const faviconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40" fill="#3a86ff" />
  <circle cx="50" cy="50" r="25" fill="#ff006e" />
</svg>`;
fs.writeFileSync('dist/favicon.svg', faviconSVG);

// Helper function to replace template variables
function replaceTemplateVariables(template, replacements) {
  let result = template;
  Object.entries(replacements).forEach(([key, value]) => {
    // Handle conditional sections
    if (key.startsWith('if ')) {
      const conditionName = key.substring(3);
      const ifRegex = new RegExp(`\\{\\{#if ${conditionName}\\}\\}([\\s\\S]*?)\\{\\{/if\\}\\}`, 'g');
      
      if (value) {
        // Keep the content but remove the conditional tags
        result = result.replace(ifRegex, '$1');
      } else {
        // Remove the entire conditional section
        result = result.replace(ifRegex, '');
      }
    } else {
      // Regular variable replacement
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    }
  });
  return result;
}

// Read template files
const mainTemplate = fs.readFileSync('templates/main.html', 'utf8');
const blogTemplate = fs.readFileSync('templates/blog.html', 'utf8');

// Process markdown files
function processMarkdownFiles() {
  // Process pages
  const pages = fs.readdirSync('content/pages');
  pages.forEach(page => {
    if (path.extname(page) === '.md') {
      const content = fs.readFileSync(`content/pages/${page}`, 'utf8');
      const htmlContent = marked.parse(content);
      const pageName = path.basename(page, '.md');
      
      // Check if this is the index page for the hero section
      const isHome = pageName === 'index';
      
      const pageHtml = replaceTemplateVariables(mainTemplate, {
        'title': pageName.charAt(0).toUpperCase() + pageName.slice(1),
        'content': htmlContent,
        'if isHome': isHome
      });
      
      fs.writeFileSync(`dist/${pageName}.html`, pageHtml);
    }
  });

  // Process blog posts
  const posts = fs.readdirSync('content/blog');
  posts.forEach(post => {
    if (path.extname(post) === '.md') {
      const content = fs.readFileSync(`content/blog/${post}`, 'utf8');
      const htmlContent = marked.parse(content);
      const postName = path.basename(post, '.md');
      
      // Extract title from first h1 or use filename
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : postName.replace(/-/g, ' ');
      
      // Extract date from filename or metadata
      const dateMatch = postName.match(/^(\d{4}-\d{2}-\d{2})/);
      const date = dateMatch ? new Date(dateMatch[1]).toLocaleDateString() : 'Unknown date';
      
      const postHtml = replaceTemplateVariables(blogTemplate, {
        'title': title,
        'date': date,
        'content': htmlContent
      });
      
      fs.writeFileSync(`dist/blog/${postName}.html`, postHtml);
    }
  });
}

// Copy static assets
function copyStaticAssets() {
  // Copy CSS
  fs.readdirSync('assets/css').forEach(file => {
    fs.copyFileSync(`assets/css/${file}`, `dist/css/${file}`);
  });
  
  // Copy JS
  fs.readdirSync('assets/js').forEach(file => {
    fs.copyFileSync(`assets/js/${file}`, `dist/js/${file}`);
  });
  
  // Copy images if they exist
  if (fs.existsSync('assets/images')) {
    if (!fs.existsSync('dist/images')) {
      fs.mkdirSync('dist/images', { recursive: true });
    }
    fs.readdirSync('assets/images').forEach(file => {
      fs.copyFileSync(`assets/images/${file}`, `dist/images/${file}`);
    });
  }
}

// Generate blog index
function generateBlogIndex() {
  const posts = fs.readdirSync('content/blog')
    .filter(file => path.extname(file) === '.md')
    .map(file => {
      const content = fs.readFileSync(`content/blog/${file}`, 'utf8');
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const postName = path.basename(file, '.md');
      const title = titleMatch ? titleMatch[1] : postName.replace(/-/g, ' ');
      
      const dateMatch = postName.match(/^(\d{4}-\d{2}-\d{2})/);
      const date = dateMatch ? new Date(dateMatch[1]).toLocaleDateString() : 'Unknown date';
      
      // Extract a preview from the content (first paragraph after the title)
      const previewMatch = content.match(/^#\s+.+\n+(.+)/m);
      const preview = previewMatch ? `${previewMatch[1].substring(0, 150)}...` : '';
      
      return { title, date, url: `/blog/${postName}.html`, preview };
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  
  let blogListHtml = '<div class="blog-list">';
  posts.forEach(post => {
    blogListHtml += `
      <div class="blog-item">
        <span class="blog-date">${post.date}</span>
        <a href="${post.url}" class="blog-link">${post.title}</a>
        <p>${post.preview}</p>
      </div>
    `;
  });
  blogListHtml += '</div>';
  
  const blogIndexHtml = replaceTemplateVariables(mainTemplate, {
    'title': 'Blog',
    'content': `
      <h1>Latest Articles</h1>
      <p>Explore my thoughts, tutorials, and insights about web development and design.</p>
      ${blogListHtml}
    `,
    'if isHome': false
  });
  
  fs.writeFileSync('dist/blog/index.html', blogIndexHtml);
}

// Run the build process
processMarkdownFiles();
copyStaticAssets();
generateBlogIndex();

console.log('Site built successfully!'); 