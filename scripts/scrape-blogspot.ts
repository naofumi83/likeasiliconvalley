/**
 * Blogspot記事スクレイピングスクリプト
 *
 * Blogger APIを使用して記事を取得し、Markdownに変換します。
 * 使い方: npx tsx scripts/scrape-blogspot.ts
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const BLOG_URL = 'https://likeasiliconvalley.blogspot.com';
const OUTPUT_DIR = join(import.meta.dirname, '..', 'src', 'content', 'posts');

interface BloggerPost {
  id: string;
  published: string;
  title: string;
  content: string;
  labels?: string[];
  url: string;
}

interface BloggerFeed {
  feed: {
    entry?: Array<{
      id: { $t: string };
      published: { $t: string };
      title: { $t: string };
      content: { $t: string };
      category?: Array<{ term: string }>;
      link: Array<{ rel: string; href: string }>;
    }>;
  };
}

function htmlToMarkdown(html: string): string {
  let md = html;
  // Remove scripts and styles
  md = md.replace(/<script[\s\S]*?<\/script>/gi, '');
  md = md.replace(/<style[\s\S]*?<\/style>/gi, '');

  // Convert headers
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '### $1\n\n');
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '#### $1\n\n');

  // Convert links
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');

  // Convert images
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)');
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, '![]($1)');

  // Convert bold/italic
  md = md.replace(/<(strong|b)>([\s\S]*?)<\/\1>/gi, '**$2**');
  md = md.replace(/<(em|i)>([\s\S]*?)<\/\1>/gi, '*$2*');

  // Convert lists
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');
  md = md.replace(/<\/?[ou]l[^>]*>/gi, '\n');

  // Convert blockquotes
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, '> $1\n\n');

  // Convert code
  md = md.replace(/<code>([\s\S]*?)<\/code>/gi, '`$1`');
  md = md.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, '```\n$1\n```\n\n');

  // Convert line breaks and paragraphs
  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n');
  md = md.replace(/<div[^>]*>([\s\S]*?)<\/div>/gi, '$1\n');

  // Remove remaining HTML tags
  md = md.replace(/<[^>]+>/g, '');

  // Decode HTML entities
  md = md.replace(/&amp;/g, '&');
  md = md.replace(/&lt;/g, '<');
  md = md.replace(/&gt;/g, '>');
  md = md.replace(/&quot;/g, '"');
  md = md.replace(/&#39;/g, "'");
  md = md.replace(/&nbsp;/g, ' ');

  // Clean up whitespace
  md = md.replace(/\n{3,}/g, '\n\n');
  md = md.trim();

  return md;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s\u3000-\u9fff-]/g, '')
    .replace(/[\s\u3000]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

async function fetchBloggerPosts(): Promise<BloggerPost[]> {
  const posts: BloggerPost[] = [];
  let startIndex = 1;
  const maxResults = 25;

  console.log(`Fetching posts from ${BLOG_URL}...`);

  while (true) {
    const feedUrl = `${BLOG_URL}/feeds/posts/default?alt=json&start-index=${startIndex}&max-results=${maxResults}`;
    console.log(`  Fetching page starting at index ${startIndex}...`);

    try {
      const response = await fetch(feedUrl);
      if (!response.ok) {
        console.error(`  HTTP error: ${response.status}`);
        break;
      }

      const data = (await response.json()) as BloggerFeed;
      const entries = data.feed.entry;

      if (!entries || entries.length === 0) {
        console.log('  No more entries found.');
        break;
      }

      for (const entry of entries) {
        const alternateLink = entry.link.find(l => l.rel === 'alternate');
        posts.push({
          id: entry.id.$t,
          published: entry.published.$t,
          title: entry.title.$t,
          content: entry.content.$t,
          labels: entry.category?.map(c => c.term),
          url: alternateLink?.href ?? '',
        });
      }

      console.log(`  Found ${entries.length} posts (total: ${posts.length})`);

      if (entries.length < maxResults) break;
      startIndex += maxResults;
    } catch (error) {
      console.error(`  Error fetching posts:`, error);
      break;
    }
  }

  return posts;
}

async function main() {
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const posts = await fetchBloggerPosts();
  console.log(`\nTotal posts fetched: ${posts.length}`);

  for (const post of posts) {
    const date = new Date(post.published);
    const dateStr = date.toISOString().split('T')[0];
    const slug = slugify(post.title) || `post-${dateStr}`;
    const filename = `${dateStr}-${slug}.md`;
    const filepath = join(OUTPUT_DIR, filename);

    const markdown = htmlToMarkdown(post.content);
    const tags = post.labels?.map(l => `"${l}"`).join(', ') ?? '';
    const description = markdown.slice(0, 120).replace(/\n/g, ' ').replace(/"/g, '\\"');

    const frontmatter = `---
title: "${post.title.replace(/"/g, '\\"')}"
date: ${dateStr}
description: "${description}"
tags: [${tags}]
source: "blogspot"
---`;

    const content = `${frontmatter}\n\n${markdown}\n`;

    writeFileSync(filepath, content, 'utf-8');
    console.log(`  Written: ${filename}`);
  }

  console.log(`\nDone! ${posts.length} posts saved to ${OUTPUT_DIR}`);
}

main().catch(console.error);
