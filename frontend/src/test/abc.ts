// function firstElement<T>(arr: T[]): T {
//   return arr[0];
// }
// const numbers = [1, 2, 3];
// const firstNum = firstElement<number>(numbers); // T = number → kiểu trả về là number
// console.log(firstNum);
// ============
// class Box {
//   content;
//   constructor(value: string) {
//     this.content = value;
//   }
// }

// // Tạo hộp chứa số
// const numBox = new Box("100");
// console.log(typeof numBox.content); // 100, kiểu number

function identity<Type>(arg: Type): Type {
  return arg;
}

let myIdentity: { <Type>(arg: Type): Type } = identity;
