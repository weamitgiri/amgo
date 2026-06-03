<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Contracts\Encryption\DecryptException;
use App\Models\User;
use App\Models\Role;
use App\Models\UsersToken;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Yajra\DataTables\Facades\DataTables;
use Illuminate\Support\Facades\Hash;
use Exception;
use Illuminate\Support\Facades\File;

class UsersController extends Controller {

    private $user;
    private $role;

    public function __construct(User $user,Role $role){
        $this->user = $user;
        $this->role = $role;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request){

        if($request->ajax()){
            //$users = $this->user->where('admin_id',Auth::guard('admin')->user()->id);

            //$users = User::where('usertype','3')->orderBy('id','ASC');
            $users = $this->user->where('usertype','3');

            /* if(Auth::guard('admin')->user()->role_id == 1){
                $users = $this->user->where('admin_id',['1']);
            }else if(Auth::guard('admin')->user()->role_id == 2){
                $users = $this->user->whereNotIn('role_id',['1','2']);
            }else{
                $users = $this->user->whereNotIn('role_id',['1','2',Auth::guard('admin')->user()->role_id]);
            } */

            /* if(!empty($request->role_type)){
                $users->where('role_id',$request->role_type);
            } */

            $defaulCoulmn = $request->order['0']['column'] ?? '';
            if ($defaulCoulmn == '0') {        
                $users->orderBy('id','desc');
            }

            return DataTables::of($users)->addIndexColumn()->addColumn('created', function ($users) {
                return date('d M Y h:i A', strtotime($users->created_at));
            })
            ->addColumn('lastActivity', function ($users) {
                return !empty($users->last_activity) ? date('d M Y h:i A', strtotime($users->last_activity)) : "-";
            })
            ->addColumn('user_name', function ($users) {
                $userLoginStatus = UsersToken::where(['userid' => $users->id])->exists();
                return !empty($userLoginStatus) ? "<img src='" . asset('admin/images/online.gif') . "' width='21' height='21'  class='img-c'/> " . $users->username : "<img src='" . asset('admin/images/offline.png') . "' width='12' height='12'  class='img-c'/> " . $users->username ;
            })
            ->addColumn('name_us', function ($users) {
                return $users->name;
            })
            /*->addColumn('image', function ($users) {
                if(!empty($users->profile_photo_path)){
                    return "<img width='80' height='80' src='".url("admin/showImage/storage/".$users->profile_photo_path)."' class='img-c'/>";
                }else{
                    return "<img width='80' height='80' src='".asset('admin/images/user.png')."' class='img-c'/>";
                }
            })*/
            /* ->addColumn('type', function ($users) {
                $userRole = \App\Helpers\ProductHelper::getUserRoleDetails($users->role_id);
                return '<span class="badge bg-dark">'.$userRole->name.'</span>';
             }) */
            ->addColumn('status','
            @if(\App\Models\MenuPermission::checkRoutePermissions("admin.users.statusChange"))
                @if($status=="1")
                   <div class="custom-control custom-switch custom-switch-off-danger custom-switch-on-success">
                   <input type="checkbox" class="custom-control-input status_change" data-id="{{ $id }}" id="customSwitch{{$id}}" checked>
                   <label class="custom-control-label" for="customSwitch{{$id}}"></label>
                 </div>
                @elseif($status=="0")
                   <div class="custom-control custom-switch custom-switch-off-danger custom-switch-on-success">
                       <input type="checkbox" class="custom-control-input status_change" data-id="{{ $id }}" id="customSwitch{{$id}}">
                       <label class="custom-control-label" for="customSwitch{{$id}}"></label>
                   </div>
                @else
                   -    
                @endif
            @else
                @if($status=="1")
                    Active
                @elseif($status=="0")
                    Inacitve
                @endif
            @endif    
            '
            )->addColumn('actions', '
            @if(\App\Models\MenuPermission::checkRoutePermissions("admin.users.edit"))
                <a data-toggle="tooltip" title="Edit" class="btn btn-outline-info btn-xs" href="{{ url("admin/users-permissions/users/".encrypt($id)."/edit" )}}">
                <i class="fa fa-16px fa-pen"></i>
                </a>
            @endif

            @if(\App\Models\MenuPermission::checkRoutePermissions("admin.users.destroy"))
                <form  method="POST" style="display:initial" action="{{route("admin.users.destroy",$id)}}" >
                @method("DELETE")
                @csrf
                <button data-toggle="tooltip" title="Delete" type="submit" class="btn btn-outline-danger btn-xs delete_confirm"><i class="fa fa-trash"></i></button>
                </form>
            @endif
          ')->rawColumns(['actions','status','type', 'user_name', 'lastActivity', 'created'])->make(true);
        }

        if(!\App\Models\MenuPermission::checkRoutePermissions('admin.users.index')){
            return redirect('admin/dashboard');
        }

        if(Auth::guard('admin')->user()->role_id == 1){
            $roles = $this->role->whereNotIn('id', [1])->where('status','1')->get();
        }else if(Auth::guard('admin')->user()->role_id == 2){
            $roles = $this->role->whereNotIn('id', [1,2])->where('status','1')->get();
        }else{
            $roles = $this->role->whereNotIn('id', [1,2,Auth::guard('admin')->user()->role_id])->where('status','1')->get();
        }
        return view('admin.users.index',compact('roles'));
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create(Request $request){

        if(!\App\Models\MenuPermission::checkRoutePermissions('admin.users.create')){
            return redirect('admin/dashboard');
        }

        $auth_user = $request->user();
        if($auth_user->role_id==1){
            $roles = $this->role->whereNotIn('id',['1'])->where('status','1')->get();
        }else if ($auth_user->role_id==2) {
            $roles = $this->role->whereNotIn('id',['1','2'])->where('status','1')->get();
        } else {
            $roles = $this->role->whereNotIn('id',['1','2',$auth_user->role_id])->where('status','1')->get();
        }

        return view('admin.users.create',compact('roles'));
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        if(!\App\Models\MenuPermission::checkRoutePermissions('admin.users.create')){
            return redirect('admin/dashboard');
        }

        $validator = Validator::make($request->all(),[
                /* 'first_name' => 'required|string|regex:/^[a-zA-Z ]+$/u',
                'last_name' => 'nullable|string|regex:/^[a-zA-Z ]+$/u', */
                'username' => 'required|min:2|unique:users,username,NULL,id,deleted_at,NULL',
                'email' => 'nullable|min:2|unique:users,email,NULL,id,deleted_at,NULL',
                'phone' => 'required|min:10|max:16|unique:users,phone|regex:/^[6-9]\d{9,15}$/',
                //'role_id'    => 'required',
                'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5024',
                //'new_password' => 'required|min:8|max:16|regex:/^.*(?=.{8,16})(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).*$/',
                'new_password' => 'required|min:6|max:12',
            ],
            [
                'phone.regex' => 'The phone number must start with a 6, 7, 8, or 9 and be between 10 to 16 digits long.'
            ]
        );

        if ($validator->fails()) {
            return response()->json($validator->messages(), 422);
        }else{

            try{

                $users = new User();
                //$users->role_id  = $request->role_id;
                $users->role_id  = '0';
                /* $users->first_name = trim($request->first_name);
                $users->last_name   = trim($request->last_name); 
                $users->name   = trim($request->first_name)." ".trim($request->last_name);*/
                $users->email   = !empty($request->email) ? trim($request->email) : NULL;
                $users->username  = trim($request->username);
                $users->phone   = trim($request->phone);
                $users->password = Hash::make($request->new_password);
                $users->usertype = '3';
                $users->admin_id = Auth::guard('admin')->user()->id;
                $users->ip = $request->ip();

                //dd($users);
             
                $profile_photo_path = "";
                if ($image = $request->file('profile_image')) {
                     if (!file_exists(storage_path('app/public/uploads/profile-photos'))) {
                        mkdir(storage_path('app/public/uploads/profile-photos'), 0777, true);
                    }
                    $imageDestinationPath = storage_path('app/public/uploads/profile-photos/');
                    $image_name = date('YmdHis')."." . $image->getClientOriginalExtension();
                    $image->move($imageDestinationPath, $image_name);
                    $profile_photo_path = "uploads/profile-photos/".$image_name;
                    $users->profile_photo_path = $profile_photo_path;
                }

                if($users->save()){
                    
                    $response["status"] = "success";
                    //$response["resetform"] = true;
                    $response["reload"] = true;
                    $response["message"] = "Record Saved Successfully.";
                }else{
                    $response["status"] = "error";
                    $response["message"] = "Error occurred, Please try again!";
                }
                return json_encode($response);
                //return redirect('admin/users-permissions/users')->with('success','User created successfully.');

            }catch(Exception $e){
                return back()->with('error',$e->getMessage());
            }
        }    
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit(Request $request,$id)
    {
        if(!\App\Models\MenuPermission::checkRoutePermissions('admin.users.edit')){
            return redirect('admin/dashboard');
        }

        try {

            $id = decrypt($id);
            $users = $this->user->where('id',$id)->firstOrfail();
            
            $auth_user = $request->user();

            if($auth_user->role_id==1){
                $roles = $this->role->whereNotIn('id',['1'])->where('status','1')->get();
            }else if ($auth_user->role_id==2) {
                $roles = $this->role->whereNotIn('id',['1','2'])->where('status','1')->get();
            } else {
                $roles = $this->role->whereNotIn('id',['1','2',$auth_user->role_id])->where('status','1')->get();
            }

            return view('admin.users.edit',compact('users','roles'));

        } catch (DecryptException $e) {
           return redirect('/');
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        if(!\App\Models\MenuPermission::checkRoutePermissions('admin.users.edit')){
            return redirect('admin/dashboard');
        }

        try {

            $id = decrypt($id);

            $validator = Validator::make($request->all(),[
                /* 'first_name' => 'required|regex:/^[a-zA-Z ]+$/u',
                'last_name' => 'required|regex:/^[a-zA-Z ]+$/u', */
                'username' => 'required|unique:users,username,'.$id,
                'email' => 'nullable|email|unique:users,email,'.$id,
                'phone' => 'required|min:10|max:16|regex:/^[6-9]\d{9,15}$/|unique:users,phone,'.$id,
               // 'role_id'    => 'required',
                'profile_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5024',
                'new_password' => 'nullable|min:6|max:12',
                //'confirm_password' => 'nullable|same:new_password',
            ],
            [
                'phone.regex' => 'The phone number must start with a 6, 7, 8, or 9 and be between 10 to 16 digits long.',
                //'new_password.regex' => 'Password must be at least 8 characters and must contain at least one lower case letter, one upper case letter and one digit',
            ]);

            if ($validator->fails()) {
                //echo "<pre>"; print_r($validator->errors()); die;
                return response()->json($validator->messages(), 422);
            }else{

                $users = User::where('id',$id)->first();
                /* $users->first_name  = trim($request->first_name);
                $users->last_name  = trim($request->last_name); */
                $users->username  = trim($request->username);
                $users->email  = !empty($request->email) ? trim($request->email) : $users->email;
                $users->phone    = trim($request->phone);
                
                //$users->role_id     = trim($request->role_id);

                if(!empty($request->new_password)){
                    $users->password = Hash::make($request->new_password);
                    \App\Models\Sessions::where('user_id',$id)->delete();
                    \App\Models\UsersToken::where('userid',$id)->delete();
                }

                if(!empty($request->role_id)){
                    \App\Models\Sessions::where('user_id',$id)->delete();
                    \App\Models\UsersToken::where('userid',$id)->delete();
                }

                if ($file = $request->file('profile_image')) {
                    if (!file_exists(storage_path('app/public/uploads/profile-photos'))) {
                        mkdir(storage_path('app/public/uploads/profile-photos'), 0777, true);
                    }

                    if (File::exists(storage_path('app/public/uploads/profile-photos/'.$users->profile_photo_path))) {
                        File::delete(storage_path('app/public/uploads/profile-photos/'.$users->profile_photo_path));
                    }

                    $fileDestinationPath = storage_path('app/public/uploads/profile-photos/');
                    $file_name = date('YmdHis') . "." . $file->getClientOriginalExtension();

                    $file->move($fileDestinationPath, $file_name);
                    $users->profile_photo_path = 'uploads/profile-photos/'.$file_name;
                }

                if($users->save()){
                    $response["status"] = "success";
                    //$response["resetform"] = true;
                    $response["reload"] = true;
                    $response["message"] = "Record Updated Successfully.";
                }else{
                    $response["status"] = "error";
                    $response["message"] = "Error occurred, Please try again!";
                }
                return json_encode($response);
                return redirect('admin/users-permissions/users')->with('success','Record Updated successfully.');
            }
        } catch (DecryptException $e) {
            return back();
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        if(!\App\Models\MenuPermission::checkRoutePermissions('admin.users.destroy')){
            return redirect('admin/dashboard');
        }

        $users = User::where('id',$id)->firstOrfail();

        if($users->status == '1'){
            return redirect('admin/users-permissions/users')->with('error','Please De-Active Record first then you can delete.');
        }

        //echo $users->profile_photo_path; die;
        if (File::exists(storage_path('app/public/'.$users->profile_photo_path))) {
            File::delete(storage_path('app/public/'.$users->profile_photo_path));
        }

        \App\Models\Sessions::where('user_id',$id)->delete();
        \App\Models\UsersToken::where('userid',$id)->delete();
        
        $users->delete();
        
        return back()->with('success','Record Deleted successfully.');
    }

    public function statusChange(Request $request){
        if ($request->ajax()) {
        
            $validator = Validator::make($request->all(),[
                'id'    => 'required|string',
                'status' => 'required|in:active,inactive'
            ]);

            if ($validator->fails()) {
                return response()->json(['error'=>true,'message'=>'']);
            }else{
                $users = User::where('id',$request->id)->first();
                
                $status = ($request->status =='active') ? '1': '0';
                if(is_null($users)){
                    return response()->json(['error'=>true,'message'=>'not found']);
                }else{
                    \App\Models\Sessions::where('user_id',$request->id)->delete();
                    \App\Models\UsersToken::where('userid',$request->id)->delete(); 
                    $users->status = $status;                  
                    if($users->save()){
                        return response()->json(['error'=>false,'message'=>'Status '.$request->status.' successfully']);
                    }
                }
            }
        } 
    }
}