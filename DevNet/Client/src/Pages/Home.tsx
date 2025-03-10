import RightSideBar from "@/components/RightSideBar"
import Feed from "../components/Feed"

const Home = () => {
    return (
        <div className="flex flex-col items-center">
            This is Home
            <Feed />
            <RightSideBar />
        </div>
    )
}

export default Home
