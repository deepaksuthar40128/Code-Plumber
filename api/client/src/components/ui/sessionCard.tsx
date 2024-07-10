import { sessionType } from "../session";

const SessionCard = ({ data }: { data: sessionType }) => { 
    return (
        <div className={`max-w-sm  border rounded-lg shadow ${data.isCurrent ? "bg-white dark:bg-gray-800" : "bg-gray-100 dark:bg-gray-700"} border-gray-100 dark:border-gray-700`}>
            <div className="p-5">
                
                <a href="#">
                    <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">{data.title} {
                    data.isCurrent &&
                    <p className="text-green-600 inline-block">(In Use)</p>
                }</h5>
                </a>
                <p className="mb-1 font-normal text-sm text-gray-700 dark:text-gray-400">id: {data.id}</p>
                <p className="mb-1 font-normal text-sm text-gray-700 dark:text-gray-400">Created:{data.created}</p>
                <p className="mb-1 font-normal text-sm text-gray-700 dark:text-gray-400">Language:{data.language}</p>
                <p className="mb-1 font-normal text-sm text-gray-700 dark:text-gray-400">theme:{data.theme}</p>
            </div>
        </div >
    )
}

export default SessionCard;