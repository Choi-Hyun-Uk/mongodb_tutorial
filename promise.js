// callback과 다르게 실패, 성공에 대한 return을 적지 않아도,
// 둘 중 하나만 결과값으로 나오게된다. (resovle or reject)

const addSum = (a, b) => new Promise((resolve, reject) => {
    setTimeout(() => {
        if(typeof a !== 'number' || typeof b !== 'number') {
            reject('a, b must be numbers');
        }
        resolve(a + b);
    }, 1000);
});

// then, catch로 실패, 성공 구분 가능
// 중간의 then에서 문자를 넣을 경우에 catch에서 error를 잡아낸다.

// 번거로운 점.
// then과 then의 값은 서로 공유할 수 없다. 공유 시 변수를 만들어서 공유를 해야한다.

let _sum1, _sum2; // then끼리 공유할 변수

addSum(10, 20)
.then((sum1) => {
    _sum1 = sum1;
    return addSum(_sum1, 3);
})
.then((sum2) => {
    _sum2 = sum2;
    return addSum(_sum2, 3);
})
.then((sum3) => console.log({ sum3 }))
.catch((error) => console.log({ error }))