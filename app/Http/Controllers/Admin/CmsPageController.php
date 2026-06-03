<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCmsPageRequest;
use App\Models\CmsPage;
use Illuminate\Http\Request;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Validator;
use Yajra\DataTables\Facades\DataTables;
use Exception;

class CmsPageController extends Controller
{
    private $cmsPage;

    public function __construct(CmsPage $cmsPage)
    {
        $this->cmsPage = $cmsPage;
    }

    /**
     * Display a listing of CMS pages.
     */
    public function index(Request $request)
    {
        if (!$this->checkPermission('admin.cms.index')) {
            return redirect('admin/dashboard')->with('error', 'Unauthorized access');
        }

        if ($request->ajax()) {
            $pages = $this->cmsPage->query();

            if (!empty($request->search['value'])) {
                $search = $request->search['value'];
                $pages->where(function ($q) use ($search) {
                    $q->where('page_name', 'like', "%{$search}%")
                        ->orWhere('title', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%");
                });
            }

            if (!empty($request->status)) {
                $pages->where('status', $request->status);
            }

            $pages->orderBy('id', 'desc');

            return DataTables::of($pages)
                ->addIndexColumn()
                ->addColumn('created_date', function ($page) {
                    return date('d M Y h:i A', strtotime($page->created_at));
                })
                ->addColumn('creator', function ($page) {
                    return $page->creator ? $page->creator->name : 'System';
                })
                ->addColumn('status', function ($page) {
                    $checked = $page->status == 1 ? 'checked' : '';
                    return '<div class="custom-control custom-switch">
                        <input type="checkbox" class="custom-control-input status-toggle" 
                               data-id="' . $page->id . '" id="status' . $page->id . '" ' . $checked . '>
                        <label class="custom-control-label" for="status' . $page->id . '"></label>
                    </div>';
                })
                ->addColumn('actions', function ($page) {
                    $actions = '';
                    if ($this->checkPermission('admin.cms.edit')) {
                        $actions .= '<a href="' . route('admin.cms.edit', encrypt($page->id)) . '" 
                                      class="btn btn-sm btn-outline-info" title="Edit">
                                      <i class="fa fa-edit"></i>
                                    </a>';
                    }
                    if ($this->checkPermission('admin.cms.destroy')) {
                        $actions .= '<form method="POST" style="display:inline;" 
                                      action="' . route('admin.cms.destroy', $page->id) . '">
                                      <input type="hidden" name="_method" value="DELETE">
                                      <input type="hidden" name="_token" value="' . csrf_token() . '">
                                      <button type="submit" class="btn btn-sm btn-outline-danger delete-confirm" 
                                              title="Delete"><i class="fa fa-trash"></i>
                                      </button>
                                    </form>';
                    }
                    return $actions;
                })
                ->rawColumns(['actions', 'status'])
                ->make(true);
        }

        return view('admin.cms.index');
    }

    /**
     * Show the form for creating a new CMS page.
     */
    public function create()
    {
        if (!$this->checkPermission('admin.cms.create')) {
            return redirect('admin/dashboard')->with('error', 'Unauthorized access');
        }

        $predefinedPages = [
            'homepage' => 'Homepage Content',
            'footer' => 'Footer Content',
            'terms' => 'Terms & Conditions',
            'privacy' => 'Privacy Policy',
            'refund' => 'Refund Policy',
            'about' => 'About Us',
            'contact' => 'Contact Us',
        ];

        return view('admin.cms.create', compact('predefinedPages'));
    }

    /**
     * Store a newly created CMS page.
     */
    public function store(StoreCmsPageRequest $request)
    {
        if (!$this->checkPermission('admin.cms.create')) {
            return redirect('admin/dashboard')->with('error', 'Unauthorized access');
        }

        try {
            $data = $request->validated();

            // Handle image upload
            if ($request->hasFile('featured_image')) {
                $image = $request->file('featured_image');
                $imageName = date('YmdHis') . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                $imagePath = 'uploads/cms/';

                if (!file_exists(storage_path('app/public/' . $imagePath))) {
                    mkdir(storage_path('app/public/' . $imagePath), 0777, true);
                }

                $image->move(storage_path('app/public/' . $imagePath), $imageName);
                $data['featured_image'] = $imagePath . $imageName;
            }

            $data['created_by'] = Auth::guard('admin')->id();

            CmsPage::create($data);

            return redirect()->route('admin.cms.index')->with('success', 'CMS page created successfully.');
        } catch (Exception $e) {
            return back()->with('error', 'Error creating CMS page: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Show the form for editing the specified CMS page.
     */
    public function edit($id)
    {
        if (!$this->checkPermission('admin.cms.edit')) {
            return redirect('admin/dashboard')->with('error', 'Unauthorized access');
        }

        try {
            $id = decrypt($id);
            $page = CmsPage::findOrFail($id);

            $predefinedPages = [
                'homepage' => 'Homepage Content',
                'footer' => 'Footer Content',
                'terms' => 'Terms & Conditions',
                'privacy' => 'Privacy Policy',
                'refund' => 'Refund Policy',
                'about' => 'About Us',
                'contact' => 'Contact Us',
            ];

            return view('admin.cms.edit', compact('page', 'predefinedPages'));
        } catch (DecryptException $e) {
            return redirect()->route('admin.cms.index')->with('error', 'Invalid page ID');
        }
    }

    /**
     * Update the specified CMS page.
     */
    public function update(StoreCmsPageRequest $request, $id)
    {
        if (!$this->checkPermission('admin.cms.edit')) {
            return redirect('admin/dashboard')->with('error', 'Unauthorized access');
        }

        try {
            $id = decrypt($id);
            $page = CmsPage::findOrFail($id);

            $data = $request->validated();

            // Handle image upload
            if ($request->hasFile('featured_image')) {
                // Delete old image
                if ($page->featured_image && File::exists(storage_path('app/public/' . $page->featured_image))) {
                    File::delete(storage_path('app/public/' . $page->featured_image));
                }

                $image = $request->file('featured_image');
                $imageName = date('YmdHis') . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                $imagePath = 'uploads/cms/';

                if (!file_exists(storage_path('app/public/' . $imagePath))) {
                    mkdir(storage_path('app/public/' . $imagePath), 0777, true);
                }

                $image->move(storage_path('app/public/' . $imagePath), $imageName);
                $data['featured_image'] = $imagePath . $imageName;
            }

            $data['updated_by'] = Auth::guard('admin')->id();

            // Handle publish action
            if ($data['status'] == 1) {
                $data['published_at'] = now();
            }

            $page->update($data);

            return redirect()->route('admin.cms.index')->with('success', 'CMS page updated successfully.');
        } catch (DecryptException $e) {
            return redirect()->route('admin.cms.index')->with('error', 'Invalid page ID');
        } catch (Exception $e) {
            return back()->with('error', 'Error updating CMS page: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Delete the specified CMS page.
     */
    public function destroy($id)
    {
        if (!$this->checkPermission('admin.cms.destroy')) {
            return redirect('admin/dashboard')->with('error', 'Unauthorized access');
        }

        try {
            $page = CmsPage::findOrFail($id);

            // Delete featured image
            if ($page->featured_image && File::exists(storage_path('app/public/' . $page->featured_image))) {
                File::delete(storage_path('app/public/' . $page->featured_image));
            }

            $page->delete();

            return back()->with('success', 'CMS page deleted successfully.');
        } catch (Exception $e) {
            return back()->with('error', 'Error deleting CMS page');
        }
    }

    /**
     * Toggle CMS page status via AJAX.
     */
    public function toggleStatus(Request $request)
    {
        if ($request->ajax()) {
            $validator = Validator::make($request->all(), [
                'id' => 'required|exists:cms_pages,id',
                'status' => 'required|in:0,1',
            ]);

            if ($validator->fails()) {
                return response()->json(['error' => true, 'message' => 'Invalid request'], 422);
            }

            try {
                $page = CmsPage::findOrFail($request->id);

                if ($request->status == 1) {
                    $page->publish();
                } else {
                    $page->draft();
                }

                return response()->json(['error' => false, 'message' => 'Status updated successfully']);
            } catch (Exception $e) {
                return response()->json(['error' => true, 'message' => 'Error updating status'], 500);
            }
        }

        return response()->json(['error' => true, 'message' => 'Invalid request'], 400);
    }

    /**
     * Preview a CMS page.
     */
    public function preview($id)
    {
        try {
            $id = decrypt($id);
            $page = CmsPage::findOrFail($id);

            return view('admin.cms.preview', compact('page'));
        } catch (DecryptException $e) {
            return redirect()->route('admin.cms.index')->with('error', 'Invalid page ID');
        }
    }

    public function uploadMedia(Request $request)
    {
        if (!$request->hasFile('upload')) {
            return response()->json(['uploaded' => 0, 'error' => ['message' => 'No file uploaded']], 422);
        }

        $validator = Validator::make($request->all(), [
            'upload' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json(['uploaded' => 0, 'error' => ['message' => 'Invalid image file']], 422);
        }

        $image = $request->file('upload');
        $fileName = date('YmdHis') . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
        $path = 'uploads/cms/';

        if (!file_exists(storage_path('app/public/' . $path))) {
            mkdir(storage_path('app/public/' . $path), 0777, true);
        }

        $image->move(storage_path('app/public/' . $path), $fileName);
        $url = asset('storage/' . $path . $fileName);

        return response()->json(['uploaded' => 1, 'fileName' => $fileName, 'url' => $url]);
    }

    /**
     * Check permission helper.
     */
    private function checkPermission($permission)
    {
        // For now, return true for all admins
        // In future, integrate with MenuPermission model
        return true;
    }
}
