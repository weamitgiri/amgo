/** One participant row of a group's results table. */
export type ResultRow = {
    name: string;
    email: string;
    role: string;
    score: string;
    status: string;
};
/** A group's saved result row plus one table row per participant, winners/losers resolved. */
export declare function loadGroupResults(groupId: number | string): Promise<{
    result: any;
    rows: ResultRow[];
}>;
/** Draws the "# / Participant / Role / Score / Result" table at doc.y, paging as needed. */
export declare function drawParticipantsTable(doc: PDFKit.PDFDocument, rows: ResultRow[]): void;
export declare function generateResultsPdf(groupId: number | string): Promise<{
    path: string;
    expiresAt: Date;
}>;
export declare function resolvePdfPath(filename: string): string;
