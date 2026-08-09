export declare function generateResultsPdf(groupId: number | string): Promise<{
    path: string;
    expiresAt: Date;
}>;
export declare function resolvePdfPath(filename: string): string;
