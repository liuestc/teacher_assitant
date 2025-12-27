
'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, FolderUp, File as FileIcon, Loader2 } from 'lucide-react';
import JSZip from 'jszip';

export default function UploadPage() {
    const router = useRouter();
    const [isFolderMode, setIsFolderMode] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [folderFiles, setFolderFiles] = useState<FileList | null>(null);
    const [entryPoint, setEntryPoint] = useState<string>('');
    const [title, setTitle] = useState('');
    const [tags, setTags] = useState('');
    const [uploading, setUploading] = useState(false);
    const [htmlFiles, setHtmlFiles] = useState<string[]>([]);
    const [zipProgress, setZipProgress] = useState(0);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const folderInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            if (!title) {
                setTitle(selectedFile.name.replace(/\.html$/i, ''));
            }
        }
    };

    const handleFolderChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFolderFiles(e.target.files);

            // Find all HTML files for entry point selection
            const htmls: string[] = [];
            Array.from(e.target.files).forEach(f => {
                if (f.name.toLowerCase().endsWith('.html') || f.name.toLowerCase().endsWith('.htm')) {
                    // webkitRelativePath usually includes the root folder name: "Root/file.html"
                    // We will store this full relative path for now to identify unique files
                    htmls.push(f.webkitRelativePath);
                }
            });
            setHtmlFiles(htmls);

            if (htmls.length > 0) {
                // Default to index.html if exists, otherwise first html
                const indexHtml = htmls.find(h => h.toLowerCase().endsWith('index.html'));
                setEntryPoint(indexHtml || htmls[0]);
            }

            // Set default title from folder name (first part of relative path)
            if (!title && e.target.files[0].webkitRelativePath) {
                const folderName = e.target.files[0].webkitRelativePath.split('/')[0];
                setTitle(folderName);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isFolderMode && !folderFiles) return;
        if (!isFolderMode && !file) return;

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('tags', tags);

            if (isFolderMode && folderFiles) {
                // Zip the folder
                const zip = new JSZip();

                let rootFolderName = "";
                if (folderFiles.length > 0) {
                    rootFolderName = folderFiles[0].webkitRelativePath.split('/')[0] + "/";
                }

                Array.from(folderFiles).forEach(f => {
                    // Remove the root folder name so contents are at the root of the zip
                    // This prevents extracting as uuid/RootFolder/index.html and instead does uuid/index.html
                    const zipPath = f.webkitRelativePath.startsWith(rootFolderName)
                        ? f.webkitRelativePath.substring(rootFolderName.length)
                        : f.webkitRelativePath;

                    if (zipPath) {
                        zip.file(zipPath, f);
                    }
                });

                // Also adjust the entry point to be relative to the zip root
                const relativeEntryPoint = entryPoint.startsWith(rootFolderName)
                    ? entryPoint.substring(rootFolderName.length)
                    : entryPoint;

                formData.append('isFolder', 'true');
                formData.append('entryPoint', relativeEntryPoint);

                const zipBlob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
                    setZipProgress(metadata.percent);
                });

                formData.append('file', zipBlob, 'bundle.zip');

            } else if (file) {
                formData.append('file', file);
            }

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                throw new Error('Upload failed');
            }

            router.push('/');
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
            setZipProgress(0);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Upload HTML</h1>
                <p className="mt-2 text-gray-600">
                    Upload a single HTML file or a folder containing HTML and assets.
                </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="border-b border-gray-200 flex">
                    <button
                        onClick={() => setIsFolderMode(false)}
                        className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${!isFolderMode ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <FileIcon className="h-4 w-4" />
                            Single File
                        </div>
                    </button>
                    <button
                        onClick={() => setIsFolderMode(true)}
                        className={`flex-1 py-4 text-sm font-medium text-center transition-colors ${isFolderMode ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <div className="flex items-center justify-center gap-2">
                            <FolderUp className="h-4 w-4" />
                            Folder Upload
                        </div>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium leading-6 text-gray-900">
                            Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                            placeholder="e.g. Physics Experiment"
                        />
                    </div>

                    <div>
                        <label htmlFor="tags" className="block text-sm font-medium leading-6 text-gray-900">
                            Tags (comma separated)
                        </label>
                        <input
                            type="text"
                            id="tags"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                            placeholder="e.g. physics, experiment, grade-10"
                        />
                    </div>

                    {!isFolderMode ? (
                        <div>
                            <label className="block text-sm font-medium leading-6 text-gray-900">
                                HTML File
                            </label>
                            <div
                                className={`mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 ${file ? 'bg-blue-50 border-blue-200' : ''}`}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    if (e.dataTransfer.files?.[0]) {
                                        setFile(e.dataTransfer.files[0]);
                                        if (!title) setTitle(e.dataTransfer.files[0].name.replace(/\.html$/i, ''));
                                    }
                                }}
                            >
                                <div className="text-center">
                                    <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                                        <label
                                            htmlFor="file-upload"
                                            className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
                                        >
                                            <span>Upload a file</span>
                                            <input
                                                id="file-upload"
                                                name="file-upload"
                                                type="file"
                                                accept=".html"
                                                className="sr-only"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                            />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs leading-5 text-gray-600">.html up to 10MB</p>
                                    {file && (
                                        <p className="mt-2 text-sm text-blue-600 font-semibold">{file.name}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div>
                                <label className="block text-sm font-medium leading-6 text-gray-900">
                                    Folder
                                </label>
                                <div
                                    className={`mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 ${folderFiles ? 'bg-blue-50 border-blue-200' : ''}`}
                                >
                                    <div className="text-center">
                                        <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                                            <label
                                                htmlFor="folder-upload"
                                                className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
                                            >
                                                <span>Select folder</span>
                                                <input
                                                    id="folder-upload"
                                                    name="folder-upload"
                                                    type="file"
                                                    // @ts-expect-error webkitdirectory is standard
                                                    webkitdirectory=""
                                                    directory=""
                                                    className="sr-only"
                                                    ref={folderInputRef}
                                                    onChange={handleFolderChange}
                                                />
                                            </label>
                                        </div>
                                        <p className="text-xs leading-5 text-gray-600">Select a folder with HTML and assets</p>
                                        {folderFiles && (
                                            <p className="mt-2 text-sm text-blue-600 font-semibold">{folderFiles.length} files selected</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {htmlFiles.length > 0 && (
                                <div>
                                    <label htmlFor="entry" className="block text-sm font-medium leading-6 text-gray-900">
                                        Entry Point (Main File)
                                    </label>
                                    <select
                                        id="entry"
                                        value={entryPoint}
                                        onChange={(e) => setEntryPoint(e.target.value)}
                                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                                    >
                                        {htmlFiles.map(f => (
                                            <option key={f} value={f}>{f}</option>
                                        ))}
                                    </select>
                                    <p className="mt-1 text-xs text-gray-500">This is the file that will be opened when you click Preview.</p>
                                </div>
                            )}
                        </>
                    )}

                    <div className="flex justify-end gap-3 border-t border-gray-100 pt-6">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="text-sm font-semibold leading-6 text-gray-900 px-3 py-2 rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={uploading || (!isFolderMode && !file) || (isFolderMode && !folderFiles)}
                            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    {isFolderMode && zipProgress < 100 ? `Zipping ${zipProgress.toFixed(0)}%` : 'Uploading...'}
                                </>
                            ) : (
                                'Upload'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
