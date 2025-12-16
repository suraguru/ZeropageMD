
import { marked } from 'marked';

const inputWithBreak = `4. Question

<!-- list-break -->

1. Answer`;

const html = marked.parse(inputWithBreak);
console.log(html);
