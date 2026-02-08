/**
 * Tumblr記事スクレイピングスクリプト
 *
 * Tumblr APIv1を使用して記事を取得し、Markdownに変換します。
 * 使い方: npx tsx scripts/scrape-tumblr.ts
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const BLOG_NAME = 'likeasiliconvalley';
const TUMBLR_URL = `https://${BLOG_NAME}.tumblr.com`;
const OUTPUT_DIR = join(import.meta.dirname, '..', 'src', 'content', 'posts');

interface TumblrPost {
  id: number;
  date: string;
  slug: string;
  title?: string;
  body?: string;
  caption?: string;
  tags: string[];
  type: string;
  'regular-title'?: string;
  'regular-body'?: string;
  'photo-caption'?: string;
  'photo-url-1280'?: string;
  'link-text'?: string;
  'link-url'?: string;
  'link-description'?: string;
}

interface TumblrAPIResponse {
  tumblelog: { title: string; description: string };
  posts: TumblrPost[];
  'posts-total': number;
}

function htmlToMarkdown(html: string): string {
  let md = html;

  md = md.replace(/<script[\s\S]*?<\/script>/gi, '');
  md = md.replace(/<style[\s\S]*?<\/style>/gi, '');

  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '# $1\n\n');
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '## $1\n\n');
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '### $1\n\n');
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '#### $1\n\n');

  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '[$2]($1)');

  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)');
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, '![]($1)');

  md = md.replace(/<(strong|b)>([\s\S]*?)<\/\1>/gi, '**$2**');
  md = md.replace(/<(em|i)>([\s\S]*?)<\/\1>/gi, '*$2*');

  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, '- $1\n');
  md = md.replace(/<\/?[ou]l[^>]*>/gi, '\n');

  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, '> $1\n\n');

  md = md.replace(/<code>([\s\S]*?)<\/code>/gi, '`$1`');
  md = md.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, '```\n$1\n```\n\n');

  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '$1\n\n');
  md = md.replace(/<div[^>]*>([\s\S]*?)<\/div>/gi, '$1\n');

  md = md.replace(/<[^>]+>/g, '');

  md = md.replace(/&amp;/g, '&');
  md = md.replace(/&lt;/g, '<');
  md = md.replace(/&gt;/g, '>');
  md = md.replace(/&quot;/g, '"');
  md = md.replace(/&#39;/g, "'");
  md = md.replace(/&nbsp;/g, ' ');

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

function getPostContent(post: TumblrPost): { title: string; body: string } {
  switch (post.type) {
    case 'regular':
      return {
        title: post['regular-title'] || post.title || 'Untitled',
        body: post['regular-body'] || post.body || '',
      };
    case 'photo':
      const photoBody = [
        post['photo-url-1280'] ? `![]( ${post['photo-url-1280']})` : '',
        post['photo-caption'] || post.caption || '',
      ].filter(Boolean).join('\n\n');
      return {
        title: post.title || 'Photo',
        body: photoBody,
      };
    case 'link':
      const linkBody = [
        post['link-url'] ? `[${post['link-text'] || post['link-url']}](${post['link-url']})` : '',
        post['link-description'] || '',
      ].filter(Boolean).join('\n\n');
      return {
        title: post['link-text'] || post.title || 'Link',
        body: linkBody,
      };
    default:
      return {
        title: post.title || 'Untitled',
        body: post.body || post.caption || '',
      };
  }
}

async function fetchTumblrPosts(): Promise<TumblrPost[]> {
  const posts: TumblrPost[] = [];
  let start = 0;
  const num = 20;

  console.log(`Fetching posts from ${TUMBLR_URL}...`);

  while (true) {
    const apiUrl = `${TUMBLR_URL}/api/read/json?start=${start}&num=${num}`;
    console.log(`  Fetching page starting at ${start}...`);

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        console.error(`  HTTP error: ${response.status}`);
        break;
      }

      let text = await response.text();
      // Tumblr API v1 returns JSONP: var tumblr_api_read = {...};
      text = text.replace(/^var tumblr_api_read = /, '').replace(/;\s*$/, '');

      const data = JSON.parse(text) as TumblrAPIResponse;

      if (!data.posts || data.posts.length === 0) {
        console.log('  No more posts found.');
        break;
      }

      posts.push(...data.posts);
      console.log(`  Found ${data.posts.length} posts (total: ${posts.length} / ${data['posts-total']})`);

      if (posts.length >= data['posts-total'] || data.posts.length < num) break;
      start += num;
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

  const posts = await fetchTumblrPosts();
  console.log(`\nTotal posts fetched: ${posts.length}`);

  for (const post of posts) {
    const { title, body } = getPostContent(post);
    const date = new Date(post.date);
    const dateStr = date.toISOString().split('T')[0];
    const slug = post.slug || slugify(title) || `tumblr-${post.id}`;
    const filename = `${dateStr}-${slug}.md`;
    const filepath = join(OUTPUT_DIR, filename);

    const markdown = htmlToMarkdown(body);
    const tags = (post.tags || []).map(t => `"${t}"`).join(', ');
    const description = markdown.slice(0, 120).replace(/\n/g, ' ').replace(/"/g, '\\"');

    const frontmatter = `---
title: "${title.replace(/"/g, '\\"')}"
date: ${dateStr}
description: "${description}"
tags: [${tags}]
source: "tumblr"
---`;

    const content = `${frontmatter}\n\n${markdown}\n`;

    writeFileSync(filepath, content, 'utf-8');
    console.log(`  Written: ${filename}`);
  }

  console.log(`\nDone! ${posts.length} posts saved to ${OUTPUT_DIR}`);
}

main().catch(console.error);
