// callback은 함수이다.
// 실패, 성공에 대해서 하나만 결과로 나올 수 있도록 처리를 안하면,
// 실패해도 성공을 부르고, 성공해도 실패를 불러올 수 있다.

// 현재 아래에서는 return을 적어서 하나의 결과값만 나올 수 있도록 처리하였다.

const addSum = (a, b, callback) => {
    setTimeout(() => {
        if(typeof a !== 'number' || typeof b !== 'number') {
            return callback('a, b must be numbers');
        }
        callback(undefined, a + b);
    },3000);
}

// callback 함수 예시
// let callback = (error, sum) => {
//     if (error) return console.log({ error });
//     console.log({ sum });
// }

// callback 지옥

addSum(10, 10, (error1, sum1) => {
    if (error1) return console.log({ error1 });
    console.log({ sum1 });
    addSum(sum1, 15, (error2, sum2) => {
        if (error2) return console.log({ error2 });
        console.log({ sum2 });
    });
});