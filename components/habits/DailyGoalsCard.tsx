'use client';

interface DailyGoalsCardProps {
    completed: number;
    total: number;
}

// Today's progress: big numeral, mono label, and a thin saffron progress bar.
export function DailyGoalsCard({ completed, total }: DailyGoalsCardProps) {
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    const note =
        percentage >= 100 ? 'all done for the day' : percentage >= 75 ? 'almost there' : percentage > 0 ? 'in progress' : 'nothing checked yet';

    return (
        <div className="rounded-card bg-card p-6 shadow-card">
            <div className="flex items-end justify-between gap-4">
                <dl className="flex flex-col-reverse gap-2">
                    <dt className="font-mono text-xs text-muted-foreground">
                        of {total} done · {note}
                    </dt>
                    <dd className="font-display text-[56px] leading-none">{completed}</dd>
                </dl>
                <p className="font-display text-[40px] leading-none text-coral">{percentage.toFixed(0)}%</p>
            </div>
            <div
                className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={Math.round(percentage)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Habits done today"
            >
                <div className="h-full rounded-full bg-saffron transition-[width] duration-300" style={{ width: `${percentage}%` }} />
            </div>
        </div>
    );
}
