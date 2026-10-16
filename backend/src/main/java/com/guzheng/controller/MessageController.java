package com.guzheng.controller;

import com.guzheng.common.BizException;
import com.guzheng.common.Result;
import com.guzheng.entity.Message;
import com.guzheng.service.MessageService;
import com.guzheng.util.JwtUtil;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*")
public class MessageController {

    @Autowired
    private MessageService messageService;
    @Autowired
    private JwtUtil jwtUtil;

    private Long getUserIdFromHeader(String auth) {
        if (auth == null || !auth.startsWith("Bearer ")) return null;
        try {
            return jwtUtil.getUserId(auth.substring(7));
        } catch (Exception e) {
            return null;
        }
    }

    @GetMapping
    public Result<Map<String, Object>> list(
            @RequestParam String lang,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "6") int size,
            @RequestHeader(value = "Authorization", required = false) String auth) {
        Long userId = getUserIdFromHeader(auth);
        return Result.ok(messageService.getPage(lang, page, size, userId));
    }

    public static class AddBody {
        @NotBlank(message = "留言内容不能为空")
        public String content;
        @NotBlank(message = "语言不能为空")
        public String lang;
    }

    @PostMapping
    public Result<Message> add(@RequestBody @Valid AddBody body,
                               @RequestHeader(value = "Authorization", required = false) String auth) {
        Long userId = getUserIdFromHeader(auth);
        if (userId == null) throw new BizException(401, "请先登录后再留言");
        return Result.ok(messageService.addMessage(null, body.content, body.lang, userId));
    }

    @PostMapping("/{id}/like")
    public Result<Map<String, Object>> toggleLike(@PathVariable Long id,
                                                  @RequestHeader(value = "Authorization", required = false) String auth) {
        Long userId = getUserIdFromHeader(auth);
        boolean liked = messageService.toggleLike(id, userId);
        return Result.ok(Map.of("liked", liked));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id,
                              @RequestHeader(value = "Authorization", required = false) String auth) {
        Long userId = getUserIdFromHeader(auth);
        if (userId == null) throw new BizException(401, "请先登录");
        messageService.deleteMessage(id, userId);
        return Result.ok();
    }
}
