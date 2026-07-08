<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/**
 * Admin viewer for the Node API's winston log files (apis/logs/*.log).
 * Lets admins see exactly where the game APIs are throwing errors without
 * shell access to the server.
 */
class ApiLogController extends Controller
{
    private const MAX_LINES = 500;

    private function logPath(string $file): string
    {
        // Only the two known winston log files are readable — never a user-supplied path.
        $map = [
            'error' => base_path('apis/logs/error.log'),
            'all' => base_path('apis/logs/all.log'),
        ];

        return $map[$file] ?? $map['error'];
    }

    /** Read the last N lines of a file without loading the whole file into memory. */
    private function tailFile(string $path, int $lines): array
    {
        if (!is_file($path) || !is_readable($path)) {
            return [];
        }

        $fp = fopen($path, 'rb');
        if (!$fp) {
            return [];
        }

        $buffer = '';
        $chunkSize = 8192;
        fseek($fp, 0, SEEK_END);
        $pos = ftell($fp);

        while ($pos > 0 && substr_count($buffer, "\n") <= $lines) {
            $read = min($chunkSize, $pos);
            $pos -= $read;
            fseek($fp, $pos);
            $buffer = fread($fp, $read) . $buffer;
        }
        fclose($fp);

        $allLines = explode("\n", trim($buffer));

        return array_slice($allLines, -$lines);
    }

    /** Strip ANSI color codes (older log lines were written with terminal colors). */
    private function stripAnsi(string $line): string
    {
        return preg_replace('/\x1b\[[0-9;]*m/', '', $line);
    }

    /** Parse "YYYY-MM-DD HH:mm:ss:ms level: message" into structured parts. */
    private function parseLine(string $line): array
    {
        $clean = $this->stripAnsi($line);

        if (preg_match('/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\S*\s+(error|warn|info|http|debug):\s*(.*)$/i', $clean, $m)) {
            return [
                'timestamp' => $m[1],
                'level' => strtolower($m[2]),
                'message' => $m[3],
                'raw' => false,
            ];
        }

        return [
            'timestamp' => null,
            'level' => 'info',
            'message' => $clean,
            'raw' => true,
        ];
    }

    public function index(Request $request)
    {
        $file = in_array($request->query('file'), ['error', 'all'], true) ? $request->query('file') : 'error';
        $level = $request->query('level', '');
        $search = trim((string) $request->query('search', ''));

        $path = $this->logPath($file);
        $rawLines = $this->tailFile($path, self::MAX_LINES);

        $entries = [];
        foreach ($rawLines as $line) {
            if ($line === '') {
                continue;
            }
            $entry = $this->parseLine($line);

            if ($level !== '' && $entry['level'] !== $level) {
                continue;
            }
            if ($search !== '' && stripos($entry['message'], $search) === false) {
                continue;
            }

            $entries[] = $entry;
        }

        // Newest first
        $entries = array_reverse($entries);

        $counts = ['error' => 0, 'warn' => 0, 'info' => 0, 'http' => 0, 'debug' => 0];
        foreach ($entries as $e) {
            if (isset($counts[$e['level']])) {
                $counts[$e['level']]++;
            }
        }

        $fileInfo = [
            'exists' => is_file($path),
            'size' => is_file($path) ? filesize($path) : 0,
            'modified' => is_file($path) ? date('Y-m-d H:i:s', filemtime($path)) : null,
        ];

        return view('admin.api-logs.index', compact('entries', 'file', 'level', 'search', 'counts', 'fileInfo'));
    }

    public function clear(Request $request)
    {
        $file = in_array($request->input('file'), ['error', 'all'], true) ? $request->input('file') : 'error';
        $path = $this->logPath($file);

        if (is_file($path) && is_writable($path)) {
            file_put_contents($path, '');

            return redirect()->route('admin.api-logs.index', ['file' => $file])
                ->with('success', ucfirst($file) . ' log cleared.');
        }

        return redirect()->route('admin.api-logs.index', ['file' => $file])
            ->with('error', 'Log file is not writable.');
    }
}
