'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular' | 'card';
    width?: string | number;
    height?: string | number;
    animate?: boolean;
}

export function Skeleton({
    className,
    variant = 'text',
    width,
    height,
    animate = true,
}: SkeletonProps) {
    const baseStyles = cn(
        'bg-navy/10 rounded',
        animate && 'animate-pulse',
        variant === 'circular' && 'rounded-full',
        variant === 'card' && 'rounded-lg',
        className
    );

    const style: React.CSSProperties = {
        width: width || (variant === 'text' ? '100%' : undefined),
        height: height || (variant === 'text' ? '1em' : undefined),
    };

    return <div className={baseStyles} style={style} />;
}

// Pre-built skeleton patterns

export function StatCardSkeleton() {
    return (
        <div className="bg-white border-4 border-navy shadow-[8px_8px_0_0_#1E3A8A] p-6 relative overflow-hidden">
            <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                    <Skeleton variant="text" width="60%" height="1rem" />
                    <Skeleton variant="text" width="40%" height="2.5rem" />
                    <Skeleton variant="text" width="80%" height="0.875rem" />
                </div>
                <Skeleton variant="circular" width={48} height={48} />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-navy/5" />
        </div>
    );
}

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
    return (
        <tr className="border-b border-navy/10">
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="px-4 py-3">
                    <Skeleton variant="text" width={i === 0 ? '70%' : '50%'} />
                </td>
            ))}
        </tr>
    );
}

export function UserCardSkeleton() {
    return (
        <div className="bg-white border-4 border-navy shadow-[6px_6px_0_0_#1E3A8A] p-6">
            <div className="flex items-center gap-4 mb-4">
                <Skeleton variant="circular" width={64} height={64} />
                <div className="flex-1 space-y-2">
                    <Skeleton variant="text" width="60%" height="1.25rem" />
                    <Skeleton variant="text" width="40%" height="0.875rem" />
                </div>
            </div>
            <div className="space-y-2">
                <Skeleton variant="text" width="100%" />
                <Skeleton variant="text" width="80%" />
            </div>
        </div>
    );
}

export function MatchCardSkeleton() {
    return (
        <div className="bg-white border-4 border-navy shadow-[8px_8px_0_0_#1E3A8A] p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-retro-gray/30 border-l-4 border-b-4 border-navy" />
            <div className="flex items-center gap-4 mb-4">
                <Skeleton variant="circular" width={80} height={80} />
                <div className="flex-1 space-y-2">
                    <Skeleton variant="text" width="70%" height="1.5rem" />
                    <Skeleton variant="text" width="50%" height="1rem" />
                </div>
            </div>
            <Skeleton variant="rectangular" width="100%" height={60} className="rounded-lg" />
            <div className="flex gap-3 mt-4">
                <Skeleton variant="rectangular" width="50%" height={44} className="rounded-full" />
                <Skeleton variant="rectangular" width="50%" height={44} className="rounded-full" />
            </div>
        </div>
    );
}

export function SurveyQuestionSkeleton() {
    return (
        <div className="bg-white border-4 border-navy shadow-[8px_8px_0_0_#1E3A8A] p-8">
            <Skeleton variant="text" width="80%" height="1.5rem" className="mb-6" />
            <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 border-2 border-navy/20 rounded">
                        <Skeleton variant="circular" width={24} height={24} />
                        <Skeleton variant="text" width="60%" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <StatCardSkeleton key={i} />
                ))}
            </div>

            {/* Table */}
            <div className="bg-white border-4 border-navy shadow-[8px_8px_0_0_#1E3A8A] overflow-hidden">
                <div className="p-4 border-b-4 border-navy">
                    <Skeleton variant="text" width="200px" height="1.5rem" />
                </div>
                <table className="w-full">
                    <thead>
                        <tr className="border-b-2 border-navy/20 bg-retro-gray/10">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <th key={i} className="px-4 py-3 text-left">
                                    <Skeleton variant="text" width="80%" />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <TableRowSkeleton key={i} columns={4} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
