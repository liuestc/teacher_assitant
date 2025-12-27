
import { HtmlRecord } from '@/types';
import fs from 'fs/promises';
import path from 'path';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Calendar, Tag } from 'lucide-react';
import { notFound } from 'next/navigation';

async function getRecord(id: string): Promise<HtmlRecord | null> {
    // Direct DB access since it's a server component and same filesystem
    try {
        const dbPath = path.join(process.cwd(), 'data/db.json');
        const data = await fs.readFile(dbPath, 'utf-8');
        const records: HtmlRecord[] = JSON.parse(data);
        return records.find(r => r.id === id) || null;
    } catch (e) {
        return null;
    }
}

export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const record = await getRecord(id);

    if (!record) {
        notFound();
    }

    return (
        <div className="flex h-[calc(100vh-8rem)] flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/"
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-900 transition-all"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{record.title}</h1>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {new Date(record.uploadDate).toLocaleDateString()}
                            </span>
                            <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                            {record.tags.map(tag => (
                                <span key={tag} className="flex items-center gap-1 rounded bg-gray-100 px-1.5 py-0.5 font-medium text-gray-600">
                                    <Tag className="h-3 w-3" />
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
                <a
                    href={`/uploads/${record.filename}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                    Open in New Tab
                    <ExternalLink className="h-4 w-4" />
                </a>
            </div>

            <div className="flex-1 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <iframe
                    src={`/uploads/${record.filename}`}
                    className="h-full w-full border-0"
                    title={record.title}
                    sandbox="allow-scripts allow-same-origin"
                />
            </div>
        </div>
    );
}
