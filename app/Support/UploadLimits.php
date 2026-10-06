<?php

namespace App\Support;

/**
 * Upload sizes the server will actually accept, exposed to the admin UI so an
 * oversized upload is stopped in the browser with a clear toast instead of
 * failing on the server (PHP silently dropping the file, or the web server
 * answering "413 Request Entity Too Large"). 0 means "no limit known".
 */
class UploadLimits
{
    /** Largest single file PHP accepts (upload_max_filesize), in bytes. */
    public static function fileBytes(): int
    {
        return self::iniBytes('upload_max_filesize');
    }

    /**
     * Largest whole request accepted, in bytes: PHP's post_max_size, further
     * capped by config('uploads.max_request_mb') — the web server's own body
     * limit (nginx client_max_body_size), which PHP cannot read.
     */
    public static function requestBytes(): int
    {
        $bytes = self::iniBytes('post_max_size');
        $mb = (int) config('uploads.max_request_mb', 0);
        if ($mb > 0) {
            $cap = $mb * 1024 * 1024;
            $bytes = $bytes > 0 ? min($bytes, $cap) : $cap;
        }

        return $bytes;
    }

    /** "8M" / "512K" / "1G" -> bytes; "0", "-1" or empty -> 0 (unlimited). */
    private static function iniBytes(string $key): int
    {
        $value = trim((string) ini_get($key));
        if ($value === '' || $value === '0' || $value === '-1') {
            return 0;
        }

        $number = (float) $value;

        return (int) match (strtolower(substr($value, -1))) {
            'g' => $number * 1024 ** 3,
            'm' => $number * 1024 ** 2,
            'k' => $number * 1024,
            default => $number,
        };
    }
}
