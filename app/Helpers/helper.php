<?php

use App\Models\MenuPermission;
use App\Models\User;
use App\Models\TransactionSummary;
use App\Models\GameBets;
use App\Models\Role;
 
class helper {

    public static function checkRoutePermissions($route)
    {
        return MenuPermission::checkRoutePermissions($route);
    }

    public static function insertTransaction($transData = []){
        TransactionSummary::create($transData);
        return true;
    }

    public static function insertgameBets($gBetData = []){
        GameBets::create($gBetData);
        return true;
    }

    public static function getGameBetData($transactionId = '', $userid){
        return GameBets::where(['transactionId' => $transactionId, 'userid' => $userid])->first();
    }

    public static function getAdminInfo()
    {        
        return User::where(['id' => 1])->first();
    }

    public static function getUserRoleDetails($roleId)
    {
        $roleData = Role::where('id',$roleId)->first();
        return $roleData;
    }
}

if (! function_exists('money_inr')) {
    /**
     * Formats a rupee amount for admin screens: ₹1,23,456.78.
     *
     * Uses the Indian digit grouping (lakh/crore) rather than number_format's
     * thousands grouping, because ₹1,23,456 and ₹123,456 read as different
     * amounts to the people reconciling these reports.
     */
    function money_inr($amount, bool $decimals = true): string
    {
        $value = (float) ($amount ?? 0);
        $negative = $value < 0;

        // Round first, so 99.999 groups as 100.00 rather than 99 + ".00".
        $rounded = number_format(abs($value), 2, '.', '');
        [$whole, $paise] = explode('.', $rounded);

        if (strlen($whole) > 3) {
            $last3 = substr($whole, -3);
            $rest = substr($whole, 0, -3);
            // Every group above the last three is two digits wide.
            $whole = preg_replace('/\B(?=(\d{2})+(?!\d))/', ',', $rest) . ',' . $last3;
        }

        return ($negative ? '-' : '') . '₹' . $whole . ($decimals ? '.' . $paise : '');
    }
}