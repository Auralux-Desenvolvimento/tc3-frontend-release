import Footer from "../../components/Footer";
import Image from "../../components/Image";
import Navbar from "../../components/Navbar";
import userPlaceholder from '../../assets/img/user-placeholder.svg';
import './style.css';
import UserDataContext from "../../utils/UserDataContext";
import { useContext } from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import ContactInfo from './ContactInfo';

export default function AboutUs () {
  const [ user ] = useContext(UserDataContext);
  
  let header: JSX.Element;
  if (user) {
    header = <Navbar locale="aboutUs" />
  } else {
    header = (
      <Link to="/" className="back-button-div"> 
        <Icon className="return" icon="bi:arrow-left-short" />
      </Link>
    );
  }

  return (
    <>
      <div className={`about-us ${!user ? "visitor" : ""}`}>
        { header }
        <h1 className="title">Desenvolvedores</h1>
        <div className="dev left">
          <Image fallback={userPlaceholder} className="image" src="https://github.com/AfonsoAbreu.png" alt="" />
          <h2 className="dev-name">Afonso Gabriel dos Reis Abreu</h2>
          <p className="dev-description">Aluno do curso técnico em Informática para a Internet Integrado ao Ensino Médio e Técnico em Desenvolvimento de Sistemas. Tem interesse em todas as áreas que são necessárias para construir um projeto, e atualmente se foca em ampliar o conhecimento técnico em todas as áreas que são convenientes.</p>
          <ContactInfo 
            data={[
              {
                element: <Icon icon="akar-icons:github-fill" />,
                link: "https://github.com/AfonsoAbreu"
              },
              {
                element: <Icon icon="entypo-social:linkedin-with-circle" />,
                link: "https://www.linkedin.com/in/afonso-abreu-dev/"
              }
            ]} 
          />
        </div>
        <div className="dev right">
          <Image fallback={userPlaceholder} className="image" src="https://github.com/jv-dev.png" alt="" />
          <h2 className="dev-name">João Victor Cardoso de Souza</h2>
          <p className="dev-description">Aluno do ensino médio integrado ao curso técnico de Informática para Internet e Técnico em Desenvolvimento de Sistemas. Tem interesse na área de back-end, focando a maior parte de seus estudos a ela, porém, consegue trabalhar como front-end.</p>
          <ContactInfo 
            data={[
              {
                element: <Icon icon="akar-icons:github-fill" />,
                link: "https://github.com/jv-dev"
              },
              {
                element: <Icon icon="entypo-social:linkedin-with-circle" />,
                link: "https://www.linkedin.com/in/jo%C3%A3o-victor-cardoso-de-souza-186683221/"
              }
            ]} 
          />
        </div>
        <div className="dev left">
          <Image fallback={userPlaceholder} className="image" src="https://github.com/MatheusRomeiro.png" alt="" />
          <h2 className="dev-name">Matheus Romeiro Souza de Oliveira</h2>
          <p className="dev-description">Aluno do ensino médio integrado a Informática para Internet e técnico em Desenvolvimento de Sistemas. Preferência pelo desenvolvimento front-end, porém não tem problema em trabalhar com back-end ou banco de dados, apesar de haver uma dificuldade nessas áreas.</p>
          <ContactInfo 
            data={[
              {
                element: <Icon icon="akar-icons:github-fill" />,
                link: "https://github.com/MatheusRomeiro"
              },
              {
                element: <Icon icon="entypo-social:linkedin-with-circle" />,
                link: "https://www.linkedin.com/in/matheus-oliveira-front-end/"
              }
            ]} 
          />
        </div>
        <div className="dev right">
          <Image fallback={userPlaceholder} className="image" src="https://github.com/rayra-firmino.png" alt="" />
          <h2 className="dev-name">Rayra Firmino dos Santos</h2>
          <p className="dev-description">Aluna do ensino médio integrado ao técnico. Tem preferência por desenvolvimento front-end, mas consegue se virar com back-end e banco de dados.</p>
          <ContactInfo 
            data={[
              {
                element: <Icon icon="akar-icons:github-fill" />,
                link: "https://github.com/rayra-firmino"
              },
              {
                element: <Icon icon="entypo-social:linkedin-with-circle" />,
                link: "https://www.linkedin.com/in/rayra-firmino-dos-santos/"
              }
            ]} 
          />
        </div>
        <div className="dev left">
          <Image fallback={userPlaceholder} className="image" src="https://i.imgur.com/Y1AL6FX.png" alt="" />
          <h2 className="dev-name">Yuri Brandão Nemeth</h2>
          <p className="dev-description">Aluno do ensino médio integrado ao técnico. Tem preferência por planejar designs e organizar documentos.</p>
          <ContactInfo 
            data={[
              {
                element: <Icon icon="akar-icons:github-fill" />,
                link: "https://github.com/YuriNemeth"
              }
            ]} 
          />
        </div>
        <div className="team-wrapper">
          <h1 className="auralux">Equipe Auralux</h1>
        <Image className="logo" src="https://i.imgur.com/mHQrYO3.png" alt="" />
        </div>
      </div>
      <Footer />  
    </>
    
  )
  
}