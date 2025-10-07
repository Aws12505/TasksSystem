<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Final Ratings Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 11px;
            color: #333;
            line-height: 1.4;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #2563eb;
        }

        .header h1 {
            font-size: 24px;
            color: #1e40af;
            margin-bottom: 10px;
        }

        .header .subtitle {
            font-size: 14px;
            color: #64748b;
            margin-bottom: 5px;
        }

        .info-grid {
            display: table;
            width: 100%;
            margin-bottom: 20px;
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
        }

        .info-item {
            display: table-row;
        }

        .info-label {
            display: table-cell;
            font-weight: bold;
            padding: 5px 10px;
            width: 40%;
            color: #475569;
        }

        .info-value {
            display: table-cell;
            padding: 5px 10px;
            color: #1e293b;
        }

        .summary-grid {
            display: table;
            width: 100%;
            margin-bottom: 25px;
        }

        .summary-card {
            display: table-cell;
            width: 33.33%;
            padding: 15px;
            text-align: center;
            border: 2px solid #e2e8f0;
            background: #f1f5f9;
        }

        .summary-card .label {
            font-size: 10px;
            color: #64748b;
            margin-bottom: 5px;
            text-transform: uppercase;
        }

        .summary-card .value {
            font-size: 20px;
            font-weight: bold;
            color: #1e40af;
        }

        .user-section {
            margin-bottom: 30px;
            page-break-inside: avoid;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            overflow: hidden;
        }

        .user-header {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            padding: 15px;
        }

        .user-header h2 {
            font-size: 18px;
            margin-bottom: 5px;
        }

        .user-header .percentage {
            font-size: 24px;
            font-weight: bold;
        }

        .user-body {
            padding: 15px;
        }

        .points-summary {
            background: #f8fafc;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 15px;
            display: table;
            width: 100%;
        }

        .points-row {
            display: table-row;
        }

        .points-label {
            display: table-cell;
            padding: 4px 0;
            color: #64748b;
        }

        .points-value {
            display: table-cell;
            text-align: right;
            font-weight: bold;
            color: #1e293b;
            padding: 4px 0;
        }

        .points-value.positive {
            color: #16a34a;
        }

        .points-value.negative {
            color: #dc2626;
        }

        .component-section {
            margin-bottom: 20px;
        }

        .component-title {
            font-size: 14px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 10px;
            padding-bottom: 5px;
            border-bottom: 2px solid #e2e8f0;
        }

        .detail-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 9px;
        }

        .detail-table th {
            background: #f1f5f9;
            color: #475569;
            padding: 8px;
            text-align: left;
            font-weight: bold;
            border-bottom: 2px solid #cbd5e1;
        }

        .detail-table td {
            padding: 6px 8px;
            border-bottom: 1px solid #e2e8f0;
        }

        .detail-table tr:last-child td {
            border-bottom: none;
        }

        .calculation {
            font-family: 'Courier New', monospace;
            font-size: 8px;
            color: #64748b;
            background: #f8fafc;
            padding: 3px 5px;
            border-radius: 3px;
        }

        .badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 9px;
            font-weight: bold;
        }

        .badge-success {
            background: #dcfce7;
            color: #166534;
        }

        .badge-warning {
            background: #fef3c7;
            color: #92400e;
        }

        .badge-danger {
            background: #fee2e2;
            color: #991b1b;
        }

        .footer {
            position: fixed;
            bottom: 0;
            width: 100%;
            text-align: center;
            font-size: 9px;
            color: #94a3b8;
            padding: 10px 0;
            border-top: 1px solid #e2e8f0;
        }

        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <h1>Final Performance Ratings Report</h1>
        <div class="subtitle">
            Period: {{ \Carbon\Carbon::parse($data['period']['start'])->format('F d, Y') }} - 
            {{ \Carbon\Carbon::parse($data['period']['end'])->format('F d, Y') }}
        </div>
        <div class="subtitle">Configuration: {{ $data['config']['name'] }}</div>
        <div class="subtitle">Generated: {{ \Carbon\Carbon::parse($data['calculated_at'])->format('F d, Y g:i A') }}</div>
    </div>

    <!-- Summary Info -->
    <div class="info-grid">
        <div class="info-item">
            <div class="info-label">Calculation Period:</div>
            <div class="info-value">
                {{ \Carbon\Carbon::parse($data['period']['start'])->format('M d, Y') }} to 
                {{ \Carbon\Carbon::parse($data['period']['end'])->format('M d, Y') }}
            </div>
        </div>
        <div class="info-item">
            <div class="info-label">Max Points for 100%:</div>
            <div class="info-value">{{ number_format($data['max_points_for_100_percent'], 2) }} points</div>
        </div>
        <div class="info-item">
            <div class="info-label">Total Employees Rated:</div>
            <div class="info-value">{{ count($data['users']) }} employees</div>
        </div>
        <div class="info-item">
            <div class="info-label">Configuration Used:</div>
            <div class="info-value">{{ $data['config']['name'] }}</div>
        </div>
    </div>

    <!-- Summary Statistics -->
    <div class="summary-grid">
        <div class="summary-card">
            <div class="label">Employees Rated</div>
            <div class="value">{{ count($data['users']) }}</div>
        </div>
        <div class="summary-card">
            <div class="label">Average Rating</div>
            <div class="value">
                {{ number_format(collect($data['users'])->avg('final_percentage'), 1) }}%
            </div>
        </div>
        <div class="summary-card">
            <div class="label">Top Performer</div>
            <div class="value">
                {{ collect($data['users'])->sortByDesc('final_percentage')->first()['final_percentage'] }}%
            </div>
        </div>
    </div>

    <!-- Employee Details -->
    @foreach(collect($data['users'])->sortByDesc('final_percentage') as $index => $user)
        @if($index > 0)
            <div class="page-break"></div>
        @endif

        <div class="user-section">
            <div class="user-header">
                <h2>{{ $user['user_name'] }}</h2>
                <div style="font-size: 12px; margin-bottom: 5px;">{{ $user['user_email'] }}</div>
                <div class="percentage">{{ number_format($user['final_percentage'], 2) }}%</div>
                <div style="font-size: 11px;">
                    {{ number_format($user['total_points'], 2) }} / {{ number_format($user['max_points'], 2) }} points
                </div>
            </div>

            <div class="user-body">
                <!-- Points Summary -->
                <div class="points-summary">
                    @if($user['breakdown']['task_ratings']['enabled'])
                        <div class="points-row">
                            <div class="points-label">Task Ratings:</div>
                            <div class="points-value positive">
                                +{{ number_format($user['breakdown']['task_ratings']['value'], 2) }}
                            </div>
                        </div>
                    @endif

                    @if($user['breakdown']['stakeholder_ratings']['enabled'])
                        <div class="points-row">
                            <div class="points-label">Stakeholder Ratings:</div>
                            <div class="points-value positive">
                                +{{ number_format($user['breakdown']['stakeholder_ratings']['value'], 2) }}
                            </div>
                        </div>
                    @endif

                    @if($user['breakdown']['help_requests']['helper']['enabled'])
                        <div class="points-row">
                            <div class="points-label">Helped Others:</div>
                            <div class="points-value positive">
                                +{{ number_format($user['breakdown']['help_requests']['helper']['value'], 2) }}
                            </div>
                        </div>
                    @endif

                    @if($user['breakdown']['help_requests']['requester']['enabled'])
                        <div class="points-row">
                            <div class="points-label">Help Requests:</div>
                            <div class="points-value {{ $user['breakdown']['help_requests']['requester']['value'] < 0 ? 'negative' : '' }}">
                                {{ number_format($user['breakdown']['help_requests']['requester']['value'], 2) }}
                            </div>
                        </div>
                    @endif

                    @if($user['breakdown']['tickets_resolved']['enabled'])
                        <div class="points-row">
                            <div class="points-label">Tickets Resolved:</div>
                            <div class="points-value positive">
                                +{{ number_format($user['breakdown']['tickets_resolved']['value'], 2) }}
                            </div>
                        </div>
                    @endif

                    <div class="points-row" style="border-top: 2px solid #cbd5e1; margin-top: 5px; padding-top: 5px;">
                        <div class="points-label" style="font-weight: bold; color: #1e293b;">Total Points:</div>
                        <div class="points-value" style="font-size: 14px; color: #1e40af;">
                            {{ number_format($user['total_points'], 2) }}
                        </div>
                    </div>
                </div>

                <!-- Task Ratings Details -->
                @if($user['breakdown']['task_ratings']['enabled'] && count($user['breakdown']['task_ratings']['details']) > 0)
                    <div class="component-section">
                        <div class="component-title">Task Ratings Details ({{ $user['breakdown']['task_ratings']['tasks_included'] }} tasks)</div>
                        <table class="detail-table">
                            <thead>
                                <tr>
                                    <th style="width: 30%;">Task Name</th>
                                    <th style="width: 12%; text-align: center;">Rating</th>
                                    <th style="width: 12%; text-align: center;">Weight</th>
                                    <th style="width: 12%; text-align: center;">Your %</th>
                                    <th style="width: 22%;">Calculation</th>
                                    <th style="width: 12%; text-align: right;">Points</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($user['breakdown']['task_ratings']['details'] as $task)
                                    <tr>
                                        <td>{{ $task['task_name'] }}</td>
                                        <td style="text-align: center;">{{ $task['task_rating'] }}/100</td>
                                        <td style="text-align: center;">
                                            @if($task['task_weight'])
                                                {{ $task['task_weight'] }}/100
                                            @else
                                                -
                                            @endif
                                        </td>
                                        <td style="text-align: center;">
                                            @if($task['user_percentage'])
                                                {{ $task['user_percentage'] }}%
                                            @else
                                                -
                                            @endif
                                        </td>
                                        <td><div class="calculation">{{ $task['calculation'] }}</div></td>
                                        <td style="text-align: right; font-weight: bold; color: #16a34a;">
                                            +{{ number_format($task['contribution'], 2) }}
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                @endif

                <!-- Stakeholder Ratings Details -->
                @if($user['breakdown']['stakeholder_ratings']['enabled'] && count($user['breakdown']['stakeholder_ratings']['details']) > 0)
                    <div class="component-section">
                        <div class="component-title">Stakeholder Ratings Details ({{ $user['breakdown']['stakeholder_ratings']['projects_included'] }} projects)</div>
                        <table class="detail-table">
                            <thead>
                                <tr>
                                    <th style="width: 35%;">Project Name</th>
                                    <th style="width: 15%; text-align: center;">Rating</th>
                                    <th style="width: 15%; text-align: center;">Your %</th>
                                    <th style="width: 23%;">Calculation</th>
                                    <th style="width: 12%; text-align: right;">Points</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($user['breakdown']['stakeholder_ratings']['details'] as $project)
                                    <tr>
                                        <td>{{ $project['project_name'] }}</td>
                                        <td style="text-align: center;">{{ $project['stakeholder_rating'] }}/100</td>
                                        <td style="text-align: center;">
                                            @if($project['user_project_percentage'])
                                                {{ number_format($project['user_project_percentage'], 2) }}%
                                            @else
                                                -
                                            @endif
                                        </td>
                                        <td><div class="calculation">{{ $project['calculation'] }}</div></td>
                                        <td style="text-align: right; font-weight: bold; color: #16a34a;">
                                            +{{ number_format($project['contribution'], 2) }}
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                @endif

                <!-- Help Requests Details -->
                @if($user['breakdown']['help_requests']['helper']['enabled'] && $user['breakdown']['help_requests']['helper']['count'] > 0)
                    <div class="component-section">
                        <div class="component-title">Help Provided to Others</div>
                        <p style="padding: 8px; background: #f8fafc; border-radius: 4px;">
                            Helped colleagues <strong>{{ $user['breakdown']['help_requests']['helper']['count'] }}</strong> times
                            × {{ $user['breakdown']['help_requests']['helper']['points_per_help'] }} points each
                            = <strong style="color: #16a34a;">+{{ number_format($user['breakdown']['help_requests']['helper']['value'], 2) }} points</strong>
                            @if($user['breakdown']['help_requests']['helper']['capped'])
                                <span class="badge badge-warning">Capped at {{ $user['breakdown']['help_requests']['helper']['max_points'] }} points</span>
                            @endif
                        </p>
                    </div>
                @endif

                @if($user['breakdown']['help_requests']['requester']['enabled'] && count($user['breakdown']['help_requests']['requester']['breakdown']) > 0)
                    <div class="component-section">
                        <div class="component-title">Help Requested Penalties</div>
                        <table class="detail-table">
                            <thead>
                                <tr>
                                    <th style="width: 40%;">Request Type</th>
                                    <th style="width: 20%; text-align: center;">Count</th>
                                    <th style="width: 20%; text-align: center;">Per Request</th>
                                    <th style="width: 20%; text-align: right;">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                @foreach($user['breakdown']['help_requests']['requester']['breakdown'] as $type => $data)
                                    <tr>
                                        <td style="text-transform: capitalize;">{{ str_replace('_', ' ', $type) }}</td>
                                        <td style="text-align: center;">{{ $data['count'] }}</td>
                                        <td style="text-align: center;">{{ $data['penalty_per_request'] }}</td>
                                        <td style="text-align: right; font-weight: bold; color: #dc2626;">
                                            {{ number_format($data['total'], 2) }}
                                        </td>
                                    </tr>
                                @endforeach
                            </tbody>
                        </table>
                    </div>
                @endif

                <!-- Tickets Details -->
                @if($user['breakdown']['tickets_resolved']['enabled'] && $user['breakdown']['tickets_resolved']['count'] > 0)
                    <div class="component-section">
                        <div class="component-title">Tickets Resolved</div>
                        <p style="padding: 8px; background: #f8fafc; border-radius: 4px;">
                            Resolved <strong>{{ $user['breakdown']['tickets_resolved']['count'] }}</strong> tickets
                            × {{ $user['breakdown']['tickets_resolved']['points_per_ticket'] }} points each
                            = <strong style="color: #16a34a;">+{{ number_format($user['breakdown']['tickets_resolved']['value'], 2) }} points</strong>
                            @if($user['breakdown']['tickets_resolved']['capped'])
                                <span class="badge badge-warning">Capped at {{ $user['breakdown']['tickets_resolved']['max_points'] }} points</span>
                            @endif
                        </p>
                    </div>
                @endif
            </div>
        </div>
    @endforeach

    <div class="footer">
        Generated by Final Rating System on {{ \Carbon\Carbon::now()->format('F d, Y g:i A') }}, Made With ❤️ by R&D
    </div>
</body>
</html>
