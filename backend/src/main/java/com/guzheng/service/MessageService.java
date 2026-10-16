package com.guzheng.service;

import com.guzheng.common.BizException;
import com.guzheng.entity.Message;
import com.guzheng.entity.User;
import com.guzheng.mapper.MessageMapper;
import com.guzheng.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.*;

@Service
public class MessageService {

    @Autowired
    private MessageMapper messageMapper;
    @Autowired
    private UserMapper userMapper;

    private static final String[] COLORS = {"#A67C52", "#6B8E8E", "#2F4F4F", "#8B6914"};

    public Map<String, Object> getPage(String lang, int page, int size, Long currentUserId) {
        int offset = (page - 1) * size;
        List<Message> list = messageMapper.selectPage(lang, offset, size);
        int total = messageMapper.countByLang(lang);

        // 标记当前用户是否点过赞
        if (currentUserId != null && !list.isEmpty()) {
            List<Long> ids = list.stream().map(Message::getId).toList();
            List<Long> likedIds = messageMapper.selectLikedIds(currentUserId, ids);
            Set<Long> likedSet = new HashSet<>(likedIds);
            list.forEach(m -> m.setLikedByMe(likedSet.contains(m.getId())));
        } else {
            list.forEach(m -> m.setLikedByMe(false));
        }

        Map<String, Object> result = new HashMap<>();
        result.put("list", list);
        result.put("total", total);
        result.put("page", page);
        result.put("size", size);
        return result;
    }

    public Message addMessage(String name, String content, String lang, Long userId) {
        User user = userMapper.selectById(userId);
        if (user == null) throw new BizException(401, "请先登录");
        Message msg = new Message();
        msg.setName(user.getNickname());
        msg.setContent(content);
        msg.setLang(lang);
        msg.setLikes(0);
        msg.setColor(COLORS[new Random().nextInt(COLORS.length)]);
        msg.setCreatedAt(LocalDate.now().toString());
        msg.setUserId(userId);
        messageMapper.insert(msg);
        return msg;
    }

    @Transactional
    public boolean toggleLike(Long messageId, Long userId) {
        if (userId == null) throw new BizException(401, "请先登录");
        Message msg = messageMapper.selectById(messageId);
        if (msg == null) throw new BizException(404, "留言不存在");

        List<Long> likedIds = messageMapper.selectLikedIds(userId, List.of(messageId));
        boolean liked = !likedIds.isEmpty();

        if (liked) {
            messageMapper.deleteLike(messageId, userId);
            messageMapper.decrementLikes(messageId);
            return false;
        } else {
            messageMapper.insertLike(messageId, userId);
            messageMapper.incrementLikes(messageId);
            return true;
        }
    }

    public void deleteMessage(Long messageId, Long userId) {
        Message msg = messageMapper.selectById(messageId);
        if (msg == null) throw new BizException(404, "留言不存在");
        User user = userMapper.selectById(userId);
        boolean isAdmin = user != null && "admin".equals(user.getRole());
        if (!isAdmin && (msg.getUserId() == null || !msg.getUserId().equals(userId))) {
            throw new BizException(403, "只能删除自己的留言");
        }
        messageMapper.deleteById(messageId);
    }
}
