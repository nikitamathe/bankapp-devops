package com.banking.transaction.config;

import com.banking.transaction.security.JwtContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpRequest;
import org.springframework.http.client.ClientHttpRequestExecution;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.List;

@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate(new SimpleClientHttpRequestFactory());

        // Interceptor: attach the JWT from the current thread to every outgoing request
        ClientHttpRequestInterceptor jwtForwardingInterceptor = new ClientHttpRequestInterceptor() {
            @Override
            public ClientHttpResponse intercept(
                    HttpRequest request,
                    byte[] body,
                    ClientHttpRequestExecution execution) throws IOException {

                String token = JwtContext.getToken();
                if (token != null && !token.isBlank()) {
                    request.getHeaders().set("Authorization", "Bearer " + token);
                }
                return execution.execute(request, body);
            }
        };

        restTemplate.setInterceptors(List.of(jwtForwardingInterceptor));
        return restTemplate;
    }
}
