import show from './test2';

var a = [12,31,23,123,123,123,312,3123,1,233,123,123,2134,124,324,5,346,46,46].map(d=>{
    return d*d;
})

console.log(a); 
console.log("imp=>",show);

var b = ["123","asdfasfd"];
var c = [1,2,3,...b,1,2,32,3,123,123,231];

let { x, y, ...z } = { x: 1, y: 2, a: 3, b: 4 };
console.log(x); // 1
console.log(y); // 2
console.log(z); // { a: 3, b: 4 }

// Spread properties
let n = { x, y, ...z };
console.log(n); // { x: 1, y: 2, a: 3, b: 4 }
console.log(obj)

function demo(part1, ...part2) {
    return {part1, part2}
}

console.log(demo(1,2,3,4,5,6))


//////////////////
// let fibonacci = {
//     [Symbol.iterator]() {
//       let pre = 0, cur = 1;
//       return {
//         next() {
//           [pre, cur] = [cur, pre + cur];
//           return { done: false, value: cur }
//         }
//       }
//     }
//   }
  
//   for (var n of fibonacci) {
//     // truncate the sequence at 1000
//     if (n > 1000)
//       break;
//     console.log(n);
//   }