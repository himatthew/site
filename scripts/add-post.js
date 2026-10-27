import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_SRC = path.resolve(__dirname, '../src/data/posts.json');
const DATA_PUB = path.resolve(__dirname, '../public/data/posts.json');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

async function main() {
  console.log('\n✨ === 喜迁阳邑 Feed 新增每日动态 === ✨\n');

  let localPosts = [];
  try {
    if (fs.existsSync(DATA_SRC)) {
      localPosts = JSON.parse(fs.readFileSync(DATA_SRC, 'utf8'));
    }
  } catch (err) {
    localPosts = [];
  }

  const now = new Date();
  const pad = (n) => (n < 10 ? '0' + n : n.toString());
  const defaultTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const timeInput = await question(`1. 发布时间 [默认: ${defaultTime}]: `);
  const publish_time = timeInput.trim() || defaultTime;

  const descInput = await question('2. 文案描述 (可留空或输入文字): ');
  const desc = descInput.trim() || '.';

  const mediaList = [];
  console.log('\n3. 添加媒体内容 (直接按回车结束添加):');
  let itemIndex = 1;
  while (true) {
    const urlInput = await question(`   - 媒体 #${itemIndex} URL (图片/视频/音频链接，留空跳过): `);
    const contentUrl = urlInput.trim();
    if (!contentUrl) break;

    const typeInput = await question(`     类型 (image / video / audio) [默认 image]: `);
    let type = typeInput.trim().toLowerCase() || 'image';
    if (!['image', 'video', 'audio'].includes(type)) type = 'image';

    let cover_image;
    if (type === 'video') {
      const coverInput = await question(`     视频封面图 URL (可选，直接回车跳过): `);
      cover_image = coverInput.trim() || undefined;
    }

    mediaList.push({
      id: Date.now() + itemIndex,
      type,
      content: contentUrl,
      sort: itemIndex,
      cover_image,
      download: type === 'video' ? contentUrl : undefined,
    });
    itemIndex++;
  }

  const maxId = localPosts.reduce((max, p) => (p.id > max ? p.id : max), 0);
  const newPostId = maxId + 1;

  const newPost = {
    id: newPostId,
    if_comment: 0,
    status: 'published',
    desc,
    publish_time,
    content: mediaList.map((m, idx) => ({ ...m, posts_id: newPostId, sort: idx + 1 })),
    comment_list: [],
  };

  const updatedPosts = [newPost, ...localPosts].sort(
    (a, b) => new Date(b.publish_time).getTime() - new Date(a.publish_time).getTime()
  );

  const formattedJson = JSON.stringify(updatedPosts, null, 2);
  fs.writeFileSync(DATA_SRC, formattedJson, 'utf8');
  fs.writeFileSync(DATA_PUB, formattedJson, 'utf8');

  console.log(`\n🎉 成功添加 ID 为 ${newPostId} 的新动态！`);
  console.log(`📁 已更新 ${DATA_SRC} 和 ${DATA_PUB}`);
  console.log('\n🚀 现在可以运行以下命令提交到 GitHub 并触发 Vercel 自动部署：');
  console.log(`   git add . && git commit -m "feat(feed): update ${publish_time.slice(0, 10)}" && git push\n`);

  rl.close();
}

main();
