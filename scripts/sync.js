import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_SRC = path.resolve(__dirname, '../src/data/posts.json');
const DATA_PUB = path.resolve(__dirname, '../public/data/posts.json');

async function syncFeed() {
  console.log('🔄 开始同步喜迁阳邑 (xiqianyangyi.com/feed) 最新动态...');

  let localPosts = [];
  try {
    if (fs.existsSync(DATA_SRC)) {
      localPosts = JSON.parse(fs.readFileSync(DATA_SRC, 'utf8'));
    }
  } catch (err) {
    console.warn('⚠️ 读取本地 posts.json 失败，将重新全量拉取。');
  }

  const existingIds = new Set(localPosts.map((p) => p.id));
  const fetchedItems = [];
  let page = 1;
  let pageCount = 1;

  while (page <= pageCount) {
    try {
      const url = `https://api.xiqianyangyi.com/content/posts/list_posts?page=${page}`;
      const res = await fetch(url).then((r) => r.json());
      if (res.code === 0 && res.result) {
        pageCount = res.result.page_count;
        const items = res.result.item_list || [];
        fetchedItems.push(...items);
        console.log(`  第 ${page}/${pageCount} 页：抓取到 ${items.length} 条数据`);
      } else {
        break;
      }
    } catch (e) {
      console.error(`  抓取第 ${page} 页失败:`, e.message);
      break;
    }
    page++;
  }

  if (fetchedItems.length === 0) {
    console.log('❌ 未获取到任何上游数据，停止同步。');
    return;
  }

  // Merge: keep all fetched, and retain any local custom posts
  const fetchedIds = new Set(fetchedItems.map((p) => p.id));
  const customLocalPosts = localPosts.filter((p) => !fetchedIds.has(p.id));

  // Sort by publish_time descending
  const mergedPosts = [...fetchedItems, ...customLocalPosts].sort((a, b) => {
    return new Date(b.publish_time).getTime() - new Date(a.publish_time).getTime();
  });

  const newCount = fetchedItems.filter((p) => !existingIds.has(p.id)).length;
  console.log(`✅ 同步完成！发现 ${newCount} 条新动态，合并后共 ${mergedPosts.length} 条动态。`);

  // Write to both src/data/posts.json and public/data/posts.json
  const formattedJson = JSON.stringify(mergedPosts, null, 2);
  fs.mkdirSync(path.dirname(DATA_SRC), { recursive: true });
  fs.mkdirSync(path.dirname(DATA_PUB), { recursive: true });
  fs.writeFileSync(DATA_SRC, formattedJson, 'utf8');
  fs.writeFileSync(DATA_PUB, formattedJson, 'utf8');

  console.log(`📁 已更新 ${DATA_SRC} 和 ${DATA_PUB}`);
}

syncFeed();
