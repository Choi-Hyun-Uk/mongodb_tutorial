const { Router } = require('express');
const { isValidObjectId, startSession } = require('mongoose');
const { Blog, User, Comment } = require('../models');

const commentRouter = Router({ mergeParams: true });

// 실제 아래 post 경로 : /blog/:blogId
// 위 경로를 따르기 위해 Router({ mergeParams: true }) 해준다.
commentRouter.post('/', async(req, res) => {
    // transection 하기.
    // transection : 한번에 여러작업이 들어올 경우 병렬작업이 아닌, 하나가 끝난 뒤에 작업이 진행되도록 해준다.
    // 즉, 비동기에서 동기처럼 작업
    // const session = await startSession();
    let comment;
    try {
        // await session.withTransaction(async() => {
            const { blogId } = req.params; // blog Id 가져오기.
            const { content, userId } = req.body; // content, userId 가져오기.

            if (!isValidObjectId(blogId)){
                return res.status(400).send({ error: "blogId is invaild" });
            };
            if (!isValidObjectId(userId)){
                return res.status(400).send({ error: "userId is invaild" });
            }
            if (typeof content !== 'string'){
                return res.status(400).send({ error: "content is required" });
            }

            // Promise.all로 병렬로 불러오기. (여러 await 데이터), 배열로 리턴
            // session : find에 넣어주기 (transection 필수 값)
            // const [blog, user] = await Promise.all([
            //     Blog.findById(blogId, {}, { session }), 
            //     User.findById(userId, {}, { session }),
            // ]);

            const [blog, user] = await Promise.all([
                Blog.findById(blogId), 
                User.findById(userId),
            ]);

            if(!blog || !user){
                return res.status(400).send({ error: "blog or user does not exist" });
            }
            if(!blog.islive){
                return res.status(400).send({ error: "islive is false" });
            }
            
            comment = new Comment({ 
                content,
                user,
                userFullName: `${user.name.first} ${user.name.last}`,
                blog: blogId,
            });
            
            // 후기 생성하는 API 수정 - 내장 방법
            // await Promise.all([
            //     // comment 생성
            //     comment.save(),
            //     // blog 변경 : blog comments에 comment 넣기
            //     Blog.updateOne({ _id: blogId }, { $push: { comments: comment } }),
            // ]);

            // comment 갯수 올리기
            // blog.commentsCount ++;
            // // comment를 blog의 comments에 추가하기.
            // blog.comments.push(comment);

            // if(blog.commentsCount > 3) {
            //     // shift : 배열 첫번째 값이 날아간다.
            //     return blog.comments.shift();
            // }

            // await Promise.all([
            //     comment.save({ session }),
            //     blog.save(),
            //     // 조건에 맞는 blog의 comment 갯수를 1개씩 올린다.(total comment)
            //     // Blog.updateOne({ _id: blogId }, { $inc: { commentsCount: 1 } }),
            // ]);
            
        // });
        await Promise.all([
            comment.save(),
            Blog.updateOne(
                { _id: blogId },
                { $inc: { commentsCount: 1 }, $push:{ comments: { $each: [comment], $slice: -3 } }},
            ),
        ]);
        return res.send({ comment });
    } catch(error) {
        console.log(error);
    } finally {
        await session.endSession();
    }
});

commentRouter.get('/', async(req, res) => {
    try {
        let { page = 0 } = req.query; // 없을 경우 0이 default 값
        page = parseInt(page);
        const { blogId } = req.params;
        if(!isValidObjectId(blogId)) return res.status(400).send({ error: "blogId is invaild" });

        // pagenation 적용
        const comments = await Comment.find({ blog: blogId }).sort({ createAt: -1 }).skip( page * 3 ).limit(3); // ObjectId
        return res.send({ comments });

    } catch(error) {
        console.log(error);
    }
});

commentRouter.patch('/:commentId', async(req, res) => {
    const { commentId } = req.params; // comment Id
    const { content } = req.body; // comment의 content(내용)

    if (typeof content !== "string") { // comment이 string이 아니면
        return res.status(400).send({ err: "content is required" });
    }

    const [ comment, blog ] = await Promise.all([
        Comment.findOneAndUpdate(
            { _id: commentId },
            { content },
            { new: true }
        ),
        // mongoDB에서 특정 아이디 검색할 때 'comments._id' (중요문법)
        // 'comments.$.content' 는 앞에 선택된 id에 대한 것 (중요문법)
        Blog.updateOne(
            { 'comments._id': commentId },
            { 'comments.$.content': content }
        ),
    ]);

    return res.send({ comment });
});

// 해당 블로그의 코멘트 삭제하기
commentRouter.delete('/:commentId', async (req, res) => {
    const { commentId } = req.params;
    const comment = await Comment.findOneAndDelete({ _id: commentId });
    await Blog.updateOne(
        { 'comments._id': commentId},
        { $pull: { comments: { _id: commentId } } }
    );
    return res.send({ comment });
});

module.exports = { commentRouter }
