import { CompilerSliceStateType, updateCurrentLanguage } from "@/redux/slices/compilerSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const Card = ({ data }: { data: any }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const handleClick = (language: CompilerSliceStateType["currentLanguage"]) => {
        dispatch(updateCurrentLanguage(language));
        navigate('/compiler')
    }
    return (
        <div onClick={() => handleClick(data.language)} className={`cursor-pointer flex-shrink-0 inline-block m-6 h-92 relative transition-all hover:scale-105 overflow-hidden ${data.bg} rounded-lg max-w-xs shadow-lg`}>
            <svg className="absolute bottom-0 left-0 mb-8" viewBox="0 0 375 283" fill="none"
                style={{ transform: 'scale(1.5)', opacity: '0.1' }}>
                <rect x="159.52" y="175" width="152" height="152" rx="8" transform="rotate(-45 159.52 175)" fill="white" />
                <rect y="107.48" width="152" height="152" rx="8" transform="rotate(-45 0 107.48)" fill="white" />
            </svg>
            <div className="relative pt-10 px-10 flex items-center justify-center">
                <div className="block absolute w-48 h-48 bottom-0 left-0 -mb-24 ml-3"
                    style={{ background: 'radial-gradient(black, transparent 60%)', transform: 'rotate3d(0, 0, 1, 20deg) scale3d(1, 0.6, 1)', opacity: '0.2' }}>
                </div>
                <img className={`relative h-40 w-40 ${data.imageClass}`} src={data.src} alt="" />
            </div>
            <div className="relative text-white px-6 pb-6 mt-6">
                <div className="flex justify-between">
                    <span className="block font-semibold text-xl">{data.text}</span>
                </div>
                <span className="block opacity-75 -mb-1">{data.supported}</span>
            </div>
        </div>
    );
}

export default Card;
