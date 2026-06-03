<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Role;
use App\Models\Sessions;
use App\Models\CmsPage;
use App\Models\ActivityGame;
use Exception;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Session;

class HomeController extends Controller
{
    private $user, $admin;

    /* public function __construct(User $user){
        $this->user = $user;
    } */

    public function __construct(User $user){
        $this->user = $user;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function showLoginForm()
    {
        return view('admin.login');
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(),[
            'email' => 'required',
            'password' => 'required|string'
            //'captcha' => 'required|captcha'
        ],
        /* [
            'captcha.captcha'=>'Invalid captcha code.'
        ] */
        );

        // $validator = Validator::make($request->all(),[
        //     "password" => "required|string|max:100",
        //     "email" => "required|email:rfc,dns",
        //     'captcha' => 'required|captcha'
        // ],['name.not_in'=>'Something went wrong','captcha.captcha'=>'Invalid captcha code.']);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }else{

            $remember_me = $request->has('remember_me');

            $auth_user = User::where('email', trim($request->email))
                ->whereIn('usertype', ['0', '1', '2'])
                ->first();

            if (!$auth_user || !Hash::check(trim($request->password), $auth_user->password)) {
                return redirect('admin/login')->with('error', 'These credentials do not match our records.');
            }

            Auth::guard('admin')->login($auth_user, $remember_me);

            // delete the old session
            Sessions::where('user_id', $auth_user->id)->delete();

            $userRole = \App\Helpers\ProductHelper::getUserRoleDetails($auth_user->role_id);

                //Artisan::call('cache:clear');

                if(empty($userRole)){
                    Auth::guard('admin')->logout();
                    return back()->with('error','Your have no permission.');
                }

                if(!$userRole->status){
                    Auth::guard('admin')->logout();
                    return back()->with('error','You are unauthorize to access the permission, please contact to web master.');
                }

                if($auth_user->status == '1'){
                    // db_auto_backup_in_7_days
                    //\App\Helpers\ProductHelper::dbBackup();

                    //$auth_user->update(['last_activity' => now()]);
                    /* User::where('id', $auth_user->id)->update([
                        'last_activity' => now()
                    ]); */

                    User::where('id', $auth_user->id)->update([
                        'last_activity' => now()
                    ]);
                    
                    Session::flash('success', 'Your have logged in successfully.');

                    return redirect('/admin/dashboard');
                }else{
                    Auth::guard('admin')->logout();
                    return back()->with('error','Your account is deactivated.');
                }
        }
    }

    public function logout(Request $request){
        Sessions::where('user_id',Auth::guard('admin')->id())->delete();
        // session data remove on the bases of 
        Auth::guard('admin')->logout();
        $request->session()->flush();
        $request->session()->invalidate();
        $request->session()->regenerate();
        // Clear the authentication cookie
        return redirect('admin/login');
        //return redirect('admin/login')->withCookie($cookie);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function dashboard(Request $request){
        $stats = [
            'total_games' => ActivityGame::count(),
            'active_games' => ActivityGame::where('status', 'active')->count(),
            'total_cms' => CmsPage::count(),
            'total_users' => User::where('usertype', '3')->count(),
        ];

        return view('admin.dashboard', compact('stats'));
    }

    public function getDashboardData(Request $request)
    {
        if ($request->ajax()) {
            $data = array();

            // CMS Metrics
            $data['totalCmsPages'] = CmsPage::count();
            $data['publishedCmsPages'] = CmsPage::where('status', 1)->count();
            $data['draftCmsPages'] = CmsPage::where('status', 0)->count();

            // User Metrics
            $data['totalUsers'] = User::where('usertype', '3')->count();
            $data['totalAdmins'] = User::whereIn('usertype', ['0', '1', '2'])->count();

            // Recent CMS Pages
            $data['recentCmsPages'] = CmsPage::latest('created_at')
                ->take(5)
                ->get()
                ->toArray();

            return response()->json(['error' => false, 'data' => $data]);
        }

        return response()->json(['error' => true, 'message' => 'Invalid request'], 400);
    }
      

    public function profile(){
        //$user = $this->user->where('id',Auth::guard('admin')->user()->id)->first();
        $user = $this->user->where('id',Auth::guard('admin')->user()->id)->first();
        $role = Role::select(['id','name'])->where('id',$user->role_id)->first();
        return view('admin.profile',compact('user','role'));
    }

    public function profileUpdate(Request $request)
    {
        $user_id = Auth::guard('admin')->user()->id;
        $validator = Validator::make($request->all(),[
            'name'    => 'required|string|max:100|regex:/^[a-zA-Z ]+$/',
            'email' => 'required|email|unique:users,email,'.$user_id,
            //'offical_email' => 'required|email',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:5048',
            //'address' => 'required|max:200',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }else{
            
            //$user = User::where('id',$user_id)->first();
            $user = User::where('id',$user_id)->first();
            $user->name             = $request->input("name");
            $user->email            = $request->input("email");
            //$user->address          = $request->input("address");
            //$user->offical_email    = $request->input("offical_email");

            if ($image = $request->file('image')) {
                if (!file_exists(storage_path('app/public/uploads/profile-photos'))) {
                    mkdir(storage_path('app/public/uploads/profile-photos'), 0777, true);
                }
                $imageDestinationPath = storage_path('app/public/uploads/profile-photos/');
                $image_name = date('YmdHis') . "." . $image->getClientOriginalExtension();
                $image->move($imageDestinationPath, $image_name);
                //$user->profile_photo_path = "storage/app/public/uploads/profile-photos/".$image_name;
                //$user->profile_photo_path = asset("storage/uploads/profile-photos/".$image_name);
                //$user->profile_photo_path = asset("uploads/profile-photos/".$image_name);
                $user->profile_photo_path = "uploads/profile-photos/".$image_name;
            }
            $user->save();
            return back()->with('success','Profile updated successfully');
        }    
    }

    public function updatePassword(Request $request){
        $validator = Validator::make($request->all(),[
            'current_password'    => 'required',
            'new_password' => 'required|min:8|max:16|regex:/^.*(?=.{8,})(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).*$/|different:current_password',
            'confirm_password' => 'required|min:8|max:16|regex:/^.*(?=.{8,})(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).*$/'
        ],
        [
            'new_password.regex' => 'Password must be at least 8 characters and must contain at least one lower case letter, one upper case letter and one digit',
            'confirm_password.regex' => 'Password must be at least 8 characters and must contain at least one lower case letter, one upper case letter and one digit',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }else{

            //$user = User::where('id',Auth::guard('admin')->user()->id)->first();
            $user = User::where('id',Auth::guard('admin')->user()->id)->first();

            if (Hash::check($request->input("current_password"), $user->password)) { 
                $user->fill([
                    'password' => Hash::make($request->input("new_password"))
                ])->save();

                //$request->session()->flash('success', 'Password changed successfully.');
                \App\Models\Sessions::where('user_id',Auth::guard('admin')->user()->id)->delete();
                Auth::guard('admin')->logout();

               // $request->session()->flush();
               //$request->session()->regenerate();
               return redirect('admin/login')->with('success','Password changed successfully.');
               //return back();
            } else {
                //$request->session()->flash('error', 'Password does not match');
                Session::flash('error', 'Password does not match');
                return back();
            }
        }    
    }

    public function settings(){
        return view('admin.settings');
    }

    /* public function reloadCaptcha(){
        return response()->json(['captcha'=> captcha_img()]);
    } */

    // 14-11-2024 show open with auth only
    public function showImage($a,$b=null,$c=null,$d=null,$e=null,$f=null){
        $filename = "/".$a;

        if (!empty($b)) {
            $filename .= "/".$b;
        }
        if (!empty($c)) {
            $filename .= "/".$c;
        }
        if (!empty($d)) {
            $filename .= "/".$d;
        }
        if (!empty($e)) {
            $filename .= "/".$e;
        }
        if (!empty($f)) {
            $filename .= "/".$f;
        }
       
        $full_path = public_path($filename);
        $ext = pathinfo($full_path, PATHINFO_EXTENSION);
       
        if (!file_exists($full_path) || empty($ext)) {
            abort(404);
        }
        
        $file = file_get_contents($full_path);
        $type = mime_content_type($full_path);

        return response($file, 200)->header('Content-Type', $type);
    }
}