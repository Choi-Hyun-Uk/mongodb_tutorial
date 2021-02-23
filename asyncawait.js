// async , await

const addSum = (a, b) => new Promise((resolve, reject) => {
    setTimeout(() => {
        if(typeof a !== 'number' || typeof b !== 'number') {
            reject('a, b must be numbers');
        }
        resolve(a + b);
    }, 1000);
});

const totalSum = async () => {
    try {
        let sum = await addSum(10, 10);
        let sum2 = await addSum(sum, 10);
        console.log({ sum, sum2 })
    } catch(error) {
        console.log({ error })
    }
}   

totalSum();