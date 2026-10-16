package com.guzheng.controller;

import com.guzheng.common.BizException;
import com.guzheng.common.Result;
import com.guzheng.entity.User;
import com.guzheng.mapper.UserMapper;
import com.guzheng.util.JwtUtil;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserMapper userMapper;
    @Autowired
    private JwtUtil jwtUtil;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public static class LoginBody {
        @NotBlank(message = "用户名不能为空")
        public String username;
        @NotBlank(message = "密码不能为空")
        public String password;
    }

    private Map<String, Object> buildLoginData(User user) {
        String token = jwtUtil.generate(user.getId(), user.getUsername());
        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        data.put("nickname", user.getNickname());
        data.put("userId", user.getId());
        data.put("role", user.getRole());
        return data;
    }

    @PostMapping("/register")
    public Result<Map<String, Object>> register(@RequestBody LoginBody body) {
        if (userMapper.selectByUsername(body.username) != null) {
            throw new BizException(400, "用户名已存在");
        }
        User user = new User();
        user.setUsername(body.username);
        user.setPasswordHash(passwordEncoder.encode(body.password));
        user.setNickname(body.username);
        user.setCreatedAt(LocalDate.now().toString());
        userMapper.insert(user);
        return Result.ok(buildLoginData(user));
    }

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@RequestBody LoginBody body) {
        User user = userMapper.selectByUsername(body.username);
        if (user == null) throw new BizException(401, "用户名或密码错误");
        if (user.getBanned() != null && user.getBanned() == 1) throw new BizException(403, "该账号已被管理员封禁");

        String hash = user.getPasswordHash();
        boolean matched;
        if (hash.startsWith("{noop}")) {
            // 老明文密码：比对成功后自动升级为 BCrypt
            matched = hash.equals("{noop}" + body.password);
            if (matched) {
                user.setPasswordHash(passwordEncoder.encode(body.password));
                userMapper.updatePassword(user);
            }
        } else {
            matched = passwordEncoder.matches(body.password, hash);
        }
        if (!matched) throw new BizException(401, "用户名或密码错误");

        return Result.ok(buildLoginData(user));
    }

    @GetMapping("/users")
    public Result<List<User>> listUsers(@RequestHeader(value = "Authorization", required = false) String auth) {
        Long adminId = getUserId(auth);
        User admin = userMapper.selectById(adminId);
        if (admin == null || !"admin".equals(admin.getRole())) throw new BizException(403, "需要管理员权限");
        return Result.ok(userMapper.listAll());
    }

    @PostMapping("/users/{id}/ban")
    public Result<Void> banUser(@PathVariable Long id,
                                @RequestParam(defaultValue = "1") int banned,
                                @RequestHeader(value = "Authorization", required = false) String auth) {
        Long adminId = getUserId(auth);
        User admin = userMapper.selectById(adminId);
        if (admin == null || !"admin".equals(admin.getRole())) throw new BizException(403, "需要管理员权限");
        userMapper.setBanned(id, banned);
        return Result.ok();
    }

    private Long getUserId(String auth) {
        if (auth == null || !auth.startsWith("Bearer ")) return null;
        try { return jwtUtil.getUserId(auth.substring(7)); } catch (Exception e) { return null; }
    }
}
