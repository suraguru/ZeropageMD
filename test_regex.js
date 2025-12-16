
const testString = `4. Describe the powers and functions of Lok Sabha? 

1. **Law Making:** Can introduce and pass bills on Union and Concurrent lists.
2. **Money Bills:** Exclusive power; Money Bills can *only* be introduced in Lok Sabha.`;

let protectedMd = testString;

// Lenient Parsing (Copied from ZeropageMD.jsx)
protectedMd = protectedMd.replace(/(^|\n)(#{1,6})([^\s#])/g, '$1$2 $3');
protectedMd = protectedMd.replace(/(^|\n)([\*\-\+])([^\s\*\-\+])/g, '$1$2 $3');
protectedMd = protectedMd.replace(/(^|\n)(\d+\.)([^\s\d])/g, '$1$2 $3');

// List Breaking Logic (Copied from ZeropageMD.jsx)
protectedMd = protectedMd.replace(/(^|\n)(\d+\.[ \t].+)(\n{1,2})(1\.[ \t])/g, '$1$2\n\n<!-- list-break -->\n\n$4');

console.log("Original:\n", JSON.stringify(testString));
console.log("Processed:\n", JSON.stringify(protectedMd));

if (protectedMd.includes('<!-- list-break -->')) {
    console.log("SUCCESS: List break inserted.");
} else {
    console.log("FAILURE: List break NOT inserted.");
}
