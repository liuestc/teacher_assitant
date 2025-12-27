
export interface HtmlRecord {
    id: string;
    title: string;
    tags: string[];
    filename: string;
    originalName: string;
    uploadDate: string;
}

export type ApiResponse<T> = T | { error: string };
