package com.guzheng.entity;

public class User {
    private Long id;
    private String username;
    private String passwordHash;
    private String nickname;
    private String createdAt;
    private String role;
    private Integer banned;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public String getNickname() { return nickname; }
    public void setNickname(String nickname) { this.nickname = nickname; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public Integer getBanned() { return banned; }
    public void setBanned(Integer banned) { this.banned = banned; }
}
