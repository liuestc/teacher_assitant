
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, X, File as FileIcon, Loader2 } from 'lucide-react';

export default function UploadPage() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [tags, setTags] = useState('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selected = e.target.files[0];
            if (selected.type !== 'text/html' && !selected.name.endsWith('.html')) {
                setError('Please upload a valid .html file');
                return;
            }
            setFile(selected);
            setError('');
            if (!title) {
                setTitle(selected.name.replace('.html', ''));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('tags', tags);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Upload failed');

            router.push('/');
            router.refresh();
        } catch (err) {
            setError('Something went wrong. Please try again.');
            setUploading(false);
        }
    };

    return (
        <div className="mx-auto max-w-2xl px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Upload HTML</h1>
                <p className="mt-2 text-gray-500">Upload your HTML file to share and preview it.</p>
            </div>

            <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
                <div className="space-y-6">
                    {/* File Upload Area */}
                    <div className="group relative mt-2 flex justify-center rounded-xl border-dashed border-2 border-gray-300 px-6 py-10 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer">
                        <div className="text-center">
                            {file ? (
                                <div className="flex flex-col items-center">
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                        <FileIcon className="h-6 w-6" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setFile(null);
                                        }}
                                        className="mt-4 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200"
                                    >
                                        Change File
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <Upload className="mx-auto h-12 w-12 text-gray-300 group-hover:text-blue-500 transition-colors" />
                                    <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                                        <label
                                            htmlFor="file-upload"
                                            className="relative cursor-pointer rounded-md bg-transparent font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
                                        >
                                            <span>Upload a file</span>
                                            <input
                                                id="file-upload"
                                                name="file-upload"
                                                type="file"
                                                accept=".html"
                                                className="sr-only"
                                                onChange={handleFileChange}
                                                required
                                            />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs leading-5 text-gray-600">HTML files only</p>
                                </>
                            )}
                        </div>
                        {!file && <div className="absolute inset-0" onClick={() => document.getElementById('file-upload')?.click()} />}
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
                                placeholder="My Awesome Page"
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

                    <div className="flex items-center justify-end gap-x-6 pt-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="text-sm font-semibold leading-6 text-gray-900"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!file || uploading}
                            className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {uploading ? 'Uploading...' : 'Save Record'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
