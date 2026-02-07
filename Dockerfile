# 1. Nginx 베이스 이미지 사용
FROM nginx:alpine

# 2. React 빌드된 파일 복사
COPY dist/ /usr/share/nginx/html

# 3. Nginx 설정 파일 덮어쓰기
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 4. 컨테이너 실행
CMD ["nginx", "-g", "daemon off;"]
