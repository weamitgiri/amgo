<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Permission;

class Role extends Model
{
    use HasFactory;
    use SoftDeletes;
    
       protected $table = 'roles';

       protected $fillable = [
        'name', 'guard_name', 'description', 'status',
       ];

       public function permissions()
       {
           return $this->belongsToMany(Permission::class, 'role_has_permissions', 'role_id', 'permission_id');
       }
}