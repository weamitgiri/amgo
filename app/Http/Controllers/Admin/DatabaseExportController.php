<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MenuPermission;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use PDO;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

/**
 * Full database export (every table, structure + all rows) as a downloadable
 * .sql file that can be re-imported with the mysql client / phpMyAdmin.
 *
 * Generated in pure PHP and streamed row-by-row, so it neither depends on
 * `mysqldump` being installed on the server nor loads whole tables into memory.
 * Restricted to full admins: sub-admins are denied unless their role is
 * explicitly granted the "admin.database.export" menu permission.
 */
class DatabaseExportController extends Controller
{
    /** Rows written per INSERT statement. */
    private const ROWS_PER_INSERT = 500;

    public function export(): StreamedResponse
    {
        if (!MenuPermission::checkRoutePermissions('admin.database.export')) {
            abort(403, 'You do not have permission to export the database.');
        }

        $connection = DB::connection();
        $pdo = $connection->getPdo();
        $database = $connection->getDatabaseName();
        $admin = Auth::guard('admin')->user();

        // A full dump contains personal data and credentials — keep an audit trail.
        Log::info('Admin database export started', [
            'admin_id' => $admin?->id,
            'admin_email' => $admin?->email,
            'ip' => request()->ip(),
            'database' => $database,
        ]);

        $filename = $database . '_backup_' . now()->format('Y-m-d_His') . '.sql';

        return response()->streamDownload(function () use ($pdo, $database, $admin) {
            @set_time_limit(0);
            $this->writeDump($pdo, $database, $admin?->id);
        }, $filename, [
            'Content-Type' => 'application/sql; charset=UTF-8',
            'Cache-Control' => 'no-store, no-cache, must-revalidate',
            'X-Accel-Buffering' => 'no',
        ]);
    }

    private function writeDump(PDO $pdo, string $database, $adminId): void
    {
        $originalTimeZone = $pdo->query('SELECT @@session.time_zone')->fetchColumn();
        $originalBuffered = $pdo->getAttribute(PDO::MYSQL_ATTR_USE_BUFFERED_QUERY);

        try {
            // Read TIMESTAMP values in UTC and tell the importer the same, so
            // they round-trip unchanged regardless of server time zones.
            $pdo->exec("SET time_zone = '+00:00'");

            $this->out("-- Database export: `{$database}`\n");
            $this->out('-- Generated: ' . now()->toDateTimeString() . " (server time)\n");
            $this->out("-- Re-import with: mysql -u USER -p DATABASE < this_file.sql\n\n");
            $this->out("SET NAMES utf8mb4;\n");
            $this->out("SET time_zone = '+00:00';\n");
            $this->out("SET FOREIGN_KEY_CHECKS = 0;\n");
            $this->out("SET UNIQUE_CHECKS = 0;\n");
            $this->out("SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';\n\n");

            $tables = $pdo->query("SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'")->fetchAll(PDO::FETCH_NUM);
            $views = $pdo->query("SHOW FULL TABLES WHERE Table_type = 'VIEW'")->fetchAll(PDO::FETCH_NUM);

            foreach ($tables as $row) {
                $this->dumpTable($pdo, $row[0]);
            }

            foreach ($views as $row) {
                $view = $row[0];
                $create = $pdo->query('SHOW CREATE VIEW ' . $this->ident($view))->fetch(PDO::FETCH_NUM)[1];
                // Drop the DEFINER clause so the view imports under any MySQL user.
                $create = preg_replace('/\sDEFINER=`[^`]*`@`[^`]*`/', '', $create);
                $this->out("--\n-- View: {$view}\n--\n\n");
                $this->out('DROP VIEW IF EXISTS ' . $this->ident($view) . ";\n");
                $this->out($create . ";\n\n");
            }

            $this->out("SET FOREIGN_KEY_CHECKS = 1;\n");
            $this->out("SET UNIQUE_CHECKS = 1;\n\n");
            $this->out('-- Dump completed: ' . count($tables) . ' table(s), ' . count($views) . " view(s)\n");

            Log::info('Admin database export completed', ['admin_id' => $adminId, 'tables' => count($tables)]);
        } catch (Throwable $e) {
            // Headers are already sent, so mark the file as incomplete in-band.
            $this->out("\n-- ERROR: export aborted, this file is INCOMPLETE: " . $e->getMessage() . "\n");
            Log::error('Admin database export failed', ['admin_id' => $adminId, 'error' => $e->getMessage()]);
        } finally {
            $pdo->setAttribute(PDO::MYSQL_ATTR_USE_BUFFERED_QUERY, $originalBuffered);
            $pdo->exec('SET time_zone = ' . $pdo->quote((string) $originalTimeZone));
        }
    }

