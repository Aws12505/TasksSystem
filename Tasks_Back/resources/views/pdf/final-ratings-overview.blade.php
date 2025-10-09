<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Final Ratings Overview</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --background: #1c1917;
            --foreground: #f8fafc;
            --card: #262321;
            --card-foreground: #f8fafc;
            --popover: #262321;
            --popover-foreground: #f8fafc;
            --primary: #e53e3e;
            --primary-foreground: #1c1917;
            --secondary: #4a0404;
            --secondary-foreground: #fed7d7;
            --muted: #262321;
            --muted-foreground: #a1a1aa;
            --accent: #450a0a;
            --accent-foreground: #f8fafc;
            --destructive: #9b2c2c;
            --destructive-foreground: #f8fafc;
            --border: #44403c;
            --input: #44403c;
            --ring: #e53e3e;
            --chart-1: #e53e3e;
            --chart-2: #f59e0b;
            --chart-3: #34d399;
            --chart-4: #60a5fa;
            --chart-5: #a78bfa;
            --sidebar: #262321;
            --sidebar-foreground: #f8fafc;
            --sidebar-primary: #e53e3e;
            --sidebar-primary-foreground: #1c1917;
            --sidebar-accent: #450a0a;
            --sidebar-accent-foreground: #f8fafc;
            --sidebar-border: #44403c;
            --sidebar-ring: #e53e3e;
            --radius: 0.725rem;
            --shadow-2xs: 0px 4px 12px -4px hsl(0 0% 0% / 0.13);
            --shadow-xs: 0px 4px 12px -4px hsl(0 0% 0% / 0.13);
            --shadow-sm: 0px 4px 12px -4px hsl(0 0% 0% / 0.25), 0px 1px 2px -5px hsl(0 0% 0% / 0.25);
            --shadow: 0px 4px 12px -4px hsl(0 0% 0% / 0.25), 0px 1px 2px -5px hsl(0 0% 0% / 0.25);
            --shadow-md: 0px 4px 12px -4px hsl(0 0% 0% / 0.25), 0px 2px 4px -5px hsl(0 0% 0% / 0.25);
            --shadow-lg: 0px 4px 12px -4px hsl(0 0% 0% / 0.25), 0px 4px 6px -5px hsl(0 0% 0% / 0.25);
            --shadow-xl: 0px 4px 12px -4px hsl(0 0% 0% / 0.25), 0px 8px 10px -5px hsl(0 0% 0% / 0.25);
            --shadow-2xl: 0px 4px 12px -4px hsl(0 0% 0% / 0.63);
        }

        * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
        }
        
        body {
            font-family: 'Anek Telugu', ui-sans-serif, sans-serif, system-ui;
            font-size: 14px;
            color: var(--foreground);
            background-color: var(--background);
            line-height: 1.6;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

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
            font-size: 32px;
            color: var(--primary);
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
        }

        .header .subtitle {
            font-size: 16px;
            color: var(--muted-foreground);
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }

        .summary-card {
            padding: 25px 20px;
            text-align: center;
            background: var(--card);
            border-radius: var(--radius);
            box-shadow: var(--shadow-md);
            border: 1px solid var(--border);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .summary-card:hover {
            transform: translateY(-5px);
            box-shadow: var(--shadow-xl);
        }

        .summary-card .icon {
            font-size: 28px;
            margin-bottom: 15px;
            color: var(--primary);
        }

        .summary-card .label {
            font-size: 14px;
            color: var(--muted-foreground);
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .summary-card .value {
            font-size: 28px;
            font-weight: bold;
            color: var(--primary);
        }

        .table-container {
            background: var(--card);
            border-radius: var(--radius);
            box-shadow: var(--shadow-lg);
            overflow: hidden;
            border: 1px solid var(--border);
            margin-bottom: 30px;
        }

        .employees-table {
            width: 100%;
            border-collapse: collapse;
        }

        .employees-table th {
            background: var(--primary);
            color: var(--primary-foreground);
            padding: 16px 20px;
            text-align: left;
            font-weight: bold;
            font-size: 14px;
        }

        .employees-table td {
            padding: 14px 20px;
            border-bottom: 1px solid var(--border);
            font-size: 14px;
        }

        .employees-table tr:nth-child(even) {
            background: rgba(255, 255, 255, 0.03);
        }

        .employees-table tr:hover {
            background: rgba(255, 255, 255, 0.05);
        }

        .avatar {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid var(--border);
        }

        .rank-badge {
            display: inline-flex;
            width: 36px;
            height: 36px;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            text-align: center;
            font-weight: bold;
            color: white;
            font-size: 14px;
        }

        .rank-1 { background: linear-gradient(135deg, #fbbf24, #f59e0b); }
        .rank-2 { background: linear-gradient(135deg, #94a3b8, #64748b); }
        .rank-3 { background: linear-gradient(135deg, #cd7f32, #b45309); }
        .rank-other { background: linear-gradient(135deg, #64748b, #475569); }

        .percentage-bar-container {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .percentage-bar {
            flex: 1;
            height: 20px;
            background: var(--muted);
            border-radius: 10px;
            position: relative;
            overflow: hidden;
        }

        .percentage-fill {
            height: 100%;
            border-radius: 10px;
            text-align: center;
            line-height: 20px;
            color: white;
            font-size: 11px;
            font-weight: bold;
            transition: width 0.5s ease;
        }

        .percentage-value {
            min-width: 50px;
            text-align: right;
            font-weight: bold;
            font-size: 14px;
        }

        .fill-excellent { background: linear-gradient(90deg, #16a34a, #22c55e); }
        .fill-good { background: linear-gradient(90deg, #3b82f6, #60a5fa); }
        .fill-average { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
        .fill-below { background: linear-gradient(90deg, #ef4444, #f87171); }

        .points-breakdown {
            font-size: 12px;
            color: var(--muted-foreground);
        }

        .points-breakdown strong {
            color: var(--foreground);
        }

        .footer-note {
            margin-top: 30px;
            padding: 20px;
            background: var(--card);
            border-radius: var(--radius);
            box-shadow: var(--shadow-sm);
            border-left: 4px solid var(--primary);
            font-size: 14px;
        }

        @media (max-width: 768px) {
            body {
                padding: 10px;
                font-size: 12px;
            }
            
            .header h1 {
                font-size: 24px;
            }
            
            .summary-grid {
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
            }
            
            .summary-card {
                padding: 15px 10px;
            }
            
            .summary-card .value {
                font-size: 22px;
            }
            
            .employees-table th,
            .employees-table td {
                padding: 10px 12px;
            }
            
            .table-container {
                overflow-x: auto;
            }
            
            .percentage-bar-container {
                flex-direction: column;
                gap: 5px;
            }
            
            .percentage-value {
                text-align: left;
                min-width: auto;
            }
        }

        @media (max-width: 480px) {
            .summary-grid {
                grid-template-columns: 1fr;
            }
            
            .header {
                padding: 20px 15px;
            }
            
            .employees-table {
                font-size: 12px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1><i class="fas fa-chart-bar"></i> Final Performance Ratings Overview</h1>
            <div class="subtitle">
                <i class="far fa-calendar-alt"></i>
                Period: {{ \Carbon\Carbon::parse($data['period']['start'])->format('F d, Y') }} - 
                {{ \Carbon\Carbon::parse($data['period']['end'])->format('F d, Y') }}
            </div>
            <div class="subtitle">
                <i class="fas fa-cog"></i>
                Configuration: {{ $data['config']['name'] }}
            </div>
            <div class="subtitle">
                <i class="far fa-clock"></i>
                Generated: {{ \Carbon\Carbon::parse($data['calculated_at'])->format('F d, Y g:i A') }}
            </div>
        </div>

        <div class="summary-grid">
            <div class="summary-card">
                <div class="icon"><i class="fas fa-users"></i></div>
                <div class="label">Total Employees</div>
                <div class="value">{{ count($data['users']) }}</div>
            </div>
            <div class="summary-card">
                <div class="icon"><i class="fas fa-star"></i></div>
                <div class="label">Average Rating</div>
                <div class="value">{{ number_format(collect($data['users'])->avg('final_percentage'), 1) }}%</div>
            </div>
            <div class="summary-card">
                <div class="icon"><i class="fas fa-trophy"></i></div>
                <div class="label">Top Performer</div>
                <div class="value">{{ number_format(collect($data['users'])->sortByDesc('final_percentage')->first()['final_percentage'], 1) }}%</div>
            </div>
            <div class="summary-card">
                <div class="icon"><i class="fas fa-bullseye"></i></div>
                <div class="label">Max Points</div>
                <div class="value">{{ number_format($data['max_points_for_100_percent'], 0) }}</div>
            </div>
        </div>

        <div class="table-container">
            <table class="employees-table">
                <thead>
                    <tr>
                        <th style="width: 6%;">Rank</th>
                        <th style="width: 8%;">Avatar</th>
                        <th style="width: 22%;">Employee</th>
                        <th style="width: 12%; text-align: center;">Total Points</th>
                        <th style="width: 32%;">Performance</th>
                        <th style="width: 20%;">Breakdown</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach(collect($data['users'])->sortByDesc('final_percentage')->values() as $index => $user)
                        <tr>
                            <td style="text-align: center;">
                                <div class="rank-badge {{ $index === 0 ? 'rank-1' : ($index === 1 ? 'rank-2' : ($index === 2 ? 'rank-3' : 'rank-other')) }}">
                                    {{ $index + 1 }}
                                </div>
                            </td>
                            @php
    // Turn possibly-full URL into a relative path under storage/app/public
    $relative = str_replace(url('/storage/'), '', (string) $user['avatar_url']);
    $localPath = storage_path('app/public/' . $relative); // e.g. /var/www/html/storage/app/public/avatars/...
    $src = file_exists($localPath) ? ('file://' . $localPath) : null;
@endphp
                            <td style="text-align: center;">
                                @if($src)
    <img src="{{ $src }}" class="avatar" />
@else
    <div class="avatar" style="background: var(--primary); ...">
        {{ strtoupper(substr($user['user_name'], 0, 1)) }}
    </div>
@endif
                            </td>
                            
                            <td>
                                <strong style="font-size: 15px;">{{ $user['user_name'] }}</strong><br>
                                <span style="color: var(--muted-foreground); font-size: 12px;">{{ $user['user_email'] }}</span>
                            </td>
                            
                            <td style="text-align: center;">
                                <strong style="font-size: 16px; color: var(--primary);">{{ number_format($user['total_points'], 2) }}</strong><br>
                                <span style="font-size: 12px; color: var(--muted-foreground);">/ {{ number_format($user['max_points'], 0) }}</span>
                            </td>
                            
                            <td>
                                <div class="percentage-bar-container">
                                    <div class="percentage-bar">
                                        <div class="percentage-fill {{ $user['final_percentage'] >= 90 ? 'fill-excellent' : ($user['final_percentage'] >= 75 ? 'fill-good' : ($user['final_percentage'] >= 60 ? 'fill-average' : 'fill-below')) }}" 
                                             style="width: {{ min($user['final_percentage'], 100) }}%;">
                                            {{ number_format($user['final_percentage'], 1) }}%
                                        </div>
                                    </div>
                                    <div class="percentage-value {{ $user['final_percentage'] >= 90 ? 'fill-excellent' : ($user['final_percentage'] >= 75 ? 'fill-good' : ($user['final_percentage'] >= 60 ? 'fill-average' : 'fill-below')) }}">
                                        {{ number_format($user['final_percentage'], 1) }}%
                                    </div>
                                </div>
                            </td>
                            
                            <td class="points-breakdown">
                                @if($user['breakdown']['task_ratings']['enabled'])
                                    <i class="fas fa-tasks" style="color: var(--chart-3);"></i> Tasks: <strong style="color: var(--chart-3);">+{{ number_format($user['breakdown']['task_ratings']['value'], 1) }}</strong><br>
                                @endif
                                @if($user['breakdown']['stakeholder_ratings']['enabled'])
                                    <i class="fas fa-star" style="color: var(--chart-2);"></i> Stakeholder: <strong style="color: var(--chart-2);">+{{ number_format($user['breakdown']['stakeholder_ratings']['value'], 1) }}</strong><br>
                                @endif
                                @if($user['breakdown']['help_requests']['helper']['enabled'] && $user['breakdown']['help_requests']['helper']['value'] > 0)
                                    <i class="fas fa-hands-helping" style="color: var(--chart-4);"></i> Help: <strong style="color: var(--chart-4);">+{{ number_format($user['breakdown']['help_requests']['helper']['value'], 1) }}</strong><br>
                                @endif
                                @if($user['breakdown']['help_requests']['requester']['enabled'] && $user['breakdown']['help_requests']['requester']['value'] < 0)
                                    <i class="fas fa-exclamation-triangle" style="color: var(--destructive);"></i> Penalties: <strong style="color: var(--destructive);">{{ number_format($user['breakdown']['help_requests']['requester']['value'], 1) }}</strong><br>
                                @endif
                                @if($user['breakdown']['tickets_resolved']['enabled'] && $user['breakdown']['tickets_resolved']['value'] > 0)
                                    <i class="fas fa-ticket-alt" style="color: var(--chart-5);"></i> Tickets: <strong style="color: var(--chart-5);">+{{ number_format($user['breakdown']['tickets_resolved']['value'], 1) }}</strong>
                                @endif
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <div class="footer-note">
            <i class="fas fa-info-circle"></i> <strong>Note:</strong> Individual detailed reports for each employee are included in this package.
        </div>
    </div>
</body>
</html>