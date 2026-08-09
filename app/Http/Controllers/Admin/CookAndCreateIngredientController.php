<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CcIngredient;
use Illuminate\Http\Request;

class CookAndCreateIngredientController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:admin');
    }

    public function index()
    {
        $ingredients = CcIngredient::orderBy('name')->get();
        return view('admin.cook-and-create.ingredients.index', compact('ingredients'));
    }

    public function create()
    {
        return view('admin.cook-and-create.ingredients.create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'image' => 'nullable|image|max:2048',
            'is_absurd' => 'boolean',
            'status' => 'required|in:active,inactive',
        ]);

        $validated['is_absurd'] = $request->has('is_absurd');
        $validated['activity_id'] = 2; // Cook & Create's fixed activity id, matching the Node API's default

        if ($request->hasFile('image')) {
            $validated['image_url'] = $request->file('image')->store('cook-and-create/ingredients', 'public');
        }

        CcIngredient::create($validated);

        return redirect()->route('admin.cook-and-create.ingredients.index')->with('success', 'Ingredient created.');
    }

    public function edit(CcIngredient $ingredient)
    {
        return view('admin.cook-and-create.ingredients.edit', compact('ingredient'));
    }

    public function update(Request $request, CcIngredient $ingredient)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'image' => 'nullable|image|max:2048',
            'is_absurd' => 'boolean',
            'status' => 'required|in:active,inactive',
        ]);

        $validated['is_absurd'] = $request->has('is_absurd');

        if ($request->hasFile('image')) {
            $validated['image_url'] = $request->file('image')->store('cook-and-create/ingredients', 'public');
        }

        $ingredient->update($validated);

        return redirect()->route('admin.cook-and-create.ingredients.index')->with('success', 'Ingredient updated.');
    }

    public function destroy(CcIngredient $ingredient)
    {
        $ingredient->delete();
        return redirect()->route('admin.cook-and-create.ingredients.index')->with('success', 'Ingredient deleted.');
    }
}
