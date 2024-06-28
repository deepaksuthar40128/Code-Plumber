import React, { useEffect, useState } from "react";

const CountTimer = () => {
    const [time, setTime] = useState<number>(0); 
    useEffect(() => {
        const interval = setInterval(() => {
            setTime((prevTime) => prevTime + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div>{parseTime(time)}</div>
    )
}

function parseTime(time: number): string {
    const hours = String(Math.floor(time / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((time % 3600) / 60)).padStart(2, '0');
    const seconds = String(time % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

export default React.memo(CountTimer);
