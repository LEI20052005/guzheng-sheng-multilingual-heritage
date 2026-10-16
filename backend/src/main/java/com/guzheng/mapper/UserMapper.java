package com.guzheng.mapper;

import com.guzheng.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

@Mapper
public interface UserMapper {
    User selectByUsername(@Param("username") String username);
    User selectById(@Param("id") Long id);
    int insert(User user);
    List<User> listAll();
    int setBanned(@Param("id") Long id, @Param("banned") Integer banned);
    int updatePassword(User user);
}
