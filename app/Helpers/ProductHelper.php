<?php
namespace App\Helpers;
use App\Models\User;
use App\Models\UploadPdf;
use App\Models\SiteUpdate;
use App\Models\VisitorsCount;
use App\Models\Role;
use App\Models\Settings;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Artisan;

use Illuminate\Console\Command;

class ProductHelper {

	//Check Id Exit or not old
	public static function checkIdExists($id, $foreign_key_name)
	{
		// Retrieve all table names in the current database
		$tableNames = DB::select('SHOW TABLES');

		foreach ($tableNames as $table) {
			// Extract the table name (adjust for different DB drivers)
			$tableName = array_values((array)$table)[0];

			// Check if the table has the specified column
			if (Schema::hasColumn($tableName, $foreign_key_name)) {
				// Check if the foreign key value exists in the table
				$exists = DB::table($tableName)->where($foreign_key_name, $id)->exists();

				// Return true immediately if the ID is found
				if ($exists) {
					return true;
				}
			}
		}

		// Return false if the ID is not found in any table
		return false;
	}

	public static function maskString($string){
        $length = strlen($string);
    
        if ($length <= 4) {
            // If the string is too short, return it as is
            return $string;
        }
    
        // Get the first 2 and last 2 characters
        $start = substr($string, 0, 2);
        $end = substr($string, -2);
    
        // Replace the middle part with asterisks
        $masked = $start . str_repeat('*', $length - 4) . $end;
    
        return $masked;
    }

	// common method to update the site date
	public static function getUserRoleDetails($roleId)
	{
		$roleData = Role::where('id',$roleId)->first();
		return $roleData;
	}

	public static function getAdminInfo($userid)
	{
		return User::select(['id','role_id','name','email','username','usertype','superadmin_id','admin_id'])->where('id',$userid)->first()->toArray();
	}
}
?>