import ReactLoading from 'react-loading';
import './style.css';

export default function LoadingPage () {
  return(
    <div className="loading-box"> 
      <ReactLoading className="loading-icon" type="spin"/>
      <span className="loading-text">Carregando...</span>
    </div>
  )
}