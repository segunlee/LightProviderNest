## LightProvider Linux 사용방법

```
리눅스에 대한 기본 배경 지식이 있다고 가정하고 작성되었습니다.

기본 설치 필요 패키지
 - GIT or CURL
 - NPM
 - VIM
```

1. git을 통해 받거나 curl를 통해 소스를 다운로드합니다.

    ```
    git clone https://github.com/segunlee/LightProviderNest && cd LightProviderNest
    
    or
    
    curl -LO https://github.com/segunlee/LightProviderNest/archive/refs/tags/1.0.0.tar.gz
    tar -xzvf 
    mv LightProviderNest-1.0.0 LightProviderNest
    cd LightProviderNest
    ```

2. npm i 를 통해 모듈을 설치합니다.

    ```
    npm i
    ```

3. NestJS CLI 설치

    ```
    npm i -g @nestjs/cli
    ```

4. 포트, 패스워드, 패스 설정하기

    ```
    vi .env.prod
    
    ============
    
    BASE_PATH=/
    PORT=3000
    PASSWORD=1234
    
    ============
    ```

5. 서버 실행

    ```
    npm run start:prod
    ```

    




## LightComics에서 서버 접속하기

1. iOS 앱에서 원격저장소 탭메뉴 상단 +를 눌러 LightProvider 선택
2. 서버 IP 또는 URL을 호스트에 기입
3. 서버앱의 PASSWORD값을 비밀번호에 기입
4. 서버앱에서 지정한 PORT값을 Port에 기입
5. 저장