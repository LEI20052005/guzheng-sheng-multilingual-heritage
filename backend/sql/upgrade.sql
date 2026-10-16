-- 升级脚本：用户系统 + 点赞防重复
USE guzheng_heritage;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    created_at VARCHAR(20) NOT NULL
);

-- 点赞记录表（联合主键防止重复点赞）
CREATE TABLE IF NOT EXISTS message_likes (
    message_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at VARCHAR(20) NOT NULL,
    PRIMARY KEY (message_id, user_id)
);

-- messages 表加 user_id 字段（老数据设为 NULL 表示种子留言）
ALTER TABLE messages ADD COLUMN user_id BIGINT NULL;
