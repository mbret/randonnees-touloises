import { cn } from '@/components/ui'

type Props = {
  className?: string
  children?: React.ReactNode
}

export const FormItem: React.FC<Props> = ({ className, children }) => {
  return <div className={cn('flex flex-col gap-2', className)}>{children}</div>
}