    private function dumpTable(PDO $pdo, string $table): void
    {
        $create = $pdo->query('SHOW CREATE TABLE ' . $this->ident($table))->fetch(PDO::FETCH_NUM)[1];

        $this->out("--\n-- Table: {$table}\n--\n\n");
        $this->out('DROP TABLE IF EXISTS ' . $this->ident($table) . ";\n");
        $this->out($create . ";\n\n");

        // Generated columns can't be inserted into; binary-ish columns are
        // written as hex literals so their bytes survive the text file intact.
        $columns = [];
        $binary = [];
        foreach ($pdo->query('SHOW COLUMNS FROM ' . $this->ident($table))->fetchAll(PDO::FETCH_ASSOC) as $col) {
            if (preg_match('/\b(VIRTUAL|STORED) GENERATED\b/i', (string) $col['Extra'])) {
                continue;
            }
            $columns[] = $col['Field'];
            $binary[] = (bool) preg_match(
                '/^(tiny|medium|long)?blob|^(var)?binary|^bit|^geometry|^point|^linestring|^polygon|^multi|^geometrycollection/i',
                (string) $col['Type']
            );
        }
        if (!$columns) {
            return;
        }

        $columnList = implode(', ', array_map(fn ($c) => $this->ident($c), $columns));
        $insertPrefix = 'INSERT INTO ' . $this->ident($table) . " ({$columnList}) VALUES\n";

        // Unbuffered: rows stream from MySQL instead of being held in memory.
        $pdo->setAttribute(PDO::MYSQL_ATTR_USE_BUFFERED_QUERY, false);
        $stmt = $pdo->query("SELECT {$columnList} FROM " . $this->ident($table));

        $batch = [];
        $rowCount = 0;
        while (($row = $stmt->fetch(PDO::FETCH_NUM)) !== false) {
            $values = [];
            foreach ($row as $i => $value) {
                if ($value === null) {
                    $values[] = 'NULL';
                } elseif ($binary[$i]) {
                    $values[] = $value === '' ? "''" : '0x' . bin2hex($value);
                } else {
                    $values[] = $pdo->quote((string) $value);
                }
            }
            $batch[] = '(' . implode(', ', $values) . ')';
            $rowCount++;

            if (count($batch) >= self::ROWS_PER_INSERT) {
                $this->out($insertPrefix . implode(",\n", $batch) . ";\n");
                $batch = [];
            }
        }
        $stmt->closeCursor();
        $pdo->setAttribute(PDO::MYSQL_ATTR_USE_BUFFERED_QUERY, true);

        if ($batch) {
            $this->out($insertPrefix . implode(",\n", $batch) . ";\n");
        }
        $this->out("-- {$rowCount} row(s)\n\n");
    }

    /** Backtick-quote an identifier (doubling any embedded backticks). */
    private function ident(string $name): string
    {
        return '`' . str_replace('`', '``', $name) . '`';
    }

    private function out(string $chunk): void
    {
        echo $chunk;
        if (ob_get_level() > 0) {
            @ob_flush();
        }
        flush();
    }
}
