import { readdirSync, renameSync, readFileSync } from 'fs';
import { join } from 'path';

const postsDir = join(import.meta.dirname, '..', 'src', 'content', 'posts');

// Manual mapping: Japanese filename part → English slug
const slugMap = {
  'シリコンバレーに行きたいんやー': 'i-want-to-go-to-silicon-valley',
  'シリコンバレーへの道、現在の進捗状況': 'road-to-silicon-valley-progress',
  '初めての航空券購入': 'first-flight-ticket',
  'シリコンバレーカンファレンス2011に関して': 'about-sv-conference-2011',
  'レジュメの推薦文をゲット': 'got-recommendation-letter',
  '英語を勉強しなきゃ・・': 'need-to-study-english',
  'このブログのファンページ作ってみました': 'created-blog-fan-page',
  'なぜシリコンバレーに行きたいのか': 'why-i-want-to-go-to-silicon-valley',
  'olympus-pen-lite-e-pl2を買いました。': 'bought-olympus-pen-lite',
  'appleスティーブ・ジョブズが余命6週間だと・・': 'steve-jobs-health-news',
  'ジョブズが元気な姿を': 'jobs-looking-well',
  '英語教室に通いだしました。結局ww': 'started-english-class',
  'お客さんからのアドバイス': 'advice-from-clients',
  'シリコンバレーカンファレンス2011まであと1週間': 'one-week-to-sv-conference-2011',
  '渡米前日': 'day-before-departure',
  'シリコンバレーにいて僕らにできること': 'what-we-can-do-from-silicon-valley',
  'シリコンバレー放浪記サンフランシスコ初日': 'sv-diary-first-day-in-sf',
  'シリコンバレー放浪記2gree、twitter訪問、ギークサロンでかめはめ波': 'sv-diary-2-gree-twitter-visit',
  'シリコンバレー放浪記3シリコンバレーカンファレンス2011当日': 'sv-diary-3-sv-conference-day',
  'シリコンバレー放浪記4google訪問': 'sv-diary-4-google-visit',
  'シリコンバレー放浪記5facebook訪問': 'sv-diary-5-facebook-visit',
  'サンフランシスコに旅立ちます': 'departing-for-san-francisco',
  'サンフランシスコで初出勤': 'first-day-at-work-in-sf',
  'サンフランシスコの家探しで学んだこと': 'apartment-hunting-in-sf',
  '色んな人にサンフランシスコで出会った日': 'meeting-people-in-sf',
  'サンフランシスコ厳重警戒体制': 'sf-high-alert',
  '起業家にとっての理想のオフィス環境とは': 'ideal-office-for-entrepreneurs',
  'サンフランシスコで一ヶ月働いてみて': 'one-month-working-in-sf',
  'サンフランシスコで一ヶ月生活してみて': 'one-month-living-in-sf',
  'カーシェアリングサービスzipcarが便利過ぎる': 'zipcar-is-amazing',
  'ちょっとリッチなハイヤーサービスuberを使ってみた': 'trying-uber-car-service',
  'サンフランシスコ生活も半分が過ぎました': 'halfway-through-sf-life',
  '世界一周の旅に出る成瀬くんがインタビューに来ました。': 'interview-with-naruse',
  'シリコンバレーで最も行列ができるラーメン屋「俺ん家」に行ってきた': 'best-ramen-in-silicon-valley',
  'dena南場社長が退任されるみたいで': 'dena-ceo-namba-stepping-down',
  'japannightまであと一ヶ月': 'one-month-to-japannight',
  'まさかサンフランシスコで矢沢永吉を知るとは': 'discovering-yazawa-in-sf',
  'メジャーリーグatt-parkでsfジャイアンツの試合を観戦': 'sf-giants-game-at-att-park',
  'サンフランシスコ生活もあと2週間をきりました': 'two-weeks-left-in-sf',
  'なぜ日本のit業界のプレゼンスが低いのか': 'why-japan-it-presence-is-low',
  'ブログのパワー。ブログやるって大事よね': 'power-of-blogging',
  '勢いのある人の元で働くということ': 'working-with-ambitious-people',
  '第2回japannight大盛況でした': 'japannight-2-was-a-success',
  '3ヶ月間のサンフランシスコ生活を振り返り': 'reflecting-on-3-months-in-sf',
  '人の縁とは不思議なものtech系ブロガー瀬戸口くんststgcとランチ': 'lunch-with-tech-blogger-setoguchi',
  '会社名が決まりましたロゴコンペ開催': 'company-name-decided-logo-contest',
  'ロゴと事業と創業メンバーとパーティーなど': 'logo-business-founding-members',
  'goodpatch設立パーティーグッドパーチー': 'goodpatch-launch-party',
  'btraxでecstudioの山本社長がインターン中': 'ecstudio-ceo-interning-at-btrax',
  'goodpatch法人登記完了': 'goodpatch-officially-incorporated',
  '明日から2ヶ月ぶりのサンフランシスコへ': 'returning-to-sf-after-2-months',
  'グローバルに繋がるco-working-space-the-hubを日本に': 'bringing-the-hub-to-japan',
  'san-franciscoのその他co-working-spacedogpatchlabs、rocketspaceなど': 'sf-coworking-spaces-dogpatch-rocketspace',
  'japannight最終予選が10月8日に開催スタートアップ12社による英語プレゼン、豪華ゲストによるパネルディスカッシ': 'japannight-final-selection-oct-8',
  '近況報告とhub-tokyo進捗': 'update-and-hub-tokyo-progress',
  '2011年を振り返り忘れられない一年でした': 'looking-back-at-2011',
  '起業して6ヶ月経ちました': '6-months-since-founding',
  'ちょうど一年前': 'exactly-one-year-ago',
  'etsyでmac-book-airケースを注文してみた': 'ordering-macbook-case-on-etsy',
  '第4回sf-new-tech-japannight日本予選、明日開催': 'japannight-4-japan-selection',
  'startup-weekend-tokyoで優勝しました': 'won-startup-weekend-tokyo',
  'gunosyというサービスに関わって思うこと': 'thoughts-on-gunosy',
  '起業して一年が経ちました': 'one-year-since-founding',
  'グッドパッチの人材募集と今後の仕事': 'goodpatch-hiring-and-future',
  'ブログ移転しました。': 'blog-migrated',
  '努力したものがすべて成功するとは限らん-だが成功したものはすべからく努力しておる': 'effort-and-success',
  '2012年に経営者として気付いたこと': 'lessons-as-ceo-in-2012',
  '10坪の秋葉原のオフィス': 'small-office-in-akihabara',
  '人材の引きが凄い件': 'amazing-talent-attraction',
  '宮崎と福岡とシリコンバレーと': 'miyazaki-fukuoka-and-silicon-valley',
  'あれから1年が経ちグッドパッチは20人になりました': 'goodpatch-turns-1-year-20-people',
  'dena南場さんのとても人間臭くて格好良い不格好経営': 'book-review-namba-unglamorous-management',
  '起業に踏みきれたキッカケ': 'what-triggered-my-startup',
  '4年越しで': 'after-4-years',
  '起業して二年が経ちました': 'two-years-since-founding',
  'じいちゃんの葬儀': 'grandfathers-funeral',
  '1億円の資金調達の経緯とグッドパッチの今後': 'raising-100m-yen-and-goodpatch-future',
  'このブログをはじめて丸3年経った': '3-years-of-blogging',
  '社員を連れてシリコンバレーサンフランシスコに行ってきます': 'taking-team-to-silicon-valley',
  'グッドパッチがスタートアップの仕事を受ける理由': 'why-goodpatch-works-with-startups',
  '渋谷に移転したので今までのオフィスを写真で振り返ってみる': 'moved-to-shibuya-office-history',
  '未経験者から入ったスタッフの門出': 'farewell-to-first-staff',
  'みんなで10年後のグッドパッチを考えたワークショップ': 'workshop-goodpatch-10-year-vision',
  'グッドパッチにデザイナーが集まる理由': 'why-designers-join-goodpatch',
  '2014年の振り返りと2015年の予想': 'looking-back-at-2014',
  'グッドパッチ第1号社員の卒業': 'first-employee-graduates',
  'uiに事業を絞ってから3年が経った': '3-years-focused-on-ui',
  'ベルリンにオフィスを出した理由': 'why-we-opened-berlin-office',
  '家族がいる起業家の働き方': 'entrepreneur-work-life-with-family',
  'monodukuri': 'monodukuri',
  '2015年を振り返る': 'looking-back-at-2015',
  'キッチンのあるオフィス': 'office-with-kitchen',
  '社長の憂鬱-melancholy-ceo': 'melancholy-ceo',
  '2016年を振り返る': 'looking-back-at-2016',
  'balto': 'balto',
  'noteでブログは更新を続けてます': 'blog-continues-on-note',
};

