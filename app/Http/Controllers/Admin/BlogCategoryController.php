<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreBlogCategoryRequest;
use App\Models\BlogCategory;
use Illuminate\Http\Request;

class BlogCategoryController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:admin');
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if ($request->ajax()) {
            $categories = BlogCategory::with('creator')
                                     ->latest()
                                     ->paginate(15);

            $data = [];
            foreach ($categories as $category) {
                $data[] = [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'blogs_count' => $category->blogs()->count(),
                    'status' => $category->status_label,
                    'actions' => $category->id,
                ];
            }

            return response()->json([
                'data' => $data,
                'draw' => $request->input('draw'),
                'recordsTotal' => BlogCategory::count(),
                'recordsFiltered' => BlogCategory::count(),
            ]);
        }

        return view('admin.blog-categories.index');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('admin.blog-categories.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBlogCategoryRequest $request)
    {
        BlogCategory::create($request->validated() + ['created_by' => auth()->id()]);

        return redirect()->route('admin.blog-categories.index')
                       ->with('success', 'Category created successfully!');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(BlogCategory $blogCategory)
    {
        return view('admin.blog-categories.edit', compact('blogCategory'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreBlogCategoryRequest $request, BlogCategory $blogCategory)
    {
        $blogCategory->update($request->validated() + ['updated_by' => auth()->id()]);

        return redirect()->route('admin.blog-categories.index')
                       ->with('success', 'Category updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(BlogCategory $blogCategory)
    {
        $blogCategory->delete();

        return redirect()->route('admin.blog-categories.index')
                       ->with('success', 'Category deleted successfully!');
    }

    /**
     * Toggle category status
     */
    public function toggleStatus(Request $request)
    {
        $category = BlogCategory::findOrFail($request->category_id);
        $category->update(['status' => !$category->status]);

        return response()->json(['success' => true, 'status' => $category->status_label]);
    }
}
