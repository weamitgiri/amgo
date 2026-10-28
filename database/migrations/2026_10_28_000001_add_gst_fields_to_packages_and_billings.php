<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Per-package GST configuration (rate + SAC/HSN) and an immutable GST snapshot
 * on each billing row, so a historical invoice keeps its tax breakdown even if
 * package pricing or the GST rate changes later. All columns are nullable or
 * defaulted, so existing rows and code paths keep working unchanged.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('packages')) {
            Schema::table('packages', function (Blueprint $t) {
                if (!Schema::hasColumn('packages', 'gst_rate')) {
                    $t->decimal('gst_rate', 5, 2)->default(18.00)->after('price');
                }
                if (!Schema::hasColumn('packages', 'sac_code')) {
                    $t->string('sac_code', 10)->nullable()->after('gst_rate');
                }
            });
        }

        if (Schema::hasTable('organizer_billings')) {
            Schema::table('organizer_billings', function (Blueprint $t) {
                $add = function (string $col, callable $def) use ($t) {
                    if (!Schema::hasColumn('organizer_billings', $col)) {
                        $def();
                    }
                };
                $add('gst_rate', fn () => $t->decimal('gst_rate', 5, 2)->nullable()->after('gst_amount'));
                $add('tax_type', fn () => $t->string('tax_type', 10)->nullable()->after('gst_rate'));
                $add('cgst_amount', fn () => $t->decimal('cgst_amount', 12, 2)->nullable()->after('tax_type'));
                $add('sgst_amount', fn () => $t->decimal('sgst_amount', 12, 2)->nullable()->after('cgst_amount'));
                $add('igst_amount', fn () => $t->decimal('igst_amount', 12, 2)->nullable()->after('sgst_amount'));
                $add('place_of_supply', fn () => $t->string('place_of_supply', 100)->nullable()->after('igst_amount'));
                $add('place_of_supply_code', fn () => $t->string('place_of_supply_code', 2)->nullable()->after('place_of_supply'));
                $add('sac_code', fn () => $t->string('sac_code', 10)->nullable()->after('place_of_supply_code'));
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('packages')) {
            Schema::table('packages', function (Blueprint $t) {
                foreach (['sac_code', 'gst_rate'] as $col) {
                    if (Schema::hasColumn('packages', $col)) {
                        $t->dropColumn($col);
                    }
                }
            });
        }
        if (Schema::hasTable('organizer_billings')) {
            Schema::table('organizer_billings', function (Blueprint $t) {
                foreach (['sac_code', 'place_of_supply_code', 'place_of_supply', 'igst_amount', 'sgst_amount', 'cgst_amount', 'tax_type', 'gst_rate'] as $col) {
                    if (Schema::hasColumn('organizer_billings', $col)) {
                        $t->dropColumn($col);
                    }
                }
            });
        }
    }
};
