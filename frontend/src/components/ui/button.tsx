import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-white border-4 border-retro-sky text-cardinal-red shadow-[6px_6px_0_0_#1E3A8A] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[4px_4px_0_0_#1E3A8A] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0_0_#1E3A8A] font-pixel text-xs',
        outline: 'bg-transparent border-4 border-cardinal-red text-cardinal-red font-pixel text-xs hover:bg-cardinal-red hover:text-white hover:shadow-[4px_4px_0_0_#1E3A8A] hover:-translate-x-0.5 hover:-translate-y-0.5',
        ghost: 'bg-transparent border-0 text-navy font-pixel text-xs hover:text-cardinal-red',
        link: 'text-cardinal-red underline-offset-4 hover:underline font-pixel text-xs',
      },
      size: {
        sm: 'px-5 py-2.5 text-xs',
        md: 'px-6 py-3 text-xs',
        lg: 'px-8 py-4 text-sm',
        xl: 'px-10 py-5 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
