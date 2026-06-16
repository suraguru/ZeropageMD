import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

export async function POST(req) {
    try {
        const body = await req.json();
        const { html, css, themeConfig } = body;

        if (!html) {
            return new NextResponse('HTML content is required', { status: 400 });
        }

        // We wrap the incoming HTML/CSS with standard dependencies (KaTeX, Highlight.js, fonts)
        // to ensure it renders identically to the frontend.
        const fullHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <link href="https://cdn.jsdelivr.net/npm/katex@0.16.27/dist/katex.min.css" rel="stylesheet">
                <link href="https://cdn.jsdelivr.net/npm/highlight.js@11.11.1/styles/github-dark.css" rel="stylesheet">
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700;800&family=Courier+Prime:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet">
                
                <style>
                    /* Base reset to match browser */
                    body { margin: 0; padding: 0; background-color: ${themeConfig?.darkModePdf ? '#1e1e1e' : '#ffffff'}; }
                    
                    /* The injected CSS from the frontend */
                    ${css}

                    /* Important overrides for Puppeteer PDF */
                    .preview-content {
                        width: 100% !important; /* Let the A4 format dictate the width */
                        padding: 0 20mm !important; /* Hardcode the horizontal padding */
                        min-height: auto !important; /* Do not force height in PDF */
                    }
                </style>
            </head>
            <body>
                <div class="preview-content">
                    ${html}
                </div>
            </body>
            </html>
        `;

        // Launch puppeteer
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        // Load the HTML content
        // waitUntil: 'networkidle0' ensures fonts and stylesheets are fully loaded before rendering
        await page.setContent(fullHtml, { waitUntil: 'networkidle0' });

        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                bottom: '20mm',
                left: '0',
                right: '0'
            }
        });

        await browser.close();

        return new NextResponse(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="zeropage.pdf"'
            }
        });

    } catch (error) {
        console.error('Error generating PDF:', error);
        return new NextResponse('Error generating PDF', { status: 500 });
    }
}
