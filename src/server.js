// express 설정
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const { userRouter, blogRouter } = require('./routes');

const { generateFakeData } = require('../faker2');

/// API 요청 메서드
// #1 - Create -> POST
// #2 - Read -> GET
// #3 - Update -> PUT
// #4 - Delete -> DELETE

// postman으로 get, post 테스트 확인을 해보자.

/// 미들웨어 (Middleware)
// #1 - CORS : 외부 도메인에서 API호출 시 보안을 해주는 미들웨어
// #2 - JSON.parse : JSON형식으로 전달오기때문에 파싱을 통해서 req.body안에 정보를 넣어준다.

// mongoDB -> Connect your application -> 코드 가져오기.
const MONGO_URI = 'mongodb+srv://admin:OMqP7ONdAgdqHFoJ@mongodbtutorial.gzz1d.mongodb.net/BlogService?retryWrites=true&w=majority'

// mongoose에 mongoDB 연결
const server = async() => {
    try {
        await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false });
        
        // mongoose가 어떻게 mongoDB 요청하는지 확인 가능
        // mongoose.set('debug', true);
        

        console.log('mongdb connected');

        // 미들웨어
        app.use(express.json()); // JSON.parse 하기
        app.use('/user', userRouter); // user로 오면 userRouter로 연결
        app.use('/blog', blogRouter); // blog로 오면 blogRouter로 연결
        // app.use('/blog/:blogId/comment', commentRouter) // 부모 - blog , 자식 - comment

        // 첫번째 인자: backend port number
        // 서버가 켜지는 시점.
        app.listen(3050, async () => {
            console.log('server listening on port 3050');
            // await generateFakeData(10, 1, 10);
        });

    } catch(error) {
        console.log(error);
    }
}

server();


