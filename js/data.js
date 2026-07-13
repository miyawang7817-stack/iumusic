/* IU 音乐签 —— 歌曲卡牌数据
   每张卡 = 一首 IU 的歌：所属专辑 / 年份 / 心情标签 / 推荐语 / 聆听场景 */

// 专辑（时代）信息：封面、年份、氛围色相（用于抽牌页光晕）
const ALBUMS = {
  'growing-up': {
    name: 'Growing Up', label: '正规一辑', year: 2009,
    cover: 'growing-up.jpeg', hue: 30, era: 'early',
  },
  'last-fantasy': {
    name: 'Last Fantasy', label: '正规二辑', year: 2011,
    cover: 'last-fantasy.jpeg', hue: 215, era: 'early',
  },
  'spring-of-twenty': {
    name: '스무 살의 봄 · 二十岁的春天', label: '单曲辑', year: 2012,
    cover: 'spring-of-twenty.jpeg', hue: 110, era: 'early',
  },
  'modern-times': {
    name: 'Modern Times', label: '正规三辑', year: 2013,
    cover: 'modern-times.jpeg', hue: 42, era: 'early',
  },
  'modern-times-epilogue': {
    name: 'Modern Times – Epilogue', label: '正规三辑改版', year: 2013,
    cover: 'modern-times-epilogue.jpeg', hue: 40, era: 'early',
  },
  'flower-bookmark': {
    name: '꽃갈피 · 花书签', label: '翻唱特辑', year: 2014,
    cover: 'flower-bookmark.jpeg', hue: 52, era: 'mid',
  },
  'chat-shire': {
    name: 'CHAT-SHIRE', label: '迷你四辑', year: 2015,
    cover: 'chat-shire.jpg', hue: 275, era: 'mid',
  },
  'flower-bookmark-2': {
    name: '꽃갈피 둘 · 花书签 贰', label: '翻唱特辑', year: 2017,
    cover: 'flower-bookmark-2.jpeg', hue: 45, era: 'mid',
  },
  'love-poem': {
    name: 'Love poem', label: '迷你五辑', year: 2019,
    cover: 'love-poem.jpeg', hue: 205, era: 'late',
  },
  'celebrity': {
    name: 'Celebrity', label: '先行单曲', year: 2021,
    cover: 'celebrity.jpeg', hue: 350, era: 'late',
  },
  'lilac': {
    name: 'LILAC', label: '正规五辑', year: 2021,
    cover: 'lilac.jpeg', hue: 285, era: 'late',
  },
  'love-wins-all': {
    name: 'Love wins all', label: '先行单曲', year: 2024,
    cover: 'love-wins-all.jpeg', hue: 330, era: 'late',
  },
  'the-winning': {
    name: 'The Winning', label: '迷你六辑', year: 2024,
    cover: 'the-winning.jpeg', hue: 5, era: 'late',
  },
};

const ERA_NAME = { early: '少女时代（2008–2013）', mid: '成长时代（2014–2017）', late: '艺术家时代（2019–今）' };

