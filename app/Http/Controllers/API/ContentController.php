<?php

namespace App\Http\Controllers\API;

use App\Models\Blog;
use App\Models\CmsPage;
use App\Models\Faq;
use App\Http\Resources\API\BlogResource;
use App\Http\Resources\API\PageResource;
use App\Http\Resources\API\FaqResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ContentController extends BaseController
{
    public function getPages()
    {
        try {
            $pages = Cache::remember('api_pages', 3600, function () {
                return CmsPage::where('status', 'active')->get();
            });
            return $this->successResponse(PageResource::collection($pages), 'Pages fetched successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to fetch pages', ['error' => $e->getMessage()]);
        }
    }

    public function getPageBySlug($slug)
    {
        try {
            $page = Cache::remember('api_page_' . $slug, 3600, function () use ($slug) {
                return CmsPage::where('slug', $slug)->where('status', 'active')->first();
            });
            if (!$page) return $this->errorResponse('Page not found', [], 404);
            return $this->successResponse(new PageResource($page), 'Page details fetched successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to fetch page details', ['error' => $e->getMessage()]);
        }
    }

    public function getBlogs()
    {
        try {
            $blogs = Cache::remember('api_blogs', 3600, function () {
                return Blog::with(['category', 'author'])->where('status', 'active')->latest()->get();
            });
            return $this->successResponse(BlogResource::collection($blogs), 'Blogs fetched successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to fetch blogs', ['error' => $e->getMessage()]);
        }
    }

    public function getBlogBySlug($slug)
    {
        try {
            $blog = Cache::remember('api_blog_' . $slug, 3600, function () use ($slug) {
                return Blog::with(['category', 'author'])->where('slug', $slug)->where('status', 'active')->first();
            });
            if (!$blog) return $this->errorResponse('Blog not found', [], 404);
            return $this->successResponse(new BlogResource($blog), 'Blog details fetched successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to fetch blog details', ['error' => $e->getMessage()]);
        }
    }

    public function getFaqs()
    {
        try {
            $faqs = Cache::remember('api_faqs', 3600, function () {
                return Faq::with('category')->where('status', 'active')->get();
            });
            return $this->successResponse(FaqResource::collection($faqs), 'FAQs fetched successfully');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to fetch FAQs', ['error' => $e->getMessage()]);
        }
    }
}
