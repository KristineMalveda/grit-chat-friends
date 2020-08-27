//map 

let letters =["K", "r","i","s","t","i","n","e"];

const mappedLetters = letters.map(letter => {
        return "_" +  letter + "_";
});

console.log(mappedLetters);

//filter 
const filteredLetters = letters.filter(letter => 
    letter !== 'n');
   
console.log(filteredLetters);

let numbers = [10, 4, 50, 100];
//reduce
const reducedNumbers = numbers.reduce((acc, currentValue) => { 
    return acc * currentValue + currentValue;})  
console.log(reducedNumbers);
console.log(numbers);

//eventlisteners 

//Filter, map, reduce. foreach


//console(log, table, time, timeEnd)