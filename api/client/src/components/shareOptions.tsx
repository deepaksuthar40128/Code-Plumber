import React, { Suspense } from "react";
import ErrorBoundary from "./Error/Boundary";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
const ShareLink = React.lazy(() => import("./Share"));
import Loader from "./Loader/Loader";
import { toast } from "sonner";

const ShareElement = ({
  children,
  code,
}: {
  children: JSX.Element;
  code: string;
}) => {  
  const handleShare = () => {
    const shareData = {
      title: "Code Plumber",
      text: code,
    };
    if (navigator.share) {
      navigator.share(shareData);
    } else {
      toast.error("Sharing Not avalible in your browser!!");
    }
  };

  return (
    <Popover>
      <PopoverTrigger>{children}</PopoverTrigger>
      <PopoverContent className="w-max bg-gray-100 dark:bg-gray-900 border-2 border-b-0 text-gray-800 dark:text-white border-none">
        <div>
          <ErrorBoundary>
            <Suspense fallback={<Loader />}>
              <ShareLink>
                <div className="relative flex cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground hover:dark:bg-gray-800 hover:bg-gray-300">
                  Share Link
                </div>
              </ShareLink>
            </Suspense>
          </ErrorBoundary>
          <div
            onClick={handleShare}
            className="relative flex cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground hover:dark:bg-gray-800 hover:bg-gray-300"
          >
            External Share
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default React.memo(ShareElement);
