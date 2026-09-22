{{-- resources/views/pdf/work-session-monthly-overview.blade.php --}}
{{-- One table: every selected user's monthly work-session stats + manual rating. --}}
{{-- Inline CSS only (no remote assets); palette mirrors clocking-records.blade.php. --}}

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Work Sessions Overview - {{ $period_label }}</title>
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
        .header h1 { font-size: 26px; margin-bottom: 6px; }
        .header .subtitle { font-size: 13px; }

        .kpi-table { width: 100%; border-collapse: separate; border-spacing: 8px 0; margin-bottom: 25px; }
        .kpi-table td {
            background: #262321;
            border: 1px solid #44403c;
            border-radius: 8px;
            padding: 12px;
            text-align: center;
            width: 20%;
        }
        .kpi-label { color: #a1a1aa; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
        .kpi-value { color: #34d399; font-size: 20px; font-weight: bold; }

        .detail-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
        .detail-table th {
            background: #e53e3e;
            color: #1c1917;
            padding: 10px 8px;
            text-align: left;
            font-weight: bold;
            font-size: 10px;
        }
        .detail-table td {
            padding: 8px;
            border-bottom: 1px solid #44403c;
            background: #262321;
            font-size: 10px;
            vertical-align: top;
        }
        .detail-table tr:nth-child(even) td { background: #2b2725; }
        .num { text-align: center; }

        .pct-good { color: #34d399; font-weight: bold; }
        .pct-mid { color: #f59e0b; font-weight: bold; }
        .pct-low { color: #e53e3e; font-weight: bold; }
        .muted { color: #a1a1aa; }

        .footer-note {
            margin-top: 25px;
            padding: 15px;
            background: #262321;
            border-radius: 8px;
            border-left: 4px solid #e53e3e;
            text-align: center;
            font-size: 10px;
            color: #a1a1aa;
        }
    </style>
</head>
<body>
    @php
        $totalSessions = collect($rows)->sum(fn ($r) => $r['stats']['sessions_count']);
        $totalItems = collect($rows)->sum(fn ($r) => $r['stats']['items_total']);
        $totalDone = collect($rows)->sum(fn ($r) => $r['stats']['done']);
        $totalPartial = collect($rows)->sum(fn ($r) => $r['stats']['partial']);
        $overallPct = \App\Models\WorkSession::completionPct($totalDone, $totalPartial, $totalItems);
        $ratedScores = collect($rows)->filter(fn ($r) => $r['rating'] !== null)->map(fn ($r) => (float) $r['rating']['score']);
        $avgScore = $ratedScores->isEmpty() ? null : round($ratedScores->avg(), 2);
        $pctClass = fn ($pct) => $pct === null ? 'muted' : ($pct >= 80 ? 'pct-good' : ($pct >= 60 ? 'pct-mid' : 'pct-low'));
    @endphp

    <div class="header">
        <h1>Work Sessions - Monthly Overview</h1>
        <div class="subtitle">{{ $period_label }}</div>
        <div class="subtitle">{{ count($rows) }} employee(s) &middot; Generated: {{ $generated_at }}</div>
    </div>

    <table class="kpi-table">
        <tr>
            <td><div class="kpi-label">Employees</div><div class="kpi-value">{{ count($rows) }}</div></td>
            <td><div class="kpi-label">Confirmed sessions</div><div class="kpi-value">{{ $totalSessions }}</div></td>
            <td><div class="kpi-label">Planned items</div><div class="kpi-value">{{ $totalItems }}</div></td>
            <td><div class="kpi-label">Completion</div><div class="kpi-value">{{ $overallPct === null ? '-' : number_format($overallPct, 2).'%' }}</div></td>
            <td><div class="kpi-label">Avg. manual score</div><div class="kpi-value">{{ $avgScore === null ? '-' : number_format($avgScore, 2) }}</div></td>
        </tr>
    </table>

    <table class="detail-table">
        <thead>
            <tr>
                <th>#</th>
                <th>Employee</th>
                <th class="num">Sessions</th>
                <th class="num">Planned</th>
                <th class="num">Done</th>
                <th class="num">Partial</th>
                <th class="num">Not done</th>
                <th class="num">Completion</th>
                <th class="num">Manual score</th>
                <th>Comment</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($rows as $index => $row)
                @php $s = $row['stats']; @endphp
                <tr>
                    <td class="num">{{ $index + 1 }}</td>
                    <td>
                        <strong>{{ $row['user_name'] }}</strong><br>
                        <span class="muted">{{ $row['email'] }}</span>
                    </td>
                    <td class="num">{{ $s['sessions_count'] }}</td>
                    <td class="num">{{ $s['items_total'] }}</td>
                    <td class="num">{{ $s['done'] }}</td>
                    <td class="num">{{ $s['partial'] }}</td>
                    <td class="num">{{ $s['not_done'] }}</td>
                    <td class="num {{ $pctClass($s['completion_pct']) }}">
                        {{ $s['completion_pct'] === null ? '-' : number_format($s['completion_pct'], 2).'%' }}
                    </td>
                    <td class="num">
                        @if ($row['rating'])
                            <strong>{{ number_format($row['rating']['score'], 2) }}</strong>
                        @else
                            <span class="muted">not rated</span>
                        @endif
                    </td>
                    <td>{{ $row['rating']['comment'] ?? '' }}</td>
                </tr>
            @empty
                <tr><td colspan="10" class="num muted">No employees selected.</td></tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer-note">
        <p>Completion = (done + {{ \App\Models\WorkSession::PARTIAL_WEIGHT }} x partial) / planned items, over confirmed sessions only.</p>
        <p>This is an automatically generated report. Generated: {{ $generated_at }}</p>
    </div>
</body>
</html>
