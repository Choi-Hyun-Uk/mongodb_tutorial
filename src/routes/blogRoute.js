const { Router } = require('express');
const { isValidObjectId } = require('mongoose');

const { Blog, User, Comment } = require('../models');

const { commentRouter } = require('../routes/commentRoute');

// Router 실행
const blogRouter = Router();

// 미들웨어 (comment 자식)
blogRouter.use("/:blogId/comment", commentRouter)

blogRouter.post('/', async(req, res) => {
    try {
        const { title, content, islive, userId } = req.body;

        // req.body 데이터 검증
        if(typeof title !== 'string') {
            return res.status(400).send({ error: "title은 필수로 작성해주세요." });
        };
        if(typeof content !== 'string') {
            return res.status(400).send({ error: "content는 필수로 작성해주세요." });
        };
        if(islive && typeof islive !== 'boolean') {
            return res.status(400).send({ error: "islive is boolean" });
        };
        if(!isValidObjectId(userId)) {
            return res.status(400).send({ error: "유효하지 않는 아이디입니다." });
        };

        // user 검증
        let user = await User.findById(userId);
        if(!user) res.status(400).send({ error: "유저 정보가 없습니다." });

        let blog = new Blog({ ...req.body, user });
        await blog.save();
        return res.send({ blog });

    } catch(error) {
        console.log(error);
        res.status(500).send({ error: error.message });
    }
});

// 블로그 데이터 전부 불러오기.
blogRouter.get('/', async(req, res) => {
    try {
        let { page } = req.query; // query : express 기능
        page = parseInt(page);
        // pagenation 원리
        let blogs = await Blog.find({}).sort({ updateAt: -1 }).skip(page * 3).limit(3); // 20개 블로그 불러오기.
            
            // 각 블로그에 user 데이터를 채우기. (효율적)
            // .populate([
            //     { path: "user" },
            //     { path: "comments", populate: { path: "user" } },
            // ]); 
        
            return res.send({ blogs });
    } catch(error) {
        console.log(error);
        res.status(500).send({ error: error.message });
    }
});

// 특정 블로그를 불러올 때
blogRouter.get('/:blogId', async(req, res) => {
    try {
        const { blogId } = req.params; // params : blogId
        if(!isValidObjectId(blogId)) res.status(400).send({ error: "유효하지 않은 id입니다." });

        const blog = await Blog.findOne({ _id: blogId });

        // countDocuments : count 추출
        // const commentCount = await Comment.find({ blog: blogId }).countDocuments();

        return res.send({ blog });
    } catch(error) {
        console.log(error);
        res.status(500).send({ error: error.message });
    }
});

// 블로그를 전체 수정할 때
blogRouter.put('/:blogId', async(req, res) => {
    try {
        const { blogId } = req.params; // params : blogId
        if(!isValidObjectId(blogId)) res.status(400).send({ error: "유효하지 않은 id입니다." });

        const { title, content } = req.body;
        // req.body 데이터 검증
        if(typeof title !== 'string') res.status(400).send({ error: "title은 필수로 작성해주세요." });
        if(typeof content !== 'string') res.status(400).send({ error: "content는 필수로 작성해주세요." });
        
        const blog = await Blog.findOneAndUpdate({ _id: blogId }, {title, content}, { new: true });
        res.send({ blog });
    } catch(error) {
        console.log(error);
        res.status(500).send({ error: error.message });
    }
});

// 블로그의 특정 부분만 수정 할때: live
blogRouter.patch('/:blogId/live', async(req, res) => {
    try {
        const { blogId } = req.params; // params : blogId
        if(!isValidObjectId(blogId)) res.status(400).send({ error: "유효하지 않은 id입니다." });

        const { islive } = req.body;
        if(typeof islive !== 'boolean') res.status(400).send({ error: "boolean islive is required" });

        const blog  = await Blog.findByIdAndUpdate(blogId, { islive }, { new: true });
        return res.send({ blog });
    } catch(error) {
        console.log(error);
        res.status(500).send({ error: error.message });
    }
});

module.exports = { blogRouter };

