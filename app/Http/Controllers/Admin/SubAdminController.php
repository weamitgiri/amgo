<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Validator;
use App\Models\User;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Carbon;
use Auth;
use App\Models\MenuPermission;
use DataTables;

class SubAdminController extends Controller
{
    private $user;

    public function __construct(User $user){        
        $this->user = $user;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request){
        
        if(!\App\Models\MenuPermission::checkRoutePermissions('admin.sub-admin.index')){
            return abort(403,'You do not have access to this page.');
        }

        if($request->ajax()){
            
            $auth_user = $request->user();

            if ($auth_user->usertype == '0') {
               $users = $this->user->query()->where('usertype','2');
            }else{
                $users = $this->user->query()
                ->where('admin_id',$auth_user->id)
                ->where('usertype','2');
            }

            $users->orderBy('id', 'DESC');
            
            return DataTables::of($users)->addIndexColumn()->addColumn('created_at', function ($user) {
                return date('d M Y', strtotime($user->created_at));
            })->addColumn('name', function ($user) {
                return $user->name;
            })->addColumn('status','
                @if(\App\Models\MenuPermission::checkRoutePermissions("admin.sub-admin.statusChange"))
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
            )->addColumn('actions', '
            <a title="Edit Details" class="btn btn-outline-info btn-xs" href="{{ route("admin.sub-admin.edit",encrypt($id))}}" >
            <i class="fa fa-pencil-square-o"></i> Edit
            </a>

            <form  method="POST" style="display:initial" action="{{route("admin.sub-admin.destroy",$id)}}" >
            @method("DELETE")
            @csrf
            <button type="submit" class="btn btn-outline-danger btn-xs delete_confirm"><i class="fa fa-trash"></i></button>
            </form>

            <a href="{{ route("admin.getRolePermission",encrypt($id))}}" class="btn btn-outline-warning btn-xs" title="Permission">Permissions
              </a>
          ')->rawColumns(['actions','status'])->make(true);
        }

        return view('admin.sub_admin.index');
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create(){

        if(!\App\Models\MenuPermission::checkRoutePermissions('admin.sub-admin.create')){
            return abort(403,'You do not have access to this page.');
        }
        
        return view('admin.sub_admin.create');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(),[
            'name'    => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|min:8',
            'password_confirm' => 'required|same:password|min:8'
        ]);

        if ($validator->fails()) {
             return redirect()->back()->withErrors($validator)->withInput();
        }else{

            $this->user->create([
                'name'=>$request->input('name'),
                'email' => $request->input('email'),
                'username' => $request->input('email'),
                'password' => Hash::make($request->input('password')),
                'usertype' => '2',
                'admin_id' => $request->user()->id,
            ]);

            return redirect('admin/users-permissions/sub-admin')->with('success','Sub admin created successfully.');
        }    
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {

        if(!\App\Models\MenuPermission::checkRoutePermissions('admin.sub-admin.edit')){
            return abort(403,'You do not have access to this page.');
        }

        try {

            $id = decrypt($id);

            $user = $this->user->where('id',$id)->firstOrfail();
            
            return view('admin.sub_admin.edit',compact('user'));

        } catch (DecryptException $e) {
            return abort(404);
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id){
        
        try {

            $id = decrypt($id);
        
            $validator = Validator::make($request->all(),[
                'name'  => 'required',
                'email' =>  'required|email|unique:users,email,'.$id,
                'password' => 'nullable|min:6',
                'password_confirm' => 'nullable|same:password|min:6'
            ]);

            if ($validator->fails()) { 
                 return redirect()->back()->withErrors($validator)->withInput();
            }else{

               $user = $this->user->where('id',$id)->firstOrfail();
               $user->name = $request->input('name');
               $user->email = $request->input('email');
               $user->username = $request->input('email');
               if (!empty($request->input('password'))) {
                  $user->password = Hash::make($request->input('password'));
               }
               
               $user->save();

               return redirect('admin/sub-admin')->with('success','Sub admin record updated successfully.');
            }
            } catch (DecryptException $e) {
                return back();
        }
    }


    public function statusChange(Request $request){

        if ($request->ajax()) {        
            $validator = Validator::make($request->all(),[
                'id'    => 'required|string',
                'status' => 'required|in:active,inactive'
            ]);

            if ($validator->fails()) {
                return response()->json(['error'=>true,'message'=>$validator->errors()->first()]);
            }else{

                $user = $this->user->where('id',$request->id)->first();
                $status = ($request->status =='active') ? '1': '0';
                if(is_null($user)){
                    return response()->json(['error'=>true,'message'=>'not found']);
                }

                $user->status = $status;
                $user->save();
           
                return response()->json(['error'=>false,'message'=>'Status '.$request->status.' successfully']);
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
        $user = $this->user->where('id',$id)->where('usertype','2')->firstOrfail();

        if($user->status == '1'){
            return redirect('admin/sub-admin')->with('error','Please De-Active Record first then you can delete.');
        }

        $user->delete();
        return back()->with('success','Deleted successfully.');
    }

    public function getRolePermission(Request $request,$id){
        try {
            
            $user_id = decrypt($id);

            //echo $user_id; die;

            $user = User::where('id',$user_id)->where('usertype','2')->firstOrfail();
            $permissions = MenuPermission::get()->pluck('name', 'name');
            return  view('admin.sub_admin.role-permission',compact('user','permissions'));

        }catch (DecryptException $e) {
            return abort(404);
        }
    }

    public function rolePermissionSave(Request $request,$id) {
        if ($request->ajax()) {

            try {
                
                $user_id = decrypt($id);

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

                User::where('id',$user_id)->update(['managers'=>$managers,'permissions'=>$permissions]);
            
                //return response()->json(['error'=>false,'message'=>'Saved Successfully']);
                return response()->json(['error'=>false,'message'=>$msg]);
            
            } catch (\Exception $e) {
                return response()->json(['error'=>true,'message'=>$e->getMessage()]);
            }
        }
    }
}