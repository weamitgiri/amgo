<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Role;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use App\Models\MenuPermission;
//use DataTables;
use Yajra\DataTables\Facades\DataTables;
use Exception;
use Illuminate\Support\Facades\Validator;
//use App\Helpers\helper;

class RoleController extends Controller
{
    private $role;

    public function __construct(Role $role){
        $this->role = $role;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request){

        if (!\App\Models\MenuPermission::checkRoutePermissions('admin.role.index')) {
            return redirect('admin/dashboard');
        }
        
        if($request->ajax()){
            
            //$roles = $this->role->where('id','!=','1')->get();
            
            //echo "<pre>"; print_r(Auth::guard('admin')->user()); die('----stop');

            if(Auth::guard('admin')->user()->role_id == 1){
                $roles = $this->role->whereNotIn('id', [1]);
            }else if(Auth::guard('admin')->user()->role_id == 2){
                //die('asdasdasdasd');
                $roles = $this->role->whereNotIn('id', [1,2]);
            }else{
                //die('---------------------------------------');
                $roles = $this->role->whereNotIn('id', [1,2,Auth::guard('admin')->user()->role_id]);
            }

            $roles->orderBy('id', 'DESC')->get();

            return DataTables::of($roles)->addIndexColumn()->addColumn('created_at', function ($role) {
                return date('d M Y', strtotime($role->created_at));
            })->addColumn('name', function ($role) {
                return $role->name;
            })->addColumn('status','

                @if(\App\Models\MenuPermission::checkRoutePermissions("admin.role.statusChange"))
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
                @endif '
            )->addColumn('actions', '

            @if(\App\Models\MenuPermission::checkRoutePermissions("admin.role.edit"))
                <a data-toggle="tooltip" title="Edit" class="btn btn-outline-primary btn-xs" href="{{ route("admin.role.edit",encrypt($id))}}" >
                    <i class="fa fa-16px fa-pen"></i>
                </a>
            @endif

            @if(\App\Models\MenuPermission::checkRoutePermissions("admin.role.destroy"))
                @if($id > 2)
                    <form method="POST" style="display:initial" action="{{route("admin.role.destroy",$id)}}">
                    @method("DELETE")
                    @csrf
                    <button data-toggle="tooltip" title="Delete" type="submit" class="btn btn-outline-danger btn-xs delete_confirm"><i class="fa fa-trash"></i></button>
                    </form>
                @endif
            @endif

            <a href="{{ route("admin.getRolePermission",encrypt($id))}}" class="btn btn-outline-info btn-sm btn-xs" data-toggle="tooltip" title="Permissions"> <i class="fa fa-check-circle"></i>
            </a> 
          ')->rawColumns(['actions','status'])->make(true);
        }
        return view('admin.role.index');
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create(){
        /*if(!checkRoutePermissions('admin.role.create')){
          return redirect('/');
        }*/
        return view('admin.role.create');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        /*if(!checkRoutePermissions('admin.role.store')){
          return redirect('/');
        }*/

        $validator = Validator::make($request->all(),[
            'name'    => 'required|unique:roles,name|max:50'
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }else{

            try{
                
                $name = strip_tags($request->input('name'));
                //echo $name; die();
                $this->role->create([
                    'name'=>$name,
                ]);

                return redirect('admin/users-permissions/role')->with('success','Role Created Successfully.');

            }catch(Exception $e){
                return back()->with('error',$e->getMessage());
            }
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

        /*if(!checkRoutePermissions('admin.role.edit')){
            return redirect('/');
        }*/

        try {

            $id = decrypt($id);

            $role = $this->role->where('id',$id)->firstOrfail();
            
            return view('admin.role.edit',compact('role'));

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

        /* if(!checkRoutePermissions('admin.role.update')){
            return redirect('/');
        }*/
        
        try {

            $id = decrypt($id);
        
            $validator = Validator::make($request->all(),[
                'name'  => 'required|max:50|unique:roles,name,'.$id,
             ]);

            if ($validator->fails()) { 
                 return redirect()->back()->withErrors($validator)->withInput();
            }else{

               $role = $this->role->where('id',$id)->firstOrfail();
               $role->name = trim($request->input('name'));
               $role->save();
               
               return redirect('admin/users-permissions/role')->with('success','Role Updated Successfully.');
            }
        } 
        catch (DecryptException $e) {
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

                $auth_user = $request->user();
                $role = $this->role->where('id',$request->id)->first();
                $status = ($request->status =='active') ? '1': '0';
                if(is_null($role)){
                    return response()->json(['error'=>true,'message'=>'not found']);
                }

                $role->status = $status;
                $role->save();
                
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
        $role = $this->role->where('id',$id)->firstOrfail();
        if($role->status == '1'){
           return back()->with('error','Please De-Active Recode.');
        }

        //echo "<pre>"; print_r($role); die;

        //Check value exit or not 
        $foreign_key_name = 'role_id';
        if(!empty(\App\Helpers\ProductHelper::checkIdExists($id,$foreign_key_name))){
           return back()->with('error',"This field is already used, You can't delete.");
        }
        
        $role->delete();
        
        return back()->with('success','Role Deleted successfully.');
    }



    public function getRolePermission(Request $request,$id){
        try {
            $role_id = decrypt($id);
            $role = Role::where('id',$role_id)->firstOrfail();
            $permissions = MenuPermission::get()->pluck('name', 'name');
            return  view('admin.role.role-permission',compact('role','permissions'));
        }catch (DecryptException $e) {
            return abort(404);
        }
    }

    public function rolePermissionSave(Request $request) {

        if ($request->ajax()) {

            try {  

                //echo "<pre>"; print_r($request->all()); die;
                
                $role_id = decrypt($request->u_id);

                $managerpermission = (array) $request->get('manager_permission');
                $mainmenupermission = [];
                foreach($managerpermission as $key=> $val){
                    $mainmenupermission[] = $key; 
                    foreach($val as $value){
                        $mainmenupermission[] = $value; 
                    }
                }

                $managers = implode(',',(array) $mainmenupermission);
                $permissions = implode(',',(array) $request->action_permission);

                //echo "<pre>"; print_r($managers); //die;
                //echo "<br/><pre>"; print_r($permissions); die;
                //echo $role_id; die;

                Role::where('id',$role_id)->update(['managers'=>$managers,'permissions'=>$permissions]);
                
            
                return response()->json(['error'=>false,'message'=>'Saved Successfully']);
            
            } catch (\Exception $e) {
                
                return response()->json(['error'=>true,'message'=>"Something went wrong."]);
            }
        }

    }
}
