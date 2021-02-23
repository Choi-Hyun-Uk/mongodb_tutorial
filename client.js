const axios = require('axios');

console.log("client code running.");

const URI = "http://localhost:3050";

// 비효율적인 방법:
//      - blogsLimit 20일 때: 6초
//      - blogsLimit 50일 때: 15초

// populate 사용하는 방법
//      - blogsLimit 20일 때: 0.8초
//      - blogsLimit 50일 때: 0.7초
//      - blogsLimit 200일 때: 2초

// nesting 사용하는 방법
//      - blogsLimit 20일 때: 0.1~2초
//      - blogsLimit 50일 때: 0.2~3초
//      - blogsLimit 200일 때: 0.3초

const test = async () => {
    console.time("time start");
    try {
        await axios.get(`${URI}/blog`);
    } catch(err) { console.error(err) }
    // blogs = await Promise.all(blogs.map(async (blog) => {
    //     const [ res1, res2 ] ㄴ= await Promise.all([  // Promise.all은 배열로 처리한다.
    //         axios.get(`${URI}/user/${blog.user}`), // res1
    //         axios.get(`${URI}/blog/${blog._id}/comment`), // res2
    //     ]);
    //     blog.user = res1.data.user;
    //     blog.comments = await Promise.all(res2.data.comments.map(async (comment) => {
    //         const { data: { user } } = await axios.get(`${URI}/user/${comment.user}`);
    //         comment.user = user // comment에 user를 추가
    //         return comment; // 변형된 comment를 return
    //     }));
    //     return blog;
    // }));
    console.timeEnd("time start");
};

test();