/* 歌曲卡组。moods 用于标签，desc 是推荐语正文，scene 是「这样听」建议 */
const DECK = [
  /* ---- Growing Up (2009) ---- */
  {
    id: 'hey', album: 'growing-up',
    title: '있잖아', titleZh: '你知道吗',
    moods: ['倔强', '元气', '不服输'],
    desc: '出道初期的 IU，声音里还带着一点少女的锋利。这首歌像攥紧的小拳头：委屈可以有，但认输没门。那个还没被世界磨圆的她，唱给同样正在硬撑的你。',
    scene: '被否定、被小看的那天，通勤路上循环三遍，把腰杆听直。',
  },
  {
    id: 'boo', album: 'growing-up',
    title: 'Boo',
    moods: ['复古', '俏皮', '恋爱预感'],
    desc: '复古迪斯科节拍一响，嘴角很难不上扬。这是 16 岁的 IU 蹦蹦跳跳的模样——后来所有深沉的歌，都是从这份天真出发的。偶尔回到起点听听，会想起自己也曾这样没心没肺地快乐。',
    scene: '收拾房间的时候放，扫把可以顺便当麦克风。',
  },

  /* ---- Last Fantasy (2011) ---- */
  {
    id: 'you-and-i', album: 'last-fantasy',
    title: '너랑 나', titleZh: '你与我',
    moods: ['心动', '奔跑感', '国民妖精'],
    desc: '把「三段高音」唱成国民记忆的一首歌。齿轮、怀表、穿越时间去见你——整首歌都在向前跑，连喘息都是甜的。听到副歌那句冲上去的瞬间，天大的丧气也会被顶开一条缝。',
    scene: '需要一点「冲劲」的清晨，出门前当发条上满。',
  },
  {
    id: 'uncle', album: 'last-fantasy',
    title: '삼촌', titleZh: '叔叔（feat. 李笛）',
    moods: ['慵懒', '幽默', '大人味'],
    desc: '和李笛的一搭一唱，像深夜小酒馆里的即兴表演。它不催你振作，只坐在你旁边说：大人的世界确实有点无聊，但也有这种松弛的乐趣。',
    scene: '周五晚上，一杯小酒或一杯气泡水，跟着晃。',
  },
  {
    id: 'wisdom-tooth', album: 'last-fantasy',
    title: '사랑니', titleZh: '智齿',
    moods: ['隐隐作痛', '暗恋', '细腻'],
    desc: '把喜欢一个人的别扭，比作一颗悄悄发炎的智齿——不碰不疼，一碰钻心。IU 唱得又轻又准，轻到像自言自语，准到像在你心里装了窃听器。',
    scene: '那个名字又冒出来的晚上，戴耳机，单曲循环，谁也不告诉。',
  },
  {
    id: 'sleeping-prince', album: 'last-fantasy',
    title: '잠자는 숲 속의 왕자', titleZh: '沉睡森林中的王子（feat. 尹钟信）',
    moods: ['童话', '温柔', '主动'],
    desc: '把童话反过来讲：这次是女孩去唤醒王子。弦乐一层层铺开，像走进一座下着光的森林。它悄悄鼓励你——想要的东西，可以自己伸手。',
    scene: '午后犯困时听，做一个清醒又体面的白日梦。',
  },

  /* ---- 二十岁的春天 (2012) ---- */
  {
    id: 'peach', album: 'spring-of-twenty',
    title: '복숭아', titleZh: '桃子',
    moods: ['清甜', '春天', '自作曲'],
    desc: 'IU 亲手写给「喜欢」这种情绪的歌：喜欢一个人,连他的缺点都像桃子上的绒毛。整首歌软软的、毛茸茸的，是春天午后晒在被子上的味道。',
    scene: '天气好的周末下午，配一杯桃子味气泡水刚刚好。',
  },
  {
    id: 'every-end-of-the-day', album: 'spring-of-twenty',
    title: '하루 끝', titleZh: '一天的尽头',
    moods: ['收工', '治愈', '小确幸'],
    desc: '「辛苦了，今天。」这首歌只想说这一句。轻快的吉他把一整天的疲惫掸掉，像有人在门口接过你手里的包。再糟的一天，也值得一个温柔的结尾。',
    scene: '下班回家的路上听，进门前刚好听完，把班味留在门外。',
  },

  /* ---- Modern Times (2013) ---- */
  {
    id: 'red-shoes', album: 'modern-times',
    title: '분홍신', titleZh: '粉红鞋',
    moods: ['复古爵士', '着魔', '停不下来'],
    desc: '摇摆爵士 + 童话《红舞鞋》的暗黑设定：穿上就停不下来的鞋，像极了让人上头的事物。铜管一响，整个人被拽进 1930 年代的舞池。IU 音域和戏感的第一次大型炫技，十年后听依然过瘾。',
    scene: '提不起精神的下午，音量调大两格，让节奏替你踩油门。',
  },
  {
    id: 'the-red-queen', album: 'modern-times',
    title: '을의 연애', titleZh: '乙方恋爱',
    moods: ['清醒', '自嘲', '爵士'],
    desc: '恋爱里总有一方是「乙方」——小心翼翼、患得患失。IU 把这种卑微唱得优雅又自嘲，像穿着礼服说心酸事。听完反而清醒：下一段感情，要做回甲方，至少做回自己。',
    scene: '复盘一段让你委屈的关系时听，边听边把聊天记录归档。',
  },
  {
    id: 'obliviate', album: 'modern-times',
    title: '우울시계', titleZh: '忧郁时钟（feat. 钟铉）',
    moods: ['深夜', '忧郁', '合唱'],
    desc: '和钟铉的声音在夜里交叠，像两个失眠的人隔空聊天。忧郁被写成一座走不准的钟——它不吓人，只是有点慢。想念一个声音的时候，这首歌会替你保存它。',
    scene: '睡不着的凌晨一点，关灯听，允许自己丧十分钟。',
  },

  /* ---- Modern Times – Epilogue (2013) ---- */
  {
    id: 'friday', album: 'modern-times-epilogue',
    title: '금요일에 만나요', titleZh: '星期五见面吧（feat. 张利定）',
    moods: ['心动', '约会', '周五'],
    desc: '大概是全世界最著名的「周五之歌」。木吉他一拨，心跳就变成期待见面的节奏。它把「等待约会」这件小事写成了庆典——原来盼着见一个人，本身就很幸福。',
    scene: '任何一个周五的傍晚。哪怕没有约会，也值得为周末心动。',
  },
  {
    id: 'wish', album: 'modern-times-epilogue',
    title: '소원', titleZh: '心愿',
    moods: ['安静', '祈祷', '收尾'],
    desc: '藏在改版专辑最后的一首小歌，像演唱会散场后灯光暗下来的那一分钟。没有炫技，只有一个很轻的愿望。听完你会想认真许一个愿——许了，就去做。',
    scene: '一年的节点、生日前夜，写愿望清单的时候放。',
  },

  /* ---- 花书签 (2014) ---- */
  {
    id: 'my-old-story', album: 'flower-bookmark',
    title: '나의 옛날이야기', titleZh: '我的旧日故事',
    moods: ['怀旧', '泛黄', '翻唱'],
    desc: '翻唱老歌的 IU 像在旧书店里翻一本别人的日记，翻着翻着变成了自己的。她的声音自带旧照片的颗粒感——那些你以为忘了的事，前奏一响就都回来了。',
    scene: '整理旧物、翻老照片的时候听，允许自己想念一会儿。',
  },
  {
    id: 'meaning-of-you', album: 'flower-bookmark',
    title: '너의 의미', titleZh: '你的意义（feat. 金昌完）',
    moods: ['隽永', '告白', '木吉他'],
    desc: '和原唱者金昌完隔着几十年的合唱。没有一句花哨的词,却把「你对我而言是什么」讲得干干净净。适合送给那个重要但很少被你郑重感谢的人——或者，送给自己。',
    scene: '想给某个人写点什么的时候听，写完记得发出去。',
  },
  {
    id: 'flower', album: 'flower-bookmark',
    title: '꽃', titleZh: '花',
    moods: ['春日', '舒展', '复苏'],
    desc: '轻轻巧巧的一首歌，像看一朵花用一整个下午慢慢开。它不讲道理，只提供一种节奏：慢一点，再慢一点。心里紧绷的那根弦，会在第二段副歌松开。',
    scene: '焦虑到手心出汗时，去楼下走一圈，就放这首。',
  },

  /* ---- CHAT-SHIRE (2015) ---- */
  {
    id: 'twenty-three', album: 'chat-shire',
    title: '스물셋', titleZh: '二十三',
    moods: ['真实', '锋利', '成长阵痛'],
    desc: '「想装成熟，又想撒娇；想被看穿，又怕被看穿。」23 岁的 IU 亲笔写下的自白书，狡黠又诚实。任何一个卡在「该长大了吗」路口的人，都会在里面看到自己。',
    scene: '生日前后、年龄焦虑发作时听，听完给自己松绑。',
  },
  {
    id: 'zeze', album: 'chat-shire',
    title: 'Zezé',
    moods: ['慵懒', '波萨诺瓦', '小恶魔'],
    desc: '以《我亲爱的甜橙树》里的男孩为灵感，波萨诺瓦的节奏懒洋洋地晃。IU 的声线在这首歌里带一点猫的性格——不讨好、有主见。适合想躲进自己世界的日子。',
    scene: '一个人的下午茶，配书或者配发呆都行。',
  },
  {
    id: 'knees', album: 'chat-shire',
    title: '무릎', titleZh: '膝盖',
    moods: ['失眠', '外婆', '一支吉他'],
    desc: '一把木吉他、一次完整的live录音，唱想枕着外婆的膝盖睡去的夜晚。中间甚至能听到她换气的声音。这是 IU 全部作品里最接近「拥抱」的一首歌。',
    scene: '失眠的深夜最后一首歌——听完就闭眼，今天到此为止。',
  },
  {
    id: 'blue', album: 'chat-shire',
    title: '푸르던', titleZh: '曾经青涩',
    moods: ['告别', '释怀', '青绿色'],
    desc: '写给一段回不去的关系，也写给回不去的自己。「那时的我们多么青涩啊」——不怨、不悔，只是隔着时间挥挥手。告别也可以是件干净体面的事。',
    scene: '删掉旧联系方式之前听一遍，然后轻轻放下。',
  },

  /* ---- 花书签 贰 (2017) ---- */
  {
    id: 'autumn-morning', album: 'flower-bookmark-2',
    title: '가을 아침', titleZh: '秋日清晨',
    moods: ['清晨', '干净', '一天之计'],
    desc: '闹钟换成这首歌，赖床都变得诗意。翻唱自杨姬银的老歌，IU 的版本像秋天早晨推开窗那阵凉丝丝的空气——一切还没开始，一切都还来得及。',
    scene: '起床后的第一首歌，配拉开窗帘的动作。',
  },
  {
    id: 'gaeyeoul', album: 'flower-bookmark-2',
    title: '개여울', titleZh: '溪畔',
    moods: ['诗意', '古典', '金素月'],
    desc: '词出自金素月的诗，隔着一百年依然湿润。IU 唱得极克制，像坐在溪水边不说话的人。有些心事不需要解决，只需要一条溪替你流一会儿。',
    scene: '雨天窗边，泡一壶热茶，什么都不做地听。',
  },
  {
    id: 'with-you-everyday', album: 'flower-bookmark-2',
    title: '매일 그대와', titleZh: '每天与你',
    moods: ['日常', '恬淡', '细水长流'],
    desc: '不轰烈、不许诺，只想「每天和你一起」。翻唱老歌里最温吞的一首，却最经听——爱到深处原来是日常：一起吃饭，一起走路，一起变老。',
    scene: '和喜欢的人一起做饭时当背景乐，锅铲是节拍器。',
  },

  /* ---- Love poem (2019) ---- */
  {
    id: 'love-poem', album: 'love-poem',
    title: 'Love poem',
    moods: ['陪伴', '安慰', '写给朋友'],
    desc: '为撑不下去的朋友写的一首诗：「我会为你读这首诗，直到你重新睡着。」它不劝你坚强，只承诺陪着。如果此刻你也在硬撑，让这首歌陪你把今晚熬过去。',
    scene: '心里很重的夜晚，音量放小，让它像床头灯一样亮着。',
  },
  {
    id: 'blueming', album: 'love-poem',
    title: 'Blueming',
    moods: ['心动', '蓝色气泡', '聊天框'],
    desc: '把「和你聊天」写成一朵朵盛开的蓝玫瑰——对话框里的小心思、秒回的雀跃、盯着「对方正在输入」的三秒钟。清脆的吉他 riff 一响，恋爱的多巴胺立刻到账。',
    scene: '等某个人回消息的时候听，等到了就笑，没等到也快乐。',
  },
  {
    id: 'unlucky', album: 'love-poem',
    title: 'unlucky',
    moods: ['自洽', '小霉运', '耸耸肩'],
    desc: '「我最近有点倒霉——不过也还行吧。」这首歌把丧唱得轻盈：承认不顺，但拒绝苦大仇深。运气差的日子，最需要的不是鸡汤，是这种耸耸肩的幽默感。',
    scene: '打翻咖啡、错过班车的那种小霉日，用它给自己台阶下。',
  },
  {
    id: 'above-the-time', album: 'love-poem',
    title: '시간의 바깥', titleZh: '时间之外',
    moods: ['深情', '宏大', '穿越时间'],
    desc: '和《你与我》遥遥呼应的「时间三部曲」一章：曾经奔跑的少女，如今站在时间之外等你。编曲像缓缓展开的星图，深情得近乎庄重。给那些「很久很久」的感情。',
    scene: '夜里加班回家的出租车上，看着窗外的灯听。',
  },

  /* ---- Celebrity (2021) ---- */
  {
    id: 'celebrity', album: 'celebrity',
    title: 'Celebrity',
    moods: ['打气', '闪光', '写给怪小孩'],
    desc: '「你本来就是明星啊。」写给某个格格不入的朋友，也写给每个觉得自己「怪」的人：你的不合群，恰恰是你的光。副歌的合成器像一场为你一个人放的烟花。',
    scene: '自我怀疑的时刻立刻按播放，把它当一封发给你的私信。',
  },

  /* ---- LILAC (2021) ---- */
  {
    id: 'lilac', album: 'lilac',
    title: '라일락', titleZh: '紫丁香',
    moods: ['盛放', '告别二十代', '城市流行'],
    desc: '用最灿烂的方式说再见——给二十多岁的自己办一场紫丁香色的欢送会。City-pop 的律动轻快得像春风过境。它教你一件事：结束不必悲伤，可以漂亮地转身。',
    scene: '一段旅程收尾的日子（毕业、离职、搬家），边打包边听。',
  },
  {
    id: 'coin', album: 'lilac',
    title: 'Coin',
    moods: ['自信', '赌一把', '大女主'],
    desc: '把人生比作赌局，而她把筹码「哗啦」一声全推上桌。这是 IU 最飒的一面：输赢无所谓，气势不能输。需要底气的日子，让这首歌借你三分。',
    scene: '面试、谈判、上台前的最后三分钟，戴耳机听完再进场。',
  },
  {
    id: 'my-sea', album: 'lilac',
    title: '아이와 나의 바다', titleZh: '孩子与我的海',
    moods: ['和解', '成长史诗', '拥抱自己'],
    desc: '从怕水的小孩，到终于敢潜入自己深处的大人。曲子像海一样一层层涌上来，最后把童年的自己轻轻抱住。听到弦乐涌起的那一刻，很多人会毫无防备地掉眼泪。',
    scene: '一个人的长途火车或飞机上，靠窗，把这首留给自己。',
  },
  {
    id: 'epilogue', album: 'lilac',
    title: '에필로그', titleZh: '尾声',
    moods: ['谢幕', '温柔', '下次再见'],
    desc: '专辑的最后一页,像片尾字幕缓缓升起：「我们总有一天会再见面。」它把告别处理成约定。听完一整张《LILAC》再听它,像看完一部好电影，坐到灯亮才起身。',
    scene: '深夜歌单的最后一首，听完心满意足地睡。',
  },

  /* ---- Love wins all (2024) ---- */
  {
    id: 'love-wins-all', album: 'love-wins-all',
    title: 'Love wins all',
    moods: ['史诗', '相拥', '废墟里的光'],
    desc: '在废墟般的世界里，两个人依然选择相爱。IU 的声音从耳语一路推到嘶喊，像在跟整个世界据理力争：爱赢下一切。近年最沉重也最温柔的一首主打。',
    scene: '被坏消息淹没的一天，找个安静角落完整听一遍，含MV更佳。',
  },

  /* ---- The Winning (2024) ---- */
  {
    id: 'shopper', album: 'the-winning',
    title: 'Shopper',
    moods: ['痛快', '横冲直撞', '我说了算'],
    desc: '把世界当商场，想要什么自己拿。吉他一路横冲直撞，唱的是三十代 IU 的宣言：人生的购物车，自己装满。听完只想推门出去，把今天想要的都拿下。',
    scene: '周一早晨的第一首歌，用它把一周的主动权抢回来。',
  },
  {
    id: 'holssi', album: 'the-winning',
    title: '홀씨', titleZh: '蒲公英种子',
    moods: ['自由', '起飞', '轻盈'],
    desc: '把自己活成一粒蒲公英种子——风往哪吹都不怕，落在哪里都能长。节奏轻快带感，副歌像一阵把人托起来的风。适合所有想「飞一会儿」的时刻。',
    scene: '天气好的日子骑车或散步听，风大一点更好。',
  },
  {
    id: 'shh', album: 'the-winning',
    title: 'Shh..',
    moods: ['静谧', '女声合唱', '安放'],
    desc: '与惠仁、赵源善合作的一首歌，几个声音像烛光一样彼此靠近。它不解决问题，只提供一个安静的房间，让所有情绪都先坐下来。专辑里最适合深呼吸的五分钟。',
    scene: '冥想、拉伸或泡澡时听，跟着它把呼吸放慢。',
  },
];

