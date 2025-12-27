
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data/db.json');
const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads');

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const data = await fs.readFile(DB_PATH, 'utf-8');
        let records = JSON.parse(data);
        const recordIndex = records.findIndex((r: any) => r.id === id);

        if (recordIndex === -1) {
            return NextResponse.json({ error: 'Record not found' }, { status: 404 });
        }

        const record = records[recordIndex];

        // Delete file or folder
        try {
            if (record.isFolder) {
                // For folders, we need to delete the entire directory
                // The directory name is the record ID (see upload logic)
                const folderPath = path.join(UPLOAD_DIR, record.id);
                await fs.rm(folderPath, { recursive: true, force: true });
            } else {
                // For single files
                await fs.unlink(path.join(UPLOAD_DIR, record.filename));
            }
        } catch (e) {
            console.error('Error deleting file/folder:', e);
            // Continue deleting record even if file deletion fails
        }

        // Remove from DB
        records.splice(recordIndex, 1);
        await fs.writeFile(DB_PATH, JSON.stringify(records, null, 2));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting record:', error);
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const title = formData.get('title') as string;
        const tags = formData.get('tags') as string;

        const data = await fs.readFile(DB_PATH, 'utf-8');
        let records = JSON.parse(data);
        const recordIndex = records.findIndex((r: any) => r.id === id);

        if (recordIndex === -1) {
            return NextResponse.json({ error: 'Record not found' }, { status: 404 });
        }

        const record = records[recordIndex];
        let filename = record.filename;
        let originalName = record.originalName;

        // If new file uploaded, replace old one
        if (file && file.size > 0) {
            // Delete old file
            try {
                await fs.unlink(path.join(UPLOAD_DIR, record.filename));
            } catch (e) {
                // Ignore if old file missing
            }

            const buffer = Buffer.from(await file.arrayBuffer());
            // Keep ID but maybe new extension
            const ext = path.extname(file.name);
            filename = `${record.id}${ext}`;
            originalName = file.name;

            await fs.writeFile(path.join(UPLOAD_DIR, filename), buffer);
        }

        const tagList = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];

        // Update record
        records[recordIndex] = {
            ...record,
            title: title || record.title,
            tags: tagList,
            filename,
            originalName,
            // uploadDate: new Date().toISOString() // Optional: update date or keep original? Let's keep original upload date or add updatedAt
        };

        await fs.writeFile(DB_PATH, JSON.stringify(records, null, 2));

        return NextResponse.json(records[recordIndex]);
    } catch (error) {
        console.error('Error updating record:', error);
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}
