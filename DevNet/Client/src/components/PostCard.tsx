import { Heart, MessageCircle } from "lucide-react";

// interface PostCardProps {

// }
const PostCard = () => {
    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 p-4 rounded-xl max-w-xl">
            <div className="flex items-center">
                <img src="" alt="" className="w-11 h-11 rounded-full" />
                <div className="ml-1.5 text-sm leading-tight">
                    <span className="text-black dark:text-white font-bold block">Dev Net</span>
                    <span className="text-gray-500 dark:text-gray-300 font-normal block">@devnet</span>
                </div>
            </div>
            <p className="text-black dark:text-white block text-xl leading-snug mt-3">hello this is DevNet site where you can get connection</p>
            <img src="" alt="" className="mt-2 rounded-xl border border-gray-100 dark:border-gray-700" />
            <p className="text-gray-500 dark:text-gray-400 text-base py-1 my-0.5">10:05 AM · Dec 19, 2020</p>
            <div className="border-gray-200 dark:border-gray-600 border border-b-0 my-1"></div>
            <div className="text-gray-500 dark:text-gray-400 flex mt-3">
                <div className="flex items-center mr-6">
                    <Heart />
                    <span className="ml-3">615</span>
                </div>
                <div className="flex items-center mr-6">
                    <MessageCircle />
                    <span className="ml-3">93 people are Tweeting about this</span>
                </div>
            </div>
        </div>
    )
}

export default PostCard
