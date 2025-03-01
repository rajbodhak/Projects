import path from "path";

const getDataUri = (file: { originalname: string; buffer: Buffer }): string | null => {
    if (!file || !file.originalname || !file.buffer) {
        console.error("Invalid file object provided to getDataUri");
        return null; // Handle missing file safely
    }

    try {
        // Get the MIME type based on file extension
        const mimeType = getMimeType(path.extname(file.originalname));

        // Convert buffer to base64
        const base64 = file.buffer.toString('base64');

        // Create data URI
        return `data:${mimeType};base64,${base64}`;
    } catch (error) {
        console.error("Failed to generate Data URI:", error);
        return null;
    }
};

// Helper function to get MIME type from file extension
function getMimeType(extension: string): string {
    const mimeTypes: Record<string, string> = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        '.pdf': 'application/pdf',
        '.txt': 'text/plain',
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        // Add more MIME types as needed
    };

    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
}

export default getDataUri;