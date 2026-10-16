-- 古筝与笙数字传承计划 - 留言墙数据库初始化
CREATE DATABASE IF NOT EXISTS guzheng_heritage DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE guzheng_heritage;

DROP TABLE IF EXISTS messages;
CREATE TABLE messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(20) DEFAULT '#6B8E8E',
    content TEXT NOT NULL,
    lang VARCHAR(10) NOT NULL COMMENT 'zh / en',
    likes INT DEFAULT 0,
    created_at VARCHAR(20) NOT NULL
);

-- 中文种子数据 id 1-10
INSERT INTO messages (id, name, color, content, lang, likes, created_at) VALUES
(1, '林同学', '#A67C52', '第一次通过3D模型看清了笙的内部结构，原来自由簧长这样！音乐课上老师讲过但从没见过实物。', 'zh', 5, '2026-07-15'),
(2, 'Sophia Chen', '#6B8E8E', '听到《高山流水》的瞬间眼眶就湿了，在海外五年，这是最想家的一刻。感谢团队做这个网站。', 'zh', 15, '2026-07-22'),
(3, '王老师', '#2F4F4F', '中学音乐教研组，已把这个资源链接分享给组里，下学期民乐欣赏课就用你们的资料做课件。', 'zh', 12, '2026-08-03'),
(4, 'Sheng_player', '#8B6914', '学笙三年，第一次在网页上看到笙的完整结构拆解，加键笙的按键传动系统解释得特别清楚。', 'zh', 4, '2026-08-10'),
(5, '小筝', '#A67C52', '答题挑战拿了80分！原来古筝有五大流派，之前只知道浙江筝。宝藏网站，会推荐给琴友群。', 'zh', 3, '2026-08-18'),
(6, 'James Morrison', '#6B8E8E', '通过一部音乐纪录片了解到中国传统乐器。3D古筝模型太迷人了，转着看就像真的捧着一件乐器，现在想深入了解！', 'zh', 10, '2026-08-25'),
(7, '陈阿姨', '#8B6914', '带九岁女儿看完《渔舟唱晚》视频，她主动说想学古筝。这个网站最棒的地方是让孩子愿意去了解。', 'zh', 7, '2026-09-02'),
(8, '民乐研究者', '#2F4F4F', '曾侯乙墓出土笙那段历史整理得很准确，引用了甲骨文中和的记载，比很多教材都详细。', 'zh', 8, '2026-09-10'),
(9, '路人甲', '#A67C52', '从GitHub Pages误打误撞进来的，本来以为是技术Demo，结果听完《冬猎》循环了一下午。', 'zh', 2, '2026-09-20'),
(10, '风', '#6B8E8E', '笙的音色太温柔了，像冬天手捧着一杯热茶。希望以后能加入更多古曲音频。', 'zh', 6, '2026-10-05');

-- 英文种子数据 id 101-110
INSERT INTO messages (id, name, color, content, lang, likes, created_at) VALUES
(101, 'Lin Tongxue', '#A67C52', 'First time seeing the internal structure of Sheng through a 3D model! Our music teacher mentioned free reeds in class but I have never seen one.', 'en', 5, '2026-07-15'),
(102, 'Sophia Chen', '#6B8E8E', 'Tears welled up the moment High Mountain Running Water started playing. Five years overseas, this is when I missed home the most. Thank you for building this.', 'en', 15, '2026-07-22'),
(103, 'Teacher Wang', '#2F4F4F', 'Middle school music teaching group — shared this resource with my colleagues. We will use it for next semester folk music appreciation class.', 'en', 12, '2026-08-03'),
(104, 'Sheng_player', '#8B6914', 'Studied Sheng for three years, first time seeing a full structural breakdown online. The key-transmission system explanation is spot on.', 'en', 4, '2026-08-10'),
(105, 'Xiao Zheng', '#A67C52', 'Scored 80 on the quiz! Did not know Guzheng has five major regional schools before. Sharing this with my Guzheng study group.', 'en', 3, '2026-08-18'),
(106, 'James Morrison', '#6B8E8E', 'Discovered Chinese traditional instruments through a music documentary. The 3D Guzheng model is mesmerizing — rotating it around feels like holding a real instrument. Now I want to learn more!', 'en', 10, '2026-08-25'),
(107, 'Aunt Chen', '#8B6914', 'Brought my 9-year-old daughter to watch Fisherman Song at Dusk — she asked to learn Guzheng afterward. Best part of this site is inspiring kids.', 'en', 7, '2026-09-02'),
(108, 'Folk Music Researcher', '#2F4F4F', 'The Zeng-Hou-Yi tomb sheng section is well-researched. The oracle-bone inscription reference to He is more detailed than many textbooks.', 'en', 8, '2026-09-10'),
(109, 'Passersby', '#A67C52', 'Stumbled in via GitHub Pages expecting a tech demo, ended up looping Winter Hunt all afternoon.', 'en', 2, '2026-09-20'),
(110, 'Feng', '#6B8E8E', 'The Sheng timbre is so gentle, like holding a warm cup of tea in winter. Hope more ancient repertoire audio gets added.', 'en', 6, '2026-10-05');