const files = readdirSync(postsDir).filter(f => f.endsWith('.md'));
let renamed = 0;
let skipped = 0;
let notFound = 0;

for (const file of files) {
  // Extract date prefix and Japanese part
  const match = file.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.md$/);
  if (!match) {
    console.log(`⚠️  Skipped (no date): ${file}`);
    skipped++;
    continue;
  }

  const [, datePrefix, jaSlug] = match;

  // Check if already English (no Japanese chars)
  if (!/[\u3000-\u9FFF\uFF00-\uFFEF]/.test(jaSlug) && !slugMap[jaSlug]) {
    // Already English and not in slug map
    console.log(`✓  Already English: ${file}`);
    skipped++;
    continue;
  }

  const englishSlug = slugMap[jaSlug];
  if (!englishSlug) {
    console.log(`❌ No mapping for: ${jaSlug}`);
    notFound++;
    continue;
  }

  const newFile = `${datePrefix}-${englishSlug}.md`;
  if (file === newFile) {
    console.log(`✓  Same name: ${file}`);
    skipped++;
    continue;
  }

  renameSync(join(postsDir, file), join(postsDir, newFile));
  console.log(`📝 ${file} → ${newFile}`);
  renamed++;
}

console.log(`\n✅ Renamed: ${renamed}`);
console.log(`⏭️  Skipped: ${skipped}`);
console.log(`❌ Not found: ${notFound}`);
