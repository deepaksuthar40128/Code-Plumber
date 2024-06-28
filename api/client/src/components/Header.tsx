import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { CalendarIcon } from "lucide-react";

export default function Header() {
  const [status, setStatus] = useState(true);
  const [showStatus, setShowStatus] = useState(false);

  let timerId: NodeJS.Timeout;
  useEffect(() => {
    if (showStatus) {
      clearTimeout(timerId);
      timerId = setTimeout(() => {
        setShowStatus(false);
      }, 5000)
    }
  }, [showStatus])


  const onlineEvent = () => {
    setShowStatus(true);
    setStatus(true);
  }
  const offlineEvent = () => {
    setShowStatus(true);
    setStatus(false);
  }
  useEffect(() => {
    window.addEventListener('online', onlineEvent);
    window.addEventListener('offline', offlineEvent);
    return () => {
      window.removeEventListener('online', onlineEvent);
      window.removeEventListener('offline', offlineEvent);
    }
  }, [])

  return (
    <div>
      <div className={`h-max ${status ? 'bg-green-700' : 'bg-red-700'} text-white w-dvw absolute text-center text-sm py-1 ${showStatus ? 'top-0' : '-top-8'} transition-all`}>
        {
          status ? 'Back Online' : 'Trying to reconnecting...'
        }
      </div>
      <nav className="w-full h-[60px] bg-gray-400 dark:bg-gray-900 text-white p-3 flex justify-between items-center">
        <Link to="/">
          <h2 className="font-bold select-none text-gray-800 dark:text-white">Code Plumber</h2>
        </Link>
        <HoverCard>
          <HoverCardTrigger asChild>
            <Link to="https://github.com/deepaksuthar40128/Code-Plumber" target="_blank">
              <img className="h-8 w-8 cursor-pointer transition-all duration-500 dark:invert hover:scale-105" src="/github.svg" alt="github" />
            </Link>
          </HoverCardTrigger>
          <HoverCardContent className="w-80">
            <div className="flex justify-between space-x-4">
              <Avatar>
                <AvatarImage src="/logo.png" />
                <AvatarFallback>CP</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold cursor-pointer" onClick={() => window.open('https://github.com/deepaksuthar40128/Code-Plumber', "_blank")}>Code-Plumber</h4>
                <p className="text-sm">
                  If you like it and find it useful please star it and contribute :)
                </p>
                <div className="flex items-center pt-2">
                  <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
                  <span className="text-xs text-muted-foreground">
                    Created on February 2024
                  </span>
                </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>

      </nav>
    </div>
  );
}
