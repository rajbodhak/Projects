// export interface PostTypes {
//     _id: string,
//     user:
//     content: string,
//     image
//     likes
//     comments
//     createdAt

// }
export interface INotification {
    _id: string;
    user: string;
    types: string;
    message: string;
    isRead: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface User {
    _id: string;
    username: string;
    name: string;
    email: string;
    skills: string[];
    bio: string;
    github: string;
    profilePicture?: string;
    followers: string[];
    following: string[];
    posts: Post[];
    bookmarks: string[];
    createdAt: string;
    updatedAt: string;
}

export interface Post {
    _id: string;
    content: string;
    image?: string;
    createdAt: string;
    user: {
        _id: string;
        username: string;
        profilePicture?: string;
    };
    likes: string[];
    comments: Comment[];
}

export interface Comment {
    _id: string;
    content: string;
    createdAt: string;
    text: string;
    user: {
        _id: string;
        username: string;
        profilePicture?: string;
    };
}