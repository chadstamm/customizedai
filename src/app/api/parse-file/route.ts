import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const filename = file.name.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());

    let text = '';

    // Handle different file types
    if (filename.endsWith('.pdf')) {
      // Parse PDF using dynamic require
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse');
      const pdfData = await pdfParse(buffer);
      text = pdfData.text;
    } else if (filename.endsWith('.docx')) {
      // Parse DOCX
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mammoth = require('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (filename.endsWith('.doc')) {
      // Old .doc format - mammoth doesn't support it well
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const mammoth = require('mammoth');
        const result = await mammoth.extractRawText({ buffer });
        text = result.value;
      } catch {
        return NextResponse.json({
          error: 'Old .doc format not fully supported. Please convert to .docx or paste text directly.'
        }, { status: 400 });
      }
    } else if (filename.endsWith('.rtf')) {
      // RTF - try to extract plain text (basic approach)
      const content = buffer.toString('utf-8');
      // Strip RTF control codes (basic cleanup)
      text = content
        .replace(/\\[a-z]+\d* ?/gi, '')
        .replace(/[{}]/g, '')
        .replace(/\\\\/g, '\\')
        .trim();
    } else {
      // Plain text files (.txt, .md)
      text = buffer.toString('utf-8');
    }

    // Clean up the text
    text = text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!text || text.length < 10) {
      return NextResponse.json({
        error: 'Could not extract text from file. Please try pasting the text directly.'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      text,
      filename: file.name,
      characterCount: text.length
    });

  } catch (error) {
    console.error('File parsing error:', error);
    return NextResponse.json({
      error: 'Failed to parse file. Please try a different format or paste text directly.'
    }, { status: 500 });
  }
}
