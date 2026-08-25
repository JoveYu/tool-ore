import rawEmojiData from "unicode-emoji-json/data-by-emoji.json";

export interface EmojiItem {
  char: string;
  name: string;
  category: string;
  group: string;
  subgroup: string;
  keywords: string[];
}

export interface EmojiCategory {
  id: string;
  name: string;
  iconName: string;
}

export const CATEGORY_MAP: Record<string, { name: string; iconName: string }> = {
  "Smileys & Emotion": { name: "笑脸与情绪", iconName: "Smile" },
  "People & Body": { name: "人物与手势", iconName: "Hand" },
  "Animals & Nature": { name: "动物与自然", iconName: "PawPrint" },
  "Food & Drink": { name: "食物与饮品", iconName: "Coffee" },
  "Travel & Places": { name: "旅行与地点", iconName: "Car" },
  "Activities": { name: "活动与运动", iconName: "Trophy" },
  "Objects": { name: "日常物品", iconName: "Package" },
  "Symbols": { name: "标志与符号", iconName: "Sparkles" },
  "Flags": { name: "国旗与旗帜", iconName: "Flag" },
};

// 常见英文词根到中文核心语义的通识词典映射
const TERM_TRANSLATIONS: Record<string, string[]> = {
  // 情绪与表情
  grin: ["笑", "大笑", "笑脸", "开心", "高兴", "喜悦"],
  grinning: ["笑", "大笑", "笑脸", "开心", "高兴", "喜悦"],
  smile: ["笑", "微笑", "笑脸", "开心", "高兴"],
  smiling: ["笑", "微笑", "笑脸", "开心", "高兴"],
  joy: ["笑哭", "快乐", "高兴", "开心", "喜悦", "破涕为笑"],
  laugh: ["大笑", "笑", "哈哈", "开心"],
  laughing: ["大笑", "笑", "哈哈", "开心"],
  sweat: ["流汗", "擦汗", "尴尬", "冷汗", "汗"],
  rofl: ["笑翻", "笑死", "打滚", "大笑"],
  tears: ["眼泪", "流泪", "哭", "哭泣"],
  wink: ["眨眼", "抛媚眼", "调皮"],
  winking: ["眨眼", "抛媚眼", "调皮"],
  blush: ["害羞", "脸红"],
  angel: ["天使", "纯洁", "纯真", "光环"],
  love: ["爱", "喜欢", "恋爱", "爱情", "心动", "爱心"],
  heart: ["心", "爱心", "红心", "喜欢", "爱"],
  hearts: ["心", "爱心", "红心", "喜欢", "爱"],
  kiss: ["亲", "飞吻", "么么哒", "亲亲"],
  kissing: ["亲", "飞吻", "么么哒", "亲亲"],
  yum: ["好吃", "美味", "馋", "流口水"],
  savoring: ["好吃", "美味", "馋"],
  tongue: ["吐舌", "舌头", "搞怪"],
  money: ["钱", "发财", "暴富", "钞票", "金钱", "土豪", "财富"],
  hug: ["抱抱", "拥抱", "热情"],
  hugging: ["抱抱", "拥抱", "热情"],
  think: ["思考", "想一想", "琢磨", "疑问"],
  thinking: ["思考", "想一想", "琢磨", "疑问"],
  quiet: ["安静", "小声", "嘘"],
  shh: ["嘘", "安静", "保密"],
  shushing: ["嘘", "安静", "小声"],
  sleep: ["睡觉", "晚安", "困", "打瞌睡", "呼呼"],
  sleeping: ["睡觉", "晚安", "困", "打瞌睡", "呼呼"],
  sleepy: ["困", "想睡", "打瞌睡"],
  mask: ["口罩", "生病", "防护", "感冒"],
  sick: ["生病", "感冒", "发烧", "难受"],
  vomit: ["呕吐", "恶心", "吐了"],
  vomiting: ["呕吐", "恶心", "吐了"],
  nauseated: ["恶心", "想吐"],
  hot: ["热", "太热了", "火辣", "流汗"],
  cold: ["冷", "太冷了", "结冰", "冻僵"],
  dizzy: ["头晕", "晕倒", "眼花", "晕"],
  explode: ["爆炸", "震惊", "脑洞"],
  exploding: ["爆炸", "震惊", "脑洞"],
  party: ["派对", "庆祝", "过生日", "狂欢"],
  partying: ["派对", "庆祝", "过生日", "狂欢"],
  cool: ["酷", "帅", "装酷", "墨镜"],
  sunglasses: ["墨镜", "太阳镜", "酷", "帅气"],
  nerd: ["眼镜", "书呆子", "学霸", "极客"],
  cry: ["哭", "大哭", "哭泣", "流泪", "伤心", "难过"],
  crying: ["哭", "大哭", "哭泣", "流泪", "伤心", "难过"],
  loudly: ["大声", "号啕"],
  plead: ["求求了", "可怜", "拜托", "汪汪眼", "求助"],
  pleading: ["求求了", "可怜", "拜托", "汪汪眼", "求助"],
  scream: ["尖叫", "惊恐", "吓死", "呐喊"],
  screaming: ["尖叫", "惊恐", "吓死", "呐喊"],
  fear: ["害怕", "恐惧", "心慌"],
  fearful: ["害怕", "恐惧", "心慌"],
  angry: ["生气", "发火", "恼火", "气愤"],
  rage: ["暴怒", "狂怒", "气炸"],
  devil: ["恶魔", "坏蛋", "淘气"],
  skull: ["骷髅", "死亡", "骨头", "笑死"],
  poop: ["便便", "大便", "屎"],
  clown: ["小丑", "面具"],
  ghost: ["幽灵", "鬼", "万圣节"],
  alien: ["外星人", "UFO", "异形"],
  robot: ["机器人", "AI", "人工智能", "机械"],

  // 手势
  wave: ["挥手", "打招呼", "你好", "再见", "拜拜"],
  waving: ["挥手", "打招呼", "你好", "再见", "拜拜"],
  hand: ["手", "手势", "巴掌"],
  hands: ["双手", "手势"],
  ok: ["好的", "没问题", "行", "可以", "ok"],
  pinch: ["捏", "一点点", "微小"],
  pinching: ["捏", "一点点", "微小"],
  peace: ["胜利", "耶", "剪刀手", "和平"],
  victory: ["胜利", "成功", "耶"],
  finger: ["手指", "指向"],
  fingers: ["手指", "指向"],
  point: ["指", "点击", "方向"],
  pointing: ["指", "点击", "方向"],
  left: ["左", "向左"],
  right: ["右", "向右"],
  up: ["上", "向上"],
  down: ["下", "向下"],
  thumb: ["点赞", "好评", "喜欢", "赞", "给力", "棒", "大拇指", "拇指"],
  thumbs: ["点赞", "好评", "喜欢", "赞", "给力", "棒", "大拇指", "拇指"],
  like: ["点赞", "好评", "喜欢", "赞", "给力", "棒"],
  dislike: ["差评", "踩", "反对", "不行"],
  fist: ["握拳", "加油", "出拳", "兄弟", "拳头", "力量"],
  punch: ["拳头", "打架", "碰拳"],
  clap: ["鼓掌", "拍手", "喝彩", "太棒了", "欢迎"],
  clapping: ["鼓掌", "拍手", "喝彩", "太棒了", "欢迎"],
  pray: ["祈祷", "感谢", "拜托", "谢谢", "合十", "保佑"],
  folded: ["合十", "祈祷", "感谢", "拜托", "谢谢"],
  muscle: ["肌肉", "力量", "强壮", "健身", "加油"],
  flex: ["肌肉", "力量", "强壮", "健身", "加油"],
  flexed: ["肌肉", "力量", "强壮", "健身", "加油"],
  biceps: ["肌肉", "力量", "强壮", "健身", "加油"],
  brain: ["大脑", "智力", "智商", "脑子", "聪明", "思维"],
  eye: ["眼睛", "看", "盯", "吃瓜", "注视"],
  eyes: ["双眼", "眼睛", "看", "盯", "吃瓜", "注视"],

  // 自然与动物
  dog: ["狗", "狗狗", "小狗", "汪汪"],
  cat: ["猫", "猫咪", "小猫", "喵喵"],
  monkey: ["猴子", "猴"],
  lion: ["狮子"],
  tiger: ["老虎", "虎"],
  bear: ["熊", "小熊"],
  panda: ["熊猫", "大熊猫"],
  pig: ["猪", "小猪", "佩奇"],
  cow: ["牛", "奶牛"],
  rabbit: ["兔子", "兔兔"],
  mouse: ["老鼠", "鼠标"],
  bird: ["鸟", "小鸟", "飞鸟"],
  fish: ["鱼", "小鱼"],
  snake: ["蛇"],
  flower: ["花", "鲜花", "花朵"],
  tree: ["树", "大树", "植物"],
  sun: ["太阳", "晴天", "阳光"],
  moon: ["月亮", "月夜", "月光"],
  star: ["星星", "星标", "收藏", "亮晶晶"],
  sparkle: ["闪光", "亮晶晶", "星星"],
  sparkles: ["闪光", "亮晶晶", "星星"],
  fire: ["火", "火焰", "热门", "爆款", "火热"],
  water: ["水", "水滴", "水流"],
  rain: ["雨", "下雨", "雨天"],
  snow: ["雪", "下雪", "雪花", "冬天"],

  // 食物与饮品
  food: ["食物", "吃的", "美食"],
  coffee: ["咖啡", "下午茶", "提神"],
  tea: ["茶", "喝茶", "奶茶"],
  beer: ["啤酒", "干杯", "聚会", "喝酒"],
  beers: ["啤酒", "干杯", "聚会", "喝酒"],
  clinking: ["干杯", "碰撞"],
  mugs: ["啤酒杯", "啤酒"],
  wine: ["红酒", "葡萄酒", "酒"],
  cocktail: ["鸡尾酒", "调酒"],
  pizza: ["披萨", "比萨"],
  burger: ["汉堡", "汉堡包", "快餐"],
  hamburger: ["汉堡", "汉堡包", "快餐"],
  fries: ["薯条"],
  noodle: ["面条", "拉面"],
  noodles: ["面条", "拉面"],
  rice: ["米饭", "饭"],
  cake: ["蛋糕", "甜点", "生日蛋糕"],
  apple: ["苹果", "水果"],
  banana: ["香蕉"],
  watermelon: ["西瓜"],
  icecream: ["冰淇淋", "雪糕"],

  // 旅行与交通
  car: ["车", "汽车", "小轿车", "自驾"],
  automobile: ["汽车", "小车"],
  taxi: ["出租车", "打车"],
  bus: ["公交车", "巴士"],
  train: ["火车", "高铁", "列车"],
  airplane: ["飞机", "飞行", "出差", "旅行", "航班"],
  plane: ["飞机", "出差", "旅行"],
  rocket: ["火箭", "起飞", "极速", "升空", "冲"],
  bike: ["自行车", "单车", "骑行"],
  bicycle: ["自行车", "单车", "骑行"],
  ship: ["轮船", "船", "航行"],
  house: ["房子", "家", "房屋", "住宅"],

  // 活动与物品
  gift: ["礼物", "送礼", "礼盒", "惊喜"],
  trophy: ["奖杯", "冠军", "第一名", "获胜"],
  medal: ["奖牌", "金牌", "银牌", "铜牌"],
  ball: ["球", "足球", "篮球"],
  music: ["音乐", "歌曲", "乐器"],
  musical: ["音乐", "音符"],
  note: ["音符", "笔记"],
  notes: ["音符", "音乐"],
  book: ["书", "书籍", "阅读", "学习"],
  phone: ["手机", "电话", "智能手机"],
  mobile: ["手机", "电话", "移动端"],
  computer: ["电脑", "笔记本", "台式机", "代码", "办公"],
  laptop: ["笔记本电脑", "电脑", "办公", "写代码"],
  bell: ["铃铛", "通知", "提醒", "注意"],
  clock: ["时钟", "表", "时间", "闹钟"],
  alarm: ["闹钟", "提醒", "警报"],
  watch: ["手表", "时间"],
  camera: ["相机", "照相机", "拍照", "摄影"],
  bag: ["包", "背包", "购物袋"],
  key: ["钥匙", "关键", "锁"],
  lock: ["锁", "安全", "加密", "私密"],
  tool: ["工具", "扳手", "修理"],

  // 标志与符号
  check: ["勾", "对", "正确", "完成", "通过", "ok"],
  mark: ["标记", "符号"],
  cross: ["叉", "错", "错误", "失败", "禁止"],
  warning: ["警告", "警示", "危险", "注意", "小心"],
  prohibited: ["禁止", "不准", "严禁"],
  flag: ["国旗", "旗帜", "红旗", "flag"],
};

