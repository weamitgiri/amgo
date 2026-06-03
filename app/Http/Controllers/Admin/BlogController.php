<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreBlogRequest;
use App\Models\Blog;
use App\Models\BlogCategory;
use App\Models\BlogTag;
use App\Services\BlogService;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    protected $blogService;

    public function __construct(BlogService $blogService)
    {
        $this->blogService = $blogService;
        $this->middleware('auth:admin');
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        if ($request->ajax()) {
            $blogs = Blog::with(['category', 'author', 'tags'])->latest();

            return \Yajra\DataTables\Facades\DataTables::of($blogs)
                ->addIndexColumn()
                ->addColumn('category', function ($blog) {
                    return $blog->category->name ?? 'N/A';
                })
                ->addColumn('author', function ($blog) {
                    return $blog->author->name ?? 'N/A';
                })
                ->addColumn('is_featured', function ($blog) {
                    return $blog->is_featured ? '✓' : '✗';
                })
                ->addColumn('published_at', function ($blog) {
                    return $blog->published_at ? $blog->published_at->format('M d, Y') : 'N/A';
                })
                ->addColumn('actions', function ($blog) {
                    return $blog->id;
                })
                ->make(true);
        }

        return view('admin.blogs.index');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categories = BlogCategory::active()->get();
        $tags = BlogTag::active()->get();
        $authors = \App\Models\User::where('usertype', '<=', 1)->get();

        return view('admin.blogs.create', compact('categories', 'tags', 'authors'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBlogRequest $request)
    {
        $data = $request->validated();

        // Handle featured image upload
        if ($request->hasFile('featured_image')) {
            $data['featured_image'] = $this->blogService->uploadFeaturedImage($request->file('featured_image'));
        }

        // Handle banner image upload
        if ($request->hasFile('banner_image')) {
            $data['banner_image'] = $this->blogService->uploadBannerImage($request->file('banner_image'));
        }

        // Handle OG image upload
        if ($request->hasFile('og_image')) {
            $data['og_image'] = $this->blogService->uploadOgImage($request->file('og_image'));
        }

        $blog = $this->blogService->createBlog($data);

        return redirect()->route('admin.blogs.edit', $blog->id)
                       ->with('success', 'Blog created successfully!');
    }

    /**
     * Display the specified resource.
     */
    public function show(Blog $blog)
    {
        return view('admin.blogs.show', compact('blog'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Blog $blog)
    {
        $categories = BlogCategory::active()->get();
        $tags = BlogTag::active()->get();
        $authors = \App\Models\User::where('usertype', '<=', 1)->get();

        return view('admin.blogs.edit', compact('blog', 'categories', 'tags', 'authors'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreBlogRequest $request, Blog $blog)
    {
        $data = $request->validated();

        // Handle featured image upload
        if ($request->hasFile('featured_image')) {
            $data['featured_image'] = $this->blogService->uploadFeaturedImage($request->file('featured_image'), $blog);
        }

        // Handle banner image upload
        if ($request->hasFile('banner_image')) {
            $data['banner_image'] = $this->blogService->uploadBannerImage($request->file('banner_image'), $blog);
        }

        // Handle OG image upload
        if ($request->hasFile('og_image')) {
            $data['og_image'] = $this->blogService->uploadOgImage($request->file('og_image'), $blog);
        }

        $this->blogService->updateBlog($blog, $data);

        return redirect()->route('admin.blogs.edit', $blog->id)
                       ->with('success', 'Blog updated successfully!');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Blog $blog)
    {
        $this->blogService->deleteBlog($blog);

        return redirect()->route('admin.blogs.index')
                       ->with('success', 'Blog deleted successfully!');
    }

    /**
     * Toggle blog featured status
     */
    public function toggleFeatured(Request $request)
    {
        $blog = Blog::findOrFail($request->blog_id);
        $blog->update(['is_featured' => !$blog->is_featured]);

        return response()->json(['success' => true, 'is_featured' => $blog->is_featured]);
    }

    /**
     * Publish blog
     */
    public function publish(Blog $blog)
    {
        $this->blogService->publishBlog($blog);

        return redirect()->route('admin.blogs.edit', $blog->id)
                       ->with('success', 'Blog published successfully!');
    }

    /**
     * Archive blog
     */
    public function archive(Blog $blog)
    {
        $this->blogService->archiveBlog($blog);

        return redirect()->route('admin.blogs.index')
                       ->with('success', 'Blog archived successfully!');
    }

    /**
     * Clone blog
     */
    public function clone(Blog $blog)
    {
        $newBlog = $this->blogService->cloneBlog($blog);

        return redirect()->route('admin.blogs.edit', $newBlog->id)
                       ->with('success', 'Blog cloned successfully! Edit as needed.');
    }
}
