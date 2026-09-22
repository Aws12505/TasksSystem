{{-- resources/views/pdf/work-session-monthly.blade.php --}}
{{-- Per-user monthly report: header, KPI boxes, manual rating card, one block per session. --}}
{{-- Inline CSS only (no remote assets); palette mirrors clocking-records.blade.php. --}}

@php
    $user = $detail['user'];
    $stats = $detail['stats'];
    $pctClass = fn ($pct) => $pct === null ? 'muted' : ($pct >= 80 ? 'pct-good' : ($pct >= 60 ? 'pct-mid' : 'pct-low'));
    $outcomeLabel = ['done' => 'Done', 'partial' => 'Partial', 'not_done' => 'Not done', 'pending' => 'Pending'];
@endphp

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>{{ $user['name'] }} - Work Sessions {{ $detail['period']['label'] }}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            color: #f8fafc;
            background-color: #1c1917;
            line-height: 1.5;
            padding: 20px;
        }

        .header {
            background: #e53e3e;
            color: #1c1917;
            padding: 30px;
            margin-bottom: 25px;
            border-radius: 10px;
            text-align: center;
        }
        .avatar {
            width: 80px; height: 80px; border-radius: 40px;
            border: 3px solid #1c1917; margin-bottom: 10px;
        }
        .avatar-fallback {
            display: inline-block; width: 80px; height: 80px; line-height: 74px;
            border-radius: 40px; background: #450a0a; color: #f8fafc;
            font-size: 34px; font-weight: bold; border: 3px solid #1c1917; margin-bottom: 10px;
        }
        .header h1 { font-size: 24px; margin-bottom: 6px; }
        .header .subtitle { font-size: 13px; }

        .kpi-table { width: 100%; border-collapse: separate; border-spacing: 8px 0; margin-bottom: 25px; }
        .kpi-table td {
            background: #262321; border: 1px solid #44403c; border-radius: 8px;
            padding: 12px; text-align: center; width: 16.6%;
        }
        .kpi-label { color: #a1a1aa; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
        .kpi-value { color: #34d399; font-size: 20px; font-weight: bold; }

        .info-card {
            background: #262321; padding: 18px; border-radius: 10px;
            margin-bottom: 25px; border: 1px solid #44403c;
        }
        .info-card h3 { margin-bottom: 10px; color: #e53e3e; font-size: 15px; }
        .info-table { width: 100%; border-collapse: collapse; }
        .info-table td { padding: 5px 0; border-bottom: 1px solid #44403c; font-size: 11px; }
        .info-table tr:last-child td { border-bottom: none; }
        .info-label { color: #a1a1aa; width: 35%; }
        .info-value { font-weight: bold; }

        .session {
            background: #262321; border: 1px solid #44403c; border-radius: 10px;
            padding: 15px; margin-bottom: 18px; page-break-inside: avoid;
        }
        .session-head { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
        .session-head td { padding: 0; vertical-align: middle; }
        .session-date { font-size: 15px; font-weight: bold; color: #f8fafc; }
        .session-meta { font-size: 10px; color: #a1a1aa; }
        .session-pct { text-align: right; font-size: 16px; }

        .detail-table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        .detail-table th {
            background: #e53e3e; color: #1c1917; padding: 7px 6px;
            text-align: left; font-weight: bold; font-size: 9px;
        }
        .detail-table td {
            padding: 6px; border-bottom: 1px solid #44403c;
            background: #2b2725; font-size: 9.5px; vertical-align: top;
        }
        .num { text-align: center; }
        .muted { color: #a1a1aa; }
        .small { font-size: 9px; }

        .badge { padding: 2px 6px; border-radius: 3px; font-size: 9px; font-weight: bold; display: inline-block; }
        .badge-done { background: #134e4a; color: #34d399; }
        .badge-partial { background: #4a3410; color: #f59e0b; }
        .badge-not_done { background: #4a1414; color: #f87171; }
        .badge-pending { background: #3f3f46; color: #d4d4d8; }
        .badge-open { background: #4a3410; color: #f59e0b; }
        .badge-confirmed { background: #134e4a; color: #34d399; }
        .badge-carry { background: #1e3a5f; color: #93c5fd; }

        .pct-good { color: #34d399; font-weight: bold; }
        .pct-mid { color: #f59e0b; font-weight: bold; }
        .pct-low { color: #e53e3e; font-weight: bold; }

        .summary-note {
            margin-top: 10px; padding: 8px 10px; background: #1c1917;
            border-left: 3px solid #e53e3e; border-radius: 4px; font-size: 10px;
        }

        .footer-note {
            margin-top: 25px; padding: 15px; background: #262321; border-radius: 8px;
            border-left: 4px solid #e53e3e; text-align: center; font-size: 10px; color: #a1a1aa;
        }
    </style>
</head>
<body>
    <div class="header">
        @if (!empty($avatar_local_path))
            <img src="{{ $avatar_local_path }}" class="avatar" />
        @else
            <div class="avatar-fallback">{{ strtoupper(substr($user['name'], 0, 1)) }}</div>
        @endif
        <h1>Work Sessions Report</h1>
        <div class="subtitle">{{ $user['name'] }} &middot; {{ $user['email'] }}</div>
        <div class="subtitle">{{ $detail['period']['label'] }} ({{ $detail['period']['start'] }} to {{ $detail['period']['end'] }})</div>
        <div class="subtitle">Generated: {{ $generated_at }}</div>
    </div>

    <table class="kpi-table">
        <tr>
            <td><div class="kpi-label">Confirmed sessions</div><div class="kpi-value">{{ $stats['sessions_count'] }}</div></td>
            <td><div class="kpi-label">Planned items</div><div class="kpi-value">{{ $stats['items_total'] }}</div></td>
            <td><div class="kpi-label">Done</div><div class="kpi-value">{{ $stats['done'] }}</div></td>
            <td><div class="kpi-label">Partial</div><div class="kpi-value">{{ $stats['partial'] }}</div></td>
            <td><div class="kpi-label">Not done</div><div class="kpi-value">{{ $stats['not_done'] }}</div></td>
            <td>
                <div class="kpi-label">Completion</div>
                <div class="kpi-value {{ $pctClass($stats['completion_pct']) }}">
                    {{ $stats['completion_pct'] === null ? '-' : number_format($stats['completion_pct'], 2).'%' }}
                </div>
            </td>
        </tr>
    </table>

    <div class="info-card">
        <h3>Manual Monthly Rating</h3>
        <table class="info-table">
            <tr>
                <td class="info-label">Score (0-100):</td>
                <td class="info-value">{{ $rating ? number_format($rating['score'], 2) : 'Not rated' }}</td>
            </tr>
            <tr>
                <td class="info-label">Comment:</td>
                <td class="info-value">{{ $rating['comment'] ?? '-' }}</td>
            </tr>
            <tr>
                <td class="info-label">Last updated:</td>
                <td class="info-value">{{ !empty($rating['updated_at']) ? \Carbon\Carbon::parse($rating['updated_at'])->setTimezone(config('app.company_timezone', 'UTC'))->format('F d, Y H:i') : '-' }}</td>
            </tr>
        </table>
    </div>

    @forelse ($detail['sessions'] as $session)
        <div class="session">
            <table class="session-head">
                <tr>
                    <td>
                        <div class="session-date">{{ $session['work_date'] }}</div>
                        <div class="session-meta">
                            <span class="badge badge-{{ $session['status'] }}">{{ ucfirst($session['status']) }}</span>
                            &nbsp;{{ $session['items_total'] }} item(s)
                            &middot; {{ $session['done'] }} done / {{ $session['partial'] }} partial / {{ $session['not_done'] }} not done
                            @if ($session['pending'] > 0) / {{ $session['pending'] }} pending @endif
                            @if ($session['estimated_minutes_total'] > 0) &middot; est. {{ $session['estimated_minutes_total'] }} min @endif
                        </div>
                    </td>
                    <td class="session-pct {{ $pctClass($session['completion_pct']) }}">
                        {{ $session['completion_pct'] === null ? '-' : number_format($session['completion_pct'], 2).'%' }}
                    </td>
                </tr>
            </table>

            @if (count($session['items']) > 0)
                <table class="detail-table">
                    <thead>
                        <tr>
                            <th style="width: 4%;">#</th>
                            <th style="width: 34%;">Item</th>
                            <th style="width: 20%;">Linked task</th>
                            <th style="width: 8%;" class="num">Priority</th>
                            <th style="width: 8%;" class="num">Est. min</th>
                            <th style="width: 10%;" class="num">Outcome</th>
                            <th style="width: 16%;">Note</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($session['items'] as $i => $item)
                            <tr>
                                <td class="num">{{ $i + 1 }}</td>
                                <td>
                                    <strong>{{ $item['title'] }}</strong>
                                    @if ($item['carried_over'])
                                        <span class="badge badge-carry">carried over</span>
                                    @endif
                                    @if ($item['description'])
                                        <div class="muted small">{{ $item['description'] }}</div>
                                    @endif
                                </td>
                                <td>
                                    @if ($item['task_name'])
                                        {{ $item['task_name'] }}
                                        @if ($item['project_name'])
                                            <div class="muted small">{{ $item['project_name'] }}</div>
                                        @endif
                                    @else
                                        <span class="muted">-</span>
                                    @endif
                                </td>
                                <td class="num">{{ ucfirst($item['priority']) }}</td>
                                <td class="num">{{ $item['estimated_minutes'] ?? '-' }}</td>
                                <td class="num">
                                    <span class="badge badge-{{ $item['outcome'] }}">{{ $outcomeLabel[$item['outcome']] ?? $item['outcome'] }}</span>
                                </td>
                                <td>{{ $item['outcome_note'] ?? '' }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            @else
                <div class="muted small">No items were planned for this session.</div>
            @endif

            @if ($session['summary_note'])
                <div class="summary-note"><strong>Summary:</strong> {{ $session['summary_note'] }}</div>
            @endif
        </div>
    @empty
        <div class="info-card" style="text-align: center;">
            <p class="muted">No work sessions recorded for {{ $detail['period']['label'] }}.</p>
        </div>
    @endforelse

    <div class="footer-note">
        <p>Completion = (done + {{ \App\Models\WorkSession::PARTIAL_WEIGHT }} x partial) / planned items. KPIs count confirmed sessions only; open sessions are listed for reference.</p>
        <p>This is an automatically generated report. Generated: {{ $generated_at }}</p>
    </div>
</body>
</html>
