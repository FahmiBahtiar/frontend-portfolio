import * as React from "react";

import { cn } from "./utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "resize-none border border-[#B9E7E6] bg-white text-[#0c282d] placeholder:text-[#527d85] focus-visible:border-[#6FD4E1] focus-visible:ring-1 focus-visible:ring-[#6FD4E1] flex field-sizing-content min-h-16 w-full rounded-xl px-3 py-2 text-sm transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
