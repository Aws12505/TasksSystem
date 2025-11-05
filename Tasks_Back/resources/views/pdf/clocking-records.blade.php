{{-- resources/views/pdf/clocking-records.blade.php --}}

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $user->name }} - Clocking Records Report</title>
    <style>
        :root {
            --background: #1c1917;
            --foreground: #f8fafc;
            --card: #262321;
            --primary: #e53e3e;
            --primary-foreground: #1c1917;
            --muted-foreground: #a1a1aa;
            --border: #44403c;
            --chart-2: #f59e0b;
            --chart-3: #34d399;
            --radius: 0.725rem;
            --shadow-lg: 0px 4px 12px -4px hsl(0 0% 0% / 0.25);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Anek Telugu', ui-sans-serif, sans-serif, system-ui;
            font-size: 13px;
            color: var(--foreground);
            background-color: var(--background);
            line-height: 1.6;
            padding: 20px;
        }

        .container {
            max-width: 1000px;
            margin: 0 auto;
        }

        .header {
            background: linear-gradient(135deg, var(--primary) 0%, #c53030 100%);
            color: var(--primary-foreground);
            padding: 40px 30px;
            margin-bottom: 30px;
            border-radius: var(--radius);
            text-align: center;
            box-shadow: var(--shadow-lg);
        }

        .avatar-container {
            margin-bottom: 20px;
            display: flex;
            justify-content: center;
        }

        .avatar {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            object-fit: cover;
            border: 4px solid var(--primary-foreground);
            box-shadow: var(--shadow-lg);
        }

        .avatar-fallback {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: #450a0a;
            color: var(--primary-foreground);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            font-weight: bold;
            border: 4px solid var(--primary-foreground);
            box-shadow: var(--shadow-lg);
        }

        .header h1 {
            font-size: 32px;
            margin-bottom: 10px;
        }

        .header .subtitle {
            font-size: 14px;
            opacity: 0.9;
            margin-bottom: 5px;
        }

        .info-card {
            background: var(--card);
            padding: 25px;
            border-radius: var(--radius);
            margin-bottom: 25px;
            border: 1px solid var(--border);
            box-shadow: var(--shadow-lg);
        }

        .info-card h3 {
            margin-bottom: 15px;
            color: var(--primary);
            font-size: 16px;
        }

        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            padding-bottom: 8px;
            border-bottom: 1px solid var(--border);
            font-size: 12px;
        }

        .info-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }

        .info-label {
            color: var(--muted-foreground);
        }

        .info-value {
            color: var(--foreground);
            font-weight: bold;
        }

        .detail-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            box-shadow: var(--shadow-lg);
            border-radius: var(--radius);
            overflow: hidden;
        }

        .detail-table th {
            background: var(--primary);
            color: var(--primary-foreground);
            padding: 12px 10px;
            text-align: left;
            font-weight: bold;
            font-size: 11px;
        }

        .detail-table td {
            padding: 10px;
            border-bottom: 1px solid var(--border);
            background: var(--card);
            font-size: 11px;
        }

        .detail-table tr:nth-child(even) td {
            background: rgba(255, 255, 255, 0.03);
        }

        .time-badge {
            background: var(--chart-3);
            color: var(--primary-foreground);
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 11px;
            font-weight: bold;
            display: inline-block;
        }

        .work-time {
            color: var(--chart-3);
            font-weight: bold;
            font-family: monospace;
        }

        .break-time {
            color: var(--chart-2);
            font-weight: bold;
            font-family: monospace;
        }

        .status-completed {
            background: rgba(52, 211, 153, 0.2);
            color: var(--chart-3);
            padding: 3px 6px;
            border-radius: 3px;
            font-size: 10px;
        }

        .status-active {
            background: rgba(245, 158, 11, 0.2);
            color: var(--chart-2);
            padding: 3px 6px;
            border-radius: 3px;
            font-size: 10px;
        }

        .summary-section {
            background: var(--card);
            padding: 25px;
            border-radius: var(--radius);
            border: 1px solid var(--border);
            box-shadow: var(--shadow-lg);
            margin-bottom: 25px;
        }

        .summary-section h3 {
            margin-bottom: 20px;
            color: var(--primary);
            font-size: 16px;
            border-bottom: 2px solid var(--border);
            padding-bottom: 12px;
        }

        .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid var(--border);
            font-size: 13px;
        }

        .summary-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }

        .summary-label {
            color: var(--muted-foreground);
        }

        .summary-value {
            font-weight: bold;
            color: var(--chart-3);
        }

        .footer-note {
            margin-top: 30px;
            padding: 20px;
            background: var(--card);
            border-radius: var(--radius);
            box-shadow: var(--shadow-lg);
            border-left: 4px solid var(--primary);
            text-align: center;
            font-size: 11px;
            color: var(--muted-foreground);
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header with Avatar -->
        <div class="header">
            <div class="avatar-container">
                @if (!empty($avatar_local_path))
                    <img src="{{ $avatar_local_path }}" class="avatar" />
                @else
                    <div class="avatar-fallback">
                        {{ strtoupper(substr($user->name, 0, 1)) }}
                    </div>
                @endif
            </div>
            <h1>Clocking Records Report</h1>
            <div class="subtitle">{{ $user->name }}</div>
            <div class="subtitle">{{ $user->email }}</div>
            <div class="subtitle">Generated: {{ now()->format('F d, Y') }}</div>
        </div>

        <!-- User Info Card -->
        <div class="info-card">
            <h3>Employee Information</h3>
            <div class="info-row">
                <span class="info-label">Name:</span>
                <span class="info-value">{{ $user->name }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value">{{ $user->email }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Company Timezone:</span>
                <span class="info-value">{{ $companyTimezone }}</span>
            </div>
            @if(!empty($filters['start_date']) || !empty($filters['end_date']))
                <div class="info-row">
                    <span class="info-label">Date Range:</span>
                    <span class="info-value">
                        {{ $filters['start_date'] ?? 'All' }} to {{ $filters['end_date'] ?? 'All' }}
                    </span>
                </div>
            @endif
        </div>

        <!-- Records Table -->
        @if(count($sessions) > 0)
            <table class="detail-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Clock In</th>
                        <th>Clock Out</th>
                        <th>Work Time</th>
                        <th>Break Time</th>
                        <th>Breaks</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($sessions as $session)
                        <tr>
                            <td>{{ $session['session_date'] }}</td>
                            <td><span class="time-badge">{{ $session['clock_in'] }}</span></td>
                            <td><span class="time-badge">{{ $session['clock_out'] }}</span></td>
                            <td class="work-time">{{ $session['work_duration'] }}</td>
                            <td class="break-time">{{ $session['break_duration'] }}</td>
                            <td style="text-align: center;">{{ $session['breaks_count'] }}</td>
                            <td>
                                <span class="@if($session['status'] === 'completed') status-completed @elseif($session['status'] === 'active') status-active @endif">
                                    {{ ucfirst(str_replace('_', ' ', $session['status'])) }}
                                </span>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>

            <!-- Summary Section -->
            <div class="summary-section">
                <h3>Summary</h3>
                <div class="summary-row">
                    <span class="summary-label">Total Records:</span>
                    <span class="summary-value">{{ $totals['records_count'] }}</span>
                </div>
                <div class="summary-row">
                    <span class="summary-label">Total Work Time:</span>
                    <span class="summary-value">{{ $totals['work_duration'] }}</span>
                </div>
                <div class="summary-row">
                    <span class="summary-label">Total Break Time:</span>
                    <span class="summary-value">{{ $totals['break_duration'] }}</span>
                </div>
            </div>
        @else
            <div style="text-align: center; padding: 40px; color: var(--muted-foreground);">
                <p>No clocking records found for the specified filters.</p>
            </div>
        @endif

        <!-- Footer -->
        <div class="footer-note">
            <p>This is an automatically generated report. For questions, please contact your manager.</p>
            <p>Generated: {{ now()->format('F d, Y') }}</p>
        </div>
    </div>
</body>
</html>
