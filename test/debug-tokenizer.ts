import { JavaParser } from '../src/parser/JavaParser';

const javaCode = 'int x = 5;';
const parser = new JavaParser();
const tokens = parser.tokenize(javaCode);

console.log(tokens);