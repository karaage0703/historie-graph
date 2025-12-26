// data.json変換スクリプト
// media配列をeventsから分離し、独立したエンティティとして管理する

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// data.jsonを読み込み
const dataPath = resolve(__dirname, '../public/data.json');
const originalData = JSON.parse(readFileSync(dataPath, 'utf-8'));

// メディアIDを生成する関数（タイトルからslugを作成）
function generateMediaId(title) {
  const idMap = {
    '封神演義': 'houshin-engi',
    '東周英雄伝': 'toushu-eiyuuden',
    'キングダム': 'kingdom',
    '史記': 'shiki',
    '達人伝': 'tatsujin-den',
    '墨攻': 'bokkou',
    '名人伝': 'meijin-den',
    '項羽と劉邦': 'kouu-to-ryuuhou',
    '三国志': 'sangokushi',
    '蒼天航路': 'souten-kouro',
    '山月記': 'sangetsuki',
    '三体': 'three-body',
    'ヒストリエ': 'historie',
    'ヘウレーカ': 'heureka',
    'ブッダ': 'buddha',
    'アド・アストラ': 'ad-astra',
    '火の鳥 エジプト編': 'hinotori-egypt',
    '火の鳥 ギリシャ編': 'hinotori-greece',
    '火の鳥 ローマ編': 'hinotori-rome',
    'テルマエ・ロマエ': 'thermae-romae',
    'ベルサイユのばら': 'versailles-no-bara',
    '火の鳥 黎明編': 'hinotori-reimei',
    '火の鳥 ヤマト編': 'hinotori-yamato',
    '火の鳥 太陽編': 'hinotori-taiyo',
    '火の鳥 鳳凰編': 'hinotori-houou',
    '火の鳥 羽衣編': 'hinotori-hagoromo',
    '童の神': 'warawa-no-kami',
    'あさきゆめみし': 'asaki-yumemishi',
    '火の鳥 乱世編': 'hinotori-ransei',
    '逃げ上手の若君': 'nige-jouzu-no-wakagimi',
    '火の鳥 異形編': 'hinotori-igyou',
    'チ。―地球の運動について―': 'chi-chikyu-no-undou',
    'センゴク': 'sengoku',
    '花の慶次': 'hana-no-keiji',
    '殺っちゃえ！！宇喜多さん': 'yacchaue-ukita-san',
    'へうげもの': 'hyouge-mono',
    '忍びの国': 'shinobi-no-kuni',
    '覇王の家': 'haou-no-ie',
    '影武者徳川家康': 'kagemusha-tokugawa',
    'シグルイ': 'shigurui',
    'るろうに剣心': 'rurouni-kenshin',
    '燃えよ剣': 'moeyo-ken',
    '竜馬がゆく': 'ryouma-ga-yuku',
    'ゴールデンカムイ': 'golden-kamuy',
    '松かげに憩う': 'matsukage-ni-ikou',
    '鬼滅の刃': 'kimetsu-no-yaiba',
    'プロジェクト・ヘイル・メアリー': 'project-hail-mary',
    '火の鳥 未来編': 'hinotori-mirai',
    '火の鳥 宇宙編': 'hinotori-uchu',
    '火の鳥 復活編': 'hinotori-fukkatsu',
    '火の鳥 望郷編': 'hinotori-boukyou',
    '火の鳥 生命編': 'hinotori-seimei',
  };
  return idMap[title] || title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

// メディアを抽出・集約
const mediaMap = new Map(); // title -> { media, relatedEventIds }

for (const event of originalData.events) {
  if (event.media && event.media.length > 0) {
    for (const mediaItem of event.media) {
      const existing = mediaMap.get(mediaItem.title);
      if (existing) {
        // 既存のメディアにイベントIDを追加
        if (!existing.relatedEventIds.includes(event.id)) {
          existing.relatedEventIds.push(event.id);
        }
      } else {
        // 新しいメディアを追加
        mediaMap.set(mediaItem.title, {
          id: generateMediaId(mediaItem.title),
          title: mediaItem.title,
          type: mediaItem.type,
          remark: mediaItem.remark,
          coverageStartYear: mediaItem.coverageStartYear,
          coverageEndYear: mediaItem.coverageEndYear,
          kindleUrl: mediaItem.kindleUrl,
          relatedEventIds: [event.id],
        });
      }
    }
  }
}

// 新しいイベント配列（mediaフィールドを削除）
const newEvents = originalData.events.map(event => {
  const { media, ...eventWithoutMedia } = event;
  return eventWithoutMedia;
});

// メディア配列
const mediaArray = Array.from(mediaMap.values()).sort((a, b) => {
  // coverageStartYearでソート
  const aYear = a.coverageStartYear ?? 0;
  const bYear = b.coverageStartYear ?? 0;
  return aYear - bYear;
});

// 新しいデータ構造
const newData = {
  events: newEvents,
  media: mediaArray,
};

// 書き出し
writeFileSync(dataPath, JSON.stringify(newData, null, 2));

console.log(`変換完了!`);
console.log(`イベント数: ${newEvents.length}`);
console.log(`メディア数: ${mediaArray.length}`);
console.log(`\n各メディアの関連イベント数:`);
for (const media of mediaArray) {
  console.log(`  ${media.title}: ${media.relatedEventIds.length}件`);
}
