// export interface PostTypes {
//     _id: string,
//     user:
//     content: string,
//     image
//     likes
//     comments
//     createdAt

// }

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
};

export interface Comment {
    _id: string;
    content: string;
    createdAt: string;
    user: {
        username: string;
        profilePicture?: string;
    };
}
