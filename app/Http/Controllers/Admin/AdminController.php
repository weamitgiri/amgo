<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Role;
use App\Models\User;
use App\Models\MenuPermission;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Carbon;
use Exception;
use Yajra\DataTables\Facades\DataTables;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Session;

class AdminController extends Controller
{
    private $user;
    private $role;

    public function __construct(User $user,Role $role)
    {
        $this->user = $user;
        $this->role = $role;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {   
        //echo $request->user()->usertype; die;

        if(!\App\Models\MenuPermission::checkRoutePermissions('admin.admin.index')){
            return redirect('admin/dashboard');
        }

        if ($request->ajax()) {
            $users = $this->user->query()->where('usertype', '2')->withcount('parentUser');
            $defaulCoulmn = $request->order['0']['column'] ?? '';
            if ($defaulCoulmn == '0') {        
                $users->orderBy('id','desc');
            }

            return DataTables::of($users)->addIndexColumn()
            ->addColumn('created_at', function ($user) {
                return date('d M Y h:i A', strtotime($user->created_at));
            })
            ->addColumn('lastActivity', function ($user) {
                return !empty($user->last_activity) ? date('d M Y h:i A', strtotime($user->last_activity)) : "-";
            })
            ->addColumn('type', function ($users) {
                $userRole = \helper::getUserRoleDetails($users->role_id);
                return '<span class="badge badge-info">'.$userRole->name.'</span>';
             })->addColumn(
                'status',
                '@if(\App\Models\MenuPermission::checkRoutePermissions("admin.admin.statusChange"))
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
                @endif'
                )->addColumn(
                'actions',
                '@if(\App\Models\MenuPermission::checkRoutePermissions("admin.admin.edit"))
                    <a data-toggle="tooltip" title="Edit" class="btn btn-outline-info btn-xs" href="{{ route("admin.admin.edit",encrypt($id))}}">
                        <i class="fa fa-16px fa-pen"></i>
                    </a>
                @endif

                @if(\App\Models\MenuPermission::checkRoutePermissions("admin.admin.destroy"))
                    <form  method="POST" style="display:initial" action="{{route("admin.admin.destroy",$id)}}">
                        @method("DELETE")
                        @csrf
                        <button data-toggle="tooltip" title="Delete" type="submit" class="btn btn-outline-danger btn-xs delete_confirm"><i class="fa fa-trash"></i></button>
                    </form>
                @endif
                '
            )->rawColumns(['actions', 'status', 'type', 'lastActivity'])->make(true);
        }

        if(Auth::guard('admin')->user()->role_id == 1){
            $roles = $this->role->whereNotIn('id', [1])->where('status','1')->get();
        }else if(Auth::guard('admin')->user()->role_id == 2){
            $roles = $this->role->whereNotIn('id', [1,2])->where('status','1')->get();
        }else{
            $roles = $this->role->whereNotIn('id', [1,2,Auth::guard('admin')->user()->role_id])->where('status','1')->get();
        }

        return view('admin.admin.index', compact('roles'));
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create(Request $request)
    {
        if(!\App\Models\MenuPermission::checkRoutePermissions('admin.admin.create')){
            return redirect('admin/dashboard');
        }

        if(Auth::guard('admin')->user()->role_id == 1){
            $roles = $this->role->whereNotIn('id', [1])->where('status','1')->orderBy('id', 'DESC')->get();
        }else if(Auth::guard('admin')->user()->role_id == 2){
            $roles = $this->role->whereNotIn('id', [1,2])->where('status','1')->orderBy('id', 'DESC')->get();
        }else{
            $roles = $this->role->whereNotIn('id', [1,2,Auth::guard('admin')->user()->role_id])->where('status','1')->orderBy('id', 'DESC')->get();
        }

        return view('admin.admin.create', compact('roles'));
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make(
            $request->all(),
            [
                'name' => 'required|string|max:255',
                'role_id' => 'required',
                'email'    => 'required|email|unique:users,email',
                'password' => 'required|min:6',
                'password_confirm' => 'required|same:password|min:6',
            ]
        );

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        } else {
            $this->user->create(
                [
                    'role_id' => $request->role_id,
                    'name' => $request->name,
                    'email' => $request->email,
                    'username' => $request->email,
                    'password' => Hash::make($request->password),
                    'usertype' => '2',
                    'superadmin_id' => $request->user()->id,
                    'status' => $request->status
                ]
            );
            return redirect('admin/users-permissions/admin')->with('success', 'Admin created successfully.');
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id) {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit(Request $request, $id)
    {
        if(!\App\Models\MenuPermission::checkRoutePermissions('admin.admin.edit')){
            return redirect('admin/dashboard');
        }

        try {
            $id = decrypt($id);

            $user = $this->user->where('id', $id)->firstOrfail();

            $auth_user = $request->user();

            if($auth_user->role_id==1){
                $roles = $this->role->whereNotIn('id',['1'])->where('status','1')->orderBy('id', 'DESC')->get();
            }else if ($auth_user->role_id==2) {
                $roles = $this->role->whereNotIn('id',['1','2'])->where('status','1')->orderBy('id', 'DESC')->get();
            } else {
                $roles = $this->role->whereNotIn('id',['1','2',$auth_user->role_id])->where('status','1')->orderBy('id', 'DESC')->get();
            }

            return view('admin.admin.edit', compact('user','roles'));
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
        try {
            $id = decrypt($id);

            $validator = Validator::make(
                $request->all(),
                [
                    'name'  => 'required',
                    'role_id'  => 'required',
                    'email' => 'required|email|unique:users,email,' . $id,
                    'password' => 'nullable|min:6',
                    'password_confirm' => 'nullable|same:password|min:6'
                ]
            );

            if ($validator->fails()) {
                return redirect()->back()->withErrors($validator)->withInput();
            } else {
                $user = $this->user->where('id', $id)->firstOrfail();
                $user->role_id = $request->role_id;
                $user->name = $request->name;
                $user->username = $user->email = $request->email;
                $user->status = $request->status;
                if (!empty($request->input('password'))) {
                    $user->password = Hash::make($request->password);
                    \App\Models\Sessions::where('user_id',$id)->delete();
                }
                $user->save();

                return redirect('admin/users-permissions/admin')->with('success', 'Admin record updated successfully.');
            }
        } catch (DecryptException $e) {
            return back();
        }
    }

    public function statusChange(Request $request)
    {
        if ($request->ajax()) {
            $validator = Validator::make(
                $request->all(),
                [
                    'id' => 'required|string',
                    'status' => 'required|in:active,inactive'
                ]
            );

            if ($validator->fails()) {
                return response()->json(['error' => true, 'message' => $validator->errors()->first()]);
            } else {
                $user = $this->user->where('id', $request->id)->first();
                $status = ($request->input('status') == 'active') ? '1' : '0';
                \App\Models\Sessions::where('user_id',$request->id)->delete();
                if (is_null($user)) {
                    return response()->json(['error' => true, 'message' => 'not found']);
                }
                $user->status = $status;
                $user->save();
                return response()->json(['error' => false, 'message' => 'Status ' . $request->status . ' successfully']);
            }
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
        if(!\App\Models\MenuPermission::checkRoutePermissions('admin.admin.destroy')){
            return redirect('admin/dashboard');
        }

        $user = $this->user->where('id', $id)->where('usertype', '2')->firstOrfail();

        if($user->status == '1'){
            return redirect('admin/users-permissions/admin')->with('error','Please De-Active Record first then you can delete.');
        }

        \App\Models\Sessions::where('user_id',$id)->delete();
        $user->delete();

        return back()->with('success', 'Deleted successfully.');
    }

    public function getAdminRolePermission(Request $request,$id){
        try {
            
            $user_id = decrypt($id);

            //echo $user_id; die;

            $user = User::where('id',$user_id)->firstOrfail();
            $role = Role::where('id',$user->role_id)->firstOrfail();
            $permissions = MenuPermission::get()->pluck('name', 'name');
            //dd($permissions);
            
            return view('admin.admin.role-permission',compact('user','role','permissions'));

        }catch (DecryptException $e) {
            return abort(404);
        }
    }

    public function roleAdminPermissionSave(Request $request,$id) {
        if ($request->ajax()) {

            try {
                
                $user_id = decrypt($id);
                $role_id = decrypt($request->role_id);

                //echo "<pre>"; print_r($request->all()); die;

                /*if (empty($request->action_permission)) {
                    return response()->json(['error'=>true,'message'=>'Please Select permissions.']);
                }*/

                if (empty($request->action_permission)) {

                    $managers = NULL;
                    $permissions = NULL;

                    $msg = 'Roles Remove Successfully.';
                    
                }else{
                    $managerpermission = (array) $request->get('menu_permission');

                    $mainmenupermission = [];
                    foreach($managerpermission as $key=> $val){
                        $mainmenupermission[] = $key; 
                        foreach($val as $value){
                            $mainmenupermission[] = $value; 
                        }
                    }

                    $managers = implode(',',$mainmenupermission);
                    $permissions = implode(',',(array) $request->action_permission);

                    $msg = 'Roles Assigned Successfully.';
                }

                //User::where('id',$user_id)->update(['managers'=>$managers,'permissions'=>$permissions]);
                Role::where('id',$role_id)->update(['managers'=>$managers,'permissions'=>$permissions]);
            
                //return response()->json(['error'=>false,'message'=>'Saved Successfully']);
                return response()->json(['error'=>false,'message'=>$msg]);
            
            } catch (\Exception $e) {
                return response()->json(['error'=>true,'message'=>$e->getMessage()]);
            }
        }
    }
}
