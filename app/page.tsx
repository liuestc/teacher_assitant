
import { HtmlRecord } from '@/types';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import RecordCard from '@/components/RecordCard';

async function getRecords(): Promise<HtmlRecord[]> {
  const res = await fetch('http://localhost:3000/api/records', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }
  return res.json();
}

export default async function Home() {
  let records: HtmlRecord[] = [];
  try {
    records = await getRecords();
  } catch (e) {
    console.error(e);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
        <span className="text-sm text-gray-500">{records.length} files uploaded</span>
      </div>

      {records.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50">
            <FileText className="h-10 w-10 text-blue-500" />
          </div>
          <h3 className="mt-6 text-xl font-semibold text-gray-900">No files uploaded yet</h3>
          <p className="mt-2 max-w-sm text-gray-500">Upload your first HTML file to get started with the preview system.</p>
          <Link
            href="/upload"
            className="mt-6 inline-flex items-center rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Upload File
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {records.map((record) => (
            <RecordCard key={record.id} record={record} />
          ))}
        </div>
      )}
    </div>
  );
}
