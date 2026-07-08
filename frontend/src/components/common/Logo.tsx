import React from "react";
import clsx from "clsx";

const Logo = ({ labelClassName }: { labelClassName?: string }) => {
    return (
        <div className="flex items-center gap-2 cursor-pointer">
            <img src="/cams-logo.jpg" alt="CAMS Logo" className="w-25 h-auto object-contain" />
            <p className={clsx('text-xl font-bold tracking-tight', labelClassName ? labelClassName : 'text-primary')}>
                
            </p>
        </div>
    );
};

export default Logo;