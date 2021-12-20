import { useContext, useEffect, useRef, useState } from "react";
import Footer from "../../components/Footer";
import ModeratorNavbar from "../../components/ModeratorNavbar";
import PostCard from "../../components/PostCard";
import deletePost from "../../services/post/deletePost";
import getPost from "../../services/post/getPost";
import ErrorContext from "../../utils/ErrorContext";
import './style.css';
import cloneDeep from "lodash.clonedeep";
import CreatePost from "../../components/Modals/CreatePost";
import getCountPosts from "../../services/post/getCountPosts";
import PageSelector from "../../components/PageSelector";
import IPostDataWithId from "../../utils/types/post/IPostDataWithId";
import { AxiosError } from "axios";
import IAppError from "../../utils/types/API/IAppError";

export default function Posts () {
  const mounted = useRef(false);
  const setGlobalError = useContext(ErrorContext)[1];
  const [ page, setPage ] = useState<number>(1);
  const [ posts, setPosts ] = useState<IPostDataWithId[]>([]);
  const [ createPostModal, setCreatePostModal ] = useState(false);
  const [ postsCount, setPostsCountState ] = useState<number>(0);

  useEffect(() => {
    mounted.current = true;

    if(mounted.current) {
      getPost(page).then(response => {
        setPosts(response.data);
      }).catch((error: AxiosError<IAppError>) => {
        switch (error.response?.data.code) {
          //in case there are no posts
          case 2:
            break;
          default:
            mounted.current && setGlobalError({ value: "Oops... Algo de errado aconteceu, tente novamente mais tarde." });
            break;
        }
      });

      getCountPosts().then(response => {
        setPostsCountState(response.data);
      }).catch(() => {
        setPostsCountState(0);
      })
    }
    
    return () => { mounted.current = false; }
  }, [ page ]);

  async function handleDeletePost(id: string) {
    try {
      await deletePost(id);
    } catch {
      setGlobalError({ value: "Oops... Algo de errado aconteceu, tente novamente mais tarde." });
    }

    if(posts && posts.length > 0) {
      let newPost = cloneDeep(posts);
      newPost = newPost.filter(e => e.id !== id);
      setPosts(newPost);
    }
  }

  return (
    <>
      <div className="posts-page page">
        <ModeratorNavbar locale="posts" />
        <div className="post-container">
          <button type="button" className="new-post" onClick={() => setCreatePostModal(true)}>Criar uma nova postagem</button>
          <div className="posts">
            {
              posts && posts.length > 0
              ? posts.map(e => (
                  <PostCard 
                    key={e.id}
                    title={e.title}
                    onRemove={() => handleDeletePost(e.id)}
                    createdAt={e.createdAt.toLocaleDateString()}
                    content={e.content}
                  />
                ))
              : <p className="not-found">Nenhum Post Encontrado</p>
            }
          </div>
        </div>
        {posts && posts.length === 0
        ? null
        : <PageSelector listLength={postsCount} pageState={[ page, setPage ]} />}
        <Footer />
      </div>
      <CreatePost
        postsState={[posts, setPosts]}
        openState={[createPostModal, setCreatePostModal]}
      />
    </>
  )
}