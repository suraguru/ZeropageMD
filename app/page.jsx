"use client";
import React, { useState, useEffect, useRef } from 'react';
import {
    FileText,
    Download,
    Settings,
    Type,
    Moon,
    Sun,
    Zap,
    Code,
    Image as ImageIcon,
    List,
    Palette,
    Terminal,
    Sparkles,
    Share2,
    Upload
} from 'lucide-react';
import { marked } from 'marked';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import renderMathInElement from 'katex/dist/contrib/auto-render';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import { markedHighlight } from 'marked-highlight';

export default function ZeropageMD() {
    // --- State ---
    const [markdown, setMarkdown] = useState(defaultMarkdown);
    const [htmlContent, setHtmlContent] = useState('');
    const [customCSS, setCustomCSS] = useState('');
    const [activeTab, setActiveTab] = useState('markdown'); // 'markdown' | 'css'
    const [mobileTab, setMobileTab] = useState('editor'); // 'editor' | 'preview'
    const [isGenerating, setIsGenerating] = useState(false);
    // const [libsLoaded, setLibsLoaded] = useState(false); // No longer needed with NPM
    const [scale, setScale] = useState(1);

    // Configuration State
    const [config, setConfig] = useState({
        theme: 'zine', // 'standard' | 'zine' | 'neon' | 'academic'
        darkModePdf: false,
        showLineNumbers: false
    });

    const previewRef = useRef(null);
    const containerRef = useRef(null);
    const fileInputRef = useRef(null);

    // --- Themes Definitions (Strictly Scoped) ---
    const themes = {
        standard: `
      /* Standard Clean Theme */
      .preview-content { font-family: 'Inter', sans-serif; color: #1f2937; line-height: 1.6; }
      .preview-content h1 { color: #111827; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.3em; margin-bottom: 0.8em; font-weight: 700; font-size: 2.25em; }
      .preview-content h2 { color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.2em; margin-top: 1.5em; margin-bottom: 0.8em; font-weight: 600; font-size: 1.75em; }
      .preview-content p { margin-bottom: 1em; }
      .preview-content a { color: #2563eb; text-decoration: none; font-weight: 500; }
      .preview-content a:hover { text-decoration: underline; }
      .preview-content blockquote { border-left: 4px solid #e5e7eb; color: #4b5563; padding-left: 1em; margin-left: 0; font-style: italic; }
      .preview-content blockquote { border-left: 4px solid #e5e7eb; color: #4b5563; padding-left: 1em; margin-left: 0; font-style: italic; }
      .preview-content code { 
         background: rgba(0,0,0,0.1); 
         color: #059669; 
         font-family: 'JetBrains Mono', 'Consolas', monospace; 
         border: 1px solid rgba(0,0,0,0.1);
         border-radius: 4px; 
         padding: 3px 6px; 
      }
    `,
        professional: `
      /* PROFESSIONAL / PRINT OPTIMIZED THEME */
      .preview-content { font-family: 'Inter', 'Segoe UI', sans-serif; color: #000; font-size: 10.5pt; line-height: 1.45; }
      .preview-content h1 { 
        font-size: 20pt; 
        font-weight: 800; 
        color: #000; 
        border-bottom: 2px solid #000; 
        padding-bottom: 8px; 
        margin-bottom: 16px; 
        letter-spacing: -0.02em;
      }
      .preview-content h2 { 
        font-size: 14pt; 
        font-weight: 700; 
        color: #000; 
        margin-top: 24px; 
        margin-bottom: 12px; 
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 4px;
      }
      .preview-content h3 { font-size: 12pt; font-weight: 700; margin-top: 18px; margin-bottom: 8px; color: #1f2937; }
      .preview-content p { margin-bottom: 10px; text-align: justify; }
      .preview-content ul, .preview-content ol { margin-bottom: 10px; padding-left: 24px; }
      .preview-content li { margin-bottom: 4px; }
      .preview-content code { 
         background: rgba(0,0,0,0.1); 
         color: #059669; 
         font-family: 'JetBrains Mono', 'Consolas', monospace; 
         border: 1px solid rgba(0,0,0,0.1);
         border-radius: 4px; 
         padding: 3px 6px; 
         white-space: pre-wrap !important;
      }
      /* Pre block removed to inherit global dark theme (Neon style) */
      .preview-content blockquote { 
        border-left: 3px solid #000; 
        margin: 16px 0; 
        padding: 4px 0 4px 16px; 
        color: #374151; 
        font-style: italic;
      }
      .preview-content table { 
        width: 100%; 
        border-collapse: collapse; 
        margin: 16px 0; 
        font-size: 9.5pt;
      }
      .preview-content th { border-bottom: 2px solid #000; font-weight: 700; text-align: left; padding: 6px; }
      .preview-content td { border-bottom: 1px solid #e5e7eb; padding: 6px; }
      .preview-content img { max-width: 100%; height: auto; border-radius: 4px; border: 1px solid #e5e7eb; }
    `,
        zine: `
      /* ZINE / Brutalist Theme - Improved Contrast & Readability */
      .preview-content { font-family: 'Courier New', monospace; color: #000; }
      .preview-content h1 { 
        font-family: 'Helvetica', 'Arial', sans-serif; 
        font-weight: 900; 
        text-transform: uppercase; 
        font-size: 3.5em; 
        line-height: 1;
        border-bottom: 6px solid #000; 
        padding: 0.2em 0.5em 0.2em 0; 
        margin-bottom: 0.8em; 
        background: #ffff00; 
        display: inline-block; 
        transform: rotate(-1deg); 
        box-shadow: 4px 4px 0px #000;
      }
      .preview-content h2 { 
        font-family: 'Helvetica', 'Arial', sans-serif; 
        font-weight: 800;
        background: #000; 
        color: #fff; 
        display: inline-block; 
        padding: 8px 20px; 
        transform: skew(-5deg); 
        margin-top: 1.5em;
        margin-bottom: 0.5em;
        box-shadow: 3px 3px 0px #999;
      }
      .preview-content p { font-size: 1.1em; line-height: 1.5; margin-bottom: 1.2em; }
      .preview-content blockquote { 
        border: 3px solid #000; 
        padding: 1.5em; 
        background: #ff00ff; 
        color: #fff; 
        box-shadow: 8px 8px 0px #000; 
        font-style: normal; 
        font-weight: bold; 
        margin: 1.5em 0;
      }
      .preview-content a { 
        background: #000; 
        color: #fff; 
        padding: 2px 6px; 
        text-decoration: none; 
        display: inline-block;
        transition: transform 0.1s;
      }
      .preview-content img { border: 3px solid #000; box-shadow: 8px 8px 0px #000; }
      .preview-content table { border: 3px solid #000; box-shadow: 4px 4px 0px #000; page-break-inside: avoid; break-inside: avoid; }
      .preview-content th { background: #000; color: #fff; text-transform: uppercase; font-weight: 900; padding: 12px; }
      .preview-content td { border: 2px solid #000; padding: 10px; }
    `,
        neon: `
      /* Cyber / Neon Theme - Refined */
      .preview-content { font-family: 'Segoe UI', system-ui, sans-serif; } /* Color handled by container for print safety */
      .preview-content h1 { 
        color: #d946ef; /* Darker Pink for visibility on white */
        font-weight: 800; 
        letter-spacing: -0.05em; 
        font-size: 3em;
        text-shadow: 0 0 10px rgba(217, 70, 239, 0.3);
        border-bottom: 1px solid rgba(217, 70, 239, 0.3);
        padding-bottom: 0.5em;
        margin-bottom: 0.8em;
      }
      .preview-content h2 { 
        color: #0891b2; /* Darker Cyan */
        border-left: 4px solid #0891b2; 
        padding-left: 15px; 
        margin-top: 2em;
        margin-bottom: 0.8em;
        font-size: 2em;
        letter-spacing: -0.02em;
      }
      .preview-content p { line-height: 1.7; font-size: 1.1em; margin-bottom: 1.2em; }
      .preview-content code { 
         /* Adaptation for Light/Dark handled by globals or specific overrides below */
        background: rgba(0,0,0,0.1); 
        color: #059669; /* darker green */
        font-family: 'JetBrains Mono', 'Consolas', monospace; 
        border: 1px solid rgba(0,0,0,0.1);
        border-radius: 4px; 
        padding: 3px 6px; 
      }
      .preview-content blockquote { 
        border-left: 4px solid #7c3aed; 
        background: rgba(124, 58, 237, 0.05); 
        padding: 1.5em; 
        color: #6d28d9; 
        border-radius: 0 12px 12px 0; 
        margin: 1.5em 0;
      }
      .preview-content a { 
        color: #db2777; 
        font-weight: 600; 
        text-decoration: none; 
        border-bottom: 1px dashed #db2777; 
        transition: all 0.2s;
      }
      .preview-content th { background: #334155; color: #fff; text-transform: uppercase; letter-spacing: 0.05em; }
      .preview-content td { border-color: #cbd5e1; color: inherit; }
    `,
        academic: `
      /* Academic Theme - Normalized Layout */
      .preview-content { font-family: 'Times New Roman', serif; color: #111; line-height: 2; font-size: 12pt; }
      .preview-content h1 { 
        text-align: center; 
        font-size: 24pt; 
        margin-bottom: 2em; 
        font-weight: bold; 
        color: #000;
        letter-spacing: 0;
        text-transform: none;
      }
      .preview-content h2 { 
        font-size: 14pt; 
        border-bottom: 1px solid #000; 
        padding-bottom: 6px; 
        margin-top: 2em; 
        margin-bottom: 1em;
        text-transform: uppercase; 
        letter-spacing: 1px; 
        font-weight: bold;
      }
      .preview-content p { 
        text-align: justify; 
        text-indent: 0; /* Modern acadamic often skips indent in favor of spacing, but standard uses spacing */
        margin-bottom: 1.5em;
      }
      .preview-content blockquote { 
        margin: 2em; 
        font-size: 0.9em; 
        color: #333;
        border-left: none; /* Traditional style usually just indentation */
        padding: 0;
      }
      .preview-content code { font-family: 'Courier', monospace; font-size: 0.9em; }
      .preview-content a { color: #000; text-decoration: underline; }
      .preview-content table { border-top: 2px solid #000; border-bottom: 2px solid #000; page-break-inside: avoid; break-inside: avoid; }
      .preview-content th { border-bottom: 1px solid #000; font-weight: bold; text-align: center; }
      .preview-content td { border: none; padding: 8px 12px; }
    `,
        miktex: `
      /* MiKTeX / Exam Theme - Rendered Document Style */
      .preview-content { font-family: 'Inter', 'Segoe UI', sans-serif; color: #4b5563; line-height: 1.6; font-size: 11pt; }
      .preview-content h1 { 
        color: #1e3a8a; 
        font-weight: 800; 
        font-size: 24pt; 
        text-transform: uppercase; 
        margin-bottom: 8px; 
        letter-spacing: -0.02em; 
      }
      .preview-content h2 { 
        color: #6b7280; 
        font-weight: 500; 
        font-size: 13pt; 
        margin-top: 0; 
        margin-bottom: 24px; 
      }
      .preview-content h3 { 
        color: #94a3b8; 
        font-weight: 600; 
        font-size: 10pt; 
        text-transform: uppercase; 
        letter-spacing: 1px; 
        border-bottom: 2px solid #3b82f6; 
        padding-bottom: 8px; 
        margin-top: 24px; 
        margin-bottom: 24px; 
      }
      .preview-content blockquote { 
        background-color: #f0f4f8;
        border-left: 4px solid #1e3a8a; 
        padding: 16px 20px; 
        color: #1e3a8a; 
        font-weight: 700; 
        margin: 0 0 24px 0; 
        border-radius: 0 4px 4px 0;
        font-size: 10.5pt;
      }
      .preview-content blockquote p { margin-bottom: 0; }
      .preview-content p { margin-bottom: 12px; color: #4b5563; }
      .preview-content ol { 
        list-style-type: none; 
        counter-reset: item; 
        padding-left: 0; 
      }
      .preview-content ol > li { 
        counter-increment: item; 
        margin-bottom: 24px; 
        position: relative; 
        padding-top: 16px; 
        border-top: 1px dashed #e5e7eb; 
        padding-left: 24px; 
      }
      .preview-content ol > li::before { 
        content: counter(item) "."; 
        color: #2563eb; 
        font-weight: 700; 
        position: absolute; 
        left: 0; 
        top: 16px; 
      }
      .preview-content ol > li > strong:first-child, 
      .preview-content ol > li > p:first-child > strong:first-child { 
        color: #111827; 
      }
      
      /* Chip for marks styling using inline code */
      .preview-content p > code, 
      .preview-content h1 > code, 
      .preview-content h2 > code, 
      .preview-content h3 > code, 
      .preview-content li > code { 
         background: #e0f2fe; 
         color: #0369a1; 
         border: 1px solid #bae6fd;
         border-radius: 4px; 
         padding: 3px 10px; 
         font-weight: 700;
         font-size: 9pt;
         font-family: 'Inter', sans-serif;
         float: right;
         margin-top: -2px;
      }
      
      /* Code block styling */
      .preview-content pre {
         background: #f8fafc;
         color: #334155;
         border-radius: 6px;
         border: 1px solid #e2e8f0;
         padding: 16px;
         font-family: 'JetBrains Mono', 'Consolas', monospace;
         font-size: 9.5pt;
      }
      .preview-content pre code {
         background: transparent;
         color: inherit;
         border: none;
         padding: 0;
         float: none;
         font-family: inherit;
      }
      
      .preview-content ul { padding-left: 24px; margin-bottom: 16px; list-style-type: disc; }
      .preview-content ul li { margin-bottom: 6px; color: #4b5563; border: none; padding: 0; }
      .preview-content ul li::before { content: none; }
      .preview-content strong { color: #374151; font-weight: 700; }
    `
    };

    // --- Effects ---

    // --- Effects ---

    // Configure Marked
    useEffect(() => {
        marked.use(
            markedHighlight({
                langPrefix: 'hljs language-',
                highlight(code, lang) {
                    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
                    return hljs.highlight(code, { language }).value;
                }
            })
        );
        marked.use({
            gfm: true,
            breaks: true
        });
    }, []);

    // Update HTML & Highlight & Math
    useEffect(() => {
        // libsLoaded check removed
        {

            // --- Math Protection ---
            // Marked eats backslashes and underscores, breaking LaTeX.
            // Strategy: Replace math with placeholders -> Parse MD -> Restore Math

            let protectedMd = markdown;

            // --- Lenient Parsing Pre-processing ---
            // 1. Lenient Headers: Fix "#Header" -> "# Header"
            protectedMd = protectedMd.replace(/(^|\n)(#{1,6})([^\s#])/g, '$1$2 $3');

            // 1b. Jammed Syntax Fix: "End)***Start" -> "End)** *Start" (Fixes bold+italic merge)
            protectedMd = protectedMd.replace(/([)\].!?])\*\*\*([^\s\*])/g, '$1** *$2');

            // 2. Lenient Unordered Lists: Fix "*Item" -> "* Item"
            // Note: This might catch italic starts at beginning of line, but user requested bullet fix.
            protectedMd = protectedMd.replace(/(^|\n)([\*\-\+])([^\s\*\-\+])/g, '$1$2 $3');

            // 3. Lenient Numbered Lists: Fix "1.Item" -> "1. Item"
            protectedMd = protectedMd.replace(/(^|\n)(\d+\.)([^\s\d])/g, '$1$2 $3');

            // --- Question Heuristic ---
            // If a numbered line ends with a '?', it's likely a Question Header, not a list item.
            // Escape the dot so it renders as a paragraph: "4. Question?" -> "4\. Question?"
            // This breaks the list context, so the next "1." starts a fresh list.
            protectedMd = protectedMd.replace(/(^|\n)(\d+)\.([ \t].+?\?)/g, '$1$2\\.$3');

            // --- List Breaking Logic ---
            // Prevent "loose lists" from merging by inserting an HTML comment break when a list seems to reset to "1."
            // Pattern: [End of line item] -> [1-2 blank lines] -> [Start of "1. "]
            protectedMd = protectedMd.replace(/(^|\n)(\d+\.[ \t].+)(\n{1,2})(1\.[ \t])/g, '$1$2\n\n<!-- list-break -->\n\n$4');

            const mathItems = [];

            // Helper: stash math match and return unique placeholder
            const storeMath = (match) => {
                mathItems.push(match);
                return `%%%MATH_ITEM_${mathItems.length - 1}%%%`;
            };

            // 1. Defuse Escaped Dollars (\$ -> unique placeholder)
            const ESCAPED_DOLLAR = '%%%ESCAPED_DOLLAR%%%';
            protectedMd = protectedMd.replace(/\\\$/g, ESCAPED_DOLLAR);

            // 2. Protect Block Math ($$ ... $$)
            // We use a safe regex that avoids matching '$$$' (3 dollars) as a block start/end
            // We capture the character BEFORE the $$ to ensure it's not a $

            // Actually, simply replacing the whole match (minus prefix) is cleaner.
            // Redoing the replacement logic to be simpler:

            const storeMathBlock = (fullMatch) => {
                mathItems.push(fullMatch);
                return `%%%MATH_ITEM_${mathItems.length - 1}%%%`;
            };

            // RE-RUN regex with simpler callback structure
            protectedMd = protectedMd.replace(/(^|[^\$])(\$\$[\s\S]+?\$\$)(?!\$)/g, (match, prefix, block) => {
                return prefix + storeMathBlock(block);
            });

            // 3. Protect Inline Math ($ ... $)
            // We use a more permissive regex to catch "$ \cup $" (spaces), but check content to avoid currency false positives.
            // Match: $ ... $ (lazy, single line)
            protectedMd = protectedMd.replace(/(^|[^\$])(\$([^$\n]+?)\$)(?!\$)/g, (match, prefix, fullMatch, innerContent) => {
                // Heuristics to decide if this is Math or Currency/Text
                const isCurrency = /^\s*\d/.test(innerContent); // Starts with digit? "$50"
                const hasLatex = /[\\{}^_]/.test(innerContent); // Has LaTeX chars? \cup, ^{2}, _{i}
                const hasStrictSpacing = !/^\s/.test(innerContent) && !/\s$/.test(innerContent) && !isCurrency;

                // Decision:
                // 1. If it has explicit LaTeX syntax (\, {, }, ^, _), it's definitely math.
                // 2. If it follows strict spacing (no spaces at ends) and isn't currency, it's safe math.
                // 3. Otherwise, treat as text (ignore).

                if (hasLatex || hasStrictSpacing) {
                    return prefix + storeMathBlock(fullMatch);
                } else {
                    return match; // Return original text (unprotected)
                }
            });

            // 3b. Protect LaTeX delimiters \[ ... \] (Display Math)
            protectedMd = protectedMd.replace(/(\\\[[\s\S]+?\\\])/g, (match) => {
                return storeMathBlock(match);
            });

            // 3c. Protect LaTeX delimiters \( ... \) (Inline Math)
            protectedMd = protectedMd.replace(/(\\\([\s\S]+?\\\))/g, (match) => {
                return storeMathBlock(match);
            });

            // 4. Parse Markdown into HTML
            let rawHtml = marked.parse(protectedMd);

            // 5. Restore Math items (HTML Escaped)
            mathItems.forEach((item, index) => {
                // Escape HTML chars so browser treats them as text (but KaTeX reads them correctly)
                // We MUST restore the "$$" or "$" delimiters so KaTeX auto-render can find them!
                const escaped = item
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#039;");

                rawHtml = rawHtml.replace(`%%%MATH_ITEM_${index}%%%`, escaped);
            });

            // 6. Restore Escaped Dollars (as literal '$')
            rawHtml = rawHtml.split(ESCAPED_DOLLAR).join('$');

            setHtmlContent(rawHtml);

            setTimeout(() => {
                if (previewRef.current) {
                    // Highlight Code
                    if (hljs) {
                        try {
                            previewRef.current.querySelectorAll('pre code').forEach((block) => {
                                hljs.highlightElement(block);
                            });
                        } catch (e) {
                            console.warn("Highlight.js error:", e);
                        }
                    }
                    // Render Math (KaTeX)
                    if (renderMathInElement) {
                        try {
                            renderMathInElement(previewRef.current, {
                                delimiters: [
                                    { left: '$$', right: '$$', display: true },
                                    { left: '$', right: '$', display: false },
                                    { left: '\\(', right: '\\)', display: false },
                                    { left: '\\[', right: '\\]', display: true }
                                ],
                                throwOnError: false,
                                ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"]
                            });
                        } catch (e) {
                            console.warn("KaTeX error:", e);
                        }
                    }
                }
            }, 50);
        }
    }, [markdown, config.theme]);

    // Scaling Observer
    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver((entries) => {
            const containerWidth = entries[0].contentRect.width;
            const a4WidthMM = 210;
            const mmToPx = 3.7795275591; // 96 DPI / 25.4
            const a4WidthPx = a4WidthMM * mmToPx;
            const padding = 48; // 24px each side

            // Calculate scale to fit width
            let newScale = (containerWidth - padding) / a4WidthPx;
            newScale = Math.min(1.2, Math.max(0.3, newScale)); // Clamp scale

            setScale(newScale);
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [containerRef]);

    // --- Handlers ---

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            setMarkdown(e.target.result);
        };
        reader.readAsText(file);
        // Reset input so same file can be selected again if needed
        event.target.value = '';
    };

    const handleDownloadDOC = () => {
        const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
            "xmlns:w='urn:schemas-microsoft-com:office:word' " +
            "xmlns='http://www.w3.org/TR/REC-html40'>" +
            "<head><meta charset='utf-8'><title>Export HTML to Word Document with JavaScript</title>" +
            "<style>" +
            "body { font-family: 'Inter', sans-serif; }" +
            "p { margin-bottom: 12pt; }" +
            "code { background: #eee; font-family: monospace; }" +
            "</style></head><body>";
        const footer = "</body></html>";

        const sourceHTML = header + previewRef.current.innerHTML + footer;
        const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);

        const fileDownload = document.createElement("a");
        document.body.appendChild(fileDownload);
        fileDownload.href = source;
        fileDownload.download = `zeropage_${Date.now()}.doc`;
        fileDownload.click();
        document.body.removeChild(fileDownload);
    };

    const handleDownloadPDF = async () => {
        if (!previewRef.current) return;
        setIsGenerating(true);

        try {
            const element = previewRef.current;

            // --- Smart Page Breaks Logic ---
            // 1. Large Block Handling (Tables, Code, etc.)
            element.querySelectorAll('pre, blockquote, table, img').forEach(block => {
                // If a block is larger than ~800px, forcing 'avoid' will create huge gaps.
                // So we allow it to break. Otherwise, we keep it together.
                if (block.offsetHeight > 800) {
                    block.style.pageBreakInside = 'auto';
                    block.style.breakInside = 'auto';
                } else {
                    block.style.pageBreakInside = 'avoid';
                    block.style.breakInside = 'avoid';
                }
            });

            // 2. Orphan Header Protection (Keep headers with next element)
            const headers = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
            const wrappers = []; // Store wrappers to unwrap later

            headers.forEach(header => {
                const next = header.nextElementSibling;
                if (next) {
                    const combinedHeight = header.offsetHeight + next.offsetHeight;
                    if (combinedHeight < 600) {
                        const wrapper = document.createElement('div');
                        wrapper.style.pageBreakInside = 'avoid';
                        wrapper.style.breakInside = 'avoid';
                        wrapper.style.display = 'block'; // Ensure block behavior

                        // Insert wrapper before header
                        header.parentNode.insertBefore(wrapper, header);

                        // Move header and next into wrapper
                        wrapper.appendChild(header);
                        wrapper.appendChild(next);

                        wrappers.push(wrapper);
                    }
                }
            });

            // Get the HTML content AFTER styles are injected
            const htmlContent = previewRef.current.innerHTML;

            // --- Clean up inline styles immediately ---
            wrappers.forEach(wrapper => {
                if (wrapper.parentNode) {
                    while (wrapper.firstChild) {
                        wrapper.parentNode.insertBefore(wrapper.firstChild, wrapper);
                    }
                    wrapper.parentNode.removeChild(wrapper);
                }
            });

            element.querySelectorAll('pre, blockquote, table, img').forEach(block => {
                block.style.pageBreakInside = '';
                block.style.breakInside = '';
            });

            // Send request to our new backend API
            const response = await fetch('/api/pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    html: htmlContent,
                    css: finalStyles,
                    themeConfig: config
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate PDF');
            }

            // Convert response to a Blob
            const blob = await response.blob();
            
            // Create a temporary link to trigger download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `zeropage_${Date.now()}.pdf`;
            document.body.appendChild(a);
            a.click();
            
            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (error) {
            console.error('Error downloading PDF:', error);
            alert('Failed to generate PDF. Is the backend server running?');
        } finally {
            setIsGenerating(false);
        }
    };

    const insertText = (before, after = '') => {
        const textarea = document.getElementById('md-editor');
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const newText = text.substring(0, start) + before + text.substring(start, end) + after + text.substring(end);
        setMarkdown(newText);
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + before.length, end + before.length);
        }, 0);
    };

    // --- Styles Construction ---

    // Base CSS needed for structure (reset)
    const basePreviewCSS = `
    .preview-content { font-size: 12pt; line-height: 1.6; box-sizing: border-box; width: 100%; }
    .preview-content * { box-sizing: border-box; }
    .preview-content img { max-width: 100%; height: auto; display: block; margin: 1.5em 0; }
    .preview-content table { width: 100%; table-layout: fixed; border-collapse: collapse; margin-bottom: 1.5em; border: 1px solid #d1d5db; word-break: break-word; overflow-wrap: break-word; }
    .preview-content th, .preview-content td { padding: 8px; text-align: left; border: 1px solid #d1d5db; word-break: break-word; overflow-wrap: break-word; }
    .preview-content pre { 
      background: #1e1e1e; 
      color: #f8f8f2; 
      padding: 1em; 
      border-radius: 6px; 
      margin-bottom: 1.5em; 
      
      /* GLOBAL PRINT FIX: Force wrapping so code doesn't get cut off */
      white-space: pre-wrap !important;
      word-wrap: break-word !important;
      overflow-x: hidden;
      page-break-inside: avoid; 
    }
    .preview-content ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 1em; }
    .preview-content ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 1em; }
    .preview-content li { margin-bottom: 0.5em; page-break-inside: avoid; }
    .preview-content p { margin-bottom: 1em; orphans: 3; widows: 3; } /* Removed strict avoid to allow filling pages */
    .preview-content blockquote { page-break-inside: avoid; }
    .preview-content tr { page-break-inside: avoid; } /* Keep rows together */
    .preview-content h1, .preview-content h2, .preview-content h3 { break-after: avoid; break-inside: avoid; page-break-after: avoid; }
    
    /* Dark Mode PDF Override - Applied when exporting dark PDF */
    ${config.darkModePdf ? `
      .preview-content { color: #f3f4f6 !important; background-color: #1e1e1e !important; }
      .preview-content h1, .preview-content h2, .preview-content h3 { color: #fff !important; }
      .preview-content a { color: #60a5fa !important; }
      .preview-content th { background: #374151 !important; color: white !important; }
      .preview-content td { border-color: #4b5563 !important; }
    ` : ''}
  `;

    // Combine styles
    const finalStyles = `${basePreviewCSS} \n ${themes[config.theme]} \n ${customCSS}`;

    // Loading check removed

    return (
        // Main Container - Fixed scrolling by ensuring height is 100vh and overflow is handled in children
        <div className="flex flex-col h-screen bg-[#09090b] text-white font-sans overflow-hidden">

            {/* Header - Fixed Height, Rigid Structure for Logo Stability */}
            <header className="h-16 shrink-0 border-b border-gray-800 bg-[#09090b] px-3 sm:px-6 flex items-center justify-between z-50 relative">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 bg-yellow-400 rounded-sm flex items-center justify-center shadow-[4px_4px_0px_rgba(255,255,255,0.2)] shrink-0">
                        <span className="text-black font-black text-xl select-none">Z</span>
                    </div>
                    <div className="flex flex-col justify-center">
                        <h1 className="text-xl font-black tracking-tight text-white leading-none hidden sm:block">
                            ZEROPAGE<span className="text-yellow-400">MD</span>
                        </h1>
                        <h1 className="text-xl font-black tracking-tight text-white leading-none sm:hidden">
                            ZP<span className="text-yellow-400">MD</span>
                        </h1>
                        <p className="text-[10px] text-gray-500 font-mono tracking-widest uppercase mt-0.5 hidden sm:block">Markdown → PDF Studio</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Theme Selector - Compact on Mobile */}
                    <div className="flex items-center bg-gray-900 rounded-lg p-1 border border-gray-800 hidden sm:flex">
                        {/* Professional / Clean Group */}
                        {['professional', 'standard', 'academic', 'miktex'].map(t => (
                            <button
                                key={t}
                                onClick={() => setConfig(c => ({ ...c, theme: t }))}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all uppercase tracking-wide border ${config.theme === t
                                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                                    : 'text-gray-400 border-transparent hover:text-white'
                                    }`}
                            >
                                {t === 'professional' ? 'Pro' : t === 'miktex' ? 'MiKTeX' : t}
                            </button>
                        ))}

                        <div className="w-px h-4 bg-gray-700 mx-1"></div>

                        {/* Creative Group */}
                        {['zine', 'neon'].map(t => (
                            <button
                                key={t}
                                onClick={() => setConfig(c => ({ ...c, theme: t }))}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all uppercase tracking-wide border ${config.theme === t
                                    ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                                    : 'text-gray-500 border-transparent hover:text-white'
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    {/* Mobile Theme Selector (Dropdown substitute - simplified for now) */}
                    <select
                        value={config.theme}
                        onChange={(e) => setConfig(c => ({ ...c, theme: e.target.value }))}
                        className="sm:hidden bg-gray-900 text-xs font-bold uppercase text-white border border-gray-800 rounded-lg py-1.5 px-2 outline-none focus:border-yellow-400"
                    >
                        <optgroup label="Professional">
                            <option value="professional">PRO</option>
                            <option value="standard">STANDARD</option>
                            <option value="academic">ACADEMIC</option>
                            <option value="miktex">MIKTEX</option>
                        </optgroup>
                        <optgroup label="Creative">
                            <option value="zine">ZINE</option>
                            <option value="neon">NEON</option>
                        </optgroup>
                    </select>

                    <div className="h-6 w-px bg-gray-800 mx-1 hidden sm:block"></div>

                    {/* Word Export - Hidden on super small mobile to save space if needed, but keeping for now */}
                    <button
                        onClick={handleDownloadDOC}
                        className="p-2 sm:px-4 sm:py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-bold text-sm shadow border border-gray-700 transition-all flex items-center gap-2 hidden sm:flex"
                        title="Export Editable Word Doc"
                    >
                        <FileText size={16} className="text-blue-400" />
                        <span className="hidden sm:inline">WORD</span>
                    </button>

                    <button
                        onClick={handleDownloadPDF}
                        disabled={isGenerating}
                        className={`flex items-center gap-2 px-3 sm:px-6 py-2 rounded-lg font-bold text-sm shadow-[4px_4px_0px_#000] border border-transparent transition-all active:translate-y-[2px] active:shadow-none ${isGenerating
                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            : 'bg-yellow-400 text-black hover:bg-yellow-300'
                            }`}
                    >
                        {isGenerating ? <Zap className="animate-spin" size={16} /> : <Download size={16} />}
                        <span className="hidden sm:inline">{isGenerating ? 'EXPORTING...' : 'EXPORT PDF'}</span>
                        <span className="sm:hidden">PDF</span>
                    </button>
                </div>
            </header>

            {/* Main Workspace - Responsive Flex Layout */}
            <main className="flex-1 flex flex-col lg:flex-row min-h-0 relative">

                {/* Editor Pane - Hidden on mobile if not active */}
                <div className={`flex-1 flex flex-col border-r-0 lg:border-r border-b lg:border-b-0 border-gray-800 bg-[#0c0c0e] min-h-0 ${mobileTab === 'preview' ? 'hidden lg:flex' : 'flex'}`}>

                    {/* Toolbar */}
                    <div className="h-10 border-b border-gray-800 flex items-center justify-between px-2 bg-[#09090b] shrink-0">
                        <div className="flex gap-1 h-full pt-1">
                            <TabButton
                                active={activeTab === 'markdown'}
                                onClick={() => setActiveTab('markdown')}
                                icon={FileText}
                                label="MARKDOWN"
                            />
                            <TabButton
                                active={activeTab === 'css'}
                                onClick={() => setActiveTab('css')}
                                icon={Code}
                                label="CSS"
                                badge={customCSS ? 'ON' : null}
                            />
                        </div>

                        {activeTab === 'markdown' && (
                            <div className="flex items-center gap-1 pr-2">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept=".md,.txt,.markdown"
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-1.5 px-3 py-1 bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 rounded-sm text-[10px] font-black tracking-widest uppercase transition-colors border border-yellow-400/20 mr-2"
                                    title="Upload Markdown File"
                                >
                                    <Upload size={12} strokeWidth={3} />
                                    UPLOAD
                                </button>
                                <div className="w-px h-4 bg-gray-800 mx-1"></div>
                                <ToolIcon icon={Type} onClick={() => insertText('## ')} tooltip="H2" />
                                <ToolIcon icon={List} onClick={() => insertText('- ')} tooltip="List" />
                                <ToolIcon icon={Terminal} onClick={() => insertText('```\n', '\n```')} tooltip="Code" />
                                <ToolIcon icon={ImageIcon} onClick={() => insertText('![Caption](', ')')} tooltip="Image" />
                            </div>
                        )}
                    </div>

                    {/* Textarea Area - Scrollable */}
                    <div className="flex-1 relative min-h-0">
                        {activeTab === 'markdown' ? (
                            <textarea
                                id="md-editor"
                                value={markdown}
                                onChange={(e) => setMarkdown(e.target.value)}
                                className="absolute inset-0 w-full h-full p-4 sm:p-6 bg-[#0c0c0e] text-gray-300 font-mono text-sm resize-none focus:outline-none leading-relaxed selection:bg-yellow-900 selection:text-yellow-100"
                                placeholder="Paste your LLM markdown here..."
                                spellCheck="false"
                            />
                        ) : (
                            <div className="absolute inset-0 flex flex-col">
                                <div className="bg-[#111] p-3 text-xs text-gray-500 font-mono border-b border-gray-800 flex justify-between items-center">
                                    <span>/* Override styles here */</span>
                                    <button onClick={() => setCustomCSS('')} className="hover:text-red-400">Clear</button>
                                </div>
                                <textarea
                                    value={customCSS}
                                    onChange={(e) => setCustomCSS(e.target.value)}
                                    className="flex-1 w-full p-6 bg-[#0c0c0e] text-green-400 font-mono text-sm resize-none focus:outline-none leading-relaxed"
                                    placeholder=".preview-content h1 { color: red; }"
                                    spellCheck="false"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Preview Pane - Scrollable. Hidden on mobile if not active */}
                <div className={`flex-1 bg-[#18181b] flex flex-col relative min-h-0 ${mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'}`}>

                    {/* Preview Controls */}
                    <div className="absolute top-4 left-4 flex gap-2 z-10">
                        <span className="text-[10px] font-bold text-gray-500 uppercase bg-black/30 px-2 py-1 rounded border border-white/5 backdrop-blur-sm">
                            Preview {Math.round(scale * 100)}%
                        </span>
                        <button
                            onClick={() => setConfig(c => ({ ...c, darkModePdf: !c.darkModePdf }))}
                            className={`text-[10px] font-bold uppercase px-2 py-1 rounded border transition-colors ${config.darkModePdf ? 'bg-white text-black border-white' : 'bg-black/30 text-gray-500 border-white/5 hover:text-white'}`}
                        >
                            {config.darkModePdf ? 'Dark' : 'Light'}
                        </button>
                    </div>

                    {/* Scrollable Area */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-10 flex flex-col items-center" ref={containerRef}>
                        {/* Scale Wrapper */}
                        <div
                            className="origin-top transition-transform duration-200 ease-out shadow-2xl mt-8 lg:mt-0"
                            style={{ transform: `scale(${scale})` }}
                        >
                            <div
                                id="pdf-content"
                                ref={previewRef}
                                className={`preview-content relative overflow-hidden transition-colors duration-300 ease-in-out`}
                                style={{
                                    width: '210mm',
                                    minHeight: '297mm',
                                    padding: '20mm',
                                    backgroundColor: config.darkModePdf ? '#1e1e1e' : 'white',
                                    color: config.darkModePdf ? 'white' : 'black',
                                }}
                            >
                                {/* CSS Injection */}
                                <style dangerouslySetInnerHTML={{ __html: finalStyles }} />

                                <div dangerouslySetInnerHTML={{ __html: htmlContent }} />

                                {/* Watermark - Removed */}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Tab Bar - Bottom fixed */}
                <div className="lg:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-full shadow-2xl z-50">
                    <button
                        onClick={() => setMobileTab('editor')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${mobileTab === 'editor'
                            ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <FileText size={14} />
                        EDITOR
                    </button>
                    <button
                        onClick={() => setMobileTab('preview')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${mobileTab === 'preview'
                            ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/20'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Sparkles size={14} />
                        PREVIEW
                    </button>
                </div>

            </main>
        </div>
    );
}

// Subcomponents

function TabButton({ active, onClick, icon: Icon, label, badge }) {
    return (
        <button
            onClick={onClick}
            className={`relative px-3 sm:px-4 h-full flex items-center gap-2 text-xs font-bold tracking-wide transition-colors border-t-2 ${active
                ? 'bg-[#0c0c0e] text-yellow-400 border-yellow-400'
                : 'bg-transparent text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/5'
                }`}
        >
            <Icon size={14} />
            {label}
            {badge && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-green-500 rounded-full"></span>}
        </button>
    );
}

function ToolIcon({ icon: Icon, onClick, tooltip }) {
    return (
        <button
            onClick={onClick}
            className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded transition-colors"
            title={tooltip}
        >
            <Icon size={14} />
        </button>
    );
}

const defaultMarkdown = `# Welcome to ZeropageMD

Paste Markdown from **ChatGPT**, **Gemini**, or **Claude** directly here. We turn it into a vibe-checked PDF.

## Adding Images

To add images to your document, standard Markdown syntax is all you need.

1.  **Find your image URL** (e.g., from Unsplash, Imgur, or direct link).
2.  **Use the syntax**: \`![Alt Text](URL)\`

### Example

![Neon City Vibe](https://images.unsplash.com/photo-1555680202-c86f0e12f086?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80)

*Above: A random image from Unsplash.*

---

## Features

* **Custom Themes**: Switch between *Zine* (Brutalist), *Neon* (Cyber), or *Academic*.
* **CSS Injection**: Need specific padding? Switch to the "Custom CSS" tab.
* **Privacy First**: Everything happens in your browser.

## Data Tables

| Feature | Legacy Tools | ZeropageMD |
| :--- | :---: | :---: |
| **Aesthetics** | ❌ Boring | ✅ Fire |
| **Speed** | 🐢 Slow | ⚡ Instant |
| **Cost** | 💰 ₹₹₹ | 🆓 Free |

> "Design is intelligence made visible." — *Alina Wheeler*

## Code Blocks

Syntax highlighting is supported for all major languages.

\`\`\`javascript
// Example JavaScript
const aesthetic = true;
function checkVibe(status) {
  if (status === aesthetic) {
    return "Vibe passed ✨";
  }
  return "Needs more neon";
}
\`\`\`

## Math (LaTeX)

We support **KaTeX** for beautiful math rendering.

Inline: $E = mc^2$

Block:
$$
\\oint_{\\partial \\Sigma} \\mathbf{E} \\cdot d\\boldsymbol{\\ell} = -\\frac{d}{dt} \\iint_{\\Sigma} \\mathbf{B} \\cdot d\\mathbf{S}
$$
`;
