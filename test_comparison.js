
import { marked } from 'marked';

const jammed = `### **Part 3: Long Answer Questions (10 Marks)***Instructions: Providing 10-12 points as requested for the 10-mark section.*`;
const spaced = `### **Part 3: Long Answer Questions (10 Marks)** *Instructions: Providing 10-12 points as requested for the 10-mark section.*`;

console.log("--- Jammed ---");
console.log(marked.parse(jammed));

console.log("\n--- Spaced ---");
console.log(marked.parse(spaced));
