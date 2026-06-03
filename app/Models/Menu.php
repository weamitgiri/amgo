<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\SoftDeletes;

class Menu extends Model
{
    use HasFactory;
    use SoftDeletes;

    public $timestamps = true;
    
    protected $table = 'menu';

    protected $fillable = [
        'id','name','link','parent_id','icon','status','table_type','order','single_route','permission_type','created_at','updated_at'
    ];
    
    
    public static function getParentMenu()
    {
		return self::select('id','name','link','parent_id','icon','table_type','single_route')
		->where('parent_id','0')
		->whereIn('permission_type',['0','2'])
		->where('status','Active')
		->orderBy('order','ASC')
		->get();
	}

	public static function getSubMenu($parentid){
		$submenu =  self::select('id','name','link','parent_id','icon','single_route')
		->where('parent_id',$parentid)
		->whereIn('permission_type',['0','2'])
		->where('status','Active')
		->get();
		return $submenu;
	}


	public static function getActionMenu($parentid,$manager_action_id=''){
		$submenu =  DB::table('menu_permissions')
		->select('id','name','showing_name','manager_id','manager_action_id')
		->where('manager_id',$parentid)
		->where('manager_action_id',$manager_action_id)
		->where('status','1')
		->get();
		
		return $submenu;
	}


	public static function getClientsOrSubadminParentMenu()
    {
		$parent_menu =  self::select('id','name','link','parent_id','icon','table_type','single_route')
		->where('parent_id','0')
		->whereIn('permission_type',['1','2'])
		->where('status','Active')
		->orderBy('order','ASC')
		->get();

		return $parent_menu;
	}

	/***** add in sub admin id when change *****/
	public static function getClientsOrSubadminParentMenuForSubadmin()
    {
		$parent_menu =  self::select('id','name','link','parent_id','icon','table_type','single_route')
		->where('parent_id','0')
		->whereIn('permission_type',['1','2'])
		->whereNotIn('id',['15'])
		->where('status','Active')
		->orderBy('order','ASC')
		->get();

		return $parent_menu;
	}

	public static function getClientsOrSubadminSubMenu($parentid){
		$submenu =  self::select('id','name','link','parent_id','icon','single_route')
		->where('parent_id',$parentid)
		->whereIn('permission_type',['1','2'])
		->where('status','Active')
		->get();

		return $submenu;
	}

	public static function getClientOrSubadminActionMenu($parentid,$manager_action_id=''){
		$submenu =  DB::table('menu_permissions')
		->select('id','name','showing_name','manager_id','manager_action_id')
		->where('manager_id',$parentid)
		->where('manager_action_id',$manager_action_id)
		->whereIn('permission_type',['1','2'])
		->where('status','1')
		->get();
		
		return $submenu;
	}
}
