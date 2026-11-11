<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MenuPermission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Throwable;

/**
 * Settings → Database → "Clear Organizer & Participant Data".
 *
 * Permanently deletes every organizer registration, booking, billing, payment
 * and notification, plus every participant who joined and all of their
 * game-session data, and the generated result / invoice PDFs.
 *
 * It never touches settings, games / activities / packages, game content
 * (stories, roles, clues, Cook & Create templates and ingredients), CMS, blogs,
 * FAQs, email templates, admin users, roles or menus — only the tables listed
 * in CLEAR_TABLES below.
 */
class DataResetController extends Controller
{
    /** Phrase the admin must type to confirm. */
    public const CONFIRM_PHRASE = 'DELETE ALL DATA';

    /** Only these tables are emptied. */
    private const CLEAR_TABLES = [
        // Organizers, bookings & payments
        'organizers',
        'organizer_bookings',
        'organizer_billings',
        'organizer_notifications',
        'payments',
        'payment_webhook_events',
        'package_purchases',

        // Participants who joined & their groups
        'game_participants',
        'game_groups',
        'participant_sessions',

        // Mystery Quest session data
        'questions',
        'answers',
        'votes',
        'timers',
        'results',
        'score_logs',
        'lie_detector_rounds',
        'group_accusations',
        'witness_passcards',
        'clue_rooms',

        // Cook & Create session data
        'cc_game_instances',
        'cc_round1_selected_ingredients',
        'cc_round1_votes',
        'cc_round2_released_clues',
        'cc_round2_steps',
        'cc_round2_step_votes',
        'cc_round3_messages',
        'cc_round3_impostor_votes',
        'cc_ratings',
    ];

    /** Generated PDF folders of the Node API (organizer / participant documents). */
    private const PDF_DIRS = ['results-pdfs', 'cc-results-pdfs', 'invoices'];

    public function clear(Request $request)
    {
        if (!MenuPermission::checkRoutePermissions('admin.data.clear')) {
            return response()->json(['confirm_text' => ['You do not have permission to clear data.']], 403);
        }

        $validator = Validator::make(
            $request->all(),
            [
                'confirm_text' => ['required', 'string', 'in:' . self::CONFIRM_PHRASE],
                'password' => ['required', 'string'],
            ],
            [
                'confirm_text.required' => 'Type ' . self::CONFIRM_PHRASE . ' to confirm.',
                'confirm_text.in' => 'Type exactly ' . self::CONFIRM_PHRASE . ' (capital letters) to confirm.',
                'password.required' => 'Enter your admin password.',
            ]
        );
        if ($validator->fails()) {
            // Field => [messages] — the shape forms.js shows under each input.
            return response()->json($validator->errors()->toArray(), 422);
        }

        $admin = Auth::guard('admin')->user();
        if (!$admin || !Hash::check($request->input('password'), $admin->password)) {
            return response()->json(['password' => ['The password is incorrect.']], 422);
        }

        $existing = $this->existingTables();
        $counts = [];

        try {
            DB::statement('SET FOREIGN_KEY_CHECKS = 0');
            DB::transaction(function () use ($existing, &$counts) {
                foreach ($existing as $table) {
                    $counts[$table] = DB::table($table)->delete();
                }
            });
        } catch (Throwable $e) {
            Log::error('Admin data clear failed', ['admin_id' => $admin->id, 'error' => $e->getMessage()]);
            return response()->json(['confirm_text' => ['Clearing failed — nothing was deleted. Please try again.']], 500);
        } finally {
            DB::statement('SET FOREIGN_KEY_CHECKS = 1');
        }

        // Start IDs from 1 again on the now-empty tables (ALTER commits on its
        // own, so it runs only after the deletes above have been committed).
        foreach ($existing as $table) {
            try {
                DB::statement("ALTER TABLE `{$table}` AUTO_INCREMENT = 1");
            } catch (Throwable $e) {
                // Not critical — IDs simply continue from where they were.
            }
        }

        $files = $this->deleteGeneratedPdfs();

        Log::warning('Admin cleared all organizer & participant data', [
            'admin_id' => $admin->id,
            'admin_email' => $admin->email,
            'ip' => $request->ip(),
            'rows_deleted' => array_filter($counts),
            'pdf_files_deleted' => $files,
        ]);

        return response()->json([
            'status' => 'success',
            'success' => true,
            'reload' => true,
            'message' => 'All organizer, participant and payment data has been deleted ('
                . array_sum($counts) . ' records, ' . $files . ' PDF files).',
        ]);
    }

    /** CLEAR_TABLES that actually exist in this database. */
    private function existingTables(): array
    {
        $database = DB::connection()->getDatabaseName();
        $present = collect(DB::select(
            'SELECT table_name AS t FROM information_schema.tables WHERE table_schema = ?',
            [$database]
        ))->pluck('t')->map(fn ($t) => strtolower($t))->all();

        return array_values(array_filter(self::CLEAR_TABLES, fn ($t) => in_array($t, $present, true)));
    }

    /** Deletes the generated PDFs; returns how many files were removed. */
    private function deleteGeneratedPdfs(): int
    {
        $deleted = 0;
        foreach (self::PDF_DIRS as $dir) {
            $path = base_path('apis/storage/' . $dir);
            if (!File::isDirectory($path)) {
                continue;
            }
            foreach (File::allFiles($path) as $file) {
                if (strtolower($file->getExtension()) === 'pdf' && File::delete($file->getPathname())) {
                    $deleted++;
                }
            }
        }
        return $deleted;
    }
}
