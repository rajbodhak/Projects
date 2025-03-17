import RightSideBar from "@/components/RightSideBar"
import Feed from "../components/Feed"
import CreatePost from "@/components/CreatePost"

const Home = () => {
    return (
        <div className="flex w-full">
            {/* Main feed - takes up more space */}
            <div className="flex-1 flex flex-col items-center px-4">
                <div className="w-full max-w-xl">
                    <CreatePost />
                    <Feed />
                </div>
            </div>

            {/* Right sidebar - fixed width */}
            <div className="hidden lg:block w-80 flex-shrink-0">
                <div className="sticky top-0">
                    <RightSideBar />
                </div>
            </div>
        </div>
    )
}

export default Home