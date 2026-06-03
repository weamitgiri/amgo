<?php

namespace App\Models;

//use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Role;

class User extends Authenticatable

{
    use HasFactory, Notifiable, SoftDeletes;

    protected $dates = ['deleted_at'];

    /*
    * User roles type 
    * '0' => 'superadmin', '1'=> 'admin','2'=> 'subadmin','3'=> 'user'
    */

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'role_id','name','email','password','status','usertype','phone','last_activity','superadmin_id','platform','currency','admin_id','balance','username','deleted_at','ip','exposure', 'created_at', 'updated_at'
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_recovery_codes',
        'two_factor_secret',
        'email_verified_at'
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function parentUser(){
        return $this->belongsTo(self::class,'id','admin_id');
    }

    public function adminUsers(){
        return $this->belongsTo(self::class,'id','admin_id')->where('usertype','3');
    }

    public function role(){
        return $this->belongsTo(Role::class,'role_id','id');
    }


}