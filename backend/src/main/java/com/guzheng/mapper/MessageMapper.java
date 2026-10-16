package com.guzheng.mapper;

import com.guzheng.entity.Message;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface MessageMapper {
    // 分页查询
    List<Message> selectPage(@Param("lang") String lang,
                             @Param("offset") int offset,
                             @Param("size") int size);

    int countByLang(@Param("lang") String lang);

    // 查询当前用户点赞过的消息 id
    List<Long> selectLikedIds(@Param("userId") Long userId, @Param("messageIds") List<Long> messageIds);

    int insert(Message message);

    // 点赞：插入记录 + likes+1
    int insertLike(@Param("messageId") Long messageId, @Param("userId") Long userId);
    int deleteLike(@Param("messageId") Long messageId, @Param("userId") Long userId);

    int incrementLikes(@Param("id") Long id);
    int decrementLikes(@Param("id") Long id);

    Message selectById(@Param("id") Long id);

    int deleteById(@Param("id") Long id);
}
