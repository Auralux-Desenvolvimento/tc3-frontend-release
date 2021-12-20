import { Link } from 'react-router-dom';
import heroImage from '../../assets/img/landing-page-image.svg';
import { Icon } from '@iconify/react';
import arrowUp from '@iconify-icons/ic/round-keyboard-arrow-up';
import Footer from '../../components/Footer';
import { useEffect, useRef, useState } from 'react';
import getPost from '../../services/post/getPost';
import './style.css';
import IPostDataWithId from '../../utils/types/post/IPostDataWithId';
import getCountPosts from '../../services/post/getCountPosts';
import PageSelector from '../../components/PageSelector';
import PostCard from '../../components/PostCard';

export function LandingPage () {
  const [ content, setContent ] = useState(true);
  const mounted = useRef(false);
  const [ page, setPage ] = useState<number>(1);
  const [ posts, setPosts ] = useState<IPostDataWithId[]>([]);
  const [ postsCount, setPostsCountState ] = useState<number>(0);
  
  useEffect(() => {
    mounted.current = true;

    if(mounted.current) {
      getPost(page).then(response => {
        mounted.current && setPosts(response.data);
      }).catch(() => {});
      
      getCountPosts().then(response => {
        mounted.current && setPostsCountState(response.data);
      }).catch(() => {
        mounted.current && setPostsCountState(0);
      })
    }

    return () => { mounted.current = false; }
  }, [ page ]);

  return (
    <div className="landing-page">
      <div className="main-area">
        <img src={ heroImage } alt="Pessoas comemorando juntando as mãos acima da cabeça" />
        <div className="container">
          <h1>TCC Conecta</h1>
          <p>A plataforma que conecta sua equipe a outras, ajudando ambas a construírem um projeto multidisciplinar.</p>
          <div className="button-area">
            <Link to="/login" className="responsive-button" >
              Entrar
            </Link>
            <Link to="/cadastro" className="link-register">Não é usuário? Cadastre-se!</Link>
          </div>
        </div>
        <Icon icon={arrowUp} className="icon-arrow-up"/>
      </div>
      <div className="description-area">
        <div className="landing-navbar">
          <button 
            type="button" 
            className={`${content === true ? "selected" : ""}`} 
            onClick={() => setContent(true)}
          >
            O que somos?
          </button>
          <button 
            type="button" 
            className={`${content === false ? "selected" : ""}`}  
            onClick={() => setContent(false)}
          >
            Postagens
          </button>
        </div>
        {content === true
        ? <div className="about-tc3"> 
            <div className="description-items">
              <h1>O que é o TCC Conecta?</h1>
              <p>É uma plataforma que permite que você (etequiano) busque por equipes que também estão no inicio do desenvolvimento do TCC na ETEC, com o intuito de combinar as áreas do conhecimento que podem ser complementares para unir e produzir um TCC mais completo e que consiga alcançar várias áreas de uma só vez. O TCC Conecta vai te ajudar a encontrar a equipe perfeita para isso.</p>
            </div>
            <div className="description-items">
              <h1>Por que fazer um TCC em conjunto com outra equipe?</h1>
              <p>Imagine a seguinte situação: você está desenvolvendo um site para seu TCC, planejando um serviço qualquer, você pensa em tudo, mas sabe que mesmo que saiba um pouco de marketing digital, não será o suficiente para divulgar corretamente seu projeto e precisará estudar além de sua área. Neste caso, seria muito útil trabalhar em conjunto com uma equipe de Marketing, pois você se encarregaria de fazer o site e eles poderiam planejar toda parte da divulgação, poupando um tempo precioso. </p>
            </div>
          </div>
        : <div className="posts">
            {posts && posts.length > 0
              ? 
                <>
                  {posts.map(e => (
                    <PostCard
                      key={e.id}
                      title={e.title}
                      createdAt={e.createdAt.toLocaleDateString()}
                      content={e.content}
                      author={e.author}
                    />
                  ))}
                  <PageSelector listLength={postsCount} pageState={[ page, setPage ]} />
                </>
              : <p className="not-found">Nenhum Post Encontrado</p>}
          </div>
        }
      </div>
      <Footer>
        <Link to="/sobre-nos" className="link-about-us">Sobre Nós</Link>
      </Footer>
    </div>
  )
}