package com.guzheng.util;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.interfaces.DecodedJWT;
import org.springframework.stereotype.Component;
import java.util.Date;

@Component
public class JwtUtil {
    private static final String SECRET = "guzheng-heritage-secret-key-2026";
    private static final long EXPIRE_MS = 7 * 24 * 60 * 60 * 1000L;

    public String generate(Long userId, String username) {
        return JWT.create()
                .withClaim("userId", userId)
                .withClaim("username", username)
                .withExpiresAt(new Date(System.currentTimeMillis() + EXPIRE_MS))
                .sign(Algorithm.HMAC256(SECRET));
    }

    public DecodedJWT verify(String token) {
        return JWT.require(Algorithm.HMAC256(SECRET)).build().verify(token);
    }

    public Long getUserId(String token) {
        return verify(token).getClaim("userId").asLong();
    }
}
