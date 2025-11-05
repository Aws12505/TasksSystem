{{-- resources/views/pdf/clocking-overview.blade.php --}}

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Clocking Records Overview</title>
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

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Anek Telugu', ui-sans-serif, sans-serif;
            font-size: 13px;
            color: var(--foreground);
            background-color: var(--background);
            line-height: 1.6;
            padding: 20px;
        }

        .container { max-width: 1000px; margin: 0 auto; }

        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 30px;
            background: var(--card);
            border-radius: var(--radius);
            box-shadow: var(--shadow-lg);
            border: 1px solid var(--border);
        }

        .header h1 {
            font-size: 28px;
            color: var(--primary);
            margin-bottom: 15px;
        }

        .header .subtitle {
            font-size: 12px;
            color: var(--muted-foreground);
            margin-bottom: 6px;
        }

        .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 40px;
        }

        .summary-card {
            padding: 20px;
            text-align: center;
            background: var(--card);
            border-radius: var(--radius);
            box-shadow: var(--shadow-lg);
            border: 1px solid var(--border);
        }

        .summary-card .label {
            font-size: 11px;
            color: var(--muted-foreground);
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .summary-card .value {
            font-size: 18px;
            font-weight: bold;
            color: var(--primary);
        }

        .analytics-table {
            width: 100%;
            border-collapse: collapse;
            background: var(--card);
            border-radius: var(--radius);
            overflow: hidden;
            border: 1px solid var(--border);
            box-shadow: var(--shadow-lg);
        }

        .analytics-table th {
            background: var(--primary);
            color: var(--primary-foreground);
            padding: 12px 10px;
            text-align: left;
            font-weight: bold;
            font-size: 11px;
        }

        .analytics-table td {
            padding: 12px 10px;
            border-bottom: 1px solid var(--border);
            font-size: 11px;
        }

        .analytics-table tr:nth-child(even) td {
            background: rgba(255, 255, 255, 0.03);
        }

        .employee-cell {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .table-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid var(--primary);
        }

        .avatar-fallback {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: var(--primary);
            color: var(--primary-foreground);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: bold;
        }

        .employee-name {
            font-weight: bold;
            color: var(--foreground);
        }

        .employee-email {
            font-size: 10px;
            color: var(--muted-foreground);
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

        .footer-note {
            margin-top: 30px;
            padding: 20px;
            background: var(--card);
            border-radius: var(--radius);
            box-shadow: var(--shadow-lg);
            border-left: 4px solid var(--primary);
            text-align: center;
            font-size: 10px;
            color: var(--muted-foreground);
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>Clocking Records Overview Report</h1>
            <div class="subtitle">Employee Analytics Summary</div>
            @if(!empty($filters['start_date']) || !empty($filters['end_date']))
                <div class="subtitle">
                    Period: {{ $filters['start_date'] ?? 'All' }} to {{ $filters['end_date'] ?? 'All' }}
                </div>
            @endif
            <div class="subtitle">Generated: {{ now()->format('F d, Y') }}</div>
        </div>

        <!-- Summary Totals -->
        <div class="summary-grid">
            <div class="summary-card">
                <div class="label">Employees</div>
                <div class="value">{{ $totals['employees_count'] }}</div>
            </div>
            <div class="summary-card">
                <div class="label">Total Sessions</div>
                <div class="value">{{ $totals['total_sessions'] }}</div>
            </div>
            <div class="summary-card">
                <div class="label">Total Work Time</div>
                <div class="value">{{ $totals['work_duration'] }}</div>
            </div>
            <div class="summary-card">
                <div class="label">Total Break Time</div>
                <div class="value">{{ $totals['break_duration'] }}</div>
            </div>
        </div>

        <!-- Analytics Per Employee -->
        @if(count($userAnalytics) > 0)
            <table class="analytics-table">
                <thead>
                    <tr>
                        <th>Employee</th>
                        <th>Sessions</th>
                        <th>Work Time</th>
                        <th>Break Time</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($userAnalytics as $analytic)
                        <tr>
                            <td>
                                <div class="employee-cell">
                                    @if (!empty($analytic['avatar_local_path']))
                                        <img src="{{ $analytic['avatar_local_path'] }}" class="table-avatar" />
                                    @else
                                        <div class="avatar-fallback">
                                            {{ strtoupper(substr($analytic['user_name'], 0, 1)) }}
                                        </div>
                                    @endif
                                    <div>
                                        <div class="employee-name">{{ $analytic['user_name'] }}</div>
                                        <div class="employee-email">{{ $analytic['user_email'] }}</div>
                                    </div>
                                </div>
                            </td>
                            <td>{{ $analytic['total_sessions'] }}</td>
                            <td class="work-time">{{ $analytic['total_work_duration'] }}</td>
                            <td class="break-time">{{ $analytic['total_break_duration'] }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @else
            <div style="text-align: center; padding: 40px; color: var(--muted-foreground);">
                <p>No records found.</p>
            </div>
        @endif

        <!-- Footer -->
        <div class="footer-note">
            <p>This is an automatically generated analytics report.</p>
            <p>Generated: {{ now()->format('F d, Y') }}</p>
        </div>
    </div>
</body>
</html>
