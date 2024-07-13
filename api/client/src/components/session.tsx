import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"; 

import SessionCard from "./ui/sessionCard";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store"; 
import { Button } from "./ui/button";
import { Input } from "./ui/input"; 

export type sessionType = {
  id: string;
  created: string;
  theme: string;
  title: string;
  language: string;
  isCurrent: boolean;
};

const Sessions = ({ children }: { children: JSX.Element }) => {
  const [sessions, setSessions] = useState<sessionType[]>([]);
  const currentSession = useSelector(
    (state: RootState) => state.compilerSlice.session
  );
  const [sessionName, setSessionName] = useState<string>("Session");
  useEffect(() => {
    let data = localStorage.getItem("sessions");
    if (data) {
      let parsedData: string[] = JSON.parse(data);
      let allSessions: sessionType[] = [];
      parsedData.forEach((id) => {
        let sessionObj = sessionParser(id);
        allSessions.push(sessionObj);
      });
      setSessions(allSessions);
    }
  }, []);
  const addSession = () => {
    let session = Date.now().toString();
    let sessions = localStorage.getItem("sessions");
    if (sessions) {
      let paredSessions: string[] = JSON.parse(sessions);
      localStorage.setItem(
        "sessions",
        JSON.stringify([session, ...paredSessions])
      );
    } else localStorage.setItem("sessions", JSON.stringify([session]));
    localStorage.setItem("last-session", session);
    localStorage.setItem("session-title-" + session, sessionName);
    location.reload();
  };
  const changeSession = (id: sessionType["id"]) => {
    localStorage.setItem("last-session", id);
    location.reload();
  };
  return (
    <Drawer>
      <DrawerTrigger>{children}</DrawerTrigger>
      <DrawerContent className="bg-gray-200 dark:bg-gray-900">
        <DrawerHeader>
          <DrawerTitle className="text-center">Choose Session?</DrawerTitle>
          <DrawerDescription className="text-center">
            Session helps you to organise your codes.
          </DrawerDescription>
        </DrawerHeader>
        <Carousel className="w-3/5 m-auto">
          <CarouselPrevious className="scale-110" />
          <CarouselContent>
            <CarouselItem key={-1} className="lg:basis-1/3">
              <div className="max-w-sm cursor-pointer h-full bg-white border flex justify-center items-center rounded-lg shadow border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <div className="mb-4">
                  <p className="mb-2 text-gray-400">Create Session:</p>
                  <div className="w-full max-w-sm">
                    <Input
                      onChange={(e) => setSessionName(e.target.value)}
                      type="text"
                      placeholder="Session Name"
                      className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                    <Button onClick={addSession} type="submit" className="mt-2">
                      Create
                    </Button>
                  </div>
                </div>
              </div>
            </CarouselItem>
            {sessions.map((session, index) => (
              <CarouselItem key={index} className="lg:basis-1/3">
                <div onClick={() => changeSession(session.id)} className="p-1">
                  <SessionCard data={session} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselNext className="scale-110" />
        </Carousel>
        <DrawerFooter></DrawerFooter>
      </DrawerContent>
    </Drawer>
  );

  function sessionParser(id: string): sessionType {
    let created = new Date(parseInt(id)).toLocaleDateString();
    let theme = localStorage.getItem("ui-theme-" + id) || "light";
    let title = localStorage.getItem("session-title-" + id) || "Session";
    let language = localStorage.getItem("lastLanguage-" + id) || "cpp";
    let isCurrent = id === currentSession;
    return {
      id,
      created,
      theme,
      title,
      language,
      isCurrent,
    };
  }
};

export default Sessions;
