<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $template->name }} - Email Template Preview</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            border-bottom: 2px solid #007bff;
            margin-bottom: 20px;
            padding-bottom: 15px;
        }
        .header h1 {
            margin: 0;
            color: #333;
            font-size: 24px;
        }
        .subject-box {
            background-color: #e7f3ff;
            border-left: 4px solid #007bff;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 4px;
        }
        .subject-box label {
            font-weight: bold;
            color: #007bff;
            display: block;
            font-size: 12px;
            margin-bottom: 5px;
        }
        .subject-box p {
            margin: 0;
            color: #333;
            font-size: 16px;
        }
        .email-body {
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            padding: 20px;
            border-radius: 4px;
            line-height: 1.6;
        }
        .info-box {
            background-color: #fff3cd;
            border: 1px solid #ffc107;
            border-radius: 4px;
            padding: 12px;
            margin-top: 20px;
            font-size: 12px;
        }
        .info-box strong {
            color: #856404;
        }
        .variables {
            margin-top: 10px;
        }
        .variables span {
            display: inline-block;
            background-color: #ffc107;
            color: #333;
            padding: 3px 8px;
            margin-right: 5px;
            border-radius: 3px;
            font-family: monospace;
            font-size: 11px;
            margin-bottom: 5px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
        }
        .status-badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 12px;
            margin-top: 10px;
        }
        .status-active {
            background-color: #28a745;
            color: white;
        }
        .status-inactive {
            background-color: #6c757d;
            color: white;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{ $template->name }}</h1>
            <p style="color: #666; margin: 10px 0 0 0; font-size: 14px;">
                {{ $template->description }}
            </p>
            <span class="status-badge {{ $template->status == 1 ? 'status-active' : 'status-inactive' }}">
                {{ $template->status_label }}
            </span>
        </div>

        <div class="subject-box">
            <label>EMAIL SUBJECT</label>
            <p>{{ $template->subject }}</p>
        </div>

        <div class="email-body">
            {!! $template->body !!}
        </div>

        @if($template->variables && !empty($template->variables))
            <div class="info-box">
                <strong>Available Variables in this template:</strong>
                <div class="variables">
                    @foreach($template->variables as $var)
                        <span>{{{ $var }}}</span>
                    @endforeach
                </div>
            </div>
        @endif

        <div class="footer">
            <p>
                <strong>Template Slug:</strong> {{ $template->slug }}<br>
                <strong>Usage Count:</strong> {{ $template->usage_count }} times<br>
                @if($template->last_used_at)
                    <strong>Last Used:</strong> {{ $template->last_used_at->format('d M Y H:i:s') }}<br>
                @endif
                <strong>Created:</strong> {{ $template->created_at->format('d M Y H:i:s') }}<br>
                <strong>Last Modified:</strong> {{ $template->updated_at->format('d M Y H:i:s') }}
            </p>
        </div>
    </div>
</body>
</html>
