
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X, File as FileIcon, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [tags, setTags] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [currentFile, setCurrentFile] = useState('');

    // Unwrap params using React.use() or just wait if it's already a promise in standard next.js 15
    // But since this is client component, params are not promises in default setup unless defined otherwise.
    // Actually in App Router params prop is now a Promise in 15.0.0
    // Let's handle it properly or assume we might need to await it if it passes as promise from parent? 
    // Client components recieves params as plain object usually, but let's be safe or check doc.
    // Wait, Nextjs 15 breaking change: params and searchParams are Promises.
    // We need to unwrap them.

    const [id, setId] = useState<string>("");

    useEffect(() => {
        (async () => {
            const unwrappedParams = await params;
            setId(unwrappedParams.id);
        })();
    }, [params]);

    useEffect(() => {
        if (!id) return;

        fetch(`/api/records`)
            .then(res => res.json())
            .then(records => {
                // Direct API call to list to find specific one, or could fetch by ID if we had GET /api/records/[id]
                // We do not have GET /api/records/[id] yet, let's just find it from list for now
                // Or better, fetch list and find.
                const record = records.find((r: any) => r.id === id);
                if (record) {
                    setTitle(record.title);
                    setTags(record.tags.join(', '));
                    setCurrentFile(record.originalName);
                } else {
                    setError('Record not found');
                }
                setLoading(false);
            })
            .catch(e => {
                setError('Failed to load record');
                setLoading(false);
            });
    }, [id]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selected = e.target.files[0];
            if (selected.type !== 'text/html' && !selected.name.endsWith('.html')) {
                setError('Please upload a valid .html file');
                return;
            }
            setFile(selected);
            setError('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        const formData = new FormData();
        if (file) {
            formData.append('file', file);
        }
        formData.append('title', title);
        formData.append('tags', tags);

        try {
            const res = await fetch(`/api/records/${id}`, {
                method: 'PUT',
                body: formData,
            });

            if (!res.ok) throw new Error('Update failed');

            router.push('/');
            router.refresh();
        } catch (err) {
            setError('Something went wrong. Please try again.');
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
    }

    if (error && !title) {
        return (
            <div className="mx-auto max-w-2xl px-4 py-8 text-center">
                <h1 className="text-xl font-bold text-red-600">Error</h1>
                <p className="mt-2 text-gray-600">{error}</p>
                <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">Back to Home</Link>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-8">
            <div className="mb-8 flex items-center gap-4">
                <Link href="/" className="rounded-lg p-2 hover:bg-gray-100">
                    <ArrowLeft className="h-5 w-5 text-gray-500" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Edit Record</h1>
                    <p className="mt-1 text-gray-500">Update details or upload a new version.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
                <div className="space-y-6">
                    {/* File Upload Area */}
                    <div>
                        <label className="block text-sm font-medium leading-6 text-gray-900">HTML File</label>
                        <div className="mt-2 flex items-center gap-4 rounded-lg border border-gray-200 p-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                <FileIcon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="truncate text-sm font-medium text-gray-900">{file ? file.name : currentFile}</p>
                                <p className="text-xs text-gray-500">{file ? 'New file selected' : 'Current file'}</p>
                            </div>
                            <label
                                htmlFor="file-upload"
                                className="cursor-pointer rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                            >
                                Change
                                <input
                                    id="file-upload"
                                    name="file-upload"
                                    type="file"
                                    accept=".html"
                                    className="sr-only"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>
                        {file && (
                            <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                                <svg className="h-3 w-3" viewBox="0 0 12 12" fill="currentColor"><path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" /></svg>
                                New file will replace the existing one
                            </p>
                        )}
                    </div>

                    {/* Title Input */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">
                            Title
                        </label>
                        <div className="mt-2">
                            <input
                                type="text"
                                name="title"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="block w-full rounded-lg border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-4"
                                required
                            />
                        </div>
                    </div>

                    {/* Tags Input */}
                    <div>
                        <label htmlFor="tags" className="block text-sm font-medium leading-6 text-gray-900">
                            Tags
                        </label>
                        <div className="mt-2">
                            <input
                                type="text"
                                name="tags"
                                id="tags"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                className="block w-full rounded-lg border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-4"
                                placeholder="demo, test, v1 (comma separated)"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-50 p-4">
                            <div className="flex">
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-x-4 pt-4">
                        <Link
                            href="/"
                            className="px-4 py-2 text-sm font-semibold leading-6 text-gray-900 hover:text-gray-700"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
