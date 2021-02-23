const { Schema, model } = require('mongoose');

// 스키마 만들기
// 데이터에 대한 룰을 정하면, mongoose에서 룰을 확인하여, 데이터를 mongoDB에 전달.
// required : 필수 저장 값
// unique : 유일한 값 (중복 저장 불가)

const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    name: {
        first: { type: String, required: true },
        last: { type: String, required: true },
    },
    age: { type: Number, index: true },
    email: String,
}, { timestamps: true }); //timestamps : 생성, 수정 날짜 표기

// user 생성 후 mongoose에게 알려주기
// 'user'는 관계 생성 시 ref의 값과 동일해야한다.
const User = model('user', UserSchema);

module.exports = { User };