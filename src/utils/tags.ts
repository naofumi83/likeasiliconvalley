// Tag display name → URL slug mapping
const TAG_SLUG_MAP: Record<string, string> = {
  'サンフランシスコ': 'san-francisco',
  'Goodpatch': 'goodpatch',
  '起業': 'startup',
  '振り返り': 'reflection',
  '人': 'people',
  'イベント': 'events',
  'オフィス': 'office',
  '働き方': 'workstyle',
  'デザイン': 'design',
  'サービス': 'services',
  'プロダクト': 'product',
  '資金調達': 'fundraising',
  '海外展開': 'global-expansion',
  'シリコンバレーカンファレンス': 'sv-conference',
  '英語': 'english',
  '求人募集': 'hiring',
  '名言': 'quotes',
  'グッドパッチ': 'goodpatch-jp',
  '経営': 'management',
};

// Reverse map: slug → display name
const SLUG_TAG_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(TAG_SLUG_MAP).map(([name, slug]) => [slug, name])
);

export function tagToSlug(tag: string): string {
  return TAG_SLUG_MAP[tag] || tag.toLowerCase().replace(/\s+/g, '-');
}

export function slugToTag(slug: string): string {
  return SLUG_TAG_MAP[slug] || slug;
}

export function tagUrl(tag: string): string {
  return `/tags/${tagToSlug(tag)}`;
}
