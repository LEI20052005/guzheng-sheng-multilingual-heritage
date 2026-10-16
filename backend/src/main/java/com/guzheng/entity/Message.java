package com.guzheng.entity;

public class Message {
    private Long id;
    private String name;
    private String color;
    private String content;
    private String lang;
    private Integer likes;
    private String createdAt;
    private Long userId;
    private Boolean likedByMe;  // 当前用户是否点过赞

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getLang() { return lang; }
    public void setLang(String lang) { this.lang = lang; }
    public Integer getLikes() { return likes; }
    public void setLikes(Integer likes) { this.likes = likes; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Boolean getLikedByMe() { return likedByMe; }
    public void setLikedByMe(Boolean likedByMe) { this.likedByMe = likedByMe; }
}
