import RightSideBar from "@/components/RightSideBar"
import Feed from "../components/Feed"
import CreatePost from "@/components/CreatePost"

const Home = () => {
    return (
        <div className="flex w-full relative">
            {/* Main feed - takes up more space */}
            <div className="flex-1 flex flex-col items-center">
                <div className="w-full max-w-xl mt-3 px-4">
                    <CreatePost />
                    <Feed />
                </div>
            </div>

            {/* Right sidebar - fixed positioned with independent scroll */}
            <div className="hidden lg:block lg:w-96 flex-shrink-0">
                {/* This is just a spacer to maintain layout */}
            </div>

            {/* Actual sidebar positioned independently */}
            <div className="hidden lg:block fixed top-0 right-0 lg:w-96 h-screen overflow-y-auto scrollbar-hide bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 z-10">
                <RightSideBar />
            </div>
        </div>
    )
}

export default Home