const { Router } = require('express');
const { isValidObjectId } = require('mongoose');

const { User, Blog, Comment } = require('../models');

const userRouter = Router();

userRouter.get('/', async (req, res) => {
    try {
        // find : 모든 데이터를 배열로 리턴
        // findOne : 하나의 데이터를 객체로 리턴
        const users = await User.find({});
        return res.send({ users });
    } catch(error) {
        console.log(error);
        return res.status(500).send({ error: error.message });
    }
});

// :userId - params값으로 가져온다.
// get API
userRouter.get('/:userId', async(req, res) => {
    try {
        const { userId } = req.params;
        if(!isValidObjectId(userId)) { // ObjectId인지 체크
            return res.status(400).send({ error: "inValid userId "});
        }
        const user = await User.findOne({ _id: userId });
        return res.send({ user });
    } catch(error) {
        console.log(error);
        return res.status(500).send({ error: error.message });
    }
});

// post API
userRouter.post('/', async (req, res) => {
    try {
        let { username, name } = req.body; // ../models/User.js 정한 필수값
        if(!username) {
            return res.status(400).send({ error: "username is required" });
        }
        if(!name || !name.first || !name.last) {
            return res.status(400).send({ error: "name is required" });
        }
        const user = new User(req.body);
        // User 인스턴스를 생성 후
        // mongoose의 save 함수를 호출 - 저장하면 Promise로 return되면
        // mongoDB에 데이터가 저장이 되고, 다음 줄 작업 진행
        await user.save(); 
        return res.send({ user });
    } catch(error) {
        console.log(error);
        return res.status(500).send({ error: error.message }); // 실패 사유 상태값 - 500(서버오류)
    }
});

// delete API
userRouter.delete('/:userId', async(req, res) => {
    try {
        const { userId } = req.params;
        if(!isValidObjectId(userId)) { // ObjectId인지 체크
            return res.status(400).send({ error: "inValid userId "});
        }
        const [user] = await Promise.all([
            User.findOneAndDelete({ _id: userId }), // 유저 삭제
            Blog.deleteMany({ "user._id": userId }), // 유저가 작성한 블로그 삭제
            // 유저가 작성한 댓글 삭제하여, 블로그 업데이트
            Blog.updateMany({ "commtents.user": userId }, { $pull: { commtents: { user: userId } } }),
            // 유저가 작성 댓글 삭제
            Comment.deleteMany({ user: userId }),
        ]);
        console.log(user);
        return res.send({ user });
    } catch(error) {
        console.log(error);
        return res.status(500).send({ error: error.message });
    }
});

// put API
userRouter.put('/:userId', async(req, res) => {
    try {
        const { userId } = req.params; // userId
        if(!isValidObjectId(userId)) { // ObjectId인지 체크
            return res.status(400).send({ error: "inValid userId "});
        }

        const { age, name } = req.body; // user정보
        if (!age && !name) {
            return res.status(400).send({ err: "age or name id required" });
        }
        if (age && typeof age !== "number") {
            return res.status(400).send({ err: "age must a number" });
        }
        if (name && typeof name.first !== "string" && typeof name.last !== "string") {
            return res.status(400).send({ err: "first and last name are strings" });
        }
        
        // 작은 데이터를 업데이트 할 시
        // 업데이트 시 user 정보가 몇개든 업데이트 한 정보만 변경해주기 위한 객체 생성.
        // 생성된 객체에 if문으로 변경 작업이 있는 속성만 객체에 변경 정보 넣어주기.
        // let updateUserInfo = {};
        // if(age) updateUserInfo.age = age;
        // if(name) updateUserInfo.name = name;

        // new : 업데이트 된 데이터로 리턴
        // 첫번째인자 : 유저정보 , 두번째인자 : 변경값, 세번째인자: 업데이트 리턴
        // const user = await User.findByIdAndUpdate(userId, updateUserInfo, { new: true });

        // save() 업데이트 방법 : 데이터 구조가 복잡하거나, 여러 인스턴트스를 변경할 때 유용
        let user = await User.findById(userId);
        if(age) {
            return user.age = age;
        }
        if(name) {
            user.name = name; // 변경된 이름
            await Promise.all([
                // 여러 blog의 user.name 수정
                Blog.updateMany({ 'user._id': userId }, { 'user.name': name }),
                // 여러 blog의 여러 comment의 user.name 수정
                Blog.updateMany(
                    {},
                    { 'comments.$[comment].userFullName': `${name.first} ${name.last}`},
                    // arrayFilters : 위 조건에 다른 작업 진행(배열)
                    { arrayFilters: [{'comment.user': userId}] }  
                ),
            ]);
        }
        await user.save(); // updateOne 호출
        return res.send({ user });
    } catch(error) {
        console.log(error);
        return res.status(500).send({ error: error.message });
    }
});

module.exports = {
    userRouter
};