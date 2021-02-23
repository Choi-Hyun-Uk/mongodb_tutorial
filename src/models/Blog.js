const { Schema, model, Types } = require('mongoose');
const { CommentSchema } = require('./Comment');

// 블로그 스키마
const BlogSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    // islive - default(true) : 전체공개 / default(false) : 나만보기(임시저장)
    islive: { type: Boolean, required: true, default: false },
    // ref - mongoose에게 user에 대한 데이터를 알려준다.
    // ref 값은 User.js의 하단 model('user', UserSchema)의 첫번째 인자와 동일 해야한다.
    user: { 
        _id: { type: Types.ObjectId, required: true, ref: 'user' },
        username: { type: String, required: true },
        name: {
            first: { type: String, required: true },
            last: { type: String, required: true },
        },
    },
    commentsCount: { type: Number, default: 0, required: true },
    comments: [CommentSchema],
}, { timestamps: true });

// index 생성(복합키)
BlogSchema.index({ "user._id": 1, updateAt: 1 }); // index 1개 생성
BlogSchema.index({ title: "text", content: "text" }); // text index 1개 생성

// 가상 필드(data) 추가 : blog의 comment의 user를 불러오기 위해서 가상 필드 추가 (user는 comment.js에 있기 때문에)
// BlogSchema.virtual("comments", {
//     ref: "comment",
//     localField: "_id",
//     foreignField: "blog"
// });

// // 가상 필드 연결
// BlogSchema.set('toObject', { virtuals: true });
// BlogSchema.set('toJson', { virtuals: true });

const Blog = model('blog', BlogSchema);

module.exports = { Blog }; 