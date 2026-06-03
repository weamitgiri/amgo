<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreEmailTemplateRequest;
use App\Models\EmailTemplate;
use Illuminate\Http\Request;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Yajra\DataTables\Facades\DataTables;
use Exception;

class EmailTemplateController extends Controller
{
    private $emailTemplate;

    public function __construct(EmailTemplate $emailTemplate)
    {
        $this->emailTemplate = $emailTemplate;
    }

    /**
     * Display a listing of email templates.
     */
    public function index(Request $request)
    {
        if (!$this->checkPermission('admin.email-templates.index')) {
            return redirect('admin/dashboard')->with('error', 'Unauthorized access');
        }

        if ($request->ajax()) {
            $templates = $this->emailTemplate->query();

            if (!empty($request->search['value'])) {
                $search = $request->search['value'];
                $templates->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%")
                        ->orWhere('subject', 'like', "%{$search}%");
                });
            }

            if (!empty($request->status)) {
                $templates->where('status', $request->status);
            }

            $templates->orderBy('id', 'desc');

            return DataTables::of($templates)
                ->addIndexColumn()
                ->addColumn('created_date', function ($template) {
                    return date('d M Y h:i A', strtotime($template->created_at));
                })
                ->addColumn('creator', function ($template) {
                    return $template->creator ? $template->creator->name : 'System';
                })
                ->addColumn('usage', function ($template) {
                    return '<div>
                        <strong>' . $template->usage_count . '</strong> uses<br>
                        <small class="text-muted">
                            ' . ($template->last_used_at ? $template->last_used_at->diffForHumans() : 'Never') . '
                        </small>
                    </div>';
                })
                ->addColumn('status', function ($template) {
                    $checked = $template->status == 1 ? 'checked' : '';
                    return '<div class="custom-control custom-switch">
                        <input type="checkbox" class="custom-control-input status-toggle" 
                               data-id="' . $template->id . '" id="status' . $template->id . '" ' . $checked . '>
                        <label class="custom-control-label" for="status' . $template->id . '"></label>
                    </div>';
                })
                ->addColumn('actions', function ($template) {
                    $actions = '';
                    if ($this->checkPermission('admin.email-templates.edit')) {
                        $actions .= '<a href="' . route('admin.email-templates.edit', encrypt($template->id)) . '" 
                                      class="btn btn-sm btn-outline-info" title="Edit">
                                      <i class="fa fa-edit"></i>
                                    </a>';
                    }
                    if ($this->checkPermission('admin.email-templates.show')) {
                        $actions .= '<a href="' . route('admin.email-templates.show', encrypt($template->id)) . '" 
                                      class="btn btn-sm btn-outline-primary" title="View" target="_blank">
                                      <i class="fa fa-eye"></i>
                                    </a>';
                    }
                    if ($this->checkPermission('admin.email-templates.destroy')) {
                        $actions .= '<form method="POST" style="display:inline;" 
                                      action="' . route('admin.email-templates.destroy', $template->id) . '">
                                      <input type="hidden" name="_method" value="DELETE">
                                      <input type="hidden" name="_token" value="' . csrf_token() . '">
                                      <button type="submit" class="btn btn-sm btn-outline-danger delete-confirm" 
                                              title="Delete"><i class="fa fa-trash"></i>
                                      </button>
                                    </form>';
                    }
                    return $actions;
                })
                ->rawColumns(['actions', 'status', 'usage'])
                ->make(true);
        }

        return view('admin.email-templates.index');
    }

    /**
     * Show the form for creating a new email template.
     */
    public function create()
    {
        if (!$this->checkPermission('admin.email-templates.create')) {
            return redirect('admin/dashboard')->with('error', 'Unauthorized access');
        }

        $defaultTemplates = [
            'welcome' => 'Welcome Email',
            'email_verification' => 'Email Verification',
            'password_reset' => 'Password Reset',
            'account_activated' => 'Account Activated',
            'password_changed' => 'Password Changed',
            'contact_reply' => 'Contact Form Reply',
            'notification' => 'General Notification',
        ];

        return view('admin.email-templates.create', compact('defaultTemplates'));
    }

    /**
     * Store a newly created email template.
     */
    public function store(StoreEmailTemplateRequest $request)
    {
        if (!$this->checkPermission('admin.email-templates.create')) {
            return redirect('admin/dashboard')->with('error', 'Unauthorized access');
        }

        try {
            $data = $request->validated();

            // Parse variables from body (look for {variable} patterns)
            preg_match_all('/\{(\w+)\}/', $data['body'] . ' ' . $data['subject'], $matches);
            $variables = array_unique($matches[1] ?? []);
            $data['variables'] = !empty($variables) ? array_values($variables) : null;

            $data['created_by'] = Auth::guard('admin')->id();

            EmailTemplate::create($data);

            return redirect('admin/email-templates')->with('success', 'Email template created successfully.');
        } catch (Exception $e) {
            return back()->with('error', 'Error creating email template: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Display the specified email template.
     */
    public function show($id)
    {
        try {
            $id = decrypt($id);
            $template = EmailTemplate::findOrFail($id);

            return view('admin.email-templates.show', compact('template'));
        } catch (DecryptException $e) {
            return redirect('admin/email-templates')->with('error', 'Invalid template ID');
        }
    }

    /**
     * Show the form for editing the specified email template.
     */
    public function edit($id)
    {
        if (!$this->checkPermission('admin.email-templates.edit')) {
            return redirect('admin/dashboard')->with('error', 'Unauthorized access');
        }

        try {
            $id = decrypt($id);
            $template = EmailTemplate::findOrFail($id);

            $defaultTemplates = [
                'welcome' => 'Welcome Email',
                'email_verification' => 'Email Verification',
                'password_reset' => 'Password Reset',
                'account_activated' => 'Account Activated',
                'password_changed' => 'Password Changed',
                'contact_reply' => 'Contact Form Reply',
                'notification' => 'General Notification',
            ];

            return view('admin.email-templates.edit', compact('template', 'defaultTemplates'));
        } catch (DecryptException $e) {
            return redirect('admin/email-templates')->with('error', 'Invalid template ID');
        }
    }

    /**
     * Update the specified email template.
     */
    public function update(StoreEmailTemplateRequest $request, $id)
    {
        if (!$this->checkPermission('admin.email-templates.edit')) {
            return redirect('admin/dashboard')->with('error', 'Unauthorized access');
        }

        try {
            $id = decrypt($id);
            $template = EmailTemplate::findOrFail($id);

            $data = $request->validated();

            // Parse variables from body (look for {variable} patterns)
            preg_match_all('/\{(\w+)\}/', $data['body'] . ' ' . $data['subject'], $matches);
            $variables = array_unique($matches[1] ?? []);
            $data['variables'] = !empty($variables) ? array_values($variables) : null;

            $data['updated_by'] = Auth::guard('admin')->id();

            $template->update($data);

            return redirect('admin/email-templates')->with('success', 'Email template updated successfully.');
        } catch (DecryptException $e) {
            return redirect('admin/email-templates')->with('error', 'Invalid template ID');
        } catch (Exception $e) {
            return back()->with('error', 'Error updating email template: ' . $e->getMessage())->withInput();
        }
    }

    /**
     * Delete the specified email template.
     */
    public function destroy($id)
    {
        if (!$this->checkPermission('admin.email-templates.destroy')) {
            return redirect('admin/dashboard')->with('error', 'Unauthorized access');
        }

        try {
            $template = EmailTemplate::findOrFail($id);
            $template->delete();

            return back()->with('success', 'Email template deleted successfully.');
        } catch (Exception $e) {
            return back()->with('error', 'Error deleting email template');
        }
    }

    /**
     * Toggle email template status via AJAX.
     */
    public function toggleStatus(Request $request)
    {
        if ($request->ajax()) {
            $validator = Validator::make($request->all(), [
                'id' => 'required|exists:email_templates,id',
                'status' => 'required|in:0,1',
            ]);

            if ($validator->fails()) {
                return response()->json(['error' => true, 'message' => 'Invalid request'], 422);
            }

            try {
                $template = EmailTemplate::findOrFail($request->id);

                if ($request->status == 1) {
                    $template->activate();
                } else {
                    $template->deactivate();
                }

                return response()->json(['error' => false, 'message' => 'Status updated successfully']);
            } catch (Exception $e) {
                return response()->json(['error' => true, 'message' => 'Error updating status'], 500);
            }
        }

        return response()->json(['error' => true, 'message' => 'Invalid request'], 400);
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
