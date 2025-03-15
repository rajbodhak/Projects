import RightSideBar from "@/components/RightSideBar"
import Feed from "../components/Feed"
import CreatePost from "@/components/CreatePost"

const Home = () => {
    return (
        <div className="flex flex-col items-center">
            <CreatePost />
            <Feed />
            <RightSideBar />
        </div>
    )
}

export default Home