/**
 * 自动提取英文名称中的所有单词，并查表生成丰富的中文关键词集合
 */
function extractChineseKeywords(name: string, subgroup: string): string[] {
  const words = `${name} ${subgroup}`
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const matchedCnWords = new Set<string>();

  for (const word of words) {
    if (TERM_TRANSLATIONS[word]) {
      TERM_TRANSLATIONS[word].forEach((cn) => matchedCnWords.add(cn));
    }
  }

  return Array.from(matchedCnWords);
}

/**
 * 构建完整的 Unicode 全量 Emoji 数据集（包含海量中文语义标签）
 */
export const ALL_EMOJIS: EmojiItem[] = Object.entries(rawEmojiData).map(
  ([char, data]: [string, any]) => {
    const rawGroup = data.group || "Symbols";
    const groupInfo = CATEGORY_MAP[rawGroup] || { name: rawGroup, iconName: "Sparkles" };
    const englishName = data.name || "";
    const subgroup = data.subgroup || "";

    // 动态提取与匹配中文关键词
    const cnKeywords = extractChineseKeywords(englishName, subgroup);

    const keywords = [
      englishName.toLowerCase(),
      subgroup.toLowerCase(),
      ...cnKeywords,
    ].filter(Boolean);

    return {
      char,
      name: englishName,
      category: rawGroup,
      group: groupInfo.name,
      subgroup,
      keywords,
    };
  }
);

/**
 * 分类列表
 */
export const EMOJI_CATEGORIES: EmojiCategory[] = Object.entries(CATEGORY_MAP).map(
  ([id, info]) => ({
    id,
    name: info.name,
    iconName: info.iconName,
  })
);

/**
 * 极速全量多维模糊检索 Emoji（中英文、词根、同义词全覆盖）
 */
export function searchFullEmojis(query: string, categoryId?: string): EmojiItem[] {
  const clean = query.trim().toLowerCase();

  let pool = ALL_EMOJIS;
  if (categoryId && categoryId !== "all") {
    pool = pool.filter((e) => e.category === categoryId);
  }

  if (!clean) {
    return pool;
  }

  return pool.filter((item) => {
    // 1. Emoji 字符完全匹配
    if (item.char === clean) return true;
    // 2. 英文名称匹配
    if (item.name.toLowerCase().includes(clean)) return true;
    // 3. 关键词匹配 (含提取出的海量中文同义词)
    if (item.keywords.some((k) => k.includes(clean) || clean.includes(k))) return true;
    // 4. 中文分类名匹配
    if (item.group.toLowerCase().includes(clean)) return true;

    return false;
  });
}
