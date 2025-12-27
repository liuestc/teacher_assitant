
'use client';

import { HtmlRecord } from '@/types';
import Link from 'next/link';
import { FileText, Calendar, Tag, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function RecordCard({ record, index }: { record: HtmlRecord, index: number }) {
    const router = useRouter();
    const [deleting, setDeleting] = useState(false);

    const [confirmDelete, setConfirmDelete] = useState(false);

    const handleDelete = async (e: React.MouseEvent) => {
        // Prevent event propagation if needed, though mostly safe here
        e.preventDefault();

        if (!confirmDelete) {
            setConfirmDelete(true);
            return;
        }

        setDeleting(true);
        try {
            const res = await fetch(`/api/records/${record.id}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete');
            router.refresh();
        } catch (e) {
            alert('Failed to delete record');
            setDeleting(false);
            setConfirmDelete(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ y: -5, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
            className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all border border-gray-100 ${deleting ? 'opacity-50' : ''}`}
        >
            <div>
                <div className="flex items-start justify-between">
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors"
                    >
                        <FileText className="h-6 w-6" />
                    </motion.div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={`/edit/${record.id}`}
                            className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Edit"
                        >
                            <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            onBlur={() => setConfirmDelete(false)}
                            className={`p-1.5 transition-colors ${confirmDelete
                                ? 'text-red-600 bg-red-50 hover:bg-red-100 ring-2 ring-red-600/20 rounded-md'
                                : 'text-gray-400 hover:text-red-600'
                                }`}
                            title={confirmDelete ? "Click again to confirm" : "Delete"}
                            type="button"
                        >
                            {confirmDelete ? (
                                <span className="text-xs font-bold px-1">Sure?</span>
                            ) : (
                                <Trash2 className="h-4 w-4" />
                            )}
                        </button>
                        <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                            HTML
                        </span>
                    </div>
                </div>

                <h3 className="mt-4 text-lg font-semibold leading-6 text-gray-900 line-clamp-1">
                    {record.title}
                </h3>
                <p className="mt-1 text-sm text-gray-500 line-clamp-1" title={record.originalName}>
                    {record.originalName}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                    {record.tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                            <Tag className="h-3 w-3" />
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            <div className="mt-6 border-t border-gray-100 pt-4 flex items-center justify-between">
                <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="mr-1.5 h-3.5 w-3.5" />
                    {new Date(record.uploadDate).toLocaleDateString('zh-CN')}
                </div>
                <a
                    href={`/uploads/${record.filename}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                    Preview
                    <ExternalLink className="ml-1 h-3.5 w-3.5" />
                </a>
            </div>
        </motion.div>
    );
}
