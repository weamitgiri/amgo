<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Role;

class MenuPermission extends Model
{
    use HasFactory;

    protected $table = 'menu_permissions';

    public static function checkRoutePermissions($route){
        $auth_user = Auth::guard('admin')->user();
        $permission = true;

        //echo $route; die;

        if (!in_array($auth_user->usertype,[0,1])) {
            $permission = false;
            $check_route = self::select(['id'])->where('name',$route)->first();
            if (!empty($check_route)) {
                $users =  Role::where('id',$auth_user->role_id)->whereRaw('FIND_IN_SET(?, permissions)', [$check_route->id])->exists();
                if($users){
                    $permission = true;
                }
            }
        }
        return $permission;
    }
}