/* 三种抽法（歌单阵） */
const SPREADS = [
  {
    id: 'single',
    icon: '☀',
    nameZh: '今日一曲',
    descriptionZh: '抽一首歌，做今天的背景音乐',
    layout: 'row',
    positions: [
      { name: '今日主打', meaning: '今天最适合陪着你的那首歌' },
    ],
  },
  {
    id: 'three-card',
    icon: '☽',
    nameZh: '心情三部曲',
    descriptionZh: '三首歌连成一条心情线：回忆、此刻、期待',
    layout: 'row',
    positions: [
      { name: '回忆', meaning: '替你收藏过去的那首歌' },
      { name: '此刻', meaning: '此时此刻心情的注脚' },
      { name: '期待', meaning: '接下来的日子交给它' },
    ],
  },
  {
    id: 'playlist',
    icon: '♡',
    nameZh: '治愈歌单',
    descriptionZh: '五首歌从开场到安可，陪你把今天听完',
    layout: 'row',
    positions: [
      { name: '开场曲', meaning: '歌单的第一声问候' },
      { name: '心事', meaning: '唱中你心事的一首' },
      { name: '转折', meaning: '情绪在这里换气' },
      { name: '治愈', meaning: '负责把你接住的一首' },
      { name: '安可', meaning: '最后留在耳边的余韵' },
    ],
  },
];
