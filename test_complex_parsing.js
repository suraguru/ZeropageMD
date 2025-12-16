
import { marked } from 'marked';

const input = `###**Part 3: Long Answer Questions (10 Marks)***Instructions: Providing 10-12 points as requested for the 10-mark section.*`;

console.log("Original Input:", input);

let processed = input;

// 1. Lenient Headers
processed = processed.replace(/(^|\n)(#{1,6})([^\s#])/g, '$1$2 $3');

// 2. Lenient Lists (might affect *Instructions if at start of line, but here it is inline? No, ### is start)
// Wait, ### makes it a line.
// The regex for list items `(^|\n)([\*\-\+])([^\s\*\-\+])` checks start of line.
// `***Instructions` is NOT at start of line if it's after `(10 Marks)`. 
// But the INPUT string provided by user seems to be one line?

console.log("After Pre-processing:", processed);

const html = marked.parse(processed);
console.log("Rendered HTML:", html);
