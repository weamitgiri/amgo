<?php

namespace App\Http\Resources\API;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BlogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'short_description' => $this->short_description,
            'content' => $this->content,
            'thumbnail' => $this->thumbnail ? asset('storage/' . $this->thumbnail) : null,
            'banner' => $this->banner_image ? asset('storage/' . $this->banner_image) : null,
            'category' => $this->category?->name,
            'author' => $this->author?->name,
            'published_at' => $this->created_at->format('d M Y'),
        ];
    }
}
