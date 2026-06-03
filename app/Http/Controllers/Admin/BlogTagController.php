<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreBlogTagRequest;
use App\Models\BlogTag;
use Illuminate\Http\Request;

class BlogTagController extends Controller
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
            $tags = BlogTag::with('creator')
                          ->latest()
                          ->paginate(15);

            $data = [];
            foreach ($tags as $tag) {
                $data[] = [
                    'id' => $tag->id,
                    'name' => $tag->name,
                    'slug' => $tag->slug,
                    'status' => $tag->status_label,
                    'actions' => $tag->id,
                ];
            }

            return response()->json([
                'data' => $data,
                'draw' => $request->input('draw'),
                'recordsTotal' => BlogTag::count(),
                'recordsFiltered' => BlogTag::count(),
            ]);
        }

        return view('admin.blog-tags.index');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('admin.blog-tags.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBlogTagRequest $request)
    {
        BlogTag::create($request->validated() + ['created_by' => auth()->id()]);

        return redirect()->route('admin.blog-tags.index')
                       ->with('success', 'Tag created successfully!');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(BlogTag $blogTag)
    {
        return view('admin.blog-tags.edit', compact('blogTag'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreBlogTagRequest $request, BlogTag $blogTag)
    {
        $blogTag->update($request->validated() + ['updated_by' => auth()->id()]);

        return redirect()->route('admin.blog-tags.index')
                       ->with('success', 'Tag updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(BlogTag $blogTag)
    {
        $blogTag->delete();

        return redirect()->route('admin.blog-tags.index')
                       ->with('success', 'Tag deleted successfully!');
    }

    /**
     * Toggle tag status
     */
    public function toggleStatus(Request $request)
    {
        $tag = BlogTag::findOrFail($request->tag_id);
        $tag->update(['status' => !$tag->status]);

        return response()->json(['success' => true, 'status' => $tag->status_label]);
    }
}
