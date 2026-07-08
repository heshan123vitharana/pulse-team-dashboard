import { BriefcaseIcon, PiggyBankIcon, ReceiptIcon, WalletIcon } from 'lucide-react'

const statisticsData: StatisticsCardProps[] = [
    {
        title: 'Net Profit',
        value: '$38,200',
        status: 'within',
        range: '$30k - $50k',
        icon: <BriefcaseIcon />
    },
    {
        title: 'Operating Expenses',
        value: '$21,750',
        status: 'exceed',
        range: 'Target: $18k',
        icon: <ReceiptIcon />
    },
    {
        title: 'Cash Reserves',
        value: '$94,500',
        status: 'observe',
        range: '$80k - $120k',
        icon: <PiggyBankIcon />
    },
    {
        title: 'Budget Utilisation',
        value: '78%',
        status: 'unknown',
        range: 'Q4 Review Pending',
        icon: <WalletIcon />
    }
]

const HomeStats = () => {
    return (
        <div className='mx-auto grid gap-4 grid-cols-2'>
            {statisticsData.map((card, index) => (
                <StatisticsCard key={index} {...card} />
            ))}
        </div>
    )
}

export default HomeStats


import { TrendingUpIcon, TrendingDownIcon, MinusIcon, ShieldAlertIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { cn } from '@/lib/utils'

export type StatisticsCardProps = {
    value: string
    title: string
    status: 'within' | 'observe' | 'exceed' | 'unknown'
    className?: string
    range: string
    icon?: React.ReactNode
}

const statusConfig = {
    within: {
        color: 'bg-green-600/10 dark:bg-green-400/10 text-green-600 dark:text-green-400',
        icon: <TrendingUpIcon />,
        label: 'On Track'
    },
    observe: {
        color: 'bg-amber-600/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400',
        icon: <MinusIcon />,
        label: 'Stable'
    },
    exceed: { color: 'bg-destructive/10 text-destructive', icon: <TrendingDownIcon />, label: 'At Risk' },
    unknown: {
        color: 'bg-sky-600/10 dark:bg-sky-400/10 text-sky-600 dark:text-sky-400',
        icon: <ShieldAlertIcon />,
        label: 'Under Review'
    }
}

const StatisticsCard = ({ status, value, title, className, range, icon }: StatisticsCardProps) => {
    return (
        <Card className={cn('flex flex-col gap-3', className)}>
            <CardHeader className='flex items-center justify-between'>
                <CardTitle className='text-sm'>{title}</CardTitle>
                {icon && (
                    <div className='bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-md [&>svg]:size-4.5'>
                        {icon}
                    </div>
                )}
            </CardHeader>

            <CardContent className='flex flex-col gap-3'>
                <p className='text-3xl font-semibold tracking-tight'>{value}</p>

                <Badge className={cn(statusConfig[status].color, 'gap-1.5 [&>svg]:size-3.5')}>
                    {statusConfig[status].icon}
                    <span>{statusConfig[status].label}:</span>
                    <span>{range}</span>
                </Badge>
            </CardContent>
        </Card>
    )
}