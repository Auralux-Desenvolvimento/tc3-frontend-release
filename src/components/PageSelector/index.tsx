import { useContext, FC } from 'react';
import { useWindowWidth } from "@react-hook/window-size";
import TeamSearchPageContext from '../../utils/TeamSearchPageContext';
import "./style.css";
import UseState from '../../utils/types/UseState';

interface props extends React.HTMLAttributes<HTMLDivElement> {
  listLength?: number;
  pageState: UseState<number>;
}

const PageSelector: FC<props> = ({
  listLength: teamsLength,
  className,
  pageState,
  ...rest
}) => {
  const width = useWindowWidth();
  const mobileSize = width < 768;
  const [ page, setPage ] = pageState;

  let pages = [];
  const maxPages = teamsLength ? Math.ceil(teamsLength/20) : undefined;
  const firstItem = (page < 3) ? 1 : (page - (mobileSize ? 1 : 2));
  for (
    let i = firstItem;
    ((i <= page + (mobileSize ? 1 : 2)) || (i <= (mobileSize ? 3 : 5))) && (!maxPages || i <= maxPages);
    i++
  ) {
    pages.push(i); 
  }

  return (
    <div className={`page-selector-wrap ${className ? className : ""}`} {...rest}>
      <div className="page-selector-items">{
        page === 1
        ? null
        : <div className="page-item outer" onClick={() => setPage(page-1)}>ANTERIOR</div>
      }{
        pages.map(e => (
          <div key={e} className={`page-item ${e === page ? "current" : ""}`} onClick={() => setPage(e)}>
            {e}
          </div>
        ))
      }{
        (!maxPages || page < maxPages)
        ? <div className="page-item outer" onClick={() => setPage(page+1)}>PRÓXIMO</div>
        : null
      }</div>
    </div>
  );
}

export default PageSelector;