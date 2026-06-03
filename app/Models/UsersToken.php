<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Permission\Models\Role;
use DB;

class UsersToken extends Model
{
    use HasFactory;

    public $timestamps = true;
    
    protected $table = 'userstoken';

    protected $fillable = [
        'id','userid','token','session_token','session_expiry','created_at','updated_at'
    ];
}