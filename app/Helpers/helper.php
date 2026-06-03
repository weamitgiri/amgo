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