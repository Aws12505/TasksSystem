<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $user['user_name'] }} - Performance Report</title>
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
            box-shadow: var(--shadow-xl);
        }

        .header .avatar-container {
            margin-bottom: 20px;
        }

        .avatar {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            object-fit: cover;
            border: 4px solid var(--primary-foreground);
            box-shadow: var(--shadow-lg);
        }

        .header h1 {
            font-size: 32px;
            margin-bottom: 10px;
        }

        .header .subtitle {
            font-size: 16px;
            opacity: 0.9;
            margin-bottom: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .score-card {
            background: var(--card);
            padding: 30px;
            border-radius: var(--radius);
            margin-bottom: 30px;
            text-align: center;
            border: 3px solid var(--primary);
            box-shadow: var(--shadow-lg);
        }

        .score-card .percentage {
            font-size: 60px;
            font-weight: bold;
            color: var(--primary);
            margin-bottom: 15px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .score-card .points {
            font-size: 22px;
            color: var(--muted-foreground);
        }

        .points-summary {
            background: var(--card);
            padding: 25px;
            border-radius: var(--radius);
            margin-bottom: 25px;
            border: 1px solid var(--border);
            box-shadow: var(--shadow-md);
        }

        .points-summary h3 {
            margin-bottom: 20px;
            color: var(--primary);
            font-size: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .points-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            padding-bottom: 12px;
            border-bottom: 1px solid var(--border);
        }

        .points-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }

        .points-label {
            font-size: 16px;
            color: var(--muted-foreground);
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .points-value {
            font-weight: bold;
            font-size: 16px;
            color: var(--foreground);
        }

        .points-value.positive { color: var(--chart-3); }
        .points-value.negative { color: var(--destructive); }

        .component-section {
            margin-bottom: 30px;
            page-break-inside: avoid;
            background: var(--card);
            padding: 25px;
            border-radius: var(--radius);
            box-shadow: var(--shadow-md);
            border: 1px solid var(--border);
        }

        .component-title {
            font-size: 20px;
            font-weight: bold;
            color: var(--primary);
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 2px solid var(--border);
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .detail-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            font-size: 13px;
        }

        .detail-table th {
            background: var(--muted);
            color: var(--muted-foreground);
            padding: 12px 15px;
            text-align: left;
            font-weight: bold;
            border-bottom: 2px solid var(--border);
        }

        .detail-table td {
            padding: 10px 15px;
            border-bottom: 1px solid var(--border);
        }

        .detail-table tr:hover {
            background: rgba(255, 255, 255, 0.03);
        }

        .calculation {
            font-family: 'Fragment Mono', ui-monospace, monospace;
            font-size: 11px;
            color: var(--muted-foreground);
            background: var(--muted);
            padding: 5px 8px;
            border-radius: 4px;
            border: 1px solid var(--border);
        }

        .info-box {
            background: var(--muted);
            padding: 18px;
            border-radius: var(--radius);
            margin-top: 15px;
            border-left: 4px solid var(--primary);
        }

        .info-box p {
            margin-bottom: 8px;
        }

        .info-box p:last-child {
            margin-bottom: 0;
        }

        .footer-note {
            margin-top: 40px;
            padding: 20px;
            background: var(--card);
            border-radius: var(--radius);
            text-align: center;
            border-left: 4px solid var(--primary);
            box-shadow: var(--shadow-sm);
        }

        @media (max-width: 768px) {
            body {
                padding: 10px;
                font-size: 12px;
            }
            
            .header {
                padding: 25px 20px;
            }
            
            .header h1 {
                font-size: 24px;
            }
            
            .score-card .percentage {
                font-size: 48px;
            }
            
            .points-summary,
            .component-section {
                padding: 20px;
            }
            
            .points-label,
            .points-value {
                font-size: 14px;
            }
            
            .detail-table {
                font-size: 11px;
            }
            
            .detail-table th,
            .detail-table td {
                padding: 8px 10px;
            }
        }

        @media (max-width: 480px) {
            .header {
                padding: 20px 15px;
            }
            
            .avatar {
                width: 80px;
                height: 80px;
            }
            
            .score-card {
                padding: 20px;
            }
            
            .score-card .percentage {
                font-size: 36px;
            }
            
            .points-row {
                flex-direction: column;
                gap: 5px;
            }
            
            .points-value {
                text-align: left;
            }
            
            .detail-table {
                font-size: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="avatar-container">
               @if(!empty($user['avatar_data_uri']))
        <img src="{{ $user['avatar_data_uri'] }}" class="avatar" />
    @else
        <div class="avatar" style="background: var(--primary-foreground); color: var(--primary); display: inline-flex; align-items: center; justify-content: center; font-size: 40px; font-weight: bold;">
            {{ strtoupper(substr($user['user_name'], 0, 1)) }}
        </div>
    @endif
            </div>
            <h1>{{ $user['user_name'] }}</h1>
            <div class="subtitle">
                <i class="fas fa-envelope"></i>
                {{ $user['user_email'] }}
            </div>
            <div class="subtitle">
                <i class="far fa-calendar-alt"></i>
                Period: {{ \Carbon\Carbon::parse($period['start'])->format('M d, Y') }} - 
                {{ \Carbon\Carbon::parse($period['end'])->format('M d, Y') }}
            </div>
            <div class="subtitle">
                <i class="fas fa-cog"></i>
                Configuration: {{ $config['name'] }}
            </div>
        </div>

        <div class="score-card">
            <div class="percentage">{{ number_format($user['final_percentage'], 2) }}%</div>
            <div class="points">{{ number_format($user['total_points'], 2) }} / {{ number_format($max_points, 2) }} points</div>
        </div>

        <div class="points-summary">
            <h3><i class="fas fa-chart-pie"></i> Points Breakdown</h3>
            
            @if($user['breakdown']['task_ratings']['enabled'])
                <div class="points-row">
                    <div class="points-label"><i class="fas fa-tasks"></i> Task Ratings ({{ $user['breakdown']['task_ratings']['tasks_included'] }} tasks):</div>
                    <div class="points-value positive">+{{ number_format($user['breakdown']['task_ratings']['value'], 2) }}</div>
                </div>
            @endif

            @if($user['breakdown']['stakeholder_ratings']['enabled'])
                <div class="points-row">
                    <div class="points-label"><i class="fas fa-star"></i> Stakeholder Ratings ({{ $user['breakdown']['stakeholder_ratings']['projects_included'] }} projects):</div>
                    <div class="points-value positive">+{{ number_format($user['breakdown']['stakeholder_ratings']['value'], 2) }}</div>
                </div>
            @endif

            @if($user['breakdown']['help_requests']['helper']['enabled'])
                <div class="points-row">
                    <div class="points-label"><i class="fas fa-hands-helping"></i> Helped Others ({{ $user['breakdown']['help_requests']['helper']['count'] }} times):</div>
                    <div class="points-value positive">+{{ number_format($user['breakdown']['help_requests']['helper']['value'], 2) }}</div>
                </div>
            @endif

            @if($user['breakdown']['help_requests']['requester']['enabled'])
                <div class="points-row">
                    <div class="points-label"><i class="fas fa-exclamation-triangle"></i> Help Request Penalties:</div>
                    <div class="points-value {{ $user['breakdown']['help_requests']['requester']['value'] < 0 ? 'negative' : '' }}">
                        {{ number_format($user['breakdown']['help_requests']['requester']['value'], 2) }}
                    </div>
                </div>
            @endif

            @if($user['breakdown']['tickets_resolved']['enabled'])
                <div class="points-row">
                    <div class="points-label"><i class="fas fa-ticket-alt"></i> Tickets Resolved ({{ $user['breakdown']['tickets_resolved']['count'] }}):</div>
                    <div class="points-value positive">+{{ number_format($user['breakdown']['tickets_resolved']['value'], 2) }}</div>
                </div>
            @endif

            <div class="points-row" style="border-top: 2px solid var(--border); margin-top: 15px; padding-top: 15px;">
                <div class="points-label" style="font-size: 18px; font-weight: bold; color: var(--primary);"><i class="fas fa-trophy"></i> Total Points:</div>
                <div class="points-value" style="font-size: 20px; color: var(--primary);">{{ number_format($user['total_points'], 2) }}</div>
            </div>
        </div>

        @if($user['breakdown']['task_ratings']['enabled'] && count($user['breakdown']['task_ratings']['details']) > 0)
            <div class="component-section">
                <div class="component-title"><i class="fas fa-tasks"></i> Task Ratings Details</div>
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
                                <td style="text-align: right; font-weight: bold; color: var(--chart-3);">
                                    +{{ number_format($task['contribution'], 2) }}
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endif

        @if($user['breakdown']['stakeholder_ratings']['enabled'] && count($user['breakdown']['stakeholder_ratings']['details']) > 0)
            <div class="component-section">
                <div class="component-title"><i class="fas fa-star"></i> Stakeholder Ratings Details</div>
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
                                <td style="text-align: right; font-weight: bold; color: var(--chart-2);">
                                    +{{ number_format($project['contribution'], 2) }}
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endif

        @if($user['breakdown']['help_requests']['helper']['enabled'] && $user['breakdown']['help_requests']['helper']['count'] > 0)
            <div class="component-section">
                <div class="component-title"><i class="fas fa-hands-helping"></i> Help Provided to Others</div>
                <div class="info-box">
                    <p>Helped colleagues <strong>{{ $user['breakdown']['help_requests']['helper']['count'] }}</strong> times
                    × {{ $user['breakdown']['help_requests']['helper']['points_per_help'] }} points each
                    = <strong style="color: var(--chart-3);">+{{ number_format($user['breakdown']['help_requests']['helper']['value'], 2) }} points</strong></p>
                    @if($user['breakdown']['help_requests']['helper']['capped'])
                        <p style="color: var(--chart-2); margin-top: 10px;">
                            <i class="fas fa-info-circle"></i> Capped at {{ $user['breakdown']['help_requests']['helper']['max_points'] }} points maximum
                        </p>
                    @endif
                </div>
            </div>
        @endif

        @if($user['breakdown']['help_requests']['requester']['enabled'] && count($user['breakdown']['help_requests']['requester']['breakdown']) > 0)
            <div class="component-section">
                <div class="component-title"><i class="fas fa-exclamation-triangle"></i> Help Requested Penalties</div>
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
                                <td style="text-align: right; font-weight: bold; color: var(--destructive);">
                                    {{ number_format($data['total'], 2) }}
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endif

        @if($user['breakdown']['tickets_resolved']['enabled'] && $user['breakdown']['tickets_resolved']['count'] > 0)
            <div class="component-section">
                <div class="component-title"><i class="fas fa-ticket-alt"></i> Tickets Resolved</div>
                <div class="info-box">
                    <p>Resolved <strong>{{ $user['breakdown']['tickets_resolved']['count'] }}</strong> tickets
                    × {{ $user['breakdown']['tickets_resolved']['points_per_ticket'] }} points each
                    = <strong style="color: var(--chart-3);">+{{ number_format($user['breakdown']['tickets_resolved']['value'], 2) }} points</strong></p>
                    @if($user['breakdown']['tickets_resolved']['capped'])
                        <p style="color: var(--chart-2); margin-top: 10px;">
                            <i class="fas fa-info-circle"></i> Capped at {{ $user['breakdown']['tickets_resolved']['max_points'] }} points maximum
                        </p>
                    @endif
                </div>
            </div>
        @endif

        <div class="footer-note">
            <p style="font-size: 14px; color: var(--muted-foreground);">
                <i class="fas fa-clock"></i> Generated by Final Rating System on {{ \Carbon\Carbon::now()->format('F d, Y g:i A') }}
            </p>
        </div>
    </div>
</body>
</html>