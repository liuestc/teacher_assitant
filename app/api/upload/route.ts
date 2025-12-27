

import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import AdmZip from 'adm-zip';

const DB_PATH = path.join(process.cwd(), 'data/db.json');
const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads');

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const title = formData.get('title') as string;
        const tags = formData.get('tags') as string;
        const isFolder = formData.get('isFolder') === 'true';
        const entryPoint = formData.get('entryPoint') as string;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const fileId = uuidv4();

        let filename = '';
        const originalName = file.name;

        if (isFolder) {
            // It's a zip file
            // Create a directory for this upload
            const uploadPath = path.join(UPLOAD_DIR, fileId);
            await fs.mkdir(uploadPath, { recursive: true });

            // Initial zip save (optional, but good for debugging or backup, maybe skip to save space?)
            // let's extract directly from buffer
            const zip = new AdmZip(buffer);
            zip.extractAllTo(uploadPath, true);

            // filename should be the path to the entry point relative to public/uploads
            // entryPoint is relative to the zip root
            // Our structure: public/uploads/{fileId}/{entryPoint}
            // So stored filename in DB: {fileId}/{entryPoint}
            filename = `${fileId}/${entryPoint}`;

        } else {
            // Single file
            const ext = path.extname(originalName);
            filename = `${fileId}${ext}`;
            const filepath = path.join(UPLOAD_DIR, filename);
            await fs.writeFile(filepath, buffer);
        }

        // Process tags
        const tagList = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];

        // Create record
        const newRecord = {
            id: fileId,
            title: title || originalName,
            tags: tagList,
            filename: filename,
            originalName: originalName,
            uploadDate: new Date().toISOString(),
            isFolder: isFolder, // Optional: verify if we added this to types
        };

        // Update DB
        let records = [];
        try {
            const data = await fs.readFile(DB_PATH, 'utf-8');
            records = JSON.parse(data);
        } catch (e) {
            // Ignore if file doesn't exist or is empty
        }

        records.push(newRecord);
        await fs.writeFile(DB_PATH, JSON.stringify(records, null, 2));

        return NextResponse.json(newRecord, { status: 201 });
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}

